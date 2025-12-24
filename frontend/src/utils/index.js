/**
 * 用户配置管理工具统一导出文件
 * 提供新版和旧版管理器的兼容性支持
 */

// 新版增强管理器
export { enhancedUserConfigManager } from './EnhancedUserConfigManager.js';
export { default as EnhancedUserConfigManager } from './EnhancedUserConfigManager.js';

// 数据持久化管理器
export { dataPersistenceManager } from './DataPersistenceManager.js';
export { default as DataPersistenceManager } from './DataPersistenceManager.js';

// 数据完整性管理器
export { dataIntegrityManager } from './DataIntegrityManager.js';
export { default as DataIntegrityManager } from './DataIntegrityManager.js';

// 生辰八字更新管理器
export { baziUpdateManager } from './BaziUpdateManager.js';
export { default as BaziUpdateManager } from './BaziUpdateManager.js';

// 配置迁移工具
export { configMigrationTool } from './ConfigMigrationTool.js';
export { default as ConfigMigrationTool } from './ConfigMigrationTool.js';

// 旧版管理器（保持兼容性）
export { userConfigManager } from './userConfigManager.js';
export { default as UserConfigManager } from './userConfigManager.js';

/**
 * 自动初始化函数
 * 自动检测并执行从旧版到新版的迁移
 */
export async function autoInitializeUserConfig() {
  try {
    console.log('开始自动初始化用户配置系统...');
    
    // 检查是否需要迁移
    const migrationCheck = await configMigrationTool.checkMigrationNeeded();
    
    if (migrationCheck.needed) {
      console.log('检测到需要迁移的旧版配置，开始自动迁移...');
      
      // 执行迁移
      const migrationResult = await configMigrationTool.performMigration();
      
      if (migrationResult.successful) {
        console.log('自动迁移成功，使用新版配置管理器');
        
        // 初始化新版管理器
        await enhancedUserConfigManager.initialize();
        return enhancedUserConfigManager;
        
      } else {
        console.warn('自动迁移失败，回退到旧版管理器');
        
        // 回滚迁移
        await configMigrationTool.rollbackMigration();
        
        // 初始化旧版管理器
        await userConfigManager.initialize();
        return userConfigManager;
      }
      
    } else if (migrationCheck.hasNewData) {
      console.log('检测到新版配置数据，直接使用新版管理器');
      
      // 初始化新版管理器
      await enhancedUserConfigManager.initialize();
      return enhancedUserConfigManager;
      
    } else {
      console.log('未检测到配置数据，初始化新版管理器');
      
      // 初始化新版管理器
      await enhancedUserConfigManager.initialize();
      return enhancedUserConfigManager;
    }
    
  } catch (error) {
    console.error('自动初始化失败:', error);
    
    // 紧急回退到旧版管理器
    try {
      await userConfigManager.initialize();
      return userConfigManager;
    } catch (fallbackError) {
      console.error('紧急回退也失败:', fallbackError);
      throw new Error('用户配置系统初始化完全失败');
    }
  }
}

/**
 * 获取当前活动的配置管理器
 */
export function getActiveConfigManager() {
  if (enhancedUserConfigManager.initialized) {
    return enhancedUserConfigManager;
  } else if (userConfigManager.initialized) {
    return userConfigManager;
  } else {
    return null;
  }
}

/**
 * 统一配置操作接口
 * 提供与旧版兼容的API，内部使用新版管理器
 */
export const userConfig = {
  /**
   * 获取当前配置
   */
  async getCurrentConfig() {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return manager.getCurrentConfig();
  },

  /**
   * 获取所有配置
   */
  async getAllConfigs() {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return manager.getAllConfigs();
  },

  /**
   * 更新配置
   */
  async updateConfig(index, updates) {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    
    if (manager.updateConfigWithNodeUpdate) {
      // 使用新版节点级更新
      return await manager.updateConfigWithNodeUpdate(index, updates);
    } else {
      // 使用旧版更新
      return manager.updateConfig(index, updates);
    }
  },

  /**
   * 添加配置
   */
  async addConfig(config) {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return await manager.addConfig(config);
  },

  /**
   * 删除配置
   */
  async removeConfig(index) {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return await manager.removeConfig(index);
  },

  /**
   * 设置活跃配置
   */
  async setActiveConfig(index) {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return await manager.setActiveConfig(index);
  },

  /**
   * 添加监听器
   */
  async addListener(listener) {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    return manager.addListener(listener);
  },

  /**
   * 获取系统状态
   */
  async getSystemStatus() {
    const manager = getActiveConfigManager() || await autoInitializeUserConfig();
    
    if (manager.getSystemStatus) {
      return manager.getSystemStatus();
    } else {
      return {
        initialized: manager.initialized,
        configCount: manager.configs ? manager.configs.length : 0,
        activeIndex: manager.activeConfigIndex || 0,
        version: 'legacy'
      };
    }
  }
};

/**
 * 默认导出（兼容旧版导入方式）
 */
export default userConfig;