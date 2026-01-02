import React from 'react';

const HabitTrackerIcon = ({ size = 24, color = '#1a1a1a', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 习惯打卡的图标 - 使用勾选框和日历元素 */}
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 9h8" />
    <path d="M8 13h6" />
    <path d="M16 19L10 13L8 15" />
    <path d="M12 4v4" />
    <path d="M7.5 4v4" />
    <path d="M16.5 4v4" />
  </svg>
);

export default HabitTrackerIcon;