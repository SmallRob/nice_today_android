/**
 * 健康管理域
 * 负责：生物节律、情绪日历、身体指标、健康仪表盘等
 */

// 导出服务
export { healthService } from './services/healthService';

// 导出组件
export { default as MoodCalendarPage } from './components/MoodCalendarPage';
export { default as BiorhythmPage } from './components/BiorhythmPage';
export { default as HealthDashboardPage } from './components/HealthDashboardPage';
export { default as BodyMetricsPage } from './components/BodyMetricsPage';

// 导出类型
export type {
  BiorhythmData,
  BiorhythmHistory,
  HealthDashboard,
  HealthAlert,
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
  HealthState,
  HealthConfig,
  HealthModuleId
} from './types';

// 域标识
export const HEALTH_DOMAIN = 'health' as const;

// 功能模块 ID
export const HEALTH_MODULES = {
  BIORHYTHM: 'biorhythm',
  MOOD_CALENDAR: 'mood_calendar',
  HEALTH_DASHBOARD: 'health_dashboard',
  BODY_METRICS: 'body_metrics',
  PERIOD_TRACKER: 'period_tracker',
  SLEEP_HEALTH: 'sleep_health',
  EMO_HEALTH: 'emo_health',
  AGILE_HEALTH: 'agile_health',
  STAGE_HEALTH: 'stage_health',
  ORGAN_RHYTHM: 'organ_rhythm',
  WUXING_HEALTH: 'wuxing_health',
  ENERGY_BOOST: 'energy_boost',
  ENERGY_TREE: 'energy_tree',
} as const;
