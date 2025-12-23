import { useState, useEffect } from 'react';

// 简单的日期选择器组件
const DateSelector = ({ selectedDate, onDateChange }) => {
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [day, setDay] = useState(selectedDate.getDate());

  useEffect(() => {
    setYear(selectedDate.getFullYear());
    setMonth(selectedDate.getMonth());
    setDay(selectedDate.getDate());
  }, [selectedDate]);

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newYear);
    onDateChange(newDate);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    const newDate = new Date(selectedDate);
    newDate.setMonth(newMonth);
    onDateChange(newDate);
  };

  const handleDayChange = (e) => {
    const newDay = parseInt(e.target.value);
    setDay(newDay);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDay);
    onDateChange(newDate);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(year, month);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 年份选择 */}
      <select
        value={year}
        onChange={handleYearChange}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {Array.from({ length: 50 }, (_, i) => {
          const y = 2020 + i;
          return (
            <option key={y} value={y}>
              {y}年
            </option>
          );
        })}
      </select>

      {/* 月份选择 */}
      <select
        value={month}
        onChange={handleMonthChange}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {monthNames.map((name, index) => (
          <option key={index} value={index}>
            {name}
          </option>
        ))}
      </select>

      {/* 日期选择 */}
      <select
        value={day}
        onChange={handleDayChange}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {Array.from({ length: daysInMonth }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}日
          </option>
        ))}
      </select>

      {/* 快捷选择按钮 */}
      <button
        onClick={() => onDateChange(new Date())}
        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
      >
        今天
      </button>
    </div>
  );
};

export default DateSelector;
