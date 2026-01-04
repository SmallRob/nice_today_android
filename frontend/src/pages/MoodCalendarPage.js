import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateLunarDate } from '../utils/LunarCalendarHelper';
import './MoodCalendarPage.css';

// 心情数据存储管理
const moodStorage = {
  // 获取心情数据
  getMoodData: () => {
    try {
      const data = localStorage.getItem('moodCalendarData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取心情数据失败:', error);
      return {};
    }
  },
  
  // 保存心情数据
  saveMoodData: (moodData) => {
    try {
      localStorage.setItem('moodCalendarData', JSON.stringify(moodData));
      return true;
    } catch (error) {
      console.error('保存心情数据失败:', error);
      return false;
    }
  },
  
  // 获取指定日期的心情
  getMoodForDate: (date) => {
    // 确保传入的参数是有效的日期对象
    if (!date || !(date instanceof Date)) {
      console.error('无效的日期参数:', date);
      return null;
    }
    const dateStr = date.toISOString().split('T')[0];
    const moodData = moodStorage.getMoodData();
    return moodData[dateStr] || null;
  },
  
  // 设置指定日期的心情
  setMoodForDate: (date, mood) => {
    // 确保传入的参数是有效的日期对象
    if (!date || !(date instanceof Date)) {
      console.error('无效的日期参数:', date);
      return false;
    }
    const dateStr = date.toISOString().split('T')[0];
    const moodData = moodStorage.getMoodData();
    moodData[dateStr] = {
      type: mood.type,
      emoji: mood.emoji,
      label: mood.label,
      description: mood.description || '',
      timestamp: new Date().toISOString()
    };
    return moodStorage.saveMoodData(moodData);
  },
};

// 心情表情定义
const moodEmojis = [
  { value: 'very-happy', emoji: '😄', label: '非常开心', color: 'bg-yellow-400' },
  { value: 'happy', emoji: '😊', label: '开心', color: 'bg-green-400' },
  { value: 'neutral', emoji: '😐', label: '一般', color: 'bg-gray-400' },
  { value: 'tired', emoji: '😫', label: '疲劳', color: 'bg-purple-400' },
  { value: 'heart-tired', emoji: '😩', label: '心累', color: 'bg-indigo-400' },
  { value: 'helpless', emoji: '😒', label: '无奈', color: 'bg-gray-500' },
  { value: 'excited', emoji: '🤩', label: '兴奋', color: 'bg-orange-400' },
  { value: 'calm', emoji: '😌', label: '平静', color: 'bg-teal-400' },
  { value: 'anxious', emoji: '😰', label: '焦虑', color: 'bg-red-400' },
  { value: 'grateful', emoji: '😇', label: '感恩', color: 'bg-blue-300' },
  { value: 'sleepy', emoji: '🥱', label: '困倦', color: 'bg-purple-300' },
  { value: 'sick', emoji: '😷', label: '生病', color: 'bg-gray-300' }
];

// 获取用户自定义心情表情
const getUserCustomMoods = () => {
  try {
    const customMoods = localStorage.getItem('customMoodEmojis');
    return customMoods ? JSON.parse(customMoods) : [];
  } catch (error) {
    console.error('获取自定义心情表情失败:', error);
    return [];
  }
};

// 保存用户自定义心情表情
const saveUserCustomMoods = (customMoods) => {
  try {
    localStorage.setItem('customMoodEmojis', JSON.stringify(customMoods));
    return true;
  } catch (error) {
    console.error('保存自定义心情表情失败:', error);
    return false;
  }
};

// 获取所有心情表情（默认+自定义）
const getAllMoodEmojis = () => {
  const customMoods = getUserCustomMoods();
  return [...moodEmojis, ...customMoods];
};

// 心情日历主页面
const MoodCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMood, setCurrentMood] = useState(null);
  const navigate = useNavigate();

  // 加载当前选中日期的心情
  useEffect(() => {
    const mood = moodStorage.getMoodForDate(selectedDate);
    setCurrentMood(mood);
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  // 日历视图组件（作为内部函数组件）
  const CalendarView = ({ onMoodSelect }) => {
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
        const dateStr = new Date(date).toISOString().split('T')[0]; // Ensure proper date string format
        let lunarInfo = null;
        try {
          lunarInfo = calculateLunarDate(dateStr);
        } catch (error) {
          console.error('Lunar date calculation error for date:', dateStr, error);
        }
        days.push({
          date,
          isCurrentMonth: false,
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          lunarDate: lunarInfo ? `${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}` : ' '
        });
      }

      // 添加当前月的所有天
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const dateStr = new Date(date).toISOString().split('T')[0]; // Ensure proper date string format
        let lunarInfo = null;
        try {
          lunarInfo = calculateLunarDate(dateStr);
        } catch (error) {
          console.error('Lunar date calculation error for date:', dateStr, error);
        }
        const mood = date instanceof Date ? moodStorage.getMoodForDate(date) : null;
        
        days.push({
          date,
          isCurrentMonth: true,
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          isToday: date.toDateString() === new Date().toDateString(),
          mood: mood,
          hasMood: !!mood,
          lunarDate: lunarInfo ? `${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}` : ' '
        });
      }

      // 添加下个月的前几天
      const nextMonthDays = 42 - days.length; // 6行 * 7天 = 42天
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i);
        const dateStr = new Date(date).toISOString().split('T')[0]; // Ensure proper date string format
        let lunarInfo = null;
        try {
          lunarInfo = calculateLunarDate(dateStr);
        } catch (error) {
          console.error('Lunar date calculation error for date:', dateStr, error);
        }
        days.push({
          date,
          isCurrentMonth: false,
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          lunarDate: lunarInfo ? `${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}` : ' '
        });
      }

      return days;
    };

    const monthData = getMonthData(currentDate);
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

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
      if (handleDateSelect) handleDateSelect(today);
    };

    const handleDayClick = (day) => {
      // 检查是否为未来日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const clickedDate = new Date(day.date);
      clickedDate.setHours(0, 0, 0, 0);
      
      if (day.isCurrentMonth && clickedDate <= today) {
        if (handleDateSelect) {
          handleDateSelect(day.date);
        }
        
        // 对于非未来日期，允许心情选择
        if (onMoodSelect) {
          onMoodSelect(day.date); // 传递日期给父组件处理
        }
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 w-full max-w-full overflow-hidden">
        {/* 日历头部 - 月份导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              今天
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 星期头部 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-sm font-medium ${index === 0 ? 'text-red-500 dark:text-red-400' :
                index === 6 ? 'text-blue-500 dark:text-blue-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1">
          {monthData.map((day, index) => {
            let bgClass = '';
            let moodIndicator = null;

            if (day.hasMood) {
              // 根据心情类型设置背景色
              const allMoodEmojis = getAllMoodEmojis();
              const mood = allMoodEmojis.find(m => m.value === day.mood?.type);
              if (mood) {
                bgClass = `${mood.color.replace('bg-', 'bg-')} bg-opacity-20 dark:bg-opacity-30`;
                moodIndicator = (
                  <div className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold -mt-1 -mr-1" style={{ backgroundColor: mood.color.replace('bg-', '') }}>
                    {day.mood?.emoji}
                  </div>
                );
              }
            }

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  relative min-h-20 p-1 rounded-lg transition-colors w-full max-w-full overflow-hidden
                  ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900' : ''}
                  ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                  ${day.isWeekend && !bgClass ? 'bg-gray-50 dark:bg-gray-900' : ''}
                  ${bgClass}
                  ${day.isCurrentMonth && day.date <= new Date().setHours(0, 0, 0, 0) ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-default'}
                  ${day.hasMood && day.date < new Date().setHours(0, 0, 0, 0) ? 'opacity-70' : ''}
                `}
              >
                {/* 日期数字 */}
                <div className={`text-center text-sm ${day.isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                  {day.date.getDate()}
                </div>
                {/* 农历日期 */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  {day.lunarDate || ' '}
                </div>

                {/* 心情指示器 */}
                {moodIndicator}
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {getAllMoodEmojis().slice(0, 4).map((mood) => (
            <div key={mood.value} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${mood.color}`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{mood.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMoodDate, setSelectedMoodDate] = useState(null);
  const [moodDescription, setMoodDescription] = useState('');
  const [currentSelectedMood, setCurrentSelectedMood] = useState(null);
  
  const handleMoodSelect = (mood = null, description = '') => {
    if (selectedMoodDate && selectedMoodDate instanceof Date) {
      // 获取当前已存在的心情数据（如果有的话）
      const existingMood = moodStorage.getMoodForDate(selectedMoodDate);
      
      // 如果没有选择表情但有描述，则保存现有表情+新描述
      // 如果选择了表情，则使用新表情+描述
      let moodToSave;
      if (mood) {
        // 用户选择了新的表情
        moodToSave = {
          ...mood,
          description: description || moodDescription
        };
      } else if (existingMood) {
        // 用户只更新描述，保留原有表情
        moodToSave = {
          ...existingMood,
          description: description || moodDescription
        };
      } else if (currentSelectedMood) {
        // 如果没有传入 mood 但有当前选中的心情类型，使用当前选中的心情
        const selectedMood = getAllMoodEmojis().find(m => m.value === currentSelectedMood);
        if (selectedMood) {
          moodToSave = {
            type: selectedMood.value,
            emoji: selectedMood.emoji,
            label: selectedMood.label,
            description: description || moodDescription
          };
        } else {
          return; // 无法找到对应的心情类型
        }
      } else {
        // 没有表情也没有现有记录，无法保存
        return;
      }
      
      moodStorage.setMoodForDate(selectedMoodDate, moodToSave);
      setShowMoodSelector(false);
      setSelectedMoodDate(null);
      setCurrentSelectedMood(null); // 清空当前选择的状态
      setMoodDescription(''); // 清空描述
      // 刷新当前心情
      const moodData = moodStorage.getMoodForDate(selectedMoodDate);
      if (selectedMoodDate.toDateString() === selectedDate.toDateString()) {
        setCurrentMood(moodData);
      }
    }
  };
  
  // 为当前日期选择心情
  const handleMoodWithDescription = (mood) => {
    handleMoodSelect(mood, moodDescription);
  };
  
  // 保存当前选择的心情和描述
  const handleSaveMoodAndDescription = () => {
    if (moodDescription.trim() !== '' || currentSelectedMood) {
      // 如果有选择的心情类型，则使用该类型
      if (currentSelectedMood) {
        const selectedMood = getAllMoodEmojis().find(m => m.value === currentSelectedMood);
        if (selectedMood) {
          handleMoodSelect({
            type: selectedMood.value,
            emoji: selectedMood.emoji,
            label: selectedMood.label
          }, moodDescription);
        } else {
          // 如果找不到对应的心情，尝试使用现有的
          const existingMood = moodStorage.getMoodForDate(selectedMoodDate);
          if (existingMood) {
            handleMoodSelect(existingMood, moodDescription);
          }
        }
      } else {
        // 如果没有选择心情类型但有描述，只更新描述
        handleMoodSelect(null, moodDescription);
      }
    } else {
      // 如果描述为空且没有选择心情，直接关闭
      setShowMoodSelector(false);
      setSelectedMoodDate(null);
      setCurrentSelectedMood(null); // 清空当前选择的状态
      setMoodDescription('');
    }
  };
  
  const closeMoodSelector = () => {
    setShowMoodSelector(false);
    setSelectedMoodDate(null);
    setCurrentSelectedMood(null); // 清空当前选择的状态
  };
  
  const handleEditMood = (date = null) => {
    // 如果没有传入日期，则使用当前选中的日期
    const targetDate = date || selectedDate;
    setSelectedMoodDate(targetDate);
    
    // 加载该日期的现有心情数据（包括描述和表情）
    const existingMood = moodStorage.getMoodForDate(targetDate);
    if (existingMood) {
      setMoodDescription(existingMood.description || '');
      setCurrentSelectedMood(existingMood.type); // Set the existing mood as selected
    } else {
      setMoodDescription('');
      setCurrentSelectedMood(null);
    }
    
    setShowMoodSelector(true);
  };
  
  return (
    <div className="mood-calendar-page bg-gray-50 dark:bg-gray-900 min-h-screen w-full max-w-full">
      {/* 顶部导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">心情日历</h1>
          <div className="w-10"></div> {/* 占位符保持居中 */}
        </div>
      </div>

      <div className="container mx-auto px-1 py-6 max-w-4xl">
        {/* 选中日期信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
                </p>
                {/* 农历信息 */}
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  农历: {(() => {
                    try {
                      const dateStr = new Date(selectedDate).toISOString().split('T')[0];
                      const lunarInfo = calculateLunarDate(dateStr);
                      return lunarInfo ? `${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}` : '未知';
                    } catch (error) {
                      console.error('Lunar date calculation error for selected date:', selectedDate, error);
                      return '未知';
                    }
                  })()}
                </span>
              </div>
            </div>
            {currentMood && (
              <div className="text-center">
                <div className="text-4xl mb-1">{currentMood.emoji}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentMood.label}</div>
                {currentMood.description && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {currentMood.description}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 操作按钮区域 */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isFuture ? (
                <p>未来日期，暂未记录心情</p>
              ) : !currentMood ? (
                <p>暂未记录心情</p>
              ) : (
                <p>已记录心情</p>
              )}
            </div>
            <div>
              {isToday ? (
                <button
                  onClick={handleEditMood}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {currentMood ? '调整心情' : '新增心情'}
                </button>
              ) : isFuture ? (
                <button
                  className="px-4 py-2 bg-gray-300 text-white rounded-lg cursor-not-allowed"
                  disabled
                >
                  未来日期
                </button>
              ) : currentMood ? (
                <button
                  onClick={handleEditMood}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  查看/调整心情
                </button>
              ) : (
                <button
                  onClick={handleEditMood}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  添加心情
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 日历视图 */}
        <CalendarView 
          onMoodSelect={handleEditMood}
        />

        {/* 说明文字 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <p>• 点击日历中的日期可以添加或查看当天心情</p>
          <p>• 今天和未来日期可以修改心情记录</p>
          <p>• 历史日期的心情记录不可修改</p>
        </div>
      </div>
      
      {/* 心情选择器弹窗 */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedMoodDate && typeof selectedMoodDate === 'object' && selectedMoodDate.toLocaleDateString ? selectedMoodDate.toLocaleDateString('zh-CN') : ''}
              </h3>
              <button
                onClick={closeMoodSelector}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              {getAllMoodEmojis().map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => {
                    setCurrentSelectedMood(mood.value); // Update the selected mood state
                    // Don't save immediately, just set the selected mood
                    // User can add description and click save button
                  }}
                  className={`p-2 rounded-lg border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center ${
                    currentSelectedMood === mood.value || (selectedMoodDate && !currentSelectedMood && moodStorage.getMoodForDate(selectedMoodDate)?.type === mood.value)
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{mood.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              <textarea
                value={moodDescription}
                onChange={(e) => setMoodDescription(e.target.value)}
                onKeyDown={(e) => {
                  // 如果用户按 Enter 键且描述包含空格或非空，则保存
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (moodDescription.trim() !== '') {
                      handleSaveMoodAndDescription();
                    }
                  }
                }}
                placeholder="添加心情备注..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                rows="2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeMoodSelector}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveMoodAndDescription}
                  disabled={!moodDescription.trim() && !currentSelectedMood}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    moodDescription.trim() || currentSelectedMood
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  保存心情
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCalendarPage;