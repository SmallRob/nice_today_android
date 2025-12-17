import localDataService from './localDataService';
import { storageManager } from '../utils/storageManager';

// 离线数据管理器
class OfflineDataManager {
  constructor() {
    // 数据存储键名
    this.storageKeys = {
      BIORHYTHM_DATA: 'offline_biorhythm_data',
      DRESS_INFO_DATA: 'offline_dress_info_data',
      MAYA_CALENDAR_DATA: 'offline_maya_calendar_data',
      USER_PREFERENCES: 'offline_user_preferences',
      LAST_SYNC_TIME: 'offline_last_sync_time'
    };
    
    // 数据过期时间（毫秒）
    this.expirationTimes = {
      BIORHYTHM_DATA: 24 * 60 * 60 * 1000, // 24小时
      DRESS_INFO_DATA: 24 * 60 * 60 * 1000, // 24小时
      MAYA_CALENDAR_DATA: 24 * 60 * 60 * 1000, // 24小时
      USER_PREFERENCES: 7 * 24 * 60 * 60 * 1000 // 7天
    };
    
    // 初始化
    this.init();
  }
  
  // 初始化
  async init() {
    // 检查是否支持本地存储
    this.isLocalStorageSupported = this.checkLocalStorageSupport();
    
    if (!this.isLocalStorageSupported) {
      console.warn('本地存储不可用，离线数据功能将受限');
    }
  }
  
  // 检查本地存储是否支持
  checkLocalStorageSupport() {
    try {
      const testKey = '__test_localstorage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // 生成带时间戳的数据对象
  createTimestampedData(data) {
    return {
      data: data,
      timestamp: Date.now(),
      version: '1.0'
    };
  }
  
  // 检查数据是否过期
  isDataExpired(timestamp, dataType) {
    const expirationTime = this.expirationTimes[dataType] || this.expirationTimes.BIORHYTHM_DATA;
    return Date.now() - timestamp > expirationTime;
  }
  
  // 保存生物节律数据
  async saveBiorhythmData(birthDate, data) {
    if (!this.isLocalStorageSupported) return false;
    
    try {
      const key = `${this.storageKeys.BIORHYTHM_DATA}_${birthDate}`;
      const timestampedData = this.createTimestampedData(data);
      localStorage.setItem(key, JSON.stringify(timestampedData));
      return true;
    } catch (error) {
      console.error('保存生物节律数据失败:', error);
      return false;
    }
  }
  
  // 获取生物节律数据
  async getBiorhythmData(birthDate) {
    if (!this.isLocalStorageSupported) return null;
    
    try {
      const key = `${this.storageKeys.BIORHYTHM_DATA}_${birthDate}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const timestampedData = JSON.parse(stored);
        
        // 检查数据是否过期
        if (!this.isDataExpired(timestampedData.timestamp, 'BIORHYTHM_DATA')) {
          return timestampedData.data;
        } else {
          // 数据过期，删除过期数据
          localStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取生物节律数据失败:', error);
      return null;
    }
  }
  
  // 保存穿衣信息数据
  async saveDressInfoData(date, data) {
    if (!this.isLocalStorageSupported) return false;
    
    try {
      const key = `${this.storageKeys.DRESS_INFO_DATA}_${date}`;
      const timestampedData = this.createTimestampedData(data);
      localStorage.setItem(key, JSON.stringify(timestampedData));
      return true;
    } catch (error) {
      console.error('保存穿衣信息数据失败:', error);
      return false;
    }
  }
  
  // 获取穿衣信息数据
  async getDressInfoData(date) {
    if (!this.isLocalStorageSupported) return null;
    
    try {
      const key = `${this.storageKeys.DRESS_INFO_DATA}_${date}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const timestampedData = JSON.parse(stored);
        
        // 检查数据是否过期
        if (!this.isDataExpired(timestampedData.timestamp, 'DRESS_INFO_DATA')) {
          return timestampedData.data;
        } else {
          // 数据过期，删除过期数据
          localStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取穿衣信息数据失败:', error);
      return null;
    }
  }
  
  // 保存玛雅日历数据
  async saveMayaCalendarData(date, data) {
    if (!this.isLocalStorageSupported) return false;
    
    try {
      const key = `${this.storageKeys.MAYA_CALENDAR_DATA}_${date}`;
      const timestampedData = this.createTimestampedData(data);
      localStorage.setItem(key, JSON.stringify(timestampedData));
      return true;
    } catch (error) {
      console.error('保存玛雅日历数据失败:', error);
      return false;
    }
  }
  
  // 获取玛雅日历数据
  async getMayaCalendarData(date) {
    if (!this.isLocalStorageSupported) return null;
    
    try {
      const key = `${this.storageKeys.MAYA_CALENDAR_DATA}_${date}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const timestampedData = JSON.parse(stored);
        
        // 检查数据是否过期
        if (!this.isDataExpired(timestampedData.timestamp, 'MAYA_CALENDAR_DATA')) {
          return timestampedData.data;
        } else {
          // 数据过期，删除过期数据
          localStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取玛雅日历数据失败:', error);
      return null;
    }
  }
  
  // 保存用户偏好设置
  async saveUserPreferences(preferences) {
    if (!this.isLocalStorageSupported) return false;
    
    try {
      const key = this.storageKeys.USER_PREFERENCES;
      const timestampedData = this.createTimestampedData(preferences);
      localStorage.setItem(key, JSON.stringify(timestampedData));
      return true;
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
      return false;
    }
  }
  
  // 获取用户偏好设置
  async getUserPreferences() {
    if (!this.isLocalStorageSupported) return null;
    
    try {
      const key = this.storageKeys.USER_PREFERENCES;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const timestampedData = JSON.parse(stored);
        
        // 检查数据是否过期
        if (!this.isDataExpired(timestampedData.timestamp, 'USER_PREFERENCES')) {
          return timestampedData.data;
        } else {
          // 数据过期，删除过期数据
          localStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取用户偏好设置失败:', error);
      return null;
    }
  }
  
  // 清除所有离线数据
  async clearAllOfflineData() {
    if (!this.isLocalStorageSupported) return false;
    
    try {
      Object.values(this.storageKeys).forEach(key => {
        // 删除所有匹配的键
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith(key)) {
            localStorage.removeItem(storageKey);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('清除离线数据失败:', error);
      return false;
    }
  }
  
  // 获取本地存储使用情况
  getStorageUsage() {
    if (!this.isLocalStorageSupported) return null;
    
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += key.length + value.length;
        itemCount++;
      }
      
      return {
        totalSize: totalSize,
        itemCount: itemCount,
        maxSize: 5 * 1024 * 1024, // 5MB (典型限制)
        usagePercentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return null;
    }
  }
  
  // 预加载数据以提高性能
  async preloadData(birthDate, dateRange = 7) {
    if (!this.isLocalStorageSupported) return;
    
    try {
      // 预加载生物节律数据
      const today = new Date();
      for (let i = 0; i < dateRange; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const dateStr = localDataService.formatDateString(targetDate);
        
        // 检查是否存在缓存数据
        const cachedData = await this.getBiorhythmData(birthDate);
        if (!cachedData) {
          // 如果没有缓存数据，计算并保存
          const result = await localDataService.calculateBiorhythmData(birthDate, targetDate);
          if (result.success) {
            await this.saveBiorhythmData(birthDate, result.data);
          }
        }
      }
      
      console.log(`预加载了${dateRange}天的生物节律数据`);
    } catch (error) {
      console.error('预加载数据失败:', error);
    }
  }
  
  // 同步数据（模拟）
  async syncData(apiService, apiBaseUrl) {
    // 这里可以实现与服务器的数据同步逻辑
    // 由于是离线数据管理器，这里只是示例
    console.log('开始同步数据...');
    
    try {
      // 保存同步时间
      const lastSyncTime = Date.now();
      localStorage.setItem(this.storageKeys.LAST_SYNC_TIME, lastSyncTime.toString());
      
      console.log('数据同步完成');
      return {
        success: true,
        lastSyncTime: lastSyncTime
      };
    } catch (error) {
      console.error('数据同步失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取上次同步时间
  getLastSyncTime() {
    try {
      const lastSyncTime = localStorage.getItem(this.storageKeys.LAST_SYNC_TIME);
      return lastSyncTime ? parseInt(lastSyncTime, 10) : null;
    } catch (error) {
      console.error('获取上次同步时间失败:', error);
      return null;
    }
  }
}

// 创建离线数据管理器实例
const offlineDataManager = new OfflineDataManager();

// 导出离线数据管理器实例和类
export default offlineDataManager;
export { OfflineDataManager };