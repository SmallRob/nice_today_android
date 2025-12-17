import { Capacitor } from '@capacitor/core';
import { initializeApp as initCapacitorApp } from './capacitor';
import { initResponsive, getDeviceInfo } from './responsive';
import performanceMonitor, { configurePerformanceMonitor } from './performanceMonitor';
import { runCompatibilityCheck, getDeviceSpecificSolutions, applyCompatibilityFixes } from './compatibility';
import { permissionManager } from './permissionManager';

// 应用初始化配置
const DEFAULT_APP_CONFIG = {
  // 是否启用调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 性能监控配置
  performance: {
    enabled: true,
    autoLog: true,
    thresholds: {
      render: 16,
      api: 2000,
      componentLoad: 500
    }
  },
  
  // 权限配置
  permissions: {
    autoRequest: false,
    required: [], // 应用启动时必须请求的权限
    optional: []   // 应用中按需请求的权限
  },
  
  // 兼容性检查
  compatibility: {
    autoCheck: true,
    fixProblems: false,
    logProblems: true
  }
};

// 应用状态管理
let appState = {
  initialized: false,
  platform: null,
  deviceInfo: null,
  compatibilityReport: null,
  performanceReport: null,
  permissionStatus: null
};

// 初始化应用
export const initializeApp = async (customConfig = {}) => {
  try {
    // 合并配置
    const config = {
      ...DEFAULT_APP_CONFIG,
      ...customConfig
    };
    
    console.log('Initializing app with config:', config);
    
    // 1. 检测平台和设备信息
    const platform = Capacitor.getPlatform();
    console.log(`Running on platform: ${platform}`);
    appState.platform = platform;
    
    // 2. 初始化响应式设计
    const deviceInfo = initResponsive();
    console.log('Device info:', deviceInfo);
    appState.deviceInfo = deviceInfo;
    
    // 3. 初始化Capacitor应用
    const capacitorInfo = await initCapacitorApp({
      statusBarStyle: platform === 'ios' ? 'DARK' : 'LIGHT',
      statusBarBackgroundColor: '#ffffff',
      enableKeyboardListeners: true,
      enableNetworkListener: true,
      networkCallback: (status) => {
        console.log('Network status changed:', status);
        // 可以在这里处理网络状态变化
      },
      lifecycleCallbacks: {
        onAppStateChange: (state) => {
          console.log('App state changed:', state);
          // 可以在这里处理应用状态变化
        },
        onUrlOpen: (event) => {
          console.log('URL opened:', event.url);
          // 可以在这里处理深度链接
        }
      }
    });
    
    console.log('Capacitor initialized:', capacitorInfo);
    
    // 4. 初始化性能监控
    if (config.performance.enabled) {
      configurePerformanceMonitor(config.performance);
      console.log('Performance monitoring initialized');
    }
    
    // 5. 运行兼容性检查
    if (config.compatibility.autoCheck) {
      const compatibilityReport = await runCompatibilityCheck();
      console.log('Compatibility report:', compatibilityReport);
      appState.compatibilityReport = compatibilityReport;
      
      if (!compatibilityReport.overall.compatible) {
        console.warn('Device compatibility issues detected');
        
        // 记录问题
        if (config.compatibility.logProblems) {
          logCompatibilityIssues(compatibilityReport);
        }
        
        // 尝试修复
        if (config.compatibility.fixProblems) {
          const fixes = await applyCompatibilityFixes();
          console.log('Applied compatibility fixes:', fixes);
        }
      }
      
      // 获取设备特定解决方案
      const deviceSolutions = await getDeviceSpecificSolutions();
      if (deviceSolutions.length > 0) {
        console.log('Device specific solutions:', deviceSolutions);
      }
    }
    
    // 6. 处理权限
    if (config.permissions.required.length > 0 || config.permissions.optional.length > 0) {
      const permissionStatus = await handlePermissions(config.permissions);
      console.log('Permission status:', permissionStatus);
      appState.permissionStatus = permissionStatus;
    }
    
    // 标记为已初始化
    appState.initialized = true;
    
    console.log('App initialization complete');
    return appState;
    
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }
};

// 处理权限
const handlePermissions = async (permissionsConfig) => {
  const { required, optional, autoRequest } = permissionsConfig;
  const results = {
    required: {},
    optional: {},
    allGranted: false
  };
  
  // 检查必需权限
  if (required.length > 0) {
    results.required = await permissionManager.checkAndRequestPermissionGroup(required);
  }
  
  // 检查可选权限（仅检查，不自动请求）
  if (optional.length > 0) {
    const checkResults = await permissionManager.checkPermissionGroup(optional);
    results.optional = checkResults;
    
    // 如果设置了自动请求可选权限
    if (autoRequest && !checkResults.allGranted) {
      results.optional = await permissionManager.checkAndRequestPermissionGroup(optional);
    }
  }
  
  // 检查是否所有必需权限都已授予
  results.allGranted = required.length === 0 || results.required.allGranted;
  
  return results;
};

// 记录兼容性问题
const logCompatibilityIssues = (report) => {
  if (!report.overall.compatible) {
    console.group('Compatibility Issues:');
    
    if (report.android && !report.android.compatible) {
      console.warn('Android Version:', report.android.reason);
    }
    
    if (report.screen && !report.screen.compatible) {
      console.warn('Screen:', report.screen.issues.join(', '));
    }
    
    if (report.webView && !report.webView.compatible) {
      console.warn('WebView:', report.webView.reason);
    }
    
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('Compatibility Recommendations:');
    report.recommendations.forEach(rec => console.info(rec));
    console.groupEnd();
  }
};

// 获取应用状态
export const getAppState = () => {
  return { ...appState };
};

// 检查应用是否已初始化
export const isAppInitialized = () => {
  return appState.initialized;
};

// 获取平台信息
export const getPlatformInfo = () => {
  return {
    platform: appState.platform,
    isNative: Capacitor.isNativePlatform(),
    isAndroid: appState.platform === 'android',
    isIOS: appState.platform === 'ios',
    isWeb: appState.platform === 'web'
  };
};

// 获取兼容性报告
export const getCompatibilityReport = () => {
  return appState.compatibilityReport;
};

// 获取权限状态
export const getPermissionStatus = () => {
  return appState.permissionStatus;
};

// 请求权限
export const requestPermission = async (permission) => {
  return await permissionManager.checkAndRequestPermission(
    permission, 
    permissionManager.getPermissionExplanation(permission)
  );
};

// 初始化网络状态监控
export const initNetworkMonitoring = (callback) => {
  if (appState.initialized && callback) {
    // 网络状态变化已经在initializeApp中设置
    // 这里只是确保回调函数被正确传递
    return true;
  }
  
  return false;
};

// 重新运行兼容性检查
export const rerunCompatibilityCheck = async () => {
  const report = await runCompatibilityCheck();
  appState.compatibilityReport = report;
  return report;
};

// 应用性能诊断
export const diagnosePerformance = () => {
  if (!appState.initialized) {
    return { error: 'App not initialized' };
  }
  
  // 这里可以实现更详细的性能诊断
  const diagnostics = {
    deviceInfo: appState.deviceInfo,
    platform: appState.platform,
    memoryUsage: performanceMonitor.memoryMonitor(),
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'unknown'
  };
  
  return diagnostics;
};

// 导出用于应用重启时的重置函数
export const resetAppState = () => {
  appState = {
    initialized: false,
    platform: null,
    deviceInfo: null,
    compatibilityReport: null,
    performanceReport: null,
    permissionStatus: null
  };
  
  // 重置性能监控
  performanceMonitor.clearData();
  
  // 重置权限管理器缓存
  permissionManager.clearCache();
};

// 获取性能报告
export const getPerformanceReport = () => {
  return performanceMonitor.generateReport();
};

// 获取性能建议
export const getPerformanceRecommendations = () => {
  return performanceMonitor.getRecommendations();
};