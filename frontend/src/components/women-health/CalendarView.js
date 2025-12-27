import React, { useState } from 'react';

const CalendarView = ({ prediction, cycles, onDateSelect }) => {
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
          (date >= prediction.nextPeriodStart && date <= prediction.nextPeriodEnd) ||
          (date >= prediction.fertileWindowStart && date <= prediction.fertileWindowEnd) ||
          date.toDateString() === prediction.ovulationDate.toDateString()
        )
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

  const monthData = getMonthData(currentDate);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="calendar-container bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 日历头部 - 月份导航 */}
      <div className="calendar-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={goToPreviousMonth}
          className="calendar-nav-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="上个月"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          <h2 className="calendar-title text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="calendar-today-btn px-3 py-1 text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
          >
            今天
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="calendar-nav-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="下个月"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期头部 */}
      <div className="calendar-weekdays grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map((day, index) => (
          <div 
            key={day}
            className={`calendar-weekday py-2 text-center text-sm font-medium ${
              index === 0 ? 'text-red-500 dark:text-red-400' : 
              index === 6 ? 'text-blue-500 dark:text-blue-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="calendar-grid grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {monthData.map((day, index) => {
          return (
            <div
              key={index}
              onClick={() => onDateSelect && onDateSelect(day.date)}
              className={`
                calendar-day relative min-h-20 p-1 bg-white dark:bg-gray-800 cursor-pointer transition-colors
                ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900' : ''}
                ${day.isToday ? 'bg-pink-50 dark:bg-pink-900/20' : ''}
                ${day.isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700
              `}
            >
              {/* 日期数字 */}
              <div className={`
                calendar-day-number absolute top-1 left-1 w-6 h-6 flex items-center justify-center text-sm rounded-full
                ${day.isToday ? 'bg-pink-500 text-white' : ''}
              `}>
                {day.date.getDate()}
              </div>

              {/* 预测标记 */}
              {day.isPredictedPeriod && (
                <div className="absolute bottom-1 right-1">
                  {day.date >= prediction.nextPeriodStart && day.date <= prediction.nextPeriodEnd ? (
                    <div className="w-2 h-2 rounded-full bg-pink-500" title="预测经期"></div>
                  ) : day.date.toDateString() === prediction.ovulationDate.toDateString() ? (
                    <div className="w-2 h-2 rounded-full bg-yellow-500" title="预测排卵期"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-yellow-300" title="受孕期"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;