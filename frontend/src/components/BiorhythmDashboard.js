import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import ZodiacEnergyTab from './ZodiacEnergyTab';
import HoroscopeTabNew from './HoroscopeTabNew';
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
    let isMounted = true;
    
    const checkStatus = async () => {
      if (!isMounted) return;
      await checkServiceStatus();
    };
    
    checkStatus();
    
    return () => {
      isMounted = false;
    };
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Nice Today</h3>
          <p className="text-gray-500 dark:text-gray-400">正在为您准备个性化体验...</p>
          <div className="mt-4 flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nice Today</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">您的每日生活助手</p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>
      <div className="app-scroll-content">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* 欢迎横幅 */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-600 dark:via-purple-600 dark:to-indigo-700 rounded-2xl shadow-xl text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <IconLibrary.Icon name="heart" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nice Today 生活助手</h2>
                <p className="text-blue-100 text-sm">科学算法 · 个性化建议 · 隐私保护</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>本地化计算，保护隐私数据</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                <span>科学算法，个性化生活建议</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                <span>现代化界面，支持深色模式</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签导航 - 增强版 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0 dark:border dark:border-gray-700 overflow-hidden">
          {/* 标签导航栏 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-2 border-b dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 py-3 px-6 text-center font-medium transition-all duration-300 min-w-28 rounded-lg mx-1 ${
                    activeTab === tab.id
                      ? `bg-white dark:bg-gray-700 shadow-md text-${tab.color}-600 dark:text-${tab.color}-400 border border-${tab.color}-200 dark:border-${tab.color}-800`
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-full ${
                      activeTab === tab.id 
                        ? `bg-${tab.color}-100 dark:bg-${tab.color}-900` 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <tab.icon size={20} />
                    </div>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 标签内容 */}
          <div className="p-6">
            <div className="animate-fadeIn">
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
                <HoroscopeTabNew />
              )}
              {activeTab === 'mbti' && (
                <MBTIPersonalityTabHome />
              )}
            </div>
          </div>
        </div>

        {/* 功能特色卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800/30">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                <IconLibrary.Icon name="shield" size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">隐私保护</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">所有数据本地计算，无需网络传输，确保您的个人信息安全</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                <IconLibrary.Icon name="science" size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">科学算法</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">基于生物节律、星座能量等科学原理，提供精准分析</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800/30">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-3">
                <IconLibrary.Icon name="accessibility" size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">个性化体验</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">根据您的个人信息，提供专属的生活建议和健康指导</p>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border dark:border-gray-700">
          <div className="flex items-center mb-2">
            <IconLibrary.Icon name="info" size={16} className="text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">温馨提示</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            本应用提供的所有建议和分析结果仅供参考，不构成专业医疗或心理建议。
            请结合自身实际情况合理参考，如有健康问题请咨询专业医生。
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BiorhythmDashboard;