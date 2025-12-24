import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import KlineChart from '../components/KlineChart';
import RadarChart from '../components/RadarChart';
import DatePickerModal from '../components/DatePickerModal';
import { storageManager } from '../utils/storageManager';
import { calculateDetailedBazi, calculateLiuNianDaYun, calculateDailyEnergy } from '../utils/baziHelper';
import { calculateBaziWithWorker } from '../utils/workerManager';
import { Solar } from 'lunar-javascript';
import { generateLunarAndTrueSolarFields } from '../utils/LunarCalendarHelper';

const LifeTrendPage = () => {
  const { theme } = useTheme();
  const { getCurrentConfig, updateBaziInfo } = useCurrentConfig();

  // 视图和图表状态
  const [selectedView, setSelectedView] = useState('kline');
  const [chartType, setChartType] = useState('kline');
  const [timeDimension, setTimeDimension] = useState('year');

  // 日期和时间状态
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedDate, setSelectedDate] = useState(23);
  const [selectedHour, setSelectedHour] = useState(12);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 数据状态
  const [klineData, setKlineData] = useState([]);
  const [hoveredAge, setHoveredAge] = useState(null);
  const [currentAge, setCurrentAge] = useState(34);

  // 加载和错误状态
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 显示成功消息并自动消失
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 今日能量提示数据
  const [dailyEnergyData, setDailyEnergyData] = useState(null);

  // 临时计算相关状态
  const [isTempCalcMode, setIsTempCalcMode] = useState(false);
  const [tempBazi, setTempBazi] = useState(null);
  const [tempLatitude, setTempLatitude] = useState(30);
  const [tempLongitude, setTempLongitude] = useState(110);

  // 农历和八字数据
  const [lunarData, setLunarData] = useState(null);
  const [liuNianData, setLiuNianData] = useState(null);

  // 异步重新计算八字（不阻塞主流程）
  const recalcBaziAsync = async (birthDateStr, birthTimeStr, longitude, nickname) => {
    try {
      console.log('开始异步重新计算八字...');
      const bazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
      if (bazi && updateBaziInfo) {
        // 使用新的 Context API 更新八字信息
        await updateBaziInfo(nickname, {
          bazi: bazi,
          lunarBirthDate: bazi.lunar?.text,
          trueSolarTime: birthTimeStr,
          lastCalculated: new Date().toISOString()
        });
        console.log('异步重新计算八字成功');
      }
    } catch (error) {
      console.error('异步重新计算八字失败:', error);
    }
  };

  // 加载用户配置的函数（提取出来以便重试）
  const loadUserConfig = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);

      // 步骤1：加载用户配置
      const config = getCurrentConfig();
      if (!config || !config.birthDate) {
        throw new Error('用户配置不完整');
      }

      if (isMounted) {
        const birthDate = new Date(config.birthDate);
        setSelectedYear(birthDate.getFullYear());
        setSelectedMonth(birthDate.getMonth() + 1);
        setSelectedDate(birthDate.getDate());

        // 解析出生时间，转换为小时数用于时辰选择器
        let birthHour = 12; // 默认12点（午时）
        if (config.birthTime) {
          const [h] = config.birthTime.split(':').map(Number);
          birthHour = h;
        }
        setSelectedHour(birthHour);
        setTempLatitude(config.birthLocation?.lat || 30);
        setTempLongitude(config.birthLocation?.lng || 110);

        const birthDateStr = config.birthDate;
        const birthTimeStr = config.birthTime || '12:00';
        const longitude = config.birthLocation?.lng || 110;
        const nickname = config.nickname;

        // 步骤2：按优先级获取八字数据
        let baziLoaded = false;

        // 1) 优先从全局配置中获取八字（最高优先级）
        if (config.bazi) {
          try {
            // 验证八字数据完整性
            const baziData = config.bazi.bazi || config.bazi;
            if (baziData && baziData.year && baziData.month && baziData.day && baziData.hour) {
              console.log('✓ 从全局配置中获取八字成功');
              baziLoaded = true;
            } else {
              console.warn('⚠ 全局配置中的八字数据不完整');
            }
          } catch (error) {
            console.warn('⚠ 解析全局配置中的八字数据失败:', error);
          }
        }

        // 2) 如果配置和缓存都没有，同步计算一次（不阻塞后续流程）
        if (!baziLoaded && nickname) {
          console.log('⚠ 配置中没有八字，开始计算...');
          try {
            const bazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
            if (bazi && bazi.bazi) {
              const baziData = bazi.bazi;
              if (baziData.year && baziData.month && baziData.day && baziData.hour) {
                await updateBaziInfo(nickname, {
                  bazi: bazi,
                  lunarBirthDate: bazi.lunar?.text,
                  trueSolarTime: birthTimeStr,
                  lastCalculated: new Date().toISOString()
                });
                baziLoaded = true;
                console.log('✓ 计算并保存八字数据成功');
              }
            }
          } catch (error) {
            console.error('✗ 计算八字数据失败:', error);
            // 计算失败不阻断加载流程，使用空八字对象
          }
        }

        // 4) 如果八字数据仍不完整，触发异步重试（不阻塞主流程）
        if (!baziLoaded && nickname) {
          console.warn('⚠ 八字数据不完整，将触发异步重试');
          // 使用 setTimeout 延迟重试，不阻塞主流程
          setTimeout(() => {
            recalcBaziAsync(birthDateStr, birthTimeStr, longitude, nickname);
          }, 1000);
        }
      }

    } catch (error) {
      console.error('加载用户配置失败:', error);
      setError(error.message);

      // 使用默认值
      if (isMounted) {
        setSelectedYear(1991);
        setSelectedMonth(1);
        setSelectedDate(1);
        setSelectedHour(12);
        setTempLatitude(30);
        setTempLongitude(110);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  // 初始化加载用户配置
  useEffect(() => {
    loadUserConfig();
  }, [loadUserConfig]);

  // 计算当前年龄
  useEffect(() => {
    const config = getCurrentConfig();
    if (config && config.birthDate) {
      const birthDate = new Date(config.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setCurrentAge(Math.max(0, Math.min(100, age)));
    }
  }, [selectedYear, selectedMonth, selectedDate]);

  // 保存用户选择的日期到永久配置（异步计算，立即关闭弹窗）
  const saveDateToConfig = async (year, month, date, hour, longitude, latitude) => {
    try {
      const newBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const newBirthTime = `${String(hour).padStart(2, '0')}:00`;
      const configIndex = enhancedUserConfigManager.getActiveConfigIndex();

      // 立即更新UI状态
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDate(date);
      setSelectedHour(hour);
      setTempLongitude(longitude);
      setTempLatitude(latitude);
      setIsTempCalcMode(false);


      // 检查配置中是否已有该日期的八字数据
      const currentConfig = getCurrentConfig();
      const needsRecalc = !currentConfig.bazi ||
                        currentConfig.birthDate !== newBirthDate ||
                        currentConfig.birthTime !== newBirthTime ||
                        currentConfig.birthLocation?.lng !== longitude ||
                        currentConfig.birthLocation?.lat !== latitude;


      let bazi;
      let baziCalculationFailed = false;

      if (needsRecalc) {
        // 只有当八字数据不存在或日期变化时才重新计算
        setCalculating(true);
        setError(null);

        try {
          // 使用 Worker 异步计算八字
          bazi = await calculateBaziWithWorker(newBirthDate, newBirthTime, longitude);
        } catch (workerError) {
          console.warn('Worker计算失败，使用同步计算:', workerError);
          // Worker 失败时降级到同步计算
          try {
            bazi = calculateDetailedBazi(newBirthDate, newBirthTime, longitude);
          } catch (syncError) {
            console.error('同步计算八字也失败:', syncError);
            baziCalculationFailed = true;
            bazi = null;
          }
        }

        if (!bazi) {
          console.error('八字计算失败，但继续保存基本信息');
          baziCalculationFailed = true;
          // 不抛出异常，继续保存基本配置
        } else {
          // 验证八字数据完整性
          const baziData = bazi.bazi || bazi;
          if (!baziData || !baziData.year || !baziData.month || !baziData.day || !baziData.hour) {
            console.warn('计算的八字数据不完整');
            baziCalculationFailed = true;
          }
        }

        // 将新计算的八字信息同步保存到配置中
        const nickname = currentConfig.nickname;
        if (nickname && bazi && !baziCalculationFailed) {
          try {
            await updateBaziInfo(nickname, {
              bazi: bazi.bazi,
              shichen: bazi.shichen,
              lunarBirthDate: bazi.lunarBirthDate,
              trueSolarTime: bazi.trueSolarTime,
              lunarInfo: bazi.lunarInfo,
              lastCalculated: new Date().toISOString()
            });

            console.log('八字信息已同步保存到全局配置');
            showSuccessMessage('八字信息已更新保存');
          } catch (syncError) {
            console.error('八字信息同步保存失败:', syncError);
            baziCalculationFailed = true;
          }
        }
      } else {
        // 使用已有八字数据，避免重复计算
        bazi = currentConfig.bazi;
        // 验证已有八字数据完整性
        if (bazi) {
          const baziData = bazi.bazi || bazi;
          if (!baziData || !baziData.year || !baziData.month || !baziData.day || !baziData.hour) {
            console.warn('配置中的八字数据不完整');
            baziCalculationFailed = true;
            bazi = null;
          }
        }
        console.log('使用配置中已有的八字数据，避免重复计算');
      }

      // 如果八字计算或保存失败，触发异步重试
      if (baziCalculationFailed && currentConfig.nickname) {
        console.warn('⚠ 八字数据计算/保存失败，将触发异步重试');
        setTimeout(() => {
          recalcBaziAsync(newBirthDate, newBirthTime, longitude, currentConfig.nickname);
        }, 500);
      }

      // 计算时辰（使用简化格式保存）
      const { getShichenSimple } = await import('../utils/astronomy');
      const shichenSimple = getShichenSimple(newBirthTime);

      // 保存配置
      const updates = {
        birthDate: newBirthDate,
        birthTime: newBirthTime,
        shichen: shichenSimple,  // 使用简化格式的时辰
        birthLocation: {
          province: currentConfig.birthLocation?.province || '默认',
          city: currentConfig.birthLocation?.city || '默认',
          district: currentConfig.birthLocation?.district || '默认',
          lng: longitude,
          lat: latitude
        }
      };

      // 只有八字计算成功时才保存八字数据
      if (bazi && !baziCalculationFailed) {
        updates.bazi = bazi;
      }

      // 计算并添加农历和真太阳时信息
      try {
        const lunarFields = generateLunarAndTrueSolarFields({
          ...updates,
          birthLocation: updates.birthLocation
        });
        Object.assign(updates, lunarFields);
        console.log('计算并保存农历信息:', lunarFields);
      } catch (error) {
        console.error('计算农历信息失败:', error);
        // 即使计算失败也继续保存基本配置
      }

      // 更新配置到存储
      await enhancedUserConfigManager.updateConfigWithNodeUpdate(null, updates);

      console.log('保存日期到配置成功:', updates);
      showSuccessMessage('出生信息已保存' + (baziCalculationFailed ? '（八字将在后台计算）' : '，八字已更新'));
    } catch (error) {
      console.error('保存日期到配置失败:', error);
      setError(error.message);
    } finally {
      setCalculating(false);
    }
  };


  // 模拟数据 - 基于生辰八字的运势数据
  const generateKlineData = (year, month, date) => {
    const data = [];
    const seed = year * 10000 + month * 100 + date;
    
    for (let age = 0; age <= 100; age++) {
      // 使用确定性算法生成数据（基于生辰八字）
      const baseValue = 50 + 
        Math.sin((age + seed) * 0.15) * 20 + 
        Math.cos((age + seed) * 0.08) * 15 +
        Math.sin((age + seed) * 0.03) * 10;
      
      // 添加轻微波动但保持趋势
      const value = Math.min(100, Math.max(0, baseValue));
      
      data.push({
        age,
        value: Math.round(value),
        // 细分领域数据
        career: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 100) * 0.1) * 20))),
        wealth: Math.round(Math.min(100, Math.max(0, value + Math.cos((age + seed + 200) * 0.1) * 20))),
        relationship: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 300) * 0.1) * 20))),
        health: Math.round(Math.min(100, Math.max(0, value + Math.cos((age + seed + 400) * 0.1) * 20))),
        social: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 500) * 0.1) * 20))),
      });
    }
    return data;
  };

  // 生成数据（临时计算模式使用临时八字，永久模式使用配置八字）
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      // 从缓存加载数据（基于日期和经纬度）
      const cacheKey = `lifeTrend_data_${selectedYear}_${selectedMonth}_${selectedDate}_${tempLongitude}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData) {
        if (isMounted) {
          setKlineData(cachedData);
        }
      } else {
        const newData = generateKlineData(selectedYear, selectedMonth, selectedDate);
        if (isMounted) {
          setKlineData(newData);
          // 缓存数据
          storageManager.setGlobalCache(cacheKey, newData);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth, selectedDate, tempLongitude]);

  // 计算农历日期
  useEffect(() => {
    const solar = Solar.fromYmd(selectedYear, selectedMonth, selectedDate);
    const lunar = solar.getLunar();
    setLunarData({
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay(),
      lunarYearStr: lunar.getYearInGanZhi() + '年',
      lunarMonthStr: lunar.getMonthInChinese() + '月',
      lunarDayStr: lunar.getDayInChinese(),
      lunarFullStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    });
  }, [selectedYear, selectedMonth, selectedDate]);

  // 计算流年大运（基于当前八字和当前年份）
  useEffect(() => {
    // 优先使用配置中的八字数据
    const config = getCurrentConfig();
    const usedBazi = isTempCalcMode ? tempBazi : (config && config.bazi);

    if (usedBazi && usedBazi.bazi) {
      const currentYear = new Date().getFullYear();

      // 检查缓存避免重复计算
      const cacheKey = `liunian_${currentYear}_${usedBazi.bazi.year}${usedBazi.bazi.month}${usedBazi.bazi.day}${usedBazi.bazi.hour}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData) {
        setLiuNianData(cachedData);
        console.log('使用缓存的流年大运数据');
      } else {
        const liuNian = calculateLiuNianDaYun(usedBazi, currentYear);
        setLiuNianData(liuNian);
        storageManager.setGlobalCache(cacheKey, liuNian);
        console.log('计算并缓存流年大运数据');
      }
    }
  }, [isTempCalcMode, tempBazi, selectedYear, selectedMonth, selectedDate]);

  // 计算今日能量提示（基于当日五行信息结合用户八字动态计算）
  useEffect(() => {
    const config = getCurrentConfig();
    const usedBazi = isTempCalcMode ? tempBazi : (config && config.bazi);

    if (usedBazi && usedBazi.bazi) {
      const today = new Date();

      // 检查缓存
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const cacheKey = `dailyEnergy_${dateStr}_${usedBazi.bazi.year}${usedBazi.bazi.month}${usedBazi.bazi.day}${usedBazi.bazi.hour}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData) {
        setDailyEnergyData(cachedData);
        console.log('使用缓存的今日能量提示数据');
      } else {
        const energyData = calculateDailyEnergy(usedBazi, today);
        setDailyEnergyData(energyData);
        storageManager.setGlobalCache(cacheKey, energyData);
        console.log('计算并缓存今日能量提示数据');
      }
    }
  }, [isTempCalcMode, tempBazi, selectedYear, selectedMonth, selectedDate]);

  // 获取当前选中年份的数据（用于雷达图）
  const currentYearData = klineData.find(d => d.age === currentAge) || klineData[0];

  // 日期选择处理（永久保存 - 异步）
  const handleDateChange = async (year, month, date, hour, longitude, latitude, isSaveToConfig = true) => {
    setIsCalendarOpen(false);

    if (isSaveToConfig) {
      await saveDateToConfig(year, month, date, hour, longitude, latitude);
    } else {
      console.log('用户取消修改，保持当前数据');
    }
  };

  // 事件委托：处理日期卡片点击
  const handleDateCardClick = useCallback((e) => {
    const dateCard = e.currentTarget;
    if (dateCard) {
      setIsCalendarOpen(true);
    }
  }, []);

  // 重试机制
  const handleRetry = useCallback(async () => {
    setError(null);
    await loadUserConfig();
  }, [loadUserConfig]);

  // 临时计算处理（不保存到配置，异步计算）
  const handleTempCalculation = async (year, month, date, hour, longitude, latitude) => {
    setIsCalendarOpen(false);
    setError(null);

    // 立即更新UI状态
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDate(date);
    setSelectedHour(hour);
    setTempLongitude(longitude);
    setTempLatitude(latitude);
    setIsTempCalcMode(true);

      // 检查配置中是否已有该日期的八字数据
      const currentConfig = getCurrentConfig();
      const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const birthTimeStr = `${String(hour).padStart(2, '0')}:00`;

      // 只有当日期/时间/经纬度变化时才重新计算八字
      const needsRecalc = !currentConfig.bazi ||
                        currentConfig.birthDate !== birthDateStr ||
                        currentConfig.birthTime !== birthTimeStr ||
                        currentConfig.birthLocation?.lng !== longitude ||
                        currentConfig.birthLocation?.lat !== latitude;

    let bazi;
    if (needsRecalc) {
      setCalculating(true);

      try {
        // 使用 Worker 异步计算八字
        bazi = await calculateBaziWithWorker(birthDateStr, birthTimeStr, longitude);
      } catch (workerError) {
        console.warn('Worker计算失败，使用同步计算:', workerError);
        // Worker 失败时降级到同步计算
        bazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
      }

      if (!bazi) {
        throw new Error('临时八字计算失败');
      }

      if (bazi) {
        setTempBazi(bazi);
        console.log('临时计算八字成功:', bazi);

        // 如果用户确认使用临时计算结果，可以将其同步保存到八字对象中
        // 这里只是计算，不自动保存到永久配置
      }
    } else {
      // 使用已有八字数据，避免重复计算
      bazi = currentConfig.bazi;
      setTempBazi(bazi);
      console.log('使用配置中已有的八字数据进行临时计算，避免重复计算');
    }

    setCalculating(false);
  };

  // 获取当前八字（优先使用临时计算，否则使用配置八字）
  const getDisplayBazi = () => {
    // 优先使用临时计算数据
    if (isTempCalcMode && tempBazi) {
      return tempBazi;
    }

    // 优先从全局配置中获取八字
    const config = getCurrentConfig();
    if (config) {
      // 检查配置中的八字数据是否完整
      if (config.bazi) {
        const baziData = config.bazi.bazi || config.bazi;
        // 验证八字数据完整性
        if (baziData && baziData.year && baziData.month && baziData.day && baziData.hour) {
          return config.bazi;
        } else {
          console.warn('⚠ 配置中的八字数据不完整');
          // 触发异步重试（不阻塞主流程）
          if (config.nickname && config.birthDate) {
            const birthDateStr = config.birthDate;
            const birthTimeStr = config.birthTime || '12:00';
            const longitude = config.birthLocation?.lng || 110;
            setTimeout(() => {
              recalcBaziAsync(birthDateStr, birthTimeStr, longitude, config.nickname);
            }, 500);
          }
        }
      } else {
        console.warn('⚠ 配置中没有八字数据');
        // 触发异步重试（不阻塞主流程）
        if (config.nickname && config.birthDate) {
          const birthDateStr = config.birthDate;
          const birthTimeStr = config.birthTime || '12:00';
          const longitude = config.birthLocation?.lng || 110;
          setTimeout(() => {
            recalcBaziAsync(birthDateStr, birthTimeStr, longitude, config.nickname);
          }, 500);
        }
      }
    }

    // 如果没有有效的八字数据，返回默认空对象
    return {
      bazi: { year: '', month: '', day: '', hour: '' },
      shichen: { ganzhi: '未知' }
    };
  };

  const displayBazi = getDisplayBazi();

  // 统一获取时辰显示文字
  const getShichenDisplay = () => {
    // 首先从配置中获取时辰信息（优先级最高）
    const config = getCurrentConfig();
    if (config?.shichen && typeof config.shichen === 'string' && config.shichen.endsWith('时')) {
      return config.shichen;
    }

    // 1. 优先使用 displayBazi.shichen.ganzhi（如果已包含"时"则直接使用）
    if (displayBazi.shichen?.ganzhi) {
      const ganzhi = displayBazi.shichen.ganzhi;
      if (ganzhi.endsWith('时')) {
        return ganzhi;
      }
      // 如果不包含"时"，提取地支并添加"时"
      if (ganzhi.length >= 2) {
        return ganzhi.slice(-1) + '时';
      }
    }
    // 2. 尝试从 shichen.name 获取
    if (displayBazi.shichen?.name && displayBazi.shichen.name.endsWith('时')) {
      return displayBazi.shichen.name;
    }
    // 3. 从 bazi.hour 提取（时柱最后一字 + "时"）
    if (displayBazi.bazi?.hour && displayBazi.bazi.hour.length >= 2) {
      return displayBazi.bazi.hour.slice(-1) + '时';
    }
    // 4. 最后尝试从出生时间计算时辰
    if (config?.birthTime) {
      try {
        const { getShichen } = require('../utils/astronomy');
        return getShichen(config.birthTime);
      } catch (error) {
        console.error('计算时辰失败:', error);
      }
    }
    return '未知';
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>加载中...</p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>正在计算您的八字和人生能量轨迹</p>
            {error && (
              <div className="mt-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* 头部 */}
      <div className={`px-4 pt-6 pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">☯</span>
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              人生能量轨迹
            </h1>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            能量趋势分析 · 人生节奏感知
          </p>
        </div>

        {/* 成功消息提示 */}
        {successMessage && (
          <div className={`mb-3 px-4 py-2 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
            ✅ {successMessage}
          </div>
        )}

        {/* 错误消息提示 */}
        {error && !loading && (
          <div className={`mb-3 px-4 py-2 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
            ⚠️ {error}
          </div>
        )}

        {/* 日期卡片 */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 shadow-sm`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <div
                className={`text-center py-3 px-4 rounded-xl cursor-pointer transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={handleDateCardClick}
              >
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculating ? '⏳ 计算中...' : isTempCalcMode ? '🔮 临时计算' : '生辰八字'}
                </div>
                {/* 公历日期 */}
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedYear}年 {selectedMonth}月 {selectedDate}日
                </div>
                {/* 农历日期 */}
                {lunarData && (
                  <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    农历{lunarData.lunarMonthStr}{lunarData.lunarDayStr}
                  </div>
                )}
                {/* 时辰 */}
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  时辰：{getShichenDisplay()}
                </div>
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculating ? '正在后台计算八字...' : isTempCalcMode ? '点击返回永久配置' : '点击修改日期 / 临时计算'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: '年柱', value: displayBazi.bazi ? displayBazi.bazi.year : displayBazi.year },
              { label: '月柱', value: displayBazi.bazi ? displayBazi.bazi.month : displayBazi.month },
              { label: '日柱', value: displayBazi.bazi ? displayBazi.bazi.day : displayBazi.day },
              { label: '时柱', value: displayBazi.bazi ? displayBazi.bazi.hour : displayBazi.hour },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* 临时计算指示器 */}
          {isTempCalcMode && (
            <div className={`mt-3 text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border`}>
              <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                🔮 临时计算模式 - 不影响永久配置
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 视图切换 */}
      <div className={`flex gap-2 mx-4 mb-4 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            selectedView === 'kline'
              ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          onClick={() => setSelectedView('kline')}
        >
          <span>📈</span>
          <span className="text-sm font-medium">生命K线</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            selectedView === 'radar'
              ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          onClick={() => setSelectedView('radar')}
        >
          <span>🎯</span>
          <span className="text-sm font-medium">人生雷达</span>
        </button>
      </div>

      {/* 当 K线视图时，显示图表类型和时间维度切换 */}
      {selectedView === 'kline' && (
        <div className={`flex flex-col gap-2 mx-4 mb-4`}>
          {/* 图表类型切换 */}
          <div className={`flex gap-2 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                chartType === 'kline'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setChartType('kline')}
            >
              <span>📊</span>
              <span className="font-medium">K线图</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                chartType === 'line'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setChartType('line')}
            >
              <span>📈</span>
              <span className="font-medium">曲线图</span>
            </button>
          </div>

          {/* 时间维度切换 */}
          <div className={`flex gap-2 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'year'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('year')}
            >
              <span>📅</span>
              <span className="font-medium">年</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'month'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('month')}
            >
              <span>📆</span>
              <span className="font-medium">月</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'day'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('day')}
            >
              <span>📋</span>
              <span className="font-medium">日</span>
            </button>
          </div>
        </div>
      )}

      {/* 主图表区域 */}
      <div className="px-4">
        {selectedView === 'kline' ? (
          <KlineChart
            data={klineData}
            hoveredAge={hoveredAge}
            onHoverAge={setHoveredAge}
            theme={theme}
            chartType={chartType}
            timeDimension={timeDimension}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
          />
        ) : (
          <RadarChart
            data={currentYearData}
            year={new Date().getFullYear()}
            theme={theme}
          />
        )}
      </div>

      {/* 能量提示卡片 */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💭</span>
            <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              今日能量提示
            </span>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date().getFullYear()}.{new Date().getMonth() + 1}.{new Date().getDate()}
          </span>
        </div>

        {dailyEnergyData && (
          <>
            <div className={`mb-4 p-3 rounded-xl text-sm leading-relaxed ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              {dailyEnergyData.description}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>建议</div>
                <div className="space-y-2">
                  {dailyEnergyData.suggestions && dailyEnergyData.suggestions.map((suggestion, index) => (
                    <div key={`suggestion-${index}`} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                      <span>{suggestion.icon}</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{suggestion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>注意</div>
                <div className="space-y-2">
                  {dailyEnergyData.attentions && dailyEnergyData.attentions.map((attention, index) => (
                    <div key={`attention-${index}`} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                      <span>{attention.icon}</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{attention.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 能量趋势解读 */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📊 能量趋势解读
        </h3>
        <p className={`text-sm leading-relaxed mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          当前处于<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>能量{dailyEnergyData?.overallScore >= 50 ? '上升' : '调整'}期</b>，整体趋势{dailyEnergyData?.overallScore >= 50 ? '向好' : '平稳'}。
          根据能量轨迹分析，您正处于人生的<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>发展阶段</b>，
          适合尝试新事物，但需注意保持节奏。
        </p>
        <div className={`flex justify-between items-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>当前趋势</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            dailyEnergyData?.overallScore >= 50
              ? `${theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100'}`
              : `${theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100'}`
          }`}>
            📈 {dailyEnergyData?.overallScore >= 50 ? '上涨中' : '平稳中'}
          </span>
        </div>
      </div>

      {/* 流年大运 */}
      {liuNianData && (
        <div className={`mx-4 mt-6 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {liuNianData.year}年流年大运
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              liuNianData.overall.level === 'high' ? 'bg-green-100 text-green-700' :
              liuNianData.overall.level === 'low' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {liuNianData.liuNianGanZhi} · {liuNianData.overall.yearShengXiao}
            </div>
          </div>

          {/* 流年整体运势 */}
          <div className={`mb-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>整体运势</span>
              <div className="flex items-center gap-2">
                <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${
                      liuNianData.overall.score >= 80 ? 'bg-green-500' :
                      liuNianData.overall.score >= 60 ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${liuNianData.overall.score}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {liuNianData.overall.score}分
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {liuNianData.overall.description}
            </p>
          </div>

          {/* 流年五行分析 */}
          <div className={`mb-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="text-xs font-medium mb-2" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              五行分析
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>日主</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {liuNianData.dayMaster}（{liuNianData.dayMasterElement}）
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">🌊</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年天干</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {liuNianData.liuNianGan}（{liuNianData.liuNianGanElement}）- {liuNianData.ganRelation}
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">🌍</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年地支</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {liuNianData.liuNianBranch}（{liuNianData.liuNianBranchElement}）- {liuNianData.branchRelation}
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">📅</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年干支</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {liuNianData.liuNianGanZhi}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 六维运势分析 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { key: 'love', icon: '💕', label: '爱情' },
              { key: 'career', icon: '💼', label: '事业' },
              { key: 'study', icon: '📚', label: '学习' },
              { key: 'health', icon: '🏥', label: '健康' },
              { key: 'wealth', icon: '💰', label: '财运' },
              { key: 'social', icon: '👥', label: '人际' },
            ].map((item) => {
              const data = liuNianData[item.key];
              return (
                <div key={item.key} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      data.level === 'high' ? 'bg-green-100 text-green-700' :
                      data.level === 'low' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {data.score}分
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${data.score}%`,
                        backgroundColor: data.score >= 80 ? '#10b981' : data.score >= 60 ? '#3b82f6' : '#f97316'
                      }}
                    ></div>
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.description}
                  </p>
                  <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                    💡 {data.advice}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 注意事项提醒 */}
          {liuNianData.reminders && liuNianData.reminders.length > 0 && (
            <div>
              <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📢 注意事项
              </div>
              <div className="space-y-2">
                {liuNianData.reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      reminder.type === 'success' ? `${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}` :
                      reminder.type === 'warning' ? `${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}` :
                      `${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`
                    }`}
                  >
                    <span className="text-lg">{reminder.icon}</span>
                    <span className={`text-xs leading-relaxed flex-1 ${
                      reminder.type === 'success' ? `${theme === 'dark' ? 'text-green-300' : 'text-green-700'}` :
                      reminder.type === 'warning' ? `${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}` :
                      `${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`
                    }`}>
                      {reminder.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className={`mx-0 mt-6 px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-amber-50/80'} border ${theme === 'dark' ? 'border-gray-600' : 'border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📜</span>
              <div className="flex-1">
                <div className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-amber-800'}`}>
                  命理使用说明
                </div>
                <div className={`text-xs leading-relaxed space-y-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-amber-900/80'}`}>
                  <p>本工具基于传统八字命理学说推演，流年大运乃人生运势之宏观指引。</p>
                  <p>命理学云："命由己造，相由心生"。八字虽能揭示先天禀赋与运势走向，然人生之成败终需靠个人之努力与抉择。</p>
                  <p>愿此分析助您趋吉避凶、把握良机，然切记：运势仅供参考，行动方为根本。谨此敬告，顺祝安康。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 日期选择器 */}
      <DatePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        latitude={tempLatitude}
        longitude={tempLongitude}
        onConfirm={handleDateChange}
        onTempCalc={handleTempCalculation}
        theme={theme}
      />
    </div>
  );
};

export default LifeTrendPage;
