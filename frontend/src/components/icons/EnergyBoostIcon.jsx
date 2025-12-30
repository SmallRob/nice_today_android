import React from 'react';

const EnergyBoostIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 闪电主体 */}
      <path
        d="M13 2L4 14h9l-2 8 11-12h-9l2-8z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 内部闪电细节 */}
      <path
        d="M13 6H9l2 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* 能量光晕 */}
      <circle cx="13" cy="2" r="2" fill={color} opacity="0.3" />
      <circle cx="13" cy="2" r="1" fill={color} />
      {/* 外围光点 */}
      <circle cx="19" cy="5" r="1" fill={color} opacity="0.5" />
      <circle cx="7" cy="11" r="1" fill={color} opacity="0.5" />
      <circle cx="11" cy="20" r="1" fill={color} opacity="0.5" />
    </svg>
  );
};

export default EnergyBoostIcon;
