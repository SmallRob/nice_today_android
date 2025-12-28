import React from 'react';

/**
 * 版本管理工具
 * 处理应用版本检查、缓存管理和自动更新
 */

// 版本存储键名
const STORAGE_KEYS = {
  APP_VERSION: 'app-version',
  CACHE_VERSION: 'cache-version',
  LAST_CHECK: 'version-last-check',
  CHUNK_HASHES: 'chunk-hashes'
};

// 检查间隔（毫秒）- 5分钟
const CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * 获取当前应用版本
 * @returns {Promise<string>} - 版本字符串
 */
export const getCurrentVersion = async () => {
  try {
    // 优先从version.json获取版本信息
    const response = await fetch('/version.json', { 
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (response.ok) {
      const versionData = await response.json();
      return versionData.version || 'unknown';
    }
  } catch (error) {
    console.warn('从version.json获取版本失败:', error);
  }
  
  try {
    // 从package.json获取版本信息
    const packageVersion = require('../../package.json').version;
    if (packageVersion) {
      return packageVersion;
    }
  } catch (error) {
    console.warn('从package.json获取版本失败:', error);
  }
  
  // 从构建manifest获取版本信息
  try {
    const manifestResponse = await fetch('/asset-manifest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      const entryPoints = Object.values(manifest.files || {});
      if (entryPoints.length > 0) {
        // 从文件路径提取可能的版本信息或哈希
        const mainJs = entryPoints.find(file => file.includes('main.') && file.endsWith('.js'));
        if (mainJs) {
          const hashMatch = mainJs.match(/\.([a-f0-9]{8,})\.js$/);
          return hashMatch ? hashMatch[1] : 'unknown';
        }
      }
    }
  } catch (error) {
    console.warn('从manifest获取版本失败:', error);
  }
  
  return 'unknown';
};

/**
 * 获取存储的版本信息
 * @returns {Object} - 版本信息对象
 */
export const getStoredVersion = () => {
  try {
    return {
      appVersion: localStorage.getItem(STORAGE_KEYS.APP_VERSION) || null,
      cacheVersion: localStorage.getItem(STORAGE_KEYS.CACHE_VERSION) || null,
      lastCheck: parseInt(localStorage.getItem(STORAGE_KEYS.LAST_CHECK) || '0', 10)
    };
  } catch (error) {
    console.warn('获取存储的版本信息失败:', error);
    return {
      appVersion: null,
      cacheVersion: null,
      lastCheck: 0
    };
  }
};

/**
 * 保存版本信息
 * @param {string} appVersion - 应用版本
 * @param {string} [cacheVersion] - 缓存版本
 */
export const saveVersionInfo = (appVersion, cacheVersion) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, appVersion);
    if (cacheVersion) {
      localStorage.setItem(STORAGE_KEYS.CACHE_VERSION, cacheVersion);
    }
    localStorage.setItem(STORAGE_KEYS.LAST_CHECK, Date.now().toString());
  } catch (error) {
    console.warn('保存版本信息失败:', error);
  }
};

/**
 * 检查是否需要更新缓存
 * @returns {Promise<boolean>} - 是否需要更新缓存
 */
export const shouldUpdateCache = async () => {
  const now = Date.now();
  const { lastCheck, appVersion } = getStoredVersion();
  
  // 如果从未检查过，则需要检查
  if (lastCheck === 0) {
    return true;
  }
  
  // 如果距离上次检查时间超过检查间隔，则需要检查
  if (now - lastCheck > CHECK_INTERVAL) {
    return true;
  }
  
  // 获取当前版本并比较
  try {
    const currentVersion = await getCurrentVersion();
    return currentVersion !== 'unknown' && currentVersion !== appVersion;
  } catch (error) {
    console.warn('检查版本更新失败:', error);
    return false;
  }
};

/**
 * 清理应用缓存
 * @param {boolean} [hardClear=false] - 是否强制清理所有缓存
 */
export const clearAppCache = async (hardClear = false) => {
  console.log(`清理应用缓存 (强制清理: ${hardClear})...`);
  
  // 清理本地存储
  try {
    if (hardClear) {
      localStorage.clear();
      sessionStorage.clear();
    } else {
      // 保留用户设置相关的存储
      const userSettingsKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('app-') && !key.includes('version')) {
          userSettingsKeys.push(key);
        }
      }
      
      const userSettings = {};
      userSettingsKeys.forEach(key => {
        userSettings[key] = localStorage.getItem(key);
      });
      
      // 清理所有存储
      localStorage.clear();
      sessionStorage.clear();
      
      // 恢复用户设置
      Object.entries(userSettings).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }
  } catch (error) {
    console.warn('清理本地存储失败:', error);
  }
  
  // 清理Service Worker缓存
  if ('serviceWorker' in navigator && hardClear) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('已清理Service Worker注册');
    } catch (error) {
      console.warn('清理Service Worker失败:', error);
    }
  }
  
  // 清理IndexedDB
  if (hardClear && indexedDB) {
    try {
      const databases = await indexedDB.databases();
      for (const database of databases) {
        if (database.name) {
          indexedDB.deleteDatabase(database.name);
        }
      }
      console.log('已清理IndexedDB数据库');
    } catch (error) {
      console.warn('清理IndexedDB失败:', error);
    }
  }
};

/**
 * 重新加载应用以应用更新
 * @param {boolean} [hardReload=false] - 是否强制硬刷新
 */
export const reloadApp = (hardReload = false) => {
  if (hardReload) {
    // 添加时间戳参数确保获取最新资源
    const url = new URL(window.location.href);
    url.searchParams.set('_v', Date.now());
    url.searchParams.set('_cache', 'bypass');
    window.location.href = url.toString();
  } else {
    window.location.reload();
  }
};

/**
 * 检查并处理应用更新
 * @param {Object} [options] - 选项
 * @returns {Promise<Object>} - 检查结果
 */
export const checkAndHandleUpdates = async (options = {}) => {
  const {
    autoClearCache = false,
    autoReload = false,
    hardReload = false,
    silent = false
  } = options;
  
  try {
    const needsUpdate = await shouldUpdateCache();
    
    if (!needsUpdate) {
      if (!silent) {
        console.log('应用已是最新版本');
      }
      return { updated: false, reason: 'no_update' };
    }
    
    const currentVersion = await getCurrentVersion();
    const { appVersion: storedVersion } = getStoredVersion();

    if (!silent) {
      console.log(`检测到数据版本同步: ${storedVersion || '未知'} → ${currentVersion}`);
    }
    
    // 如果需要自动清理缓存
    if (autoClearCache) {
      await clearAppCache(hardReload);
    }
    
    // 更新版本信息
    saveVersionInfo(currentVersion, currentVersion);
    
    // 如果需要自动重新加载
    if (autoReload) {
      reloadApp(hardReload);
    }
    
    return {
      updated: true,
      reason: 'version_mismatch',
      currentVersion,
      previousVersion: storedVersion,
      cacheCleared: autoClearCache
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    return { updated: false, reason: 'error', error: error.message };
  }
};

/**
 * 版本管理Hook
 * @returns {Object} - 版本管理工具函数
 */
export const useVersionManager = () => {
  const [versionInfo, setVersionInfo] = React.useState({
    current: null,
    stored: null,
    needsUpdate: false,
    lastCheck: null
  });
  
  const [isChecking, setIsChecking] = React.useState(false);
  
  // 检查版本更新
  const checkForUpdates = React.useCallback(async (options = {}) => {
    setIsChecking(true);
    try {
      const result = await checkAndHandleUpdates({
        silent: true,
        ...options
      });
      
      const current = await getCurrentVersion();
      const stored = getStoredVersion();
      
      setVersionInfo({
        current,
        stored: stored.appVersion,
        needsUpdate: result.updated,
        lastCheck: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('版本检查失败:', error);
      return { updated: false, reason: 'error', error: error.message };
    } finally {
      setIsChecking(false);
    }
  }, []);
  
  // 清理缓存并重新加载
  const clearAndReload = React.useCallback(async (hardReload = false) => {
    await clearAppCache(hardReload);
    reloadApp(hardReload);
  }, []);
  
  // 初始化时检查版本
  React.useEffect(() => {
    const initVersionCheck = async () => {
      const current = await getCurrentVersion();
      const stored = getStoredVersion();
      
      setVersionInfo({
        current,
        stored: stored.appVersion,
        needsUpdate: current !== 'unknown' && current !== stored.appVersion,
        lastCheck: stored.lastCheck || null
      });
      
      // 如果版本不匹配，检查是否需要更新
      if (current !== 'unknown' && current !== stored.appVersion) {
        await checkForUpdates();
      }
    };
    
    initVersionCheck();
  }, [checkForUpdates]);
  
  return {
    ...versionInfo,
    isChecking,
    checkForUpdates,
    clearAndReload,
    getCurrentVersion,
    getStoredVersion
  };
};

/**
 * 版本更新通知组件
 */
export const VersionUpdateNotification = ({ 
  onDismiss, 
  onApplyUpdate, 
  updateInfo 
}) => {
  const [countdown, setCountdown] = React.useState(10);
  const [autoApply, setAutoApply] = React.useState(true);
  
  React.useEffect(() => {
    if (!autoApply || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, autoApply]);
  
  React.useEffect(() => {
    if (autoApply && countdown === 0 && onApplyUpdate) {
      onApplyUpdate();
    }
  }, [countdown, autoApply, onApplyUpdate]);
  
  const handleApplyUpdate = () => {
    setAutoApply(false);
    if (onApplyUpdate) onApplyUpdate();
  };
  
  const handleDismiss = () => {
    setAutoApply(false);
    if (onDismiss) onDismiss();
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="font-medium">发现新版本</p>
            <p className="text-xs opacity-90">
              {updateInfo?.previousVersion || '未知'} → {updateInfo?.currentVersion || '最新'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {autoApply && (
            <div className="text-xs">
              自动应用更新 ({countdown}s)
            </div>
          )}
          
          <button
            onClick={handleApplyUpdate}
            className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            立即更新
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-blue-700 text-white rounded text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
};

const VersionManager = {
  getCurrentVersion,
  getStoredVersion,
  saveVersionInfo,
  shouldUpdateCache,
  clearAppCache,
  reloadApp,
  checkAndHandleUpdates,
  useVersionManager,
  VersionUpdateNotification
};

export default VersionManager;