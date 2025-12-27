/**
 * 八字对象缓存管理器 - 双格式存储优化版
 * 支持数字格式和汉字格式的双格式缓存，提高数据一致性和健壮性
 */

import { createDualFormatBaziData, convertLegacyToDualFormat } from './baziDataManager';
import { baziValidator } from './BaziValidationLayer';
import { baziDataMigrationManager } from './BaziDataMigrationManager';

// 存储键名（升级版本号）
const BAZI_CACHE_KEY = 'nice_today_bazi_cache_v2';
const BAZI_CACHE_INDEX_KEY = 'nice_today_bazi_cache_index_v2';

// 八字缓存数据结构
class BaziCacheManager {
  constructor() {
    this.cache = new Map();
    this.index = {}; // { nickname: cacheKey } 映射表
    this.initialized = false;
    // 默认缓存过期时间：最小10分钟，最大12小时
    this.minCacheExpiryTime = 10 * 60 * 1000; // 10分钟
    this.maxCacheExpiryTime = 12 * 60 * 60 * 1000; // 12小时
    
    // 自动清理定时器
    this.cleanupIntervalId = null;
  }

  /**
   * 初始化缓存管理器（集成数据迁移功能）
   */
  async initialize() {
    try {
      console.log('开始初始化八字缓存管理器（双格式优化版）...');
      
      // 从 localStorage 加载缓存
      const cachedData = localStorage.getItem(BAZI_CACHE_KEY);
      const cachedIndex = localStorage.getItem(BAZI_CACHE_INDEX_KEY);
      
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        
        // 执行数据迁移和升级
        const migratedCache = await this.migrateCacheData(parsedCache);
        
        this.cache = new Map(migratedCache);
        console.log('加载并迁移八字缓存成功，缓存数量:', this.cache.size);
      } else {
        this.cache = new Map();
        console.log('未找到八字缓存，使用空缓存');
      }
      
      if (cachedIndex) {
        this.index = JSON.parse(cachedIndex);
        console.log('加载八字缓存索引成功:', Object.keys(this.index).length);
      }
      
      // 清理过期缓存
      const expiredCount = this.clearExpiredCache();
      console.log('清理过期缓存完成，删除了', expiredCount, '个过期缓存');
      
      // 启动自动清理定时器
      this.startAutoCleanup();
      
      this.initialized = true;
      console.log('八字缓存管理器初始化完成（双格式优化版）');
      return true;
    } catch (error) {
      console.error('初始化八字缓存管理器失败:', error);
      this.initialized = true;
      return false;
    }
  }

  /**
   * 生成缓存键（基于出生信息的唯一标识）
   * @param {string} birthDate 出生日期 YYYY-MM-DD
   * @param {string} birthTime 出生时间 HH:mm
   * @param {number} longitude 经度
   * @returns {string} 缓存键
   */
  generateCacheKey(birthDate, birthTime, longitude) {
    const lng = Math.round((longitude || 116.40) * 100) / 100;
    return `${birthDate}_${birthTime}_${lng}`;
  }

  /**
   * 检查缓存是否过期
   * @param {Object} cachedData 缓存数据
   * @returns {boolean} 是否过期
   */
  isCacheExpired(cachedData) {
    if (!cachedData.expiresAt) {
      // 如果没有过期时间，认为已过期（向后兼容）
      return true;
    }
    
    const now = new Date();
    const expiryTime = new Date(cachedData.expiresAt);
    
    return now > expiryTime;
  }

  /**
   * 获取缓存的八字信息（双格式存储优化）
   * @param {string} nickname 用户昵称
   * @param {Object} options 获取选项
   * @returns {Object|null} 八字信息
   */
  getBaziByNickname(nickname, options = {}) {
    if (!this.initialized) {
      return null;
    }
    
    const { 
      format = 'dual', // 'dual' | 'numeric' | 'chinese' | 'legacy'
      validate = true, // 是否验证数据有效性
      fallbackToLegacy = true // 是否回退到旧版格式
    } = options;
    
    const cacheKey = this.index[nickname];
    if (!cacheKey) {
      return null;
    }
    
    const cachedData = this.cache.get(cacheKey);
    
    // 检查缓存是否过期
    if (cachedData && this.isCacheExpired(cachedData)) {
      // 如果缓存过期，删除它并返回null
      this.cache.delete(cacheKey);
      delete this.index[nickname];
      this.saveToStorage();
      console.log('缓存已过期，已删除:', nickname);
      return null;
    }
    
    if (!cachedData) {
      return null;
    }
    
    // 根据请求的格式返回数据
    return this.getFormattedBaziData(cachedData, format, validate, fallbackToLegacy);
  }

  /**
   * 获取缓存的八字信息（通过出生信息，双格式存储优化）
   * @param {string} birthDate 出生日期
   * @param {string} birthTime 出生时间
   * @param {number} longitude 经度
   * @param {Object} options 获取选项
   * @returns {Object|null} 八字信息
   */
  getBaziByBirthInfo(birthDate, birthTime, longitude, options = {}) {
    if (!this.initialized) {
      return null;
    }
    
    const { 
      format = 'dual', // 'dual' | 'numeric' | 'chinese' | 'legacy'
      validate = true, // 是否验证数据有效性
      fallbackToLegacy = true // 是否回退到旧版格式
    } = options;
    
    const cacheKey = this.generateCacheKey(birthDate, birthTime, longitude);
    const cachedData = this.cache.get(cacheKey);
    
    // 检查缓存是否过期
    if (cachedData && this.isCacheExpired(cachedData)) {
      // 如果缓存过期，删除它并返回null
      this.cache.delete(cacheKey);
      // 同时删除索引中的引用
      for (const [nickname, key] of Object.entries(this.index)) {
        if (key === cacheKey) {
          delete this.index[nickname];
          break;
        }
      }
      this.saveToStorage();
      console.log('缓存已过期，已删除:', cacheKey);
      return null;
    }
    
    if (!cachedData) {
      return null;
    }
    
    // 根据请求的格式返回数据
    return this.getFormattedBaziData(cachedData, format, validate, fallbackToLegacy);
  }

  /**
   * 缓存八字信息（双格式存储优化）
   * @param {string} nickname 用户昵称
   * @param {Object} birthInfo 出生信息 {birthDate, birthTime, longitude}
   * @param {Object} baziInfo 八字信息（支持标准格式、旧版格式或双格式）
   * @param {string} configIndex 配置索引（可选）
   * @returns {boolean} 是否缓存成功
   */
  cacheBazi(nickname, birthInfo, baziInfo, configIndex = null, expiryTime = null) {
    if (!this.initialized) {
      console.warn('八字缓存管理器未初始化');
      return false;
    }
    
    try {
      const cacheKey = this.generateCacheKey(
        birthInfo.birthDate,
        birthInfo.birthTime || '12:30',
        birthInfo.longitude || 116.40
      );
      
      // 确保过期时间在允许范围内
      let actualExpiryTime = expiryTime || this.maxCacheExpiryTime; // 默认使用最大过期时间
      actualExpiryTime = Math.max(this.minCacheExpiryTime, Math.min(actualExpiryTime, this.maxCacheExpiryTime));
      
      // 转换为双格式八字数据
      let dualFormatData;
      if (baziInfo.meta && baziInfo.numeric && baziInfo.chinese) {
        // 已经是双格式数据
        dualFormatData = baziInfo;
      } else if (baziInfo.meta && baziInfo.birth && baziInfo.bazi) {
        // 标准Schema格式，转换为双格式
        dualFormatData = createDualFormatBaziData({
          birthDate: birthInfo.birthDate,
          birthTime: birthInfo.birthTime || '12:30',
          birthLocation: { lng: birthInfo.longitude || 116.40 },
          nickname
        });
      } else {
        // 旧版格式，转换为双格式
        dualFormatData = convertLegacyToDualFormat({
          ...baziInfo,
          birthDate: birthInfo.birthDate,
          birthTime: birthInfo.birthTime || '12:30',
          birthLocation: { lng: birthInfo.longitude || 116.40 },
          nickname
        });
      }

      // 验证数据有效性
      const validation = baziValidator.validatePillars(dualFormatData);
      
      // 保存八字信息到缓存（双格式优化）
      this.cache.set(cacheKey, {
        nickname,
        birthInfo,
        bazi: baziInfo, // 保持旧版兼容性
        dualFormatBazi: dualFormatData, // 新增：双格式八字数据
        configIndex,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + actualExpiryTime).toISOString(),
        // 添加八字相关字段
        lunarBirthDate: baziInfo.lunar?.text,
        trueSolarTime: baziInfo.shichen?.time || birthInfo.birthTime,
        shichen: baziInfo.shichen?.ganzhi,
        version: '2.0.0', // 标记为双格式版本
        validation: validation // 新增：验证信息
      });
      
      // 更新索引
      this.index[nickname] = cacheKey;
      
      // 保存到 localStorage
      this.saveToStorage();
      
      console.log('八字信息已缓存（双格式）:', { nickname, cacheKey, validity: validation.isValid });
      return true;
    } catch (error) {
      console.error('缓存八字信息失败:', error);
      return false;
    }
  }

  /**
   * 同步用户配置的八字到缓存
   * @param {Object} config 用户配置对象
   * @returns {boolean} 是否同步成功
   */
  syncConfigBaziToCache(config, expiryTime = null) {
    if (!config || !config.bazi) {
      console.warn('配置缺少八字信息，跳过同步');
      return false;
    }
    
    const birthInfo = {
      birthDate: config.birthDate,
      birthTime: config.birthTime || '12:30',
      longitude: config.birthLocation?.lng || 116.40
    };
    
    return this.cacheBazi(
      config.nickname,
      birthInfo,
      config.bazi,
      null, // configIndex 不需要保存到缓存
      expiryTime
    );
  }

  /**
   * 检查缓存是否存在
   * @param {string} nickname 用户昵称
   * @returns {boolean} 是否存在缓存
   */
  hasCache(nickname) {
    if (!this.initialized) {
      return false;
    }
    
    return this.hasValidCache(nickname);
  }

  /**
   * 清除指定用户的缓存
   * @param {string} nickname 用户昵称
   */
  clearCache(nickname) {
    const cacheKey = this.index[nickname];
    if (cacheKey) {
      this.cache.delete(cacheKey);
      delete this.index[nickname];
      this.saveToStorage();
      console.log('已清除用户八字缓存:', nickname);
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear();
    this.index = {};
    this.saveToStorage();
    console.log('已清除所有八字缓存');
  }

  /**
   * 保存缓存到 localStorage
   */
  saveToStorage() {
    try {
      // 转换 Map 为数组以便序列化
      const cacheArray = Array.from(this.cache.entries());

      // 安全序列化：移除可能导致循环引用的引用
      const safeCacheArray = cacheArray.map(([key, cachedData]) => {
        return [key, {
          nickname: cachedData.nickname,
          birthInfo: cachedData.birthInfo,
          // 不保存完整的 bazi 和 dualFormatBazi，只保存必要字段
          bazi: cachedData.bazi ? {
            text: cachedData.bazi.text,
            eightChar: null,  // 移除循环引用的 full 属性
            // 其他必要的字段...
            ...cachedData.bazi
          } : null,
          dualFormatBazi: cachedData.dualFormatBazi ? {
            numeric: cachedData.dualFormatBazi.numeric,
            chinese: cachedData.dualFormatBazi.chinese,
            validation: cachedData.dualFormatBazi.validation
            // 移除 compatibility.legacy，避免循环引用
          } : null,
          configIndex: cachedData.configIndex,
          cachedAt: cachedData.cachedAt,
          expiresAt: cachedData.expiresAt,
          lunarBirthDate: cachedData.lunarBirthDate,
          trueSolarTime: cachedData.trueSolarTime,
          shichen: cachedData.shichen,
          version: cachedData.version,
          validation: cachedData.validation
        }];
      });

      localStorage.setItem(BAZI_CACHE_KEY, JSON.stringify(safeCacheArray));
      localStorage.setItem(BAZI_CACHE_INDEX_KEY, JSON.stringify(this.index));
    } catch (error) {
      console.error('保存八字缓存到存储失败:', error);
    }
  }

  /**
   * 清理所有过期的缓存
   * @returns {number} 清理的缓存数量
   */
  clearExpiredCache() {
    let clearedCount = 0;
    const keysToDelete = [];
    
    for (const [cacheKey, cachedData] of this.cache.entries()) {
      if (this.isCacheExpired(cachedData)) {
        keysToDelete.push(cacheKey);
      }
    }
    
    for (const cacheKey of keysToDelete) {
      this.cache.delete(cacheKey);
      
      // 从索引中删除对应的引用
      for (const [nickname, key] of Object.entries(this.index)) {
        if (key === cacheKey) {
          delete this.index[nickname];
          break;
        }
      }
      clearedCount++;
    }
    
    if (clearedCount > 0) {
      this.saveToStorage();
      console.log(`清理了 ${clearedCount} 个过期的缓存`);
    }
    
    return clearedCount;
  }

  /**
   * 缓存预热 - 预先加载可能需要的八字信息
   * @param {Array} configs 配置列表
   * @param {Object} options 预热选项
   * @returns {Object} 预热统计
   */
  warmCache(configs, options = {}) {
    if (!configs || !Array.isArray(configs)) {
      return { success: false, message: '无效的配置数组' };
    }
    
    const {
      expiryTime = null, // 自定义过期时间
      forceRefresh = false, // 是否强制刷新
      filterFunction = null // 过滤函数
    } = options;
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const config of configs) {
      // 检查过滤条件
      if (filterFunction && typeof filterFunction === 'function' && !filterFunction(config)) {
        skipCount++;
        continue;
      }
      
      // 检查是否已有有效缓存（除非强制刷新）
      if (!forceRefresh && this.hasValidCache(config.nickname)) {
        skipCount++;
        continue;
      }
      
      if (config && config.birthDate && config.bazi) {
        try {
          const birthInfo = {
            birthDate: config.birthDate,
            birthTime: config.birthTime || '12:30',
            longitude: config.birthLocation?.lng || 116.40
          };
          
          const result = this.cacheBazi(
            config.nickname,
            birthInfo,
            config.bazi,
            null,
            expiryTime
          );
          
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('缓存预热失败:', error);
          errorCount++;
        }
      } else {
        skipCount++;
      }
    }
    
    const stats = {
      success: true,
      total: configs.length,
      successCount,
      skipCount,
      errorCount,
      stats: this.getCacheStats()
    };
    
    console.log('缓存预热完成:', stats);
    return stats;
  }

  /**
   * 检查是否有有效的缓存（未过期）
   * @param {string} nickname 用户昵称
   * @returns {boolean} 是否有有效缓存
   */
  hasValidCache(nickname) {
    if (!this.initialized) {
      return false;
    }
    
    const cacheKey = this.index[nickname];
    if (!cacheKey) {
      return false;
    }
    
    const cachedData = this.cache.get(cacheKey);
    
    // 检查缓存是否过期
    if (cachedData && this.isCacheExpired(cachedData)) {
      // 如果缓存过期，删除它
      this.cache.delete(cacheKey);
      delete this.index[nickname];
      this.saveToStorage();
      return false;
    }
    
    return !!cachedData;
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return {
      totalCaches: this.cache.size,
      totalIndexes: Object.keys(this.index).length,
      initialized: this.initialized,
      oldestCache: this.getOldestCache(),
      newestCache: this.getNewestCache()
    };
  }
  
  /**
   * 启动定时清理过期缓存
   * @param {number} interval 清理间隔（毫秒），默认30分钟
   * @returns {number} 定时器ID
   */
  startAutoCleanup(interval = 30 * 60 * 1000) {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
    
    this.cleanupIntervalId = setInterval(() => {
      try {
        const clearedCount = this.clearExpiredCache();
        if (clearedCount > 0) {
          console.log(`自动清理完成，删除了 ${clearedCount} 个过期缓存`);
        }
      } catch (error) {
        console.error('自动清理过期缓存时出错:', error);
      }
    }, interval);
    
    console.log(`已启动自动清理，间隔: ${interval}ms`);
    return this.cleanupIntervalId;
  }
  
  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
      console.log('已停止自动清理');
    }
  }

  /**
   * 获取最旧的缓存
   */
  getOldestCache() {
    let oldest = null;
    let oldestTime = null;
    
    for (const [key, value] of this.cache.entries()) {
      if (!oldest || value.cachedAt < oldestTime) {
        oldest = { key, ...value };
        oldestTime = value.cachedAt;
      }
    }
    
    return oldest;
  }

  /**
   * 获取最新的缓存
   */
  getNewestCache() {
    let newest = null;
    let newestTime = null;
    
    for (const [key, value] of this.cache.entries()) {
      if (!newest || value.cachedAt > newestTime) {
        newest = { key, ...value };
        newestTime = value.cachedAt;
      }
    }
    
    return newest;
  }

  /**
   * 从配置列表批量缓存八字信息
   * @param {Array} configs 用户配置数组
   * @returns {Object} 缓存统计
   */
  batchSyncConfigs(configs, expiryTime = null) {
    if (!configs || !Array.isArray(configs)) {
      return { success: false, message: '无效的配置数组' };
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const config of configs) {
      if (config && config.bazi && config.birthDate) {
        const result = this.syncConfigBaziToCache(config, expiryTime);
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        skipCount++;
      }
    }
    
    const stats = {
      success: true,
      total: configs.length,
      successCount,
      skipCount,
      errorCount,
      stats: this.getCacheStats()
    };
    
    console.log('批量缓存八字信息完成:', stats);
    return stats;
  }

  /**
   * 获取初始配置的八字缓存（用于备份/恢复）
   * @param {Object} defaultConfig 默认配置
   * @returns {Object|null} 八字信息
   */
  getDefaultConfigBazi(defaultConfig) {
    // 检查是否有默认昵称的缓存
    if (defaultConfig && defaultConfig.nickname) {
      const cachedBazi = this.getBaziByNickname(defaultConfig.nickname);
      if (cachedBazi) {
        console.log('从缓存获取默认配置八字:', defaultConfig.nickname);
        return cachedBazi;
      }
    }
    
    // 如果缓存中没有，返回默认配置中的八字
    if (defaultConfig && defaultConfig.bazi) {
      console.log('使用默认配置中的八字:', defaultConfig.nickname);
      return defaultConfig.bazi;
    }
    
    return null;
  }

  /**
   * 根据格式获取格式化后的八字数据
   * @param {Object} cachedData 缓存数据
   * @param {string} format 格式类型
   * @param {boolean} validate 是否验证
   * @param {boolean} fallbackToLegacy 是否回退
   * @returns {Object|null} 格式化后的八字数据
   */
  getFormattedBaziData(cachedData, format = 'dual', validate = true, fallbackToLegacy = true) {
    if (!cachedData) {
      return null;
    }

    try {
      let resultData = null;

      // 优先使用双格式数据
      if (cachedData.dualFormatBazi) {
        const dualData = cachedData.dualFormatBazi;
        
        // 验证数据有效性
        if (validate && cachedData.validation) {
          const validation = baziValidator.validatePillars(dualData);
          if (!validation.isValid) {
            console.warn('双格式八字数据验证失败:', validation.errors);
            if (validate === 'strict') {
              return null;
            }
          }
        }

        // 根据格式返回相应数据
        switch (format) {
          case 'numeric':
            resultData = dualData.numeric;
            break;
          case 'chinese':
            resultData = dualData.chinese;
            break;
          case 'legacy':
            // 转换为旧版格式
            resultData = this.convertDualToLegacyFormat(dualData, cachedData);
            break;
          case 'dual':
          default:
            resultData = dualData;
            break;
        }
      } else if (fallbackToLegacy && cachedData.bazi) {
        // 回退到旧版格式
        console.warn('使用旧版八字数据格式，建议升级到双格式');
        resultData = cachedData.bazi;
      }

      // 添加元数据
      if (resultData) {
        return {
          ...resultData,
          _meta: {
            cachedAt: cachedData.cachedAt,
            expiresAt: cachedData.expiresAt,
            version: cachedData.version || '1.0.0',
            format: format,
            validation: cachedData.validation
          }
        };
      }

      return null;
    } catch (error) {
      console.error('获取格式化八字数据失败:', error);
      return null;
    }
  }

  /**
   * 将双格式数据转换为旧版格式
   * @param {Object} dualData 双格式数据
   * @param {Object} cachedData 缓存数据
   * @returns {Object} 旧版格式数据
   */
  convertDualToLegacyFormat(dualData, cachedData) {
    const { numeric, chinese } = dualData;
    
    return {
      // 四柱信息
      year: {
        gan: numeric.year.gan,
        zhi: numeric.year.zhi,
        ganzhi: chinese.year
      },
      month: {
        gan: numeric.month.gan,
        zhi: numeric.month.zhi,
        ganzhi: chinese.month
      },
      day: {
        gan: numeric.day.gan,
        zhi: numeric.day.zhi,
        ganzhi: chinese.day
      },
      hour: {
        gan: numeric.hour.gan,
        zhi: numeric.hour.zhi,
        ganzhi: chinese.hour
      },
      // 其他字段保持兼容
      lunar: cachedData.lunarBirthDate ? { text: cachedData.lunarBirthDate } : null,
      shichen: cachedData.shichen ? { ganzhi: cachedData.shichen } : null
    };
  }

  /**
   * 获取所有缓存的统计信息
   * @returns {Object} 统计信息
   */
  getCacheStatistics() {
    const stats = {
      totalCount: this.cache.size,
      dualFormatCount: 0,
      legacyFormatCount: 0,
      validCount: 0,
      invalidCount: 0,
      expiredCount: 0
    };

    for (const [cacheKey, cachedData] of this.cache.entries()) {
      if (this.isCacheExpired(cachedData)) {
        stats.expiredCount++;
        continue;
      }

      if (cachedData.dualFormatBazi) {
        stats.dualFormatCount++;
      } else {
        stats.legacyFormatCount++;
      }

      if (cachedData.validation && cachedData.validation.isValid) {
        stats.validCount++;
      } else {
        stats.invalidCount++;
      }
    }

    return stats;
  }

  /**
   * 迁移缓存数据（处理版本升级和数据格式转换）
   * @param {Array} cachedArray 原始缓存数组
   * @returns {Array} 迁移后的缓存数组
   */
  async migrateCacheData(cachedArray) {
    const migratedCache = [];
    let migratedCount = 0;
    let errorCount = 0;

    console.log('开始迁移缓存数据...');

    for (const [cacheKey, cachedData] of cachedArray) {
      try {
        // 检查数据是否需要迁移
        if (this.needsMigration(cachedData)) {
          // 执行数据迁移
          const migratedData = await this.migrateSingleCacheEntry(cachedData);
          migratedCache.push([cacheKey, migratedData]);
          migratedCount++;
        } else {
          // 不需要迁移，直接保留
          migratedCache.push([cacheKey, cachedData]);
        }
      } catch (error) {
        console.error(`迁移缓存数据失败 (${cacheKey}):`, error);
        errorCount++;
        
        // 如果迁移失败，尝试保留原始数据并标记为需要修复
        const fallbackData = {
          ...cachedData,
          _meta: {
            ...(cachedData._meta || {}),
            migrationError: error.message,
            needsRepair: true
          }
        };
        migratedCache.push([cacheKey, fallbackData]);
      }
    }

    console.log(`缓存数据迁移完成: ${migratedCount}个数据迁移, ${errorCount}个错误`);
    return migratedCache;
  }

  /**
   * 检查数据是否需要迁移
   * @param {Object} cachedData 缓存数据
   * @returns {boolean} 是否需要迁移
   */
  needsMigration(cachedData) {
    // 检查数据版本
    const version = cachedData.version || '1.0.0';
    
    // 如果版本低于当前版本，需要迁移
    if (version < '2.0.0') {
      return true;
    }

    // 检查是否缺少双格式数据
    if (!cachedData.dualFormatBazi) {
      return true;
    }

    // 检查数据有效性
    if (cachedData.validation && !cachedData.validation.isValid) {
      return true;
    }

    return false;
  }

  /**
   * 迁移单个缓存条目
   * @param {Object} cachedData 原始缓存数据
   * @returns {Object} 迁移后的缓存数据
   */
  async migrateSingleCacheEntry(cachedData) {
    const migrationContext = {
      cacheKey: cachedData.nickname || 'unknown',
      originalVersion: cachedData.version || '1.0.0',
      timestamp: new Date().toISOString()
    };

    // 使用数据迁移管理器进行迁移
    const migratedData = baziDataMigrationManager.migrateData(cachedData, migrationContext);

    // 确保迁移后的数据包含必要的字段
    return this.ensureMigratedDataIntegrity(migratedData, cachedData);
  }

  /**
   * 确保迁移后数据的完整性
   * @param {Object} migratedData 迁移后的数据
   * @param {Object} originalData 原始数据
   * @returns {Object} 完整性检查后的数据
   */
  ensureMigratedDataIntegrity(migratedData, originalData) {
    const ensuredData = { ...migratedData };

    // 确保保留原始的重要字段
    if (!ensuredData.nickname && originalData.nickname) {
      ensuredData.nickname = originalData.nickname;
    }

    if (!ensuredData.birthInfo && originalData.birthInfo) {
      ensuredData.birthInfo = originalData.birthInfo;
    }

    if (!ensuredData.cachedAt && originalData.cachedAt) {
      ensuredData.cachedAt = originalData.cachedAt;
    }

    if (!ensuredData.expiresAt && originalData.expiresAt) {
      ensuredData.expiresAt = originalData.expiresAt;
    }

    // 设置版本信息
    ensuredData.version = '2.0.0';
    ensuredData._meta = {
      ...(ensuredData._meta || {}),
      migratedFrom: originalData.version || '1.0.0',
      migratedAt: new Date().toISOString()
    };

    return ensuredData;
  }

  /**
   * 启动自动清理定时器
   */
  startAutoCleanup() {
    // 每隔1小时自动清理一次过期缓存
    this.cleanupIntervalId = setInterval(() => {
      if (this.initialized) {
        const clearedCount = this.clearExpiredCache();
        if (clearedCount > 0) {
          console.log(`自动清理完成，删除了 ${clearedCount} 个过期缓存`);
        }
      }
    }, 60 * 60 * 1000); // 1小时
  }

  /**
   * 停止自动清理定时器
   */
  stopAutoCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * 获取详细的缓存诊断信息
   * @returns {Object} 诊断信息
   */
  getDiagnosticInfo() {
    const cacheStats = this.getCacheStatistics();
    const migrationStats = baziDataMigrationManager.getMigrationStatistics();

    return {
      cache: cacheStats,
      migration: migrationStats,
      system: {
        initialized: this.initialized,
        cacheSize: this.cache.size,
        indexSize: Object.keys(this.index).length,
        autoCleanup: !!this.cleanupIntervalId
      }
    };
  }

  /**
   * 修复损坏的缓存数据
   * @param {string} nickname 用户昵称
   * @returns {boolean} 是否修复成功
   */
  repairCacheData(nickname) {
    try {
      const cacheKey = this.index[nickname];
      if (!cacheKey) {
        console.warn(`未找到用户 ${nickname} 的缓存数据`);
        return false;
      }

      const cachedData = this.cache.get(cacheKey);
      if (!cachedData) {
        console.warn(`缓存数据不存在: ${cacheKey}`);
        return false;
      }

      // 执行数据修复
      const repairedData = baziDataMigrationManager.migrateData(cachedData, {
        repairMode: true,
        nickname
      });

      // 更新缓存
      this.cache.set(cacheKey, repairedData);
      this.saveToStorage();

      console.log(`修复缓存数据成功: ${nickname}`);
      return true;

    } catch (error) {
      console.error(`修复缓存数据失败 (${nickname}):`, error);
      return false;
    }
  }

  /**
   * 批量修复所有有问题的缓存数据
   * @returns {Object} 修复统计
   */
  repairAllCacheData() {
    const stats = {
      total: 0,
      repaired: 0,
      failed: 0,
      errors: []
    };

    for (const [cacheKey, cachedData] of this.cache.entries()) {
      stats.total++;

      // 检查数据是否有效
      const isValid = cachedData.validation && cachedData.validation.isValid;
      const needsRepair = cachedData._meta && cachedData._meta.needsRepair;

      if (!isValid || needsRepair) {
        try {
          const nickname = cachedData.nickname || `cache_${cacheKey}`;
          const success = this.repairCacheData(nickname);
          
          if (success) {
            stats.repaired++;
          } else {
            stats.failed++;
            stats.errors.push(`修复失败: ${nickname}`);
          }
        } catch (error) {
          stats.failed++;
          stats.errors.push(`修复异常: ${error.message}`);
        }
      }
    }

    console.log(`批量修复完成: ${stats.repaired}个成功, ${stats.failed}个失败`);
    return stats;
  }
}

// 创建单例实例
export const baziCacheManager = new BaziCacheManager();

export default BaziCacheManager;
