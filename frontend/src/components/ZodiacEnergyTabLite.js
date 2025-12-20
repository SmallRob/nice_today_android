import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 轻量级生肖能量组件 - 优化性能
const ZodiacEnergyTabLite = ({ onError }) => {
  // 简化状态管理
  const [userZodiac, setUserZodiac] = useState('');
  const [energyGuidance, setEnergyGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 预定义的生肖数据 - 使用useMemo缓存
  const zodiacData = useMemo(() => ({
    '鼠': { element: '水', traits: ['机智', '灵活', '适应力强'], energy: 85 },
    '牛': { element: '土', traits: ['稳重', '勤劳', '踏实'], energy: 82 },
    '虎': { element: '木', traits: ['勇敢', '果断', '领导力强'], energy: 88 },
    '兔': { element: '木', traits: ['温和', '谨慎', '细腻'], energy: 78 },
    '龙': { element: '土', traits: ['自信', '热情', '创造力强'], energy: 92 },
    '蛇': { element: '火', traits: ['智慧', '神秘', '洞察力强'], energy: 76 },
    '马': { element: '火', traits: ['活力', '自由', '行动力强'], energy: 85 },
    '羊': { element: '土', traits: ['温和', '善良', '艺术感强'], energy: 75 },
    '猴': { element: '金', traits: ['聪明', '灵活', '适应力强'], energy: 87 },
    '鸡': { element: '金', traits: ['勤奋', '精确', '责任感强'], energy: 80 },
    '狗': { element: '土', traits: ['忠诚', '可靠', '正义感强'], energy: 83 },
    '猪': { element: '水', traits: ['真诚', '豁达', '享受生活'], energy: 79 }
  }), []);

  // 简化的五行数据
  const wuxingElements = useMemo(() => ({
    '木': { color: '#11998e', icon: '🌳', advice: '多接触绿色植物，保持积极心态' },
    '火': { color: '#fc4a1a', icon: '🔥', advice: '保持热情活力，注意情绪调节' },
    '土': { color: '#f7b733', icon: '⛰', advice: '保持稳定，注重基础建设' },
    '金': { color: '#6c5ce7', icon: '💰', advice: '注重细节，保持条理性' },
    '水': { color: '#0984e3', icon: '💧', advice: '保持灵活，顺应变化' }
  }), []);

  // 快速获取用户生肖（模拟实现）
  const getUserZodiac = useCallback(() => {
    try {
      // 简化逻辑，直接返回默认值
      return '鼠';
    } catch (error) {
      console.log('获取生肖信息失败:', error);
      return '';
    }
  }, []);

  // 快速生成能量指引
  const generateEnergyGuidance = useCallback((zodiac) => {
    const data = zodiacData[zodiac];
    if (!data) return null;

    const elementData = wuxingElements[data.element];
    
    return {
      zodiac,
      element: data.element,
      energyScore: data.energy,
      traits: data.traits,
      guidance: {
        daily: `今日${zodiac}座能量充沛，适合${data.traits[0]}类活动`,
        elementAdvice: elementData.advice,
        luckyColor: elementData.color,
        luckyTime: '下午3-5点'
      }
    };
  }, [zodiacData, wuxingElements]);

  // 简化的初始化逻辑
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // 快速获取用户生肖
        const zodiac = getUserZodiac();
        if (zodiac) {
          setUserZodiac(zodiac);
          
          // 立即生成指引，避免异步延迟
          const guidance = generateEnergyGuidance(zodiac);
          setEnergyGuidance(guidance);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('生肖能量初始化失败:', error);
        setError('加载失败，请稍后重试');
        if (onError) onError(error);
        setLoading(false);
      }
    };

    // 延迟初始化，避免阻塞主线程
    setTimeout(initialize, 50);
  }, [getUserZodiac, generateEnergyGuidance, onError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">正在加载生肖能量...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!energyGuidance) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无生肖能量数据
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 生肖能量概览 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {energyGuidance.zodiac}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {energyGuidance.zodiac}座今日能量
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                五行属性：{energyGuidance.element}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {energyGuidance.energyScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">能量值</div>
          </div>
        </div>
        
        {/* 特质标签 */}
        <div className="flex flex-wrap gap-2">
          {energyGuidance.traits.map((trait, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-white dark:bg-gray-800 text-xs rounded-full border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 今日指引 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">今日指引</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {energyGuidance.guidance.daily}
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">幸运色：</span>
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: energyGuidance.guidance.luckyColor }}
            ></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">幸运时段：</span>
            <span className="font-medium">{energyGuidance.guidance.luckyTime}</span>
          </div>
        </div>
      </div>

      {/* 五行建议 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">五行养生建议</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {energyGuidance.guidance.elementAdvice}
        </p>
      </div>
    </div>
  );
};

export default ZodiacEnergyTabLite;