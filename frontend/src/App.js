import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from './utils/capacitorInit';
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

// 应用布局组件
const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-hidden">
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
  // 初始化应用
  useEffect(() => {
    const init = async () => {
      try {
        // 使用简化配置初始化应用，提高兼容性
        await initializeApp({
          debug: process.env.NODE_ENV === 'development',
          performance: {
            enabled: true,
            autoLog: true,
            thresholds: {
              render: 30,  // 放宽渲染时间阈值，适应低端设备
              api: 3000,   // 放宽API响应时间阈值
              componentLoad: 1000  // 放宽组件加载时间阈值
            }
          },
          permissions: {
            autoRequest: false,
            required: [],  // 移除启动时必需权限，避免权限拒绝导致闪退
            optional: []   // 移除可选权限，按需申请
          },
          compatibility: {
            autoCheck: true,
            fixProblems: true,  // 启用自动修复功能
            logProblems: true
          }
        });
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    init();
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <AppLayout />
      </Suspense>
    </Router>
  );
}

export default App;