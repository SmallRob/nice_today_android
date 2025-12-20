import React from 'react';

const VersionSwitcher = () => {
  const switchToFullVersion = () => {
    // 设置版本标记
    localStorage.setItem('appVersion', 'full');
    
    // 重新加载页面以切换到完整版
    window.location.reload();
  };

  return (
    <div className="lite-version-switcher">
      <button 
        className="lite-version-switcher-btn"
        onClick={switchToFullVersion}
      >
        切换到炫彩版
      </button>
    </div>
  );
};

export default VersionSwitcher;