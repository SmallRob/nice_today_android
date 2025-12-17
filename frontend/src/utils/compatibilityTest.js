/**
 * 兼容性测试工具
 * 检测系统环境、依赖版本和运行环境
 */

class CompatibilityTester {
  constructor() {
    this.testResults = {};
    this.warnings = [];
    this.errors = [];
  }

  /**
   * 运行完整的兼容性测试套件
   */
  async runFullTestSuite() {
    console.log('开始兼容性测试...');
    
    this.testResults = {
      timestamp: new Date().toISOString(),
      environment: {},
      capabilities: {},
      dependencies: {},
      performance: {},
      issues: []
    };

    // 运行各项测试
    await this.testEnvironment();
    await this.testCapabilities();
    await this.testDependencies();
    await this.testPerformance();
    await this.detectIssues();

    console.log('兼容性测试完成');
    return this.generateReport();
  }

  /**
   * 测试运行环境
   */
  async testEnvironment() {
    this.testResults.environment = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
      online: navigator.onLine,
      deviceMemory: navigator.deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }

  /**
   * 测试浏览器/设备能力
   */
  async testCapabilities() {
    this.testResults.capabilities = {
      // Web API 支持
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      indexedDB: this.testIndexedDB(),
      webSQL: this.testWebSQL(),
      
      // 图形和媒体支持
      webGL: this.testWebGL(),
      canvas: this.testCanvas(),
      video: this.testVideo(),
      audio: this.testAudio(),
      
      // 设备功能
      touch: this.testTouch(),
      geolocation: this.testGeolocation(),
      camera: this.testCamera(),
      microphone: this.testMicrophone(),
      
      // 网络功能
      serviceWorker: this.testServiceWorker(),
      fetch: this.testFetch(),
      webSocket: this.testWebSocket()
    };
  }

  /**
   * 测试依赖库版本和兼容性
   */
  async testDependencies() {
    this.testResults.dependencies = {
      react: this.getReactVersion(),
      capacitor: this.getCapacitorInfo(),
      chartjs: this.getChartJSVersion(),
      webView: this.detectWebView()
    };
  }

  /**
   * 性能测试
   */
  async testPerformance() {
    if (!window.performance) {
      this.testResults.performance = { supported: false };
      return;
    }

    const startTime = performance.now();
    
    // 简单的性能基准测试
    await this.runPerformanceBenchmark();
    
    this.testResults.performance = {
      supported: true,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 
        'unknown',
      benchmarkTime: performance.now() - startTime
    };
  }

  /**
   * 检测潜在问题
   */
  async detectIssues() {
    const issues = [];

    // 检查localStorage配额
    if (this.testResults.capabilities.localStorage.supported) {
      const quota = this.testLocalStorageQuota();
      if (quota.used > quota.total * 0.8) {
        issues.push({
          type: 'storage',
          severity: 'warning',
          message: 'localStorage使用率较高，可能影响性能',
          details: quota
        });
      }
    }

    // 检查WebView版本
    const webViewInfo = this.testResults.dependencies.webView;
    if (webViewInfo.version && webViewInfo.version < 55) {
      issues.push({
        type: 'webview',
        severity: 'error',
        message: 'WebView版本过低，可能导致功能异常',
        details: webViewInfo
      });
    }

    // 检查内存使用
    if (this.testResults.performance.memory) {
      const memory = this.testResults.performance.memory;
      const usageRatio = memory.used / memory.total;
      if (usageRatio > 0.7) {
        issues.push({
          type: 'memory',
          severity: 'warning',
          message: '内存使用率较高，可能影响应用稳定性',
          details: memory
        });
      }
    }

    this.testResults.issues = issues;
  }

  // ========== 具体测试方法 ==========

  testLocalStorage() {
    try {
      const testKey = '__compatibility_test__';
      const testValue = 'test';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return {
        supported: true,
        working: retrieved === testValue
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message
      };
    }
  }

  testSessionStorage() {
    try {
      const testKey = '__compatibility_test__';
      const testValue = 'test';
      sessionStorage.setItem(testKey, testValue);
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return {
        supported: true,
        working: retrieved === testValue
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message
      };
    }
  }

  testIndexedDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve({ supported: false });
        return;
      }

      const request = indexedDB.open('__compatibility_test__', 1);
      request.onerror = () => resolve({ supported: false, error: '打开失败' });
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('__compatibility_test__');
        resolve({ supported: true, working: true });
      };
      request.onupgradeneeded = () => {
        // 数据库创建成功
      };
    });
  }

  testWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return { supported: !!gl };
    } catch (error) {
      return { supported: false, error: error.message };
    }
  }

  testLocalStorageQuota() {
    try {
      let total = 0;
      let used = 0;
      
      // 估算已使用空间
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          used += key.length + (value ? value.length : 0);
        }
      }
      
      // 典型配额（不同浏览器不同）
      total = 5 * 1024 * 1024; // 5MB
      
      return { used, total, percentage: (used / total) * 100 };
    } catch (error) {
      return { used: 0, total: 0, percentage: 0, error: error.message };
    }
  }

  getReactVersion() {
    return {
      version: React?.version || 'unknown',
      available: !!React
    };
  }

  detectWebView() {
    const ua = navigator.userAgent.toLowerCase();
    let version = null;
    
    // 检测Android WebView
    const webViewMatch = ua.match(/wv\/([\d.]+)/) || ua.match(/version\/([\d.]+)/);
    if (webViewMatch) {
      version = parseFloat(webViewMatch[1]);
    }
    
    return {
      isWebView: ua.includes('wv') || ua.includes('version/'),
      version: version,
      userAgent: ua
    };
  }

  // 其他测试方法...
  testWebSQL() { return { supported: !!window.openDatabase }; }
  testCanvas() { return { supported: !!document.createElement('canvas').getContext }; }
  testVideo() { return { supported: !!document.createElement('video').canPlayType }; }
  testAudio() { return { supported: !!document.createElement('audio').canPlayType }; }
  testTouch() { return { supported: 'ontouchstart' in window }; }
  testGeolocation() { return { supported: 'geolocation' in navigator }; }
  testCamera() { return { supported: 'mediaDevices' in navigator && !!navigator.mediaDevices.getUserMedia }; }
  testMicrophone() { return { supported: 'mediaDevices' in navigator && !!navigator.mediaDevices.getUserMedia }; }
  testServiceWorker() { return { supported: 'serviceWorker' in navigator }; }
  testFetch() { return { supported: 'fetch' in window }; }
  testWebSocket() { return { supported: 'WebSocket' in window }; }

  async runPerformanceBenchmark() {
    // 简单的计算性能测试
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i) * Math.sin(i);
    }
    return sum;
  }

  getCapacitorInfo() {
    return {
      available: !!window.Capacitor,
      plugins: window.Capacitor?.Plugins ? Object.keys(window.Capacitor.Plugins) : []
    };
  }

  getChartJSVersion() {
    return {
      available: !!window.Chart,
      version: window.Chart?.version || 'unknown'
    };
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const report = {
      summary: {
        totalTests: Object.keys(this.testResults.capabilities).length,
        passed: Object.values(this.testResults.capabilities).filter(c => c.supported).length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        timestamp: this.testResults.timestamp
      },
      details: this.testResults,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * 生成优化建议
   */
  generateRecommendations() {
    const recommendations = [];
    const issues = this.testResults.issues;

    issues.forEach(issue => {
      switch (issue.type) {
        case 'storage':
          recommendations.push({
            type: 'optimization',
            priority: 'medium',
            title: '优化存储使用',
            description: '考虑清理不必要的缓存数据或使用更高效的存储方案',
            action: '实现自动清理机制和存储配额监控'
          });
          break;

        case 'webview':
          recommendations.push({
            type: 'compatibility',
            priority: 'high',
            title: 'WebView版本兼容性',
            description: '检测到低版本WebView，可能影响功能',
            action: '添加降级方案或提示用户更新WebView'
          });
          break;

        case 'memory':
          recommendations.push({
            type: 'performance',
            priority: 'medium',
            title: '内存优化',
            description: '内存使用率较高，可能影响应用稳定性',
            action: '优化组件渲染，减少内存泄漏风险'
          });
          break;
      }
    });

    // 通用建议
    if (!this.testResults.capabilities.localStorage.supported) {
      recommendations.push({
        type: 'fallback',
        priority: 'high',
        title: 'localStorage不可用',
        description: '需要实现替代存储方案',
        action: '使用内存存储或服务端存储作为后备'
      });
    }

    return recommendations;
  }

  /**
   * 导出测试结果到控制台
   */
  logResults() {
    console.group('兼容性测试结果');
    console.log('环境信息:', this.testResults.environment);
    console.log('能力支持:', this.testResults.capabilities);
    console.log('依赖信息:', this.testResults.dependencies);
    console.log('性能数据:', this.testResults.performance);
    
    if (this.testResults.issues.length > 0) {
      console.warn('检测到问题:', this.testResults.issues);
    }
    
    console.groupEnd();
  }
}

// 创建全局实例
export const compatibilityTester = new CompatibilityTester();

// 快捷方法
export const runCompatibilityTest = () => compatibilityTester.runFullTestSuite();
export const getTestResults = () => compatibilityTester.testResults;

export default CompatibilityTester;