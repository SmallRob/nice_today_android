import React from 'react';
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

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

// 经期阶段颜色定义
const PHASE_COLORS = {
  menstrual: '#FF6B9D',     // 经期 - 粉红色
  follicular: '#8A6DE9',    // 卵泡期 - 紫色
  ovulation: '#FFD700',     // 排卵期 - 金色
  luteal: '#FFA500'         // 黄体期 - 橙色
};

// 生理状态颜色定义（女性喜爱的颜色）
const STATE_COLORS = {
  emotional: '#FF6B9D',     // 情绪 - 粉红色
  physical: '#8A6DE9',      // 体力 - 紫色
  intellectual: '#4ECDC4'   // 智力 - 青绿色
};

const MenstrualTrendChart = ({ prediction, cycles, selectedDate }) => {
  if (!prediction || !cycles || cycles.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">暂无预测数据可用于生成趋势图</p>
      </div>
    );
  }

  // 生成预测周期内的日期和生理状态数据
  const generateTrendData = () => {
    const dates = [];
    const emotional = [];
    const physical = [];
    const intellectual = [];
    
    // 获取最近一个周期的信息
    const lastCycle = cycles[cycles.length - 1];
    const cycleLength = lastCycle?.cycleLength || 28;
    
    // 生成未来3个周期的数据（约84天）
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 14); // 从14天前开始
    
    for (let i = 0; i < 84; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      dates.push(currentDate.toISOString().split('T')[0]);
      
      // 计算相对于周期开始的天数
      const cycleDay = ((i + 14) % cycleLength) + 1;
      
      // 基于周期阶段计算生理状态值
      let emoValue, physValue, intelValue;
      
      if (cycleDay <= 5) {
        // 经期 (1-5天)
        emoValue = 30 - (cycleDay * 5); // 情绪逐渐改善
        physValue = 20 - (cycleDay * 3); // 体力最低
        intelValue = 40 - (cycleDay * 2); // 智力一般
      } else if (cycleDay <= 13) {
        // 卵泡期 (6-13天)
        const follicularDay = cycleDay - 5;
        emoValue = 40 + (follicularDay * 5); // 情绪逐渐提升
        physValue = 30 + (follicularDay * 4); // 体力逐渐恢复
        intelValue = 50 + (follicularDay * 3); // 智力提升
      } else if (cycleDay <= 15) {
        // 排卵期 (14-15天)
        const ovulationDay = cycleDay - 13;
        emoValue = 90 + (ovulationDay * 5); // 情绪高涨
        physValue = 80 + (ovulationDay * 2); // 体力高峰
        intelValue = 85 + (ovulationDay * 3); // 智力高峰
      } else {
        // 黄体期 (16-28天)
        const lutealDay = cycleDay - 15;
        emoValue = 80 - (lutealDay * 3); // 情绪逐渐下降
        physValue = 70 - (lutealDay * 2); // 体力逐渐下降
        intelValue = 75 - (lutealDay * 2); // 智力逐渐下降
      }
      
      emotional.push(emoValue);
      physical.push(physValue);
      intellectual.push(intelValue);
    }
    
    return { dates, emotional, physical, intellectual };
  };

  const trendData = generateTrendData();

  // 找到选定日期的索引
  const selectedIndex = trendData.dates.findIndex(date => {
    return date === selectedDate.toISOString().split('T')[0];
  });

  // 准备图表数据
  const chartData = {
    labels: trendData.dates.map(date => {
      // 将日期格式化为 MM-DD
      const dateObj = new Date(date);
      return `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    }),
    datasets: [
      {
        label: '情绪状态',
        data: trendData.emotional,
        borderColor: STATE_COLORS.emotional,
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        label: '体力状态',
        data: trendData.physical,
        borderColor: STATE_COLORS.physical,
        backgroundColor: 'rgba(138, 109, 233, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        label: '智力状态',
        data: trendData.intellectual,
        borderColor: STATE_COLORS.intellectual,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      },
    ],
  };

  // 图表配置
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          color: '#1f2937', // Default text color
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const index = items[0].dataIndex;
            return `日期: ${trendData.dates[index]}`;
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
        annotations: selectedIndex >= 0 ? {
          selectedLine: {
            type: 'line',
            xMin: selectedIndex,
            xMax: selectedIndex,
            borderColor: 'rgba(0, 0, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6], // 设置为虚线
            label: {
              display: true,
              content: '选定日期',
              position: 'start',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              font: {
                weight: 'bold'
              },
              padding: 6
            }
          }
        } : {}
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#6b7280', // Default tick color
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280', // Default tick color
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // 获取选定日期的状态值
  const selectedEmotional = selectedIndex >= 0 ? trendData.emotional[selectedIndex] : null;
  const selectedPhysical = selectedIndex >= 0 ? trendData.physical[selectedIndex] : null;
  const selectedIntellectual = selectedIndex >= 0 ? trendData.intellectual[selectedIndex] : null;

  // 状态评估函数
  const getStateStatus = (value) => {
    if (value >= 80) return '极佳';
    if (value >= 60) return '良好';
    if (value >= 40) return '一般';
    if (value >= 20) return '较差';
    return '极差';
  };

  // 生成选定日期状态总结
  const renderSelectedDateSummary = () => {
    if (selectedIndex < 0) return null;
    
    // 计算综合值
    const totalScore = selectedEmotional + selectedPhysical + selectedIntellectual;
    const averageScore = Math.round(totalScore / 3);
    
    // 根据综合值确定状态
    const getTotalScoreStatus = (score) => {
      if (score >= 80) return { text: '极佳', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900 dark:bg-opacity-30' };
      if (score >= 60) return { text: '很好', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30' };
      if (score >= 40) return { text: '一般', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30' };
      if (score >= 20) return { text: '较差', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900 dark:bg-opacity-30' };
      return { text: '极差', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30' };
    };
    
    const totalStatus = getTotalScoreStatus(averageScore);
    
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-pink-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-lg">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full opacity-50 transform translate-x-8 -translate-y-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${averageScore > 60 ? 'bg-pink-100 dark:bg-pink-900 dark:bg-opacity-30' : averageScore < 40 ? 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30' : 'bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30'}`}>
                <svg className={`w-6 h-6 ${averageScore > 60 ? 'text-pink-600 dark:text-pink-400' : averageScore < 40 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 状态
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">基于经期周期的生理状态预测</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-pink-500 dark:border-pink-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">情绪状态</span>
                </div>
                <span className={`text-lg font-bold ${selectedEmotional > 60 ? 'text-pink-600 dark:text-pink-400' : selectedEmotional < 40 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {selectedEmotional}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                selectedEmotional > 60 ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:bg-opacity-30 dark:text-pink-400' : 
                selectedEmotional < 40 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getStateStatus(selectedEmotional)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-500 dark:border-purple-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">体力状态</span>
                </div>
                <span className={`text-lg font-bold ${selectedPhysical > 60 ? 'text-purple-600 dark:text-purple-400' : selectedPhysical < 40 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {selectedPhysical}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                selectedPhysical > 60 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-400' : 
                selectedPhysical < 40 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getStateStatus(selectedPhysical)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-teal-500 dark:border-teal-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-teal-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">智力状态</span>
                </div>
                <span className={`text-lg font-bold ${selectedIntellectual > 60 ? 'text-teal-600 dark:text-teal-400' : selectedIntellectual < 40 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {selectedIntellectual}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                selectedIntellectual > 60 ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:bg-opacity-30 dark:text-teal-400' : 
                selectedIntellectual < 40 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getStateStatus(selectedIntellectual)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 dark:border-blue-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">综合评分</span>
                </div>
                <span className={`text-lg font-bold ${averageScore > 60 ? 'text-blue-600 dark:text-blue-400' : averageScore < 40 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {averageScore}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${totalStatus.bg} ${totalStatus.color}`}>
                {totalStatus.text}
              </div>
            </div>
          </div>
          
          {/* 状态建议 */}
          <div className={`rounded-lg p-4 border-l-4 ${totalStatus.bg} border-${totalStatus.color.split('-')[1]}-500 dark:border-${totalStatus.color.split('-')[1]}-400`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className={`w-5 h-5 ${totalStatus.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">状态建议</h4>
                {averageScore >= 80 ? (
                  <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                    🌟 今天是您的黄金日！各项生理状态都非常好，适合进行重要活动、社交和创造性工作。充分利用这一天的能量吧！
                  </p>
                ) : averageScore >= 60 ? (
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    ✨ 今天状态良好，适合正常的工作和学习。可以适当安排一些有挑战性的任务，会有不错的表现。
                  </p>
                ) : averageScore >= 40 ? (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    👍 今天状态平稳，可以正常开展日常活动。建议合理安排工作和休息，保持良好的作息习惯。
                  </p>
                ) : averageScore >= 20 ? (
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ 今天状态一般，建议减少高强度活动，多注意休息。避免重要决策，保持心情平静。
                  </p>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ 今天状态较差，强烈建议以休息为主。避免压力和冲突，关注自我照顾和恢复。
                  </p>
                )}
                
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p className={selectedEmotional > 60 ? "text-pink-700 dark:text-pink-300" : "text-red-700 dark:text-red-300"}>
                    💖 {selectedEmotional > 70 ? "情绪高涨，适合社交和表达情感。" : 
                       selectedEmotional > 40 ? "情绪稳定，可以正常交流。" : 
                       "情绪可能较低落，多关爱自己，寻找让自己开心的事情。"}
                  </p>
                  <p className={selectedPhysical > 60 ? "text-purple-700 dark:text-purple-300" : "text-red-700 dark:text-red-300"}>
                    💪 {selectedPhysical > 70 ? "体力充沛，适合运动和体力活动。" : 
                       selectedPhysical > 40 ? "体力状态良好，可以正常活动。" : 
                       "体力可能不足，注意休息，避免剧烈运动。"}
                  </p>
                  <p className={selectedIntellectual > 60 ? "text-teal-700 dark:text-teal-300" : "text-red-700 dark:text-red-300"}>
                    🧠 {selectedIntellectual > 70 ? "思维敏捷，适合学习和创造性工作。" : 
                       selectedIntellectual > 40 ? "思维清晰，可以处理日常工作。" : 
                       "思维效率可能降低，避免复杂决策。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderSelectedDateSummary()}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">经期生理状态趋势图</h3>
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>📈 图表显示基于您经期周期预测的未来生理状态趋势，包括情绪、体力和智力三个方面。</p>
        </div>
      </div>
    </div>
  );
};

export default MenstrualTrendChart;