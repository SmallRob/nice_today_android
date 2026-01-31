
import { SleepRecord } from './sleep';

const STORAGE_KEY_PREFIX = 'pedometer_data_';
export const PEDOMETER_UPDATE_EVENT = 'niceToday:pedometerUpdate';

const getTodayKey = () => {
    const d = new Date();
    return `${STORAGE_KEY_PREFIX}${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

export interface PedometerData {
    steps: number;
    distanceMeters: number;
    caloriesKcal: number;
    activeMinutes: number;
    timestamp: number;
    cadenceSpm?: number;
    speedKph?: number;
    stepLengthMeters?: number;
    isAvailable?: boolean;
    error?: string | null;
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
        // 仅保存核心持久化数据，剔除瞬时速度等
        const toSave = {
            steps: data.steps,
            distanceMeters: data.distanceMeters,
            caloriesKcal: data.caloriesKcal,
            activeMinutes: data.activeMinutes,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(toSave));
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

class PedometerService {
    private static instance: PedometerService;
    private initialized = false;
    private started = false;
    private stopped = false;
    private data: PedometerData;
    private lastSessionSteps = 0;
    private isFirstUpdateInSession = true; // 新增：标记是否为本次启动的第一次更新
    private lastUpdateAt = 0;
    private lastStorageKey = '';
    private retryCount = 0;
    private retryTimer: number | null = null;

    private constructor() {
        this.data = loadPedometerData();
        this.lastStorageKey = getTodayKey();
    }

    public static getInstance(): PedometerService {
        if (!PedometerService.instance) {
            PedometerService.instance = new PedometerService();
        }
        return PedometerService.instance;
    }

    public getCurrentData(): PedometerData {
        return { ...this.data };
    }

    public async start() {
        if (this.started) return;
        this.started = true;
        this.stopped = false;

        // 绑定生命周期事件
        document.addEventListener('resume', this.onResume, false);

        await this.initPedometer();
    }

    public stop() {
        this.stopped = true;
        this.started = false;
        this.initialized = false;
        document.removeEventListener('resume', this.onResume, false);
        if (this.retryTimer) {
            window.clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }

        const pedometer = (window as any).pedometer;
        if (pedometer && typeof pedometer.stopPedometerUpdates === 'function') {
            try {
                pedometer.stopPedometerUpdates(() => { }, () => { });
            } catch { }
        }
    }

    public refresh() {
        // 检查跨天
        this.checkDayTransition();
        // 尝试重新初始化并广播
        if (!this.started || !this.initialized) {
            this.initPedometer(true);
        }
        this.broadcastUpdate();
    }

    private onResume = () => {
        // 在恢复时重新同步日期，防止跨天
        this.checkDayTransition();

        // 确保服务是启动的
        if (!this.stopped) {
            this.initPedometer(true); // 恢复时强制重新挂载，确保监听有效
        }
    };

    private checkDayTransition() {
        const currentKey = getTodayKey();
        if (currentKey !== this.lastStorageKey) {
            console.log(`Pedometer: Day transition detected from ${this.lastStorageKey} to ${currentKey}`);
            this.resetDailyData(currentKey);
        }
    }

    private resetDailyData(newKey: string) {
        this.lastStorageKey = newKey;
        this.data = {
            steps: 0,
            distanceMeters: 0,
            caloriesKcal: 0,
            activeMinutes: 0,
            timestamp: Date.now(),
            cadenceSpm: 0,
            speedKph: 0,
            isAvailable: this.data.isAvailable,
            error: this.data.error
        };
        this.lastSessionSteps = 0;
        this.isFirstUpdateInSession = true;
        this.broadcastUpdate();
        savePedometerData(this.data);
    }

    private async requestAndroidPermission(): Promise<boolean> {
        const cordova = (window as any).cordova;
        if (!cordova) return true;
        if (cordova.platformId === 'ios') return true;

        if (!cordova.plugins || !cordova.plugins.permissions) {
            console.warn('cordova-plugin-android-permissions not found');
            return true;
        }

        const permissions = cordova.plugins.permissions;
        const ACTIVITY_RECOGNITION = 'android.permission.ACTIVITY_RECOGNITION';

        return new Promise((resolve) => {
            permissions.checkPermission(ACTIVITY_RECOGNITION, (status: any) => {
                if (status.hasPermission) {
                    resolve(true);
                } else {
                    permissions.requestPermission(ACTIVITY_RECOGNITION, (s: any) => {
                        resolve(!!s.hasPermission);
                    }, (err: any) => {
                        console.error('Permission request failed', err);
                        resolve(false);
                    });
                }
            }, (err: any) => {
                console.error('Permission check failed', err);
                resolve(false);
            });
        });
    }

    private async initPedometer(force = false) {
        if (this.initialized && !force) return;

        const pedometer = (window as any).pedometer;

        if (!pedometer) {
            if (this.retryCount < 20) {
                this.retryCount += 1;
                this.retryTimer = window.setTimeout(() => this.initPedometer(force), 300);
                return;
            }
            this.updateStatus(false, 'Pedometer plugin not found');
            return;
        }

        this.initialized = true;

        try {
            const hasPermission = await this.requestAndroidPermission();
            if (!hasPermission) {
                this.updateStatus(false, '需要“身体活动”权限才能记录步数，请在设置中开启');
                return;
            }
        } catch (e) {
            console.error('Permission check error', e);
        }

        // 默认先设为可用
        this.updateStatus(true, null);

        const handleUpdate = (data: any) => {
            if (this.stopped) return;
            this.processUpdate(data);
        };

        const handleError = (err: any) => {
            console.error('Pedometer update error:', err);
            this.updateStatus(false, err?.message ? String(err.message) : 'Pedometer error');
        };

        try {
            // 在启动新监听前，先尝试停止旧的，防止重复回调堆积
            if (typeof pedometer.stopPedometerUpdates === 'function') {
                pedometer.stopPedometerUpdates(() => {
                    this.startUpdates(pedometer, handleUpdate, handleError);
                }, () => {
                    this.startUpdates(pedometer, handleUpdate, handleError);
                });
            } else {
                this.startUpdates(pedometer, handleUpdate, handleError);
            }
        } catch (e: any) {
            this.updateStatus(false, e?.message ? String(e.message) : 'Pedometer init error');
        }
    }

    private startUpdates(pedometer: any, handleUpdate: (data: any) => void, handleError: (err: any) => void) {
        this.isFirstUpdateInSession = true; // 每次重新开始监听时，重置第一次更新标记

        if (typeof pedometer.isStepCountingAvailable === 'function') {
            pedometer.isStepCountingAvailable(
                (available: boolean) => {
                    if (!available) {
                        this.updateStatus(false, 'Step counter not available on this device');
                        return;
                    }
                    pedometer.startPedometerUpdates(handleUpdate, handleError);
                },
                (err: any) => {
                    pedometer.startPedometerUpdates(handleUpdate, handleError);
                }
            );
        } else {
            pedometer.startPedometerUpdates(handleUpdate, handleError);
        }
    }

    private processUpdate(data: any) {
        // 在处理更新前先检查是否跨天
        this.checkDayTransition();

        this.data.isAvailable = true;
        this.data.error = null;

        const sessionSteps = typeof data?.numberOfSteps === 'number' ? data.numberOfSteps : 0;

        // 如果是本次监听的第一次更新
        if (this.isFirstUpdateInSession) {
            this.isFirstUpdateInSession = false;

            // 如果插件返回的步数大于我们记录的最后一次步数，且是在同一天，
            // 说明在应用未运行期间产生了一些步数（如果插件是系统级的），或者插件刚刚启动。
            if (this.lastSessionSteps > 0 && sessionSteps > this.lastSessionSteps) {
                const deltaSteps = sessionSteps - this.lastSessionSteps;
                // 限制单次突发步数，防止异常大数值注入
                if (deltaSteps < 10000) {
                    this.updateMetrics(deltaSteps);
                }
            }

            this.lastSessionSteps = sessionSteps;
            this.broadcastUpdate();
            return;
        }

        // 计算增量
        // 如果 sessionSteps 小于上次记录，说明插件内部计数可能重置了
        if (sessionSteps < this.lastSessionSteps) {
            this.lastSessionSteps = sessionSteps;
            return;
        }

        const deltaSteps = sessionSteps - this.lastSessionSteps;

        // 如果增量为0，我们仍然更新时间戳和状态，但不需要广播大的数据变动
        if (deltaSteps === 0) {
            this.lastUpdateAt = Date.now();
            this.broadcastUpdate();
            return;
        }

        this.updateMetrics(deltaSteps);
        this.lastSessionSteps = sessionSteps;
        this.lastUpdateAt = Date.now();

        savePedometerData(this.data);
        this.broadcastUpdate();
    }

    private updateMetrics(deltaSteps: number) {
        const now = Date.now();
        const metrics = loadBodyMetrics();
        const heightCm = toNumber(metrics?.height);
        const weightKg = toNumber(metrics?.weight);
        const stepLengthMeters = estimateStepLengthMeters(heightCm);

        // 累计到当日步数总数
        this.data.steps += deltaSteps;
        this.data.distanceMeters += (deltaSteps * stepLengthMeters);
        this.data.caloriesKcal = estimateWalkingCaloriesKcal(this.data.distanceMeters, weightKg);
        this.data.timestamp = now;
        this.data.stepLengthMeters = stepLengthMeters;

        // 计算瞬时速度/步频
        if (this.lastUpdateAt > 0 && now > this.lastUpdateAt) {
            const dtMs = now - this.lastUpdateAt;
            const dtMin = dtMs / 60000;
            const nextCadence = dtMin > 0 ? deltaSteps / dtMin : 0;
            const deltaDistanceMeters = deltaSteps * stepLengthMeters;
            const nextSpeedKph = dtMs > 0 ? (deltaDistanceMeters / dtMs) * 3600 : 0;

            // 活跃时间计算 (阈值 60 spm)
            if (nextCadence >= 60) {
                this.data.activeMinutes += dtMin;
            }

            this.data.cadenceSpm = nextCadence;
            this.data.speedKph = nextSpeedKph;
        }
    }

    private updateStatus(isAvailable: boolean, error: string | null) {
        this.data.isAvailable = isAvailable;
        this.data.error = error;
        this.broadcastUpdate();
    }

    private broadcastUpdate() {
        try {
            window.dispatchEvent(new CustomEvent(PEDOMETER_UPDATE_EVENT, {
                detail: { ...this.data }
            }));
        } catch { }
    }
}

export default PedometerService;
