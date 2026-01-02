import React, { useState, useEffect } from 'react';

const EnergyBubble = ({ bubble, onClick }) => {
  const [animate, setAnimate] = useState(true);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    // 随机动画延迟，让气泡看起来自然
    const delay = Math.random() * 2;
    const timer = setTimeout(() => {
      setAnimate(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, []);

  // 根据大小类型确定样式
  const getSizeStyles = () => {
    const size = bubble.size || 40;
    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${bubble.x}%`,
      top: `${bubble.y}%`,
    };
  };

  // 根据大小确定颜色
  const getBubbleColor = () => {
    if (bubble.sizeType === 'small') {
      return 'rgba(102, 126, 234, 0.7)'; // 蓝色
    } else if (bubble.sizeType === 'medium') {
      return 'rgba(118, 75, 162, 0.7)'; // 紫色
    } else {
      return 'rgba(236, 72, 153, 0.7)'; // 粉色
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!popped) {
      setPopped(true);
      onClick(bubble);
    }
  };

  if (popped) {
    return null;
  }

  return (
    <div
      className={`energy-bubble ${animate ? 'animate' : ''}`}
      style={getSizeStyles()}
      onClick={handleClick}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="bubble-svg"
      >
        <defs>
          {/* 气泡渐变 */}
          <radialGradient id={`bubbleGradient-${bubble.id}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor={getBubbleColor()} />
          </radialGradient>

          {/* 高光效果 */}
          <radialGradient id={`bubbleHighlight-${bubble.id}`} cx="25%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>

          {/* 发光滤镜 */}
          <filter id={`bubbleGlow-${bubble.id}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 气泡主体 */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#bubbleGradient-${bubble.id})`}
          filter={`url(#bubbleGlow-${bubble.id})`}
          style={{
            animation: 'bubbleFloat 3s ease-in-out infinite',
            animationDelay: `${Math.random() * 2}s`,
          }}
        />

        {/* 高光 */}
        <circle
          cx="35"
          cy="35"
          r="15"
          fill={`url(#bubbleHighlight-${bubble.id})`}
        />

        {/* 能量值显示 */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          +{bubble.energy}
        </text>
      </svg>

      {/* CSS动画 */}
      <style>{`
        .energy-bubble {
          position: absolute;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.3s ease;
          z-index: 10;
        }

        .energy-bubble:hover {
          transform: scale(1.2);
        }

        .energy-bubble:active {
          transform: scale(0.9);
        }

        .energy-bubble.animate {
          animation: bubblePop 0.5s ease-out;
        }

        @keyframes bubbleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bubblePop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .bubble-svg {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }
      `}</style>
    </div>
  );
};

export default EnergyBubble;
