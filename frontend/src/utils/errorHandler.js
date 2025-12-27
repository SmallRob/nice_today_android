/**
 * 统一异常处理工具
 * 提供一致的错误处理、日志记录和恢复机制
 * 支持移动设备兼容性和精确的错误位置定位
 */

/**
 * 错误位置解析器
 * 从堆栈信息中提取精确的错误位置信息
 */
class ErrorLocationParser {
  /**
   * 解析堆栈信息，提取错误位置
   * @param {Error} error - 错误对象
   * @returns {Object} - 错误位置信息
   */
  static parse(error) {
    const location = {
      fileName: null,
      lineNumber: null,
      columnNumber: null,
      functionName: null,
      moduleName: null,
      isSourceMapped: false
    };

    if (!error || !error.stack) {
      return location;
    }

    try {
      // 尝试从错误对象直接获取位置信息（移动 WebView 可能提供）
      if (error.fileName) location.fileName = error.fileName;
      if (error.lineNumber !== undefined) location.lineNumber = error.lineNumber;
      if (error.columnNumber !== undefined) location.columnNumber = error.columnNumber;
      if (error.functionName) location.functionName = error.functionName;

      // 如果直接信息不够，从堆栈中解析
      if (!location.fileName || !location.lineNumber) {
        const stackInfo = this.parseStackTrace(error.stack);
        Object.assign(location, stackInfo);
      }

      // 检测是否使用了源码映射
      location.isSourceMapped = this.detectSourceMap(error.stack);

      // 提取模块名称
      location.moduleName = this.extractModuleName(location.fileName);

    } catch (err) {
      console.warn('错误位置解析失败:', err);
    }

    return location;
  }

  /**
   * 解析堆栈字符串
   * @param {string} stack - 堆栈字符串
   * @returns {Object} - 解析出的位置信息
   */
  static parseStackTrace(stack) {
    const info = {
      fileName: null,
      lineNumber: null,
      columnNumber: null,
      functionName: null
    };

    if (!stack || typeof stack !== 'string') {
      return info;
    }

    // 标准浏览器堆栈格式
    const chromeRegex = /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/;
    const firefoxRegex = /(.+?)@(.+?):(\d+):(\d+)/;
    const webviewRegex = /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/;

    const lines = stack.split('\n');

    for (const line of lines) {
      // 跳过空行和全局错误处理器标记
      if (!line.trim() || line.includes('globalError') || line.includes('ErrorBoundary')) {
        continue;
      }

      let match = chromeRegex.exec(line);
      if (!match) {
        match = firefoxRegex.exec(line);
      }
      if (!match) {
        match = webviewRegex.exec(line);
      }

      if (match) {
        info.functionName = match[1] || 'anonymous';
        info.fileName = match[2];
        info.lineNumber = parseInt(match[3], 10);
        info.columnNumber = parseInt(match[4], 10);

        // 如果是webpack打包的文件，提取原始文件名
        if (info.fileName.includes('webpack://')) {
          const webpackMatch = info.fileName.match(/webpack:\/\/\/(.+?)(?:\?|$)/);
          if (webpackMatch) {
            info.fileName = webpackMatch[1];
          }
        }

        break;
      }
    }

    return info;
  }

  /**
   * 检测是否使用了源码映射
   * @param {string} stack - 堆栈字符串
   * @returns {boolean}
   */
  static detectSourceMap(stack) {
    if (!stack) return false;

    // 检查堆栈中是否包含源码映射标记
    const sourceMapIndicators = [
      'webpack://',
      '.js.map',
      'sourceMappingURL',
      '__webpack_require__'
    ];

    return sourceMapIndicators.some(indicator => stack.includes(indicator));
  }

  /**
   * 从文件路径提取模块名称
   * @param {string} filePath - 文件路径
   * @returns {string} - 模块名称
   */
  static extractModuleName(filePath) {
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
}

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  DATA: 'DATA_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  COMPONENT: 'COMPONENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  MOBILE_WEBVIEW: 'MOBILE_WEBVIEW_ERROR',
  CHUNK_LOAD: 'CHUNK_LOAD_ERROR',
  SOURCE_MAP: 'SOURCE_MAP_ERROR'
};

/**
 * 错误严重级别
 */
export const ErrorSeverity = {
  LOW: 'low',       // 低级别：不影响核心功能
  MEDIUM: 'medium', // 中级别：部分功能受影响
  HIGH: 'high',     // 高级别：核心功能受影响
  CRITICAL: 'critical' // 关键级别：应用无法运行
};

/**
 * 移动设备环境检测
 */
class MobileEnvironmentDetector {
  static isAndroidWebView() {
    const ua = navigator.userAgent || '';
    return /wv|WebView|Android.*Chrome\/[.0-9]*/.test(ua);
  }

  static isIOSWebView() {
    const ua = navigator.userAgent || '';
    return /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/.test(ua);
  }

  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static getDeviceInfo() {
    return {
      isMobile: this.isMobile(),
      isAndroidWebView: this.isAndroidWebView(),
      isIOSWebView: this.isIOSWebView(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      devicePixelRatio: window.devicePixelRatio
    };
  }
}

/**
 * 错误信息接口
 * 增强版，包含精确的位置信息和移动设备上下文
 */
class AppError extends Error {
  constructor(type, message, severity = ErrorSeverity.MEDIUM, details = null, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.stack = originalError ? originalError.stack : new Error().stack;

    // 解析精确的错误位置
    this.location = ErrorLocationParser.parse(originalError || this);

    // 添加移动设备环境信息
    this.deviceInfo = MobileEnvironmentDetector.getDeviceInfo();

    // 添加错误唯一标识
    this.errorId = this.generateErrorId();
  }

  /**
   * 生成错误唯一标识
   */
  generateErrorId() {
    const timePart = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `${this.type}_${timePart}_${randomPart}`;
  }

  /**
   * 转换为可序列化的对象
   * 包含完整的错误位置和设备信息
   */
  toJSON() {
    return {
      errorId: this.errorId,
      type: this.type,
      message: this.message,
      severity: this.severity,
      details: this.details,
      location: {
        fileName: this.location.fileName,
        lineNumber: this.location.lineNumber,
        columnNumber: this.location.columnNumber,
        functionName: this.location.functionName,
        moduleName: this.location.moduleName,
        isSourceMapped: this.location.isSourceMapped
      },
      deviceInfo: {
        isMobile: this.deviceInfo.isMobile,
        isAndroidWebView: this.deviceInfo.isAndroidWebView,
        isIOSWebView: this.deviceInfo.isIOSWebView,
        platform: this.deviceInfo.platform,
        language: this.deviceInfo.language,
        screenWidth: this.deviceInfo.screenWidth,
        screenHeight: this.deviceInfo.screenHeight,
        devicePixelRatio: this.deviceInfo.devicePixelRatio
      },
      originalError: this.originalError ? {
        message: this.originalError.message,
        stack: this.originalError.stack
      } : null,
      timestamp: this.timestamp
    };
  }

  /**
   * 获取用户友好的错误消息
   * 根据移动设备环境调整消息
   */
  getUserMessage() {
    const userMessages = {
      [ErrorTypes.NETWORK]: '网络连接失败，请检查您的网络设置',
      [ErrorTypes.API]: '服务器响应异常，请稍后重试',
      [ErrorTypes.DATA]: '数据处理失败，请刷新页面',
      [ErrorTypes.VALIDATION]: '输入数据格式不正确，请检查后重试',
      [ErrorTypes.STORAGE]: '数据存储失败，请检查浏览器设置',
      [ErrorTypes.PERMISSION]: '需要权限才能执行此操作',
      [ErrorTypes.COMPONENT]: '组件加载失败，请刷新页面',
      [ErrorTypes.MOBILE_WEBVIEW]: '移动端应用遇到问题，请尝试重启应用',
      [ErrorTypes.CHUNK_LOAD]: '资源加载失败，请检查网络连接后刷新',
      [ErrorTypes.SOURCE_MAP]: '代码映射出现问题，请稍后重试',
      [ErrorTypes.UNKNOWN]: '发生未知错误，请稍后重试'
    };

    const baseMessage = userMessages[this.type] || userMessages[ErrorTypes.UNKNOWN];

    // 移动设备特定的消息调整
    if (this.deviceInfo.isAndroidWebView) {
      return `${baseMessage}（Android WebView）`;
    } else if (this.deviceInfo.isIOSWebView) {
      return `${baseMessage}（iOS WebView）`;
    }

    return baseMessage;
  }

  /**
   * 获取详细的错误位置字符串
   */
  getLocationString() {
    const loc = this.location;
    const parts = [];

    if (loc.moduleName) parts.push(`模块: ${loc.moduleName}`);
    if (loc.fileName) parts.push(`文件: ${loc.fileName}`);
    if (loc.lineNumber) parts.push(`行: ${loc.lineNumber}`);
    if (loc.columnNumber) parts.push(`列: ${loc.columnNumber}`);
    if (loc.functionName) parts.push(`函数: ${loc.functionName}`);

    return parts.length > 0 ? parts.join(' | ') : '位置: 未知';
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage() {
    const userMessages = {
      [ErrorTypes.NETWORK]: '网络连接失败，请检查您的网络设置',
      [ErrorTypes.API]: '服务器响应异常，请稍后重试',
      [ErrorTypes.DATA]: '数据处理失败，请刷新页面',
      [ErrorTypes.VALIDATION]: '输入数据格式不正确，请检查后重试',
      [ErrorTypes.STORAGE]: '数据存储失败，请检查浏览器设置',
      [ErrorTypes.PERMISSION]: '需要权限才能执行此操作',
      [ErrorTypes.COMPONENT]: '组件加载失败，请刷新页面',
      [ErrorTypes.UNKNOWN]: '发生未知错误，请稍后重试'
    };
    return userMessages[this.type] || userMessages[ErrorTypes.UNKNOWN];
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100; // 最多保留100条错误日志
    this.errorCallbacks = new Set();
    this.enableConsoleLog = process.env.NODE_ENV === 'development';
  }

  /**
   * 注册错误回调
   * @param {Function} callback - 错误回调函数
   */
  onError(callback) {
    if (typeof callback === 'function') {
      this.errorCallbacks.add(callback);
    }
  }

  /**
   * 移除错误回调
   * @param {Function} callback - 错误回调函数
   */
  offError(callback) {
    this.errorCallbacks.delete(callback);
  }

  /**
   * 通知所有错误回调
   * @param {AppError} error - 错误对象
   */
  notifyCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('错误回调执行失败:', err);
      }
    });
  }

  /**
   * 处理错误
   * @param {Error|AppError} error - 错误对象
   * @param {Object} context - 错误上下文
   * @returns {AppError} - 标准化的错误对象
   */
  handle(error, context = {}) {
    // 如果已经是 AppError，直接使用
    const appError = error instanceof AppError 
      ? error 
      : this.normalizeError(error, context);

    // 记录错误
    this.logError(appError, context);

    // 通知回调
    this.notifyCallbacks(appError);

    // 根据严重级别执行不同操作
    this.handleErrorBySeverity(appError);

    return appError;
  }

  /**
   * 标准化普通错误为 AppError
   * 增强版，包含移动设备特殊错误检测
   * @param {Error} error - 普通错误对象
   * @param {Object} context - 错误上下文
   * @returns {AppError} - 标准化的错误对象
   */
  normalizeError(error, context = {}) {
    let type = ErrorTypes.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    const deviceInfo = MobileEnvironmentDetector.getDeviceInfo();

    // 根据错误信息判断类型
    const message = error.message || '';

    // Chunk Load 错误（代码分割加载失败）
    if (error.name === 'ChunkLoadError' || message.includes('Loading chunk')) {
      type = ErrorTypes.CHUNK_LOAD;
      severity = ErrorSeverity.HIGH;
    }
    // 网络错误
    else if (message.includes('Network') || message.includes('fetch') || message.includes('ECONNREFUSED')) {
      type = ErrorTypes.NETWORK;
      severity = ErrorSeverity.MEDIUM;
    }
    // API 错误
    else if (message.includes('API') || message.includes('HTTP')) {
      type = ErrorTypes.API;
      severity = ErrorSeverity.MEDIUM;
    }
    // 验证错误
    else if (message.includes('validation') || message.includes('invalid')) {
      type = ErrorTypes.VALIDATION;
      severity = ErrorSeverity.LOW;
    }
    // 存储错误
    else if (message.includes('storage') || message.includes('localStorage') || message.includes('QuotaExceededError')) {
      type = ErrorTypes.STORAGE;
      severity = ErrorSeverity.MEDIUM;
    }
    // 权限错误
    else if (message.includes('permission') || message.includes('Permission')) {
      type = ErrorTypes.PERMISSION;
      severity = ErrorSeverity.HIGH;
    }
    // 移动设备特殊错误
    else if (deviceInfo.isAndroidWebView || deviceInfo.isIOSWebView) {
      // 检测 WebView 特有的错误
      if (message.includes('JavaScript') || message.includes('eval') || message.includes('not defined')) {
        type = ErrorTypes.MOBILE_WEBVIEW;
        severity = ErrorSeverity.HIGH;
      }
    }
    // 源码映射错误
    else if (message.includes('SourceMap') || message.includes('source map')) {
      type = ErrorTypes.SOURCE_MAP;
      severity = ErrorSeverity.MEDIUM;
    }
    // Reference Error（变量未定义）
    else if (error instanceof ReferenceError) {
      type = ErrorTypes.COMPONENT;
      severity = ErrorSeverity.HIGH;
    }
    // TypeError
    else if (error instanceof TypeError) {
      type = ErrorTypes.COMPONENT;
      severity = ErrorSeverity.MEDIUM;
    }

    // 根据上下文信息调整类型和严重级别
    if (context.component) {
      if (type === ErrorTypes.UNKNOWN) {
        type = ErrorTypes.COMPONENT;
      }
      severity = ErrorSeverity.HIGH;
    }

    // 移动 WebView 错误提升严重级别
    if (type === ErrorTypes.MOBILE_WEBVIEW && severity !== ErrorSeverity.CRITICAL) {
      severity = ErrorSeverity.HIGH;
    }

    return new AppError(
      type,
      error.message || '未知错误',
      severity,
      { context },
      error
    );
  }

  /**
   * 记录错误
   * 增强版，包含完整的错误位置和设备信息
   * @param {AppError} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  logError(error, context = {}) {
    const errorRecord = {
      ...error.toJSON(),
      context,
      locationString: error.getLocationString(),
      userMessage: error.getUserMessage()
    };

    // 添加到日志
    this.errorLog.push(errorRecord);

    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 控制台输出（开发环境）
    if (this.enableConsoleLog) {
      console.group(`🔴 [${error.type}] ${error.errorId}`);
      console.error('错误消息:', error.message);
      console.error('错误位置:', error.getLocationString());
      console.error('设备信息:', {
        isMobile: error.deviceInfo.isMobile,
        platform: error.deviceInfo.platform,
        isAndroidWebView: error.deviceInfo.isAndroidWebView,
        isIOSWebView: error.deviceInfo.isIOSWebView
      });
      console.error('错误详情:', errorRecord);
      console.error('完整堆栈:', error.stack);
      console.groupEnd();
    }
  }

  /**
   * 根据严重级别处理错误
   * @param {AppError} error - 错误对象
   */
  handleErrorBySeverity(error) {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        // 低级别错误：静默记录，不影响用户体验
        break;

      case ErrorSeverity.MEDIUM:
        // 中级别错误：显示提示，但允许继续使用
        this.showMediumSeverityWarning(error);
        break;

      case ErrorSeverity.HIGH:
        // 高级别错误：显示警告，建议刷新
        this.showHighSeverityWarning(error);
        break;

      case ErrorSeverity.CRITICAL:
        // 关键错误：显示错误页面，阻止继续使用
        this.showCriticalError(error);
        break;

      default:
        console.warn('未知的错误严重级别:', error.severity);
    }
  }

  /**
   * 显示中级别错误警告
   * @param {AppError} error - 错误对象
   */
  showMediumSeverityWarning(error) {
    // TODO: 实现轻量级通知
    console.warn('中级别错误:', error.getUserMessage());
  }

  /**
   * 显示高级别错误警告
   * @param {AppError} error - 错误对象
   */
  showHighSeverityWarning(error) {
    // TODO: 实现警告弹窗
    console.error('高级别错误:', error.getUserMessage());
  }

  /**
   * 显示关键错误
   * @param {AppError} error - 错误对象
   */
  showCriticalError(error) {
    // TODO: 实现错误页面
    console.error('关键错误:', error.getUserMessage());
  }

  /**
   * 获取错误日志
   * @returns {Array} - 错误日志数组
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
    console.log('错误日志已清除');
  }

  /**
   * 导出错误日志为 JSON
   * @returns {string} - JSON 字符串
   */
  exportErrorLog() {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler();

/**
 * 异步操作包装器
 * 提供统一的异步操作错误处理
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 选项
 * @returns {Promise} - 包装后的 Promise
 */
export const withErrorHandling = async (asyncFn, options = {}) => {
  const {
    context = {},
    fallback = null,
    rethrow = false,
    logError = true
  } = options;

  try {
    const result = await asyncFn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const appError = globalErrorHandler.handle(error, context);

    if (logError) {
      console.error('异步操作失败:', appError);
    }

    if (fallback !== null) {
      return {
        success: false,
        error: appError,
        data: fallback
      };
    }

    if (rethrow) {
      throw appError;
    }

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * 函数调用包装器
 * 提供统一的同步函数错误处理
 * @param {Function} fn - 同步函数
 * @param {Object} options - 选项
 * @returns {*} - 函数返回值或降级值
 */
export const withSyncErrorHandling = (fn, options = {}) => {
  const {
    context = {},
    fallback = null,
    logError = true
  } = options;

  try {
    const result = fn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const appError = globalErrorHandler.handle(error, context);

    if (logError) {
      console.error('函数调用失败:', appError);
    }

    if (fallback !== null) {
      return {
        success: false,
        error: appError,
        data: fallback
      };
    }

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * 组件错误边界包装器
 * 用于 React 组件的错误边界
 * @param {React.Component} Component - React 组件
 * @param {string} componentName - 组件名称
 * @returns {React.Component} - 包装后的组件
 */
export const withComponentErrorBoundary = (Component, componentName = 'Unknown') => {
  return class WrappedComponent extends React.Component {
    static displayName = `WithErrorBoundary(${componentName})`;

    componentDidCatch(error, errorInfo) {
      const context = {
        component: componentName,
        errorInfo
      };

      const appError = globalErrorHandler.handle(error, context);
      console.error(`组件 ${componentName} 渲染错误:`, appError);
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};

/**
 * 验证函数包装器
 * 提供统一的参数验证错误处理
 * @param {Function} validationFn - 验证函数
 * @param {*} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {Object} - 验证结果
 */
export const validateWithHandling = (validationFn, value, fieldName = 'field') => {
  try {
    const result = validationFn(value);

    if (!result.isValid) {
      const error = new AppError(
        ErrorTypes.VALIDATION,
        `字段 ${fieldName} 验证失败: ${result.message}`,
        ErrorSeverity.MEDIUM,
        { fieldName, value, validationErrors: result.errors }
      );
      
      globalErrorHandler.handle(error, { operation: 'validation', fieldName });
      
      return {
        isValid: false,
        error,
        errors: result.errors
      };
    }

    return {
      isValid: true,
      value: result.value || value
    };
  } catch (error) {
    const appError = globalErrorHandler.handle(error, { operation: 'validation', fieldName });
    
    return {
      isValid: false,
      error: appError
    };
  }
};

/**
 * 重试机制包装器
 * 提供自动重试功能
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 重试选项
 * @returns {Promise} - 包装后的 Promise
 */
export const withRetry = async (asyncFn, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    context = {},
    shouldRetry = (error) => true
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await asyncFn();
      
      if (attempt > 0) {
        console.log(`重试成功 (尝试 ${attempt + 1}/${maxRetries})`);
      }
      
      return {
        success: true,
        data: result,
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error;
      
      console.warn(`操作失败 (尝试 ${attempt + 1}/${maxRetries}):`, error.message);

      // 检查是否应该重试
      if (attempt < maxRetries - 1 && shouldRetry(error)) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      } else {
        // 不再重试，抛出错误
        const appError = globalErrorHandler.handle(error, context);
        
        return {
          success: false,
          error: appError,
          attempts: attempt + 1
        };
      }
    }
  }

  const appError = globalErrorHandler.handle(lastError, context);
  return {
    success: false,
    error: appError,
    attempts: maxRetries
  };
};

export default globalErrorHandler;

/**
 * 获取精确错误位置的工具函数
 * @param {Error} error - 错误对象
 * @returns {Object} - 错误位置信息
 */
export const getErrorLocation = (error) => {
  return ErrorLocationParser.parse(error);
};

/**
 * 获取设备信息
 * @returns {Object} - 设备信息对象
 */
export const getDeviceInfo = () => {
  return MobileEnvironmentDetector.getDeviceInfo();
};

/**
 * 检测是否为移动设备环境
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  return MobileEnvironmentDetector.isMobile();
};

/**
 * 检测是否为 Android WebView
 * @returns {boolean}
 */
export const isAndroidWebView = () => {
  return MobileEnvironmentDetector.isAndroidWebView();
};

/**
 * 检测是否为 iOS WebView
 * @returns {boolean}
 */
export const isIOSWebView = () => {
  return MobileEnvironmentDetector.isIOSWebView();
};

/**
 * 创建增强的错误报告
 * @param {AppError} error - 错误对象
 * @returns {Object} - 详细的错误报告
 */
export const createDetailedErrorReport = (error) => {
  return {
    summary: {
      errorId: error.errorId,
      type: error.type,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp
    },
    location: {
      fileName: error.location.fileName,
      lineNumber: error.location.lineNumber,
      columnNumber: error.location.columnNumber,
      functionName: error.location.functionName,
      moduleName: error.location.moduleName,
      locationString: error.getLocationString()
    },
    device: {
      isMobile: error.deviceInfo.isMobile,
      isAndroidWebView: error.deviceInfo.isAndroidWebView,
      isIOSWebView: error.deviceInfo.isIOSWebView,
      platform: error.deviceInfo.platform,
      language: error.deviceInfo.language,
      screenWidth: error.deviceInfo.screenWidth,
      screenHeight: error.deviceInfo.screenHeight,
      devicePixelRatio: error.deviceInfo.devicePixelRatio
    },
    stackTrace: error.stack,
    userMessage: error.getUserMessage(),
    originalError: error.originalError ? {
      name: error.originalError.name,
      message: error.originalError.message
    } : null
  };
};
