import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import ZodiacEnergyTab from './ZodiacEnergyTab';
import HoroscopeTabNew from './HoroscopeTabNew';
import MBTIPersonalityTabHome from './MBTIPersonalityTabHome';
import MayaCalendarTab from './MayaCalendarTab';
import { BiorhythmIcon, IconLibrary } from './IconLibrary';
import PageLayout from './PageLayout';
import DarkModeToggle from './DarkModeToggle';
import '../styles/animations.css';

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
      
      // 使用requestAnimationFrame确保流畅渲染
      requestAnimationFrame(async () => {
        if (!isMounted) return;
        await checkServiceStatus();
      });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center transition-opacity duration-300">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 animate-fade-in">Nice Today</h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>正在为您准备个性化体验...</p>
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
      <div className="app-scroll-content">
        <div className="max-w-6xl mx-auto space-y-4 p-2">

        {/* 紧凑型标签导航 - 移动端优化 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-0 dark:border dark:border-gray-700 overflow-hidden">
          {/* 标签导航栏 - 紧凑设计 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-2 py-1.5 border-b dark:border-gray-700">
            <div className="grid grid-cols-4 gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colorMap = {
                  'blue': 'bg-blue-500',
                  'purple': 'bg-purple-500',
                  'indigo': 'bg-indigo-500',
                  'pink': 'bg-pink-500'
                };
                
                return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 text-center font-medium transition-all duration-200 rounded-md relative overflow-hidden ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 shadow-sm transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
                  }`}
                >
                  {/* 活跃指示器 - 增强高亮效果 */}
                  {isActive && (
                    <>
                      {/* 背景高亮 */}
                      <div className={`absolute top-0 left-0 w-full h-full ${colorMap[tab.color]} opacity-20 rounded-md -z-10 animate-pulse`}></div>
                      {/* 顶部指示器 */}
                      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 ${colorMap[tab.color]} rounded-t-full`}></div>
                      {/* 底部指示器 */}
                      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 ${colorMap[tab.color]} rounded-b-full`}></div>
                    </>
                  )}
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`p-1 rounded-md transition-all duration-200 ${
                      isActive 
                        ? `${colorMap[tab.color]} text-white shadow-md` 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <tab.icon size={16} />
                    </div>
                    <span className={`text-xs font-medium truncate w-full transition-all duration-200 ${
                      isActive ? 'font-bold' : 'font-medium'
                    }`}>{tab.label}</span>
                  </div>
                  {/* 点击涟漪效果容器 */}
                  <span className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
                    {isActive && (
                      <span className={`absolute inset-0 ${colorMap[tab.color]} opacity-0 animate-ping`}></span>
                    )}
                  </span>
                </button>
                );
              })}
            </div>
          </div>

          {/* 标签内容 - 紧凑布局 */}
          <div className="p-2">
            <div className="animate-fade-in">
              {activeTab === 'biorhythm' && (
                <BiorhythmTab 
                  serviceStatus={serviceStatus.biorhythm}
                  isDesktop={appInfo.isDesktop}
                />
              )}
              {activeTab === 'zodiac' && (
                <ZodiacEnergyTab />
              )}
              {activeTab === 'maya' && (
                <MayaCalendarTab />
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
      </div>
      </div>
    </div>
  );
};

export default BiorhythmDashboard;