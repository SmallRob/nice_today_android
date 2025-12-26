import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserConfigProvider } from './contexts/UserConfigContext';
import { useThemeColor } from './hooks/useThemeColor';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import ErrorDisplayPanel from './components/ErrorDisplayPanel';
import { errorLogger } from './utils/errorLogger';
import './index.css';

// 懒加载页面组件
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MayaPage = React.lazy(() => import('./pages/MayaPage_optimized'));
const DressGuidePage = React.lazy(() => import('./pages/DressGuidePage'));
const LifeTrendPage = React.lazy(() => import('./pages/LifeTrendPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const TarotPage = React.lazy(() => import('./pages/TarotPage'));
const NumerologyPage = React.lazy(() => import('./components/NumerologyPage'));
const EnhancedNumerologyPage = React.lazy(() => import('./components/EnhancedNumerologyPage'));
const UnifiedNumerologyPage = React.lazy(() => import('./components/UnifiedNumerologyPage'));
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
            <Route path="/numerology" element={<UnifiedNumerologyPage />} />
            <Route path="/enhanced-numerology" element={<EnhancedNumerologyPage />} />
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
      // 记录应用启动
      errorLogger.log('Application initialization started', {
        component: 'App',
        action: 'initialize',
        userAgent: navigator.userAgent
      });

      // 延迟初始化，确保DOM已加载
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用try-catch块导入和初始化每个模块
      let capacitorInit;
      try {
        capacitorInit = await import('./utils/capacitorInit-simulated');
        await capacitorInit.initializeApp({
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

      // 初始化炫彩版用户配置管理器，确保在应用启动时加载配置
      try {
        const { fullUserConfigManager } = await import('./utils/fullUserConfigManager');

        // 初始化炫彩版管理器
        await fullUserConfigManager.initialize();
        console.log('炫彩版用户配置管理器初始化成功');
      } catch (error) {
        // 记录用户配置管理器初始化错误
        errorLogger.log(error, {
          component: 'App',
          action: 'fullUserConfigInit',
          errorType: 'FullUserConfigInitError'
        });
        console.warn('炫彩版用户配置管理器初始化失败:', error);
        // 继续执行，不阻止应用启动
      }

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
          <NotificationProvider>
            <ThemeProvider>
              <UserConfigProvider>
                <AppLayout />
                <ErrorDisplayPanel />
              </UserConfigProvider>
            </ThemeProvider>
          </NotificationProvider>
        </EnhancedErrorBoundary>
      </Router>
    </>
  );
}

export default App;