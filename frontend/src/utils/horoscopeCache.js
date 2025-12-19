/**
 * 星座运势缓存管理器
 * 支持心灵问答、运势数据的缓存和每日唯一性验证
 */

// 缓存键前缀
const CACHE_PREFIX = 'horoscope_cache_';

// 缓存有效期（24小时）
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * 生成缓存键
 */
const generateCacheKey = (horoscopeName, type, date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  return `${CACHE_PREFIX}${horoscopeName}_${type}_${dateStr}`;
};

/**
 * 检查缓存是否有效
 */
const isCacheValid = (cachedData) => {
  if (!cachedData || !cachedData.timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  
  return cacheAge < CACHE_EXPIRY;
};

/**
 * 获取缓存数据
 */
export const getCachedHoroscopeData = (horoscopeName, type = 'daily', date = new Date()) => {
  try {
    const cacheKey = generateCacheKey(horoscopeName, type, date);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const parsedData = JSON.parse(cached);
    
    if (isCacheValid(parsedData)) {
      return parsedData.data;
    } else {
      // 缓存过期，清除
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.error('获取缓存数据失败:', error);
    return null;
  }
};

/**
 * 设置缓存数据
 */
export const setCachedHoroscopeData = (horoscopeName, data, type = 'daily', date = new Date()) => {
  try {
    const cacheKey = generateCacheKey(horoscopeName, type, date);
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      dailyId: data.dailyId || `${horoscopeName}_${date.toISOString().split('T')[0]}`
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error('设置缓存数据失败:', error);
    return false;
  }
};

/**
 * 清除特定缓存
 */
export const clearHoroscopeCache = (horoscopeName, type = null, date = null) => {
  try {
    if (type && date) {
      // 清除特定缓存
      const cacheKey = generateCacheKey(horoscopeName, type, date);
      localStorage.removeItem(cacheKey);
    } else if (type) {
      // 清除特定类型的所有缓存
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CACHE_PREFIX}${horoscopeName}_${type}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // 清除该星座的所有缓存
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CACHE_PREFIX}${horoscopeName}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    return true;
  } catch (error) {
    console.error('清除缓存失败:', error);
    return false;
  }
};

/**
 * 获取今日运势数据（带缓存）
 */
export const getDailyHoroscopeWithCache = async (horoscopeName, date = new Date(), algorithm) => {
  // 首先尝试从缓存获取
  const cachedData = getCachedHoroscopeData(horoscopeName, 'daily', date);
  
  if (cachedData) {
    console.log('使用缓存的运势数据');
    return cachedData;
  }
  
  // 缓存不存在或过期，生成新数据
  console.log('生成新的运势数据');
  const newData = algorithm.generateDailyHoroscope(horoscopeName, date);
  
  if (newData) {
    // 保存到缓存
    setCachedHoroscopeData(horoscopeName, newData, 'daily', date);
  }
  
  return newData;
};

/**
 * 获取心灵问答（带缓存）
 */
export const getSoulQuestionWithCache = async (horoscopeName, date = new Date(), algorithm) => {
  // 首先尝试从缓存获取
  const cachedQuestion = getCachedHoroscopeData(horoscopeName, 'soul_question', date);
  
  if (cachedQuestion) {
    console.log('使用缓存的心灵问答');
    return cachedQuestion;
  }
  
  // 缓存不存在或过期，生成新问答
  console.log('生成新的心灵问答');
  const newQuestion = algorithm.generateSoulQuestion(horoscopeName, date);
  
  if (newQuestion) {
    // 保存到缓存
    setCachedHoroscopeData(horoscopeName, newQuestion, 'soul_question', date);
  }
  
  return newQuestion;
};

/**
 * 获取幸运物品（带缓存）
 */
export const getLuckyItemWithCache = async (horoscopeName, date = new Date(), algorithm) => {
  // 首先尝试从缓存获取
  const cachedItem = getCachedHoroscopeData(horoscopeName, 'lucky_item', date);
  
  if (cachedItem) {
    console.log('使用缓存的幸运物品');
    return cachedItem;
  }
  
  // 缓存不存在或过期，生成新物品
  console.log('生成新的幸运物品');
  const newItem = algorithm.generateLuckyItem(horoscopeName, date);
  
  if (newItem) {
    // 保存到缓存
    setCachedHoroscopeData(horoscopeName, newItem, 'lucky_item', date);
  }
  
  return newItem;
};

/**
 * 检查今日数据是否已生成
 */
export const isTodayDataGenerated = (horoscopeName, date = new Date()) => {
  const cacheKey = generateCacheKey(horoscopeName, 'daily', date);
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return false;
  
  try {
    const parsedData = JSON.parse(cached);
    return isCacheValid(parsedData);
  } catch (error) {
    return false;
  }
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = () => {
  const stats = {
    total: 0,
    valid: 0,
    expired: 0,
    byHoroscope: {},
    byType: {}
  };
  
  const now = Date.now();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(CACHE_PREFIX)) {
      stats.total++;
      
      try {
        const cached = localStorage.getItem(key);
        const parsedData = JSON.parse(cached);
        
        const cacheAge = now - parsedData.timestamp;
        const isValid = cacheAge < CACHE_EXPIRY;
        
        if (isValid) {
          stats.valid++;
        } else {
          stats.expired++;
        }
        
        // 解析键名获取星座和类型信息
        const parts = key.replace(CACHE_PREFIX, '').split('_');
        if (parts.length >= 3) {
          const horoscope = parts[0];
          const type = parts[1];
          
          // 统计星座分布
          stats.byHoroscope[horoscope] = (stats.byHoroscope[horoscope] || 0) + 1;
          
          // 统计类型分布
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        }
      } catch (error) {
        console.error('解析缓存数据失败:', error);
      }
    }
  }
  
  return stats;
};

/**
 * 清理所有过期缓存
 */
export const cleanupExpiredCache = () => {
  const now = Date.now();
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        const parsedData = JSON.parse(cached);
        
        const cacheAge = now - parsedData.timestamp;
        if (cacheAge >= CACHE_EXPIRY) {
          keysToRemove.push(key);
        }
      } catch (error) {
        // 解析失败的数据也视为过期
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`清理过期缓存: ${key}`);
  });
  
  return keysToRemove.length;
};

/**
 * 缓存管理器初始化
 */
export const initializeHoroscopeCache = () => {
  // 应用启动时清理过期缓存
  const cleanedCount = cleanupExpiredCache();
  console.log(`缓存管理器初始化完成，清理了 ${cleanedCount} 个过期缓存`);
  
  // 设置定期清理任务（每6小时清理一次）
  setInterval(cleanupExpiredCache, 6 * 60 * 60 * 1000);
  
  return {
    cleanedCount,
    stats: getCacheStats()
  };
};

export default {
  getCachedHoroscopeData,
  setCachedHoroscopeData,
  clearHoroscopeCache,
  getDailyHoroscopeWithCache,
  getSoulQuestionWithCache,
  getLuckyItemWithCache,
  isTodayDataGenerated,
  getCacheStats,
  cleanupExpiredCache,
  initializeHoroscopeCache
};