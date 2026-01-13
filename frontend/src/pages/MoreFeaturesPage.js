import { useState, memo, useCallback, lazy, Suspense } from 'react';
import '../index.css';
// import './MoreFeaturesPage.css';
import './styles/private-styles.css'; // 私有样式，避免全局污染

// 懒加载组件以优化性能
const TarotGardenPage = lazy(() => import('./TarotGardenPage'));
const RainbowMoodPage = lazy(() => import('./RainbowMoodPage'));
const UserConfigManager = lazy(() => import('../components/UserConfigManager'));
const UserDataManager = lazy(() => import('../components/UserDataManager'));
const SettingsPage = lazy(() => import('./SettingsPage'));

// 简化的加载组件
const TabContentLoader = memo(() => (
  <div className="tab-content-loader">
    <div className="spinner"></div>
    <span className="spinner-label">正在加载...</span>
  </div>
));

// 主组件
const MoreFeaturesPage = memo(() => {
  const [activeTab, setActiveTab] = useState('mood'); // 默认进入彩虹心情

  // Tab切换处理
  const handleTabChange = useCallback((tabName) => {
    setActiveTab(tabName);
  }, []);

  // 通用的消息显示函数
  const showMessage = useCallback((message, type = 'info') => {
    // 创建并显示消息提示
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
      type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
        'bg-blue-100 text-blue-700 border border-blue-300'
      }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // 3秒后自动移除消息
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv);
      }
    }, 3000);
  }, []);

  return (
    <div className="more-features-page-wrapper">
      {/* 顶部标题区域 - 固定定位 */}
      <div className="more-features-header">
        <div className="header-content">
          <h1>🌟 更多功能</h1>
          <p>发现应用的所有功能</p>
        </div>
      </div>

      {/* 标签导航 - 固定定位 */}
      <div className="more-features-tabs">
        <div className="tabs-container">
          <div className="tabs-wrapper">
            <button
              className={`more-features-tab-button ${activeTab === 'mood' ? 'active' : ''}`}
              onClick={() => handleTabChange('mood')}
            >
              🌈 彩虹心情
            </button>
            <button
              className={`more-features-tab-button ${activeTab === 'tarot' ? 'active' : ''}`}
              onClick={() => handleTabChange('tarot')}
            >
              🎴 塔罗花园
            </button>
            <button
              className={`more-features-tab-button ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => handleTabChange('user')}
            >
              👤 用户面板
            </button>
            <button
              className={`more-features-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              ⚙️ 系统设置
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="more-features-content">
        {activeTab === 'mood' && (
          <div className="content-with-scroll">
            <Suspense fallback={<TabContentLoader />}>
              <RainbowMoodPage />
            </Suspense>
          </div>
        )}

        {activeTab === 'tarot' && (
          <div className="content-with-scroll">
            <Suspense fallback={<TabContentLoader />}>
              <TarotGardenPage />
            </Suspense>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="h-full flex flex-col">
            {/* 用户配置标题 */}
            {/* <div className="user-config-header">
              <div className="header-content">
                <h1>👤 用户配置</h1>
                <p>管理您的个人信息和偏好设置</p>
              </div>
            </div> */}
            <Suspense fallback={<TabContentLoader />}>
              <div className="content-with-scroll">
                <div className="content-container space-y-6">
                  <div className="content-card">
                    <UserConfigManager />
                  </div>
                  <div className="content-card">
                    <UserDataManager showMessage={showMessage} />
                  </div>
                </div>
              </div>
            </Suspense>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-with-scroll">
            <Suspense fallback={<TabContentLoader />}>
              <SettingsPage />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MoreFeaturesPage.displayName = 'MoreFeaturesPage';

export default MoreFeaturesPage;