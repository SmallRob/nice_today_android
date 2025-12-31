import React from 'react';

const FishingGameIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 钓竿 */}
      <path
        d="M4 20 L16 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 鱼线 */}
      <path
        d="M16 4 L16 12"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* 鱼钩 */}
      <path
        d="M16 12 L16 15 A 2 2 0 0 1 14 17 L 16 17 A 2 2 0 0 1 18 15 L 18 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 鱼 */}
      <path
        d="M14 14 Q 12 14 10 16 Q 8 14 6 16 Q 4 14 6 12 Q 8 10 10 12 Q 12 14 14 14 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* 鱼眼 */}
      <circle cx="6" cy="13" r="1" fill={color} />
      {/* 水波纹 */}
      <path
        d="M10 20 Q 12 18 14 20 M 6 20 Q 8 18 10 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
};

export default FishingGameIcon;
