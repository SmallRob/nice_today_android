/**
 * 存储服务
 * 提供统一的 localStorage 访问接口，支持数据迁移和版本管理
 */

const STORAGE_PREFIX = 'nice_today_';

export const storageService = {
  /**
   * 同步获取存储项
   */
  getItemSync<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  /**
   * 设置存储项
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('[StorageService] Failed to save:', key, e);
    }
  },

  /**
   * 移除存储项
   */
  removeItem(key: string, version?: string): void {
    const fullKey = STORAGE_PREFIX + key + (version ? `_v${version}` : '');
    localStorage.removeItem(fullKey);
  },

  /**
   * 数据迁移
   * 将旧 key 的数据迁移到新 key
   */
  migrate(oldKey: string, newKey: string, version?: string): void {
    const fullOldKey = STORAGE_PREFIX + oldKey;
    const fullNewKey = STORAGE_PREFIX + newKey + (version ? `_v${version}` : '');

    const oldValue = localStorage.getItem(fullOldKey);
    if (oldValue !== null && localStorage.getItem(fullNewKey) === null) {
      localStorage.setItem(fullNewKey, oldValue);
      localStorage.removeItem(fullOldKey);
      console.log(`[StorageService] Migrated: ${oldKey} -> ${newKey}`);
    }
  },

  /**
   * 检查存储项是否存在
   */
  hasItem(key: string, version?: string): boolean {
    const fullKey = STORAGE_PREFIX + key + (version ? `_v${version}` : '');
    return localStorage.getItem(fullKey) !== null;
  },

  /**
   * 获取所有存储项的 key
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  },

  /**
   * 清除所有应用存储
   */
  clearAll(): void {
    const keys = this.getAllKeys();
    keys.forEach((key) => {
      localStorage.removeItem(STORAGE_PREFIX + key);
    });
  },
};
