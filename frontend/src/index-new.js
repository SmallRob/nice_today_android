import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { initializeApp } from './utils/capacitorInit-simulated';
import WelcomeScreen from './components/WelcomeScreen';
import timeCacheManager from './utils/timeCache';

// 懒加载两个版本的应用
const AppLite = React.lazy(() => import('./lite/AppLite'));
const AppFull = React.lazy(() => import('./App'));

// 版本检测逻辑
const getAppVersion = () => {
  // 1. 检查URL参数中的版本设置（优先级最高）
  const urlParams = new URLSearchParams(window.location.search);
  const urlVersion = urlParams.get('version');
  
  // 2. 检查localStorage中的版本设置
  const savedVersion = localStorage.getItem('appVersion');
  
  // 3. 确定当前版本（URL参数 > localStorage > 默认）
  if (urlVersion && (urlVersion === 'lite' || urlVersion === 'full')) {
    localStorage.setItem('appVersion', urlVersion);
    return urlVersion;
  } else if (savedVersion) {
    return savedVersion;
  } else {
    // 默认使用轻量版
    localStorage.setItem('appVersion', 'lite');
    return 'lite';
  }
};

// 加载屏幕组件
const LoadingScreen = ({ message = '正在加载应用...' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#ffffff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p style={{ color: '#666' }}>{message}</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// 初始化Capacitor应用
const initApp = async () => {
  try {
    await initializeApp({
      debug: process.env.NODE_ENV === 'development',
      performance: {
        enabled: true,
        autoLog: true
      },
      permissions: {
        autoRequest: false,
        required: ['notifications'],
        optional: ['geolocation', 'camera', 'photos']
      },
      compatibility: {
        autoCheck: true,
        fixProblems: false,
        logProblems: true
      }
    });
    console.log('Capacitor app initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor app:', error);
  }
};

// 启动应用
const startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));

  const AppWrapper = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    const [appReady, setAppReady] = useState(false);
    const [currentVersion, setCurrentVersion] = useState(null);

    useEffect(() => {
      // 初始化时间缓存
      timeCacheManager.update();

      // 检测应用版本
      const version = getAppVersion();
      setCurrentVersion(version);
      console.log(`启动版本: ${version === 'lite' ? '轻量版' : '炫彩版'}`);

      // 根据版本自动跳转路由
      if (version === 'lite' && window.location.pathname !== '/lite') {
        window.history.replaceState(null, '', '/lite');
      } else if (version === 'full' && window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }

      // 3秒后隐藏欢迎界面
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setAppReady(true);
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    if (!appReady || !currentVersion) {
      return <LoadingScreen message="正在检测应用版本..." />;
    }

    return (
      <>
        {showWelcome ? (
          <WelcomeScreen onComplete={() => setShowWelcome(false)} />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            {currentVersion === 'lite' ? (
              <AppLite />
            ) : (
              <AppFull />
            )}
          </Suspense>
        )}
      </>
    );
  };

  root.render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
};

// 等待DOM加载后初始化并启动应用
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  startApp();
});

// 如果DOM已经加载完成
if (document.readyState === 'loading') {
  // DOM仍在加载中，等待DOMContentLoaded事件
} else {
  // DOM已经加载完成，直接初始化
  initApp().then(startApp);
}