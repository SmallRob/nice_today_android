import React, { useState, useEffect, useRef } from 'react';
import '../styles/animations.css';

const WelcomeScreen = ({ onComplete, version = 'lite', appReady = false }) => {
  const [loadingText, setLoadingText] = useState('正在启动...');
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [completed, setCompleted] = useState(false);
  const readyTimerRef = useRef(null);
  const stepsTimeoutRef = useRef(null);

  useEffect(() => {
    if (completed) return; // 已完成，跳过

    const versionName = version === 'lite' ? '轻量版' : '炫彩版';
    const loadingSteps = [
      { text: `正在启动${versionName}...`, duration: 600 },
      { text: '加载用户配置...', duration: 500 },
      { text: '准备数据缓存...', duration: 600 },
      { text: '优化性能设置...', duration: 500 },
      { text: '完成初始化...', duration: 400 }
    ];

    let currentStep = 0;
    let accumulatedProgress = 0;

    const executeNextStep = () => {
      if (completed) return;

      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        const stepProgress = (100 / loadingSteps.length);
        const targetProgress = Math.min(accumulatedProgress + stepProgress, 95);

        setProgress(targetProgress); // 直接设置目标进度，避免累加错误

        stepsTimeoutRef.current = setTimeout(() => {
          currentStep++;
          accumulatedProgress = targetProgress;

          if (currentStep >= loadingSteps.length) {
            setCanSkip(true);
            checkReadyState();
          } else {
            executeNextStep();
          }
        }, loadingSteps[currentStep].duration);
      }
    };

    const checkReadyState = () => {
      if (completed) return;

      if (appReady) {
        setProgress(100);
        readyTimerRef.current = setTimeout(() => {
          setCompleted(true);
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }, 500);
      }
    };

    // 开始执行步骤
    executeNextStep();

    // 清理函数
    return () => {
      if (stepsTimeoutRef.current) {
        clearTimeout(stepsTimeoutRef.current);
        stepsTimeoutRef.current = null;
      }
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
    };
  }, [version]); // 只在 version 变化时重新执行

  // 监听 appReady 状态变化
  useEffect(() => {
    if (appReady && canSkip && !completed) {
      setProgress(100);
      readyTimerRef.current = setTimeout(() => {
        setCompleted(true);
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 300);
    }
  }, [appReady, canSkip]); // 移除 progress 依赖

  // 跳过功能
  const handleSkip = () => {
    if (canSkip || appReady || completed) {
      setCompleted(true);
      setProgress(100);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center z-50 animate-fade-in">
      {/* 主要内容 */}
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 text-center">
        {/* 应用图标 - 增强动画效果 */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden transform transition-transform duration-300 hover:scale-105">
            {/* 动画背景 */}
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            {/* 主图标 */}
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10 animate-bounce" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          {/* 装饰圆圈 - 增强动画 */}
          <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0 -left-4 w-4 h-4 sm:w-5 sm:h-5 bg-pink-400 rounded-full animate-ping opacity-60"></div>
        </div>
        
        {/* 应用名称 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">Nice Today</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">每一天都是美好的开始</p>
        
        {/* 版本指示 */}
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-md backdrop-blur-sm">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {version === 'lite' ? '轻量版' : '炫彩版'}
        </div>
      </div>
      
      {/* 加载进度条 - 优化响应式 */}
      <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-6 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center animate-fade-in font-medium">
          {loadingText}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* 进度条动画效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            <div className="absolute right-0 top-0 h-full w-2 bg-white opacity-40 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(progress)}% 完成
          </span>
          {/* 跳过按钮 */}
          {(canSkip || appReady) && (
            <button
              onClick={handleSkip}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline"
            >
              跳过
            </button>
          )}
        </div>
      </div>
      
      {/* 功能预览 - 增强响应式设计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-8 max-w-xs sm:max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in transform transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.3s' }}>
          <div className="text-purple-500 mb-2 sm:mb-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">星座运势</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in transform transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.5s' }}>
          <div className="text-blue-500 mb-2 sm:mb-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">玛雅历法</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in transform transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.7s' }}>
          <div className="text-green-500 mb-2 sm:mb-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">生物节律</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in transform transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.9s' }}>
          <div className="text-pink-500 mb-2 sm:mb-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">人格魅力</div>
        </div>
      </div>
      
      {/* 底部提示 - 增强响应式 */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center animate-fade-in px-4" style={{ animationDelay: '1.5s' }}>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
          为您提供个性化的生活指导
        </p>
        {/* 额外的状态信息 */}
        <div className="mt-2 flex justify-center items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">系统正常</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-400">安全连接</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;