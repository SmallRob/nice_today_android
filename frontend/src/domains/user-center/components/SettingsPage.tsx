import React, { useState, useEffect, useCallback } from 'react';
import { userCenterService } from '../services/userCenterService';
import type { UserSettings, NotificationSettings, PrivacySettings } from '../types';

interface SettingsPageProps {
  onBack?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 加载用户设置
  useEffect(() => {
    try {
      const userSettings = userCenterService.getUserSettings();
      setSettings(userSettings);
    } catch (err) {
      setError('加载设置失败');
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存设置
  const saveSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      await userCenterService.saveUserSettings(updates);
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      setSuccess('设置已保存');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('保存设置失败');
      console.error('Failed to save settings:', err);
    }
  }, []);

  // 主题切换
  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'system') => {
    saveSettings({ theme });
  }, [saveSettings]);

  // 通知设置更新
  const handleNotificationChange = useCallback((notifications: Partial<NotificationSettings>) => {
    if (!settings) return;
    saveSettings({
      notifications: { ...settings.notifications, ...notifications },
    });
  }, [settings, saveSettings]);

  // 隐私设置更新
  const handlePrivacyChange = useCallback((privacy: Partial<PrivacySettings>) => {
    if (!settings) return;
    saveSettings({
      privacy: { ...settings.privacy, ...privacy },
    });
  }, [settings, saveSettings]);

  // 数据导出
  const handleExportData = useCallback(async () => {
    try {
      const blob = await userCenterService.exportUserData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nice_today_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('数据导出成功');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('数据导出失败');
      console.error('Failed to export data:', err);
    }
  }, []);

  // 数据导入
  const handleImportData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await userCenterService.importUserData(file);
      // 重新加载设置
      const userSettings = userCenterService.getUserSettings();
      setSettings(userSettings);
      setSuccess('数据导入成功');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('数据导入失败');
      console.error('Failed to import data:', err);
    }
  }, []);

  // 清除所有数据
  const handleClearAllData = useCallback(async () => {
    if (!window.confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      return;
    }

    try {
      await userCenterService.clearAllUserData();
      // 重新加载设置
      const userSettings = userCenterService.getUserSettings();
      setSettings(userSettings);
      setSuccess('所有数据已清除');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('清除数据失败');
      console.error('Failed to clear data:', err);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-4 text-center text-gray-500">
        无法加载设置
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700"
          >
            返回
          </button>
        )}
      </div>

      {/* 错误和成功提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* 主题设置 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">外观</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    settings.theme === theme
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent'
                  }`}
                >
                  {theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">通知</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">启用通知</div>
              <div className="text-xs text-gray-500">接收应用通知</div>
            </div>
            <button
              onClick={() => handleNotificationChange({ enabled: !settings.notifications.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.notifications.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.notifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">健康提醒</div>
                  <div className="text-xs text-gray-500">健康数据提醒</div>
                </div>
                <button
                  onClick={() => handleNotificationChange({ healthReminders: !settings.notifications.healthReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.healthReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.healthReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">运势更新</div>
                  <div className="text-xs text-gray-500">每日运势更新</div>
                </div>
                <button
                  onClick={() => handleNotificationChange({ fortuneUpdates: !settings.notifications.fortuneUpdates })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.fortuneUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.fortuneUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">习惯提醒</div>
                  <div className="text-xs text-gray-500">习惯打卡提醒</div>
                </div>
                <button
                  onClick={() => handleNotificationChange({ habitReminders: !settings.notifications.habitReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.habitReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.habitReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">隐私</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">数据共享</div>
              <div className="text-xs text-gray-500">匿名分享使用数据以改进应用</div>
            </div>
            <button
              onClick={() => handlePrivacyChange({ shareData: !settings.privacy.shareData })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.privacy.shareData ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.privacy.shareData ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">分析统计</div>
              <div className="text-xs text-gray-500">收集匿名使用统计</div>
            </div>
            <button
              onClick={() => handlePrivacyChange({ analyticsEnabled: !settings.privacy.analyticsEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.privacy.analyticsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.privacy.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">崩溃报告</div>
              <div className="text-xs text-gray-500">自动发送崩溃报告</div>
            </div>
            <button
              onClick={() => handlePrivacyChange({ crashReporting: !settings.privacy.crashReporting })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings.privacy.crashReporting ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.privacy.crashReporting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">数据管理</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={handleExportData}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              导出数据
            </button>
            <p className="text-xs text-gray-500 mt-1">备份您的所有数据</p>
          </div>

          <div>
            <label className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer block text-center">
              导入数据
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">从备份文件恢复数据</p>
          </div>

          <div>
            <button
              onClick={handleClearAllData}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              清除所有数据
            </button>
            <p className="text-xs text-gray-500 mt-1">删除所有本地数据（不可恢复）</p>
          </div>
        </div>
      </div>

      {/* 存储使用情况 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">存储使用</h2>
        <StorageUsageDisplay />
      </div>
    </div>
  );
};

// 存储使用情况组件
const StorageUsageDisplay: React.FC = () => {
  const [usage, setUsage] = useState<ReturnType<typeof userCenterService.getStorageUsage> | null>(null);

  useEffect(() => {
    try {
      const storageUsage = userCenterService.getStorageUsage();
      setUsage(storageUsage);
    } catch (err) {
      console.error('Failed to get storage usage:', err);
    }
  }, []);

  if (!usage) {
    return <div className="text-gray-500">无法获取存储信息</div>;
  }

  const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
  const totalMB = (usage.total / (1024 * 1024)).toFixed(0);
  const percentage = ((usage.used / usage.total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>已使用: {usedMB} MB</span>
          <span>总容量: {totalMB} MB</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{percentage}% 已使用</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">用户配置</div>
          <div>{(usage.breakdown.userProfile / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">运势数据</div>
          <div>{(usage.breakdown.fortuneData / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">健康数据</div>
          <div>{(usage.breakdown.healthData / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">成长数据</div>
          <div>{(usage.breakdown.growthData / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">工具数据</div>
          <div>{(usage.breakdown.toolsData / 1024).toFixed(1)} KB</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <div className="font-medium">缓存</div>
          <div>{(usage.breakdown.cache / 1024).toFixed(1)} KB</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;