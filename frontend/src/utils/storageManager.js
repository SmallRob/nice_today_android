/**
 * 本地存储管理器
 * 提供统一的本地存储接口，支持用户偏好设置
 */

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
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
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
  savePreferences(preferences) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
      return false;
    }
  }

  /**
   * 获取用户生肖
   */
  getUserZodiac() {
    return this.getPreferences().userZodiac;
  }

  /**
   * 设置用户生肖
   * @param {string} zodiac - 生肖名称
   */
  setUserZodiac(zodiac) {
    return this.savePreferences({ userZodiac: zodiac });
  }

  /**
   * 获取用户出生年份
   */
  getBirthYear() {
    return this.getPreferences().birthYear;
  }

  /**
   * 设置用户出生年份
   * @param {number} year - 出生年份
   */
  setBirthYear(year) {
    return this.savePreferences({ birthYear: year });
  }

  /**
   * 清除所有用户数据
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('清除用户数据失败:', error);
      return false;
    }
  }

  /**
   * 检查是否有存储的用户生肖数据
   */
  hasZodiacData() {
    const preferences = this.getPreferences();
    return !!preferences.userZodiac;
  }

  /**
   * 获取完整的用户信息
   */
  getUserInfo() {
    const preferences = this.getPreferences();
    return {
      zodiac: preferences.userZodiac,
      birthYear: preferences.birthYear,
      hasCompleteInfo: !!preferences.userZodiac && !!preferences.birthYear
    };
  }
}

// 创建单例实例
export const storageManager = new StorageManager();

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