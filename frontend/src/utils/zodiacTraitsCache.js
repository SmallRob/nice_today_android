/**
 * 星座特质信息缓存管理器
 * 用于缓存星座的特质、描述、名人例子等信息，避免重复计算
 */

// 缓存键前缀
const ZODIAC_TRAITS_CACHE_PREFIX = 'zodiac_traits_cache_';

// 缓存有效期（一周，7天）
const ZODIAC_TRAITS_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * 生成缓存键
 */
const generateZodiacTraitsCacheKey = (zodiacName) => {
  return `${ZODIAC_TRAITS_CACHE_PREFIX}${zodiacName}`;
};

/**
 * 检查缓存是否有效
 */
const isZodiacTraitsCacheValid = (cachedData) => {
  if (!cachedData || !cachedData.timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  
  return cacheAge < ZODIAC_TRAITS_CACHE_EXPIRY;
};

/**
 * 获取缓存的星座特质数据
 */
export const getCachedZodiacTraitsData = (zodiacName) => {
  try {
    const cacheKey = generateZodiacTraitsCacheKey(zodiacName);
    const cached = localStorage.getItem(cacheKey);
      
    if (!cached) return null;
      
    const parsedData = JSON.parse(cached);
      
    if (isZodiacTraitsCacheValid(parsedData)) {
      console.log(`使用缓存的${zodiacName}特质数据`);
      return parsedData.data;
    } else {
      // 缓存过期，清除
      localStorage.removeItem(cacheKey);
      console.log(`清除过期的${zodiacName}特质缓存`);
      return null;
    }
  } catch (error) {
    console.error('获取星座特质缓存数据失败:', error);
    return null;
  }
};

/**
 * 设置缓存的星座特质数据
 */
export const setCachedZodiacTraitsData = (zodiacName, data) => {
  try {
    const cacheKey = generateZodiacTraitsCacheKey(zodiacName);
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`保存${zodiacName}特质数据到缓存`);
    return true;
  } catch (error) {
    console.error('设置星座特质缓存数据失败:', error);
    return false;
  }
};

/**
 * 清除特定星座的特质缓存
 */
export const clearZodiacTraitsCache = (zodiacName) => {
  try {
    const cacheKey = generateZodiacTraitsCacheKey(zodiacName);
    localStorage.removeItem(cacheKey);
    console.log(`清除${zodiacName}特质缓存`);
    return true;
  } catch (error) {
    console.error('清除星座特质缓存失败:', error);
    return false;
  }
};

/**
 * 清理所有过期的星座特质缓存
 */
export const cleanupExpiredZodiacTraitsCache = () => {
  const now = Date.now();
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(ZODIAC_TRAITS_CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        const parsedData = JSON.parse(cached);
        
        const cacheAge = now - parsedData.timestamp;
        if (cacheAge >= ZODIAC_TRAITS_CACHE_EXPIRY) {
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
    console.log(`清理过期的星座特质缓存: ${key}`);
  });
  
  return keysToRemove.length;
};

// 获取当前用户标识的辅助函数
const getCurrentUserIdentifier = () => {
  // 从全局配置管理器获取当前用户信息作为标识符
  try {
    // 尝试从localStorage获取当前活跃配置信息
    const configData = localStorage.getItem('nice_today_user_configs_v2');
    if (configData) {
      const parsed = JSON.parse(configData);
      // 使用配置的索引和最后修改时间作为用户标识符
      return parsed.activeConfigIndex !== undefined ? 
        `user_${parsed.activeConfigIndex}` : 'default_user';
    }
  } catch (error) {
    console.warn('获取用户标识符失败:', error);
  }
  
  return 'default_user';
};

/**
 * 清除特定用户的星座特质缓存
 */
export const clearUserZodiacTraitsCache = (userId = null) => {
  const userIdentifier = userId || getCurrentUserIdentifier();
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(ZODIAC_TRAITS_CACHE_PREFIX)) {
      // 对于当前实现，我们清除所有星座特质缓存
      // 在更复杂的实现中，我们可能会在缓存键中包含用户ID
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`清除用户${userIdentifier}的星座特质缓存: ${key}`);
  });
  
  return keysToRemove.length;
};

/**
 * 当用户切换或星座信息改变时清除相关缓存
 */
export const handleUserZodiacChange = (oldZodiac = null, newZodiac = null) => {
  console.log('处理用户星座信息变更:', { oldZodiac, newZodiac });
  
  if (oldZodiac && newZodiac && oldZodiac !== newZodiac) {
    // 如果星座发生变化，清除旧星座的缓存
    clearZodiacTraitsCache(oldZodiac);
    console.log(`清除旧星座${oldZodiac}的缓存`);
  } else if (newZodiac && !oldZodiac) {
    // 如果是新设置星座，也考虑清除可能的相关缓存
    console.log(`设置新星座${newZodiac}，保留其他缓存`);
  }
  
  // 注意：我们不会清除新星座的缓存，因为可能还没有为新星座创建缓存
  // 但我们会清除所有星座的缓存以确保一致性
  if (oldZodiac || newZodiac) {
    // 如果有任何星座变化，清除所有星座特质缓存
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ZODIAC_TRAITS_CACHE_PREFIX)) {
        allKeys.push(key);
      }
    }
    
    allKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`清除星座特质缓存: ${key}`);
    });
    
    return allKeys.length;
  }
  
  return 0;
};

/**
 * 清除所有星座特质缓存
 */
export const clearAllZodiacTraitsCache = () => {
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(ZODIAC_TRAITS_CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`清除所有星座特质缓存: ${key}`);
  });
  
  return keysToRemove.length;
};

export default {
  getCachedZodiacTraitsData,
  setCachedZodiacTraitsData,
  clearZodiacTraitsCache,
  cleanupExpiredZodiacTraitsCache,
  clearUserZodiacTraitsCache,
  handleUserZodiacChange,
  clearAllZodiacTraitsCache
};