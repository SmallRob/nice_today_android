/**
 * 用户信息卡片组件
 * 简化的用户信息和节律状态展示
 */
import React from 'react';
import RhythmScoreCard from './RhythmScoreCard';

const UserInfoCard = ({ userInfo, todayData, onEditInfo }) => {
  if (!todayData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
      {/* 顶部用户信息栏 - 简化布局 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-gray-700">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {userInfo.nickname ? `${userInfo.nickname} 的今日节律` : '今日生物节律'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-100 mt-1">
            {userInfo.birthDate ? `出生: ${userInfo.birthDate}` : '请配置信息'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEditInfo}
            className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-700 transition-colors touch-manipulation"
          >
            修改信息
          </button>
          <span className="inline-block px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full">
            本地计算
          </span>
        </div>
      </div>

      {/* 今日节律状态 - 简化网格 */}
      <div className="grid grid-cols-3 gap-3">
        <RhythmScoreCard 
          label="体力" 
          value={todayData.physical} 
          color="green" 
        />
        <RhythmScoreCard 
          label="情绪" 
          value={todayData.emotional} 
          color="blue" 
        />
        <RhythmScoreCard 
          label="智力" 
          value={todayData.intellectual} 
          color="purple" 
        />
      </div>

      {/* 状态解读 - 简化布局 */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap justify-center gap-y-2 gap-x-4 text-sm">
          <StatusBadge 
            condition={todayData.physical >= 0} 
            positiveText="✓ 体力充沛" 
            negativeText="⚠ 体力偏低"
            color="green"
          />
          <StatusBadge 
            condition={todayData.emotional >= 0} 
            positiveText="😊 情绪稳定" 
            negativeText="🌪️ 情绪波动"
            color="blue"
          />
          <StatusBadge 
            condition={todayData.intellectual >= 0} 
            positiveText="💡 思维清晰" 
            negativeText="🧠 思考需谨慎"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

// 状态徽章子组件
const StatusBadge = ({ condition, positiveText, negativeText, color }) => {
  const positiveConfig = {
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-200'
  };

  const negativeConfig = {
    green: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200',
    blue: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200',
    purple: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-200'
  };

  const config = condition ? positiveConfig[color] : negativeConfig[color];

  return (
    <span className={`px-2 py-0.5 rounded ${config}`}>
      {condition ? positiveText : negativeText}
    </span>
  );
};

export default React.memo(UserInfoCard);
