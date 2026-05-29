/**
 * 全局类型定义入口
 */

export * from './user';
export * from './tarot';

/**
 * Tab 枚举
 */
export enum Tab {
  HOME = 'home',
  HEALTH = 'health',
  GROWTH = 'growth',
  TOOLS = 'tools',
  SETTINGS = 'settings',
}

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 导航状态
 */
export interface NavigationState {
  activeTab: Tab;
  activeOverlay: string | null;
  overlayStack: string[];
  overlayParams: Record<string, any> | null;
}

/**
 * 通用 API 响应
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
