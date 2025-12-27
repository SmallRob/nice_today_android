import React, { useState, useMemo } from 'react';

/**
 * 增强的月份选择器组件
 * 支持年份和月份的选择，优化移动端体验
 */
const MonthSelector = ({ 
  selectedDate = new Date(), 
  onDateChange,
  className = '',
  size = 'md',
  showYearNavigation = true
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  // 尺寸配置
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  // 生成月份列表
  const monthList = useMemo(() => [
    { value: 0, name: '一月', short: '1月' },
    { value: 1, name: '二月', short: '2月' },
    { value: 2, name: '三月', short: '3月' },
    { value: 3, name: '四月', short: '4月' },
    { value: 4, name: '五月', short: '5月' },
    { value: 5, name: '六月', short: '6月' },
    { value: 6, name: '七月', short: '7月' },
    { value: 7, name: '八月', short: '8月' },
    { value: 8, name: '九月', short: '9月' },
    { value: 9, name: '十月', short: '10月' },
    { value: 10, name: '十一月', short: '11月' },
    { value: 11, name: '十二月', short: '12月' }
  ], []);

  // 生成年份列表（前后各5年）
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // 处理月份选择
  const handleMonthSelect = (month) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // 处理年份选择
  const handleYearSelect = (year) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // 年份导航
  const navigateYear = (direction) => {
    const newYear = currentDate.getFullYear() + direction;
    const newDate = new Date(newYear, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // 快速导航到当前月份
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    onDateChange?.(now);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* 年份导航栏 */}
      {showYearNavigation && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateYear(-1)}
              className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors`}
              aria-label="上一年"
            >
              ◀
            </button>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearSelect(parseInt(e.target.value))}
              className={`${sizeClasses[size]} bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            >
              {yearList.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <button
              onClick={() => navigateYear(1)}
              className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors`}
              aria-label="下一年"
            >
              ▶
            </button>
          </div>
          
          <button
            onClick={goToCurrentMonth}
            className={`${sizeClasses[size]} bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors font-medium`}
          >
            本月
          </button>
        </div>
      )}

      {/* 月份选择网格 */}
      <div className="p-4">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {monthList.map(month => {
            const isCurrentMonth = month.value === currentDate.getMonth();
            const isCurrentYearMonth = 
              month.value === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <button
                key={month.value}
                onClick={() => handleMonthSelect(month.value)}
                className={`
                  ${sizeClasses[size]} 
                  rounded-lg border transition-all duration-200 font-medium
                  ${isCurrentMonth 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md transform scale-105' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                  ${isCurrentYearMonth && !isCurrentMonth 
                    ? 'ring-2 ring-blue-200 dark:ring-blue-800' 
                    : ''
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span className={isCurrentMonth ? 'font-bold' : ''}>
                    {month.short}
                  </span>
                  {isCurrentYearMonth && !isCurrentMonth && (
                    <span className="text-[8px] text-blue-500 dark:text-blue-400 mt-0.5">
                      本月
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 移动端优化：月份选择器 */}
      <div className="md:hidden p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-white">快速选择</span>
            <button
              onClick={goToCurrentMonth}
              className="text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-colors"
            >
              跳转本月
            </button>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearSelect(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              {yearList.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            
            <select
              value={currentDate.getMonth()}
              onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              {monthList.map(month => (
                <option key={month.value} value={month.value}>{month.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-white">
              或使用上方网格选择月份
            </span>
          </div>
        </div>
      </div>

      {/* 当前选择显示 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-white">
            当前选择: 
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;