/**
 * 工具集域
 * 负责：待办、记事、习惯追踪、设置等
 */

// 导出服务
export { toolsService } from './services/toolsService';

// 导出组件
export { default as TodoListPage } from './components/TodoListPage';
export { default as HabitTrackerPage } from './components/HabitTrackerPage';
export { default as FinancePage } from './components/FinancePage';

// 导出类型
export type {
  TodoItem,
  Subtask,
  RecurrenceRule,
  Reminder,
  Attachment,
  Habit,
  HabitEntry,
  HabitStats,
  Document,
  DocumentVersion,
  DocumentFolder,
  PasswordEntry,
  PasswordCategory,
  FinanceEntry,
  FinanceCategory,
  FinanceStats,
  LifestyleGuide,
  DashboardWidget,
  DashboardLayout,
  ToolsState,
  ToolsConfig,
  ToolsModuleId
} from './types';

// 域标识
export const TOOLS_DOMAIN = 'tools' as const;

// 功能模块 ID
export const TOOLS_MODULES = {
  TODO_LIST: 'todo_list',
  HABIT_TRACKER: 'habit_tracker',
  HABIT_STATS: 'habit_stats',
  PASSWORD_VAULT: 'password_vault',
  USER_CONFIG: 'user_config',
  USER_PROFILE: 'user_profile',
  SETTINGS: 'settings',
  DOCUMENT_HISTORY: 'document_history',
  DOCUMENT_VIEWER: 'document_viewer',
  UNIFIED_DOCUMENT_VIEWER: 'unified_document_viewer',
  LIFESTYLE_GUIDE: 'lifestyle_guide',
  DRESS_GUIDE: 'dress_guide',
  FINANCE: 'finance',
  DASHBOARD: 'dashboard',
  FEATURE_DEVELOPMENT: 'feature_development',
} as const;
