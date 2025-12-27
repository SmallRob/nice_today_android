/**
 * 星座运势模块页面
 * 复制原星座运势页面作为基础
 * 保留并优化星座核心功能
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import HoroscopeTab from '../components/HoroscopeTab';

const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('daily');

  // 初始化
  useEffect(() => {
    // 模拟加载
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Tab切换
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-pink-900/30 dark:to-purple-900/30 ${theme}`}>
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-white hover:text-pink-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">星座运势</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-4 py-3">
            <button
              onClick={() => handleTabChange('daily')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${
                selectedTab === 'daily'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}
            >
              今日运势
            </button>
            <button
              onClick={() => handleTabChange('weekly')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${
                selectedTab === 'weekly'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}
            >
              本周运势
            </button>
            <button
              onClick={() => handleTabChange('monthly')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${
                selectedTab === 'monthly'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}
            >
              本月运势
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 星座运势内容 */}
        <HoroscopeTab
          currentConfig={currentConfig}
          theme={theme}
          viewMode={selectedTab}
        />
      </div>
    </div>
  );
};

export default HoroscopePage;
