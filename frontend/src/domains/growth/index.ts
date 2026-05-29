/**
 * 成长管理域
 * 负责：MBTI测试、性格测试、气质测试、人生趋势等
 */

// 导出服务
export { growthService } from './services/growthService';

// 导出组件
export { default as MBTITestPage } from './components/MBTITestPage';
export { default as LifeTrendPage } from './components/LifeTrendPage';

// 导出类型
export type {
  MBTIResult,
  MBTIQuestion,
  PersonalityTestResult,
  LifeTrend,
  LifeEvent,
  LifePrediction,
  AgeAnalysis,
  AgeMilestone,
  ChenTemperamentResult,
  TemperamentDetail,
  GrowthGoal,
  Milestone,
  GrowthState,
  GrowthConfig,
  GrowthModuleId
} from './types';

// 域标识
export const GROWTH_DOMAIN = 'growth' as const;

// 功能模块 ID
export const GROWTH_MODULES = {
  MBTI_TEST: 'mbti_test',
  PERSONALITY_TEST: 'personality_test',
  TEMPERAMENT_TEST: 'temperament_test',
  TEMPERAMENT_DETAIL: 'temperament_detail',
  LIFE_TREND: 'life_trend',
  AGE_ANALYSIS: 'age_analysis',
  BIRTH_CHART: 'birth_chart',
} as const;
