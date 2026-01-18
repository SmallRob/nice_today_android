import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BiorhythmIcon } from './IconLibrary';
import { useNavigate } from 'react-router-dom';
import { useTabPerformance } from '../utils/tabPerformanceMonitor';
import { isAndroidWebView, isIOSWebView } from '../utils/androidWebViewCompat';
import { globalErrorHandler, createDetailedErrorReport } from '../utils/errorHandler';
import '../styles/animations.css';
import '../styles/mobileOptimization.css';
import niceDayImage from '../images/nice_day.png';

// 错误回退组件（具名组件，满足React Hooks规则）
const LazyLoadErrorFallback = ({ componentName, fallbackMessage, error: loadError }) => {
  useEffect(() => {
    if (typeof loadError === 'function') {
      try {
        loadError();
      } catch (callbackError) {
        console.warn('错误回调执行失败:', callbackError);
      }
    }
  }, [loadError]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {componentName}加载失败
        </h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">
          {fallbackMessage || '模块加载失败，请刷新页面重试'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          刷新页面
        </button>
      </div>
    </div>
  );
};

// 使用懒加载组件，避免直接导入导致的初始化时序问题
// 修复：为Android WebView提供更健壮的懒加载错误处理
const createLazyComponent = (importFn, componentName, fallbackMessage) => {
  return React.lazy(() => {
    return importFn()
      .catch(err => {
        console.error(`${componentName} 加载失败:`, err);
        globalErrorHandler.handle(err, { component: componentName, action: 'lazyImport' });

        // 确保返回一个有效的React组件
        return {
          default: (props) => <LazyLoadErrorFallback {...props} componentName={componentName} fallbackMessage={fallbackMessage} error={err} />
        };
      });
  });
};

const BiorhythmTab = createLazyComponent(
  () => import('./BiorhythmSimple'),
  'BiorhythmTab',
  '生物节律模块加载失败，请稍后重试'
);

const ZodiacEnergyTab = createLazyComponent(
  () => import('./ZodiacEnergySimple'),
  'ZodiacEnergyTab',
  '生肖能量模块加载失败，请稍后重试'
);

const HoroscopeTab = createLazyComponent(
  () => import('./ZodiacHoroscope'),
  'HoroscopeTab',
  '星座运程模块加载失败，请稍后重试'
);

const MBTIPersonalityTab = createLazyComponent(
  () => import('./MBTIPersonalityTabHome'),
  'MBTIPersonalityTab',
  '人格魅力模块加载失败，请稍后重试'
);

// 增强版错误边界组件
const ErrorBoundaryFallback = ({ error, errorDetails, resetError }) => {
  const [showDetails, setShowDetails] = useState(false);
  const deviceInfo = errorDetails?.deviceInfo || {};

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* 错误图标 */}
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          加载出错
        </h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">
          {error?.message || '未知错误'}
        </p>

        {/* 设备信息提示（移动设备显示） */}
        {(deviceInfo.isAndroidWebView || deviceInfo.isIOSWebView) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              检测到移动 WebView 环境，可能存在兼容性问题
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {deviceInfo.isAndroidWebView ? 'Android WebView' : 'iOS WebView'}
            </p>
          </div>
        )}

        {/* 精确错误位置信息 */}
        {errorDetails?.locationString && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">错误位置:</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 break-all">
              {errorDetails.locationString}
            </p>
          </div>
        )}

        {/* 详细错误信息（展开时显示） */}
        {showDetails && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4 text-left">
            <details className="space-y-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                完整错误信息
              </summary>
              <div className="space-y-2">
                {errorDetails?.errorId && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">错误ID:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">{errorDetails?.errorId}</p>
                  </div>
                )}
                {errorDetails?.location?.fileName && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">文件:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-all">{errorDetails.location?.fileName}</p>
                  </div>
                )}
                {errorDetails?.location?.lineNumber && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">行号:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">{errorDetails.location?.lineNumber}</p>
                  </div>
                )}
                {errorDetails?.location?.columnNumber && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">列号:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">{errorDetails.location?.columnNumber}</p>
                  </div>
                )}
                {errorDetails?.stackTrace && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">堆栈追踪:</p>
                    <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {errorDetails.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            重试
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            {showDetails ? '隐藏详情' : '显示详情'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BiorhythmDashboard = ({ appInfo = {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // 改为false，立即显示UI
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [serviceStatus, setServiceStatus] = useState({
    biorhythm: true
  });
  const [loadedTabs, setLoadedTabs] = useState(new Set(['biorhythm'])); // 预加载当前标签
  const [tabTransition, setTabTransition] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false); // 标签切换状态
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // 性能监控
  const { measureTabSwitch } = useTabPerformance();

  // 优化的内存管理：减少清理频率，添加特性检测
  // 修复：确保在Android WebView中更积极地清理内存，并增加错误处理
  const cleanupUnusedTabs = useCallback((currentTab) => {
    try {
      // 如果正在标签切换过程中，跳过清理，避免清理正在加载的标签
      if (isTabSwitching) {
        console.log('标签切换中，跳过内存清理');
        return;
      }

      // 在移动设备上总是执行清理
      const isMobile = appInfo.isMobile || isAndroidWebView();

      // 在移动设备上，总是执行清理以保持流畅
      if (isMobile) {
        // 使用requestAnimationFrame确保UI更新后再清理
        requestAnimationFrame(() => {
          setTimeout(() => {
            // 再次检查是否还在切换中
            if (isTabSwitching) {
              console.log('标签切换仍在进行中，取消内存清理');
              return;
            }

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

              // 在移动设备上，只保留当前标签，清理其他标签
              if (isAndroidWebView()) {
                // Android WebView: 只保留当前标签（更激进的清理）
                Array.from(newSet).forEach(tab => {
                  if (tab !== currentTab) {
                    newSet.delete(tab);
                  }
                });
              } else {
                // 其他平台: 保留当前标签和相邻标签
                Array.from(newSet).forEach(tab => {
                  if (!tabsToKeep.includes(tab)) {
                    newSet.delete(tab);
                  }
                });
              }

              return newSet;
            });
          }, isAndroidWebView() ? 5000 : 10000); // Android WebView清理更频繁
        });
      }
    } catch (error) {
      console.warn('内存清理检测失败:', error);
      // 失败时不影响正常功能，继续执行
      // 确保即使清理失败也不影响应用运行
    }
  }, [appInfo.isMobile, isTabSwitching]);

  // 错误处理函数
  // 修复：增强对未定义变量错误的检测，包括压缩后的变量名
  const handleError = useCallback((error, context) => {
    try {
      // 防止处理无效错误对象
      if (!error) {
        console.warn(`${context}: 收到空错误对象`);
        return;
      }

      // 使用全局错误处理器标准化错误
      const appError = globalErrorHandler.handle(error, {
        component: context,
        action: 'onError',
        timestamp: new Date().toISOString()
      });

      // 创建详细的错误报告
      const errorDetails = createDetailedErrorReport(appError);

      console.error(`[${context}] 组件错误:`, appError);
      console.error('错误位置:', errorDetails.locationString);
      console.error('设备信息:', errorDetails.device);
      console.error('完整错误报告:', errorDetails);

      // 设置错误消息（包含位置信息）
      const errorMessage = `加载失败: ${appError.message}\n位置: ${errorDetails.locationString}`;
      setError(errorMessage);

      // 扩展的错误检查，包含更多关键错误类型
      // 修复：添加对未定义变量错误（包括压缩后的变量名如'se'）的检测
      const isReferenceError = error instanceof ReferenceError ||
        error.name === 'ReferenceError' ||
        appError.type === 'COMPONENT_ERROR';

      const isUndefinedVariableError = isReferenceError &&
        (error.message?.includes('is not defined') ||
          error.message?.includes('is not defined') ||
          error.message?.includes('undefined') ||
          error.message?.includes('not defined'));

      const isCriticalError = appError.type === 'CHUNK_LOAD_ERROR' ||
        appError.type === 'MOBILE_WEBVIEW_ERROR' ||
        appError.type === 'SOURCE_MAP_ERROR' ||
        appError.type === 'COMPONENT_ERROR' ||
        error.name === 'ChunkLoadError' ||
        error.message?.includes('加载失败') ||
        error.message?.includes('网络错误') ||
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('not defined') ||
        error.code === 'MODULE_NOT_FOUND' ||
        error.code === 'NETWORK_ERROR';

      // 移动设备特殊处理
      if (isAndroidWebView() || isIOSWebView()) {
        console.warn('检测到移动 WebView 环境，应用增强的错误处理');
        if (isCriticalError || isUndefinedVariableError) {
          // 仅在严重错误或未定义变量错误时才启用降级模式
          console.error('启用降级模式，错误类型:', appError.type);
          setFallbackMode(true);
        }
      } else if (isCriticalError || isUndefinedVariableError) {
        // 仅在严重错误或未定义变量错误时才启用降级模式
        setFallbackMode(true);
      }

      // 移除自动恢复机制，避免内容突然消失
      // 改为让用户手动关闭错误信息
    } catch (handlingError) {
      // 错误处理过程中出现错误，记录并尝试恢复
      console.error('错误处理函数内部出现错误:', handlingError);
      setError('组件加载失败，错误处理出现异常');

      // 使用全局错误处理器处理内部错误
      globalErrorHandler.handle(handlingError, {
        component: 'errorHandler',
        action: 'internalError',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // 降级模式组件
  const FallbackComponent = useCallback(() => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          功能暂时不可用
        </h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm">
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

  // 检测服务状态 - 优化：后台执行，不阻塞UI
  const checkServiceStatus = async () => {
    try {
      // 不设置loading为true，直接在后台检查服务状态
      // 所有环境下的默认状态（本地化运行）
      setServiceStatus({
        biorhythm: true
      });
    } catch (error) {
      console.error('检查服务状态失败:', error);
      // 即使出错也要确保加载状态被设置为false
      setServiceStatus({
        biorhythm: true
      });
    } finally {
      // 确保无论成功还是失败，都要结束加载状态
      setLoading(false);
    }
  };

  // 优化的预加载策略
  // 修复：在Android WebView中减少预加载以节省内存
  const preloadAdjacentTabs = useCallback((currentTab) => {
    const tabOrder = ['biorhythm', 'zodiac', 'horoscope', 'mbti'];
    const currentIndex = tabOrder.indexOf(currentTab);

    if (currentIndex === -1) return;

    // Android WebView只预加载当前标签，减少内存压力
    if (isAndroidWebView()) {
      console.log('Android WebView模式：仅加载当前标签，减少预加载');
      return;
    }

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

    // 延迟预加载更远的标签（仅在非移动环境）
    if (!isAndroidWebView()) {
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
    }
  }, []);

  // 高性能标签切换函数
  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return;

    // 设置标签切换状态，防止内存清理
    setIsTabSwitching(true);

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

      // 清理未使用的标签数据（延迟执行，但要在切换完成后再清理）
      setTimeout(() => {
        cleanupUnusedTabs(tabId);
        // 清除标签切换状态，允许内存清理
        setIsTabSwitching(false);
      }, 2000);

      // 结束性能测量
      if (endMeasurement) setTimeout(endMeasurement, 50);
    });

    // 轻量级切换效果（可选）
    setTabTransition(true);
    setTimeout(() => setTabTransition(false), 100);
  }, [activeTab, preloadAdjacentTabs, cleanupUnusedTabs, measureTabSwitch]);

  useEffect(() => {
    let isMounted = true;

    // 后台检查服务状态，不阻塞UI
    const checkStatus = async () => {
      try {
        if (!isMounted) return;
        // 使用setTimeout将检查推迟到下一个事件循环，确保UI先渲染
        setTimeout(async () => {
          if (isMounted) {
            await checkServiceStatus();
          }
        }, 100);
      } catch (error) {
        console.error('检查服务状态时发生错误:', error);
        // 即使出错也要确保加载状态被设置为false
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // 标签配置 - 添加生肖能量、星座运程标签
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
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 animate-fade-in">Nice Today</h3>
          <p className="text-gray-500 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>正在为您准备个性化体验...</p>
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
      {/* Banner区域 - 优化布局，避免全局样式污染 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg flex-shrink-0">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-indigo-700/30 pointer-events-none"></div>

        {/* 装饰符号 - 简化版 */}
        <div className="absolute top-2 left-2 w-8 h-8 sm:w-12 sm:h-12 opacity-15 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="30" r="8" fill="currentColor" />
            <circle cx="50" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 悬浮在右上角的新版入口按钮 - 绝对定位，不占据布局空间 */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 px-2 py-1 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg text-white text-[10px] sm:text-xs font-medium transition-all duration-300 backdrop-blur-sm hover:scale-105 flex-shrink-0"
            title="体验新版炫彩版主页"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="flex-shrink-0">新版</span>
          </button>
        </div>

        {/* 主要内容区域 - 完全居中垂直布局 */}
        <div className="relative z-10 px-4 py-3 sm:py-4">
          <div className="flex flex-col items-center justify-center">
            {/* 应用图标 */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden backdrop-blur-sm shadow-md transition-all duration-300 hover:bg-white/30 hover:scale-105 cursor-pointer">
                <img
                  src={niceDayImage}
                  alt="Nice Today"
                  className="w-9 h-9 object-contain transition-transform duration-300 group-hover:rotate-12"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* 备用图标 */}
                <svg className="w-7 h-7 text-white hidden" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            {/* 应用标题 */}
            <div className="mt-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight whitespace-nowrap text-center">
                Nice Today
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页选择器 - 参考穿衣指南样式 */}
      <div
        className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 flex-shrink-0"
        style={{
          overflowY: 'hidden',
          overflowX: 'hidden',
          width: '100%'
        }}
      >
        <div className="container mx-auto px-4">
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
                  className={`flex-1 py-3 px-2 text-center font-medium transition-all duration-300 relative ${isActive
                    ? `${colorMap[tab.color]} bg-gray-50 dark:bg-gray-700`
                    : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 ${colorMap[tab.color]}`}></div>
                  )}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className={`w-5 h-5 transition-colors duration-300 ${isActive ? colorMap[tab.color] : 'text-gray-400 dark:text-gray-400'}`}>
                      <tab.icon />
                    </div>
                    <span className="text-xs font-medium dark:text-gray-300">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 内容展示区域 - 简化布局，移除不必要的容器嵌套，优化滚动性能 */}
      <div className="biorhythm-content-area">
        <div className="container mx-auto px-4 py-4">
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

          {/* 标签内容 - 修复：移除嵌套Suspense，简化结构以提升Android WebView兼容性 */}
          {fallbackMode ? (
            <FallbackComponent />
          ) : (
            <>
              {activeTab === 'biorhythm' && loadedTabs.has('biorhythm') && (
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">正在加载生物节律模块...</p>
                    </div>
                  </div>
                }>
                  <BiorhythmTab
                    serviceStatus={serviceStatus.biorhythm}
                    isDesktop={appInfo.isDesktop}
                    onError={(error) => handleError(error, 'BiorhythmTab')}
                  />
                </React.Suspense>
              )}
              {activeTab === 'zodiac' && loadedTabs.has('zodiac') && (
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">正在加载生肖能量模块...</p>
                    </div>
                  </div>
                }>
                  <ZodiacEnergyTab
                    onError={(error) => handleError(error, 'ZodiacEnergyTab')}
                  />
                </React.Suspense>
              )}
              {activeTab === 'horoscope' && loadedTabs.has('horoscope') && (
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">正在加载星座运程模块...</p>
                    </div>
                  </div>
                }>
                  <HoroscopeTab
                    onError={(error) => handleError(error, 'HoroscopeTab')}
                  />
                </React.Suspense>
              )}
              {activeTab === 'mbti' && loadedTabs.has('mbti') && (
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">正在加载人格魅力模块...</p>
                    </div>
                  </div>
                }>
                  <MBTIPersonalityTab
                    onError={(error) => handleError(error, 'MBTIPersonalityTab')}
                  />
                </React.Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiorhythmDashboard;