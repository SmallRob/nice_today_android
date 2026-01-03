import React from 'react';

const BodyMetricsIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外圈圆形背景 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity="0.3" />
      {/* 人体轮廓 - 简化的人形图标 */}
      <path
        d="M12 3a3 3 0 100 6 3 3 0 000-6z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 身体 */}
      <path
        d="M12 9c-2.5 0-4.5 2-4.5 4.5v2c0 1.5 2 2.5 4.5 2.5s4.5-1 4.5-2.5v-2c0-2.5-2-4.5-4.5-4.5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 左臂 */}
      <path
        d="M7.5 13.5l-2.5 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 右臂 */}
      <path
        d="M16.5 13.5l2.5 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 左腿 */}
      <path
        d="M10 18v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 右腿 */}
      <path
        d="M14 18v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 身体中心点 */}
      <circle cx="12" cy="14" r="1.5" fill={color} opacity="0.6" />
      {/* 身高刻度线 */}
      <line x1="20" y1="3" x2="20" y2="19" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="19" y1="8" x2="21" y2="8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="19" y1="13" x2="21" y2="13" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="19" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
};

export default BodyMetricsIcon;
