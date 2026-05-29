/**
 * 工具集域服务
 * 提供工具集域的业务逻辑
 */

import { storageService } from '../../../services/storageService';
import type {
  TodoItem,
  Subtask,
  Habit,
  HabitEntry,
  HabitStats,
  Document,
  ToolsModuleId,
} from '../types';

const STORAGE_PREFIX = 'nice_today_tools_';

export const toolsService = {
  // ==================== 待办事项 ====================
  
  getTodos: (): TodoItem[] => {
    return storageService.getItemSync<TodoItem[]>('todo_list', []);
  },

  saveTodos: (todos: TodoItem[]): void => {
    storageService.setItem('todo_list', todos);
  },

  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): TodoItem => {
    const todos = toolsService.getTodos();
    const newTodo: TodoItem = {
      ...todo,
      id: `todo_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.unshift(newTodo);
    toolsService.saveTodos(todos);
    return newTodo;
  },

  updateTodo: (todoId: string, updates: Partial<TodoItem>): void => {
    const todos = toolsService.getTodos();
    const index = todos.findIndex(t => t.id === todoId);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
      toolsService.saveTodos(todos);
    }
  },

  deleteTodo: (todoId: string): void => {
    const todos = toolsService.getTodos().filter(t => t.id !== todoId);
    toolsService.saveTodos(todos);
  },

  toggleTodoComplete: (todoId: string): void => {
    const todos = toolsService.getTodos();
    const index = todos.findIndex(t => t.id === todoId);
    if (index !== -1) {
      todos[index].completed = !todos[index].completed;
      todos[index].completedDate = todos[index].completed ? new Date().toISOString() : undefined;
      todos[index].updatedAt = new Date().toISOString();
      toolsService.saveTodos(todos);
    }
  },

  getTodosByFilter: (filter: 'all' | 'active' | 'completed'): TodoItem[] => {
    const todos = toolsService.getTodos();
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  },

  getTodoStats: (): { total: number; active: number; completed: number } => {
    const todos = toolsService.getTodos();
    return {
      total: todos.length,
      active: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length,
    };
  },

  // ==================== 习惯追踪 ====================

  getHabits: (): Habit[] => {
    return storageService.getItemSync<Habit[]>('habit_list', []);
  },

  saveHabits: (habits: Habit[]): void => {
    storageService.setItem('habit_list', habits);
  },

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'bestStreak' | 'currentStreak' | 'totalCompletions' | 'history'>): Habit => {
    const habits = toolsService.getHabits();
    const newHabit: Habit = {
      ...habit,
      id: `habit_${Date.now()}`,
      bestStreak: 0,
      currentStreak: 0,
      totalCompletions: 0,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    toolsService.saveHabits(habits);
    return newHabit;
  },

  updateHabit: (habitId: string, updates: Partial<Habit>): void => {
    const habits = toolsService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates, updatedAt: new Date().toISOString() };
      toolsService.saveHabits(habits);
    }
  },

  deleteHabit: (habitId: string): void => {
    const habits = toolsService.getHabits().filter(h => h.id !== habitId);
    toolsService.saveHabits(habits);
  },

  recordHabitEntry: (habitId: string, entry: Omit<HabitEntry, 'date'>): void => {
    const habits = toolsService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const existingEntryIndex = habits[index].history.findIndex(e => e.date === today);
      
      const habitEntry: HabitEntry = {
        ...entry,
        date: today,
      };

      if (existingEntryIndex !== -1) {
        habits[index].history[existingEntryIndex] = habitEntry;
      } else {
        habits[index].history.push(habitEntry);
      }

      // Update stats
      if (entry.completed) {
        habits[index].totalCompletions++;
        habits[index].current++;
        
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const hadYesterday = habits[index].history.some(e => e.date === yesterdayStr && e.completed);
        
        if (hadYesterday || habits[index].currentStreak === 0) {
          habits[index].currentStreak++;
        }
        
        if (habits[index].currentStreak > habits[index].bestStreak) {
          habits[index].bestStreak = habits[index].currentStreak;
        }
      }

      habits[index].updatedAt = new Date().toISOString();
      toolsService.saveHabits(habits);
    }
  },

  getHabitStats: (habitId: string): HabitStats | null => {
    const habits = toolsService.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const completedLast7 = last7Days.filter(d => 
      habit.history.some(e => e.date === d && e.completed)
    ).length;

    const completionRate = habit.history.length > 0 
      ? (habit.totalCompletions / habit.history.length) * 100 
      : 0;

    return {
      habitId: habit.id,
      completionRate,
      averagePerWeek: completedLast7,
      bestDay: '',
      worstDay: '',
      trends: {
        weekly: 'stable',
        monthly: 'stable',
      },
      insights: [],
    };
  },

  // ==================== 通用功能 ====================

  getModuleData: <T>(moduleId: ToolsModuleId, key: string): T | null => {
    const storageKey = `${moduleId}_${key}`;
    return storageService.getItemSync<T | null>(storageKey, null);
  },

  saveModuleData: <T>(moduleId: ToolsModuleId, key: string, data: T): void => {
    const storageKey = `${moduleId}_${key}`;
    storageService.setItem(storageKey, data);
  },

  clearAllToolsData: (): void => {
    storageService.removeItem('todo_list');
    storageService.removeItem('habit_list');
  },

  getToolsDataStats: (): { [key: string]: number } => {
    const todos = toolsService.getTodos();
    const habits = toolsService.getHabits();
    return {
      todos: todos.length,
      habits: habits.length,
    };
  },
};