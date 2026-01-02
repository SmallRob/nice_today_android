import React from 'react';

const LiuyaoIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 六爻外圈 */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      
      {/* 六爻线条 - 从上到下 */}
      {/* 第一爻 - 阳爻 */}
      <line x1="6" y1="6" x2="18" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* 第二爻 - 阴爻 */}
      <line x1="6" y1="9" x2="11" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="9" x2="18" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* 第三爻 - 阳爻 */}
      <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* 第四爻 - 阴爻 */}
      <line x1="6" y1="15" x2="11" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="15" x2="18" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* 第五爻 - 阳爻 */}
      <line x1="6" y1="18" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* 中心装饰 - 铜钱 */}
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="0.5" fill={color} />
      
      {/* 右上角小铜钱装饰 */}
      <circle cx="17" cy="7" r="1.5" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
};

export default LiuyaoIcon;
