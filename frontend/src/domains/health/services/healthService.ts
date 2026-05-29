/**
 * 健康管理域服务
 * 提供健康管理相关的业务逻辑
 */

import { storageService } from '../../../services/storageService';
import { globalUserConfigService } from '../../../services/globalUserConfig';
import type { UserProfile } from '../../../types/user';
import type {
  BiorhythmData,
  BiorhythmHistory,
  HealthDashboard,
  MoodEntry,
  MoodCalendar,
  MoodStatistics,
  BodyMetrics,
  BodyMetricsHistory,
  HealthGoal,
  SleepData,
  SleepStatistics,
  PeriodEntry,
  PeriodCycle,
  OrganRhythm,
  WuxingHealth,
  EnergyTree,
  EnergyActivity,
  HealthModuleId,
} from '../types';

const STORAGE_PREFIX = 'nice_today_health_';

export const healthService = {
  // 用户信息获取
  getUserProfile: (): UserProfile => {
    return globalUserConfigService.loadProfile();
  },

  // 生物节律
  getBiorhythmData: (date: string): BiorhythmData | null => {
    const key = `biorhythm_${date}`;
    return storageService.getItemSync<BiorhythmData | null>(key, null);
  },

  saveBiorhythmData: (data: BiorhythmData): void => {
    const key = `biorhythm_${data.date}`;
    storageService.setItem(key, data);
  },

  getBiorhythmHistory: (startDate: string, endDate: string): BiorhythmHistory => {
    const data: BiorhythmData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const biorhythm = healthService.getBiorhythmData(dateStr);
      if (biorhythm) {
        data.push(biorhythm);
      }
    }
    
    // 计算趋势
    const trends = {
      physical: healthService.calculateTrend(data.map(d => d.physical)),
      emotional: healthService.calculateTrend(data.map(d => d.emotional)),
      intellectual: healthService.calculateTrend(data.map(d => d.intellectual)),
    };
    
    return {
      startDate,
      endDate,
      data,
      trends,
    };
  },

  calculateTrend: (values: number[]): 'rising' | 'falling' | 'stable' => {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 5) return 'rising';
    if (diff < -5) return 'falling';
    return 'stable';
  },

  // 健康仪表盘
  getHealthDashboard: (): HealthDashboard | null => {
    return storageService.getItemSync<HealthDashboard | null>('health_dashboard', null);
  },

  saveHealthDashboard: (dashboard: HealthDashboard): void => {
    storageService.setItem('health_dashboard', dashboard);
  },

  updateHealthDashboard: (updates: Partial<HealthDashboard>): void => {
    const current = healthService.getHealthDashboard();
    if (current) {
      healthService.saveHealthDashboard({ ...current, ...updates });
    }
  },

  // 情绪日历
  getMoodEntry: (date: string): MoodEntry | null => {
    const key = `mood_${date}`;
    return storageService.getItemSync<MoodEntry | null>(key, null);
  },

  saveMoodEntry: (entry: MoodEntry): void => {
    const key = `mood_${entry.date}`;
    storageService.setItem(key, entry);
  },

  getMoodCalendar: (month: string): MoodCalendar => {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const entries: MoodEntry[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = healthService.getMoodEntry(dateStr);
      if (entry) {
        entries.push(entry);
      }
    }
    
    const statistics = healthService.calculateMoodStatistics(entries);
    
    return {
      month,
      entries,
      statistics,
    };
  },

  calculateMoodStatistics: (entries: MoodEntry[]): MoodStatistics => {
    if (entries.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        moodDistribution: {
          excellent: 0,
          good: 0,
          neutral: 0,
          poor: 0,
          terrible: 0,
        },
        trends: {
          mood: 'stable',
          energy: 'stable',
          stress: 'stable',
        },
      };
    }
    
    const totalMood = entries.reduce((sum, e) => sum + e.mood, 0);
    const totalEnergy = entries.reduce((sum, e) => sum + e.energy, 0);
    const totalStress = entries.reduce((sum, e) => sum + e.stress, 0);
    const totalSleep = entries.reduce((sum, e) => sum + e.sleep, 0);
    
    const moodDistribution = {
      excellent: entries.filter(e => e.mood === 5).length,
      good: entries.filter(e => e.mood === 4).length,
      neutral: entries.filter(e => e.mood === 3).length,
      poor: entries.filter(e => e.mood === 2).length,
      terrible: entries.filter(e => e.mood === 1).length,
    };
    
    // 计算趋势（简化版）
    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(0, -7);
    
    const recentMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
    const olderMood = olderEntries.length > 0 ? olderEntries.reduce((sum, e) => sum + e.mood, 0) / olderEntries.length : recentMood;
    
    const recentEnergy = recentEntries.reduce((sum, e) => sum + e.energy, 0) / recentEntries.length;
    const olderEnergy = olderEntries.length > 0 ? olderEntries.reduce((sum, e) => sum + e.energy, 0) / olderEntries.length : recentEnergy;
    
    const recentStress = recentEntries.reduce((sum, e) => sum + e.stress, 0) / recentEntries.length;
    const olderStress = olderEntries.length > 0 ? olderEntries.reduce((sum, e) => sum + e.stress, 0) / olderEntries.length : recentStress;
    
    return {
      averageMood: totalMood / entries.length,
      averageEnergy: totalEnergy / entries.length,
      averageStress: totalStress / entries.length,
      averageSleep: totalSleep / entries.length,
      moodDistribution,
      trends: {
        mood: recentMood > olderMood + 0.5 ? 'improving' : recentMood < olderMood - 0.5 ? 'declining' : 'stable',
        energy: recentEnergy > olderEnergy + 0.5 ? 'improving' : recentEnergy < olderEnergy - 0.5 ? 'declining' : 'stable',
        stress: recentStress > olderStress + 0.5 ? 'improving' : recentStress < olderStress - 0.5 ? 'declining' : 'stable',
      },
    };
  },

  // 身体指标
  getBodyMetrics: (date: string): BodyMetrics | null => {
    const key = `body_metrics_${date}`;
    return storageService.getItemSync<BodyMetrics | null>(key, null);
  },

  saveBodyMetrics: (metrics: BodyMetrics): void => {
    const key = `body_metrics_${metrics.date}`;
    storageService.setItem(key, metrics);
  },

  getBodyMetricsHistory: (startDate: string, endDate: string): BodyMetricsHistory => {
    const metrics: BodyMetrics[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const metric = healthService.getBodyMetrics(dateStr);
      if (metric) {
        metrics.push(metric);
      }
    }
    
    // 计算趋势
    const weights = metrics.filter(m => m.weight).map(m => m.weight!);
    const bmis = metrics.filter(m => m.bmi).map(m => m.bmi!);
    const bodyFats = metrics.filter(m => m.bodyFat).map(m => m.bodyFat!);
    
    const trends = {
      weight: healthService.calculateTrend(weights),
      bmi: healthService.calculateTrend(bmis),
      bodyFat: healthService.calculateTrend(bodyFats),
    };
    
    // 获取目标
    const goals = healthService.getHealthGoals();
    
    return {
      startDate,
      endDate,
      metrics,
      trends,
      goals,
    };
  },

  // 健康目标
  getHealthGoals: (): HealthGoal[] => {
    return storageService.getItemSync<HealthGoal[]>('health_goals', []);
  },

  saveHealthGoals: (goals: HealthGoal[]): void => {
    storageService.setItem('health_goals', goals);
  },

  addHealthGoal: (goal: HealthGoal): void => {
    const goals = healthService.getHealthGoals();
    goals.push(goal);
    healthService.saveHealthGoals(goals);
  },

  updateHealthGoal: (goalId: string, updates: Partial<HealthGoal>): void => {
    const goals = healthService.getHealthGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      healthService.saveHealthGoals(goals);
    }
  },

  deleteHealthGoal: (goalId: string): void => {
    const goals = healthService.getHealthGoals().filter(g => g.id !== goalId);
    healthService.saveHealthGoals(goals);
  },

  // 睡眠数据
  getSleepData: (date: string): SleepData | null => {
    const key = `sleep_${date}`;
    return storageService.getItemSync<SleepData | null>(key, null);
  },

  saveSleepData: (data: SleepData): void => {
    const key = `sleep_${data.date}`;
    storageService.setItem(key, data);
  },

  getSleepStatistics: (days: number = 30): SleepStatistics => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sleepData: SleepData[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const data = healthService.getSleepData(dateStr);
      if (data) {
        sleepData.push(data);
      }
    }
    
    if (sleepData.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        sleepDebt: 0,
        consistency: 0,
        bestDay: '',
        worstDay: '',
        recommendations: [],
      };
    }
    
    const totalDuration = sleepData.reduce((sum, d) => sum + d.duration, 0);
    const totalQuality = sleepData.reduce((sum, d) => sum + d.quality, 0);
    
    const bestDay = sleepData.reduce((best, d) => d.quality > best.quality ? d : best);
    const worstDay = sleepData.reduce((worst, d) => d.quality < worst.quality ? d : worst);
    
    // 计算一致性（简化版）
    const durations = sleepData.map(d => d.duration);
    const avgDuration = totalDuration / sleepData.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const consistency = Math.max(0, 100 - variance * 10);
    
    return {
      averageDuration: totalDuration / sleepData.length,
      averageQuality: totalQuality / sleepData.length,
      sleepDebt: Math.max(0, (8 - avgDuration) * sleepData.length),
      consistency,
      bestDay: bestDay.date,
      worstDay: worstDay.date,
      recommendations: healthService.generateSleepRecommendations(avgDuration, totalQuality / sleepData.length),
    };
  },

  generateSleepRecommendations: (avgDuration: number, avgQuality: number): string[] => {
    const recommendations: string[] = [];
    
    if (avgDuration < 7) {
      recommendations.push('建议增加睡眠时间至7-8小时');
    } else if (avgDuration > 9) {
      recommendations.push('睡眠时间可能过长，建议控制在7-8小时');
    }
    
    if (avgQuality < 3) {
      recommendations.push('睡眠质量较低，建议改善睡眠环境');
      recommendations.push('尝试睡前放松技巧，如冥想或深呼吸');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('保持当前的睡眠习惯');
    }
    
    return recommendations;
  },

  // 经期追踪
  getPeriodEntries: (startDate: string, endDate: string): PeriodEntry[] => {
    const entries: PeriodEntry[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const key = `period_${dateStr}`;
      const entry = storageService.getItemSync<PeriodEntry | null>(key, null);
      if (entry) {
        entries.push(entry);
      }
    }
    
    return entries;
  },

  savePeriodEntry: (entry: PeriodEntry): void => {
    const key = `period_${entry.date}`;
    storageService.setItem(key, entry);
  },

  getCurrentCycle: (): PeriodCycle | null => {
    return storageService.getItemSync<PeriodCycle | null>('current_period_cycle', null);
  },

  saveCurrentCycle: (cycle: PeriodCycle): void => {
    storageService.setItem('current_period_cycle', cycle);
  },

  // 器官节律
  getOrganRhythm: (date: string): OrganRhythm | null => {
    const key = `organ_rhythm_${date}`;
    return storageService.getItemSync<OrganRhythm | null>(key, null);
  },

  saveOrganRhythm: (data: OrganRhythm): void => {
    const key = `organ_rhythm_${data.date}`;
    storageService.setItem(key, data);
  },

  // 五行健康
  getWuxingHealth: (date: string): WuxingHealth | null => {
    const key = `wuxing_health_${date}`;
    return storageService.getItemSync<WuxingHealth | null>(key, null);
  },

  saveWuxingHealth: (data: WuxingHealth): void => {
    const key = `wuxing_health_${data.date}`;
    storageService.setItem(key, data);
  },

  // 能量树
  getEnergyTree: (): EnergyTree | null => {
    return storageService.getItemSync<EnergyTree | null>('energy_tree', null);
  },

  saveEnergyTree: (tree: EnergyTree): void => {
    storageService.setItem('energy_tree', tree);
  },

  addEnergyActivity: (activity: EnergyActivity): void => {
    const tree = healthService.getEnergyTree();
    if (tree) {
      tree.activities.push(activity);
      tree.experience += activity.energyGain;
      
      // 检查升级
      if (tree.experience >= tree.nextLevel) {
        tree.level++;
        tree.experience = tree.experience - tree.nextLevel;
        tree.nextLevel = Math.floor(tree.nextLevel * 1.5);
      }
      
      healthService.saveEnergyTree(tree);
    }
  },

  // 通用功能
  getModuleData: <T>(moduleId: HealthModuleId, key: string): T | null => {
    const storageKey = `${moduleId}_${key}`;
    return storageService.getItemSync<T | null>(storageKey, null);
  },

  saveModuleData: <T>(moduleId: HealthModuleId, key: string, data: T): void => {
    const storageKey = `${moduleId}_${key}`;
    storageService.setItem(storageKey, data);
  },

  clearModuleData: (moduleId: HealthModuleId): void => {
    const keys = storageService.getAllKeys().filter(key => key.startsWith(`${moduleId}_`));
    keys.forEach(key => storageService.removeItem(key.replace(STORAGE_PREFIX, '')));
  },

  // 数据清理
  clearAllHealthData: (): void => {
    const keys = storageService.getAllKeys().filter(key => 
      key.startsWith('biorhythm_') ||
      key.startsWith('health_dashboard') ||
      key.startsWith('mood_') ||
      key.startsWith('body_metrics_') ||
      key.startsWith('sleep_') ||
      key.startsWith('period_') ||
      key.startsWith('organ_rhythm_') ||
      key.startsWith('wuxing_health_') ||
      key.startsWith('energy_tree') ||
      key.startsWith('health_goals')
    );
    
    keys.forEach(key => storageService.removeItem(key.replace(STORAGE_PREFIX, '')));
  },

  // 数据统计
  getHealthDataStats: (): { [key: string]: number } => {
    const keys = storageService.getAllKeys();
    const stats: { [key: string]: number } = {};
    
    keys.forEach(key => {
      let prefix = '';
      if (key.startsWith('biorhythm_')) prefix = 'biorhythm';
      else if (key.startsWith('mood_')) prefix = 'mood';
      else if (key.startsWith('body_metrics_')) prefix = 'body_metrics';
      else if (key.startsWith('sleep_')) prefix = 'sleep';
      else if (key.startsWith('period_')) prefix = 'period';
      else if (key.startsWith('organ_rhythm_')) prefix = 'organ_rhythm';
      else if (key.startsWith('wuxing_health_')) prefix = 'wuxing_health';
      else if (key.startsWith('energy_tree')) prefix = 'energy_tree';
      else if (key.startsWith('health_dashboard')) prefix = 'health_dashboard';
      else if (key.startsWith('health_goals')) prefix = 'health_goals';
      
      if (prefix) {
        stats[prefix] = (stats[prefix] || 0) + 1;
      }
    });
    
    return stats;
  },
};