/**
 * 操作日志管理器
 * 负责记录系统操作日志，便于追踪和调试
 */

class OperationLogger {
  constructor() {
    this.logs = [];
    this.maxLogSize = 1000; // 最大日志数量
    this.logRetentionDays = 30; // 日志保留天数
  }

  /**
   * 记录日志
   * @param {string} level - 日志级别 (info, warn, error, success)
   * @param {string} operation - 操作名称
   * @param {Object} details - 详细信息
   */
  log(level, operation, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      details,
      id: this.generateLogId()
    };

    this.logs.push(logEntry);

    // 如果日志超过最大数量，删除最旧的日志
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }

    // 控制台输出
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'success' ? console.log :
                         console.info;
    consoleMethod(`[${level.toUpperCase()}] ${operation}:`, details);

    // 持久化日志
    this.persistLogs();

    return logEntry.id;
  }

  /**
   * 生成唯一日志ID
   */
  generateLogId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取日志
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的日志
   */
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    // 按时间范围过滤
    if (filters.startTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startTime));
    }
    if (filters.endTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endTime));
    }

    // 按级别过滤
    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    // 按操作类型过滤
    if (filters.operation) {
      filteredLogs = filteredLogs.filter(log => log.operation === filters.operation);
    }

    return filteredLogs;
  }

  /**
   * 获取最新的N条日志
   * @param {number} count - 日志数量
   * @returns {Array} 最新的日志
   */
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  /**
   * 获取错误日志
   * @returns {Array} 错误日志
   */
  getErrorLogs() {
    return this.logs.filter(log => log.level === 'error');
  }

  /**
   * 清理过期日志
   */
  cleanExpiredLogs() {
    const now = new Date();
    const retentionDate = new Date(now.getTime() - this.logRetentionDays * 24 * 60 * 60 * 1000);

    const beforeCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= retentionDate);
    const afterCount = this.logs.length;

    if (beforeCount > afterCount) {
      this.log('info', 'LOG_CLEANUP', {
        deletedCount: beforeCount - afterCount,
        remainingCount: afterCount
      });
    }
  }

  /**
   * 持久化日志到本地存储
   */
  persistLogs() {
    try {
      // 只保存最近100条日志到本地存储，避免占用过多空间
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('operation_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('持久化日志失败:', error);
    }
  }

  /**
   * 从本地存储加载日志
   */
  loadPersistedLogs() {
    try {
      const persistedLogs = localStorage.getItem('operation_logs');
      if (persistedLogs) {
        const logs = JSON.parse(persistedLogs);
        this.logs = logs;
      }
    } catch (error) {
      console.error('加载持久化日志失败:', error);
      this.logs = [];
    }
  }

  /**
   * 导出日志
   * @returns {string} JSON格式的日志
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('operation_logs');
    this.log('info', 'LOG_CLEARED', { message: '所有日志已清空' });
  }
}

export const operationLogger = new OperationLogger();
export default OperationLogger;
