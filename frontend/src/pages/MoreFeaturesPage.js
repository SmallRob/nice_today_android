import { useState, memo, useCallback, lazy, Suspense } from 'react';
import styles from './MoreFeaturesPage.module.css';

// 懒加载组件以优化性能
const TarotGardenPage = lazy(() => import('./TarotGardenPage'));
const RainbowMoodPage = lazy(() => import('./RainbowMoodPage'));
const UserConfigManager = lazy(() => import('../components/UserConfigManager'));
const SettingsPage = lazy(() => import('./SettingsPage'));

// 简化的加载组件
const TabContentLoader = memo(() => (
  <div className={styles.loader}>
    <div className={styles.spinner}></div>
    <span className="text-gray-500 dark:text-gray-400 font-medium">正在加载...</span>
  </div>
));

// 主组件
const MoreFeaturesPage = memo(() => {
  const [activeTab, setActiveTab] = useState('mood'); // 默认进入彩虹心情

  // Tab切换处理
  const handleTabChange = useCallback((tabName) => {
    setActiveTab(tabName);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* 顶部标题区域 */}
      <div className={styles.header}>
        <h1>🌟 更多功能</h1>
        <p>发现应用的所有功能</p>
      </div>

      {/* 标签导航 */}
      <div className={styles.tabs}>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'mood' ? styles.active : ''}`}
            onClick={() => handleTabChange('mood')}
          >
            <span className={styles.tabIcon}>🌈</span>
            <span>心情</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'tarot' ? styles.active : ''}`}
            onClick={() => handleTabChange('tarot')}
          >
            <span className={styles.tabIcon}>🎴</span>
            <span>塔罗</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'user' ? styles.active : ''}`}
            onClick={() => handleTabChange('user')}
          >
            <span className={styles.tabIcon}>👤</span>
            <span>用户</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <span className={styles.tabIcon}>⚙️</span>
            <span>设置</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        <Suspense fallback={<TabContentLoader />}>
          <div className={styles.scrollArea}>
            {activeTab === 'mood' && <RainbowMoodPage />}
            {activeTab === 'tarot' && <TarotGardenPage />}
            {activeTab === 'user' && (
              <div className="p-4">
                <UserConfigManager />
              </div>
            )}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </Suspense>
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MoreFeaturesPage.displayName = 'MoreFeaturesPage';

export default MoreFeaturesPage;
