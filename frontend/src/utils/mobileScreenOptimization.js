/**
 * 移动屏幕优化工具函数
 * 专门针对 9:16 比例的手机屏幕进行优化
 */

/**
 * 检测是否为 9:16 比例的屏幕
 * @returns {boolean} 是否为 9:16 比例
 */
export const isNineSixteenScreen = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  return aspectRatio >= 0.55 && aspectRatio <= 0.57; // 9:16 比例范围
};

/**
 * 获取屏幕类型
 * @returns {string} 屏幕类型 (mobile, tablet, desktop)
 */
export const getScreenType = () => {
  const width = window.innerWidth;
  if (width <= 768) {
    return 'mobile';
  } else if (width <= 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * 获取触摸目标最小尺寸
 * @param {boolean} isMobile 是否为移动设备
 * @returns {number} 最小触摸目标尺寸 (px)
 */
export const getMinTouchTargetSize = (isMobile = true) => {
  return isMobile ? 44 : 32; // 移动设备最小 44px，桌面 32px
};

/**
 * 检查元素是否在屏幕内
 * @param {Element} element DOM 元素
 * @param {boolean} isMobile 是否为移动设备
 * @returns {boolean} 是否在屏幕内
 */
export const isElementInViewport = (element, isMobile = true) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const touchTargetSize = getMinTouchTargetSize(isMobile);
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - touchTargetSize &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * 优化触摸目标大小
 * @param {Element} element DOM 元素
 * @param {boolean} isMobile 是否为移动设备
 */
export const optimizeTouchTarget = (element, isMobile = true) => {
  const minSize = getMinTouchTargetSize(isMobile);
  
  if (element) {
    const currentWidth = element.offsetWidth;
    const currentHeight = element.offsetHeight;
    
    // 如果元素小于最小触摸目标，则放大
    if (currentWidth < minSize || currentHeight < minSize) {
      const newSize = Math.max(currentWidth, currentHeight, minSize);
      element.style.minWidth = `${newSize}px`;
      element.style.minHeight = `${newSize}px`;
    }
  }
};

/**
 * 检查布局是否需要优化（避免换行）
 * @param {Element} container 容器元素
 * @returns {boolean} 是否需要优化
 */
export const needsLayoutOptimization = (container) => {
  if (!container) return false;
  
  const containerWidth = container.offsetWidth;
  const children = container.children;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.offsetWidth > containerWidth * 0.9) {
      return true; // 子元素宽度超过容器 90%，需要优化
    }
  }
  
  return false;
};

/**
 * 优化布局避免换行
 * @param {Element} container 容器元素
 */
export const optimizeLayoutForMobile = (container) => {
  if (!container || !needsLayoutOptimization(container)) return;
  
  const children = container.children;
  const containerWidth = container.offsetWidth;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childWidth = child.offsetWidth;
    
    // 如果子元素太宽，调整其宽度
    if (childWidth > containerWidth * 0.9) {
      child.style.flex = '0 0 auto'; // 防止 flex 缩放
      child.style.width = 'auto'; // 允许内容换行
      
      // 检查是否有内部元素可以优化
      const grandChildren = child.children;
      for (let j = 0; j < grandChildren.length; j++) {
        const grandChild = grandChildren[j];
        if (grandChild && grandChild.offsetWidth > containerWidth * 0.8) {
          grandChild.style.flexWrap = 'nowrap'; // 防止内部换行
          grandChild.style.overflow = 'hidden'; // 隐藏溢出
        }
      }
    }
  }
};

/**
 * 添加移动屏幕优化监听器
 */
export const addMobileOptimizationListener = () => {
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    const isMobile = getScreenType() === 'mobile';
    const container = document.querySelector('.mobile-optimization-container');
    
    if (container) {
      optimizeLayoutForMobile(container);
      
      // 优化所有触摸目标
      const touchTargets = container.querySelectorAll('.touch-target');
      touchTargets.forEach(element => {
        optimizeTouchTarget(element, isMobile);
      });
    }
  });
  
  // 初始优化
  const isMobile = getScreenType() === 'mobile';
  const container = document.querySelector('.mobile-optimization-container');
  
  if (container) {
    optimizeLayoutForMobile(container);
    
    // 优化所有触摸目标
    const touchTargets = container.querySelectorAll('.touch-target');
    touchTargets.forEach(element => {
      optimizeTouchTarget(element, isMobile);
    });
  }
};

/**
 * 移除移动屏幕优化监听器
 */
export const removeMobileOptimizationListener = () => {
  window.removeEventListener('resize', () => {});
};

/**
 * 检查元素可读性
 * @param {Element} element DOM 元素
 * @param {boolean} isMobile 是否为移动设备
 * @returns {boolean} 是否可读
 */
export const isElementReadable = (element, isMobile = true) => {
  if (!element) return false;
  
  const fontSize = window.getComputedStyle(element).fontSize;
  const minFontSize = isMobile ? 14 : 12; // 移动设备最小 14px，桌面 12px
  
  return parseFloat(fontSize) >= minFontSize;
};

/**
 * 优化元素可读性
 * @param {Element} element DOM 元素
 * @param {boolean} isMobile 是否为移动设备
 */
export const optimizeReadability = (element, isMobile = true) => {
  const minFontSize = isMobile ? 14 : 12;
  
  if (element) {
    const currentFontSize = parseFloat(window.getComputedStyle(element).fontSize);
    
    if (currentFontSize < minFontSize) {
      element.style.fontSize = `${minFontSize}px`;
    }
  }
};

/**
 * 检查性能指标
 * @returns {object} 性能指标
 */
export const checkPerformanceMetrics = () => {
  return {
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    fps: 60, // 假设 60fps，实际需要测量
    memoryUsage: (performance.memory || {}).usedJSHeapSize || 0,
    batteryLevel: navigator.getBattery ? navigator.getBattery().then(battery => battery.level) : Promise.resolve(1)
  };
};

export default {
  isNineSixteenScreen,
  getScreenType,
  getMinTouchTargetSize,
  isElementInViewport,
  optimizeTouchTarget,
  needsLayoutOptimization,
  optimizeLayoutForMobile,
  addMobileOptimizationListener,
  removeMobileOptimizationListener,
  isElementReadable,
  optimizeReadability,
  checkPerformanceMetrics
};