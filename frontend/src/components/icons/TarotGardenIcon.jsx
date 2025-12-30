import React from 'react';

const TarotGardenIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 主卡片 */}
      <rect
        x="6"
        y="3"
        width="12"
        height="17"
        rx="1.5"
        stroke={color}
        strokeWidth="2"
      />
      {/* 卡片上的图案 */}
      <path
        d="M9 9h6M9 12h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 星星符号 */}
      <path
        d="M15 7l0.5-1.5 1.5-0.5-1.5-0.5-0.5-1.5-0.5 1.5-1.5 0.5 0.5 1.5 1.5 0.5-0.5 1.5z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 月亮符号 */}
      <path
        d="M9 16a2 2 0 10 0 0 4 2 2 0 01-2 2 3 3 0 00-3 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 顶部装饰点 */}
      <circle cx="12" cy="3" r="1.5" fill={color} />
      {/* 底部装饰点 */}
      <circle cx="12" cy="20" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
};

export default TarotGardenIcon;
