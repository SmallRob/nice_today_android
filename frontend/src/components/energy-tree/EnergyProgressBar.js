import React from 'react';

const EnergyProgressBar = ({ progress }) => {
  const { collected, limit, percentage } = progress;

  const getProgressColor = () => {
    if (percentage >= 90) {
      return { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', gradient: 'linear-gradient(90deg, #10b981, #34d399, #10b981)' }; // 绿色
    } else if (percentage >= 60) {
      return { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)' }; // 蓝色
    } else if (percentage >= 30) {
      return { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' }; // 橙色
    } else {
      return { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', gradient: 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)' }; // 红色
    }
  };

  const colors = getProgressColor();
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="energy-progress-container">
      <div className="energy-progress-info">
        <div className="energy-progress-labels">
          <span className="energy-progress-title">今日能量</span>
          <span className="energy-progress-value" style={{ color: colors.bg }}>
            {collected}/{limit}
          </span>
        </div>
        <div className="energy-progress-percentage">
          {clampedPercentage.toFixed(1)}%
        </div>
      </div>

      <div className="energy-progress-bar-wrapper">
        <div className="energy-progress-track">
          <div
            className="energy-progress-fill"
            style={{
              width: `${clampedPercentage}%`,
              background: colors.gradient,
              boxShadow: `0 0 15px ${colors.glow}, inset 0 0 10px rgba(255, 255, 255, 0.2)`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* 能量流动效果 */}
            <div className="energy-flow"></div>
            {/* 闪光效果 */}
            <div className="energy-shine"></div>
            {/* 粒子效果 */}
            <div className="energy-particles"></div>
          </div>
        </div>

        {/* 能量刷新动画图标 */}
        <div className="energy-refresh-icons">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="energy-refresh-icon"
              style={{
                left: `${12.5 * i}%`,
                opacity: clampedPercentage >= (12.5 * i) ? 1 : 0.2,
                animationDelay: `${i * 0.2}s`
              }}
            >
              ⚡
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .energy-progress-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .dark .energy-progress-container {
          background: rgba(15, 23, 42, 0.85);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .energy-progress-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg,
            rgba(59, 130, 246, 0.5),
            rgba(16, 185, 129, 0.5),
            rgba(245, 158, 11, 0.5),
            rgba(239, 68, 68, 0.5));
          z-index: -1;
          border-radius: 22px;
          animation: borderGlow 3s linear infinite;
        }

        @keyframes borderGlow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        .energy-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .energy-progress-labels {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .energy-progress-title {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .dark .energy-progress-title {
          color: #94a3b8;
        }

        .energy-progress-value {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .energy-progress-percentage {
          font-size: 20px;
          font-weight: 700;
          color: ${colors.bg};
          min-width: 60px;
          text-align: right;
        }

        .energy-progress-bar-wrapper {
          position: relative;
          height: 32px;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.05);
        }

        .dark .energy-progress-bar-wrapper {
          background: rgba(255, 255, 255, 0.05);
        }

        .energy-progress-track {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(226, 232, 240, 0.3);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dark .energy-progress-track {
          background: rgba(51, 65, 85, 0.3);
        }

        .energy-progress-fill {
          position: relative;
          height: 100%;
          border-radius: 16px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .energy-flow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: flow 2.5s ease-in-out infinite;
        }

        .energy-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 20%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shine 2s ease-in-out infinite;
        }

        .energy-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 100px 100px;
          animation: particles 3s linear infinite;
        }

        @keyframes flow {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        @keyframes particles {
          0% { background-position: 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 100px 100px, 100px 100px, 100px 100px, 100px 100px; }
        }

        .energy-refresh-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .energy-refresh-icon {
          position: absolute;
          transform: translateX(-50%);
          font-size: 16px;
          transition: opacity 0.5s ease;
          animation: pulse 2s infinite ease-in-out;
          text-shadow: 0 0 8px currentColor;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(0.9); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        /* 响应式设计 */
        @media (max-width: 640px) {
          .energy-progress-container {
            padding: 16px;
            border-radius: 16px;
          }

          .energy-progress-bar-wrapper {
            height: 28px;
            border-radius: 14px;
          }

          .energy-progress-title {
            font-size: 12px;
          }

          .energy-progress-value {
            font-size: 20px;
          }

          .energy-progress-percentage {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyProgressBar;
