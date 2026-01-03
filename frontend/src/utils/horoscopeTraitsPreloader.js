/**
 * horoscope-traits 资源预加载器
 *
 * 用于提前加载 horoscope-traits 相关资源，避免用户导航时出现加载延迟或ChunkLoadError
 * 采用智能预加载策略，根据用户行为和设备条件调整加载时机
 */

// 预加载配置：可通过localStorage禁用预加载
const PRELOAD_CONFIG_KEY = 'horoscope_preload_enabled';
let isPreloadEnabled = true;

// 检查预加载是否启用
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const config = window.localStorage.getItem(PRELOAD_CONFIG_KEY);
    if (config === 'false') {
      isPreloadEnabled = false;
      console.log('horoscope-traits 预加载已禁用');
    }
  }
} catch (error) {
  // 忽略配置读取错误，默认启用
}

// 预加载状态跟踪
let preloadState = {
  attempted: false,
  success: false,
  error: null,
  loading: false,
  lastAttemptTime: null,
  retryCount: 0
};

// 最大重试次数
const MAX_RETRIES = 3;

// 重试延迟（毫秒）
const RETRY_DELAYS = [1000, 3000, 5000];

/**
 * 预加载 horoscope-traits 页面及相关资源
 * 使用webpack的魔法注释进行预获取
 */
export const preloadHoroscopeTraits = async () => {
  // 检查预加载是否被禁用
  if (!isPreloadEnabled) {
    return { success: false, reason: '预加载已禁用' };
  }

  // 如果已经成功预加载，直接返回
  if (preloadState.success) {
    console.log('horoscope-traits 资源已预加载');
    return { success: true, cached: true };
  }

  // 如果正在加载中，等待完成
  if (preloadState.loading) {
    console.log('horoscope-traits 资源正在预加载中...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!preloadState.loading) {
          clearInterval(checkInterval);
          resolve({ 
            success: preloadState.success, 
            error: preloadState.error 
          });
        }
      }, 100);
    });
  }

  // 如果重试次数超过限制，不再尝试
  if (preloadState.retryCount >= MAX_RETRIES) {
    console.warn('horoscope-traits 预加载重试次数已达上限，不再尝试');
    return { 
      success: false, 
      error: preloadState.error || '预加载重试次数已达上限' 
    };
  }

  // 开始预加载
  preloadState.loading = true;
  preloadState.attempted = true;
  preloadState.lastAttemptTime = Date.now();

  try {
    console.log('开始预加载 horoscope-traits 资源...');
    
    // 使用 webpackPrefetch 魔法注释预加载页面组件
    // 注意：由于 webpack 魔法注释需要静态分析，我们需要将预加载逻辑放在单独的动态导入中
    const importModule = () => import(
      /* webpackPrefetch: true */ 
      /* webpackChunkName: "horoscope-traits" */
      '../pages/horoscope/HoroscopeTraitsPage'
    );

    // 设置超时机制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('预加载超时')), 10000);
    });

    // 执行预加载
    await Promise.race([importModule(), timeoutPromise]);

    // 预加载成功
    preloadState.success = true;
    preloadState.error = null;
    preloadState.loading = false;
    
    console.log('horoscope-traits 资源预加载成功');
    
    // 记录预加载成功信息
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const preloadInfo = {
          type: 'horoscopeTraitsPreload',
          success: true,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          retryCount: preloadState.retryCount
        };
        
        const preloadHistory = JSON.parse(
          window.localStorage.getItem('resourcePreloadHistory') || '[]'
        );
        preloadHistory.push(preloadInfo);
        window.localStorage.setItem('resourcePreloadHistory', JSON.stringify(preloadHistory));
      } catch (e) {
        console.warn('无法记录预加载信息:', e);
      }
    }
    
    return { success: true, cached: false };
  } catch (error) {
    // 预加载失败
    preloadState.loading = false;
    preloadState.error = error.message;
    preloadState.retryCount++;
    
    console.error('horoscope-traits 资源预加载失败:', error);
    
    // 记录错误信息
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const errorInfo = {
          type: 'horoscopeTraitsPreloadError',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          retryCount: preloadState.retryCount
        };
        
        const preloadErrors = JSON.parse(
          window.localStorage.getItem('resourcePreloadErrors') || '[]'
        );
        preloadErrors.push(errorInfo);
        window.localStorage.setItem('resourcePreloadErrors', JSON.stringify(preloadErrors));
      } catch (e) {
        console.warn('无法记录预加载错误:', e);
      }
    }
    
    return { success: false, error: error.message, retryCount: preloadState.retryCount };
  }
};

/**
 * 智能预加载策略
 * 根据用户行为预测是否需要预加载 horoscope-traits 资源
 */
export const intelligentPreload = () => {
  // 检查网络条件
  const networkCondition = checkNetworkCondition();
  
  // 检查设备性能
  const devicePerformance = checkDevicePerformance();
  
  // 检查用户行为模式
  const userBehavior = analyzeUserBehavior();
  
  // 决策是否预加载
  const shouldPreload = networkCondition === 'good' && 
                       devicePerformance !== 'low' && 
                       userBehavior.suggestsHoroscopeTraits;
  
  if (shouldPreload) {
    console.log('根据智能分析，开始预加载 horoscope-traits 资源');
    return preloadHoroscopeTraits();
  }
  
  return { success: false, reason: '不符合预加载条件' };
};

/**
 * 检查网络条件
 */
const checkNetworkCondition = () => {
  if (typeof navigator === 'undefined') return 'unknown';
  
  // 简单检查：如果是在线状态，假设网络条件良好
  if (navigator.onLine) {
    // 进一步检查连接类型（如果支持）
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow';
        case '3g':
          return 'medium';
        case '4g':
        case '5g':
          return 'good';
        default:
          return 'good';
      }
    }
    return 'good';
  }
  
  return 'offline';
};

/**
 * 检查设备性能
 */
const checkDevicePerformance = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  // 根据内存信息判断
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    const totalMemory = memory.totalJSHeapSize;
    
    // 简单判断：如果总内存小于100MB，认为是低性能设备
    if (totalMemory < 100 * 1024 * 1024) {
      return 'low';
    }
  }
  
  // 根据CPU核心数判断
  const cores = navigator.hardwareConcurrency || 1;
  if (cores <= 2) {
    return 'low';
  }
  
  return 'normal';
};

/**
 * 分析用户行为模式
 */
const analyzeUserBehavior = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { suggestsHoroscopeTraits: false, confidence: 0 };
  }
  
  try {
    // 获取用户导航历史
    const navigationHistory = JSON.parse(
      window.localStorage.getItem('userNavigationHistory') || '[]'
    );
    
    // 获取使用频率统计
    const usageStats = JSON.parse(
      window.localStorage.getItem('featureUsageStats') || '{}'
    );
    
    // 分析用户是否经常访问星座相关页面
    const horoscopeVisits = navigationHistory.filter(
      item => item.path && item.path.includes('horoscope')
    ).length;
    
    const horoscopeTraitsVisits = navigationHistory.filter(
      item => item.path && item.path.includes('horoscope-traits')
    ).length;
    
    const totalVisits = navigationHistory.length;
    
    // 计算访问频率
    const horoscopeFrequency = totalVisits > 0 ? horoscopeVisits / totalVisits : 0;
    const horoscopeTraitsFrequency = totalVisits > 0 ? horoscopeTraitsVisits / totalVisits : 0;
    
    // 判断用户是否对星座特性感兴趣
    const suggestsHoroscopeTraits = 
      horoscopeFrequency > 0.3 || 
      horoscopeTraitsFrequency > 0.1 || 
      (usageStats.horoscope && usageStats.horoscope > 5);
    
    const confidence = Math.min(horoscopeFrequency * 100, 80);
    
    return { suggestsHoroscopeTraits, confidence };
  } catch (error) {
    console.warn('用户行为分析失败:', error);
    return { suggestsHoroscopeTraits: false, confidence: 0 };
  }
};

/**
 * 在空闲时间预加载资源（安全版本，避免阻塞）
 * 使用 requestIdleCallback 或 setTimeout
 */
export const preloadOnIdle = () => {
  if (typeof window === 'undefined') return;

  const startPreload = () => {
    console.log('系统空闲，开始预加载 horoscope-traits 资源');
    preloadHoroscopeTraits().catch((error) => {
      // 静默处理错误，预加载失败不影响主流程
      if (process.env.NODE_ENV === 'development') {
        console.warn('horoscope-traits 预加载失败（不影响应用）:', error);
      }
    });
  };

  // 增加延迟，确保应用完全启动并稳定后再预加载
  // 使用更长的时间（5秒）来确保不会阻塞核心功能
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startPreload, { timeout: 10000 });
  } else {
    // 降级到延迟执行，使用更长的延迟
    setTimeout(startPreload, 5000);
  }
};

/**
 * 根据路由变化预加载相关资源
 * @param {string} currentPath - 当前路由路径
 */
export const preloadBasedOnRoute = (currentPath) => {
  // 如果用户访问了星座相关页面（非首页），预加载 horoscope-traits
  // 排除首页，避免首页加载时的性能影响
  if (currentPath !== '/' && currentPath.includes('horoscope') && !currentPath.includes('horoscope-traits')) {
    console.log('用户访问星座页面，预加载 horoscope-traits 资源');
    preloadHoroscopeTraits().catch(() => {
      // 忽略错误
    });
  }
};

/**
 * 获取预加载状态
 */
export const getPreloadStatus = () => {
  return { ...preloadState };
};

/**
 * 重置预加载状态（用于测试或错误恢复）
 */
export const resetPreloadState = () => {
  preloadState = {
    attempted: false,
    success: false,
    error: null,
    loading: false,
    lastAttemptTime: null,
    retryCount: 0
  };
  console.log('horoscope-traits 预加载状态已重置');
};

/**
 * 初始化用户行为跟踪
 */
export const initializeUserTracking = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    // 初始化导航历史记录
    if (!window.localStorage.getItem('userNavigationHistory')) {
      window.localStorage.setItem('userNavigationHistory', JSON.stringify([]));
    }
    
    // 初始化功能使用统计
    if (!window.localStorage.getItem('featureUsageStats')) {
      window.localStorage.setItem('featureUsageStats', JSON.stringify({}));
    }
    
    // 初始化资源预加载历史
    if (!window.localStorage.getItem('resourcePreloadHistory')) {
      window.localStorage.setItem('resourcePreloadHistory', JSON.stringify([]));
    }
    
    // 初始化资源预加载错误记录
    if (!window.localStorage.getItem('resourcePreloadErrors')) {
      window.localStorage.setItem('resourcePreloadErrors', JSON.stringify([]));
    }
    
    console.log('用户行为跟踪已初始化');
  } catch (error) {
    console.warn('用户行为跟踪初始化失败:', error);
  }
};

// 防抖控制：避免频繁调用导航跟踪
let navigationTrackTimer = null;
const NAVIGATION_TRACK_DEBOUNCE = 300; // 300ms

/**
 * 记录用户导航行为（安全版本，避免阻塞）
 * @param {string} path - 导航路径
 * @param {string} from - 来源路径
 */
export const trackUserNavigation = (path, from = '') => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  // 清除之前的定时器
  if (navigationTrackTimer) {
    clearTimeout(navigationTrackTimer);
  }

  // 使用防抖延迟执行，避免频繁调用
  navigationTrackTimer = setTimeout(() => {
    try {
      // 只在非首页进行详细的导航跟踪，避免首页性能影响
      if (path === '/') {
        // 首页只做最小化的日志记录，不操作localStorage
        if (process.env.NODE_ENV === 'development') {
          console.log('导航到首页，跳过详细跟踪');
        }
        return;
      }

      const history = JSON.parse(
        window.localStorage.getItem('userNavigationHistory') || '[]'
      );

      history.push({
        path,
        from,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });

      // 保持历史记录大小可控（最近100条记录）
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      window.localStorage.setItem('userNavigationHistory', JSON.stringify(history));

      // 记录功能使用统计
      const stats = JSON.parse(
        window.localStorage.getItem('featureUsageStats') || '{}'
      );

      // 根据路径提取功能名称
      const featureName = extractFeatureNameFromPath(path);
      if (featureName) {
        stats[featureName] = (stats[featureName] || 0) + 1;
        window.localStorage.setItem('featureUsageStats', JSON.stringify(stats));
      }
    } catch (error) {
      // 静默处理错误，不影响核心功能
      if (process.env.NODE_ENV === 'development') {
        console.warn('用户导航跟踪失败:', error);
      }
    }
  }, NAVIGATION_TRACK_DEBOUNCE);
};

/**
 * 从路径中提取功能名称
 */
const extractFeatureNameFromPath = (path) => {
  const segments = path.split('/').filter(segment => segment.trim() !== '');
  
  if (segments.length === 0) return 'home';
  
  // 特殊处理一些功能名称
  if (path.includes('horoscope-traits')) return 'horoscope-traits';
  if (path.includes('horoscope')) return 'horoscope';
  if (path.includes('bazi')) return 'bazi';
  if (path.includes('biorhythm')) return 'biorhythm';
  
  return segments[segments.length - 1];
};

/**
 * 立即开始预加载（最高优先级）
 * 用于关键场景，如用户即将访问该页面
 */
export const immediatePreload = () => {
  console.log('立即开始预加载 horoscope-traits 资源（最高优先级）');
  return preloadHoroscopeTraits();
};

/**
 * 设置预加载启用状态
 * @param {boolean} enabled - 是否启用预加载
 */
export const setPreloadEnabled = (enabled) => {
  isPreloadEnabled = enabled;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PRELOAD_CONFIG_KEY, enabled.toString());
    }
  } catch (error) {
    console.warn('保存预加载配置失败:', error);
  }

  console.log(`horoscope-traits 预加载已${enabled ? '启用' : '禁用'}`);
};

/**
 * 检查预加载是否启用
 * @returns {boolean} 是否启用预加载
 */
export const isPreloadEnabledCheck = () => isPreloadEnabled;

export default {
  preloadHoroscopeTraits,
  intelligentPreload,
  preloadOnIdle,
  preloadBasedOnRoute,
  getPreloadStatus,
  resetPreloadState,
  initializeUserTracking,
  trackUserNavigation,
  immediatePreload,
  setPreloadEnabled,
  isPreloadEnabledCheck
};