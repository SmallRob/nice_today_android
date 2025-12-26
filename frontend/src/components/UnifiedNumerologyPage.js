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

  // 初始化用户信息
  useEffect(() => {
    try {
      if (currentConfig && currentConfig.birthDate) {
        setUserInfo({
          birthDate: currentConfig.birthDate,
          nickname: currentConfig.nickname || '神秘用户'
        });
      } else {
        // 如果没有用户配置，使用默认值
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
    <div className="unified-numerology-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#fee2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <svg style={{ width: '40px', height: '40px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 style={{ color: '#1f2937', fontSize: '20px', marginBottom: '12px' }}>生命灵数加载失败</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
        {error?.message || '加载生命灵数功能时发生错误'}
      </p>
      <button
        onClick={() => window.location.href = '/settings'}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
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
        <Suspense fallback={renderLoading()}>
          {activeTab === 'personal' ? (
            <div className="tab-content personal-tab">
              <PersonalNumerology />
            </div>
          ) : (
            <div className="tab-content enhanced-tab">
              <EnhancedNumerology />
            </div>
          )}
        </Suspense>
      </main>
    </div>
  );
};

export default UnifiedNumerologyPage;