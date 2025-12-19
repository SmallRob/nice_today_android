/**
 * 性能优化工具函数
 * 针对移动端优化运行效率，避免卡顿
 */

// 防抖函数 - 减少不必要的函数调用
const debounce = (func, wait) => {
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

// 节流函数 - 限制函数调用频率
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 内存优化 - 清理不必要的数据
const optimizeMemory = () => {
  // 清理过期的缓存数据
  const now = Date.now();
  const cacheKeys = Object.keys(localStorage);
  
  cacheKeys.forEach(key => {
    if (key.startsWith('horoscope_cache_') || key.startsWith('soul_question_')) {
      try {
        const cachedData = JSON.parse(localStorage.getItem(key));
        if (cachedData && cachedData.expiry && cachedData.expiry < now) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // 如果解析失败，直接删除
        localStorage.removeItem(key);
      }
    }
  });
};

// 图片懒加载优化
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// 虚拟滚动优化 - 处理大量列表数据
const virtualScroll = (container, items, itemHeight, renderItem) => {
  let visibleItems = [];
  let startIndex = 0;
  let endIndex = 0;
  
  const updateVisibleItems = () => {
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    startIndex = Math.floor(scrollTop / itemHeight);
    endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    visibleItems = items.slice(startIndex, endIndex);
    
    // 更新容器高度以支持滚动
    container.style.height = `${items.length * itemHeight}px`;
    
    // 渲染可见项
    renderItem(visibleItems, startIndex * itemHeight);
  };
  
  container.addEventListener('scroll', throttle(updateVisibleItems, 16));
  updateVisibleItems();
  
  return {
    updateItems: (newItems) => {
      items = newItems;
      updateVisibleItems();
    }
  };
};

// 移动端性能优化配置
const mobileOptimization = {
  // 减少动画复杂度
  reduceAnimationComplexity: () => {
    // 使用更简单的CSS动画
    const style = document.createElement('style');
    style.textContent = `
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* 优化移动端滚动性能 */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* 减少重绘重排 */
      .will-change-transform {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  },
  
  // 优化字体渲染
  optimizeFontRendering: () => {
    // 添加字体渲染优化
    document.body.style.fontFeatureSettings = 'kern';
    document.body.style.fontKerning = 'normal';
    document.body.style.textRendering = 'optimizeLegibility';
  },
  
  // 触摸事件优化
  optimizeTouchEvents: () => {
    // 添加触摸事件优化
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  },
  
  // 移动端视口优化
  optimizeViewport: () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }
};

// 性能监控
const performanceMonitor = {
  startTime: 0,
  
  start: () => {
    performanceMonitor.startTime = performance.now();
  },
  
  end: (operationName) => {
    const endTime = performance.now();
    const duration = endTime - performanceMonitor.startTime;
    
    if (duration > 100) {
      console.warn(`性能警告: ${operationName} 耗时 ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },
  
  // 监控内存使用
  monitorMemory: () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      
      if (usedMB > 50) {
        console.warn(`内存使用警告: ${usedMB}MB / ${totalMB}MB`);
        optimizeMemory();
      }
    }
  }
};

// 初始化性能优化
const initializePerformanceOptimization = () => {
  // 移动端优化
  mobileOptimization.reduceAnimationComplexity();
  mobileOptimization.optimizeFontRendering();
  mobileOptimization.optimizeTouchEvents();
  mobileOptimization.optimizeViewport();
  
  // 内存优化
  optimizeMemory();
  
  // 定期清理内存
  setInterval(optimizeMemory, 300000); // 每5分钟清理一次
  
  // 监控内存使用
  setInterval(performanceMonitor.monitorMemory, 60000); // 每分钟检查一次
  
  console.log('性能优化已初始化');
};

export {
  debounce,
  throttle,
  optimizeMemory,
  lazyLoadImages,
  virtualScroll,
  mobileOptimization,
  performanceMonitor,
  initializePerformanceOptimization
};