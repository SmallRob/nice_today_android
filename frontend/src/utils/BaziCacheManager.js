/**
 * 八字对象缓存管理器
 * 用于独立缓存八字计算结果，与用户配置分离存储
 */

// 存储键名
const BAZI_CACHE_KEY = 'nice_today_bazi_cache_v1';
const BAZI_CACHE_INDEX_KEY = 'nice_today_bazi_cache_index_v1';

// 八字缓存数据结构
class BaziCacheManager {
  constructor() {
    this.cache = new Map();
    this.index = {}; // { nickname: cacheKey } 映射表
    this.initialized = false;
  }

  /**
   * 初始化缓存管理器
   */
  async initialize() {
    try {
      console.log('开始初始化八字缓存管理器...');
      
      // 从 localStorage 加载缓存
      const cachedData = localStorage.getItem(BAZI_CACHE_KEY);
      const cachedIndex = localStorage.getItem(BAZI_CACHE_INDEX_KEY);
      
      if (cachedData) {
        this.cache = new Map(JSON.parse(cachedData));
        console.log('加载八字缓存成功，缓存数量:', this.cache.size);
      }
      
      if (cachedIndex) {
        this.index = JSON.parse(cachedIndex);
        console.log('加载八字缓存索引成功:', Object.keys(this.index).length);
      }
      
      this.initialized = true;
      console.log('八字缓存管理器初始化完成');
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
   * 获取缓存的八字信息
   * @param {string} nickname 用户昵称
   * @returns {Object|null} 八字信息
   */
  getBaziByNickname(nickname) {
    if (!this.initialized) {
      return null;
    }
    
    const cacheKey = this.index[nickname];
    if (!cacheKey) {
      return null;
    }
    
    return this.cache.get(cacheKey);
  }

  /**
   * 获取缓存的八字信息（通过出生信息）
   * @param {string} birthDate 出生日期
   * @param {string} birthTime 出生时间
   * @param {number} longitude 经度
   * @returns {Object|null} 八字信息
   */
  getBaziByBirthInfo(birthDate, birthTime, longitude) {
    if (!this.initialized) {
      return null;
    }
    
    const cacheKey = this.generateCacheKey(birthDate, birthTime, longitude);
    return this.cache.get(cacheKey);
  }

  /**
   * 缓存八字信息
   * @param {string} nickname 用户昵称
   * @param {Object} birthInfo 出生信息 {birthDate, birthTime, longitude}
   * @param {Object} baziInfo 八字信息
   * @param {string} configIndex 配置索引（可选）
   * @returns {boolean} 是否缓存成功
   */
  cacheBazi(nickname, birthInfo, baziInfo, configIndex = null) {
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
      
      // 保存八字信息到缓存
      this.cache.set(cacheKey, {
        nickname,
        birthInfo,
        bazi: baziInfo,
        configIndex,
        cachedAt: new Date().toISOString(),
        // 添加八字相关字段
        lunarBirthDate: baziInfo.lunar?.text,
        trueSolarTime: baziInfo.shichen?.time || birthInfo.birthTime,
        shichen: baziInfo.shichen?.ganzhi
      });
      
      // 更新索引
      this.index[nickname] = cacheKey;
      
      // 保存到 localStorage
      this.saveToStorage();
      
      console.log('八字信息已缓存:', { nickname, cacheKey, birthInfo });
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
  syncConfigBaziToCache(config) {
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
      null // configIndex 不需要保存到缓存
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
    
    const cacheKey = this.index[nickname];
    return cacheKey !== undefined && this.cache.has(cacheKey);
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
      localStorage.setItem(BAZI_CACHE_KEY, JSON.stringify(cacheArray));
      localStorage.setItem(BAZI_CACHE_INDEX_KEY, JSON.stringify(this.index));
    } catch (error) {
      console.error('保存八字缓存到存储失败:', error);
    }
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
  batchSyncConfigs(configs) {
    if (!configs || !Array.isArray(configs)) {
      return { success: false, message: '无效的配置数组' };
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const config of configs) {
      if (config && config.bazi && config.birthDate) {
        const result = this.syncConfigBaziToCache(config);
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
}

// 创建单例实例
export const baziCacheManager = new BaziCacheManager();

export default BaziCacheManager;
