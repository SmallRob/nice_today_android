/**
 * 轻量版用户配置管理器
 * 独立管理轻量版的用户配置，与炫彩版完全隔离
 */

// 轻量版默认配置模板
const LITE_DEFAULT_CONFIG = Object.freeze({
  nickname: '轻量版用户',
  realName: '',
  birthDate: '1990-01-01',
  birthTime: '12:00',
  shichen: '午时',
  birthLocation: Object.freeze({
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    lng: 116.48,
    lat: 39.95
  }),
  zodiac: '摩羯座',
  zodiacAnimal: '马',
  gender: 'secret',
  mbti: '',
  nameScore: null,
  bazi: null,
  lunarBirthDate: null,
  trueSolarTime: null,
  lunarInfo: null,
  lastCalculated: null,
  isused: false,
  isSystemDefault: true
});

// 轻量版专用存储键名
const LITE_STORAGE_KEYS = {
  USER_CONFIGS: 'nice_today_lite_user_configs',
  ACTIVE_CONFIG_INDEX: 'nice_today_lite_active_config_index'
};

/**
 * 深拷贝配置对象，确保用户配置与默认配置完全隔离
 */
function deepCloneConfig(sourceConfig) {
  if (!sourceConfig || typeof sourceConfig !== 'object') {
    return sourceConfig;
  }

  // 创建安全的配置对象副本
  const safeConfig = {
    // 基础字段
    nickname: sourceConfig.nickname || '',
    realName: sourceConfig.realName || '',
    birthDate: sourceConfig.birthDate || '',
    birthTime: sourceConfig.birthTime || '12:00',
    shichen: sourceConfig.shichen || '',
    zodiac: sourceConfig.zodiac || '',
    zodiacAnimal: sourceConfig.zodiacAnimal || '',
    gender: sourceConfig.gender || 'secret',
    mbti: sourceConfig.mbti || '',
    isused: sourceConfig.isused ?? false,
    
    // 结构化数据
    birthLocation: sourceConfig.birthLocation ? {
      province: sourceConfig.birthLocation.province || '',
      city: sourceConfig.birthLocation.city || '',
      district: sourceConfig.birthLocation.district || '',
      lng: sourceConfig.birthLocation.lng ?? 116.48,
      lat: sourceConfig.birthLocation.lat ?? 39.95
    } : null,
    
    // 复杂对象
    nameScore: sourceConfig.nameScore ? {
      tian: sourceConfig.nameScore.tian || 0,
      ren: sourceConfig.nameScore.ren || 0,
      di: sourceConfig.nameScore.di || 0,
      wai: sourceConfig.nameScore.wai || 0,
      zong: sourceConfig.nameScore.zong || 0,
      mainType: sourceConfig.nameScore.mainType || '',
      totalScore: sourceConfig.nameScore.totalScore || 0
    } : null,
    
    bazi: sourceConfig.bazi ? {
      year: sourceConfig.bazi.year || '',
      month: sourceConfig.bazi.month || '',
      day: sourceConfig.bazi.day || '',
      hour: sourceConfig.bazi.hour || ''
    } : null,
    
    lunarInfo: sourceConfig.lunarInfo ? {
      lunarBirthDate: sourceConfig.lunarInfo.lunarBirthDate || '',
      lunarBirthMonth: sourceConfig.lunarInfo.lunarBirthMonth || '',
      lunarBirthDay: sourceConfig.lunarInfo.lunarBirthDay || '',
      trueSolarTime: sourceConfig.lunarInfo.trueSolarTime || ''
    } : null,
    
    lunarBirthDate: sourceConfig.lunarBirthDate || null,
    trueSolarTime: sourceConfig.trueSolarTime || null,
    lastCalculated: sourceConfig.lastCalculated || null,
    isSystemDefault: sourceConfig.isSystemDefault ?? false
  };

  return safeConfig;
}

/**
 * 从默认配置创建新配置模板
 */
function createConfigFromDefault(overrides = {}) {
  return deepCloneConfig({
    ...LITE_DEFAULT_CONFIG,
    ...overrides
  });
}

class LiteUserConfigManager {
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
      // 从本地存储加载轻量版专用配置
      const storedConfigs = localStorage.getItem(LITE_STORAGE_KEYS.USER_CONFIGS);
      const storedIndex = localStorage.getItem(LITE_STORAGE_KEYS.ACTIVE_CONFIG_INDEX);

      console.log('轻量版：从本地存储加载配置:', {
        hasConfigs: !!storedConfigs,
        hasIndex: !!storedIndex,
        configsLength: storedConfigs ? storedConfigs.length : 0
      });

      // 解析配置数据（加载失败时创建深拷贝）
      this.configs = storedConfigs ? JSON.parse(storedConfigs) : [createConfigFromDefault()];
      this.activeConfigIndex = storedIndex ? parseInt(storedIndex, 10) : 0;

      // 确保至少有一组配置
      if (this.configs.length === 0) {
        this.configs = [createConfigFromDefault()];
        this.activeConfigIndex = 0;
      }

      // 确保每个配置都有必要的字段
      this.configs = this.configs.map(config => ({
        nickname: config.nickname || LITE_DEFAULT_CONFIG.nickname,
        realName: config.realName || '',
        birthDate: config.birthDate || LITE_DEFAULT_CONFIG.birthDate,
        birthTime: config.birthTime || LITE_DEFAULT_CONFIG.birthTime,
        shichen: config.shichen || LITE_DEFAULT_CONFIG.shichen,
        birthLocation: config.birthLocation || LITE_DEFAULT_CONFIG.birthLocation,
        zodiac: config.zodiac || LITE_DEFAULT_CONFIG.zodiac,
        zodiacAnimal: config.zodiacAnimal || LITE_DEFAULT_CONFIG.zodiacAnimal,
        gender: config.gender || LITE_DEFAULT_CONFIG.gender,
        mbti: config.mbti || LITE_DEFAULT_CONFIG.mbti,
        nameScore: config.nameScore || null,
        bazi: config.bazi || null,
        isused: config.isused || false,
        isSystemDefault: config.isSystemDefault !== undefined ? config.isSystemDefault : false,
        ...config
      }));

      // 确保 activeConfigIndex 与 isused 状态一致
      const hasUsedConfig = this.configs.some(c => c.isused === true);
      if (hasUsedConfig) {
        const usedIndex = this.configs.findIndex(c => c.isused === true);
        this.activeConfigIndex = usedIndex >= 0 ? usedIndex : 0;
      } else {
        this.configs[this.activeConfigIndex].isused = true;
      }

      // 保存配置到本地存储
      this.saveToStorage();

      this.initialized = true;
      console.log('轻量版用户配置管理器初始化成功');

      return true;
    } catch (error) {
      console.error('轻量版用户配置管理器初始化失败:', error);
      
      // 降级处理：使用默认配置
      this.configs = [createConfigFromDefault()];
      this.activeConfigIndex = 0;
      this.saveToStorage();
      this.initialized = true;
      
      return true;
    }
  }

  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem(LITE_STORAGE_KEYS.USER_CONFIGS, JSON.stringify(this.configs));
      localStorage.setItem(LITE_STORAGE_KEYS.ACTIVE_CONFIG_INDEX, this.activeConfigIndex.toString());
    } catch (error) {
      console.error('保存轻量版配置到本地存储失败:', error);
    }
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig() {
    if (!this.initialized || this.configs.length === 0) {
      return createConfigFromDefault();
    }
    
    return deepCloneConfig(this.configs[this.activeConfigIndex]);
  }

  /**
   * 更新当前配置
   */
  updateCurrentConfig(updates) {
    if (!this.initialized || this.configs.length === 0) return false;

    try {
      const currentConfig = this.configs[this.activeConfigIndex];
      
      // 深拷贝更新配置
      const updatedConfig = deepCloneConfig({
        ...currentConfig,
        ...updates
      });

      this.configs[this.activeConfigIndex] = updatedConfig;
      this.saveToStorage();

      // 通知监听器
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('更新轻量版配置失败:', error);
      return false;
    }
  }

  /**
   * 添加配置变更监听器
   */
  addListener(callback) {
    this.listeners.push(callback);
    
    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器
   */
  notifyListeners() {
    const configData = {
      currentConfig: this.getCurrentConfig(),
      allConfigs: this.configs.map(config => deepCloneConfig(config)),
      activeIndex: this.activeConfigIndex
    };

    this.listeners.forEach(callback => {
      try {
        callback(configData);
      } catch (error) {
        console.error('轻量版配置监听器执行错误:', error);
      }
    });
  }

  /**
   * 获取所有配置
   */
  getAllConfigs() {
    return this.configs.map(config => deepCloneConfig(config));
  }

  /**
   * 切换活动配置
   */
  switchActiveConfig(index) {
    if (index < 0 || index >= this.configs.length) {
      console.error('无效的配置索引:', index);
      return false;
    }

    // 更新所有配置的 isused 状态
    this.configs.forEach((config, i) => {
      config.isused = i === index;
    });

    this.activeConfigIndex = index;
    this.saveToStorage();
    this.notifyListeners();

    return true;
  }

  /**
   * 添加新配置
   */
  addNewConfig(configData = {}) {
    try {
      const newConfig = createConfigFromDefault(configData);
      newConfig.isused = false; // 新配置默认不激活
      newConfig.isSystemDefault = false;

      this.configs.push(newConfig);
      this.saveToStorage();
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('添加轻量版新配置失败:', error);
      return false;
    }
  }

  /**
   * 删除配置
   */
  deleteConfig(index) {
    if (index < 0 || index >= this.configs.length || this.configs.length <= 1) {
      console.error('无法删除配置: 索引无效或只剩一个配置');
      return false;
    }

    try {
      this.configs.splice(index, 1);

      // 如果删除的是当前活动配置，切换到第一个配置
      if (index === this.activeConfigIndex) {
        this.activeConfigIndex = 0;
        this.configs[0].isused = true;
      } else if (index < this.activeConfigIndex) {
        // 如果删除的配置在当前活动配置之前，调整活动索引
        this.activeConfigIndex--;
      }

      this.saveToStorage();
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('删除轻量版配置失败:', error);
      return false;
    }
  }

  /**
   * 清空所有配置（重置为默认）
   */
  resetToDefault() {
    this.configs = [createConfigFromDefault()];
    this.activeConfigIndex = 0;
    this.saveToStorage();
    this.notifyListeners();
  }
}

// 创建全局轻量版配置管理器实例
const liteUserConfigManager = new LiteUserConfigManager();

export { liteUserConfigManager };