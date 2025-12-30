import React from 'react';

const PersonalityTraitIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 头部轮廓 */}
      <circle cx="12" cy="9" r="4.5" stroke={color} strokeWidth="2" />
      {/* 身体轮廓 */}
      <path
        d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 头部装饰 */}
      <circle cx="12" cy="9" r="2" fill={color} opacity="0.6" />
      {/* 顶部光点 */}
      <circle cx="12" cy="3" r="1" fill={color} />
      {/* 两侧装饰线 */}
      <path
        d="M4 9h2M18 9h2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 底部装饰 */}
      <circle cx="12" cy="22" r="1.5" fill={color} opacity="0.7" />
    </svg>
  );
};

export default PersonalityTraitIcon;
