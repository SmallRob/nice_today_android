import { memo } from 'react';
import { calculateMoonSign, getMoonSignInfluence } from '../utils/horoscopeAlgorithm';

/**
 * 月亮星座展示组件
 * 显示今日月亮星座及其影响
 */
const MoonSignDisplay = memo(({ date = new Date() }) => {
  const moonSign = calculateMoonSign(date);
  const influence = getMoonSignInfluence(moonSign);

  // 获取适合活动
  const getSuitableActivity = (moonSign) => {
    const activities = {
      '白羊座': '行动决策',
      '金牛座': '享受生活',
      '双子座': '学习交流',
      '巨蟹座': '家庭时光',
      '狮子座': '创意展现',
      '处女座': '整理规划',
      '天秤座': '社交活动',
      '天蝎座': '深度思考',
      '射手座': '探索冒险',
      '摩羯座': '工作规划',
      '水瓶座': '创新实验',
      '双鱼座': '艺术冥想'
    };
    return activities[moonSign] || '灵活应变';
  };

  // 获取能量强度
  const getEnergyLevel = (moonSign) => {
    const levels = {
      '白羊座': '高强度',
      '金牛座': '稳定',
      '双子座': '多变',
      '巨蟹座': '感性',
      '狮子座': '热情',
      '处女座': '细致',
      '天秤座': '平衡',
      '天蝎座': '深沉',
      '射手座': '活跃',
      '摩羯座': '专注',
      '水瓶座': '创新',
      '双鱼座': '柔和'
    };
    return levels[moonSign] || '中等';
  };

  // 获取月亮星座图标
  const getMoonSignIcon = (sign) => {
    const icons = {
      '白羊座': '♈',
      '金牛座': '♉', 
      '双子座': '♊',
      '巨蟹座': '♋',
      '狮子座': '♌',
      '处女座': '♍',
      '天秤座': '♎',
      '天蝎座': '♏',
      '射手座': '♐',
      '摩羯座': '♑',
      '水瓶座': '♒',
      '双鱼座': '♓'
    };
    return icons[sign] || '🌙';
  };

  // 获取月亮星座元素颜色
  const getMoonSignColor = (sign) => {
    const colors = {
      '白羊座': 'text-red-500',
      '金牛座': 'text-green-500',
      '双子座': 'text-yellow-500',
      '巨蟹座': 'text-blue-400',
      '狮子座': 'text-orange-500',
      '处女座': 'text-gray-500',
      '天秤座': 'text-pink-400',
      '天蝎座': 'text-purple-500',
      '射手座': 'text-indigo-500',
      '摩羯座': 'text-brown-500',
      '水瓶座': 'text-cyan-500',
      '双鱼座': 'text-teal-400'
    };
    return colors[sign] || 'text-gray-600';
  };

  // 获取月亮星座元素
  const getMoonSignElement = (sign) => {
    const elements = {
      '白羊座': '火象',
      '金牛座': '土象',
      '双子座': '风象',
      '巨蟹座': '水象',
      '狮子座': '火象',
      '处女座': '土象',
      '天秤座': '风象',
      '天蝎座': '水象',
      '射手座': '火象',
      '摩羯座': '土象',
      '水瓶座': '风象',
      '双鱼座': '水象'
    };
    return elements[sign] || '未知';
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800/30 mb-4">
      <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
        <span className="mr-2">🌙</span> 今日月亮星座
      </h3>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`text-3xl ${getMoonSignColor(moonSign)}`}>
            {getMoonSignIcon(moonSign)}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {moonSign}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {getMoonSignElement(moonSign)}星座
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            月亮周期位置
          </div>
          <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            {Math.round((date.getDate() % 28) / 28 * 100)}%
          </div>
        </div>
      </div>
      
      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
          {influence}
        </div>
      </div>
      
      {/* 月亮星座小贴士 */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/30 dark:bg-black/10 rounded p-2 text-center">
          <div className="text-gray-600 dark:text-gray-400">适合活动</div>
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {getSuitableActivity(moonSign)}
          </div>
        </div>
        <div className="bg-white/30 dark:bg-black/10 rounded p-2 text-center">
          <div className="text-gray-600 dark:text-gray-400">能量强度</div>
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {getEnergyLevel(moonSign)}
          </div>
        </div>
      </div>
    </div>
  );
});

MoonSignDisplay.displayName = 'MoonSignDisplay';

export default MoonSignDisplay;