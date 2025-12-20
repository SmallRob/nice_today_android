import React, { useState, useEffect } from 'react';
import App from './App'; // 完整版应用
import AppLite from './lite/AppLite'; // 轻量版应用
import versionDetector from './utils/versionDetector'; // 版本检测器

const VersionRouter = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeVersionRouting = async () => {
      try {
        // 初始化版本检测器
        const version = await versionDetector.initialize();
        
        // 设置当前版本
        setCurrentVersion(version);
        
        // 根据版本自动跳转到相应页面
        versionDetector.autoRedirect();
        
        setIsLoading(false);
      } catch (error) {
        console.error('版本路由初始化失败:', error);
        
        // 降级处理：使用默认版本
        setCurrentVersion('lite');
        setIsLoading(false);
      }
    };

    initializeVersionRouting();
  }, []);

  // 添加版本变化监听器
  useEffect(() => {
    if (!currentVersion) return;
    
    const removeListener = versionDetector.addVersionChangeListener((detail) => {
      console.log('检测到版本变化:', detail);
      setCurrentVersion(detail.version);
      
      // 版本变化后重新执行自动跳转
      versionDetector.autoRedirect();
    });
    
    return () => {
      if (removeListener) removeListener();
    };
  }, [currentVersion]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f8fafc',
        color: '#374151'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>正在检测应用版本...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 根据版本渲染相应的应用
  if (currentVersion === 'lite') {
    return <AppLite />;
  } else {
    return <App />;
  }
};

export default VersionRouter;