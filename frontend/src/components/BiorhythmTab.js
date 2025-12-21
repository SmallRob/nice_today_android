import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BiorhythmChart from './BiorhythmChart';
import { getBiorhythmRange } from '../services/localDataService';
import elementConfig from '../config/elementConfig.json';
import { initDataMigration } from '../utils/dataMigration';
import { userConfigManager } from '../utils/userConfigManager';
import { useTheme } from '../context/ThemeContext';
import notificationService from '../utils/notificationService';

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

  // 简化的状态确定函数
  const getSimpleStatus = (score) => {
    if (score > 15) return { text: '极佳', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30' };
    if (score > 0) return { text: '良好', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900 dark:bg-opacity-30' };
    if (score < -15) return { text: '极低', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30' };
    if (score < 0) return { text: '偏低', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900 dark:bg-opacity-30' };
    return { text: '平稳', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30' };
  };

  // 获取趋向符号
  const getTrendSymbol = (currentValue, futureValue) => {
    const diff = futureValue - currentValue;
    if (diff > 2) return '↑↑';
    if (diff > 0.5) return '↑';
    if (diff < -2) return '↓↓';
    if (diff < -0.5) return '↓';
    return '→';
  };

  // 获取趋势颜色
  const getTrendColorClass = (symbol) => {
    if (symbol === '↑↑') return 'text-green-600 dark:text-green-400 font-bold';
    if (symbol === '↑') return 'text-green-500 dark:text-green-500';
    if (symbol === '↓↓') return 'text-red-600 dark:text-red-400 font-bold';
    if (symbol === '↓') return 'text-red-500 dark:text-red-500';
    return 'text-gray-400 dark:text-gray-500';
  };

  // 计算未来7天趋势
  const futureTrends = useMemo(() => {
    if (!rhythmData || !todayData) return [];

    const todayIndex = rhythmData.findIndex(item => item.date === todayData.date);
    if (todayIndex === -1) return [];

    const trends = [];
    for (let i = 1; i <= 7; i++) {
      const futureItem = rhythmData[todayIndex + i];
      if (!futureItem) break;

      trends.push({
        day: i === 1 ? '明天' : `${i}天后`,
        date: futureItem.date,
        physical: getTrendSymbol(todayData.physical, futureItem.physical),
        emotional: getTrendSymbol(todayData.emotional, futureItem.emotional),
        intellectual: getTrendSymbol(todayData.intellectual, futureItem.intellectual)
      });
    }
    return trends;
  }, [rhythmData, todayData]);

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

  // 检测节律极值并发送通知
  useEffect(() => {
    if (todayData) {
      // 检查节律极值
      notificationService.checkBiorhythmCritical(todayData);
    }
  }, [todayData]);

  // 更换实践活动
  const refreshActivities = () => {
    setPracticeActivities(getRandomActivities());
  };

  // 生成今日节律总结 - 简化版本
  const renderTodaySummary = () => {
    // 确保todayData存在且包含必要的数据
    if (!todayData || todayData.physical === undefined || todayData.emotional === undefined || todayData.intellectual === undefined) {
      return null;
    }

    // 获取今天的节律值
    const todayPhysical = todayData.physical;
    const todayEmotional = todayData.emotional;
    const todayIntellectual = todayData.intellectual;

    // 计算综合累积值
    const totalScore = todayPhysical + todayEmotional + todayIntellectual;

    // 使用简化的状态确定函数
    const totalStatus = getSimpleStatus(totalScore);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${totalScore > 15 ? 'bg-green-500' : totalScore > 0 ? 'bg-emerald-500' : totalScore < -15 ? 'bg-red-500' : totalScore < 0 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            <span className="text-base font-medium text-gray-900 dark:text-white">综合状态</span>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${totalScore > 15 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
            totalScore > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-400' :
              totalScore < -15 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' :
                totalScore < 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400'
            }`}>
            {totalScore > 15 ? '🌟 极佳' : totalScore > 0 ? '😊 良好' : totalScore < -15 ? '😫 极低' : totalScore < 0 ? '⚠️ 偏低' : '😐 平稳'}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          今日综合得分: <span className="font-medium">{totalScore}%</span> - {totalStatus.text}
        </p>
      </div>
    );
  };

  if (loading && !rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">正在计算生物节律...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black -webkit-overflow-scrolling-touch">
        {/* Banner区域 - 生物节律主题 */}
        <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 flex-shrink-0">
          {/* 节律渐变背景 */}
          <div className="absolute inset-0 wuxing-gradient z-0 bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-indigo-700/30"></div>

          {/* 道家装饰符号 */}
          <div className="absolute top-2 left-2 w-12 h-12 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50,5 A45,45 0 1,1 50,95 A45,45 0 1,1 50,5" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="30" r="8" fill="currentColor" />
              <circle cx="50" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-14 h-14 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3" />
            </svg>
          </div>

          <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-1 text-shadow-lg taoist-title">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                人体节律
              </span>
            </h1>
            <p className="text-white text-xs md:text-base opacity-95 font-medium taoist-subtitle mb-2">
              天人合一·顺应自然·调和身心
            </p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span className="text-[10px] md:text-xs bg-blue/40 text-white px-2 py-0.5 rounded-full border border-white/20">体力</span>
              <span className="text-[10px] md:text-xs bg-purple/40 text-white px-2 py-0.5 rounded-full border border-white/20">情绪</span>
              <span className="text-[10px] md:text-xs bg-indigo/40 text-white px-2 py-0.5 rounded-full border border-white/20">智力</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black flex-1">
          <div className="mb-4 mx-auto max-w-2xl space-y-4 h-full">
            {/* 合并的用户信息与今日状态卡片 */}
            {todayData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                {/* 顶部用户信息栏 */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-gray-700">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {userInfo.nickname ? `${userInfo.nickname} 的今日节律` : '今日生物节律'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {userInfo.birthDate ? `出生: ${userInfo.birthDate}` : '请到设置页面配置信息'}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full">
                    本地计算
                  </span>
                </div>

                {/* 今日节律状态 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-4 text-center border border-green-100 dark:border-green-800 border-opacity-50">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {todayData.physical}%
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-300 font-medium">体力</div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 text-center border border-blue-100 dark:border-blue-800 border-opacity-50">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {todayData.emotional}%
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">情绪</div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-4 text-center border border-purple-100 dark:border-purple-800 border-opacity-50">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {todayData.intellectual}%
                    </div>
                    <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">智力</div>
                  </div>
                </div>

                {/* 状态解读 */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap justify-center gap-y-2 gap-x-4 text-sm">
                    <span className={`px-2 py-0.5 rounded ${todayData.physical >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-30' : 'bg-red-50 text-red-700 dark:bg-red-900 dark:bg-opacity-30'}`}>
                      {todayData.physical >= 0 ? '✓ 体力充沛' : '⚠ 体力偏低'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${todayData.emotional >= 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:bg-opacity-30' : 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:bg-opacity-30'}`}>
                      {todayData.emotional >= 0 ? '😊 情绪稳定' : '🌪️ 情绪波动'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${todayData.intellectual >= 0 ? 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:bg-opacity-30' : 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:bg-opacity-30'}`}>
                      {todayData.intellectual >= 0 ? '💡 思维清晰' : '🧠 思考需谨慎'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 今日节律总结 */}
            {renderTodaySummary()}

            {/* 今日实践建议卡片 */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 dark:bg-opacity-20 border border-purple-100 dark:border-purple-700 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-purple-800 dark:text-purple-300">
                  实践建议
                </h3>
                <button
                  onClick={refreshActivities}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center"
                >
                  换一批
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-purple-700 dark:text-purple-400 mb-3">
                根据节律状态推荐活动：
              </p>

              <div className="space-y-2">
                {practiceActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 rounded-lg p-3 flex items-start"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {activity.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 生物节律曲线图 - 优化间距 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                趋势图表
              </h3>

              {rhythmData && rhythmData.length > 0 ? (
                <div className="h-64 mb-4">
                  <BiorhythmChart
                    data={rhythmData}
                    isMobile={!isDesktop}
                  />
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                  暂无图表数据
                </div>
              )}

              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">体力</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">情绪</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">智力</span>
                </div>
              </div>
            </div>

            {/* 未来7天节律趋势 - 新增 */}
            {futureTrends.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  未来7天趋势预测
                </h3>

                <div className="overflow-hidden rounded-lg border dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">日期</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">体力</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">情绪</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">智力</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {futureTrends.map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{trend.day}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{trend.date.substring(5)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.physical)}`}>{trend.physical}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.emotional)}`}>{trend.emotional}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.intellectual)}`}>{trend.intellectual}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>↑↑: 大幅上升</span>
                  <span>↑: 上升</span>
                  <span>→: 平稳</span>
                  <span>↓: 下降</span>
                  <span>↓↓: 大幅下降</span>
                </div>
              </div>
            )}

            {/* 节律说明 - 优化间距 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 dark:bg-opacity-20 border border-blue-100 dark:border-blue-700 rounded-lg p-4">
              <h4 className="text-base font-semibold text-blue-800 dark:text-blue-300 mb-3">
                节律知识
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                生物节律理论包含23天体力周期、28天情绪周期和33天智力周期。正值表示能量充沛，负值表示能量偏低。每日节律状态可作为参考，帮助您合理安排活动。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmTab;