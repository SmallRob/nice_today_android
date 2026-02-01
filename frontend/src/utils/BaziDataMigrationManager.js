/**
 * 八字数据迁移管理器
 * 负责处理数据版本升级、格式转换和异常修复
 */

import { createDualFormatBaziData, convertLegacyToDualFormat, JIAZI_TABLE, SHICHEN_TABLE } from './baziDataManager';
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
      if (error.includes('缺少必要字段') || error.includes('数据格式不完整') || error.includes('缺失')) {
        // 修复缺失字段
        repairedData = this.repairMissingFields(repairedData, error);
      } else if (error.includes('格式不正确') || error.includes('格式无效') || error.includes('超出范围')) {
        // 修复格式错误
        repairedData = this.repairFormatErrors(repairedData, error);
      } else if (error.includes('数据不一致') || error.includes('不匹配')) {
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
    
    // 确保元数据结构完整
    if (!repaired.meta) {
      repaired.meta = {
        version: '2.0.0',
        calculatedAt: new Date().toISOString(),
        dataSource: 'repaired',
        nickname: null
      };
    }
    
    // 确保双格式数据结构完整
    if (!repaired.numeric) {
      // 尝试从汉字格式恢复数字格式
      const getNum = (cn) => {
        const n = this.getNumberFromGanzhi(cn);
        return n !== -1 ? n : 0;
      };
      const getShichenNum = (cn) => {
        const n = this.getNumberFromShichen(cn);
        return n !== -1 ? n : 0;
      };

      repaired.numeric = {
        year: getNum(repaired.chinese?.yearCn),
        month: getNum(repaired.chinese?.monthCn),
        day: getNum(repaired.chinese?.dayCn),
        hour: getNum(repaired.chinese?.hourCn),
        shichen: getShichenNum(repaired.chinese?.shichenCn)
      };
    } else {
      // 尝试从汉字格式恢复缺失的数字字段
      const getNum = (cn) => {
        const n = this.getNumberFromGanzhi(cn);
        return n !== -1 ? n : 0;
      };
      const getShichenNum = (cn) => {
        const n = this.getNumberFromShichen(cn);
        return n !== -1 ? n : 0;
      };

      // 确保数字格式的每个字段都存在
      repaired.numeric.year = repaired.numeric.year !== undefined ? repaired.numeric.year : getNum(repaired.chinese?.yearCn);
      repaired.numeric.month = repaired.numeric.month !== undefined ? repaired.numeric.month : getNum(repaired.chinese?.monthCn);
      repaired.numeric.day = repaired.numeric.day !== undefined ? repaired.numeric.day : getNum(repaired.chinese?.dayCn);
      repaired.numeric.hour = repaired.numeric.hour !== undefined ? repaired.numeric.hour : getNum(repaired.chinese?.hourCn);
      repaired.numeric.shichen = repaired.numeric.shichen !== undefined ? repaired.numeric.shichen : getShichenNum(repaired.chinese?.shichenCn);
    }
    
    if (!repaired.chinese) {
      // 尝试从数字格式恢复汉字格式
      const getCn = (n) => this.getGanzhiFromNumber(n);
      const getShichenCn = (n) => this.getShichenFromNumber(n);
      const num = repaired.numeric || {};

      repaired.chinese = {
        yearCn: getCn(num.year),
        monthCn: getCn(num.month),
        dayCn: getCn(num.day),
        hourCn: getCn(num.hour),
        shichenCn: getShichenCn(num.shichen)
      };
    } else {
      // 尝试从数字格式恢复缺失的汉字字段
      const getCn = (n) => this.getGanzhiFromNumber(n);
      const getShichenCn = (n) => this.getShichenFromNumber(n);
      const num = repaired.numeric || {};

      // 确保汉字格式的每个字段都存在
      repaired.chinese.yearCn = repaired.chinese.yearCn || getCn(num.year);
      repaired.chinese.monthCn = repaired.chinese.monthCn || getCn(num.month);
      repaired.chinese.dayCn = repaired.chinese.dayCn || getCn(num.day);
      repaired.chinese.hourCn = repaired.chinese.hourCn || getCn(num.hour);
      repaired.chinese.shichenCn = repaired.chinese.shichenCn || getShichenCn(num.shichen);
    }
    
    // 确保验证信息结构完整
    if (!repaired.validation) {
      repaired.validation = {
        isValid: false,
        errors: ['数据结构不完整，已修复'],
        warnings: [],
        checksum: 'repaired'
      };
    }
    
    // 确保兼容性结构完整
    if (!repaired.compatibility) {
      repaired.compatibility = {
        legacy: {}
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
    const repaired = { ...data };
    
    // 修复数字格式的范围错误
    if (repaired.numeric) {
      // 确保年柱数字在有效范围内
      if (typeof repaired.numeric.year === 'number' && (repaired.numeric.year < 0 || repaired.numeric.year >= 60)) {
        console.warn(`修复年柱数字格式错误: ${repaired.numeric.year}, 修正为 0`);
        repaired.numeric.year = 0;
      }
      
      // 确保月柱数字在有效范围内
      if (typeof repaired.numeric.month === 'number' && (repaired.numeric.month < 0 || repaired.numeric.month >= 60)) {
        console.warn(`修复月柱数字格式错误: ${repaired.numeric.month}, 修正为 0`);
        repaired.numeric.month = 0;
      }
      
      // 确保日柱数字在有效范围内
      if (typeof repaired.numeric.day === 'number' && (repaired.numeric.day < 0 || repaired.numeric.day >= 60)) {
        console.warn(`修复日柱数字格式错误: ${repaired.numeric.day}, 修正为 0`);
        repaired.numeric.day = 0;
      }
      
      // 确保时柱数字在有效范围内
      if (typeof repaired.numeric.hour === 'number' && (repaired.numeric.hour < 0 || repaired.numeric.hour >= 60)) {
        console.warn(`修复时柱数字格式错误: ${repaired.numeric.hour}, 修正为 0`);
        repaired.numeric.hour = 0;
      }
      
      // 确保时辰数字在有效范围内
      if (typeof repaired.numeric.shichen === 'number' && (repaired.numeric.shichen < 0 || repaired.numeric.shichen >= 12)) {
        console.warn(`修复时辰数字格式错误: ${repaired.numeric.shichen}, 修正为 0`);
        repaired.numeric.shichen = 0;
      }
    }
    
    // 修复汉字格式的格式错误
    if (repaired.chinese) {
      // 检查并修复年柱汉字格式
      if (repaired.chinese.yearCn && typeof repaired.chinese.yearCn === 'string' && !this.isValidGanzhi(repaired.chinese.yearCn)) {
        console.warn(`修复年柱汉字格式错误: ${repaired.chinese.yearCn}, 修正为 '甲子'`);
        repaired.chinese.yearCn = '甲子';
      }
      
      // 检查并修复月柱汉字格式
      if (repaired.chinese.monthCn && typeof repaired.chinese.monthCn === 'string' && !this.isValidGanzhi(repaired.chinese.monthCn)) {
        console.warn(`修复月柱汉字格式错误: ${repaired.chinese.monthCn}, 修正为 '乙丑'`);
        repaired.chinese.monthCn = '乙丑';
      }
      
      // 检查并修复日柱汉字格式
      if (repaired.chinese.dayCn && typeof repaired.chinese.dayCn === 'string' && !this.isValidGanzhi(repaired.chinese.dayCn)) {
        console.warn(`修复日柱汉字格式错误: ${repaired.chinese.dayCn}, 修正为 '丙寅'`);
        repaired.chinese.dayCn = '丙寅';
      }
      
      // 检查并修复时柱汉字格式
      if (repaired.chinese.hourCn && typeof repaired.chinese.hourCn === 'string' && !this.isValidGanzhi(repaired.chinese.hourCn)) {
        console.warn(`修复时柱汉字格式错误: ${repaired.chinese.hourCn}, 修正为 '丁卯'`);
        repaired.chinese.hourCn = '丁卯';
      }
      
      // 检查并修复时辰汉字格式
      if (repaired.chinese.shichenCn && typeof repaired.chinese.shichenCn === 'string' && !this.isValidShichen(repaired.chinese.shichenCn)) {
        console.warn(`修复时辰汉字格式错误: ${repaired.chinese.shichenCn}, 修正为 '子时'`);
        repaired.chinese.shichenCn = '子时';
      }
    }
    
    return repaired;
  }

  /**
   * 修复数据不一致
   * @param {Object} data 数据
   * @param {string} error 错误信息
   * @returns {Object} 修复后的数据
   */
  repairInconsistencies(data, error) {
    const repaired = { ...data };
    
    // 修复数字格式和汉字格式不一致的问题
    if (repaired.numeric && repaired.chinese) {
      // 修复年柱数字与汉字不一致
      if (typeof repaired.numeric.year === 'number' && repaired.chinese.yearCn) {
        const expectedGanzhi = this.getGanzhiFromNumber(repaired.numeric.year);
        if (expectedGanzhi !== repaired.chinese.yearCn) {
          console.warn(`修复年柱数据不一致: 数字${repaired.numeric.year}对应${expectedGanzhi}，但汉字为${repaired.chinese.yearCn}`);
          // 优先使用数字格式（计算格式），修复汉字格式
          repaired.chinese.yearCn = expectedGanzhi;
        }
      } else if (typeof repaired.numeric.year !== 'number' && repaired.chinese.yearCn) {
        // 如果数字格式缺失但汉字格式存在，从汉字格式推导数字格式
        const numberFromGanzhi = this.getNumberFromGanzhi(repaired.chinese.yearCn);
        if (numberFromGanzhi !== -1) {
          repaired.numeric.year = numberFromGanzhi;
        }
      }
      
      // 修复月柱数字与汉字不一致
      if (typeof repaired.numeric.month === 'number' && repaired.chinese.monthCn) {
        const expectedGanzhi = this.getGanzhiFromNumber(repaired.numeric.month);
        if (expectedGanzhi !== repaired.chinese.monthCn) {
          console.warn(`修复月柱数据不一致: 数字${repaired.numeric.month}对应${expectedGanzhi}，但汉字为${repaired.chinese.monthCn}`);
          repaired.chinese.monthCn = expectedGanzhi;
        }
      } else if (typeof repaired.numeric.month !== 'number' && repaired.chinese.monthCn) {
        const numberFromGanzhi = this.getNumberFromGanzhi(repaired.chinese.monthCn);
        if (numberFromGanzhi !== -1) {
          repaired.numeric.month = numberFromGanzhi;
        }
      }
      
      // 修复日柱数字与汉字不一致
      if (typeof repaired.numeric.day === 'number' && repaired.chinese.dayCn) {
        const expectedGanzhi = this.getGanzhiFromNumber(repaired.numeric.day);
        if (expectedGanzhi !== repaired.chinese.dayCn) {
          console.warn(`修复日柱数据不一致: 数字${repaired.numeric.day}对应${expectedGanzhi}，但汉字为${repaired.chinese.dayCn}`);
          repaired.chinese.dayCn = expectedGanzhi;
        }
      } else if (typeof repaired.numeric.day !== 'number' && repaired.chinese.dayCn) {
        const numberFromGanzhi = this.getNumberFromGanzhi(repaired.chinese.dayCn);
        if (numberFromGanzhi !== -1) {
          repaired.numeric.day = numberFromGanzhi;
        }
      }
      
      // 修复时柱数字与汉字不一致
      if (typeof repaired.numeric.hour === 'number' && repaired.chinese.hourCn) {
        const expectedGanzhi = this.getGanzhiFromNumber(repaired.numeric.hour);
        if (expectedGanzhi !== repaired.chinese.hourCn) {
          console.warn(`修复时柱数据不一致: 数字${repaired.numeric.hour}对应${expectedGanzhi}，但汉字为${repaired.chinese.hourCn}`);
          repaired.chinese.hourCn = expectedGanzhi;
        }
      } else if (typeof repaired.numeric.hour !== 'number' && repaired.chinese.hourCn) {
        const numberFromGanzhi = this.getNumberFromGanzhi(repaired.chinese.hourCn);
        if (numberFromGanzhi !== -1) {
          repaired.numeric.hour = numberFromGanzhi;
        }
      }
      
      // 修复时辰数字与汉字不一致
      if (typeof repaired.numeric.shichen === 'number' && repaired.chinese.shichenCn) {
        const expectedShichen = this.getShichenFromNumber(repaired.numeric.shichen);
        if (expectedShichen !== repaired.chinese.shichenCn) {
          console.warn(`修复时辰数据不一致: 数字${repaired.numeric.shichen}对应${expectedShichen}，但汉字为${repaired.chinese.shichenCn}`);
          repaired.chinese.shichenCn = expectedShichen;
        }
      } else if (typeof repaired.numeric.shichen !== 'number' && repaired.chinese.shichenCn) {
        const numberFromShichen = this.getNumberFromShichen(repaired.chinese.shichenCn);
        if (numberFromShichen !== -1) {
          repaired.numeric.shichen = numberFromShichen;
        }
      }
    }
    
    return repaired;
  }
  
  /**
   * 从数字获取干支
   * @param {number} number - 数字（0-59）
   * @returns {string} 干支字符串
   */
  getGanzhiFromNumber(number) {
    if (number < 0 || number >= 60) {
      return '甲子'; // 默认值
    }
    
    return JIAZI_TABLE[number] || '甲子';
  }
  
  /**
   * 从干支获取数字
   * @param {string} ganzhi - 干支字符串
   * @returns {number} 数字（0-59）
   */
  getNumberFromGanzhi(ganzhi) {
    if (!ganzhi || typeof ganzhi !== 'string') {
      return -1;
    }
    
    return JIAZI_TABLE.indexOf(ganzhi);
  }
  
  /**
   * 从数字获取时辰
   * @param {number} number - 数字（0-11）
   * @returns {string} 时辰字符串
   */
  getShichenFromNumber(number) {
    if (number < 0 || number >= 12) {
      return '子时'; // 默认值
    }
    
    return SHICHEN_TABLE[number] || '子时';
  }
  
  /**
   * 从时辰获取数字
   * @param {string} shichen - 时辰字符串
   * @returns {number} 数字（0-11）
   */
  getNumberFromShichen(shichen) {
    if (!shichen || typeof shichen !== 'string') {
      return -1;
    }
    
    return SHICHEN_TABLE.indexOf(shichen);
  }
  
  /**
   * 检查干支格式是否有效
   * @param {string} ganzhi - 干支字符串
   * @returns {boolean} 是否有效
   */
  isValidGanzhi(ganzhi) {
    if (!ganzhi || typeof ganzhi !== 'string' || ganzhi.length !== 2) {
      return false;
    }

    const gan = ganzhi.charAt(0);
    const zhi = ganzhi.charAt(1);

    // 检查天干是否有效
    const validGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    if (!validGan.includes(gan)) {
      return false;
    }

    // 检查地支是否有效
    const validZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    if (!validZhi.includes(zhi)) {
      return false;
    }

    return true;
  }
  
  /**
   * 检查时辰格式是否有效
   * @param {string} shichen - 时辰字符串
   * @returns {boolean} 是否有效
   */
  isValidShichen(shichen) {
    if (!shichen || typeof shichen !== 'string') {
      return false;
    }
    
    const validShichen = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
    return validShichen.includes(shichen);
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