import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { BiorhythmIcon, IconLibrary } from './IconLibrary';
import PageLayout from './PageLayout';
import DarkModeToggle from './DarkModeToggle';
import { useTabPerformance } from '../utils/tabPerformanceMonitor';
import '../styles/animations.css';

// 懒加载组件 - 提升初始加载性能
const BiorhythmTab = lazy(() => import('./BiorhythmTab'));
const ZodiacEnergyTab = lazy(() => import('./ZodiacEnergyTab'));
const HoroscopeTabNew = lazy(() => import('./HoroscopeTabNew'));
const MBTIPersonalityTabHome = lazy(() => import('./MBTIPersonalityTabHome'));
const MayaCalendarTab = lazy(() => import('./MayaCalendarTab'));

// 加载占位符组件
const TabLoadingPlaceholder = () => (
  <div className="flex justify-center items-center py-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">正在加载内容...</p>
    </div>
  </div>
);

// 错误边界组件
const ErrorBoundaryFallback = ({ error, resetError }) => (
  <div className="flex-1 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="text-4xl mb-3">❌</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        加载出错
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        {error?.message || '未知错误'}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        重试
      </button>
    </div>
  </div>
);

const BiorhythmDashboard = ({ appInfo = {} }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [serviceStatus, setServiceStatus] = useState({
    biorhythm: true
  });
  const [loadedTabs, setLoadedTabs] = useState(new Set(['biorhythm'])); // 预加载当前标签
  const [tabTransition, setTabTransition] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // 性能监控
  const { measureTabSwitch } = useTabPerformance();

  // 优化的内存管理：减少清理频率
  const cleanupUnusedTabs = useCallback((currentTab) => {
    // 仅在内存压力较大时清理，减少不必要的状态更新
    const shouldCleanup = performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024; // 超过50MB

    if (shouldCleanup) {
      setTimeout(() => {
        setLoadedTabs(prev => {
          const newSet = new Set(prev);
          // 保留当前标签和相邻标签
          const tabOrder = ['biorhythm', 'zodiac', 'horoscope', 'mbti'];
          const currentIndex = tabOrder.indexOf(currentTab);
          const tabsToKeep = [
            currentTab,
            tabOrder[currentIndex - 1],
            tabOrder[currentIndex + 1]
          ].filter(Boolean);

          // 仅清理长时间未使用的标签
          Array.from(newSet).forEach(tab => {
            if (!tabsToKeep.includes(tab)) {
              newSet.delete(tab);
            }
          });

          return newSet;
        });
      }, 10000); // 10秒后清理，减少频繁更新
    }
  }, []);

  // 错误处理函数
  const handleError = useCallback((error, context) => {
    console.error(`[${context}] 组件错误:`, error);
    setError(`加载失败: ${error.message || '未知错误'}`);

    // 如果错误严重，启用降级模式
    if (error.name === 'ChunkLoadError' || error.message?.includes('加载失败')) {
      setFallbackMode(true);
    }

    // 自动恢复机制
    setTimeout(() => {
      setError(null);
    }, 5000);
  }, []);

  // 降级模式组件
  const FallbackComponent = useCallback(() => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          功能暂时不可用
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          当前功能正在维护中，请稍后再试
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  ), []);

  // 检测服务状态
  const checkServiceStatus = async () => {
    setLoading(true);

    // 所有环境下的默认状态（本地化运行）
    setServiceStatus({
      biorhythm: true
    });

    setLoading(false);
  };

  // 优化的预加载策略
  const preloadAdjacentTabs = useCallback((currentTab) => {
    const tabOrder = ['biorhythm', 'zodiac', 'horoscope', 'mbti'];
    const currentIndex = tabOrder.indexOf(currentTab);

    if (currentIndex === -1) return;

    // 优先预加载紧邻标签，延迟预加载较远标签
    const immediateTabs = [
      tabOrder[currentIndex - 1],
      tabOrder[currentIndex + 1]
    ].filter(Boolean);

    // 立即预加载紧邻标签
    if (immediateTabs.length > 0) {
      setLoadedTabs(prev => {
        const newSet = new Set(prev);
        immediateTabs.forEach(tab => newSet.add(tab));
        return newSet;
      });
    }

    // 延迟预加载更远的标签
    const distantTabs = [
      tabOrder[currentIndex - 2],
      tabOrder[currentIndex + 2]
    ].filter(Boolean);

    if (distantTabs.length > 0) {
      setTimeout(() => {
        setLoadedTabs(prev => {
          const newSet = new Set(prev);
          distantTabs.forEach(tab => newSet.add(tab));
          return newSet;
        });
      }, 500);
    }
  }, []);

  // 高性能标签切换函数
  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return;

    // 性能监控
    const endMeasurement = measureTabSwitch(activeTab, tabId);

    // 立即更新活跃标签，不等待动画
    setActiveTab(tabId);

    // 标记新标签为已加载
    setLoadedTabs(prev => {
      const newSet = new Set(prev);
      newSet.add(tabId);
      return newSet;
    });

    // 异步处理其他任务，不阻塞UI更新
    requestAnimationFrame(() => {
      // 预加载相邻标签
      preloadAdjacentTabs(tabId);

      // 清理未使用的标签数据（延迟执行）
      setTimeout(() => cleanupUnusedTabs(tabId), 1000);

      // 结束性能测量
      if (endMeasurement) setTimeout(endMeasurement, 50);
    });

    // 轻量级切换效果（可选）
    setTabTransition(true);
    setTimeout(() => setTabTransition(false), 100);
  }, [activeTab, preloadAdjacentTabs, cleanupUnusedTabs, measureTabSwitch]);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      if (!isMounted) return;

      // 使用requestAnimationFrame确保流畅渲染
      requestAnimationFrame(async () => {
        if (!isMounted) return;
        await checkServiceStatus();
      });
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // 标签配置 - 添加生肖能量和星座运程标签
  const tabs = [
    {
      id: 'biorhythm',
      label: '生物节律',
      icon: BiorhythmIcon,
      description: '科学计算您的生物节律状态',
      color: 'blue'
    },
    {
      id: 'zodiac',
      label: '生肖能量',
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '根据生肖提供能量指引',
      color: 'purple'
    },
    {
      id: 'horoscope',
      label: '星座运程',
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      description: '根据星座提供运势指导',
      color: 'indigo'
    },
    {
      id: 'mbti',
      label: '人格魅力',
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: '探索16型人格的魅力与潜能',
      color: 'pink'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center transition-opacity duration-300">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 animate-fade-in">Nice Today</h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>正在为您准备个性化体验...</p>
          <div className="mt-4 flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      {/* Banner区域 - 参考穿衣指南样式 */}
      <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 flex-shrink-0">
        {/* 背景装饰 */}
        <div className="absolute inset-0 wuxing-gradient z-0 bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-indigo-700/30"></div>

        {/* 装饰符号 - 简化版 */}
        <div className="absolute top-2 left-2 w-12 h-12 opacity-15">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 应用图标 */}
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/nice_day.png"
                  alt="Nice Today"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* 备用图标 */}
                <svg className="w-6 h-6 text-white hidden" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nice Today</h1>
                <p className="text-blue-100 text-xs">您的个性化健康助手</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-white bg-opacity-20 rounded-full">
                每日更新
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页选择器 - 参考穿衣指南样式 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="container mx-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const colorMap = {
                'blue': 'text-blue-600 dark:text-blue-400',
                'purple': 'text-purple-600 dark:text-purple-400',
                'indigo': 'text-indigo-600 dark:text-indigo-400',
                'pink': 'text-pink-600 dark:text-pink-400'
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 py-3 px-2 text-center font-medium transition-all duration-300 relative ${
                    isActive
                      ? `${colorMap[tab.color]} bg-gray-50 dark:bg-gray-700`
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 ${colorMap[tab.color]}`}></div>
                  )}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className={`w-5 h-5 transition-colors duration-300 ${isActive ? colorMap[tab.color] : 'text-gray-400 dark:text-gray-500'}`}>
                      <tab.icon size={20} />
                    </div>
                    <span className="text-xs font-medium">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 内容展示区域 - 简化布局，移除不必要的容器嵌套 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized -webkit-overflow-scrolling-touch">
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="mb-4 mx-auto max-w-6xl h-full">
            {/* 错误显示 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* 标签内容 - 直接显示，不再包裹在额外的容器中 */}
            {fallbackMode ? (
              <FallbackComponent />
            ) : (
              <Suspense fallback={<TabLoadingPlaceholder />}>
                {activeTab === 'biorhythm' && loadedTabs.has('biorhythm') && (
                  <BiorhythmTab
                    serviceStatus={serviceStatus.biorhythm}
                    isDesktop={appInfo.isDesktop}
                    onError={(error) => handleError(error, 'BiorhythmTab')}
                  />
                )}
                {activeTab === 'zodiac' && loadedTabs.has('zodiac') && (
                  <ZodiacEnergyTab
                    onError={(error) => handleError(error, 'ZodiacEnergyTab')}
                  />
                )}
                {activeTab === 'maya' && loadedTabs.has('maya') && (
                  <MayaCalendarTab
                    onError={(error) => handleError(error, 'MayaCalendarTab')}
                  />
                )}
                {activeTab === 'horoscope' && loadedTabs.has('horoscope') && (
                  <HoroscopeTabNew
                    onError={(error) => handleError(error, 'HoroscopeTabNew')}
                  />
                )}
                {activeTab === 'mbti' && loadedTabs.has('mbti') && (
                  <MBTIPersonalityTabHome
                    onError={(error) => handleError(error, 'MBTIPersonalityTabHome')}
                  />
                )}
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmDashboard;