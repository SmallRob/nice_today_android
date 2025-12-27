/**
 * 错误日志管理服务
 * 统一管理应用中的错误日志，提供存储、查询和上报功能
 * 增强移动设备兼容性和精确的错误位置定位
 */

class ErrorLogger {
  constructor() {
    this.errorLogs = [];
    this.maxLogCount = 100; // 最多保存100条错误日志
    this.listeners = [];
    this.storageKey = 'nice_today_error_logs';

    // 移动设备检测
    this.deviceInfo = this.detectDevice();

    // 初始化时从存储中加载日志
    this.loadFromStorage();
  }

  /**
   * 检测移动设备环境
   */
  detectDevice() {
    const ua = navigator.userAgent || '';

    return {
      isAndroidWebView: /wv|WebView|Android.*Chrome\/[.0-9]*/.test(ua),
      isIOSWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/.test(ua),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language
    };
  }

  /**
   * 记录错误
   * 增强版，包含精确的错误位置信息和移动设备上下文
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
      location: this.extractErrorLocation(error, context),
      deviceInfo: {
        ...this.deviceInfo,
        screenWidth: window.screen?.width,
        screenHeight: window.screen?.height,
        devicePixelRatio: window.devicePixelRatio
      },
      context: {
        component: context.component || 'Unknown',
        action: context.action || 'Unknown',
        route: window.location.pathname,
        url: window.location.href,
        ...context
      }
    };

    // 移动设备特殊标记
    if (this.deviceInfo.isAndroidWebView || this.deviceInfo.isIOSWebView) {
      errorLog.context.isMobileWebView = true;
      errorLog.context.webviewType = this.deviceInfo.isAndroidWebView ? 'Android' : 'iOS';
    }

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
      console.error('错误对象:', error);
      console.log('错误位置:', errorLog.location);
      console.log('设备信息:', errorLog.deviceInfo);
      console.log('上下文:', context);
      console.log('完整堆栈:', errorLog.stack);
      console.groupEnd();
    }

    return errorLog;
  }

  /**
   * 提取错误位置信息
   * @param {Error} error 错误对象
   * @param {Object} context 上下文信息
   * @returns {Object} 错误位置信息
   */
  extractErrorLocation(error, context = {}) {
    const location = {
      fileName: context.filename || null,
      lineNumber: context.lineno || null,
      columnNumber: context.colno || null,
      functionName: null,
      moduleName: null
    };

    if (!error) {
      return location;
    }

    // 尝试从错误对象获取位置信息
    if (error.fileName) location.fileName = error.fileName;
    if (error.lineNumber !== undefined) location.lineNumber = error.lineNumber;
    if (error.columnNumber !== undefined) location.columnNumber = error.columnNumber;
    if (error.functionName) location.functionName = error.functionName;

    // 如果没有位置信息，尝试从堆栈解析
    if (!location.fileName && error.stack) {
      const stackLocation = this.parseErrorStack(error.stack);
      if (stackLocation) {
        Object.assign(location, stackLocation);
      }
    }

    // 提取模块名称
    if (location.fileName) {
      location.moduleName = this.extractModuleName(location.fileName);
    }

    return location;
  }

  /**
   * 解析错误堆栈
   * @param {string} stack 堆栈字符串
   * @returns {Object} 解析出的位置信息
   */
  parseErrorStack(stack) {
    if (!stack || typeof stack !== 'string') {
      return null;
    }

    const location = {
      fileName: null,
      lineNumber: null,
      columnNumber: null,
      functionName: null
    };

    // 标准浏览器堆栈格式
    const patterns = [
      /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/,  // Chrome
      /(.+?)@(.+?):(\d+):(\d+)/,           // Firefox
      /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/  // WebView
    ];

    const lines = stack.split('\n');

    for (const line of lines) {
      // 跳过空行和全局错误处理器标记
      if (!line.trim() || line.includes('globalError') || line.includes('ErrorBoundary') || line.includes('errorLogger')) {
        continue;
      }

      for (const pattern of patterns) {
        const match = pattern.exec(line);
        if (match) {
          location.functionName = match[1] || 'anonymous';
          location.fileName = match[2];
          location.lineNumber = parseInt(match[3], 10);
          location.columnNumber = parseInt(match[4], 10);

          // 处理 webpack 打包的文件
          if (location.fileName.includes('webpack://')) {
            const webpackMatch = location.fileName.match(/webpack:\/\/\/(.+?)(?:\?|$)/);
            if (webpackMatch) {
              location.fileName = webpackMatch[1];
            }
          }

          return location;
        }
      }
    }

    return null;
  }

  /**
   * 从文件路径提取模块名称
   * @param {string} filePath 文件路径
   * @returns {string} 模块名称
   */
  extractModuleName(filePath) {
    if (!filePath) return 'Unknown';

    // 移除查询参数和哈希
    const cleanPath = filePath.split('?')[0].split('#')[0];

    // 提取文件名
    const fileNameMatch = cleanPath.match(/([^\/\\]+)\.(js|jsx|ts|tsx)$/);
    if (fileNameMatch) {
      return fileNameMatch[1];
    }

    // 如果没有匹配，返回路径的最后一部分
    const parts = cleanPath.split(/[\/\\]/);
    return parts[parts.length - 1] || 'Unknown';
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

  const deviceInfo = errorLogger.deviceInfo;

  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorType = reason?.name || 'PromiseRejection';

    errorLogger.log(reason || new Error('Unhandled promise rejection'), {
      component: 'Global',
      action: 'unhandledrejection',
      type: 'PromiseRejection',
      isMobileWebView: deviceInfo.isMobile
    });

    // 移动设备特殊处理：防止 Promise 错误导致应用崩溃
    if (deviceInfo.isMobile) {
      console.warn('[移动设备] 捕获未处理的 Promise 拒绝:', reason);
      event.preventDefault();
    }
  });

  // 捕获全局错误（同步错误）
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);

    // 增强的上下文信息
    const context = {
      component: 'Global',
      action: 'globalError',
      type: 'RuntimeError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      isMobileWebView: deviceInfo.isMobile
    };

    // 添加移动设备特殊标记
    if (deviceInfo.isAndroidWebView) {
      context.webviewType = 'Android';
      context.isCritical = true; // Android WebView 错误通常更严重
    } else if (deviceInfo.isIOSWebView) {
      context.webviewType = 'iOS';
    }

    errorLogger.log(error, context);

    // 移动设备特殊处理：详细记录并防止崩溃
    if (deviceInfo.isMobile) {
      console.error('[移动设备] 全局错误捕获:', {
        message: error.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: error.stack
      });
    }
  });

  // 捕获资源加载错误（图片、脚本、样式等）
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const tagName = event.target.tagName;
      const resourceUrl = event.target.src || event.target.href;

      errorLogger.log(new Error(`Failed to load ${tagName}: ${resourceUrl}`), {
        component: 'Global',
        action: 'resourceError',
        type: 'ResourceError',
        tagName: tagName,
        resourceUrl: resourceUrl,
        isMobileWebView: deviceInfo.isMobile
      });

      // 移动设备特殊处理：记录资源加载失败
      if (deviceInfo.isMobile) {
        console.warn(`[移动设备] 资源加载失败: ${tagName}`, resourceUrl);
      }
    }
  }, true);

  // 移动设备特殊的性能错误监听
  if (deviceInfo.isMobile) {
    // 监控内存警告（如果支持）
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          errorLogger.log(new Error('内存使用过高'), {
            component: 'Global',
            action: 'memoryWarning',
            type: 'MemoryWarning',
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
          });
        }
      }, 30000); // 每30秒检查一次
    }

    // 监控长任务（如果支持）
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 500) { // 超过500ms的长任务
              errorLogger.log(new Error(`长任务阻塞: ${entry.duration}ms`), {
                component: 'Global',
                action: 'longTask',
                type: 'PerformanceWarning',
                duration: entry.duration,
                startTime: entry.startTime,
                isMobileWebView: true
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (err) {
        console.warn('PerformanceObserver 初始化失败:', err);
      }
    }

    console.log('[移动设备] 全局错误处理器已启用（移动设备模式）');
  } else {
    console.log('[桌面] 全局错误处理器已启用');
  }
};

export default ErrorLogger;
