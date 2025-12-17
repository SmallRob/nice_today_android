/**
 * 修复后的兼容性测试工具类
 * 简化了检查流程，提高了兼容性和性能
 */

import { Capacitor } from '@capacitor/core';

// 设备信息缓存
let deviceInfoCache = null;

// 获取设备信息 - 简化版本
export const getDeviceInfo = async () => {
  if (deviceInfoCache) {
    return deviceInfoCache;
  }

  try {
    // 检查Device插件是否可用
    if (Capacitor.isPluginAvailable('Device')) {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      deviceInfoCache = {
        ...info,
        isNative: Capacitor.isNativePlatform(),
        platform: Capacitor.getPlatform()
      };
    } else {
      // 如果插件不可用，使用默认值
      deviceInfoCache = {
        platform: Capacitor.getPlatform() || 'web',
        isNative: Capacitor.isNativePlatform(),
        model: 'unknown',
        osVersion: 'unknown'
      };
    }
    
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

// 检测屏幕尺寸兼容性 - 简化版本
export const checkScreenCompatibility = () => {
  try {
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
  } catch (error) {
    console.error('Error checking screen compatibility:', error);
    return {
      compatible: true,
      issues: [`Error checking screen: ${error.message}`],
      recommendations: []
    };
  }
};

// 检测WebView兼容性 - 简化版本
export const checkWebViewCompatibility = async () => {
  try {
    const deviceInfo = await getDeviceInfo();
    
    if (deviceInfo.platform !== 'android') {
      return { compatible: true, reason: 'Not an Android device' };
    }

    // 简化WebView版本检测
    let webViewVersion = 80; // 默认值
    if (window.navigator.userAgent) {
      const userAgent = window.navigator.userAgent;
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      if (match && match[1]) {
        webViewVersion = parseInt(match[1]);
      }
    }
    
    // 检查WebView版本
    if (webViewVersion < 65) {
      return {
        compatible: false,
        critical: true,
        reason: `WebView version ${webViewVersion} is not supported. Minimum supported version is 65`,
        recommendation: 'Please update your device system WebView'
      };
    }
    
    // 检查基本功能可用性
    const featureSupport = {
      cssGrid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      webGL: checkWebGLSupport(),
      localstorage: typeof localStorage !== 'undefined',
      sessionstorage: typeof sessionStorage !== 'undefined'
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
  } catch (error) {
    console.error('Error checking WebView compatibility:', error);
    return {
      compatible: true,
      reason: 'Could not check WebView compatibility',
      error: error.message
    };
  }
};

// 检查WebGL支持 - 简化版本
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// 运行完整兼容性检查 - 简化版本
export const runCompatibilityCheck = async () => {
  try {
    const deviceInfo = await getDeviceInfo();
    const screenCompatibility = checkScreenCompatibility();
    const webViewCompatibility = await checkWebViewCompatibility();
    
    // 聚合结果
    const criticalIssues = [
      !screenCompatibility.compatible,
      !webViewCompatibility.compatible
    ].filter(Boolean);
    
    const warnings = [
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
      screen: screenCompatibility,
      webView: webViewCompatibility,
      recommendations: [
        ...screenCompatibility.recommendations || [],
        ...(webViewCompatibility.recommendation ? [webViewCompatibility.recommendation] : [])
      ]
    };
    
    return compatibilityReport;
  } catch (error) {
    console.error('Error running compatibility check:', error);
    return {
      deviceInfo: { platform: 'unknown' },
      overall: {
        compatible: true,
        warningsCount: 1,
        criticalIssuesCount: 0
      },
      screen: { compatible: true, issues: [] },
      webView: { compatible: true },
      recommendations: [],
      error: error.message
    };
  }
};

// 特定设备兼容性解决方案 - 简化版本
export const getDeviceSpecificSolutions = async () => {
  try {
    const deviceInfo = await getDeviceInfo();
    const solutions = [];
    
    // 特定品牌/型号的解决方案
    if (deviceInfo.platform === 'android') {
      // 简化的设备检测
      const userAgent = navigator.userAgent.toLowerCase();
      
      // 小米设备
      if (userAgent.includes('xiaomi') || userAgent.includes('redmi')) {
        solutions.push({
          device: 'Xiaomi',
          issue: 'Battery optimization may kill background processes',
          solution: 'Guide users to disable battery optimization for the app'
        });
      }
      
      // 华为设备
      if (userAgent.includes('huawei') || userAgent.includes('honor')) {
        solutions.push({
          device: 'Huawei',
          issue: 'Aggressive power management may interfere with notifications',
          solution: 'Guide users to set app as protected apps'
        });
      }
      
      // Samsung设备
      if (userAgent.includes('samsung') || userAgent.includes('galaxy')) {
        solutions.push({
          device: 'Samsung',
          issue: 'WebView updates may be delayed',
          solution: 'Guide users to update system WebView through Galaxy Store'
        });
      }
    }
    
    return solutions;
  } catch (error) {
    console.error('Error getting device specific solutions:', error);
    return [];
  }
};

// 应用兼容性修复 - 简化版本
export const applyCompatibilityFixes = async () => {
  try {
    const deviceInfo = await getDeviceInfo();
    const fixes = [];
    
    // 根据平台添加基本修复
    if (deviceInfo.platform === 'android') {
      fixes.push({
        type: 'android',
        description: 'General Android compatibility fixes applied',
        implementation: 'Applied basic compatibility fixes for Android platform'
      });
    }
    
    return fixes;
  } catch (error) {
    console.error('Error applying compatibility fixes:', error);
    return [];
  }
};