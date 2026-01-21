import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrganRhythmData } from '../../services/dataService.js';
import { getBodyMetricsStatus } from '../../services/bodyMetricsService.js';
import { OrganRhythmIcon } from '../icons';

// 身体指标与器官节律卡片组件
const BodyMetricsRhythmCard = ({ onClick }) => {
  const navigate = useNavigate();
  const [organRhythm, setOrganRhythm] = useState(null);
  const [bodyMetricsStatus, setBodyMetricsStatus] = useState(null);
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
    return `body-metrics-${today}`;
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

  // 获取当前时段器官节律
  const getCurrentOrganRhythm = async () => {
    try {
      const data = await fetchOrganRhythmData();
      if (data && data.length > 0) {
        // 获取当前小时对应的器官节律
        const currentHour = new Date().getHours();
        const currentRhythm = data.find(item => {
          const [startHour, endHour] = item.time.split('-').map(time => parseInt(time.split(':')[0]));
          return currentHour >= startHour && currentHour < endHour;
        }) || data[0]; // 如果没找到匹配的，使用第一个

        return currentRhythm;
      }
    } catch (err) {
      console.error('获取器官节律数据失败:', err);
      setError(err.message);
      throw err;
    }
  };

  // 获取身体指标状态
  const getBodyMetricsStatusData = async () => {
    try {
      const status = await getBodyMetricsStatus();
      return status;
    } catch (err) {
      console.error('获取身体指标状态失败:', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 检查缓存
        const cachedData = getCachedData();
        if (cachedData) {
          setOrganRhythm(cachedData.organRhythm);
          setBodyMetricsStatus(cachedData.bodyMetricsStatus);
          setError(null);
        } else {
          // 并行获取数据
          const [organRhythmData, bodyMetricsData] = await Promise.all([
            getCurrentOrganRhythm(),
            getBodyMetricsStatusData()
          ]);

          setOrganRhythm(organRhythmData);
          setBodyMetricsStatus(bodyMetricsData);
          setError(null);

          // 设置缓存
          setCachedData({
            organRhythm: organRhythmData,
            bodyMetricsStatus: bodyMetricsData
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/body-metrics');
    }
  };

  if (loading) {
    return (
      <div className="health-card metrics-rhythm-card">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
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
      <div className="health-card metrics-rhythm-card">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">数据加载失败</p>
          </div>
        </div>
      </div>
    );
  }

  // 计算身体指标异常数量
  const abnormalMetricsCount = bodyMetricsStatus
    ? Object.values(bodyMetricsStatus).filter(status => status !== 'normal').length
    : 0;

  // 获取器官养生建议
  const getOrganHealthAdvice = (organ) => {
    const adviceMap = {
      '胆': '胆经旺盛，适合决断和计划，避免油腻食物',
      '肝': '肝经活跃，注意情绪调节，可适当食用绿色蔬菜',
      '肺': '肺经活跃，注意呼吸系统健康，多食白色润燥食物',
      '大肠': '大肠经活跃，注意排便通畅，多食纤维食物',
      '胃': '胃经活跃，注意饮食规律，避免过饥过饱',
      '脾': '脾经活跃，注意消化功能，多食黄色养脾食物',
      '心': '心经活跃，注意心血管健康，保持心情愉悦',
      '小肠': '小肠经活跃，注意营养吸收，饮食清淡',
      '膀胱': '膀胱经活跃，注意泌尿系统健康，适量饮水',
      '肾': '肾经活跃，注意腰部保暖，避免过度劳累',
      '心包': '心包经活跃，注意心脏保护，保持情绪稳定',
      '三焦': '三焦经活跃，注意水液代谢，保持经络通畅'
    };

    return adviceMap[organ] || '注意相应脏腑功能，保持健康作息';
  };

  return (
    <div
      className="health-card metrics-rhythm-card"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-700 p-4 rounded-2xl text-white shadow-lg h-full border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
            <OrganRhythmIcon size={24} color="white" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg">身体指标</h3>
            <p className="text-sm opacity-90">器官节律</p>
          </div>
        </div>

        {/* 当前器官节律 */}
        {organRhythm && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">当前节律</span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                {organRhythm.time}
              </span>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{organRhythm.organ}</div>
              <p className="text-xs opacity-80">{organRhythm.description}</p>
            </div>
          </div>
        )}

        {/* 器官养生建议 */}
        {organRhythm && (
          <div className="mb-3">
            <p className="text-xs font-medium opacity-90 mb-1">养生建议：</p>
            <p className="text-xs opacity-75">
              {getOrganHealthAdvice(organRhythm.organ)}
            </p>
          </div>
        )}

        {/* 身体指标状态 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">指标状态</span>
            <span className={`text-xs px-2 py-1 rounded-full ${abnormalMetricsCount === 0
                ? 'bg-green-500 bg-opacity-30'
                : abnormalMetricsCount <= 2
                  ? 'bg-yellow-500 bg-opacity-30'
                  : 'bg-red-500 bg-opacity-30'
              }`}>
              {abnormalMetricsCount === 0 ? '正常' : `${abnormalMetricsCount}项异常`}
            </span>
          </div>
          <p className="text-xs opacity-75">
            {abnormalMetricsCount === 0
              ? '各项身体指标均在正常范围'
              : `有${abnormalMetricsCount}项指标需关注，请及时调整`}
          </p>
        </div>

        {/* 快速操作提示 */}
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs opacity-75 text-center">
            点击查看详细指标和节律分析
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodyMetricsRhythmCard;