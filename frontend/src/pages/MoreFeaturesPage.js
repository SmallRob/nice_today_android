import { useState, memo, useCallback, lazy, Suspense } from 'react';
import '../index.css';
import './MoreFeaturesPage.css';

// 懒加载组件以优化性能
const TarotGardenPage = lazy(() => import('./TarotGardenPage'));
const UserConfigManager = lazy(() => import('../components/UserConfigManager'));
const SettingsPage = lazy(() => import('./SettingsPage'));

// 简化的加载组件
const TabContentLoader = memo(() => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-300 border-t-purple-600 dark:border-purple-600 dark:border-t-purple-400"></div>
    <span className="ml-3 text-purple-900 dark:text-purple-200 font-medium">正在加载...</span>
  </div>
));

// 主组件
const MoreFeaturesPage = memo(() => {
  const [activeTab, setActiveTab] = useState('tarot');

  // Tab切换处理
  const handleTabChange = useCallback((tabName) => {
    setActiveTab(tabName);
  }, []);

  return (
    <div className="more-features-page-wrapper h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部标题区域 - 固定定位 */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-800 shadow-sm border-b border-purple-200 dark:border-purple-800">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">🌟 更多功能</h1>
          <p className="text-xs text-white text-center opacity-90 mt-1">发现应用的所有功能</p>
        </div>
      </div>

      {/* 标签导航 - 固定定位 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex bg-purple-100 dark:bg-purple-900 rounded-lg p-1 w-full max-w-lg mx-auto">
            <button
              className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-all ${activeTab === 'tarot'
                ? 'bg-white dark:bg-gray-700 text-purple-800 dark:text-purple-200 shadow-sm font-semibold'
                : 'text-purple-900 dark:text-purple-300 hover:text-purple-950 dark:hover:text-purple-100'
                }`}
              onClick={() => handleTabChange('tarot')}
            >
              🎴 塔罗花园
            </button>
            <button
              className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-all ${activeTab === 'user'
                ? 'bg-white dark:bg-gray-700 text-purple-800 dark:text-purple-200 shadow-sm font-semibold'
                : 'text-purple-900 dark:text-purple-300 hover:text-purple-950 dark:hover:text-purple-100'
                }`}
              onClick={() => handleTabChange('user')}
            >
              👤 用户配置
            </button>
            <button
              className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-all ${activeTab === 'settings'
                ? 'bg-white dark:bg-gray-700 text-purple-800 dark:text-purple-200 shadow-sm font-semibold'
                : 'text-purple-900 dark:text-purple-300 hover:text-purple-950 dark:hover:text-purple-100'
                }`}
              onClick={() => handleTabChange('settings')}
            >
              ⚙️ 系统设置
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'tarot' && (
          <Suspense fallback={<TabContentLoader />}>
            <TarotGardenPage />
          </Suspense>
        )}

        {activeTab === 'user' && (
          <div className="h-full flex flex-col">
            {/* 用户配置标题 */}
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-800 shadow-sm border-b border-blue-200 dark:border-blue-800">
              <div className="container mx-auto px-4 py-3">
                <h1 className="text-lg font-bold text-white">👤 用户配置</h1>
                <p className="text-xs text-white text-center opacity-90 mt-1">管理您的个人信息和偏好设置</p>
              </div>
            </div>
            <Suspense fallback={<TabContentLoader />}>
              <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-4 max-w-4xl">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <UserConfigManager />
                  </div>
                </div>
              </div>
            </Suspense>
          </div>
        )}

        {activeTab === 'settings' && (
          <Suspense fallback={<TabContentLoader />}>
            <SettingsPage />
          </Suspense>
        )}
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MoreFeaturesPage.displayName = 'MoreFeaturesPage';

export default MoreFeaturesPage;
