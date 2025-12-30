import React from 'react';

const TodoIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 笔记本主体 */}
      <path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 已完成的任务 */}
      <path
        d="M9 11l2 2 4-4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 未完成的任务行 */}
      <path
        d="M9 17h6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 顶部装饰点 */}
      <circle cx="12" cy="7" r="1" fill={color} />
    </svg>
  );
};

export default TodoIcon;
