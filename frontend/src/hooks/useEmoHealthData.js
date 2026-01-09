import { useState, useEffect, useCallback } from 'react';
import { generateMockEmoHealthData } from '../utils/emoHealthCalculator';

/**
 * 情绪健康数据 Hook
 */
const useEmoHealthData = () => {
  const [emoHealthData, setEmoHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟数据加载
  const loadEmoHealthData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // 模拟API调用延迟
    setTimeout(() => {
      try {
        // 生成模拟数据（实际项目中应从API获取）
        const mockData = generateMockEmoHealthData();
        setEmoHealthData(mockData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load emotion health data');
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadEmoHealthData();
  }, [loadEmoHealthData]);

  // 返回数据和方法
  return {
    emoHealthData,
    isLoading,
    error,
    refresh: loadEmoHealthData
  };
};

export default useEmoHealthData;