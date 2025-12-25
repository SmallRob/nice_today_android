/**
 * 异步操作队列管理器
 * 确保操作按序执行，实现乐观更新和错误回滚机制
 */
class AsyncOperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒后重试
  }

  /**
   * 添加操作到队列
   * @param {Function} operation - 异步操作函数
   * @param {string} operationType - 操作类型（如 'save', 'delete', 'update'）
   * @param {any} operationData - 操作数据
   * @param {Object} optimisticUpdate - 乐观更新数据
   * @returns {Promise} 操作结果
   */
  async enqueue(operation, operationType, operationData, optimisticUpdate = null) {
    return new Promise((resolve, reject) => {
      const queueItem = {
        id: this.generateId(),
        operation,
        operationType,
        operationData,
        optimisticUpdate,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0
      };

      this.queue.push(queueItem);
      this.processQueue();
    });
  }

  /**
   * 处理队列中的操作
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const queueItem = this.queue.shift();

      try {
        // 执行操作
        const result = await this.executeOperation(queueItem);
        queueItem.resolve(result);
      } catch (error) {
        // 如果操作失败且还有重试次数，重新加入队列
        if (queueItem.retryCount < this.maxRetries) {
          queueItem.retryCount++;
          setTimeout(() => {
            this.queue.unshift(queueItem); // 重新加入队列前端
            this.processQueue(); // 重新开始处理
          }, this.retryDelay * queueItem.retryCount); // 递增延迟
          return; // 暂停当前处理，等待重试
        } else {
          queueItem.reject(error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * 执行单个操作
   */
  async executeOperation(queueItem) {
    // 如果提供了乐观更新数据，先执行乐观更新
    if (queueItem.optimisticUpdate && this.onOptimisticUpdate) {
      this.onOptimisticUpdate(queueItem.operationType, queueItem.optimisticUpdate);
    }

    try {
      const result = await queueItem.operation(queueItem.operationData);
      
      // 操作成功后，如果需要执行后续操作
      if (this.onOperationSuccess) {
        this.onOperationSuccess(queueItem.operationType, queueItem.operationData, result);
      }
      
      return result;
    } catch (error) {
      // 操作失败，执行回滚
      if (this.onRollback && queueItem.optimisticUpdate) {
        this.onRollback(queueItem.operationType, queueItem.optimisticUpdate, error);
      }
      
      throw error;
    }
  }

  /**
   * 设置乐观更新回调
   */
  setOptimisticUpdateCallback(callback) {
    this.onOptimisticUpdate = callback;
  }

  /**
   * 设置操作成功回调
   */
  setOperationSuccessCallback(callback) {
    this.onOperationSuccess = callback;
  }

  /**
   * 设置回滚回调
   */
  setRollbackCallback(callback) {
    this.onRollback = callback;
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 获取队列长度
   */
  getQueueLength() {
    return this.queue.length;
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }
}

// 创建全局实例
const asyncOperationQueue = new AsyncOperationQueue();

export default asyncOperationQueue;