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
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* 玛雅历法顶部标题区域 */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-800 shadow-sm border-b border-amber-200 dark:border-amber-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">玛雅历法</h1>
          <p className="text-sm text-amber-100 dark:text-amber-200 mt-1">探索古老的玛雅智慧</p>
        </div>
      </div>
      
      {/* 标签导航 */}
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
      
      {/* 内容区域 */}
      <div
        ref={containerRef}
        className="container mx-auto px-4 py-4 max-w-4xl"
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