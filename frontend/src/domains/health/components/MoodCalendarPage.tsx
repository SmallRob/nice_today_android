import React, { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';
import type { MoodEntry, MoodCalendar as MoodCalendarType } from '../types';

interface MoodCalendarPageProps {
  onBack?: () => void;
}

const MOOD_OPTIONS = [
  { value: 5, emoji: '😄', label: '非常开心', color: 'bg-yellow-400' },
  { value: 4, emoji: '😊', label: '开心', color: 'bg-green-400' },
  { value: 3, emoji: '😐', label: '一般', color: 'bg-gray-400' },
  { value: 2, emoji: '😫', label: '疲劳', color: 'bg-purple-400' },
  { value: 1, emoji: '😩', label: '心累', color: 'bg-indigo-400' },
];

const ENERGY_OPTIONS = [
  { value: 5, emoji: '⚡', label: '精力充沛' },
  { value: 4, emoji: '🔋', label: '活力充足' },
  { value: 3, emoji: '🔌', label: '一般' },
  { value: 2, emoji: '🪫', label: '疲惫' },
  { value: 1, emoji: '💤', label: '极度疲惫' },
];

const STRESS_OPTIONS = [
  { value: 1, emoji: '😌', label: '放松' },
  { value: 2, emoji: '🙂', label: '轻松' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 4, emoji: '😰', label: '紧张' },
  { value: 5, emoji: '🤯', label: '压力山大' },
];

const MoodCalendarPage: React.FC<MoodCalendarPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodCalendar, setMoodCalendar] = useState<MoodCalendarType | null>(null);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<MoodEntry>>({});

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  useEffect(() => {
    const entry = healthService.getMoodEntry(todayStr);
    setTodayEntry(entry);
  }, [todayStr]);

  const loadMonthData = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const data = healthService.getMoodCalendar(monthStr);
    setMoodCalendar(data);
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (dateStr > todayStr) return;
    
    setSelectedDate(date);
    const entry = healthService.getMoodEntry(dateStr);
    setEditingEntry(entry || {
      date: dateStr,
      mood: 3,
      energy: 3,
      stress: 3,
      sleep: 3,
      notes: '',
      tags: [],
    });
    setShowMoodSelector(true);
  };

  const handleSaveMood = () => {
    if (!editingEntry.date) return;
    
    const entry: MoodEntry = {
      date: editingEntry.date!,
      mood: editingEntry.mood || 3,
      energy: editingEntry.energy || 3,
      stress: editingEntry.stress || 3,
      sleep: editingEntry.sleep || 3,
      notes: editingEntry.notes,
      tags: editingEntry.tags,
    };
    
    healthService.saveMoodEntry(entry);
    
    if (entry.date === todayStr) {
      setTodayEntry(entry);
    }
    
    loadMonthData();
    setShowMoodSelector(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMoodEmoji = (mood: number) => {
    return MOOD_OPTIONS.find(m => m.value === mood)?.emoji || '😐';
  };

  const getMoodColor = (mood: number) => {
    return MOOD_OPTIONS.find(m => m.value === mood)?.color || 'bg-gray-400';
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500">
              ← 返回
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">情绪日历</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Today's mood card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">今日心情</h2>
          {todayEntry ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getMoodEmoji(todayEntry.mood)}</span>
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.label}
                </div>
                <div className="flex gap-3 text-sm text-gray-500">
                  <span>能量: {ENERGY_OPTIONS.find(e => e.value === todayEntry.energy)?.emoji}</span>
                  <span>压力: {STRESS_OPTIONS.find(s => s.value === todayEntry.stress)?.emoji}</span>
                </div>
                {todayEntry.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{todayEntry.notes}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingEntry(todayEntry);
                  setShowMoodSelector(true);
                }}
                className="text-blue-500 text-sm"
              >
                编辑
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingEntry({
                  date: todayStr,
                  mood: 3,
                  energy: 3,
                  stress: 3,
                  sleep: 3,
                  notes: '',
                });
                setShowMoodSelector(true);
              }}
              className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500 font-medium"
            >
              + 记录今日心情
            </button>
          )}
        </div>

        {/* Statistics */}
        {moodCalendar && moodCalendar.statistics.averageMood > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">本月统计</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl">{getMoodEmoji(Math.round(moodCalendar.statistics.averageMood))}</div>
                <div className="text-xs text-gray-500 mt-1">平均心情</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{ENERGY_OPTIONS.find(e => e.value === Math.round(moodCalendar.statistics.averageEnergy))?.emoji || '🔋'}</div>
                <div className="text-xs text-gray-500 mt-1">平均能量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{STRESS_OPTIONS.find(s => s.value === Math.round(moodCalendar.statistics.averageStress))?.emoji || '😐'}</div>
                <div className="text-xs text-gray-500 mt-1">平均压力</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div className={`text-xs px-2 py-1 rounded-full ${
                moodCalendar.statistics.trends.mood === 'improving' ? 'bg-green-100 text-green-700' :
                moodCalendar.statistics.trends.mood === 'declining' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                心情 {moodCalendar.statistics.trends.mood === 'improving' ? '↑' : moodCalendar.statistics.trends.mood === 'declining' ? '↓' : '→'}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                moodCalendar.statistics.trends.energy === 'improving' ? 'bg-green-100 text-green-700' :
                moodCalendar.statistics.trends.energy === 'declining' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                能量 {moodCalendar.statistics.trends.energy === 'improving' ? '↑' : moodCalendar.statistics.trends.energy === 'declining' ? '↓' : '→'}
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 text-gray-500 hover:text-gray-700">
              ←
            </button>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {currentMonth.getFullYear()}年{monthNames[currentMonth.getMonth()]}
            </h3>
            <button onClick={handleNextMonth} className="p-2 text-gray-500 hover:text-gray-700">
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) return <div key={index} />;
              
              const dateStr = date.toISOString().split('T')[0];
              const entry = moodCalendar?.entries.find(e => e.date === dateStr);
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isFuture}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                    isFuture ? 'opacity-40 cursor-not-allowed' :
                    isSelected ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500' :
                    isToday ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`${
                    isToday ? 'font-bold text-blue-600 dark:text-blue-400' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {date.getDate()}
                  </span>
                  {entry && (
                    <span className="text-lg leading-none">{getMoodEmoji(entry.mood)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-sm text-gray-500">
          <p>• 点击日历中的日期可以添加或查看当天心情</p>
          <p>• 记录每日心情有助于了解自己的情绪变化规律</p>
        </div>
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingEntry.date}
              </h3>
              <button onClick={() => setShowMoodSelector(false)} className="text-gray-400 text-xl">
                ✕
              </button>
            </div>

            {/* Mood selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">心情</label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setEditingEntry(prev => ({ ...prev, mood: mood.value }))}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      editingEntry.mood === mood.value
                        ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs mt-1">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">能量</label>
              <div className="grid grid-cols-5 gap-2">
                {ENERGY_OPTIONS.map(energy => (
                  <button
                    key={energy.value}
                    onClick={() => setEditingEntry(prev => ({ ...prev, energy: energy.value }))}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      editingEntry.energy === energy.value
                        ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{energy.emoji}</span>
                    <span className="text-xs mt-1">{energy.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">压力</label>
              <div className="grid grid-cols-5 gap-2">
                {STRESS_OPTIONS.map(stress => (
                  <button
                    key={stress.value}
                    onClick={() => setEditingEntry(prev => ({ ...prev, stress: stress.value }))}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      editingEntry.stress === stress.value
                        ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{stress.emoji}</span>
                    <span className="text-xs mt-1">{stress.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">备注</label>
              <textarea
                value={editingEntry.notes || ''}
                onChange={(e) => setEditingEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="记录今天的心情..."
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveMood}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              保存心情
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCalendarPage;
