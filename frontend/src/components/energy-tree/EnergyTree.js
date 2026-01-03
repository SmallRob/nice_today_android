import React from 'react';

const EnergyTree = ({ level, levelConfig, onClick }) => {
  const treeSize = levelConfig.treeSize || 60;

  const adjustedTreeSize = Math.min(treeSize, 80); // 限制最大尺寸
  
  return (
    <div className="energy-tree" onClick={onClick}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 250"
        style={{ maxWidth: '300px', maxHeight: '350px' }}
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
        
        {/* 草丛效果 */}
        {level >= 2 && (
          <g opacity="0.6">
            <path d="M70,235 Q75,225 80,235" stroke={levelConfig.color} strokeWidth="1" fill="none" />
            <path d="M85,237 Q90,227 95,237" stroke={levelConfig.color} strokeWidth="1" fill="none" />
            <path d="M110,235 Q115,225 120,235" stroke={levelConfig.color} strokeWidth="1" fill="none" />
            <path d="M125,237 Q130,227 135,237" stroke={levelConfig.color} strokeWidth="1" fill="none" />
          </g>
        )}

        {/* 树干 */}
        <g filter="url(#treeShadow)">
          <path
            d="M95,200 Q100,180 100,140 Q100,100 95,80 Q100,100 100,140 Q100,180 105,200 Z"
            fill="url(#trunkGradient)"
            stroke="#5D4037"
            strokeWidth="0.5"
            opacity="0.9"
          />
          {/* 树干纹理 */}
          <path
            d="M98,180 Q100,175 102,180"
            stroke="#3E2723"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M97,150 Q100,145 103,150"
            stroke="#3E2723"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M98,120 Q100,115 102,120"
            stroke="#3E2723"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        </g>

        {/* 树枝和叶子 - 根据等级调整复杂度 */}
        <g filter="url(#treeGlow)">
          {/* 主树冠 */}
          <ellipse
            cx="100"
            cy="80"
            rx={adjustedTreeSize * 0.7}
            ry={adjustedTreeSize * 0.6}
            fill="url(#treeGradient)"
            opacity="0.9"
          />
          {/* 主树冠纹理 */}
          <ellipse
            cx="100"
            cy="80"
            rx={adjustedTreeSize * 0.5}
            ry={adjustedTreeSize * 0.4}
            fill="url(#leafGradient)"
            opacity="0.2"
          />

          {/* 第二层 - 左右分枝 */}
          <ellipse
            cx="85"
            cy="95"
            rx={adjustedTreeSize * 0.5}
            ry={adjustedTreeSize * 0.4}
            fill="url(#leafGradient)"
            opacity="0.7"
          />
          <ellipse
            cx="115"
            cy="95"
            rx={adjustedTreeSize * 0.5}
            ry={adjustedTreeSize * 0.4}
            fill="url(#leafGradient)"
            opacity="0.7"
          />
          {/* 第二层纹理 */}
          <ellipse
            cx="85"
            cy="95"
            rx={adjustedTreeSize * 0.3}
            ry={adjustedTreeSize * 0.25}
            fill="url(#treeGradient)"
            opacity="0.15"
          />
          <ellipse
            cx="115"
            cy="95"
            rx={adjustedTreeSize * 0.3}
            ry={adjustedTreeSize * 0.25}
            fill="url(#treeGradient)"
            opacity="0.15"
          />

          {/* 第三层 - 较低等级时只有一层 */}
          {level >= 3 && (
            <>
              <ellipse
                cx="100"
                cy="60"
                rx={adjustedTreeSize * 0.6}
                ry={adjustedTreeSize * 0.45}
                fill="url(#leafGradient)"
                opacity="0.6"
              />
              <ellipse
                cx="75"
                cy="75"
                rx={adjustedTreeSize * 0.4}
                ry={adjustedTreeSize * 0.3}
                fill="url(#leafGradient)"
                opacity="0.5"
              />
              <ellipse
                cx="125"
                cy="75"
                rx={adjustedTreeSize * 0.4}
                ry={adjustedTreeSize * 0.3}
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
                rx={adjustedTreeSize * 0.35}
                ry={adjustedTreeSize * 0.28}
                fill="url(#leafGradient)"
                opacity="0.4"
              />
              <ellipse
                cx="110"
                cy="55"
                rx={adjustedTreeSize * 0.35}
                ry={adjustedTreeSize * 0.28}
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
                rx={adjustedTreeSize * 0.3}
                ry={adjustedTreeSize * 0.25}
                fill="url(#leafGradient)"
                opacity="0.3"
              />
              <ellipse
                cx="80"
                cy="50"
                rx={adjustedTreeSize * 0.25}
                ry={adjustedTreeSize * 0.2}
                fill="url(#leafGradient)"
                opacity="0.3"
              />
              <ellipse
                cx="120"
                cy="50"
                rx={adjustedTreeSize * 0.25}
                ry={adjustedTreeSize * 0.2}
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
                rx={adjustedTreeSize * 0.25}
                ry={adjustedTreeSize * 0.2}
                fill="url(#leafGradient)"
                opacity="0.25"
              />
              <ellipse
                cx="85"
                cy="40"
                rx={adjustedTreeSize * 0.2}
                ry={adjustedTreeSize * 0.15}
                fill="url(#leafGradient)"
                opacity="0.2"
              />
              <ellipse
                cx="115"
                cy="40"
                rx={adjustedTreeSize * 0.2}
                ry={adjustedTreeSize * 0.15}
                fill="url(#leafGradient)"
                opacity="0.2"
              />
            </>
          )}
        </g>

        {/* 树枝 - 仅在中高等级显示 */}
        {level >= 6 && (
          <g stroke="url(#trunkGradient)" strokeWidth="2" fill="none" opacity="0.7">
            <path d="M100,140 Q85,120 75,100" />
            <path d="M100,140 Q115,120 125,100" />
            <path d="M100,120 Q90,110 85,95" />
            <path d="M100,120 Q110,110 115,95" />
          </g>
        )}

        {level >= 15 && (
          <g stroke="url(#trunkGradient)" strokeWidth="1.5" fill="none" opacity="0.6">
            <path d="M75,100 Q65,90 55,80" />
            <path d="M125,100 Q135,90 145,80" />
            <path d="M85,95 Q80,85 75,75" />
            <path d="M115,95 Q120,85 125,75" />
          </g>
        )}

        {/* 特殊效果 - 神树 */}
        {level >= 32 && (
          <g>
            {/* 发光光晕 */}
            <circle
              cx="100"
              cy="80"
              r={adjustedTreeSize * 0.9}
              fill="url(#leafGradient)"
              opacity="0.1"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <circle
              cx="100"
              cy="80"
              r={adjustedTreeSize * 0.7}
              fill="url(#leafGradient)"
              opacity="0.2"
              style={{
                animation: 'pulse 2s ease-in-out infinite 0.5s',
              }}
            />
          </g>
        )}

        {/* 微光效果 - 随等级增加 */}
        {level >= 8 && [...Array(Math.min(Math.floor(level/4), 8))].map((_, i) => {
          const x = 85 + Math.random() * 30;
          const y = 70 + Math.random() * 50;
          const size = 0.5 + Math.random() * 1.5;
          
          return (
            <circle
              key={`glow-${i}`}
              cx={x}
              cy={y}
              r={size}
              fill="#FFFFFF"
              opacity={0.3 + Math.random() * 0.4}
              style={{
                filter: 'blur(1px)',
              }}
            />
          );
        })}

        {/* 树上的装饰物（如花朵、果实等） */}
        {level >= 5 && [...Array(Math.min(Math.floor(level/2), 20))].map((_, i) => {
          // 生成随机位置，但限制在树冠范围内
          const x = 80 + Math.random() * 40;
          const y = 60 + Math.random() * 60;
          
          // 根据等级选择装饰物颜色
          const colors = level >= 32 ? ['#FFD700', '#FFA500', '#FF6347'] : 
                       level >= 20 ? ['#FFB6C1', '#FF69B4', '#FF1493'] : 
                       level >= 10 ? ['#87CEEB', '#4682B4', '#00BFFF'] : 
                       ['#98FB98', '#32CD32', '#228B22'];
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.5 + Math.random() * 2.5}
              fill={colors[i % colors.length]}
              opacity="0.75"
              style={{
                filter: 'blur(0.5px)',
              }}
            />
          );
        })}
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
          transition: transform 0.2s ease, filter 0.3s ease;
        }

        .energy-tree-svg:hover {
          transform: scale(1.05);
          filter: brightness(1.1) saturate(1.1);
        }
      `}</style>
    </div>
  );
};

export default EnergyTree;
