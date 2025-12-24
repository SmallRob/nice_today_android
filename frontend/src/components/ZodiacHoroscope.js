import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import * as horoscopeAlgorithm from '../utils/horoscopeAlgorithm';
import ZodiacTraitsDisplay from './ZodiacTraitsDisplay';
import {
  initializeHoroscopeCache
} from '../utils/horoscopeCache';
import {
  debounce,
  initializePerformanceOptimization
} from '../utils/performanceOptimization';
import performanceMonitor from '../utils/performanceMonitor';
import { getToday } from '../utils/timeCache';
import '../styles/mobileOptimization.css';
import '../styles/animations.css';
import '../styles/horoscope.css';
import { Line } from 'react-chartjs-2';
import {
  HoroscopeSelector,
  TrendChart,
  ScoreCard,
  LuckyItemsGrid,
  SkeletonLoader,
  ErrorDisplay,
  EmptyState
} from './HoroscopeComponents';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Memoized Line Chart Component for better performance on mobile devices
export const MemoizedLineChart = memo(({ data, options }) => (
  <Line data={data} options={options} />
));
MemoizedLineChart.displayName = 'MemoizedLineChart';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 解构赋值确保函数正确导入
const {
  HOROSCOPE_DATA_ENHANCED,
  generateDailyHoroscope
} = horoscopeAlgorithm;

// 创建别名以保持向后兼容性
const getHoroscopeData = () => HOROSCOPE_DATA_ENHANCED;

const HoroscopeTab = () => {
  // 状态管理
  const [userHoroscope, setUserHoroscope] = useState('');
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isTemporaryHoroscope, setIsTemporaryHoroscope] = useState(false);
  const isTemporaryRef = useRef(false);

  // 初始化缓存管理器和性能优化
  useEffect(() => {
    const initOptimizations = async () => {
      try {
        // 检查函数是否存在再初始化性能优化
        if (typeof initializePerformanceOptimization === 'function') {
          initializePerformanceOptimization();
        }

        // 检查函数是否存在再初始化缓存管理器
        if (typeof initializeHoroscopeCache === 'function') {
          initializeHoroscopeCache();
        }
      } catch (error) {
        console.error('优化初始化失败:', error);
        setError('初始化失败: ' + error.message);
      }
    };

    initOptimizations();
  }, []);

  // 计算综合分数（基于增强版算法）
  const calculateOverallScore = useCallback((dailyForecast) => {
    if (!dailyForecast) return 77; // 默认分数
    const { love, wealth, career, study } = dailyForecast;
    const total = (love.score + wealth.score + career.score + study.score) / 4;
    return Math.round(total);
  }, []);

  // 从用户配置获取用户星座
  const getUserZodiac = useCallback(() => {
    try {
      const config = userConfigManager.getCurrentConfig();
      return config?.zodiac || '';
    } catch (error) {
      console.log('获取用户星座失败:', error);
      return '';
    }
  }, []);

  // 优化的模块化运势数据计算
  const calculateHoroscopeData = useCallback((horoscope, date) => {
    try {
      // 检查函数是否存在并添加类型验证
      if (typeof generateDailyHoroscope !== 'function') {
        throw new Error('星座数据生成函数未正确加载');
      }

      // 模块化计算步骤
      // 第一步：基础数据生成
      const basicData = generateDailyHoroscope(horoscope, date);

      if (!basicData) {
        throw new Error('无法生成基础星座数据');
      }

      // 第二步：增强数据处理
      const enhancedData = {
        ...basicData,
        calculatedAt: new Date().toISOString(),
        calculationMethod: 'modular'
      };

      // 第三步：验证数据完整性
      const requiredFields = ['horoscopeInfo', 'dailyForecast', 'recommendations'];
      for (const field of requiredFields) {
        if (!enhancedData[field]) {
          console.warn(`缺少必要字段: ${field}`);
        }
      }

      return enhancedData;
    } catch (error) {
      console.error('计算星座运势数据失败:', error);
      throw error;
    }
  }, []);

  // 优化的加载函数 - 使用时间缓存确保准确性
  const loadHoroscopeGuidance = useCallback(async (horoscope = userHoroscope, date) => {
    if (!horoscope) return Promise.resolve();

    // 使用缓存的当前时间，确保所有组件使用一致的日期
    const currentDate = date || getToday();

    // 确保性能监控函数存在再调用
    if (typeof performanceMonitor?.start === 'function') {
      performanceMonitor.start();
    }

    setLoading(true);
    setError(null);

    try {
      // 使用模块化计算
      const horoscopeData = calculateHoroscopeData(horoscope, currentDate);
      setHoroscopeGuidance(horoscopeData);
      return Promise.resolve(horoscopeData);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
      return Promise.reject(error);
    } finally {
      setLoading(false);
      // 确保性能监控函数存在再调用
      if (typeof performanceMonitor?.end === 'function') {
        performanceMonitor.end('加载星座运势数据');
      }
    }
  }, [calculateHoroscopeData]);

  // 初始化组件 - 优化为优先获取用户数据
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // 确保用户配置管理器已初始化
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }

        // 获取用户星座
        const userZodiac = getUserZodiac();

        // 如果用户有配置星座，优先使用；否则使用白羊座
        const initialHoroscope = userZodiac || '白羊座';

        if (isMounted) {
          setUserHoroscope(initialHoroscope);
          setIsTemporaryHoroscope(!userZodiac); // 如果不是用户配置的星座，标记为临时
          isTemporaryRef.current = !userZodiac;
          setInitialized(true);
          setDataLoaded(false); // 标记需要加载运势数据
        }
      } catch (error) {
        console.error('初始化星座运程组件失败:', error);
        // 降级处理
        if (isMounted) {
          setUserHoroscope('白羊座');
          setIsTemporaryHoroscope(true);
          isTemporaryRef.current = true;
          setInitialized(true);
          setDataLoaded(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [getUserZodiac]);

  // 同步临时状态到ref
  useEffect(() => {
    isTemporaryRef.current = isTemporaryHoroscope;
  }, [isTemporaryHoroscope]);

  // 当星座变化时重新加载数据 - 使用时间缓存确保一致性
  useEffect(() => {
    if (!userHoroscope || !initialized) return;

    // 立即加载数据，不使用防抖，确保实时响应
    if (!dataLoaded) {
      // 直接调用，不使用防抖，确保立即计算新数据
      loadHoroscopeGuidance(userHoroscope, getToday())
        .then(() => {
          if (typeof setDataLoaded === 'function') {
            setDataLoaded(true);
          }
        })
        .catch(error => {
          console.error('加载星座数据失败:', error);
          setError('加载失败: ' + error.message);
        });
    }
  }, [userHoroscope, loadHoroscopeGuidance, initialized, dataLoaded]);

  // 处理星座选择 - 实时计算，不缓存旧数据
  const handleHoroscopeChange = useCallback((horoscope) => {
    if (userHoroscope !== horoscope) {
      setUserHoroscope(horoscope);
      // 标记为临时选择（如果不是用户配置的星座）
      setIsTemporaryHoroscope(horoscope !== getUserZodiac());
      isTemporaryRef.current = horoscope !== getUserZodiac();

      // 立即重置数据，确保不会显示旧数据
      setHoroscopeGuidance(null);
      setError(null);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope, getUserZodiac]);

  // 恢复用户配置的星座
  const handleRestoreUserHoroscope = useCallback(() => {
    const userZodiac = getUserZodiac();
    if (userZodiac && userZodiac !== userHoroscope) {
      setUserHoroscope(userZodiac);
      setIsTemporaryHoroscope(false);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope, getUserZodiac]);

  // 渲染趋势图表
  const renderTrendChart = () => {
    return <TrendChart userHoroscope={userHoroscope} generateDailyHoroscope={generateDailyHoroscope} />;
  };

  // 渲染统一风格的运势卡片
  const renderHoroscopeCard = () => {
    if (!horoscopeGuidance || !userHoroscope) return null;

    const overallScore = calculateOverallScore(horoscopeGuidance.dailyForecast);
    const { dailyForecast, recommendations, overallDescription } = horoscopeGuidance;

    // 分数项
    const scores = [
      { name: '爱情', score: dailyForecast.love.score, icon: '❤️' },
      { name: '财富', score: dailyForecast.wealth.score, icon: '💰' },
      { name: '事业', score: dailyForecast.career.score, icon: '💼' },
      { name: '学业', score: dailyForecast.study.score, icon: '📚' }
    ];

    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-5">
        <ScoreCard overallScore={overallScore} scores={scores} sortedScores={sortedScores} />
        
        {renderTrendChart()}

        <div className="horoscope-card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            今日运势解读
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {overallDescription}
          </p>
        </div>

        <div className="horoscope-card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-4 h-4 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            感性提醒
          </h3>
          <div className="flex items-start">
            <span className="mr-3 text-xl">💖</span>
            <div>
              <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                {String(recommendations.dailyReminder || '今天会是美好的一天')}
              </p>
            </div>
          </div>
        </div>

        <div className="horoscope-grid-2">
          <div className="horoscope-card border-l-4 border-l-green-500">
            <h4 className="text-green-700 dark:text-green-400 font-bold mb-2 flex items-center text-sm">
              <span className="mr-1">✅</span> 宜
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{String(recommendations.positiveAdvice || '保持积极心态')}</p>
          </div>
          <div className="horoscope-card border-l-4 border-l-red-500">
            <h4 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center text-sm">
              <span className="mr-1">❌</span> 忌
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{String(recommendations.avoidAdvice || '避免消极思维')}</p>
          </div>
        </div>

        <LuckyItemsGrid recommendations={recommendations} />

        {recommendations.soulQuestion && (
          <div className="horoscope-card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              心灵启发
            </h3>
            <h4 className="text-blue-700 dark:text-blue-300 mb-2 font-bold flex items-start text-sm">
              <span className="mr-2 mt-0.5 text-base">❓</span>
              {String(recommendations.soulQuestion.question || '今日问题')}
            </h4>
            <div className="horoscope-info">
              <p className="text-blue-600 dark:text-blue-400 text-sm leading-relaxed italic">
                "{String(recommendations.soulQuestion.answer || '今日解答')}"
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-3xl mr-4 border border-indigo-50 dark:border-indigo-900">
              {horoscopeGuidance.horoscopeInfo.icon}
            </div>
            <div>
              <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                {userHoroscope}
              </h4>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                {horoscopeGuidance.horoscopeInfo.element}能量 · {horoscopeGuidance.horoscopeInfo.dateRange}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/60 dark:bg-white/5 rounded-full text-xs text-gray-600 dark:text-gray-400">相容: {Array.isArray(recommendations.compatibleSigns) ? recommendations.compatibleSigns.join('、') : recommendations.compatibleSigns}</span>
            <span className="px-3 py-1 bg-white/60 dark:bg-white/5 rounded-full text-xs text-gray-600 dark:text-gray-400">月亮: {String(recommendations.todayMoonSign || '未知')}</span>
          </div>
        </div>
      </div>
    );
  };

  // 统一风格的星座选择器 - 采用嵌入式布局
  const renderHoroscopeSelector = () => {
    return (
      <HoroscopeSelector 
        userHoroscope={userHoroscope}
        isTemporaryHoroscope={isTemporaryHoroscope}
        handleHoroscopeChange={handleHoroscopeChange}
        handleRestoreUserHoroscope={handleRestoreUserHoroscope}
        getHoroscopeData={getHoroscopeData}
      />
    );
  };

  return (
    <div className="horoscope-container">
      {/* Banner区域 - 简化布局 */}
      <div className="horoscope-banner relative overflow-hidden flex-shrink-0">
        {/* 星宿渐变背景 - 合并容器 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-indigo-600/30 to-blue-700/30">
          {/* 动态星点效果 - 简化布局 */}
          {Array.from({ length: 20 }, (_, i) => {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = 2 + Math.random() * 2;
            const opacity = 0.3 + Math.random() * 0.7;
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 2;
                        
            return (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  opacity,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              />
            );
          })}
        </div>

        {/* 星宿装饰符号 - 简化布局 */}
        <div className="absolute top-2 left-2 w-12 h-12 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="50" cy="30" r="3" />
            <circle cx="30" cy="50" r="2" />
            <circle cx="70" cy="50" r="2" />
            <circle cx="50" cy="70" r="3" />
            <line x1="50" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="30" x2="70" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="1" />
            <line x1="70" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-14 h-14 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <path d="M60,30 Q70,40 60,50 Q55,40 60,30" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="30" cy="30" r="2" />
            <circle cx="25" cy="40" r="1.5" />
            <circle cx="35" cy="38" r="1" />
            <circle cx="70" cy="60" r="1.5" />
            <circle cx="75" cy="65" r="1" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
          <h1 className="text-xl font-bold mb-1 text-shadow-lg horoscope-title">
            星座运势
          </h1>
          <p className="text-white text-sm opacity-95 font-medium horoscope-subtitle mb-2">
            星象指引·命运解读·运势探索
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs bg-constellation/40 text-white px-2 py-0.5 rounded-full border border-white/20">白羊</span>
            <span className="text-xs bg-destiny/40 text-white px-2 py-0.5 rounded-full border border-white/20">金牛</span>
            <span className="text-xs bg-lunar/40 text-white px-2 py-0.5 rounded-full border border-white/20">双子</span>
            <span className="text-xs bg-solar/40 text-white px-2 py-0.5 rounded-full border border-white/20">巨蟹</span>
          </div>
        </div>
      </div>

      {/* 滚动内容容器 - 为移动设备添加滚动支持 */}
      <div className="horoscope-main-content">
        <div className="container mx-auto px-4 py-4 bg-white dark:bg-black">
          {/* 星座选择器 */}
          {renderHoroscopeSelector()}

          {/* 内容区域 - 简化布局 */}
          <div className="space-y-4 mx-auto max-w-2xl">
            {/* 加载状态 */}
            {loading && <SkeletonLoader />}

            {/* 错误显示 */}
            {error && <ErrorDisplay error={error} />}

            {/* 运势内容 */}
            {!loading && !error && horoscopeGuidance && userHoroscope ? (
              renderHoroscopeCard()
            ) : !loading && !error && !userHoroscope ? (
              <EmptyState />
            ) : null}

            {/* 星座综合特质展示 */}
            {!loading && !error && userHoroscope && (
              <ZodiacTraitsDisplay currentHoroscope={userHoroscope} />
            )}

            {/* 底部信息 */}
            {!loading && !error && horoscopeGuidance && (
              <div className="horoscope-card text-center text-gray-500 dark:text-gray-400 text-xs p-3">
                <p>数据更新时间：{new Date().toLocaleString()}</p>
                <p className="mt-1">星座运势仅供参考，请理性看待</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeTab;