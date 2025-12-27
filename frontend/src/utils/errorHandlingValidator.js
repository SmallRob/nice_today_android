/**
 * 错误处理验证工具
 * 用于全面测试和验证错误处理机制的移动设备兼容性
 */

import { globalErrorHandler, getErrorLocation, createDetailedErrorReport, getDeviceInfo, isMobileDevice, isAndroidWebView, isIOSWebView } from './errorHandler';
import { errorLogger } from './errorLogger';

class ErrorHandlingValidator {
  constructor() {
    this.testResults = [];
    this.deviceInfo = null;
  }

  /**
   * 运行所有验证测试
   */
  async runAllTests() {
    console.group('🔍 开始错误处理验证测试');
    this.deviceInfo = getDeviceInfo();

    // 1. 设备环境检测测试
    this.testDeviceDetection();

    // 2. 错误位置解析测试
    await this.testErrorLocationParsing();

    // 3. 移动设备错误处理测试
    await this.testMobileErrorHandling();

    // 4. 堆栈分析测试
    await this.testStackTraceAnalysis();

    // 5. 全局错误捕获测试
    await this.testGlobalErrorCapture();

    // 6. 错误报告生成测试
    await this.testErrorReportGeneration();

    // 7. 移动 WebView 特殊测试
    await this.testMobileWebViewHandling();

    console.groupEnd();

    return this.generateTestReport();
  }

  /**
   * 测试设备环境检测
   */
  testDeviceDetection() {
    console.group('📱 设备环境检测测试');

    const tests = [
      {
        name: '设备信息获取',
        test: () => {
          const info = getDeviceInfo();
          return info && typeof info === 'object';
        }
      },
      {
        name: '移动设备检测',
        test: () => {
          const isMobile = isMobileDevice();
          return typeof isMobile === 'boolean';
        }
      },
      {
        name: 'Android WebView 检测',
        test: () => {
          const isAndroid = isAndroidWebView();
          return typeof isAndroid === 'boolean';
        }
      },
      {
        name: 'iOS WebView 检测',
        test: () => {
          const isIOS = isIOSWebView();
          return typeof isIOS === 'boolean';
        }
      },
      {
        name: '设备信息完整性',
        test: () => {
          const info = getDeviceInfo();
          return !!(
            info.userAgent &&
            info.platform &&
            info.language &&
            info.isMobile !== undefined &&
            info.isAndroidWebView !== undefined &&
            info.isIOSWebView !== undefined
          );
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试错误位置解析
   */
  async testErrorLocationParsing() {
    console.group('📍 错误位置解析测试');

    const tests = [
      {
        name: '标准错误位置解析',
        test: () => {
          try {
            throw new Error('Test error for location');
          } catch (error) {
            const location = getErrorLocation(error);
            return !!location;
          }
        }
      },
      {
        name: '文件名提取',
        test: () => {
          try {
            throw new Error('Test error for filename');
          } catch (error) {
            const location = getErrorLocation(error);
            return !!(location && typeof location.fileName === 'string');
          }
        }
      },
      {
        name: '行号提取',
        test: () => {
          try {
            throw new Error('Test error for line number');
          } catch (error) {
            const location = getErrorLocation(error);
            return !!(location && typeof location.lineNumber === 'number');
          }
        }
      },
      {
        name: '列号提取',
        test: () => {
          try {
            throw new Error('Test error for column number');
          } catch (error) {
            const location = getErrorLocation(error);
            return !!(location && typeof location.columnNumber === 'number');
          }
        }
      },
      {
        name: '函数名提取',
        test: () => {
          try {
            throw new Error('Test error for function name');
          } catch (error) {
            const location = getErrorLocation(error);
            return location.functionName !== undefined;
          }
        }
      },
      {
        name: '模块名提取',
        test: () => {
          try {
            throw new Error('Test error for module name');
          } catch (error) {
            const location = getErrorLocation(error);
            return location.moduleName !== undefined;
          }
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试移动设备错误处理
   */
  async testMobileErrorHandling() {
    console.group('📱 移动设备错误处理测试');

    const tests = [
      {
        name: '全局错误处理器初始化',
        test: () => {
          return typeof globalErrorHandler === 'object';
        }
      },
      {
        name: '错误处理能力',
        test: () => {
          try {
            throw new Error('Test error');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            return !!appError;
          }
        }
      },
      {
        name: '错误标准化',
        test: () => {
          try {
            throw new Error('Test error normalization');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            return !!(
              appError.type &&
              appError.message &&
              appError.severity &&
              appError.location
            );
          }
        }
      },
      {
        name: '设备信息集成',
        test: () => {
          try {
            throw new Error('Test device info integration');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            return !!appError.deviceInfo;
          }
        }
      },
      {
        name: '移动设备标记',
        test: () => {
          try {
            throw new Error('Test mobile device marking');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            return typeof appError.deviceInfo.isMobile === 'boolean';
          }
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试堆栈分析
   */
  async testStackTraceAnalysis() {
    console.group('🔍 堆栈分析测试');

    const tests = [
      {
        name: '堆栈信息获取',
        test: () => {
          try {
            throw new Error('Test stack trace');
          } catch (error) {
            return !!error.stack;
          }
        }
      },
      {
        name: '堆栈解析能力',
        test: () => {
          try {
            throw new Error('Test stack parsing');
          } catch (error) {
            const location = getErrorLocation(error);
            return location.fileName !== null || location.lineNumber !== null;
          }
        }
      },
      {
        name: '错误位置字符串生成',
        test: () => {
          try {
            throw new Error('Test location string');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const locationString = appError.getLocationString();
            return typeof locationString === 'string';
          }
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试全局错误捕获
   */
  async testGlobalErrorCapture() {
    console.group('🌐 全局错误捕获测试');

    const tests = [
      {
        name: 'ErrorLogger 初始化',
        test: () => {
          return typeof errorLogger === 'object';
        }
      },
      {
        name: '错误记录能力',
        test: () => {
          const log = errorLogger.log(new Error('Test log'));
          return !!log && !!log.id;
        }
      },
      {
        name: '错误位置记录',
        test: () => {
          try {
            throw new Error('Test error location logging');
          } catch (error) {
            const log = errorLogger.log(error);
            return !!log.location;
          }
        }
      },
      {
        name: '设备信息记录',
        test: () => {
          try {
            throw new Error('Test device info logging');
          } catch (error) {
            const log = errorLogger.log(error);
            return !!log.deviceInfo;
          }
        }
      },
      {
        name: '日志存储能力',
        test: () => {
          const log1 = errorLogger.log(new Error('Test log storage 1'));
          const log2 = errorLogger.log(new Error('Test log storage 2'));
          return log1.id !== log2.id;
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试错误报告生成
   */
  async testErrorReportGeneration() {
    console.group('📊 错误报告生成测试');

    const tests = [
      {
        name: '详细错误报告生成',
        test: () => {
          try {
            throw new Error('Test detailed report');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const report = createDetailedErrorReport(appError);
            return !!report;
          }
        }
      },
      {
        name: '报告完整性检查',
        test: () => {
          try {
            throw new Error('Test report completeness');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const report = createDetailedErrorReport(appError);
            return !!(
              report.summary &&
              report.location &&
              report.device &&
              report.stackTrace
            );
          }
        }
      },
      {
        name: '位置信息包含在报告中',
        test: () => {
          try {
            throw new Error('Test report location info');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const report = createDetailedErrorReport(appError);
            return !!report.location;
          }
        }
      },
      {
        name: '设备信息包含在报告中',
        test: () => {
          try {
            throw new Error('Test report device info');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const report = createDetailedErrorReport(appError);
            return !!report.device;
          }
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 测试移动 WebView 处理
   */
  async testMobileWebViewHandling() {
    console.group('📱 移动 WebView 特殊处理测试');

    const tests = [
      {
        name: 'WebView 环境检测',
        test: () => {
          return typeof this.deviceInfo.isAndroidWebView === 'boolean' &&
                 typeof this.deviceInfo.isIOSWebView === 'boolean';
        }
      },
      {
        name: 'WebView 特定错误类型',
        test: () => {
          try {
            const error = new Error('Test WebView error');
            error.name = 'TestError';
            const appError = globalErrorHandler.handle(error);
            return !!appError.type;
          } catch (error) {
            console.error('WebView 错误类型测试失败:', error);
            return false;
          }
        }
      },
      {
        name: '用户消息适配',
        test: () => {
          try {
            throw new Error('Test user message');
          } catch (error) {
            const appError = globalErrorHandler.handle(error);
            const userMessage = appError.getUserMessage();
            return typeof userMessage === 'string' && userMessage.length > 0;
          }
        }
      }
    ];

    tests.forEach(test => {
      try {
        const result = test.test();
        this.recordTest(test.name, result, result ? '✓' : '✗');
        console.log(`${result ? '✓' : '✗'} ${test.name}`);
      } catch (error) {
        this.recordTest(test.name, false, '✗', error);
        console.error(`✗ ${test.name}:`, error);
      }
    });

    console.groupEnd();
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, status, error = null) {
    this.testResults.push({
      name,
      passed,
      status,
      error: error ? error.message : null,
      deviceInfo: this.deviceInfo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const passedTests = this.testResults.filter(t => t.passed);
    const failedTests = this.testResults.filter(t => !t.passed);

    const report = {
      summary: {
        total: this.testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        passRate: ((passedTests.length / this.testResults.length) * 100).toFixed(2) + '%'
      },
      deviceInfo: this.deviceInfo,
      tests: this.testResults,
      failedTests: failedTests,
      timestamp: new Date().toISOString()
    };

    console.group('📋 测试报告');
    console.log('测试概要:', report.summary);
    console.log('设备信息:', report.deviceInfo);

    if (failedTests.length > 0) {
      console.warn('失败的测试:');
      failedTests.forEach(test => {
        console.warn(`  ✗ ${test.name}`, test.error);
      });
    } else {
      console.log('✓ 所有测试通过！');
    }

    console.groupEnd();

    return report;
  }

  /**
   * 导出测试报告为 JSON
   */
  exportReport() {
    const report = this.generateTestReport();
    return JSON.stringify(report, null, 2);
  }
}

// 创建验证器实例
export const errorHandlingValidator = new ErrorHandlingValidator();

// 便捷的测试函数
export const runErrorHandlingValidation = async () => {
  return await errorHandlingValidator.runAllTests();
};

export const exportValidationReport = () => {
  return errorHandlingValidator.exportReport();
};

export default ErrorHandlingValidator;
