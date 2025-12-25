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
    lng: 110.48,
    lat: 30.95
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
   * @param {Boolean} allowNull 是否允许返回null（不使用默认值覆盖）
   */
  getCurrentConfig(allowNull = false) {
    if (!this.initialized || this.configs.length === 0) {
      return allowNull ? null : DEFAULT_CONFIG;
    }

    const currentConfig = this.configs[this.activeConfigIndex];

    // 如果允许null且配置为空，直接返回null，不使用默认值覆盖
    if (!allowNull && (!currentConfig || !currentConfig.nickname)) {
      return { ...EMPTY_CONFIG_DEFAULTS, ...currentConfig };
    }

    // 如果配置不完整，只补充必要的默认字段，不覆盖已有字段
    if (currentConfig) {
      const normalizedConfig = { ...currentConfig };
      
      // 只补充缺失的字段，不覆盖已有字段
      if (!normalizedConfig.nickname) normalizedConfig.nickname = EMPTY_CONFIG_DEFAULTS.nickname;
      if (!normalizedConfig.birthDate) normalizedConfig.birthDate = EMPTY_CONFIG_DEFAULTS.birthDate;
      if (!normalizedConfig.birthTime) normalizedConfig.birthTime = EMPTY_CONFIG_DEFAULTS.birthTime;
      if (!normalizedConfig.shichen) normalizedConfig.shichen = EMPTY_CONFIG_DEFAULTS.shichen;
      if (!normalizedConfig.birthLocation) normalizedConfig.birthLocation = { ...EMPTY_CONFIG_DEFAULTS.birthLocation };
      if (!normalizedConfig.zodiac) normalizedConfig.zodiac = EMPTY_CONFIG_DEFAULTS.zodiac;
      if (!normalizedConfig.zodiacAnimal) normalizedConfig.zodiacAnimal = EMPTY_CONFIG_DEFAULTS.zodiacAnimal;
      if (!normalizedConfig.gender) normalizedConfig.gender = EMPTY_CONFIG_DEFAULTS.gender;
      if (!normalizedConfig.mbti) normalizedConfig.mbti = EMPTY_CONFIG_DEFAULTS.mbti;
      if (normalizedConfig.isused === undefined) normalizedConfig.isused = false;
      if (normalizedConfig.isSystemDefault === undefined) normalizedConfig.isSystemDefault = false;
      
      return normalizedConfig;
    }

    return allowNull ? null : { ...EMPTY_CONFIG_DEFAULTS };
  }

  /**
   * 获取所有配置
   * @returns {Array} 所有配置数组
   */
  getAllConfigs() {
    if (!this.initialized) {
      return [DEFAULT_CONFIG];
    }

    // 从存储中重新读取配置，确保获取最新数据
    try {
      const storedConfigs = localStorage.getItem(STORAGE_KEYS.USER_CONFIGS);
      if (storedConfigs) {
        const parsedConfigs = JSON.parse(storedConfigs);
        // 更新内存中的配置以匹配存储
        this.configs = parsedConfigs;
      }
    } catch (error) {
      console.error('从存储读取所有配置失败，使用内存缓存:', error);
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
   * @throws {Error} 配置对象无效或保存失败时抛出异常
   */
  addConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('配置对象无效');
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
        district: '海淀区',
        lng: 116.48,
        lat: 38.95
      },
      zodiac: config.zodiac || '未知',
      zodiacAnimal: config.zodiacAnimal || '未知',
      gender: config.gender || 'male',
      mbti: config.mbti || 'ISFP',
      nameScore: config.nameScore || null,
      isused: true, // 新配置立即设为活跃配置
      isSystemDefault: false, // 新配置不是系统默认配置
      ...config
    };

    // 新增配置时，先将所有现有配置的 isused 设为 false
    this.configs.forEach((c) => {
      c.isused = false;
    });

    this.configs.push(newConfig);
    this.activeConfigIndex = this.configs.length - 1;

    // 如果存在系统默认配置，将其 isSystemDefault 标记为 false
    const systemDefaultIndex = this.configs.findIndex(c => c.isSystemDefault === true);
    if (systemDefaultIndex !== -1) {
      this.configs[systemDefaultIndex].isSystemDefault = false;
      console.log('已禁用系统默认配置', systemDefaultIndex);
    }

    // 保存到本地存储
    const saveSuccess = this.saveToStorage();
    if (!saveSuccess) {
      throw new Error('保存新配置失败');
    }

    // 确认配置100%保存成功后再全局更新引用值
    const verifyConfigs = this.getAllConfigs();
    const verifyActiveIndex = this.getActiveConfigIndex();
    const verifyConfig = verifyConfigs[verifyActiveIndex];

    // 验证新配置的 isused 是否为 true
    if (!verifyConfig || verifyConfig.isused !== true) {
      const errorMsg = `新配置 isused 验证失败，verifyConfig: ${JSON.stringify(verifyConfig)}`;
      console.error(errorMsg, verifyConfig);
      // 尝试修复 isused 状态
      this.configs.forEach((c, idx) => {
        c.isused = idx === this.activeConfigIndex;
      });
      const repairSuccess = this.saveToStorage();
      if (!repairSuccess) {
        throw new Error(`${errorMsg}，修复也失败`);
      }
    }

    // 通知监听器（添加新配置需要强制重新加载）
    this.notifyListeners(true, true); // 强制重新加载并标记为配置更新

    console.log('添加新配置成功并设为活跃配置', {
      index: this.activeConfigIndex,
      config: newConfig,
      isused: newConfig.isused
    });
    return true;
  }

  /**
   * 更新指定索引的配置
   * @param {Number} index 配置索引
   * @param {Object} updates 更新的字段
   * @returns {Boolean} 是否更新成功
   * @throws {Error} 参数无效或保存失败时抛出异常
   */
  updateConfig(index, updates) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    if (index < 0 || index >= this.configs.length) {
      throw new Error(`无效的配置索引: ${index}`);
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('更新数据无效');
    }

    // 检测是否修改了基础配置（出生日期、时间、位置）
    const basicFields = ['birthDate', 'birthTime', 'birthLocation'];
    const hasBasicConfigChange = Object.keys(updates).some(key => basicFields.includes(key));

    // 保留原配置的 isused 状态（除非明确指定）
    const keepIsused = this.configs[index].isused && updates.isused === undefined;
    const configUpdates = keepIsused ? updates : { ...updates };

    // 更新配置
    this.configs[index] = { ...this.configs[index], ...configUpdates };

    // 确保只有一个配置的 isused 为 true
    if (this.configs[index].isused === true) {
      this.configs.forEach((config, idx) => {
        config.isused = idx === index;
      });
    }

    // 保存到本地存储
    const saveSuccess = this.saveToStorage();
    if (!saveSuccess) {
      throw new Error('更新配置保存失败');
    }

    // 验证更新后的配置
    const verifyConfigs = this.getAllConfigs();
    const updatedConfig = verifyConfigs[index];

    if (updatedConfig?.isused !== this.configs[index]?.isused) {
      const errorMsg = `更新配置验证失败：isused 状态不一致，expected: ${this.configs[index]?.isused}, actual: ${updatedConfig?.isused}`;
      console.error(errorMsg);
      // 尝试修复 isused 状态
      this.configs.forEach((c, idx) => {
        c.isused = idx === this.activeConfigIndex;
      });
      const repairSuccess = this.saveToStorage();
      if (!repairSuccess) {
        throw new Error(`${errorMsg}，修复也失败`);
      }
    }

    // 通知监听器（只有修改了基础配置才强制重新加载）
    this.notifyListeners(hasBasicConfigChange, hasBasicConfigChange);

    console.log(`更新配置 ${index} 成功，isused: ${this.configs[index].isused}, 基础配置变更: ${hasBasicConfigChange}`, this.configs[index]);
    return true;
  }

  /**
   * 删除指定索引的配置
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否删除成功
   * @throws {Error} 索引无效或保存失败时抛出异常
   */
  removeConfig(index) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    if (index < 0 || index >= this.configs.length) {
      throw new Error(`无效的配置索引: ${index}`);
    }
    if (this.configs.length <= 1) {
      throw new Error('至少需要保留一个配置');
    }

    // 检查是否删除了当前活跃配置
    const wasActiveConfig = index === this.activeConfigIndex;

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
      this.configs.forEach((config, i) => {
        config.isused = i === this.activeConfigIndex;
      });
    }

    // 保存到本地存储
    const saveSuccess = this.saveToStorage();
    if (!saveSuccess) {
      throw new Error('删除配置保存失败');
    }

    // 验证删除后的配置
    const verifyConfigs = this.getAllConfigs();
    const activeConfig = verifyConfigs[this.activeConfigIndex];

    if (activeConfig?.isused !== true) {
      const errorMsg = `删除配置验证失败：活跃配置的 isused 状态不正确，index: ${this.activeConfigIndex}, isused: ${activeConfig?.isused}`;
      console.error(errorMsg);
      // 尝试修复 isused 状态
      this.configs.forEach((c, idx) => {
        c.isused = idx === this.activeConfigIndex;
      });
      const repairSuccess = this.saveToStorage();
      if (!repairSuccess) {
        throw new Error(`${errorMsg}，修复也失败`);
      }
    }

    // 通知监听器（删除了活跃配置才强制重新加载）
    this.notifyListeners(wasActiveConfig, wasActiveConfig);

    console.log(`删除配置 ${index} 成功，当前活跃索引 ${this.activeConfigIndex}, 是否为活跃配置: ${wasActiveConfig}`);
    return true;
  }

  /**
   * 设置活跃配置
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否设置成功
   * @throws {Error} 索引无效或保存失败时抛出异常
   */
  setActiveConfig(index) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    if (index < 0 || index >= this.configs.length) {
      throw new Error(`无效的配置索引: ${index}`);
    }

    // 更新所有配置的 isused 状态
    this.configs.forEach((config, idx) => {
      config.isused = idx === index;
    });

    this.activeConfigIndex = index;

    // 保存到本地存储
    const saveSuccess = this.saveToStorage();
    if (!saveSuccess) {
      throw new Error('设置活跃配置保存失败');
    }

    // 验证配置的 isused 状态
    const verifyConfigs = this.getAllConfigs();
    const activeConfig = verifyConfigs[this.activeConfigIndex];

    if (activeConfig?.isused !== true) {
      const errorMsg = `设置活跃配置验证失败：isused 状态不正确，index: ${this.activeConfigIndex}, isused: ${activeConfig?.isused}`;
      console.error(errorMsg);
      // 尝试修复 isused 状态
      this.configs.forEach((c, idx) => {
        c.isused = idx === index;
      });
      const repairSuccess = this.saveToStorage();
      if (!repairSuccess) {
        throw new Error(`${errorMsg}，修复也失败`);
      }
    }

    // 通知监听器（不强制重新加载，只更新索引）
    this.notifyListeners(false, false); // 仅切换配置，不触发数据重新加载

    console.log(`设置活跃配置为 ${index} 成功，isused 状态已更新`);
    return true;
  }

  /**
   * 切换到指定配置（与 setActiveConfig 相同，用于兼容性）
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否切换成功
   */
  switchToConfig(index) {
    return this.setActiveConfig(index);
  }

  /**
   * 删除配置（与 removeConfig 相同，用于兼容性）
   * @param {Number} index 配置索引
   * @returns {Boolean} 是否删除成功
   */
  deleteConfig(index) {
    return this.removeConfig(index);
  }

  /**
   * 清除缓存，防止数据回滚
   */
  clearCache() {
    try {
      // 保存必要的数据键
      const requiredKeys = [STORAGE_KEYS.USER_CONFIGS, STORAGE_KEYS.ACTIVE_CONFIG_INDEX];

      // 获取所有 localStorage 键
      const allKeys = Object.keys(localStorage);

      // 查找可能的缓存键并清除
      allKeys.forEach(key => {
        // 清除过期的缓存键（包含 old、temp、cache 等关键词）
        if (key.includes('nice_today') &&
            !requiredKeys.includes(key) &&
            (key.includes('old') || key.includes('temp') || key.includes('cache') || key.includes('backup'))) {
          localStorage.removeItem(key);
          console.log('已清除缓存:', key);
        }
      });

      // 注意：不要在这里设置 initialized = false
      // 因为 clearCache 可能在 saveToStorage 中被调用，设置会导致状态不一致
      // initialized 只应该在 initialize 方法结束时才设为 true
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  /**
   * 检查 localStorage 是否可用
   */
  checkStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage 不可用:', error);
      return false;
    }
  }

  /**
   * 保存配置到本地存储（增强版）
   * @returns {Boolean} 是否保存成功
   * @throws {Error} 保存失败时抛出异常
   */
  saveToStorage() {
    // 检查 localStorage 是否可用
    if (!this.checkStorageAvailable()) {
      throw new Error('localStorage 不可用，无法保存配置');
    }

    try {

      // 在保存前清除缓存（注意：不再设置 initialized = false）
      const configsJson = JSON.stringify(this.configs);
      localStorage.setItem(STORAGE_KEYS.USER_CONFIGS, configsJson);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX, this.activeConfigIndex.toString());

      // 立即验证保存是否成功
      const verifyConfigs = localStorage.getItem(STORAGE_KEYS.USER_CONFIGS);
      const verifyIndex = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG_INDEX);

      if (verifyConfigs !== configsJson) {
        throw new Error(`保存配置验证失败：存储的数据与预期不符，expectedLength: ${configsJson.length}, actualLength: ${verifyConfigs?.length || 0}`);
      }

      // 二次验证：解析保存的数据并对比
      const parsedConfigs = JSON.parse(verifyConfigs);
      const parsedIndex = parseInt(verifyIndex, 10);

      if (parsedConfigs.length !== this.configs.length) {
        throw new Error(`保存配置验证失败：配置数量不一致，expected: ${this.configs.length}, actual: ${parsedConfigs.length}`);
      }

      if (parsedIndex !== this.activeConfigIndex) {
        throw new Error(`保存配置验证失败：活跃索引不一致，expected: ${this.activeConfigIndex}, actual: ${parsedIndex}`);
      }

      // 验证活跃配置的 isused 状态
      const activeConfig = parsedConfigs[parsedIndex];
      if (activeConfig && activeConfig.isused !== true) {
        throw new Error(`保存配置验证失败：活跃配置的 isused 状态不正确，index: ${parsedIndex}, isused: ${activeConfig.isused}, nickname: ${activeConfig.nickname}`);
      }

      console.log('配置已成功保存到本地存储', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex,
        activeConfigIsUsed: this.configs[this.activeConfigIndex]?.isused
      });
      return true;
    } catch (error) {
      // 重新抛出异常，让调用者捕获处理
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        throw new Error(`localStorage 存储配额已满: ${error.message}`);
      }
      // 如果是已经抛出的错误，直接重新抛出
      if (error.message && error.message.includes('保存配置验证失败')) {
        throw error;
      }
      throw new Error(`保存配置到本地存储失败: ${error.message}`);
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
   * @param {Boolean} forceReload 是否强制重新加载
   * @param {Boolean} isConfigUpdate 是否是配置更新（区别于仅切换活跃配置）
   */
  notifyListeners(forceReload = false, isConfigUpdate = false) {
    const currentConfig = this.getCurrentConfig();
    this.listeners.forEach(listener => {
      try {
        listener({
          configs: [...this.configs],
          activeConfigIndex: this.activeConfigIndex,
          currentConfig,
          forceReload, // 强制重新加载标志
          isConfigUpdate // 是否是配置内容更新
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