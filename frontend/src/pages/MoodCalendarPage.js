import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const dateStr = date.toISOString().split('T')[0];
    const moodData = moodStorage.getMoodData();
    return moodData[dateStr] || null;
  },
  
  // 设置指定日期的心情
  setMoodForDate: (date, mood) => {
    const dateStr = date.toISOString().split('T')[0];
    const moodData = moodStorage.getMoodData();
    moodData[dateStr] = {
      ...mood,
      timestamp: new Date().toISOString()
    };
    return moodStorage.saveMoodData(moodData);
  }
};

// 心情表情定义
const moodEmojis = [
  { value: 'very-happy', emoji: '😄', label: '非常开心', color: 'bg-yellow-400' },
  { value: 'happy', emoji: '😊', label: '开心', color: 'bg-green-400' },
  { value: 'neutral', emoji: '😐', label: '一般', color: 'bg-gray-400' },
  { value: 'sad', emoji: '😔', label: '难过', color: 'bg-blue-400' },
  { value: 'very-sad', emoji: '😢', label: '很悲伤', color: 'bg-indigo-400' },
  { value: 'angry', emoji: '😠', label: '愤怒', color: 'bg-red-400' },
  { value: 'excited', emoji: '🤩', label: '兴奋', color: 'bg-orange-400' },
  { value: 'calm', emoji: '😌', label: '平静', color: 'bg-teal-400' }
];

// 日历视图组件
const CalendarView = ({ selectedDate, onDateSelect, onMoodSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMoodDate, setSelectedMoodDate] = useState(null);

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
      const mood = moodStorage.getMoodForDate(date);
      
      days.push({
        date,
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toDateString() === new Date().toDateString(),
        mood: mood,
        hasMood: !!mood
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
    if (onDateSelect) onDateSelect(today);
  };

  const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
      if (onDateSelect) {
        onDateSelect(day.date);
      }
      
      // 检查是否已经有心情记录，如果是今天或未来日期则允许修改
      const isTodayOrFuture = day.date >= new Date().setHours(0, 0, 0, 0);
      if (!day.hasMood || isTodayOrFuture) {
        setSelectedMoodDate(day.date);
        setShowMoodSelector(true);
      } else if (day.hasMood) {
        // 对于历史记录，只显示查看模式，不打开选择器
        setSelectedMoodDate(day.date);
        setShowMoodSelector(false);
        // 更新选中日期以显示历史记录信息
        if (onDateSelect) {
          onDateSelect(day.date);
        }
      }
    }
  };

  const handleMoodSelect = (mood) => {
    if (selectedMoodDate) {
      moodStorage.setMoodForDate(selectedMoodDate, mood);
      setShowMoodSelector(false);
      setSelectedMoodDate(null);
      // 刷新当前月的数据
      setCurrentDate(new Date(currentDate)); // 触发重新渲染
    }
  };

  const closeMoodSelector = () => {
    setShowMoodSelector(false);
    setSelectedMoodDate(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
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
            const mood = moodEmojis.find(m => m.value === day.mood?.type);
            if (mood) {
              bgClass = `${mood.color.replace('bg-', 'bg-')} bg-opacity-20 dark:bg-opacity-30`;
              moodIndicator = (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: mood.color.replace('bg-', '') }}>
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
                relative min-h-20 p-1 rounded-lg transition-colors
                ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900' : ''}
                ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                ${day.isWeekend && !bgClass ? 'bg-gray-50 dark:bg-gray-900' : ''}
                ${bgClass}
                ${day.isCurrentMonth && (day.date >= new Date().setHours(0, 0, 0, 0) || !day.hasMood) ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-default'}
                ${day.hasMood && day.date < new Date().setHours(0, 0, 0, 0) ? 'opacity-70' : ''}
              `}
            >
              {/* 日期数字 */}
              <div className={`text-center text-sm ${day.isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                {day.date.getDate()}
              </div>

              {/* 心情指示器 */}
              {moodIndicator}
            </div>
          );
        })}
      </div>

      {/* 心情选择器弹窗 */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedMoodDate ? selectedMoodDate.toLocaleDateString('zh-CN') : ''}
              </h3>
              <button
                onClick={closeMoodSelector}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect({
                    type: mood.value,
                    emoji: mood.emoji,
                    label: mood.label
                  })}
                  className={`p-3 rounded-lg border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center ${
                    selectedMoodDate && moodStorage.getMoodForDate(selectedMoodDate)?.type === mood.value 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {moodEmojis.slice(0, 4).map((mood) => (
          <div key={mood.value} className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${mood.color}`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{mood.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
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

  return (
    <div className="mood-calendar-page bg-gray-50 dark:bg-gray-900 min-h-screen">
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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 选中日期信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
              </p>
            </div>
            {currentMood && (
              <div className="text-center">
                <div className="text-4xl mb-1">{currentMood.emoji}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentMood.label}</div>
              </div>
            )}
          </div>
          
          {/* 心情状态说明 */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {isFuture ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">未来日期，暂未记录心情</p>
            ) : isToday ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">今天的心情可以随时更新</p>
            ) : currentMood ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">历史心情记录，不可修改</p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-sm">点击日历中的日期来记录心情</p>
            )}
          </div>
          
          {/* 添加历史记录提示 */}
          {currentMood && !isToday && !isFuture && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                ⚠️ 这是历史记录，无法修改
              </p>
            </div>
          )}
        </div>

        {/* 日历视图 */}
        <CalendarView 
          selectedDate={selectedDate} 
          onDateSelect={handleDateSelect} 
        />

        {/* 说明文字 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <p>• 点击日历中的日期可以添加或查看当天心情</p>
          <p>• 今天和未来日期可以修改心情记录</p>
          <p>• 历史日期的心情记录不可修改</p>
        </div>
      </div>
    </div>
  );
};

export default MoodCalendarPage;