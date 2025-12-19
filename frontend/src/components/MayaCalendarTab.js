import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import '../styles/animations.css';
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
        textColor: 'text-gray-700 dark:text-gray-400',
        level: '中',
        suggestion: '适合日常工作、学习、生活'
      };
    }
  }
}

// 优化的加载组件 - 使用全局样式
const LoadingSpinner = memo(() => (
  <div className="maya-loading animate-fadeIn">
    <div className="animate-pulse flex flex-col items-center">
      <div className="maya-loading-spinner"></div>
      <p className="maya-body text-center">正在计算玛雅历法...</p>
    </div>
  </div>
));

// 优化的错误组件 - 使用全局样式
const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="maya-error animate-fadeIn">
    <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
      <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="maya-subtitle mb-2">加载失败</h3>
    <p className="maya-body-sm mb-3">{error}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="maya-button-base maya-error-bg"
      >
        重新加载
      </button>
    )}
  </div>
));

// 优化的空状态组件 - 使用全局样式
const EmptyState = memo(({ onRetry }) => (
  <div className="maya-empty animate-fadeIn">
    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="maya-subtitle mb-2">暂无数据</h3>
    <p className="maya-body-sm mb-3">暂时无法获取玛雅历法数据</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="maya-button-base maya-primary-bg"
      >
        重新加载
      </button>
    )}
  </div>
));

// 主组件 - 使用memo优化性能
const MayaCalendarTab = memo(() => {
  // 使用useRef管理不需要触发重渲染的状态
  const abortControllerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // useState管理需要触发重渲染的状态
  const [selectedDate, setSelectedDate] = useState(() => getToday());
  const [mayaData, setMayaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState(0); // 添加选中的日期偏移量状态

  // 优化的日期格式化函数 - 使用缓存
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
      const today = getToday();
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

  // 优化的渲染组件 - 使用全局样式
  const MayaInfoCard = useMemo(() => memo(({ children, className = "" }) => (
    <div className={`maya-card ${className}`}>
      {children}
    </div>
  )), []);

  // 优化的日期选择区域 - 使用全局样式
  const DateSelectionArea = useMemo(() => (
    <MayaInfoCard>
      <div className="flex items-center justify-between maya-spacing-sm">
        <h3 className="maya-subtitle">
          选择日期
        </h3>
        <input
          type="date"
          value={formatDateLocal(selectedDate)}
          onChange={handleDateChange}
          className="maya-date-input"
        />
      </div>
      
      {/* 快速选择按钮 */}
      <div className="flex justify-center space-x-2">
        {[-1, 0, 1].map((offset) => (
          <button
            key={offset}
            onClick={() => handleQuickSelect(offset)}
            className={`maya-button-sm transition-all ${
              selectedOffset === offset
                ? 'maya-primary-bg text-white shadow-md transform scale-105'
                : 'maya-button-secondary'
            }`}
          >
            {offset === -1 ? '昨天' : offset === 0 ? '今天' : '明天'}
          </button>
        ))}
      </div>
    </MayaInfoCard>
  ), [selectedDate, handleDateChange, handleQuickSelect, formatDateLocal, selectedOffset]);

  // 优化的玛雅历法核心信息组件 - 使用全局样式
  const MayaCoreInfo = useMemo(() => (
    <div className="maya-grid maya-grid-cols-3">
      {/* KIN数 */}
      <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 maya-rounded-lg maya-padding-sm text-center">
        <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
          KIN {mayaData?.kin}
        </div>
        <div className="maya-body-sm text-purple-800 dark:text-purple-300 font-medium">能量编号</div>
      </div>
      
      {/* 调性 */}
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 maya-rounded-lg maya-padding-sm text-center">
        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
          {mayaData?.tone}
        </div>
        <div className="maya-body-sm text-blue-800 dark:text-blue-300 font-medium">银河音调</div>
      </div>
      
      {/* 图腾 */}
      <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 maya-rounded-lg maya-padding-sm text-center">
        <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">
          {mayaData?.seal}
        </div>
        <div className="maya-body-sm text-green-800 dark:text-green-300 font-medium">太阳印记</div>
      </div>
    </div>
  ), [mayaData?.kin, mayaData?.tone, mayaData?.seal]);

  // 优化的完整名称组件 - 使用全局样式
  const MayaFullName = useMemo(() => (
    <div className="maya-padding-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white maya-rounded-lg text-center">
      <div className="maya-title text-white mb-1">{mayaData?.fullName}</div>
      <div className="maya-body-sm opacity-90">今日玛雅能量</div>
    </div>
  ), [mayaData?.fullName]);

  // 优化的能量提示组件 - 使用全局样式
  const EnergyTip = useMemo(() => (
    <div className={`${mayaData?.bgColor} border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg maya-padding-sm`}>
      <h4 className="maya-body-sm font-semibold mb-2">
        今日能量提示
      </h4>
      <p className={`maya-body-sm ${mayaData?.textColor} mb-2 leading-relaxed`}>
        <strong>能量等级：{mayaData?.level}</strong> - {mayaData?.tip}
      </p>
      <div className="maya-body-sm">
        <strong>建议活动：</strong>{mayaData?.suggestion}
      </div>
    </div>
  ), [mayaData?.bgColor, mayaData?.textColor, mayaData?.level, mayaData?.tip, mayaData?.suggestion]);

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
      
      // 根据KIN选择不同的知识内容
      const knowledgeOptions = [basicKnowledge];
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
      <div className={`${knowledge.color} border maya-rounded-lg maya-padding-md animate-fade-in transition-all duration-300 hover:shadow-md`}>
        <h4 className="maya-body font-semibold mb-3 flex items-center">
          {knowledge.icon}
          {knowledge.title}
        </h4>
        <p className="maya-body-sm leading-relaxed mb-3">
          {knowledge.content}
        </p>
        
        {/* 添加互动元素 - 基于当前KIN的实践提示 */}
        <div className="bg-white dark:bg-gray-800 maya-rounded maya-padding-sm mt-3">
          <h5 className="maya-body-sm font-semibold mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            今日实践
          </h5>
          <p className="maya-body-sm leading-relaxed">
            根据{mayaData?.fullName}的能量，今天特别适合{" "}
            {mayaData?.suggestion}。{" "}
            记住，玛雅历法提醒我们与自然周期同步，在每个当下保持觉知。
          </p>
        </div>
        
        {/* 添加探索链接 */}
        <div className="mt-3 flex justify-between items-center">
          <div className="maya-body-sm">
            KIN {mayaData?.kin} / 260天周期第{mayaData?.kin}天
          </div>
          <button className="maya-body-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
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
    <div className="maya-spacing-md space-y-2">
      {/* 今日启示 - 使用全局样式 */}
      <div className="maya-spacing-lg">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 maya-rounded-lg maya-padding-md text-white maya-shadow-sm">
          <h4 className="maya-body font-semibold mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            今日启示
          </h4>
          <p className="maya-body opacity-95 leading-relaxed">
            玛雅历法提醒我们，每一天都有独特的能量和意义。通过关注当下的能量，我们可以更好地与宇宙节奏同步。
          </p>
        </div>
      </div>

      {/* 日期选择区域 - 使用全局样式 */}
      {DateSelectionArea}

      {/* 玛雅历法核心信息 - 使用全局样式 */}
      <MayaInfoCard>
        {MayaCoreInfo}
        {MayaFullName}
      </MayaInfoCard>

      {/* 能量提示 - 使用全局样式 */}
      {EnergyTip}

      {/* 玛雅历法知识卡片 - 使用全局样式 */}
      {MayaKnowledgeCard}
    </div>
  );
});

// 添加显示名称，便于调试
MayaCalendarTab.displayName = 'MayaCalendarTab';

export default MayaCalendarTab;