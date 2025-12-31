import React, { useState, useEffect, Suspense } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import '../styles/unified-numerology.css';

// 安全延迟导入功能组件，避免循环依赖
const PersonalNumerology = React.lazy(() =>
  import('../components/NumerologySimple').catch(error => {
    console.warn('NumerologySimple组件加载失败:', error);
    return { default: () => <div>组件加载失败</div> };
  })
);

const EnhancedNumerology = React.lazy(() =>
  import('../components/EnhancedNumerologyPage').catch(error => {
    console.warn('EnhancedNumerologyPage组件加载失败:', error);
    return { default: () => <div>组件加载失败</div> };
  })
);

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
      <div className="unified-loading-overlay">
        <div className="unified-loading-content">
          <div className="unified-loading-spinner"></div>
          <p>正在加载灵数功能...</p>
        </div>
      </div>
    </div>
  );

  // 渲染错误状态
  const renderError = (error) => (
    <div className="unified-numerology-container unified-error-container">
      <div className="unified-error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="unified-error-title">生命灵数加载失败</h3>
      <p className="unified-error-message">
        {error?.message || '加载生命灵数功能时发生错误'}
      </p>
      <button
        className="unified-error-button"
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
        <div className="unified-header-background">
          <div className="unified-header-content">
            <div className="unified-title-section">
              <h1 className="unified-main-title">生命灵数探索</h1>
              <p className="unified-subtitle">通过数字密码，解读你的生命轨迹</p>
            </div>

            {/* 用户信息卡片 - 紧凑设计 */}
            {userInfo && (
              <div className="unified-user-badge">
                <div className="unified-user-avatar">
                  <span className="unified-avatar-text">{userInfo.nickname.charAt(0)}</span>
                </div>
                <div className="unified-user-details">
                  <span className="unified-user-name">{userInfo.nickname}</span>
                  <span className="unified-user-birth">{userInfo.birthDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 标签导航 - 紧凑横向布局，防止换行 */}
        <nav className="unified-tab-navigation">
          <button
            className={`unified-tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
            aria-label="个人灵数"
          >
            <div className="unified-tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="unified-tab-label">个人灵数</span>
          </button>

          <button
            className={`unified-tab-button ${activeTab === 'enhanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('enhanced')}
            aria-label="灵数解析"
          >
            <div className="unified-tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="unified-tab-label">灵数解析</span>
          </button>
        </nav>
      </header>

      {/* 内容区域 */}
      <main className="unified-content">
        <Suspense fallback={renderLoading()}>
          <div className="unified-tab-content">
            {activeTab === 'personal' ? (
              <div className="unified-personal-tab">
                <PersonalNumerology />
              </div>
            ) : (
              <div className="unified-enhanced-tab">
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
