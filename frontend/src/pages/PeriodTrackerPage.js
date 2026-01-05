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

// 日历视图组件（优化版，参考 MayaCalendarLitePage.js）
const CalendarView = ({ prediction, cycleData, onDateSelect, onRecordPeriod, theme }) => {
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
    const dates = [];

    // 添加上个月的最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const d = new Date(prevYear, prevMonth, prevMonthLastDay - i);
      dates.push({
        date: d,
        isCurrentMonth: false,
        dayOfWeek: d.getDay()
      });
    }

    // 添加当前月的所有天
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      dates.push({
        date: d,
        isCurrentMonth: true,
        dayOfWeek: d.getDay(),
        isToday: d.toDateString() === new Date().toDateString(),
        isPredictedPeriod: prediction && (
          d >= prediction.nextPeriodStart && d <= prediction.nextPeriodEnd
        ),
        isOvulation: prediction && d >= prediction.ovulationStart && d <= prediction.ovulationEnd,
        isFertile: prediction && d >= prediction.fertileWindowStart && d <= prediction.fertileWindowEnd,
        isPMS: prediction && d >= prediction.pmsStart && d < prediction.nextPeriod
      });
    }

    // 添加下个月的前几天
    const remainingDays = 42 - dates.length; // 6行 * 7天 = 42天
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const d = new Date(nextYear, nextMonth, i);
      dates.push({
        date: d,
        isCurrentMonth: false,
        dayOfWeek: d.getDay()
      });
    }

    return dates;
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

  const handleDayClick = (day) => {
    if (day.isCurrentMonth && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
      borderRadius: '8px',
      border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* 月份导航 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        marginBottom: '8px'
      }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            padding: '4px 12px',
            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '4px',
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#1f2937',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          &lt;
        </button>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme === 'dark' ? '#fff' : '#1f2937'
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button
          onClick={goToNextMonth}
          style={{
            padding: '4px 12px',
            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '4px',
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#1f2937',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          &gt;
        </button>
      </div>

      {/* 星期标题 */}
      <ol style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        padding: '4px 0',
        margin: '0',
        listStyle: 'none',
        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
      }}>
        {dayNames.map((day, index) => (
          <li key={day} style={{
            textAlign: 'center',
            fontSize: '10px',
            color: index === 0 ? '#ef4444' : index === 6 ? '#3b82f6' : theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: '4px 0'
          }}>
            {day}
          </li>
        ))}
      </ol>

      {/* 日历网格 */}
      <ol style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        padding: '0',
        margin: '0',
        listStyle: 'none',
        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
      }}>
        {monthData.map((day, index) => {
          let indicator = null;

          if (day.isPredictedPeriod && day.isCurrentMonth) {
            indicator = <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#ec4899',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '2px'
            }}></span>;
          } else if (day.isOvulation && day.isCurrentMonth) {
            indicator = <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#eab308',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '2px'
            }}></span>;
          } else if (day.isFertile && day.isCurrentMonth) {
            indicator = <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#a855f7',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '2px'
            }}></span>;
          }

          return (
            <li
              key={index}
              onClick={() => handleDayClick(day)}
              style={{
                backgroundColor: day.isToday
                  ? '#ec4899'
                  : (theme === 'dark' ? '#1f2937' : '#fff'),
                padding: '0',
                position: 'relative',
                cursor: 'pointer',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '4px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: day.isToday ? 'bold' : 'normal',
                  color: !day.isCurrentMonth
                    ? (theme === 'dark' ? '#4b5563' : '#9ca3af')
                    : day.isToday
                    ? '#fff'
                    : (theme === 'dark' ? '#fff' : '#1f2937')
                }}>
                  {day.date.getDate()}
                </span>
                {indicator}
              </div>
            </li>
          );
        })}
      </ol>

      {/* 图例 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px',
        borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#ec4899',
            borderRadius: '50%',
            marginRight: '4px'
          }}></div>
          <span style={{
            fontSize: '11px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>经期</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#eab308',
            borderRadius: '50%',
            marginRight: '4px'
          }}></div>
          <span style={{
            fontSize: '11px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>排卵期</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#a855f7',
            borderRadius: '50%',
            marginRight: '4px'
          }}></div>
          <span style={{
            fontSize: '11px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>受孕期</span>
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
    <div style={{
      minHeight: '100vh',
      paddingBottom: '128px',
      padding: '0 16px',
      backgroundColor: theme === 'dark' ? '#111827' : '#fdf2f8'
    }}>
      {/* 导航标题栏 - 优化版 */}
      <div style={{
        background: 'linear-gradient(to right, rgba(236, 72, 153, 0.9), rgba(225, 29, 72, 0.9))',
        color: '#fff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(8px)',
        margin: '0 -16px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '12px 16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '6px',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)'
              }}>
                <span style={{ fontSize: '20px' }}>🌺</span>
              </div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px',
                margin: 0
              }}>
                经期助手
              </h1>
            </div>

            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <span>✏️ 今日</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* 当前周期阶段卡片 */}
        {currentPhase && (
          <div style={{
            background: 'linear-gradient(135deg, #ec4899, #e11d48)',
            color: '#fff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  当前阶段
                </h2>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {phaseNames[currentPhase]}
                </div>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.2 }}>🌸</div>
            </div>

            {/* 周期阶段指示条 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: currentPhase === 'menstrual' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  width: '18%'
                }}
              ></div>
              <div
                style={{
                  height: '100%',
                  backgroundColor: currentPhase === 'follicular' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  width: '32%'
                }}
              ></div>
              <div
                style={{
                  height: '100%',
                  backgroundColor: currentPhase === 'ovulation' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  width: '32%'
                }}
              ></div>
              <div
                style={{
                  height: '100%',
                  backgroundColor: currentPhase === 'luteal' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  width: '18%'
                }}
              ></div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginTop: '8px',
              opacity: 0.9
            }}>
              <span>月经期</span>
              <span>卵泡期</span>
              <span>排卵期</span>
              <span>黄体期</span>
            </div>
          </div>
        )}

        {/* 今日状态卡片 - 优化为2个一行 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 第一行：今日状态 + 排卵期 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '8px',
              padding: '16px',
              border: isTodayInPredictedPeriod ? '2px solid #ec4899' : `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                marginBottom: '4px'
              }}>今日状态</div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ec4899'
              }}>
                {isTodayInPredictedPeriod ? '经期' : '非经期'}
              </div>
            </div>
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '8px',
              padding: '16px',
              border: isTodayInOvulation ? '2px solid #eab308' : `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌸</div>
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                marginBottom: '4px'
              }}>排卵期</div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#eab308'
              }}>
                {isTodayInOvulation ? '是' : '否'}
              </div>
            </div>
          </div>

          {/* 第二行：受孕期 + 下次经期 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '8px',
              padding: '16px',
              border: isTodayInFertile ? '2px solid #a855f7' : `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💫</div>
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                marginBottom: '4px'
              }}>受孕期</div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#a855f7'
              }}>
                {isTodayInFertile ? '是' : '否'}
              </div>
            </div>
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                marginBottom: '4px'
              }}>下次经期</div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme === 'dark' ? '#fff' : '#1f2937'
              }}>
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
          theme={theme}
        />

        {/* 趋势图 */}
        <TrendChart
          prediction={cyclePrediction}
          cycleData={cycleData}
        />

        {/* 健康建议 */}
        {currentPhase && (
          <div style={{
            background: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(252, 231, 243, 1)',
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${theme === 'dark' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(251, 207, 232, 1)'}`
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              margin: '0 0 12px 0'
            }}>
              健康建议
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {getHealthAdvice(currentPhase).map((advice, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>💡</span>
                  <p style={{
                    margin: 0,
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    fontSize: '13px'
                  }}>
                    {advice}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 周期设置 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#fff' : '#1f2937',
            margin: '0 0 12px 0'
          }}>
            周期设置
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                color: theme === 'dark' ? '#d1d5db' : '#374151'
              }}>
                平均周期天数
              </label>
              <input
                type="number"
                value={cycleData.averageCycle}
                onChange={(e) => setCycleData({ ...cycleData, averageCycle: parseInt(e.target.value) || 28 })}
                min="20"
                max="45"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '6px',
                color: theme === 'dark' ? '#d1d5db' : '#374151'
              }}>
                经期持续天数
              </label>
              <input
                type="number"
                value={cycleData.periodLength}
                onChange={(e) => setCycleData({ ...cycleData, periodLength: parseInt(e.target.value) || 5 })}
                min="2"
                max="10"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          <button
            onClick={handleUpdateSettings}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #ec4899, #e11d48)',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            保存设置
          </button>
        </div>

        {/* 历史记录 */}
        {periodHistory.length > 0 && (
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              margin: '0 0 12px 0'
            }}>
              历史记录
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '240px',
              overflowY: 'auto'
            }}>
              {periodHistory.slice(-10).reverse().map((record, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : '#f9fafb',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ec4899',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></div>
                    <span style={{
                      color: theme === 'dark' ? '#fff' : '#1f2937',
                      fontSize: '13px'
                    }}>
                      {record.date}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}>
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }} onClick={() => setSelectedDate(null)}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '24px',
            maxWidth: '400px',
            width: 'calc(100% - 32px)',
            margin: '0 16px'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              margin: '0 0 16px 0'
            }}>
              记录经期
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '6px',
                color: theme === 'dark' ? '#d1d5db' : '#374151'
              }}>
                选择日期
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleRecordPeriod}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ec4899',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
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
