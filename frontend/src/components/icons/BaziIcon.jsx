import React from 'react';

const BaziIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 八卦外圈 */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      {/* 阴阳太极曲线 */}
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000-8z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 12a4 4 0 100 8 4 4 0 000 8z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* 八卦短线装饰 */}
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* 阴阳眼 */}
      <circle cx="12" cy="9" r="0.8" fill={color} />
      <circle cx="12" cy="15" r="0.8" fill={color} opacity="0.5" />
    </svg>
  );
};

export default BaziIcon;
