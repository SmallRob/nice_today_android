/**
 * 领域模块主入口
 * 导出所有领域模块
 */

// 导出各领域模块
export * from './user-center';
export * from './fortune';
export * from './health';
export * from './growth';
export * from './entertainment';
export * from './tools';

// 导出领域常量
export const DOMAINS = {
  USER_CENTER: 'user-center',
  FORTUNE: 'fortune',
  HEALTH: 'health',
  GROWTH: 'growth',
  ENTERTAINMENT: 'entertainment',
  TOOLS: 'tools',
} as const;

export type DomainId = typeof DOMAINS[keyof typeof DOMAINS];

// 领域配置
export const DOMAIN_CONFIG = {
  'user-center': {
    name: '用户中心',
    description: '用户配置、数据管理、个人资料',
    priority: 'P0',
    icon: 'user',
  },
  'fortune': {
    name: '运势分析',
    description: '星座运势、八字分析、紫微斗数、黄历、塔罗等',
    priority: 'P0',
    icon: 'star',
  },
  'health': {
    name: '健康管理',
    description: '生物节律、情绪日历、身体指标等',
    priority: 'P0',
    icon: 'heart',
  },
  'growth': {
    name: '成长管理',
    description: 'MBTI测试、性格测试、人生趋势等',
    priority: 'P1',
    icon: 'trending-up',
  },
  'entertainment': {
    name: '娱乐休闲',
    description: '游戏、趣味测试、互动内容等',
    priority: 'P2',
    icon: 'gamepad',
  },
  'tools': {
    name: '工具集',
    description: '待办、记事、习惯追踪等',
    priority: 'P1',
    icon: 'tool',
  },
} as const;

// 领域工具函数
export const getDomainConfig = (domainId: DomainId) => {
  return DOMAIN_CONFIG[domainId];
};

export const getAllDomains = () => {
  return Object.entries(DOMAIN_CONFIG).map(([id, config]) => ({
    id: id as DomainId,
    ...config,
  }));
};

export const getDomainsByPriority = (priority: 'P0' | 'P1' | 'P2') => {
  return Object.entries(DOMAIN_CONFIG)
    .filter(([_, config]) => config.priority === priority)
    .map(([id, config]) => ({
      id: id as DomainId,
      ...config,
    }));
};