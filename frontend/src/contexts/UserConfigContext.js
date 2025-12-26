import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { enhancedUserConfigManager, DEFAULT_CONFIG } from '../utils/EnhancedUserConfigManager';
import { errorLogger } from '../utils/errorLogger';

// 创建全局配置上下文
const UserConfigContext = createContext();

// 默认出生时间（当数据缺失时使用）
const DEFAULT_BIRTH_TIME = '12:30';

// 默认经度（当数据缺失时使用）
const DEFAULT_LONGITUDE = 116.40;

// 默认纬度（当数据缺失时使用）
const DEFAULT_LATITUDE = 39.90;

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
      
      if (!enhancedUserConfigManager.initialized) {
        await enhancedUserConfigManager.initialize();
      }
      
      const configData = enhancedUserConfigManager.getCurrentConfig();
      const allConfigs = enhancedUserConfigManager.getAllConfigs();
      
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
      currentConfig: updatedCurrentConfig,
      forceReload
    }) => {
      console.log('UserConfigContext 配置变更:', {
        configsLength: updatedConfigs.length,
        currentConfigNickname: updatedCurrentConfig?.nickname,
        forceReload
      });
      // 立即更新所有状态，确保UI能实时刷新
      setCurrentConfig(updatedCurrentConfig);
      setConfigs(updatedConfigs);
    };

    const removeListener = enhancedUserConfigManager.addListener(handleConfigChange);

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
      const result = await enhancedUserConfigManager.updateConfigWithNodeUpdate(index, config);
      // 监听器会自动更新状态
      return result && result.success;
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
      const result = await enhancedUserConfigManager.addBasicConfig(config);
      // addBasicConfig 方法内部已经自动设置新配置为活跃配置，不需要额外调用 setActiveConfig
      // 监听器会自动更新状态
      return result;
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
      await enhancedUserConfigManager.removeConfig(index);
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
      await enhancedUserConfigManager.setActiveConfig(index);
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

  /**
   * 更新八字信息到配置
   * @param {string} nickname - 用户昵称
   * @param {Object} baziInfo - 八字信息对象
   * @returns {Promise<boolean>} 是否更新成功
   */
  const updateBaziInfo = useCallback(async (nickname, baziInfo) => {
    try {
      const success = await enhancedUserConfigManager.updateBaziInfo(nickname, baziInfo);
      return success;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'updateBaziInfo',
        nickname,
        errorType: 'BaziUpdateError'
      });
      console.error('更新八字信息失败:', err);
      return false;
    }
  }, []);

  /**
   * 从出生信息计算并更新八字
   * @param {string} nickname - 用户昵称
   * @param {Object} birthInfo - 出生信息
   * @returns {Promise<boolean>} 是否更新成功
   */
  const calculateAndSyncBazi = useCallback(async (nickname, birthInfo) => {
    try {
      // 验证参数
      if (!nickname || typeof nickname !== 'string') {
        console.error('calculateAndSyncBazi: 昵称参数无效', nickname);
        return false;
      }

      const success = await enhancedUserConfigManager.calculateAndSyncBaziInfo(nickname, birthInfo);
      return success;
    } catch (err) {
      errorLogger.log(err, {
        component: 'UserConfigContext',
        action: 'calculateAndSyncBazi',
        nickname,
        errorType: 'BaziCalculationError'
      });
      console.error('计算并同步八字信息失败:', err);
      return false;
    }
  }, []);

  /**
   * 获取有效的出生信息（使用默认值回退）
   * @param {Object} config - 配置对象
   * @returns {Object} 包含 birthDate, birthTime, longitude 的对象
   */
  const getValidBirthInfo = useCallback((config) => {
    return {
      birthDate: config?.birthDate || null,
      birthTime: config?.birthTime || DEFAULT_BIRTH_TIME,
      longitude: config?.birthLocation?.lng ?? DEFAULT_LONGITUDE,
      latitude: config?.birthLocation?.lat ?? DEFAULT_LATITUDE
    };
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
    switchConfig,
    updateBaziInfo,
    calculateAndSyncBazi,
    getValidBirthInfo
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
      configManagerReady: enhancedUserConfigManager.initialized === true,
      currentConfig: enhancedUserConfigManager.getCurrentConfig?.() || DEFAULT_CONFIG,
      configs: enhancedUserConfigManager.getAllConfigs?.() || [DEFAULT_CONFIG],
      loading: false,
      error: null,
      initializeConfigManager: () => enhancedUserConfigManager.initialize(),
      updateConfig: (index, config) => enhancedUserConfigManager.updateConfigWithNodeUpdate(index, config),
      addConfig: (config) => enhancedUserConfigManager.addBasicConfig(config),
      deleteConfig: (index) => enhancedUserConfigManager.removeConfig(index),
      switchConfig: (index) => enhancedUserConfigManager.setActiveConfig(index),
      updateBaziInfo: (nickname, baziInfo) => enhancedUserConfigManager.updateBaziInfo(nickname, baziInfo),
      calculateAndSyncBazi: (nickname, birthInfo) => enhancedUserConfigManager.calculateAndSyncBaziInfo(nickname, birthInfo),
      getValidBirthInfo: (config) => ({
        birthDate: config?.birthDate || null,
        birthTime: config?.birthTime || '12:30',
        longitude: config?.birthLocation?.lng ?? 116.40,
        latitude: config?.birthLocation?.lat ?? 39.90
      })
    };
  }

  return context;
};

// 配置数据Hook（简化版，只返回当前配置）
export const useCurrentConfig = () => {
  const { currentConfig, configManagerReady } = useUserConfig();

  // 如果全局上下文不可用，直接返回配置管理器的当前配置
  if (!configManagerReady && !enhancedUserConfigManager.initialized) {
    // 注意：初始化是异步的，此处不等待，组件需要处理可能的 null 值
    enhancedUserConfigManager.initialize().catch(console.error);
  }

  // enhancedUserConfigManager 的 getCurrentConfig 不支持 allowNull 参数，直接调用即可
  // 确保返回当前配置或管理器配置（不会为 null）
  return currentConfig || enhancedUserConfigManager.getCurrentConfig() || DEFAULT_CONFIG;
};

export default UserConfigContext;