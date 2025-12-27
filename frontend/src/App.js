import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserConfigProvider } from './contexts/UserConfigContext';
import { useThemeColor } from './hooks/useThemeColor';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import ErrorDisplayPanel from './components/ErrorDisplayPanel';
import { errorLogger, initializeGlobalErrorHandlers } from './utils/errorLogger';
import { safeInitAndroidWebViewCompat } from './utils/androidWebViewCompat';
import './index.css';

// 为移动设备兼容性安全导入Suspense
const { Suspense } = React;

// 懒加载页面组件 - 添加错误处理
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const BiorhythmDashboard = React.lazy(() => import('./components/BiorhythmDashboard'));
const MayaPage = React.lazy(() => import('./pages/MayaPage'));
const DressGuidePage = React.lazy(() => import('./pages/DressGuidePage'));
const LifeTrendPage = React.lazy(() => import('./pages/LifeTrendPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const TarotPage = React.lazy(() => import('./pages/TarotPage'));
const NumerologyPage = React.lazy(() => import('./pages/NumerologyPage'));
const BiorhythmPage = React.lazy(() => import('./pages/BiorhythmPage'));
const HoroscopePage = React.lazy(() => import('./pages/HoroscopePage'));
const BaziPage = React.lazy(() => import('./pages/BaziPage'));
const MBTITestPage = React.lazy(() => import('./pages/MBTITestPage'));
const MBTIDetailPage = React.lazy(() => import('./components/MBTIPersonalityTabHome'));
const EnergyBoostPage = React.lazy(() => import('./pages/EnergyBoostPage'));
const PeriodTrackerPage = React.lazy(() => import('./pages/PeriodTrackerPage'));
const ZodiacTraitsPage = React.lazy(() => import('./pages/ZodiacTraitsPage'));
const ChineseZodiacPage = React.lazy(() => import('./pages/ChineseZodiacPage'));
const TabNavigation = React.lazy(() => import('./components/TabNavigation'));

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
            <Route path="/trend" element={<LifeTrendPage />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/numerology" element={<NumerologyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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

  // 在应用启动时记录设备信息
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
  }, []);

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
        <EnhancedErrorBoundary componentName="App">
          <ThemeProvider>
            <UserConfigProvider>
              <AppLayout />
              <ErrorDisplayPanel />
            </UserConfigProvider>
          </ThemeProvider>
        </EnhancedErrorBoundary>
      </Router>
    </>
  );
}

export default App;