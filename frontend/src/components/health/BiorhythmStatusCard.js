import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentConfig } from '../../contexts/UserConfigContext.js';
import { getBiorhythmRange } from '../../services/localDataService';
import { BiorhythmIcon } from '../icons';

// 生物节律状态卡片组件
const BiorhythmStatusCard = ({ onClick }) => {
  const navigate = useNavigate();
  const userConfig = useCurrentConfig();
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从本地存储获取用户设置的缓存超时时间
  const getUserCacheTimeout = () => {
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    return savedCacheTimeout ? parseInt(savedCacheTimeout) : 10800000; // 默认3小时
  };

  // 生成缓存键
  const getCacheKey = () => {
    const today = new Date().toDateString();
    return `biorhythm-${today}`;
  };

  // 检查缓存
  const getCachedData = () => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();
        const currentDate = new Date().toDateString();

        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(cacheKey);
          return null;
        }

        // 检查缓存是否超时
        const cacheTimeout = getUserCacheTimeout();
        if (now - timestamp < cacheTimeout) {
          return data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 设置缓存
  const setCachedData = (data) => {
    try {
      const cacheKey = getCacheKey();
      const currentDate = new Date().toDateString();
      const cacheData = {
        data,
        timestamp: Date.now(),
        date: currentDate  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('设置缓存失败:', e);
    }
  };

  // 获取今日生物节律数据
  const fetchBiorhythmData = async () => {
    try {
      setLoading(true);

      // 检查缓存
      const cachedData = getCachedData();
      if (cachedData) {
        setBiorhythmData(cachedData);
        setError(null);
        return;
      }

      // 检查是否有出生日期
      if (!userConfig?.birthDate) {
        setError('未设置出生日期，请先配置用户信息');
        setLoading(false);
        return;
      }

      const result = await getBiorhythmRange(userConfig.birthDate, 10, 20);
      if (result.success && result.rhythmData && result.rhythmData.length > 0) {
        // 获取今天的数据
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const todayData = result.rhythmData.find(item => {
          const itemDate = new Date(item.date);
          return itemDate.toISOString().split('T')[0] === todayStr;
        });

        if (todayData) {
          setBiorhythmData(todayData);
          setError(null); // 成功时清除错误
          // 设置缓存
          setCachedData(todayData);
        } else {
          // 如果没有今天的数据，使用数组中最后一个数据
          const lastData = result.rhythmData[result.rhythmData.length - 1];
          setBiorhythmData(lastData);
          setError(null); // 成功时清除错误
          // 设置缓存
          setCachedData(lastData);
        }
      } else {
        setError('获取生物节律数据失败，请稍后重试');
      }
    } catch (err) {
      setError(err.message);
      console.error('获取生物节律数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiorhythmData();
  }, [userConfig?.birthDate]); // 当出生日期变化时重新获取数据

  // 计算综合能量分数
  const calculateCombinedScore = () => {
    if (!biorhythmData) return 50;

    const { physical = 0, emotional = 0, intellectual = 0 } = biorhythmData;
    const weights = { physical: 0.33, emotional: 0.33, intellectual: 0.34 };

    const combinedValue = (
      physical * weights.physical +
      emotional * weights.emotional +
      intellectual * weights.intellectual
    );

    // 将-100到100的范围映射到0-100的分数
    return Math.round((combinedValue + 100) / 2);
  };

  // 获取能量等级描述
  const getEnergyLevel = (score) => {
    if (score >= 80) return { text: '极佳', color: 'text-green-400', bg: 'bg-green-500' };
    if (score >= 60) return { text: '良好', color: 'text-blue-400', bg: 'bg-blue-500' };
    if (score >= 40) return { text: '一般', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    if (score >= 20) return { text: '较低', color: 'text-orange-400', bg: 'bg-orange-500' };
    return { text: '低谷', color: 'text-red-400', bg: 'bg-red-500' };
  };

  // 获取节律状态描述
  const getRhythmDescription = (value, type) => {
    if (value > 50) return `${type}值较高`;
    if (value > 0) return `${type}值正常`;
    if (value > -50) return `${type}值较低`;
    return `${type}值低谷`;
  };

  const combinedScore = calculateCombinedScore();
  const energyLevel = getEnergyLevel(combinedScore);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/biorhythm');
    }
  };

  // 如果没有出生日期，显示提示信息
  if (!userConfig?.birthDate) {
    return (
      <div className="health-card biorhythm-card">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <p className="text-sm">请先设置出生日期</p>
            <button
              className="mt-2 px-3 py-1 bg-white text-orange-500 text-xs font-medium rounded-full"
              onClick={() => navigate('/user-config')}
            >
              去设置
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="health-card biorhythm-card">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-card biorhythm-card">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="health-card biorhythm-card"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 p-3 rounded-2xl text-white shadow-lg h-full border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
            <BiorhythmIcon size={24} color="white" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-base">生物节律</h3>
            <p className="text-xs opacity-90">今日能量</p>
          </div>
        </div>

        <div className="text-center mb-2">
          <div className="text-2xl font-bold mb-1">{combinedScore}</div>
          <p className={`text-xs font-medium ${energyLevel.color}`}>{energyLevel.text}</p>
        </div>

        {/* 能量彩虹条 */}
        <div className="mb-2">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${energyLevel.bg}`}
              style={{ width: `${combinedScore}%` }}
            ></div>
          </div>
        </div>

        {/* 三个节律值 */}
        {biorhythmData && (
          <div className="grid grid-cols-3 gap-1 text-xs w-full" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0 overflow-hidden">
              <div className="text-green-300 font-bold text-sm truncate">{Math.round(biorhythmData.physical)}</div>
              <div className="truncate text-[10px] whitespace-nowrap">体力</div>
            </div>
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0 overflow-hidden">
              <div className="text-blue-300 font-bold text-sm truncate">{Math.round(biorhythmData.emotional)}</div>
              <div className="truncate text-[10px] whitespace-nowrap">情绪</div>
            </div>
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0 overflow-hidden">
              <div className="text-purple-300 font-bold text-sm truncate">{Math.round(biorhythmData.intellectual)}</div>
              <div className="truncate text-[10px] whitespace-nowrap">智力</div>
            </div>
          </div>
        )}

        {/* 简要建议 */}
        <div className="mt-1 pt-1 border-t border-white border-opacity-20">
          <p className="text-[10px] opacity-75 truncate">
            {biorhythmData
              ? `今日${getRhythmDescription(biorhythmData.physical, '体力')}，注意调节作息`
              : '点击查看详情'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmStatusCard;