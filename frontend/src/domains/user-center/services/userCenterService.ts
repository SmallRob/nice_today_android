/**
 * 用户中心服务
 * 提供用户中心域的业务逻辑
 */

import { globalUserConfigService } from '../../../services/globalUserConfig';
import { storageService } from '../../../services/storageService';
import type { UserProfile, GlobalUserConfigSnapshot } from '../../../types/user';
import type { 
  UserSettings, 
  NotificationSettings, 
  PrivacySettings, 
  DataManagementSettings,
  StorageUsage 
} from '../types';

const STORAGE_PREFIX = 'nice_today_';

export const userCenterService = {
  // 用户配置管理
  getUserProfile: (): UserProfile => {
    return globalUserConfigService.loadProfile();
  },

  saveUserProfile: (profile: UserProfile): void => {
    globalUserConfigService.saveProfile(profile);
  },

  updateUserProfileField: <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ): void => {
    globalUserConfigService.updateField(key, value);
  },

  getGlobalConfigSnapshot: (): GlobalUserConfigSnapshot => {
    return globalUserConfigService.getSnapshot();
  },

  // 用户设置管理
  getUserSettings: (): UserSettings => {
    const defaultSettings: UserSettings = {
      theme: 'system',
      useAIInterpretation: false,
      selectedAIModelId: '',
      homeTimeAwareEnabled: true,
      language: 'zh-CN',
      notifications: {
        enabled: true,
        healthReminders: true,
        fortuneUpdates: true,
        habitReminders: true,
        systemNotifications: true,
      },
      privacy: {
        shareData: false,
        analyticsEnabled: true,
        crashReporting: true,
      },
      dataManagement: {
        autoBackup: false,
        backupFrequency: 'weekly',
        lastBackupDate: null,
        storageUsage: {
          total: 0,
          used: 0,
          available: 0,
          breakdown: {
            userProfile: 0,
            fortuneData: 0,
            healthData: 0,
            growthData: 0,
            toolsData: 0,
            cache: 0,
          },
        },
      },
    };

    const savedSettings = storageService.getItemSync<Partial<UserSettings>>('user_settings', {});
    return { ...defaultSettings, ...savedSettings };
  },

  saveUserSettings: (settings: Partial<UserSettings>): void => {
    const currentSettings = userCenterService.getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    storageService.setItem('user_settings', updatedSettings);
  },

  updateNotificationSettings: (notifications: Partial<NotificationSettings>): void => {
    const settings = userCenterService.getUserSettings();
    userCenterService.saveUserSettings({
      notifications: { ...settings.notifications, ...notifications },
    });
  },

  updatePrivacySettings: (privacy: Partial<PrivacySettings>): void => {
    const settings = userCenterService.getUserSettings();
    userCenterService.saveUserSettings({
      privacy: { ...settings.privacy, ...privacy },
    });
  },

  updateDataManagementSettings: (dataManagement: Partial<DataManagementSettings>): void => {
    const settings = userCenterService.getUserSettings();
    userCenterService.saveUserSettings({
      dataManagement: { ...settings.dataManagement, ...dataManagement },
    });
  },

  // 数据管理
  exportUserData: async (): Promise<Blob> => {
    const profile = userCenterService.getUserProfile();
    const settings = userCenterService.getUserSettings();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile,
      settings,
      // 可以添加其他需要导出的数据
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  },

  importUserData: async (data: Blob): Promise<void> => {
    try {
      const text = await data.text();
      const importedData = JSON.parse(text);

      if (importedData.profile) {
        userCenterService.saveUserProfile(importedData.profile);
      }

      if (importedData.settings) {
        userCenterService.saveUserSettings(importedData.settings);
      }

      console.log('[UserCenterService] Data imported successfully');
    } catch (error) {
      console.error('[UserCenterService] Failed to import data:', error);
      throw new Error('数据导入失败，请检查文件格式');
    }
  },

  clearAllUserData: async (): Promise<void> => {
    try {
      // 清除用户配置
      storageService.removeItem('user_profile');
      storageService.removeItem('user_settings');
      
      // 清除其他用户相关数据
      const keys = storageService.getAllKeys();
      const userKeys = keys.filter(key => 
        key.startsWith('user_') || 
        key.startsWith('profile_') ||
        key.startsWith('settings_')
      );
      
      userKeys.forEach(key => storageService.removeItem(key));
      
      console.log('[UserCenterService] All user data cleared');
    } catch (error) {
      console.error('[UserCenterService] Failed to clear user data:', error);
      throw new Error('数据清除失败');
    }
  },

  // 存储使用情况
  getStorageUsage: (): StorageUsage => {
    const keys = storageService.getAllKeys();
    let totalUsed = 0;
    const breakdown = {
      userProfile: 0,
      fortuneData: 0,
      healthData: 0,
      growthData: 0,
      toolsData: 0,
      cache: 0,
    };

    keys.forEach(key => {
      const value = localStorage.getItem(STORAGE_PREFIX + key);
      const size = value ? new Blob([value]).size : 0;
      totalUsed += size;

      // 根据key前缀分类
      if (key.startsWith('user_') || key.startsWith('profile_')) {
        breakdown.userProfile += size;
      } else if (key.startsWith('fortune_') || key.startsWith('horoscope_') || key.startsWith('bazi_')) {
        breakdown.fortuneData += size;
      } else if (key.startsWith('health_') || key.startsWith('biorhythm_') || key.startsWith('mood_')) {
        breakdown.healthData += size;
      } else if (key.startsWith('growth_') || key.startsWith('mbti_') || key.startsWith('personality_')) {
        breakdown.growthData += size;
      } else if (key.startsWith('todo_') || key.startsWith('habit_') || key.startsWith('document_')) {
        breakdown.toolsData += size;
      } else {
        breakdown.cache += size;
      }
    });

    // 假设总存储空间为50MB
    const totalStorage = 50 * 1024 * 1024;
    
    return {
      total: totalStorage,
      used: totalUsed,
      available: totalStorage - totalUsed,
      breakdown,
    };
  },

  // 数据备份
  createBackup: async (): Promise<Blob> => {
    const profile = userCenterService.getUserProfile();
    const settings = userCenterService.getUserSettings();
    const storageUsage = userCenterService.getStorageUsage();
    
    const backupData = {
      version: '1.0',
      backupDate: new Date().toISOString(),
      type: 'full_backup',
      profile,
      settings,
      storageUsage,
      // 可以添加其他需要备份的数据
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  },

  restoreFromBackup: async (backup: Blob): Promise<void> => {
    try {
      const text = await backup.text();
      const backupData = JSON.parse(text);

      if (backupData.type !== 'full_backup') {
        throw new Error('无效的备份文件');
      }

      if (backupData.profile) {
        userCenterService.saveUserProfile(backupData.profile);
      }

      if (backupData.settings) {
        userCenterService.saveUserSettings(backupData.settings);
      }

      // 更新最后备份日期
      userCenterService.updateDataManagementSettings({
        lastBackupDate: new Date().toISOString(),
      });

      console.log('[UserCenterService] Backup restored successfully');
    } catch (error) {
      console.error('[UserCenterService] Failed to restore backup:', error);
      throw new Error('备份恢复失败，请检查备份文件');
    }
  },

  // 自动备份
  checkAndPerformAutoBackup: async (): Promise<void> => {
    const settings = userCenterService.getUserSettings();
    
    if (!settings.dataManagement.autoBackup) {
      return;
    }

    const lastBackup = settings.dataManagement.lastBackupDate;
    const now = new Date();
    
    if (lastBackup) {
      const lastBackupDate = new Date(lastBackup);
      const daysSinceLastBackup = Math.floor(
        (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const backupFrequency = settings.dataManagement.backupFrequency;
      const shouldBackup = 
        (backupFrequency === 'daily' && daysSinceLastBackup >= 1) ||
        (backupFrequency === 'weekly' && daysSinceLastBackup >= 7) ||
        (backupFrequency === 'monthly' && daysSinceLastBackup >= 30);

      if (!shouldBackup) {
        return;
      }
    }

    try {
      const backup = await userCenterService.createBackup();
      // 这里可以将备份保存到文件系统或云端
      // 暂时只更新备份日期
      userCenterService.updateDataManagementSettings({
        lastBackupDate: now.toISOString(),
      });
      console.log('[UserCenterService] Auto backup completed');
    } catch (error) {
      console.error('[UserCenterService] Auto backup failed:', error);
    }
  },
};