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
    <PageLayout 
      title="习惯打卡" 
      subtitle="记录和追踪你的日常习惯"
      showBackButton={true}
      onBackPress={() => navigate(-1)}
      headerAction={
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          aria-label="添加习惯"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      }
    >
      {/* 一周日期导航 */}
      <div className="mb-6">
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
          {weekDates.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors min-w-[70px] text-center ${
                selectedDate.toDateString() === date.toDateString()
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-xs opacity-80">{formatDate(date)}</div>
              <div className="text-xs">{date.toLocaleDateString('zh-CN', { weekday: 'narrow' })}</div>
              {isToday(date) && (
                <div className="text-xs mt-0.5 bg-red-500 text-white rounded-full px-1 inline-block">
                  今
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 习惯列表 */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">暂无习惯</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              点击右上角"+"按钮添加第一个习惯
            </p>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-4 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              } shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleToggleCompletion(habit.id)}
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                        habit.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : theme === 'dark'
                          ? 'border-gray-500 hover:border-gray-400'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {habit.isCompleted && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 
                        onClick={() => navigate(`/habit-stats?habitId=${habit.id}`, { state: { from: '/habit-tracker' } })}
                        className={`font-medium cursor-pointer hover:underline ${habit.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="删除习惯"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加习惯模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-6 w-full max-w-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              添加新习惯
            </h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  习惯名称 *
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="例如：喝水、运动、读书"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  描述（可选）
                </label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="习惯的详细描述"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewHabit({ name: '', description: '' });
                  setError('');
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                取消
              </button>
              <button
                onClick={handleAddHabit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default HabitTrackerPage;