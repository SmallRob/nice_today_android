import React, { useMemo } from 'react';
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
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useTheme } from '../context/ThemeContext';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin  // 注册注解插件
);

// 节律状态评估函数
const getRhythmStatus = (value) => {
  const absValue = Math.abs(value);
  
  if (absValue >= 90) {
    return value > 0 ? '极佳' : '极差';
  } else if (absValue >= 70) {
    return value > 0 ? '很好' : '很差';
  } else if (absValue >= 50) {
    return value > 0 ? '良好' : '较差';
  } else if (absValue >= 30) {
    return value > 0 ? '一般' : '一般偏低';
  } else {
    return '平稳期';
  }
};

const BiorhythmChart = ({ data, isMobile }) => {
  const { theme } = useTheme();
  
  // 深色模式下的文字颜色
  const textColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // 优化的数据格式化函数 - 使用useMemo避免不必要的重新计算
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

  // 优化的日期处理 - 使用useMemo避免不必要的重新计算
  const { todayIndex, chartData } = useMemo(() => {
    // 如果没有数据，返回默认值
    if (!formattedData) {
      return { todayIndex: -1, chartData: null };
    }
    
    // 找到今天的索引
    const todayIndex = formattedData.dates.findIndex(date => {
      const today = new Date().toISOString().split('T')[0];
      return date === today;
    });

    // 准备图表数据
    const chartData = {
      labels: formattedData.dates.map(date => {
        // 将日期格式化为 MM-DD
        const dateObj = new Date(date);
        return `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
      }),
      datasets: [
        {
          label: '体力节律',
          data: formattedData.physical,
          borderColor: '#3b82f6', // 蓝色
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: '情绪节律',
          data: formattedData.emotional,
          borderColor: '#ef4444', // 红色
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: '智力节律',
          data: formattedData.intellectual,
          borderColor: '#10b981', // 绿色
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
    
    return { todayIndex, chartData };
  }, [formattedData]);

  // 优化的图表配置 - 使用useMemo避免不必要的重新计算
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
          color: textColor, // 根据主题设置文字颜色
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const index = items[0].dataIndex;
            // 确保data和dates存在
            if (data && data.dates && data.dates[index]) {
              return `日期: ${data.dates[index]}`;
            }
            return '';
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
      // 添加注解配置
      annotation: {
        annotations: todayIndex >= 0 ? {
          todayLine: {
            type: 'line',
            xMin: todayIndex,
            xMax: todayIndex,
            borderColor: 'rgba(0, 0, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6], // 设置为虚线
            label: {
              display: true,
              content: '今天',
              position: 'start',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              font: {
                weight: 'bold',
                size: isMobile ? 10 : 12
              },
              padding: isMobile ? 4 : 6
            }
          }
        } : {}
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
          color: textColor, // 根据主题设置坐标轴刻度颜色
        },
        grid: {
          color: gridColor, // 根据主题设置网格线颜色
        },
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          color: textColor, // 根据主题设置坐标轴刻度颜色
        },
        grid: {
          color: gridColor, // 根据主题设置网格线颜色
        },
      },
    },
  }), [isMobile, textColor, gridColor, todayIndex, data]);

  // 如果没有数据，显示空状态
  if (!chartData) {
    return <div className="text-center py-4 text-gray-900 dark:text-white">没有可用的图表数据</div>;
  }
  
  return (
    <div className="w-full" style={{ height: isMobile ? '250px' : '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BiorhythmChart;