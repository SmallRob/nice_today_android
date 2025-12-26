/**
 * 八字数据迁移管理器
 * 负责处理数据版本升级、格式转换和异常修复
 */

import { createDualFormatBaziData, convertLegacyToDualFormat } from './BaziDataManager';
import { baziValidator } from './BaziValidationLayer';

class BaziDataMigrationManager {
  constructor() {
    this.currentVersion = '2.0.0';
    this.migrationHistory = [];
  }

  /**
   * 检查数据版本并执行必要的迁移
   * @param {Object} data 待迁移的数据
   * @param {Object} context 迁移上下文信息
   * @returns {Object} 迁移后的数据
   */
  migrateData(data, context = {}) {
    if (!data) {
      throw new Error('迁移数据不能为空');
    }

    const startTime = Date.now();
    const migrationLog = {
      timestamp: new Date().toISOString(),
      originalData: this.sanitizeForLogging(data),
      context,
      steps: []
    };

    try {
      let migratedData = { ...data };
      
      // 检测数据版本
      const detectedVersion = this.detectDataVersion(migratedData);
      migrationLog.detectedVersion = detectedVersion;
      migrationLog.steps.push(`检测到数据版本: ${detectedVersion}`);

      // 执行版本迁移
      if (detectedVersion !== this.currentVersion) {
        migratedData = this.executeVersionMigration(migratedData, detectedVersion, migrationLog);
      }

      // 数据完整性校验和修复
      migratedData = this.validateAndRepair(migratedData, migrationLog);

      // 记录迁移结果
      migrationLog.duration = Date.now() - startTime;
      migrationLog.success = true;
      migrationLog.migratedData = this.sanitizeForLogging(migratedData);
      
      this.migrationHistory.push(migrationLog);
      
      // 限制历史记录数量
      if (this.migrationHistory.length > 100) {
        this.migrationHistory = this.migrationHistory.slice(-100);
      }

      console.log(`数据迁移完成: ${detectedVersion} -> ${this.currentVersion} (${migrationLog.duration}ms)`);
      return migratedData;

    } catch (error) {
      migrationLog.duration = Date.now() - startTime;
      migrationLog.success = false;
      migrationLog.error = error.message;
      
      this.migrationHistory.push(migrationLog);
      
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  /**
   * 检测数据版本
   * @param {Object} data 数据对象
   * @returns {string} 版本号
   */
  detectDataVersion(data) {
    // 版本检测逻辑
    if (data.version) {
      return data.version;
    }

    // 根据数据结构特征检测版本
    if (data.meta && data.numeric && data.chinese) {
      return '2.0.0'; // 双格式版本
    }

    if (data.birth && data.bazi) {
      return '1.1.0'; // 标准Schema版本
    }

    if (data.year && data.month && data.day && data.hour) {
      return '1.0.0'; // 旧版格式
    }

    return 'unknown';
  }

  /**
   * 执行版本迁移
   * @param {Object} data 原始数据
   * @param {string} fromVersion 源版本
   * @param {Object} migrationLog 迁移日志
   * @returns {Object} 迁移后的数据
   */
  executeVersionMigration(data, fromVersion, migrationLog) {
    let migratedData = data;

    // 版本迁移路径
    const migrationPath = this.getMigrationPath(fromVersion);
    
    for (const migrationStep of migrationPath) {
      migrationLog.steps.push(`执行迁移: ${migrationStep.from} -> ${migrationStep.to}`);
      
      try {
        migratedData = this.executeMigrationStep(migratedData, migrationStep);
        migrationLog.steps.push(`迁移成功: ${migrationStep.description}`);
      } catch (error) {
        migrationLog.steps.push(`迁移失败: ${migrationStep.description} - ${error.message}`);
        throw error;
      }
    }

    return migratedData;
  }

  /**
   * 获取迁移路径
   * @param {string} fromVersion 源版本
   * @returns {Array} 迁移步骤数组
   */
  getMigrationPath(fromVersion) {
    const migrationSteps = [];

    // 定义迁移路径
    if (fromVersion === '1.0.0') {
      // 旧版格式 -> 标准Schema格式
      migrationSteps.push({
        from: '1.0.0',
        to: '1.1.0',
        description: '旧版格式转标准Schema格式',
        handler: this.migrateV1ToV1_1.bind(this)
      });
    }

    if (fromVersion === '1.0.0' || fromVersion === '1.1.0') {
      // 标准Schema格式 -> 双格式
      migrationSteps.push({
        from: '1.1.0',
        to: '2.0.0',
        description: '标准Schema格式转双格式',
        handler: this.migrateV1_1ToV2.bind(this)
      });
    }

    return migrationSteps;
  }

  /**
   * 执行单个迁移步骤
   * @param {Object} data 数据
   * @param {Object} step 迁移步骤
   * @returns {Object} 迁移后的数据
   */
  executeMigrationStep(data, step) {
    return step.handler(data);
  }

  /**
   * 从1.0.0迁移到1.1.0（旧版格式转标准Schema格式）
   * @param {Object} data 旧版格式数据
   * @returns {Object} 标准Schema格式数据
   */
  migrateV1ToV1_1(data) {
    // 这里需要根据实际的旧版数据结构进行转换
    // 假设旧版格式包含 year, month, day, hour 等字段
    
    return {
      meta: {
        version: '1.1.0',
        migratedFrom: '1.0.0',
        migratedAt: new Date().toISOString()
      },
      birth: {
        // 从上下文或其他地方获取出生信息
        date: data.birthDate || '',
        time: data.birthTime || '',
        location: data.birthLocation || {}
      },
      bazi: {
        // 转换四柱信息
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour
      }
    };
  }

  /**
   * 从1.1.0迁移到2.0.0（标准Schema格式转双格式）
   * @param {Object} data 标准Schema格式数据
   * @returns {Object} 双格式数据
   */
  migrateV1_1ToV2(data) {
    return createDualFormatBaziData({
      birthDate: data.birth?.date,
      birthTime: data.birth?.time,
      birthLocation: data.birth?.location,
      nickname: data.meta?.nickname
    });
  }

  /**
   * 数据校验和修复
   * @param {Object} data 数据
   * @param {Object} migrationLog 迁移日志
   * @returns {Object} 修复后的数据
   */
  validateAndRepair(data, migrationLog) {
    let repairedData = { ...data };

    // 验证数据完整性
    const validation = baziValidator.validatePillars(repairedData);
    
    if (!validation.isValid) {
      migrationLog.steps.push(`数据验证失败: ${validation.errors.join(', ')}`);
      
      // 尝试自动修复
      repairedData = this.attemptAutoRepair(repairedData, validation.errors, migrationLog);
      
      // 重新验证修复后的数据
      const revalidation = baziValidator.validatePillars(repairedData);
      if (!revalidation.isValid) {
        migrationLog.steps.push(`自动修复后验证仍然失败: ${revalidation.errors.join(', ')}`);
        throw new Error(`数据修复失败: ${revalidation.errors.join(', ')}`);
      }
      
      migrationLog.steps.push('数据自动修复成功');
    } else {
      migrationLog.steps.push('数据验证通过');
    }

    return repairedData;
  }

  /**
   * 尝试自动修复数据
   * @param {Object} data 数据
   * @param {Array} errors 错误列表
   * @param {Object} migrationLog 迁移日志
   * @returns {Object} 修复后的数据
   */
  attemptAutoRepair(data, errors, migrationLog) {
    let repairedData = { ...data };

    for (const error of errors) {
      migrationLog.steps.push(`尝试修复错误: ${error}`);
      
      // 根据错误类型进行修复
      if (error.includes('缺少必要字段')) {
        // 修复缺失字段
        repairedData = this.repairMissingFields(repairedData, error);
      } else if (error.includes('格式不正确')) {
        // 修复格式错误
        repairedData = this.repairFormatErrors(repairedData, error);
      } else if (error.includes('数据不一致')) {
        // 修复数据不一致
        repairedData = this.repairInconsistencies(repairedData, error);
      }
    }

    return repairedData;
  }

  /**
   * 修复缺失字段
   * @param {Object} data 数据
   * @param {string} error 错误信息
   * @returns {Object} 修复后的数据
   */
  repairMissingFields(data, error) {
    const repaired = { ...data };
    
    // 确保双格式数据结构完整
    if (!repaired.numeric) {
      repaired.numeric = {
        year: { gan: 0, zhi: 0 },
        month: { gan: 0, zhi: 0 },
        day: { gan: 0, zhi: 0 },
        hour: { gan: 0, zhi: 0 }
      };
    }
    
    if (!repaired.chinese) {
      repaired.chinese = {
        year: '',
        month: '',
        day: '',
        hour: ''
      };
    }

    return repaired;
  }

  /**
   * 修复格式错误
   * @param {Object} data 数据
   * @param {string} error 错误信息
   * @returns {Object} 修复后的数据
   */
  repairFormatErrors(data, error) {
    // 这里可以实现具体的格式修复逻辑
    // 例如：确保干支值在有效范围内
    return data;
  }

  /**
   * 修复数据不一致
   * @param {Object} data 数据
   * @param {string} error 错误信息
   * @returns {Object} 修复后的数据
   */
  repairInconsistencies(data, error) {
    // 这里可以实现数据一致性修复逻辑
    // 例如：确保数字格式和汉字格式对应
    return data;
  }

  /**
   * 清理日志数据（避免日志过大）
   * @param {Object} data 原始数据
   * @returns {Object} 清理后的数据
   */
  sanitizeForLogging(data) {
    if (!data) return null;
    
    // 创建一个简化版本用于日志记录
    const sanitized = { ...data };
    
    // 移除可能过大的字段
    delete sanitized._meta;
    delete sanitized.validation;
    
    // 限制字符串长度
    if (sanitized.chinese) {
      Object.keys(sanitized.chinese).forEach(key => {
        if (typeof sanitized.chinese[key] === 'string' && sanitized.chinese[key].length > 50) {
          sanitized.chinese[key] = sanitized.chinese[key].substring(0, 50) + '...';
        }
      });
    }

    return sanitized;
  }

  /**
   * 获取迁移历史统计
   * @returns {Object} 统计信息
   */
  getMigrationStatistics() {
    const stats = {
      totalMigrations: this.migrationHistory.length,
      successfulMigrations: this.migrationHistory.filter(m => m.success).length,
      failedMigrations: this.migrationHistory.filter(m => !m.success).length,
      averageDuration: 0
    };

    if (stats.totalMigrations > 0) {
      const totalDuration = this.migrationHistory.reduce((sum, m) => sum + (m.duration || 0), 0);
      stats.averageDuration = totalDuration / stats.totalMigrations;
    }

    return stats;
  }

  /**
   * 清理迁移历史
   * @param {number} keepCount 保留的记录数量
   */
  clearMigrationHistory(keepCount = 50) {
    this.migrationHistory = this.migrationHistory.slice(-keepCount);
  }
}

// 创建单例实例
export const baziDataMigrationManager = new BaziDataMigrationManager();

export default BaziDataMigrationManager;