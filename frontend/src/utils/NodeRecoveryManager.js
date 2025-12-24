/**
 * 节点恢复管理器
 * 负责检测节点更新失败并执行自动修复
 */

import { operationLogger } from './OperationLogger.js';
import { dataIntegrityManager } from './DataIntegrityManager.js';

class NodeRecoveryManager {
  constructor() {
    this.recoveryHistory = []; // 恢复历史记录
    this.maxHistorySize = 100; // 最大历史记录数量
    this.backupConfigs = new Map(); // 备份配置
  }

  /**
   * 检测并修复节点更新失败
   * @param {number} index - 配置索引
   * @param {Object} config - 配置对象
   * @param {Object} updates - 更新数据
   * @param {Error} error - 原始错误
   * @param {Array} configs - 所有配置
   * @returns {Promise<Object>} 修复结果
   */
  async detectAndRecover(index, config, updates, error, configs) {
    const recoveryId = this.generateRecoveryId();

    operationLogger.log('warn', 'NODE_UPDATE_FAILURE', {
      recoveryId,
      index,
      configNickname: config.nickname,
      updates,
      error: error.message,
      stack: error.stack
    });

    // 步骤1：创建配置备份
    const backup = this.createBackup(config);
    operationLogger.log('info', 'BACKUP_CREATED', {
      recoveryId,
      configNickname: config.nickname,
      backupSize: JSON.stringify(backup).length
    });

    try {
      // 步骤2：创建全新的节点副本
      const nodeCopy = this.createNodeCopy(config, updates);
      operationLogger.log('info', 'NODE_COPY_CREATED', {
        recoveryId,
        configNickname: config.nickname
      });

      // 步骤3：完整复制数据
      const mergedNode = this.mergeData(config, updates, nodeCopy);
      operationLogger.log('info', 'DATA_MERGED', {
        recoveryId,
        configNickname: config.nickname,
        mergeFields: Object.keys(updates)
      });

      // 步骤4：验证新节点数据完整性
      const validationResult = this.validateNode(mergedNode);
      if (!validationResult.valid) {
        throw new Error(`新节点验证失败: ${validationResult.errors.join(', ')}`);
      }
      operationLogger.log('success', 'NODE_VALIDATED', {
        recoveryId,
        configNickname: config.nickname,
        validationWarnings: validationResult.warnings
      });

      // 步骤5：安全替换旧节点
      configs[index] = mergedNode;
      operationLogger.log('success', 'NODE_REPLACED', {
        recoveryId,
        index,
        configNickname: config.nickname,
        oldConfigBackup: true
      });

      // 记录恢复历史
      this.recordRecovery({
        recoveryId,
        index,
        configNickname: config.nickname,
        originalError: error.message,
        success: true,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        recoveryId,
        message: '节点已成功恢复',
        warnings: validationResult.warnings,
        node: mergedNode
      };

    } catch (recoveryError) {
      operationLogger.log('error', 'RECOVERY_FAILED', {
        recoveryId,
        configNickname: config.nickname,
        originalError: error.message,
        recoveryError: recoveryError.message,
        stack: recoveryError.stack
      });

      // 记录失败历史
      this.recordRecovery({
        recoveryId,
        index,
        configNickname: config.nickname,
        originalError: error.message,
        recoveryError: recoveryError.message,
        success: false,
        timestamp: new Date().toISOString()
      });

      // 尝试从备份恢复
      if (backup) {
        try {
          configs[index] = backup;
          operationLogger.log('warn', 'BACKUP_RESTORED', {
            recoveryId,
            configNickname: config.nickname,
            reason: '恢复失败，从备份恢复'
          });
        } catch (restoreError) {
          operationLogger.log('error', 'BACKUP_RESTORE_FAILED', {
            recoveryId,
            configNickname: config.nickname,
            restoreError: restoreError.message
          });
        }
      }

      return {
        success: false,
        recoveryId,
        message: '节点恢复失败，已尝试从备份恢复',
        error: recoveryError.message
      };
    }
  }

  /**
   * 创建配置备份
   * @param {Object} config - 配置对象
   * @returns {Object} 配置的深拷贝
   */
  createBackup(config) {
    try {
      const backup = JSON.parse(JSON.stringify(config));
      this.backupConfigs.set(config.nickname, {
        backup,
        timestamp: Date.now()
      });
      return backup;
    } catch (error) {
      operationLogger.log('error', 'BACKUP_CREATION_FAILED', {
        configNickname: config.nickname,
        error: error.message
      });
      return null;
    }
  }

  /**
   * 创建节点副本
   * @param {Object} originalConfig - 原始配置
   * @param {Object} updates - 更新数据
   * @returns {Object} 新的节点副本
   */
  createNodeCopy(originalConfig, updates) {
    // 创建深拷贝
    const nodeCopy = JSON.parse(JSON.stringify(originalConfig));

    // 重置可能受损的字段
    if (updates.bazi) {
      nodeCopy.bazi = null;
      nodeCopy.lunarBirthDate = null;
      nodeCopy.trueSolarTime = null;
      nodeCopy.lunarInfo = null;
    }

    // 添加恢复标记
    nodeCopy._recoveredAt = new Date().toISOString();
    nodeCopy._recoveryInfo = {
      reason: 'node_update_failure',
      fields: Object.keys(updates)
    };

    return nodeCopy;
  }

  /**
   * 合并数据
   * @param {Object} originalConfig - 原始配置
   * @param {Object} updates - 更新数据
   * @param {Object} nodeCopy - 节点副本
   * @returns {Object} 合并后的节点
   */
  mergeData(originalConfig, updates, nodeCopy) {
    const merged = { ...nodeCopy };

    // 应用更新
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }

    // 确保关键字段不会丢失
    const criticalFields = ['nickname', 'birthDate', 'birthTime', 'birthLocation', 'gender'];
    for (const field of criticalFields) {
      if (!merged[field] && originalConfig[field]) {
        merged[field] = originalConfig[field];
      }
    }

    return merged;
  }

  /**
   * 验证节点数据完整性
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateNode(node) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // 使用数据完整性管理器进行验证
    const validation = dataIntegrityManager.validateConfig(node);
    if (!validation.valid) {
      result.valid = false;
      result.errors.push(...validation.errors.map(e => e.message));
    }

    // 添加验证警告
    if (validation.warnings && validation.warnings.length > 0) {
      result.warnings.push(...validation.warnings);
    }

    // 检查恢复标记
    if (node._recoveredAt) {
      result.warnings.push('节点已从失败中恢复');
    }

    return result;
  }

  /**
   * 记录恢复历史
   * @param {Object} recovery - 恢复信息
   */
  recordRecovery(recovery) {
    this.recoveryHistory.push(recovery);

    // 如果历史记录超过最大数量，删除最旧的记录
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory.shift();
    }
  }

  /**
   * 生成恢复ID
   * @returns {string} 恢复ID
   */
  generateRecoveryId() {
    return `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取恢复历史
   * @param {Object} filters - 过滤条件
   * @returns {Array} 恢复历史
   */
  getRecoveryHistory(filters = {}) {
    let history = [...this.recoveryHistory];

    // 按成功状态过滤
    if (filters.success !== undefined) {
      history = history.filter(r => r.success === filters.success);
    }

    // 按配置昵称过滤
    if (filters.nickname) {
      history = history.filter(r => r.configNickname === filters.nickname);
    }

    // 按时间范围过滤
    if (filters.startTime) {
      history = history.filter(r => new Date(r.timestamp) >= new Date(filters.startTime));
    }
    if (filters.endTime) {
      history = history.filter(r => new Date(r.timestamp) <= new Date(filters.endTime));
    }

    return history;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const totalRecoveries = this.recoveryHistory.length;
    const successfulRecoveries = this.recoveryHistory.filter(r => r.success).length;
    const failedRecoveries = totalRecoveries - successfulRecoveries;
    const successRate = totalRecoveries > 0 ? (successfulRecoveries / totalRecoveries * 100).toFixed(2) : 0;

    return {
      totalRecoveries,
      successfulRecoveries,
      failedRecoveries,
      successRate: `${successRate}%`,
      backupsStored: this.backupConfigs.size
    };
  }

  /**
   * 清理过期的备份
   * @param {number} maxAge - 最大年龄（毫秒）
   */
  cleanupOldBackups(maxAge = 7 * 24 * 60 * 60 * 1000) { // 默认7天
    const now = Date.now();
    let cleanedCount = 0;

    for (const [nickname, backupData] of this.backupConfigs.entries()) {
      if (now - backupData.timestamp > maxAge) {
        this.backupConfigs.delete(nickname);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      operationLogger.log('info', 'OLD_BACKUPS_CLEANED', {
        cleanedCount,
        remainingBackups: this.backupConfigs.size
      });
    }

    return cleanedCount;
  }

  /**
   * 导出恢复历史
   * @returns {string} JSON格式的恢复历史
   */
  exportHistory() {
    return JSON.stringify({
      history: this.recoveryHistory,
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

export const nodeRecoveryManager = new NodeRecoveryManager();
export default NodeRecoveryManager;
