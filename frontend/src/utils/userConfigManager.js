/**
 * 用户配置管理器
 * 负责管理用户的个人信息配置，包括昵称、出生日期、星座和属相
 * 支持多组配置，默认加载第一组配置数据
 */

// 默认配置模板
const DEFAULT_CONFIG = {
  nickname: '叉子',
  realName: '', // 真实姓名（用于五格评分和八字测算）
  birthDate: '1991-04-30',
  birthTime: '12:30',
  shichen: '午时',
  birthLocation: {
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    lng: 116.48,
    lat: 39.95
  },
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'INFP',
  nameScore: null, // 姓名评分结果
  bazi: null, // 八字命格信息（包含四柱、时辰、经纬度等）
  isused: false, // 是否为当前使用的配置
  isSystemDefault: true // 标记为系统默认配置
};

// 空配置默认值
const EMPTY_CONFIG_DEFAULTS = {
  nickname: '新用户',
  realName: '',
  birthDate: '1991-04-21',
  birthTime: '12:30',
  shichen: '午时',
  birthLocation: {
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    lng: 116.48,
    lat: 39.95
  },
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'ISFP',
  nameScore: null,
  bazi: null,
  isused: false,
  isSystemDefault: false
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

      console.log('从本地存储加载配置:', {
        hasConfigs: !!storedConfigs,
        hasIndex: !!storedIndex,
        configsLength: storedConfigs ? storedConfigs.length : 0
      });

      // 解析配置数据
      this.configs = storedConfigs ? JSON.parse(storedConfigs) : [DEFAULT_CONFIG];
      this.activeConfigIndex = storedIndex ? parseInt(storedIndex, 10) : 0;

      // 确保至少有一组配置
      if (this.configs.length === 0) {
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
      }

      // 确保每个配置都有必要的字段，包括 isused 和 isSystemDefault
      this.configs = this.configs.map(config => ({
        nickname: config.nickname || DEFAULT_CONFIG.nickname,
        realName: config.realName || '',
        birthDate: config.birthDate || DEFAULT_CONFIG.birthDate,
        birthTime: config.birthTime || DEFAULT_CONFIG.birthTime,
        shichen: config.shichen || DEFAULT_CONFIG.shichen,
        birthLocation: config.birthLocation || DEFAULT_CONFIG.birthLocation,
        zodiac: config.zodiac || DEFAULT_CONFIG.zodiac,
        zodiacAnimal: config.zodiacAnimal || DEFAULT_CONFIG.zodiacAnimal,
        gender: config.gender || DEFAULT_CONFIG.gender,
        mbti: config.mbti || DEFAULT_CONFIG.mbti,
        nameScore: config.nameScore || null,
        bazi: config.bazi || null,
        isused: config.isused || false, // 确保 isused 字段存在
        isSystemDefault: config.isSystemDefault !== undefined ? config.isSystemDefault : false, // 确保 isSystemDefault 字段存在
        ...config
      }));

      // 检查是否存在系统默认配置（只有一个默认配置的系统默认标记为 true）
      const systemDefaultIndex = this.configs.findIndex(c => c.nickname === '叉子' && c.birthDate === '1991-04-30');
      if (systemDefaultIndex !== -1 && systemDefaultIndex === 0) {
        this.configs[systemDefaultIndex].isSystemDefault = true;
      }

      // 如果有自定义配置且存在系统默认配置，将系统默认配置标记为禁用
      const hasCustomConfig = this.configs.some(c => c.nickname !== '叉子');
      if (hasCustomConfig && systemDefaultIndex !== -1) {
        this.configs[systemDefaultIndex].isSystemDefault = false;
      }

      // 确保 activeConfigIndex 与 isused 状态一致
      // 检查是否有配置的 isused 为 true
      const hasUsedConfig = this.configs.some(c => c.isused === true);
      if (hasUsedConfig) {
        // 如果有 isused 为 true 的配置，使用第一个 isused 为 true 的配置索引
        const usedIndex = this.configs.findIndex(c => c.isused === true);
        this.activeConfigIndex = usedIndex >= 0 ? usedIndex : 0;
      } else {
        // 如果没有 isused 为 true 的配置，将当前 activeConfigIndex 对应的配置设为 isused = true
        this.configs[this.activeConfigIndex].isused = true;
      }

      // 确保只有一个配置的 isused 为 true
      this.configs.forEach((config, idx) => {
        config.isused = idx === this.activeConfigIndex;
      });

      // 确保索引在有效范围内
      this.activeConfigIndex = Math.max(0, Math.min(this.activeConfigIndex, this.configs.length - 1));

      this.initialized = true;

      // 通知监听器
      this.notifyListeners();

      console.log('用户配置管理器初始化完成', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex,
        hasSystemDefault: this.configs.some(c => c.isSystemDefault === true)
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
      realName: config.realName || '',
      birthDate: config.birthDate || '1991-01-01',
      birthTime: config.birthTime || '12:30',
      shichen: config.shichen || '午时二刻',
      birthLocation: config.birthLocation || {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        lng: 116.48,
        lat: 39.95
      },
      zodiac: config.zodiac || '未知',
      zodiacAnimal: config.zodiacAnimal || '未知',
      gender: config.gender || 'male',
      mbti: config.mbti || 'ISFP',
      nameScore: config.nameScore || null,
      isused: false, // 新配置默认不使用
      isSystemDefault: false, // 新配置不是系统默认配置
      ...config
    };

    this.configs.push(newConfig);

    // 如果存在系统默认配置，将其 isSystemDefault 标记为 false
    const systemDefaultIndex = this.configs.findIndex(c => c.isSystemDefault === true);
    if (systemDefaultIndex !== -1) {
      this.configs[systemDefaultIndex].isSystemDefault = false;
      console.log('已禁用系统默认配置', systemDefaultIndex);
    }

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

    // 保留原配置的 isused 状态（除非明确指定）
    const keepIsused = this.configs[index].isused && updates.isused === undefined;
    const configUpdates = keepIsused ? updates : { ...updates };

    // 更新配置
    this.configs[index] = { ...this.configs[index], ...configUpdates };

    // 保存到本地存储
    this.saveToStorage();

    // 通知监听器
    this.notifyListeners();

    console.log(`更新配置 ${index} 成功，isused: ${this.configs[index].isused}`, this.configs[index]);
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

    // 确保有一个配置被设置为 isused = true
    if (this.configs.length > 0 && this.activeConfigIndex >= 0) {
      // 更新所有配置的 isused 状态
      this.configs.forEach((config, idx) => {
        config.isused = idx === this.activeConfigIndex;
      });
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

    // 更新所有配置的 isused 状态
    this.configs.forEach((config, idx) => {
      config.isused = idx === index;
    });

    this.activeConfigIndex = index;

    // 保存到本地存储
    this.saveToStorage();

    // 通知监听器
    this.notifyListeners();

    console.log(`设置活跃配置为 ${index} 成功，isused 状态已更新`);
    return true;
  }

  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    try {
      const configsJson = JSON.stringify(this.configs);
      localStorage.setItem(STORAGE_KEYS.USER_CONFIGS, configsJson);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX, this.activeConfigIndex.toString());
      
      // 验证保存是否成功
      const verifyConfigs = localStorage.getItem(STORAGE_KEYS.USER_CONFIGS);
      const verifyIndex = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX);
      
      if (verifyConfigs !== configsJson) {
        console.error('保存配置验证失败：存储的数据与预期不符');
        return false;
      }
      
      console.log('配置已成功保存到本地存储', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex
      });
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
      return () => { };
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