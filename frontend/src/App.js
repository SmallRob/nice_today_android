import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { optimizeAppStartup } from './utils/startupOptimizer';
import './index.css';

// 懒加载页面组件
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MayaPage = React.lazy(() => import('./pages/MayaPage'));
const DressGuidePage = React.lazy(() => import('./pages/DressGuidePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const TabNavigation = React.lazy(() => import('./components/TabNavigation'));

// 加载屏幕组件
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400">正在加载应用...</p>
  </div>
);

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 p-4">
          <div className="text-red-500 text-xl mb-4">应用遇到错误</div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-md">
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
              {this.state.error && this.state.error.toString()}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">查看详细信息</summary>
                <pre className="text-xs mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            重新加载应用
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 应用布局组件
const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/maya" element={<MayaPage />} />
            <Route path="/dress" element={<DressGuidePage />} />
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
      
      // 使用try-catch块导入和初始化每个模块
      let capacitorInit;
      try {
        capacitorInit = await import('./utils/capacitorInit');
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
        console.warn('Capacitor初始化失败:', error);
        // 继续执行，不阻止应用启动
      }
      
      setAppState({
        initialized: true,
        error: null
      });
    } catch (error) {
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
    <Router>
      <ErrorBoundary>
        <AppLayout />
      </ErrorBoundary>
    </Router>
  );
}

export default App;