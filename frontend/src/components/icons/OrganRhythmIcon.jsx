import React from 'react';

const OrganRhythmIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 体能曲线 */}
      <path
        d="M2 12c2-3 4-5 7-5s5 2 7 5c2-3 4-5 7-5s5 2 7 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 情绪曲线 */}
      <path
        d="M2 14c2-2 4-3 7-3s5 1 7 3c2-2 4-3 7-3s5 1 7 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* 智力曲线 */}
      <path
        d="M2 10c2-4 4-6 7-6s5 3 7 6c2-4 4-6 7-6s5 3 7 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* 中心交叉点 */}
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* 底部基线 */}
      <line x1="2" y1="22" x2="22" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* 顶部时间指示 */}
      <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* 流量点 */}
      <circle cx="9" cy="6" r="1" fill={color} opacity="0.5" />
      <circle cx="15" cy="18" r="1" fill={color} opacity="0.5" />
    </svg>
  );
};

export default OrganRhythmIcon;
