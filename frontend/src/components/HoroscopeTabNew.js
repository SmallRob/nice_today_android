import { useState, useEffect, useCallback } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import * as horoscopeAlgorithm from '../utils/horoscopeAlgorithm';
import '../styles/mobileOptimization.css';
import '../styles/animations.css';
import '../styles/config-selectors.css';
import { Line } from 'react-chartjs-2';
import CompatibilityDisplay from './CompatibilityDisplay';
import ZodiacTraitsDisplay from './ZodiacTraitsDisplay';
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

// 导入星座算法函数
const {
  HOROSCOPE_DATA_ENHANCED,
  generateDailyHoroscope
} = horoscopeAlgorithm;

// 获取星座数据的辅助函数
const getHoroscopeData = () => HOROSCOPE_DATA_ENHANCED;

/**
 * 星座运势主组件
 * 提供星座选择、日期查询、运势展示等功能
 */
const HoroscopeTab = () => {
  // ============ 状态管理 ============
  const [userHoroscope, setUserHoroscope] = useState('');
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isTemporaryHoroscope, setIsTemporaryHoroscope] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    // 初始化为今天的午夜时间（去除时分秒）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // ============ 获取用户星座 ============
  const getUserZodiac = useCallback(() => {
    try {
      const config = userConfigManager.getCurrentConfig();
      return config?.zodiac || '';
    } catch (error) {
      console.log('获取用户星座失败:', error);
      return '';
    }
  }, []);

  // ============ 加载运势数据 ============
  const loadHoroscopeData = useCallback((horoscope, date) => {
    if (!horoscope) return;

    setLoading(true);
    setError(null);

    try {
      // 调用算法生成运势数据
      const data = generateDailyHoroscope(horoscope, date);

      if (!data) {
        throw new Error('无法生成运势数据');
      }

      setHoroscopeGuidance(data);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ 初始化组件 ============
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // 初始化用户配置管理器
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }

        // 获取用户配置的星座
        const userZodiac = getUserZodiac();

        // 如果用户有配置星座则使用，否则默认使用白羊座
        const initialHoroscope = userZodiac || '白羊座';

        if (isMounted) {
          setUserHoroscope(initialHoroscope);
          setIsTemporaryHoroscope(!userZodiac);
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化星座运势组件失败:', error);
        if (isMounted) {
          setUserHoroscope('白羊座');
          setIsTemporaryHoroscope(true);
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [getUserZodiac]);

  // ============ 加载运势数据（当星座或日期变化时） ============
  useEffect(() => {
    if (!userHoroscope || !initialized) return;

    loadHoroscopeData(userHoroscope, selectedDate);
  }, [userHoroscope, selectedDate, initialized, loadHoroscopeData]);

  // ============ 处理星座选择 ============
  const handleHoroscopeChange = useCallback((horoscope) => {
    if (userHoroscope === horoscope) return;

    setUserHoroscope(horoscope);
    setIsTemporaryHoroscope(horoscope !== getUserZodiac());
    setHoroscopeGuidance(null);
    setError(null);
  }, [userHoroscope, getUserZodiac]);

  // ============ 恢复用户配置的星座 ============
  const handleRestoreUserHoroscope = useCallback(() => {
    const userZodiac = getUserZodiac();
    if (userZodiac && userZodiac !== userHoroscope) {
      setUserHoroscope(userZodiac);
      setIsTemporaryHoroscope(false);
    }
  }, [userHoroscope, getUserZodiac]);

  // ============ 处理日期变化 ============
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    setHoroscopeGuidance(null);
    setError(null);
  }, []);

  // ============ 渲染趋势图表 ============
  const renderTrendChart = () => {
    if (!userHoroscope || !horoscopeGuidance) return null;

    // 生成过去7天的运势数据
    const labels = [];
    const loveData = [];
    const wealthData = [];
    const careerData = [];

    const baseDate = selectedDate;
    for (let i = 6; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

      // 生成当天运势数据
      const dayData = generateDailyHoroscope(userHoroscope, date);
      if (dayData && dayData.dailyForecast) {
        loveData.push(dayData.dailyForecast.love?.score || 70);
        wealthData.push(dayData.dailyForecast.wealth?.score || 70);
        careerData.push(dayData.dailyForecast.career?.score || 70);
      } else {
        loveData.push(70);
        wealthData.push(70);
        careerData.push(70);
      }
    }

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
          ticks: { stepSize: 20, font: { size: 10 } },
          grid: { display: false }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    };

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          近期能量趋势
        </h3>
        <div style={{ height: '200px' }}>
          <Line data={chartData} options={options} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">展示过去7天的运势波动情况</p>
      </div>
    );
  };

  // ============ 判断是否今天 ============
  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return today.getTime() === compareDate.getTime();
  };

  // ============ 渲染组件 ============
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6 text-white text-center shadow-sm">
        <h1 className="text-2xl font-bold mb-1">星座运势</h1>
        <p className="text-sm opacity-90">星象指引 · 命运解读</p>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-4 max-w-2xl">

        {/* 日期选择器 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📅</span> 选择日期
          </h3>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleDateChange(new Date())}
            className="mt-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            今天
          </button>
        </div>

        {/* 星座选择器 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">✨</span> 选择星座
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {getHoroscopeData().map((horoscope) => {
              const isActive = userHoroscope === horoscope.name;
              return (
                <button
                  key={horoscope.name}
                  onClick={() => handleHoroscopeChange(horoscope.name)}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center transition-colors ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{horoscope.icon}</span>
                  <span className="text-[10px] mt-1 font-medium">
                    {horoscope.name.replace('座', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 临时星座提示 */}
          {isTemporaryHoroscope && (
            <div className="mt-3 text-center">
              <button
                onClick={handleRestoreUserHoroscope}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                返回我的默认配置
              </button>
            </div>
          )}
        </div>

        {/* 速配星座 */}
        {!loading && !error && userHoroscope && (
          <CompatibilityDisplay currentHoroscope={userHoroscope} />
        )}

        {/* 今日运势深度解读 */}
        {!loading && !error && horoscopeGuidance && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800 mb-4">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
              {isToday(selectedDate) ? '今日' : '当日'}能量
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              "{horoscopeGuidance.overallDescription}"
            </p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400 mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* 加载中骨架屏 */}
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        )}

        {/* 运势卡片内容 */}
        {!loading && !error && horoscopeGuidance && (
          <div className="space-y-4">
            {/* 综合分数卡片 */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold opacity-80 uppercase">今日指数</h3>
                  <div className="text-3xl font-bold">{horoscopeGuidance.overallScore} <span className="text-sm font-normal opacity-70">pts</span></div>
                </div>
                <div className="text-3xl">{horoscopeGuidance.horoscopeInfo.icon}</div>
              </div>

              {/* 能量条 */}
              <div className="space-y-2">
                {['love', 'wealth', 'career', 'study', 'social'].map((key) => {
                  const item = horoscopeGuidance.dailyForecast[key];
                  const score = item?.score || 0;
                  const label = { love: '爱情', wealth: '财富', career: '事业', study: '学业', social: '人脉' }[key];
                  return (
                    <div key={key} className="flex items-center text-xs">
                      <span className="w-8 opacity-90">{label}</span>
                      <div className="flex-1 h-1.5 bg-black/20 rounded-full mx-2 overflow-hidden">
                        <div className="h-full bg-white/90 rounded-full" style={{ width: `${score}%` }}></div>
                      </div>
                      <span className="w-8 text-right font-bold">{score}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 趋势图表 */}
            {renderTrendChart()}

            {/* 宜忌建议 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                <h4 className="text-green-700 dark:text-green-400 font-bold text-xs mb-1">✅ 宜</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs">{String(horoscopeGuidance.recommendations.positiveAdvice || '保持积极')}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 border border-red-100 dark:border-red-800/30">
                <h4 className="text-red-700 dark:text-red-400 font-bold text-xs mb-1">❌ 忌</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs">{String(horoscopeGuidance.recommendations.avoidAdvice || '避免消极')}</p>
              </div>
            </div>

            {/* 幸运锦囊 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold mb-3">幸运锦囊</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">幸运色</div>
                  <div className="text-xs font-bold truncate">
                    {Array.isArray(horoscopeGuidance.recommendations.luckyColorNames)
                      ? horoscopeGuidance.recommendations.luckyColorNames[0]
                      : '红'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">幸运数</div>
                  <div className="text-xs font-bold">
                    {Array.isArray(horoscopeGuidance.recommendations.luckyNumbers)
                      ? horoscopeGuidance.recommendations.luckyNumbers.join('/')
                      : '7'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">幸运物</div>
                  <div className="text-xs font-bold truncate">
                    {String(horoscopeGuidance.recommendations.luckyItem || '护身符')}
                  </div>
                </div>
              </div>
            </div>

            {/* 心灵问答 */}
            {horoscopeGuidance.recommendations.soulQuestion && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">❓ 心灵启发</h3>
                <p className="text-gray-800 dark:text-gray-200 text-xs font-medium mb-2">
                  {String(horoscopeGuidance.recommendations.soulQuestion.question)}
                </p>
                <div className="text-blue-600 dark:text-blue-400 text-xs italic bg-white/50 dark:bg-black/20 p-2 rounded">
                  "{String(horoscopeGuidance.recommendations.soulQuestion.answer)}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* 星座综合特质展示 */}
        {!loading && !error && userHoroscope && (
          <ZodiacTraitsDisplay currentHoroscope={userHoroscope} />
        )}
      </div>
    </div>
  );
};

export default HoroscopeTab;
