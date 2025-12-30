import React from 'react';

const HoroscopeIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外层光晕 */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.5" />
      {/* 主圆圈 */}
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" />
      {/* 内圆 */}
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
      {/* 十字交叉线 */}
      <path
        d="M12 2v5M12 17v5M2 12h5M17 12h5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 对角线 */}
      <path
        d="M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 中心星芒 */}
      <path d="M12 10l1 1 1-1-1-1z" fill={color} />
    </svg>
  );
};

export default HoroscopeIcon;
