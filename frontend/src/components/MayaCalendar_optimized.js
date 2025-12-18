import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';

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
  <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
    <div className="animate-pulse flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">正在计算玛雅历法...</p>
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
    <h3 className="text-red-800 dark:text-red-300 text-sm font-medium mb-1">加载失败</h3>
    <p className="text-red-600 dark:text-red-400 text-xs mb-2">{error}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
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
    <h3 className="text-gray-800 dark:text-gray-300 text-sm font-medium mb-1">暂无数据</h3>
    <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">暂时无法获取玛雅历法数据</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
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

  // 优化的日期变化处理 - 使用防抖
  const handleDateChange = useCallback((e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      
      // 使用防抖避免频繁计算
      if (handleDateChange.debounceTimer) {
        clearTimeout(handleDateChange.debounceTimer);
      }
      
      handleDateChange.debounceTimer = setTimeout(() => {
        loadMayaData(newDate);
      }, 50);
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

  // 组件挂载时延迟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      loadMayaData(new Date());
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // 清理防抖定时器
      if (handleDateChange.debounceTimer) {
        clearTimeout(handleDateChange.debounceTimer);
      }
    };
  }, [loadMayaData]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handleDateChange.debounceTimer) {
        clearTimeout(handleDateChange.debounceTimer);
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
    <div className="flex justify-center space-x-2 mt-3">
      {[-1, 0, 1].map((offset) => (
        <button
          key={offset}
          onClick={() => handleQuickSelect(offset)}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            offset === 0
              ? 'bg-purple-600 text-white'
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
      <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
          KIN {mayaData?.kin}
        </div>
        <div className="text-xs text-purple-800 dark:text-purple-300">能量编号</div>
      </div>
      
      {/* 调性 */}
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
          {mayaData?.tone}
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-300">银河音调</div>
      </div>
      
      {/* 图腾 */}
      <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
          {mayaData?.seal}
        </div>
        <div className="text-xs text-green-800 dark:text-green-300">太阳印记</div>
      </div>
    </div>
  ), [mayaData?.kin, mayaData?.tone, mayaData?.seal]);

  // 优化的完整名称组件 - 移到条件渲染之前
  const MayaFullName = useMemo(() => (
    <div className="mt-3 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-center">
      <div className="text-lg font-bold">{mayaData?.fullName}</div>
      <div className="text-sm opacity-90">今日玛雅历法能量</div>
    </div>
  ), [mayaData?.fullName]);

  // 优化的能量提示组件 - 移到条件渲染之前
  const EnergyTip = useMemo(() => (
    <div className={`${mayaData?.bgColor} border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg p-3`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        今日能量提示
      </h4>
      <p className={`text-xs ${mayaData?.textColor}`}>
        <strong>能量等级：{mayaData?.level}</strong> - {mayaData?.tip}
      </p>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <strong>建议活动：</strong>{mayaData?.suggestion}
      </div>
    </div>
  ), [mayaData?.bgColor, mayaData?.textColor, mayaData?.level, mayaData?.tip, mayaData?.suggestion]);

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
    <div className="space-y-4">
      {/* 日期选择区域 */}
      <MayaInfoCard>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-3 sm:mb-0">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              选择查询日期
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              查看特定日期的玛雅历法能量
            </p>
          </div>
          <div>
            <input
              type="date"
              value={formatDateLocal(selectedDate)}
              onChange={handleDateChange}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        {/* 快速选择按钮 */}
        {QuickSelectButtons}
      </MayaInfoCard>

      {/* 玛雅历法核心信息 */}
      <MayaInfoCard>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          玛雅历法信息
        </h3>
        
        {MayaCoreInfo}
        {MayaFullName}
      </MayaInfoCard>

      {/* 能量提示 */}
      {EnergyTip}

      {/* 玛雅历法说明 */}
      <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 dark:border-gray-600 rounded-r-lg p-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-1">
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