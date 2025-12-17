/**
 * 数据迁移兼容性工具
 * 解决应用包名变更导致的localStorage数据丢失问题
 */

// 旧应用包名和新应用包名的localStorage键名映射
const STORAGE_KEY_MAPPINGS = {
  // 旧键名: 新键名
  'last_biorhythm_birthdate': 'last_biorhythm_birthdate',
  'mayaCalendarHistory': 'mayaCalendarHistory',
  'theme': 'theme',
  'user_preferences': 'user_preferences',
  'biorhythm_birth_date': 'biorhythm_birth_date',
  'dress_info_history': 'dress_info_history'
};

// 旧应用包名
const OLD_APP_PREFIX = 'com.biorhythm.app';
const NEW_APP_PREFIX = 'com.nicetoday.app';

/**
 * 检查并迁移旧数据
 */
export const migrateOldData = () => {
  try {
    console.log('开始数据迁移检查...');
    
    let migratedCount = 0;
    
    // 检查每个键的旧数据
    for (const [oldKey, newKey] of Object.entries(STORAGE_KEY_MAPPINGS)) {
      const oldData = localStorage.getItem(oldKey);
      const newData = localStorage.getItem(newKey);
      
      // 如果新数据不存在但旧数据存在，则迁移数据
      if (!newData && oldData) {
        localStorage.setItem(newKey, oldData);
        console.log(`数据迁移成功: ${oldKey} -> ${newKey}`);
        migratedCount++;
      }
    }
    
    // 检查旧应用前缀的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(OLD_APP_PREFIX)) {
        const newKey = key.replace(OLD_APP_PREFIX, NEW_APP_PREFIX);
        const oldData = localStorage.getItem(key);
        const newData = localStorage.getItem(newKey);
        
        if (!newData && oldData) {
          localStorage.setItem(newKey, oldData);
          console.log(`数据迁移成功: ${key} -> ${newKey}`);
          migratedCount++;
        }
      }
    }
    
    if (migratedCount > 0) {
      console.log(`数据迁移完成，共迁移了 ${migratedCount} 项数据`);
    } else {
      console.log('未发现需要迁移的数据');
    }
    
    return migratedCount;
  } catch (error) {
    console.error('数据迁移过程中发生错误:', error);
    return 0;
  }
};

/**
 * 数据兼容性包装器
 * 提供向后兼容的数据访问接口
 */
export const CompatibleStorage = {
  /**
   * 获取数据（支持新旧键名）
   */
  getItem: (key) => {
    try {
      // 首先尝试新键名
      let data = localStorage.getItem(key);
      
      // 如果新键名没有数据，检查旧键名
      if (!data && STORAGE_KEY_MAPPINGS[key]) {
        const oldKey = Object.keys(STORAGE_KEY_MAPPINGS).find(
          k => STORAGE_KEY_MAPPINGS[k] === key
        );
        if (oldKey) {
          data = localStorage.getItem(oldKey);
          // 如果找到旧数据，自动迁移
          if (data) {
            localStorage.setItem(key, data);
            console.log(`自动迁移数据: ${oldKey} -> ${key}`);
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error(`获取数据失败 (${key}):`, error);
      return null;
    }
  },
  
  /**
   * 设置数据
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`设置数据失败 (${key}):`, error);
      return false;
    }
  },
  
  /**
   * 删除数据
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      
      // 同时删除可能的旧键名数据
      if (STORAGE_KEY_MAPPINGS[key]) {
        const oldKey = Object.keys(STORAGE_KEY_MAPPINGS).find(
          k => STORAGE_KEY_MAPPINGS[k] === key
        );
        if (oldKey) {
          localStorage.removeItem(oldKey);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`删除数据失败 (${key}):`, error);
      return false;
    }
  },
  
  /**
   * 清除所有应用数据
   */
  clear: () => {
    try {
      // 只清除与当前应用相关的数据
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // 删除新应用前缀的数据
          if (key.startsWith(NEW_APP_PREFIX)) {
            keysToRemove.push(key);
          }
          // 删除旧应用前缀的数据
          if (key.startsWith(OLD_APP_PREFIX)) {
            keysToRemove.push(key);
          }
          // 删除映射的键
          if (Object.values(STORAGE_KEY_MAPPINGS).includes(key) || 
              Object.keys(STORAGE_KEY_MAPPINGS).includes(key)) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`已清除 ${keysToRemove.length} 项应用数据`);
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }
};

/**
 * 初始化数据迁移
 * 在应用启动时调用
 */
export const initDataMigration = () => {
  // 检查是否需要迁移数据
  const migratedCount = migrateOldData();
  
  // 设置全局错误处理，避免数据操作导致的闪退
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('localStorage') || 
           event.error.message.includes('QuotaExceededError'))) {
        console.warn('localStorage操作失败，应用将继续运行:', event.error.message);
        event.preventDefault();
      }
    });
  }
  
  return migratedCount;
};

export default {
  migrateOldData,
  CompatibleStorage,
  initDataMigration
};