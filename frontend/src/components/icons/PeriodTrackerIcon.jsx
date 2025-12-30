import React from 'react';

const PeriodTrackerIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外圈 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      {/* 月相弧线 */}
      <path
        d="M12 4a8 8 0 000 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 时间刻度 */}
      <path
        d="M12 3v3m0 12v3M3 12h3m12 0h3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* 内圈 */}
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* 流量点 */}
      <circle cx="12" cy="6" r="1" fill={color} opacity="0.6" />
      <circle cx="18" cy="12" r="1" fill={color} opacity="0.6" />
      <circle cx="12" cy="18" r="1" fill={color} opacity="0.6" />
      <circle cx="6" cy="12" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};

export default PeriodTrackerIcon;
