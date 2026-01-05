import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  addHabit, 
  getHabitsForDate, 
  toggleHabitCompletion, 
  getWeekDates,
  deleteHabit
} from '../utils/habitTracker';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../context/ThemeContext';

const HabitTrackerPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [habits, setHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  // 初始化一周日期
  useEffect(() => {
    setWeekDates(getWeekDates());
  }, []);

  // 获取选定日期的打卡数据
  useEffect(() => {
    const habitsForDate = getHabitsForDate(selectedDate);
    setHabits(habitsForDate);
  }, [selectedDate]);

  // 切换打卡状态
  const handleToggleCompletion = (habitId) => {
    toggleHabitCompletion(habitId, selectedDate);
    // 重新获取数据以更新状态
    const updatedHabits = getHabitsForDate(selectedDate);
    setHabits(updatedHabits);
  };

  // 添加新习惯
  const handleAddHabit = () => {
    if (!newHabit.name.trim()) {
      setError('请输入习惯名称');
      return;
    }

    const result = addHabit(newHabit);
    if (result) {
      setNewHabit({ name: '', description: '' });
      setError('');
      setShowAddModal(false);
      // 重新获取数据
      const updatedHabits = getHabitsForDate(selectedDate);
      setHabits(updatedHabits);
    } else {
      setError('添加习惯失败，请重试');
    }
  };

  // 删除习惯
  const handleDeleteHabit = (habitId) => {
    if (window.confirm('确定要删除这个习惯吗？')) {
      deleteHabit(habitId);
      const updatedHabits = getHabitsForDate(selectedDate);
      setHabits(updatedHabits);
    }
  };

  // 格式化日期显示
  const formatDate = (date) => {
    const today = new Date();
    const d = new Date(date);
    
    if (d.toDateString() === today.toDateString()) {
      return '今天';
    }
    
    const diffTime = Math.abs(today - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return d > today ? '明天' : '昨天';
    }
    
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 检查是否是今天
  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
      <PageLayout
        title="习惯打卡"
        subtitle="记录和追踪你的日常习惯"
        showBackButton={true}
        onBackPress={() => navigate(-1)}
        headerAction={
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            aria-label="添加习惯"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      >
        <div style={{ padding: '0' }}>
          {/* 一周日期导航 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '8px 4px',
              margin: '0 -4px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gap: '6px'
            }}>
              {weekDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    flexShrink: 0,
                    width: '64px',
                    minHeight: '64px',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedDate.toDateString() === date.toDateString()
                      ? '#3b82f6'
                      : (theme === 'dark' ? '#374151' : '#f3f4f6'),
                    color: selectedDate.toDateString() === date.toDateString()
                      ? '#fff'
                      : (theme === 'dark' ? '#d1d5db' : '#374151')
                  }}
                >
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>
                    {formatDate(date)}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600' }}>
                    {date.toLocaleDateString('zh-CN', { weekday: 'narrow' })}
                  </div>
                  {isToday(date) && (
                    <div style={{
                      fontSize: '10px',
                      marginTop: '4px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      borderRadius: '9999px',
                      padding: '1px 6px',
                      display: 'inline-block',
                      fontWeight: '500'
                    }}>
                      今
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 习惯列表 */}
          <div style={{ marginTop: '12px' }}>
            {habits.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  暂无习惯
                </div>
                <p style={{
                  fontSize: '13px',
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  margin: 0
                }}>
                  点击右上角"+"按钮添加第一个习惯
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <button
                          onClick={() => handleToggleCompletion(habit.id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: habit.isCompleted ? '#22c55e' : 'transparent',
                            borderColor: habit.isCompleted
                              ? '#22c55e'
                              : (theme === 'dark' ? '#6b7280' : '#d1d5db')
                          }}
                        >
                          {habit.isCompleted && (
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3
                            onClick={() => navigate(`/habit-stats?habitId=${habit.id}`, { state: { from: '/habit-tracker' } })}
                            style={{
                              fontSize: '15px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              margin: 0,
                              textDecoration: habit.isCompleted ? 'line-through' : 'none',
                              color: habit.isCompleted
                                ? (theme === 'dark' ? '#6b7280' : '#9ca3af')
                                : (theme === 'dark' ? '#fff' : '#111827'),
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {habit.name}
                          </h3>
                          {habit.description && (
                            <p style={{
                              fontSize: '13px',
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                              margin: '4px 0 0 0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {habit.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        style={{
                          marginLeft: '8px',
                          padding: '4px',
                          color: theme === 'dark' ? '#9ca3af' : '#9ca3af',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s'
                        }}
                        aria-label="删除习惯"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 添加习惯模态框 */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50
          }}>
            <div style={{
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme === 'dark' ? '#fff' : '#111827',
                margin: '0 0 16px 0'
              }}>
                添加新习惯
              </h3>

              {error && (
                <div style={{
                  marginBottom: '16px',
                  padding: '8px 12px',
                  backgroundColor: '#fecaca',
                  color: '#b91c1c',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: theme === 'dark' ? '#d1d5db' : '#374151'
                  }}>
                    习惯名称 *
                  </label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="例如：喝水、运动、读书"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#111827',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: theme === 'dark' ? '#d1d5db' : '#374151'
                  }}>
                    描述（可选）
                  </label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    placeholder="习惯的详细描述"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#111827',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewHabit({ name: '', description: '' });
                    setError('');
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleAddHabit}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  );
};

export default HabitTrackerPage;