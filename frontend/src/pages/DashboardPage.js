import React, { useState, useEffect, useRef } from 'react';
import BiorhythmDashboard from '../components/BiorhythmDashboard';
import '../index.css';
import '../styles/animations.css';

function DashboardPage() {
  const [appInfo, setAppInfo] = useState({
    isNative: false,
    platform: 'web',
    version: 'v1.0.0',
    status: 'loading'
  });

  // 使用useRef来跟踪组件是否已卸载
  const isMountedRef = useRef(true);
  const initializationStartedRef = useRef(false);

  useEffect(() => {
    // 优化异步加载逻辑，使用requestAnimationFrame确保流畅渲染
    const initializeApp = () => {
      // 避免重复初始化
      if (initializationStartedRef.current) return;
      initializationStartedRef.current = true;

      // 使用requestAnimationFrame确保在下一帧渲染，避免黑屏
      requestAnimationFrame(() => {
        // 检查组件是否仍然挂载
        if (!isMountedRef.current) return;
        
        // 立即设置为ready状态，减少等待时间
        setAppInfo({
          isNative: false,
          platform: 'web',
          version: 'v1.0.0',
          status: 'ready',
          isMobile: false
        });

        // 异步执行平台检测，不阻塞主渲染
        requestAnimationFrame(() => {
          try {
            // 尝试使用全局函数
            if (window.getPlatformInfo && typeof window.getPlatformInfo === 'function') {
              const platformInfo = window.getPlatformInfo();
              
              // 再次检查组件是否仍然挂载
              if (!isMountedRef.current) return;
              
              // 更新状态
              setAppInfo(prev => ({
                ...prev,
                isNative: platformInfo.isNative || false,
                platform: platformInfo.platform || 'web',
                isMobile: (platformInfo.isAndroid || platformInfo.isIOS) || false
              }));
            }
          } catch (error) {
            console.warn('平台检测失败，使用默认值:', error);
          }
        });
      });
    };

    // 立即开始初始化
    initializeApp();

    // 清理函数
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 animate-fade-in h-full">
      {appInfo.status === 'loading' && (
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
          </div>
        </div>
      )}
      
      {appInfo.status === 'initializing' && (
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">正在初始化应用...</p>
          </div>
        </div>
      )}

      {appInfo.status === 'ready' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-safe-bottom -webkit-overflow-scrolling-touch">
          <BiorhythmDashboard appInfo={appInfo} />
        </div>
      )}
      
      {appInfo.status === 'error' && (
        <div className="flex justify-center items-center h-32">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-400">应用初始化失败</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{appInfo.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;