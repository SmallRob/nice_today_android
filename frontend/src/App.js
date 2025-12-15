import React, { useState, useEffect } from 'react';
import BiorhythmDashboard from './components/BiorhythmDashboard';
import DarkModeToggle from './components/DarkModeToggle';
import { checkSystemHealth } from './services/desktopService';
import './index.css';

function App() {
  const [appInfo, setAppInfo] = useState({
    isDesktop: false,
    version: 'v1.0.0',
    status: 'loading'
  });

  useEffect(() => {
    // 检查应用环境
    const checkEnvironment = async () => {
      const isDesktop = window.electronAPI !== undefined;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/App.js:17',message:'App component checking environment',data:{isDesktop,hasElectronAPI:typeof window.electronAPI!=='undefined',apiReady:window.electronAPI?.isReady?.()||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (isDesktop) {
        try {
          const healthResult = await checkSystemHealth();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/App.js:22',message:'Health check result',data:{success:healthResult.success,hasData:!!healthResult.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setAppInfo({
            isDesktop: true,
            version: window.electronAPI?.appInfo?.version || 'v1.0.0',
            status: healthResult.success ? 'ready' : 'error',
            health: healthResult.data
          });
        } catch (error) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/App.js:29',message:'Health check error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setAppInfo({
            isDesktop: true,
            version: 'v1.0.0',
            status: 'error',
            error: error.message
          });
        }
      } else {
        setAppInfo({
          isDesktop: false,
          version: 'v1.0.0',
          status: 'web',
          message: 'Web版本功能受限，建议下载桌面应用以获得完整体验'
        });
      }
    };

    checkEnvironment();
  }, []);

  return (
    <div className="App min-h-screen bg-white dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nice Today {appInfo.isDesktop && <span className="text-sm text-green-500 ml-2">桌面版</span>}
                </h1>
              </div>
              {appInfo.status === 'error' && (
                <div className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  服务异常
                </div>
              )}
              {appInfo.status === 'web' && (
                <div className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Web版本
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* 环境提示 */}
      {!appInfo.isDesktop && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {appInfo.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <main>
        <BiorhythmDashboard appInfo={appInfo} />
      </main>
    </div>
  );
}

export default App;