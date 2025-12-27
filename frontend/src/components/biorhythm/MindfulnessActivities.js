/**
 * 正念活动主卡片组件
 * 简化的正念活动展示组件
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
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border border-indigo-100 dark:border-purple-700/50 rounded-lg shadow-sm p-3 md:p-4">
      {/* 顶部：能量UP+ 指示器 */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-md">
            <span className="text-lg mr-1.5">⚡</span>
            <span className="text-sm font-bold">能量UP+</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-100">
            今日完成: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{completedTasks.length}/4</span>
          </div>
        </div>
        <button
          onClick={onRefreshActivities}
          className="text-xs text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 font-medium flex items-center px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full border border-purple-200 dark:border-purple-700/50 shadow-sm transition-all hover:shadow-md touch-manipulation"
          title="换一批"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          换一批
        </button>
      </div>

      {/* 能量指引 */}
      {energyGuidance && (
        <div className="mb-3 md:mb-4 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-2.5 md:p-3 border border-indigo-200 dark:border-indigo-800/50">
          <div className="flex items-start">
            <span className="text-xl md:text-2xl mr-2 md:mr-3">🌟</span>
            <p className="text-xs md:text-sm text-indigo-800 dark:text-indigo-100 leading-relaxed font-medium">
              {energyGuidance}
            </p>
          </div>
        </div>
      )}

      {/* 每日正念任务列表 */}
      <div className="space-y-2 md:space-y-3">
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
