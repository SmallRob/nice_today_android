/**
 * 工具集域类型定义
 */

// 待办列表类型
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedDate?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  subtasks: Subtask[];
  recurrence?: RecurrenceRule;
  reminder?: Reminder;
  attachments: Attachment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  count?: number;
}

export interface Reminder {
  type: 'notification' | 'email' | 'alarm';
  time: string;
  before: number; // minutes
  repeat: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link';
  url: string;
  size?: number;
  uploadedAt: string;
}

// 习惯追踪类型
export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: string;
  bestStreak: number;
  currentStreak: number;
  totalCompletions: number;
  history: HabitEntry[];
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  date: string;
  completed: boolean;
  value: number;
  notes?: string;
  mood?: number; // 1-5
}

export interface HabitStats {
  habitId: string;
  completionRate: number; // 0-100
  averagePerWeek: number;
  bestDay: string;
  worstDay: string;
  trends: {
    weekly: 'improving' | 'declining' | 'stable';
    monthly: 'improving' | 'declining' | 'stable';
  };
  insights: string[];
}

// 文档管理类型
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'document' | 'pdf' | 'markdown';
  format: 'text' | 'markdown' | 'html' | 'json';
  size: number;
  wordCount: number;
  tags: string[];
  category: string;
  starred: boolean;
  archived: boolean;
  shared: boolean;
  version: number;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface DocumentVersion {
  version: number;
  content: string;
  createdAt: string;
  changes: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  documents: string[]; // document IDs
  subfolders: string[]; // folder IDs
  createdAt: string;
  updatedAt: string;
}

// 密码保险箱类型
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  tags: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  lastUsed: string;
  lastChanged: string;
  expiryDate?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface PasswordCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

// 财务管理类型
export interface FinanceEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  paymentMethod: string;
  tags: string[];
  recurring: boolean;
  recurrenceRule?: RecurrenceRule;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget?: number;
  spent: number;
}

export interface FinanceStats {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trends: {
    income: 'increasing' | 'decreasing' | 'stable';
    expenses: 'increasing' | 'decreasing' | 'stable';
  };
}

// 生活指南类型
export interface LifestyleGuide {
  id: string;
  title: string;
  category: 'health' | 'beauty' | 'fashion' | 'diet' | 'exercise' | 'mindfulness';
  content: string;
  tips: string[];
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number; // 1-5
  reviews: number;
  tags: string[];
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
}

// 仪表盘类型
export interface DashboardWidget {
  id: string;
  type: 'todo' | 'habit' | 'finance' | 'document' | 'custom';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  visible: boolean;
  refreshInterval: number; // minutes
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 工具集域状态
export interface ToolsState {
  todos: TodoItem[];
  habits: Habit[];
  documents: Document[];
  passwords: PasswordEntry[];
  finance: FinanceEntry[];
  guides: LifestyleGuide[];
  dashboard: DashboardLayout | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 工具集域配置
export interface ToolsConfig {
  autoSync: boolean;
  backupEnabled: boolean;
  encryptionEnabled: boolean;
  notificationsEnabled: boolean;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// 工具模块ID
export type ToolsModuleId = 
  | 'todo_list'
  | 'habit_tracker'
  | 'habit_stats'
  | 'password_vault'
  | 'document_viewer'
  | 'document_history'
  | 'unified_document_viewer'
  | 'finance'
  | 'dress_guide'
  | 'lifestyle_guide'
  | 'dashboard'
  | 'feature_development';