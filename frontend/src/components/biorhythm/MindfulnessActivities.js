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
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl shadow-sm p-3 md:p-4 w-full max-w-full">
      {/* 顶部：能量UP+ 指示器 */}
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-1.5">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-md flex-shrink-0">
            <span className="text-sm mr-1">⚡</span>
            <span className="text-xs font-bold whitespace-nowrap">能量UP+</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
            今日: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{completedTasks.length}/4</span>
          </div>
        </div>
        <button
          onClick={onRefreshActivities}
          className="text-xs text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 font-medium flex items-center px-2.5 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full border border-purple-200 dark:border-purple-700/50 shadow-sm transition-all hover:shadow-md touch-manipulation flex-shrink-0 whitespace-nowrap"
          title="换一批"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">换一批</span>
          <span className="inline sm:hidden">刷新</span>
        </button>
      </div>

      {/* 能量指引 */}
      {energyGuidance && (
        <div className="mb-3 md:mb-4 bg-gradient-to-r from-indigo-100/70 to-purple-100/70 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg p-3 md:p-3 border border-indigo-200 dark:border-indigo-800/50 w-full max-w-full">
          <div className="flex items-start">
            <span className="text-base sm:text-lg mr-1.5 flex-shrink-0">🌟</span>
            <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 leading-snug font-medium flex-1 min-w-0 line-clamp-2">
              {energyGuidance}
            </p>
          </div>
        </div>
      )}

      {/* 每日正念任务列表 */}
      <div className="space-y-1.5 md:space-y-2 w-full max-w-full">
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