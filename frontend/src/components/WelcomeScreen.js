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
        {/* Logo 容器 */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-lg"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500/80 to-purple-600/80 rounded-[2rem] flex items-center justify-center shadow-lg border border-white/10">
            <span className="material-symbols-outlined text-white text-4xl">star</span>
          </div>
        </div>

        {/* 标题 & 语录 */}
        <div className="text-center mb-10">
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

        {/* 功能预览微卡片 - 使用独有 CSS 类名强制布局 */}
        <div className="welcome-feature-grid">
          {[
            { name: '命运', icon: 'auto_awesome', color: 'feature-amber' },
            { name: '玛雅', icon: 'schedule', color: 'feature-blue' },
            { name: '节律', icon: 'bar_chart', color: 'feature-green' },
            { name: '魅力', icon: 'person', color: 'feature-pink' },
            { name: '宜忌', icon: 'checklist', color: 'feature-purple' },
            { name: '饮食', icon: 'restaurant', color: 'feature-orange' }
          ].map((item, idx) => (
            <div key={idx} className="welcome-feature-item">
              <div className={`welcome-feature-icon ${item.color}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <span className="welcome-feature-name">{item.name}</span>
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

        /* 独有功能标签样式 - 升级为 2x3 布局 */
        .welcome-feature-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 16px 20px !important;
          justify-content: center !important;
          margin: 0 auto !important;
          width: 260px !important;
        }
        .welcome-feature-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .welcome-feature-icon {
          width: 48px !important;
          height: 48px !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .welcome-feature-icon span {
          font-size: 20px !important;
        }
        .welcome-feature-name {
          font-size: 10px !important;
          color: rgba(255, 255, 255, 0.4) !important;
          letter-spacing: 0.2em !important;
        }

        /* 颜色方案 */
        .feature-amber { background: rgba(251, 191, 36, 0.15) !important; color: #fbbf24 !important; }
        .feature-blue { background: rgba(96, 165, 250, 0.15) !important; color: #60a5fa !important; }
        .feature-green { background: rgba(52, 211, 153, 0.15) !important; color: #34d299 !important; }
        .feature-pink { background: rgba(244, 114, 182, 0.15) !important; color: #f472b6 !important; }
        .feature-purple { background: rgba(167, 139, 250, 0.15) !important; color: #a78bfa !important; }
        .feature-orange { background: rgba(251, 146, 60, 0.15) !important; color: #fb923c !important; }
        `}
      </style>
    </div>
  );
};

export default WelcomeScreen;
