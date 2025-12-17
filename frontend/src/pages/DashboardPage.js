import React, { useState, useEffect } from 'react';
import BiorhythmDashboard from '../components/BiorhythmDashboard';
import { getPlatformInfo, isAppInitialized } from '../utils/appInitializer';
import '../index.css';

function DashboardPage() {
  const [appInfo, setAppInfo] = useState({
    isNative: false,
    platform: 'web',
    version: 'v1.0.0',
    status: 'loading'
  });

  useEffect(() => {
    // 检查应用环境
    const checkEnvironment = async () => {
      try {
        const platformInfo = getPlatformInfo();
        const isInitialized = isAppInitialized();
        
        setAppInfo({
          isNative: platformInfo.isNative,
          platform: platformInfo.platform,
          version: 'v1.0.0',
          status: isInitialized ? 'ready' : 'initializing',
          isMobile: platformInfo.isAndroid || platformInfo.isIOS
        });
      } catch (error) {
        console.error('Error checking environment:', error);
        setAppInfo({
          isNative: false,
          platform: 'web',
          version: 'v1.0.0',
          status: 'error',
          error: error.message
        });
      }
    };

    checkEnvironment();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
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
        <div className="pb-safe-bottom">
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