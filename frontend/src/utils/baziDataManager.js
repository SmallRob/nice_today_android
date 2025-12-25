/**
 * 八字数据统一管理服务
 * 负责统一管理八字信息的获取、计算、缓存和同步
 * 解决当前混乱的数据同步状态问题
 */

import { calculateDetailedBazi } from './baziHelper';
import { getShichenSimple } from './astronomy';
import { storageManager } from './storageManager';
import { errorLogger } from './errorLogger';

// 默认值
const DEFAULT_BIRTH_TIME = '12:30';
const DEFAULT_LONGITUDE = 116.40;
const DEFAULT_LATITUDE = 39.90;

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
 * 验证八字数据的完整性
 * @param {Object} baziData - 八字数据对象
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateBaziData = (baziData) => {
  if (!baziData) {
    return { valid: false, error: '八字数据为空' };
  }

  // 检查 bazi.bazi 字段（新格式）
  if (baziData.bazi && baziData.bazi.bazi) {
    const { bazi: baziInfo } = baziData;
    if (!baziInfo.year || !baziInfo.month || !baziInfo.day || !baziInfo.hour) {
      return { valid: false, error: '八字四柱信息不完整' };
    }
  } else if (!baziData.bazi) {
    // 检查旧格式（直接有 year, month, day, hour）
    if (!baziData.year || !baziData.month || !baziData.day || !baziData.hour) {
      return { valid: false, error: '八字四柱信息不完整' };
    }
  }

  return { valid: true, error: null };
};

/**
 * 获取有效的时辰显示
 * 优先级：配置中的 shichen > 八字计算结果 > 根据 birthTime 计算
 * @param {Object} config - 用户配置
 * @param {Object} baziData - 八字数据
 * @returns {string} 时辰显示文本
 */
export const getValidShichen = (config, baziData) => {
  // 1. 优先使用配置中已保存的时辰（简化格式）
  if (config?.shichen && typeof config.shichen === 'string') {
    const shichen = config.shichen.trim();
    if (shichen && shichen !== '未知' && shichen.endsWith('时')) {
      return shichen;
    }
  }

  // 2. 使用八字计算结果中的时辰
  if (baziData) {
    // 新格式：baziData.bazi.shichen.ganzhi
    if (baziData.bazi && baziData.bazi.bazi && baziData.bazi.bazi.shichen) {
      const ganzhi = baziData.bazi.bazi.shichen.ganzhi;
      if (ganzhi && ganzhi.endsWith('时')) {
        return ganzhi;
      }
    }
    // 旧格式：baziData.shichen.ganzhi
    if (baziData.shichen && baziData.shichen.ganzhi) {
      const ganzhi = baziData.shichen.ganzhi;
      if (ganzhi && ganzhi.endsWith('时')) {
        return ganzhi;
      }
    }
  }

  // 3. 根据 birthTime 计算时辰
  if (config?.birthTime) {
    try {
      return getShichenSimple(config.birthTime);
    } catch (error) {
      console.error('计算时辰失败:', error);
    }
  }

  // 4. 使用默认时辰
  return getShichenSimple(DEFAULT_BIRTH_TIME);
};

/**
 * 标准化出生信息
 * 确保所有必要字段都有有效值，使用默认值回退
 * @param {Object} config - 用户配置
 * @returns {Object} 标准化的出生信息
 */
export const normalizeBirthInfo = (config) => {
  if (!config) {
    return {
      birthDate: null,
      birthTime: DEFAULT_BIRTH_TIME,
      longitude: DEFAULT_LONGITUDE,
      latitude: DEFAULT_LATITUDE,
      hasValidDate: false
    };
  }

  const birthDate = config.birthDate;
  const birthTime = config.birthTime || DEFAULT_BIRTH_TIME;
  const longitude = config.birthLocation?.lng ?? DEFAULT_LONGITUDE;
  const latitude = config.birthLocation?.lat ?? DEFAULT_LATITUDE;

  // 验证日期格式
  let hasValidDate = false;
  if (birthDate) {
    try {
      const date = new Date(birthDate);
      hasValidDate = !isNaN(date.getTime());
    } catch (e) {
      hasValidDate = false;
    }
  }

  return {
    birthDate,
    birthTime,
    longitude,
    latitude,
    hasValidDate
  };
};

/**
 * 生成缓存键
 * @param {string} birthDate - 出生日期
 * @param {string} birthTime - 出生时间
 * @param {number} longitude - 经度
 * @returns {string} 缓存键
 */
export const generateCacheKey = (birthDate, birthTime, longitude) => {
  return `bazi_${birthDate}_${birthTime}_${longitude}`;
};

/**
 * 从缓存获取八字数据
 * @param {string} cacheKey - 缓存键
 * @returns {Object|null} 八字数据或null
 */
export const getBaziFromCache = (cacheKey) => {
  try {
    return storageManager.getGlobalCache(cacheKey);
  } catch (error) {
    console.warn('从缓存获取八字失败:', error);
    return null;
  }
};

/**
 * 将八字数据保存到缓存
 * @param {string} cacheKey - 缓存键
 * @param {Object} baziData - 八字数据
 */
export const saveBaziToCache = (cacheKey, baziData) => {
  try {
    storageManager.setGlobalCache(cacheKey, baziData);
  } catch (error) {
    console.error('保存八字到缓存失败:', error);
  }
};

/**
 * 计算八字（带错误处理）
 * @param {string} birthDate - 出生日期
 * @param {string} birthTime - 出生时间
 * @param {number} longitude - 经度
 * @returns {Object} { baziData, error, status }
 */
export const calculateBaziWithErrorHandling = (birthDate, birthTime, longitude) => {
  try {
    if (!birthDate) {
      return {
        baziData: null,
        error: '缺少出生日期',
        status: BaziStatus.ERROR
      };
    }

    const baziData = calculateDetailedBazi(birthDate, birthTime, longitude);

    if (!baziData) {
      return {
        baziData: null,
        error: '八字计算返回空值',
        status: BaziStatus.ERROR
      };
    }

    // 验证计算结果
    const validation = validateBaziData(baziData);
    if (!validation.valid) {
      return {
        baziData: null,
        error: validation.error,
        status: BaziStatus.ERROR
      };
    }

    return {
      baziData,
      error: null,
      status: BaziStatus.READY
    };

  } catch (error) {
    errorLogger.log(error, {
      component: 'BaziDataManager',
      action: 'calculateBazi',
      birthDate,
      birthTime,
      errorType: 'CalculationError'
    });

    return {
      baziData: null,
      error: error.message || '八字计算失败',
      status: BaziStatus.ERROR
    };
  }
};

/**
 * 统一八字加载流程
 * @param {Object} config - 用户配置
 * @param {Object} options - 选项 { useCache, forceRecalculate }
 * @returns {Promise<Object>} { baziData, fromCache, status }
 */
export const loadBaziData = async (config, options = {}) => {
  const { useCache = true, forceRecalculate = false } = options;

  // 1. 标准化出生信息
  const birthInfo = normalizeBirthInfo(config);

  if (!birthInfo.hasValidDate) {
    return {
      baziData: null,
      fromCache: false,
      status: BaziStatus.MISSING,
      error: '缺少有效的出生日期'
    };
  }

  // 2. 如果强制重新计算，跳过缓存
  if (forceRecalculate) {
    console.log('强制重新计算八字...');
    const result = calculateBaziWithErrorHandling(
      birthInfo.birthDate,
      birthInfo.birthTime,
      birthInfo.longitude
    );

    if (result.status === BaziStatus.READY) {
      // 保存到缓存
      const cacheKey = generateCacheKey(
        birthInfo.birthDate,
        birthInfo.birthTime,
        birthInfo.longitude
      );
      saveBaziToCache(cacheKey, result.baziData);
    }

    return result;
  }

  // 3. 检查配置中是否已有八字数据
  if (config.bazi) {
    const validation = validateBaziData(config.bazi);
    if (validation.valid) {
      console.log('✓ 使用配置中的八字数据');
      return {
        baziData: config.bazi,
        fromCache: false,
        status: BaziStatus.READY,
        error: null
      };
    } else {
      console.warn('⚠ 配置中的八字数据无效:', validation.error);
    }
  }

  // 4. 尝试从缓存获取
  if (useCache) {
    const cacheKey = generateCacheKey(
      birthInfo.birthDate,
      birthInfo.birthTime,
      birthInfo.longitude
    );
    const cachedData = getBaziFromCache(cacheKey);

    if (cachedData) {
      const validation = validateBaziData(cachedData);
      if (validation.valid) {
        console.log('✓ 从缓存加载八字数据');
        return {
          baziData: cachedData,
          fromCache: true,
          status: BaziStatus.READY,
          error: null
        };
      } else {
        console.warn('⚠ 缓存中的八字数据无效:', validation.error);
      }
    }
  }

  // 5. 计算新的八字数据
  console.log('⚠ 计算新的八字数据...');
  const result = calculateBaziWithErrorHandling(
    birthInfo.birthDate,
    birthInfo.birthTime,
    birthInfo.longitude
  );

  if (result.status === BaziStatus.READY) {
    // 保存到缓存
    const cacheKey = generateCacheKey(
      birthInfo.birthDate,
      birthInfo.birthTime,
      birthInfo.longitude
    );
    saveBaziToCache(cacheKey, result.baziData);
  }

  return result;
};

/**
 * 清除八字缓存
 * @param {string} cacheKey - 缓存键（可选）
 */
export const clearBaziCache = (cacheKey = null) => {
  try {
    if (cacheKey) {
      storageManager.removeGlobalCache(cacheKey);
      console.log(`清除八字缓存: ${cacheKey}`);
    } else {
      // 清除所有八字相关缓存
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('bazi_')) {
          storageManager.removeGlobalCache(key);
        }
      });
      console.log('清除所有八字缓存');
    }
  } catch (error) {
    console.error('清除八字缓存失败:', error);
  }
};

/**
 * 八字数据同步管理器
 * 提供完整的八字数据生命周期管理
 */
export class BaziDataManager {
  /**
   * 初始化并加载八字数据
   * @param {Object} config - 用户配置
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 八字数据加载结果
   */
  static async initialize(config, options = {}) {
    const result = await loadBaziData(config, options);

    if (result.status === BaziStatus.ERROR) {
      errorLogger.log(new Error(result.error), {
        component: 'BaziDataManager',
        action: 'initialize',
        configNickname: config?.nickname,
        errorType: 'BaziInitError'
      });
    }

    return result;
  }

  /**
   * 根据出生信息变更重新计算八字
   * @param {Object} config - 用户配置
   * @param {Object} newBirthInfo - 新的出生信息
   * @returns {Promise<Object>} 八字数据计算结果
   */
  static async recalculate(config, newBirthInfo) {
    // 标准化新出生信息
    const normalizedInfo = {
      birthDate: newBirthInfo.birthDate || config?.birthDate,
      birthTime: newBirthInfo.birthTime || config?.birthTime || DEFAULT_BIRTH_TIME,
      longitude: newBirthInfo.longitude || (config?.birthLocation?.lng ?? DEFAULT_LONGITUDE)
    };

    // 验证日期
    if (!normalizedInfo.birthDate) {
      return {
        baziData: null,
        fromCache: false,
        status: BaziStatus.MISSING,
        error: '缺少有效的出生日期'
      };
    }

    // 计算新的八字
    const result = calculateBaziWithErrorHandling(
      normalizedInfo.birthDate,
      normalizedInfo.birthTime,
      normalizedInfo.longitude
    );

    if (result.status === BaziStatus.READY) {
      // 更新缓存
      const cacheKey = generateCacheKey(
        normalizedInfo.birthDate,
        normalizedInfo.birthTime,
        normalizedInfo.longitude
      );
      saveBaziToCache(cacheKey, result.baziData);

      console.log('✓ 八字重新计算完成，已更新缓存');
    }

    return result;
  }

  /**
   * 检查八字数据是否需要重新计算
   * @param {Object} config - 用户配置
   * @param {Object} birthInfo - 新的出生信息
   * @returns {boolean} 是否需要重新计算
   */
  static needsRecalculation(config, birthInfo) {
    // 如果配置中没有八字数据，需要计算
    if (!config.bazi) {
      return true;
    }

    // 验证配置中的八字数据
    const validation = validateBaziData(config.bazi);
    if (!validation.valid) {
      console.warn('配置中的八字数据无效:', validation.error);
      return true;
    }

    // 检查出生信息是否变化
    const { birthDate, birthTime, longitude } = birthInfo;
    const oldBirthDate = config.birthDate;
    const oldBirthTime = config.birthTime || DEFAULT_BIRTH_TIME;
    const oldLongitude = config.birthLocation?.lng ?? DEFAULT_LONGITUDE;

    const dateChanged = birthDate !== oldBirthDate;
    const timeChanged = birthTime !== oldBirthTime;
    const locationChanged = Math.abs(longitude - oldLongitude) > 0.01;

    return dateChanged || timeChanged || locationChanged;
  }

  /**
   * 获取八字数据状态
   * @param {Object} config - 用户配置
   * @returns {string} BaziStatus
   */
  static getStatus(config) {
    if (!config) {
      return BaziStatus.MISSING;
    }

    if (!config.birthDate) {
      return BaziStatus.MISSING;
    }

    if (!config.bazi) {
      return BaziStatus.MISSING;
    }

    const validation = validateBaziData(config.bazi);
    if (!validation.valid) {
      return BaziStatus.ERROR;
    }

    return BaziStatus.READY;
  }
}

export default BaziDataManager;
