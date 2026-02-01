/**
 * 正念活动卡片组件
 * 使用行内样式避免样式污染，优化移动端体验
 * 确保宽度自适应，选择按钮宽度固定
 */
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const MindfulnessActivityCard = ({ 
  activity, 
  isCompleted, 
  onToggle 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 主卡片样式 - 宽度自适应，防止变形
  const cardStyle = {
    backgroundColor: isDark ? 'transparent' : '#ffffff',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    border: isCompleted 
      ? (isDark ? '2px solid #059669' : '2px solid #34d399')
      : (isDark ? '2px solid #374151' : '2px solid #e5e7eb'),
    background: isCompleted 
      ? (isDark ? 'rgba(6, 78, 59, 0.4)' : 'linear-gradient(to right, rgba(209, 250, 229, 0.6), rgba(167, 243, 208, 0.6))')
      : 'transparent',
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    marginBottom: '6px'
  };

  // 内部容器样式
  const innerContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0
  };

  // 复选框样式 - 固定宽度，确保不拉伸变形
  const checkboxStyle = {
    flexShrink: 0,
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: isCompleted 
      ? (isDark ? '2px solid #10b981' : '2px solid #10b981')
      : (isDark ? '2px solid #4b5563' : '2px solid #d1d5db'),
    backgroundColor: isCompleted ? '#10b981' : 'transparent',
    marginRight: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  // 复选框勾选图标样式
  const checkIconStyle = {
    width: '12px',
    height: '12px',
    color: '#ffffff',
    strokeWidth: 2
  };

  // 活动图标样式
  const iconStyle = {
    flexShrink: 0,
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    marginRight: '6px',
    opacity: isCompleted ? 0.6 : 1
  };

  // 活动信息容器样式
  const infoContainerStyle = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  // 标题行样式
  const titleRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  };

  // 标题样式
  const titleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: isCompleted 
      ? (isDark ? '#9ca3af' : '#6b7280') 
      : (isDark ? '#f3f4f6' : '#111827'),
    textDecoration: isCompleted ? 'line-through' : 'none',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
    flex: 1,
    minWidth: 0
  };

  // 持续时间标签样式
  const durationBadgeStyle = {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '9999px',
    backgroundColor: isDark ? 'rgba(67, 56, 202, 0.4)' : '#e0e7ff',
    color: isDark ? '#c7d2fe' : '#4f46e5',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  // 描述样式
  const descriptionStyle = {
    fontSize: '10px',
    color: isCompleted 
      ? (isDark ? '#6b7280' : '#9ca3af') 
      : (isDark ? '#9ca3af' : '#4b5563'),
    lineHeight: '1.4',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word'
  };

  // 完成标记样式
  const completionMarkStyle = {
    flexShrink: 0,
    marginLeft: '6px'
  };

  // 完成标记内部圆样式
  const completionCircleStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  return (
    <div
      onClick={() => onToggle(activity.id)}
      style={cardStyle}
    >
      <div style={innerContainerStyle}>
        {/* 完成状态复选框 */}
        <div style={checkboxStyle}>
          {isCompleted && (
            <svg
              style={checkIconStyle}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        {/* 活动图标 */}
        <div style={iconStyle}>
          {activity.icon}
        </div>

        {/* 活动信息 */}
        <div style={infoContainerStyle}>
          <div style={titleRowStyle}>
            <h4 style={titleStyle}>
              {activity.title}
            </h4>
            {!isCompleted && (
              <span style={durationBadgeStyle}>
                {activity.duration}
              </span>
            )}
          </div>
          <p style={descriptionStyle}>
            {activity.description}
          </p>
        </div>

        {/* 完成标记 */}
        {isCompleted && (
          <div style={completionMarkStyle}>
            <div style={completionCircleStyle}>
              <svg
                style={{ width: '12px', height: '12px', color: '#ffffff' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MindfulnessActivityCard);