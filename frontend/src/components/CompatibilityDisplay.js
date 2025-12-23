import { memo } from 'react';
import { HOROSCOPE_DATA_ENHANCED } from '../utils/horoscopeAlgorithm';

/**
 * 速配星座展示组件
 * 显示当前星座的速配星座及其兼容性评分
 */
const CompatibilityDisplay = memo(({ currentHoroscope }) => {
  if (!currentHoroscope) return null;

  // 获取当前星座数据
  const currentZodiac = HOROSCOPE_DATA_ENHANCED.find(h => h.name === currentHoroscope);
  if (!currentZodiac || !currentZodiac.compatible) return null;

  // 计算兼容性评分（基于元素匹配和星座特性）
  const calculateCompatibilityScore = (zodiac1, zodiac2) => {
    const elementCompatibility = {
      'fire': { 'fire': 85, 'earth': 60, 'air': 80, 'water': 50 },
      'earth': { 'fire': 60, 'earth': 75, 'air': 65, 'water': 70 },
      'air': { 'fire': 80, 'earth': 65, 'air': 85, 'water': 60 },
      'water': { 'fire': 50, 'earth': 70, 'air': 60, 'water': 80 }
    };

    const element1 = getElementKey(zodiac1.element);
    const element2 = getElementKey(zodiac2.element);
    
    let score = elementCompatibility[element1]?.[element2] || 70;
    
    // 基于星座特性的微调
    const zodiacAdjustments = {
      '白羊座': { '狮子座': 10, '射手座': 8, '双子座': 7 },
      '金牛座': { '处女座': 10, '摩羯座': 8, '巨蟹座': 7 },
      '双子座': { '天秤座': 10, '水瓶座': 8, '白羊座': 7 },
      '巨蟹座': { '天蝎座': 10, '双鱼座': 8, '金牛座': 7 },
      '狮子座': { '白羊座': 10, '射手座': 8, '双子座': 7 },
      '处女座': { '金牛座': 10, '摩羯座': 8, '巨蟹座': 7 },
      '天秤座': { '双子座': 10, '水瓶座': 8, '狮子座': 7 },
      '天蝎座': { '巨蟹座': 10, '双鱼座': 8, '处女座': 7 },
      '射手座': { '白羊座': 10, '狮子座': 8, '天秤座': 7 },
      '摩羯座': { '金牛座': 10, '处女座': 8, '天蝎座': 7 },
      '水瓶座': { '双子座': 10, '天秤座': 8, '射手座': 7 },
      '双鱼座': { '巨蟹座': 10, '天蝎座': 8, '摩羯座': 7 }
    };

    const adjustment = zodiacAdjustments[zodiac1.name]?.[zodiac2.name] || 0;
    score += adjustment;
    
    // 添加随机波动，但保持相对稳定
    const random = (zodiac1.name.charCodeAt(0) + zodiac2.name.charCodeAt(0)) % 5;
    score += random - 2;
    
    return Math.max(50, Math.min(95, score));
  };

  // 获取元素键名
  const getElementKey = (element) => {
    if (!element) return 'fire';
    const el = String(element).toLowerCase();
    if (el.includes('火') || el.includes('fire')) return 'fire';
    if (el.includes('土') || el.includes('earth')) return 'earth';
    if (el.includes('风') || el.includes('air')) return 'air';
    if (el.includes('水') || el.includes('water')) return 'water';
    return 'fire';
  };

  // 获取速配星座数据
  const compatibleZodiacs = currentZodiac.compatible.map(zodiacName => {
    const zodiac = HOROSCOPE_DATA_ENHANCED.find(h => h.name === zodiacName);
    if (!zodiac) return null;
    
    return {
      name: zodiac.name,
      icon: zodiac.icon,
      element: zodiac.element,
      score: calculateCompatibilityScore(currentZodiac, zodiac),
      description: getCompatibilityDescription(currentZodiac, zodiac)
    };
  }).filter(Boolean);

  // 获取兼容性描述
  const getCompatibilityDescription = (zodiac1, zodiac2) => {
    const descriptions = {
      'fire-fire': '热情似火，充满活力',
      'fire-earth': '激情与稳重的完美结合',
      'fire-air': '创意无限，思维碰撞',
      'fire-water': '冰火交融，需要磨合',
      'earth-earth': '踏实稳重，共同成长',
      'earth-air': '务实与灵活的结合',
      'earth-water': '情感深厚，相互支持',
      'air-air': '思想共鸣，默契十足',
      'air-water': '理性与感性的平衡',
      'water-water': '情感丰富，深度连接'
    };

    const key = `${getElementKey(zodiac1.element)}-${getElementKey(zodiac2.element)}`;
    return descriptions[key] || '相互吸引，和谐相处';
  };

  // 获取分数颜色
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 65) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // 获取分数背景色
  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 75) return 'bg-blue-100 dark:bg-blue-900/20';
    if (score >= 65) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-gray-100 dark:bg-gray-900/20';
  };

  if (compatibleZodiacs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800 mb-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
        <span className="mr-2">💕</span> 今日速配星座
      </h3>
      
      <div className="space-y-3">
        {compatibleZodiacs.map((zodiac, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{zodiac.icon}</div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {zodiac.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {zodiac.description}
                </div>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBgColor(zodiac.score)} ${getScoreColor(zodiac.score)}`}>
              {zodiac.score}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        基于元素特性和星座性格的兼容性分析
      </div>
    </div>
  );
});

CompatibilityDisplay.displayName = 'CompatibilityDisplay';

export default CompatibilityDisplay;