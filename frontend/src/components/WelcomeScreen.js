import React, { useState, useEffect } from 'react';
import '../styles/animations.css';

const WelcomeScreen = ({ onComplete, version = 'lite' }) => {
  const [loadingText, setLoadingText] = useState('初始化应用...');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const versionName = version === 'lite' ? '轻量版' : '炫彩版';
    const loadingSteps = [
      { text: `正在启动${versionName}...`, duration: 800 },
      { text: '加载用户配置...', duration: 600 },
      { text: '准备数据缓存...', duration: 700 },
      { text: '优化性能...', duration: 900 }
    ];
    
    let currentStep = 0;
    let accumulatedProgress = 0;
    
    const stepsInterval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        const stepProgress = (100 / loadingSteps.length);
        setProgress(accumulatedProgress + stepProgress);
        
        setTimeout(() => {
          currentStep++;
          accumulatedProgress += stepProgress;
          
          if (currentStep >= loadingSteps.length) {
            setProgress(100);
            clearInterval(stepsInterval);
            
            // 额外等待时间确保良好的用户体验
            setTimeout(() => {
              if (typeof onComplete === 'function') {
                onComplete();
              }
            }, 300);
          }
        }, loadingSteps[currentStep].duration);
      }
    }, 100);
    
    return () => clearInterval(stepsInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center z-50 animate-fade-in">
      {/* 主要内容 */}
      <div className="max-w-md w-full mx-auto px-6 text-center">
        {/* 应用图标 */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
            {/* 动画背景 */}
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            {/* 星座图标 */}
            <svg className="w-12 h-12 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          {/* 装饰圆圈 */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* 应用名称 */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Nice Today</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">每一天都是美好的开始</p>
        
        {/* 版本指示 */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium mb-8 shadow-md">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {version === 'lite' ? '轻量版' : '炫彩版'}
        </div>
      </div>
      
      {/* 加载进度条 */}
      <div className="w-full max-w-xs mx-auto mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center animate-fade-in">
          {loadingText}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* 进度条动画效果 */}
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
          {Math.round(progress)}% 完成
        </div>
      </div>
      
      {/* 功能预览 */}
      <div className="grid grid-cols-2 gap-3 mt-8 max-w-xs mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-purple-500 mb-1">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">星座运势</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-blue-500 mb-1">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">玛雅历法</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="text-green-500 mb-1">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">生物节律</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="text-red-500 mb-1">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">穿衣指南</div>
        </div>
      </div>
      
      {/* 底部提示 */}
      <div className="absolute bottom-6 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          为您提供个性化的生活指导
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;