/**
 * 本地存储管理器
 * 提供统一的本地存储接口，支持用户偏好设置
 * 兼容Capacitor 5.x的Preferences插件
 */

import { Capacitor } from '@capacitor/core';

// 检测是否为原生平台
const isNative = Capacitor.isNativePlatform();

// 强制使用localStorage的开关（确保在本地环境中正常工作）
const FORCE_LOCAL_STORAGE = true;

// 存储API实例
let storageAPI = null;
let isStorageAPIReady = false;

// 尝试初始化Capacitor Preferences API (Capacitor 5.x)
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
    
    // 检查Preferences插件是否可用 (Capacitor 5.x)
    if (!Capacitor.isPluginAvailable('Preferences')) {
      console.log('Using localStorage (Preferences plugin not available)');
      return null;
    }
    
    // 尝试导入Preferences插件 (Capacitor 5.x)
    const { Preferences } = await import('@capacitor/preferences');
    
    // 配置Preferences
    await Preferences.configure({ group: 'nice_today_app' });
    
    // 测试Preferences API是否工作
    await Preferences.set({ key: '_test_key_', value: '_test_value_' });
    const testValue = await Preferences.get({ key: '_test_key_' });
    await Preferences.remove({ key: '_test_key_' });
    
    if (testValue.value === '_test_value_') {
      console.log('Using Capacitor Preferences API (Capacitor 5.x)');
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
const initStorage = async () => {
  if (isStorageAPIReady && storageAPI) {
    return storageAPI;
  }
  
  const PreferencesAPI = await initPreferencesAPI();
  if (PreferencesAPI) {
    storageAPI = PreferencesAPI;
  } else {
    // 创建一个模拟的Preferences API，实际使用localStorage
    storageAPI = {
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
      }
    };
  }
  
  isStorageAPIReady = true;
  return storageAPI;
};

// 确保存储API已初始化
const ensureStorageAPI = async () => {
  if (!isStorageAPIReady) {
    await initStorage();
  }
  return storageAPI;
};

class StorageManager {
  constructor() {
    this.storageKey = 'nice_today_app_preferences';
    this.defaultPreferences = {
      userZodiac: '',
      birthYear: null,
      theme: 'light',
      notifications: true
    };
  }

  /**
   * 获取所有用户偏好设置
   */
  async getPreferences() {
    try {
      const api = await ensureStorageAPI();
      const stored = await api.get({ key: this.storageKey });
      
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
        key: this.storageKey, 
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
   * 清除所有用户数据
   */
  async clearAll() {
    try {
      const api = await ensureStorageAPI();
      await api.remove({ key: this.storageKey });
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
      hasCompleteInfo: !!preferences.userZodiac && !!preferences.birthYear
    };
  }
}

// 创建单例实例
export const storageManager = new StorageManager();

// 初始化存储API
initStorage().then(() => {
  console.log('Storage API initialized (Capacitor 5.x compatible)');
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
  clearAll,
  hasZodiacData,
  getUserInfo
} = storageManager;

// 导出是否使用localStorage的标志
export const isUsingLocalStorage = () => !isNative || FORCE_LOCAL_STORAGE;