/**
 * 习惯打卡功能数据管理模块
 */
class HabitTracker {
  constructor() {
    this.storageKey = 'habit-tracker-data';
  }

  // 获取所有习惯
  getAllHabits() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }
      const habits = JSON.parse(data);
      return habits.map(habit => ({
        ...habit,
        createdAt: habit.createdAt ? new Date(habit.createdAt) : new Date(),
        updatedAt: habit.updatedAt ? new Date(habit.updatedAt) : new Date()
      }));
    } catch (error) {
      console.error('获取习惯数据失败:', error);
      return [];
    }
  }

  // 保存所有习惯
  saveHabits(habits) {
    try {
      const habitsWithDates = habits.map(habit => ({
        ...habit,
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(habitsWithDates));
      return true;
    } catch (error) {
      console.error('保存习惯数据失败:', error);
      return false;
    }
  }

  // 添加新习惯
  addHabit(habitData) {
    const habits = this.getAllHabits();
    const newHabit = {
      id: this.generateId(),
      name: habitData.name,
      description: habitData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: false,
      completionDates: [] // 记录打卡日期
    };
    habits.push(newHabit);
    return this.saveHabits(habits) ? newHabit : null;
  }

  // 删除习惯
  deleteHabit(habitId) {
    const habits = this.getAllHabits();
    const filteredHabits = habits.filter(habit => habit.id !== habitId);
    return this.saveHabits(filteredHabits);
  }

  // 更新习惯信息
  updateHabit(habitId, habitData) {
    const habits = this.getAllHabits();
    const habitIndex = habits.findIndex(habit => habit.id === habitId);
    if (habitIndex === -1) return false;

    habits[habitIndex] = {
      ...habits[habitIndex],
      ...habitData,
      updatedAt: new Date().toISOString()
    };

    return this.saveHabits(habits);
  }

  // 打卡/取消打卡
  toggleHabitCompletion(habitId, date = new Date()) {
    const habits = this.getAllHabits();
    const habitIndex = habits.findIndex(habit => habit.id === habitId);
    if (habitIndex === -1) return false;

    const habit = habits[habitIndex];
    const dateStr = this.formatDate(date);
    const isAlreadyCompleted = habit.completionDates.includes(dateStr);

    if (isAlreadyCompleted) {
      // 取消打卡
      habit.completionDates = habit.completionDates.filter(d => d !== dateStr);
    } else {
      // 打卡
      if (!habit.completionDates.includes(dateStr)) {
        habit.completionDates.push(dateStr);
      }
    }

    habit.completionDates.sort(); // 排序日期
    habits[habitIndex] = {
      ...habit,
      updatedAt: new Date().toISOString()
    };

    return this.saveHabits(habits);
  }

  // 获取指定日期的打卡记录
  getHabitsForDate(date = new Date()) {
    const habits = this.getAllHabits();
    const dateStr = this.formatDate(date);
    return habits.map(habit => ({
      ...habit,
      isCompleted: habit.completionDates.includes(dateStr)
    }));
  }

  // 获取月度打卡统计
  getMonthlyStats(year, month) {
    const habits = this.getAllHabits();
    const stats = {};

    habits.forEach(habit => {
      const habitStats = {
        id: habit.id,
        name: habit.name,
        completionDays: [],
        totalDays: 0
      };

      habit.completionDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          habitStats.completionDays.push(date.getDate());
          habitStats.totalDays++;
        }
      });

      stats[habit.id] = habitStats;
    });

    return stats;
  }

  // 获取习惯打卡历史
  getHabitHistory(habitId, startDate, endDate) {
    const habits = this.getAllHabits();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return [];

    return habit.completionDates
      .filter(dateStr => {
        const date = new Date(dateStr);
        return date >= startDate && date <= endDate;
      })
      .map(dateStr => new Date(dateStr));
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 获取一周的日期（倒序）
  getWeekDates(targetDate = new Date()) {
    const dates = [];
    const currentDate = new Date(targetDate);
    
    // 找到本周的周日（一周的第一天）
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day;
    const sunday = new Date(currentDate.setDate(diff));
    
    // 获取一周的日期
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    
    // 倒序排列，新日期在前
    return dates.reverse();
  }

  // 获取当月所有日期
  getMonthDates(year, month) {
    const dates = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return dates;
  }
}

// 创建全局实例
export const habitTracker = new HabitTracker();

// 便捷函数
export const getAllHabits = () => habitTracker.getAllHabits();
export const addHabit = (habitData) => habitTracker.addHabit(habitData);
export const deleteHabit = (habitId) => habitTracker.deleteHabit(habitId);
export const updateHabit = (habitId, habitData) => habitTracker.updateHabit(habitId, habitData);
export const toggleHabitCompletion = (habitId, date) => habitTracker.toggleHabitCompletion(habitId, date);
export const getHabitsForDate = (date) => habitTracker.getHabitsForDate(date);
export const getMonthlyStats = (year, month) => habitTracker.getMonthlyStats(year, month);
export const getHabitHistory = (habitId, startDate, endDate) => habitTracker.getHabitHistory(habitId, startDate, endDate);
export const getWeekDates = (targetDate) => habitTracker.getWeekDates(targetDate);
export const getMonthDates = (year, month) => habitTracker.getMonthDates(year, month);