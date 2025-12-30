import React from 'react';

const BiorhythmIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 体能曲线（红色系）*/}
      <path
        d="M2 12c2-4 4-6 7-6s5 2 7 6c2-4 4-6 7-6s5 2 7 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* 情绪曲线（蓝色系）*/}
      <path
        d="M2 14c2-2 4-4 7-4s5 3 7 4c2-2 4-4 7-4s5 3 7 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* 智力曲线（绿色系）*/}
      <path
        d="M2 10c2-3 4-5 7-5s5 4 7 5c2-3 4-5 7-5s5 4 7 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* 时间轴 */}
      <line x1="2" y1="22" x2="22" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export default BiorhythmIcon;
