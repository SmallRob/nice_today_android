import React from 'react';
import { MemoizedLineChart } from './ZodiacHoroscope';
import '../styles/horoscope.css';

// 星座选择器组件
export const HoroscopeSelector = ({ userHoroscope, isTemporaryHoroscope, handleHoroscopeChange, handleRestoreUserHoroscope, handleEditHoroscope, getHoroscopeData, configuredZodiac }) => {
  return (
    <div className="horoscope-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          星座选择
        </h3>
        {handleEditHoroscope && (
          <button
            onClick={handleEditHoroscope}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-all"
          >
            ✏️ 设置
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {configuredZodiac ? `当前星座：${configuredZodiac}` : '点击设置您的星座，获取每日运势指引'}
      </div>

      <div className="horoscope-grid-4 mb-2">
        {getHoroscopeData() && Array.isArray(getHoroscopeData()) ? getHoroscopeData().map((horoscope) => {
          const isActive = userHoroscope === horoscope.name;
          return (
            <button
              key={horoscope.name}
              onClick={() => handleHoroscopeChange(horoscope.name)}
              className={`horoscope-button ${isActive ? 'horoscope-button-active' : 'horoscope-button-inactive'}`}
              aria-label={`${horoscope.name}星座选择`}
            >
              <span className="text-2xl mb-1">{horoscope.icon}</span>
              <span className="text-xs font-bold horoscope-subtitle">{horoscope.name.replace('座', '')}</span>
            </button>
          );
        }) : null}
      </div>

      {isTemporaryHoroscope && (
        <div className="mt-4 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2 text-sm">⚠️</span>
              <span className="text-yellow-700 dark:text-yellow-300 text-xs">
                临时查看 {userHoroscope} 的运势
              </span>
            </div>
            <button
              onClick={handleRestoreUserHoroscope}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 whitespace-nowrap"
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

// 趋势图表组件
export const TrendChart = ({ userHoroscope, generateDailyHoroscope }) => {
  if (!userHoroscope) return null;

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

      try {
        const dayData = generateDailyHoroscope(userHoroscope, date);
        if (dayData && dayData.dailyForecast) {
          const { love, wealth, career } = dayData.dailyForecast;
          loveData.push(love?.score || 70);
          wealthData.push(wealth?.score || 70);
          careerData.push(career?.score || 70);
        } else {
          loveData.push(70);
          wealthData.push(70);
          careerData.push(70);
        }
      } catch (error) {
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
    <div className="horoscope-card">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        近期能量趋势
      </h3>
      <div style={{ height: '200px' }}>
        <MemoizedLineChart data={chartData} options={options} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">展示过去7天的运势波动情况</p>
    </div>
  );
};

// 分数卡片组件
export const ScoreCard = ({ overallScore, scores, sortedScores }) => {
  return (
    <div className="horoscope-score-container">
      <div className="text-center mb-4">
        <h3 className="horoscope-title text-lg font-bold mb-1 opacity-90">今日运势指数</h3>
        <div className="text-5xl font-bold mb-2 drop-shadow-md">{overallScore}<span className="text-xl opacity-75 ml-1">分</span></div>
        <p className="horoscope-subtitle text-white/90 font-medium text-base">
          {overallScore > 75 ? '运势极佳' : overallScore > 60 ? '运势良好' : overallScore > 45 ? '运势平稳' : '运势一般'}
        </p>
      </div>

      <div className="horoscope-grid-4">
        {scores.map((item, index) => (
          <div key={index} className="text-center bg-white/15 dark:bg-white/10 rounded-xl p-2 backdrop-blur-sm border border-white/10">
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-lg font-bold">{item.score}</div>
            <div className="horoscope-subtitle text-xs opacity-80 mt-0.5">{item.name}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center items-center text-sm bg-black/20 dark:bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
        <span className="mr-2 font-medium opacity-90 text-sm">今日核心:</span>
        <span className="flex items-center font-bold text-yellow-300">
          <span className="mr-1 text-base">{sortedScores[0].icon}</span>
          <span className="text-sm">{sortedScores[0].name}运特别旺</span>
        </span>
      </div>
    </div>
  );
};

// 幸运物品网格组件
export const LuckyItemsGrid = ({ recommendations }) => {
  return (
    <div className="horoscope-card">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        今日幸运能量
      </h3>
      <div className="horoscope-grid-3">
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm mb-2"
            style={{ backgroundColor: (Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0] : '#FF6B6B' }}
          ></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运色</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
            {String((Array.isArray(recommendations.luckyColorNames) && recommendations.luckyColorNames[0]) ? recommendations.luckyColorNames[0] : '魅力红')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-2xl mb-2">💎</div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运配饰</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1 text-center truncate w-full">
            {String(recommendations.luckyAccessory || '宝石')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-2xl mb-2">🍱</div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运食物</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1 text-center truncate w-full">
            {String(recommendations.luckyFood || '美食')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-2xl mb-2">🔢</div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运数字</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
            {Array.isArray(recommendations.luckyNumbers) ? recommendations.luckyNumbers.join('/') : String(recommendations.luckyNumbers || '7')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-2xl mb-2">🕓</div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运时辰</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1 text-center whitespace-normal">
            {String(recommendations.luckyTime || '午后')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-2xl mb-2">🧭</div>
          <span className="text-xs text-gray-500 dark:text-gray-400">幸运方位</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
            {String(recommendations.luckyDirection || '东方')}
          </span>
        </div>
      </div>
    </div>
  );
};

// 骨架屏组件
export const SkeletonLoader = () => {
  return (
    <div className="space-y-5">
      <div className="horoscope-score-container rounded-xl p-5 text-white shadow bg-gradient-to-r from-purple-600/20 to-indigo-700/20 dark:from-purple-800/20 dark:to-indigo-900/20">
        <div className="text-center mb-4">
          <div className="h-5 horoscope-skeleton w-32 mx-auto mb-3"></div>
          <div className="h-14 w-24 horoscope-skeleton mx-auto mb-3"></div>
          <div className="h-4 horoscope-skeleton w-40 mx-auto"></div>
        </div>

        <div className="horoscope-grid-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-8 horoscope-skeleton rounded-full mx-auto mb-2"></div>
              <div className="h-8 w-10 horoscope-skeleton mx-auto mb-2"></div>
              <div className="h-3 w-12 horoscope-skeleton mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="horoscope-card rounded-xl p-4">
        <div className="h-5 w-20 horoscope-skeleton mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 horoscope-skeleton w-full"></div>
          <div className="h-4 horoscope-skeleton w-5/6"></div>
          <div className="h-4 horoscope-skeleton w-4/6"></div>
        </div>
      </div>

      <div className="horoscope-grid-2">
        <div className="horoscope-card rounded-xl p-4">
          <div className="h-4 w-12 horoscope-skeleton mb-3"></div>
          <div className="h-12 horoscope-skeleton"></div>
        </div>
        <div className="horoscope-card rounded-xl p-4">
          <div className="h-4 w-12 horoscope-skeleton mb-3"></div>
          <div className="h-12 horoscope-skeleton"></div>
        </div>
      </div>
    </div>
  );
};

// 错误显示组件
export const ErrorDisplay = ({ error }) => {
  return (
    <div className="horoscope-card">
      <div className="horoscope-error">
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    </div>
  );
};

// 空状态组件
export const EmptyState = () => {
  return (
    <div className="horoscope-card">
      <div className="text-center py-6">
        <div className="text-3xl mb-2">🔮</div>
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">请选择您的星座</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          选择您的星座，获取每日运势指引
        </p>
      </div>
    </div>
  );
};