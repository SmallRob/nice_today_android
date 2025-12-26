import React, { useState, useEffect, Suspense } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import '../styles/unified-numerology.css';

// 导入原有功能组件
const PersonalNumerology = React.lazy(() => import('./NumerologyPage'));
const EnhancedNumerology = React.lazy(() => import('./EnhancedNumerologyPage'));

const UnifiedNumerologyPage = () => {
  const currentConfig = useCurrentConfig();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' 或 'enhanced'
  const [userInfo, setUserInfo] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 检测暗黑模式
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 初始化用户信息
  useEffect(() => {
    try {
      if (currentConfig && currentConfig.birthDate) {
        setUserInfo({
          birthDate: currentConfig.birthDate,
          nickname: currentConfig.nickname || '神秘用户'
        });
      } else {
        setUserInfo({
          birthDate: '1991-04-21',
          nickname: '神秘用户'
        });
      }
    } catch (error) {
      console.error('UnifiedNumerologyPage初始化失败:', error);
      setLoadError(error);
    }
  }, [currentConfig]);

  // 渲染加载状态
  const renderLoading = () => (
    <div className="unified-numerology-container">
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>正在加载灵数功能...</p>
        </div>
      </div>
    </div>
  );

  // 渲染错误状态
  const renderError = (error) => (
    <div className="unified-numerology-container error-container">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="error-title">生命灵数加载失败</h3>
      <p className="error-message">
        {error?.message || '加载生命灵数功能时发生错误'}
      </p>
      <button
        className="error-button"
        onClick={() => window.location.href = '/settings'}
      >
        返回设置
      </button>
    </div>
  );

  // 如果有错误，显示错误界面
  if (loadError) {
    return renderError(loadError);
  }

  return (
    <div className={`unified-numerology-container ${isDarkMode ? 'dark' : ''}`}>
      {/* 顶部标题和导航栏 */}
      <header className="unified-header">
        <div className="header-background">
          <div className="header-content">
            <div className="title-section">
              <h1 className="main-title">生命灵数探索</h1>
              <p className="subtitle">通过数字密码，解读你的生命轨迹</p>
            </div>
            
            {/* 用户信息卡片 - 紧凑设计 */}
            {userInfo && (
              <div className="user-badge">
                <div className="user-avatar">
                  <span className="avatar-text">{userInfo.nickname.charAt(0)}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{userInfo.nickname}</span>
                  <span className="user-birth">{userInfo.birthDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 标签导航 - 紧凑横向布局，防止换行 */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
            aria-label="个人灵数"
          >
            <div className="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="tab-label">个人灵数</span>
          </button>
          
          <button
            className={`tab-button ${activeTab === 'enhanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('enhanced')}
            aria-label="灵数解析"
          >
            <div className="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="tab-label">灵数解析</span>
          </button>
        </nav>
      </header>

      {/* 内容区域 */}
      <main className="unified-content">
        <Suspense fallback={renderLoading()}>
          <div className="tab-content">
            {activeTab === 'personal' ? (
              <div className="personal-tab">
                <PersonalNumerology />
              </div>
            ) : (
              <div className="enhanced-tab">
                <EnhancedNumerology />
              </div>
            )}
          </div>
        </Suspense>
      </main>
    </div>
  );
};

export default UnifiedNumerologyPage;
