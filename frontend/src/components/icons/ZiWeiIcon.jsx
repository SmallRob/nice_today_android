import React from 'react';

const ZiWeiIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外层罗盘圈 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      {/* 内层圈 */}
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
      {/* 罗盘方向线 */}
      <path
        d="M12 3v5M12 16v5M3 12h5M16 12h5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 对角线 */}
      <path
        d="M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* 中心星芒 */}
      <path
        d="M12 10l1 2 1-2-1-2-1 2z"
        fill={color}
      />
      {/* 中心圆点 */}
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.8" />
    </svg>
  );
};

export default ZiWeiIcon;
