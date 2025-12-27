import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserConfigProvider } from './contexts/UserConfigContext';
import { useThemeColor } from './hooks/useThemeColor';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import ErrorDisplayPanel from './components/ErrorDisplayPanel';
import { errorLogger, initializeGlobalErrorHandlers } from './utils/errorLogger';
import { safeInitAndroidWebViewCompat } from './utils/androidWebViewCompat';
import './index.css';

// 懒加载页面组件 - 添加错误处理
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').catch(err => {
  console.error('DashboardPage 加载失败:', err);
  return import('./pages/ErrorPage');
}));
const MayaPage = React.lazy(() => import('./pages/MayaPage'));
const DressGuidePage = React.lazy(() => import('./pages/DressGuidePage'));
const LifeTrendPage = React.lazy(() => import('./pages/LifeTrendPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const TarotPage = React.lazy(() => import('./pages/TarotPage'));
const NumerologyPage = React.lazy(() => import('./pages/NumerologyPage'));
const TabNavigation = React.lazy(() => import('./components/TabNavigation'));

// 加载屏幕组件
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400">正在加载应用...</p>
  </div>
);

// 移除旧的 ErrorBoundary，使用增强版 EnhancedErrorBoundary

// 应用布局组件
const AppLayout = () => {
  // 使用主题颜色Hook
  useThemeColor();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <Suspense fallback={<div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/maya" element={<MayaPage />} />
            <Route path="/dress" element={<DressGuidePage />} />
            <Route path="/trend" element={<LifeTrendPage />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/numerology" element={<NumerologyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-16 bg-gray-100 dark:bg-gray-800"></div>}>
        <TabNavigation />
      </Suspense>
    </div>
  );
};

function App() {
  const [appState, setAppState] = useState({
    initialized: false,
    error: null
  });

  // 简化的初始化函数
  const initializeApp = async () => {
    try {
      // 延迟初始化，确保DOM已加载
      await new Promise(resolve => setTimeout(resolve, 100));

      // 延迟初始化，确保DOM已加载
      if (typeof window !== 'undefined') {
        try {
          // 初始化全局错误捕获
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

      // 按顺序初始化，避免并发初始化导致的变量访问问题
      // 首先初始化Capacitor相关功能
      try {
        const capacitorInitModule = await import('./utils/capacitorInit-simulated');
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
        const configMigrationModule = await import('./utils/ConfigMigrationTool');
        const { configMigrationTool } = configMigrationModule;

        // 检查是否需要从旧版迁移数据
        const migrationCheck = await configMigrationTool.checkMigrationNeeded();
        if (migrationCheck.needed) {
          console.log('检测到旧版配置数据，开始迁移...', migrationCheck);
          await configMigrationTool.performMigration();
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

      setAppState({
        initialized: true,
        error: null
      });

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
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{appState.error}</p>
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