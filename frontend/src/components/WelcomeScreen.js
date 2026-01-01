import React, { useState, useEffect, useRef } from 'react';
import '../styles/animations.css';

const WelcomeScreen = ({ onComplete, version = 'lite', appReady = false }) => {
  const [loadingText, setLoadingText] = useState('正在初始化...');
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [completed, setCompleted] = useState(false);
  const readyTimerRef = useRef(null);
  const stepsTimeoutRef = useRef(null);

  useEffect(() => {
    if (completed) return;

    const versionName = version === 'lite' ? '轻量版' : '炫彩版';
    const loadingSteps = [
      { text: `正在开启${versionName}...`, duration: 700 },
      { text: '同步宇宙能量...', duration: 600 },
      { text: '加载星图数据...', duration: 700 },
      { text: '调优系统性能...', duration: 500 },
      { text: '美好即将开始...', duration: 400 }
    ];

    let currentStep = 0;
    let accumulatedProgress = 0;

    const executeNextStep = () => {
      if (completed) return;

      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        const stepProgress = (100 / loadingSteps.length);
        const targetProgress = Math.min(accumulatedProgress + stepProgress, 95);

        setProgress(targetProgress);

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
        }, 800);
      }
    };

    executeNextStep();

    return () => {
      if (stepsTimeoutRef.current) clearTimeout(stepsTimeoutRef.current);
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, [version, appReady]);

  useEffect(() => {
    if (appReady && canSkip && !completed) {
      setProgress(100);
      readyTimerRef.current = setTimeout(() => {
        setCompleted(true);
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 500);
    }
  }, [appReady, canSkip, completed, onComplete]);

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
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a1a] flex flex-col items-center justify-center z-[9999]">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      </div>

      {/* 粒子装饰感 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* 主要内容卡片 */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        {/* Logo 容器 */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-blue-500/30 rounded-[32px] blur-2xl group-hover:bg-blue-500/50 transition-all duration-700 animate-pulse"></div>
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(31,38,135,0.37)] border border-white/20 backdrop-blur-sm overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            <svg className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-45deg] animate-[shimmer_3s_infinite]"></div>
          </div>
        </div>

        {/* 标题 & 语录 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-4 tracking-wider drop-shadow-sm">
            NICE TODAY
          </h1>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30"></div>
            <p className="text-blue-100/70 text-sm sm:text-base font-light tracking-[0.2em] uppercase">
              Healing & Guidance
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30"></div>
          </div>
        </div>

        {/* 进度控制区 */}
        <div className="w-full max-w-xs sm:max-w-sm mb-12">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-blue-200/80 text-xs font-medium tracking-wide animate-pulse">
              {loadingText}
            </span>
            <span className="text-white/40 text-[10px] font-mono">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-white/20 to-transparent animate-[scroll_2s_linear_infinite]"></div>
            </div>
          </div>

          {(canSkip || appReady) && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSkip}
                className="px-6 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/60 text-xs transition-all duration-300 backdrop-blur-sm"
              >
                跳过启动
              </button>
            </div>
          )}
        </div>

        {/* 功能预览微卡片 - Staggered entrance */}
        <div className="grid grid-cols-4 gap-4 w-full opacity-0 animate-[fadeIn_1s_ease-out_forwards_0.5s]">
          {[
            { name: '运势', icon: 'M11 3a1 1 0 10-2 0 1 1 0 002 0zM4.586 7L3.172 5.586a2 2 0 112.828-2.828L7.414 4.172a1 1 0 00-1.414 1.414L4.586 7zm14.828 0l-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414a2 2 0 11-2.828 2.828L15.172 9.586a1 1 0 001.414-1.414L18 9.586l1.414-1.414z', color: 'text-yellow-400' },
            { name: '玛雅', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-400' },
            { name: '节律', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-emerald-400' },
            { name: '魅力', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-pink-400' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                <svg className={`w-5 h-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <span className="text-[10px] text-white/40 font-medium tracking-tighter uppercase whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center space-y-3 px-6 animate-[fadeIn_1s_ease-out_forwards_1s] opacity-0">
        <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
          <p className="text-[10px] sm:text-xs text-blue-200/60 font-medium tracking-widest uppercase">
            {version === 'lite' ? 'Lite Version' : 'Premium Experience'} • Build 2026
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[9px] text-white/20 font-medium">SYSTEM SECURE</span>
          </div>
          <div className="w-px h-2 bg-white/10"></div>
          <span className="text-[9px] text-white/20 font-medium uppercase tracking-widest">Powered by AI Cosmos</span>
        </div>
      </div>

      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skew-x(-45deg); }
          50% { transform: translateX(150%) skew-x(-45deg); }
          100% { transform: translateX(150%) skew-x(-45deg); }
        }
        @keyframes scroll {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        `}
      </style>
    </div>
  );
};

export default WelcomeScreen;
