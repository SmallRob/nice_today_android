import React from 'react';
import { 
  clearAppCache, 
  reloadApp, 
  checkAndHandleUpdates 
} from './versionManager';

/**
 * ChunkLoadError 处理工具
 * 专门处理代码块加载失败的错误，提供自动恢复机制
 */

/**
 * 检测是否为ChunkLoadError
 * @param {Error} error - 错误对象
 * @returns {boolean} - 是否为ChunkLoadError
 */
export const isChunkLoadError = (error) => {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    (error?.message?.includes('chunk') && error?.message?.includes('failed'))
  );
};

// 移除重复的getAppVersion函数，使用versionManager中的getCurrentVersion

/**
 * 清理应用缓存并重新加载
 * @param {boolean} forceHardReload - 是否强制硬刷新
 * @returns {Promise<void>}
 */
export const clearCacheAndReload = async (forceHardReload = false) => {
  try {
    console.log(`清理缓存并重新加载 (强制刷新: ${forceHardReload})...`);
    
    // 使用版本管理工具清理缓存
    await clearAppCache(forceHardReload);
    
    // 使用版本管理工具重新加载
    reloadApp(forceHardReload);
  } catch (error) {
    console.error('清理缓存失败:', error);
    // 如果清理失败，直接刷新页面
    if (forceHardReload) {
      const url = new URL(window.location.href);
      url.searchParams.set('_t', Date.now());
      window.location.href = url.toString();
    } else {
      window.location.reload();
    }
  }
};

/**
 * 获取错误恢复建议
 * @param {Error} error - 错误对象
 * @returns {Object} - 恢复建议
 */
export const getRecoverySuggestion = (error) => {
  const suggestions = {
    title: '代码加载失败',
    message: '应用部分资源加载失败，可能是由于应用更新或网络问题导致。',
    primaryAction: {
      text: '刷新页面',
      action: () => window.location.reload()
    },
    secondaryActions: [
      {
        text: '清除缓存重试',
        action: () => clearCacheAndReload()
      }
    ],
    troubleshooting: [
      '检查网络连接是否正常',
      '如果问题持续存在，请尝试关闭应用后重新打开',
      '如果使用的是移动设备，请尝试清理应用缓存'
    ]
  };

  // 根据错误类型调整建议
  if (isChunkLoadError(error)) {
    const chunkMatch = error.message.match(/chunk\s+(\d+)/);
    const chunkId = chunkMatch ? chunkMatch[1] : '未知';
    
    return {
      ...suggestions,
      message: `代码块 ${chunkId} 加载失败。这通常是因为应用已更新，但您仍在访问旧版本。`,
      technicalInfo: {
        errorType: 'ChunkLoadError',
        chunkId,
        failedUrl: error.message.match(/(https?:\/\/[^\s]+)/)?.[1] || '未知'
      }
    };
  }

  return suggestions;
};

/**
 * 增强的错误恢复Hook
 * @returns {Object} - 错误恢复工具函数
 */
export const useChunkErrorRecovery = () => {
  const handleChunkError = async (error) => {
    if (!isChunkLoadError(error)) return false;
    
    console.log('检测到ChunkLoadError，尝试自动恢复...');
    
    // 记录错误
    const errorInfo = {
      type: 'ChunkLoadError',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      // 尝试将错误信息发送到日志服务
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(errorInfo)], { 
          type: 'application/json' 
        });
        navigator.sendBeacon('/api/logs/error', blob);
      }
    } catch (e) {
      console.warn('无法发送错误日志:', e);
    }
    
    // 检查是否是版本更新问题
    try {
      const updateResult = await checkAndHandleUpdates({
        autoClearCache: true,
        autoReload: false, // 不自动重新加载，由我们控制
        hardReload: true
      });
      
      if (updateResult.updated) {
        console.log(`检测到版本更新，准备重新加载...`);
        await clearCacheAndReload(true); // 强制硬刷新
        return true;
      }
    } catch (e) {
      console.warn('版本检查失败:', e);
    }
    
    // 延迟后尝试刷新
    setTimeout(() => {
      clearCacheAndReload();
    }, 1000);
    
    return true;
  };
  
  const checkChunkHealth = () => {
    // 检查关键chunk是否正常加载
    const scripts = document.querySelectorAll('script[src]');
    const chunkScripts = Array.from(scripts).filter(script => 
      script.src.includes('chunk') && !script.src.includes('runtime')
    );
    
    let hasFailedChunks = false;
    
    chunkScripts.forEach(script => {
      // 检查脚本是否加载失败
      if (!script.crossOrigin && script.naturalWidth === 0 && script.naturalHeight === 0) {
        console.warn(`潜在失败的chunk: ${script.src}`);
        hasFailedChunks = true;
      }
    });
    
    return !hasFailedChunks;
  };
  
  return {
    handleChunkError,
    checkChunkHealth,
    clearCacheAndReload,
    getRecoverySuggestion,
    isChunkLoadError
  };
};

/**
 * ChunkLoadError边界组件
 * 专门用于捕获和处理代码块加载错误
 */
class ChunkLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasChunkError: false,
      error: null,
      retryCount: 0,
      maxRetries: props.maxRetries || 3
    };
    
    // 全局错误监听器
    this.globalErrorHandler = null;
  }
  
  componentDidMount() {
    // 添加全局错误监听器
    this.globalErrorHandler = (event) => {
      if (isChunkLoadError(event.error)) {
        this.handleChunkLoadError(event.error);
      }
    };
    
    window.addEventListener('error', this.globalErrorHandler);
    
    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (isChunkLoadError(event.reason)) {
        this.handleChunkLoadError(event.reason);
      }
    });
  }
  
  componentWillUnmount() {
    if (this.globalErrorHandler) {
      window.removeEventListener('error', this.globalErrorHandler);
    }
    window.removeEventListener('unhandledrejection', this.globalErrorHandler);
  }
  
  handleChunkLoadError = async (error) => {
    const { retryCount, maxRetries } = this.state;
    
    if (retryCount >= maxRetries) {
      console.error(`达到最大重试次数 (${maxRetries})，停止重试`);
      this.setState({
        hasChunkError: true,
        error,
        retryCount: 0
      });
      return;
    }
    
    console.log(`处理ChunkLoadError (重试 ${retryCount + 1}/${maxRetries}):`, error.message);
    
    // 更新重试计数
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));
    
    // 根据重试次数采用不同策略
    let delay = 1000; // 基础延迟1秒
    
    if (retryCount === 0) {
      // 第一次重试：直接刷新
      delay = 500;
    } else if (retryCount === 1) {
      // 第二次重试：清理缓存后刷新
      await clearCacheAndReload();
      return;
    } else {
      // 第三次重试：强制硬刷新
      delay = 2000;
    }
    
    // 延迟后执行重试
    setTimeout(() => {
      if (retryCount < maxRetries - 1) {
        window.location.reload();
      } else {
        // 最后一次重试失败，显示错误界面
        this.setState({
          hasChunkError: true,
          error
        });
      }
    }, delay);
  };
  
  handleManualRetry = () => {
    this.setState({
      hasChunkError: false,
      error: null,
      retryCount: 0
    });
    
    clearCacheAndReload(true);
  };
  
  handleReset = () => {
    this.setState({
      hasChunkError: false,
      error: null,
      retryCount: 0
    });
  };
  
  render() {
    if (!this.state.hasChunkError) {
      return this.props.children;
    }
    
    const { error } = this.state;
    const suggestion = getRecoverySuggestion(error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* 错误图标 */}
          <div className="bg-red-500 dark:bg-red-600 p-6 flex items-center justify-center">
            <div className="text-white text-6xl">📦</div>
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
                  {suggestion.title}
                </h2>
                <p className="text-gray-600 dark:text-white text-sm">
                  {suggestion.message}
                </p>
              </div>
            </div>

            {/* 技术信息 */}
            {suggestion.technicalInfo && (
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">技术信息</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>错误类型: {suggestion.technicalInfo.errorType}</div>
                  <div>代码块ID: {suggestion.technicalInfo.chunkId}</div>
                  <div>失败URL: {suggestion.technicalInfo.failedUrl}</div>
                </div>
              </div>
            )}

            {/* 故障排除建议 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm mb-2">故障排除建议</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                {suggestion.troubleshooting.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={suggestion.primaryAction.action}
                className="flex-1 min-w-[120px] px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{suggestion.primaryAction.text}</span>
              </button>

              {suggestion.secondaryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{action.text}</span>
                </button>
              ))}
            </div>

            {/* 重试计数 */}
            {this.state.retryCount > 0 && (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                已自动重试 {this.state.retryCount} 次
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ChunkLoadErrorBoundary;