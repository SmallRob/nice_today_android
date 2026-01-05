/**
 * 正念活动主卡片组件
 * 简化的正念活动展示组件
 * 使用行内样式避免样式污染，确保9:16手机正常显示
 */
import React from 'react';
import MindfulnessActivityCard from './MindfulnessActivityCard';

const MindfulnessActivities = ({ 
  activities, 
  completedTasks, 
  onToggleTask,
  onRefreshActivities,
  energyGuidance
}) => {
  // 主容器样式 - 确保在窄屏上正常显示
  const containerStyle = {
    background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff, #fdf2f8)',
    border: '1px solid #c7d2fe',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '12px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    marginBottom: '16px'
  };

  // 顶部指示器容器样式
  const topBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    gap: '6px'
  };

  // 左侧指示器样式
  const leftIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0
  };

  // 能量UP+徽章样式
  const energyBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '9999px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    flexShrink: 0
  };

  // 今日计数样式
  const todayCountStyle = {
    fontSize: '12px',
    color: '#4b5563',
    whiteSpace: 'nowrap'
  };

  // 刷新按钮样式
  const refreshButtonStyle = {
    fontSize: '12px',
    color: '#8b5cf6',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '9999px',
    border: '1px solid #ddd6fe',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  };

  // 能量指引容器样式
  const guidanceContainerStyle = {
    marginBottom: '12px',
    background: 'linear-gradient(to right, rgba(224, 231, 255, 0.7), rgba(237, 233, 254, 0.7))',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #c7d2fe',
    width: '100%',
    maxWidth: '100%'
  };

  // 能量指引内容样式
  const guidanceContentStyle = {
    display: 'flex',
    alignItems: 'flex-start'
  };

  // 指引文本样式
  const guidanceTextStyle = {
    fontSize: '12px',
    color: '#3730a3',
    fontWeight: '500',
    lineHeight: '1.4',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };

  // 任务列表容器样式
  const tasksContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    maxWidth: '100%'
  };

  return (
    <div style={containerStyle}>
      {/* 顶部：能量UP+ 指示器 */}
      <div style={topBarStyle}>
        <div style={leftIndicatorStyle}>
          <div style={energyBadgeStyle}>
            <span style={{ fontSize: '14px', marginRight: '4px' }}>⚡</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>能量UP+</span>
          </div>
          <div style={todayCountStyle}>
            今日: <span style={{ fontWeight: '600', color: '#4f46e5' }}>{completedTasks.length}/4</span>
          </div>
        </div>
        <button
          onClick={onRefreshActivities}
          style={refreshButtonStyle}
          title="换一批"
        >
          <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span style={{ display: 'none' }}>换一批</span>
          <span>刷新</span>
        </button>
      </div>

      {/* 能量指引 */}
      {energyGuidance && (
        <div style={guidanceContainerStyle}>
          <div style={guidanceContentStyle}>
            <span style={{ fontSize: '16px', marginRight: '6px', flexShrink: 0 }}>🌟</span>
            <p style={guidanceTextStyle}>
              {energyGuidance}
            </p>
          </div>
        </div>
      )}

      {/* 每日正念任务列表 */}
      <div style={tasksContainerStyle}>
        {activities.map(activity => (
          <MindfulnessActivityCard
            key={activity.id}
            activity={activity}
            isCompleted={completedTasks.includes(activity.id)}
            onToggle={onToggleTask}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(MindfulnessActivities);