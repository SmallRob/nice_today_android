import React from 'react';

const EnergyTree = ({ level, levelConfig, onClick }) => {
  const treeSize = levelConfig.treeSize || 60;

  return (
    <div className="energy-tree" onClick={onClick}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 250"
        style={{ maxWidth: '300px' }}
        className="energy-tree-svg"
      >
        <defs>
          {/* 树木渐变 */}
          <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={levelConfig.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#228B22" stopOpacity="0.8" />
          </linearGradient>

          {/* 树干渐变 */}
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A0522D" stopOpacity="0.9" />
          </linearGradient>

          {/* 叶子渐变 */}
          <radialGradient id="leafGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={levelConfig.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={levelConfig.color} stopOpacity="0.4" />
          </radialGradient>

          {/* 阴影 */}
          <filter id="treeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 发光效果 */}
          <filter id="treeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 地面 */}
        <ellipse
          cx="100"
          cy="240"
          rx="80"
          ry="15"
          fill="#8B4513"
          opacity="0.2"
        />

        {/* 树干 */}
        <g filter="url(#treeShadow)">
          <path
            d="M95,200 Q100,180 100,140 Q100,100 95,80 L105,80 Q100,100 100,140 Q100,180 105,200 Z"
            fill="url(#trunkGradient)"
          />
        </g>

        {/* 树枝和叶子 - 根据等级调整复杂度 */}
        <g filter="url(#treeGlow)">
          {/* 主树冠 */}
          <ellipse
            cx="100"
            cy="80"
            rx={treeSize * 0.8}
            ry={treeSize * 0.6}
            fill="url(#treeGradient)"
            opacity="0.9"
          />

          {/* 第二层 */}
          <ellipse
            cx="85"
            cy="100"
            rx={treeSize * 0.5}
            ry={treeSize * 0.4}
            fill="url(#leafGradient)"
            opacity="0.7"
          />
          <ellipse
            cx="115"
            cy="100"
            rx={treeSize * 0.5}
            ry={treeSize * 0.4}
            fill="url(#leafGradient)"
            opacity="0.7"
          />

          {/* 第三层 - 较低等级时只有一层 */}
          {level >= 3 && (
            <>
              <ellipse
                cx="100"
                cy="60"
                rx={treeSize * 0.6}
                ry={treeSize * 0.45}
                fill="url(#leafGradient)"
                opacity="0.6"
              />
              <ellipse
                cx="75"
                cy="75"
                rx={treeSize * 0.4}
                ry={treeSize * 0.3}
                fill="url(#leafGradient)"
                opacity="0.5"
              />
              <ellipse
                cx="125"
                cy="75"
                rx={treeSize * 0.4}
                ry={treeSize * 0.3}
                fill="url(#leafGradient)"
                opacity="0.5"
              />
            </>
          )}

          {/* 第四层 - 中等级 */}
          {level >= 10 && (
            <>
              <ellipse
                cx="90"
                cy="55"
                rx={treeSize * 0.35}
                ry={treeSize * 0.28}
                fill="url(#leafGradient)"
                opacity="0.4"
              />
              <ellipse
                cx="110"
                cy="55"
                rx={treeSize * 0.35}
                ry={treeSize * 0.28}
                fill="url(#leafGradient)"
                opacity="0.4"
              />
            </>
          )}

          {/* 第五层 - 高等级 */}
          {level >= 20 && (
            <>
              <ellipse
                cx="100"
                cy="45"
                rx={treeSize * 0.3}
                ry={treeSize * 0.25}
                fill="url(#leafGradient)"
                opacity="0.3"
              />
              <ellipse
                cx="80"
                cy="50"
                rx={treeSize * 0.25}
                ry={treeSize * 0.2}
                fill="url(#leafGradient)"
                opacity="0.3"
              />
              <ellipse
                cx="120"
                cy="50"
                rx={treeSize * 0.25}
                ry={treeSize * 0.2}
                fill="url(#leafGradient)"
                opacity="0.3"
              />
            </>
          )}

          {/* 第六层 - 古树阶段 */}
          {level >= 30 && (
            <>
              <ellipse
                cx="100"
                cy="35"
                rx={treeSize * 0.25}
                ry={treeSize * 0.2}
                fill="url(#leafGradient)"
                opacity="0.25"
              />
              <ellipse
                cx="85"
                cy="40"
                rx={treeSize * 0.2}
                ry={treeSize * 0.15}
                fill="url(#leafGradient)"
                opacity="0.2"
              />
              <ellipse
                cx="115"
                cy="40"
                rx={treeSize * 0.2}
                ry={treeSize * 0.15}
                fill="url(#leafGradient)"
                opacity="0.2"
              />
            </>
          )}
        </g>

        {/* 树枝 - 仅在中高等级显示 */}
        {level >= 6 && (
          <g stroke="url(#trunkGradient)" strokeWidth="2" fill="none" opacity="0.6">
            <path d="M98,140 Q80,130 70,115" />
            <path d="M102,140 Q120,130 130,115" />
          </g>
        )}

        {level >= 15 && (
          <g stroke="url(#trunkGradient)" strokeWidth="1.5" fill="none" opacity="0.5">
            <path d="M75,115 Q65,105 55,95" />
            <path d="M125,115 Q135,105 145,95" />
          </g>
        )}

        {/* 特殊效果 - 神树 */}
        {level >= 32 && (
          <g>
            {/* 发光光晕 */}
            <circle
              cx="100"
              cy="80"
              r="treeSize * 0.9"
              fill="url(#leafGradient)"
              opacity="0.1"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <circle
              cx="100"
              cy="80"
              r="treeSize * 0.7"
              fill="url(#leafGradient)"
              opacity="0.2"
              style={{
                animation: 'pulse 2s ease-in-out infinite 0.5s',
              }}
            />
          </g>
        )}

        {/* 树上的装饰物（如花朵、果实等） */}
        {level >= 5 && [...Array(Math.min(level, 10))].map((_, i) => (
          <circle
            key={i}
            cx={80 + Math.random() * 40}
            cy={60 + Math.random() * 50}
            r={3 + Math.random() * 4}
            fill={level >= 32 ? '#FFD700' : ['#FFB6C1', '#87CEEB', '#98FB98'][i % 3]}
            opacity="0.7"
          />
        ))}
      </svg>

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
        }

        .energy-tree-svg {
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .energy-tree-svg:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default EnergyTree;
