import React from 'react';

const ChineseZodiacIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外层圆环 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      {/* 12生肖分布圆 */}
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" opacity="0.7" />
      {/* 虎年标记 */}
      <path
        d="M12 3v2m7 7l2-2m-9 2l-2 2m7 9l-2-2m2-9l2 2m-7-9l2 2m-2 7v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* 内层装饰圆 */}
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* 方向标记 */}
      <circle cx="12" cy="3" r="1" fill={color} opacity="0.6" />
      <circle cx="21" cy="12" r="1" fill={color} opacity="0.6" />
      <circle cx="12" cy="21" r="1" fill={color} opacity="0.6" />
      <circle cx="3" cy="12" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};

export default ChineseZodiacIcon;
