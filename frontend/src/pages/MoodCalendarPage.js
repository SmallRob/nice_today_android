import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { calculateLunarDate } from '../utils/LunarCalendarHelper';
import PageLayout from '../components/PageLayout';


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
  const { theme } = useTheme();
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
      <div style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
        borderRadius: '8px',
        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        overflow: 'hidden',
        padding: '12px 0',
        marginBottom: '12px'
      }}>
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
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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

        {/* 星期标题 */}
        <ol style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          padding: '4px 0',
          margin: '0',
          listStyle: 'none',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {dayNames.map((day, index) => (
            <li key={day} style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: '600',
              color: index === 0 ? '#ef4444' : index === 6 ? '#3b82f6' : theme === 'dark' ? '#9ca3af' : '#6b7280',
              padding: '4px 0'
            }}>
              {day}
            </li>
          ))}
        </ol>

        {/* 日期网格 - 紧凑版 */}
        <ol style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          padding: '0',
          margin: '0',
          listStyle: 'none',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {monthData.map((day, index) => {
            const dayOfWeek = day.date.getDay();
            
            return (
              <li
                key={index}
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                  padding: '0',
                  position: 'relative',
                  cursor: day.isCurrentMonth && day.date <= new Date().setHours(0, 0, 0, 0) ? 'pointer' : 'default',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleDayClick(day)}
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
                    fontWeight: day.isToday ? 'bold' : 'normal',
                    color: !day.isCurrentMonth
                      ? (theme === 'dark' ? '#4b5563' : '#9ca3af')
                      : day.isToday
                      ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                      : (theme === 'dark' ? '#fff' : '#1f2937')
                  }}>
                    {day.date.getDate()}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    color: !day.isCurrentMonth
                      ? (theme === 'dark' ? '#6b7280' : '#9ca3af')
                      : (theme === 'dark' ? '#9ca3af' : '#6b7280'),
                    marginTop: '1px'
                  }}>
                    {day.lunarDate || ' '}
                  </span>
                  
                  {/* 心情指示器 - 绿色圆点 */}
                  {day.hasMood && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#22c55e',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      right: '2px'
                    }}></span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
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
      } else if (existingMood && (description || moodDescription)) {
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
      } else if (existingMood) {
        // 如果有现有心情且没有新选择，但描述有变化，也应更新
        moodToSave = {
          ...existingMood,
          description: description || moodDescription
        };
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
        // 但需要确保有现有心情记录才能只更新描述
        const existingMood = moodStorage.getMoodForDate(selectedMoodDate);
        if (existingMood && moodDescription.trim() !== '') {
          handleMoodSelect(null, moodDescription);
        } else if (moodDescription.trim() !== '') {
          // 如果没有现有心情记录但有描述，应该提示用户选择一个心情
          alert('请先选择一个心情表情');
          return;
        } else {
          // 如果描述为空且没有选择心情，直接关闭
          setShowMoodSelector(false);
          setSelectedMoodDate(null);
          setCurrentSelectedMood(null); // 清空当前选择的状态
          setMoodDescription('');
        }
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
    <div style={{ minHeight: '100vh', backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb', padding: '0' }}>
      <PageLayout
        title="心情日历"
        showBackButton={true}
        onBackPress={handleBack}
      >
        <div style={{ padding: '0' }}>
          {/* 选中日期信息 */}
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '8px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            padding: '24px',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  margin: 0
                }}>
                  {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  <p style={{
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
                  </p>
                  {/* 农历信息 */}
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
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
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{currentMood.emoji}</div>
                  <div style={{
                    fontSize: '14px',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}>{currentMood.label}</div>
                  {currentMood.description && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      padding: '8px',
                      borderRadius: '4px',
                      maxWidth: '200px'
                    }}>
                      {currentMood.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 操作按钮区域 */}
            <div style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280'
              }}>
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
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {currentMood ? '调整心情' : '新增心情'}
                  </button>
                ) : isFuture ? (
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#d1d5db',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'not-allowed'
                    }}
                    disabled
                  >
                    未来日期
                  </button>
                ) : currentMood ? (
                  <button
                    onClick={handleEditMood}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    查看/调整心情
                  </button>
                ) : (
                  <button
                    onClick={handleEditMood}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    添加心情
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 日历视图 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          overflow: 'hidden'
        }}>
          <CalendarView 
            onMoodSelect={handleEditMood}
          />
        </div>

        {/* 说明文字 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          padding: '16px',
          fontSize: '14px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          marginBottom: '12px'
        }}>
          <p style={{ margin: '4px 0' }}>• 点击日历中的日期可以添加或查看当天心情</p>
          <p style={{ margin: '4px 0' }}>• 今天和未来日期可以修改心情记录</p>
          <p style={{ margin: '4px 0' }}>• 历史日期的心情记录不可修改</p>
        </div>
      </PageLayout>
      
      {/* 心情选择器弹窗 */}
      {showMoodSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: theme === 'dark' ? '#fff' : '#111827',
                margin: 0
              }}>
                {selectedMoodDate && typeof selectedMoodDate === 'object' && selectedMoodDate.toLocaleDateString ? selectedMoodDate.toLocaleDateString('zh-CN') : ''}
              </h3>
              <button
                onClick={closeMoodSelector}
                style={{
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {getAllMoodEmojis().map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => {
                    setCurrentSelectedMood(mood.value); // Update the selected mood state
                    // Don't save immediately, just set the selected mood
                    // User can add description and click save button
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: currentSelectedMood === mood.value || (selectedMoodDate && !currentSelectedMood && moodStorage.getMoodForDate(selectedMoodDate)?.type === mood.value)
                      ? '2px solid #3b82f6'  // border-blue-500
                      : '2px solid transparent',
                    backgroundColor: currentSelectedMood === mood.value || (selectedMoodDate && !currentSelectedMood && moodStorage.getMoodForDate(selectedMoodDate)?.type === mood.value)
                      ? '#eff6ff'  // bg-blue-50
                      : theme === 'dark' ? '#374151' : '#f9fafb',  // dark:bg-gray-700 : bg-gray-50
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <span style={{ fontSize: '1.5em' }}>{mood.emoji}</span>
                  <span style={{
                    fontSize: '12px',
                    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}>{mood.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#111827',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
                rows="2"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={closeMoodSelector}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveMoodAndDescription}
                  disabled={!moodDescription.trim() && !currentSelectedMood}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: moodDescription.trim() || currentSelectedMood
                      ? '#3b82f6'  // bg-blue-500
                      : theme === 'dark' ? '#4b5563' : '#d1d5db',  // bg-gray-300 dark:bg-gray-600
                    color: moodDescription.trim() || currentSelectedMood
                      ? '#fff'  // text-white
                      : theme === 'dark' ? '#9ca3af' : '#9ca3af',  // text-gray-500 dark:text-gray-400
                    border: 'none',
                    borderRadius: '6px',
                    cursor: moodDescription.trim() || currentSelectedMood ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
                  }}
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