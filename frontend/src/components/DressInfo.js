import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDressInfoRange, getSpecificDateDressInfo, formatDateString } from '../services/localDataService';
import { warmReminders } from '../config/healthTipsConfig';

// 优化后的DressInfo组件
const DressInfo = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [dressInfoList, setDressInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDressInfo, setSelectedDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // 使用useMemo优化计算
  const luckyColors = useMemo(() => {
    return selectedDressInfo?.color_suggestions?.filter(cs => cs.吉凶 === "吉") || [];
  }, [selectedDressInfo]);

  const unluckyColors = useMemo(() => {
    return selectedDressInfo?.color_suggestions?.filter(cs => cs.吉凶 === "不吉") || [];
  }, [selectedDressInfo]);

  // 加载数据
  const loadDressInfoRange = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getDressInfoRange(1, 6);
      
      if (result.success) {
        setDressInfoList(result.dressInfoList);
        setDateRange(result.dateRange);
        
        // 默认选择今天的数据
        const today = new Date().toISOString().split('T')[0];
        const todayInfo = result.dressInfoList.find(info => info.date === today);
        setSelectedDressInfo(todayInfo || result.dressInfoList[0]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('加载穿衣指南数据失败');
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理日期选择
  const handleDateChange = useCallback(async (date) => {
    setSelectedDate(date);
    
    const dateStr = formatDateString(date);
    const dateInfo = dressInfoList.find(info => info.date === dateStr);
    
    if (dateInfo) {
      setSelectedDressInfo(dateInfo);
    } else {
      // 如果在已加载数据中找不到，则请求特定日期的数据
      try {
        const result = await getSpecificDateDressInfo(dateStr);
        if (result.success) {
          setSelectedDressInfo(result.dressInfo);
          // 将新获取的信息添加到列表中
          setDressInfoList(prevList => {
            const exists = prevList.some(info => info.date === dateStr);
            if (exists) {
              return prevList.map(info => info.date === dateStr ? result.dressInfo : info);
            } else {
              return [...prevList, result.dressInfo];
            }
          });
        }
      } catch (err) {
        console.error('获取特定日期数据失败:', err);
      }
    }
  }, [dressInfoList]);

  // 日期格式化函数
  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }, []);

  // 获取日期标签类名
  const getDateTabClass = useCallback((dateStr) => {
    const isSelected = selectedDressInfo && selectedDressInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    let className = "flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 py-2 ";
    
    if (isSelected) {
      className += "bg-blue-500 text-white font-medium ";
    } else if (isToday) {
      className += "bg-yellow-100 text-blue-700 border-b-2 border-blue-500 ";
    } else {
      className += "hover:bg-gray-100 ";
    }
    
    return className;
  }, [selectedDressInfo]);

  // 简化日期选择器组件
  const SimpleDatePicker = ({ selectedDate, onDateChange, minDate, maxDate }) => {
    const handleDateChange = useCallback((e) => {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onDateChange(newDate);
      }
    }, [onDateChange]);

    return (
      <input
        type="date"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={handleDateChange}
        min={minDate?.toISOString().split('T')[0]}
        max={maxDate?.toISOString().split('T')[0]}
        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm dark:bg-gray-700 dark:text-white"
      />
    );
  };

  // 初始化加载数据
  useEffect(() => {
    loadDressInfoRange();
  }, [loadDressInfoRange]);

  if (loading && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <div className="text-center">
            <p className="text-base font-medium text-gray-900 dark:text-white">正在为您分析今日五行能量...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">加载失败</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadDressInfoRange} 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无穿衣信息</h3>
          <p className="text-gray-500 dark:text-gray-400">暂时无法获取穿衣建议数据</p>
          <button 
            onClick={loadDressInfoRange} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 performance-optimized">
      {/* 页面标题和说明 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-lg dark:from-purple-800 dark:to-blue-900">
        <h2 className="text-xl font-bold mb-1">五行穿衣与饮食指南</h2>
        <p className="text-purple-100 text-sm dark:text-purple-200">
          根据传统五行理论，为您提供每日的穿衣配色和饮食建议
        </p>
      </div>

      {/* 日期选择区域 */}
      <div className="bg-white dark:bg-gray-800 dark:bg-opacity-90 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
          <div className="mb-3 sm:mb-0">
            <h3 className="text-base font-medium flex items-center text-gray-900 dark:text-white">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              选择查询日期
            </h3>
          </div>
          <div className="w-full sm:w-auto">
            <SimpleDatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              minDate={dateRange.start}
              maxDate={dateRange.end}
            />
          </div>
        </div>
        
        {/* 日期快速选择标签 */}
        <div className="flex border rounded-lg overflow-hidden shadow-sm dark:border-gray-600">
          {dressInfoList.slice(0, 8).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ width: `${100 / Math.min(dressInfoList.length, 8)}%` }}
            >
              <div className="text-xs opacity-75 dark:text-gray-300">{info.weekday.replace('星期', '')}</div>
              <div className="font-medium dark:text-white">{formatDate(info.date)}</div>
              {new Date().toISOString().split('T')[0] === info.date && (
                <div className="flex items-center justify-center mt-1">
                  <span className="inline-block w-1.5 h-1.5 bg-current rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 当日五行信息 */}
      <div className="bg-white dark:bg-gray-800 dark:bg-opacity-90 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            {selectedDressInfo.date} {selectedDressInfo.weekday}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-300">当日主导五行:</span>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-md">
              {selectedDressInfo.daily_element}
            </span>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-l-4 border-purple-500 dark:border-purple-400 p-3 rounded-r-lg">
          <p className="text-purple-800 dark:text-purple-300 text-xs leading-relaxed">
            <strong>五行穿衣原理：</strong>根据当日的五行属性，选择相生相助的颜色可以增强运势，
            避免相克相冲的颜色可以减少不利影响。
          </p>
        </div>
      </div>

      {/* 吉祥颜色详细指南 */}
      {luckyColors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 dark:bg-opacity-90 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-green-600 dark:text-green-400">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            今日吉祥颜色搭配
          </h3>
          
          <div className="space-y-3">
            {luckyColors.map((colorSystem, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-3 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-green-800 dark:text-green-300">{colorSystem.颜色系统}</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">推荐指数: ★★★★★</p>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-1">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-2 py-1 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-full text-xs text-green-700 dark:text-green-300">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 不宜颜色警示 */}
      {unluckyColors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 dark:bg-opacity-90 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-red-600 dark:text-red-400">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            今日不宜颜色
          </h3>
          
          <div className="space-y-3">
            {unluckyColors.map((colorSystem, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-3 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-red-800 dark:text-red-300">{colorSystem.颜色系统}</h4>
                    <p className="text-xs text-red-600 dark:text-red-400">建议避免使用</p>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-1">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-2 py-1 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-full text-xs text-red-700 dark:text-red-300">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 饮食养生指南 */}
      {selectedDressInfo.food_suggestions && (
        <div className="bg-white dark:bg-gray-800 dark:bg-opacity-90 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            今日饮食养生指南
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-2 flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-green-800 dark:text-green-300">推荐食物</h4>
              </div>
              <div className="space-y-1">
                {selectedDressInfo.food_suggestions.宜.map((food, index) => (
                  <div key={index} className="flex items-center p-1 bg-white dark:bg-gray-700 rounded border border-green-200 dark:border-green-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-xs text-gray-800 dark:text-gray-300">{food}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-2 flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-red-800 dark:text-red-300">不宜食物</h4>
              </div>
              <div className="space-y-1">
                {selectedDressInfo.food_suggestions.忌.map((food, index) => (
                  <div key={index} className="flex items-center p-1 bg-white dark:bg-gray-700 rounded border border-red-200 dark:border-red-600">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-xs text-gray-800 dark:text-gray-300">{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 温馨提示 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-4 shadow-lg dark:from-yellow-600 dark:to-orange-700">
        <h4 className="text-base font-semibold mb-2 flex items-center">
          <span className="w-4 h-4 mr-1">💡</span>
          温馨提示
        </h4>
        <div className="text-yellow-100 text-xs leading-relaxed space-y-1 dark:text-yellow-200">
          {warmReminders.slice(0, 3).map((reminder, index) => (
            <p key={index}>• {reminder}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DressInfo;