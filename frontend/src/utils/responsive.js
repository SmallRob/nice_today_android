/**
 * 屏幕适配工具类
 * 用于处理不同屏幕尺寸和方向的变化
 */

// 检测设备类型
export const isMobile = window.innerWidth <= 768;
export const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
export const isDesktop = window.innerWidth > 1024;

// 获取设备信息
export const getDeviceInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerWidth <= window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  };
};

// 计算响应式字体大小
export const getFontSize = (baseSize) => {
  const screenWidth = window.innerWidth;
  const baseWidth = 375; // iPhone 6/7/8宽度作为基准
  return (baseSize * screenWidth) / baseWidth;
};

// 计算响应式尺寸
export const getResponsiveSize = (baseSize) => {
  const screenWidth = window.innerWidth;
  const baseWidth = 375;
  return Math.round((baseSize * screenWidth) / baseWidth);
};

// 媒体查询辅助函数
export const mediaQuery = {
  // 移动设备
  mobile: window.matchMedia('(max-width: 768px)'),
  // 平板设备
  tablet: window.matchMedia('(min-width: 769px) and (max-width: 1024px)'),
  // 桌面设备
  desktop: window.matchMedia('(min-width: 1025px)'),
  // 横屏模式
  landscape: window.matchMedia('(orientation: landscape)'),
  // 竖屏模式
  portrait: window.matchMedia('(orientation: portrait)')
};

// 监听屏幕方向变化
export const addOrientationListener = (callback) => {
  const handleOrientationChange = () => {
    callback(getDeviceInfo());
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);

  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
  };
};

// 监听媒体查询变化
export const addMediaQueryListener = (query, callback) => {
  const mediaQueryList = mediaQuery[query];
  if (mediaQueryList) {
    const handleChange = (e) => callback(e.matches);
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }
};

// 安全区域适配（针对刘海屏等）
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
  };
};

// 应用安全区域CSS变量到根元素
export const applySafeAreaVariables = () => {
  const style = document.documentElement.style;
  
  // 这些值在实际设备中会被CSS环境变量覆盖
  style.setProperty('--safe-area-inset-top', '0px');
  style.setProperty('--safe-area-inset-right', '0px');
  style.setProperty('--safe-area-inset-bottom', '0px');
  style.setProperty('--safe-area-inset-left', '0px');
};

// 检测是否为全面屏设备
export const isAllScreenDevice = () => {
  // 通过屏幕比例简单判断是否为全面屏
  const { width, height } = getDeviceInfo();
  const ratio = Math.max(width, height) / Math.min(width, height);
  
  // 比例大于2.0的可能是全面屏设备
  return ratio > 2.0;
};

// 初始化屏幕适配
export const initResponsive = () => {
  // 应用安全区域变量
  applySafeAreaVariables();
  
  // 判断是否为移动设备
  if (isMobile || isTablet) {
    // 添加移动设备特有的样式
    document.body.classList.add('mobile-device');
    
    // 检测全面屏
    if (isAllScreenDevice()) {
      document.body.classList.add('all-screen');
    }
  }
  
  // 返回当前设备信息
  return getDeviceInfo();
};