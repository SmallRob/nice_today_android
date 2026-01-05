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

  // 生成日历数据（完整的6行7列）
  const generateCalendarData = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const dates = [];

    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      dates.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isCompleted: false,
        date: new Date(prevYear, prevMonth, prevMonthLastDay - i)
      });
    }

    // 添加当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isCompleted = selectedHabitId
        ? habitHistory.some(h => h.getDate() === day && h.getMonth() === month && h.getFullYear() === year)
        : Object.values(stats).some(habitStats =>
            habitStats.completionDays.includes(day)
          );
      const isToday = date.toDateString() === today.toDateString();
      dates.push({
        day,
        isCurrentMonth: true,
        isCompleted,
        date,
        isToday
      });
    }

    // 添加下个月的日期，补齐到42天（6行7列）
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      dates.push({
        day: i,
        isCurrentMonth: false,
        isCompleted: false,
        date: new Date(nextYear, nextMonth, i)
      });
    }

    return dates;
  };

  const calendarData = generateCalendarData();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <PageLayout
      title={selectedHabitName || "习惯统计"}
      showBackButton={true}
      onBackPress={() => {
        if (location.state?.from === '/habit-tracker') {
          navigate('/habit-tracker');
        } else {
          navigate(-1);
        }
      }}
    >
      <div style={{ padding: '0' }}>
        {/* 月份导航 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '4px 12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            &lt;
          </button>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'dark' ? '#fff' : '#1f2937'
          }}>
            {year}年{month + 1}月
          </div>
          <button
            onClick={goToNextMonth}
            style={{
              padding: '4px 12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            &gt;
          </button>
        </div>

        {/* 统计摘要 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{
            padding: '8px',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '8px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              {statsSummary?.totalDays || 0}
            </div>
            <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              打卡天数
            </div>
          </div>
          <div style={{
            padding: '8px',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '8px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
              {statsSummary?.completionRate || 0}%
            </div>
            <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              完成率
            </div>
          </div>
          <div style={{
            padding: '8px',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '8px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a855f7' }}>
              {statsSummary?.consecutiveDays || 0}
            </div>
            <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              连续天数
            </div>
          </div>
        </div>

        {/* 习惯选择器 */}
        {!selectedHabitId && (
          <div style={{ marginBottom: '12px' }}>
            <select
              value={selectedHabitId}
              onChange={(e) => {
                setSelectedHabitId(e.target.value);
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('habitId', e.target.value);
                } else {
                  newParams.delete('habitId');
                }
                navigate(`?${newParams.toString()}`, { replace: true });
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                fontSize: '13px'
              }}
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

        {/* 日历 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          overflow: 'hidden'
        }}>
          {/* 星期标题 */}
          <ol style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            padding: '4px 0',
            margin: '0',
            listStyle: 'none',
            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
          }}>
            {weekdays.map((day, index) => (
              <li key={index} style={{
                textAlign: 'center',
                fontSize: '10px',
                color: index === 0 ? '#ef4444' : index === 6 ? '#3b82f6' : theme === 'dark' ? '#9ca3af' : '#6b7280',
                padding: '4px 0'
              }}>
                {day}
              </li>
            ))}
          </ol>

          {/* 日期网格 */}
          <ol style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            padding: '0',
            margin: '0',
            listStyle: 'none',
            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
          }}>
            {calendarData.map((dayData, index) => {
              const dayOfWeek = dayData.date.getDay();
              let className = '';
              if (!dayData.isCurrentMonth) className += 'other ';
              if (dayData.isToday) className += 'now ';
              if (dayOfWeek === 0) className += 'sun ';
              if (dayOfWeek === 6) className += 'sat ';

              return (
                <li
                  key={index}
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    padding: '0',
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => {}}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '4px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: dayData.isToday ? 'bold' : 'normal',
                      color: !dayData.isCurrentMonth
                        ? (theme === 'dark' ? '#4b5563' : '#9ca3af')
                        : dayData.isToday
                        ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                        : (theme === 'dark' ? '#fff' : '#1f2937')
                    }}>
                      {dayData.day}
                    </span>
                    {dayData.isCurrentMonth && dayData.isCompleted && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: '2px'
                      }}></span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 说明 */}
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              marginRight: '4px'
            }}></div>
            <span>已打卡</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '50%',
              marginRight: '4px'
            }}></div>
            <span>未打卡</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HabitStatsPage;