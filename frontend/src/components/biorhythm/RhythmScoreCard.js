/**
 * 生物节律分数卡片组件
 * 简化的分数展示组件
 */
import React from 'react';

const RhythmScoreCard = ({ label, value, color }) => {
  const colorConfig = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      label: 'text-green-800 dark:text-green-200',
      border: 'border-green-100 dark:border-green-800/40'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      label: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-100 dark:border-blue-800/40'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      label: 'text-purple-800 dark:text-purple-200',
      border: 'border-purple-100 dark:border-purple-800/40'
    }
  };

  const config = colorConfig[color] || colorConfig.green;

  return (
    <div className={`${config.bg} rounded-lg p-4 text-center border ${config.border}`}>
      <div className={`text-xl font-bold ${config.text} mb-2`}>
        {value}%
      </div>
      <div className={`text-sm ${config.label} font-medium`}>{label}</div>
    </div>
  );
};

export default React.memo(RhythmScoreCard);
