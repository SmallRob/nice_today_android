import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 轻量级星座运程组件 - 优化性能
const HoroscopeTabLite = ({ onError }) => {
  // 简化状态管理
  const [userHoroscope, setUserHoroscope] = useState('');
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 预定义的星座数据 - 使用useMemo缓存
  const horoscopeData = useMemo(() => ({
    '白羊座': { element: '火', traits: ['热情', '勇敢', '直接'], score: 85 },
    '金牛座': { element: '土', traits: ['稳重', '务实', '耐心'], score: 82 },
    '双子座': { element: '风', traits: ['灵活', '好奇', '沟通'], score: 88 },
    '巨蟹座': { element: '水', traits: ['感性', '保护', '家庭'], score: 78 },
    '狮子座': { element: '火', traits: ['自信', '领导', '慷慨'], score: 90 },
    '处女座': { element: '土', traits: ['细致', '分析', '服务'], score: 83 },
    '天秤座': { element: '风', traits: ['和谐', '公正', '社交'], score: 86 },
    '天蝎座': { element: '水', traits: ['深刻', '神秘', '激情'], score: 87 },
    '射手座': { element: '火', traits: ['自由', '乐观', '冒险'], score: 89 },
    '摩羯座': { element: '土', traits: ['责任', '纪律', '成就'], score: 84 },
    '水瓶座': { element: '风', traits: ['创新', '独立', '人道'], score: 85 },
    '双鱼座': { element: '水', traits: ['直觉', '浪漫', '同情'], score: 80 }
  }), []);

  // 运势领域数据
  const fortuneAreas = useMemo(() => ({
    'love': { name: '爱情', icon: '💕', weight: 0.3 },
    'wealth': { name: '财富', icon: '💰', weight: 0.25 },
    'career': { name: '事业', icon: '💼', weight: 0.25 },
    'health': { name: '健康', icon: '💪', weight: 0.2 }
  }), []);

  // 快速获取用户星座（模拟实现）
  const getUserHoroscope = useCallback(() => {
    try {
      // 简化逻辑，直接返回默认值
      return '白羊座';
    } catch (error) {
      console.log('获取星座信息失败:', error);
      return '';
    }
  }, []);

  // 快速生成运势指引
  const generateHoroscopeGuidance = useCallback((horoscope) => {
    const data = horoscopeData[horoscope];
    if (!data) return null;

    // 简化的运势计算
    const baseScore = data.score;
    const today = new Date().getDate();
    const dailyVariation = (today % 10) - 5; // -5到+4的波动
    
    const overallScore = Math.max(0, Math.min(100, baseScore + dailyVariation));

    return {
      horoscope,
      element: data.element,
      overallScore,
      traits: data.traits,
      fortunes: {
        love: Math.max(0, Math.min(100, overallScore + (today % 3) - 1)),
        wealth: Math.max(0, Math.min(100, overallScore + (today % 4) - 2)),
        career: Math.max(0, Math.min(100, overallScore + (today % 5) - 2)),
        health: Math.max(0, Math.min(100, overallScore + (today % 2) - 1))
      },
      guidance: {
        daily: `今日${horoscope}运势${overallScore >= 80 ? '极佳' : overallScore >= 60 ? '良好' : '一般'}`,
        advice: `保持${data.traits[0]}的态度，会有不错的机会`,
        luckyNumber: (today % 9) + 1,
        luckyColor: data.element === '火' ? '#ff6b6b' : 
                   data.element === '土' ? '#feca57' : 
                   data.element === '风' ? '#48dbfb' : '#54a0ff'
      }
    };
  }, [horoscopeData]);

  // 简化的初始化逻辑
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // 快速获取用户星座
        const horoscope = getUserHoroscope();
        if (horoscope) {
          setUserHoroscope(horoscope);
          
          // 立即生成指引，避免异步延迟
          const guidance = generateHoroscopeGuidance(horoscope);
          setHoroscopeGuidance(guidance);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('星座运程初始化失败:', error);
        setError('加载失败，请稍后重试');
        if (onError) onError(error);
        setLoading(false);
      }
    };

    // 延迟初始化，避免阻塞主线程
    setTimeout(initialize, 50);
  }, [getUserHoroscope, generateHoroscopeGuidance, onError]);

  // 渲染运势进度条
  const renderFortuneBar = (score, area) => {
    const areaData = fortuneAreas[area];
    const percentage = Math.max(5, score); // 确保至少有5%的显示
    
    return (
      <div key={area} className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{areaData.icon}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{areaData.name}</span>
        </div>
        <div className="flex-1 mx-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: percentage >= 80 ? '#10b981' : 
                               percentage >= 60 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
          {score}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">正在加载星座运程...</p>
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

  if (!horoscopeGuidance) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无星座运程数据
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 星座运势概览 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {horoscopeGuidance.horoscope.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {horoscopeGuidance.horoscope}今日运势
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                元素属性：{horoscopeGuidance.element}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {horoscopeGuidance.overallScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">综合指数</div>
          </div>
        </div>
        
        {/* 特质标签 */}
        <div className="flex flex-wrap gap-2">
          {horoscopeGuidance.traits.map((trait, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-white dark:bg-gray-800 text-xs rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 各项运势 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">今日运势详情</h4>
        {Object.keys(horoscopeGuidance.fortunes).map(area => 
          renderFortuneBar(horoscopeGuidance.fortunes[area], area)
        )}
      </div>

      {/* 今日指引 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">今日指引</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {horoscopeGuidance.guidance.daily}，{horoscopeGuidance.guidance.advice}
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">幸运色：</span>
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: horoscopeGuidance.guidance.luckyColor }}
            ></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">幸运数字：</span>
            <span className="font-medium">{horoscopeGuidance.guidance.luckyNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeTabLite;