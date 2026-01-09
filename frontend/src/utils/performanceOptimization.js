/**
 * 性能优化工具函数
 * 用于优化移动设备的性能和用户体验
 */

/**
 * 懒加载图片
 * @param {string} src 图片URL
 * @param {Function} onLoad 加载完成回调
 * @param {Function} onError 加载失败回调
 */
export const lazyLoadImage = (src, onLoad, onError) => {
  const img = new Image();
  img.loading = 'lazy'; // 浏览器原生懒加载
  
  img.onload = () => {
    if (onLoad) onLoad(img);
  };
  
  img.onerror = () => {
    if (onError) onError();
  };
  
  img.src = src;
  return img;
};

/**
 * 检查元素是否在视口中（用于懒加载）
 * @param {Element} element DOM元素
 * @returns {boolean} 是否在视口中
 */
export const isInViewport = (element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * 使用 Intersection Observer 实现懒加载
 * @param {Element} target 目标元素
 * @param {Function} callback 回调函数
 * @param {Object} options 配置选项
 * @returns {IntersectionObserver} 观察者实例
 */
export const createLazyLoadObserver = (target, callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px', // 提前 50px 开始加载
    threshold: 0.1,     // 10% 可见时开始加载
    ...options
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (callback) callback(entry.target, entry);
        observer.unobserve(entry.target); // 加载后停止观察
      }
    });
  }, defaultOptions);
  
  if (target) {
    observer.observe(target);
  }
  
  return observer;
};

/**
 * 预加载关键资源
 * @param {Array} resources 资源URL数组
 * @param {string} type 资源类型 (image, script, style)
 */
export const preloadResources = (resources, type = 'image') => {
  if (!Array.isArray(resources) || resources.length === 0) return;
  
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = resource;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, wait = 200) => {
  let timeout;
  let previous = 0;
  
  return function executedFunction(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

/**
 * 性能监控
 * @returns {Object} 性能指标
 */
export const measurePerformance = () => {
  if (!window.performance) return null;
  
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const resources = performance.getEntriesByType('resource');
  
  return {
    // 页面加载时间
    loadTime: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
    
    // DOM 解析时间
    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.startTime : 0,
    
    // 首次内容绘制时间
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // 首次绘制时间
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    
    // 资源加载时间
    resourceLoadTime: resources.map(r => ({
      name: r.name,
      duration: r.duration,
      size: r.transferSize
    })),
    
    // 总资源大小
    totalResourceSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
  };
};

/**
 * 清理性能指标
 */
export const clearPerformanceMetrics = () => {
  if (window.performance) {
    performance.clearMarks();
    performance.clearMeasures();
  }
};

/**
 * 长任务检测
 * @param {Function} callback 长任务检测回调
 * @returns {PerformanceObserver} 观察者实例
 */
export const detectLongTasks = (callback) => {
  if (!window.PerformanceObserver) return null;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.duration > 50) { // 超过 50ms 认为是长任务
        if (callback) callback(entry);
      }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.warn('Long Task API not supported');
  }
  
  return observer;
};

/**
 * 内存使用监控
 * @returns {Object} 内存使用信息
 */
export const checkMemoryUsage = () => {
  if (!window.performance || !performance.memory) {
    return null;
  }
  
  const memory = performance.memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
};

/**
 * 使用 requestAnimationFrame 优化动画
 * @param {Function} callback 动画回调
 * @returns {Function} 优化后的动画函数
 */
export const optimizeAnimation = (callback) => {
  let frameId;
  
  const animate = (timestamp) => {
    if (callback) callback(timestamp);
    frameId = requestAnimationFrame(animate);
  };
  
  const start = () => {
    frameId = requestAnimationFrame(animate);
  };
  
  const stop = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
  
  return { start, stop };
};

/**
 * 虚拟列表实现（用于长列表优化）
 * @param {Array} items 列表数据
 * @param {number} itemHeight 每个项的高度
 * @param {number} containerHeight 容器高度
 * @param {number} scrollTop 滚动位置
 * @returns {Object} 可见项信息
 */
export const virtualList = (items, itemHeight, containerHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY
  };
};

/**
 * 图片压缩
 * @param {File} file 图片文件
 * @param {Object} options 压缩选项
 * @returns {Promise} 压缩后的图片
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.8,
      type = 'image/jpeg'
    } = options;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = img;
        
        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * 缓存策略
 * @param {string} key 缓存键
 * @param {any} data 缓存数据
 * @param {number} ttl 缓存时间（毫秒）
 */
export const cacheData = (key, data, ttl = 300000) => { // 默认 5 分钟
  const cacheItem = {
    data,
    timestamp: Date.now(),
    ttl
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (e) {
    console.warn('Cache failed:', e);
  }
};

/**
 * 获取缓存数据
 * @param {string} key 缓存键
 * @returns {any} 缓存数据或 null
 */
export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const cacheItem = JSON.parse(cached);
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (e) {
    console.warn('Cache read failed:', e);
    return null;
  }
};

/**
 * 清理过期缓存
 */
export const clearExpiredCache = () => {
  const now = Date.now();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached);
          if (now - cacheItem.timestamp > cacheItem.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Cache cleanup failed for key:', key, e);
      }
    }
  }
};

/**
 * 初始化性能优化（兼容旧代码）
 */
export const initializePerformanceOptimization = () => {
  console.log('Performance optimization initialized');
  // 这里可以添加实际的性能优化初始化逻辑
  // 为了向后兼容，我们保持这个空函数
};

export default {
  lazyLoadImage,
  isInViewport,
  createLazyLoadObserver,
  preloadResources,
  debounce,
  throttle,
  measurePerformance,
  clearPerformanceMetrics,
  detectLongTasks,
  checkMemoryUsage,
  optimizeAnimation,
  virtualList,
  compressImage,
  cacheData,
  getCachedData,
  clearExpiredCache,
  initializePerformanceOptimization
};