import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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

// 优化的渲染组件 - 移到外部以避免重复创建
const MayaInfoCard = memo(({ children, className = "" }) => (
  <div className={`maya-card ${className}`}>
    {children}
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

  // 回到今天函数
  const handleBackToToday = useCallback(() => {
    const today = getToday();
    setSelectedDate(today);
    setSelectedOffset(0);

    // 使用setTimeout确保UI更新完成后再加载数据
    setTimeout(() => {
      loadMayaData(today);
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
      // 仅在初始加载时设置偏移量为0（今天）
      if (selectedOffset === 0) {
        loadMayaData(selectedDate);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [loadMayaData, selectedDate, selectedOffset]);

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
      <div className={`${knowledge.color} border maya-rounded-lg maya-padding-md animate-fade-in transition-all duration-300`}>
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
    <div className="bg-gray-50 dark:bg-gray-900 pb-10 performance-optimized" style={{ touchAction: 'pan-y' }}>
      {/* 优化的页面标题 - 添加日期状态指示 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-b-lg shadow-lg">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl md:text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
              玛雅历法
            </h1>

            {/* 日期状态指示器 */}
            {selectedOffset !== 0 && (
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">
                  {selectedOffset < 0 ? `查看${Math.abs(selectedOffset)}天前` : `查看${selectedOffset}天后`}
                </span>
              </div>
            )}
          </div>

          <p className="text-purple-100 text-xs md:text-sm opacity-90">
            {selectedOffset === 0
              ? "古代玛雅人的神圣历法系统，揭示每日独特能量"
              : selectedOffset < 0
                ? `探索${Math.abs(selectedOffset)}天前的玛雅能量，了解历史周期`
                : `预览${selectedOffset}天后的玛雅能量，为未来做好准备`
            }
          </p>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4">
        {/* 今日启示 - 使用与穿衣养生页面一致的样式 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">今日启示</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm md:text-base">
              玛雅历法提醒我们，每一天都有独特的能量和意义。通过关注当下的能量，我们可以更好地与宇宙节奏同步。
            </p>
          </div>
        </div>

        {/* 优化的日期选择区域 - 添加清晰的视觉反馈和回到今天功能 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 md:p-5">
            {/* 日期状态指示器 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mr-3">
                  查看日期
                </h3>
                {/* 日期状态标签 */}
                {selectedOffset !== 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedOffset < 0
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                    {selectedOffset < 0 ? '查看过去' : '查看未来'}
                  </span>
                )}
              </div>

              {/* 回到今天按钮 - 仅在非今天时显示 */}
              {selectedOffset !== 0 && (
                <button
                  onClick={handleBackToToday}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:from-purple-700 hover:to-blue-700 active:scale-95 shadow-md touch-manipulation flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  回到今天
                </button>
              )}
            </div>

            {/* 日期选择器 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择查看日期
              </label>
              <input
                type="date"
                value={formatDateLocal(selectedDate)}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-500"
              />
            </div>

            {/* 快速选择按钮 - 增强视觉反馈 */}
            <div className="flex justify-center space-x-2 md:space-x-3">
              {[-1, 0, 1].map((offset) => (
                <button
                  key={offset}
                  onClick={() => handleQuickSelect(offset)}
                  className={`px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-medium transition-all duration-200 relative group touch-manipulation text-sm ${selectedOffset === offset
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 active:shadow-inner'
                    }`}
                >
                  {/* 增强高亮反馈效果 */}
                  <div className={`absolute inset-0 rounded-lg transition-all duration-150 ${selectedOffset === offset
                    ? 'bg-white opacity-30'
                    : 'bg-white opacity-0 group-active:opacity-30'
                    }`}></div>
                  {/* 添加光晕效果 */}
                  <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${selectedOffset === offset
                    ? 'bg-gradient-to-r from-purple-400/20 to-blue-400/20'
                    : 'opacity-0 group-hover:bg-gradient-to-r group-hover:from-purple-400/10 group-hover:to-blue-400/10'
                    }`}></div>
                  <span className="relative font-medium">{offset === -1 ? '昨天' : offset === 0 ? '今天' : '明天'}</span>
                </button>
              ))}
            </div>

            {/* 当前查看日期提示 */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedOffset === 0 ? (
                  <>当前查看：<span className="font-medium text-purple-600 dark:text-purple-400">今日玛雅历法</span></>
                ) : selectedOffset < 0 ? (
                  <>当前查看：<span className="font-medium text-orange-600 dark:text-orange-400">{Math.abs(selectedOffset)}天前的玛雅历法</span></>
                ) : (
                  <>当前查看：<span className="font-medium text-green-600 dark:text-green-400">{selectedOffset}天后的玛雅历法</span></>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 玛雅历法核心信息 - 使用与穿衣养生页面一致的卡片样式 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* KIN数 */}
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 md:p-4 text-center">
                <div className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  KIN {mayaData?.kin}
                </div>
                <div className="text-xs md:text-sm text-purple-800 dark:text-purple-300 font-medium">能量编号</div>
              </div>

              {/* 调性 */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 md:p-4 text-center">
                <div className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {mayaData?.tone}
                </div>
                <div className="text-xs md:text-sm text-blue-800 dark:text-blue-300 font-medium">银河音调</div>
              </div>

              {/* 图腾 */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 md:p-4 text-center">
                <div className="text-sm md:text-base font-bold text-green-600 dark:text-green-400 mb-1">
                  {mayaData?.seal}
                </div>
                <div className="text-xs md:text-sm text-green-800 dark:text-green-300 font-medium">太阳印记</div>
              </div>
            </div>

            {/* 完整名称 - 使用与穿衣养生页面一致的渐变样式 */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 md:p-5 text-white text-center">
              <div className="text-lg md:text-xl font-bold mb-2">{mayaData?.fullName}</div>
              <div className="text-xs md:text-sm opacity-90">今日玛雅能量</div>
            </div>
          </div>
        </div>

        {/* 能量提示 - 使用与穿衣养生页面一致的样式 */}
        <div className={`${mayaData?.bgColor} border-l-4 border-purple-500 dark:border-purple-400 rounded-lg`}>
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">今日能量提示</h3>
            </div>
            <div className="space-y-3">
              <p className={`text-sm md:text-base ${mayaData?.textColor} leading-relaxed`}>
                <strong>能量等级：{mayaData?.level}</strong> - {mayaData?.tip}
              </p>
              <div className="text-sm md:text-base">
                <strong>建议活动：</strong>{mayaData?.suggestion}
              </div>
            </div>
          </div>
        </div>

        {/* 玛雅历法知识卡片 - 使用与穿衣养生页面一致的样式 */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg">
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">玛雅历法简介</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4 text-sm md:text-base">
              玛雅13月亮历是古代玛雅人使用的神圣历法系统，基于260天的循环周期。它由13个银河音调（调性）和20个太阳印记（图腾）组合而成，共260个不同的能量组合。
            </p>

            {/* 互动元素 - 基于当前KIN的实践提示 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white">今日实践</h4>
              </div>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm md:text-base">
                根据{mayaData?.fullName}的能量，今天特别适合{" "}
                {mayaData?.suggestion}。{" "}
                记住，玛雅历法提醒我们与自然周期同步，在每个当下保持觉知。
              </p>
            </div>

            {/* 扩展信息部分 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 周期进度 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-2">周期进度</h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    style={{ width: `${(mayaData?.kin / 260) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  KIN {mayaData?.kin} / 260天周期第{mayaData?.kin}天 ({Math.round((mayaData?.kin / 260) * 100)}%)
                </p>
              </div>

              {/* 调性图解 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-2">调性图解</h4>
                <div className="flex flex-wrap gap-1">
                  {MayaCalendarUtils.TONES.map((tone, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs font-medium ${index === mayaData?.toneIndex
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2">
                  当前：{mayaData?.tone} (第{mayaData?.toneIndex + 1}调)
                </p>
              </div>
            </div>

            {/* 学习资源链接 */}
            <div className="flex justify-between items-center">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                13月亮历 · 20图腾 · 260天周期
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center text-sm font-medium touch-manipulation transition-all duration-200 hover:scale-105 active:scale-95 relative group">
                <span className="relative">了解更多</span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {/* 添加下划线动画效果 */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 group-hover:w-full"></div>
              </button>
            </div>
          </div>
        </div>

        {/* 增强功能：玛雅能量与个人计划结合 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">今日能量规划</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    重点行动
                  </h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {mayaData?.level === '高' ? '开启新项目，做出重要决策' :
                      mayaData?.level === '中' ? '推进计划，保持平衡' :
                        '休息调整，内省规划'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    能量时段
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {mayaData?.level === '高' ? '上午9-11点，下午2-4点' :
                      mayaData?.level === '中' ? '上午10-12点，下午3-5点' :
                        '全时段保持轻松节奏'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    能量等级
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {mayaData?.level === '高' ? '高能量日 - 积极行动' :
                      mayaData?.level === '中' ? '中等能量 - 稳步推进' :
                        '低能量日 - 调整节奏'}
                  </p>
                </div>
              </div>

              {/* 新增：能量强度指示器 */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">今日能量强度</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${mayaData?.level === '高' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    mayaData?.level === '中' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {mayaData?.level || '中'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${mayaData?.level === '高' ? 'bg-gradient-to-r from-green-500 to-teal-500 w-4/5' :
                      mayaData?.level === '中' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 w-3/5' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500 w-2/5'
                      }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 新增：玛雅周期进度追踪 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">周期进度</h3>
            </div>
            <div className="space-y-4">
              {/* 260天周期进度 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">260天周期</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">第{mayaData?.kin || 1}天</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((mayaData?.kin || 1) / 260) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">1</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">130</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">260</span>
                </div>
              </div>

              {/* 13天周期进度 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">13天音调周期</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">第{(mayaData?.kin || 1) % 13 || 13}天</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(((mayaData?.kin || 1) % 13 || 13) / 13) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 20天周期进度 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">20天印记周期</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">第{(mayaData?.kin || 1) % 20 || 20}天</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(((mayaData?.kin || 1) % 20 || 20) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 新增：今日能量启示卡片 */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg">
          <div className="p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">今日能量启示</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm leading-relaxed opacity-90">
                {mayaData?.level === '高' ?
                  '今天宇宙能量充沛，是行动和创造的好时机。勇敢追求目标，相信你的直觉。' :
                  mayaData?.level === '中' ?
                    '保持平衡的节奏，稳步推进计划。倾听内在声音，找到和谐的生活方式。' :
                    '放慢脚步，关注内在需求。休息和反思能带来新的洞察和方向。'
                }
              </p>
              <div className="flex items-center text-xs opacity-75">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V6z" clipRule="evenodd" />
                </svg>
                基于{mayaData?.fullName}的玛雅能量分析
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
MayaCalendarTab.displayName = 'MayaCalendarTab';

export default MayaCalendarTab;