import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { optimizeAppStartup } from './utils/startupOptimizer';
import DataPolicyConsent from './components/DataPolicyConsent';
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
const AppLayout = ({ dataPolicyConsent }) => {
  // 如果用户未同意数据使用策略，不显示主要内容
  if (!dataPolicyConsent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">正在等待数据使用策略确认...</p>
      </div>
    );
  }
  
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
  const [dataPolicyConsent, setDataPolicyConsent] = useState(false);
  
  // 检查用户是否已经同意数据使用策略
  useEffect(() => {
    const consentGiven = localStorage.getItem('dataPolicyConsent');
    if (consentGiven === 'true') {
      setDataPolicyConsent(true);
    }
  }, []);
  
  // 初始化应用
  useEffect(() => {
    const init = async () => {
      try {
        // 使用优化的启动流程初始化应用
        const result = await optimizeAppStartup({
          // 可以在这里添加特定的启动配置
        });
        
        if (result.success) {
          console.log(`App initialized successfully in ${result.duration.toFixed(2)}ms`);
        } else {
          console.error('Error initializing app:', result.error);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    // 只有在用户同意数据使用策略后才初始化应用
    if (dataPolicyConsent) {
      init();
    }
  }, [dataPolicyConsent]);

  return (
    <Router>
      {/* 数据使用策略同意弹窗 */}
      <DataPolicyConsent onConsent={() => setDataPolicyConsent(true)} />
      
      <Suspense fallback={<LoadingScreen />}>
        <AppLayout dataPolicyConsent={dataPolicyConsent} />
      </Suspense>
    </Router>
  );
}

export default App;