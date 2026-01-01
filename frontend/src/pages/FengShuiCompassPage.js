import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import './FengShuiCompassPage.css';

// Feng Shui Data Constants
const BAGUA = [
    { name: '坎', direction: '北', angle: 0, element: '水' },
    { name: '艮', direction: '东北', angle: 45, element: '土' },
    { name: '震', direction: '东', angle: 90, element: '木' },
    { name: '巽', direction: '东南', angle: 135, element: '木' },
    { name: '离', direction: '南', angle: 180, element: '火' },
    { name: '坤', direction: '西南', angle: 225, element: '土' },
    { name: '兑', direction: '西', angle: 270, element: '金' },
    { name: '乾', direction: '西北', angle: 315, element: '金' },
];

const EARTHLY_BRANCHES = [
    { name: '子', time: '23-01', angle: 0 },
    { name: '丑', time: '01-03', angle: 30 },
    { name: '寅', time: '03-05', angle: 60 },
    { name: '卯', time: '05-07', angle: 90 },
    { name: '辰', time: '07-09', angle: 120 },
    { name: '巳', time: '09-11', angle: 150 },
    { name: '午', time: '11-13', angle: 180 },
    { name: '未', time: '13-15', angle: 210 },
    { name: '申', time: '15-17', angle: 240 },
    { name: '酉', time: '17-19', angle: 270 },
    { name: '戌', time: '19-21', angle: 300 },
    { name: '亥', time: '21-23', angle: 330 },
];

// 24 Mountains (Standard Feng Shui Ring)
// Sequence starting from North (0 deg) clockwise:
// Ren(壬), Zi(子), Gui(癸), Chou(丑), Gen(艮), Yin(寅)...
// 24 sectors, each 15 degrees.
const MOUNTAINS_24 = [
    '子', '癸', '丑', '艮', '寅', '甲',
    '卯', '乙', '辰', '巽', '巳', '丙',
    '午', '丁', '未', '坤', '申', '庚',
    '酉', '辛', '戌', '乾', '亥', '壬'
];
// Wait, the order above might need correction. 
// Standard 24 Mountains:
// N: Ren, Zi, Gui
// NE: Chou, Gen, Yin
// E: Jia, Mao, Yi
// SE: Chen, Xun, Si
// S: Bing, Wu, Ding
// SW: Wei, Kun, Shen
// W: Geng, You, Xin
// NW: Xu, Qian, Hai
// Start from North (Zi is center of North). So 0 deg is Center of Zi.
// Zi covers 352.5 to 7.5.
// Order clockwise from 0 (North):
// Zi (0), Gui (15), Chou (30), Gen (45), Yin (60), 甲 (75)... this seems right?
// Let's re-verify order: 壬 子 癸 (N), 丑 艮 寅 (NE), 甲 卯 乙 (E), 辰 巽 巳 (SE), 丙 午 丁 (S), 未 坤 申 (SW), 庚 酉 辛 (W), 戌 乾 亥 (NW).
// Start at 0 deg (North-Zi): So Zi is 0. 
// Standard compass usually puts N at 0.
// So sequence starting from 0 (Zi) clockwise:
// Zi, Gui, Chou, Gen, Yin, Jia, Mao, Yi, Chen, Xun, Si, Bing, Wu, Ding, Wei, Kun, Shen, Geng, You, Xin, Xu, Qian, Hai, Ren. 
// This covers 0 to 360.
const MOUNTAINS_ORDERED = [
    '子', '癸', '丑', '艮', '寅', '甲',
    '卯', '乙', '辰', '巽', '巳', '丙',
    '午', '丁', '未', '坤', '申', '庚',
    '酉', '辛', '戌', '乾', '亥', '壬'
];
// Check spacing: 24 items. 360 / 24 = 15 deg each.
// Zi is at 0 deg.

const FengShuiCompassPage = () => {
    const navigate = useNavigate();
    const [heading, setHeading] = useState(0);
    const [location, setLocation] = useState({ lat: null, lng: null, alt: null });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [calibrationMode, setCalibrationMode] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [geolocationWatchId, setGeolocationWatchId] = useState(null);

    // Initialize sensors
    useEffect(() => {
        let localGeolocationWatchId = null;
        
        // Geolocation for Altitude using Capacitor
        const initGeolocation = async () => {
            try {
                // Request permission first
                const permission = await Geolocation.requestPermissions();
                if (permission.location === 'granted') {
                    setPermissionGranted(true);
                    
                    // Get current position and watch for changes
                    localGeolocationWatchId = await Geolocation.watchPosition(
                        { enableHighAccuracy: true, timeout: 10000 },
                        (position) => {
                            if (position) {
                                setLocation({
                                    lat: position.coords.latitude.toFixed(4),
                                    lng: position.coords.longitude.toFixed(4),
                                    alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                                });
                            }
                        },
                        (error) => {
                            console.warn('Geolocation error:', error);
                            // Fallback to web API if Capacitor fails
                            if (navigator.geolocation && !Capacitor.isNativePlatform()) {
                                navigator.geolocation.watchPosition(
                                    (position) => {
                                        setLocation({
                                            lat: position.coords.latitude.toFixed(4),
                                            lng: position.coords.longitude.toFixed(4),
                                            alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                                        });
                                    },
                                    (error) => console.warn('Web geolocation error:', error),
                                    { enableHighAccuracy: true }
                                );
                            }
                        }
                    );
                } else {
                    console.warn('Geolocation permission not granted');
                    // Fallback to web API if Capacitor permission denied
                    if (navigator.geolocation && !Capacitor.isNativePlatform()) {
                        navigator.geolocation.watchPosition(
                            (position) => {
                                setLocation({
                                    lat: position.coords.latitude.toFixed(4),
                                    lng: position.coords.longitude.toFixed(4),
                                    alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                                });
                            },
                            (error) => console.warn('Web geolocation error:', error),
                            { enableHighAccuracy: true }
                        );
                    }
                }
            } catch (error) {
                console.warn('Capacitor Geolocation not available, falling back to web API:', error);
                // Fallback to web API
                if (navigator.geolocation) {
                    navigator.geolocation.watchPosition(
                        (position) => {
                            setLocation({
                                lat: position.coords.latitude.toFixed(4),
                                lng: position.coords.longitude.toFixed(4),
                                alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                            });
                        },
                        (error) => console.warn('Web geolocation error:', error),
                        { enableHighAccuracy: true }
                    );
                }
            }
        };
        
        initGeolocation();

        // Device Orientation
        const handleOrientation = (event) => {
            let compass = null;

            if (event.webkitCompassHeading) {
                // iOS
                compass = event.webkitCompassHeading;
            } else if (event.absolute || event.alpha !== null) {
                // Android/Standard
                // Some devices report alpha as 0-360 starting from North, some are relative.
                // We prefer absolute if available.
                compass = (360 - event.alpha) % 360;
            }

            if (compass !== null && compass !== undefined) {
                // Smoothing
                setHeading(prev => {
                    const diff = ((compass - prev + 180 + 360) % 360) - 180;
                    return (prev + diff * 0.2 + 360) % 360;
                });
            }
        };

        const eventType = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';

        // Check request permission (iOS 13+)
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Must be triggered by user interaction
        } else {
            setPermissionGranted(true);
            window.addEventListener(eventType, handleOrientation, true);
        }

        return () => {
            window.removeEventListener(eventType, handleOrientation, true);
            // Clear local geolocation watch if it exists
            if (localGeolocationWatchId !== null) {
                Geolocation.clearWatch({ id: localGeolocationWatchId });
            }
            // Clear state geolocation watch if it exists
            if (geolocationWatchId) {
                Geolocation.clearWatch({ id: geolocationWatchId });
            }
        };
    }, []);

    // Theme toggle effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const requestCompassAccess = async () => {
        // Request device orientation permission
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then((response) => {
                    if (response === 'granted') {
                        setPermissionGranted(true);
                        const eventType = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
                        window.addEventListener(eventType, (e) => {
                            let compass = null;
                            if (e.webkitCompassHeading) {
                                compass = e.webkitCompassHeading;
                            } else if (e.absolute || e.alpha !== null) {
                                compass = (360 - e.alpha) % 360;
                            }
                            if (compass !== null) {
                                setHeading(prev => {
                                    const diff = ((compass - prev + 180 + 360) % 360) - 180;
                                    return (prev + diff * 0.2 + 360) % 360;
                                });
                            }
                        }, true);
                    } else {
                        alert('需要罗盘权限才能正常工作');
                    }
                })
                .catch(console.error);
        } else {
            setPermissionGranted(true);
        }
    };
    
    const requestLocationAccess = async () => {
        try {
            const permission = await Geolocation.requestPermissions();
            if (permission.location === 'granted') {
                console.log('Geolocation permission granted');
                setPermissionGranted(true);
                
                // Get current position to initialize location
                try {
                    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
                    if (position) {
                        setLocation({
                            lat: position.coords.latitude.toFixed(4),
                            lng: position.coords.longitude.toFixed(4),
                            alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                        });
                    }
                    
                    // Start watching location for updates
                    if (geolocationWatchId) {
                        await Geolocation.clearWatch({ id: geolocationWatchId });
                    }
                    const newWatchId = await Geolocation.watchPosition(
                        { enableHighAccuracy: true, timeout: 10000 },
                        (position) => {
                            if (position) {
                                setLocation({
                                    lat: position.coords.latitude.toFixed(4),
                                    lng: position.coords.longitude.toFixed(4),
                                    alt: position.coords.altitude ? Math.round(position.coords.altitude) : 'N/A'
                                });
                            }
                        },
                        (error) => {
                            console.warn('Geolocation watch error:', error);
                        }
                    );
                    setGeolocationWatchId(newWatchId);
                } catch (getPositionError) {
                    console.warn('Error getting current position:', getPositionError);
                }
            } else {
                console.warn('Geolocation permission not granted');
                alert('位置权限未被授予，无法获取精确位置信息');
            }
        } catch (error) {
            console.warn('Error requesting geolocation permission:', error);
            alert('请求位置权限时发生错误: ' + error.message);
        }
    };
    
    const requestAccess = async () => {
        // Request both compass and location permissions
        await requestCompassAccess();
        await requestLocationAccess();
    };

    // Helper to get current direction text
    const getDirectionText = (angle) => {
        const directions = ['正北', '东北', '正东', '东南', '正南', '西南', '正西', '西北'];
        const index = Math.round(angle / 45) % 8;
        return directions[index];
    };

    // Helper to get current Earthly Branch (time)
    const getCurrentBranch = () => {
        const now = new Date();
        const hour = now.getHours();
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        // Each branch covers 2 hours, starting from 23:00 (Zi)
        // 23:00-01:00: 子, 01:00-03:00: 丑, etc.
        let branchIndex = Math.floor((hour + 1) / 2) % 12;
        return branches[branchIndex];
    };

    // Helper to render ring items
    const renderRingItems = (items, radiusPercent, type) => {
        const count = items.length;
        const step = 360 / count;

        return items.map((item, index) => {
            // Rotation: index * step. 
            // Important: Check alignment. 0 deg (North) is usually Top.
            // For MOUNTAINS_ORDERED starting with Zi (North):
            // Zi should be at 0 deg.
            const rotation = index * step;

            // Determine content
            let content = item;
            if (typeof item === 'object') content = item.name;

            return (
                <div
                    key={index}
                    className="ring-label-container"
                    style={{
                        height: `${radiusPercent}%`,
                        transform: `rotate(${rotation}deg)`
                    }}
                >
                    <span className={`ring-label ${type}-label`}>{content}</span>
                </div>
            );
        });
    };

    return (
        <div className="feng-shui-compass-page">
            <header className="compass-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <div className="header-buttons">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>
                    <button className="calibration-btn" onClick={requestAccess}>
                        {permissionGranted ? '位置权限' : '开启定位'}
                    </button>
                </div>
                <div className="header-title">风水罗盘</div>
            </header>

            <div className="compass-info-panel">
                <div className="direction-display">
                    <span className="direction-text">{getDirectionText(heading)}</span>
                    <span className="degree-text">{Math.round(heading)}°</span>
                </div>
                <div className="location-info">
                    <span>海拔: {location.alt !== 'N/A' ? `${location.alt}m` : '--'}</span>
                    <span>经度: {location.lng || '--'}</span>
                    <span>纬度: {location.lat || '--'}</span>
                </div>
            </div>

            <div className="compass-container">
                {/* Fixed Indicators */}
                <div className="top-indicator"></div>
                <div className="compass-crosshair">
                    <div className="crosshair-line-v"></div>
                    <div className="crosshair-line-h"></div>
                </div>

                {/* Rotating Plate */}
                <div
                    className="compass-plate"
                    style={{ transform: `rotate(${-heading}deg)` }}
                >
                    {/* Decorative cloud pattern */}
                    <div className="cloud-pattern"></div>

                    {/* Traditional decorative rings */}
                    <div className="traditional-pattern pattern-ring-1"></div>
                    <div className="traditional-pattern pattern-ring-2"></div>
                    <div className="traditional-pattern pattern-ring-3"></div>

                    {/* Center Pool */}
                    <div className="heaven-pool"></div>

                    {/* Ring 1: Bagua (Inner) */}
                    <div className="compass-ring ring-bagua">
                        {renderRingItems(BAGUA.map(b => b.name), 100, 'bagua')}
                    </div>

                    {/* Ring 2: Earthly Branches / 12 Hours (Middle) */}
                    <div className="compass-ring ring-stems">
                        {renderRingItems(EARTHLY_BRANCHES.map(b => b.name), 100, 'stems')}
                    </div>

                    {/* Ring 3: 24 Mountains (Outer) */}
                    <div className="compass-ring ring-mountains">
                        {renderRingItems(MOUNTAINS_ORDERED, 100, 'mountains')}
                    </div>

                    {/* Decorative border */}
                    <div className="compass-border-decoration"></div>

                    {/* Corner decorations */}
                    <div className="corner-decoration top"></div>
                    <div className="corner-decoration bottom"></div>
                    <div className="corner-decoration left"></div>
                    <div className="corner-decoration right"></div>

                    {/* Needle indicator */}
                    <div className="needle-indicator"></div>

                    {/* Degree ticks (optional, can be added if needed) */}
                </div>
            </div>

            <footer className="compass-footer">
                <p>Tip: 请保持手机水平放置以获得准确读数</p>
                <p>当前时辰: {getCurrentBranch()}时</p>
            </footer>
        </div>
    );
};

export default FengShuiCompassPage;
