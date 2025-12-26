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
  try {
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
  } catch (error) {
    console.error('版本检测失败，使用默认轻量版:', error);
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

// 错误屏幕组件 - 带有版本切换和降级选项
const ErrorScreen = ({ error, currentVersion, onRetry, onSwitchVersion, onRestart }) => {
  const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
  const otherVersion = currentVersion === 'lite' ? 'full' : 'lite';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#ffffff',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        {/* 错误图标 */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg style={{ width: '40px', height: '40px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        {/* 错误标题 */}
        <h2 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '12px' }}>应用加载失败</h2>
        
        {/* 错误ID */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>错误ID: {errorId}</span>
        </div>
        
        {/* 错误信息 */}
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
          {error || '版本加载异常，请尝试切换到其他版本'}
        </p>
        
        {/* 当前版本提示 */}
        <div style={{
          backgroundColor: '#dbeafe',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <span style={{ color: '#1e40af', fontSize: '14px' }}>
            当前版本: <strong>{currentVersion === 'lite' ? '轻量版' : '炫彩版'}</strong>
          </span>
        </div>
        
        {/* 操作按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onRetry}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            重试加载
          </button>
          
          <button
            onClick={onSwitchVersion}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            切换到{otherVersion === 'lite' ? '轻量版' : '炫彩版'}
          </button>
          
          <button
            onClick={onRestart}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#9ca3af',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            退出并重启
          </button>
        </div>
      </div>
    </div>
  );
};

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
    const [loadError, setLoadError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // 重试加载当前版本
    const handleRetry = () => {
      setLoadError(null);
      setRetryCount(prev => prev + 1);
      setAppReady(false);
      
      // 重新初始化
      setTimeout(() => {
        setAppReady(true);
      }, 500);
    };

    // 切换版本
    const handleSwitchVersion = () => {
      const otherVersion = currentVersion === 'lite' ? 'full' : 'lite';
      localStorage.setItem('appVersion', otherVersion);
      setCurrentVersion(otherVersion);
      setLoadError(null);
      setRetryCount(0);
      setAppReady(false);
      
      // 根据版本更新URL
      if (otherVersion === 'lite') {
        window.history.replaceState(null, '', '/lite');
      } else {
        window.history.replaceState(null, '', '/');
      }
      
      // 重新加载
      setTimeout(() => {
        setAppReady(true);
      }, 500);
    };

    // 退出并重启
    const handleRestart = () => {
      localStorage.clear();
      window.location.reload();
    };

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

    // 如果有加载错误，显示错误屏幕
    if (loadError) {
      return (
        <ErrorScreen
          error={loadError}
          currentVersion={currentVersion}
          onRetry={handleRetry}
          onSwitchVersion={handleSwitchVersion}
          onRestart={handleRestart}
        />
      );
    }

    return (
      <>
        {showWelcome ? (
          <WelcomeScreen 
            onComplete={() => setShowWelcome(false)} 
            version={currentVersion}
          />
        ) : (
          <Suspense fallback={<LoadingScreen message={`正在加载${currentVersion === 'lite' ? '轻量版' : '炫彩版'}...`} />}>
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