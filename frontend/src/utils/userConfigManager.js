/**
 * 用户配置管理器
 * 负责管理用户的个人信息配置，包括昵称、出生日期、星座和属相
 * 支持多组配置，默认加载第一组配置数据
 */

// 默认配置模板
const DEFAULT_CONFIG = {
  nickname: '叉子',
  birthDate: '1991-04-30',
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'INFP'
};

// 空配置默认值
const EMPTY_CONFIG_DEFAULTS = {
  nickname: '新用户',
  birthDate: '1991-04-21',
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'ISFP'
};

// 本地存储键名
const STORAGE_KEYS = {
  USER_CONFIGS: 'nice_today_user_configs',
  ACTIVE_CONFIG_INDEX: 'nice_today_active_config_index'
};

class UserConfigManager {
  constructor() {
    this.configs = [];
    this.activeConfigIndex = 0;
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * 初始化配置管理器
   */
  async initialize() {
    try {
      // 从本地存储加载配置
      const storedConfigs = localStorage.getItem(STORAGE_KEYS.USER_CONFIGS);
      const storedIndex = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX);
      
      // 解析配置数据
      this.configs = storedConfigs ? JSON.parse(storedConfigs) : [DEFAULT_CONFIG];
      this.activeConfigIndex = storedIndex ? parseInt(storedIndex, 10) : 0;
      
      // 确保至少有一组配置
      if (this.configs.length === 0) {
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
      }
      
      // 确保索引在有效范围内
      this.activeConfigIndex = Math.max(0, Math.min(this.activeConfigIndex, this.configs.length - 1));
      
      this.initialized = true;
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('用户配置管理器初始化完成', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex
      });
      
      return true;
    } catch (error) {
      console.error('初始化用户配置管理器失败:', error);
      this.configs = [DEFAULT_CONFIG];
      this.activeConfigIndex = 0;
      this.initialized = true;
      return false;
    }
  }

  /**
   * 获取当前活跃配置
   * @returns {Object} 当前配置对象
   */
  getCurrentConfig() {
    if (!this.initialized || this.configs.length === 0) {
      return DEFAULT_CONFIG;
    }
    const currentConfig = this.configs[this.activeConfigIndex];
    
    // 如果是空配置，返回默认值
    if (!currentConfig || 
        !currentConfig.nickname || 
        !currentConfig.birthDate || 
        !currentConfig.zodiac || 
        !currentConfig.zodiacAnimal) {
      return { ...EMPTY_CONFIG_DEFAULTS, ...currentConfig };
    }
    
    return currentConfig;
  }

  /**
   * 获取所有配置
   * @returns {Array} 所有配置数组
   */
  getAllConfigs() {
    if (!this.initialized) {
      return [DEFAULT_CONFIG];
    }
    return [...this.configs];
  }

  /**
   * 获取当前活跃配置的索引
   * @returns {Number} 当前配置索引
   */
  getActiveConfigIndex() {
    return this.activeConfigIndex;
  }

  /**
   * 添加新配置
   * @param {Object} config 新配置对象
   * @returns {Boolean} 是否添加成功
   */
  addConfig(config) {
    if (!config || typeof config !== 'object') {
      console.error('配置对象无效');
      return false;
    }
    
    // 确保配置包含必要字段
    const newConfig = {
      nickname: config.nickname || `用户${this.configs.length + 1}`,
      birthDate: config.birthDate || '1991-01-01',
      zodiac: config.zodiac || '未知',
      zodiacAnimal: config.zodiacAnimal || '未知',
      gender: config.gender || 'male',
      mbti: config.mbti || 'ISFP',
      ...config
    };
    
    this.configs.push(newConfig);
    this.saveToStorage();
    this.notifyListeners();
    
    console.log('添加新配置成功', newConfig);
    return true;
  }

  /**
   * 更新指定索引的配置
   * @param {Number} index 配置索引
   * @param {Object} updates 更新的字段
   * @returns {Boolean} 是否更新成功
   */
  updateConfig(index, updates) {
    if (!this.initialized || 
        index < 0 || 
        index >= this.configs.length || 
        !updates || 
        typeof updates !== 'object') {
      console.error('无效的参数');
      return false;
    }
    
    // 更新配置
    this.configs[index] = { ...this.configs[index], ...updates };
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 通知监听器
    this.notifyListeners();
    
    console.log(`更新配置 ${index} 成功`, this.configs[index]);
    return true;
  }

  /**
   * 删除指定索引的配置
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否删除成功
   */
  removeConfig(index) {
    if (!this.initialized || 
        index < 0 || 
        index >= this.configs.length || 
        this.configs.length <= 1) {
      console.error('无法删除配置：索引无效或只剩一个配置');
      return false;
    }
    
    // 删除配置
    this.configs.splice(index, 1);
    
    // 调整活跃索引
    if (index === this.activeConfigIndex) {
      this.activeConfigIndex = Math.max(0, this.activeConfigIndex - 1);
    } else if (index < this.activeConfigIndex) {
      this.activeConfigIndex--;
    }
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 通知监听器
    this.notifyListeners();
    
    console.log(`删除配置 ${index} 成功，当前活跃索引 ${this.activeConfigIndex}`);
    return true;
  }

  /**
   * 设置活跃配置
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否设置成功
   */
  setActiveConfig(index) {
    if (!this.initialized || index < 0 || index >= this.configs.length) {
      console.error('无效的配置索引');
      return false;
    }
    
    this.activeConfigIndex = index;
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 通知监听器
    this.notifyListeners();
    
    console.log(`设置活跃配置为 ${index} 成功`);
    return true;
  }

  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CONFIGS, JSON.stringify(this.configs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX, this.activeConfigIndex.toString());
      return true;
    } catch (error) {
      console.error('保存配置到本地存储失败:', error);
      return false;
    }
  }

  /**
   * 添加配置变更监听器
   * @param {Function} listener 监听器函数
   * @returns {Function} 移除监听器的函数
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('监听器必须是函数');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 检查配置是否已存在
   * @param {Object} config 要检查的配置
   * @returns {Number} 如果存在返回索引，不存在返回-1
   */
  findConfigIndex(config) {
    if (!config || typeof config !== 'object') return -1;
    
    return this.configs.findIndex(existingConfig => {
      return existingConfig &&
             existingConfig.nickname === config.nickname &&
             existingConfig.birthDate === config.birthDate &&
             existingConfig.zodiac === config.zodiac &&
             existingConfig.zodiacAnimal === config.zodiacAnimal &&
             existingConfig.mbti === config.mbti;
    });
  }

  /**
   * 自动保存或更新配置
   * @param {Object} config 要保存的配置
   * @returns {Boolean} 是否保存成功
   */
  autoSaveConfig(config) {
    if (!config || typeof config !== 'object') {
      console.error('配置对象无效');
      return false;
    }
    
    // 确保配置包含必要字段
    const normalizedConfig = {
      nickname: config.nickname || EMPTY_CONFIG_DEFAULTS.nickname,
      birthDate: config.birthDate || EMPTY_CONFIG_DEFAULTS.birthDate,
      zodiac: config.zodiac || EMPTY_CONFIG_DEFAULTS.zodiac,
      zodiacAnimal: config.zodiacAnimal || EMPTY_CONFIG_DEFAULTS.zodiacAnimal,
      mbti: config.mbti || EMPTY_CONFIG_DEFAULTS.mbti
    };
    
    // 检查是否已存在相同配置
    const existingIndex = this.findConfigIndex(normalizedConfig);
    
    if (existingIndex !== -1) {
      // 如果已存在，直接设置为活跃配置
      this.activeConfigIndex = existingIndex;
      this.saveToStorage();
      this.notifyListeners();
      console.log('配置已存在，直接设置为活跃配置', existingIndex);
      return true;
    }
    
    // 如果不存在，添加新配置
    this.configs.push(normalizedConfig);
    this.activeConfigIndex = this.configs.length - 1;
    this.saveToStorage();
    this.notifyListeners();
    
    console.log('保存新配置成功', normalizedConfig);
    return true;
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(forceReload = false) {
    const currentConfig = this.getCurrentConfig();
    this.listeners.forEach(listener => {
      try {
        listener({
          configs: [...this.configs],
          activeConfigIndex: this.activeConfigIndex,
          currentConfig,
          forceReload // 强制重新加载标志
        });
      } catch (error) {
        console.error('监听器执行出错:', error);
      }
    });
  }

  /**
   * 强制重新加载所有组件
   */
  forceReloadAll() {
    this.notifyListeners(true);
  }

  /**
   * 重置为默认配置
   */
  resetToDefaults() {
    this.configs = [DEFAULT_CONFIG];
    this.activeConfigIndex = 0;
    this.saveToStorage();
    this.notifyListeners();
    console.log('已重置为默认配置');
  }

  /**
   * 导出配置数据
   * @returns {String} JSON字符串
   */
  exportConfigs() {
    try {
      return JSON.stringify({
        configs: this.configs,
        activeConfigIndex: this.activeConfigIndex,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('导出配置失败:', error);
      return null;
    }
  }

  /**
   * 导入配置数据
   * @param {String} jsonData JSON字符串
   * @returns {Boolean} 是否导入成功
   */
  importConfigs(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.configs || !Array.isArray(data.configs)) {
        throw new Error('无效的配置数据格式');
      }
      
      this.configs = data.configs;
      this.activeConfigIndex = data.activeConfigIndex || 0;
      
      // 确保至少有一组配置
      if (this.configs.length === 0) {
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
      }
      
      // 确保索引在有效范围内
      this.activeConfigIndex = Math.max(0, Math.min(this.activeConfigIndex, this.configs.length - 1));
      
      this.saveToStorage();
      this.notifyListeners();
      
      console.log('导入配置成功', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex
      });
      
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
}

// 创建单例实例
export const userConfigManager = new UserConfigManager();

export default UserConfigManager;