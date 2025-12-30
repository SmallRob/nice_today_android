import React from 'react';

const TakashimaIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
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
      {/* 六边形轮廓 */}
      <path
        d="M12 3l7 4.5v6.5l-7 4.5-7-4.5v-6.5l7-4.5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 内部三角形 */}
      <path
        d="M12 8l3 3-3 3-3-3z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* 顶点装饰 */}
      <circle cx="12" cy="3" r="1" fill={color} opacity="0.6" />
      <circle cx="19" cy="14" r="1" fill={color} opacity="0.6" />
      <circle cx="12" cy="21" r="1" fill={color} opacity="0.6" />
      <circle cx="5" cy="14" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};

export default TakashimaIcon;
