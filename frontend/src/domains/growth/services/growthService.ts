/**
 * 成长管理域服务
 * 提供成长管理域的业务逻辑
 */

import { storageService } from '../../../services/storageService';
import type {
  MBTIResult,
  PersonalityTestResult,
  LifeTrend,
  GrowthGoal,
  Milestone,
  GrowthModuleId,
} from '../types';

const STORAGE_PREFIX = 'nice_today_growth_';

export const growthService = {
  // ==================== MBTI测试 ====================

  getMBTIResult: (): MBTIResult | null => {
    return storageService.getItemSync<MBTIResult | null>('mbti_result', null);
  },

  saveMBTIResult: (result: MBTIResult): void => {
    storageService.setItem('mbti_result', result);
  },

  // ==================== 性格测试 ====================

  getPersonalityResults: (): PersonalityTestResult[] => {
    return storageService.getItemSync<PersonalityTestResult[]>('personality_results', []);
  },

  savePersonalityResult: (result: PersonalityTestResult): void => {
    const results = growthService.getPersonalityResults();
    results.push(result);
    storageService.setItem('personality_results', results);
  },

  getLatestPersonalityResult: (): PersonalityTestResult | null => {
    const results = growthService.getPersonalityResults();
    return results.length > 0 ? results[results.length - 1] : null;
  },

  // ==================== 成长目标 ====================

  getGoals: (): GrowthGoal[] => {
    return storageService.getItemSync<GrowthGoal[]>('growth_goals', []);
  },

  saveGoals: (goals: GrowthGoal[]): void => {
    storageService.setItem('growth_goals', goals);
  },

  addGoal: (goal: Omit<GrowthGoal, 'id' | 'createdAt' | 'updatedAt'>): GrowthGoal => {
    const goals = growthService.getGoals();
    const newGoal: GrowthGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    growthService.saveGoals(goals);
    return newGoal;
  },

  updateGoal: (goalId: string, updates: Partial<GrowthGoal>): void => {
    const goals = growthService.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
      growthService.saveGoals(goals);
    }
  },

  deleteGoal: (goalId: string): void => {
    const goals = growthService.getGoals().filter(g => g.id !== goalId);
    growthService.saveGoals(goals);
  },

  updateGoalProgress: (goalId: string, progress: number): void => {
    const goals = growthService.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      goals[index].progress = Math.min(100, Math.max(0, progress));
      goals[index].updatedAt = new Date().toISOString();
      
      if (goals[index].progress === 100) {
        goals[index].status = 'completed';
      }
      
      growthService.saveGoals(goals);
    }
  },

  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id'>): void => {
    const goals = growthService.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      const newMilestone: Milestone = {
        ...milestone,
        id: `milestone_${Date.now()}`,
      };
      goals[index].milestones.push(newMilestone);
      goals[index].updatedAt = new Date().toISOString();
      growthService.saveGoals(goals);
    }
  },

  toggleMilestone: (goalId: string, milestoneId: string): void => {
    const goals = growthService.getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      const milestoneIndex = goals[goalIndex].milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex !== -1) {
        goals[goalIndex].milestones[milestoneIndex].completed = !goals[goalIndex].milestones[milestoneIndex].completed;
        goals[goalIndex].milestones[milestoneIndex].completedDate = 
          goals[goalIndex].milestones[milestoneIndex].completed ? new Date().toISOString() : undefined;
        goals[goalIndex].updatedAt = new Date().toISOString();
        growthService.saveGoals(goals);
      }
    }
  },

  getActiveGoals: (): GrowthGoal[] => {
    return growthService.getGoals().filter(g => g.status === 'in_progress' || g.status === 'not_started');
  },

  getCompletedGoals: (): GrowthGoal[] => {
    return growthService.getGoals().filter(g => g.status === 'completed');
  },

  getGoalStats: (): { total: number; active: number; completed: number; averageProgress: number } => {
    const goals = growthService.getGoals();
    const active = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started');
    const completed = goals.filter(g => g.status === 'completed');
    const averageProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
      : 0;
    
    return {
      total: goals.length,
      active: active.length,
      completed: completed.length,
      averageProgress,
    };
  },

  // ==================== 通用功能 ====================

  getModuleData: <T>(moduleId: GrowthModuleId, key: string): T | null => {
    const storageKey = `${moduleId}_${key}`;
    return storageService.getItemSync<T | null>(storageKey, null);
  },

  saveModuleData: <T>(moduleId: GrowthModuleId, key: string, data: T): void => {
    const storageKey = `${moduleId}_${key}`;
    storageService.setItem(storageKey, data);
  },

  clearAllGrowthData: (): void => {
    storageService.removeItem('mbti_result');
    storageService.removeItem('personality_results');
    storageService.removeItem('growth_goals');
  },
};