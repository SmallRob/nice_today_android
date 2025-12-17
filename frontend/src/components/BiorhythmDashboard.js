import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import DressInfo from './DressInfo';
import MayaCalendar from './MayaCalendar';
import { BiorhythmIcon, MayaIcon, DressIcon, IconLibrary } from './IconLibrary';

const BiorhythmDashboard = ({ appInfo = {} }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [serviceStatus, setServiceStatus] = useState({
    biorhythm: true,
    maya: true,
    dress: true
  });

  // 检测服务状态
  const checkServiceStatus = async () => {
    setLoading(true);
    
    // 所有环境下的默认状态（本地化运行）
    setServiceStatus({
      biorhythm: true,
      maya: true,
      dress: true
    });

    setLoading(false);
  };

  useEffect(() => {
    checkServiceStatus();
  }, []);

  // 标签配置 - 简化界面
  const tabs = [
    { 
      id: 'biorhythm', 
      label: '生物节律', 
      icon: BiorhythmIcon,
      description: '科学计算您的生物节律状态',
      color: 'blue'
    },
    { 
      id: 'maya', 
      label: '玛雅历法', 
      icon: MayaIcon,
      description: '探索玛雅历法智慧与能量',
      color: 'purple'
    },
    { 
      id: 'dress', 
      label: '穿衣指南', 
      icon: DressIcon,
      description: '五行能量穿衣饮食建议',
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">正在加载应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航栏 - 简化设计 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mr-3">
                <IconLibrary.Icon name="star" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nice Today</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  您的每日生活助手
                </p>
              </div>
            </div>
            
            {/* 状态指示器 - 简化 */}
            <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
              ✅ 本地化运行
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 标签导航 - 移动端优化 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm transition-colors min-w-24 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-50 dark:bg-${tab.color}-900 dark:bg-opacity-30 text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-500 dark:border-${tab.color}-400`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <tab.icon size={18} />
                  <span className="text-xs">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 标签内容 */}
          <div className="p-4">
            {activeTab === 'biorhythm' && (
              <BiorhythmTab 
                serviceStatus={serviceStatus.biorhythm}
                isDesktop={appInfo.isDesktop}
              />
            )}
            
            {activeTab === 'maya' && (
              <MayaCalendar 
                serviceStatus={serviceStatus.maya}
                isDesktop={appInfo.isDesktop}
              />
            )}
            
            {activeTab === 'dress' && (
              <DressInfo 
                serviceStatus={serviceStatus.dress}
                isDesktop={appInfo.isDesktop}
              />
            )}
          </div>
        </div>

        {/* 应用简介 - 简化版 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg shadow-lg text-white p-5">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <IconLibrary.Icon name="heart" size={16} />
            </div>
            <h2 className="text-lg font-bold">Nice Today 生活助手</h2>
          </div>
          <div className="text-blue-100 dark:text-blue-200 text-sm space-y-1">
            <p>• 本地化计算，保护您的隐私数据</p>
            <p>• 科学算法，提供个性化生活建议</p>
            <p>• 现代化界面，支持深色模式</p>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-400 dark:border-blue-500">
            <p className="text-blue-100 dark:text-blue-200 text-xs italic">
              注意：所有建议仅供参考，请结合自身实际情况合理参考。
            </p>
          </div>
        </div>
      </div>

      {/* 页脚 - 简化 */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              © 2024 Nice Today. 您的每日生活助手
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BiorhythmDashboard;