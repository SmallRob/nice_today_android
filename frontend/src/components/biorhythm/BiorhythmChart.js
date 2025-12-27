import React, { useMemo, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
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

/**
 * BiorhythmChart 组件
 *
 * 彻底解决Canvas重复使用问题的实现：
 * 1. 使用唯一的图表ID，避免冲突
 * 2. 使用Chart.getChart()静态方法获取并销毁现有实例
 * 3. 在组件卸载时正确清理
 * 4. 使用useCallback稳定函数引用
 */
const BiorhythmChart = ({ data, isMobile }) => {
  const { theme } = useTheme();
  const chartInstanceRef = React.useRef(null);

  // 生成唯一的图表ID - 避免Canvas ID冲突
  const chartId = useMemo(() => {
    return `biorhythm-chart-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 确保 Chart.js 组件已注册
  useEffect(() => {
    try {
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
      console.log('Chart.js 组件已注册');
    } catch (error) {
      console.error('Chart.js 组件注册失败:', error);
    }
  }, []);

  // 组件卸载时销毁Chart实例 - 使用双重保险机制
  useEffect(() => {
    return () => {
      console.log('开始清理图表实例...');
      
      // 方法1: 使用Chart.getChart()静态方法
      if (chartId) {
        try {
          const existingChart = ChartJS.getChart(chartId);
          if (existingChart) {
            existingChart.destroy();
            console.log(`已通过Chart.getChart()销毁图表实例: ${chartId}`);
          }
        } catch (error) {
          console.warn('通过Chart.getChart()销毁图表实例时出错:', error);
        }
      }

      // 方法2: 清理本地引用
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
          console.log('已清理本地图表实例引用');
        } catch (error) {
          console.warn('清理本地图表引用时出错:', error);
        }
      }

      console.log('图表实例清理完成');
    };
  }, [chartId]);

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
    <div className="w-full" style={{ height: isMobile ? '250px' : '400px' }}>
      <Line
        id={chartId}
        key={chartKey}
        data={chartData}
        options={options}
        type="line"
        redraw={false}
      />
    </div>
  );
};

export default React.memo(BiorhythmChart);
