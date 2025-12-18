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
      userZodiac: '',        // 生肖（十二生肖）
      userHoroscope: '',     // 星座（十二星座）
      birthYear: null,
      theme: 'light',
      notifications: true
    };
  }

  // 缓存偏好设置以提高性能
  _preferencesCache = null;
  _lastPreferencesFetch = 0;
  _cacheTimeout = 1000; // 1秒缓存超时

  // 全局缓存机制
  _globalCache = new Map();
  _globalCacheTimeouts = new Map();

  /**
   * 获取所有用户偏好设置
   */
  async getPreferences() {
    try {
      // 检查缓存是否有效
      const now = Date.now();
      if (this._preferencesCache && (now - this._lastPreferencesFetch) < this._cacheTimeout) {
        return this._preferencesCache;
      }

      const api = await ensureStorageAPI();
      const stored = await api.get({ key: this.storageKey });
      
      let result;
      if (stored.value) {
        const parsed = JSON.parse(stored.value);
        result = { ...this.defaultPreferences, ...parsed };
      } else {
        result = { ...this.defaultPreferences };
      }
      
      // 更新缓存
      this._preferencesCache = result;
      this._lastPreferencesFetch = now;
      
      return result;
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
      
      // 更新缓存
      this._preferencesCache = updated;
      this._lastPreferencesFetch = Date.now();
      
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
   * 获取用户星座
   */
  async getUserHoroscope() {
    const preferences = await this.getPreferences();
    return preferences.userHoroscope;
  }

  /**
   * 设置用户星座
   * @param {string} horoscope - 星座名称
   */
  async setUserHoroscope(horoscope) {
    return await this.savePreferences({ userHoroscope: horoscope });
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
   * 检查是否有存储的用户星座数据
   */
  async hasHoroscopeData() {
    const preferences = await this.getPreferences();
    return !!preferences.userHoroscope;
  }

  /**
   * 获取完整的用户信息
   */
  async getUserInfo() {
    const preferences = await this.getPreferences();
    return {
      zodiac: preferences.userZodiac,
      horoscope: preferences.userHoroscope,
      birthYear: preferences.birthYear,
      hasZodiacInfo: !!preferences.userZodiac,
      hasHoroscopeInfo: !!preferences.userHoroscope,
      hasBirthYearInfo: !!preferences.birthYear
    };
  }
  /**
   * 设置全局缓存超时时间（毫秒）
   * @param {number} timeout - 超时时间
   */
  setGlobalCacheTimeout(timeout) {
    this._globalCacheTimeout = timeout;
  }

  /**
   * 获取全局缓存超时时间
   * @returns {number} 超时时间（毫秒）
   */
  getGlobalCacheTimeout() {
    return this._globalCacheTimeout || 180000; // 默认3分钟
  }

  /**
   * 设置全局缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} [timeout] - 超时时间（毫秒），如果不提供则使用默认值
   */
  setGlobalCache(key, value, timeout) {
    const expiry = Date.now() + (timeout || this.getGlobalCacheTimeout());
    this._globalCache.set(key, {
      value: value,
      expiry: expiry
    });
    this._globalCacheTimeouts.set(key, expiry);
  }

  /**
   * 获取全局缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存值，如果不存在或过期则返回null
   */
  getGlobalCache(key) {
    const cached = this._globalCache.get(key);
    if (!cached) return null;
    
    // 检查是否过期
    if (Date.now() > cached.expiry) {
      this._globalCache.delete(key);
      this._globalCacheTimeouts.delete(key);
      return null;
    }
    
    return cached.value;
  }

  /**
   * 删除全局缓存
   * @param {string} key - 缓存键
   */
  removeGlobalCache(key) {
    this._globalCache.delete(key);
    this._globalCacheTimeouts.delete(key);
  }

  /**
   * 清除所有全局缓存
   */
  clearGlobalCache() {
    this._globalCache.clear();
    this._globalCacheTimeouts.clear();
  }

  /**
   * 获取所有全局缓存键
   * @returns {string[]} 缓存键数组
   */
  getAllGlobalCacheKeys() {
    // 清理过期缓存
    const now = Date.now();
    for (const [key, expiry] of this._globalCacheTimeouts) {
      if (now > expiry) {
        this._globalCache.delete(key);
        this._globalCacheTimeouts.delete(key);
      }
    }
    
    return Array.from(this._globalCache.keys());
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
  getUserHoroscope,
  setUserHoroscope,
  getBirthYear,
  setBirthYear,
  clearAll,
  hasZodiacData,
  hasHoroscopeData,
  getUserInfo
} = storageManager;

// 导出是否使用localStorage的标志
export const isUsingLocalStorage = () => !isNative || FORCE_LOCAL_STORAGE;