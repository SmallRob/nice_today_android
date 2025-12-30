import React from 'react';

const DailyCardIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
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
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      {/* 卡片顶部装饰 */}
      <line x1="4" y1="8" x2="20" y2="8" stroke={color} strokeWidth="1.5" />
      {/* 星星图案 */}
      <path
        d="M9 12l0.8 2.5 2.5-0.8-2.5 0.8-0.8-2.5z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M15 12l0.8 2.5 2.5-0.8-2.5 0.8-0.8-2.5z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 文本行 */}
      <line x1="7" y1="16" x2="17" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1="7" y1="18" x2="12" y2="18" stroke={color} strokeWidth="1.5" />
      {/* 装饰点 */}
      <circle cx="7" cy="11" r="1.5" fill={color} opacity="0.6" />
      <circle cx="17" cy="11" r="1.5" fill={color} opacity="0.6" />
    </svg>
  );
};

export default DailyCardIcon;
