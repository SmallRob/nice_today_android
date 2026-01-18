import { lazy, Suspense, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../index.css';
import '../styles/userConfigPage.css';
import '../styles/userConfigManager.css';

const UserConfigManager = lazy(() => import('../components/UserConfigManager'));

function UserConfigPage() {
  const { themeMode } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('UserConfigPage 捕获到错误:', error);
      setHasError(true);
      setErrorInfo(error?.message || '未知错误');
    };

    const errorHandler = (event) => {
      event.preventDefault();
      handleError(event.error);
    };

    const rejectionHandler = (event) => {
      event.preventDefault();
      handleError(event.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('清除存储失败:', e);
      setErrorInfo('清除存储失败: ' + e.message);
    }
  };

  if (hasError) {
    return (
      <div className={`user-config-page ${themeMode === 'dark' ? 'dark' : ''}`}>
        <div className="user-config-container">
          <div className="user-config-header">
            <h1 className="user-config-title">⚠️ 加载失败</h1>
            <p className="user-config-subtitle">用户配置页面遇到问题</p>
          </div>
          
          <div className="user-config-content">
            <div className="user-config-error">
              <div className={`user-config-error-card ${themeMode === 'dark' ? 'dark' : ''}`}>
                <div className="user-config-error-icon">!</div>
                <h2 className="user-config-error-title">配置加载失败</h2>
                <p className="user-config-error-message">
                  {errorInfo || '配置管理器加载失败，请刷新页面重试'}
                </p>
                <div className="user-config-error-actions">
                  <button
                    onClick={() => window.location.reload()}
                    className="user-config-button"
                  >
                    🔄 刷新页面
                  </button>
                  <button
                    onClick={handleClearStorage}
                    className="user-config-button user-config-button-warning"
                  >
                    🗑️ 清除存储并重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-config-page ${themeMode === 'dark' ? 'dark' : ''}`}>
      <div className="user-config-container">
        <header className="user-config-header">
          <h1 className="user-config-title">👤 用户配置管理</h1>
          <p className="user-config-subtitle">管理您的个人设置和数据</p>
        </header>
        
        <main className="user-config-content">
          <Suspense
            fallback={
              <div className="user-config-loading">
                <div>
                  <div className="user-config-loading-spinner"></div>
                  <p className="user-config-loading-text">正在加载配置管理器...</p>
                </div>
              </div>
            }
          >
            <UserConfigManager />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default UserConfigPage;
