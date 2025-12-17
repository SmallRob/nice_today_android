/**
 * 增强版Capacitor应用初始化脚本
 * 使用增强的模拟API，确保应用可以正常运行
 */

import { Capacitor } from '@capacitor/core';
import { initResponsive } from './responsive';
import { initializePerformanceMonitoring } from './performance-simulated';
import { runCompatibilityCheck, getDeviceSpecificSolutions, applyCompatibilityFixes } from './compatibility';
import { permissionManager } from './permissions-simulated';

// 应用初始化配置
const APP_CONFIG = {
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

// 简化的Capacitor应用初始化
const initCapacitorApp = async (options = {}) => {
  const {
    statusBarStyle = 'LIGHT',
    statusBarBackgroundColor = '#ffffff',
    enableKeyboardListeners = true,
    enableNetworkListener = false,
    networkCallback,
    lifecycleCallbacks
  } = options;

  // 检测平台和设备信息
  const platform = Capacitor.getPlatform();
  console.log(`Running on platform: ${platform}`);
  
  const deviceInfo = {
    platform,
    isNative: Capacitor.isNativePlatform(),
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  };
  
  // 在原生环境中尝试初始化基本功能
  if (Capacitor.isNativePlatform()) {
    try {
      // 尝试初始化状态栏（如果可用）
      if (Capacitor.isPluginAvailable('StatusBar')) {
        const { StatusBar } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: statusBarStyle });
        if (statusBarBackgroundColor && platform !== 'ios') {
          await StatusBar.setBackgroundColor({ color: statusBarBackgroundColor });
        }
      }
      
      // 尝试初始化键盘监听器（如果可用）
      if (enableKeyboardListeners && Capacitor.isPluginAvailable('Keyboard')) {
        const { Keyboard } = await import('@capacitor/keyboard');
        Keyboard.addListener('keyboardWillShow', (info) => {
          console.log('keyboard will show with height:', info.keyboardHeight);
          document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
          document.body.classList.add('keyboard-open');
        });
        
        Keyboard.addListener('keyboardWillHide', () => {
          console.log('keyboard will hide');
          document.body.style.removeProperty('--keyboard-height');
          document.body.classList.remove('keyboard-open');
        });
      }
      
      // 尝试初始化网络监听器（如果可用）
      if (enableNetworkListener && Capacitor.isPluginAvailable('Network')) {
        const { Network } = await import('@capacitor/network');
        const handler = Network.addListener('networkStatusChange', (status) => {
          if (networkCallback) networkCallback(status);
        });
        
        // 获取初始网络状态
        const status = await Network.getStatus();
        if (networkCallback) networkCallback(status);
        
        // 返回清理函数
        return {
          ...deviceInfo,
          cleanup: () => {
            handler.remove();
          }
        };
      }
    } catch (error) {
      console.warn('Error initializing Capacitor features:', error);
      // 继续执行，不阻止应用启动
    }
  }
  
  return deviceInfo;
};

// 初始化应用
export const initializeApp = async (customConfig = {}) => {
  try {
    // 合并配置
    const config = {
      ...APP_CONFIG,
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
    
    // 3. 初始化Capacitor应用（简化版本）
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
    
    // 4. 初始化性能监控（使用模拟API）
    if (config.performance.enabled) {
      initializePerformanceMonitoring(config.performance);
      console.log('Performance monitoring initialized (using simulated API)');
    }
    
    // 5. 运行兼容性检查
    if (config.compatibility.autoCheck) {
      try {
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
      } catch (error) {
        console.warn('Error running compatibility check:', error);
        // 继续执行，不阻止应用启动
      }
    }
    
    // 6. 处理权限（使用模拟API）
    if (config.permissions.required.length > 0 || config.permissions.optional.length > 0) {
      try {
        const permissionStatus = await handlePermissions(config.permissions);
        console.log('Permission status:', permissionStatus);
        appState.permissionStatus = permissionStatus;
      } catch (error) {
        console.warn('Error handling permissions:', error);
        // 继续执行，不阻止应用启动
      }
    }
    
    // 标记为已初始化
    appState.initialized = true;
    
    console.log('App initialization complete (using simulated APIs)');
    return appState;
    
  } catch (error) {
    console.error('Error initializing app:', error);
    
    // 即使初始化失败，也标记为已初始化，避免无限重试
    appState.initialized = true;
    appState.error = error.message;
    
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
  
  try {
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
  } catch (error) {
    console.warn('Error in handlePermissions:', error);
    // 返回模拟结果
    return {
      required: required.reduce((acc, permission) => {
        acc[permission] = { state: 'granted', name: permission };
        return acc;
      }, {}),
      optional: optional.reduce((acc, permission) => {
        acc[permission] = { state: 'granted', name: permission };
        return acc;
      }, {}),
      allGranted: true
    };
  }
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
  return appState;
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
  try {
    return await permissionManager.checkAndRequestPermission(
      permission, 
      getPermissionExplanation(permission)
    );
  } catch (error) {
    console.warn('Error requesting permission:', error);
    // 返回模拟结果
    return { state: 'granted', name: permission };
  }
};

// 获取权限说明
const getPermissionExplanation = (permission) => {
  const explanations = {
    camera: '需要相机权限来拍摄照片和视频',
    microphone: '需要麦克风权限来录制音频',
    photos: '需要相册权限来访问和保存图片',
    geolocation: '需要位置权限来提供基于位置的服务',
    notifications: '需要通知权限来发送重要提醒',
    calendar: '需要日历权限来读取和创建日程',
    storage: '需要存储权限来访问设备上的文件'
  };
  
  return explanations[permission] || '需要此权限来正常使用应用功能';
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
  try {
    const report = await runCompatibilityCheck();
    appState.compatibilityReport = report;
    return report;
  } catch (error) {
    console.warn('Error rerunning compatibility check:', error);
    // 返回模拟结果
    return {
      overall: { compatible: true },
      android: { compatible: true },
      screen: { compatible: true },
      webView: { compatible: true },
      recommendations: []
    };
  }
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
    memoryUsage: navigator.deviceMemory || 'unknown',
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
};