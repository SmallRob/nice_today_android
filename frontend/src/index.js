import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import VersionRouter from './VersionRouter';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { initializeApp } from './utils/capacitorInit-simulated';
import WelcomeScreen from './components/WelcomeScreen';
import timeCacheManager from './utils/timeCache';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'frontend/src/index.js:8', message: 'React app starting', data: { hasElectronAPI: typeof window.electronAPI !== 'undefined', electronAPIReady: window.electronAPI?.isReady?.() || false }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
// #endregion

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

  // 优化的AppWrapper组件 - 移除时间冲突，统一状态管理
  const AppWrapper = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    const [appReady, setAppReady] = useState(false);
    const [initializationError, setInitializationError] = useState(null);

    useEffect(() => {
      const initializeApp = async () => {
        try {
          // 初始化时间缓存
          timeCacheManager.update();

          // 标记应用已准备就绪
          setAppReady(true);

          // 添加备用超时机制（防止欢迎界面卡住）
          const fallbackTimer = setTimeout(() => {
            console.log('欢迎界面备用超时触发，自动跳过');
            setShowWelcome(false);
          }, 5000); // 缩短到5秒，更快响应

          return () => clearTimeout(fallbackTimer);
        } catch (error) {
          console.error('App initialization failed:', error);
          setInitializationError(error);
          // 出错时也尝试继续加载主应用
          setTimeout(() => setShowWelcome(false), 2000);
        }
      };

      initializeApp();
    }, []);

    // 优化的加载屏幕 - 使用CSS类而非内联样式
    const LoadingScreen = () => (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white text-sm">正在加载...</p>
        </div>
      </div>
    );

    // 错误处理界面
    const ErrorScreen = ({ error, onRetry }) => (
      <div className="fixed inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center z-50">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            初始化失败
          </h2>
          <p className="text-gray-600 dark:text-white text-sm mb-4">
            应用启动时遇到问题，正在尝试恢复...
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            重试
          </button>
        </div>
      </div>
    );

    if (initializationError) {
      return <ErrorScreen error={initializationError} onRetry={() => window.location.reload()} />;
    }

    return (
      <>
        {showWelcome ? (
          <WelcomeScreen 
            onComplete={() => setShowWelcome(false)} 
            appReady={appReady}
          />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <ThemeProvider>
              <NotificationProvider>
                <VersionRouter />
              </NotificationProvider>
            </ThemeProvider>
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