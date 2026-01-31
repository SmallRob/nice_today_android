import React, { useState, useEffect, useRef } from 'react';
import '../styles/animations.css';
import '../styles/WelcomeScreen.css';

const WelcomeScreen = ({ onComplete, version = 'lite', appReady = false }) => {
  const [loadingText, setLoadingText] = useState('正在初始化...');
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [completed, setCompleted] = useState(false);
  const readyTimerRef = useRef(null);
  const stepsTimeoutRef = useRef(null);

  useEffect(() => {
    if (completed) return;

    // Failsafe: 如果 appReady 为 true 且超过 5 秒还没进入，强制完成
    const failsafeTimer = setTimeout(() => {
      if (appReady && !completed) {
        console.log('WelcomeScreen: Failsafe triggered');
        handleSkip();
      }
    }, 5000);

    const versionName = version === 'lite' ? '轻量版' : '炫彩版';
    const loadingSteps = [
      { text: `正在开启${versionName}...`, duration: 400 },
      { text: '同步能量...', duration: 400 },
      { text: '加载数据...', duration: 400 },
      { text: '即将开始...', duration: 300 }
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
            // 动画步骤完成后，如果 appReady 已经是 true，立即进入
            if (appReady) {
              handleSkip();
            }
          } else {
            executeNextStep();
          }
        }, loadingSteps[currentStep].duration);
      }
    };

    executeNextStep();

    return () => {
      if (stepsTimeoutRef.current) clearTimeout(stepsTimeoutRef.current);
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      clearTimeout(failsafeTimer);
    };
  }, [version, appReady, completed]);

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
      {/* 动态背景装饰 - 降低模糊度以提升性能 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-cosmic-purple/20 rounded-full blur-[60px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-cosmic-navy/30 rounded-full blur-[60px]"></div>
      </div>

      {/* 星空粒子装饰 - 减少数量到 20 个 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 2 + 0.8;
          const opacity = Math.random() * 0.4 + 0.1;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                filter: 'blur(0.5px)'
              }}
            ></div>
          );
        })}
      </div>

      {/* 主要内容卡片 */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* 标题 & 语录 */}
        <div className="text-center mb-16 mt-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-widest">
            NICE TODAY
          </h1>
          <p className="text-blue-100/50 text-[10px] tracking-[0.3em] uppercase">
            Mindful Living & Guidance
          </p>
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
            <div className="mt-2 flex justify-center">
              <button
                onClick={handleSkip}
                className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] active:scale-95 transition-all"
              >
                进入应用
              </button>
            </div>
          )}
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
    </div>
  );
};

export default WelcomeScreen;
