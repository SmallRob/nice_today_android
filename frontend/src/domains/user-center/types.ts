/**
 * 用户中心域类型定义
 */

// 重新导出全局用户类型
export type { UserProfile, GlobalUserConfigSnapshot, AISettings, AIModelConfig } from '../../types/user';

// 用户中心域特定类型

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  useAIInterpretation: boolean;
  selectedAIModelId: string;
  homeTimeAwareEnabled: boolean;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  dataManagement: DataManagementSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  healthReminders: boolean;
  fortuneUpdates: boolean;
  habitReminders: boolean;
  systemNotifications: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  analyticsEnabled: boolean;
  crashReporting: boolean;
}

export interface DataManagementSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string | null;
  storageUsage: StorageUsage;
}

export interface StorageUsage {
  total: number;
  used: number;
  available: number;
  breakdown: {
    userProfile: number;
    fortuneData: number;
    healthData: number;
    growthData: number;
    toolsData: number;
    cache: number;
  };
}

// 用户中心域状态
export interface UserCenterState {
  profile: UserProfile | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 用户中心域操作
export interface UserCenterActions {
  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  exportData: () => Promise<Blob>;
  importData: (data: Blob) => Promise<void>;
  clearData: () => Promise<void>;
}

// 用户中心域配置
export interface UserCenterConfig {
  storagePrefix: string;
  autoSave: boolean;
  syncEnabled: boolean;
  backupEnabled: boolean;
}