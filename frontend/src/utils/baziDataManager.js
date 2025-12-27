/**
 * 八字数据存储管理器 - 双格式存储方案
 * 同时保存数字格式和汉字格式，确保数据一致性和类型安全
 * 
 * 设计原则：
 * 1. 计算逻辑使用数字格式（year/month/day/hour）
 * 2. 显示输出使用汉字格式（yearCn/monthCn/dayCn/hourCn）
 * 3. 数据保存时即完成两种格式的转换和存储
 * 4. 提供严格的数据校验和异常处理机制
 * 5. 提供数据迁移和兼容性处理功能
 */

import { createStandardBaziData, validateBaziData, convertLegacyBaziToStandard } from './baziSchema';

/**
 * 八字数据版本号（用于数据迁移和兼容性）
 */
export const BAZI_DATA_VERSION = '2.0.0';

/**
 * 八字数据状态枚举
 */
export const BaziStatus = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  MISSING: 'missing'
};

/**
 * 双格式八字数据结构
 * @typedef {Object} DualFormatBaziData
 * @property {Object} meta - 元数据
 * @property {string} meta.version - 数据版本号
 * @property {string} meta.calculatedAt - 计算时间
 * @property {string} meta.dataSource - 数据来源
 * @property {string} meta.nickname - 用户昵称
 * 
 * @property {Object} numeric - 数字格式（用于计算逻辑）
 * @property {number} numeric.year - 年柱数字（0-59，对应60甲子）
 * @property {number} numeric.month - 月柱数字（0-59）
 * @property {number} numeric.day - 日柱数字（0-59）
 * @property {number} numeric.hour - 时柱数字（0-59）
 * @property {number} numeric.shichen - 时辰数字（0-11）
 * 
 * @property {Object} chinese - 汉字格式（用于显示输出）
 * @property {string} chinese.yearCn - 年柱汉字（如：辛未）
 * @property {string} chinese.monthCn - 月柱汉字（如：壬辰）
 * @property {string} chinese.dayCn - 日柱汉字（如：乙巳）
 * @property {string} chinese.hourCn - 时柱汉字（如：壬申）
 * @property {string} chinese.shichenCn - 时辰汉字（如：申时）
 * 
 * @property {Object} validation - 数据校验信息
 * @property {boolean} validation.isValid - 数据是否有效
 * @property {Array} validation.errors - 错误信息
 * @property {Array} validation.warnings - 警告信息
 * @property {string} validation.checksum - 数据校验和
 * 
 * @property {Object} compatibility - 兼容旧版格式
 * @property {Object} compatibility.legacy - 旧版格式数据
 */

/**
 * 60甲子表（用于数字与汉字的双向映射）
 */
export const JIAZI_TABLE = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
];

/**
 * 时辰表（数字与汉字映射）
 */
export const SHICHEN_TABLE = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'
];

/**
 * 五行对应表（用于数据校验）
 */
export const WUXING_MAP = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '寅': '木', '卯': '木', '巳': '火', '午': '火', '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金', '亥': '水', '子': '水'
};

/**
 * 创建双格式八字数据
 * @param {Object} params - 参数
 * @param {string} params.birthDate - 出生日期（YYYY-MM-DD）
 * @param {string} params.birthTime - 出生时间（HH:mm）
 * @param {Object} params.birthLocation - 出生地点
 * @param {string} [params.nickname] - 用户昵称
 * @returns {DualFormatBaziData} 双格式八字数据
 */
export const createDualFormatBaziData = (params) => {
  try {
    // 1. 使用标准Schema创建基础数据
    const standardData = createStandardBaziData(params);
    
    // 2. 提取八字四柱汉字
    const yearCn = standardData.bazi?.year?.ganZhi || '未知';
    const monthCn = standardData.bazi?.month?.ganZhi || '未知';
    const dayCn = standardData.bazi?.day?.ganZhi || '未知';
    const hourCn = standardData.bazi?.hour?.ganZhi || '未知';
    const shichenCn = standardData.birth?.time?.shichen || '未知';

    // 3. 转换为数字格式
    const yearNumeric = JIAZI_TABLE.indexOf(yearCn);
    const monthNumeric = JIAZI_TABLE.indexOf(monthCn);
    const dayNumeric = JIAZI_TABLE.indexOf(dayCn);
    const hourNumeric = JIAZI_TABLE.indexOf(hourCn);
    const shichenNumeric = SHICHEN_TABLE.findIndex(s => s === shichenCn);

    // 4. 数据校验
    const validation = validateDualFormatData({
      yearCn, monthCn, dayCn, hourCn, shichenCn,
      yearNumeric, monthNumeric, dayNumeric, hourNumeric, shichenNumeric
    });

    // 5. 构建双格式数据
    const dualFormatData = {
      meta: {
        version: BAZI_DATA_VERSION,
        calculatedAt: new Date().toISOString(),
        dataSource: 'calculate',
        nickname: params.nickname || null
      },
      
      numeric: {
        year: yearNumeric >= 0 ? yearNumeric : 0,
        month: monthNumeric >= 0 ? monthNumeric : 0,
        day: dayNumeric >= 0 ? dayNumeric : 0,
        hour: hourNumeric >= 0 ? hourNumeric : 0,
        shichen: shichenNumeric >= 0 ? shichenNumeric : 0
      },
      
      chinese: {
        yearCn,
        monthCn,
        dayCn,
        hourCn,
        shichenCn
      },
      
      validation,
      
      compatibility: {
        legacy: standardData
      }
    };

    return dualFormatData;
  } catch (error) {
    console.error('创建双格式八字数据失败:', error);
    
    // 返回错误数据，但保持结构完整
    return createErrorBaziData({
      error: error.message,
      birthDate: params.birthDate,
      birthTime: params.birthTime
    });
  }
};

/**
 * 验证双格式八字数据
 * @param {Object} data - 待验证数据
 * @returns {Object} 验证结果
 */
const validateDualFormatData = (data) => {
  const errors = [];
  const warnings = [];
  
  const { yearCn, monthCn, dayCn, hourCn, shichenCn } = data;
  const { yearNumeric, monthNumeric, dayNumeric, hourNumeric, shichenNumeric } = data;

  // 1. 检查数字与汉字的对应关系
  if (JIAZI_TABLE[yearNumeric] !== yearCn) {
    errors.push(`年柱数字与汉字不匹配: ${yearNumeric} -> ${yearCn}`);
  }
  if (JIAZI_TABLE[monthNumeric] !== monthCn) {
    errors.push(`月柱数字与汉字不匹配: ${monthNumeric} -> ${monthCn}`);
  }
  if (JIAZI_TABLE[dayNumeric] !== dayCn) {
    errors.push(`日柱数字与汉字不匹配: ${dayNumeric} -> ${dayCn}`);
  }
  if (JIAZI_TABLE[hourNumeric] !== hourCn) {
    errors.push(`时柱数字与汉字不匹配: ${hourNumeric} -> ${hourCn}`);
  }
  if (SHICHEN_TABLE[shichenNumeric] !== shichenCn) {
    warnings.push(`时辰数字与汉字不匹配: ${shichenNumeric} -> ${shichenCn}`);
  }

  // 2. 检查数据范围
  if (yearNumeric < 0 || yearNumeric >= 60) {
    errors.push(`年柱数字超出范围: ${yearNumeric}`);
  }
  if (monthNumeric < 0 || monthNumeric >= 60) {
    errors.push(`月柱数字超出范围: ${monthNumeric}`);
  }
  if (dayNumeric < 0 || dayNumeric >= 60) {
    errors.push(`日柱数字超出范围: ${dayNumeric}`);
  }
  if (hourNumeric < 0 || hourNumeric >= 60) {
    errors.push(`时柱数字超出范围: ${hourNumeric}`);
  }
  if (shichenNumeric < 0 || shichenNumeric >= 12) {
    warnings.push(`时辰数字超出范围: ${shichenNumeric}`);
  }

  // 3. 检查五行逻辑（简化版）
  const checkWuxingLogic = (ganzhi, pillarName) => {
    if (!ganzhi || ganzhi === '未知') return;
    
    const gan = ganzhi.charAt(0);
    const zhi = ganzhi.charAt(1);
    
    if (!WUXING_MAP[gan] || !WUXING_MAP[zhi]) {
      warnings.push(`${pillarName}干支五行映射异常: ${ganzhi}`);
    }
  };

  checkWuxingLogic(yearCn, '年柱');
  checkWuxingLogic(monthCn, '月柱');
  checkWuxingLogic(dayCn, '日柱');
  checkWuxingLogic(hourCn, '时柱');

  // 4. 计算校验和
  const checksum = calculateChecksum(data);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    checksum
  };
};

/**
 * 计算数据校验和
 * @param {Object} data - 数据对象
 * @returns {string} 校验和
 */
const calculateChecksum = (data) => {
  try {
    const { yearCn, monthCn, dayCn, hourCn } = data;
    const str = `${yearCn}${monthCn}${dayCn}${hourCn}`;
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    return 'error';
  }
};

/**
 * 创建错误八字数据
 * @param {Object} params - 参数
 * @returns {DualFormatBaziData} 错误数据
 */
const createErrorBaziData = (params) => {
  return {
    meta: {
      version: BAZI_DATA_VERSION,
      calculatedAt: new Date().toISOString(),
      dataSource: 'error',
      error: params.error
    },
    
    numeric: {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      shichen: 0
    },
    
    chinese: {
      yearCn: '未知',
      monthCn: '未知',
      dayCn: '未知',
      hourCn: '未知',
      shichenCn: '未知'
    },
    
    validation: {
      isValid: false,
      errors: [params.error],
      warnings: [],
      checksum: 'error'
    },
    
    compatibility: {
      legacy: {
        birthDate: params.birthDate,
        birthTime: params.birthTime,
        error: params.error
      }
    }
  };
};

/**
 * 从旧版八字数据转换为双格式
 * @param {Object} legacyData - 旧版八字数据
 * @returns {DualFormatBaziData} 双格式八字数据
 */
export const convertLegacyToDualFormat = (legacyData) => {
  try {
    // 1. 先转换为标准格式
    const standardData = convertLegacyBaziToStandard(legacyData);
    
    // 2. 提取汉字格式
    const yearCn = standardData.bazi?.year?.ganZhi || legacyData.bazi?.year || '未知';
    const monthCn = standardData.bazi?.month?.ganZhi || legacyData.bazi?.month || '未知';
    const dayCn = standardData.bazi?.day?.ganZhi || legacyData.bazi?.day || '未知';
    const hourCn = standardData.bazi?.hour?.ganZhi || legacyData.bazi?.hour || '未知';
    const shichenCn = standardData.birth?.time?.shichen || '未知';

    // 3. 转换为数字格式
    const yearNumeric = JIAZI_TABLE.indexOf(yearCn);
    const monthNumeric = JIAZI_TABLE.indexOf(monthCn);
    const dayNumeric = JIAZI_TABLE.indexOf(dayCn);
    const hourNumeric = JIAZI_TABLE.indexOf(hourCn);
    const shichenNumeric = SHICHEN_TABLE.findIndex(s => s === shichenCn);

    // 4. 数据校验
    const validation = validateDualFormatData({
      yearCn, monthCn, dayCn, hourCn, shichenCn,
      yearNumeric, monthNumeric, dayNumeric, hourNumeric, shichenNumeric
    });

    // 5. 构建双格式数据
    return {
      meta: {
        version: BAZI_DATA_VERSION,
        calculatedAt: new Date().toISOString(),
        dataSource: 'converted',
        nickname: legacyData.nickname || null
      },
      
      numeric: {
        year: yearNumeric >= 0 ? yearNumeric : 0,
        month: monthNumeric >= 0 ? monthNumeric : 0,
        day: dayNumeric >= 0 ? dayNumeric : 0,
        hour: hourNumeric >= 0 ? hourNumeric : 0,
        shichen: shichenNumeric >= 0 ? shichenNumeric : 0
      },
      
      chinese: {
        yearCn,
        monthCn,
        dayCn,
        hourCn,
        shichenCn
      },
      
      validation,
      
      compatibility: {
        legacy: standardData
      }
    };
  } catch (error) {
    console.error('转换旧版八字数据失败:', error);
    return createErrorBaziData({
      error: `转换失败: ${error.message}`,
      birthDate: legacyData.birthDate,
      birthTime: legacyData.birthTime
    });
  }
};

/**
 * 从双格式数据获取显示用的八字信息
 * @param {DualFormatBaziData} dualFormatData - 双格式八字数据
 * @returns {Object} 显示用的八字信息
 */
export const getDisplayInfo = (dualFormatData) => {
  if (!dualFormatData || !dualFormatData.chinese) {
    return {
      bazi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
      shichen: { ganzhi: '丁卯' },
      lunar: { text: '请设置出生信息' },
      isValid: false
    };
  }

  const { chinese, validation } = dualFormatData;
  
  return {
    bazi: {
      year: chinese.yearCn,
      month: chinese.monthCn,
      day: chinese.dayCn,
      hour: chinese.hourCn
    },
    shichen: {
      ganzhi: chinese.hourCn,
      time: chinese.shichenCn
    },
    lunar: {
      text: dualFormatData.compatibility?.legacy?.lunarBirthDate || '未知'
    },
    isValid: validation?.isValid || false,
    validation: validation
  };
};

/**
 * 从双格式数据获取计算用的八字信息
 * @param {DualFormatBaziData} dualFormatData - 双格式八字数据
 * @returns {Object} 计算用的八字信息
 */
export const getCalculationInfo = (dualFormatData) => {
  if (!dualFormatData || !dualFormatData.numeric) {
    return {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      shichen: 0,
      isValid: false
    };
  }

  const { numeric, validation } = dualFormatData;
  
  return {
    year: numeric.year,
    month: numeric.month,
    day: numeric.day,
    hour: numeric.hour,
    shichen: numeric.shichen,
    isValid: validation?.isValid || false,
    validation: validation
  };
};

/**
 * 修复八字数据（自动修复常见问题）
 * @param {DualFormatBaziData} dualFormatData - 待修复的数据
 * @returns {DualFormatBaziData} 修复后的数据
 */
export const repairBaziData = (dualFormatData) => {
  if (!dualFormatData) {
    return createErrorBaziData({ error: '数据为空' });
  }

  try {
    const { chinese, numeric, validation } = dualFormatData;
    
    // 如果数据有效，直接返回
    if (validation?.isValid) {
      return dualFormatData;
    }

    // 修复数字与汉字不匹配的问题
    const repairedChinese = { ...chinese };
    const repairedNumeric = { ...numeric };

    // 修复年柱
    if (JIAZI_TABLE[repairedNumeric.year] !== repairedChinese.yearCn) {
      if (repairedNumeric.year >= 0 && repairedNumeric.year < 60) {
        repairedChinese.yearCn = JIAZI_TABLE[repairedNumeric.year];
      } else if (repairedChinese.yearCn && JIAZI_TABLE.includes(repairedChinese.yearCn)) {
        repairedNumeric.year = JIAZI_TABLE.indexOf(repairedChinese.yearCn);
      } else {
        // 使用默认值
        repairedNumeric.year = 0;
        repairedChinese.yearCn = JIAZI_TABLE[0];
      }
    }

    // 修复月柱
    if (JIAZI_TABLE[repairedNumeric.month] !== repairedChinese.monthCn) {
      if (repairedNumeric.month >= 0 && repairedNumeric.month < 60) {
        repairedChinese.monthCn = JIAZI_TABLE[repairedNumeric.month];
      } else if (repairedChinese.monthCn && JIAZI_TABLE.includes(repairedChinese.monthCn)) {
        repairedNumeric.month = JIAZI_TABLE.indexOf(repairedChinese.monthCn);
      } else {
        repairedNumeric.month = 1;
        repairedChinese.monthCn = JIAZI_TABLE[1];
      }
    }

    // 修复日柱
    if (JIAZI_TABLE[repairedNumeric.day] !== repairedChinese.dayCn) {
      if (repairedNumeric.day >= 0 && repairedNumeric.day < 60) {
        repairedChinese.dayCn = JIAZI_TABLE[repairedNumeric.day];
      } else if (repairedChinese.dayCn && JIAZI_TABLE.includes(repairedChinese.dayCn)) {
        repairedNumeric.day = JIAZI_TABLE.indexOf(repairedChinese.dayCn);
      } else {
        repairedNumeric.day = 2;
        repairedChinese.dayCn = JIAZI_TABLE[2];
      }
    }

    // 修复时柱
    if (JIAZI_TABLE[repairedNumeric.hour] !== repairedChinese.hourCn) {
      if (repairedNumeric.hour >= 0 && repairedNumeric.hour < 60) {
        repairedChinese.hourCn = JIAZI_TABLE[repairedNumeric.hour];
      } else if (repairedChinese.hourCn && JIAZI_TABLE.includes(repairedChinese.hourCn)) {
        repairedNumeric.hour = JIAZI_TABLE.indexOf(repairedChinese.hourCn);
      } else {
        repairedNumeric.hour = 3;
        repairedChinese.hourCn = JIAZI_TABLE[3];
      }
    }

    // 重新验证修复后的数据
    const repairedValidation = validateDualFormatData({
      yearCn: repairedChinese.yearCn,
      monthCn: repairedChinese.monthCn,
      dayCn: repairedChinese.dayCn,
      hourCn: repairedChinese.hourCn,
      shichenCn: repairedChinese.shichenCn,
      yearNumeric: repairedNumeric.year,
      monthNumeric: repairedNumeric.month,
      dayNumeric: repairedNumeric.day,
      hourNumeric: repairedNumeric.hour,
      shichenNumeric: repairedNumeric.shichen
    });

    return {
      ...dualFormatData,
      chinese: repairedChinese,
      numeric: repairedNumeric,
      validation: repairedValidation,
      meta: {
        ...dualFormatData.meta,
        dataSource: 'repaired',
        repairedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('修复八字数据失败:', error);
    return createErrorBaziData({
      error: `修复失败: ${error.message}`
    });
  }
};

/**
 * 标准化出生信息
 * @param {Object} config - 用户配置
 * @returns {Object} 标准化的出生信息
 */
export const normalizeBirthInfo = (config) => {
  try {
    if (!config) {
      return {
        birthDate: '1990-01-01',
        birthTime: '12:00',
        latitude: 39.90,
        longitude: 116.40
      };
    }

    // 标准化出生日期
    let birthDate = config.birthDate || '1990-01-01';
    if (!birthDate.includes('-')) {
      // 如果日期格式不正确，转换为标准格式
      birthDate = '1990-01-01';
    }

    // 标准化出生时间
    let birthTime = config.birthTime || '12:00';
    if (!birthTime.includes(':')) {
      // 如果时间格式不正确，转换为标准格式
      birthTime = '12:00';
    }

    // 标准化经纬度
    const latitude = config.latitude || 39.90;
    const longitude = config.longitude || 116.40;

    return {
      birthDate,
      birthTime,
      latitude,
      longitude
    };
  } catch (error) {
    console.error('标准化出生信息失败:', error);
    return {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      latitude: 39.90,
      longitude: 116.40
    };
  }
};

/**
 * 获取有效的时辰信息
 * @param {Object} config - 用户配置
 * @param {Object} baziData - 八字数据
 * @returns {string} 时辰信息
 */
export const getValidShichen = (config, baziData) => {
  try {
    if (!baziData || !baziData.bazi) {
      return '午时 (12:00)';
    }

    // 从八字时柱中提取时辰
    if (baziData.bazi && baziData.bazi.hour) {
      const hourGan = baziData.bazi.hour.charAt(0);
      const hourZhi = baziData.bazi.hour.charAt(1);
      const shichenMap = {
        '子': '子时 (23:00-01:00)',
        '丑': '丑时 (01:00-03:00)',
        '寅': '寅时 (03:00-05:00)',
        '卯': '卯时 (05:00-07:00)',
        '辰': '辰时 (07:00-09:00)',
        '巳': '巳时 (09:00-11:00)',
        '午': '午时 (11:00-13:00)',
        '未': '未时 (13:00-15:00)',
        '申': '申时 (15:00-17:00)',
        '酉': '酉时 (17:00-19:00)',
        '戌': '戌时 (19:00-21:00)',
        '亥': '亥时 (21:00-23:00)'
      };

      // 优先使用时柱的地支
      if (hourZhi && shichenMap[hourZhi]) {
        return shichenMap[hourZhi];
      }

      // 降级：使用默认时辰
      return '午时 (12:00)';
    }

    // 如果八字数据无效，返回默认值
    return '午时 (12:00)';
  } catch (error) {
    console.error('获取时辰信息失败:', error);
    return '午时 (12:00)';
  }
};

/**
 * 八字数据管理器类
 */
export class BaziDataManager {
  constructor() {
    this.data = null;
    this.listeners = new Set();
  }

  /**
   * 初始化八字数据管理器（静态方法）
   * @param {Object} config - 用户配置
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 初始化结果
   */
  static async initialize(config, options = {}) {
    try {
      console.log('BaziDataManager 初始化开始...', config);

      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 100));

      // 检查配置是否有效
      if (!config || !config.birthDate) {
        return {
          status: BaziStatus.ERROR,
          error: '配置信息不完整，缺少出生日期',
          fromCache: false
        };
      }

      // 创建八字数据
      const birthInfo = normalizeBirthInfo(config);
      const baziData = createDualFormatBaziData(birthInfo);

      // 创建管理器实例并设置数据
      const manager = new BaziDataManager();
      manager.setData(baziData);

      return {
        status: BaziStatus.READY,
        baziData: baziData,
        fromCache: options.useCache || false,
        manager: manager
      };
    } catch (error) {
      console.error('BaziDataManager 初始化失败:', error);
      return {
        status: BaziStatus.ERROR,
        error: error.message,
        fromCache: false
      };
    }
  }

  /**
   * 重新计算八字数据（静态方法）
   * @param {Object} config - 用户配置
   * @param {Object} birthInfo - 出生信息
   * @returns {Promise<Object>} 计算结果
   */
  static async recalculate(config, birthInfo) {
    try {
      console.log('BaziDataManager 重新计算开始...', birthInfo);

      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 50));

      // 创建新的八字数据
      const baziData = createDualFormatBaziData(birthInfo);

      // 创建管理器实例并设置数据
      const manager = new BaziDataManager();
      manager.setData(baziData);

      return {
        status: BaziStatus.READY,
        baziData: baziData,
        fromCache: false,
        manager: manager
      };
    } catch (error) {
      console.error('BaziDataManager 重新计算失败:', error);
      return {
        status: BaziStatus.ERROR,
        error: error.message,
        fromCache: false
      };
    }
  }

  /**
   * 设置八字数据
   * @param {DualFormatBaziData} data - 双格式八字数据
   */
  setData(data) {
    if (!data) {
      console.warn('设置的数据为空');
      return;
    }

    // 验证数据格式
    if (!data.meta || !data.numeric || !data.chinese) {
      console.error('数据格式不正确');
      return;
    }

    // 自动修复数据
    const repairedData = repairBaziData(data);
    
    this.data = repairedData;
    this.notifyListeners();
  }

  /**
   * 获取当前数据
   * @returns {DualFormatBaziData|null} 当前八字数据
   */
  getData() {
    return this.data;
  }

  /**
   * 获取显示信息
   * @returns {Object} 显示用的八字信息
   */
  getDisplayInfo() {
    return getDisplayInfo(this.data);
  }

  /**
   * 获取计算信息
   * @returns {Object} 计算用的八字信息
   */
  getCalculationInfo() {
    return getCalculationInfo(this.data);
  }

  /**
   * 检查数据有效性
   * @returns {boolean} 数据是否有效
   */
  isValid() {
    return this.data?.validation?.isValid || false;
  }

  /**
   * 添加数据变化监听器
   * @param {Function} listener - 监听函数
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * 移除数据变化监听器
   * @param {Function} listener - 监听函数
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.data);
      } catch (error) {
        console.error('监听器执行错误:', error);
      }
    });
  }

  /**
   * 清空数据
   */
  clear() {
    this.data = null;
    this.notifyListeners();
  }
}

// 创建全局实例
export const baziDataManager = new BaziDataManager();

export default {
  BAZI_DATA_VERSION,
  createDualFormatBaziData,
  convertLegacyToDualFormat,
  getDisplayInfo,
  getCalculationInfo,
  repairBaziData,
  baziDataManager,
  JIAZI_TABLE,
  SHICHEN_TABLE,
  WUXING_MAP
};