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

// 简化的加载组件
const TabContentLoader = memo(() => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500 dark:border-amber-600 dark:border-t-amber-400"></div>
    <span className="ml-4 text-amber-700 dark:text-amber-300">正在加载...</span>
  </div>
));

// 主组件
const MayaPage = memo(() => {
  const [activeTab, setActiveTab] = useState('calendar');
  // 使用useRef管理不需要触发重渲染的状态
  const containerRef = React.useRef(null);

  // 显示出生图函数
  const handleShowBirthChart = useCallback(() => {
    setActiveTab('birthChart');
  }, []);

  // 返回历法函数
  const handleBackToCalendar = useCallback(() => {
    setActiveTab('calendar');
  }, []);



  // 组件挂载时预加载组件以提升切换性能
  useEffect(() => {
    preloadMayaCalendar();
    preloadMayaBirthChart();
  }, []);



  return (
    <div className="maya-scroll-container bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* 玛雅历法顶部标题区域 - 固定定位 */}
      <div className="maya-fixed-header bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-800 shadow-sm border-b border-amber-200 dark:border-amber-800 overflow-hidden">
        {/* 玛雅文化装饰元素 */}
        <div className="absolute inset-0 opacity-10">
          {/* 装饰性金字塔图案 */}
          <div className="absolute top-2 right-4 w-16 h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 80,70 20,70" fill="white" />
              <rect x="45" y="70" width="10" height="20" fill="white" />
            </svg>
          </div>
          
          {/* 装饰性太阳图案 */}
          <div className="absolute top-3 left-4 w-12 h-12">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="30" fill="white" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="5" />
              <line x1="50" y1="10" x2="50" y2="20" stroke="white" strokeWidth="3" />
              <line x1="50" y1="80" x2="50" y2="90" stroke="white" strokeWidth="3" />
              <line x1="10" y1="50" x2="20" y2="50" stroke="white" strokeWidth="3" />
              <line x1="80" y1="50" x2="90" y2="50" stroke="white" strokeWidth="3" />
              <line x1="25" y1="25" x2="32" y2="32" stroke="white" strokeWidth="3" />
              <line x1="75" y1="25" x2="68" y2="32" stroke="white" strokeWidth="3" />
              <line x1="25" y1="75" x2="32" y2="68" stroke="white" strokeWidth="3" />
              <line x1="75" y1="75" x2="68" y2="68" stroke="white" strokeWidth="3" />
            </svg>
          </div>
          
          {/* 装饰性羽蛇神图案 */}
          <div className="absolute bottom-1 right-20 w-14 h-14">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M20,50 Q40,30 60,50 T100,50" fill="none" stroke="white" strokeWidth="2" />
              <path d="M20,50 Q40,70 60,50 T100,50" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="20" cy="50" r="4" fill="white" />
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-center mb-1">
            <div className="w-8 h-8 mr-2 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-white">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" />
                <circle cx="50" cy="30" r="10" fill="currentColor" />
                <path d="M30,70 Q50,90 70,70" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">玛雅历法</h1>
          </div>
          <p className="text-sm text-amber-100 dark:text-amber-200 text-center">探索古老的玛雅智慧</p>
        </div>
      </div>
      
      {/* 标签导航 - 固定定位 */}
      <div className="maya-fixed-tabs">
        <div className="container mx-auto px-4 py-2">
          <div className="flex bg-amber-100 dark:bg-amber-900 rounded-lg p-1 max-w-md mx-auto">
            <button
              className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-colors ${activeTab === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100'
                }`}
              onClick={handleBackToCalendar}
            >
              玛雅历法
            </button>
            <button
              className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-colors ${activeTab === 'birthChart'
                ? 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100'
                }`}
              onClick={handleShowBirthChart}
            >
              出生星盘
            </button>
          </div>
        </div>
      </div>
      
      {/* 内容区域 - 优化滚动性能 */}
      <div
        ref={containerRef}
        className="maya-scroll-content container mx-auto px-4 py-4 max-w-4xl maya-scroll-optimized maya-scroll-stable"
      >
        {activeTab === 'calendar' && (
          <div>
            <Suspense fallback={<TabContentLoader />}>
              <MayaCalendar onShowBirthChart={handleShowBirthChart} />
            </Suspense>
          </div>
        )}
        
        {activeTab === 'birthChart' && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">玛雅出生星盘</h2>
                <button
                  onClick={handleBackToCalendar}
                  className="text-sm text-white flex items-center hover:text-amber-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  返回历法
                </button>
              </div>
              <div className="p-4">
                <Suspense fallback={<TabContentLoader />}>
                  <MayaBirthChart />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MayaPage.displayName = 'MayaPage';

export default MayaPage;