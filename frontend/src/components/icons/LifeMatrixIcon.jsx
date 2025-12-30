import React from 'react';

const LifeMatrixIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 左上块 */}
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <circle cx="7" cy="7" r="1.5" fill={color} />
      
      {/* 右上块 */}
      <rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <path d="M17 6v2m-2-1h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* 左下块 */}
      <rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <path d="M6 16l2 2m0-2l-2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* 右下块 */}
      <rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <circle cx="17" cy="17" r="1.5" fill={color} />
      
      {/* 连接线 */}
      <path d="M11 7h2m0 6h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 11v2M17 11v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export default LifeMatrixIcon;
