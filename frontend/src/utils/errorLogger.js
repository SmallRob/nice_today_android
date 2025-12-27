/**
 * 错误日志管理服务
 * 统一管理应用中的错误日志，提供存储、查询和上报功能
 */

class ErrorLogger {
  constructor() {
    this.errorLogs = [];
    this.maxLogCount = 100; // 最多保存100条错误日志
    this.listeners = [];
    this.storageKey = 'nice_today_error_logs';
    
    // 初始化时从存储中加载日志
    this.loadFromStorage();
  }

  /**
   * 记录错误
   * @param {Error|string} error 错误对象或错误消息
   * @param {Object} context 错误上下文信息
   */
  log(error, context = {}) {
    const errorLog = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: this.getErrorType(error),
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context: {
        component: context.component || 'Unknown',
        action: context.action || 'Unknown',
        route: window.location.pathname,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    // 添加到日志数组
    this.errorLogs.unshift(errorLog);
    
    // 限制日志数量
    if (this.errorLogs.length > this.maxLogCount) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogCount);
    }

    // 保存到存储
    this.saveToStorage();

    // 通知监听器
    this.notifyListeners(errorLog);

    // 在开发模式下输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 [${errorLog.type}] ${errorLog.message}`);
      console.error(error);
      console.log('Context:', context);
      console.log('Error Stack:', errorLog.stack);
      console.groupEnd();
    }

    return errorLog;
  }

  /**
   * 获取错误类型
   */
  getErrorType(error) {
    if (error instanceof TypeError) return 'TypeError';
    if (error instanceof ReferenceError) return 'ReferenceError';
    if (error instanceof SyntaxError) return 'SyntaxError';
    if (error instanceof RangeError) return 'RangeError';
    if (error.name === 'ChunkLoadError') return 'ChunkLoadError';
    if (error.name === 'NetworkError') return 'NetworkError';
    return 'Error';
  }

  /**
   * 获取错误消息
   */
  getErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.toString) return error.toString();
    return 'Unknown error';
  }

  /**
   * 获取错误堆栈
   */
  getErrorStack(error) {
    if (error?.stack) return error.stack;
    if (typeof error === 'object') {
      try {
        return JSON.stringify(error, null, 2);
      } catch (e) {
        return '[Unable to stringify error]';
      }
    }
    return '';
  }

  /**
   * 获取所有错误日志
   */
  getLogs() {
    return [...this.errorLogs];
  }

  /**
   * 根据类型过滤日志
   */
  getLogsByType(type) {
    return this.errorLogs.filter(log => log.type === type);
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count = 10) {
    return this.errorLogs.slice(0, count);
  }

  /**
   * 清除所有日志
   */
  clearLogs() {
    this.errorLogs = [];
    this.saveToStorage();
    this.notifyListeners(null, 'clear');
  }

  /**
   * 清除指定类型的日志
   */
  clearLogsByType(type) {
    this.errorLogs = this.errorLogs.filter(log => log.type !== type);
    this.saveToStorage();
    this.notifyListeners(null, 'clear');
  }

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.errorLogs));
    } catch (error) {
      console.warn('保存错误日志到存储失败:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.errorLogs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('从存储加载错误日志失败:', error);
      this.errorLogs = [];
    }
  }

  /**
   * 添加日志监听器
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(errorLog, action = 'add') {
    this.listeners.forEach(listener => {
      try {
        listener(errorLog, action, this.errorLogs);
      } catch (error) {
        console.error('错误日志监听器执行失败:', error);
      }
    });
  }

  /**
   * 导出错误日志
   */
  exportLogs() {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalErrors: this.errorLogs.length,
      logs: this.errorLogs
    }, null, 2);
  }

  /**
   * 获取错误统计
   */
  getStats() {
    const stats = {
      total: this.errorLogs.length,
      byType: {},
      byComponent: {},
      recent24h: 0
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    this.errorLogs.forEach(log => {
      // 按类型统计
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      
      // 按组件统计
      stats.byComponent[log.context.component] = (stats.byComponent[log.context.component] || 0) + 1;
      
      // 24小时内错误统计
      const logTime = new Date(log.timestamp);
      if (logTime > yesterday) {
        stats.recent24h++;
      }
    });

    return stats;
  }

  /**
   * 获取最近的错误（用于快速定位）
   */
  getLastError() {
    return this.errorLogs[0] || null;
  }
}

// 创建单例实例
export const errorLogger = new ErrorLogger();

// 延迟初始化全局错误捕获，避免模块加载时的循环依赖
let isGlobalErrorHandlersInitialized = false;

export const initializeGlobalErrorHandlers = () => {
  if (isGlobalErrorHandlersInitialized || typeof window === 'undefined') {
    return;
  }
  
  isGlobalErrorHandlersInitialized = true;
  
  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(event.reason, {
      component: 'Global',
      action: 'unhandledrejection',
      type: 'PromiseRejection'
    });
    
    // 阻止默认的控制台输出
    event.preventDefault();
  });

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    errorLogger.log(event.error, {
      component: 'Global',
      action: 'globalError',
      type: 'RuntimeError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // 捕获资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      errorLogger.log(new Error(`Failed to load: ${event.target.src || event.target.href}`), {
        component: 'Global',
        action: 'resourceError',
        type: 'ResourceError',
        tagName: event.target.tagName
      });
    }
  }, true);
};

export default ErrorLogger;
