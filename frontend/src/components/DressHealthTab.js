import React, { useState, useMemo, useRef, useEffect } from 'react';
import DressInfo from './DressInfo';
import SeasonalHealthTab from './SeasonalHealthTab';

// 穿衣养生多标签页组件 - 统一滚动流逻辑，解决移动端遮挡问题
const DressHealthTab = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [activeTab, setActiveTab] = useState('dress'); // 'dress' 或 'seasonal'
  const scrollContainerRef = useRef(null);

  // 初始滚动到顶部：进入页面或切换标签时触发
  useEffect(() => {
    const scrollToTop = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    scrollToTop();
  }, [activeTab]);

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
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      {/* 核心滚动容器：包含 Banner 和 内容，确保进入时看到顶部 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black"
      >
        {/* Banner区域 - 随页面滚动 */}
        <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800">
          {/* 五行渐变背景 */}
          <div className="absolute inset-0 wuxing-gradient z-0 bg-gradient-to-r from-purple-500/30 via-indigo-600/30 to-blue-700/30"></div>

          {/* 道家装饰符号 */}
          <div className="absolute top-2 left-2 w-12 h-12 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50,5 A45,45 0 1,1 50,95 A45,45 0 1,1 50,5" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="30" r="8" fill="currentColor" />
              <circle cx="50" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-14 h-14 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3" />
            </svg>
          </div>

          <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-1 text-shadow-lg taoist-title">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                穿衣养生
              </span>
            </h1>
            <p className="text-white text-xs md:text-base opacity-95 font-medium taoist-subtitle mb-2">
              五行相生·阴阳调和·道法自然
            </p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span className="text-[10px] md:text-xs bg-wood/40 text-white px-2 py-0.5 rounded-full border border-white/20">木</span>
              <span className="text-[10px] md:text-xs bg-fire/40 text-white px-2 py-0.5 rounded-full border border-white/20">火</span>
              <span className="text-[10px] md:text-xs bg-earth/40 text-white px-2 py-0.5 rounded-full border border-white/20">土</span>
              <span className="text-[10px] md:text-xs bg-metal/40 text-white px-2 py-0.5 rounded-full border border-white/20">金</span>
              <span className="text-[10px] md:text-xs bg-water/40 text-white px-2 py-0.5 rounded-full border border-white/20">水</span>
            </div>
          </div>
        </div>

        {/* 标签页选择器 - Sticky固定在顶部 */}
        <div className="sticky top-0 z-30 bg-white dark:bg-black shadow-sm border-b border-gray-100 dark:border-gray-700 taoist-tab-navigation">
          <div className="container mx-auto">
            <div className="flex">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const wuxingColors = ['wood', 'fire', 'earth', 'metal', 'water'];
                const currentColor = wuxingColors[index % wuxingColors.length];

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 md:py-3 px-1 md:px-2 text-center transition-all duration-300 relative group touch-manipulation taoist-tab-button ${isActive
                      ? `text-${currentColor} bg-gray-50/50 dark:bg-gray-900/50`
                      : 'text-gray-400 dark:text-gray-500 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    aria-label={tab.label}
                  >
                    {isActive && (
                      <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-${currentColor}`}></div>
                    )}

                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-5 h-5 md:w-6 md:h-6 mb-0.5 transition-colors duration-300 ${isActive ? `text-${currentColor}` : 'text-gray-400 dark:text-gray-300'
                        }`}>
                        {isActive ? tab.activeIcon : tab.icon}
                      </div>
                      <span className={`text-[11px] md:text-sm font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'font-normal'
                        } ${isActive ? '' : 'dark:text-gray-300'}`}>
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
          <div className="mb-4 mx-auto max-w-2xl">
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

          {/* 穿衣养生使用指南 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              穿衣养生使用指南
            </h3>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-100 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">五行穿衣</h4>
                  <p className="text-gray-600 dark:text-gray-100">根据当日五行属性，查看吉祥配色和饮食建议，趋吉避凶，调和身心能量。按照推荐颜色搭配日常着装，可增强个人运势。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">时令养生</h4>
                  <p className="text-gray-600 dark:text-gray-100">结合四季五行规律和器官节律，了解当前季节养生要点，合理安排作息，根据个性化养生建议调整生活方式，促进身心健康。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressHealthTab;