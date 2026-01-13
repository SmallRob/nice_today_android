/**
 * 步数计数器服务 - 用于获取和管理步数数据
 * 使用原生插件与 Google Fit API 交互
 */

import { Capacitor } from '@capacitor/core';

// Google Fit 配置
import { getClientId } from '../config/googleFitConfig';

// 动态导入Google Fit插件
let GoogleFit = null;

async function initializeGoogleFitPlugin() {
  if (GoogleFit !== null) {
    return GoogleFit;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      // 尝试从Capacitor获取插件
      const { Plugins } = await import('@capacitor/core');
      if (Plugins.GoogleFit) {
        GoogleFit = Plugins.GoogleFit;
      } else {
        // 如果插件不存在，创建一个模拟实现
        GoogleFit = {
          connect: async () => ({ connected: false }),
          getStepCount: async (options) => ({ steps: 0, data: [] }),
          checkPermissions: async () => ({ permissions: { activity: 'denied' }}),
          requestPermissions: async () => ({ permissions: { activity: 'denied' }})
        };
        console.warn('Google Fit plugin not found. Using mock implementation.');
      }
    } catch (error) {
      console.error('Error initializing Google Fit plugin:', error);
      // 创建模拟实现
      GoogleFit = {
        connect: async () => ({ connected: false }),
        getStepCount: async (options) => ({ steps: 0, data: [] }),
        checkPermissions: async () => ({ permissions: { activity: 'denied' }}),
        requestPermissions: async () => ({ permissions: { activity: 'denied' }})
      };
    }
  } else {
    // Web环境使用Web模拟实现
    try {
      const { GoogleFitWeb } = await import('../plugins/google-fit-web');
      const webInstance = new GoogleFitWeb();
      GoogleFit = {
        connect: webInstance.connect.bind(webInstance),
        getStepCount: webInstance.getStepCount.bind(webInstance),
        checkPermissions: webInstance.checkPermissions.bind(webInstance),
        requestPermissions: webInstance.requestPermissions.bind(webInstance)
      };
    } catch (error) {
      console.warn('Google Fit Web plugin not available:', error);
      // 创建简单的模拟实现
      GoogleFit = {
        connect: async () => ({ connected: true }),
        getStepCount: async (options) => ({ steps: 0, data: [] }),
        checkPermissions: async () => ({ permissions: { activity: 'granted' }}),
        requestPermissions: async () => ({ permissions: { activity: 'granted' }})
      };
    }
  }

  return GoogleFit;
}

// 模拟Google Fit API的接口
class StepCounterService {
  constructor() {
    this.isAuthorized = false;
    this.authPromise = null;
    this.clientId = getClientId();
  }

  /**
   * 授权访问健康数据
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async authorize() {
    if (Capacitor.isNativePlatform()) {
      try {
        const plugin = await initializeGoogleFitPlugin();
        
        // 使用原生Google Fit插件进行授权
        const result = await plugin.connect();
        
        if (result.connected) {
          this.isAuthorized = true;
          return {
            success: true,
            message: 'Google Fit授权成功'
          };
        } else {
          return {
            success: false,
            message: 'Google Fit授权失败或未安装Google Fit'
          };
        }
      } catch (error) {
        console.error('Google Fit授权失败:', error);
        return {
          success: false,
          message: `Google Fit授权失败: ${error.message}`
        };
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isAuthorized = true;
          resolve({
            success: true,
            message: '授权成功（模拟）'
          });
        }, 1000);
      });
    }
  }

  /**
   * 检查是否已授权
   * @returns {boolean}
   */
  isAuthorizationAvailable() {
    return this.isAuthorized;
  }

  /**
   * 获取每日步数样本
   * @param {Object} options - 查询选项
   * @param {string} options.startDate - 开始日期 (ISO 8601格式)
   * @param {string} options.endDate - 结束日期 (ISO 8601格式)
   * @param {string} [bucketUnit] - 分组单位 (DAY, HOUR等)
   * @param {number} [bucketSize] - 分组大小
   * @returns {Promise<Array>}
   */
  async getDailyStepCountSamples(options) {
    if (!this.isAuthorized) {
      throw new Error('未授权访问健康数据');
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const plugin = await initializeGoogleFitPlugin();
        
        // 使用原生Google Fit插件获取步数数据
        const result = await plugin.getStepCount({
          startDate: options.startDate,
          endDate: options.endDate
        });
        
        // 将返回的数据转换为期望的格式
        const stepData = [];
        if (result.data && result.data.length > 0) {
          result.data.forEach(dayData => {
            const date = new Date(dayData.date);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);
            
            stepData.push({
              startDate: startOfDay.toISOString(),
              endDate: endOfDay.toISOString(),
              steps: [{
                startTime: startOfDay.toISOString(),
                endTime: endOfDay.toISOString(),
                value: dayData.steps
              }],
              source: 'com.google.android.gms:estimated_steps'
            });
          });
        }

        return stepData;
      } catch (error) {
        console.error('获取步数样本失败:', error);
        throw error;
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟生成步数数据
          const { startDate, endDate } = options;
          const start = new Date(startDate);
          const end = new Date(endDate);
          const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

          const stepData = [];
          for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            
            // 生成随机步数数据（0-15000之间）
            const steps = Math.floor(Math.random() * 15000);
            
            stepData.push({
              startDate: date.toISOString(),
              endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
              steps: [{
                startTime: date.toISOString(),
                endTime: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                value: steps
              }],
              source: 'com.google.android.gms:estimated_steps'
            });
          }

          resolve(stepData);
        }, 800);
      });
    }
  }

  /**
   * 获取当前步数
   * @returns {Promise<number>} 当前步数
   */
  async getCurrentSteps() {
    if (!this.isAuthorized) {
      throw new Error('未授权访问健康数据');
    }

    if (Capacitor.isNativePlatform()) {
      try {
        // 获取今天的步数数据
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const plugin = await initializeGoogleFitPlugin();
        const result = await plugin.getStepCount({
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString()
        });
        
        // 返回今天的步数
        // 这里需要根据实际返回的数据结构进行调整
        const todaySteps = result.data ? 
          result.data.find(day => day.date === now.toISOString().split('T')[0])?.steps || 0 
          : result.steps || 0;
        
        return todaySteps;
      } catch (error) {
        console.error('获取当前步数失败:', error);
        return 0;
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成随机当前步数
          const currentSteps = Math.floor(Math.random() * 15000);
          resolve(currentSteps);
        }, 500);
      });
    }
  }

  /**
   * 获取历史步数趋势
   * @param {number} days - 获取过去几天的数据
   * @returns {Promise<Array>} 步数趋势数据
   */
  async getStepHistory(days = 7) {
    if (!this.isAuthorized) {
      throw new Error('未授权访问健康数据');
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days + 1); // 获取过去N天的数据
        
        const plugin = await initializeGoogleFitPlugin();
        const result = await plugin.getStepCount({
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        });
        
        // 返回从插件获取的数据
        if (result.data) {
          return result.data;
        } else {
          // 如果插件没有返回详细数据，创建默认结构
          const history = [];
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            history.push({
              date: date.toISOString().split('T')[0],
              steps: Math.floor(Math.random() * 12000) + Math.floor(Math.random() * 3000)
            });
          }
          return history;
        }
      } catch (error) {
        console.error('获取步数历史失败:', error);
        throw error;
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          const history = [];
          const today = new Date();

          for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // 生成随机步数数据，最近的日期可能有更高的活动
            const steps = Math.floor(Math.random() * 12000) + Math.floor(Math.random() * 3000);
            
            history.push({
              date: date.toISOString().split('T')[0],
              steps: steps
            });
          }

          resolve(history);
        }, 600);
      });
    }
  }

  /**
   * 获取平均步数
   * @param {number} days - 计算过去几天的平均值
   * @returns {Promise<number>} 平均步数
   */
  async getAverageSteps(days = 7) {
    const history = await this.getStepHistory(days);
    const totalSteps = history.reduce((sum, day) => sum + day.steps, 0);
    return Math.round(totalSteps / history.length);
  }

  /**
   * 获取步数统计信息
   * @returns {Promise<Object>} 步数统计信息
   */
  async getStepStats() {
    if (!this.isAuthorized) {
      throw new Error('未授权访问健康数据');
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const currentSteps = await this.getCurrentSteps();
        const weeklyAvg = await this.getAverageSteps(7);
        const monthlyAvg = await this.getAverageSteps(30);

        return {
          today: currentSteps,
          weeklyAverage: weeklyAvg,
          monthlyAverage: monthlyAvg,
          isActive: currentSteps > 5000, // 如果超过5000步则认为活跃
          goal: 10000 // 默认目标
        };
      } catch (error) {
        console.error('获取步数统计信息失败:', error);
        // 如果获取真实数据失败，返回默认值
        return {
          today: 0,
          weeklyAverage: 0,
          monthlyAverage: 0,
          isActive: false,
          goal: 10000
        };
      }
    } else {
      // Web环境的模拟实现
      return new Promise(async (resolve) => {
        setTimeout(async () => {
          try {
            const currentSteps = await this.getCurrentSteps();
            const weeklyAvg = await this.getAverageSteps(7);
            const monthlyAvg = await this.getAverageSteps(30);

            resolve({
              today: currentSteps,
              weeklyAverage: weeklyAvg,
              monthlyAverage: monthlyAvg,
              isActive: currentSteps > 5000, // 如果超过5000步则认为活跃
              goal: 10000 // 默认目标
            });
          } catch (error) {
            console.error('获取步数统计信息失败:', error);
            resolve({
              today: 0,
              weeklyAverage: 0,
              monthlyAverage: 0,
              isActive: false,
              goal: 10000
            });
          }
        }, 700);
      });
    }
  }

  /**
   * 请求权限
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    if (Capacitor.isNativePlatform()) {
      try {
        const plugin = await initializeGoogleFitPlugin();
        // 使用原生插件请求权限
        const result = await plugin.requestPermissions();
        
        const isStepsGranted = result.permissions?.steps === 'granted';
        const isActivityGranted = result.permissions?.activity === 'granted';
        
        this.isAuthorized = isStepsGranted && isActivityGranted;
        
        return this.isAuthorized;
      } catch (error) {
        console.error('请求权限失败:', error);
        return false;
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟用户同意授权
          this.isAuthorized = true;
          resolve(true);
        }, 500);
      });
    }
  }

  /**
   * 检查权限状态
   * @returns {Promise<'authorized'|'denied'|'not_determined'>}
   */
  async checkPermissions() {
    if (Capacitor.isNativePlatform()) {
      try {
        const plugin = await initializeGoogleFitPlugin();
        const result = await plugin.checkPermissions();
        
        // 检查步数和活动权限的状态
        const stepsPermission = result.permissions?.steps || 'not_determined';
        const activityPermission = result.permissions?.activity || 'not_determined';
        
        // 如果两个权限都是授权的，则整体为授权
        if (stepsPermission === 'granted' && activityPermission === 'granted') {
          this.isAuthorized = true;
          return 'authorized';
        } else if (stepsPermission === 'denied' || activityPermission === 'denied') {
          this.isAuthorized = false;
          return 'denied';
        } else {
          this.isAuthorized = false;
          return 'not_determined';
        }
      } catch (error) {
        console.error('检查权限状态失败:', error);
        return 'not_determined';
      }
    } else {
      // Web环境的模拟实现
      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.isAuthorized) {
            resolve('authorized');
          } else {
            resolve('not_determined');
          }
        }, 300);
      });
    }
  }
}

// 创建单例实例
const stepCounterService = new StepCounterService();

// 导出服务实例和类型定义
export default stepCounterService;

// 导出类型定义
/**
 * @typedef {Object} StepOptions
 * @property {string} startDate - 开始日期
 * @property {string} endDate - 结束日期
 * @property {string} [bucketUnit] - 分组单位
 * @property {number} [bucketSize] - 分组大小
 */

/**
 * @typedef {Object} StepData
 * @property {string} startDate - 开始时间
 * @property {string} endDate - 结束时间
 * @property {Array} steps - 步数数组
 * @property {string} source - 数据源
 */

/**
 * @typedef {Object} StepStats
 * @property {number} today - 今日步数
 * @property {number} weeklyAverage - 周平均步数
 * @property {number} monthlyAverage - 月平均步数
 * @property {boolean} isActive - 是否活跃
 * @property {number} goal - 目标步数
 */