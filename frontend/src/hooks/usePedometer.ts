import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'pedometer_data_';

const getTodayKey = () => {
    const d = new Date();
    return `${STORAGE_KEY_PREFIX}${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

interface PedometerData {
    steps: number;
    distanceMeters: number;
    caloriesKcal: number;
    activeMinutes: number;
    timestamp: number;
}

const loadPedometerData = (): PedometerData => {
    try {
        const key = getTodayKey();
        const raw = localStorage.getItem(key);
        if (!raw) return { steps: 0, distanceMeters: 0, caloriesKcal: 0, activeMinutes: 0, timestamp: Date.now() };
        return JSON.parse(raw);
    } catch {
        return { steps: 0, distanceMeters: 0, caloriesKcal: 0, activeMinutes: 0, timestamp: Date.now() };
    }
};

const savePedometerData = (data: PedometerData) => {
    try {
        const key = getTodayKey();
        localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
    } catch (e) {
        console.error('Failed to save pedometer data', e);
    }
};

const loadBodyMetrics = (): Record<string, string> | null => {
    try {
        const raw = localStorage.getItem('user_body_metrics');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as Record<string, string>;
    } catch {
        return null;
    }
};

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim().length > 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    return null;
};

const estimateStepLengthMeters = (heightCm: number | null): number => {
    if (!heightCm || heightCm <= 0) return 0.7;
    const stepLengthMeters = (heightCm * 0.415) / 100;
    if (!Number.isFinite(stepLengthMeters) || stepLengthMeters <= 0) return 0.7;
    return Math.min(Math.max(stepLengthMeters, 0.45), 0.95);
};

const estimateWalkingCaloriesKcal = (distanceMeters: number, weightKg: number | null): number => {
    if (!weightKg || weightKg <= 0) return 0;
    const distanceKm = distanceMeters / 1000;
    const kcal = 1.036 * weightKg * distanceKm;
    if (!Number.isFinite(kcal) || kcal < 0) return 0;
    return kcal;
};

export const usePedometer = (options?: {
    heightCm?: number;
    weightKg?: number;
    activeCadenceThresholdSpm?: number;
}) => {
    const initialData = loadPedometerData();
    const [steps, setSteps] = useState<number>(initialData.steps);
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [distanceMeters, setDistanceMeters] = useState<number>(initialData.distanceMeters);
    const [caloriesKcal, setCaloriesKcal] = useState<number>(initialData.caloriesKcal);
    const [cadenceSpm, setCadenceSpm] = useState<number>(0);
    const [activeMinutes, setActiveMinutes] = useState<number>(initialData.activeMinutes);
    const [speedKph, setSpeedKph] = useState<number>(0);
    const [heightCmUsed, setHeightCmUsed] = useState<number | null>(null);
    const [weightKgUsed, setWeightKgUsed] = useState<number | null>(null);
    const [stepLengthMeters, setStepLengthMeters] = useState<number>(0.7);

    // 请求Android权限
    const requestAndroidPermission = useCallback(async (): Promise<boolean> => {
        const cordova = (window as any).cordova;
        if (!cordova || !cordova.plugins || !cordova.plugins.permissions) return true;

        const permissions = cordova.plugins.permissions;
        // Android 10+ (API 29+) 需要 ACTIVITY_RECOGNITION
        const ACTIVITY_RECOGNITION = 'android.permission.ACTIVITY_RECOGNITION';

        return new Promise((resolve) => {
            permissions.checkPermission(ACTIVITY_RECOGNITION, (status: any) => {
                if (status.hasPermission) {
                    resolve(true);
                } else {
                    permissions.requestPermission(ACTIVITY_RECOGNITION, (s: any) => resolve(s.hasPermission), () => resolve(false));
                }
            }, () => resolve(false));
        });
    }, []);

    useEffect(() => {
        let stopped = false;
        let started = false;
        let lastUpdateAt = 0;
        let lastSessionSteps = 0;
        let currentActiveMs = activeMinutes * 60000;
        let currentTotalSteps = steps;
        let currentDistanceMeters = distanceMeters;
        let currentCaloriesKcal = caloriesKcal;

        const start = async () => {
            if (stopped || started) return;
            const pedometer = (window as any).pedometer;
            if (!pedometer) return;

            // 尝试请求权限
            const hasPermission = await requestAndroidPermission();
            if (!hasPermission) {
                setError('Activity recognition permission denied');
                return;
            }

            started = true;
            setIsAvailable(true);
            setError(null);

            const handleUpdate = (data: any) => {
                if (stopped) return;

                // data.numberOfSteps 通常是自 start 以来累计的步数
                const sessionSteps = typeof data?.numberOfSteps === 'number' ? data.numberOfSteps : 0;
                const deltaSteps = sessionSteps >= lastSessionSteps ? sessionSteps - lastSessionSteps : 0;

                const now = Date.now();
                const metrics = loadBodyMetrics();
                const heightCm = options?.heightCm ?? toNumber(metrics?.height) ?? null;
                const weightKg = options?.weightKg ?? toNumber(metrics?.weight) ?? null;
                const nextStepLengthMeters = estimateStepLengthMeters(heightCm);

                // 更新今日总计
                currentTotalSteps += deltaSteps;
                currentDistanceMeters += (deltaSteps * nextStepLengthMeters);
                currentCaloriesKcal = estimateWalkingCaloriesKcal(currentDistanceMeters, weightKg);

                if (lastUpdateAt > 0 && now > lastUpdateAt) {
                    const dtMs = now - lastUpdateAt;
                    const dtMin = dtMs / 60000;
                    const nextCadence = dtMin > 0 ? deltaSteps / dtMin : 0;
                    const deltaDistanceMeters = deltaSteps * nextStepLengthMeters;
                    const nextSpeedKph = dtMs > 0 ? (deltaDistanceMeters / dtMs) * 3600 : 0;

                    const activeThreshold = options?.activeCadenceThresholdSpm ?? 60;
                    if (nextCadence >= activeThreshold) currentActiveMs += dtMs;

                    setCadenceSpm(Number.isFinite(nextCadence) ? nextCadence : 0);
                    setSpeedKph(Number.isFinite(nextSpeedKph) ? nextSpeedKph : 0);
                    setActiveMinutes(currentActiveMs / 60000);
                }

                lastSessionSteps = sessionSteps;
                lastUpdateAt = now;

                setSteps(currentTotalSteps);
                setDistanceMeters(currentDistanceMeters);
                setCaloriesKcal(currentCaloriesKcal);
                setHeightCmUsed(heightCm);
                setWeightKgUsed(weightKg);
                setStepLengthMeters(nextStepLengthMeters);

                // 同步到本地
                savePedometerData({
                    steps: currentTotalSteps,
                    distanceMeters: currentDistanceMeters,
                    caloriesKcal: currentCaloriesKcal,
                    activeMinutes: currentActiveMs / 60000,
                    timestamp: now
                });
            };

            try {
                if (typeof pedometer.isStepCountingAvailable === 'function') {
                    pedometer.isStepCountingAvailable(
                        (available: boolean) => {
                            if (!available) {
                                setIsAvailable(false);
                                setError('Step counter not available on this device');
                                return;
                            }

                            pedometer.startPedometerUpdates(handleUpdate, (err: any) => {
                                started = false;
                                setError(err?.message ? String(err.message) : 'Pedometer error');
                            });
                        },
                        (err: any) => {
                            started = false;
                            setError(err?.message ? String(err.message) : 'Pedometer availability check failed');
                        }
                    );
                } else {
                    pedometer.startPedometerUpdates(handleUpdate, (err: any) => {
                        started = false;
                        setError(err?.message ? String(err.message) : 'Pedometer error');
                    });
                }
            } catch (e: any) {
                started = false;
                setError(e?.message ? String(e.message) : 'Pedometer init error');
            }
        };

        const stop = () => {
            const pedometer = (window as any).pedometer;
            if (!pedometer || typeof pedometer.stopPedometerUpdates !== 'function') return;
            try {
                pedometer.stopPedometerUpdates(() => { }, () => { });
            } catch { }
        };

        const onDeviceReady = () => start();
        const onResume = () => {
            // 在恢复时重新同步日期，防止跨天
            const currentData = loadPedometerData();
            if (currentData.steps === 0) { // 如果是新的一天
                // 重新初始化状态
                currentTotalSteps = 0;
                lastSessionSteps = 0;
                currentActiveMs = 0;
                currentDistanceMeters = 0;
                currentCaloriesKcal = 0;

                setSteps(0);
                setDistanceMeters(0);
                setCaloriesKcal(0);
                setActiveMinutes(0);
                setCadenceSpm(0);
                setSpeedKph(0);
            }
            start();
        };

        if ((window as any).cordova) {
            document.addEventListener('deviceready', onDeviceReady, false);
            document.addEventListener('resume', onResume, false);
        }

        start();

        return () => {
            stopped = true;
            document.removeEventListener('deviceready', onDeviceReady, false);
            document.removeEventListener('resume', onResume, false);
            stop();
        };
    }, [options?.activeCadenceThresholdSpm, options?.heightCm, options?.weightKg, requestAndroidPermission]);

    return {
        steps,
        isAvailable,
        error,
        heightCmUsed,
        weightKgUsed,
        stepLengthMeters,
        distanceMeters,
        distanceKm: distanceMeters / 1000,
        caloriesKcal,
        cadenceSpm,
        activeMinutes,
        speedKph
    };
};

