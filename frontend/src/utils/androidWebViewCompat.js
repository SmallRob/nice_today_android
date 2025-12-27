/**
 * Android WebView 兼容性修复工具
 * 解决在封装为 Android App 后的兼容性问题
 */

// 检测是否在 Android WebView 中运行
export const isAndroidWebView = () => {
  try {
    const ua = navigator.userAgent || '';
    return /Android/.test(ua) &&
           (/wv/.test(ua) || /Version\/\d+\.\d+/.test(ua) || /Chrome/.test(ua));
  } catch (error) {
    return false;
  }
};

// 检测是否在 Capacitor 环境中
export const isCapacitorAndroid = () => {
  try {
    return typeof window !== 'undefined' &&
           window.Capacitor &&
           window.Capacitor.getPlatform &&
           window.Capacitor.getPlatform() === 'android';
  } catch (error) {
    return false;
  }
};

// 安全的内存检测
export const safeGetMemoryUsage = () => {
  try {
    // Android WebView 不支持 performance.memory
    if (performance && performance.memory && typeof performance.memory.usedJSHeapSize === 'number') {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return null;
  } catch (error) {
    console.warn('内存检测不可用:', error);
    return null;
  }
};

// 检测性能监控是否可用
export const isPerformanceAvailable = () => {
  try {
    return typeof performance !== 'undefined' &&
           typeof performance.mark === 'function' &&
           typeof performance.measure === 'function';
  } catch (error) {
    return false;
  }
};

// 安全的性能标记
export const safePerformanceMark = (name) => {
  try {
    if (isPerformanceAvailable()) {
      performance.mark(name);
    }
  } catch (error) {
    console.warn(`性能标记失败 [${name}]:`, error);
  }
};

// 安全的性能测量
export const safePerformanceMeasure = (name, startMark, endMark) => {
  try {
    if (isPerformanceAvailable()) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures && measures.length > 0) {
        return measures[0].duration;
      }
    }
    return null;
  } catch (error) {
    console.warn(`性能测量失败 [${name}]:`, error);
    return null;
  }
};

// 安全的 requestAnimationFrame
export const safeRequestAnimationFrame = (callback) => {
  try {
    if (typeof requestAnimationFrame === 'function') {
      return requestAnimationFrame(callback);
    } else if (typeof setTimeout === 'function') {
      // 降级到 setTimeout
      return setTimeout(callback, 16);
    }
  } catch (error) {
    console.warn('requestAnimationFrame 不可用:', error);
    setTimeout(callback, 16);
  }
};

// 检测是否需要启用性能优化
export const shouldOptimizePerformance = () => {
  return isAndroidWebView() || isCapacitorAndroid();
};

// 获取设备性能级别
export const getPerformanceLevel = () => {
  try {
    // Android WebView 通常是低性能环境
    if (isAndroidWebView()) {
      const ua = navigator.userAgent || '';
      const match = ua.match(/Android (\d+)/);
      if (match) {
        const version = parseInt(match[1]);
        if (version < 7) return 'low';
        if (version < 9) return 'medium';
      }
      return 'medium';
    }

    // 其他环境
    return 'high';
  } catch (error) {
    return 'medium';
  }
};

// 获取推荐的内存限制
export const getRecommendedMemoryLimit = () => {
  const level = getPerformanceLevel();
  switch (level) {
    case 'low':
      return 50 * 1024 * 1024; // 50MB
    case 'medium':
      return 80 * 1024 * 1024; // 80MB
    case 'high':
      return 150 * 1024 * 1024; // 150MB
    default:
      return 80 * 1024 * 1024;
  }
};

// 检测是否需要禁用某些功能
export const getFeatureCompatibility = () => {
  const isWebView = isAndroidWebView();
  const isCapacitor = isCapacitorAndroid();

  return {
    memoryMonitor: !isWebView, // WebView 不支持内存监控
    performanceAPI: !isWebView, // WebView 的性能 API 可能受限
    localStorage: true, // 通常支持
    sessionStorage: isCapacitor, // Capacitor 可能不支持
    webGL: true, // 通常支持
    webWorkers: !isWebView, // WebView 可能不支持 Worker
    serviceWorkers: false, // WebView 通常不支持 Service Worker
  };
};

// 安全的初始化函数，避免模块加载时的错误
export const safeInitAndroidWebViewCompat = () => {
  try {
    return initAndroidWebViewCompat();
  } catch (error) {
    console.warn('Android WebView 兼容性初始化失败，但不影响应用启动:', error);
    return false;
  }
};

// 初始化 Android WebView 兼容性
export const initAndroidWebViewCompat = () => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    if (isAndroidWebView() || isCapacitorAndroid()) {
      console.log('📱 检测到 Android WebView 环境，应用兼容性修复');

      // 禁用不兼容的特性
      const compat = getFeatureCompatibility();
      console.log('🔧 功能兼容性状态:', compat);

      // 设置全局标志
      window.__ANDROID_WEBVIEW__ = true;
      window.__CAPACITOR_ANDROID__ = isCapacitorAndroid();

      // 添加特定的 CSS 类
      if (document.body) {
        document.body.classList.add('android-webview');
      }

      return true;
    }
    return false;
  } catch (error) {
    console.warn('Android WebView 兼容性初始化错误:', error);
    return false;
  }
};

export default {
  isAndroidWebView,
  isCapacitorAndroid,
  safeGetMemoryUsage,
  isPerformanceAvailable,
  safePerformanceMark,
  safePerformanceMeasure,
  safeRequestAnimationFrame,
  shouldOptimizePerformance,
  getPerformanceLevel,
  getRecommendedMemoryLimit,
  getFeatureCompatibility,
  initAndroidWebViewCompat
};
