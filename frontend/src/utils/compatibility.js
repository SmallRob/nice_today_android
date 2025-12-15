/**
 * 兼容性测试工具类
 * 用于检测和处理不同Android设备和版本的兼容性问题
 */

import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

// 设备信息缓存
let deviceInfoCache = null;

// 获取设备信息
export const getDeviceInfo = async () => {
  if (deviceInfoCache) {
    return deviceInfoCache;
  }

  try {
    const info = await Device.getInfo();
    deviceInfoCache = {
      ...info,
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform()
    };
    
    return deviceInfoCache;
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      platform: 'web',
      isNative: false,
      model: 'unknown',
      osVersion: 'unknown'
    };
  }
};

// 检测Android版本兼容性
export const checkAndroidVersionCompatibility = async () => {
  const deviceInfo = await getDeviceInfo();
  
  if (deviceInfo.platform !== 'android') {
    return { compatible: true, reason: 'Not an Android device' };
  }

  const androidVersion = parseInt(deviceInfo.osVersion.split('.')[0]);
  
  // 定义最低支持的Android版本
  const minSupportedVersion = 5; // Android 5.0 (Lollipop)
  const recommendedVersion = 8; // Android 8.0 (Oreo)
  
  if (androidVersion < minSupportedVersion) {
    return {
      compatible: false,
      critical: true,
      reason: `Android ${androidVersion} is not supported. Minimum supported version is Android ${minSupportedVersion}`,
      recommendation: 'Please update your device to a newer version of Android'
    };
  }
  
  if (androidVersion < recommendedVersion) {
    return {
      compatible: true,
      warning: true,
      reason: `Android ${androidVersion} is supported but not recommended. For best experience, use Android ${recommendedVersion} or higher`,
      recommendation: 'Consider updating your device for better performance and features'
    };
  }
  
  return {
    compatible: true,
    reason: `Android ${androidVersion} is fully supported`
  };
};

// 检测屏幕尺寸兼容性
export const checkScreenCompatibility = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  const minSupportedWidth = 320; // iPhone 4/5宽度
  const minSupportedHeight = 480; // iPhone 4/5高度
  
  const issues = [];
  const recommendations = [];
  
  if (width < minSupportedWidth) {
    issues.push(`Screen width (${width}px) is below minimum supported width (${minSupportedWidth}px)`);
  }
  
  if (height < minSupportedHeight) {
    issues.push(`Screen height (${height}px) is below minimum supported height (${minSupportedHeight}px)`);
  }
  
  // 检查特殊屏幕比例
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  if (aspectRatio > 2.5) {
    recommendations.push('Very tall screen detected. Ensure UI elements are properly scaled.');
  }
  
  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
    screenInfo: {
      width,
      height,
      isLandscape,
      aspectRatio,
      pixelRatio: window.devicePixelRatio || 1
    }
  };
};

// 检测WebView兼容性
export const checkWebViewCompatibility = async () => {
  const deviceInfo = await getDeviceInfo();
  
  if (deviceInfo.platform !== 'android') {
    return { compatible: true, reason: 'Not an Android device' };
  }

  const androidVersion = parseInt(deviceInfo.osVersion.split('.')[0]);
  const webViewVersion = await getWebViewVersion();
  
  // 检查WebView版本
  if (webViewVersion < 65) {
    return {
      compatible: false,
      critical: true,
      reason: `WebView version ${webViewVersion} is not supported. Minimum supported version is 65`,
      recommendation: 'Please update your device system WebView'
    };
  }
  
  if (webViewVersion < 80) {
    return {
      compatible: true,
      warning: true,
      reason: `WebView version ${webViewVersion} is supported but may have limited features`,
      recommendation: 'For better performance, update your system WebView'
    };
  }
  
  // 检查特定功能的可用性
  const featureSupport = {
    cssGrid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    webGL: checkWebGLSupport(),
    webWorker: typeof Worker !== 'undefined',
    localstorage: typeof localStorage !== 'undefined',
    sessionstorage: typeof sessionStorage !== 'undefined',
    indexedDB: 'indexedDB' in window && indexedDB !== null,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    notification: 'Notification' in window,
    vibration: 'vibrate' in navigator
  };
  
  const missingFeatures = Object.entries(featureSupport)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
    
  if (missingFeatures.length > 0) {
    return {
      compatible: true,
      warning: true,
      reason: `WebView supports most features but some may be unavailable: ${missingFeatures.join(', ')}`,
      missingFeatures,
      featureSupport
    };
  }
  
  return {
    compatible: true,
    reason: `WebView version ${webViewVersion} is fully supported`,
    webViewVersion,
    featureSupport
  };
};

// 获取WebView版本
const getWebViewVersion = async () => {
  if (window.navigator.userAgent) {
    const userAgent = window.navigator.userAgent;
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }
  
  // 默认版本（如果无法检测）
  return 80;
};

// 检查WebGL支持
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// 运行完整兼容性检查
export const runCompatibilityCheck = async () => {
  const deviceInfo = await getDeviceInfo();
  const androidCompatibility = await checkAndroidVersionCompatibility();
  const screenCompatibility = checkScreenCompatibility();
  const webViewCompatibility = await checkWebViewCompatibility();
  
  // 聚合结果
  const criticalIssues = [
    !androidCompatibility.compatible && androidCompatibility.critical,
    !screenCompatibility.compatible,
    !webViewCompatibility.compatible && webViewCompatibility.critical
  ].filter(Boolean);
  
  const warnings = [
    androidCompatibility.warning,
    screenCompatibility.issues.length > 0,
    webViewCompatibility.warning
  ].filter(Boolean);
  
  // 生成兼容性报告
  const compatibilityReport = {
    deviceInfo,
    overall: {
      compatible: criticalIssues.length === 0,
      warningsCount: warnings.length,
      criticalIssuesCount: criticalIssues.length
    },
    android: androidCompatibility,
    screen: screenCompatibility,
    webView: webViewCompatibility,
    recommendations: [
      ...androidCompatibility.recommendation ? [androidCompatibility.recommendation] : [],
      ...screenCompatibility.recommendations || [],
      ...webViewCompatibility.recommendation ? [webViewCompatibility.recommendation] : []
    ]
  };
  
  // 保存报告
  saveCompatibilityReport(compatibilityReport);
  
  return compatibilityReport;
};

// 保存兼容性报告
const saveCompatibilityReport = (report) => {
  if (localStorage) {
    try {
      // 获取之前的报告
      const reports = JSON.parse(localStorage.getItem('compatibilityReports') || '[]');
      
      // 添加当前报告
      reports.push({
        ...report,
        timestamp: new Date().toISOString()
      });
      
      // 只保留最近10条报告
      if (reports.length > 10) {
        reports.shift();
      }
      
      // 保存到localStorage
      localStorage.setItem('compatibilityReports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving compatibility report:', error);
    }
  }
};

// 获取兼容性报告历史
export const getCompatibilityHistory = () => {
  if (localStorage) {
    try {
      return JSON.parse(localStorage.getItem('compatibilityReports') || '[]');
    } catch (error) {
      console.error('Error getting compatibility history:', error);
      return [];
    }
  }
  return [];
};

// 清除兼容性报告历史
export const clearCompatibilityHistory = () => {
  if (localStorage) {
    localStorage.removeItem('compatibilityReports');
  }
};

// 特定设备兼容性解决方案
export const getDeviceSpecificSolutions = async () => {
  const deviceInfo = await getDeviceInfo();
  const solutions = [];
  
  // 特定品牌/型号的解决方案
  if (deviceInfo.platform === 'android') {
    // 小米设备
    if (deviceInfo.model && deviceInfo.model.toLowerCase().includes('xiaomi') || deviceInfo.manufacturer && deviceInfo.manufacturer.toLowerCase().includes('xiaomi')) {
      solutions.push({
        device: 'Xiaomi',
        issue: 'Battery optimization may kill background processes',
        solution: 'Guide users to disable battery optimization for the app in settings',
        steps: [
          'Open Settings',
          'Go to Battery & performance',
          'Select App battery saver',
          'Find your app',
          'Choose No restrictions'
        ]
      });
    }
    
    // 华为设备
    if (deviceInfo.model && deviceInfo.model.toLowerCase().includes('huawei') || deviceInfo.manufacturer && deviceInfo.manufacturer.toLowerCase().includes('huawei')) {
      solutions.push({
        device: 'Huawei',
        issue: 'Aggressive power management may interfere with notifications',
        solution: 'Guide users to set app as protected apps',
        steps: [
          'Open Settings',
          'Go to Apps',
          'Select Settings',
          'Go to Special access',
          'Select Ignore battery optimization',
          'Find your app and allow'
        ]
      });
    }
    
    // Samsung设备
    if (deviceInfo.model && deviceInfo.model.toLowerCase().includes('samsung') || deviceInfo.manufacturer && deviceInfo.manufacturer.toLowerCase().includes('samsung')) {
      solutions.push({
        device: 'Samsung',
        issue: 'WebView updates may be delayed',
        solution: 'Guide users to update system WebView through Galaxy Store',
        steps: [
          'Open Galaxy Store',
          'Search for Android System WebView',
          'Update if available'
        ]
      });
    }
  }
  
  return solutions;
};

// 修复常见兼容性问题的函数
export const applyCompatibilityFixes = async () => {
  const deviceInfo = await getDeviceInfo();
  const fixes = [];
  
  // Android版本特定修复
  if (deviceInfo.platform === 'android') {
    const androidVersion = parseInt(deviceInfo.osVersion.split('.')[0]);
    
    // Android 6.0 (API 23) 及以上需要运行时权限
    if (androidVersion >= 6) {
      fixes.push({
        type: 'runtimePermissions',
        description: 'This device requires runtime permissions for camera, location, etc.',
        implementation: 'Use the permissions utility to request permissions at runtime'
      });
    }
    
    // Android 7.0 (API 24) 引入了文件提供者
    if (androidVersion >= 7) {
      fixes.push({
        type: 'fileProvider',
        description: 'File access restrictions in Android 7.0+',
        implementation: 'Use FileProvider to access files securely'
      });
    }
    
    // Android 8.0 (API 26) 限制后台服务
    if (androidVersion >= 8) {
      fixes.push({
        type: 'backgroundServices',
        description: 'Background service limitations in Android 8.0+',
        implementation: 'Use foreground services or WorkManager for background tasks'
      });
    }
    
    // Android 9.0 (API 28) 强制HTTPS
    if (androidVersion >= 9) {
      fixes.push({
        type: 'networkSecurity',
        description: 'Android 9.0+ requires HTTPS by default',
        implementation: 'Configure network security config or use HTTPS for all requests'
      });
    }
    
    // Android 10.0 (API 29) 作用域存储
    if (androidVersion >= 10) {
      fixes.push({
        type: 'scopedStorage',
        description: 'Scoped storage in Android 10.0+',
        implementation: 'Use Scoped Storage API for file access'
      });
    }
    
    // Android 11.0 (API 30) 软件包可见性
    if (androidVersion >= 11) {
      fixes.push({
        type: 'packageVisibility',
        description: 'Package visibility restrictions in Android 11.0+',
        implementation: 'Add queries to AndroidManifest.xml for required apps'
      });
    }
    
    // Android 12.0 (API 31) 通知权限
    if (androidVersion >= 12) {
      fixes.push({
        type: 'notificationPermissions',
        description: 'New notification permission model in Android 12.0+',
        implementation: 'Request notification permissions explicitly'
      });
    }
    
    // Android 13.0 (API 33) 运行时通知权限
    if (androidVersion >= 13) {
      fixes.push({
        type: 'runtimeNotificationPermissions',
        description: 'Runtime notification permissions in Android 13.0+',
        implementation: 'Add POST_NOTIFICATIONS permission and request at runtime'
      });
    }
  }
  
  return fixes;
};