import React from 'react';

const FinanceIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
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
        x="3"
        y="6"
        width="14"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      {/* 内部线条 */}
      <line x1="5" y1="10" x2="15" y2="10" stroke={color} strokeWidth="1.5" />
      <line x1="5" y1="13" x2="12" y2="13" stroke={color} strokeWidth="1.5" />
      <line x1="5" y1="16" x2="15" y2="16" stroke={color} strokeWidth="1.5" />
      {/* 上升箭头 */}
      <path
        d="M19 10l3-3 3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 10h-5a2 2 0 000 4h2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 装饰点 */}
      <circle cx="5" cy="10" r="1" fill={color} />
      <circle cx="5" cy="16" r="1" fill={color} />
    </svg>
  );
};

export default FinanceIcon;
