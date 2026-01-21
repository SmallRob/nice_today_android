import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDressInfo } from '../../services/localDataService.js';
import { DressGuideIcon } from '../icons';

// 每日穿搭与饮食建议卡片组件
const DressDietCard = ({ onClick }) => {
  const navigate = useNavigate();
  const [dressInfo, setDressInfo] = useState(null);
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
    return `dress-diet-${today}`;
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

  // 获取今日穿搭饮食信息
  const fetchDressInfo = async () => {
    try {
      setLoading(true);

      // 首先检查缓存
      const cachedData = getCachedData();
      if (cachedData) {
        setDressInfo(cachedData);
        setError(null);
        return;
      }

      const today = new Date();
      const info = generateDressInfo(today);
      setDressInfo(info);
      setError(null);

      // 设置缓存
      setCachedData(info);
    } catch (err) {
      setError(err.message);
      console.error('获取穿搭信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDressInfo();
  }, []);

  // 获取五行颜色建议
  const getColorSuggestions = (colors) => {
    if (!colors || colors.length === 0) return [];
    const allColors = colors.flatMap(colorObj => colorObj.具体颜色 || []);
    return allColors.slice(0, 3);
  };

  // 获取饮食建议
  const getFoodSuggestions = (foods) => {
    if (!foods || !foods.宜 || foods.宜.length === 0) return [];
    return foods.宜.slice(0, 3); // 只取前3个推荐食物
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/dress');
    }
  };

  if (loading) {
    return (
      <div className="health-card dress-diet-card">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
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
      <div className="health-card dress-diet-card">
        <div className="bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">数据加载失败</p>
          </div>
        </div>
      </div>
    );
  }

  const colorSuggestions = getColorSuggestions(dressInfo?.color_suggestions || []);
  const foodSuggestions = getFoodSuggestions(dressInfo?.food_suggestions || {});

  return (
    <div
      className="health-card dress-diet-card"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-2xl text-white shadow-lg h-full border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
            <DressGuideIcon size={24} color="white" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg drop-shadow-lg">穿搭饮食</h3>
            <p className="text-xs opacity-100 font-medium">今日建议</p>
          </div>
        </div>

        {/* 今日五行 */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold opacity-100">今日五行</span>
            <span className="text-[11px] bg-white/30 px-2 py-1 rounded-full font-medium shadow-sm">
              {dressInfo?.daily_element || '木'}
            </span>
          </div>
        </div>

        {/* 穿搭建议和饮食推荐分左右栏显示 */}
        <div className="grid grid-cols-2 gap-2 mb-2 w-full" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {/* 穿搭建议 */}
          <div className="border-r border-white border-opacity-30 pr-2 min-w-0 overflow-hidden h-full flex flex-col">
            <p className="text-xs font-semibold opacity-100 mb-1 whitespace-nowrap truncate">穿搭建议：</p>
            <div className="flex flex-wrap gap-1 content-start">
              {colorSuggestions.length > 0 ? (
                colorSuggestions.map((color, index) => (
                  <span
                    key={index}
                    className="text-[11px] bg-white/30 px-2 py-1 rounded-full truncate max-w-full font-medium shadow-sm"
                  >
                    {color}
                  </span>
                ))
              ) : (
                <span className="text-[11px] opacity-80 font-medium">无</span>
              )}
            </div>
          </div>

          {/* 饮食建议 */}
          <div className="pl-2 min-w-0 overflow-hidden h-full flex flex-col">
            <p className="text-xs font-semibold opacity-100 mb-1 whitespace-nowrap truncate">饮食推荐：</p>
            <div className="flex flex-wrap gap-1 content-start">
              {foodSuggestions.length > 0 ? (
                foodSuggestions.map((food, index) => (
                  <span
                    key={index}
                    className="text-[11px] bg-white/30 px-2 py-1 rounded-full truncate max-w-full font-medium shadow-sm"
                  >
                    {food}
                  </span>
                ))
              ) : (
                <span className="text-[11px] opacity-80 font-medium">无</span>
              )}
            </div>
          </div>
        </div>

        {/* 养生提示 */}
        <div className="mb-1">
          <p className="text-[11px] opacity-90 font-medium drop-shadow">
            {dressInfo?.health_advice || '根据五行理论，选择合适颜色和食物'}
          </p>
        </div>

        {/* 快速操作提示 */}
        <div className="pt-1 border-t border-white border-opacity-30">
          <p className="text-[11px] opacity-90 font-medium text-center drop-shadow">
            详细指南
          </p>
        </div>
      </div>
    </div>
  );
};

export default DressDietCard;