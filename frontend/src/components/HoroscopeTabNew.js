import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import * as horoscopeAlgorithm from '../utils/horoscopeAlgorithm';
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
import { Card } from './PageLayout';
import { Line } from 'react-chartjs-2';
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

  // 防抖版本的加载函数，用于用户快速切换时避免多次请求
  const debouncedLoadHoroscopeGuidance = useMemo(
    () => debounce(loadHoroscopeGuidance, 300),
    [loadHoroscopeGuidance]
  );

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
    if (!userHoroscope) return null;

    // 生成过去7天的数据（模拟趋势）
    const generateTrendData = () => {
      const labels = [];
      const loveData = [];
      const wealthData = [];
      const careerData = [];

      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

        // 使用算法生成当天的模拟数据
        const dayData = generateDailyHoroscope(userHoroscope, date);
        if (dayData) {
          loveData.push(dayData.dailyForecast.love.score);
          wealthData.push(dayData.dailyForecast.wealth.score);
          careerData.push(dayData.dailyForecast.career.score);
        } else {
          loveData.push(70);
          wealthData.push(70);
          careerData.push(70);
        }
      }
      return { labels, loveData, wealthData, careerData };
    };

    const { labels, loveData, wealthData, careerData } = generateTrendData();

    const chartData = {
      labels,
      datasets: [
        {
          label: '爱情',
          data: loveData,
          borderColor: '#EC4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
        {
          label: '财富',
          data: wealthData,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
        {
          label: '事业',
          data: careerData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 6,
            font: { size: 10 }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 10 }
          },
          grid: {
            display: false
          }
        },
        x: {
          ticks: {
            font: { size: 10 }
          },
          grid: {
            display: false
          }
        }
      }
    };

    return (
      <Card title="近期能量趋势" className="mb-5">
        <div style={{ height: '200px' }}>
          <Line data={chartData} options={options} />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center italic">展示过去7天的运势波动情况</p>
      </Card>
    );
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
        {/* 综合分数卡片 - 采用统一风格 */}
        <div className="horoscope-score-container rounded-xl p-5 text-white shadow-lg bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900">
          <div className="text-center mb-4">
            <h3 className="horoscope-title text-lg md:text-xl font-bold mb-1 opacity-90">今日运势指数</h3>
            <div className="text-5xl md:text-6xl font-bold mb-2 drop-shadow-md">{overallScore}<span className="text-xl md:text-2xl opacity-75 ml-1">分</span></div>
            <p className="horoscope-subtitle text-white/90 font-medium text-lg">{overallScore > 75 ? '运势极佳' : overallScore > 60 ? '运势良好' : overallScore > 45 ? '运势平稳' : '运势一般'}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {scores.map((item, index) => (
              <div key={index} className="text-center bg-white/15 dark:bg-white/10 rounded-xl p-2 backdrop-blur-sm border border-white/10">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-lg font-bold">{item.score}</div>
                <div className="horoscope-subtitle text-[10px] opacity-80 mt-0.5">{item.name}</div>
              </div>
            ))}
          </div>

          {/* 分数提示 */}
          <div className="mt-4 flex justify-center items-center text-sm bg-black/20 dark:bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="mr-2 font-medium horoscope-subtitle opacity-90">今日核心:</span>
            <span className="flex items-center font-bold text-yellow-300">
              <span className="mr-1 text-base">{sortedScores[0].icon}</span>
              <span className="text-sm">{sortedScores[0].name}运特别旺</span>
            </span>
          </div>
        </div>

        {/* 趋势图表 - 新增功能 */}
        {renderTrendChart()}

        {/* 今日解读 */}
        <Card title="今日运势解读" icon="📝">
          <p className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {overallDescription}
          </p>
        </Card>

        {/* 爱情提醒 */}
        <Card
          title="感性提醒"
          className="border-l-4 border-l-pink-500"
        >
          <div className="flex items-start">
            <span className="mr-3 text-2xl">💖</span>
            <div>
              <p className="horoscope-subtitle text-pink-600 dark:text-pink-400 text-base font-medium">
                {String(recommendations.dailyReminder || '今天会是美好的一天')}
              </p>
            </div>
          </div>
        </Card>

        {/* 建议 - 宜忌 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-green-500">
            <h4 className="text-green-700 dark:text-green-400 font-bold mb-2 flex items-center text-sm">
              <span className="mr-1">✅</span> 宜
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{String(recommendations.positiveAdvice || '保持积极心态')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500">
            <h4 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center text-sm">
              <span className="mr-1">❌</span> 忌
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{String(recommendations.avoidAdvice || '避免消极思维')}</p>
          </div>
        </div>

        {/* 幸运物品网格 - 优化为3列 */}
        <Card title="✨ 今日幸运能量" className="overflow-hidden">
          <div className="grid grid-cols-3 gap-4">
            {/* 幸运色 */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm mb-2"
                style={{ backgroundColor: (Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0] : '#FF6B6B' }}
              ></div>
              <span className="text-[10px] text-gray-500">幸运色</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                {String((Array.isArray(recommendations.luckyColorNames) && recommendations.luckyColorNames[0]) ? recommendations.luckyColorNames[0] : '魅力红')}
              </span>
            </div>

            {/* 幸运配饰 */}
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2">💎</div>
              <span className="text-[10px] text-gray-500">幸运配饰</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 text-center truncate w-full">
                {String(recommendations.luckyAccessory || '宝石')}
              </span>
            </div>

            {/* 幸运食物 */}
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2">🍱</div>
              <span className="text-[10px] text-gray-500">幸运食物</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 text-center truncate w-full">
                {String(recommendations.luckyFood || '美食')}
              </span>
            </div>

            {/* 幸运数字 */}
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2">🔢</div>
              <span className="text-[10px] text-gray-500">幸运数字</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                {Array.isArray(recommendations.luckyNumbers) ? recommendations.luckyNumbers.join('/') : String(recommendations.luckyNumbers || '7')}
              </span>
            </div>

            {/* 幸运时辰 */}
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2">🕓</div>
              <span className="text-[10px] text-gray-500">幸运时辰</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 text-center whitespace-normal">
                {String(recommendations.luckyTime || '午后')}
              </span>
            </div>

            {/* 幸运方位 */}
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2">🧭</div>
              <span className="text-[10px] text-gray-500">幸运方位</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                {String(recommendations.luckyDirection || '东方')}
              </span>
            </div>
          </div>
        </Card>

        {/* 心灵问答 */}
        {recommendations.soulQuestion && (
          <Card title="心灵启发" className="border-t-4 border-t-blue-500">
            <h4 className="text-blue-700 dark:text-blue-300 mb-2 font-bold flex items-start text-sm">
              <span className="mr-2 mt-0.5 text-base">❓</span>
              {String(recommendations.soulQuestion.question || '今日问题')}
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400 text-sm leading-relaxed italic">
                "{String(recommendations.soulQuestion.answer || '今日解答')}"
              </p>
            </div>
          </Card>
        )}

        {/* 星座名片 */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-3xl mr-4 border border-indigo-50 dark:border-indigo-900">
              {horoscopeGuidance.horoscopeInfo.icon}
            </div>
            <div>
              <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                {userHoroscope}
              </h4>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm">
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
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        {/* 标题区域 */}
        <div className="text-center mb-5">
          <h1 className="horoscope-title text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
            <span className="mr-2 text-2xl">🔮</span>
            星座运势
          </h1>
          <p className="horoscope-subtitle text-sm text-gray-600 dark:text-gray-400">
            为您提供每日星座运势指导
          </p>
        </div>

        {/* 星座选择器 - 采用3行4列网格布局 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 horoscope-subtitle">
            选择星座查看运势
          </label>

          <div className="grid grid-cols-4 gap-3 mb-2">
            {getHoroscopeData() && Array.isArray(getHoroscopeData()) ? getHoroscopeData().map((horoscope, index) => {
              const isActive = userHoroscope === horoscope.name;
              // 为了更好地实现3行4列布局，我们需要对12个星座进行合理排列
              return (
                <button
                  key={horoscope.name}
                  onClick={() => handleHoroscopeChange(horoscope.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-2xl mb-1">{horoscope.icon}</span>
                  <span className="text-xs font-bold horoscope-subtitle">{horoscope.name.replace('座', '')}</span>
                </button>
              );
            }) : null}
          </div>
        </div>

        {/* 临时查看提示 */}
        {isTemporaryHoroscope && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2 text-lg">⚠️</span>
                <span className="text-yellow-700 dark:text-yellow-300 text-sm horoscope-subtitle">
                  临时查看 {userHoroscope} 的运势
                </span>
              </div>
              <button
                onClick={handleRestoreUserHoroscope}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 whitespace-nowrap"
                style={{ touchAction: 'manipulation' }}
              >
                恢复我的星座
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4">
      {/* 星座选择器 - 嵌入页面内容 */}
      {renderHoroscopeSelector()}

      {/* 内容区域 */}
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="space-y-5">
            {/* 优化的加载状态 - 骨架屏 */}
            {loading && (
              <div className="space-y-5">
                {/* 综合分数骨架屏 */}
                <div className="horoscope-score-container rounded-xl p-5 text-white shadow bg-gradient-to-r from-purple-600/20 to-indigo-700/20 dark:from-purple-800/20 dark:to-indigo-900/20">
                  <div className="text-center mb-4">
                    <div className="h-5 bg-white/20 rounded w-32 mx-auto mb-3 animate-pulse"></div>
                    <div className="h-14 w-24 bg-white/20 rounded mx-auto mb-3 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded w-40 mx-auto animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-8 w-8 bg-white/20 rounded-full mx-auto mb-2 animate-pulse"></div>
                        <div className="h-8 w-10 bg-white/20 rounded mx-auto mb-2 animate-pulse"></div>
                        <div className="h-3 w-12 bg-white/10 rounded mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 运势描述骨架屏 */}
                <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>

                {/* 建议骨架屏 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-4 w-12 bg-green-200 dark:bg-green-800 rounded mb-3 animate-pulse"></div>
                    <div className="h-12 bg-green-100 dark:bg-green-900/50 rounded animate-pulse"></div>
                  </div>
                  <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-4 w-12 bg-red-200 dark:bg-red-800 rounded mb-3 animate-pulse"></div>
                    <div className="h-12 bg-red-100 dark:bg-red-900/50 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误显示 */}
            {error && (
              <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-red-500 dark:border-red-600 border-gray-200 dark:border-gray-700">
                <p className="horoscope-subtitle text-red-700 dark:text-red-300 text-base text-center">{error}</p>
              </div>
            )}

            {/* 运势内容 */}
            {!loading && !error && horoscopeGuidance && userHoroscope ? (
              renderHoroscopeCard()
            ) : !loading && !error && !userHoroscope ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-3 opacity-50">🔮</div>
                <h3 className="horoscope-title text-gray-700 dark:text-gray-300 mb-3 text-lg font-bold">
                  请选择您的星座
                </h3>
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-base">
                  点击上方星座按钮，查看您的每日运势
                </p>
              </div>
            ) : null}

            {/* 底部信息 */}
            {!loading && !error && horoscopeGuidance && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm text-center">
                  数据更新时间：{new Date().toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">
                  星座运势仅供参考，请理性看待
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeTab;