/**
 * 并发锁管理器
 * 提供互斥锁机制，保护关键操作的并发访问
 */

class ConcurrencyLock {
  constructor() {
    this.locks = new Map(); // 锁的存储
    this.lockTimeout = 30000; // 锁超时时间（毫秒）
    this.retryInterval = 100; // 重试间隔（毫秒）
    this.maxRetries = 300; // 最大重试次数（30秒）
  }

  /**
   * 获取锁
   * @param {string} lockKey - 锁的键
   * @param {Object} options - 选项
   * @returns {Promise<boolean>} 是否获取成功
   */
  async acquire(lockKey, options = {}) {
    const timeout = options.timeout || this.lockTimeout;
    const maxRetries = Math.floor(timeout / this.retryInterval);

    for (let i = 0; i < maxRetries; i++) {
      // 检查锁是否已存在
      const lock = this.locks.get(lockKey);

      if (!lock) {
        // 锁不存在，创建新锁
        this.locks.set(lockKey, {
          acquiredAt: Date.now(),
          owner: options.owner || 'unknown'
        });
        return true;
      }

      // 检查锁是否超时
      if (Date.now() - lock.acquiredAt > this.lockTimeout) {
        // 锁超时，强制释放
        this.locks.delete(lockKey);
        continue;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, this.retryInterval));
    }

    // 获取锁失败
    throw new Error(`获取锁失败: ${lockKey} (超时 ${timeout}ms)`);
  }

  /**
   * 释放锁
   * @param {string} lockKey - 锁的键
   * @param {Object} options - 选项
   */
  release(lockKey, options = {}) {
    const lock = this.locks.get(lockKey);

    if (!lock) {
      console.warn(`尝试释放不存在的锁: ${lockKey}`);
      return false;
    }

    // 验证锁的所有者（如果指定）
    if (options.owner && lock.owner !== options.owner) {
      console.warn(`锁的所有者不匹配: ${lockKey}`);
      return false;
    }

    this.locks.delete(lockKey);
    return true;
  }

  /**
   * 执行带锁的操作
   * @param {string} lockKey - 锁的键
   * @param {Function} operation - 要执行的操作
   * @param {Object} options - 选项
   * @returns {Promise<any>} 操作结果
   */
  async withLock(lockKey, operation, options = {}) {
    const lockOwner = options.owner || `operation-${Date.now()}`;
    let acquired = false;

    try {
      // 获取锁
      acquired = await this.acquire(lockKey, { ...options, owner: lockOwner });

      if (!acquired) {
        throw new Error(`无法获取锁: ${lockKey}`);
      }

      // 执行操作
      return await operation();
    } finally {
      // 释放锁
      if (acquired) {
        this.release(lockKey, { owner: lockOwner });
      }
    }
  }

  /**
   * 检查锁是否存在
   * @param {string} lockKey - 锁的键
   * @returns {boolean} 锁是否存在
   */
  isLocked(lockKey) {
    const lock = this.locks.get(lockKey);
    if (!lock) return false;

    // 检查锁是否超时
    if (Date.now() - lock.acquiredAt > this.lockTimeout) {
      this.locks.delete(lockKey);
      return false;
    }

    return true;
  }

  /**
   * 获取所有锁的状态
   * @returns {Array} 锁的状态列表
   */
  getLockStatus() {
    const status = [];
    for (const [key, lock] of this.locks.entries()) {
      status.push({
        key,
        owner: lock.owner,
        acquiredAt: new Date(lock.acquiredAt).toISOString(),
        age: Date.now() - lock.acquiredAt
      });
    }
    return status;
  }

  /**
   * 清理所有超时的锁
   */
  cleanupExpiredLocks() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, lock] of this.locks.entries()) {
      if (now - lock.acquiredAt > this.lockTimeout) {
        this.locks.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`清理了 ${cleanedCount} 个超时的锁`);
    }

    return cleanedCount;
  }

  /**
   * 强制释放所有锁（慎用）
   */
  forceReleaseAll() {
    const count = this.locks.size;
    this.locks.clear();
    console.warn(`强制释放了 ${count} 个锁`);
    return count;
  }
}

export const concurrencyLock = new ConcurrencyLock();
export default ConcurrencyLock;
