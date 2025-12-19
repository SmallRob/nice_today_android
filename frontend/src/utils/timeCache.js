/**
 * 全局时间缓存管理
 * 确保应用中的所有组件使用一致的日期时间
 */

class TimeCacheManager {
  constructor() {
    this.cache = {
      now: null,
      today: null,
      yesterday: null,
      tomorrow: null,
      year: null,
      month: null,
      day: null,
      hour: null,
      minute: null,
      second: null,
      timestamp: null,
      lastUpdate: null
    };
    
    this.updateCallbacks = [];
    this.updateInterval = null;
    this.init();
  }

  // 初始化时间缓存
  init() {
    this.update();
    // 设置定时器，每分钟更新一次时间
    this.updateInterval = setInterval(() => {
      this.update();
      this.notifyCallbacks();
    }, 60000); // 每分钟更新一次
    
    // 监听页面可见性变化，页面重新显示时更新时间
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.update();
          this.notifyCallbacks();
        }
      });
    }
  }

  // 更新时间缓存
  update() {
    const now = new Date();
    
    // 更新基本时间信息
    this.cache.now = now;
    this.cache.timestamp = now.getTime();
    this.cache.lastUpdate = now;
    
    // 分解日期时间组件
    this.cache.year = now.getFullYear();
    this.cache.month = now.getMonth() + 1; // 月份从1开始
    this.cache.day = now.getDate();
    this.cache.hour = now.getHours();
    this.cache.minute = now.getMinutes();
    this.cache.second = now.getSeconds();
    
    // 创建日期对象（午夜时间）
    this.cache.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 昨天
    const yesterday = new Date(this.cache.today);
    yesterday.setDate(yesterday.getDate() - 1);
    this.cache.yesterday = yesterday;
    
    // 明天
    const tomorrow = new Date(this.cache.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.cache.tomorrow = tomorrow;
    
    // 格式化的日期字符串
    this.cache.dateString = this.formatDate(this.cache.today);
    this.cache.timeString = this.formatTime(now);
    
    console.log('时间缓存已更新:', this.cache.dateString, this.cache.timeString);
  }

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 格式化时间为 HH:MM:SS
  formatTime(date) {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${hour}:${minute}:${second}`;
  }

  // 获取时间缓存
  getCache() {
    return { ...this.cache };
  }

  // 获取当前时间
  now() {
    return this.cache.now;
  }

  // 获取今天的日期
  today() {
    return this.cache.today;
  }

  // 获取昨天的日期
  yesterday() {
    return this.cache.yesterday;
  }

  // 获取明天的日期
  tomorrow() {
    return this.cache.tomorrow;
  }

  // 获取格式化的日期字符串
  dateString() {
    return this.cache.dateString;
  }

  // 获取格式化的时间字符串
  timeString() {
    return this.cache.timeString;
  }

  // 计算两个日期之间的天数差
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  // 检查是否是同一天
  isSameDay(date1, date2 = this.cache.today) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // 检查是否是今天
  isToday(date) {
    return this.isSameDay(date, this.cache.today);
  }

  // 检查是否是昨天
  isYesterday(date) {
    return this.isSameDay(date, this.cache.yesterday);
  }

  // 检查是否是明天
  isTomorrow(date) {
    return this.isSameDay(date, this.cache.tomorrow);
  }

  // 注册更新回调
  onUpdate(callback) {
    if (typeof callback === 'function') {
      this.updateCallbacks.push(callback);
    }
  }

  // 移除更新回调
  removeUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  // 通知所有注册的回调
  notifyCallbacks() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.cache);
      } catch (error) {
        console.error('时间缓存更新回调执行失败:', error);
      }
    });
  }

  // 清理资源
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.updateCallbacks = [];
  }
}

// 创建全局单例实例
const timeCacheManager = new TimeCacheManager();

// 导出管理器实例和常用方法
export default timeCacheManager;

// 便捷的导出方法
export const getCurrentTime = () => timeCacheManager.now();
export const getToday = () => timeCacheManager.today();
export const getYesterday = () => timeCacheManager.yesterday();
export const getTomorrow = () => timeCacheManager.tomorrow();
export const getDateString = () => timeCacheManager.dateString();
export const getTimeString = () => timeCacheManager.timeString();
export const isToday = (date) => timeCacheManager.isToday(date);
export const isYesterday = (date) => timeCacheManager.isYesterday(date);
export const isTomorrow = (date) => timeCacheManager.isTomorrow(date);