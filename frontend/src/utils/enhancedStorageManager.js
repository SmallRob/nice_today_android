/**
 * 增强版本地存储管理器
 * 提供统一的本地存储接口，支持Capacitor Preferences和浏览器localStorage
 * 确保在本地和原生环境中都能正确读写本地配置与数据缓存
 */

import { Capacitor } from '@capacitor/core';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';
const isIOS = Capacitor.getPlatform() === 'ios';

// 强制使用localStorage的开关
const FORCE_LOCAL_STORAGE = true; // 设置为true确保在本地环境中使用localStorage

// 存储API实例
let storageAPI = null;
let isStorageAPIReady = false;

// 尝试初始化Capacitor Preferences API
const initPreferencesAPI = async () => {
  if (FORCE_LOCAL_STORAGE) {
    console.log('Forcing use of localStorage (forced)');
    return null;
  }
  
  // 在非原生环境，使用localStorage
  if (!isNative) {
    console.log('Using localStorage (web environment)');
    return null;
  }
  
  try {
    // 检查Capacitor是否已加载
    if (typeof Capacitor === 'undefined') {
      console.log('Using localStorage (Capacitor not loaded)');
      return null;
    }
    
    // 检查Preferences插件是否可用
    if (!Capacitor.isPluginAvailable('Preferences')) {
      console.log('Using localStorage (Preferences plugin not available)');
      return null;
    }
    
    // 尝试导入Preferences插件
    const { Preferences } = await import('@capacitor/preferences');
    
    // 测试Preferences API是否工作
    await Preferences.configure({ group: 'nice_today_app' });
    await Preferences.set({ key: '_test_key_', value: '_test_value_' });
    const testValue = await Preferences.get({ key: '_test_key_' });
    await Preferences.remove({ key: '_test_key_' });
    
    if (testValue.value === '_test_value_') {
      console.log('Using Capacitor Preferences API');
      isStorageAPIReady = true;
      return Preferences;
    } else {
      console.log('Preferences API test failed, falling back to localStorage');
      return null;
    }
  } catch (error) {
    console.warn('Failed to initialize Preferences API, falling back to localStorage:', error);
    return null;
  }
};

// 初始化存储API
const initStorageAPI = async () => {
  if (isStorageAPIReady && storageAPI) {
    return storageAPI;
  }
  
  const PreferencesAPI = await initPreferencesAPI();
  if (PreferencesAPI) {
    storageAPI = PreferencesAPI;
  } else {
    storageAPI = {
      // 创建一个模拟的Preferences API，实际使用localStorage
      configure: async () => {},
      get: async ({ key }) => {
        try {
          const value = localStorage.getItem(key);
          return { value };
        } catch (error) {
          console.error(`Error getting value for key ${key}:`, error);
          return { value: null };
        }
      },
      set: async ({ key, value }) => {
        try {
          localStorage.setItem(key, value);
          return;
        } catch (error) {
          console.error(`Error setting value for key ${key}:`, error);
          throw error;
        }
      },
      remove: async ({ key }) => {
        try {
          localStorage.removeItem(key);
          return;
        } catch (error) {
          console.error(`Error removing value for key ${key}:`, error);
          throw error;
        }
      },
      clear: async () => {
        try {
          localStorage.clear();
          return;
        } catch (error) {
          console.error('Error clearing storage:', error);
          throw error;
        }
      },
      keys: async () => {
        try {
          const keys = Object.keys(localStorage);
          return { keys };
        } catch (error) {
          console.error('Error getting storage keys:', error);
          return { keys: [] };
        }
      }
    };
  }
  
  isStorageAPIReady = true;
  return storageAPI;
};

// 确保存储API已初始化
const ensureStorageAPI = async () => {
  if (!isStorageAPIReady) {
    await initStorageAPI();
  }
  return storageAPI;
};

// 增强版存储管理器类
class EnhancedStorageManager {
  constructor() {
    this.storageNamespace = 'nice_today_app_';
    this.defaultPreferences = {
      userZodiac: '',
      birthYear: null,
      theme: 'light',
      notifications: true,
      firstLaunch: true,
      lastOpened: null,
      appVersion: '1.0.0',
      userPreferences: {
        language: 'zh-CN',
        autoBackup: true,
        fontSize: 'medium',
        highContrast: false
      },
      cacheData: {
        lastSync: null,
        syncInterval: 24 * 60 * 60 * 1000, // 24小时
        dataVersion: '1.0.0'
      }
    };
  }

  /**
   * 获取存储键名
   * @param {string} key - 原始键名
   * @returns {string} - 命名空间后的键名
   */
  getStorageKey(key) {
    return `${this.storageNamespace}${key}`;
  }

  /**
   * 获取所有用户偏好设置
   */
  async getPreferences() {
    try {
      const api = await ensureStorageAPI();
      const stored = await api.get({ key: this.getStorageKey('preferences') });
      
      if (stored.value) {
        const parsed = JSON.parse(stored.value);
        return { ...this.defaultPreferences, ...parsed };
      }
      
      return { ...this.defaultPreferences };
    } catch (error) {
      console.error('获取用户偏好设置失败:', error);
      return { ...this.defaultPreferences };
    }
  }

  /**
   * 保存用户偏好设置
   * @param {Object} preferences - 偏好设置对象
   */
  async savePreferences(preferences) {
    try {
      const api = await ensureStorageAPI();
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      
      await api.set({ 
        key: this.getStorageKey('preferences'), 
        value: JSON.stringify(updated) 
      });
      
      return true;
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
      return false;
    }
  }

  /**
   * 获取用户生肖
   */
  async getUserZodiac() {
    const preferences = await this.getPreferences();
    return preferences.userZodiac;
  }

  /**
   * 设置用户生肖
   * @param {string} zodiac - 生肖名称
   */
  async setUserZodiac(zodiac) {
    return await this.savePreferences({ userZodiac: zodiac });
  }

  /**
   * 获取用户出生年份
   */
  async getBirthYear() {
    const preferences = await this.getPreferences();
    return preferences.birthYear;
  }

  /**
   * 设置用户出生年份
   * @param {number} year - 出生年份
   */
  async setBirthYear(year) {
    return await this.savePreferences({ birthYear: year });
  }

  /**
   * 获取用户主题设置
   */
  async getTheme() {
    const preferences = await this.getPreferences();
    return preferences.theme;
  }

  /**
   * 设置用户主题
   * @param {string} theme - 主题名称
   */
  async setTheme(theme) {
    return await this.savePreferences({ theme });
  }

  /**
   * 获取通知设置
   */
  async getNotifications() {
    const preferences = await this.getPreferences();
    return preferences.notifications;
  }

  /**
   * 设置通知开关
   * @param {boolean} enabled - 是否启用通知
   */
  async setNotifications(enabled) {
    return await this.savePreferences({ notifications: enabled });
  }

  /**
   * 获取用户偏好设置
   */
  async getUserPreferences() {
    const preferences = await this.getPreferences();
    return preferences.userPreferences;
  }

  /**
   * 设置用户偏好设置
   * @param {Object} userPreferences - 用户偏好设置
   */
  async setUserPreferences(userPreferences) {
    const currentPreferences = await this.getPreferences();
    const updatedUserPreferences = { ...currentPreferences.userPreferences, ...userPreferences };
    return await this.savePreferences({ userPreferences: updatedUserPreferences });
  }

  /**
   * 缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 要缓存的数据
   * @param {number} [expiry] - 过期时间（毫秒）
   */
  async setCacheData(key, data, expiry) {
    try {
      const api = await ensureStorageAPI();
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: expiry || (Date.now() + 24 * 60 * 60 * 1000) // 默认24小时
      };
      
      await api.set({ 
        key: this.getStorageKey(`cache_${key}`), 
        value: JSON.stringify(cacheItem) 
      });
      
      return true;
    } catch (error) {
      console.error('缓存数据失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any|null} - 缓存的数据，如果不存在或已过期则返回null
   */
  async getCacheData(key) {
    try {
      const api = await ensureStorageAPI();
      const cached = await api.get({ key: this.getStorageKey(`cache_${key}`) });
      
      if (!cached.value) {
        return null;
      }
      
      const cacheItem = JSON.parse(cached.value);
      
      // 检查是否过期
      if (cacheItem.expiry && cacheItem.expiry < Date.now()) {
        await this.removeCacheData(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('获取缓存数据失败:', error);
      return null;
    }
  }

  /**
   * 删除缓存数据
   * @param {string} key - 缓存键
   */
  async removeCacheData(key) {
    try {
      const api = await ensureStorageAPI();
      await api.remove({ key: this.getStorageKey(`cache_${key}`) });
      return true;
    } catch (error) {
      console.error('删除缓存数据失败:', error);
      return false;
    }
  }

  /**
   * 清除所有缓存数据
   */
  async clearCacheData() {
    try {
      const api = await ensureStorageAPI();
      const keys = await api.keys();
      
      for (const key of keys.keys) {
        if (key.startsWith(this.storageNamespace + 'cache_')) {
          await api.remove({ key });
        }
      }
      
      return true;
    } catch (error) {
      console.error('清除缓存数据失败:', error);
      return false;
    }
  }

  /**
   * 清除所有用户数据
   */
  async clearAll() {
    try {
      const api = await ensureStorageAPI();
      const keys = await api.keys();
      
      for (const key of keys.keys) {
        if (key.startsWith(this.storageNamespace)) {
          await api.remove({ key });
        }
      }
      
      return true;
    } catch (error) {
      console.error('清除用户数据失败:', error);
      return false;
    }
  }

  /**
   * 检查是否有存储的用户生肖数据
   */
  async hasZodiacData() {
    const preferences = await this.getPreferences();
    return !!preferences.userZodiac;
  }

  /**
   * 获取完整的用户信息
   */
  async getUserInfo() {
    const preferences = await this.getPreferences();
    return {
      zodiac: preferences.userZodiac,
      birthYear: preferences.birthYear,
      theme: preferences.theme,
      notifications: preferences.notifications,
      userPreferences: preferences.userPreferences,
      hasCompleteInfo: !!preferences.userZodiac && !!preferences.birthYear
    };
  }

  /**
   * 导出用户数据
   * @returns {string} - JSON格式的用户数据
   */
  async exportUserData() {
    try {
      const userData = {
        preferences: await this.getPreferences(),
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      return JSON.stringify(userData);
    } catch (error) {
      console.error('导出用户数据失败:', error);
      return null;
    }
  }

  /**
   * 导入用户数据
   * @param {string} jsonData - JSON格式的用户数据
   */
  async importUserData(jsonData) {
    try {
      const userData = JSON.parse(jsonData);
      
      if (userData.preferences) {
        await this.savePreferences(userData.preferences);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('导入用户数据失败:', error);
      return false;
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo() {
    try {
      const api = await ensureStorageAPI();
      const keys = await api.keys();
      
      let totalSize = 0;
      let cacheCount = 0;
      let preferenceCount = 0;
      
      for (const key of keys.keys) {
        if (key.startsWith(this.storageNamespace)) {
          const value = await api.get({ key });
          if (value.value) {
            totalSize += value.value.length;
            
            if (key.startsWith(this.storageNamespace + 'cache_')) {
              cacheCount++;
            } else if (key === this.getStorageKey('preferences')) {
              preferenceCount++;
            }
          }
        }
      }
      
      return {
        totalKeys: keys.keys.length,
        appKeys: keys.keys.filter(k => k.startsWith(this.storageNamespace)).length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        cacheCount,
        preferenceCount,
        storageType: isNative && !FORCE_LOCAL_STORAGE ? 'Capacitor Preferences' : 'localStorage'
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }
}

// 创建单例实例
export const enhancedStorageManager = new EnhancedStorageManager();

// 初始化存储API
initStorageAPI().then(() => {
  console.log('Storage API initialized');
}).catch(error => {
  console.error('Failed to initialize storage API:', error);
});

// 导出常用方法
export const {
  getPreferences,
  savePreferences,
  getUserZodiac,
  setUserZodiac,
  getBirthYear,
  setBirthYear,
  getTheme,
  setTheme,
  getNotifications,
  setNotifications,
  getUserPreferences,
  setUserPreferences,
  setCacheData,
  getCacheData,
  removeCacheData,
  clearCacheData,
  clearAll,
  hasZodiacData,
  getUserInfo,
  exportUserData,
  importUserData,
  getStorageInfo
} = enhancedStorageManager;

// 导出是否使用localStorage的标志
export const isUsingLocalStorage = () => !isNative || FORCE_LOCAL_STORAGE;