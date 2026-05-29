import React, { useState, useEffect, useCallback } from 'react';
import { toolsService } from '../services/toolsService';
import type { Habit } from '../types';

interface HabitTrackerPageProps {
  onBack?: () => void;
}

const HABIT_ICONS = ['🏃', '📚', '💧', '🧘', '✍️', '🎨', '🎵', '💤', '🥗', '💊'];
const HABIT_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];

const HabitTrackerPage: React.FC<HabitTrackerPageProps> = ({ onBack }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    icon: '🏃',
    color: 'bg-blue-500',
    frequency: 'daily' as Habit['frequency'],
    target: 1,
    unit: '次',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = useCallback(() => {
    const data = toolsService.getHabits();
    setHabits(data);
  }, []);

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;

    toolsService.addHabit({
      name: newHabit.name,
      description: newHabit.description,
      icon: newHabit.icon,
      color: newHabit.color,
      frequency: newHabit.frequency,
      target: newHabit.target,
      current: 0,
      unit: newHabit.unit,
      reminders: [],
    });

    setNewHabit({
      name: '',
      description: '',
      icon: '🏃',
      color: 'bg-blue-500',
      frequency: 'daily',
      target: 1,
      unit: '次',
    });
    setShowAddModal(false);
    loadHabits();
  };

  const handleToggleCompletion = (habitId: string) => {
    toolsService.recordHabitEntry(habitId, { completed: true, value: 1 });
    loadHabits();
  };

  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('确定要删除这个习惯吗？')) {
      toolsService.deleteHabit(habitId);
      loadHabits();
    }
  };

  const isCompletedToday = (habit: Habit) => {
    return habit.history.some(e => e.date === today && e.completed);
  };

  const getWeekDates = () => {
    const dates = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const completedCount = habits.filter(h => isCompletedToday(h)).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">习惯追踪</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-500 text-sm font-medium"
          >
            + 添加
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Today's progress */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">今日完成</div>
              <div className="text-3xl font-black mt-1">{completedCount}/{habits.length}</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black">{completionRate}%</div>
              <div className="text-sm opacity-80">完成率</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Week view header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">本周概览</h3>
            <span className="text-xs text-gray-500">
              {new Date(weekDates[0]).getMonth() + 1}/{new Date(weekDates[0]).getDate()} - {new Date(weekDates[6]).getMonth() + 1}/{new Date(weekDates[6]).getDate()}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, idx) => {
              const isToday = date === today;
              const completedHabits = habits.filter(h => 
                h.history.some(e => e.date === date && e.completed)
              ).length;
              
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className={`text-[10px] ${isToday ? 'font-bold text-blue-500' : 'text-gray-400'}`}>
                    {dayNames[idx]}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    isToday ? 'bg-blue-500 text-white' :
                    completedHabits > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-500' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}>
                    <span className="text-xs font-bold">{completedHabits}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit list */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
              <span className="text-4xl">🎯</span>
              <p className="text-sm text-gray-500 mt-3">还没有习惯，点击右上角添加一个吧</p>
            </div>
          ) : (
            habits.map(habit => {
              const completed = isCompletedToday(habit);
              const weekCompletion = weekDates.filter(d => 
                habit.history.some(e => e.date === d && e.completed)
              ).length;
              
              return (
                <div
                  key={habit.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all ${
                    completed ? 'border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleCompletion(habit.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        completed
                          ? 'bg-green-500'
                          : habit.color
                      }`}
                    >
                      {completed ? '✓' : habit.icon}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${completed ? 'text-green-600 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {habit.name}
                        </span>
                        {habit.currentStreak > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-full">
                            🔥 {habit.currentStreak}天
                          </span>
                        )}
                      </div>
                      
                      {habit.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{habit.description}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">
                          本周 {weekCompletion}/7
                        </span>
                        <div className="flex gap-0.5">
                          {weekDates.map((d, idx) => {
                            const done = habit.history.some(e => e.date === d && e.completed);
                            return (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        {habits.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">统计数据</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-500">
                  {habits.reduce((sum, h) => sum + h.totalCompletions, 0)}
                </div>
                <div className="text-xs text-gray-500">总完成次数</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-500">
                  {Math.max(...habits.map(h => h.bestStreak), 0)}
                </div>
                <div className="text-xs text-gray-500">最长连续天数</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {habits.length}
                </div>
                <div className="text-xs text-gray-500">追踪习惯数</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">添加习惯</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">习惯名称</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：每天运动30分钟"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">描述 (可选)</label>
                <input
                  type="text"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简单描述这个习惯..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">图标</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewHabit(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        newHabit.icon === icon
                          ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">颜色</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewHabit(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newHabit.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">频率</label>
                <div className="flex gap-2">
                  {[
                    { value: 'daily', label: '每天' },
                    { value: 'weekly', label: '每周' },
                    { value: 'monthly', label: '每月' },
                  ].map(f => (
                    <button
                      key={f.value}
                      onClick={() => setNewHabit(prev => ({ ...prev, frequency: f.value as any }))}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        newHabit.frequency === f.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">目标次数</label>
                  <input
                    type="number"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">单位</label>
                  <input
                    type="text"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="次"
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddHabit}
              disabled={!newHabit.name.trim()}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              添加习惯
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTrackerPage;