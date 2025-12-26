/**
 * 八字数据转换校验层
 * 确保数字格式与汉字格式的准确对应关系
 * 提供严格的数据校验和自动修复功能
 */

import { JIAZI_TABLE, SHICHEN_TABLE, WUXING_MAP } from './baziDataManager';

/**
 * 校验结果
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 是否有效
 * @property {Array<string>} errors - 错误信息
 * @property {Array<string>} warnings - 警告信息
 * @property {Array<string>} fixes - 修复信息
 * @property {string} checksum - 数据校验和
 */

/**
 * 八字数据校验器类
 */
export class BaziValidator {
  constructor() {
    this.strictMode = true; // 严格模式（默认开启）
    this.autoRepair = true; // 自动修复（默认开启）
    this.logger = console; // 日志记录器
  }

  /**
   * 验证八字四柱数据
   * @param {Object} data - 八字数据
   * @param {Object} data.numeric - 数字格式
   * @param {Object} data.chinese - 汉字格式
   * @returns {ValidationResult} 验证结果
   */
  validatePillars(data) {
    const errors = [];
    const warnings = [];
    const fixes = [];

    const { numeric, chinese } = data;

    // 1. 基础格式检查
    if (!numeric || !chinese) {
      errors.push('数据格式不完整：缺少数字格式或汉字格式');
      return { isValid: false, errors, warnings, fixes, checksum: 'invalid' };
    }

    // 2. 逐个验证四柱
    const pillars = ['year', 'month', 'day', 'hour'];
    
    for (const pillar of pillars) {
      const numericValue = numeric[pillar];
      const chineseValue = chinese[`${pillar}Cn`];
      
      const pillarResult = this.validateSinglePillar(pillar, numericValue, chineseValue);
      
      errors.push(...pillarResult.errors);
      warnings.push(...pillarResult.warnings);
      fixes.push(...pillarResult.fixes);
    }

    // 3. 时辰验证
    const shichenResult = this.validateShichen(numeric.shichen, chinese.shichenCn);
    errors.push(...shichenResult.errors);
    warnings.push(...shichenResult.warnings);
    fixes.push(...shichenResult.fixes);

    // 4. 五行逻辑验证
    const wuxingResult = this.validateWuxingLogic(chinese);
    warnings.push(...wuxingResult.warnings);

    // 5. 计算校验和
    const checksum = this.calculateChecksum(data);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fixes,
      checksum
    };
  }

  /**
   * 验证单个柱子的数据
   * @param {string} pillarName - 柱子名称
   * @param {number} numericValue - 数字值
   * @param {string} chineseValue - 汉字值
   * @returns {Object} 验证结果
   */
  validateSinglePillar(pillarName, numericValue, chineseValue) {
    const errors = [];
    const warnings = [];
    const fixes = [];

    // 1. 检查数据存在性
    if (numericValue === undefined || numericValue === null) {
      errors.push(`${pillarName}柱数字值缺失`);
    }
    if (!chineseValue) {
      errors.push(`${pillarName}柱汉字值缺失`);
    }

    // 如果有错误，直接返回
    if (errors.length > 0) {
      return { errors, warnings, fixes };
    }

    // 2. 检查数字范围
    if (numericValue < 0 || numericValue >= 60) {
      errors.push(`${pillarName}柱数字值超出范围: ${numericValue}`);
    }

    // 3. 检查汉字格式
    if (!this.isValidGanzhi(chineseValue)) {
      errors.push(`${pillarName}柱汉字格式无效: ${chineseValue}`);
    }

    // 4. 检查数字与汉字对应关系
    if (JIAZI_TABLE[numericValue] !== chineseValue) {
      const expected = JIAZI_TABLE[numericValue];
      const actual = chineseValue;
      
      if (this.strictMode) {
        errors.push(`${pillarName}柱数字与汉字不匹配: ${numericValue} -> ${expected} (实际: ${actual})`);
      } else {
        warnings.push(`${pillarName}柱数字与汉字不匹配: ${numericValue} -> ${expected} (实际: ${actual})`);
      }

      // 自动修复建议
      if (this.autoRepair) {
        if (JIAZI_TABLE.includes(chineseValue)) {
          const correctNumeric = JIAZI_TABLE.indexOf(chineseValue);
          fixes.push(`建议将${pillarName}柱数字值从 ${numericValue} 修正为 ${correctNumeric}`);
        } else if (numericValue >= 0 && numericValue < 60) {
          const correctChinese = JIAZI_TABLE[numericValue];
          fixes.push(`建议将${pillarName}柱汉字值从 ${chineseValue} 修正为 ${correctChinese}`);
        }
      }
    }

    return { errors, warnings, fixes };
  }

  /**
   * 验证时辰数据
   * @param {number} numericValue - 时辰数字
   * @param {string} chineseValue - 时辰汉字
   * @returns {Object} 验证结果
   */
  validateShichen(numericValue, chineseValue) {
    const errors = [];
    const warnings = [];
    const fixes = [];

    // 1. 检查数据存在性
    if (numericValue === undefined || numericValue === null) {
      warnings.push('时辰数字值缺失');
    }
    if (!chineseValue) {
      warnings.push('时辰汉字值缺失');
    }

    // 2. 检查数字范围
    if (numericValue !== undefined && (numericValue < 0 || numericValue >= 12)) {
      warnings.push(`时辰数字值超出范围: ${numericValue}`);
    }

    // 3. 检查对应关系
    if (numericValue !== undefined && chineseValue && 
        SHICHEN_TABLE[numericValue] !== chineseValue) {
      const expected = SHICHEN_TABLE[numericValue];
      
      if (this.strictMode) {
        errors.push(`时辰数字与汉字不匹配: ${numericValue} -> ${expected} (实际: ${chineseValue})`);
      } else {
        warnings.push(`时辰数字与汉字不匹配: ${numericValue} -> ${expected} (实际: ${chineseValue})`);
      }

      // 自动修复建议
      if (this.autoRepair) {
        if (SHICHEN_TABLE.includes(chineseValue)) {
          const correctNumeric = SHICHEN_TABLE.indexOf(chineseValue);
          fixes.push(`建议将时辰数字值从 ${numericValue} 修正为 ${correctNumeric}`);
        } else if (numericValue >= 0 && numericValue < 12) {
          const correctChinese = SHICHEN_TABLE[numericValue];
          fixes.push(`建议将时辰汉字值从 ${chineseValue} 修正为 ${correctChinese}`);
        }
      }
    }

    return { errors, warnings, fixes };
  }

  /**
   * 验证五行逻辑
   * @param {Object} chinese - 汉字格式数据
   * @returns {Object} 验证结果
   */
  validateWuxingLogic(chinese) {
    const warnings = [];

    const pillars = ['yearCn', 'monthCn', 'dayCn', 'hourCn'];
    
    for (const pillar of pillars) {
      const ganzhi = chinese[pillar];
      
      if (!ganzhi || ganzhi === '未知') continue;

      // 检查干支格式
      if (ganzhi.length !== 2) {
        warnings.push(`${pillar}格式异常: ${ganzhi} (应为2个字符)`);
        continue;
      }

      const gan = ganzhi.charAt(0);
      const zhi = ganzhi.charAt(1);

      // 检查天干五行
      if (!WUXING_MAP[gan]) {
        warnings.push(`${pillar}天干五行映射异常: ${gan}`);
      }

      // 检查地支五行
      if (!WUXING_MAP[zhi]) {
        warnings.push(`${pillar}地支五行映射异常: ${zhi}`);
      }

      // 检查天干地支组合的合理性（简化版）
      if (this.isValidGanzhi(ganzhi)) {
        // 检查天干地支是否在60甲子表中
        if (!JIAZI_TABLE.includes(ganzhi)) {
          warnings.push(`${pillar}组合不在60甲子表中: ${ganzhi}`);
        }
      }
    }

    return { warnings };
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
   * 计算数据校验和
   * @param {Object} data - 数据对象
   * @returns {string} 校验和
   */
  calculateChecksum(data) {
    try {
      const { chinese } = data;
      if (!chinese) return 'invalid';

      const str = `${chinese.yearCn}${chinese.monthCn}${chinese.dayCn}${chinese.hourCn}`;
      let hash = 0;
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      
      return Math.abs(hash).toString(16).padStart(8, '0');
    } catch (error) {
      this.logger.error('计算校验和失败:', error);
      return 'error';
    }
  }

  /**
   * 自动修复数据
   * @param {Object} data - 待修复数据
   * @returns {Object} 修复后的数据
   */
  autoRepairData(data) {
    if (!this.autoRepair) {
      return data;
    }

    const repairedData = JSON.parse(JSON.stringify(data)); // 深拷贝
    const { numeric, chinese } = repairedData;

    // 修复四柱数据
    const pillars = ['year', 'month', 'day', 'hour'];
    
    for (const pillar of pillars) {
      const numericValue = numeric[pillar];
      const chineseValue = chinese[`${pillar}Cn`];

      // 如果数字有效但汉字无效，使用数字修复汉字
      if (numericValue !== undefined && numericValue >= 0 && numericValue < 60) {
        if (!this.isValidGanzhi(chineseValue)) {
          chinese[`${pillar}Cn`] = JIAZI_TABLE[numericValue];
          this.logger.info(`自动修复${pillar}柱汉字: ${chineseValue} -> ${JIAZI_TABLE[numericValue]}`);
        }
      }
      
      // 如果汉字有效但数字无效，使用汉字修复数字
      else if (this.isValidGanzhi(chineseValue)) {
        const correctNumeric = JIAZI_TABLE.indexOf(chineseValue);
        if (correctNumeric >= 0) {
          numeric[pillar] = correctNumeric;
          this.logger.info(`自动修复${pillar}柱数字: ${numericValue} -> ${correctNumeric}`);
        }
      }
      
      // 如果都无效，使用默认值
      else {
        numeric[pillar] = 0;
        chinese[`${pillar}Cn`] = JIAZI_TABLE[0];
        this.logger.info(`自动设置${pillar}柱默认值: 0 -> ${JIAZI_TABLE[0]}`);
      }
    }

    // 修复时辰数据
    if (numeric.shichen !== undefined && numeric.shichen >= 0 && numeric.shichen < 12) {
      if (!chinese.shichenCn || !SHICHEN_TABLE.includes(chinese.shichenCn)) {
        chinese.shichenCn = SHICHEN_TABLE[numeric.shichen];
        this.logger.info(`自动修复时辰汉字: ${chinese.shichenCn} -> ${SHICHEN_TABLE[numeric.shichen]}`);
      }
    } else if (chinese.shichenCn && SHICHEN_TABLE.includes(chinese.shichenCn)) {
      const correctNumeric = SHICHEN_TABLE.indexOf(chinese.shichenCn);
      if (correctNumeric >= 0) {
        numeric.shichen = correctNumeric;
        this.logger.info(`自动修复时辰数字: ${numeric.shichen} -> ${correctNumeric}`);
      }
    } else {
      numeric.shichen = 0;
      chinese.shichenCn = SHICHEN_TABLE[0];
      this.logger.info(`自动设置时辰默认值: 0 -> ${SHICHEN_TABLE[0]}`);
    }

    return repairedData;
  }

  /**
   * 批量验证数据
   * @param {Array<Object>} dataArray - 数据数组
   * @returns {Array<ValidationResult>} 验证结果数组
   */
  batchValidate(dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error('数据必须是数组');
    }

    return dataArray.map((data, index) => {
      try {
        const repairedData = this.autoRepairData(data);
        return this.validatePillars(repairedData);
      } catch (error) {
        this.logger.error(`验证第${index}条数据失败:`, error);
        return {
          isValid: false,
          errors: [`验证失败: ${error.message}`],
          warnings: [],
          fixes: [],
          checksum: 'error'
        };
      }
    });
  }

  /**
   * 生成验证报告
   * @param {Array<ValidationResult>} results - 验证结果数组
   * @returns {Object} 验证报告
   */
  generateReport(results) {
    const total = results.length;
    const validCount = results.filter(r => r.isValid).length;
    const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const fixCount = results.reduce((sum, r) => sum + r.fixes.length, 0);

    return {
      summary: {
        total,
        validCount,
        invalidCount: total - validCount,
        errorCount,
        warningCount,
        fixCount,
        validRate: total > 0 ? (validCount / total * 100).toFixed(2) : 0
      },
      details: results.map((result, index) => ({
        index,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        fixes: result.fixes,
        checksum: result.checksum
      }))
    };
  }
}

// 创建全局验证器实例
export const baziValidator = new BaziValidator();

export default {
  BaziValidator,
  baziValidator
};