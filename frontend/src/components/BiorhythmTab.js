import React, { useState, useEffect, useCallback } from 'react';
import BiorhythmChart from './BiorhythmChart';
import { getBiorhythmRange } from '../services/localDataService';
import elementConfig from '../config/elementConfig.json';
import { CompatibleStorage, initDataMigration } from '../utils/dataMigration';
import { userConfigManager } from '../utils/userConfigManager';

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
  }, [loadBiorhythmData, birthDate, DEFAULT_BIRTH_DATE, configManagerReady]);

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
    <div className="space-y-4">
      {/* 用户信息显示区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              {userInfo.nickname ? `${userInfo.nickname} 的生物节律` : '生物节律'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {userInfo.birthDate ? `基于出生日期 ${userInfo.birthDate} 计算` : '请到设置页面配置个人信息'}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            <p>数据来源</p>
            <p className="font-medium text-green-600 dark:text-green-400">本地计算</p>
          </div>
        </div>
      </div>

      {/* 今日生物节律状态 */}
      {todayData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            今日生物节律状态
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {todayData.physical}%
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300">体力</div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {todayData.emotional}%
              </div>
              <div className="text-xs text-red-800 dark:text-red-300">情绪</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {todayData.intellectual}%
              </div>
              <div className="text-xs text-green-800 dark:text-green-300">智力</div>
            </div>
          </div>
          
          {/* 今日建议 */}
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
            <strong>今日建议：</strong>
            {todayData.physical >= 80 ? ' 体力充沛，适合运动锻炼。' : 
             todayData.physical >= 60 ? ' 体力良好，保持适度活动。' : ' 体力偏低，注意休息。'}
            {todayData.emotional >= 80 ? ' 情绪积极，适合社交。' : 
             todayData.emotional >= 60 ? ' 情绪稳定，保持良好心态。' : ' 情绪波动，注意调节。'}
            {todayData.intellectual >= 80 ? ' 思维敏捷，适合学习思考。' : 
             todayData.intellectual >= 60 ? ' 智力正常，适合日常工作。' : ' 思维迟缓，避免复杂决策。'}
          </div>
        </div>
      )}

      {/* 生物节律曲线图 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          生物节律趋势图
        </h3>
        
        {rhythmData && rhythmData.length > 0 ? (
          <BiorhythmChart 
            data={rhythmData}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无图表数据
          </div>
        )}
      </div>

      {/* 生物节律说明 */}
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
          生物节律说明
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          生物节律理论基于23天体力周期、28天情绪周期和33天智力周期。
          正值表示能量充沛，负值表示能量偏低。建议结合个人感受合理参考。
        </p>
      </div>
    </div>
  );
};

export default BiorhythmTab;