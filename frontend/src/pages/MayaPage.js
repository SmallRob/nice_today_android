import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { lazy, Suspense } from 'react';
import PageLayout, { Card } from '../components/PageLayout';
import '../index.css';

// 懒加载组件以提升初始加载性能
const MayaCalendar = lazy(() => import('../components/MayaCalendar_optimized'));
const MayaBirthChart = lazy(() => import('../components/MayaBirthChart_optimized'));
const MayanTattoo = lazy(() => import('../components/MayanTattoo'));

// 优化的加载组件
const TabContentLoader = memo(() => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
    <span className="text-gray-600">加载中...</span>
  </div>
));

// 使用memo优化Tab按钮组件
const TabButton = memo(({ 
  isActive, 
  onClick, 
  children 
}) => (
  <button
    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
));

// 优化的返回按钮组件
const BackButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
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
  
  // 使用useRef管理不需要触发重渲染的状态
  const timeoutRef = React.useRef(null);
  
  // 优化的显示出生图函数
  const handleShowBirthChart = useCallback(() => {
    // 使用requestAnimationFrame确保平滑过渡
    requestAnimationFrame(() => {
      setShowBirthChart(true);
      setActiveTab('birthChart');
    });
  }, []);

  // 优化的返回历法函数
  const handleBackToCalendar = useCallback(() => {
    // 使用requestAnimationFrame确保平滑过渡
    requestAnimationFrame(() => {
      setShowBirthChart(false);
      setActiveTab('calendar');
    });
  }, []);

  // 组件挂载时的优化加载
  useEffect(() => {
    // 使用较短的延迟时间，提升用户体验
    timeoutRef.current = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 优化的显示图腾函数
  const handleShowTattoo = useCallback(() => {
    requestAnimationFrame(() => {
      setActiveTab('tattoo');
    });
  }, []);

  // 优化的Tab切换区域
  const TabNavigation = useMemo(() => (
    <Card padding="p-1">
      <div className="flex">
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
        <TabButton
          isActive={activeTab === 'tattoo'}
          onClick={handleShowTattoo}
        >
          玛雅图腾
        </TabButton>
      </div>
    </Card>
  ), [activeTab, handleBackToCalendar, handleShowBirthChart, handleShowTattoo]);

  // 优化的内容渲染
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
        <div className="space-y-4">
          <Card
            title="玛雅出生星盘"
            headerAction={<BackButton onClick={handleBackToCalendar} />}
          >
            <div className={contentClass}>
              <Suspense fallback={<TabContentLoader />}>
                <MayaBirthChart />
              </Suspense>
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === 'tattoo') {
      return (
        <div className={contentClass}>
          <Suspense fallback={<TabContentLoader />}>
            <MayanTattoo />
          </Suspense>
        </div>
      );
    }

    return null;
  }, [activeTab, handleShowBirthChart, handleBackToCalendar]);

  return (
    <PageLayout
      title="出生图腾"
      subtitle="探索古老的玛雅智慧"
      loading={!isLoaded}
      loadingMessage="正在加载玛雅历法..."
    >
      <div className="space-y-4">
        {/* Tab切换按钮 */}
        {TabNavigation}

        {/* 内容区域 */}
        {renderContent}
      </div>
    </PageLayout>
  );
});

// 添加显示名称，便于调试
MayaPage.displayName = 'MayaPage';

export default MayaPage;