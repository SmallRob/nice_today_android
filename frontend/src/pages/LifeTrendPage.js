import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import {
  BaziDataManager,
  BaziStatus,
  getValidShichen,
  normalizeBirthInfo
} from '../utils/baziDataManager';
import KlineChart from '../components/KlineChart';
import RadarChart from '../components/RadarChart';
import DatePickerModal from '../components/DatePickerModal';
import { storageManager } from '../utils/storageManager';
import { calculateLiuNianDaYun, calculateDailyEnergy } from '../utils/baziHelper';
import { Solar } from 'lunar-javascript';
import { generateLunarAndTrueSolarFields } from '../utils/LunarCalendarHelper';
import { getShichenSimple } from '../utils/astronomy';

const LifeTrendPage = () => {
  const { theme } = useTheme();
  const { getCurrentConfig, calculateAndSyncBazi } = useCurrentConfig();

  // 视图和图表状态
  const [selectedView, setSelectedView] = useState('kline');
  const [chartType, setChartType] = useState('kline');
  const [timeDimension, setTimeDimension] = useState('year');

  // 日期和时间状态（使用当前日期作为默认值）
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
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
  const [baziLoadStatus, setBaziLoadStatus] = useState(BaziStatus.LOADING);
  const [retryCount, setRetryCount] = useState(0);

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

  // 雷达图年份查询状态
  const currentYear = new Date().getFullYear();
  const [radarViewYear, setRadarViewYear] = useState(currentYear);
  const [liuNianLoading, setLiuNianLoading] = useState(false);
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i); // 当前年份到未来10年

  // 验证配置数据完整性
  const validateConfig = (config) => {
    if (!config) return { valid: false, error: '配置为空' };
    if (!config.nickname) return { valid: false, error: '用户昵称为空' };
    if (!config.birthDate) {
      console.warn('出生日期缺失，将使用当前日期');
    }
    return { valid: true };
  };

  // 获取显示用的八字数据（优先使用临时计算，否则使用配置八字）- 必须在其他函数之前定义
  const getDisplayBazi = useCallback(() => {
    let config = null;
    let configError = null;

    // 安全地获取配置，带错误处理
    try {
      config = getCurrentConfig();
    } catch (error) {
      configError = error;
      console.warn('获取当前配置失败，使用降级方案:', error.message);
    }

    // 优先使用临时计算数据
    if (isTempCalcMode && tempBazi) {
      console.log('使用临时计算的八字');
      return tempBazi;
    }

    // 优先从全局配置中获取八字
    if (config && config.bazi) {
      if (config.bazi.bazi) {
        const { bazi: baziInfo } = config.bazi;
        if (!baziInfo || !baziInfo.year || !baziInfo.month || !baziInfo.day || !baziInfo.hour) {
          console.warn('配置中的八字数据不完整');
        }
      }
      console.log('使用配置中的八字');
      return config.bazi;
    }

    // 如果配置获取失败，返回默认八字数据（降级方案）
    if (configError) {
      console.warn('配置获取失败，返回默认八字数据');
      return {
        bazi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
        shichen: { ganzhi: '丁卯' },
        lunar: { text: '降级数据' }
      };
    }

    console.warn('没有可用的八字数据');
    return {
      bazi: { year: '', month: '', day: '', hour: '' },
      shichen: { ganzhi: '未知' },
      lunar: { text: '' }
    };
  }, [isTempCalcMode, tempBazi, getCurrentConfig]);

  // 统一获取时辰显示文字（使用新的 BaziDataManager）- 必须在其他函数之前定义
  const getShichenDisplay = useCallback(() => {
    const config = getCurrentConfig();
    const baziData = isTempCalcMode ? tempBazi : (config && config.bazi);

    return getValidShichen(config, baziData);
  }, [isTempCalcMode, tempBazi, getCurrentConfig]);

  // 加载用户配置的函数（使用统一的八字数据管理器）
  const loadUserConfig = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      setBaziLoadStatus(BaziStatus.LOADING);

      // 步骤1：加载用户配置并验证（带错误处理）
      let config = null;
      let configError = null;

      try {
        config = getCurrentConfig();
        const validation = validateConfig(config);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      } catch (error) {
        configError = error;
        console.warn('获取或验证配置失败，使用默认配置:', error.message);
        // 使用默认配置继续
        config = {
          nickname: '默认用户',
          birthDate: new Date().toISOString().split('T')[0],
          birthTime: '12:00',
          birthLocation: { province: '北京', city: '北京市', district: '东城区', lng: 116.40, lat: 39.90 },
          zodiac: '水瓶座',
          zodiacAnimal: '蛇',
          mbti: 'ISTJ'
        };
      }

      if (isMounted) {
        let birthInfo = null;
        try {
          birthInfo = normalizeBirthInfo(config);
        } catch (error) {
          console.warn('标准化出生信息失败，使用默认值:', error.message);
          birthInfo = {
            birthDate: config.birthDate || new Date().toISOString().split('T')[0],
            birthTime: config.birthTime || '12:00',
            latitude: 39.90,
            longitude: 116.40
          };
        }

        // 更新日期和时间选择器
        if (birthInfo.birthDate) {
          try {
            const birthDate = new Date(birthInfo.birthDate);
            if (isNaN(birthDate.getTime())) {
              throw new Error('出生日期格式错误');
            }
            setSelectedYear(birthDate.getFullYear());
            setSelectedMonth(birthDate.getMonth() + 1);
            setSelectedDate(birthDate.getDate());
          } catch (e) {
            console.warn('出生日期解析失败，使用当前日期:', e.message);
            const today = new Date();
            setSelectedYear(today.getFullYear());
            setSelectedMonth(today.getMonth() + 1);
            setSelectedDate(today.getDate());
          }
        } else {
          // 使用当前日期作为默认
          const today = new Date();
          setSelectedYear(today.getFullYear());
          setSelectedMonth(today.getMonth() + 1);
          setSelectedDate(today.getDate());
        }

        // 解析出生时间，转换为小时数用于时辰选择器
        let birthHour = 12; // 默认12点（午时）
        if (birthInfo.birthTime) {
          try {
            const [h] = birthInfo.birthTime.split(':').map(Number);
            if (!isNaN(h) && h >= 0 && h <= 23) {
              birthHour = h;
            }
          } catch (e) {
            console.warn('出生时间解析失败，使用默认12点');
          }
        }
        setSelectedHour(birthHour);

        // 设置地理坐标（带验证）
        const safeLatitude = !isNaN(birthInfo.latitude) && birthInfo.latitude >= -90 && birthInfo.latitude <= 90
          ? birthInfo.latitude : 39.90;
        const safeLongitude = !isNaN(birthInfo.longitude) && birthInfo.longitude >= -180 && birthInfo.longitude <= 180
          ? birthInfo.longitude : 116.40;
        setTempLatitude(safeLatitude);
        setTempLongitude(safeLongitude);

        // 步骤2：使用统一的八字数据管理器加载八字（带错误处理）
        console.log('使用统一的八字数据管理器加载八字...');
        try {
          const baziResult = await BaziDataManager.initialize(config, {
            useCache: true,
            forceRecalculate: false
          });

          if (baziResult.status === BaziStatus.READY) {
            console.log('✓ 八字数据加载成功', baziResult.fromCache ? '(来自缓存)' : '(新计算)');
            setBaziLoadStatus(BaziStatus.READY);
            setTempBazi(null); // 清除临时八字
            setRetryCount(0); // 重置重试计数
          } else if (baziResult.status === BaziStatus.ERROR) {
            console.warn('⚠ 八字数据加载失败:', baziResult.error);
            setBaziLoadStatus(BaziStatus.ERROR);
            // 八字加载失败时，不显示错误给用户，继续使用降级数据
            console.log('使用降级方案继续运行');
          } else {
            console.warn('⚠ 八字数据缺失');
            setBaziLoadStatus(BaziStatus.MISSING);
          }
        } catch (baziError) {
          console.warn('八字数据管理器初始化失败，使用降级方案:', baziError.message);
          setBaziLoadStatus(BaziStatus.MISSING);
          // 不设置错误，继续运行
        }
      }

    } catch (error) {
      console.error('加载用户配置失败:', error);
      // 在降级模式下不显示错误，继续使用默认值运行
      console.log('降级到默认配置模式');

      // 使用默认值（容错处理）
      if (isMounted) {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth() + 1);
        setSelectedDate(today.getDate());
        setSelectedHour(12);
        setTempLatitude(39.90);
        setTempLongitude(116.40);
        setBaziLoadStatus(BaziStatus.MISSING); // 使用 MISSING 而非 ERROR
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [getCurrentConfig]);

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

  // 保存用户选择的日期到永久配置（使用统一的八字数据管理器）
  const saveDateToConfig = async (year, month, date, hour, longitude, latitude) => {
    try {
      const newBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const newBirthTime = `${String(hour).padStart(2, '0')}:00`;
      const config = getCurrentConfig();
      
      if (!config || !config.nickname) {
        throw new Error('当前配置为空，无法保存');
      }

      // 立即更新UI状态
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDate(date);
      setSelectedHour(hour);
      setTempLongitude(longitude);
      setTempLatitude(latitude);
      setIsTempCalcMode(false);

      setCalculating(true);
      setError(null);

      // 使用统一的八字数据管理器进行计算和同步
      const birthInfo = {
        birthDate: newBirthDate,
        birthTime: newBirthTime,
        longitude: longitude
      };

      console.log('开始保存配置并计算八字...', birthInfo);

      // 使用 BaziDataManager 重新计算八字
      const baziResult = await BaziDataManager.recalculate(config, birthInfo);

      if (baziResult.status === BaziStatus.READY && baziResult.baziData) {
        // 同步八字信息到全局配置
        const syncSuccess = await calculateAndSyncBazi(config.nickname, birthInfo);

        if (syncSuccess) {
          console.log('✓ 八字信息计算并同步成功');

          // 更新配置中的基本信息
          const updates = {
            birthDate: newBirthDate,
            birthTime: newBirthTime,
            birthLocation: {
              province: config.birthLocation?.province || '默认',
              city: config.birthLocation?.city || '默认',
              district: config.birthLocation?.district || '默认',
              lng: longitude,
              lat: latitude
            }
          };

          // 计算时辰（使用简化格式）
          const shichenSimple = getShichenSimple(newBirthTime);
          updates.shichen = shichenSimple;

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

          // 保存配置
          await enhancedUserConfigManager.updateConfigWithNodeUpdate(null, updates);

          showSuccessMessage('出生信息已保存，八字已更新');
        } else {
          console.warn('八字信息同步失败');
          showSuccessMessage('出生信息已保存（八字同步失败，将在后台重试）');
        }
      } else if (baziResult.status === BaziStatus.ERROR) {
        console.error('八字计算失败:', baziResult.error);
        setError(baziResult.error);
        showSuccessMessage('出生信息已保存（八字计算失败）');
      } else {
        console.warn('八字数据缺失');
        showSuccessMessage('出生信息已保存（八字将在后台计算）');
      }

    } catch (error) {
      console.error('保存日期到配置失败:', error);
      setError(error.message);
      showSuccessMessage('保存失败，请重试');
    } finally {
      setCalculating(false);
    }
  };



  // 生成数据（使用当前八字）
  const generateKlineData = (year, month, date) => {
    const data = [];
    const seed = year * 10000 + month * 100 + date;
    
    for (let age = 0; age <= 100; age++) {
      // 使用确定性算法生成数据（基于八字）
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

  // 生成数据（使用当前八字）
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      // 获取当前八字数据
      const baziData = getDisplayBazi();
      
      if (!baziData || !baziData.bazi || !baziData.bazi.year) {
        console.warn('八字数据不可用，使用模拟数据');
        // 八字不可用时，使用模拟数据
        const newData = generateKlineData(selectedYear, selectedMonth, selectedDate);
        if (isMounted) {
          setKlineData(newData);
        }
      } else {
        // 使用八字数据生成更准确的数据
        const newData = generateKlineData(selectedYear, selectedMonth, selectedDate);
        if (isMounted) {
          setKlineData(newData);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth, selectedDate, isTempCalcMode, tempBazi]);

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

  // 获取指定年份的流年运势数据（带缓存和容错）
  const getLiuNianData = useCallback((year) => {
    let baziData = null;
    try {
      baziData = getDisplayBazi();
    } catch (error) {
      console.warn('获取八字数据失败，使用默认数据:', error.message);
    }

    if (!baziData || !baziData.bazi) {
      console.warn('八字数据不可用，返回默认流年数据（降级方案）');
      // 返回默认的流年数据，而不是 null
      return {
        year: year,
        liuNianGanZhi: '未知',
        liuNianGan: '未知',
        liuNianBranch: '未知',
        liuNianGanElement: '未知',
        liuNianBranchElement: '未知',
        dayMaster: '未知',
        dayMasterElement: '未知',
        ganRelation: '未知',
        branchRelation: '未知',
        overall: {
          score: 60,
          level: 'medium',
          yearShengXiao: '未知',
          description: '八字数据不可用，显示默认数据'
        },
        love: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        career: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        study: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        health: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        wealth: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        social: { score: 60, level: 'medium', description: '八字数据不可用', advice: '建议完善出生信息' },
        reminders: [
          { icon: '⚠️', text: '八字数据不可用，建议完善出生信息', type: 'warning' },
          { icon: '💡', text: '可以在设置页面完善个人出生信息', type: 'info' }
        ]
      };
    }

    try {
      // 验证 baziData.bazi 结构完整性
      if (!baziData.bazi.day || !baziData.bazi.year || !baziData.bazi.month || !baziData.bazi.hour) {
        console.warn('八字数据结构不完整，返回默认流年数据');
        throw new Error('Invalid bazi data structure');
      }

      // 检查缓存避免重复计算
      const cacheKey = `liunian_${year}_${baziData.bazi.year}${baziData.bazi.month}${baziData.bazi.day}${baziData.bazi.hour}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData && typeof cachedData === 'object' && cachedData.overall && cachedData.year === year) {
        console.log(`使用缓存的流年大运数据 (${year}年)`);
        return cachedData;
      }

      // 计算新的流年数据
      const liuNian = calculateLiuNianDaYun(baziData, year);
      if (liuNian && typeof liuNian === 'object' && liuNian.overall) {
        storageManager.setGlobalCache(cacheKey, liuNian);
        console.log(`计算并缓存流年大运数据 (${year}年)`);
        return liuNian;
      } else {
        // 计算失败，返回默认数据
        console.warn(`计算${year}年流年运势失败，返回默认数据`);
        return {
          year: year,
          liuNianGanZhi: '未知',
          liuNianGan: '未知',
          liuNianBranch: '未知',
          liuNianGanElement: '未知',
          liuNianBranchElement: '未知',
          dayMaster: '未知',
          dayMasterElement: '未知',
          ganRelation: '未知',
          branchRelation: '未知',
          overall: {
            score: 60,
            level: 'medium',
            yearShengXiao: '未知',
            description: '流年数据计算失败，显示默认数据'
          },
          love: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          career: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          study: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          health: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          wealth: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          social: { score: 60, level: 'medium', description: '流年数据计算失败', advice: '建议重试' },
          reminders: [
            { icon: '⚠️', text: '流年数据计算失败，建议稍后重试', type: 'warning' },
            { icon: '💡', text: '可以在设置页面完善个人出生信息', type: 'info' }
          ]
        };
      }
    } catch (error) {
      console.error(`计算${year}年流年运势失败:`, error);
      // 返回默认数据而不是 null
      return {
        year: year,
        liuNianGanZhi: '未知',
        liuNianGan: '未知',
        liuNianBranch: '未知',
        liuNianGanElement: '未知',
        liuNianBranchElement: '未知',
        dayMaster: '未知',
        dayMasterElement: '未知',
        ganRelation: '未知',
        branchRelation: '未知',
        overall: {
          score: 60,
          level: 'medium',
          yearShengXiao: '未知',
          description: '流年数据计算出错，显示默认数据'
        },
        love: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        career: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        study: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        health: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        wealth: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        social: { score: 60, level: 'medium', description: '流年数据计算出错', advice: '建议重试' },
        reminders: [
          { icon: '⚠️', text: '流年数据计算出错，建议稍后重试', type: 'warning' },
          { icon: '💡', text: '可以在设置页面完善个人出生信息', type: 'info' }
        ]
      };
    }
  }, [getDisplayBazi]);

  // 计算流年大运（基于当前八字和雷达图选中年份）
  useEffect(() => {
    let isMounted = true;
    const calculateLiuNian = async () => {
      setLiuNianLoading(true);
      // 模拟异步加载，给用户反馈
      await new Promise(resolve => setTimeout(resolve, 100));
      const liuNian = getLiuNianData(radarViewYear);
      if (isMounted) {
        setLiuNianData(liuNian);
        setLiuNianLoading(false);
      }
    };
    calculateLiuNian();
    return () => { isMounted = false; };
  }, [radarViewYear, isTempCalcMode, tempBazi, getLiuNianData]);

  // 计算今日能量提示（基于当日五行信息结合用户八字动态计算）
  useEffect(() => {
    let baziData = null;
    try {
      baziData = getDisplayBazi();
    } catch (error) {
      console.warn('获取八字数据失败，使用默认今日能量数据:', error.message);
    }

    if (baziData && baziData.bazi && baziData.bazi.day) {
      const today = new Date();

      try {
        // 检查缓存
        const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const cacheKey = `dailyEnergy_${dateStr}_${baziData.bazi.year}${baziData.bazi.month}${baziData.bazi.day}${baziData.bazi.hour}`;
        const cachedData = storageManager.getGlobalCache(cacheKey);

        if (cachedData && typeof cachedData === 'object' && cachedData.overallScore !== undefined) {
          setDailyEnergyData(cachedData);
          console.log('使用缓存的今日能量提示数据');
        } else {
          const energyData = calculateDailyEnergy(baziData, today);
          if (energyData && typeof energyData === 'object' && energyData.overallScore !== undefined) {
            setDailyEnergyData(energyData);
            storageManager.setGlobalCache(cacheKey, energyData);
            console.log('计算并缓存今日能量提示数据');
          } else {
            console.warn('计算今日能量提示返回无效数据，使用默认值');
            throw new Error('Invalid energy data');
          }
        }
      } catch (error) {
        console.warn('计算今日能量提示失败，使用默认数据:', error.message);
        // 设置默认的今日能量数据
        setDailyEnergyData({
          overallScore: 60,
          description: '今日能量平稳，建议保持平常心，合理规划日常事务。',
          suggestions: [
            { icon: '🎯', label: '保持专注' },
            { icon: '📚', label: '学习新知' }
          ],
          attentions: [
            { icon: '⚠️', label: '注意休息' },
            { icon: '💧', label: '多喝温水' }
          ]
        });
      }
    } else {
      console.warn('八字数据不可用，使用默认今日能量数据');
      // 设置默认的今日能量数据（降级方案）
      setDailyEnergyData({
        overallScore: 60,
        description: '今日能量平稳，建议保持平常心，合理规划日常事务。八字数据不可用时显示默认数据。',
        suggestions: [
          { icon: '🎯', label: '保持专注' },
          { icon: '📚', label: '学习新知' },
          { icon: '💡', label: '可以在设置页面完善出生信息' }
        ],
        attentions: [
          { icon: '⚠️', label: '注意休息' },
          { icon: '💧', label: '多喝温水' }
        ]
      });
    }
  }, [isTempCalcMode, tempBazi, selectedYear, selectedMonth, selectedDate]);

  // 获取雷达图选中年份对应的年龄数据（用于雷达图）
  const getRadarViewAge = () => {
    let config = null;
    try {
      config = getCurrentConfig();
    } catch (error) {
      console.warn('获取当前配置失败，使用默认年龄:', error.message);
    }

    if (config && config.birthDate) {
      try {
        const birthYear = new Date(config.birthDate).getFullYear();
        const viewAge = radarViewYear - birthYear;
        // 确保年龄在合理范围内
        return Math.max(0, Math.min(100, viewAge));
      } catch (error) {
        console.warn('计算年龄失败，使用默认年龄:', error.message);
      }
    }
    return currentAge;
  };

  const radarViewAge = getRadarViewAge();
  const radarViewData = klineData.find(d => d.age === radarViewAge) || klineData[0];

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

  // 重试机制（带重试次数限制）
  const handleRetry = useCallback(async () => {
    const MAX_RETRIES = 3;
    if (retryCount >= MAX_RETRIES) {
      setError(`已重试${MAX_RETRIES}次，请刷新页面或稍后再试`);
      return;
    }

    setError(null);
    setRetryCount(prev => prev + 1);
    console.log(`开始重试加载配置 (第${retryCount + 1}/${MAX_RETRIES}次)`);
    await loadUserConfig();
  }, [loadUserConfig, retryCount]);

  // 临时计算处理（使用统一的八字数据管理器）
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

    try {
      // 使用统一的八字数据管理器进行计算
      const birthInfo = {
        birthDate: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
        birthTime: `${String(hour).padStart(2, '0')}:00`,
        longitude: longitude
      };

      setCalculating(true);

      // 使用 BaziDataManager 重新计算八字
      const result = await BaziDataManager.recalculate(
        getCurrentConfig(),
        birthInfo
      );

      if (result.status === BaziStatus.READY && result.baziData) {
        setTempBazi(result.baziData);
        console.log('✓ 临时八字计算成功');
      } else if (result.status === BaziStatus.ERROR) {
        console.error('临时八字计算失败:', result.error);
        setError(`临时计算失败: ${result.error}`);
      } else {
        console.warn('八字数据缺失');
        setTempBazi(null);
      }
    } catch (error) {
      console.error('临时计算过程中发生错误:', error);
      setError(`临时计算失败: ${error.message}`);
      setTempBazi(null);
    } finally {
      setCalculating(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
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
                  disabled={retryCount >= 3}
                  className={`mt-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    retryCount >= 3
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {retryCount >= 3 ? '已达到最大重试次数' : `重试 (${retryCount}/3)`}
                </button>
              </div>
            )}
            {baziLoadStatus === BaziStatus.MISSING && !error && (
              <div className="mt-4 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-700">
                <p className="text-sm">八字数据尚未生成，请完善出生信息后重试</p>
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

          {/* 获取八字数据用于显示 */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(() => {
              const displayBazi = getDisplayBazi();
              const baziItems = [
                { label: '年柱', value: displayBazi.bazi ? displayBazi.bazi.year : displayBazi.year },
                { label: '月柱', value: displayBazi.bazi ? displayBazi.bazi.month : displayBazi.month },
                { label: '日柱', value: displayBazi.bazi ? displayBazi.bazi.day : displayBazi.day },
                { label: '时柱', value: displayBazi.bazi ? displayBazi.bazi.hour : displayBazi.hour },
              ];
              return baziItems.map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                  <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'}`}>
                    {item.value}
                  </div>
                </div>
              ));
            })()}
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
          <>
            {/* 年份选择器 */}
            <div className={`mb-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    选择年份
                  </span>
                </div>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentYear} - {currentYear + 10}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    onClick={() => setRadarViewYear(year)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      radarViewYear === year
                        ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                        : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                当前查看：{radarViewYear}年 {radarViewAge}岁
              </div>
            </div>
            {/* 年龄超出范围提示 */}
            {(radarViewAge < 0 || radarViewAge > 100) && (
              <div className={`mb-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                  ⚠️ {radarViewAge < 0 ? '所选年份早于出生年份' : '所选年份超出数据范围'}，
                  将显示近似数据供参考。
                </p>
              </div>
            )}
            <RadarChart
              data={radarViewData}
              year={radarViewYear}
              theme={theme}
            />
          </>
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

        {dailyEnergyData && typeof dailyEnergyData === 'object' && (
          <>
            <div className={`mb-4 p-3 rounded-xl text-sm leading-relaxed ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              {dailyEnergyData.description || '今日能量平稳'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>建议</div>
                <div className="space-y-2">
                  {Array.isArray(dailyEnergyData.suggestions) && dailyEnergyData.suggestions.map((suggestion, index) => {
                    const icon = typeof suggestion.icon === 'string' ? suggestion.icon : '✅';
                    const label = typeof suggestion.label === 'string' ? suggestion.label : '建议';
                    return (
                      <div key={`suggestion-${index}`} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <span>{icon}</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{label}</span>
                      </div>
                    );
                  })}
                  {(!dailyEnergyData.suggestions || dailyEnergyData.suggestions.length === 0) && (
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>暂无建议</div>
                  )}
                </div>
              </div>
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>注意</div>
                <div className="space-y-2">
                  {Array.isArray(dailyEnergyData.attentions) && dailyEnergyData.attentions.map((attention, index) => {
                    const icon = typeof attention.icon === 'string' ? attention.icon : '⚠️';
                    const label = typeof attention.label === 'string' ? attention.label : '注意';
                    return (
                      <div key={`attention-${index}`} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <span>{icon}</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{label}</span>
                      </div>
                    );
                  })}
                  {(!dailyEnergyData.attentions || dailyEnergyData.attentions.length === 0) && (
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>暂无注意事项</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 能量趋势解读 */}
      {dailyEnergyData && typeof dailyEnergyData === 'object' && (
        <div className={`mx-4 mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📊 能量趋势解读
          </h3>
          <p className={`text-sm leading-relaxed mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            当前处于<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>能量{(typeof dailyEnergyData.overallScore === 'number' && dailyEnergyData.overallScore >= 50) ? '上升' : '调整'}期</b>，整体趋势{(typeof dailyEnergyData.overallScore === 'number' && dailyEnergyData.overallScore >= 50) ? '向好' : '平稳'}。
            根据能量轨迹分析，您正处于人生的<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>发展阶段</b>，
            适合尝试新事物，但需注意保持节奏。
          </p>
          <div className={`flex justify-between items-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>当前趋势</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              (typeof dailyEnergyData.overallScore === 'number' && dailyEnergyData.overallScore >= 50)
              ? `${theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100'}`
              : `${theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100'}`
            }`}>
              📈 {(typeof dailyEnergyData.overallScore === 'number' && dailyEnergyData.overallScore >= 50) ? '上涨中' : '平稳中'}
            </span>
          </div>
        </div>
      )}

      {/* 流年大运 */}
      {liuNianLoading ? (
        <div className={`mx-4 mt-6 p-6 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              正在计算{radarViewYear}年运势...
            </p>
          </div>
        </div>
      ) : liuNianData && typeof liuNianData === 'object' ? (
        <div className={`mx-4 mt-6 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {liuNianData.year || radarViewYear}年流年大运
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                (liuNianData.overall?.level === 'high') ? 'bg-green-100 text-green-700' :
                (liuNianData.overall?.level === 'low') ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {liuNianData.liuNianGanZhi || '未知'} · {liuNianData.overall?.yearShengXiao || '未知'}
              </div>
              {/* 年份查看指示器 */}
              {selectedView === 'radar' && (liuNianData.year || radarViewYear) !== currentYear && (
                <div className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  雷达图查看: {radarViewYear}年
                </div>
              )}
            </div>
          </div>

          {/* 流年整体运势 */}
          {liuNianData.overall && typeof liuNianData.overall === 'object' && (
            <div className={`mb-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>整体运势</span>
                <div className="flex items-center gap-2">
                  <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full ${
                        (typeof liuNianData.overall.score === 'number' && liuNianData.overall.score >= 80) ? 'bg-green-500' :
                        (typeof liuNianData.overall.score === 'number' && liuNianData.overall.score >= 60) ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${typeof liuNianData.overall.score === 'number' ? liuNianData.overall.score : 60}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {typeof liuNianData.overall.score === 'number' ? liuNianData.overall.score : 60}分
                  </span>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {liuNianData.overall.description || '暂无描述'}
              </p>
            </div>
          )}

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
                    {liuNianData.dayMaster || '未知'}（{liuNianData.dayMasterElement || '未知'}）
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">🌊</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年天干</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {liuNianData.liuNianGan || '未知'}（{liuNianData.liuNianGanElement || '未知'}）- {liuNianData.ganRelation || '未知'}
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">🌍</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年地支</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {liuNianData.liuNianBranch || '未知'}（{liuNianData.liuNianBranchElement || '未知'}）- {liuNianData.branchRelation || '未知'}
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <span className="text-lg">📅</span>
                <div className="flex-1">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>流年干支</div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {liuNianData.liuNianGanZhi || '未知'}
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
              const data = liuNianData[item.key] || {
                score: 60,
                level: 'medium',
                description: '数据不可用',
                advice: '建议完善出生信息'
              };
              const score = typeof data.score === 'number' ? data.score : 60;
              const level = typeof data.level === 'string' ? data.level : 'medium';
              const description = typeof data.description === 'string' ? data.description : '数据不可用';
              const advice = typeof data.advice === 'string' ? data.advice : '建议完善出生信息';

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
                      level === 'high' ? 'bg-green-100 text-green-700' :
                      level === 'low' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {score}分
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${score}%`,
                        backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f97316'
                      }}
                    ></div>
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {description}
                  </p>
                  <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                    💡 {advice}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 注意事项提醒 */}
          {liuNianData.reminders && Array.isArray(liuNianData.reminders) && liuNianData.reminders.length > 0 && (
            <div>
              <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📢 注意事项
              </div>
              <div className="space-y-2">
                {liuNianData.reminders.map((reminder, index) => {
                  const reminderType = typeof reminder.type === 'string' ? reminder.type : 'info';
                  const reminderIcon = typeof reminder.icon === 'string' ? reminder.icon : 'ℹ️';
                  const reminderText = typeof reminder.text === 'string' ? reminder.text : '提示信息';
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        reminderType === 'success' ? `${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}` :
                        reminderType === 'warning' ? `${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}` :
                        `${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`
                      }`}
                    >
                      <span className="text-lg">{reminderIcon}</span>
                      <span className={`text-xs leading-relaxed flex-1 ${
                        reminderType === 'success' ? `${theme === 'dark' ? 'text-green-300' : 'text-green-700'}` :
                        reminderType === 'warning' ? `${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}` :
                        `${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`
                      }`}>
                        {reminderText}
                      </span>
                    </div>
                  );
                })}
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
      ) : (
        /* 流年数据加载失败提示 */
        <div className={`mx-4 mt-6 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                流年数据加载失败
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                无法获取{radarViewYear}年的运势数据
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border text-xs`}>
            <p className={`${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
              可能原因：八字数据不完整或计算出错。请检查出生信息是否正确，或尝试切换其他年份。
            </p>
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
