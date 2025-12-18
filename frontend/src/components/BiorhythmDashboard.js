import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import ZodiacEnergyTab from './ZodiacEnergyTab';
import HoroscopeTab from './HoroscopeTab';
import MBTIPersonalityTabHome from './MBTIPersonalityTabHome';
import { BiorhythmIcon, IconLibrary } from './IconLibrary';
import PageLayout from './PageLayout';
import DarkModeToggle from './DarkModeToggle';

const BiorhythmDashboard = ({ appInfo = {} }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [serviceStatus, setServiceStatus] = useState({
    biorhythm: true
  });

  // 检测服务状态
  const checkServiceStatus = async () => {
    setLoading(true);
    
    // 所有环境下的默认状态（本地化运行）
    setServiceStatus({
      biorhythm: true
    });

    setLoading(false);
  };

  useEffect(() => {
    checkServiceStatus();
  }, []);

  // 标签配置 - 添加生肖能量和星座运程标签
  const tabs = [
    { 
      id: 'biorhythm', 
      label: '生物节律', 
      icon: BiorhythmIcon,
      description: '科学计算您的生物节律状态',
      color: 'blue'
    },
    { 
      id: 'zodiac', 
      label: '生肖能量', 
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '根据生肖提供能量指引',
      color: 'purple'
    },
    { 
      id: 'horoscope', 
      label: '星座运程', 
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      description: '根据星座提供运势指导',
      color: 'indigo'
    },
    { 
      id: 'mbti', 
      label: '人格魅力', 
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: '探索16型人格的魅力与潜能',
      color: 'pink'
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
    <PageLayout 
      title="Nice Today"
      subtitle="您的每日生活助手"
      bgGradient={true}
      headerAction={<DarkModeToggle />}
    >
      <div className="max-w-4xl space-y-6">
        {/* 标签导航 - 移动端优化 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
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
            {activeTab === 'zodiac' && (
              <ZodiacEnergyTab />
            )}
            {activeTab === 'horoscope' && (
              <HoroscopeTab />
            )}
            {activeTab === 'mbti' && (
              <MBTIPersonalityTabHome />
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
    </PageLayout>
  );
};

export default BiorhythmDashboard;