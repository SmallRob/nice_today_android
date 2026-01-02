import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getMonthlyStats, getHabitHistory, getAllHabits } from '../utils/habitTracker';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../context/ThemeContext';

const HabitStatsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [selectedHabitId, setSelectedHabitId] = useState(searchParams.get('habitId') || '');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [stats, setStats] = useState({});
  const [habitHistory, setHabitHistory] = useState([]);
  const [allHabits, setAllHabits] = useState([]);
  const [selectedHabitName, setSelectedHabitName] = useState('');

  // 获取所有习惯
  useEffect(() => {
    const habits = getAllHabits();
    setAllHabits(habits);
    
    if (selectedHabitId && habits.length > 0) {
      const habit = habits.find(h => h.id === selectedHabitId);
      if (habit) {
        setSelectedHabitName(habit.name);
      }
    }
  }, [selectedHabitId]);

  // 获取月度统计
  useEffect(() => {
    if (selectedHabitId) {
      const monthlyStats = getMonthlyStats(year, month);
      setStats(monthlyStats);
      
      // 获取特定习惯的历史记录
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const history = getHabitHistory(selectedHabitId, startDate, endDate);
      setHabitHistory(history);
    } else {
      const monthlyStats = getMonthlyStats(year, month);
      setStats(monthlyStats);
    }
  }, [selectedHabitId, year, month]);

  // 获取当月的天数
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取当月第一天是星期几
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // 生成月历数据
  const generateCalendarData = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const calendar = [];
    
    // 添加上个月的空白天数
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }
    
    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isCompleted = selectedHabitId 
        ? habitHistory.some(h => h.getDate() === day && h.getMonth() === month && h.getFullYear() === year)
        : Object.values(stats).some(habitStats => 
            habitStats.completionDays.includes(day)
          );
      calendar.push({ day, isCompleted, date });
    }
    
    return calendar;
  };

  const calendarData = generateCalendarData();

  // 月份切换
  const goToPreviousMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // 获取统计摘要
  const getStatsSummary = () => {
    if (selectedHabitId) {
      const habitStats = stats[selectedHabitId];
      if (habitStats) {
        const daysInMonth = getDaysInMonth(year, month);
        const completionRate = daysInMonth > 0 
          ? Math.round((habitStats.completionDays.length / daysInMonth) * 100)
          : 0;
        return {
          totalDays: habitStats.completionDays.length,
          completionRate,
          consecutiveDays: calculateConsecutiveDays(habitStats.completionDays)
        };
      }
    } else {
      // 统计所有习惯的总体情况
      const allCompletionDays = new Set();
      Object.values(stats).forEach(habitStats => {
        habitStats.completionDays.forEach(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          allCompletionDays.add(dateStr);
        });
      });
      const daysInMonth = getDaysInMonth(year, month);
      const completionRate = daysInMonth > 0 
        ? Math.round((allCompletionDays.size / daysInMonth) * 100)
        : 0;
      return {
        totalDays: allCompletionDays.size,
        completionRate,
        consecutiveDays: 0 // 复杂度较高，简化处理
      };
    }
  };

  // 计算连续打卡天数（简化版本）
  const calculateConsecutiveDays = (completionDays) => {
    if (completionDays.length === 0) return 0;
    
    const sortedDays = [...completionDays].sort((a, b) => a - b);
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === sortedDays[i - 1] + 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  };

  const statsSummary = useMemo(() => {
    if (selectedHabitId) {
      const habitStats = stats[selectedHabitId];
      if (habitStats) {
        const daysInMonth = getDaysInMonth(year, month);
        const completionRate = daysInMonth > 0 
          ? Math.round((habitStats.completionDays.length / daysInMonth) * 100)
          : 0;
        return {
          totalDays: habitStats.completionDays.length,
          completionRate,
          consecutiveDays: calculateConsecutiveDays(habitStats.completionDays)
        };
      }
    } else {
      // 统计所有习惯的总体情况
      const allCompletionDays = new Set();
      Object.values(stats).forEach(habitStats => {
        habitStats.completionDays.forEach(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          allCompletionDays.add(dateStr);
        });
      });
      const daysInMonth = getDaysInMonth(year, month);
      const completionRate = daysInMonth > 0 
        ? Math.round((allCompletionDays.size / daysInMonth) * 100)
        : 0;
      return {
        totalDays: allCompletionDays.size,
        completionRate,
        consecutiveDays: 0 // 复杂度较高，简化处理
      };
    }
  }, [stats, selectedHabitId, year, month]);

  // 星期名称
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <PageLayout 
      title={selectedHabitName || "习惯统计"} 
      subtitle={`${year}年${month + 1}月`}
      showBackButton={true}
      onBackPress={() => {
        // 如果来源是习惯打卡页面，则返回到习惯打卡页面
        if (location.state?.from === '/habit-tracker') {
          navigate('/habit-tracker');
        } else {
          navigate(-1);
        }
      }}
    >
      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-2xl font-bold text-blue-500">{statsSummary?.totalDays || 0}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">打卡天数</div>
        </div>
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-2xl font-bold text-green-500">{statsSummary?.completionRate || 0}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">完成率</div>
        </div>
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-2xl font-bold text-purple-500">{statsSummary?.consecutiveDays || 0}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">连续天数</div>
        </div>
      </div>

      {/* 习惯选择器 */}
      {!selectedHabitId && (
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            选择习惯
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => {
              setSelectedHabitId(e.target.value);
              // 更新URL参数
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('habitId', e.target.value);
              } else {
                newParams.delete('habitId');
              }
              navigate(`?${newParams.toString()}`, { replace: true });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">查看所有习惯统计</option>
            {allHabits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {year}年{month + 1}月
        </h3>
        
        <button
          onClick={goToNextMonth}
          className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 月历 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {calendarData.map((dayData, index) => (
            <div
              key={index}
              className={`p-3 h-12 flex items-center justify-center text-sm border-t border-l border-gray-100 dark:border-gray-700 ${
                index % 7 === 0 ? 'border-l-0' : ''
              } ${
                dayData
                  ? dayData.isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-700'
                  : 'bg-gray-50 dark:bg-gray-900/50'
              }`}
            >
              {dayData && (
                <div className="relative">
                  <span className={dayData.isCompleted ? 'font-medium' : ''}>
                    {dayData.day}
                  </span>
                  {dayData.isCompleted && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>已打卡</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border border-gray-300 dark:border-gray-600 rounded-full mr-1"></div>
            <span>未打卡</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HabitStatsPage;