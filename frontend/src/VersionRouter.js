import App from './App'; // 完整版应用
import AppLite from './lite/AppLite'; // 轻量版应用
import versionDetector from './utils/versionDetector'; // 版本检测器
import { useNotification } from './context/NotificationContext';
import updateCheckService from './utils/updateCheckService';
import { getAppVersion } from './utils/capacitor';

const VersionRouter = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  // 检查更新的函数
  const checkForUpdates = async () => {
    try {
      // 获取API基础URL（从本地存储或使用默认值）
      const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'https://nice-mcp.leansoftx.com/api';

      // 获取当前版本信息
      const versionInfo = await getAppVersion();

      // 执行更新检查
      const result = await updateCheckService.checkForUpdate(versionInfo.version, apiBaseUrl);

      if (result && result.hasUpdate) {
        showUpdateNotification(result);
      }

    } catch (error) {
      console.warn('自动更新检查失败:', error.message);
    }
  };

  // 显示更新通知的统一入口
  const showUpdateNotification = (updateInfo) => {
    showNotification({
      type: 'update',
      title: '发现新版本',
      message: `新版本 ${updateInfo.serverVersion} 已提供，包含重要改进和新功能。`,
      actions: [
        {
          label: '立即更新',
          primary: true,
          onClick: () => {
            if (updateInfo.updateUrl) window.open(updateInfo.updateUrl, '_blank');
          }
        },
        {
          label: '以后再说',
          onClick: () => {
            updateCheckService.clearUpdateInfo();
          }
        }
      ]
    });
  };

  useEffect(() => {
    const initializeVersionRouting = async () => {
      try {
        // 初始化版本检测器
        const version = await versionDetector.initialize();

        // 设置当前版本
        setCurrentVersion(version);

        // 根据版本自动跳转到相应页面
        versionDetector.autoRedirect();

        setIsLoading(false);
      } catch (error) {
        console.error('版本路由初始化失败:', error);

        // 降级处理：使用默认版本
        setCurrentVersion('lite');
        setIsLoading(false);
      }
    };

    initializeVersionRouting();

    // 监听全局更新通知事件（供其他页面手动触发）
    const handleShowUpdateEvent = (event) => {
      showUpdateNotification(event.detail);
    };

    window.addEventListener('showUpdateNotification', handleShowUpdateEvent);

    // 应用启动 2 秒后检查更新
    const updateTimer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => {
      window.removeEventListener('showUpdateNotification', handleShowUpdateEvent);
      clearTimeout(updateTimer);
    };
  }, []);

  // 添加版本变化监听器
  useEffect(() => {
    if (!currentVersion) return;

    const removeListener = versionDetector.addVersionChangeListener((detail) => {
      console.log('检测到版本变化:', detail);
      setCurrentVersion(detail.version);

      // 版本变化后重新执行自动跳转
      versionDetector.autoRedirect();
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, [currentVersion]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f8fafc',
        color: '#374151'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>正在检测应用版本...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 根据版本渲染相应的应用
  if (currentVersion === 'lite') {
    return <AppLite />;
  } else {
    return <App />;
  }
};

export default VersionRouter;