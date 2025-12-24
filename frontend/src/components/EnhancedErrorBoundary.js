import React, { useState, useEffect, useCallback } from 'react';
import { errorLogger } from '../utils/errorLogger';

/**
 * 增强版错误边界组件
 * 捕获子组件中的错误，记录日志，并提供友好的错误界面
 */
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误到日志服务
    const errorLog = errorLogger.log(error, {
      component: this.props.componentName || 'ErrorBoundary',
      action: 'componentDidCatch',
      errorInfo: errorInfo
    });

    this.setState({
      error,
      errorInfo,
      errorLog
    });

    // 调用自定义错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorLog);
    }
  }

  componentDidUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorLog: null
    });
  };

  handleRetry = () => {
    this.handleReset();
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // 默认重试：重新加载页面
      window.location.reload();
    }
  };

  handleShowDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  handleExportError = () => {
    const logs = errorLogger.exportLogs();
    
    // 创建 Blob 并下载
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  handleClearLogs = () => {
    errorLogger.clearLogs();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, errorLog, showDetails } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* 错误图标 */}
          <div className="bg-red-500 dark:bg-red-600 p-6 flex items-center justify-center">
            <div className="text-white text-6xl">⚠️</div>
          </div>

          {/* 错误信息 */}
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  应用遇到错误
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  很抱歉，应用运行时遇到了意外错误。请尝试以下操作：
                </p>
              </div>
            </div>

            {/* 错误消息 */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-red-500 text-lg flex-shrink-0">🔴</span>
                <div className="flex-1 min-w-0">
                  <p className="text-red-900 dark:text-red-300 font-medium text-sm break-words">
                    {error?.message || error?.toString() || '未知错误'}
                  </p>
                  {errorLog && (
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      类型: {errorLog.type} • 组件: {errorLog.context.component}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 错误堆栈（开发模式或展开时显示） */}
            {(process.env.NODE_ENV === 'development' || showDetails) && (
              <details className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" open={showDetails}>
                <summary 
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 font-medium text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={this.handleShowDetails}
                >
                  <div className="flex items-center justify-between">
                    <span>查看详细错误信息</span>
                    <span className="text-gray-500">{showDetails ? '▼' : '▶'}</span>
                  </div>
                </summary>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {/* 堆栈信息 */}
                  {error?.stack && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">堆栈追踪</h4>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* 组件堆栈 */}
                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">组件堆栈</h4>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  {/* 错误上下文 */}
                  {errorLog && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">错误上下文</h4>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(errorLog.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* 错误统计 */}
            {errorLogger.getStats().total > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-500 text-lg">📊</span>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm">错误统计</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总错误数:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-300">{errorLogger.getStats().total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">24小时内:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-300">{errorLogger.getStats().recent24h}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 min-w-[120px] px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>重试</span>
              </button>

              <button
                onClick={this.handleShowDetails}
                className="flex-1 min-w-[120px] px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{showDetails ? '隐藏详情' : '显示详情'}</span>
              </button>

              <button
                onClick={this.handleExportError}
                className="flex-1 min-w-[120px] px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>导出日志</span>
              </button>
            </div>

            {/* 清除日志按钮 */}
            <button
              onClick={this.handleClearLogs}
              className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              清除所有错误日志
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Hook 用于在组件外部访问错误日志
 */
export const useErrorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // 初始加载
    setLogs(errorLogger.getLogs());
    setStats(errorLogger.getStats());

    // 监听日志变化
    const removeListener = errorLogger.addListener((errorLog, action) => {
      setLogs(errorLogger.getLogs());
      setStats(errorLogger.getStats());
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const clearLogs = useCallback(() => {
    errorLogger.clearLogs();
  }, []);

  const exportLogs = useCallback(() => {
    return errorLogger.exportLogs();
  }, []);

  return {
    logs,
    stats,
    clearLogs,
    exportLogs,
    getRecentErrors: () => errorLogger.getRecentErrors(),
    getLastError: () => errorLogger.getLastError()
  };
};

export default EnhancedErrorBoundary;
