import React, { useState, useEffect, useCallback } from 'react';
import BiorhythmChart from './BiorhythmChart';
import { getBiorhythmRange } from '../services/localDataService';
import elementConfig from '../config/elementConfig.json';
import { CompatibleStorage, initDataMigration } from '../utils/dataMigration';
import { userConfigManager } from '../utils/userConfigManager';

// 实践活动数据
const PRACTICE_ACTIVITIES = [
  { id: 1, title: "10分钟冥想", description: "专注呼吸，平静思绪", energy: "medium", duration: "10分钟" },
  { id: 2, title: "户外散步", description: "接触自然，呼吸新鲜空气", energy: "high", duration: "15分钟" },
  { id: 3, title: "感恩日记", description: "写下三件感恩的事", energy: "low", duration: "5分钟" },
  { id: 4, title: "深呼吸练习", description: "5-5-5呼吸法", energy: "low", duration: "3分钟" },
  { id: 5, title: "能量伸展", description: "简单拉伸，唤醒身体", energy: "medium", duration: "8分钟" },
  { id: 6, title: "积极肯定语", description: "对自己说积极的话", energy: "low", duration: "2分钟" },
  { id: 7, title: "饮水提醒", description: "喝一杯温水", energy: "low", duration: "1分钟" },
  { id: 8, title: "短暂静坐", description: "闭眼静坐，放松身心", energy: "medium", duration: "7分钟" },
  { id: 9, title: "能量音乐", description: "听一首提升能量的音乐", energy: "low", duration: "4分钟" }
];

const BiorhythmTab = ({ serviceStatus, isDesktop }) => {
  // 初始化数据迁移
  useEffect(() => {
    initDataMigration();
  }, []);

  // 从用户配置管理器获取出生日期
  const [birthDate, setBirthDate] = useState(null);
  const [configManagerReady, setConfigManagerReady] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: ''
  });

  // 初始化配置管理器并获取用户配置
  useEffect(() => {
    const initConfigManager = async () => {
      await userConfigManager.initialize();
      setConfigManagerReady(true);
      
      const currentConfig = userConfigManager.getCurrentConfig();
      if (currentConfig && currentConfig.birthDate) {
        setBirthDate(new Date(currentConfig.birthDate));
        setUserInfo({
          nickname: currentConfig.nickname,
          birthDate: currentConfig.birthDate
        });
      }
    };
    
    initConfigManager();
    
    // 添加配置变更监听器
    const removeListener = userConfigManager.addListener(({
      currentConfig
    }) => {
      if (currentConfig && currentConfig.birthDate) {
        setBirthDate(new Date(currentConfig.birthDate));
        setUserInfo({
          nickname: currentConfig.nickname,
          birthDate: currentConfig.birthDate
        });
      }
    });
    
    return () => {
      removeListener();
    };
  }, []);
  
  const [rhythmData, setRhythmData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [practiceActivities, setPracticeActivities] = useState([]);

  // 从配置文件获取默认出生日期
  const DEFAULT_BIRTH_DATE = elementConfig.defaultBirthDate || "1991-01-01";

  // 本地日期格式化方法
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 本地日期解析方法
  const parseDateLocal = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // 随机选择实践活动
  const getRandomActivities = useCallback(() => {
    const shuffled = [...PRACTICE_ACTIVITIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  // 加载生物节律数据 - 本地化版本
  const loadBiorhythmData = useCallback(async (selectedDate = null) => {
    const dateToUse = selectedDate || birthDate;
    
    if (!dateToUse) {
      setError("请选择出生日期");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const birthDateStr = typeof dateToUse === 'string' 
        ? dateToUse 
        : formatDateLocal(dateToUse);
      
      // 使用本地数据服务
      const result = await getBiorhythmRange(birthDateStr, 10, 20);
      
      if (result.success) {
        setRhythmData(result.rhythmData);
        
        // 查找今日数据
        const today = formatDateLocal(new Date());
        const todayData = result.rhythmData.find(item => item.date === today);
        setTodayData(todayData);
        
        // 如果是字符串日期，转换为Date对象并更新birthDate
        if (typeof dateToUse === 'string') {
          const dateObj = parseDateLocal(dateToUse);
          setBirthDate(dateObj);
        }
      } else {
        setError(result.error || "获取数据失败");
      }
    } catch (error) {
      setError("计算生物节律数据时出错");
      console.error('加载生物节律数据失败:', error);
    }
    
    setLoading(false);
  }, [birthDate]);

  // 组件挂载时自动加载默认数据
  useEffect(() => {
    const loadDefaultData = async () => {
      // 等待配置管理器初始化完成
      if (!configManagerReady) return;
      
      // 如果已有出生日期，则使用它
      if (birthDate) {
        await loadBiorhythmData(birthDate);
        return;
      }
      
      // 否则使用默认日期
      const defaultDate = parseDateLocal(DEFAULT_BIRTH_DATE);
      setBirthDate(defaultDate);
      await loadBiorhythmData(defaultDate);
    };
    
    loadDefaultData();
    
    // 初始化实践活动
    setPracticeActivities(getRandomActivities());
  }, [loadBiorhythmData, birthDate, DEFAULT_BIRTH_DATE, configManagerReady, getRandomActivities]);

  // 更换实践活动
  const refreshActivities = () => {
    setPracticeActivities(getRandomActivities());
  };

  if (loading && !rhythmData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">正在计算生物节律...</p>
      </div>
    );
  }

  if (error && !rhythmData) {
    return (
      <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
        <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-red-800 dark:text-red-300 text-sm font-medium mb-1">加载失败</h3>
        <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
        <button 
          onClick={() => loadBiorhythmData()} 
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!rhythmData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-gray-800 dark:text-gray-300 text-sm font-medium mb-1">暂无数据</h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs">暂时无法获取生物节律数据</p>
        <button 
          onClick={() => loadBiorhythmData()} 
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 用户信息卡片 - 手机优化 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {userInfo.nickname ? `${userInfo.nickname} 的生物节律` : '生物节律'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {userInfo.birthDate ? `出生日期: ${userInfo.birthDate}` : '请到设置页面配置信息'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded">
              本地计算
            </span>
          </div>
        </div>
      </div>

      {/* 今日节律状态卡片 - 精简布局 */}
      {todayData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            今日状态
          </h3>
          
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded p-2 text-center">
              <div className="text-base font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                {todayData.physical}%
              </div>
              <div className="text-[10px] text-blue-800 dark:text-blue-300 font-medium">体力</div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded p-2 text-center">
              <div className="text-base font-bold text-red-600 dark:text-red-400 mb-0.5">
                {todayData.emotional}%
              </div>
              <div className="text-[10px] text-red-800 dark:text-red-300 font-medium">情绪</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded p-2 text-center">
              <div className="text-base font-bold text-green-600 dark:text-green-400 mb-0.5">
                {todayData.intellectual}%
              </div>
              <div className="text-[10px] text-green-800 dark:text-green-300 font-medium">智力</div>
            </div>
          </div>
          
          {/* 状态解读 */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {todayData.physical >= 0 ? '✓ 体力充沛' : '⚠ 体力偏低'} · 
              {todayData.emotional >= 0 ? ' 情绪稳定' : ' 情绪波动'} · 
              {todayData.intellectual >= 0 ? ' 思维清晰' : ' 思考需谨慎'}
            </p>
          </div>
        </div>
      )}

      {/* 今日实践建议卡片 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 dark:bg-opacity-20 border border-purple-100 dark:border-purple-700 rounded-lg shadow-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
            今日实践建议
          </h3>
          <button 
            onClick={refreshActivities}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center"
          >
            换一批
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <p className="text-xs text-purple-700 dark:text-purple-400 mb-2">
          根据您的节律状态，推荐以下活动提升能量：
        </p>
        
        <div className="space-y-1.5">
          {practiceActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 rounded-md p-2 flex items-start"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1 whitespace-nowrap">
                    {activity.duration}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生物节律曲线图 - 手机优化 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          趋势图表
        </h3>
        
        {rhythmData && rhythmData.length > 0 ? (
          <div className="h-48">
            <BiorhythmChart 
              data={rhythmData}
              isMobile={true}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
            暂无图表数据
          </div>
        )}
        
        <div className="flex items-center justify-center mt-2 space-x-3">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">体力</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">情绪</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">智力</span>
          </div>
        </div>
      </div>

      {/* 节律说明 - 精简卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 dark:bg-opacity-20 border border-blue-100 dark:border-blue-700 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
          节律知识
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
          生物节律理论包含23天体力周期、28天情绪周期和33天智力周期。正值表示能量充沛，负值表示能量偏低。每日节律状态可作为参考，帮助您合理安排活动。
        </p>
      </div>
    </div>
  );
};

export default BiorhythmTab;