import React, { useState, useMemo, useRef, useEffect } from 'react';
import DressInfo from './DressInfo';
import SeasonalHealthTab from './SeasonalHealthTab';

// 穿衣养生多标签页组件 - 简化滚动逻辑，确保顶部固定
const DressHealthTab = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [activeTab, setActiveTab] = useState('dress'); // 'dress' 或 'seasonal'
  const scrollContainerRef = useRef(null);
  const fixedHeaderRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(220); // 默认高度

  // 动态计算固定头部高度
  useEffect(() => {
    const calculateHeaderHeight = () => {
      if (fixedHeaderRef.current) {
        const height = fixedHeaderRef.current.offsetHeight;
        setHeaderHeight(height);
        
        // 更新CSS变量以便其他组件使用
        document.documentElement.style.setProperty('--dress-health-header-height', `${height}px`);
      }
    };

    // 初始计算
    calculateHeaderHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', calculateHeaderHeight);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, []);

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
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 dress-health-scroll-container">
      {/* 固定顶部区域 - 包含五行道家养生风格的banner和标签导航 */}
      <div ref={fixedHeaderRef} className="dress-health-fixed-header">
        {/* 五行道家养生风格banner - 固定定位 */}
        <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 dark:from-gray-800 dark:via-gray-900 dark:to-black">
          {/* 五行渐变背景 */}
          <div className="absolute inset-0 wuxing-gradient z-0 bg-gradient-to-r from-purple-500/30 via-indigo-600/30 to-blue-700/30 dark:from-gray-700/30 dark:via-gray-800/30 dark:to-black/30"></div>
          
          {/* 道家太极八卦符号装饰 */}
          <div className="absolute top-2 left-2 w-12 h-12 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M50,5 A45,45 0 1,1 50,95 A45,45 0 1,1 50,5" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="30" r="8" fill="currentColor"/>
              <circle cx="50" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-14 h-14 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          
          {/* 五行方位符号装饰 */}
          <div className="absolute top-4 right-6 w-6 h-6 opacity-25">
            <div className="w-full h-full rounded-full bg-wood shadow-lg"></div>
          </div>
          <div className="absolute bottom-6 left-6 w-5 h-5 opacity-25">
            <div className="w-full h-full rounded-full bg-fire shadow-lg"></div>
          </div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 opacity-25">
            <div className="w-full h-full rounded-full bg-earth shadow-lg"></div>
          </div>
          <div className="absolute bottom-4 right-1/4 w-5 h-5 opacity-25">
            <div className="w-full h-full rounded-full bg-metal shadow-lg"></div>
          </div>
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-4 h-4 opacity-25">
            <div className="w-full h-full rounded-full bg-water shadow-lg"></div>
          </div>
          
          {/* 流动的五行能量线 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 relative z-10">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-shadow-lg taoist-title">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                穿衣养生
              </span>
            </h1>
            <p className="text-white text-sm md:text-base opacity-95 font-medium taoist-subtitle mb-3">
              五行相生·阴阳调和·道法自然·养生延年
            </p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span className="text-xs bg-wood bg-opacity-30 text-white px-2 py-1 rounded-full border border-white border-opacity-20">木·生发</span>
              <span className="text-xs bg-fire bg-opacity-30 text-white px-2 py-1 rounded-full border border-white border-opacity-20">火·炎上</span>
              <span className="text-xs bg-earth bg-opacity-30 text-white px-2 py-1 rounded-full border border-white border-opacity-20">土·稼穑</span>
              <span className="text-xs bg-metal bg-opacity-30 text-white px-2 py-1 rounded-full border border-white border-opacity-20">金·从革</span>
              <span className="text-xs bg-water bg-opacity-30 text-white px-2 py-1 rounded-full border border-white border-opacity-20">水·润下</span>
            </div>
          </div>
        </div>

        {/* 标签页导航 - 五行道家养生风格 */}
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-lg border-b border-gray-300 dark:border-gray-600 taoist-tab-navigation">
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
                    className={`flex-1 py-3 md:py-4 px-1 md:px-2 text-center transition-all duration-300 relative group touch-manipulation performance-optimized taoist-tab-button ${
                      isActive
                        ? `text-${currentColor} bg-white dark:bg-gray-900 shadow-inner`
                        : 'text-gray-600 dark:text-gray-300 bg-transparent hover:bg-white dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                    }`}
                    aria-label={tab.label}
                  >
                    {/* 五行色彩活跃指示器 */}
                    {isActive && (
                      <div className={`absolute bottom-0 left-0 w-full h-1 bg-${currentColor} rounded-t-full`}></div>
                    )}
                    
                    <div className="flex flex-col items-center space-y-1 md:space-y-2">
                      {/* 图标 - 五行色彩装饰 */}
                      <div className="relative">
                        <div className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${
                          isActive ? `text-${currentColor}` : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {isActive ? tab.activeIcon : tab.icon}
                        </div>
                        {/* 五行能量光环效果 */}
                        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                          isActive 
                            ? `bg-${currentColor} opacity-20 scale-125` 
                            : 'opacity-0 scale-0 group-hover:opacity-10 group-hover:scale-110 group-active:opacity-20 group-active:scale-110'
                        }`}></div>
                      </div>
                      
                      {/* 标签文字 - 道家书法风格 */}
                      <span className={`text-sm md:text-base font-medium truncate max-w-full px-1 transition-all duration-300 ${
                        isActive ? 'font-bold tracking-wider' : 'font-normal'
                      }`}>
                        {tab.label}
                      </span>
                      
                      {/* 描述文字 - 移动端优化显示 */}
                      <span className={`text-xs opacity-80 transition-all duration-500 ${
                        isActive ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                        {tab.description}
                      </span>
                    </div>
                    
                    {/* 悬停时的五行能量流动效果 */}
                    <div className={`absolute inset-0 rounded-lg transition-all duration-500 opacity-0 group-hover:opacity-100 ${
                      isActive ? '' : 'border border-gray-200 dark:border-gray-600'
                    }`}></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 独立滚动的内容区域 - 五行道家养生风格优化 */}
      <div className="dress-health-scroll-content">
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto optimized-scroll hide-scrollbar performance-optimized scroll-performance-optimized touch-optimized virtual-scroll-container taoist-content-scroll bg-gradient-to-b from-white/95 via-gray-50/90 to-gray-100/90 dark:from-gray-800/95 dark:via-gray-900/90 dark:to-black/90"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'scroll-position',
            background: 'linear-gradient(180deg, rgba(49, 49, 49, 0.95) 0%, rgba(69, 71, 72, 0.9) 100%)'
          }}
        >
          <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 pt-4">
            {/* 标签页内容容器 - 独立滚动 */}
            <div className="mb-4">
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
            
            {/* 功能介绍卡片 - 移动端优化 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white dark:bg-gray-800 dark:bg-opacity-95 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-2 md:mr-3 shadow-md">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">五行穿衣</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-200">
                  根据当日五行属性，为您推荐吉祥配色和饮食搭配，趋吉避凶，调和身心能量
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 dark:bg-opacity-95 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-2 md:mr-3 shadow-md">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">时令养生</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-200">
                  结合四季五行规律和器官节律，提供个性化的养生建议，顺应自然，调和身心
                </p>
              </div>
            </div>

            {/* 使用说明 - 移动端优化 */}
            <div className="bg-white dark:bg-gray-800 dark:bg-opacity-95 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                使用说明
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-200">
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
      </div>
    </div>
  );
};

export default DressHealthTab;