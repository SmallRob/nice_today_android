import React, { useState, useEffect } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import '../styles/unified-numerology.css';

// 导入原有功能组件
const PersonalNumerology = React.lazy(() => import('./NumerologyPage'));
const EnhancedNumerology = React.lazy(() => import('./EnhancedNumerologyPage'));

const UnifiedNumerologyPage = () => {
  const currentConfig = useCurrentConfig();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' 或 'enhanced'
  const [userInfo, setUserInfo] = useState(null);

  // 初始化用户信息
  useEffect(() => {
    if (currentConfig && currentConfig.birthDate) {
      setUserInfo({
        birthDate: currentConfig.birthDate,
        nickname: currentConfig.nickname || '神秘用户'
      });
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

  return (
    <div className="unified-numerology-container">
      {/* 顶部标题和导航栏 */}
      <header className="unified-header">
        <div className="header-background">
          <div className="header-content">
            <h1 className="main-title">生命灵数探索</h1>
            <p className="subtitle">通过数字密码，解读你的生命轨迹</p>
            
            {/* 用户信息卡片 */}
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

        {/* 标签导航 */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <div className="tab-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6m0 0h6M12 3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
              </svg>
            </div>
            <span className="tab-label">个人灵数</span>
            <span className="tab-description">基础解读</span>
          </button>
          
          <button
            className={`tab-button ${activeTab === 'enhanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('enhanced')}
          >
            <div className="tab-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12c0 4 3.582 7 7 7s7-3 7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6m0 0h6" />
              </svg>
            </div>
            <span className="tab-label">灵数解析</span>
            <span className="tab-description">深度分析</span>
          </button>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="unified-content">
        <React.Suspense fallback={renderLoading()}>
          {activeTab === 'personal' ? (
            <div className="tab-content personal-tab">
              <PersonalNumerology />
            </div>
          ) : (
            <div className="tab-content enhanced-tab">
              <EnhancedNumerology />
            </div>
          )}
        </React.Suspense>
      </main>
    </div>
  );
};

export default UnifiedNumerologyPage;