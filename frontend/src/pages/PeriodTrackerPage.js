/**
 * 经期助手模块页面 - 优化版
 * 实现月经周期追踪、日历记录和趋势图
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

// 经期数据类型
const PERIOD_DATA_KEY = 'period_tracker_data';

// 经期阶段颜色定义
const PHASE_COLORS = {
  menstrual: '#FF6B9D',     // 经期 - 粉红色
  follicular: '#9333EA',    // 卵泡期 - 蓝紫色
  ovulation: '#FBBF24',     // 排卵期 - 金黄色
  luteal: '#F97316'        // 黄体期 - 橙色
};

// 计算经期周期（增强版）
const calculatePeriodCycle = (lastPeriod, averageCycle, periodLength) => {
  const last = new Date(lastPeriod);
  const next = new Date(last);
  next.setDate(next.getDate() + averageCycle);

  // 计算排卵期（下次月经前14天）
  const ovulation = new Date(next);
  ovulation.setDate(ovulation.getDate() - 14);

  // 计算排卵期范围（排卵期前后各4天，共9天）
  const ovulationStart = new Date(ovulation);
  ovulationStart.setDate(ovulationStart.getDate() - 4);
  const ovulationEnd = new Date(ovulation);
  ovulationEnd.setDate(ovulationEnd.getDate() + 4);

  // 计算经期范围（月经期持续天数）
  const periodStart = new Date(next);
  periodStart.setDate(periodStart.getDate() - periodLength);
  const periodEnd = new Date(next);

  // 计算经前症状期（下次月经前7天）
  const pmsStart = new Date(next);
  pmsStart.setDate(pmsStart.getDate() - 7);

  // 计算受孕窗口（排卵期前后各2天）
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 2);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 2);

  return {
    nextPeriod: next,
    nextPeriodStart: periodStart,
    nextPeriodEnd: periodEnd,
    ovulation,
    ovulationStart,
    ovulationEnd,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    pmsStart,
    daysUntilNext: Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24))
  };
};

// 生成健康建议
const getHealthAdvice = (phase) => {
  const advice = {
    menstrual: [
      '注意保暖，避免受凉',
      '饮食清淡，多喝温水',
      '避免剧烈运动，适度休息',
      '保持心情愉悦，避免情绪波动'
    ],
    follicular: [
      '适合开始新的饮食计划',
      '适合学习和工作安排',
      '可以适当增加运动量',
      '保持规律作息'
    ],
    ovulation: [
      '是受孕的最佳时机',
      '皮肤状态最佳',
      '体能达到峰值',
      '注意防晒和护肤'
    ],
    luteal: [
      '可能会出现经前症状',
      '避免熬夜和过度劳累',
      '控制情绪，保持平和心态',
      '适当减少盐分摄入'
    ]
  };
  return advice[phase] || [];
};

// 日历视图组件
const CalendarView = ({ prediction, cycleData, onDateSelect, onRecordPeriod }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取月份数据
  const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取月份第一天是星期几（0-6，0是周日）
    const firstDayOfWeek = firstDay.getDay();

    // 生成日历数据
    const days = [];

    // 添加上个月的最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    // 添加当前月的所有天
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toDateString() === new Date().toDateString(),
        isPredictedPeriod: prediction && (
          date >= prediction.nextPeriodStart && date <= prediction.nextPeriodEnd
        ),
        isOvulation: prediction && date >= prediction.ovulationStart && date <= prediction.ovulationEnd,
        isFertile: prediction && date >= prediction.fertileWindowStart && date <= prediction.fertileWindowEnd,
        isPMS: prediction && date >= prediction.pmsStart && date < prediction.nextPeriod
      });
    }

    // 添加下个月的前几天
    const nextMonthDays = 42 - days.length; // 6行 * 7天 = 42天
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    return days;
  };

  const monthData = getMonthData(currentDate);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // 月份导航
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (onDateSelect) onDateSelect(today);
  };

  const handleDayClick = (day) => {
    if (day.isCurrentMonth && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 w-full max-w-full overflow-hidden">
      {/* 日历头部 - 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
          >
            今天
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期头部 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center py-2 text-sm font-medium ${index === 0 ? 'text-red-500 dark:text-red-400' :
              index === 6 ? 'text-blue-500 dark:text-blue-400' :
                'text-gray-500 dark:text-gray-400'
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.map((day, index) => {
          let bgClass = '';
          let indicator = null;

          if (day.isPredictedPeriod) {
            bgClass = 'bg-pink-100 dark:bg-pink-900/30';
          } else if (day.isOvulation) {
            bgClass = 'bg-yellow-100 dark:bg-yellow-900/30';
          } else if (day.isFertile) {
            bgClass = 'bg-purple-100 dark:bg-purple-900/30';
          } else if (day.isPMS) {
            bgClass = 'bg-orange-100 dark:bg-orange-900/30';
          }

          // 日期指示器
          if (day.isPredictedPeriod) {
            indicator = <div className="w-2 h-2 rounded-full bg-pink-500 absolute bottom-1 right-1" title="预测经期"></div>;
          } else if (day.isOvulation) {
            indicator = <div className="w-2 h-2 rounded-full bg-yellow-500 absolute bottom-1 right-1" title="排卵期"></div>;
          } else if (day.isFertile) {
            indicator = <div className="w-2 h-2 rounded-full bg-purple-500 absolute bottom-1 right-1" title="受孕期"></div>;
          }

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                relative min-h-20 p-1 rounded-lg cursor-pointer transition-colors w-full max-w-full overflow-hidden
                ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900' : ''}
                ${day.isToday ? 'bg-pink-200 dark:bg-pink-900/50' : ''}
                ${day.isWeekend && !bgClass ? 'bg-gray-50 dark:bg-gray-900' : ''}
                ${bgClass}
                hover:bg-pink-50 dark:hover:bg-pink-900/40
              `}
            >
              {/* 日期数字 */}
              <div className={`text-center text-sm ${day.isToday ? 'font-bold text-pink-600 dark:text-pink-400' : ''
                }`}>
                {day.date.getDate()}
              </div>

              {/* 预测指示器 */}
              {indicator}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-pink-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">经期</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">排卵期</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">受孕期</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">经前症状期</span>
        </div>
      </div>
    </div>
  );
};

// 趋势图组件（简化版，不依赖 Chart.js）
const TrendChart = ({ prediction, cycleData }) => {
  if (!prediction || !cycleData) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">暂无预测数据可用于生成趋势图</p>
      </div>
    );
  }

  // 生成未来90天的趋势数据
  const generateTrendData = () => {
    const dates = [];
    const emotional = [];
    const physical = [];
    const intellectual = [];

    const cycleLength = cycleData.averageCycle || 28;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 从30天前开始

    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      dates.push(currentDate.toLocaleDateString('zh-CN'));

      // 计算相对于周期开始的天数
      const cycleDay = ((i + 30) % cycleLength) + 1;

      // 基于周期阶段计算生理状态值
      let emoValue, physValue, intelValue;
      const periodLength = cycleData.periodLength || 5;

      if (cycleDay <= periodLength) {
        // 经期
        emoValue = 30 + (cycleDay * 3);
        physValue = 20 + (cycleDay * 2);
        intelValue = 40 + (cycleDay * 2);
      } else if (cycleDay <= cycleLength + 7) {
        // 卵泡期
        const follicularDay = cycleDay - periodLength;
        emoValue = 50 + (follicularDay * 4);
        physValue = 35 + (follicularDay * 3);
        intelValue = 55 + (follicularDay * 3);
      } else if (cycleDay <= cycleLength + 15) {
        // 排卵期
        const ovulationDay = cycleDay - periodLength - 7;
        emoValue = 85 + (ovulationDay * 3);
        physValue = 75 + (ovulationDay * 2);
        intelValue = 80 + (ovulationDay * 3);
      } else {
        // 黄体期
        const lutealDay = cycleDay - periodLength - 15;
        emoValue = 80 - (lutealDay * 2);
        physValue = 70 - (lutealDay * 1.5);
        intelValue = 75 - (lutealDay * 2);
      }

      emotional.push(Math.round(emoValue));
      physical.push(Math.round(physValue));
      intellectual.push(Math.round(intelValue));
    }

    return { dates, emotional, physical, intellectual };
  };

  const trendData = generateTrendData();

  // 简化的SVG图表绘制
  const renderChart = () => {
    const width = 100;
    const height = 40;
    const padding = { top: 5, right: 5, bottom: 10, left: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xScale = (index) => (index / (trendData.dates.length - 1)) * chartWidth;
    const yScale = (value) => chartHeight - ((value - 20) / 80) * chartHeight;

    // 生成路径
    const emotionPath = trendData.emotional.map((value, i) => {
      const x = padding.left + xScale(i);
      const y = padding.top + yScale(value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const physicalPath = trendData.physical.map((value, i) => {
      const x = padding.left + xScale(i);
      const y = padding.top + yScale(value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const intellectualPath = trendData.intellectual.map((value, i) => {
      const x = padding.left + xScale(i);
      const y = padding.top + yScale(value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height * 10} viewBox={`0 0 ${width} ${height}`} className="mt-4">
        {/* 坐标轴 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#9ca3af"
          strokeWidth="0.5"
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#9ca3af"
          strokeWidth="0.5"
        />

        {/* Y轴标签 */}
        <text x={padding.left - 2} y={padding.top + 5} fill="#6b7280" fontSize="2">100</text>
        <text x={padding.left - 2} y={padding.top + chartHeight / 2 + 5} fill="#6b7280" fontSize="2">60</text>
        <text x={padding.left - 2} y={padding.top + chartHeight + 5} fill="#6b7280" fontSize="2">20</text>

        {/* 曲线 */}
        <path d={emotionPath} fill="none" stroke={PHASE_COLORS.menstrual} strokeWidth="2" />
        <path d={physicalPath} fill="none" stroke={PHASE_COLORS.follicular} strokeWidth="2" />
        <path d={intellectualPath} fill="none" stroke={PHASE_COLORS.ovulation} strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        近期生理状态趋势
      </h3>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS.menstrual }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">情绪状态</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS.follicular }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">体力状态</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: PHASE_COLORS.ovulation }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">智力状态</span>
        </div>
      </div>
      {renderChart()}
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-4">
        基于您的周期预测未来90天的生理状态变化趋势
      </div>
    </div>
  );
};

const PeriodTrackerPage = () => {
  const { theme } = useTheme();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState({
    lastPeriod: null,
    averageCycle: 28,
    periodLength: 5
  });
  const [periodHistory, setPeriodHistory] = useState([]);
  const [cyclePrediction, setCyclePrediction] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 初始化
  useEffect(() => {
    loadData();
  }, []);

  // 加载数据
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(PERIOD_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setCycleData(data);
        setPeriodHistory(data.history || []);

        // 计算周期预测
        if (data.lastPeriod && data.averageCycle) {
          const prediction = calculatePeriodCycle(data.lastPeriod, data.averageCycle, data.periodLength);
          setCyclePrediction(prediction);
          determineCurrentPhase(prediction);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoading(false);
    }
  }, []);

  // 确定当前周期阶段
  const determineCurrentPhase = (prediction) => {
    const now = new Date();
    const lastPeriod = new Date(cycleData.lastPeriod);

    // 计算周期天数
    const daysIntoCycle = Math.ceil((now - lastPeriod) / (1000 * 60 * 60 * 24));

    if (daysIntoCycle < cycleData.periodLength) {
      setCurrentPhase('menstrual');
    } else if (daysIntoCycle < (prediction.ovulation - lastPeriod)) {
      setCurrentPhase('follicular');
    } else if (daysIntoCycle < (prediction.pmsStart - lastPeriod)) {
      setCurrentPhase('ovulation');
    } else {
      setCurrentPhase('luteal');
    }
  };

  // 保存数据
  const saveData = (newData) => {
    const dataToSave = {
      ...newData,
      history: [...periodHistory, {
        date: new Date().toISOString().split('T')[0],
        averageCycle: newData.averageCycle,
        periodLength: newData.periodLength
      }]
    };

    localStorage.setItem(PERIOD_DATA_KEY, JSON.stringify(dataToSave));
    setCycleData(newData);
    setPeriodHistory(dataToSave.history);

    // 重新计算预测
    if (newData.lastPeriod && newData.averageCycle) {
      const prediction = calculatePeriodCycle(newData.lastPeriod, newData.averageCycle, newData.periodLength);
      setCyclePrediction(prediction);
      determineCurrentPhase(prediction);
    }
  };

  // 记录经期
  const handleRecordPeriod = () => {
    const newCycleData = {
      ...cycleData,
      lastPeriod: selectedDate.toISOString().split('T')[0]
    };
    saveData(newCycleData);
    alert('记录成功！');
  };

  // 更新周期设置
  const handleUpdateSettings = () => {
    saveData(cycleData);
    alert('设置已保存');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const phaseNames = {
    menstrual: '月经期',
    follicular: '卵泡期',
    ovulation: '排卵期',
    luteal: '黄体期'
  };

  const today = new Date();
  const isTodayInPredictedPeriod = cyclePrediction &&
    today >= cyclePrediction.nextPeriodStart && today <= cyclePrediction.nextPeriodEnd;
  const isTodayInOvulation = cyclePrediction &&
    today >= cyclePrediction.ovulationStart && today <= cyclePrediction.ovulationEnd;
  const isTodayInFertile = cyclePrediction &&
    today >= cyclePrediction.fertileWindowStart && today <= cyclePrediction.fertileWindowEnd;

  return (
    <div className={`period-tracker-page min-h-screen pb-32 px-4 md:px-6 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-gray-900 dark:via-pink-900/30 dark:to-red-900/30 ${theme}`}>
      {/* 导航标题栏 - 优化版 */}
      <div className="bg-gradient-to-r from-pink-500/90 to-rose-600/90 text-white shadow-lg sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-1 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-xl md:text-2xl">🌺</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold whitespace-nowrap tracking-wide text-shadow-sm">
                经期助手
              </h1>
            </div>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 
                border border-white/20 rounded-full transition-all duration-300 shadow-sm hover:shadow-md
                text-sm font-medium whitespace-nowrap overflow-hidden min-w-[80px] max-w-[100px]"
            >
              <span className="relative z-10 flex items-center gap-1">
                <span className="text-base">✏️</span>
                <span className="hidden md:inline">记录今日</span>
                <span className="md:hidden">今日</span>
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-1 py-6 max-w-4xl space-y-6">
        {/* 当前周期阶段卡片 */}
        {currentPhase && (
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">当前阶段</h2>
                <div className="text-4xl font-bold">{phaseNames[currentPhase]}</div>
              </div>
              <div className="text-6xl md:text-8xl opacity-20">🌸</div>
            </div>

            {/* 周期阶段指示条 */}
            <div className="flex justify-between items-center h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${currentPhase === 'menstrual' ? 'bg-white' : 'bg-white/50'}`}
                style={{ width: '18%' }}
              ></div>
              <div
                className={`h-full ${currentPhase === 'follicular' ? 'bg-white' : 'bg-white/50'}`}
                style={{ width: '32%' }}
              ></div>
              <div
                className={`h-full ${currentPhase === 'ovulation' ? 'bg-white' : 'bg-white/50'}`}
                style={{ width: '32%' }}
              ></div>
              <div
                className={`h-full ${currentPhase === 'luteal' ? 'bg-white' : 'bg-white/50'}`}
                style={{ width: '18%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2 opacity-90">
              <span>月经期</span>
              <span>卵泡期</span>
              <span>排卵期</span>
              <span>黄体期</span>
            </div>
          </div>
        )}

        {/* 今日状态卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ${isTodayInPredictedPeriod ? 'border-2 border-pink-500' : 'border border-gray-200 dark:border-gray-700'}`}>
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">今日状态</div>
              <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                {isTodayInPredictedPeriod ? '经期' : '非经期'}
              </div>
            </div>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ${isTodayInOvulation ? 'border-2 border-yellow-500' : 'border border-gray-200 dark:border-gray-700'}`}>
            <div className="text-center">
              <div className="text-3xl mb-2">🌸</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">排卵期</div>
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {isTodayInOvulation ? '是' : '否'}
              </div>
            </div>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ${isTodayInFertile ? 'border-2 border-purple-500' : 'border border-gray-200 dark:border-gray-700'}`}>
            <div className="text-center">
              <div className="text-3xl mb-2">💫</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">受孕期</div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {isTodayInFertile ? '是' : '否'}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">下次经期</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {cyclePrediction ? cyclePrediction.daysUntilNext : '-'} 天
              </div>
            </div>
          </div>
        </div>

        {/* 日历记录视图 */}
        <CalendarView
          prediction={cyclePrediction}
          cycleData={cycleData}
          onDateSelect={setSelectedDate}
          onRecordPeriod={handleRecordPeriod}
        />

        {/* 趋势图 */}
        <TrendChart
          prediction={cyclePrediction}
          cycleData={cycleData}
        />

        {/* 健康建议 */}
        {currentPhase && (
          <div className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 md:p-6 border border-pink-200 dark:border-pink-800">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              健康建议
            </h3>
            <ul className="space-y-3">
              {getHealthAdvice(currentPhase).map((advice, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <p className="text-gray-700 dark:text-gray-300">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 周期设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            周期设置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                平均周期天数
              </label>
              <input
                type="number"
                value={cycleData.averageCycle}
                onChange={(e) => setCycleData({ ...cycleData, averageCycle: parseInt(e.target.value) || 28 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700"
                min="20"
                max="45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                经期持续天数
              </label>
              <input
                type="number"
                value={cycleData.periodLength}
                onChange={(e) => setCycleData({ ...cycleData, periodLength: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700"
                min="2"
                max="10"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateSettings}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            保存设置
          </button>
        </div>

        {/* 历史记录 */}
        {periodHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              历史记录
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {periodHistory.slice(-10).reverse().map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-3"></div>
                    <span className="text-gray-800 dark:text-white">{record.date}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    周期: {record.averageCycle}天，经期: {record.periodLength}天
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 记录经期弹窗 */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">记录经期</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择日期
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleRecordPeriod}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodTrackerPage;
