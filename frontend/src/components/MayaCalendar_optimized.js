import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import '../styles/mayaGlobalStyles.css';
import timeCacheManager, { getToday } from '../utils/timeCache';

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
        textColor: 'text-gray-700 dark:text-white',
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
      <p className="text-gray-600 dark:text-white text-sm leading-5 text-center">正在计算玛雅历法...</p>
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
      <svg className="w-4 h-4 text-gray-400 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-gray-800 dark:text-white text-sm font-medium mb-2 leading-5">暂无数据</h3>
    <p className="text-gray-600 dark:text-white text-xs mb-3 leading-5">暂时无法获取玛雅历法数据</p>
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
  const [selectedOffset, setSelectedOffset] = useState(0); // 添加选中的日期偏移量状态

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
      
      // 计算与今天的偏移量
      const today = new Date();
      const timeDiff = newDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setSelectedOffset(daysDiff);
      
      // 立即加载新日期的数据，不需要防抖
      loadMayaData(newDate);
    }
  }, [loadMayaData]);

  // 优化的快速选择日期
  const handleQuickSelect = useCallback((daysOffset) => {
    const newDate = new Date(getToday());
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate);
    setSelectedOffset(daysOffset); // 更新选中的偏移量
    
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
      setSelectedOffset(0); // 初始化为今天
      loadMayaData(selectedDate);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [loadMayaData, selectedDate]);

  // 组件卸载时清理
  useEffect(() => {
    const animationFrameId = animationFrameRef.current;
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 优化的渲染组件 - 使用memo
  const MayaInfoCard = useMemo(() => memo(({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 ${className}`}>
      {children}
    </div>
  )), []);

  // 优化的日期选择区域 - 紧凑布局
  const DateSelectionArea = useMemo(() => (
    <MayaInfoCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          选择日期
        </h3>
        <input
          type="date"
          value={formatDateLocal(selectedDate)}
          onChange={handleDateChange}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-medium"
        />
      </div>
      
      {/* 快速选择按钮 */}
      <div className="flex justify-center space-x-2">
        {[-1, 0, 1].map((offset) => (
          <button
            key={offset}
            onClick={() => handleQuickSelect(offset)}
            className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${
              selectedOffset === offset
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {offset === -1 ? '昨天' : offset === 0 ? '今天' : '明天'}
          </button>
        ))}
      </div>
    </MayaInfoCard>
  ), [selectedDate, handleDateChange, handleQuickSelect, formatDateLocal]);

  // 优化的玛雅历法核心信息组件 - 移动设备一行3列布局
  const MayaCoreInfo = useMemo(() => (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {/* KIN数 */}
      <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-2 text-center">
        <div className="text-base font-bold text-purple-600 dark:text-purple-400 mb-1">
          KIN {mayaData?.kin}
        </div>
        <div className="text-xs text-purple-800 dark:text-purple-300 font-medium text-center">能量编号</div>
      </div>
      
      {/* 调性 */}
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
          {mayaData?.tone}
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-300 font-medium text-center">银河音调</div>
      </div>
      
      {/* 图腾 */}
      <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">
          {mayaData?.seal}
        </div>
        <div className="text-xs text-green-800 dark:text-green-300 font-medium text-center">太阳印记</div>
      </div>
    </div>
  ), [mayaData?.kin, mayaData?.tone, mayaData?.seal]);

  // 优化的完整名称组件 - 紧凑设计
  const MayaFullName = useMemo(() => (
    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-center">
      <div className="text-base font-bold mb-1">{mayaData?.fullName}</div>
      <div className="text-xs opacity-90">今日玛雅能量</div>
    </div>
  ), [mayaData?.fullName]);

  // 优化的能量提示组件 - 紧凑设计
  const EnergyTip = useMemo(() => (
    <div className={`${mayaData?.bgColor} border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg p-3`}>
      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
        今日能量提示
      </h4>
      <p className={`text-xs ${mayaData?.textColor} mb-2 leading-relaxed`}>
        <strong>能量等级：{mayaData?.level}</strong> - {mayaData?.tip}
      </p>
      <div className="text-xs text-gray-600 dark:text-white">
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
          <div className="text-xs text-gray-600 dark:text-white font-medium mb-1">今日实践建议</div>
          <div className="text-xs text-gray-500 dark:text-white">
            {inspiration.type === 'healing' 
              ? "花5分钟冥想，感受内心的平静" 
              : inspiration.type === 'energy' 
              ? "到户外散步，感受自然的能量流动" 
              : "记录今天的感恩时刻"}
          </div>
        </div>
      </div>
    );
  }, [mayaData]);

  // 玛雅历法知识卡片组件
  const MayaKnowledgeCard = useMemo(() => {
    // 根据当前KIN动态生成知识内容
    const getMayaKnowledge = (kin) => {
      // 玛雅历法基础概念
      const basicKnowledge = {
        title: "玛雅历法简介",
        content: "玛雅13月亮历是古代玛雅人使用的神圣历法系统，基于260天的循环周期。它由13个银河音调（调性）和20个太阳印记（图腾）组合而成，共260个不同的能量组合。",
        icon: (
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        color: "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 border-indigo-200 dark:border-indigo-700"
      };
      
      // 调性知识
      const toneKnowledge = {
        title: "银河音调 - 调性的奥秘",
        content: "玛雅历法中的13个调性代表宇宙创造的13个阶段。从磁性的自我存在到宇宙的超频存在，每个调性都有其独特的能量特质和人生课题。它们引导我们理解生命中的不同阶段和成长过程。",
        icon: (
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-blue-200 dark:border-blue-700"
      };
      
      // 图腾知识
      const sealKnowledge = {
        title: "太阳印记 - 图腾的力量",
        content: "20个太阳印记是玛雅历法中的核心能量符号，每个图腾代表一种特定的生命能量和进化路径。从红龙到黄太阳，它们构成了完整的意识进化图谱，帮助我们理解自己在宇宙中的位置和使命。",
        icon: (
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
        color: "bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-green-200 dark:border-green-700"
      };
      
      // KIN组合知识
      const kinKnowledge = {
        title: "KIN能量 - 260天的智慧",
        content: "每个KIN都是独一无二的能量组合，由特定的调性和图腾构成。这个260天的周期被称为Tzolkin，它反映了宇宙创造的基本节奏。了解自己的KIN可以帮助我们理解个人特质和人生使命。",
        icon: (
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        color: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-purple-200 dark:border-purple-700"
      };
      
      // 实践应用知识
      const practiceKnowledge = {
        title: "日常实践 - 玛雅智慧的应用",
        content: "玛雅历法不仅是古老的知识体系，更是实用的生活工具。通过每日关注KIN能量，我们可以更好地规划生活、理解人际关系、把握时机。它帮助我们与自然节奏同步，活在更高的意识维度。",
        icon: (
          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        color: "bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-yellow-200 dark:border-yellow-700"
      };
      
      // 根据KIN选择不同的知识内容
      const knowledgeOptions = [basicKnowledge, toneKnowledge, sealKnowledge, kinKnowledge, practiceKnowledge];
      const selectedKnowledge = knowledgeOptions[kin % knowledgeOptions.length];
      
      return selectedKnowledge;
    };
    
    const knowledge = mayaData ? getMayaKnowledge(mayaData.kin) : {
      title: "玛雅历法简介",
      content: "玛雅13月亮历是古代玛雅人使用的神圣历法系统，基于260天的循环周期。",
      icon: (
        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 border-indigo-200 dark:border-indigo-700"
    };
    
    return (
      <div className={`${knowledge.color} border rounded-lg p-4 animate-fade-in transition-all duration-300 hover:shadow-md`}>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          {knowledge.icon}
          {knowledge.title}
        </h4>
        <p className="text-xs text-gray-700 dark:text-white leading-relaxed mb-3">
          {knowledge.content}
        </p>
        
        {/* 添加互动元素 - 基于当前KIN的实践提示 */}
        <div className="bg-white dark:bg-gray-800 rounded-md p-3 mt-3">
          <h5 className="text-xs font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            今日实践
          </h5>
          <p className="text-xs text-gray-600 dark:text-white leading-relaxed">
            根据{mayaData?.fullName}的能量，今天特别适合{" "}
            {mayaData?.suggestion}。{" "}
            记住，玛雅历法提醒我们与自然周期同步，在每个当下保持觉知。
          </p>
        </div>
        
        {/* 添加探索链接 */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-white">
            KIN {mayaData?.kin} / 260天周期第{mayaData?.kin}天
          </div>
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
            了解更多
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }, [mayaData]);

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
    <div className="space-y-2">
      {/* 今日启示 */}
      {DailyInspiration}

      {/* 日期选择区域 - 紧凑布局 */}
      {DateSelectionArea}

      {/* 玛雅历法核心信息 - 移除标题，紧凑设计 */}
      <MayaInfoCard>
        {MayaCoreInfo}
        {MayaFullName}
      </MayaInfoCard>

      {/* 能量提示 */}
      {EnergyTip}

      {/* 玛雅历法知识卡片 */}
      {MayaKnowledgeCard}
    </div>
  );
});

// 添加显示名称，便于调试
MayaCalendar.displayName = 'MayaCalendar';

export default MayaCalendar;