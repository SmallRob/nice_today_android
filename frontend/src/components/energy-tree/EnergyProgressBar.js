import React from 'react';

const EnergyProgressBar = ({ progress }) => {
  const { collected, limit, percentage } = progress;

  const getProgressColor = () => {
    if (percentage >= 90) {
      return { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' }; // 绿色
    } else if (percentage >= 60) {
      return { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' }; // 蓝色
    } else if (percentage >= 30) {
      return { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }; // 橙色
    } else {
      return { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' }; // 红色
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
              background: `linear-gradient(90deg, ${colors.bg} 0%, ${colors.bg}99 100%)`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          >
            <div className="energy-progress-shine"></div>
          </div>
        </div>

        {/* 能量图标装饰 */}
        <div className="energy-icons">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="energy-icon"
              style={{
                left: `${20 + (i * 20)}%`,
                opacity: clampedPercentage >= (20 + i * 20) ? 1 : 0.3,
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
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .dark .energy-progress-container {
          background: rgba(30, 41, 59, 0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .energy-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .energy-progress-labels {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .energy-progress-title {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .dark .energy-progress-title {
          color: #94a3b8;
        }

        .energy-progress-value {
          font-size: 20px;
          font-weight: 700;
        }

        .energy-progress-percentage {
          font-size: 18px;
          font-weight: 600;
          color: ${colors.bg};
        }

        .energy-progress-bar-wrapper {
          position: relative;
          height: 24px;
          border-radius: 12px;
          overflow: hidden;
        }

        .energy-progress-track {
          position: relative;
          width: 100%;
          height: 100%;
          background: #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .dark .energy-progress-track {
          background: #334155;
        }

        .energy-progress-fill {
          position: relative;
          height: 100%;
          border-radius: 12px;
          transition: width 0.5s ease;
          overflow: hidden;
        }

        .energy-progress-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shine 2s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          50%, 100% {
            left: 100%;
          }
        }

        .energy-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .energy-icon {
          position: absolute;
          transform: translateX(-50%);
          font-size: 14px;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default EnergyProgressBar;
