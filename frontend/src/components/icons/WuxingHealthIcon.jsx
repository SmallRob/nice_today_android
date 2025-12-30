import React from 'react';

const WuxingHealthIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外层圆圈 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      {/* 五芒星 */}
      <path
        d="M12 5l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 内层装饰 */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* 五芒星顶点装饰 */}
      <circle cx="12" cy="5" r="1" fill={color} opacity="0.6" />
      <circle cx="19.5" cy="14.5" r="1" fill={color} opacity="0.6" />
      <circle cx="16.5" cy="20" r="1" fill={color} opacity="0.6" />
      <circle cx="7.5" cy="20" r="1" fill={color} opacity="0.6" />
      <circle cx="4.5" cy="14.5" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};

export default WuxingHealthIcon;
