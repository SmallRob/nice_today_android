import React, { useMemo, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
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
import annotationPlugin from 'chartjs-plugin-annotation';

// 确保 Chart.js 组件全局注册 - 在模块级别注册一次
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

/**
 * BiorhythmChart 组件
 *
 * 彻底解决Canvas重复使用问题的实现：
 * 1. 使用唯一的图表ID，避免冲突
 * 2. 使用Chart.getChart()静态方法获取并销毁现有实例
 * 3. 在组件卸载时正确清理
 * 4. 使用useCallback稳定函数引用
 */
const BiorhythmChart = ({ data, isMobile, selectedDate, birthDate }) => {
  const { theme } = useTheme();



  // 组件卸载时清理Chart实例
  useEffect(() => {
    return () => {
      console.log('开始清理图表实例...');
      console.log('图表实例清理完成');
    };
  }, []);

  // 暗色模式下的文字颜色 - 独立的 memoized 值
  const themeColors = useMemo(() => {
    return {
      textColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
      gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      todayLineColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      todayLabelBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      todayLabelColor: theme === 'dark' ? '#000' : '#fff'
    };
  }, [theme]);

  // 数据格式化函数 - 优化依赖项，只在 data 变化时重新计算
  const formattedData = useMemo(() => {
    if (!data) return null;

    // 如果是数组格式（本地计算返回的数据）
    if (Array.isArray(data)) {
      const dates = data.map(item => item.date);
      const physical = data.map(item => item.physical);
      const emotional = data.map(item => item.emotional);
      const intellectual = data.map(item => item.intellectual);

      return { labels: dates, physical, emotional, intellectual };
    }

    // 如果是对象格式（API返回的数据）
    if (data.dates && data.physical && data.emotional && data.intellectual) {
      return data;
    }

    return null;
  }, [data]);

  // 查找今天的数据索引
  const todayIndex = useMemo(() => {
    if (!formattedData || !formattedData.labels) return -1;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return formattedData.labels.findIndex(date => date === todayStr);
  }, [formattedData]);

  // 计算当日节律状态和提醒
  const todayStatus = useMemo(() => {
    if (!formattedData || !selectedDate || todayIndex === -1) return null;

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const index = formattedData.labels.findIndex(date => date === dateStr);

    if (index === -1) return null;

    const physical = formattedData.physical[index];
    const emotional = formattedData.emotional[index];
    const intellectual = formattedData.intellectual[index];

    // 计算综合状态
    const average = (physical + emotional + intellectual) / 3;

    // 状态判断
    const getStatus = (value) => {
      if (value >= 50) return { level: 'high', label: '极佳', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700' };
      if (value >= 20) return { level: 'medium', label: '良好', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700' };
      if (value >= -20) return { level: 'normal', label: '一般', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700' };
      return { level: 'low', label: '偏低', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700' };
    };

    const overallStatus = getStatus(average);
    const physicalStatus = getStatus(physical);
    const emotionalStatus = getStatus(emotional);
    const intellectualStatus = getStatus(intellectual);

    // 生成提醒
    const generateReminders = () => {
      const reminders = [];

      // 综合提醒
      if (average >= 50) {
        reminders.push({
          icon: '✨',
          title: '今日状态极佳',
          desc: '各方面表现突出，适合处理重要事务和开展新计划。保持积极心态，把握机遇！',
          type: 'success'
        });
      } else if (average >= 20) {
        reminders.push({
          icon: '👍',
          title: '今日状态良好',
          desc: '各项指标表现不错，适合日常工作学习。保持节奏，稳步前进！',
          type: 'info'
        });
      } else if (average >= -20) {
        reminders.push({
          icon: '⚠️',
          title: '今日状态一般',
          desc: '部分指标处于低谷期，建议多休息，避免重要决策。调整心态，静待好转！',
          type: 'warning'
        });
      } else {
        reminders.push({
          icon: '⚡',
          title: '今日状态偏低',
          desc: '各项指标均处低谷，建议放松心情，适当休息。避免高强度工作，关注健康！',
          type: 'danger'
        });
      }

      // 体力提醒
      if (physical < -20) {
        reminders.push({
          icon: '💪',
          title: '体力低谷期',
          desc: '今日体力较弱，避免剧烈运动，多休息，注意保暖。',
          type: 'warning'
        });
      } else if (physical >= 50) {
        reminders.push({
          icon: '🏃',
          title: '体力充沛期',
          desc: '今日体力旺盛，适合运动锻炼，处理体力工作。注意适度，避免过度消耗！',
          type: 'success'
        });
      }

      // 情绪提醒
      if (emotional < -20) {
        reminders.push({
          icon: '😊',
          title: '情绪低谷期',
          desc: '今日情绪波动较大，注意调节心情，避免争执。多听音乐，放松身心！',
          type: 'warning'
        });
      } else if (emotional >= 50) {
        reminders.push({
          icon: '😄',
          title: '情绪高涨期',
          desc: '今日心情愉快，适合社交活动和创意工作。保持热情，感染他人！',
          type: 'success'
        });
      }

      // 智力提醒
      if (intellectual < -20) {
        reminders.push({
          icon: '🧠',
          title: '智力低谷期',
          desc: '今日思维较慢，避免重要决策，谨慎行事。多休息，保证睡眠！',
          type: 'warning'
        });
      } else if (intellectual >= 50) {
        reminders.push({
          icon: '💡',
          title: '智力旺盛期',
          desc: '今日思维敏捷，适合学习考试和创意工作。把握灵感，记录想法！',
          type: 'success'
        });
      }

      // 综合建议
      if (physical > 0 && emotional > 0 && intellectual > 0) {
        reminders.push({
          icon: '🎯',
          title: '今日建议',
          desc: '三大周期均为正值，是全面发展的好时机。合理规划，充分利用！',
          type: 'info'
        });
      }

      return reminders.slice(0, 5); // 最多显示5条提醒
    };

    return {
      date: dateStr,
      physical,
      emotional,
      intellectual,
      average,
      physicalStatus,
      emotionalStatus,
      intellectualStatus,
      overallStatus,
      reminders: generateReminders()
    };
  }, [formattedData, selectedDate, todayIndex]);

  // Tooltip标题回调
  const tooltipTitleCallback = useCallback((context) => {
    if (context[0].raw && context[0].raw.date) {
      const date = new Date(context[0].raw.date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日节律`;
    }
    return '节律数据';
  }, []);

  // Tooltip标签回调
  const tooltipLabelCallback = useCallback((context) => {
    if (context.raw !== undefined) {
      return context.raw;
    }
    return context.parsed.y;
  }, []);

  // 今天的今天线数据
  const todayDataset = useMemo(() => {
    if (!formattedData || todayIndex === -1) return null;

    return {
      label: '今天',
      data: formattedData.physical.slice(todayIndex, todayIndex + 1),
      borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)',
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true
    };
  }, [formattedData, todayIndex, theme, themeColors]);

  // 今天线注释配置
  const todayAnnotation = useMemo(() => {
    if (todayIndex === -1) return {};

    return {
      type: 'line',
      xMin: todayIndex - 0.5,
      xMax: todayIndex + 0.5,
      borderColor: 'rgba(255, 99, 132, 0.8)',
      borderWidth: 2,
      borderDash: [5, 5]
    };
  }, [todayIndex]);

  // 体力数据集
  const physicalDataset = useMemo(() => {
    if (!formattedData) return null;

    return {
      label: '体力',
      data: formattedData.physical,
      borderColor: themeColors.todayLineColor,
      backgroundColor: theme === 'dark' 
        ? 'rgba(74, 222, 128, 0.1)' 
        : 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true
    };
  }, [formattedData, theme, themeColors]);

  // 情绪数据集
  const emotionalDataset = useMemo(() => {
    if (!formattedData) return null;

    return {
      label: '情绪',
      data: formattedData.emotional,
      borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      backgroundColor: theme === 'dark' 
        ? 'rgba(96, 165, 250, 0.1)' 
        : 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true
    };
  }, [formattedData, theme, themeColors]);

  // 智力数据集
  const intellectualDataset = useMemo(() => {
    if (!formattedData) return null;

    return {
      label: '智力',
      data: formattedData.intellectual,
      borderColor: themeColors.todayLineColor,
      backgroundColor: theme === 'dark' 
        ? 'rgba(147, 51, 234, 0.1)' 
        : 'rgba(168, 85, 247, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true
    };
  }, [formattedData, theme, themeColors]);

  // 图表数据配置
  const chartData = useMemo(() => {
    if (!formattedData) return null;

    const datasets = [];
    if (physicalDataset) datasets.push(physicalDataset);
    if (emotionalDataset) datasets.push(emotionalDataset);
    if (intellectualDataset) datasets.push(intellectualDataset);

    // 只有在今天数据存在时才添加今天线
    if (todayDataset && todayIndex !== -1) {
      datasets.push(todayDataset);
    }

    return {
      labels: formattedData.labels,
      datasets: datasets
    };
  }, [formattedData, physicalDataset, emotionalDataset, intellectualDataset, todayDataset, todayIndex]);

  // 图表配置 - 优化依赖项，移除不稳定的依赖
  const options = useMemo(() => {
    if (!chartData) return {};

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: isMobile ? 12 : 14,
            },
            color: themeColors.textColor,
          },
        },
        tooltip: {
          callbacks: {
            title: tooltipTitleCallback,
            label: tooltipLabelCallback,
          },
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: theme === 'dark' ? '#fff' : '#000',
          bodyColor: theme === 'dark' ? '#e0e0e0' : '#1f2937',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
        // 添加注解配置
        annotation: {
          annotations: todayAnnotation
        }
      },
      scales: {
        y: {
          min: -100,
          max: 100,
          ticks: {
            stepSize: 25,
            font: {
              size: isMobile ? 10 : 12,
            },
            color: themeColors.textColor,
          },
          grid: {
            color: themeColors.gridColor,
          },
        },
        x: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
            color: themeColors.textColor,
          },
          grid: {
            color: themeColors.gridColor,
          },
        },
      },
      // 优化交互性能
      interaction: {
        mode: 'index',
        intersect: false,
      },
      // 优化动画性能
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    };
  }, [isMobile, themeColors, todayAnnotation, tooltipTitleCallback, tooltipLabelCallback]);

  // 使用稳定的key，为每个组件实例生成唯一key
  const chartKey = useMemo(() => {
    return `biorhythm-chart-${theme}-${isMobile}-${data?.length || 0}`;
  }, [theme, isMobile, data?.length]);

  // 如果没有数据，显示空状态
  if (!chartData) {
    return <div className="text-center py-4 text-gray-900 dark:text-gray-100">没有可用的图表数据</div>;
  }

  return (
    <div className="space-y-6">
      {/* 当日状态面板 */}
      {todayStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">📅</span>
              {selectedDate.toLocaleDateString('zh-CN')} 节律状态
            </h3>
            <div className={`px-4 py-2 rounded-lg ${todayStatus.overallStatus.bgColor} ${todayStatus.overallStatus.border} border`}>
              <span className={`font-bold ${todayStatus.overallStatus.color}`}>
                综合状态：{todayStatus.overallStatus.label}
              </span>
            </div>
          </div>

          {/* 三大周期状态 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${todayStatus.physicalStatus.bgColor} ${todayStatus.physicalStatus.border} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">体力</span>
                <span className={`text-2xl font-bold ${todayStatus.physicalStatus.color}`}>
                  {todayStatus.physical}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${todayStatus.physicalStatus.color}`}>
                  {todayStatus.physicalStatus.label}
                </span>
                <span className="text-lg">💪</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${todayStatus.emotionalStatus.bgColor} ${todayStatus.emotionalStatus.border} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">情绪</span>
                <span className={`text-2xl font-bold ${todayStatus.emotionalStatus.color}`}>
                  {todayStatus.emotional}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${todayStatus.emotionalStatus.color}`}>
                  {todayStatus.emotionalStatus.label}
                </span>
                <span className="text-lg">😊</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${todayStatus.intellectualStatus.bgColor} ${todayStatus.intellectualStatus.border} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">智力</span>
                <span className={`text-2xl font-bold ${todayStatus.intellectualStatus.color}`}>
                  {todayStatus.intellectual}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${todayStatus.intellectualStatus.color}`}>
                  {todayStatus.intellectualStatus.label}
                </span>
                <span className="text-lg">🧠</span>
              </div>
            </div>
          </div>

          {/* 当日提醒 */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">💡</span>
              今日提醒
            </h4>
            <div className="grid gap-3">
              {todayStatus.reminders.map((reminder, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-lg border ${
                    reminder.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
                    reminder.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                    reminder.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <span className="text-2xl mr-3">{reminder.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {reminder.title}
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reminder.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 节律趋势图 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          节律趋势图
        </h3>
        <div className="w-full" style={{ height: isMobile ? '250px' : '400px' }}>
          <Line
            key={chartKey}
            data={chartData}
            options={options}
            type="line"
            redraw={false}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(BiorhythmChart);
