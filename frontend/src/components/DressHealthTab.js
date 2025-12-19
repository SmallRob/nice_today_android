import React, { useState, useMemo } from 'react';
import DressInfo from './DressInfo';
import SeasonalHealthTab from './SeasonalHealthTab';

// 穿衣养生多标签页组件 - 整合穿衣指南和时令养生
const DressHealthTab = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [activeTab, setActiveTab] = useState('dress'); // 'dress' 或 'seasonal'

  // 标签页配置
  const tabs = useMemo(() => [
    {
      id: 'dress',
      label: '穿衣指南',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" clipRule="evenodd" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      description: "五行穿衣与饮食建议"
    },
    {
      id: 'seasonal',
      label: '时令养生',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
      ),
      description: "四季养生与器官节律"
    }
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面标题 - 优化移动端显示 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-b-lg shadow-lg">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <h1 className="text-xl md:text-2xl font-bold mb-1">穿衣养生</h1>
          <p className="text-purple-100 text-xs md:text-sm opacity-90">
            结合传统五行理论与现代养生知识，为您提供全方位的健康指导
          </p>
        </div>
      </div>

      {/* 主内容区域 - 优化移动端间距 */}
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* 标签页导航 - 优化移动端体验 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 md:mb-6 sticky top-0 z-10">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 md:py-4 px-1 md:px-2 text-center transition-all duration-300 relative group touch-manipulation ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-500 dark:text-gray-400 active:bg-gray-50 dark:active:bg-gray-700'
                  }`}
                  aria-label={tab.label}
                >
                  {/* 活跃指示器 */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 dark:bg-purple-400"></div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-0.5 md:space-y-1">
                    {/* 图标 - 移动端缩小 */}
                    <div className="relative">
                      <div className="w-4 h-4 md:w-5 md:h-5">
                        {isActive ? tab.activeIcon : tab.icon}
                      </div>
                      {/* 触摸反馈效果 */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-200 ${
                        isActive 
                          ? 'bg-purple-100 dark:bg-purple-900 opacity-30 scale-110' 
                          : 'opacity-0 scale-0 group-active:opacity-30 group-active:scale-110'
                      }`}></div>
                    </div>
                    
                    {/* 标签文字 - 移动端缩小字号 */}
                    <span className="text-xs md:text-sm font-medium truncate max-w-full px-0.5">
                      {tab.label}
                    </span>
                    
                    {/* 描述文字 - 移动端隐藏 */}
                    <span className={`hidden md:block text-xs opacity-75 transition-all duration-300 ${
                      isActive ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                      {tab.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 标签页内容 */}
          <div className="p-3 md:p-4">
            {activeTab === 'dress' && (
              <DressInfo 
                apiBaseUrl={apiBaseUrl}
                serviceStatus={serviceStatus}
                isDesktop={isDesktop}
              />
            )}
            
            {activeTab === 'seasonal' && (
              <SeasonalHealthTab />
            )}
          </div>
        </div>

        {/* 功能介绍卡片 - 移动端优化 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">五行穿衣</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              根据当日五行属性，为您推荐吉祥配色和饮食搭配，趋吉避凶，调和身心能量
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">时令养生</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              结合四季五行规律和器官节律，提供个性化的养生建议，顺应自然，调和身心
            </p>
          </div>
        </div>

        {/* 使用说明 - 移动端优化 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>在"穿衣指南"标签页查看每日五行穿衣配色建议</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>根据推荐颜色搭配日常着装，增强运势</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>参考饮食建议，调和体内五行平衡</span>
              </div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>在"时令养生"标签页了解当前季节养生要点</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>查看24小时器官节律，合理安排作息</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>根据养生建议调整生活方式，促进身心健康</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressHealthTab;