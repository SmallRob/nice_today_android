/**
 * 错误处理和恢复管理器
 * 用于处理和恢复用户配置相关的错误，防止数据错误影响服务
 */
class ErrorHandlingManager {
  constructor() {
    this.errorLog = [];
    this.maxErrorLogSize = 100;
    this.recoveryAttempts = new Map(); // 记录恢复尝试次数
    this.maxRecoveryAttempts = 3;
  }

  /**
   * 记录错误
   * @param {string} operation - 操作类型
   * @param {Error} error - 错误对象
   * @param {Object} context - 操作上下文
   */
  logError(operation, error, context = {}) {
    const errorInfo = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      operation,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      },
      context,
      severity: this.assessSeverity(error)
    };

    this.errorLog.unshift(errorInfo);
    
    // 限制错误日志大小
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxErrorLogSize);
    }

    console.error(`[ERROR HANDLING] Operation: ${operation}, Error: ${error.message}`, errorInfo);
    
    return errorInfo;
  }

  /**
   * 评估错误严重性
   * @param {Error} error - 错误对象
   * @returns {string} 严重性等级
   */
  assessSeverity(error) {
    if (error.message.includes('critical') || error.message.includes('fatal')) {
      return 'critical';
    } else if (error.message.includes('validation') || error.message.includes('data')) {
      return 'high';
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 尝试恢复错误
   * @param {string} operation - 操作类型
   * @param {Function} recoveryFunction - 恢复函数
   * @param {Object} context - 操作上下文
   * @returns {Promise<boolean>} 恢复是否成功
   */
  async attemptRecovery(operation, recoveryFunction, context = {}) {
    const recoveryKey = `${operation}-${context.configId || context.nickname || 'unknown'}`;
    
    // 检查恢复尝试次数
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
    if (attempts >= this.maxRecoveryAttempts) {
      console.warn(`[ERROR HANDLING] Max recovery attempts reached for ${recoveryKey}`);
      return false;
    }

    try {
      this.recoveryAttempts.set(recoveryKey, attempts + 1);
      
      console.log(`[ERROR HANDLING] Attempting recovery for ${operation}, attempt ${attempts + 1}`);
      
      const result = await recoveryFunction();
      
      // 恢复成功，清除尝试计数
      this.recoveryAttempts.delete(recoveryKey);
      
      console.log(`[ERROR HANDLING] Recovery successful for ${operation}`);
      return result;
    } catch (recoveryError) {
      console.error(`[ERROR HANDLING] Recovery failed for ${operation}:`, recoveryError);
      
      // 记录恢复失败的错误
      this.logError(`recovery-${operation}`, recoveryError, {
        ...context,
        recoveryAttempt: attempts + 1
      });
      
      return false;
    }
  }

  /**
   * 数据验证和修复
   * @param {Object} configData - 配置数据
   * @returns {Object} 修复后的配置数据
   */
  validateAndRepairConfig(configData) {
    if (!configData) {
      return this.getDefaultConfig();
    }

    const repairedConfig = { ...configData };

    try {
      // 修复基本字段
      if (typeof repairedConfig.nickname !== 'string' || !repairedConfig.nickname.trim()) {
        repairedConfig.nickname = `用户${Date.now()}`;
      }

      // 修复出生日期格式
      if (repairedConfig.birthDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(repairedConfig.birthDate)) {
          console.warn('[ERROR HANDLING] Invalid birth date format, using default');
          delete repairedConfig.birthDate;
        }
      }

      // 修复出生时间格式
      if (repairedConfig.birthTime) {
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(repairedConfig.birthTime)) {
          console.warn('[ERROR HANDLING] Invalid birth time format, using default');
          repairedConfig.birthTime = '12:30';
        }
      } else {
        repairedConfig.birthTime = '12:30';
      }

      // 修复出生地点
      if (!repairedConfig.birthLocation || typeof repairedConfig.birthLocation !== 'object') {
        repairedConfig.birthLocation = {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          lng: 116.4074,
          lat: 39.9042
        };
      } else {
        // 确保经纬度有效
        if (typeof repairedConfig.birthLocation.lng !== 'number' || 
            typeof repairedConfig.birthLocation.lat !== 'number') {
          repairedConfig.birthLocation.lng = 116.4074;
          repairedConfig.birthLocation.lat = 39.9042;
        }
      }

      // 修复姓名评分数据
      if (repairedConfig.nameScore && typeof repairedConfig.nameScore === 'object') {
        const requiredScoreFields = ['tian', 'ren', 'di', 'wai', 'zong'];
        for (const field of requiredScoreFields) {
          if (typeof repairedConfig.nameScore[field] !== 'number') {
            repairedConfig.nameScore[field] = 1;
          }
        }
        
        if (typeof repairedConfig.nameScore.totalScore !== 'number') {
          // 重新计算总分
          const calculateTotalScore = (scoreResult) => {
            if (!scoreResult) return 0;
            
            const calculateGridScore = (gridValue) => {
              const getMeaning = (value) => {
                if (value >= 80) return { type: '吉' };
                if (value >= 60) return { type: '半吉' };
                return { type: '凶' };
              };
              
              const meaning = getMeaning(gridValue);
              if (meaning.type === '吉') return 20;
              if (meaning.type === '半吉') return 15;
              return 5;
            };

            const tianScore = calculateGridScore(scoreResult.tian);
            const renScore = calculateGridScore(scoreResult.ren);
            const diScore = calculateGridScore(scoreResult.di);
            const waiScore = calculateGridScore(scoreResult.wai);
            const zongScore = calculateGridScore(scoreResult.zong);

            const totalScore = tianScore + renScore + diScore + waiScore + zongScore;
            return Math.round(totalScore);
          };
          
          repairedConfig.nameScore.totalScore = calculateTotalScore(repairedConfig.nameScore);
        }
      }

      // 修复八字信息
      if (repairedConfig.bazi && typeof repairedConfig.bazi === 'object') {
        // 验证八字结构的完整性
        const requiredBaziFields = ['year', 'month', 'day', 'hour'];
        for (const field of requiredBaziFields) {
          if (!repairedConfig.bazi[field]) {
            console.warn(`[ERROR HANDLING] Missing bazi.${field}, removing bazi data`);
            delete repairedConfig.bazi;
            break;
          }
        }
      }

      return repairedConfig;
    } catch (validationError) {
      console.error('[ERROR HANDLING] Config validation and repair failed:', validationError);
      // 如果修复失败，返回默认配置
      return this.getDefaultConfig();
    }
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置
   */
  getDefaultConfig() {
    return {
      nickname: `用户${Date.now()}`,
      birthDate: null,
      birthTime: '12:30',
      birthLocation: {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        lng: 116.4074,
        lat: 39.9042
      },
      gender: 'secret',
      zodiac: '水瓶座',
      zodiacAnimal: '鼠',
      mbti: 'ISFP'
    };
  }

  /**
   * 获取错误日志
   * @param {number} limit - 限制返回的错误数量
   * @returns {Array} 错误日志
   */
  getErrorLog(limit = 10) {
    return this.errorLog.slice(0, limit);
  }

  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// 创建全局实例
const errorHandlingManager = new ErrorHandlingManager();

export default errorHandlingManager;