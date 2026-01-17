import React, { lazy, Suspense } from 'react';
import '../index.css';

// 懒加载用户配置管理器
const UserConfigManager = lazy(() => import('../components/UserConfigManager'));

// 配置错误边界组件
const ConfigErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('ConfigErrorBoundary 捕获到错误:', error);
      setHasError(true);
      setErrorInfo(error?.message || '未知错误');
    };

    // 监听全局错误
    const errorHandler = (event) => {
      event.preventDefault();
      handleError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="p-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-400 rounded-lg">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">配置加载失败</h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {errorInfo || '配置管理器加载失败，请刷新页面重试'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          刷新页面
        </button>
      </div>
    );
  }

  return children;
};

// 组件加载占位符
const ComponentLoadingFallback = ({ componentName = '组件' }) => (
  <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
    <span className="text-sm text-gray-600 dark:text-gray-400">加载{componentName}中...</span>
  </div>
);

function UserConfigPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" style={{ minHeight: '-webkit-fill-available', width: '100%' }}>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 8px' }}>
        <div className="w-full mx-auto px-3 py-4" style={{ maxWidth: '100vw', minWidth: '100%', boxSizing: 'border-box' }}>
          <ConfigErrorBoundary fallback={
            <div className="p-4" style={{ maxWidth: '100%', margin: '0 auto' }}>
              <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">用户配置加载失败</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  配置管理器遇到问题。可能是网络问题或存储空间不足。
                </p>
              </div>
              <div className="space-y-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
                <button
                  onClick={() => {
                    console.log('尝试清除存储并重置');
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    } catch (e) {
                      console.error('清除存储失败:', e);
                    }
                  }}
                  className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                  style={{ maxWidth: '100%', minWidth: '100%' }}
                >
                  清除存储并重置
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  style={{ maxWidth: '100%', minWidth: '100%' }}
                >
                  刷新页面
                </button>
              </div>
            </div>
          }>
            <Suspense fallback={<ComponentLoadingFallback componentName="用户配置管理器" />}>
              <UserConfigManager />
            </Suspense>
          </ConfigErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default UserConfigPage;
