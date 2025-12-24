/**
 * 数据持久化管理器
 * 实现多级缓存策略和可靠的数据持久化
 * 支持内存缓存、本地存储、备份机制
 */

// 存储策略常量
const STORAGE_STRATEGIES = {
  MEMORY_ONLY: 'memory_only',      // 仅内存缓存
  LOCAL_STORAGE: 'local_storage',  // 本地存储
  BACKUP: 'backup',                // 备份存储
  ALL: 'all'                       // 所有存储
};

// 缓存策略配置
const CACHE_CONFIG = {
  // 内存缓存配置
  memory: {
    defaultExpiry: 5 * 60 * 1000, // 5分钟
    maxSize: 100,                 // 最大缓存项数
    cleanupInterval: 60 * 1000    // 清理间隔
  },
  
  // 本地存储配置
  localStorage: {
    prefix: 'nice_today_cache_',
    version: 'v2',
    backupEnabled: true,
    backupInterval: 30 * 60 * 1000 // 30分钟备份一次
  },
  
  // 备份配置
  backup: {
    maxBackups: 3,                // 最大备份数量
    backupExpiry: 7 * 24 * 60 * 60 * 1000 // 7天过期
  }
};

// 错误类型
class PersistenceError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'PersistenceError';
    this.code = code;
    this.details = details;
  }
}

// 内存缓存管理器
class MemoryCacheManager {
  constructor() {
    this.cache = new Map();
    this.size = 0;
    this.maxSize = CACHE_CONFIG.memory.maxSize;
    this.cleanupTimer = null;
    
    this.startCleanup();
  }

  /**
   * 设置缓存
   */
  set(key, value, expiry = CACHE_CONFIG.memory.defaultExpiry) {
    const cacheItem = {
      value,
      expiry: Date.now() + expiry,
      timestamp: Date.now(),
      accessCount: 0
    };

    // 检查是否超过最大大小
    if (this.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, cacheItem);
    this.size++;
    
    return true;
  }

  /**
   * 获取缓存
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.size--;
      return null;
    }
    
    // 更新访问统计
    item.accessCount++;
    item.lastAccess = Date.now();
    
    return item.value;
  }

  /**
   * 删除缓存
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.size--;
      return true;
    }
    return false;
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear();
    this.size = 0;
  }

  /**
   * 淘汰最旧的缓存项
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.size--;
    }
  }

  /**
   * 开始定期清理
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, CACHE_CONFIG.memory.cleanupInterval);
  }

  /**
   * 停止清理
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 清理过期缓存
   */
  cleanupExpired() {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        this.size--;
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`清理了 ${deletedCount} 个过期缓存项`);
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 本地存储管理器
class LocalStorageManager {
  constructor() {
    this.prefix = CACHE_CONFIG.localStorage.prefix + CACHE_CONFIG.localStorage.version + '_';
    this.backupEnabled = CACHE_CONFIG.localStorage.backupEnabled;
  }

  /**
   * 获取完整的键名
   */
  getFullKey(key) {
    return this.prefix + key;
  }

  /**
   * 安全设置存储项
   */
  set(key, value) {
    try {
      const fullKey = this.getFullKey(key);
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now(),
        version: CACHE_CONFIG.localStorage.version
      });
      
      localStorage.setItem(fullKey, serializedValue);
      
      // 验证写入
      const stored = localStorage.getItem(fullKey);
      if (stored !== serializedValue) {
        throw new PersistenceError('存储验证失败', 'STORAGE_VERIFICATION_FAILED');
      }
      
      return true;
    } catch (error) {
      throw new PersistenceError(`本地存储设置失败: ${key}`, 'LOCAL_STORAGE_SET_ERROR', error.message);
    }
  }

  /**
   * 安全获取存储项
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this.getFullKey(key);
      const stored = localStorage.getItem(fullKey);
      
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      
      // 检查版本兼容性
      if (parsed.version !== CACHE_CONFIG.localStorage.version) {
        console.warn(`存储项 ${key} 版本不匹配，已清除`);
        this.delete(key);
        return defaultValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.warn(`本地存储读取失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 删除存储项
   */
  delete(key) {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.warn(`本地存储删除失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 批量操作（事务性）
   */
  batch(operations) {
    const backup = {};
    
    try {
      // 备份当前数据
      operations.forEach(({ key }) => {
        const fullKey = this.getFullKey(key);
        backup[fullKey] = localStorage.getItem(fullKey);
      });
      
      // 执行操作
      operations.forEach(({ type, key, value }) => {
        const fullKey = this.getFullKey(key);
        
        switch (type) {
          case 'set':
            this.set(key, value);
            break;
          case 'delete':
            this.delete(key);
            break;
          default:
            throw new PersistenceError(`未知的操作类型: ${type}`, 'UNKNOWN_OPERATION');
        }
      });
      
      return true;
    } catch (error) {
      // 回滚操作
      Object.entries(backup).forEach(([key, value]) => {
        try {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
        } catch (rollbackError) {
          console.error('回滚操作失败:', rollbackError);
        }
      });
      
      throw error;
    }
  }

  /**
   * 获取所有键名
   */
  getAllKeys() {
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    
    return keys;
  }

  /**
   * 清理过期数据
   */
  cleanupExpired(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now();
    let deletedCount = 0;
    
    this.getAllKeys().forEach(key => {
      try {
        const stored = localStorage.getItem(this.getFullKey(key));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (now - parsed.timestamp > maxAge) {
            this.delete(key);
            deletedCount++;
          }
        }
      } catch (error) {
        console.warn(`清理存储项 ${key} 失败:`, error);
      }
    });
    
    return deletedCount;
  }
}

// 备份管理器
class BackupManager {
  constructor() {
    this.backupPrefix = 'nice_today_backup_';
    this.maxBackups = CACHE_CONFIG.backup.maxBackups;
  }

  /**
   * 创建备份
   */
  createBackup(key, data) {
    try {
      const timestamp = Date.now();
      const backupKey = `${this.backupPrefix}${key}_${timestamp}`;
      
      const backupData = {
        data,
        timestamp,
        expiry: timestamp + CACHE_CONFIG.backup.backupExpiry,
        version: CACHE_CONFIG.localStorage.version
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // 清理过期备份
      this.cleanupExpiredBackups(key);
      
      return true;
    } catch (error) {
      console.warn(`创建备份失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 恢复备份
   */
  restoreBackup(key) {
    try {
      const backups = this.getBackups(key);
      
      if (backups.length === 0) {
        return null;
      }
      
      // 使用最新的备份
      const latestBackup = backups[0];
      
      // 检查备份是否过期
      if (Date.now() > latestBackup.expiry) {
        console.warn(`备份 ${key} 已过期`);
        this.deleteBackup(latestBackup.key);
        return null;
      }
      
      return latestBackup.data;
    } catch (error) {
      console.warn(`恢复备份失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 获取所有备份
   */
  getBackups(key) {
    const backups = [];
    const prefix = `${this.backupPrefix}${key}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(prefix)) {
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const backup = JSON.parse(stored);
            backups.push({
              key: storageKey,
              ...backup
            });
          }
        } catch (error) {
          console.warn(`解析备份失败: ${storageKey}`, error);
        }
      }
    }
    
    // 按时间戳排序（最新的在前）
    backups.sort((a, b) => b.timestamp - a.timestamp);
    
    return backups;
  }

  /**
   * 删除备份
   */
  deleteBackup(backupKey) {
    try {
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.warn(`删除备份失败: ${backupKey}`, error);
      return false;
    }
  }

  /**
   * 清理过期备份
   */
  cleanupExpiredBackups(key) {
    const backups = this.getBackups(key);
    const now = Date.now();
    let deletedCount = 0;
    
    // 删除过期备份
    backups.forEach(backup => {
      if (now > backup.expiry) {
        this.deleteBackup(backup.key);
        deletedCount++;
      }
    });
    
    // 限制备份数量
    if (backups.length - deletedCount > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      toDelete.forEach(backup => {
        this.deleteBackup(backup.key);
        deletedCount++;
      });
    }
    
    return deletedCount;
  }
}

// 主数据持久化管理器
class DataPersistenceManager {
  constructor() {
    this.memoryCache = new MemoryCacheManager();
    this.localStorage = new LocalStorageManager();
    this.backupManager = new BackupManager();
    this.syncInProgress = false;
  }

  /**
   * 初始化数据持久化管理器
   * 执行必要的初始化操作
   */
  async initialize() {
    try {
      // 确保内存缓存、本地存储和备份管理器已准备好
      // 目前这些组件在构造函数中已经创建，所以只需返回成功
      console.log('数据持久化管理器初始化完成');
      return true;
    } catch (error) {
      console.error('数据持久化管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置数据（多级存储）
   */
  async set(key, value, strategy = STORAGE_STRATEGIES.ALL) {
    try {
      // 内存缓存
      if (strategy === STORAGE_STRATEGIES.MEMORY_ONLY || strategy === STORAGE_STRATEGIES.ALL) {
        this.memoryCache.set(key, value);
      }
      
      // 本地存储
      if (strategy === STORAGE_STRATEGIES.LOCAL_STORAGE || strategy === STORAGE_STRATEGIES.ALL) {
        this.localStorage.set(key, value);
      }
      
      // 备份
      if ((strategy === STORAGE_STRATEGIES.BACKUP || strategy === STORAGE_STRATEGIES.ALL) && 
          CACHE_CONFIG.localStorage.backupEnabled) {
        this.backupManager.createBackup(key, value);
      }
      
      return true;
    } catch (error) {
      console.error(`设置数据失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取数据（多级读取）
   */
  async get(key, defaultValue = null, strategy = STORAGE_STRATEGIES.ALL) {
    try {
      // 首先检查内存缓存
      if (strategy === STORAGE_STRATEGIES.MEMORY_ONLY || strategy === STORAGE_STRATEGIES.ALL) {
        const memoryValue = this.memoryCache.get(key);
        if (memoryValue !== null) {
          return memoryValue;
        }
      }
      
      // 然后检查本地存储
      if (strategy === STORAGE_STRATEGIES.LOCAL_STORAGE || strategy === STORAGE_STRATEGIES.ALL) {
        const localStorageValue = this.localStorage.get(key);
        if (localStorageValue !== null) {
          // 更新内存缓存
          this.memoryCache.set(key, localStorageValue);
          return localStorageValue;
        }
      }
      
      // 最后尝试从备份恢复
      if ((strategy === STORAGE_STRATEGIES.BACKUP || strategy === STORAGE_STRATEGIES.ALL) && 
          CACHE_CONFIG.localStorage.backupEnabled) {
        const backupValue = this.backupManager.restoreBackup(key);
        if (backupValue !== null) {
          // 恢复到所有存储层
          await this.set(key, backupValue, STORAGE_STRATEGIES.ALL);
          return backupValue;
        }
      }
      
      return defaultValue;
    } catch (error) {
      console.warn(`获取数据失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   */
  async delete(key, strategy = STORAGE_STRATEGIES.ALL) {
    try {
      let success = true;
      
      if (strategy === STORAGE_STRATEGIES.MEMORY_ONLY || strategy === STORAGE_STRATEGIES.ALL) {
        success = this.memoryCache.delete(key) && success;
      }
      
      if (strategy === STORAGE_STRATEGIES.LOCAL_STORAGE || strategy === STORAGE_STRATEGIES.ALL) {
        success = this.localStorage.delete(key) && success;
      }
      
      return success;
    } catch (error) {
      console.error(`删除数据失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 批量操作（事务性）
   */
  async batch(operations) {
    if (this.syncInProgress) {
      throw new PersistenceError('同步操作进行中', 'SYNC_IN_PROGRESS');
    }
    
    this.syncInProgress = true;
    
    try {
      // 执行本地存储的批量操作
      const localStorageOps = operations.map(op => ({
        type: op.type,
        key: op.key,
        value: op.value
      }));
      
      this.localStorage.batch(localStorageOps);
      
      // 更新内存缓存
      operations.forEach(op => {
        if (op.type === 'set') {
          this.memoryCache.set(op.key, op.value);
        } else if (op.type === 'delete') {
          this.memoryCache.delete(op.key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('批量操作失败:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 强制同步所有存储层
   */
  async sync() {
    if (this.syncInProgress) {
      throw new PersistenceError('同步操作进行中', 'SYNC_IN_PROGRESS');
    }
    
    this.syncInProgress = true;
    
    try {
      // 获取所有本地存储的键
      const keys = this.localStorage.getAllKeys();
      
      // 同步到内存缓存
      for (const key of keys) {
        const value = this.localStorage.get(key);
        if (value !== null) {
          this.memoryCache.set(key, value);
        }
      }
      
      console.log(`同步完成，共处理 ${keys.length} 个数据项`);
      return true;
    } catch (error) {
      console.error('同步操作失败:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 清理操作
   */
  async cleanup() {
    try {
      // 清理内存缓存
      this.memoryCache.cleanupExpired();
      
      // 清理本地存储
      const deletedCount = this.localStorage.cleanupExpired();
      
      console.log(`清理完成，删除了 ${deletedCount} 个过期数据项`);
      return deletedCount;
    } catch (error) {
      console.error('清理操作失败:', error);
      throw error;
    }
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      memoryCache: this.memoryCache.getStats(),
      localStorageKeys: this.localStorage.getAllKeys().length,
      syncInProgress: this.syncInProgress,
      backupEnabled: CACHE_CONFIG.localStorage.backupEnabled
    };
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.memoryCache.stopCleanup();
    this.memoryCache.clear();
  }
}

// 创建单例实例
const dataPersistenceManager = new DataPersistenceManager();

export default DataPersistenceManager;
export { 
  dataPersistenceManager,
  STORAGE_STRATEGIES,
  PersistenceError,
  MemoryCacheManager,
  LocalStorageManager,
  BackupManager 
};