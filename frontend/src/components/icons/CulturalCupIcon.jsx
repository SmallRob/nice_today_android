import React from 'react';

const CulturalCupIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 杯身 */}
      <path
        d="M6 8c0 5 2.5 9 6 9s6-4 6-9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 杯口 */}
      <path
        d="M6 8c0-2 2-4 6-4s6 2 6 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 把手 */}
      <path
        d="M18 9c2 0 3 1.5 3 3s-1 3-3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 内部液体 */}
      <path
        d="M8 10c0 3.5 1.5 6 4 6s4-2.5 4-6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* 底部基座 */}
      <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* 装饰点 */}
      <circle cx="12" cy="10" r="1" fill={color} opacity="0.5" />
      <circle cx="6" cy="8" r="1" fill={color} opacity="0.5" />
    </svg>
  );
};

export default CulturalCupIcon;
