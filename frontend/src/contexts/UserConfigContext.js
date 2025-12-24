import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import { errorLogger } from '../utils/errorLogger';

// 创建全局配置上下文
const UserConfigContext = createContext();

// 全局配置提供者组件
export const UserConfigProvider = ({ children }) => {
  const [configManagerReady, setConfigManagerReady] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 统一初始化配置管理器
  const initializeConfigManager = useCallback(async () => {
    if (configManagerReady) return true;

    try {
      setLoading(true);
      setError(null);
      
      if (!userConfigManager.initialized) {
        await userConfigManager.initialize();
      }
      
      const configData = userConfigManager.getCurrentConfig();
      const allConfigs = userConfigManager.getAllConfigs();
      
      setCurrentConfig(configData);
      setConfigs(allConfigs);
      setConfigManagerReady(true);
      
      return true;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'initializeConfigManager',
        errorType: 'ConfigInitError'
      });
      console.error('配置管理器初始化失败:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [configManagerReady]);

  // 监听配置变化
  useEffect(() => {
    if (!configManagerReady) return;

    const handleConfigChange = ({
      configs: updatedConfigs,
      activeConfigIndex: updatedActiveIndex,
      currentConfig: updatedCurrentConfig,
      forceReload
    }) => {
      setCurrentConfig(updatedCurrentConfig);
      setConfigs(updatedConfigs);
    };

    const removeListener = userConfigManager.addListener(handleConfigChange);

    return () => {
      if (removeListener) removeListener();
    };
  }, [configManagerReady]);

  // 应用启动时自动初始化
  useEffect(() => {
    initializeConfigManager();
  }, [initializeConfigManager]);

  // 更新配置
  const updateConfig = useCallback(async (index, config) => {
    try {
      userConfigManager.updateConfig(index, config);
      // 监听器会自动更新状态
      return true;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'updateConfig',
        configIndex: index
      });
      console.error('更新配置失败:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // 添加新配置
  const addConfig = useCallback(async (config) => {
    try {
      userConfigManager.addConfig(config);
      // addConfig 方法内部已经自动设置新配置为活跃配置，不需要额外调用 setActiveConfig
      // 监听器会自动更新状态
      return true;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'addConfig',
        configData: config
      });
      console.error('添加配置失败:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // 删除配置
  const deleteConfig = useCallback(async (index) => {
    try {
      await userConfigManager.deleteConfig(index);
      // 监听器会自动更新状态
      return true;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'deleteConfig',
        configIndex: index
      });
      console.error('删除配置失败:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // 切换当前配置
  const switchConfig = useCallback(async (index) => {
    try {
      await userConfigManager.switchToConfig(index);
      // 监听器会自动更新状态
      return true;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'switchConfig',
        configIndex: index
      });
      console.error('切换配置失败:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const value = {
    configManagerReady,
    currentConfig,
    configs,
    loading,
    error,
    initializeConfigManager,
    updateConfig,
    addConfig,
    deleteConfig,
    switchConfig
  };

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  );
};

// 使用配置的Hook
export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  
  if (!context) {
    // 降级处理：直接使用配置管理器
    return {
      configManagerReady: userConfigManager.initialized,
      currentConfig: userConfigManager.getCurrentConfig(),
      configs: userConfigManager.getAllConfigs(),
      loading: false,
      error: null,
      initializeConfigManager: () => userConfigManager.initialize(),
      updateConfig: (index, config) => userConfigManager.updateConfig(index, config),
      addConfig: (config) => userConfigManager.addConfig(config),
      deleteConfig: (index) => userConfigManager.deleteConfig(index),
      switchConfig: (index) => userConfigManager.switchToConfig(index)
    };
  }
  
  return context;
};

// 配置数据Hook（简化版，只返回当前配置）
export const useCurrentConfig = () => {
  const { currentConfig, configManagerReady } = useUserConfig();
  
  // 如果全局上下文不可用，直接返回配置管理器的当前配置
  if (!configManagerReady && !userConfigManager.initialized) {
    // 尝试初始化
    userConfigManager.initialize().catch(console.error);
  }
  
  return currentConfig || userConfigManager.getCurrentConfig();
};

export default UserConfigContext;