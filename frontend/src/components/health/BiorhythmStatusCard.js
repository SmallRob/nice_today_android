import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentConfig } from '../../contexts/UserConfigContext.js';
import { getBiorhythmRange } from '../../services/localDataService';

// 生物节律状态卡片组件
const BiorhythmStatusCard = ({ onClick }) => {
  const navigate = useNavigate();
  const userConfig = useCurrentConfig();
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取今日生物节律数据
  const fetchBiorhythmData = async () => {
    try {
      setLoading(true);
      
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
        } else {
          // 如果没有今天的数据，使用数组中最后一个数据
          setBiorhythmData(result.rhythmData[result.rhythmData.length - 1]);
          setError(null); // 成功时清除错误
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
            <div className="text-2xl mb-2">📅</div>
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
            <div className="text-2xl mb-2">⚠️</div>
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
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl text-white shadow-lg h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl">🌈</div>
          <div className="text-right">
            <h3 className="font-bold text-lg">生物节律</h3>
            <p className="text-sm opacity-90">今日能量状态</p>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-3xl font-bold mb-1">{combinedScore}</div>
          <p className={`text-sm font-medium ${energyLevel.color}`}>{energyLevel.text}</p>
        </div>

        {/* 能量彩虹条 */}
        <div className="mb-3">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${energyLevel.bg}`}
              style={{ width: `${combinedScore}%` }}
            ></div>
          </div>
        </div>

        {/* 三个节律值 */}
        {biorhythmData && (
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0">
              <div className="text-green-300 font-bold truncate">{Math.round(biorhythmData.physical)}</div>
              <div className="truncate">体力</div>
            </div>
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0">
              <div className="text-blue-300 font-bold truncate">{Math.round(biorhythmData.emotional)}</div>
              <div className="truncate">情绪</div>
            </div>
            <div className="text-center p-1 bg-white bg-opacity-10 rounded min-w-0">
              <div className="text-purple-300 font-bold truncate">{Math.round(biorhythmData.intellectual)}</div>
              <div className="truncate">智力</div>
            </div>
          </div>
        )}

        {/* 简要建议 */}
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs opacity-75">
            {biorhythmData 
              ? `今日${getRhythmDescription(biorhythmData.physical, '体力')}，注意调节作息`
              : '点击查看详情获取完整分析'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmStatusCard;