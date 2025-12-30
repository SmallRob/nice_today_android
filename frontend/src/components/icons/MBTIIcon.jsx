import React from 'react';

const MBTIIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 脑部外轮廓 */}
      <path
        d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9S16.97 3 12 3z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 思考/分析的元素 */}
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 侧边装饰线 */}
      <path
        d="M16.5 7.5l-2 2M7.5 16.5l2-2M16.5 16.5l-2-2M7.5 7.5l2 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 中心点 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
};

export default MBTIIcon;
