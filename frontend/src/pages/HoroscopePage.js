/**
 * 星座运势模块页面
 * 复制原星座运势页面作为基础
 * 保留并优化星座核心功能
 */
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import HoroscopeTab from '../components/HoroscopeTab';


const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('daily');
  const [error, setError] = useState(null);

  // 初始化
  useEffect(() => {
    // 模拟加载，确保用户配置已加载
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [currentConfig]);

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
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* 头部 */}
      <div className={`px-4 pt-6 pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              星座运势
            </h1>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            星座运势分析 · 每日能量预测
          </p>
        </div>
      </div>

      {/* Tab导航 */}
      <div className={`px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex overflow-x-auto space-x-4 py-3">
          <button
            onClick={() => handleTabChange('daily')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${selectedTab === 'daily'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            今日运势
          </button>
          <button
            onClick={() => handleTabChange('weekly')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${selectedTab === 'weekly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            本周运势
          </button>
          <button
            onClick={() => handleTabChange('monthly')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${selectedTab === 'monthly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            本月运势
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {error && (
          <div className={`mb-3 px-4 py-2 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
            <p>{error}</p>
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
