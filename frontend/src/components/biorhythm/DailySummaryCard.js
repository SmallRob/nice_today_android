/**
 * 每日总结卡片组件
 * 简化的总结展示组件
 */
import React from 'react';

const DailySummaryCard = ({ totalScore, dailyTip, onRefreshTip }) => {
  if (totalScore === undefined) return null;

  const getStatusInfo = () => {
    if (totalScore > 15) {
      return {
        text: '🌟 极佳',
        colorClass: 'bg-green-500',
        labelClass: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        summaryText: '极佳'
      };
    } else if (totalScore > 0) {
      return {
        text: '😊 良好',
        colorClass: 'bg-emerald-500',
        labelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
        summaryText: '良好'
      };
    } else if (totalScore < -15) {
      return {
        text: '😫 极低',
        colorClass: 'bg-rose-500',
        labelClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
        summaryText: '极低'
      };
    } else if (totalScore < 0) {
      return {
        text: '⚠️ 偏低',
        colorClass: 'bg-amber-500',
        labelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        summaryText: '偏低'
      };
    } else {
      return {
        text: '😐 平稳',
        colorClass: 'bg-sky-500',
        labelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
        summaryText: '平稳'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/30 dark:to-gray-900/30 border border-blue-200 dark:border-gray-700/50 rounded-lg p-4 shadow-sm">
      {/* 综合状态指示器 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo.colorClass}`} />
          <span className="text-base font-medium text-gray-900 dark:text-gray-100">综合状态</span>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.labelClass}`}>
          {statusInfo.text}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-100 mb-3">
        今日综合得分: <span className="font-medium text-gray-900 dark:text-gray-100">{totalScore}%</span> - <span className="text-gray-700 dark:text-gray-100">{statusInfo.summaryText}</span>
      </p>

      {/* 动态暖心提示 */}
      {dailyTip && <DailyTip tip={dailyTip} onRefresh={onRefreshTip} />}
    </div>
  );
};

// 每日提示子组件
const DailyTip = ({ tip, onRefresh }) => {
  return (
    <div className="bg-white/60 dark:bg-gray-700/30 rounded-lg p-3 border border-blue-100 dark:border-gray-600/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-lg">💬</span>
          <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed flex-1">
            {tip}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-medium flex items-center ml-2 whitespace-nowrap touch-manipulation"
          title="换一换"
        >
          <svg 
            className="w-4 h-4 text-current mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span className="text-current">换一换</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(DailySummaryCard);
