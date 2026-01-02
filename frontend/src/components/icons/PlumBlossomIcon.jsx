import React from 'react';

const PlumBlossomIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 外圈圆环 */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      
      {/* 梅花五瓣 */}
      <path
        d="M12 7 Q15 5 16 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7 Q9 5 8 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7 Q14 9 14 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7 Q10 9 10 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7 L12 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* 中心花蕊 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      
      {/* 八卦符号装饰 */}
      <path
        d="M12 14v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 16h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 15h2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* 小装饰花瓣 */}
      <circle cx="8" cy="6" r="1" fill={color} opacity="0.5" />
      <circle cx="16" cy="6" r="1" fill={color} opacity="0.5" />
    </svg>
  );
};

export default PlumBlossomIcon;
