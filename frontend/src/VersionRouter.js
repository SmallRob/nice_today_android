import React, { useState, useEffect } from 'react';
import App from './App'; // 完整版应用
import AppLite from './lite/AppLite'; // 轻量版应用

const VersionRouter = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查localStorage中的版本设置
    const savedVersion = localStorage.getItem('appVersion');
    
    // 如果没有保存的版本设置，使用默认的轻量版
    const version = savedVersion || 'lite';
    
    setCurrentVersion(version);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        正在加载应用...
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