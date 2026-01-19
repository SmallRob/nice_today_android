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
    <div className="fixed inset-0 overflow-hidden cosmic-bg flex flex-col items-center justify-center z-[9999]">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cosmic-purple/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cosmic-navy/40 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      </div>

      {/* 星空粒子装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 2 + 0.5;
          const opacity = Math.random() * 0.6 + 0.2;
          const color = Math.random() > 0.8 ? 'bg-neon-blue' : 'bg-white';
          const animationDuration = `${Math.random() * 5 + 3}s`;
          const animationDelay = `${Math.random() * 10}s`;
          const twinkle = Math.random() > 0.5 ? 'animate-pulse' : '';
          return (
            <div
              key={i}
              className={`absolute rounded-full ${color} ${twinkle}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDuration,
                animationDelay,
                filter: 'blur(0.5px)'
              }}
            ></div>
          );
        })}
      </div>

      {/* 主要内容卡片 */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        {/* Logo 容器 */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] blur-xl opacity-40"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/20">
            <span className="material-symbols-outlined text-white text-5xl font-fill-1">star</span>
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
        <div className="w-full px-4 mb-12">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] text-white/50 tracking-widest">
              {loadingText}
            </span>
            <span className="text-[10px] text-white/70">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full progress-bar-bg rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full progress-bar-fill rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
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

        {/* 功能预览微卡片 */}
        <div className="grid grid-cols-2 gap-0.5 justify-items-center max-w-[160px]">
          {[
            { name: 'FORTUNE', icon: 'auto_awesome', color: 'text-neon-yellow' },
            { name: 'MAYA', icon: 'schedule', color: 'text-neon-blue' },
            { name: 'RHYTHM', icon: 'bar_chart', color: 'text-neon-green', highlighted: true },
            { name: 'CHARM', icon: 'person', color: 'text-neon-pink' }
          ].map((item, idx) => (
            <div key={idx} className={`cosmic-card glow-border rounded-lg p-1 flex flex-col items-center justify-center w-16 h-16 cursor-pointer hover:bg-white/5 transition-colors ${item.highlighted ? 'border-indigo-500/40 bg-indigo-500/10' : ''}`}>
              <span className={`material-symbols-outlined ${item.color} text-lg`}>{item.icon}</span>
              <span className="text-[6px] tracking-[0.6em] text-white/70 mt-0.5">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center space-y-2 py-4 px-6">
        <div className="px-6 py-1.5 border border-white/20 rounded-full text-[10px] tracking-[0.2em] text-white/50 uppercase">
          {version === 'lite' ? 'Lite Version' : 'Premium Experience'} • Build 2026
        </div>
        <div className="flex items-center gap-2 text-[9px] tracking-widest text-white/30 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span>
          System Secure | Powered by AI Cosmos
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
        .cosmic-bg {
          background-color: #0a0b1e;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 100px 150px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 200px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 300px 250px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
        }
        .cosmic-card {
          background: rgba(17, 20, 50, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-border {
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
        }
        .progress-bar-bg {
          background: rgba(255, 255, 255, 0.05);
          border: 0.5px solid rgba(255, 255, 255, 0.2);
        }
        .progress-bar-fill {
          background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);
        }
        `}
      </style>
    </div>
  );
};

export default WelcomeScreen;
