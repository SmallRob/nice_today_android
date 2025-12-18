import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import '../styles/mayaGlobalStyles.css';

// 玛雅日历工具类 - 优化版本
class MayaCalendarUtils {
  // 使用静态常量避免每次调用时创建数组
  static TONES = [
    '磁性', '月亮', '电力', '自我存在', '超频', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];
  
  static SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', '黄星星',
    '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜', '蓝风暴', '黄太阳'
  ];
  
  // 缓存参考日期对象，避免重复创建
  static REFERENCE_DATE = new Date('2025-09-23');
  static REFERENCE_KIN = 183;
  
  // 缓存计算结果
  static calculationCache = new Map();
  static maxCacheSize = 100;
  
  // 标准玛雅历法计算（基于KIN 183校准）
  static calculateMayaDate(gregorianDate) {
    try {
      const dateString = gregorianDate.toISOString().split('T')[0]; // 使用日期字符串作为缓存键
      
      // 检查缓存
      if (this.calculationCache.has(dateString)) {
        return this.calculationCache.get(dateString);
      }
      
      // 计算目标日期
      const targetDate = new Date(gregorianDate);
      
      // 计算从参考日期到目标日期的天数
      const timeDiff = targetDate.getTime() - this.REFERENCE_DATE.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // 计算KIN数（1-260的循环）
      let kin = this.REFERENCE_KIN + daysDiff;
      kin = ((kin - 1) % 260) + 1;
      
      // 从KIN数计算调性和图腾
      const toneIndex = (kin - 1) % 13;
      const sealIndex = (kin - 1) % 20;
      
      const tone = this.TONES[toneIndex];
      const seal = this.SEALS[sealIndex];
      
      const result = {
        kin: kin,
        tone: tone,
        seal: seal,
        fullName: `${tone}的${seal}`,
        daysDiff: daysDiff,
        toneIndex: toneIndex,
        sealIndex: sealIndex
      };
      
      // 更新缓存
      this.calculationCache.set(dateString, result);
      
      // 限制缓存大小
      if (this.calculationCache.size > this.maxCacheSize) {
        const firstKey = this.calculationCache.keys().next().value;
        this.calculationCache.delete(firstKey);
      }
      
      return result;
    } catch (error) {
      console.error('计算玛雅日期失败:', error);
      return {
        kin: 1,
        tone: this.TONES[0],
        seal: this.SEALS[0],
        fullName: `${this.TONES[0]}的${this.SEALS[0]}`,
        daysDiff: 0,
        toneIndex: 0,
        sealIndex: 0
      };
    }
  }
  
  // 获取能量提示 - 使用缓存优化
  static getTip(kin) {
    try {
      const energyScore = (kin % 100) + 1;
      
      if (energyScore >= 80) {
        return {
          tip: "今日能量充沛，是行动的好时机！保持积极心态，勇敢追求目标。",
          bgColor: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
          textColor: 'text-green-700 dark:text-green-400',
          level: '高',
          suggestion: '适合开展重要活动、做决策、开启新项目'
        };
      } else if (energyScore >= 60) {
        return {
          tip: "今日能量中等，适合稳步推进计划。注意调节身心平衡，避免过度劳累。",
          bgColor: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
          textColor: 'text-blue-700 dark:text-blue-400',
          level: '中',
          suggestion: '适合日常工作、学习、社交活动'
        };
      } else {
        return {
          tip: "今日能量偏低，建议放慢节奏，多休息调整。适合内省和规划，避免重大决策。",
          bgColor: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          level: '低',
          suggestion: '适合休息、冥想、规划、内省活动'
        };
      }
    } catch (error) {
      console.error('获取能量提示失败:', error);
      return {
        tip: "今日能量状态正常，保持平和心态面对一切。",
        bgColor: 'bg-gray-50 dark:bg-gray-900 dark:bg-opacity-20',
        textColor: 'text-gray-700 dark:text-gray-400',
        level: '中',
        suggestion: '适合日常工作、学习、生活'
      };
    }
  }
}

// 优化的加载组件
const LoadingSpinner = memo(() => (
  <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
    <div className="animate-pulse flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-5 text-center">正在计算玛雅历法...</p>
    </div>
  </div>
));

// 优化的错误组件
const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center animate-fadeIn">
    <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
      <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-red-800 dark:text-red-300 text-sm font-medium mb-2 leading-5">加载失败</h3>
    <p className="text-red-600 dark:text-red-400 text-xs mb-3 leading-5">{error}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium"
      >
        重新加载
      </button>
    )}
  </div>
));

// 优化的空状态组件
const EmptyState = memo(({ onRetry }) => (
  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center animate-fadeIn">
    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-gray-800 dark:text-gray-300 text-sm font-medium mb-2 leading-5">暂无数据</h3>
    <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 leading-5">暂时无法获取玛雅历法数据</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors font-medium"
      >
        重新加载
      </button>
    )}
  </div>
));

// 主组件 - 使用memo优化性能
const MayaCalendar = memo(({ serviceStatus, isDesktop }) => {
  // 使用useRef管理不需要触发重渲染的状态
  const abortControllerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // useState管理需要触发重渲染的状态
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mayaData, setMayaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // 优化后的日期格式化函数 - 使用缓存
  const formatDateLocal = useCallback((date) => {
    if (!date) return null;
    
    // 使用缓存的格式化结果
    const cacheKey = date.toISOString().split('T')[0];
    if (formatDateLocal.cache && formatDateLocal.cache.has(cacheKey)) {
      return formatDateLocal.cache.get(cacheKey);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const result = `${year}-${month}-${day}`;
    
    // 初始化缓存
    if (!formatDateLocal.cache) {
      formatDateLocal.cache = new Map();
    }
    
    // 更新缓存
    formatDateLocal.cache.set(cacheKey, result);
    
    // 限制缓存大小
    if (formatDateLocal.cache.size > 30) {
      const firstKey = formatDateLocal.cache.keys().next().value;
      formatDateLocal.cache.delete(firstKey);
    }
    
    return result;
  }, []);

  // 优化的玛雅数据计算函数
  const calculateMayaDataAsync = useCallback(async (date) => {
    return new Promise((resolve) => {
      // 使用requestIdleCallback或setTimeout避免阻塞主线程
      const calculate = () => {
        try {
          // 检查是否已取消
          if (abortControllerRef.current?.signal.aborted) {
            resolve(null);
            return;
          }
          
          const mayaResult = MayaCalendarUtils.calculateMayaDate(date);
          const energyTip = MayaCalendarUtils.getTip(mayaResult.kin);
          
          resolve({
            ...mayaResult,
            ...energyTip,
            date: formatDateLocal(date)
          });
        } catch (error) {
          console.error('计算玛雅数据失败:', error);
          resolve(null);
        }
      };

      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(calculate);
      } else {
        setTimeout(calculate, 0);
      }
    });
  }, [formatDateLocal]);

  // 优化的加载函数
  const loadMayaData = useCallback(async (date) => {
    if (loading) return;
    
    // 创建新的AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const mayaResult = await calculateMayaDataAsync(date);
      
      // 检查是否已取消
      if (abortControllerRef.current?.signal.aborted) return;
      
      if (mayaResult) {
        // 使用requestAnimationFrame确保流畅的UI更新
        requestAnimationFrame(() => {
          setMayaData(mayaResult);
        });
      } else {
        setError("计算玛雅历法数据时出错");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError("计算玛雅历法数据时出错");
        console.error('加载玛雅历法数据失败:', error);
      }
    } finally {
      // 延迟设置loading为false，确保UI更新完成
      setTimeout(() => {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }, 0);
    }
  }, [loading, calculateMayaDataAsync]);

  // 优化的日期变化处理 - 立即更新并加载数据
  const handleDateChange = useCallback((e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      
      // 立即加载新日期的数据，不需要防抖
      loadMayaData(newDate);
    }
  }, [loadMayaData]);

  // 优化的快速选择日期
  const handleQuickSelect = useCallback((daysOffset) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate);
    
    // 使用setTimeout避免阻塞
    setTimeout(() => {
      loadMayaData(newDate);
    }, 0);
  }, [loadMayaData]);

  // 重新加载函数
  const handleRetry = useCallback(() => {
    loadMayaData(selectedDate);
  }, [selectedDate, loadMayaData]);

  // 组件挂载时延迟加载数据 - 使用当前选择的日期
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      loadMayaData(selectedDate);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [loadMayaData, selectedDate]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 优化的渲染组件 - 使用memo
  const MayaInfoCard = useMemo(() => memo(({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 ${className}`}>
      {children}
    </div>
  )), []);

  // 优化的日期选择按钮 - 移到条件渲染之前
  const QuickSelectButtons = useMemo(() => (
    <div className="flex justify-center space-x-3 mt-3">
      {[-1, 0, 1].map((offset) => (
        <button
          key={offset}
          onClick={() => handleQuickSelect(offset)}
          className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
            offset === 0
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {offset === -1 ? '昨天' : offset === 0 ? '今天' : '明天'}
        </button>
      ))}
    </div>
  ), [handleQuickSelect]);

  // 优化的玛雅历法核心信息组件 - 移到条件渲染之前
  const MayaCoreInfo = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* KIN数 */}
      <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2 leading-8">
          KIN {mayaData?.kin}
        </div>
        <div className="text-xs text-purple-800 dark:text-purple-300 font-medium leading-4">能量编号</div>
      </div>
      
      {/* 调性 */}
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 text-center">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 leading-6">
          {mayaData?.tone}
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-4">银河音调</div>
      </div>
      
      {/* 图腾 */}
      <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-4 text-center">
        <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-2 leading-6">
          {mayaData?.seal}
        </div>
        <div className="text-xs text-green-800 dark:text-green-300 font-medium leading-4">太阳印记</div>
      </div>
    </div>
  ), [mayaData?.kin, mayaData?.tone, mayaData?.seal]);

  // 优化的完整名称组件 - 移到条件渲染之前
  const MayaFullName = useMemo(() => (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-center">
      <div className="text-lg font-bold mb-1 leading-6">{mayaData?.fullName}</div>
      <div className="text-sm opacity-90 leading-5">今日玛雅历法能量</div>
    </div>
  ), [mayaData?.fullName]);

  // 优化的能量提示组件 - 移到条件渲染之前
  const EnergyTip = useMemo(() => (
    <div className={`${mayaData?.bgColor} border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg p-4`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 leading-5">
        今日能量提示
      </h4>
      <p className={`text-sm ${mayaData?.textColor} mb-2 leading-5`}>
        <strong>能量等级：{mayaData?.level}</strong> - {mayaData?.tip}
      </p>
      <div className="text-xs text-gray-600 dark:text-gray-400 leading-4">
        <strong>建议活动：</strong>{mayaData?.suggestion}
      </div>
    </div>
  ), [mayaData?.bgColor, mayaData?.textColor, mayaData?.level, mayaData?.tip, mayaData?.suggestion]);

  // 增强的今日启示组件 - 包含治愈心灵的多维度提示
  const DailyInspiration = useMemo(() => {
    // 生成基于KIN的多维度启示
    const getDailyInspiration = (kin) => {
      // 心灵治愈类启示
      const healingInspirations = [
        "允许自己感受所有的情绪，它们都是灵魂的导航。",
        "在静谧中，倾听内心的声音，那里有最深的智慧。",
        "真正的疗愈始于接纳不完美的自己。",
        "每一次深呼吸都是与内在平静的连接。",
        "你的存在本身就是宇宙最珍贵的礼物。",
        "在喧嚣中寻找宁静，在混乱中创造秩序。",
        "爱自己是最强大的治愈力量。",
        "放下对完美的执着，拥抱真实的自己。",
        "内心的平静是抵抗外界风暴的堡垒。",
        "每一个今天都是重新开始的机会。"
      ];
      
      // 生活智慧类启示
      const wisdomInspirations = [
        "生命不是等待风暴过去，而是学会在雨中跳舞。",
        "真正的智慧在于认识自己的无知。",
        "活在当下，珍惜每一刻的美好。",
        "勇气不是没有恐惧，而是面对恐惧并继续前行。",
        "爱是唯一能够超越时间和空间的力量。",
        "简单的生活是最充实的生活。",
        "每一次结束都是新的开始。",
        "真正的力量来自于内心的平衡。",
        "感恩的心是通往幸福的道路。",
        "成长的过程比结果更加珍贵。"
      ];
      
      // 能量连接类启示
      const energyInspirations = [
        "与大地连接，感受生命的脉动。",
        "让阳光温暖你的心，让月光照亮你的梦。",
        "宇宙的能量时刻环绕着你，保持开放的心。",
        "在自然中找到平衡，在静心中找到力量。",
        "你的每一次呼吸都与宇宙同步。",
        "感受能量的流动，顺应生命的节奏。",
        "在寂静中听见宇宙的智慧。",
        "大地承载着你的足迹，天空放飞着你的梦想。",
        "每一个生命都是宇宙意识的体现。",
        "在万物中找到连接，在连接中找到和谐。"
      ];
      
      // 基于KIN选择不同的启示类型
      const type = kin % 3;
      let selectedInspirations;
      
      switch(type) {
        case 0:
          selectedInspirations = healingInspirations;
          break;
        case 1:
          selectedInspirations = wisdomInspirations;
          break;
        default:
          selectedInspirations = energyInspirations;
      }
      
      const seed = kin % selectedInspirations.length;
      return {
        text: selectedInspirations[seed],
        type: type === 0 ? 'healing' : type === 1 ? 'wisdom' : 'energy'
      };
    };
    
    const inspiration = mayaData ? getDailyInspiration(mayaData.kin) : {text: "今日启示将在此显示", type: 'wisdom'};
    
    // 根据启示类型设置不同的颜色主题
    const getTheme = (type) => {
      switch(type) {
        case 'healing':
          return 'bg-gradient-to-r from-green-500 to-teal-600';
        case 'energy':
          return 'bg-gradient-to-r from-purple-500 to-indigo-600';
        default:
          return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      }
    };
    
    const getIcon = (type) => {
      switch(type) {
        case 'healing':
          return (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          );
        case 'energy':
          return (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          );
        default:
          return (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          );
      }
    };
    
    return (
      <div className="mb-4">
        <div className={`${getTheme(inspiration.type)} rounded-lg p-4 text-white shadow-sm`}>
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            {getIcon(inspiration.type)}
            {inspiration.type === 'healing' ? '心灵治愈' : inspiration.type === 'energy' ? '能量连接' : '生活智慧'}
          </h4>
          <p className="text-sm opacity-95 leading-relaxed">{inspiration.text}</p>
        </div>
        
        {/* 添加简短的实践建议 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-2 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">今日实践建议</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {inspiration.type === 'healing' 
              ? "花5分钟冥想，感受内心的平静" 
              : inspiration.type === 'energy' 
              ? "到户外散步，感受自然的能量流动" 
              : "记录今天的感恩时刻"}
          </div>
        </div>
      </div>
    );
  }, [mayaData?.kin]);

  // 优化的加载状态组件
  if (loading && !mayaData) {
    return <LoadingSpinner />;
  }

  // 优化的错误状态组件
  if (error && !mayaData) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // 优化的空状态组件
  if (!mayaData || !isVisible) {
    return <EmptyState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-3">
      {/* 今日启示 */}
      {DailyInspiration}

      {/* 日期选择区域 */}
      <MayaInfoCard>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-2 sm:mb-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              选择查询日期
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              查看特定日期的玛雅历法能量
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="date"
              value={formatDateLocal(selectedDate)}
              onChange={handleDateChange}
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-normal min-w-[140px]"
            />
          </div>
        </div>
        
        {/* 快速选择按钮 */}
        {QuickSelectButtons}
      </MayaInfoCard>

      {/* 玛雅历法核心信息 */}
      <MayaInfoCard>
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
          玛雅历法信息
        </h3>
        
        {MayaCoreInfo}
        {MayaFullName}
      </MayaInfoCard>

      {/* 能量提示 */}
      {EnergyTip}

      {/* 玛雅历法说明 */}
      <div className="bg-gray-50 dark:bg-gray-800 border-l-2 border-gray-400 dark:border-gray-600 rounded-r-lg p-3">
        <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-300 mb-1">
          玛雅历法说明
        </h4>
        <p className="text-xs text-gray-700 dark:text-gray-400">
          玛雅历法基于260天的神圣周期（Tzolkin），每个KIN代表独特的能量组合。
          调性代表行动方式，图腾代表生命能量。建议结合个人直觉感受能量流动。
        </p>
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MayaCalendar.displayName = 'MayaCalendar';

export default MayaCalendar;