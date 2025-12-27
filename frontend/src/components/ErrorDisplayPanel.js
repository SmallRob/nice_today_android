import { useState, useEffect } from 'react';
import { useErrorLogs } from './EnhancedErrorBoundary';
import { errorTrackingSettings } from '../utils/errorTrackingSettings';

/**
 * 前台错误显示面板
 * 在应用右下角显示错误通知，提供快速访问错误日志的方式
 */
const ErrorDisplayPanel = () => {
  const { logs, stats, clearLogs, exportLogs } = useErrorLogs();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(() => {
    return errorTrackingSettings.isEnabled();
  });

  // 监听追踪设置变化 - 必须在所有条件返回之前调用
  useEffect(() => {
    // 使用 setInterval 定期检查设置变化
    const checkInterval = setInterval(() => {
      const enabled = errorTrackingSettings.isEnabled();
      if (enabled !== trackingEnabled) {
        setTrackingEnabled(enabled);
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, [trackingEnabled]);

  // 如果错误追踪未启用，不显示面板
  if (!trackingEnabled) {
    return null;
  }

  // 如果没有错误，不显示面板
  if (!stats || stats.total === 0) {
    return null;
  }

  // 最近的5条错误
  const recentErrors = logs.slice(0, 5);

  // 获取错误类型对应的颜色
  const getErrorColor = (type) => {
    const colorMap = {
      'Error': 'red',
      'TypeError': 'red',
      'ReferenceError': 'red',
      'SyntaxError': 'red',
      'ChunkLoadError': 'orange',
      'NetworkError': 'orange',
      'ResourceError': 'yellow',
      'PromiseRejection': 'yellow'
    };
    return colorMap[type] || 'gray';
  };

  // 获取错误类型对应的图标
  const getErrorIcon = (type) => {
    const iconMap = {
      'Error': '🔴',
      'TypeError': '🔴',
      'ReferenceError': '🔴',
      'SyntaxError': '🔴',
      'ChunkLoadError': '⚠️',
      'NetworkError': '🌐',
      'ResourceError': '📦',
      'PromiseRejection': '⚡'
    };
    return iconMap[type] || '❓';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          style={{ width: '60px', height: '60px' }}
          title={`查看错误日志 (${stats.total}个错误)`}
        >
          <span className="text-2xl">🔴</span>
          <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-red-500">
            {stats.total > 99 ? '99+' : stats.total}
          </span>
        </button>
      )}

      {/* 错误面板 */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full md:w-[480px] md:bottom-6 md:right-6 bg-white dark:bg-gray-800 rounded-t-xl md:rounded-xl shadow-2xl transition-all duration-300 max-h-[80vh] flex flex-col">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔴</span>
                <div>
                  <h3 className="font-bold text-lg">错误日志</h3>
                  <p className="text-sm text-red-100">
                    共 {stats.total} 个错误，最近24小时 {stats.recent24h} 个
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-100 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentErrors.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-white">
                <span className="text-4xl mb-3 block">✅</span>
                <p>暂无错误日志</p>
              </div>
              ) : (
                recentErrors.map((log) => {
                  const color = getErrorColor(log.type);
                  const icon = getErrorIcon(log.type);
                  const colorClasses = {
                    red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/50',
                    orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50',
                    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50',
                    gray: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700/50'
                  };

                  return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${colorClasses[color] || colorClasses.gray}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                            {log.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-white">
                            {log.type} • {log.context.component}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportLogs()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm">导出日志</span>
              </button>
              <button
                onClick={() => clearLogs()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm">清除日志</span>
              </button>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              刷新应用
            </button>
          </div>
        </div>
      )}

      {/* 错误详情弹窗 */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-red-500 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">错误详情</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white hover:text-red-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              {/* 错误信息 */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-2 mb-2">
                  <span className="text-red-500 text-xl">{getErrorIcon(selectedLog.type)}</span>
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-300">{selectedLog.message}</p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {selectedLog.type} • {new Date(selectedLog.timestamp).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 错误上下文 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">错误上下文</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 dark:text-white w-24 flex-shrink-0">组件:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{selectedLog.context.component}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 dark:text-white w-24 flex-shrink-0">动作:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{selectedLog.context.action}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 dark:text-white w-24 flex-shrink-0">路由:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{selectedLog.context.route}</span>
                  </div>
                </div>
              </div>

              {/* 错误堆栈 */}
              {selectedLog.stack && (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <h4 className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-medium text-gray-900 dark:text-white text-sm">
                    堆栈追踪
                  </h4>
                  <pre className="p-4 text-xs text-gray-700 dark:text-white overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorDisplayPanel;
