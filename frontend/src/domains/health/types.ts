/**
 * 健康管理域类型定义
 */

// 生物节律类型
export interface BiorhythmData {
  date: string;
  physical: number;  // -100 to 100
  emotional: number; // -100 to 100
  intellectual: number; // -100 to 100
  summary: string;
  advice: string;
}

export interface BiorhythmHistory {
  startDate: string;
  endDate: string;
  data: BiorhythmData[];
  trends: {
    physical: 'rising' | 'falling' | 'stable';
    emotional: 'rising' | 'falling' | 'stable';
    intellectual: 'rising' | 'falling' | 'stable';
  };
}

// 健康仪表盘类型
export interface HealthDashboard {
  overallScore: number; // 0-100
  physicalHealth: number; // 0-100
  mentalHealth: number; // 0-100
  sleepQuality: number; // 0-100
  energyLevel: number; // 0-100
  stressLevel: number; // 0-100
  recommendations: string[];
  alerts: HealthAlert[];
}

export interface HealthAlert {
  type: 'warning' | 'info' | 'critical';
  message: string;
  date: string;
  dismissed: boolean;
}

// 情绪日历类型
export interface MoodEntry {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  stress: number; // 1-5
  sleep: number; // 1-5
  notes?: string;
  tags?: string[];
}

export interface MoodCalendar {
  month: string;
  entries: MoodEntry[];
  statistics: MoodStatistics;
}

export interface MoodStatistics {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageSleep: number;
  moodDistribution: {
    excellent: number;
    good: number;
    neutral: number;
    poor: number;
    terrible: number;
  };
  trends: {
    mood: 'improving' | 'declining' | 'stable';
    energy: 'improving' | 'declining' | 'stable';
    stress: 'improving' | 'declining' | 'stable';
  };
}

// 身体指标类型
export interface BodyMetrics {
  date: string;
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  waterPercentage?: number;
  boneMass?: number; // kg
  visceralFat?: number;
  metabolicAge?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: {
    resting: number;
    max: number;
    current: number;
  };
  bloodOxygen?: number; // percentage
  bloodSugar?: number; // mmol/L
}

export interface BodyMetricsHistory {
  startDate: string;
  endDate: string;
  metrics: BodyMetrics[];
  trends: {
    weight: 'increasing' | 'decreasing' | 'stable';
    bmi: 'increasing' | 'decreasing' | 'stable';
    bodyFat: 'increasing' | 'decreasing' | 'stable';
  };
  goals: HealthGoal[];
}

export interface HealthGoal {
  id: string;
  type: 'weight' | 'bmi' | 'bodyFat' | 'steps' | 'sleep' | 'water';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number; // 0-100
}

// 睡眠健康类型
export interface SleepData {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // hours
  quality: number; // 1-5
  deepSleep: number; // hours
  lightSleep: number; // hours
  remSleep: number; // hours
  awake: number; // hours
  notes?: string;
}

export interface SleepStatistics {
  averageDuration: number;
  averageQuality: number;
  sleepDebt: number;
  consistency: number; // 0-100
  bestDay: string;
  worstDay: string;
  recommendations: string[];
}

// 经期追踪类型
export interface PeriodEntry {
  date: string;
  flow: 'light' | 'medium' | 'heavy' | 'spotting';
  symptoms: string[];
  mood: number; // 1-5
  notes?: string;
}

export interface PeriodCycle {
  startDate: string;
  endDate: string;
  length: number;
  averageLength: number;
  isRegular: boolean;
  nextPredicted: string;
  fertileWindow: {
    start: string;
    end: string;
  };
  ovulationDate: string;
}

// 器官节律类型
export interface OrganRhythm {
  date: string;
  organs: {
    heart: number; // -100 to 100
    liver: number;
    spleen: number;
    lungs: number;
    kidneys: number;
    stomach: number;
    intestines: number;
    gallbladder: number;
    bladder: number;
    tripleBurner: number;
  };
  analysis: string;
  recommendations: string[];
}

// 五行健康类型
export interface WuxingHealth {
  date: string;
  elements: {
    wood: number; // 0-100
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  balance: number; // 0-100
  dominant: string;
  deficient: string;
  analysis: string;
  recommendations: string[];
}

// 能量树类型
export interface EnergyTree {
  level: number;
  experience: number;
  nextLevel: number;
  leaves: number;
  fruits: number;
  health: number; // 0-100
  activities: EnergyActivity[];
}

export interface EnergyActivity {
  id: string;
  name: string;
  type: 'exercise' | 'meditation' | 'sleep' | 'nutrition' | 'social';
  duration: number; // minutes
  energyGain: number;
  date: string;
}

// 健康管理域状态
export interface HealthState {
  biorhythm: BiorhythmData | null;
  dashboard: HealthDashboard | null;
  moodCalendar: MoodCalendar | null;
  bodyMetrics: BodyMetricsHistory | null;
  sleepData: SleepData[];
  periodData: PeriodEntry[];
  organRhythm: OrganRhythm | null;
  wuxingHealth: WuxingHealth | null;
  energyTree: EnergyTree | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 健康管理域配置
export interface HealthConfig {
  trackingEnabled: boolean;
  notificationsEnabled: boolean;
  dataRetentionDays: number;
  autoSync: boolean;
  privacyMode: boolean;
}

// 健康模块ID
export type HealthModuleId = 
  | 'biorhythm'
  | 'health_dashboard'
  | 'mood_calendar'
  | 'body_metrics'
  | 'sleep_health'
  | 'period_tracker'
  | 'organ_rhythm'
  | 'wuxing_health'
  | 'energy_tree'
  | 'energy_boost'
  | 'agile_health'
  | 'stage_health';