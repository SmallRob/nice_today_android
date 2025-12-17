/**
 * 应用崩溃调试脚本
 * 用于收集和分析崩溃原因
 */

// 1. 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  logCrashInfo('error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// 2. Promise错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  logCrashInfo('unhandledRejection', {
    reason: event.reason?.toString?.() || event.reason,
    stack: event.reason?.stack
  });
});

// 3. 记录崩溃信息到本地存储
const logCrashInfo = (type, info) => {
  try {
    const crashLog = JSON.parse(localStorage.getItem('crashLog') || '[]');
    crashLog.push({
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      info
    });
    
    // 只保留最近10条记录
    if (crashLog.length > 10) {
      crashLog.shift();
    }
    
    localStorage.setItem('crashLog', JSON.stringify(crashLog));
  } catch (e) {
    console.error('Failed to log crash info:', e);
  }
};

// 4. 获取崩溃日志
export const getCrashLog = () => {
  try {
    return JSON.parse(localStorage.getItem('crashLog') || '[]');
  } catch (e) {
    console.error('Failed to get crash log:', e);
    return [];
  }
};

// 5. 清除崩溃日志
export const clearCrashLog = () => {
  localStorage.removeItem('crashLog');
};

// 6. 检查常见问题
export const diagnoseCommonIssues = () => {
  const issues = [];
  
  // 检查React Router版本
  if (window.ReactRouterDOM) {
    const version = window.ReactRouterDOM.version;
    if (version && version.startsWith('7.')) {
      issues.push({
        type: 'react-router',
        message: 'React Router v7 detected, which may have breaking changes',
        solution: 'Consider downgrading to React Router v6 or update routing code'
      });
    }
  }
  
  // 检查Capacitor
  if (window.Capacitor) {
    const platform = window.Capacitor.getPlatform();
    console.log('Running on platform:', platform);
    
    if (platform === 'android') {
      const webViewVersion = getWebViewVersion();
      if (webViewVersion < 65) {
        issues.push({
          type: 'webview',
          message: `WebView version ${webViewVersion} is below minimum supported version (65)`,
          solution: 'Update system WebView through app store'
        });
      }
    }
  } else {
    issues.push({
      type: 'capacitor',
      message: 'Capacitor not loaded',
      solution: 'Ensure Capacitor is properly initialized'
    });
  }
  
  // 检查内存使用
  if (performance && performance.memory) {
    const memoryInfo = performance.memory;
    const usedMemoryMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
    if (usedMemoryMB > 100) { // 100MB
      issues.push({
        type: 'memory',
        message: `High memory usage: ${usedMemoryMB}MB`,
        solution: 'Check for memory leaks and optimize memory usage'
      });
    }
  }
  
  return issues;
};

// 7. 获取WebView版本
const getWebViewVersion = () => {
  if (navigator.userAgent) {
    const match = navigator.userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }
  return 80; // 默认值
};

// 8. 生成诊断报告
export const generateDiagnosticReport = () => {
  const issues = diagnoseCommonIssues();
  const crashLog = getCrashLog();
  
  return {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    platform: window.Capacitor ? window.Capacitor.getPlatform() : 'unknown',
    webViewVersion: window.Capacitor ? getWebViewVersion() : 'unknown',
    issues,
    crashLog
  };
};

// 9. 在控制台显示诊断结果
export const showDiagnosticReport = () => {
  const report = generateDiagnosticReport();
  console.group('App Diagnostic Report');
  console.log('Platform:', report.platform);
  console.log('WebView Version:', report.webViewVersion);
  console.log('Issues:', report.issues);
  
  if (report.crashLog.length > 0) {
    console.group('Crash Log');
    report.crashLog.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.type} at ${new Date(entry.timestamp).toLocaleString()}:`, entry.info);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return report;
};

// 10. 自动显示诊断结果（在开发环境中）
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保页面加载完成
  setTimeout(showDiagnosticReport, 3000);
}