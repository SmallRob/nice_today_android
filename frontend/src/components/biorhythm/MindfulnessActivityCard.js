/**
 * 正念活动卡片组件
 * 简化的活动列表组件，优化移动端体验
 */
import React from 'react';

const MindfulnessActivityCard = ({ 
  activity, 
  isCompleted, 
  onToggle 
}) => {
  return (
    <div
      onClick={() => onToggle(activity.id)}
      className={`
        bg-white dark:bg-gray-800/60 rounded-lg p-2.5 md:p-3.5 cursor-pointer 
        border-2 transition-all duration-300 hover:shadow-md
        touch-manipulation active:scale-98
        ${isCompleted
          ? 'border-green-400 dark:border-green-500/70 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20'
          : 'border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700'
        }
      `}
    >
      <div className="flex items-center">
        {/* 完成状态复选框 */}
        <Checkbox checked={isCompleted} />
        
        {/* 活动图标 */}
        <ActivityIcon icon={activity.icon} isCompleted={isCompleted} />
        
        {/* 活动信息 */}
        <ActivityInfo activity={activity} isCompleted={isCompleted} />
        
        {/* 完成标记 */}
        {isCompleted && <CompletionMark />}
      </div>
    </div>
  );
};

// 复选框子组件
const Checkbox = ({ checked }) => {
  return (
    <div className={`
      flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-md border-2 
      mr-2 md:mr-3 flex items-center justify-center 
      transition-all duration-200
      ${checked
        ? 'bg-green-500 border-green-500'
        : 'border-gray-300 dark:border-gray-600'
      }
    `}>
      {checked && (
        <svg 
          className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </div>
  );
};

// 活动图标子组件
const ActivityIcon = ({ icon, isCompleted }) => {
  return (
    <div className={`
      flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl 
      flex items-center justify-center mr-2 md:mr-3 
      text-lg md:text-xl
      ${isCompleted ? 'opacity-50' : ''}
    `}>
      {icon}
    </div>
  );
};

// 活动信息子组件
const ActivityInfo = ({ activity, isCompleted }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <h4 className={`
          text-xs md:text-sm font-semibold truncate
          ${isCompleted 
            ? 'text-gray-500 dark:text-gray-100 line-through' 
            : 'text-gray-900 dark:text-gray-100'
          }
        `}>
          {activity.title}
        </h4>
        {!isCompleted && (
          <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200">
            {activity.duration}
          </span>
        )}
      </div>
      <p className={`
        text-[10px] md:text-xs leading-relaxed
        ${isCompleted 
          ? 'text-gray-400 dark:text-gray-100' 
          : 'text-gray-600 dark:text-gray-100'
        }
      `}>
        {activity.description}
      </p>
      {!isCompleted && activity.positive && (
        <p className="text-[10px] md:text-xs text-green-600 dark:text-green-300 mt-1 md:mt-1.5 font-medium">
          ✨ {activity.positive}
        </p>
      )}
    </div>
  );
};

// 完成标记子组件
const CompletionMark = () => {
  return (
    <div className="flex-shrink-0 ml-2 md:ml-3">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
        <svg 
          className="w-4 h-4 md:w-5 md:h-5 text-white" 
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
  );
};

export default React.memo(MindfulnessActivityCard);
