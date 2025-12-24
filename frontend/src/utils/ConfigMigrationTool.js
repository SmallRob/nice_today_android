/**
 * 配置迁移工具
 * 负责从旧版用户配置管理器迁移到增强版
 */

import { userConfigManager } from './userConfigManager.js';
import { enhancedUserConfigManager } from './EnhancedUserConfigManager.js';

class ConfigMigrationTool {
  constructor() {
    this.migrationStatus = {
      attempted: false,
      successful: false,
      migratedCount: 0,
      errors: [],
      timestamp: null
    };
  }

  /**
   * 检查是否需要迁移
   */
  async checkMigrationNeeded() {
    try {
      // 检查旧版存储是否存在
      const oldConfigs = localStorage.getItem('nice_today_user_configs');
      const oldIndex = localStorage.getItem('nice_today_active_config_index');
      
      // 检查新版存储是否存在
      const newConfigs = localStorage.getItem('nice_today_user_configs_v2');
      
      const hasOldData = !!oldConfigs && oldConfigs.length > 2; // 确保不是空数组
      const hasNewData = !!newConfigs && newConfigs.length > 2;
      
      return {
        needed: hasOldData && !hasNewData,
        hasOldData,
        hasNewData,
        oldConfigCount: hasOldData ? JSON.parse(oldConfigs).length : 0
      };
      
    } catch (error) {
      console.error('检查迁移需求失败:', error);
      return {
        needed: false,
        hasOldData: false,
        hasNewData: false,
        error: error.message
      };
    }
  }

  /**
   * 执行迁移
   */
  async performMigration() {
    try {
      this.migrationStatus.attempted = true;
      this.migrationStatus.timestamp = new Date().toISOString();
      
      console.log('开始配置迁移...');
      
      // 检查迁移需求
      const migrationCheck = await this.checkMigrationNeeded();
      
      if (!migrationCheck.needed) {
        this.migrationStatus.successful = true;
        this.migrationStatus.message = '无需迁移';
        return this.migrationStatus;
      }
      
      // 初始化旧版管理器
      await userConfigManager.initialize();
      
      // 获取旧版配置数据
      const oldConfigs = userConfigManager.getAllConfigs();
      const oldActiveIndex = userConfigManager.getActiveConfigIndex();
      
      console.log('发现旧版配置数据:', {
        configCount: oldConfigs.length,
        activeIndex: oldActiveIndex
      });
      
      // 转换配置格式
      const convertedConfigs = this.convertConfigs(oldConfigs);
      
      // 初始化新版管理器
      await enhancedUserConfigManager.initialize();
      
      // 替换新版配置
      enhancedUserConfigManager.configs = convertedConfigs;
      enhancedUserConfigManager.activeConfigIndex = Math.min(
        oldActiveIndex, 
        convertedConfigs.length - 1
      );
      
      // 保存新版配置
      const saveResult = await enhancedUserConfigManager.saveConfigsToStorage();
      
      if (!saveResult) {
        throw new Error('保存迁移后的配置失败');
      }
      
      // 创建迁移备份
      await this.createMigrationBackup(oldConfigs, oldActiveIndex);
      
      // 更新迁移状态
      this.migrationStatus.successful = true;
      this.migrationStatus.migratedCount = convertedConfigs.length;
      this.migrationStatus.message = '迁移完成';
      
      console.log('配置迁移成功:', this.migrationStatus);
      
      return this.migrationStatus;
      
    } catch (error) {
      console.error('配置迁移失败:', error);
      
      this.migrationStatus.successful = false;
      this.migrationStatus.errors.push(error.message);
      this.migrationStatus.message = '迁移失败';
      
      return this.migrationStatus;
    }
  }

  /**
   * 转换配置格式
   */
  convertConfigs(oldConfigs) {
    return oldConfigs.map((oldConfig, index) => {
      // 基础字段映射
      const convertedConfig = {
        nickname: oldConfig.nickname || '用户' + (index + 1),
        realName: oldConfig.realName || '',
        birthDate: oldConfig.birthDate || '1991-01-01',
        birthTime: oldConfig.birthTime || '12:30',
        shichen: oldConfig.shichen || '午时',
        birthLocation: oldConfig.birthLocation || {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          lng: 116.48,
          lat: 39.95
        },
        zodiac: oldConfig.zodiac || '未知',
        zodiacAnimal: oldConfig.zodiacAnimal || '未知',
        gender: oldConfig.gender || 'male',
        mbti: oldConfig.mbti || 'ISFP',
        nameScore: oldConfig.nameScore || null,
        bazi: oldConfig.bazi || null,
        isused: oldConfig.isused || false
      };

      // 处理可能的字段差异
      if (oldConfig.zodiacSign) {
        convertedConfig.zodiac = oldConfig.zodiacSign;
      }
      
      if (oldConfig.animalSign) {
        convertedConfig.zodiacAnimal = oldConfig.animalSign;
      }
      
      if (oldConfig.personalityType) {
        convertedConfig.mbti = oldConfig.personalityType;
      }

      return convertedConfig;
    });
  }

  /**
   * 创建迁移备份
   */
  async createMigrationBackup(oldConfigs, oldActiveIndex) {
    try {
      const backupData = {
        oldConfigs,
        oldActiveIndex,
        migrationTimestamp: new Date().toISOString(),
        migrationVersion: '1.0',
        source: 'v1_to_v2_migration'
      };
      
      localStorage.setItem('nice_today_migration_backup', JSON.stringify(backupData));
      
      console.log('迁移备份创建成功');
      
    } catch (error) {
      console.error('创建迁移备份失败:', error);
    }
  }

  /**
   * 回滚迁移
   */
  async rollbackMigration() {
    try {
      const backupData = localStorage.getItem('nice_today_migration_backup');
      
      if (!backupData) {
        throw new Error('未找到迁移备份');
      }
      
      const backup = JSON.parse(backupData);
      
      // 恢复旧版数据
      localStorage.setItem('nice_today_user_configs', JSON.stringify(backup.oldConfigs));
      localStorage.setItem('nice_today_active_config_index', backup.oldActiveIndex.toString());
      
      // 清除新版数据
      localStorage.removeItem('nice_today_user_configs_v2');
      localStorage.removeItem('nice_today_active_config_index_v2');
      localStorage.removeItem('nice_today_config_metadata');
      
      console.log('迁移回滚完成');
      
      return {
        success: true,
        message: '回滚成功',
        restoredCount: backup.oldConfigs.length
      };
      
    } catch (error) {
      console.error('迁移回滚失败:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取迁移报告
   */
  getMigrationReport() {
    return {
      ...this.migrationStatus,
      currentTime: new Date().toISOString(),
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  }

  /**
   * 清理迁移数据
   */
  cleanupMigrationData() {
    try {
      // 清理旧版存储（谨慎操作）
      localStorage.removeItem('nice_today_user_configs');
      localStorage.removeItem('nice_today_active_config_index');
      
      // 清理迁移备份
      localStorage.removeItem('nice_today_migration_backup');
      
      console.log('迁移数据清理完成');
      
      return { success: true, message: '清理完成' };
      
    } catch (error) {
      console.error('清理迁移数据失败:', error);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration() {
    try {
      await enhancedUserConfigManager.initialize();
      
      const newConfigs = enhancedUserConfigManager.getAllConfigs();
      const newActiveIndex = enhancedUserConfigManager.activeConfigIndex;
      
      const backupData = localStorage.getItem('nice_today_migration_backup');
      const backup = backupData ? JSON.parse(backupData) : null;
      
      const validation = {
        newConfigCount: newConfigs.length,
        newActiveIndex,
        oldConfigCount: backup ? backup.oldConfigs.length : 0,
        oldActiveIndex: backup ? backup.oldActiveIndex : null,
        configsMatch: false,
        indicesMatch: false,
        overallValid: false
      };
      
      if (backup) {
        validation.configsMatch = newConfigs.length === backup.oldConfigs.length;
        validation.indicesMatch = newActiveIndex === Math.min(backup.oldActiveIndex, newConfigs.length - 1);
        validation.overallValid = validation.configsMatch && validation.indicesMatch;
      }
      
      return validation;
      
    } catch (error) {
      console.error('验证迁移结果失败:', error);
      
      return {
        error: error.message,
        overallValid: false
      };
    }
  }
}

// 创建单例实例
export const configMigrationTool = new ConfigMigrationTool();

export default ConfigMigrationTool;