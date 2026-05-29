/**
 * 成长管理域类型定义
 */

// MBTI测试类型
export interface MBTIResult {
  type: string; // e.g., "INTJ"
  dimensions: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  percentages: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  description: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  relationships: string;
  famousPeople: string[];
}

export interface MBTIQuestion {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  weight: number;
}

// 性格测试类型
export interface PersonalityTestResult {
  id: string;
  testName: string;
  date: string;
  scores: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  dominantTrait: string;
  description: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendations: string[];
}

// 人生趋势类型
export interface LifeTrend {
  date: string;
  overall: number; // 1-5
  career: number; // 1-5
  relationships: number; // 1-5
  health: number; // 1-5
  wealth: number; // 1-5
  personalGrowth: number; // 1-5
  events: LifeEvent[];
  predictions: LifePrediction[];
}

export interface LifeEvent {
  date: string;
  type: 'career' | 'relationship' | 'health' | 'wealth' | 'personal';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  significance: number; // 1-5
}

export interface LifePrediction {
  period: string;
  area: string;
  prediction: string;
  confidence: number; // 0-100
  advice: string;
}

// 年龄分析类型
export interface AgeAnalysis {
  currentAge: number;
  lifeStage: 'child' | 'adolescent' | 'young_adult' | 'adult' | 'middle_age' | 'senior';
  characteristics: string[];
  challenges: string[];
  opportunities: string[];
  recommendations: string[];
  milestones: AgeMilestone[];
}

export interface AgeMilestone {
  age: number;
  type: 'personal' | 'career' | 'health' | 'relationship';
  description: string;
  status: 'completed' | 'upcoming' | 'in_progress';
}

// 陈氏气质测试类型
export interface ChenTemperamentResult {
  type: string;
  scores: {
    sanguine: number; // 多血质
    choleric: number; // 胆汁质
    melancholic: number; // 抑郁质
    phlegmatic: number; // 粘液质
  };
  dominant: string;
  secondary: string;
  description: string;
  characteristics: string[];
  workStyle: string;
  relationships: string;
  stressResponse: string;
  recommendations: string[];
}

// 气质详情类型
export interface TemperamentDetail {
  type: string;
  description: string;
  characteristics: {
    positive: string[];
    negative: string[];
  };
  workStyle: {
    strengths: string[];
    challenges: string[];
    idealEnvironment: string[];
  };
  relationships: {
    romantic: string;
    friendship: string;
    family: string;
    professional: string;
  };
  stressManagement: {
    triggers: string[];
    copingMechanisms: string[];
    recoveryTips: string[];
  };
  personalGrowth: {
    areas: string[];
    exercises: string[];
    resources: string[];
  };
}

// 成长目标类型
export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'career' | 'health' | 'relationships' | 'financial';
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

// 成长管理域状态
export interface GrowthState {
  mbtiResult: MBTIResult | null;
  personalityResults: PersonalityTestResult[];
  lifeTrends: LifeTrend[];
  ageAnalysis: AgeAnalysis | null;
  temperamentResult: ChenTemperamentResult | null;
  goals: GrowthGoal[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 成长管理域配置
export interface GrowthConfig {
  testHistoryRetention: number; // days
  goalNotifications: boolean;
  progressTracking: boolean;
  dataExport: boolean;
}

// 成长模块ID
export type GrowthModuleId = 
  | 'mbti_test'
  | 'personality_test'
  | 'life_trend'
  | 'age_analysis'
  | 'chen_temperament_test'
  | 'temperament_detail'
  | 'growth_goals';