import React, { useMemo } from 'react';
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

/**
 * 八字运势趋势图组件
 * 展示不同类型运势的曲线图（生活、事业、健康、爱情）
 */
const FortuneTrendChart = ({ data, isMobile }) => {
  const { theme } = useTheme();

  console.log('📈 FortuneTrendChart 组件已渲染');
  console.log('📊 接收到的数据:', data);
  console.log('📱 是否移动端:', isMobile);
  console.log('🌙 当前主题:', theme);
  console.log('🎨 主题类名应使用:', theme === 'dark' ? 'dark模式' : 'light模式');
  console.log('🔍 body是否有dark类:', document.body.classList.contains('dark'));

  // 格式化数据
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const labels = data.map(item => item.date || item.period || '');
    const lifeScores = data.map(item => item.lifeScore || item.life || 0);
    const careerScores = data.map(item => item.careerScore || item.career || 0);
    const healthScores = data.map(item => item.healthScore || item.health || 0);
    const loveScores = data.map(item => item.loveScore || item.love || 0);

    // 创建渐变填充
    const createGradient = (ctx, color) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, color.replace('0.1', '0.3'));
      gradient.addColorStop(1, color.replace('0.1', '0.05'));
      return gradient;
    };

    return {
      labels,
      datasets: [
        {
          label: '生活',
          data: lifeScores,
          borderColor: '#10B981', // 绿色
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx } = chart;
            if (!ctx) return 'rgba(16, 185, 129, 0.1)';
            return createGradient(ctx, 'rgba(16, 185, 129, 0.1)');
          },
          borderWidth: isMobile ? 2 : 3,
          pointRadius: isMobile ? 2 : 4,
          pointHoverRadius: isMobile ? 5 : 8,
          pointBackgroundColor: '#10B981',
          pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4, // 曲线平滑度
          fill: true,
        },
        {
          label: '事业',
          data: careerScores,
          borderColor: '#3B82F6', // 蓝色
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx } = chart;
            if (!ctx) return 'rgba(59, 130, 246, 0.1)';
            return createGradient(ctx, 'rgba(59, 130, 246, 0.1)');
          },
          borderWidth: isMobile ? 2 : 3,
          pointRadius: isMobile ? 2 : 4,
          pointHoverRadius: isMobile ? 5 : 8,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: '健康',
          data: healthScores,
          borderColor: '#F59E0B', // 橙色
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx } = chart;
            if (!ctx) return 'rgba(245, 158, 11, 0.1)';
            return createGradient(ctx, 'rgba(245, 158, 11, 0.1)');
          },
          borderWidth: isMobile ? 2 : 3,
          pointRadius: isMobile ? 2 : 4,
          pointHoverRadius: isMobile ? 5 : 8,
          pointBackgroundColor: '#F59E0B',
          pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: '爱情',
          data: loveScores,
          borderColor: '#EC4899', // 粉色
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx } = chart;
            if (!ctx) return 'rgba(236, 72, 153, 0.1)';
            return createGradient(ctx, 'rgba(236, 72, 153, 0.1)');
          },
          borderWidth: isMobile ? 2 : 3,
          pointRadius: isMobile ? 2 : 4,
          pointHoverRadius: isMobile ? 5 : 8,
          pointBackgroundColor: '#EC4899',
          pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ]
    };
  }, [data, isMobile, theme]);

  // 图表配置
  const options = useMemo(() => {
    if (!chartData) return {};

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            font: {
              size: isMobile ? 10 : 12,
              weight: '500'
            },
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: isMobile ? 12 : 16,
            boxWidth: isMobile ? 20 : 30,
            boxHeight: isMobile ? 8 : 10
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          titleColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          titleFont: {
            size: isMobile ? 12 : 14,
            weight: '600'
          },
          bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
          bodyFont: {
            size: isMobile ? 11 : 13
          },
          borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: isMobile ? 8 : 12,
          displayColors: true,
          usePointStyle: true,
          pointStyle: 'circle',
          boxPadding: 4
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: {
              size: isMobile ? 9 : 11,
              weight: '400'
            },
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: isMobile ? 6 : 8,
            callback: function(value) {
              return value + '分';
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.06)',
            drawBorder: false,
            lineWidth: 1
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: {
            font: {
              size: isMobile ? 9 : 11,
              weight: '400'
            },
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: isMobile ? 6 : 8,
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0,
          },
          grid: {
            display: false,
            drawBorder: false
          },
          border: {
            display: false
          }
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      }
    };
  }, [chartData, theme, isMobile]);

  // 如果没有数据，显示空状态
  if (!chartData) {
    return (
      <div className={`bg-gradient-to-br rounded-xl shadow-lg p-4 sm:p-6 border ${
        theme === 'dark'
          ? 'from-gray-800 to-gray-900 border-gray-700'
          : 'from-white to-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-4 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="mr-1.5 sm:mr-2 text-lg sm:text-xl md:text-2xl">📈</span>
          <span className="text-sm sm:text-base md:text-lg">运势趋势图</span>
        </h3>
        <div className={`text-center py-8 text-xs sm:text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          暂无运势趋势数据
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br rounded-xl shadow-lg p-4 sm:p-6 border ${
      theme === 'dark'
        ? 'from-gray-800 to-gray-900 border-gray-700'
        : 'from-white to-gray-50 border-gray-200'
    }`}>
      <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-4 flex items-center ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        <span className="mr-1.5 sm:mr-2 text-lg sm:text-xl md:text-2xl">📈</span>
        <span className="text-sm sm:text-base md:text-lg">运势趋势图</span>
      </h3>
      <div style={{ height: isMobile ? '200px' : '300px' }}>
        <Line
          data={chartData}
          options={options}
          redraw={false}
        />
      </div>
    </div>
  );
};

export default React.memo(FortuneTrendChart);
