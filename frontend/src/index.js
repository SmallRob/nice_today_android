import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { initializeApp } from './utils/capacitorInit-simulated';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/index.js:8',message:'React app starting',data:{hasElectronAPI:typeof window.electronAPI!=='undefined',electronAPIReady:window.electronAPI?.isReady?.()||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
  
  // 添加加载屏幕
  const LoadingScreen = () => (
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
        <p style={{ color: '#666' }}>正在加载...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  root.render(
    <React.StrictMode>
      <Suspense fallback={<LoadingScreen />}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Suspense>
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