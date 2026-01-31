/**
 * 用户配置管理器
 * 负责管理用户的个人信息配置，包括昵称、出生日期、星座和属相
 * 支持多组配置，默认加载第一组配置数据
 * 包含八字命格和紫薇星宫的自动计算功能
 */

// 默认配置模板（安全的、可序列化的数据结构，避免React错误#31）
const DEFAULT_CONFIG = Object.freeze({
  nickname: '叉子',
  realName: '', // 真实姓名（用于五格评分和八字测算）
  birthDate: '1991-04-21',
  birthTime: '12:30',
  shichen: '午时',
  birthLocation: Object.freeze({
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    lng: 116.48,
    lat: 39.95
  }),
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'INFP',
  nameScore: null, // 姓名评分结果（确保为null或简单对象）
  bazi: null, // 八字命格信息（确保为null或简单对象）
  lunarBirthDate: null,
  trueSolarTime: null,
  lunarInfo: null,
  lastCalculated: null,
  isused: false, // 是否为当前使用的配置
  isSystemDefault: true // 标记为系统默认配置
});

/**
 * 深拷贝配置对象，确保用户配置与默认配置完全隔离
 * 使用安全的序列化方法，避免React错误#31
 * 增强版：增加循环引用检测和边界情况处理
 * @param {Object} sourceConfig - 源配置对象
 * @returns {Object} 深拷贝的新配置对象
 */
function deepCloneConfig(sourceConfig) {
  if (!sourceConfig || typeof sourceConfig !== 'object') {
    return sourceConfig;
  }

  // 使用 WeakSet 检测循环引用
  const seen = new WeakSet();

  function safeClone(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // 检测循环引用
    if (seen.has(obj)) {
      console.warn('检测到循环引用，已跳过该对象');
      return undefined;
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
      const clonedArray = [];
      for (let i = 0; i < obj.length; i++) {
        clonedArray[i] = safeClone(obj[i]);
      }
      seen.delete(obj);
      return clonedArray;
    }

    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = safeClone(obj[key]);
      }
    }
    seen.delete(obj);
    return clonedObj;
  }

  // 先进行通用深拷贝
  let cloned = safeClone(sourceConfig);

  // 创建安全的配置对象副本，避免序列化错误，并处理所有边界情况
  const safeConfig = {
    // 基础字段（确保字符串类型）
    nickname: typeof cloned.nickname === 'string' ? cloned.nickname.trim() : '',
    realName: typeof cloned.realName === 'string' ? cloned.realName.trim() : '',
    birthDate: typeof cloned.birthDate === 'string' ? cloned.birthDate.trim() : '',
    birthTime: typeof cloned.birthTime === 'string' ? cloned.birthTime.trim() : '12:30',
    shichen: typeof cloned.shichen === 'string' ? cloned.shichen.trim() : '',
    zodiac: typeof cloned.zodiac === 'string' ? cloned.zodiac.trim() : '',
    zodiacAnimal: typeof cloned.zodiacAnimal === 'string' ? cloned.zodiacAnimal.trim() : '',
    gender: ['male', 'female', 'secret'].includes(cloned.gender) ? cloned.gender : 'secret',
    mbti: typeof cloned.mbti === 'string' ? cloned.mbti.trim() : '',
    isused: Boolean(cloned.isused),

    // 结构化数据（确保可序列化和类型安全）
    birthLocation: cloned.birthLocation && typeof cloned.birthLocation === 'object' ? {
      province: typeof cloned.birthLocation.province === 'string' ? cloned.birthLocation.province.trim() : '',
      city: typeof cloned.birthLocation.city === 'string' ? cloned.birthLocation.city.trim() : '',
      district: typeof cloned.birthLocation.district === 'string' ? cloned.birthLocation.district.trim() : '',
      lng: typeof cloned.birthLocation.lng === 'number' && !isNaN(cloned.birthLocation.lng) ? cloned.birthLocation.lng : 116.48,
      lat: typeof cloned.birthLocation.lat === 'number' && !isNaN(cloned.birthLocation.lat) ? cloned.birthLocation.lat : 39.95
    } : {
      province: '',
      city: '',
      district: '',
      lng: 116.48,
      lat: 39.95
    },

    // 复杂对象（确保为null或简单对象）
    nameScore: cloned.nameScore && typeof cloned.nameScore === 'object' ? {
      tian: typeof cloned.nameScore.tian === 'number' ? cloned.nameScore.tian : 0,
      ren: typeof cloned.nameScore.ren === 'number' ? cloned.nameScore.ren : 0,
      di: typeof cloned.nameScore.di === 'number' ? cloned.nameScore.di : 0,
      wai: typeof cloned.nameScore.wai === 'number' ? cloned.nameScore.wai : 0,
      zong: typeof cloned.nameScore.zong === 'number' ? cloned.nameScore.zong : 0,
      mainType: typeof cloned.nameScore.mainType === 'string' ? cloned.nameScore.mainType : '',
      totalScore: typeof cloned.nameScore.totalScore === 'number' ? cloned.nameScore.totalScore : 0
    } : null,

    bazi: cloned.bazi && typeof cloned.bazi === 'object' ? {
      year: typeof cloned.bazi.year === 'string' ? cloned.bazi.year : '',
      month: typeof cloned.bazi.month === 'string' ? cloned.bazi.month : '',
      day: typeof cloned.bazi.day === 'string' ? cloned.bazi.day : '',
      hour: typeof cloned.bazi.hour === 'string' ? cloned.bazi.hour : '',
      lunar: cloned.bazi.lunar && typeof cloned.bazi.lunar === 'object' ? {
        year: typeof cloned.bazi.lunar.year === 'string' ? cloned.bazi.lunar.year : '',
        month: typeof cloned.bazi.lunar.month === 'string' ? cloned.bazi.lunar.month : '',
        day: typeof cloned.bazi.lunar.day === 'string' ? cloned.bazi.lunar.day : '',
        text: typeof cloned.bazi.lunar.text === 'string' ? cloned.bazi.lunar.text : '',
        monthStr: typeof cloned.bazi.lunar.monthStr === 'string' ? cloned.bazi.lunar.monthStr : '',
        dayStr: typeof cloned.bazi.lunar.dayStr === 'string' ? cloned.bazi.lunar.dayStr : ''
      } : null,
      wuxing: cloned.bazi.wuxing && typeof cloned.bazi.wuxing === 'object' ? {
        year: typeof cloned.bazi.wuxing.year === 'string' ? cloned.bazi.wuxing.year : '',
        month: typeof cloned.bazi.wuxing.month === 'string' ? cloned.bazi.wuxing.month : '',
        day: typeof cloned.bazi.wuxing.day === 'string' ? cloned.bazi.wuxing.day : '',
        hour: typeof cloned.bazi.wuxing.hour === 'string' ? cloned.bazi.wuxing.hour : '',
        text: typeof cloned.bazi.wuxing.text === 'string' ? cloned.bazi.wuxing.text : ''
      } : null,
      nayin: cloned.bazi.nayin && typeof cloned.bazi.nayin === 'object' ? {
        year: typeof cloned.bazi.nayin.year === 'string' ? cloned.bazi.nayin.year : '',
        month: typeof cloned.bazi.nayin.month === 'string' ? cloned.bazi.nayin.month : '',
        day: typeof cloned.bazi.nayin.day === 'string' ? cloned.bazi.nayin.day : '',
        hour: typeof cloned.bazi.nayin.hour === 'string' ? cloned.bazi.nayin.hour : ''
      } : null,
      shichen: cloned.bazi.shichen && typeof cloned.bazi.shichen === 'object' ? {
        ganzhi: typeof cloned.bazi.shichen.ganzhi === 'string' ? cloned.bazi.shichen.ganzhi : '',
        name: typeof cloned.bazi.shichen.name === 'string' ? cloned.bazi.shichen.name : ''
      } : null,
      solar: cloned.bazi.solar && typeof cloned.bazi.solar === 'object' ? {
        text: typeof cloned.bazi.solar.text === 'string' ? cloned.bazi.solar.text : ''
      } : null
    } : null,

    lunarInfo: cloned.lunarInfo && typeof cloned.lunarInfo === 'object' ? {
      lunarBirthDate: typeof cloned.lunarInfo.lunarBirthDate === 'string' ? cloned.lunarInfo.lunarBirthDate : '',
      lunarBirthMonth: typeof cloned.lunarInfo.lunarBirthMonth === 'string' ? cloned.lunarInfo.lunarBirthMonth : '',
      lunarBirthDay: typeof cloned.lunarInfo.lunarBirthDay === 'string' ? cloned.lunarInfo.lunarBirthDay : '',
      trueSolarTime: typeof cloned.lunarInfo.trueSolarTime === 'string' ? cloned.lunarInfo.trueSolarTime : ''
    } : null,

    lunarBirthDate: typeof cloned.lunarBirthDate === 'string' ? cloned.lunarBirthDate : null,
    trueSolarTime: typeof cloned.trueSolarTime === 'string' ? cloned.trueSolarTime : null,
    lastCalculated: typeof cloned.lastCalculated === 'string' ? cloned.lastCalculated : null,
    isSystemDefault: Boolean(cloned.isSystemDefault),
    // 新增：模板来源追踪字段
    templateSource: typeof cloned.templateSource === 'string' ? cloned.templateSource : null,
    isFromTemplate: Boolean(cloned.isFromTemplate)
  };

  return safeConfig;
}

/**
 * 从默认配置创建新配置模板
 * @param {Object} overrides - 需要覆盖的字段
 * @returns {Object} 新配置对象（深拷贝）
 */
function createConfigFromDefault(overrides = {}) {
  return deepCloneConfig({
    ...DEFAULT_CONFIG,
    ...overrides
  });
}

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
    lng: 116.48, // 修正经度
    lat: 39.95   // 修正纬度
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
  ACTIVE_CONFIG_INDEX: 'nice_today_active_config_index',
  GLOBAL_SETTINGS: 'nice_today_global_settings'
};

const DEFAULT_SETTINGS = {
  useAIInterpretation: true, // 默认开启 AI 解读
  selectedAIModelId: 'qwen-72b',
  homeTimeAwareEnabled: true // 默认开启首页时令卡片
};

/**
 * 计算八字命格（增强版，带容错）
 * @param {Object} config 用户配置
 * @returns {Object|null} 八字信息或null（计算失败时）
 */
const calculateBaziForConfig = (config) => {
  try {
    if (!config || !config.birthDate) {
      console.warn('计算八字：缺少出生日期');
      return null;
    }

    // 动态导入计算模块（避免循环依赖）
    return Promise.resolve().then(async () => {
      const { calculateDetailedBazi } = await import('./baziHelper');
      
      const birthDate = config.birthDate;
      const birthTime = config.birthTime || '12:30';
      const longitude = config.birthLocation?.lng || 116.48;
      
      // 调用八字计算
      const baziResult = calculateDetailedBazi(birthDate, birthTime, longitude);
      
      if (!baziResult) {
        console.warn('八字计算返回null');
        return null;
      }
      
      // 确保返回的数据结构完整
      return {
        year: baziResult.bazi?.year || '',
        month: baziResult.bazi?.month || '',
        day: baziResult.bazi?.day || '',
        hour: baziResult.bazi?.hour || '',
        lunar: baziResult.bazi?.lunar || null,
        wuxing: baziResult.bazi?.wuxing || null,
        nayin: baziResult.bazi?.nayin || null,
        shichen: baziResult.bazi?.shichen || null,
        solar: baziResult.bazi?.solar || null,
        calculatedAt: new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('计算八字命格失败:', error);
    // 返回null而不是抛出异常，确保UI不会崩溃
    return null;
  }
};

/**
 * 计算紫薇星宫（增强版，带容错）
 * @param {Object} config 用户配置
 * @returns {Promise<Object|null>} 紫薇星宫数据或null（计算失败时）
 */
const calculateZiWeiForConfig = async (config) => {
  try {
    if (!config || !config.birthDate) {
      console.warn('计算紫薇星宫：缺少出生日期');
      return null;
    }

    // 动态导入计算模块（避免循环依赖）
    const { getZiWeiDisplayData } = await import('./ziweiHelper');
    
    // 调用紫薇星宫计算
    const ziweiResult = await getZiWeiDisplayData(config);
    
    if (!ziweiResult || ziweiResult.error) {
      console.warn('紫薇星宫计算失败:', ziweiResult?.error);
      return null;
    }
    
    // 确保返回的数据结构完整
    return {
      ziweiData: ziweiResult.ziweiData || null,
      baziInfo: ziweiResult.baziInfo || null,
      calculatedAt: ziweiResult.calculatedAt || new Date().toISOString(),
      hasErrors: !!ziweiResult.error || !!(ziweiResult.validationErrors?.length === 0),
      errors: ziweiResult.error || null,
      warnings: ziweiResult.validationWarnings || ziweiResult.calculationWarnings || []
    };
  } catch (error) {
    console.error('计算紫薇星宫失败:', error);
    // 返回null而不是抛出异常，确保UI不会崩溃
    return null;
  }
};

/**
 * 计算并更新配置中的八字和紫薇星宫信息
 * @param {Object} config 用户配置
 * @returns {Promise<Object>} 更新后的配置和计算结果
 */
const calculateAndUpdateFortuneData = async (config) => {
  try {
    // 并行计算八字和紫薇星宫
    const [baziResult, ziweiResult] = await Promise.allSettled([
      calculateBaziForConfig(config),
      calculateZiWeiForConfig(config)
    ]);
    
    // 处理八字计算结果
    let bazi = null;
    let baziError = null;
    if (baziResult.status === 'fulfilled' && baziResult.value) {
      bazi = baziResult.value;
    } else if (baziResult.status === 'rejected') {
      baziError = baziResult.reason?.message || '八字计算失败';
      console.error('八字计算Promise被拒绝:', baziResult.reason);
    }
    
    // 处理紫薇星宫计算结果
    let ziweiData = null;
    let ziweiError = null;
    let ziweiWarnings = [];
    if (ziweiResult.status === 'fulfilled' && ziweiResult.value) {
      ziweiData = ziweiResult.value.ziweiData;
      ziweiWarnings = ziweiResult.value.warnings || [];
      if (ziweiResult.value.hasErrors) {
        ziweiError = ziweiResult.value.errors || '紫薇星宫计算存在错误';
      }
    } else if (ziweiResult.status === 'rejected') {
      ziweiError = ziweiResult.reason?.message || '紫薇星宫计算失败';
      console.error('紫薇星宫计算Promise被拒绝:', ziweiResult.reason);
    }
    
    // 构建计算结果摘要
    const calculationSummary = {
      bazi: bazi,
      ziweiData: ziweiData,
      lastCalculated: new Date().toISOString(),
      hasData: !!(bazi || ziweiData),
      hasErrors: !!(baziError || ziweiError),
      errors: {
        bazi: baziError,
        ziwei: ziweiError
      },
      warnings: ziweiWarnings
    };
    
    console.log('命格计算完成:', calculationSummary);
    
    return calculationSummary;
  } catch (error) {
    console.error('计算命格数据失败:', error);
    // 返回安全的默认结果
    return {
      bazi: null,
      ziweiData: null,
      lastCalculated: new Date().toISOString(),
      hasData: false,
      hasErrors: true,
      errors: {
        bazi: error.message,
        ziwei: '计算过程出现异常'
      },
      warnings: []
    };
  }
};

class UserConfigManager {
  constructor() {
    this.configs = [];
    this.activeConfigIndex = 0;
    this.globalSettings = { ...DEFAULT_SETTINGS };
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
      const storedSettings = localStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS);

      console.log('从本地存储加载配置:', {
        hasConfigs: !!storedConfigs,
        hasIndex: !!storedIndex,
        hasSettings: !!storedSettings,
        configsLength: storedConfigs ? storedConfigs.length : 0
      });

      // 解析配置数据（加载失败时创建深拷贝）
      this.configs = storedConfigs ? JSON.parse(storedConfigs) : [createConfigFromDefault()];
      this.activeConfigIndex = storedIndex ? parseInt(storedIndex, 10) : 0;

      // 解析全局配置
      if (storedSettings) {
        try {
          this.globalSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        } catch (e) {
          console.error('解析全局配置失败:', e);
          this.globalSettings = { ...DEFAULT_SETTINGS };
        }
      }

      // 确保至少有一组配置（深拷贝）
      if (this.configs.length === 0) {
        this.configs = [createConfigFromDefault()];
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
      const systemDefaultIndex = this.configs.findIndex(c => c.nickname === '叉子');
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
   * 更新指定索引的配置（含校验和容错）
   * @param {Number} index 配置索引
   * @param {Object} updates 更新的字段
   * @returns {Object} {success: boolean, error: string|null}
   */
  updateConfig(index, updates) {
    // 增加边界检查，不抛出异常
    if (!this.initialized) {
      console.error('配置管理器未初始化');
      return { success: false, error: '配置管理器未初始化' };
    }
    if (index < 0 || index >= this.configs.length) {
      console.error(`无效的配置索引: ${index}`);
      return { success: false, error: `无效的配置索引: ${index}` };
    }
    if (!updates || typeof updates !== 'object') {
      console.error('更新数据无效');
      return { success: false, error: '更新数据无效' };
    }

    try {
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

      // 保存到本地存储（增加容错）
      const saveSuccess = this.saveToStorage();
      if (!saveSuccess) {
        console.error('更新配置保存失败');
        // 尝试回滚
        return { success: false, error: '更新配置保存失败' };
      }

      // 验证更新后的配置（可选，失败不阻止返回）
      try {
        const verifyConfigs = this.getAllConfigs();
        const updatedConfig = verifyConfigs[index];

        if (updatedConfig?.isused !== this.configs[index]?.isused) {
          const errorMsg = `更新配置验证失败：isused 状态不一致`;
          console.warn(errorMsg);
          // 尝试修复 isused 状态
          this.configs.forEach((c, idx) => {
            c.isused = idx === this.activeConfigIndex;
          });
          this.saveToStorage();
        }
      } catch (verifyError) {
        console.warn('验证更新配置失败，但不影响保存结果:', verifyError);
      }

      // 通知监听器（只有修改了基础配置才强制重新加载）
      this.notifyListeners(hasBasicConfigChange, hasBasicConfigChange);

      console.log(`更新配置 ${index} 成功，isused: ${this.configs[index].isused}, 基础配置变更: ${hasBasicConfigChange}`, this.configs[index]);
      return { success: true, error: null };
    } catch (error) {
      console.error('更新配置失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除指定索引的配置（含容错）
   * @param {Number} index 配置索引
   * @returns {Object} {success: boolean, error: string|null}
   */
  removeConfig(index) {
    // 增加边界检查，不抛出异常
    if (!this.initialized) {
      console.error('配置管理器未初始化');
      return { success: false, error: '配置管理器未初始化' };
    }
    if (index < 0 || index >= this.configs.length) {
      console.error(`无效的配置索引: ${index}`);
      return { success: false, error: `无效的配置索引: ${index}` };
    }
    if (this.configs.length <= 1) {
      console.error('至少需要保留一个配置');
      return { success: false, error: '至少需要保留一个配置' };
    }

    try {
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

      // 保存到本地存储（增加容错）
      const saveSuccess = this.saveToStorage();
      if (!saveSuccess) {
        console.error('删除配置保存失败');
        return { success: false, error: '删除配置保存失败' };
      }

      // 验证删除后的配置（可选，失败不阻止返回）
      try {
        const verifyConfigs = this.getAllConfigs();
        const activeConfig = verifyConfigs[this.activeConfigIndex];

        if (activeConfig?.isused !== true) {
          console.warn('删除配置验证失败：活跃配置的 isused 状态不正确');
          // 尝试修复 isused 状态
          this.configs.forEach((c, idx) => {
            c.isused = idx === this.activeConfigIndex;
          });
          this.saveToStorage();
        }
      } catch (verifyError) {
        console.warn('验证删除配置失败，但不影响删除结果:', verifyError);
      }

      // 通知监听器（删除了活跃配置才强制重新加载）
      this.notifyListeners(wasActiveConfig, wasActiveConfig);

      console.log(`删除配置 ${index} 成功，当前活跃索引 ${this.activeConfigIndex}, 是否为活跃配置: ${wasActiveConfig}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('删除配置失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置活跃配置（含容错）
   * @param {Number} index 配置索引
   * @returns {Object} {success: boolean, error: string|null}
   */
  setActiveConfig(index) {
    // 增加边界检查，不抛出异常
    if (!this.initialized) {
      console.error('配置管理器未初始化');
      return { success: false, error: '配置管理器未初始化' };
    }
    if (index < 0 || index >= this.configs.length) {
      console.error(`无效的配置索引: ${index}`);
      return { success: false, error: `无效的配置索引: ${index}` };
    }

    try {
      // 更新所有配置的 isused 状态
      this.configs.forEach((config, idx) => {
        config.isused = idx === index;
      });

      this.activeConfigIndex = index;

      // 保存到本地存储（增加容错）
      const saveSuccess = this.saveToStorage();
      if (!saveSuccess) {
        console.error('设置活跃配置保存失败');
        return { success: false, error: '设置活跃配置保存失败' };
      }

      // 验证配置的 isused 状态（可选，失败不阻止返回）
      try {
        const verifyConfigs = this.getAllConfigs();
        const activeConfig = verifyConfigs[this.activeConfigIndex];

        if (activeConfig?.isused !== true) {
          console.warn('设置活跃配置验证失败：isused 状态不正确');
          // 尝试修复 isused 状态
          this.configs.forEach((c, idx) => {
            c.isused = idx === index;
          });
          this.saveToStorage();
        }
      } catch (verifyError) {
        console.warn('验证设置活跃配置失败，但不影响设置结果:', verifyError);
      }

      // 通知监听器（不强制重新加载，只更新索引）
      this.notifyListeners(false, false); // 仅切换配置，不触发数据重新加载

      console.log(`设置活跃配置为 ${index} 成功，isused 状态已更新`);
      return { success: true, error: null };
    } catch (error) {
      console.error('设置活跃配置失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取全局设置
   * @returns {Object} 全局设置对象
   */
  getGlobalSettings() {
    return { ...this.globalSettings };
  }

  /**
   * 更新全局设置
   * @param {Object} updates 设置更新内容
   * @returns {Object} {success: boolean, error: string|null}
   */
  updateGlobalSettings(updates) {
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: '设置数据无效' };
    }

    try {
      this.globalSettings = { ...this.globalSettings, ...updates };
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(this.globalSettings));
      
      // 通知监听器
      this.notifyListeners(false, false);
      
      console.log('全局设置更新成功', this.globalSettings);
      return { success: true, error: null };
    } catch (error) {
      console.error('更新全局设置失败:', error);
      return { success: false, error: error.message };
    }
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

  /**
   * 计算当前配置的八字命格（增强版，带容错）
   * @returns {Promise<Object>} 八字计算结果
   */
  async calculateCurrentBazi() {
    try {
      const config = this.getCurrentConfig();
      return await calculateBaziForConfig(config);
    } catch (error) {
      console.error('计算当前八字失败:', error);
      return null;
    }
  }

  /**
   * 计算指定配置的八字命格
   * @param {Number} index 配置索引
   * @returns {Promise<Object|null>} 八字计算结果或null
   */
  async calculateBaziByIndex(index) {
    try {
      if (index < 0 || index >= this.configs.length) {
        console.warn(`无效的配置索引: ${index}`);
        return null;
      }
      const config = this.configs[index];
      return await calculateBaziForConfig(config);
    } catch (error) {
      console.error(`计算配置${index}的八字失败:`, error);
      return null;
    }
  }

  /**
   * 计算当前配置的紫薇星宫（增强版，带容错）
   * @returns {Promise<Object>} 紫薇星宫计算结果
   */
  async calculateCurrentZiWei() {
    try {
      const config = this.getCurrentConfig();
      return await calculateZiWeiForConfig(config);
    } catch (error) {
      console.error('计算当前紫薇星宫失败:', error);
      return null;
    }
  }

  /**
   * 计算指定配置的紫薇星宫
   * @param {Number} index 配置索引
   * @returns {Promise<Object|null>} 紫薇星宫计算结果或null
   */
  async calculateZiWeiByIndex(index) {
    try {
      if (index < 0 || index >= this.configs.length) {
        console.warn(`无效的配置索引: ${index}`);
        return null;
      }
      const config = this.configs[index];
      return await calculateZiWeiForConfig(config);
    } catch (error) {
      console.error(`计算配置${index}的紫薇星宫失败:`, error);
      return null;
    }
  }

  /**
   * 计算当前配置的所有命格数据（八字+紫薇星宫）
   * @returns {Promise<Object>} 完整的计算结果
   */
  async calculateCurrentFortune() {
    try {
      const config = this.getCurrentConfig();
      return await calculateAndUpdateFortuneData(config);
    } catch (error) {
      console.error('计算当前命格数据失败:', error);
      return {
        bazi: null,
        ziweiData: null,
        lastCalculated: new Date().toISOString(),
        hasData: false,
        hasErrors: true,
        errors: { bazi: error.message, ziwei: '计算过程出现异常' },
        warnings: []
      };
    }
  }

  /**
   * 计算指定配置的所有命格数据
   * @param {Number} index 配置索引
   * @returns {Promise<Object>} 完整的计算结果
   */
  async calculateFortuneByIndex(index) {
    try {
      if (index < 0 || index >= this.configs.length) {
        console.warn(`无效的配置索引: ${index}`);
        return {
          bazi: null,
          ziweiData: null,
          lastCalculated: new Date().toISOString(),
          hasData: false,
          hasErrors: true,
          errors: { bazi: '无效的配置索引', ziwei: '无效的配置索引' },
          warnings: []
        };
      }
      const config = this.configs[index];
      return await calculateAndUpdateFortuneData(config);
    } catch (error) {
      console.error(`计算配置${index}的命格数据失败:`, error);
      return {
        bazi: null,
        ziweiData: null,
        lastCalculated: new Date().toISOString(),
        hasData: false,
        hasErrors: true,
        errors: { bazi: error.message, ziwei: error.message },
        warnings: []
      };
    }
  }

  /**
   * 更新配置并自动重新计算八字和紫薇星宫
   * @param {Number} index 配置索引
   * @param {Object} updates 更新的字段
   * @param {Boolean} recalculate 是否重新计算命格数据
   * @returns {Promise<Object>} 更新结果和计算数据
   */
  async updateConfigWithFortune(index, updates, recalculate = true) {
    try {
      // 先更新基础配置
      const updateResult = this.updateConfig(index, updates);
      
      if (!updateResult) {
        throw new Error('更新配置失败');
      }
      
      // 如果需要重新计算命格数据
      if (recalculate) {
        const fortuneData = await this.calculateFortuneByIndex(index);
        
        // 将计算结果更新到配置中
        const fortuneUpdates = {};
        if (fortuneData.bazi) {
          fortuneUpdates.bazi = fortuneData.bazi;
        }
        if (fortuneData.ziweiData) {
          fortuneUpdates.ziweiData = fortuneData.ziweiData;
        }
        
        // 更新计算时间戳
        fortuneUpdates.lastCalculated = fortuneData.lastCalculated;
        
        // 如果有计算结果，更新到配置
        if (Object.keys(fortuneUpdates).length > 0) {
          this.updateConfig(index, fortuneUpdates);
        }
        
        return {
          success: true,
          config: this.configs[index],
          fortuneData
        };
      }
      
      return {
        success: true,
        config: this.configs[index],
        fortuneData: null
      };
    } catch (error) {
      console.error('更新配置并重新计算失败:', error);
      return {
        success: false,
        config: null,
        fortuneData: null,
        error: error.message
      };
    }
  }

  /**
   * 获取当前配置的命格数据（含冗余和容错）
   * @returns {Object} 命格数据（可能包含错误信息）
   */
  getFortuneData() {
    try {
      const config = this.getCurrentConfig();
      
      // 检查配置中是否已有命格数据
      const hasBazi = config && config.bazi && Object.keys(config.bazi).length > 0;
      const hasZiWei = config && config.ziweiData;
      
      // 检查数据是否过期（超过7天）
      const lastCalculated = config.lastCalculated;
      const isExpired = lastCalculated 
        ? (new Date().getTime() - new Date(lastCalculated).getTime()) > 7 * 24 * 60 * 60 * 1000
        : true;
      
      return {
        hasBazi,
        hasZiWei,
        hasCompleteData: hasBazi && hasZiWei,
        isExpired,
        lastCalculated: lastCalculated || null,
        bazi: hasBazi ? config.bazi : null,
        ziweiData: hasZiWei ? config.ziweiData : null,
        needsRecalculation: isExpired || !hasBazi || !hasZiWei
      };
    } catch (error) {
      console.error('获取命格数据失败:', error);
      return {
        hasBazi: false,
        hasZiWei: false,
        hasCompleteData: false,
        isExpired: true,
        lastCalculated: null,
        bazi: null,
        ziweiData: null,
        needsRecalculation: true,
        error: error.message
      };
    }
  }

  /**
   * 生成唯一的新用户昵称（格式：新用户123，数字自动递增）
   * @returns {string} 唯一的昵称
   */
  generateUniqueNickname() {
    try {
      const basePrefix = '新用户';
      let maxNumber = 0;

      // 查找现有配置中最大的数字
      this.configs.forEach(config => {
        if (config && config.nickname && typeof config.nickname === 'string' && config.nickname.startsWith(basePrefix)) {
          const numberStr = config.nickname.substring(basePrefix.length);
          const number = parseInt(numberStr, 10);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      // 生成新的昵称
      const newNumber = maxNumber + 1;
      return `${basePrefix}${newNumber}`;
    } catch (error) {
      console.error('生成唯一昵称失败:', error);
      // 降级方案：使用时间戳
      return `新用户${Date.now()}`;
    }
  }

  /**
   * 从默认配置模板复制创建新配置（增强版，带容错和错误提示）
   * @param {Object} overrides - 需要覆盖的字段
   * @returns {Promise<Object>} {success: boolean, config: Object|null, error: string|null}
   */
  async duplicateConfigFromTemplate(overrides = {}) {
    try {
      // 1. 深拷贝默认配置模板，确保不修改原始模板
      const templateConfig = deepCloneConfig(DEFAULT_CONFIG);

      // 2. 生成唯一的昵称（如果未指定）
      const finalNickname = overrides.nickname || this.generateUniqueNickname();

      // 3. 验证昵称唯一性
      const nicknameExists = this.configs.some(c => c && c.nickname === finalNickname);
      if (nicknameExists) {
        return {
          success: false,
          config: null,
          error: `昵称 '${finalNickname}' 已存在，无法创建重复配置`
        };
      }

      // 4. 创建安全、可序列化的配置对象
      const finalConfig = {
        // 基础字段
        nickname: finalNickname,
        realName: overrides.realName || templateConfig.realName || '',
        birthDate: overrides.birthDate || templateConfig.birthDate || '',
        birthTime: overrides.birthTime || templateConfig.birthTime || '12:30',
        shichen: overrides.shichen || templateConfig.shichen || '',
        zodiac: overrides.zodiac || templateConfig.zodiac || '',
        zodiacAnimal: overrides.zodiacAnimal || templateConfig.zodiacAnimal || '',
        gender: overrides.gender && ['male', 'female', 'secret'].includes(overrides.gender) 
          ? overrides.gender 
          : templateConfig.gender || 'secret',
        mbti: overrides.mbti || templateConfig.mbti || '',
        isused: false,

        // 结构化数据
        birthLocation: overrides.birthLocation ? {
          province: typeof overrides.birthLocation.province === 'string' ? overrides.birthLocation.province.trim() : '',
          city: typeof overrides.birthLocation.city === 'string' ? overrides.birthLocation.city.trim() : '',
          district: typeof overrides.birthLocation.district === 'string' ? overrides.birthLocation.district.trim() : '',
          lng: typeof overrides.birthLocation.lng === 'number' && !isNaN(overrides.birthLocation.lng) 
            ? overrides.birthLocation.lng 
            : 116.48,
          lat: typeof overrides.birthLocation.lat === 'number' && !isNaN(overrides.birthLocation.lat) 
            ? overrides.birthLocation.lat 
            : 39.95
        } : templateConfig.birthLocation ? {
          province: templateConfig.birthLocation.province || '',
          city: templateConfig.birthLocation.city || '',
          district: templateConfig.birthLocation.district || '',
          lng: templateConfig.birthLocation.lng || 116.48,
          lat: templateConfig.birthLocation.lat || 39.95
        } : null,

        // 复杂对象
        nameScore: overrides.nameScore ? {
          tian: typeof overrides.nameScore.tian === 'number' ? overrides.nameScore.tian : 0,
          ren: typeof overrides.nameScore.ren === 'number' ? overrides.nameScore.ren : 0,
          di: typeof overrides.nameScore.di === 'number' ? overrides.nameScore.di : 0,
          wai: typeof overrides.nameScore.wai === 'number' ? overrides.nameScore.wai : 0,
          zong: typeof overrides.nameScore.zong === 'number' ? overrides.nameScore.zong : 0,
          mainType: typeof overrides.nameScore.mainType === 'string' ? overrides.nameScore.mainType : '',
          totalScore: typeof overrides.nameScore.totalScore === 'number' ? overrides.nameScore.totalScore : 0
        } : null,

        // 八字信息不复制，需要重新计算
        bazi: null,
        lunarBirthDate: null,
        trueSolarTime: null,
        lunarInfo: null,
        lastCalculated: null,
        isSystemDefault: false,
        // 标记来源
        templateSource: templateConfig.nickname || '默认模板',
        isFromTemplate: true
      };

      console.log('模板配置复制成功:', {
        templateNickname: templateConfig.nickname,
        newNickname: finalConfig.nickname,
        birthDate: finalConfig.birthDate,
        overrides: Object.keys(overrides)
      });

      return {
        success: true,
        config: finalConfig,
        error: null
      };

    } catch (error) {
      console.error('从模板复制配置失败:', error);
      return {
        success: false,
        config: null,
        error: `从模板复制配置失败: ${error.message}`
      };
    }
  }

  /**
   * 从默认配置模板直接添加新配置（增强版，带容错和错误提示）
   * @param {Object} overrides - 需要覆盖的字段
   * @returns {Promise<Object>} {success: boolean, config: Object|null, error: string|null}
   */
  async addConfigFromTemplate(overrides = {}) {
    try {
      // 1. 生成新配置
      const result = await this.duplicateConfigFromTemplate(overrides);

      if (!result.success || !result.config) {
        return {
          success: false,
          config: null,
          error: result.error || '生成模板配置失败'
        };
      }

      const newConfig = result.config;

      // 2. 添加到配置列表
      this.configs.push(newConfig);

      // 3. 设置新配置为活跃配置
      this.activeConfigIndex = this.configs.length - 1;

      // 4. 保存到存储
      const saveSuccess = this.saveToStorage();
      if (!saveSuccess) {
        throw new Error('保存配置到存储失败');
      }

      // 5. 验证保存结果
      const verifyConfigs = this.getAllConfigs();
      const verifyConfig = verifyConfigs[this.activeConfigIndex];
      
      if (!verifyConfig || verifyConfig.nickname !== newConfig.nickname) {
        throw new Error('保存后验证失败：配置数据不一致');
      }

      // 6. 通知监听器（强制刷新）
      this.notifyListeners(true, true);

      console.log('从模板添加配置成功:', newConfig.nickname);

      return {
        success: true,
        config: verifyConfig,
        error: null
      };

    } catch (error) {
      console.error('从模板添加配置失败:', error);
      
      // 回滚：如果添加失败，从列表中移除
      if (this.configs.length > 0 && this.configs[this.configs.length - 1].isFromTemplate) {
        this.configs.pop();
        this.activeConfigIndex = Math.max(0, this.configs.length - 1);
      }

      return {
        success: false,
        config: null,
        error: `从模板添加配置失败: ${error.message}`
      };
    }
  }

  /**
   * 更新从模板复制的配置（增强版，带容错和错误提示）
   * @param {Number} index 配置索引
   * @param {Object} updates 更新的字段
   * @returns {Promise<Object>} {success: boolean, config: Object|null, error: string|null}
   */
  async updateConfigFromTemplate(index, updates) {
    try {
      // 1. 验证参数
      if (!this.initialized) {
        throw new Error('配置管理器未初始化');
      }

      if (index < 0 || index >= this.configs.length) {
        throw new Error(`无效的配置索引: ${index}`);
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('更新数据无效');
      }

      const config = this.configs[index];
      
      // 2. 检查是否是模板复制的配置
      if (!config.isFromTemplate) {
        return {
          success: false,
          config: null,
          error: '该配置不是从模板复制的，请使用 updateConfig 方法'
        };
      }

      // 3. 备份原始配置（用于回滚）
      const originalConfig = deepCloneConfig(config);

      // 4. 更新配置
      this.configs[index] = {
        ...this.configs[index],
        ...updates,
        lastCalculated: new Date().toISOString(), // 更新时间戳
        // 保持模板来源标记
        templateSource: config.templateSource,
        isFromTemplate: true
      };

      // 5. 保存到存储
      const saveSuccess = this.saveToStorage();
      if (!saveSuccess) {
        // 保存失败，回滚
        this.configs[index] = originalConfig;
        throw new Error('保存配置到存储失败');
      }

      // 6. 验证保存结果
      const verifyConfigs = this.getAllConfigs();
      const verifyConfig = verifyConfigs[index];

      if (!verifyConfig) {
        // 验证失败，回滚
        this.configs[index] = originalConfig;
        throw new Error('保存后验证失败：配置丢失');
      }

      // 7. 通知监听器
      const hasBasicConfigChange = ['birthDate', 'birthTime', 'birthLocation'].some(key => key in updates);
      this.notifyListeners(hasBasicConfigChange, hasBasicConfigChange);

      console.log('更新模板配置成功:', {
        index,
        nickname: verifyConfig.nickname,
        updatedFields: Object.keys(updates)
      });

      return {
        success: true,
        config: verifyConfig,
        error: null
      };

    } catch (error) {
      console.error('更新模板配置失败:', error);
      return {
        success: false,
        config: null,
        error: `更新模板配置失败: ${error.message}`
      };
    }
  }

  /**
   * 批量从模板复制配置（带并发保护和错误提示）
   * @param {number} count 要复制的数量
   * @param {Object} overrides 需要覆盖的字段
   * @returns {Promise<Object>} {success: boolean, configs: Array, errors: Array}
   */
  async batchDuplicateFromTemplate(count, overrides = {}) {
    const newConfigs = [];
    const errors = [];

    try {
      // 验证参数
      if (!this.initialized) {
        throw new Error('配置管理器未初始化');
      }

      if (typeof count !== 'number' || count <= 0) {
        throw new Error('复制数量必须大于0');
      }

      if (count > 100) {
        throw new Error('一次最多复制100个配置');
      }

      // 批量生成配置
      for (let i = 0; i < count; i++) {
        try {
          // 为每个配置生成唯一的昵称
          const configOverrides = {
            ...overrides,
            nickname: this.generateUniqueNickname()
          };

          const result = await this.duplicateConfigFromTemplate(configOverrides);

          if (result.success && result.config) {
            newConfigs.push(result.config);
          } else {
            errors.push(`第 ${i + 1} 个配置生成失败: ${result.error}`);
          }
        } catch (error) {
          errors.push(`第 ${i + 1} 个配置生成失败: ${error.message}`);
        }
      }

      if (newConfigs.length === 0) {
        return {
          success: false,
          configs: [],
          errors: errors.length > 0 ? errors : ['所有配置生成失败']
        };
      }

      // 备份当前配置列表（用于回滚）
      const originalConfigs = this.configs.slice();
      const originalActiveIndex = this.activeConfigIndex;

      try {
        // 批量添加到配置列表
        this.configs.push(...newConfigs);

        // 设置最后一个新配置为活跃配置
        this.activeConfigIndex = this.configs.length - 1;

        // 保存到存储
        const saveSuccess = this.saveToStorage();
        if (!saveSuccess) {
          throw new Error('保存配置到存储失败');
        }

        // 验证保存结果
        const verifyConfigs = this.getAllConfigs();
        if (verifyConfigs.length !== this.configs.length) {
          throw new Error('保存后验证失败：配置数量不一致');
        }

        // 通知监听器
        this.notifyListeners(true, true);

        console.log(`批量从模板复制配置成功: ${newConfigs.length} 个配置`);

        return {
          success: true,
          configs: newConfigs,
          errors: errors.length > 0 ? errors : null
        };

      } catch (error) {
        // 保存失败，回滚
        this.configs = originalConfigs;
        this.activeConfigIndex = originalActiveIndex;
        throw error;
      }

    } catch (error) {
      console.error('批量从模板复制配置失败:', error);
      return {
        success: false,
        configs: newConfigs,
        errors: [...errors, `批量复制失败: ${error.message}`]
      };
    }
  }

  /**
   * 获取默认配置模板（只读，深拷贝）
   * @returns {Object} 默认配置的深拷贝
   */
  getDefaultTemplate() {
    try {
      return deepCloneConfig(DEFAULT_CONFIG);
    } catch (error) {
      console.error('获取默认配置模板失败:', error);
      // 降级方案：返回简化的默认配置
      return {
        nickname: '默认模板',
        birthDate: '1991-04-30',
        birthTime: '12:30',
        gender: 'male',
        zodiac: '金牛座',
        zodiacAnimal: '羊',
        mbti: 'INFP',
        isSystemDefault: true
      };
    }
  }
}

// 创建单例实例
export const userConfigManager = new UserConfigManager();

export default UserConfigManager;
