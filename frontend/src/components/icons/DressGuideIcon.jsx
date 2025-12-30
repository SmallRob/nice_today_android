import React from 'react';

const DressGuideIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 衣服主体 */}
      <path
        d="M12 3L7 8v3h2v9h6v-9h2v-3l-5-5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 衣服领口 */}
      <path
        d="M12 3v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 袖子 */}
      <path
        d="M7 8l-3 2m13-2l3 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 中线 */}
      <line x1="12" y1="8" x2="12" y2="20" stroke={color} strokeWidth="1.5" />
      {/* 装饰点 */}
      <circle cx="12" cy="3" r="1.5" fill={color} />
      <circle cx="4" cy="20" r="1" fill={color} opacity="0.5" />
      <circle cx="20" cy="20" r="1" fill={color} opacity="0.5" />
    </svg>
  );
};

export default DressGuideIcon;
