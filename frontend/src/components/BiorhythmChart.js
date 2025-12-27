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
 * 性能优化说明：
 * 1. 优化 useMemo 依赖项，避免不必要的重新计算
 * 2. 修复闭包问题，防止在 tooltip 回调中访问未初始化的变量
 * 3. 将复杂计算拆分为独立的 memoized 值
 * 4. 使用 useCallback 稳定回调函数引用
 * 5. 添加动态key强制重新创建chart，防止canvas冲突
 */
const BiorhythmChart = ({ data, isMobile }) => {
  const { theme } = useTheme();
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

  // 生成唯一的图表ID，用于跟踪每个实例
  const chartId = useMemo(() => {
    return `biorhythm-chart-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 确保 Chart.js 组件已注册 - 按页面实例化
  useEffect(() => {
    try {
      // 注册当前页面实例所需的 Chart.js 组件
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
    } catch (error) {
      console.error('Chart.js 组件注册失败:', error);
    }
  }, []);

  // 组件卸载时清理Chart实例 - 使用Chart.getChart()方法
  useEffect(() => {
    return () => {
      // 方法2: 使用Chart.getChart()静态方法
      if (chartId) {
        try {
          const existingChart = ChartJS.getChart(chartId);
          if (existingChart) {
            // 销毁现有图表实例
            existingChart.destroy();
            console.log(`已销毁图表实例: ${chartId}`);
          }
        } catch (error) {
          console.warn('销毁图表实例时出错:', error);
        }
      }

      // 清理本地引用
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        } catch (error) {
          console.warn('清理本地图表引用时出错:', error);
        }
      }
    };
  }, [chartId]);

  // 深色模式下的文字颜色 - 独立的 memoized 值
  const themeColors = useMemo(() => ({
    textColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
    gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    todayLineColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    todayLabelBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    todayLabelColor: theme === 'dark' ? '#000' : '#fff'
  }), [theme]);

  // 数据格式化函数 - 优化依赖项，只在 data 变化时重新计算
  const formattedData = useMemo(() => {
    if (!data) return null;

    // 如果是数组格式（本地计算返回的数据）
    if (Array.isArray(data)) {
      const dates = data.map(item => item.date);
      const physical = data.map(item => item.physical);
      const emotional = data.map(item => item.emotional);
      const intellectual = data.map(item => item.intellectual);

      return { dates, physical, emotional, intellectual };
    }

    // 如果是对象格式（API返回的数据）
    if (data.dates && data.physical && data.emotional && data.intellectual) {
      return data;
    }

    return null;
  }, [data]);

  // 计算今天索引 - 独立的 memoized 值
  const todayIndex = useMemo(() => {
    if (!formattedData || !formattedData.dates) return -1;

    // 找到今天的索引 - 使用本地时间
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return formattedData.dates.findIndex(date => date === todayStr);
  }, [formattedData]);

  // 准备图表数据 - 独立的 memoized 值
  const chartData = useMemo(() => {
    if (!formattedData) return null;

    return {
      labels: formattedData.dates.map(date => {
        // 将日期格式化为 MM-DD
        const dateObj = new Date(date);
        return `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
      }),
      datasets: [
        {
          label: '体力节律',
          data: formattedData.physical,
          borderColor: '#10b981', // 绿色
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: '情绪节律',
          data: formattedData.emotional,
          borderColor: '#3b82f6', // 蓝色
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: '智力节律',
          data: formattedData.intellectual,
          borderColor: '#8b5cf6', // 紫色
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  }, [formattedData]);

  // 优化后的 tooltip 回调 - 使用 useCallback 避免闭包问题
  const tooltipTitleCallback = useCallback((items) => {
    if (!items.length) return '';
    const index = items[0].dataIndex;
    // 安全访问 formattedData，避免闭包捕获未初始化的值
    if (formattedData && formattedData.dates && formattedData.dates[index]) {
      return `日期: ${formattedData.dates[index]}`;
    }
    return '';
  }, [formattedData]);

  const tooltipLabelCallback = useCallback((context) => {
    const label = context.dataset.label || '';
    const value = context.parsed.y;
    return `${label}: ${value}`;
  }, []);

  // 图表注解配置 - 独立的 memoized 值
  const annotations = useMemo(() => {
    if (todayIndex < 0) return {};

    return {
      todayLine: {
        type: 'line',
        xMin: todayIndex,
        xMax: todayIndex,
        borderColor: themeColors.todayLineColor,
        borderWidth: 2,
        borderDash: [6, 6], // 设置为虚线
        label: {
          display: true,
          content: '今天',
          position: 'start',
          backgroundColor: themeColors.todayLabelBg,
          color: themeColors.todayLabelColor,
          font: {
            weight: 'bold',
            size: isMobile ? 10 : 12
          },
          padding: isMobile ? 4 : 6
        }
      }
    };
  }, [todayIndex, themeColors, isMobile]);

  // 图表配置 - 优化依赖项，移除不稳定的依赖
  const options = useMemo(() => ({
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
      },
      // 添加注解配置
      annotation: {
        annotations
      }
    },
    scales: {
      y: {
        min: -100,
        max: 100,
        ticks: {
          stepSize: 25,
          font: {
            size: isMobile ? 10 : 12
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
            size: isMobile ? 10 : 12
          },
          color: themeColors.textColor,
        },
        grid: {
          color: themeColors.gridColor,
        },
      },
    },
  }), [isMobile, themeColors, annotations, tooltipTitleCallback, tooltipLabelCallback]);

  // 使用稳定的key，为每个组件实例生成唯一key
  // key基于数据和主题变化，确保正确的生命周期管理
  // 使用动态key来强制重新创建chart，防止canvas重复使用错误
  // key基于数据和主题变化，确保正确的生命周期管理
  const chartKey = useMemo(() => {
    return `biorhythm-chart-${theme}-${isMobile}-${data?.length || 0}`;
  }, [theme, isMobile, data?.length]);

  // 图表渲染回调 - 保存chart实例引用
  const onChartRender = useCallback((chart) => {
    if (chart) {
      chartRef.current = chart;
    }
  }, []);

  // 如果没有数据，显示空状态
  if (!chartData) {
    return <div className="text-center py-4 text-gray-900 dark:text-gray-100">没有可用的图表数据</div>;
  }

  return (
    <div className="w-full" style={{ height: isMobile ? '250px' : '400px' }}>
      <Line
        key={chartKey}
        data={chartData}
        options={options}
        type="line"
        redraw={false}
        ref={onChartRender}
      />
    </div>
  );
};

export default BiorhythmChart;