import React from 'react';

const HuangliIcon = ({ size = 24, color = '#1a1a1a', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外圆代表天 */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      
      {/* 内方代表地 */}
      <rect x="6" y="6" width="12" height="12" stroke={color} strokeWidth="2" fill="none" />
      
      {/* 中央太极图 */}
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" fill="none" />
      
      {/* 太极阴阳鱼 */}
      <path
        d="M12 8C14.2091 8 16 9.79086 16 12H12V8Z"
        fill={color}
      />
      <path
        d="M12 16C9.79086 16 8 14.2091 8 12H12V16Z"
        fill={color}
      />
      
      {/* 上方阳爻 */}
      <rect x="10" y="4" width="4" height="1" fill={color} />
      
      {/* 下方阴爻 */}
      <rect x="10" y="19" width="1.5" height="1" fill={color} />
      <rect x="12.5" y="19" width="1.5" height="1" fill={color} />
    </svg>
  );
};

export default HuangliIcon;