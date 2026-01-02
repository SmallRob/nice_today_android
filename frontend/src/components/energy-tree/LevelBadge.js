import React from 'react';
import { getLevelConfig } from '../../constants/energyLevels';

const LevelBadge = ({ level }) => {
  const levelConfig = getLevelConfig(level);
  const levelName = levelConfig.name || '种子';

  const getBadgeColor = () => {
    if (level <= 5) {
      return { bg: 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)', border: '#228B22' };
    } else if (level <= 10) {
      return { bg: 'linear-gradient(135deg, #87CEEB 0%, #4169E1 100%)', border: '#000080' };
    } else if (level <= 20) {
      return { bg: 'linear-gradient(135deg, #DDA0DD 0%, #9932CC 100%)', border: '#4B0082' };
    } else if (level <= 30) {
      return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', border: '#B8860B' };
    } else {
      return { bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: '#FF4500' };
    }
  };

  const colors = getBadgeColor();

  return (
    <div className="level-badge">
      <svg width="60" height="60" viewBox="0 0 60 60" className="level-badge-svg">
        <defs>
          {/* 徽章渐变 */}
          <linearGradient id={`badgeGradient-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>

          {/* 阴影 */}
          <filter id={`badgeShadow-${level}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>

          {/* 发光效果 */}
          <filter id={`badgeGlow-${level}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景圆 */}
        <circle
          cx="30"
          cy="30"
          r="28"
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth="2"
          filter={`url(#badgeShadow-${level})`}
        />

        {/* 内圆装饰 */}
        <circle
          cx="30"
          cy="30"
          r="24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />

        {/* 等级数字 */}
        <text
          x="30"
          y="36"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          filter={`url(#badgeGlow-${level})`}
        >
          Lv.{level}
        </text>

        {/* 星星装饰 - 根据等级显示 */}
        {level >= 1 && (
          <circle cx="30" cy="14" r="3" fill="#FFD700" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        {level >= 10 && (
          <>
            <circle cx="20" cy="18" r="2" fill="#FFD700" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="40" cy="18" r="2" fill="#FFD700" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
          </>
        )}
        {level >= 20 && (
          <>
            <circle cx="15" cy="24" r="2" fill="#FFD700" opacity="0.5">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </circle>
            <circle cx="45" cy="24" r="2" fill="#FFD700" opacity="0.5">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.2s" />
            </circle>
          </>
        )}

        {/* 光泽覆盖 */}
        <circle
          cx="30"
          cy="30"
          r="28"
          fill={`url(#badgeGradient-${level})`}
          pointerEvents="none"
        />
      </svg>

      {/* 等级名称标签 */}
      <div className="level-badge-name">{levelName}</div>

      <style>{`
        .level-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .level-badge-svg {
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .level-badge-svg:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .level-badge-name {
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default LevelBadge;
