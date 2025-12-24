/**
 * 生辰八字节点级更新管理器
 * 负责生辰八字数据的精确更新，确保只修改目标字段，避免数据污染
 */

class BaziUpdateManager {
  constructor() {
    this.updateStrategies = {
      // 基础信息更新策略
      basicInfo: {
        fields: ['realName', 'birthDate', 'birthTime', 'shichen', 'gender'],
        validate: this.validateBasicInfo.bind(this),
        dependencies: ['bazi', 'lunarBirthDate', 'trueSolarTime', 'lunarInfo'] // 基础信息变更会影响八字和农历数据
      },
      
      // 地理位置更新策略
      location: {
        fields: ['birthLocation'],
        validate: this.validateLocation.bind(this),
        dependencies: ['bazi', 'lunarBirthDate', 'trueSolarTime', 'lunarInfo'] // 地理位置变更会影响八字和农历数据
      },
      
      // 八字数据更新策略
      baziData: {
        fields: ['bazi'],
        validate: this.validateBaziData.bind(this),
        dependencies: []
      },
      
      // 农历和真太阳时更新策略
      lunarTime: {
        fields: ['lunarBirthDate', 'trueSolarTime', 'lunarInfo'],
        validate: this.validateLunarTime.bind(this),
        dependencies: []
      },
      
      // 姓名评分更新策略
      nameScore: {
        fields: ['nameScore'],
        validate: this.validateNameScore.bind(this),
        dependencies: []
      },
      
      // 个人偏好更新策略
      preferences: {
        fields: ['nickname', 'zodiac', 'zodiacAnimal', 'mbti'],
        validate: this.validatePreferences.bind(this),
        dependencies: []
      }
    };
  }

  /**
   * 验证基础信息
   */
  validateBasicInfo(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // 验证出生日期
    if (updates.birthDate) {
      const date = new Date(updates.birthDate);
      if (isNaN(date.getTime())) {
        validation.valid = false;
        validation.errors.push('出生日期格式无效');
      }
    }

    // 验证出生时间
    if (updates.birthTime) {
      if (!/^\d{1,2}:\d{2}$/.test(updates.birthTime)) {
        validation.valid = false;
        validation.errors.push('出生时间格式无效');
      }
    }

    // 验证性别
    if (updates.gender && !['male', 'female'].includes(updates.gender)) {
      validation.valid = false;
      validation.errors.push('性别必须是 male 或 female');
    }

    return validation;
  }

  /**
   * 验证地理位置
   */
  validateLocation(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (updates.birthLocation) {
      const { province, city, district, lng, lat } = updates.birthLocation;
      
      if (!province || !city || !district) {
        validation.valid = false;
        validation.errors.push('地理位置信息不完整');
      }

      if (lng === undefined || lat === undefined) {
        validation.valid = false;
        validation.errors.push('经纬度信息缺失');
      } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        validation.valid = false;
        validation.errors.push('经纬度范围无效');
      }
    }

    return validation;
  }

  /**
   * 验证八字数据
   */
  validateBaziData(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (updates.bazi) {
      const requiredFields = ['year', 'month', 'day', 'hour', 'heavenlyStems', 'earthlyBranches'];
      
      for (const field of requiredFields) {
        if (!updates.bazi[field]) {
          validation.valid = false;
          validation.errors.push(`八字数据缺少 ${field} 字段`);
        }
      }

      // 验证天干地支格式
      if (updates.bazi.heavenlyStems && updates.bazi.heavenlyStems.length !== 4) {
        validation.warnings.push('天干数据格式可能不正确');
      }

      if (updates.bazi.earthlyBranches && updates.bazi.earthlyBranches.length !== 4) {
        validation.warnings.push('地支数据格式可能不正确');
      }
    }

    return validation;
  }

  /**
   * 验证姓名评分
   */
  validateNameScore(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (updates.nameScore) {
      if (typeof updates.nameScore.score !== 'number' || 
          updates.nameScore.score < 0 || updates.nameScore.score > 100) {
        validation.warnings.push('姓名评分应在0-100范围内');
      }
    }

    return validation;
  }

  /**
   * 验证个人偏好
   */
  validatePreferences(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // 验证MBTI格式
    if (updates.mbti && !/^[EI][SN][TF][JP]$/.test(updates.mbti)) {
      validation.warnings.push('MBTI格式可能不正确');
    }

    return validation;
  }

  /**
   * 验证农历和真太阳时数据
   */
  validateLunarTime(updates) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // 验证农历日期格式
    if (updates.lunarBirthDate && typeof updates.lunarBirthDate !== 'string') {
      validation.valid = false;
      validation.errors.push('农历日期格式无效');
    }

    // 验证真太阳时格式
    if (updates.trueSolarTime && !/^\d{1,2}:\d{2}$/.test(updates.trueSolarTime)) {
      validation.valid = false;
      validation.errors.push('真太阳时格式无效');
    }

    // 验证农历信息对象
    if (updates.lunarInfo && typeof updates.lunarInfo !== 'object') {
      validation.warnings.push('农历信息对象格式可能不正确');
    }

    return validation;
  }

  /**
   * 分析更新类型
   */
  analyzeUpdateType(updates) {
    const updateTypes = [];
    const affectedFields = [];

    for (const [strategyName, strategy] of Object.entries(this.updateStrategies)) {
      const hasMatchingFields = strategy.fields.some(field => updates[field] !== undefined);
      
      if (hasMatchingFields) {
        updateTypes.push(strategyName);
        affectedFields.push(...strategy.fields.filter(field => updates[field] !== undefined));
      }
    }

    return {
      updateTypes,
      affectedFields,
      isComplex: updateTypes.length > 1
    };
  }

  /**
   * 执行节点级更新
   */
  async executeNodeUpdate(currentConfig, updates, updateType = 'auto') {
    try {
      // 分析更新类型
      const analysis = this.analyzeUpdateType(updates);
      
      // 如果指定了更新类型，使用该策略
      let strategyName = updateType === 'auto' ? analysis.updateTypes[0] : updateType;
      const strategy = this.updateStrategies[strategyName];

      if (!strategy) {
        throw new Error(`不支持的更新类型: ${updateType}`);
      }

      // 验证更新数据
      const validation = strategy.validate(updates);
      if (!validation.valid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 创建更新事务
      const transaction = this.createUpdateTransaction(currentConfig, updates, strategy);
      
      // 执行更新
      const result = await this.executeTransaction(transaction);
      
      return {
        success: true,
        updatedConfig: result.updatedConfig,
        affectedFields: analysis.affectedFields,
        warnings: validation.warnings,
        transaction: transaction
      };

    } catch (error) {
      console.error('节点级更新失败:', error);
      
      return {
        success: false,
        error: error.message,
        updatedConfig: currentConfig
      };
    }
  }

  /**
   * 创建更新事务
   */
  createUpdateTransaction(currentConfig, updates, strategy) {
    const transaction = {
      id: this.generateTransactionId(),
      timestamp: Date.now(),
      strategy: strategy,
      originalConfig: { ...currentConfig },
      updates: { ...updates },
      rollbackData: {},
      dependencies: []
    };

    // 记录需要回滚的数据
    for (const field of strategy.fields) {
      if (updates[field] !== undefined) {
        transaction.rollbackData[field] = currentConfig[field];
      }
    }

    // 处理依赖关系
    for (const dependency of strategy.dependencies) {
      if (currentConfig[dependency]) {
        transaction.dependencies.push({
          field: dependency,
          action: 'invalidate',
          reason: `${strategy.fields.join(', ')} 变更导致 ${dependency} 数据失效`
        });
      }
    }

    return transaction;
  }

  /**
   * 执行更新事务
   */
  async executeTransaction(transaction) {
    const { originalConfig, updates, dependencies } = transaction;
    
    // 创建更新后的配置
    const updatedConfig = { ...originalConfig };
    
    // 应用更新
    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updatedConfig[field] = value;
      }
    }
    
    // 处理依赖关系
    for (const dependency of dependencies) {
      if (dependency.action === 'invalidate') {
        updatedConfig[dependency.field] = null;
        console.log(`已清空依赖数据: ${dependency.field} - ${dependency.reason}`);
      }
    }
    
    // 模拟异步操作（实际应用中可能是数据库操作）
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      updatedConfig,
      transaction
    };
  }

  /**
   * 批量节点级更新
   */
  async batchUpdateNodes(currentConfig, updateOperations) {
    const results = [];
    const finalConfig = { ...currentConfig };
    
    for (const operation of updateOperations) {
      try {
        const result = await this.executeNodeUpdate(
          finalConfig, 
          operation.updates, 
          operation.type
        );
        
        if (result.success) {
          Object.assign(finalConfig, result.updatedConfig);
          results.push({
            operation: operation,
            success: true,
            result: result
          });
        } else {
          results.push({
            operation: operation,
            success: false,
            error: result.error
          });
        }
        
      } catch (error) {
        results.push({
          operation: operation,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      finalConfig,
      results,
      allSuccessful: results.every(r => r.success)
    };
  }

  /**
   * 生成事务ID
   */
  generateTransactionId() {
    return `bazi_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查更新冲突
   */
  checkUpdateConflicts(currentConfig, proposedUpdates) {
    const conflicts = [];
    
    // 检查八字数据相关的冲突
    if (proposedUpdates.birthDate || proposedUpdates.birthTime || proposedUpdates.birthLocation) {
      if (currentConfig.bazi) {
        conflicts.push({
          type: 'bazi_invalidation',
          message: '基础信息变更将导致八字数据失效',
          fields: ['bazi'],
          severity: 'warning'
        });
      }
    }
    
    // 检查姓名相关的冲突
    if (proposedUpdates.realName && currentConfig.nameScore) {
      conflicts.push({
        type: 'name_score_invalidation',
        message: '真实姓名变更将导致姓名评分失效',
        fields: ['nameScore'],
        severity: 'warning'
      });
    }
    
    return conflicts;
  }

  /**
   * 获取更新预览
   */
  getUpdatePreview(currentConfig, updates) {
    const analysis = this.analyzeUpdateType(updates);
    const conflicts = this.checkUpdateConflicts(currentConfig, updates);
    
    // 模拟更新结果
    const previewConfig = { ...currentConfig };
    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined) {
        previewConfig[field] = value;
      }
    }
    
    return {
      analysis,
      conflicts,
      previewConfig,
      affectedFields: analysis.affectedFields,
      willInvalidate: conflicts.some(c => c.severity === 'warning')
    };
  }
}

// 创建单例实例
export const baziUpdateManager = new BaziUpdateManager();

export default BaziUpdateManager;