import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { lazy, Suspense } from 'react';
import '../index.css';

// 优化的懒加载组件预加载策略
let MayaCalendarPromise;
let MayaBirthChartPromise;

const preloadMayaCalendar = () => {
  if (!MayaCalendarPromise) {
    MayaCalendarPromise = import('../components/MayaCalendarTab');
  }
  return MayaCalendarPromise;
};

const preloadMayaBirthChart = () => {
  if (!MayaBirthChartPromise) {
    MayaBirthChartPromise = import('../components/MayaBirthChart_optimized');
  }
  return MayaBirthChartPromise;
};

// 懒加载组件并预加载
const MayaCalendar = lazy(() => preloadMayaCalendar());
const MayaBirthChart = lazy(() => preloadMayaBirthChart());

// 优化的加载组件 - 玛雅风格
const TabContentLoader = memo(() => (
  <div className="flex justify-center items-center py-12">
    <div className="relative">
      {/* 玛雅太阳轮加载动画 */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500 dark:border-amber-600 dark:border-t-amber-400"></div>
      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-orange-300 dark:border-orange-500"></div>
    </div>
    <span className="ml-4 text-amber-700 dark:text-amber-300 font-medium">正在连接古老的玛雅智慧...</span>
  </div>
));

// 使用memo优化Tab按钮组件 - 玛雅风格
const TabButton = memo(({ 
  isActive, 
  onClick, 
  children 
}) => (
  <button
    className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${
      isActive
        ? 'bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 text-white shadow-lg transform scale-105'
        : 'text-amber-800 dark:text-amber-200 bg-white/80 dark:bg-gray-700/80 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-900 dark:hover:text-amber-100'
    }`}
    onClick={onClick}
  >
    {/* 玛雅纹样装饰 */}
    {isActive && (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-400/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-yellow-300"></div>
      </>
    )}
    <span className="relative z-10 font-semibold">{children}</span>
  </button>
));

// 优化的返回按钮组件 - 玛雅风格
const BackButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="text-sm text-amber-700 dark:text-amber-300 flex items-center hover:text-amber-900 dark:hover:text-amber-100 transition-colors duration-200 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/50"
  >
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    返回历法
  </button>
));

// 主组件 - 使用memo优化性能
const MayaPage = memo(() => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showBirthChart, setShowBirthChart] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollState, setScrollState] = useState({
    isBannerVisible: true,
    isMenuFixed: false,
    scrollY: 0,
    lastScrollY: 0
  });
  
  // 使用useRef管理不需要触发重渲染的状态
  const timeoutRef = React.useRef(null);
  const bannerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const scrollThresholdRef = React.useRef(0);
  
  // 优化的显示出生图函数
  const handleShowBirthChart = useCallback(() => {
    // 使用requestIdleCallback推迟非紧急状态更新
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setShowBirthChart(true);
        setActiveTab('birthChart');
      }, { timeout: 300 });
    } else {
      // 降级到setTimeout
      setTimeout(() => {
        setShowBirthChart(true);
        setActiveTab('birthChart');
      }, 0);
    }
  }, []);

  // 优化的返回历法函数
  const handleBackToCalendar = useCallback(() => {
    // 使用requestIdleCallback推迟非紧急状态更新
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setShowBirthChart(false);
        setActiveTab('calendar');
      }, { timeout: 300 });
    } else {
      // 降级到setTimeout
      setTimeout(() => {
        setShowBirthChart(false);
        setActiveTab('calendar');
      }, 0);
    }
  }, []);

  // 滚动事件处理函数 - 防抖优化
  const handleScroll = useCallback(() => {
    if (!bannerRef.current || !menuRef.current) return;
    
    const currentScrollY = window.scrollY;
    const bannerHeight = bannerRef.current.offsetHeight;
    const menuHeight = menuRef.current.offsetHeight;
    
    // 计算滚动阈值 - banner高度减去菜单高度，确保最小值为0
    if (scrollThresholdRef.current === 0) {
      scrollThresholdRef.current = Math.max(0, bannerHeight - menuHeight);
    }
    
    const threshold = scrollThresholdRef.current;
    
    setScrollState(prev => {
      // 使用更精确的滚动方向判断，避免小幅度抖动
      const scrollDelta = currentScrollY - prev.lastScrollY;
      const isScrollingDown = scrollDelta > 2; // 设置最小滚动阈值
      const isScrollingUp = scrollDelta < -2;
      
      let newState = { 
        ...prev, 
        scrollY: currentScrollY, 
        lastScrollY: currentScrollY 
      };
      
      // 滚动到顶部时确保banner显示，菜单不固定
      if (currentScrollY <= 0) {
        newState.isMenuFixed = false;
        newState.isBannerVisible = true;
        return newState;
      }
      
      // 向下滚动：当滚动超过阈值时固定菜单，隐藏banner
      if (isScrollingDown && currentScrollY > threshold) {
        newState.isMenuFixed = true;
        newState.isBannerVisible = false;
      }
      
      // 向上滚动：当滚动回到阈值位置时显示banner，取消固定
      if (isScrollingUp && currentScrollY <= threshold) {
        newState.isMenuFixed = false;
        newState.isBannerVisible = true;
      }
      
      return newState;
    });
  }, []);

  // 防抖滚动处理函数
  const debouncedScrollHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleScroll();
    }, 16); // 约60fps的帧率
  }, [handleScroll]);

  // 组件挂载时的优化加载
  useEffect(() => {
    // 预加载两个组件以提升切换性能
    preloadMayaCalendar();
    preloadMayaBirthChart();
    
    // 使用较短的延迟时间，提升用户体验
    timeoutRef.current = setTimeout(() => {
      setIsLoaded(true);
      
      // 组件加载完成后设置滚动阈值
      setTimeout(() => {
        if (bannerRef.current && menuRef.current) {
          const bannerHeight = bannerRef.current.offsetHeight;
          const menuHeight = menuRef.current.offsetHeight;
          scrollThresholdRef.current = Math.max(0, bannerHeight - menuHeight);
          
          // 初始状态检查
          if (window.scrollY > scrollThresholdRef.current) {
            setScrollState(prev => ({
              ...prev,
              isMenuFixed: true,
              isBannerVisible: false,
              scrollY: window.scrollY,
              lastScrollY: window.scrollY
            }));
          }
        }
      }, 100);
    }, 200);
    
    // 添加防抖滚动事件监听
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    // 窗口大小变化时重新计算阈值
    const handleResize = () => {
      if (bannerRef.current && menuRef.current) {
        const bannerHeight = bannerRef.current.offsetHeight;
        const menuHeight = menuRef.current.offsetHeight;
        scrollThresholdRef.current = Math.max(0, bannerHeight - menuHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('scroll', debouncedScrollHandler);
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedScrollHandler]);

  // 优化的Tab切换区域 - 玛雅风格
  const TabNavigation = useMemo(() => (
    <div className="flex space-x-2 p-1 bg-gradient-to-r from-amber-200/50 to-orange-200/50 dark:from-amber-800/30 dark:to-orange-800/30 rounded-lg border border-amber-300/50 dark:border-amber-600/30">
      <TabButton
        isActive={activeTab === 'calendar'}
        onClick={handleBackToCalendar}
      >
        玛雅历法
      </TabButton>
      <TabButton
        isActive={activeTab === 'birthChart'}
        onClick={handleShowBirthChart}
      >
        出生星盘
      </TabButton>
    </div>
  ), [activeTab, handleBackToCalendar, handleShowBirthChart]);

  // 优化的内容渲染 - 添加组件预加载和性能优化
  const renderContent = useMemo(() => {
    // 使用CSS过渡而不是JS动画，提升性能
    const contentClass = "animate-fadeIn";
    
    if (activeTab === 'calendar') {
      return (
        <div className={contentClass}>
          <Suspense fallback={<TabContentLoader />}>
            <MayaCalendar onShowBirthChart={handleShowBirthChart} />
          </Suspense>
        </div>
      );
    }
    
    if (activeTab === 'birthChart') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg border-2 border-amber-200 dark:border-amber-700 overflow-hidden">
            {/* 玛雅星盘标题栏 */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">玛雅出生星盘</h2>
              <BackButton onClick={handleBackToCalendar} />
            </div>
            <div className="p-4">
              <div className={contentClass}>
                <Suspense fallback={<TabContentLoader />}>
                  <MayaBirthChart />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }, [activeTab, handleShowBirthChart, handleBackToCalendar]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden safe-area-inset-top optimized-scroll performance-optimized"
    >
      {/* 玛雅金字塔背景装饰 */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-600 dark:to-orange-700 rounded-lg transform rotate-45"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 dark:from-amber-700 dark:to-orange-800 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-orange-200 to-amber-300 dark:from-orange-600 dark:to-amber-700 rounded-lg transform -rotate-15"></div>
      </div>

      {/* 玛雅传统纹样边框 */}
      <div className="absolute inset-0 border-8 border-transparent pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent dark:via-amber-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent dark:via-orange-600"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-yellow-500 to-transparent dark:via-yellow-600"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-500 to-transparent dark:via-red-600"></div>
      </div>

      {/* 神秘光影效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-yellow-600 dark:to-red-700 rounded-full filter blur-2xl opacity-15 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-orange-300 to-amber-400 dark:from-orange-500 dark:to-amber-600 rounded-full filter blur-xl opacity-25 animate-ping"></div>
      </div>

      <div className="relative z-10">
        {/* 玛雅历法顶部标题区域 - 可折叠banner */}
        <div 
          ref={bannerRef}
          className={`bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-800 relative overflow-hidden transition-all duration-300 ease-in-out ${
            scrollState.isBannerVisible 
              ? 'translate-y-0 opacity-100 pt-8 pb-6' 
              : '-translate-y-full opacity-0 h-0'
          }`}
        >
          {/* 玛雅象形文字装饰 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 text-2xl text-white font-mono">☀️</div>
            <div className="absolute top-4 right-4 text-2xl text-white font-mono">🌙</div>
            <div className="absolute bottom-4 left-4 text-2xl text-white font-mono">⭐</div>
            <div className="absolute bottom-4 right-4 text-2xl text-white font-mono">🌀</div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            {/* 玛雅历法主标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative">
              <span className="bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">玛雅历法</span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full"></div>
            </h1>
            
            {/* 副标题 */}
            <p className="text-base md:text-lg text-amber-100 mb-3 italic">探索古老的玛雅智慧</p>
            
            {/* 玛雅太阳历装饰 */}
            <div className="flex justify-center items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 animate-spin"></div>
              <div className="text-xs text-amber-200 font-medium">太阳历 · 神圣周期 · 宇宙能量</div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Tab切换按钮 - 智能固定 */}
            <div 
              ref={menuRef}
              className={`z-30 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-xl shadow-lg border-2 border-amber-200 dark:border-amber-800 p-2 transition-all duration-300 ${
                scrollState.isMenuFixed 
                  ? 'fixed top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl mt-0 shadow-xl menu-fixed-safe' 
                  : 'relative'
              }`}
              style={scrollState.isMenuFixed ? {
                top: 'max(var(--safe-area-inset-top), env(safe-area-inset-top))'
              } : {}}
            >
              {TabNavigation}
            </div>

            {/* 滚动阈值检测器 - 用于精确计算 */}
            <div 
              className="scroll-threshold-detector" 
              style={{ 
                top: scrollThresholdRef.current + 'px',
                backgroundColor: 'transparent' 
              }}
            />

            {/* 内容区域 - 优化滚动性能 */}
            <div className={`optimized-scroll overflow-y-auto transition-all duration-300 ${
              scrollState.isMenuFixed 
                ? 'content-adjust-for-fixed-menu' 
                : ''
            }`}>
              {renderContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MayaPage.displayName = 'MayaPage';

export default MayaPage;