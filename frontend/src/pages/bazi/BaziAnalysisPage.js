/**
 * 八字命格分析页面
 * 展示完整的八字命格分析结果，包括四柱、五行、纳音、大运等信息
 */
import React, { useState, useEffect, Component, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig, useCurrentConfig } from '../../contexts/UserConfigContext';
import { baziCacheManager } from '../../utils/BaziCacheManager';
import { getDisplayBaziInfo } from '../../utils/baziSchema';
import { calculateDetailedBazi } from '../../utils/baziHelper';
import { calculateLunarDate, calculateTrueSolarTime } from '../../utils/LunarCalendarHelper';
import { DEFAULT_REGION } from '../../data/ChinaLocationData';
import DatePickerModal from '../../components/DatePickerModal.js';
import { Solar } from 'lunar-javascript';

// 错误边界组件
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BaziAnalysisPage 错误边界捕获到错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
          <div className="text-red-600 dark:text-red-400 text-center">
            <div className="font-bold text-lg mb-2">页面加载出错</div>
            <p className="mb-4">八字分析页面遇到问题，请尝试刷新页面或检查出生信息设置</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 八字命格展示组件
const BaziFortuneDisplay = ({ birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime, savedBaziInfo, nickname }) => {
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 使用 useMemo 缓存计算结果，避免重复计算
  const memoizedBirthDate = React.useMemo(() => birthDate, [birthDate]);
  const memoizedBirthTime = React.useMemo(() => birthTime, [birthTime]);
  const memoizedBirthLocation = React.useMemo(() => birthLocation, [birthLocation]);
  const memoizedNickname = React.useMemo(() => nickname, [nickname]);

  // 从缓存加载八字信息 - 优化版本
  const loadBazi = React.useCallback(async () => {
    // 添加参数验证
    if (!memoizedBirthDate) {
      console.log('出生日期未设置，显示提示信息');
      setError('请先设置出生日期和时间');
      setBaziInfo(null);
      setLoading(false);
      return;
    }

    // 验证出生日期是否为有效字符串格式
    if (typeof memoizedBirthDate !== 'string' || !memoizedBirthDate.includes('-')) {
      console.warn('出生日期格式无效:', memoizedBirthDate);
      setError('出生日期格式不正确');
      setBaziInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // 重置错误状态
      let finalBaziData = null;

      // 1. 优先从配置中获取八字信息 (新版本数据)
      if (savedBaziInfo) {
        try {
          console.log('使用配置中保存的八字信息');

          // 首先验证是否有基本的八字信息
          if (!hasBasicBaziInfo(savedBaziInfo)) {
            console.log('配置数据缺少基本八字信息，跳过使用');
          } else {
            // 直接使用保存的八字信息，无需额外处理
            finalBaziData = savedBaziInfo;

            // 验证数据结构完整性
            if (validateBaziInfoStructure(finalBaziData)) {
              console.log('配置数据验证通过');
            } else {
              console.log('配置数据结构不完整，尝试标准化处理');
              finalBaziData = normalizeBaziData(finalBaziData);

              // 再次验证标准化后的数据
              if (!validateBaziInfoStructure(finalBaziData)) {
                console.log('标准化后数据仍不完整');
                finalBaziData = null;
              }
            }
          }
        } catch (configError) {
          console.error('配置数据处理失败:', configError);
          setError('配置数据处理失败，请检查配置信息');
        }
      }

      // 2. 如果配置数据无效，尝试从缓存获取八字信息
      if (!finalBaziData && memoizedNickname && typeof memoizedNickname === 'string' && memoizedNickname.trim() !== '') {
        try {
          const cachedBazi = baziCacheManager.getBaziByNickname(memoizedNickname, {
            format: 'legacy',
            validate: true,
            fallbackToLegacy: true
          });

          if (cachedBazi && (cachedBazi.bazi || cachedBazi.dualFormatBazi)) {
            console.log('使用缓存中的八字信息:', memoizedNickname);

            const displayBazi = getDisplayBaziInfo(cachedBazi.bazi || cachedBazi.dualFormatBazi);

            // 验证是否有基本八字信息
            if (!hasBasicBaziInfo(displayBazi)) {
              console.log('缓存数据缺少基本八字信息，跳过使用');
            } else {
              // 验证缓存数据是否与当前配置一致
              if (validateBaziDataConsistency(displayBazi, memoizedBirthDate, memoizedBirthTime, memoizedBirthLocation)) {
                finalBaziData = displayBazi;
                console.log('缓存数据验证通过');
              } else {
                console.log('缓存数据与当前配置不一致，需要重新计算');
              }
            }
          }
        } catch (cacheError) {
          console.error('缓存读取失败:', cacheError);
          // 不设置错误，继续使用其他数据源
          console.warn('使用备用数据源加载八字信息');
        }
      }

      // 3. 如果缓存和保存数据都无效，使用降级数据
      if (!finalBaziData) {
        console.log('八字信息未找到，使用降级数据');
        finalBaziData = getFallbackBaziData(memoizedBirthDate, memoizedBirthTime);
        // Don't set error for fallback case, just show the fallback data
        console.log('使用降级数据展示八字信息');
      }

      // 4. 异步计算农历和真太阳时信息（不阻塞UI）
      if (finalBaziData) {
        finalBaziData = normalizeBaziData(finalBaziData);

        // 延迟计算农历信息，避免阻塞首次渲染
        const enhanceBaziData = async () => {
          if (!finalBaziData.lunar || !finalBaziData.lunar.text || finalBaziData.lunar.text.includes('请设置') || finalBaziData.lunar.text.includes('未知')) {
            if (memoizedBirthDate && memoizedBirthTime) {
              try {
                const longitude = memoizedBirthLocation?.lng || DEFAULT_REGION.lng;
                const lunarInfo = calculateLunarDate(memoizedBirthDate, memoizedBirthTime, longitude);
                if (lunarInfo) {
                  finalBaziData = {
                    ...finalBaziData,
                    lunar: {
                      text: lunarInfo.fullText || lunarInfo.shortText || `${memoizedBirthDate} 农历信息`,
                      monthStr: lunarInfo.monthInChinese || '未知月份',
                      dayStr: lunarInfo.dayInChinese || '未知日期'
                    }
                  };
                }
              } catch (lunarError) {
                console.warn('加载时计算农历信息失败:', lunarError);
                // 使用默认农历信息
                finalBaziData = {
                  ...finalBaziData,
                  lunar: {
                    text: `${memoizedBirthDate} 农历信息`,
                    monthStr: '未知月份',
                    dayStr: '未知日期'
                  }
                };
              }
            }
          }

          // 延迟计算真太阳时信息
          if (!finalBaziData.trueSolarTime && memoizedBirthDate && memoizedBirthTime) {
            try {
              const longitude = memoizedBirthLocation?.lng || DEFAULT_REGION.lng;
              const trueSolarTime = calculateTrueSolarTime(memoizedBirthDate, memoizedBirthTime, longitude);
              finalBaziData = {
                ...finalBaziData,
                trueSolarTime: trueSolarTime
              };
            } catch (solarError) {
              console.warn('加载时计算真太阳时失败:', solarError);
              finalBaziData = {
                ...finalBaziData,
                trueSolarTime: memoizedBirthTime
              };
            }
          }

          // 更新状态
          setBaziInfo(finalBaziData);
        };

        // 使用 requestIdleCallback 或 setTimeout 异步执行增强逻辑
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => enhanceBaziData(), { timeout: 1000 });
        } else {
          setTimeout(() => enhanceBaziData(), 0);
        }
      }

    } catch (e) {
      console.error('八字加载失败:', e);
      setError('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [memoizedBirthDate, memoizedBirthTime, memoizedBirthLocation, memoizedNickname, savedBaziInfo]);

  // 辅助函数：检查是否有基本的八字信息
  const hasBasicBaziInfo = (baziData) => {
    if (!baziData) return false;

    // 检查是否有基本的八字字段（年月日时）
    const hasBazi = baziData.bazi &&
                   baziData.bazi.year &&
                   baziData.bazi.month &&
                   baziData.bazi.day &&
                   baziData.bazi.hour;

    // 或者检查顶层字段
    const hasTopLevel = baziData.year &&
                       baziData.month &&
                       baziData.day &&
                       baziData.hour;

    return hasBazi || hasTopLevel;
  };

  useEffect(() => {
    // 防止在组件卸载后设置状态
    let isCancelled = false;

    // 验证必要参数是否存在
    if (birthDate && typeof birthDate === 'string' && birthDate.includes('-')) {
      loadBazi().then(() => {
        if (isCancelled) return;
      });
    } else {
      // 如果缺少必要参数，设置降级数据
      setBaziInfo(getFallbackBaziData(birthDate, birthTime));
    }

    return () => {
      isCancelled = true;
    };
    // 减少依赖项，只依赖真正触发重新加载的字段
  }, [memoizedBirthDate, memoizedBirthTime, memoizedBirthLocation, savedBaziInfo, memoizedNickname]);










  // 使用局部变量处理八字信息，避免常量赋值错误
  let processedBaziInfo = baziInfo;

  // 验證八字信息是否包含基本數據
  if (!hasBasicBaziInfo(processedBaziInfo)) {
    console.warn('八字信息缺少基本数据，使用降级处理');
    // 使用降级数据确保页面可以正常显示
    const fallbackBaziInfo = getFallbackBaziData(birthDate, birthTime);
    processedBaziInfo = { ...fallbackBaziInfo, ...processedBaziInfo };
  }

  // 确保农历信息存在，如果不存在则使用LunarCalendarHelper计算
  if (!processedBaziInfo.lunar || !processedBaziInfo.lunar.text || processedBaziInfo.lunar.text.includes('请设置') || processedBaziInfo.lunar.text.includes('未知')) {
    if (birthDate && birthTime) {
      try {
        const longitude = birthLocation?.lng || DEFAULT_REGION.lng;
        const lunarInfo = calculateLunarDate(birthDate, birthTime, longitude);
        if (lunarInfo) {
          // 更新processedBaziInfo中的农历信息
          processedBaziInfo = {
            ...processedBaziInfo,
            lunar: {
                text: lunarInfo.fullText || lunarInfo.shortText || `${birthDate} 农历信息`,
                monthStr: lunarInfo.monthInChinese || '未知月份',
                dayStr: lunarInfo.dayInChinese || '未知日期'
            }
          };
        }
      } catch (error) {
        console.warn('计算农历信息失败，使用默认值:', error);
        // 使用默认农历信息
        processedBaziInfo = {
          ...processedBaziInfo,
          lunar: {
            text: `${birthDate} 农历信息`,
            monthStr: '未知月份',
            dayStr: '未知日期'
          }
        };
      }
    }
  }

  // 确保真太阳时信息存在
  if (!processedBaziInfo.trueSolarTime && birthDate && birthTime) {
    try {
      const longitude = birthLocation?.lng || DEFAULT_REGION.lng;
      const trueSolarTime = calculateTrueSolarTime(birthDate, birthTime, longitude);
      processedBaziInfo = {
        ...processedBaziInfo,
        trueSolarTime: trueSolarTime
      };
    } catch (error) {
      console.warn('计算真太阳时失败，使用原始时间:', error);
      processedBaziInfo = {
        ...processedBaziInfo,
        trueSolarTime: birthTime
      };
    }
  }

  // 验证 processedBaziInfo 数据结构完整性
  const hasValidBaziData = processedBaziInfo && (
    (processedBaziInfo.meta && processedBaziInfo.birth && processedBaziInfo.bazi &&
     processedBaziInfo.bazi.year && processedBaziInfo.bazi.month && processedBaziInfo.bazi.day && processedBaziInfo.bazi.hour) ||
    (processedBaziInfo.bazi && processedBaziInfo.bazi.year && processedBaziInfo.bazi.month && processedBaziInfo.bazi.day && processedBaziInfo.bazi.hour) ||
    (processedBaziInfo.year && processedBaziInfo.month && processedBaziInfo.day && processedBaziInfo.hour)
  );

  if (!hasValidBaziData) {
    console.warn('八字数据不完整，但使用默认值继续渲染:', {
      hasMeta: !!processedBaziInfo?.meta,
      hasBirth: !!processedBaziInfo?.birth,
      hasBazi: !!processedBaziInfo?.bazi,
      hasYear: !!processedBaziInfo?.bazi?.year || !!processedBaziInfo?.year,
      hasMonth: !!processedBaziInfo?.bazi?.month || !!processedBaziInfo?.month,
      hasDay: !!processedBaziInfo?.bazi?.day || !!processedBaziInfo?.day,
      hasHour: !!processedBaziInfo?.bazi?.hour || !!processedBaziInfo?.hour
    });

    const defaultBaziInfo = {
      bazi: {
        year: processedBaziInfo?.bazi?.year || processedBaziInfo?.year || '甲子',
        month: processedBaziInfo?.bazi?.month || processedBaziInfo?.month || '乙丑',
        day: processedBaziInfo?.bazi?.day || processedBaziInfo?.day || '丙寅',
        hour: processedBaziInfo?.bazi?.hour || processedBaziInfo?.hour || '丁卯'
      },
      wuxing: {
        text: processedBaziInfo?.wuxing?.text || processedBaziInfo?.wuXing?.text || '木火 火火 土水',
        year: processedBaziInfo?.wuxing?.year || processedBaziInfo?.wuXing?.year || '木',
        month: processedBaziInfo?.wuxing?.month || processedBaziInfo?.wuXing?.month || '火',
        day: processedBaziInfo?.wuxing?.day || processedBaziInfo?.wuXing?.day || '火',
        hour: processedBaziInfo?.wuxing?.hour || processedBaziInfo?.wuXing?.hour || '土'
      },
      lunar: {
        text: processedBaziInfo?.lunar?.text || processedBaziInfo?.birth?.lunar?.text || '请设置出生信息',
        monthStr: processedBaziInfo?.lunar?.monthStr || processedBaziInfo?.birth?.lunar?.monthInChinese || '请设置',
        dayStr: processedBaziInfo?.lunar?.dayStr || processedBaziInfo?.birth?.lunar?.dayInChinese || '请设置'
      },
      shichen: {
        ganzhi: processedBaziInfo?.shichen?.ganzhi || processedBaziInfo?.birth?.time?.shichenGanZhi || '丁卯'
      },
      nayin: {
        year: processedBaziInfo?.nayin?.year || processedBaziInfo?.naYin?.year || '甲子',
        month: processedBaziInfo?.nayin?.month || processedBaziInfo?.naYin?.month || '乙丑',
        day: processedBaziInfo?.nayin?.day || processedBaziInfo?.naYin?.day || '丙寅',
        hour: processedBaziInfo?.nayin?.hour || processedBaziInfo?.naYin?.hour || '丁卯'
      }
    };

    processedBaziInfo = { ...defaultBaziInfo, ...processedBaziInfo };
  }

  const isValidBaziInfo = validateBaziInfoStructure(processedBaziInfo);

  // 使用 useMemo 缓存五行统计结果
  const stats = React.useMemo(() => isValidBaziInfo
    ? calculateFiveElementStats(processedBaziInfo)
    : {
        elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        wuxingElements: ['木', '火', '土', '金', '水'],
        dayMaster: '未知',
        fortuneType: '数据不可用',
        luckyElement: '无',
        masterElement: '未知',
        totalScore: 0
      }, [isValidBaziInfo, processedBaziInfo]);

  const {
    elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
    wuxingElements = ['木', '火', '土', '金', '水'],
    dayMaster = '未知',
    fortuneType = '数据不可用',
    luckyElement = '无',
    masterElement = '未知',
    totalScore = 0
  } = stats || {};

  // 使用 useMemo 缓存五行喜忌结果
  const wuxingPreferences = React.useMemo(() => {
    if (!processedBaziInfo || !isValidBaziInfo) return null;
    return calculateWuxingPreferences(processedBaziInfo);
  }, [processedBaziInfo, isValidBaziInfo]);

  // 使用 useMemo 缓存大运结果
  const dayun = React.useMemo(() => {
    if (!processedBaziInfo || !birthDate || !isValidBaziInfo) return null;
    let birthYear = new Date().getFullYear();
    if (birthDate) {
      if (typeof birthDate === 'string' && birthDate.includes('-')) {
        try {
          birthYear = parseInt(birthDate.split('-')[0]);
          if (isNaN(birthYear)) {
            birthYear = new Date().getFullYear();
          }
        } catch (error) {
          console.warn('解析出生年份失败:', error);
          birthYear = new Date().getFullYear();
        }
      }
    }
    return calculateDaYun(processedBaziInfo, birthYear);
  }, [processedBaziInfo, birthDate, isValidBaziInfo]);

  // Early return for error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
        <div className="text-red-600 dark:text-red-400 text-center">
          <div className="font-bold text-lg mb-2">八字信息加载错误</div>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                // 重新尝试加载八字信息
                setError(null);
                setBaziInfo(null);
                // Force re-run of the useEffect by updating a state that affects the dependencies
                loadBazi(); // Call the function directly
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mb-2 sm:mb-0"
            >
              重试加载
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors mb-2 sm:mb-0"
            >
              刷新页面
            </button>
            <button
              onClick={() => navigate('/user-config')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              前往配置页面
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">正在加载八字信息，请稍候...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">系统正在后台计算您的八字命格信息</p>
      </div>
    );
  }

  // Early return for missing bazi info
  if (!processedBaziInfo) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-white">
        <p className="mb-4">八字信息未找到或正在计算中</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              // Try to reload the data
              setError(null);
              setBaziInfo(null);
              loadBazi();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-2 sm:mb-0"
          >
            重新加载
          </button>
          <button
            onClick={() => navigate('/user-config')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            前往配置页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 农历生日信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-2">农历生日</h4>
            <p className="text-2xl sm:text-3xl font-semibold">{(processedBaziInfo && processedBaziInfo.lunar && processedBaziInfo.lunar.text) || '未知'}</p>
            <p className="text-sm sm:text-base opacity-80 mt-2">
              公历：{(processedBaziInfo && processedBaziInfo.solar && processedBaziInfo.solar.text) || '未知'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm sm:text-base opacity-80 mb-1">时辰</p>
            <p className="text-lg sm:text-xl font-semibold">{(processedBaziInfo && processedBaziInfo.shichen && processedBaziInfo.shichen.ganzhi) || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 八字四柱表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">年柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">月柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">日柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">时柱</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">八字</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.bazi && processedBaziInfo.bazi.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.bazi && processedBaziInfo.bazi.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.bazi && processedBaziInfo.bazi.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.bazi && processedBaziInfo.bazi.hour) || '未知'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">五行</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.wuxing && processedBaziInfo.wuxing.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.wuxing && processedBaziInfo.wuxing.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.wuxing && processedBaziInfo.wuxing.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(processedBaziInfo && processedBaziInfo.wuxing && processedBaziInfo.wuxing.hour) || '未知'}</td>
            </tr>
            <tr>
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">纳音</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(processedBaziInfo && processedBaziInfo.nayin && processedBaziInfo.nayin.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(processedBaziInfo && processedBaziInfo.nayin && processedBaziInfo.nayin.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(processedBaziInfo && processedBaziInfo.nayin && processedBaziInfo.nayin.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(processedBaziInfo && processedBaziInfo.nayin && processedBaziInfo.nayin.hour) || '未知'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 五行统计 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">五行统计</h4>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {wuxingElements.map((element) => {
            const elementColors = {
              '木': 'bg-green-500', '火': 'bg-red-500', '土': 'bg-yellow-600',
              '金': 'bg-gray-500', '水': 'bg-blue-500'
            };
            return (
              <div key={element} className="text-center">
                <div className={`h-3 sm:h-4 rounded-full ${elementColors[element]} mb-2 mx-auto w-full max-w-[60px]`}></div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-white">{element}</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{elementCounts[element]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 八字总述解析 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-3">八字总述解析</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white space-y-3">
          <p className="leading-relaxed">
            <span className="font-medium">总述：</span>
            {fortuneType}，八字喜用神「{luckyElement}」，起名最好用五行属性为「{luckyElement}」的字。
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-white leading-relaxed">
            日主天干为{dayMaster}({masterElement})。五行统计：
            木{elementCounts['木']}，火{elementCounts['火']}，土{elementCounts['土']}，
            金{elementCounts['金']}，水{elementCounts['水']}。
          </p>
        </div>
      </div>

      {/* 命局五行喜忌 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">命局五行喜忌</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white space-y-3">
          {wuxingPreferences ? (
              <div className="space-y-4">
                {/* 最喜五行 */}
                {wuxingPreferences.preferred.filter(p => p.priority === '最喜').map((item, index) => (
                  <div key={`preferred-top-${index}`} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">最喜五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}


                {/* 次喜五行 */}
                {wuxingPreferences.preferred.filter(p => p.priority === '次喜').map((item, index) => (
                  <div key={`preferred-secondary-${index}`} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">次喜五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}


                {/* 最忌五行 */}
                {wuxingPreferences.avoided.filter(p => p.priority === '最忌').map((item, index) => (
                  <div key={`avoided-top-${index}`} className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">最忌五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}


                {/* 次忌五行 */}
                {wuxingPreferences.avoided.filter(p => p.priority === '次忌').map((item, index) => (
                  <div key={`avoided-secondary-${index}`} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">次忌五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}


                {/* 平常五行 */}
                {wuxingPreferences.neutral.map((item, index) => (
                  <div key={`neutral-${index}`} className="border-l-4 border-gray-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">平常五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩{item.secai}
                    </p>
                  </div>
                ))}
              </div>
            ) : null
          }
        </div>
      </div>

      {/* 十年大运 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">大运</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white">
          {dayun ? (
              <div className="space-y-2">
                {dayun.map((d, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-yellow-100 dark:border-yellow-800/50">
                    <span className="font-medium text-sm sm:text-base">{d.ganzhi} {d.startYear}-{d.endYear}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-white">({d.ageRange})</span>
                  </div>
                ))}
              </div>
            ) : null
          }
        </div>
      </div>
    </div>
  );
};

// 辅助函数：验证八字数据一致性
const validateBaziDataConsistency = (baziData, birthDate, birthTime, birthLocation) => {
  if (!baziData) return false;

  const hasValidStructure = baziData && (
    (baziData.meta && baziData.birth && baziData.bazi) ||
    (baziData.bazi && baziData.bazi.year && baziData.bazi.month && baziData.bazi.day && baziData.bazi.hour) ||
    (baziData.year && baziData.month && baziData.day && baziData.hour)
  );

  if (!hasValidStructure) return false;

  // 验证出生日期是否匹配（支持多种数据格式）
  if (birthDate) {
    // 检查新版格式
    if (baziData.meta?.calculatedForDate && baziData.meta.calculatedForDate !== birthDate) {
      return false;
    }

    // 检查旧版格式
    if (baziData.birth?.solar?.date && baziData.birth.solar.date !== birthDate) {
      return false;
    }
      
    // 检查顶层日期字段
    if (baziData.calculatedForDate && baziData.calculatedForDate !== birthDate) {
      return false;
    }
  }

  return true;
};

// 辅助函数：标准化八字数据格式
const normalizeBaziData = (baziData) => {
  if (!baziData) return baziData;

  const normalized = { ...baziData };

  // 标准化八字字段
  if (!normalized.bazi) {
    // 如果没有bazi字段，尝试从顶层字段构建
    normalized.bazi = {
      year: normalized.year || (normalized.bazi?.year) || '甲子',
      month: normalized.month || (normalized.bazi?.month) || '乙丑',
      day: normalized.day || (normalized.bazi?.day) || '丙寅',
      hour: normalized.hour || (normalized.bazi?.hour) || '丁卯'
    };
  } else {
    // 如果有bazi字段，确保所有子字段都存在
    normalized.bazi = {
      year: normalized.bazi.year || normalized.year || '甲子',
      month: normalized.bazi.month || normalized.month || '乙丑',
      day: normalized.bazi.day || normalized.day || '丙寅',
      hour: normalized.bazi.hour || normalized.hour || '丁卯'
    };
  }

  // 标准化五行字段
  if (!normalized.wuxing) {
    // 检查是否有旧格式的五行数据
    if (normalized.wuXing) {
      normalized.wuxing = {
        text: normalized.wuXing.text || normalized.wuxing?.text || '木火 火火 土水',
        year: normalized.wuXing.year || normalized.wuxing?.year || '木',
        month: normalized.wuXing.month || normalized.wuxing?.month || '火',
        day: normalized.wuXing.day || normalized.wuxing?.day || '火',
        hour: normalized.wuXing.hour || normalized.wuxing?.hour || '土'
      };
    } else {
      normalized.wuxing = {
        text: normalized.wuxing?.text || '木火 火火 土水',
        year: normalized.wuxing?.year || '木',
        month: normalized.wuxing?.month || '火',
        day: normalized.wuxing?.day || '火',
        hour: normalized.wuxing?.hour || '土'
      };
    }
  }

  // 标准化农历字段
  if (!normalized.lunar) {
    if (normalized.birth?.lunar) {
      normalized.lunar = {
        text: normalized.birth.lunar.text || '请设置出生信息',
        monthStr: normalized.birth.lunar.monthInChinese || normalized.birth.lunar.monthStr || '请设置',
        dayStr: normalized.birth.lunar.dayInChinese || normalized.birth.lunar.dayStr || '请设置'
      };
    } else {
      normalized.lunar = {
        text: normalized.lunar?.text || normalized.birth?.lunar?.text || '请设置出生信息',
        monthStr: normalized.lunar?.monthStr || normalized.birth?.lunar?.monthInChinese || '请设置',
        dayStr: normalized.lunar?.dayStr || normalized.birth?.lunar?.dayInChinese || '请设置'
      };
    }
  }

  // 标准化时辰字段
  if (!normalized.shichen) {
    if (normalized.birth?.time) {
      normalized.shichen = {
        ganzhi: normalized.birth.time.shichenGanZhi || normalized.birth.time.ganzhi || '丁卯'
      };
    } else {
      normalized.shichen = {
        ganzhi: normalized.shichen?.ganzhi || normalized.birth?.time?.shichenGanZhi || '丁卯'
      };
    }
  }

  // 标准化纳音字段
  if (!normalized.nayin) {
    if (normalized.naYin) {
      normalized.nayin = {
        year: normalized.naYin.year || normalized.nayin?.year || '甲子',
        month: normalized.naYin.month || normalized.nayin?.month || '乙丑',
        day: normalized.naYin.day || normalized.nayin?.day || '丙寅',
        hour: normalized.naYin.hour || normalized.nayin?.hour || '丁卯'
      };
    } else {
      normalized.nayin = {
        year: normalized.nayin?.year || '甲子',
        month: normalized.nayin?.month || '乙丑',
        day: normalized.nayin?.day || '丙寅',
        hour: normalized.nayin?.hour || '丁卯'
      };
    }
  }

  // 确保meta字段存在
  if (!normalized.meta) {
    normalized.meta = {
      version: '1.0.0',
      calculatedAt: new Date().toISOString(),
      dataSource: 'normalized'
    };
  }

  return normalized;
};

// 辅助函数：获取降级八字数据
const getFallbackBaziData = (birthDate, birthTime) => {
  // 安全处理出生日期，确保是字符串格式
  const safeBirthDate = typeof birthDate === 'string' ? birthDate : '未知日期';
  const safeBirthTime = typeof birthTime === 'string' ? birthTime : '00:00';

  // 计算农历信息
  let lunarInfo = null;
  if (safeBirthDate && safeBirthDate !== '未知日期') {
    try {
      const lunarCalculated = calculateLunarDate(safeBirthDate, safeBirthTime, DEFAULT_REGION.lng);
      if (lunarCalculated) {
        lunarInfo = {
          text: lunarCalculated.fullText || lunarCalculated.shortText || `${safeBirthDate} 农历信息`,
          monthStr: lunarCalculated.monthInChinese || '未知月份',
          dayStr: lunarCalculated.dayInChinese || '未知日期'
        };
      }
    } catch (error) {
      console.warn('降级数据农历计算失败:', error);
    }
  }

  const defaultBaziData = {
    bazi: {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    },
    wuxing: {
      text: '木火 火火 土水',
      year: '木',
      month: '火',
      day: '火',
      hour: '土'
    },
    lunar: lunarInfo || {
      text: safeBirthDate ? `${safeBirthDate} 农历信息计算中...` : '请设置出生信息',
      monthStr: '请设置',
      dayStr: '请设置'
    },
    shichen: {
      ganzhi: safeBirthTime ? `${safeBirthTime} 时辰` : '丁卯'
    },
    nayin: {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    },
    trueSolarTime: safeBirthTime,
    meta: {
      version: '1.0.0',
      calculatedAt: new Date().toISOString(),
      dataSource: 'fallback',
      isFallback: true
    }
  };

  return defaultBaziData;
};

// 验证 baziInfo 数据结构的完整性
const validateBaziInfoStructure = (baziInfo) => {
  if (!baziInfo) {
    console.warn('baziInfo 为 null 或 undefined');
    return false;
  }

  // 检查是否有基本的八字字段（支持多种数据格式）
  let hasValidBazi = false;
  if (baziInfo.bazi && baziInfo.bazi.year && baziInfo.bazi.month && baziInfo.bazi.day && baziInfo.bazi.hour) {
    hasValidBazi = typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 &&
                   typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 &&
                   typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 &&
                   typeof baziInfo.bazi.hour === 'string' && baziInfo.bazi.hour.length > 0;
  } else if (baziInfo.year && baziInfo.month && baziInfo.day && baziInfo.hour) {
    hasValidBazi = typeof baziInfo.year === 'string' && baziInfo.year.length > 0 &&
                   typeof baziInfo.month === 'string' && baziInfo.month.length > 0 &&
                   typeof baziInfo.day === 'string' && baziInfo.day.length > 0 &&
                   typeof baziInfo.hour === 'string' && baziInfo.hour.length > 0;
  }

  if (!hasValidBazi) {
    console.warn('baziInfo 缺少有效的八字字段');
    return false;
  }

  // 检查五行字段（支持多种数据格式）
  let hasValidWuxing = false;
  if (baziInfo.wuxing && baziInfo.wuxing.year && baziInfo.wuxing.month &&
      baziInfo.wuxing.day && baziInfo.wuxing.hour && baziInfo.wuxing.text) {
    hasValidWuxing = typeof baziInfo.wuxing.year === 'string' && baziInfo.wuxing.year.length > 0 &&
                     typeof baziInfo.wuxing.month === 'string' && baziInfo.wuxing.month.length > 0 &&
                     typeof baziInfo.wuxing.day === 'string' && baziInfo.wuxing.day.length > 0 &&
                     typeof baziInfo.wuxing.hour === 'string' && baziInfo.wuxing.hour.length > 0 &&
                     typeof baziInfo.wuxing.text === 'string' && baziInfo.wuxing.text.length > 0;
  } else if (baziInfo.wuXing && baziInfo.wuXing.year && baziInfo.wuXing.month &&
             baziInfo.wuXing.day && baziInfo.wuXing.hour && baziInfo.wuXing.text) {
    hasValidWuxing = typeof baziInfo.wuXing.year === 'string' && baziInfo.wuXing.year.length > 0 &&
                     typeof baziInfo.wuXing.month === 'string' && baziInfo.wuXing.month.length > 0 &&
                     typeof baziInfo.wuXing.day === 'string' && baziInfo.wuXing.day.length > 0 &&
                     typeof baziInfo.wuXing.hour === 'string' && baziInfo.wuXing.hour.length > 0 &&
                     typeof baziInfo.wuXing.text === 'string' && baziInfo.wuXing.text.length > 0;
  }

  if (!hasValidWuxing) {
    console.warn('baziInfo 缺少有效的五行字段');
    return false;
  }

  return true;
};

// 计算五行统计
const calculateFiveElementStats = (baziInfo) => {
  if (!baziInfo) {
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '数据不可用',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }

  // 获取八字信息（支持多种格式）
  const bazi = baziInfo.bazi || {
    year: baziInfo.year,
    month: baziInfo.month,
    day: baziInfo.day,
    hour: baziInfo.hour
  };

  // 获取五行信息（支持多种格式）
  const wuxing = baziInfo.wuxing || baziInfo.wuXing || {
    text: baziInfo.wuxing?.text || baziInfo.wuXing?.text,
    year: baziInfo.wuxing?.year || baziInfo.wuXing?.year,
    month: baziInfo.wuxing?.month || baziInfo.wuXing?.month,
    day: baziInfo.wuxing?.day || baziInfo.wuXing?.day,
    hour: baziInfo.wuxing?.hour || baziInfo.wuXing?.hour
  };

  if (!bazi || !wuxing) {
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '数据不可用',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }

  const hasValidBaziFields = bazi &&
    typeof bazi.year === 'string' && bazi.year.length > 0 &&
    typeof bazi.month === 'string' && bazi.month.length > 0 &&
    typeof bazi.day === 'string' && bazi.day.length > 0 &&
    typeof bazi.hour === 'string' && bazi.hour.length > 0;

  const hasValidWuxingFields = wuxing &&
    typeof wuxing.text === 'string' &&
    typeof wuxing.year === 'string' && wuxing.year.length > 0 &&
    typeof wuxing.month === 'string' && wuxing.month.length > 0 &&
    typeof wuxing.day === 'string' && wuxing.day.length > 0 &&
    typeof wuxing.hour === 'string' && wuxing.hour.length > 0;

  if (!hasValidBaziFields || !hasValidWuxingFields) {
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '数据不可用',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }

  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  try {
    const wuxingStr = (baziInfo.wuxing && baziInfo.wuxing.text) ? baziInfo.wuxing.text : '';
    const wuxingList = typeof wuxingStr === 'string' ? wuxingStr.split('').filter(c => wuxingElements.includes(c)) : [];
    wuxingList.forEach(element => {
      elementCounts[element]++;
    });

    const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';
    const elementToIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

    const sameTypeScore = (elementCounts['木'] * 1.68) + (elementCounts['火'] * 0.34) +
                         (elementCounts['土'] * 0.75) + (elementCounts['金'] * 1.68) +
                         (elementCounts['水'] * 0.60);

    const diffTypeScore = (8 - sameTypeScore);

    const totalScore = Math.abs(sameTypeScore - diffTypeScore);

    let fortuneType = '八字中和';
    let luckyElement = '无特别喜用';
    const dayMasterElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
                                '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }[dayMaster] || '未知';
    const masterElement = dayMasterElement || '未知';

    if (totalScore > 3) {
      if (sameTypeScore > diffTypeScore) {
        fortuneType = '八字偏强';
        const missingElements = wuxingElements.filter(e => elementCounts[e] === 0);
        const minElements = wuxingElements.filter(e => elementCounts[e] === Math.min(...Object.values(elementCounts)));
        luckyElement = minElements.length > 0 ? minElements[0] : '木';
      } else {
        fortuneType = '八字偏弱';
        luckyElement = masterElement;
      }
    }

    return { elementCounts, wuxingElements, dayMaster, fortuneType, luckyElement, masterElement, totalScore };
  } catch (error) {
    console.error('计算五行统计时出错:', error);
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '计算出错',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }
};

// 计算五行喜忌功能
const calculateWuxingPreferences = (baziInfo) => {
  if (!baziInfo) {
    return null;
  }

  // 获取八字信息（支持多种格式）
  const bazi = baziInfo.bazi || {
    year: baziInfo.year,
    month: baziInfo.month,
    day: baziInfo.day,
    hour: baziInfo.hour
  };

  // 获取五行信息（支持多种格式）
  const wuxing = baziInfo.wuxing || baziInfo.wuXing || {
    text: baziInfo.wuxing?.text || baziInfo.wuXing?.text,
    year: baziInfo.wuxing?.year || baziInfo.wuXing?.year,
    month: baziInfo.wuxing?.month || baziInfo.wuXing?.month,
    day: baziInfo.wuxing?.day || baziInfo.wuXing?.day,
    hour: baziInfo.wuxing?.hour || baziInfo.wuXing?.hour
  };

  if (!bazi || !wuxing) {
    return null;
  }

  const hasValidBaziFields = bazi &&
    typeof bazi.year === 'string' && bazi.year.length > 0 &&
    typeof bazi.month === 'string' && bazi.month.length > 0 &&
    typeof bazi.day === 'string' && bazi.day.length > 0 &&
    typeof bazi.hour === 'string' && bazi.hour.length > 0;

  const hasValidWuxingFields = wuxing &&
    typeof wuxing.text === 'string' &&
    typeof wuxing.year === 'string' && wuxing.year.length > 0 &&
    typeof wuxing.month === 'string' && wuxing.month.length > 0 &&
    typeof wuxing.day === 'string' && wuxing.day.length > 0 &&
    typeof wuxing.hour === 'string' && wuxing.hour.length > 0;

  if (!hasValidBaziFields || !hasValidWuxingFields) {
    return null;
  }

  const dayMaster = bazi.day && typeof bazi.day === 'string' && bazi.day.length > 0 ? bazi.day.charAt(0) : '未知';

  const wuxingMap = {
    '甲': '木', '乙': '木', '寅': '木', '卯': '木',
    '丙': '火', '丁': '火', '巳': '火', '午': '火',
    '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '庚': '金', '辛': '金', '申': '金', '酉': '金',
    '壬': '水', '癸': '水', '亥': '水', '子': '水'
  };

  const dayMasterElement = wuxingMap[dayMaster] || '未知';

  const wuxingRelations = {
    '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
    '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
    '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
    '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
    '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
  };

  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  const wuxingStr = (baziInfo.wuxing && baziInfo.wuxing.text) ? (baziInfo.wuxing.text || '') : '';
  const wuxingList = typeof wuxingStr === 'string' ? wuxingStr.split('').filter(c => wuxingElements.includes(c)) : [];
  wuxingList.forEach(element => {
    elementCounts[element]++;
  });

  let strongestElement = null;
  let weakestElement = null;
  let maxCount = -1;
  let minCount = 10;

  wuxingElements.forEach(element => {
    if (elementCounts[element] > maxCount) {
      maxCount = elementCounts[element];
      strongestElement = element;
    }
    if (elementCounts[element] < minCount) {
      minCount = elementCounts[element];
      weakestElement = element;
    }
  });

  const dayElementCount = elementCounts[dayMasterElement];
  const averageCount = (elementCounts['木'] + elementCounts['火'] + elementCounts['土'] + elementCounts['金'] + elementCounts['水']) / 5;

  let preferences = {
    preferred: [],
    avoided: [],
    neutral: []
  };

  if (dayElementCount > averageCount) {
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被克'],
      priority: '次喜',
      shishen: '官杀',
      fangwei: '克我方位',
      shuzi: '克我数字',
      secai: '克我色彩'
    });

    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['生'],
      priority: '最喜',
      shishen: '食伤',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });

    if (strongestElement) {
      preferences.avoided.push({
        element: strongestElement,
        priority: '最忌',
        shishen: '同类过旺',
        fangwei: '同类方位',
        shuzi: '同类数字',
        secai: '同类色彩'
      });
    }

    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'],
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  } else {
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被生'],
      priority: '最喜',
      shishen: '印枭',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });

    preferences.preferred.push({
      element: dayMasterElement,
      priority: '次喜',
      shishen: '比劫',
      fangwei: '同类方位',
      shuzi: '同类数字',
      secai: '同类色彩'
    });

    if (strongestElement === wuxingRelations[dayMasterElement]['被克']) {
      preferences.avoided.push({
        element: strongestElement,
        priority: '最忌',
        shishen: '官杀',
        fangwei: '克我方位',
        shuzi: '克我数字',
        secai: '克我色彩'
      });
    } else {
      preferences.avoided.push({
        element: wuxingRelations[dayMasterElement]['生'],
        priority: '最忌',
        shishen: '食伤',
        fangwei: '泄耗方位',
        shuzi: '泄耗数字',
        secai: '泄耗色彩'
      });
    }

    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'],
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  }

  wuxingElements.forEach(element => {
    if (!preferences.preferred.some(p => p.element === element) &&
        !preferences.avoided.some(a => a.element === element)) {
      preferences.neutral.push({
        element: element,
        priority: '平常',
        shishen: '食伤',
        fangwei: '平常方位',
        shuzi: '平常数字',
        secai: '平常色彩'
      });
    }
  });

  const elementDetails = {
    '木': { shishen: '比劫', fangwei: '东、东南', shuzi: '三、八', secai: '绿、青' },
    '火': { shishen: '食伤', fangwei: '南、东南', shuzi: '二、七', secai: '红、紫、橙' },
    '土': { shishen: '财星', fangwei: '中央、本地', shuzi: '五、零', secai: '黄、棕' },
    '金': { shishen: '官杀', fangwei: '西、西北', shuzi: '四、九', secai: '白、银、金' },
    '水': { shishen: '印枭', fangwei: '北、西南', shuzi: '一、六', secai: '黑、蓝' }
  };

  preferences.preferred.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });

  preferences.avoided.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });

  preferences.neutral.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });

  return preferences;
};

// 计算十年大运
const calculateDaYun = (baziInfo, birthYear) => {
  if (!baziInfo) {
    return null;
  }

  // 获取八字信息（支持多种格式）
  const bazi = baziInfo.bazi || {
    year: baziInfo.year,
    month: baziInfo.month,
    day: baziInfo.day,
    hour: baziInfo.hour
  };

  if (!bazi) {
    return null;
  }

  const hasValidBaziFields = bazi &&
    typeof bazi.year === 'string' && bazi.year.length > 0 &&
    typeof bazi.month === 'string' && bazi.month.length > 0 &&
    typeof bazi.day === 'string' && bazi.day.length > 0 &&
    typeof bazi.hour === 'string' && bazi.hour.length > 0;

  if (!hasValidBaziFields) {
    return null;
  }

  const dayMaster = bazi.day && typeof bazi.day === 'string' && bazi.day.length > 0 ? bazi.day.charAt(0) : '未知';

  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const dayMasterIndex = gan.indexOf(dayMaster);

  const yearGan = bazi.year && typeof bazi.year === 'string' && bazi.year.length > 0 ? bazi.year.charAt(0) : '甲';
  const yearGanIndex = gan.indexOf(yearGan);
  const isYangYear = yearGanIndex % 2 === 0;

  const isMale = true;

  let dayunSequence = [];

  const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);

  const monthGan = bazi.month && typeof bazi.month === 'string' && bazi.month.length > 0 ? bazi.month.charAt(0) : '子';
  const monthZhi = bazi.month && typeof bazi.month === 'string' && bazi.month.length > 1 ? bazi.month.charAt(1) : '子';

  const monthGanIndex = gan.indexOf(monthGan);
  const monthZhiIndex = zhi.indexOf(monthZhi);

  for (let i = 0; i < 10; i++) {
    let ganIndex, zhiIndex;

    if (isForward) {
      ganIndex = (monthGanIndex + i + 1) % 10;
      zhiIndex = (monthZhiIndex + i + 1) % 12;
    } else {
      ganIndex = (monthGanIndex - i - 1 + 10) % 10;
      zhiIndex = (monthZhiIndex - i - 1 + 12) % 12;
    }

    if (ganIndex < 0) ganIndex += 10;
    if (zhiIndex < 0) zhiIndex += 12;

    const dagan = gan[ganIndex];
    const dazhi = zhi[zhiIndex];

    const startAge = 6 + i * 10;
    const endAge = startAge + 9;
    const startY = birthYear + startAge;
    const endY = startY + 9;

    dayunSequence.push({
      ganzhi: dagan + dazhi,
      startYear: startY,
      endYear: endY,
      ageRange: `${startAge}-${endAge}岁`
    });
  }

  return dayunSequence;
};

// 主页面组件
const BaziAnalysisPage = () => {
  const { theme } = useTheme();
  const { updateConfig, getCurrentConfigIndex } = useUserConfig();
  const currentConfig = useCurrentConfig();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // 日期和时辰选择相关状态
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedHour, setSelectedHour] = useState(12);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempLatitude, setTempLatitude] = useState(30);
  const [tempLongitude, setTempLongitude] = useState(110);
  const [lunarData, setLunarData] = useState(null);

  // 计算和加载状态
  const [calculating, setCalculating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // 显示成功消息并自动消失
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 初始化日期选择器状态
  useEffect(() => {
    if (currentConfig?.birthDate) {
      try {
        const birthDate = new Date(currentConfig.birthDate);
        if (!isNaN(birthDate.getTime())) {
          setSelectedYear(birthDate.getFullYear());
          setSelectedMonth(birthDate.getMonth() + 1);
          setSelectedDate(birthDate.getDate());
        }
      } catch (e) {
        console.warn('解析出生日期失败:', e);
      }
    }

    if (currentConfig?.birthTime) {
      try {
        const [h] = currentConfig.birthTime.split(':').map(Number);
        if (!isNaN(h) && h >= 0 && h <= 23) {
          setSelectedHour(h);
        }
      } catch (e) {
        console.warn('解析出生时间失败:', e);
      }
    }

    if (currentConfig?.birthLocation) {
      setTempLatitude(currentConfig.birthLocation.lat || 30);
      setTempLongitude(currentConfig.birthLocation.lng || 110);
    }
  }, [currentConfig?.birthDate, currentConfig?.birthTime, currentConfig?.birthLocation]);

  // 计算农历日期
  useEffect(() => {
    try {
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
    } catch (error) {
      console.warn('计算农历日期失败:', error);
    }
  }, [selectedYear, selectedMonth, selectedDate]);

  // 保存用户选择的日期到永久配置
  const saveDateToConfig = useCallback(async (year, month, date, hour, longitude, latitude) => {
    try {
      const newBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const newBirthTime = `${String(hour).padStart(2, '0')}:00`;
      const config = currentConfig;

      if (!config?.nickname) {
        console.error('配置为空或昵称为空:', config);
        throw new Error('当前配置为空或昵称为空，无法保存');
      }

      console.log('保存配置 - 当前配置:', {
        nickname: config.nickname,
        birthDate: config.birthDate,
        birthTime: config.birthTime
      });

      // 立即更新UI状态
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDate(date);
      setSelectedHour(hour);
      setTempLongitude(longitude);
      setTempLatitude(latitude);

      setCalculating(true);
      setError(null);

      // 使用 BaziDataManager 重新计算八字
      const baziResult = await calculateDetailedBazi(
        newBirthDate,
        newBirthTime,
        longitude
      );

      if (baziResult) {
        // 计算农历和真太阳时信息
        let enhancedBaziInfo = { ...baziResult };

        try {
          const lunarInfo = calculateLunarDate(newBirthDate, newBirthTime, longitude);
          if (lunarInfo) {
            enhancedBaziInfo = {
              ...enhancedBaziInfo,
              lunar: {
                text: lunarInfo.fullText || lunarInfo.shortText || `${newBirthDate} 农历信息`,
                monthStr: lunarInfo.monthInChinese || '未知月份',
                dayStr: lunarInfo.dayInChinese || '未知日期'
              }
            };
          }
        } catch (lunarError) {
          console.warn('计算农历信息失败:', lunarError);
        }

        try {
          const trueSolarTime = calculateTrueSolarTime(newBirthDate, newBirthTime, longitude);
          enhancedBaziInfo = {
            ...enhancedBaziInfo,
            trueSolarTime: trueSolarTime
          };
        } catch (solarError) {
          console.warn('计算真太阳时失败:', solarError);
          enhancedBaziInfo = {
            ...enhancedBaziInfo,
            trueSolarTime: newBirthTime
          };
        }

        // 更新配置中的基本信息
        const updatedConfig = {
          ...config,
          birthDate: newBirthDate,
          birthTime: newBirthTime,
          birthLocation: {
            province: config.birthLocation?.province || '默认',
            city: config.birthLocation?.city || '默认',
            district: config.birthLocation?.district || '默认',
            lng: longitude,
            lat: latitude
          },
          baziInfo: {
            ...enhancedBaziInfo,
            meta: {
              ...enhancedBaziInfo.meta,
              calculatedForDate: newBirthDate,
              calculatedAt: new Date().toISOString(),
              dataSource: 'calculated'
            }
          }
        };

        const currentIndex = getCurrentConfigIndex();
        await updateConfig(currentIndex, updatedConfig);

        // 同步八字信息到缓存
        try {
          await baziCacheManager.cacheBazi(
            config.nickname,
            {
              birthDate: newBirthDate,
              birthTime: newBirthTime,
              longitude: longitude
            },
            enhancedBaziInfo,
            null
          );
        } catch (cacheError) {
          console.warn('八字信息缓存失败:', cacheError);
        }

        showSuccessMessage('出生信息已保存，八字已更新');
      } else {
        showSuccessMessage('出生信息已保存（八字计算失败）');
      }

    } catch (error) {
      console.error('保存日期到配置失败:', error);
      setError(error.message);
      showSuccessMessage('保存失败: ' + error.message);
    } finally {
      setCalculating(false);
    }
  }, [currentConfig, updateConfig]);

  // 日期选择处理
  const handleDateChange = useCallback(async (year, month, date, hour, longitude, latitude, isSaveToConfig = true) => {
    setIsCalendarOpen(false);

    if (isSaveToConfig) {
      await saveDateToConfig(year, month, date, hour, longitude, latitude);
    } else {
      console.log('用户取消修改，保持当前数据');
    }
  }, [saveDateToConfig]);

  // 事件委托：处理日期卡片点击
  const handleDateCardClick = useCallback((e) => {
    const dateCard = e.currentTarget;
    if (dateCard) {
      setIsCalendarOpen(true);
    }
  }, []);

  // 确保页面加载时检查并处理八字信息
  useEffect(() => {
    const initializeBaziData = async () => {
      try {
        if (currentConfig?.birthDate) {
          // 验证出生日期格式
          if (typeof currentConfig.birthDate === 'string' && currentConfig.birthDate.includes('-')) {
            console.log('验证当前配置中的八字信息');

            // 如果有现有的八字信息，验证其有效性
            if (currentConfig.baziInfo) {
              const isValid = validateBaziInfoStructure(currentConfig.baziInfo);
              if (!isValid) {
                console.log('现有八字信息无效，清除并重新计算');
                // 清除无效的八字信息
                const updatedConfig = { ...currentConfig };
                delete updatedConfig.baziInfo;
                const currentIndex = getCurrentConfigIndex();
                await updateConfig(currentIndex, updatedConfig);
              }
            }
          }
        }
      } catch (err) {
        console.error('初始化八字数据时出错:', err);
      }
    };

    initializeBaziData();
  }, [currentConfig?.birthDate, currentConfig?.baziInfo, updateConfig]);

  // 当用户配置发生变化时，异步后台计算八字信息
  useEffect(() => {
    let isCancelled = false; // 防止在组件卸载后设置状态

    const calculateBaziInBackground = async () => {
      if (!currentConfig?.birthDate) {
        console.log('出生日期未设置，跳过八字计算');
        return;
      }

      try {
        // 验证出生日期是否为有效字符串
        let birthDateStr = currentConfig.birthDate;
        if (typeof birthDateStr !== 'string') {
          if (birthDateStr && typeof birthDateStr.toString === 'function') {
            birthDateStr = birthDateStr.toString();
          } else {
            console.warn('出生日期格式无效，跳过八字计算:', currentConfig.birthDate);
            return;
          }
        }

        if (!birthDateStr.includes('-')) {
          console.warn('出生日期格式无效，跳过八字计算:', birthDateStr);
          return;
        }

        // 验证并获取昵称
        const nickname = currentConfig.nickname || 'default_user';
        if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
          console.warn('用户昵称无效，使用默认值:', nickname);
          return; // 如果昵称无效，直接返回，不进行计算
        }

        // 检查是否已有计算好的八字信息且与当前配置一致，避免重复计算
        if (currentConfig?.baziInfo && currentConfig?.baziInfo?.meta?.calculatedForDate === currentConfig.birthDate) {
          console.log('八字信息已存在且与当前配置一致，无需重新计算');

          // 同步八字信息到缓存，按昵称存储（延迟执行，不阻塞UI）
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              try {
                baziCacheManager.cacheBazi(
                  nickname,
                  {
                    birthDate: currentConfig.birthDate,
                    birthTime: currentConfig.birthTime || '00:00',
                    longitude: currentConfig.birthLocation?.lng || DEFAULT_REGION.lng
                  },
                  currentConfig.baziInfo,
                  null
                );
                console.log('八字信息已同步到缓存，按昵称存储:', nickname);
              } catch (cacheError) {
                console.warn('八字信息缓存失败:', cacheError);
              }
            }, { timeout: 2000 });
          } else {
            setTimeout(() => {
              try {
                baziCacheManager.cacheBazi(
                  nickname,
                  {
                    birthDate: currentConfig.birthDate,
                    birthTime: currentConfig.birthTime || '00:00',
                    longitude: currentConfig.birthLocation?.lng || DEFAULT_REGION.lng
                  },
                  currentConfig.baziInfo,
                  null
                );
                console.log('八字信息已同步到缓存，按昵称存储:', nickname);
              } catch (cacheError) {
                console.warn('八字信息缓存失败:', cacheError);
              }
            }, 0);
          }

          return;
        }

        // 优先从缓存获取八字信息，避免重复计算
        try {
          const cachedBazi = baziCacheManager.getBaziByNickname(nickname, {
            format: 'legacy',
            validate: true,
            fallbackToLegacy: true
          });

          if (cachedBazi && (cachedBazi.bazi || cachedBazi.dualFormatBazi)) {
            console.log('从缓存获取八字信息成功:', nickname);
            
            const displayBazi = getDisplayBaziInfo(cachedBazi.bazi || cachedBazi.dualFormatBazi);
            
            // 验证缓存数据是否与当前配置一致
            if (validateBaziDataConsistency(displayBazi, birthDateStr, currentConfig.birthTime, currentConfig.birthLocation)) {
              // 如果缓存数据有效且一致，直接使用
              const updatedConfig = {
                ...currentConfig,
                baziInfo: {
                  ...displayBazi,
                  meta: {
                    ...displayBazi.meta,
                    calculatedForDate: birthDateStr,
                    calculatedAt: new Date().toISOString(),
                    dataSource: 'cached'
                  }
                }
              };
              
              if (!isCancelled) {
                await updateConfig(updatedConfig);
                console.log('使用缓存八字信息更新配置成功');
                return;
              }
            } else {
              console.log('缓存数据与当前配置不一致，需要重新计算');
            }
          }
        } catch (cacheError) {
          console.warn('缓存读取失败，继续执行计算:', cacheError);
          // 缓存读取失败，继续执行计算逻辑
        }

        // 检查是否已有计算好的八字信息且与当前配置一致
        if (currentConfig?.baziInfo && currentConfig?.baziInfo?.meta?.calculatedForDate === currentConfig.birthDate) {
          console.log('八字信息已存在且与当前配置一致，无需重新计算');

          // 同步八字信息到缓存，按昵称存储
          try {
            await baziCacheManager.cacheBazi(
              nickname,
              {
                birthDate: currentConfig.birthDate,
                birthTime: currentConfig.birthTime || '00:00',
                longitude: currentConfig.birthLocation?.lng || DEFAULT_REGION.lng
              },
              currentConfig.baziInfo,
              null // configIndex
            );
            console.log('八字信息已同步到缓存，按昵称存储:', nickname);
          } catch (cacheError) {
            console.warn('八字信息缓存失败:', cacheError);
          }

          return;
        }

        console.log('开始后台计算八字信息...');

        const birthDate = birthDateStr;
        const birthTime = currentConfig.birthTime || '00:00';
        const birthLocation = currentConfig.birthLocation || DEFAULT_REGION;

        // 执行八字计算 - 使用正确的参数格式
        const detailedBazi = await calculateDetailedBazi(
          birthDate,
          birthTime,
          birthLocation?.lng || DEFAULT_REGION.lng
        );

        if (isCancelled) return; // 检查组件是否已卸载

        if (detailedBazi) {
          // 确保农历信息存在，如果不存在则使用LunarCalendarHelper计算
          let enhancedBaziInfo = { ...detailedBazi };

          if (!enhancedBaziInfo.lunar || !enhancedBaziInfo.lunar.text) {
            try {
              const longitude = currentConfig.birthLocation?.lng || DEFAULT_REGION.lng;
              const lunarInfo = calculateLunarDate(birthDate, birthTime, longitude);
              if (lunarInfo) {
                enhancedBaziInfo = {
                  ...enhancedBaziInfo,
                  lunar: {
                    text: lunarInfo.fullText || lunarInfo.shortText || `${birthDate} 农历信息`,
                    monthStr: lunarInfo.monthInChinese || '未知月份',
                    dayStr: lunarInfo.dayInChinese || '未知日期'
                  }
                };
              }
            } catch (lunarError) {
              console.warn('计算农历信息失败:', lunarError);
              // 使用默认农历信息
              enhancedBaziInfo = {
                ...enhancedBaziInfo,
                lunar: {
                  text: `${birthDate} 农历信息`,
                  monthStr: '未知月份',
                  dayStr: '未知日期'
                }
              };
            }
          }

          // 确保真太阳时信息存在
          if (!enhancedBaziInfo.trueSolarTime) {
            try {
              const longitude = currentConfig.birthLocation?.lng || DEFAULT_REGION.lng;
              const trueSolarTime = calculateTrueSolarTime(birthDate, birthTime, longitude);
              enhancedBaziInfo = {
                ...enhancedBaziInfo,
                trueSolarTime: trueSolarTime
              };
            } catch (solarError) {
              console.warn('计算真太阳时失败:', solarError);
              enhancedBaziInfo = {
                ...enhancedBaziInfo,
                trueSolarTime: birthTime
              };
            }
          }

          // 更新配置，保存八字信息，确保保留所有原始配置字段
          const updatedConfig = {
            ...currentConfig, // 确保所有原始字段都被保留
            baziInfo: {
              ...enhancedBaziInfo,
              meta: {
                ...enhancedBaziInfo.meta,
                calculatedForDate: birthDate,
                calculatedAt: new Date().toISOString(),
                dataSource: 'calculated'
              }
            }
          };

          if (isCancelled) return; // 检查组件是否已卸载

          await updateConfig(updatedConfig);

          // 同步八字信息到缓存，按昵称存储
          try {
            await baziCacheManager.cacheBazi(
              nickname,
              {
                birthDate: currentConfig.birthDate,
                birthTime: currentConfig.birthTime || '00:00',
                longitude: currentConfig.birthLocation?.lng || DEFAULT_REGION.lng
              },
              enhancedBaziInfo,
              null // configIndex
            );
            console.log('八字信息计算完成并已保存到配置和缓存中，按昵称存储:', nickname);
          } catch (cacheError) {
            console.warn('八字信息缓存失败:', cacheError);
          }

          // Clear any previous error after successful calculation
          if (!isCancelled && !error) {
            setError(null);
          }
        } else {
          console.warn('八字计算结果为空');
        }
      } catch (calculationError) {
        if (isCancelled) return; // 检查组件是否已卸载

        console.error('后台八字计算失败:', calculationError);
        // Don't set error here as it would block the UI
        // Instead, log the error and let the UI continue to function
        console.warn('八字计算失败，但页面继续运行:', calculationError.message);
      }
    };

    // 延迟执行，避免阻塞页面渲染
    const timer = setTimeout(() => {
      // Run in background without blocking UI
      calculateBaziInBackground().catch(error => {
        if (isCancelled) return;
        console.error('后台计算过程中发生错误:', error);
      });
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
    // 减少依赖项，只依赖真正触发重新计算的字段
  }, [currentConfig?.birthDate, currentConfig?.birthTime, currentConfig?.birthLocation, currentConfig?.nickname, updateConfig]);

  // Function to trigger background recalculation
  const triggerBackgroundRecalculation = async () => {
    if (!currentConfig?.birthDate) {
      console.log('出生日期未设置，跳过八字计算');
      return;
    }

    try {
      // 驗证出生日期是否为有效字符串
      let birthDateStr = currentConfig.birthDate;
      if (typeof birthDateStr !== 'string') {
        if (birthDateStr && typeof birthDateStr.toString === 'function') {
          birthDateStr = birthDateStr.toString();
        } else {
          console.warn('出生日期格式无效，跳过八字计算:', currentConfig.birthDate);
          return;
        }
      }

      if (!birthDateStr.includes('-')) {
        console.warn('出生日期格式无效，跳过八字计算:', birthDateStr);
        return;
      }

      // 验证并获取昵称
      const nickname = currentConfig.nickname || 'default_user';
      if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
        console.warn('用户昵称无效，使用默认值:', nickname);
      }

      console.log('手动触发后台八字计算...');

      const birthDate = birthDateStr;
      const birthTime = currentConfig.birthTime || '00:00';
      const birthLocation = currentConfig.birthLocation || DEFAULT_REGION;

      // 执行八字计算 - 使用正确的参数格式
      const detailedBazi = await calculateDetailedBazi(
        birthDate,
        birthTime,
        birthLocation?.lng || DEFAULT_REGION.lng
      );

      if (detailedBazi) {
        // 确保农历信息存在，如果不存在则使用LunarCalendarHelper计算
        let enhancedBaziInfo = { ...detailedBazi };

        if (!enhancedBaziInfo.lunar || !enhancedBaziInfo.lunar.text) {
          try {
            const longitude = currentConfig.birthLocation?.lng || DEFAULT_REGION.lng;
            const lunarInfo = calculateLunarDate(birthDate, birthTime, longitude);
            if (lunarInfo) {
              enhancedBaziInfo = {
                ...enhancedBaziInfo,
                lunar: {
                  text: lunarInfo.fullText || lunarInfo.shortText || `${birthDate} 农历信息`,
                  monthStr: lunarInfo.monthInChinese || '未知月份',
                  dayStr: lunarInfo.dayInChinese || '未知日期'
                }
              };
            }
          } catch (lunarError) {
            console.warn('计算农历信息失败:', lunarError);
            // 使用默认农历信息
            enhancedBaziInfo = {
              ...enhancedBaziInfo,
              lunar: {
                text: `${birthDate} 农历信息`,
                monthStr: '未知月份',
                dayStr: '未知日期'
              }
            };
          }
        }

        // 确保真太阳时信息存在
        if (!enhancedBaziInfo.trueSolarTime) {
          try {
            const longitude = currentConfig.birthLocation?.lng || DEFAULT_REGION.lng;
            const trueSolarTime = calculateTrueSolarTime(birthDate, birthTime, longitude);
            enhancedBaziInfo = {
              ...enhancedBaziInfo,
              trueSolarTime: trueSolarTime
            };
          } catch (solarError) {
            console.warn('计算真太阳时失败:', solarError);
            enhancedBaziInfo = {
              ...enhancedBaziInfo,
              trueSolarTime: birthTime
            };
          }
        }

        // 更新配置，保存八字信息，确保保留所有原始配置字段
        const updatedConfig = {
          ...currentConfig, // 确保所有原始字段都被保留
          baziInfo: {
            ...enhancedBaziInfo,
            meta: {
              ...enhancedBaziInfo.meta,
              calculatedForDate: birthDate,
              calculatedAt: new Date().toISOString(),
              dataSource: 'calculated'
            }
          }
        };

        const currentIndex = getCurrentConfigIndex();
        await updateConfig(currentIndex, updatedConfig);

        // 同步八字信息到缓存，按昵称存储
        try {
          await baziCacheManager.cacheBazi(
            nickname,
            {
              birthDate: currentConfig.birthDate,
              birthTime: currentConfig.birthTime || '00:00',
              longitude: currentConfig.birthLocation?.lng || DEFAULT_REGION.lng
            },
            enhancedBaziInfo,
            null // configIndex
          );
          console.log('八字信息计算完成并已保存到配置和缓存中，按昵称存储:', nickname);
        } catch (cacheError) {
          console.warn('八字信息缓存失败:', cacheError);
        }

        // Clear any previous error after successful calculation
        setError(null);
      } else {
        console.warn('八字计算结果为空');
      }
    } catch (calculationError) {
      console.error('手动触发八字计算失败:', calculationError);
      setError('手动计算失败: ' + calculationError.message);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20 ${theme}`}>
      {/* 导航标题栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(to right, #d97706, #ca8a04)',
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            八字命格分析
          </h1>
          <button
            onClick={() => navigate('/ziwei')}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            紫薇命宫
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 成功消息提示 */}
        {successMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
            ✅ {successMessage}
          </div>
        )}

        {/* 日期卡片 */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 shadow-sm mb-6`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <div
                className={`text-center py-4 px-4 rounded-xl cursor-pointer transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} touch-manipulation`}
                onClick={handleDateCardClick}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculating ? '⏳ 计算中...' : '生辰八字'}
                </div>
                {/* 公历日期 */}
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedYear}年 {selectedMonth}月 {selectedDate}日
                </div>
                {/* 农历日期 */}
                {lunarData && (
                  <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    农历{lunarData.lunarMonthStr}{lunarData.lunarDayStr}
                  </div>
                )}
                {/* 时辰 */}
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  出生时间：{selectedHour}:00
                </div>
                <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculating ? '正在后台计算八字...' : '点击修改出生日期和时间'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 提示卡片 */}
        <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                八字命格分析
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                基于您的出生日期和时间，计算并展示完整的八字命格分析结果，包括四柱、五行、纳音、喜忌、大运等信息。
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="text-red-600 dark:text-red-400 text-center">
              <div className="font-bold text-lg mb-2">系统错误</div>
              <p className="mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={triggerBackgroundRecalculation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-2 sm:mb-0"
                >
                  后台重算
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 八字命格展示 */}
        <ErrorBoundary>
          <BaziFortuneDisplay
            birthDate={currentConfig?.birthDate}
            birthTime={currentConfig?.birthTime}
            birthLocation={currentConfig?.birthLocation}
            lunarBirthDate={currentConfig?.lunarBirthDate}
            trueSolarTime={currentConfig?.trueSolarTime}
            savedBaziInfo={currentConfig?.baziInfo}
            nickname={currentConfig?.nickname}
          />
        </ErrorBoundary>
      </div>

      {/* 日期选择器弹窗 */}
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
        theme={theme}
      />
    </div>
  );
};

export default BaziAnalysisPage;
