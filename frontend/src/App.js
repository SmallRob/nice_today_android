import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserConfigProvider } from './contexts/UserConfigContext';
import { useThemeColor } from './hooks/useThemeColor';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import ErrorDisplayPanel from './components/ErrorDisplayPanel';
import { errorLogger, initializeGlobalErrorHandlers } from './utils/errorLogger';
import { safeInitAndroidWebViewCompat } from './utils/androidWebViewCompat';
import { useChunkErrorRecovery, ChunkLoadErrorBoundary } from './utils/chunkLoadErrorHandler';
import { useVersionManager, VersionUpdateNotification } from './utils/versionManager';
import { UserParamsProvider } from './context/UserParamsContext';
import './index.css';

// 为移动设备兼容性安全导入Suspense
const { Suspense } = React;

// 创建带有错误处理的懒加载函数
const lazyLoadWithErrorHandling = (importFunc, fallbackComponent = null) => {
  return React.lazy(() => 
    importFunc().catch(error => {
      console.error('组件加载失败:', error);
      
      // 如果是ChunkLoadError，记录错误并尝试恢复
      if (error.name === 'ChunkLoadError') {
        console.error('检测到ChunkLoadError，尝试恢复...');
        
        // 记录错误信息
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const errorInfo = {
              type: 'ChunkLoadError',
              message: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
              url: window.location.href
            };
            
            const errors = JSON.parse(window.localStorage.getItem('chunkLoadErrors') || '[]');
            errors.push(errorInfo);
            window.localStorage.setItem('chunkLoadErrors', JSON.stringify(errors));
          } catch (e) {
            console.warn('无法记录ChunkLoadError:', e);
          }
        }
      }
      
      // 返回回退组件或错误页面
      if (fallbackComponent) {
        return fallbackComponent;
      }
      
      // 默认返回错误页面组件
      return {
        default: () => (
          <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 p-4">
            <div className="text-red-500 text-xl mb-4">页面加载失败</div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-md">
              <p className="text-gray-700 dark:text-white text-sm mb-4">
                抱歉，页面资源加载失败。这通常是由于网络问题或应用更新导致的。
              </p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
            </div>
          </div>
        )
      };
    })
  );
};

// 懒加载页面组件 - 添加错误处理
const DashboardPage = lazyLoadWithErrorHandling(() => import('./pages/DashboardPage'));
const BiorhythmDashboard = lazyLoadWithErrorHandling(() => import('./components/BiorhythmDashboard'));
const MayaPage = lazyLoadWithErrorHandling(() => import('./pages/MayaPage'));
const DressGuidePage = lazyLoadWithErrorHandling(() => import('./pages/DressGuidePage'));
const LifeEnergyTrendPage = lazyLoadWithErrorHandling(() => import('./pages/LifeTrendPage'));
const SettingsPage = lazyLoadWithErrorHandling(() => import('./pages/SettingsPage'));
const MoreFeaturesPage = lazyLoadWithErrorHandling(() => import('./pages/MoreFeaturesPage'));
const TarotGardenPage = lazyLoadWithErrorHandling(() => import('./pages/TarotGardenPage'));
const UserConfigPage = lazyLoadWithErrorHandling(() => import('./pages/UserConfigPage'));
const TarotPage = lazyLoadWithErrorHandling(() => import('./pages/TarotPage'));
const NumerologyPage = lazyLoadWithErrorHandling(() => import('./pages/NumerologyPage'));
const BiorhythmPage = lazyLoadWithErrorHandling(() => import('./pages/BiorhythmPage'));
const HoroscopePage = lazyLoadWithErrorHandling(() => import('./pages/HoroscopePage_optimized'));
const BaziPage = lazyLoadWithErrorHandling(() => import('./pages/BaziPage'));
const MBTITestPage = lazyLoadWithErrorHandling(() => import('./pages/MBTITestPage'));
const MBTIDetailPage = lazyLoadWithErrorHandling(() => import('./components/MBTIPersonalityTabHome'));
const EnergyBoostPage = lazyLoadWithErrorHandling(() => import('./pages/EnergyBoostPage'));
const PeriodTrackerPage = lazyLoadWithErrorHandling(() => import('./pages/PeriodTrackerPage'));
const ZodiacTraitsPage = lazyLoadWithErrorHandling(() => import('./pages/ZodiacTraitsPage'));
const ChineseZodiacPage = lazyLoadWithErrorHandling(() => import('./pages/ChineseZodiacPage'));
const AgeAnalysisPage = lazyLoadWithErrorHandling(() => import('./pages/AgeAnalysisPage'));
const ZiWeiPage = lazyLoadWithErrorHandling(() => import('./pages/ZiWeiPage'));
const TodoListPage = lazyLoadWithErrorHandling(() => import('./pages/TodoListPage'));
const FinancePage = lazyLoadWithErrorHandling(() => import('./pages/FinancePage'));
const TakashimaAdvicePage = lazyLoadWithErrorHandling(() => import('./pages/TakashimaAdvice'));
const LifestyleGuidePage = lazyLoadWithErrorHandling(() => import('./pages/LifestyleGuide'));
const DailyCardPage = lazyLoadWithErrorHandling(() => import('./pages/DailyCardPage'));
const CulturalCupPage = lazyLoadWithErrorHandling(() => import('./pages/CulturalCapPage'));
const BaziAnalysisPage = lazyLoadWithErrorHandling(() => import('./pages/BaziAnalysisPage'));
const WuxingHealthPage = lazyLoadWithErrorHandling(() => import('./pages/WuxingHealthPage'));
const OrganRhythmPage = lazyLoadWithErrorHandling(() => import('./pages/OrganRhythmPage'));
const ShaoyongYixuePage = lazyLoadWithErrorHandling(() => import('./components/shaoyong/ShaoyongYixue'));
const FishingGamePage = lazyLoadWithErrorHandling(() => import('./pages/FishingGamePage'));
const TabNavigation = lazyLoadWithErrorHandling(() => import('./components/TabNavigation'));

// 加载屏幕组件
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 dark:text-white">正在加载应用...</p>
  </div>
);

// 移除旧的 ErrorBoundary，使用增强版 EnhancedErrorBoundary

// 应用布局组件
const AppLayout = () => {
  // 使用主题颜色Hook
  useThemeColor();

  // 检测是否在移动设备环境中
  const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  // 移动设备兼容的Suspense实现
  const SafeSuspense = ({ fallback, children }) => {
    if (isMobile) {
      // 在移动设备上使用更兼容的实现
      return (
        <React.Suspense fallback={fallback}>
          {children}
        </React.Suspense>
      );
    }
    // 在桌面设备上使用标准实现
    return (
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    );
  };

    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <SafeSuspense fallback={<div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/old-dashboard" element={<BiorhythmDashboard />} />
            <Route path="/maya" element={<MayaPage />} />
            <Route path="/dress" element={<DressGuidePage />} />
            <Route path="/life-energy" element={<LifeEnergyTrendPage />} />
            <Route path="/trend" element={<LifeEnergyTrendPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/more-features" element={<MoreFeaturesPage />} />
            <Route path="/tarot-garden" element={<TarotGardenPage />} />
            <Route path="/user-config" element={<UserConfigPage />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/numerology" element={<NumerologyPage />} />
            <Route path="/biorhythm" element={<BiorhythmPage />} />
            <Route path="/horoscope" element={<HoroscopePage />} />
            <Route path="/bazi" element={<BaziPage />} />
            <Route path="/mbti-test" element={<MBTITestPage />} />
            <Route path="/mbti-detail" element={<MBTIDetailPage />} />
            <Route path="/energy" element={<EnergyBoostPage />} />
            <Route path="/period-tracker" element={<PeriodTrackerPage />} />
            <Route path="/zodiac-traits" element={<ZodiacTraitsPage />} />
            <Route path="/zodiac-traits/:zodiacName" element={<ZodiacTraitsPage />} />
            <Route path="/chinese-zodiac" element={<ChineseZodiacPage />} />
            <Route path="/age-analysis" element={<AgeAnalysisPage />} />
            <Route path="/ziwei" element={<ZiWeiPage />} />
            <Route path="/todo-list" element={<TodoListPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/takashima-advice" element={<TakashimaAdvicePage />} />
            <Route path="/lifestyle-guide" element={<LifestyleGuidePage />} />
            <Route path="/daily-cards" element={<DailyCardPage />} />
            <Route path="/cultural-cup" element={<CulturalCupPage />} />
            <Route path="/bazi-analysis" element={<BaziAnalysisPage />} />
            <Route path="/wuxing-health" element={<WuxingHealthPage />} />
            <Route path="/organ-rhythm" element={<OrganRhythmPage />} />
            <Route path="/fishing-game" element={<FishingGamePage />} />
            <Route path="/dress" element={<DressGuidePage />} />
            <Route path="/shaoyong-yixue" element={<ShaoyongYixuePage />} />
          </Routes>
        </SafeSuspense>
      </div>

      <SafeSuspense fallback={<div className="h-16 bg-gray-100 dark:bg-gray-800"></div>}>
        <TabNavigation />
      </SafeSuspense>
    </div>
  );
};

function App() {
  const [appState, setAppState] = useState({
    initialized: false,
    error: null
  });
  
  // 初始化Chunk错误恢复工具
  const { handleChunkError, checkChunkHealth } = useChunkErrorRecovery();
  
  // 初始化版本管理工具
  const {
    current: currentVersion,
    stored: storedVersion,
    needsUpdate,
    clearAndReload
  } = useVersionManager();
  
  // 版本更新通知状态
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);

  // 检测是否在移动设备环境中
  const isMobileEnvironment = () => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // 检查是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // 检查是否为WebView环境
    const isWebView = /wv|WebView|; wv\)/.test(userAgent);
    
    // 检查是否为Android WebView
    const isAndroidWebView = /Android/.test(userAgent) && /wv/.test(userAgent);
    
    return {
      isMobile,
      isWebView,
      isAndroidWebView,
      userAgent
    };
  };

  // 在应用启动时记录设备信息和检查chunk健康状态
  useEffect(() => {
    const deviceInfo = isMobileEnvironment();
    console.log('设备信息:', deviceInfo);
    
    // 在开发环境中显示设备信息
    if (process.env.NODE_ENV === 'development') {
      console.info('应用运行环境:', {
        isMobile: deviceInfo.isMobile,
        isWebView: deviceInfo.isWebView,
        isAndroidWebView: deviceInfo.isAndroidWebView
      });
    }
    
    // 检查关键chunk健康状态
    try {
      const isHealthy = checkChunkHealth();
      if (!isHealthy) {
        console.warn('检测到潜在的chunk加载问题');
      }
    } catch (e) {
      console.warn('Chunk健康检查失败:', e);
    }
    
    // 监听全局错误，特别是ChunkLoadError
    const handleGlobalError = (event) => {
      if (event.error && event.error.name === 'ChunkLoadError') {
        console.log('全局ChunkLoadError捕获:', event.error.message);
        handleChunkError(event.error);
      }
    };
    
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.name === 'ChunkLoadError') {
        console.log('全局Promise拒绝ChunkLoadError捕获:', event.reason.message);
        handleChunkError(event.reason);
      }
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleChunkError, checkChunkHealth]);
  
  // 监听版本更新
  React.useEffect(() => {
    if (needsUpdate) {
      console.log(`检测到数据版本同步: ${storedVersion || '未知'} → ${currentVersion}`);
      setShowUpdateNotification(true);
    }
  }, [needsUpdate, currentVersion, storedVersion]);

  // 安全的初始化函数 - 优化：立即返回，后台执行初始化
  const initializeApp = async () => {
    try {
      // 立即设置初始化完成，显示主界面
      // 这样用户可以先看到菜单，然后再异步加载内容
      setAppState({
        initialized: true,
        error: null
      });

      // 确保在浏览器环境中执行
      if (typeof window !== 'undefined') {
        try {
          // 初始化全局错误捕获 - 确保在其他初始化之前完成
          initializeGlobalErrorHandlers();
        } catch (error) {
          console.warn('全局错误捕获初始化失败:', error);
        }

        try {
          // 使用安全的初始化函数，确保在适当环境下运行
          const androidWebViewResult = safeInitAndroidWebViewCompat();
          console.log('Android WebView 兼容性初始化完成:', androidWebViewResult);
        } catch (error) {
          console.warn('Android WebView 兼容性初始化失败:', error);
        }
      }

      // 记录应用启动（使用普通日志，不是错误）
      console.log('Application initialization started');

      // 异步执行初始化，不阻塞UI显示
      setTimeout(async () => {
        try {
          // 按顺序初始化，避免并发初始化导致的变量访问问题
          // 首先初始化Capacitor相关功能
          try {
            // 使用动态导入时，确保模块加载完成后再执行
            const capacitorInitModule = await import('./utils/capacitorInit-simulated');

            // 验证模块和函数存在性
            if (capacitorInitModule && typeof capacitorInitModule.initializeApp === 'function') {
              await capacitorInitModule.initializeApp({
                debug: process.env.NODE_ENV === 'development',
                performance: {
                  enabled: true,
                  autoLog: true
                },
                permissions: {
                  autoRequest: false,
                  required: [],
                  optional: []
                },
                compatibility: {
                  autoCheck: true,
                  fixProblems: false,
                  logProblems: true
                }
              });
            }
          } catch (error) {
            // 记录 Capacitor 初始化错误
            errorLogger.log(error, {
              component: 'App',
              action: 'capacitorInit',
              errorType: 'CapacitorInitError'
            });
            console.warn('Capacitor初始化失败:', error);
            // 继续执行，不阻止应用启动
          }

          // 配置迁移：检查并从旧版迁移数据
          try {
            // 使用动态导入时，确保模块加载完成后再执行
            const configMigrationModule = await import('./utils/ConfigMigrationTool');

            // 验证模块和函数存在性
            if (configMigrationModule && configMigrationModule.configMigrationTool) {
              const { configMigrationTool } = configMigrationModule;

              // 检查是否需要从旧版迁移数据
              const migrationCheck = await configMigrationTool.checkMigrationNeeded();
              if (migrationCheck.needed) {
                console.log('检测到旧版配置数据，开始迁移...', migrationCheck);
                await configMigrationTool.performMigration();
              }
            }
          } catch (error) {
            // 记录配置迁移错误
            errorLogger.log(error, {
              component: 'App',
              action: 'configMigration',
              errorType: 'ConfigMigrationError'
            });
            console.warn('配置迁移失败:', error);
            // 继续执行，不阻止应用启动
          }

          // 注意：用户配置管理器的初始化现在由 UserConfigProvider 统一管理
          // 不在这里直接调用 enhancedUserConfigManager.initialize()，避免重复初始化

          // 记录初始化成功
          console.log('应用初始化成功');
        } catch (error) {
          // 记录初始化错误，但不影响UI显示
          errorLogger.log(error, {
            component: 'App',
            action: 'initialize',
            errorType: 'InitializationError'
          });
          console.error('应用初始化错误:', error);
        }
      }, 100);

    } catch (error) {
      // 记录初始化错误
      errorLogger.log(error, {
        component: 'App',
        action: 'initialize',
        errorType: 'InitializationError'
      });
      console.error('应用初始化错误:', error);
      setAppState({
        initialized: false,
        error: error.message
      });
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // 显示加载屏幕直到应用初始化完成
  if (!appState.initialized) {
    return <LoadingScreen />;
  }

  // 显示错误屏幕（如果有错误）
  if (appState.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 p-4">
        <div className="text-red-500 text-xl mb-4">应用初始化失败</div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-md">
          <p className="text-gray-700 dark:text-white text-sm mb-2">{appState.error}</p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => initializeApp()}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <>
      <Router>
        {/* 版本更新通知 */}
        {showUpdateNotification && (
          <VersionUpdateNotification
            updateInfo={{
              previousVersion: storedVersion,
              currentVersion: currentVersion
            }}
            onApplyUpdate={() => {
              clearAndReload(true);
              setShowUpdateNotification(false);
            }}
            onDismiss={() => {
              setShowUpdateNotification(false);
            }}
          />
        )}
        
        <ChunkLoadErrorBoundary maxRetries={3}>
          <EnhancedErrorBoundary componentName="App">
            <ThemeProvider>
              <UserConfigProvider>
                <UserParamsProvider>
                  <AppLayout />
                  <ErrorDisplayPanel />
                </UserParamsProvider>
              </UserConfigProvider>
            </ThemeProvider>
          </EnhancedErrorBoundary>
        </ChunkLoadErrorBoundary>
      </Router>
    </>
  );
}

export default App;