/**
 * 用户中心域
 * 负责用户配置、数据管理、个人资料
 */

// 导出服务
export { globalUserConfigService } from '../../services/globalUserConfig';
export type { GlobalUserConfigSnapshot } from '../../services/globalUserConfig';
export { storageService } from '../../services/storageService';
export { userCenterService } from './services/userCenterService';

// 导出组件
export { default as SettingsPage } from './components/SettingsPage';
export { default as UserProfilePage } from './components/UserProfilePage';
export { default as DashboardPage } from './components/DashboardPage';

// 导出 Hooks
export { useTheme } from '../../design-system/utils/ThemeProvider';

// 导出类型
export type {
  UserProfile,
  UserSettings,
  NotificationSettings,
  PrivacySettings,
  DataManagementSettings,
  StorageUsage,
  UserCenterState,
  UserCenterActions,
  UserCenterConfig
} from './types';

// 域标识
export const USER_CENTER_DOMAIN = 'user-center' as const;
