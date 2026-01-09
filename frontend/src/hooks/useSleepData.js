import { useState, useEffect, useCallback } from 'react';
import { generateMockSleepData } from '../utils/sleepCalculator';

/**
 * 睡眠数据 Hook
 */
const useSleepData = () => {
  const [sleepData, setSleepData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟数据加载
  const loadSleepData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // 模拟API调用延迟
    setTimeout(() => {
      try {
        // 生成模拟数据（实际项目中应从API获取）
        const mockData = generateMockSleepData();
        setSleepData(mockData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load sleep data');
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  // 返回数据和方法
  return {
    sleepData,
    isLoading,
    error,
    refresh: loadSleepData
  };
};

export default useSleepData;