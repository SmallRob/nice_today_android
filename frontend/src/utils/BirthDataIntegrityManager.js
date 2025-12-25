/**
 * 出生数据完整性管理器
 * 提供全面的时辰、农历、真太阳时数据验证和修复功能
 * 确保紫微命宫计算的准确性
 */

import { enhancedValidateLunarDate, autoFixLunarAndShichenData } from './LunarCalendarHelper';
import { validateShichenConsistency, batchFixShichenAndLunarData } from './ConfigValidationHelper';

/**
 * 出生数据完整性检查结果
 */
class BirthDataIntegrityResult {
    constructor() {
        this.valid = true;
        this.errors = [];
        this.warnings = [];
        this.corrections = {};
        this.timestamp = new Date().toISOString();
    }

    addError(message, field = null) {
        this.valid = false;
        this.errors.push({ message, field, timestamp: new Date().toISOString() });
    }

    addWarning(message, field = null) {
        this.warnings.push({ message, field, timestamp: new Date().toISOString() });
    }

    addCorrection(field, oldValue, newValue) {
        this.corrections[field] = { oldValue, newValue, timestamp: new Date().toISOString() };
    }

    toJSON() {
        return {
            valid: this.valid,
            errors: this.errors,
            warnings: this.warnings,
            corrections: this.corrections,
            timestamp: this.timestamp
        };
    }
}

/**
 * 出生数据完整性管理器
 */
class BirthDataIntegrityManager {
    constructor() {
        this.version = '1.0.0';
        this.log = [];
    }

    /**
     * 全面验证单个配置的出生数据
     * @param {Object} config 用户配置
     * @returns {BirthDataIntegrityResult} 验证结果
     */
    validateConfig(config) {
        const result = new BirthDataIntegrityResult();

        if (!config) {
            result.addError('配置为空');
            return result;
        }

        // 1. 检查必填字段
        this._validateRequiredFields(config, result);

        // 2. 验证数据格式
        this._validateDataFormats(config, result);

        // 3. 验证时辰和农历一致性
        this._validateConsistency(config, result);

        // 4. 验证数据时效性
        this._validateTimeliness(config, result);

        return result;
    }

    /**
     * 验证必填字段
     */
    _validateRequiredFields(config, result) {
        const requiredFields = ['birthDate', 'birthTime', 'birthLocation'];
        
        for (const field of requiredFields) {
            if (!config[field]) {
                result.addError(`缺少必填字段: ${field}`, field);
            }
        }
    }

    /**
     * 验证数据格式
     */
    _validateDataFormats(config, result) {
        // 验证出生日期格式
        if (config.birthDate) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(config.birthDate)) {
                result.addError(`出生日期格式错误: ${config.birthDate}`, 'birthDate');
            }
        }

        // 验证出生时间格式
        if (config.birthTime) {
            const timePattern = /^\d{1,2}:\d{2}$/;
            if (!timePattern.test(config.birthTime)) {
                result.addError(`出生时间格式错误: ${config.birthTime}`, 'birthTime');
            }
        }

        // 验证时辰格式
        if (config.shichen) {
            const shichenPattern = /^[子丑寅卯辰巳午未申酉戌亥]时$/;
            if (!shichenPattern.test(config.shichen)) {
                result.addWarning(`时辰格式异常: ${config.shichen}`, 'shichen');
            }
        }

        // 验证地理位置
        if (config.birthLocation) {
            const { lng, lat } = config.birthLocation;
            if (lng === undefined || lng === null || lat === undefined || lat === null) {
                result.addError('经纬度数据不完整', 'birthLocation');
            }
        }
    }

    /**
     * 验证一致性
     */
    _validateConsistency(config, result) {
        try {
            // 验证农历日期一致性
            const lunarValidation = enhancedValidateLunarDate(config);
            
            if (!lunarValidation.valid) {
                result.addError(`农历数据验证失败: ${lunarValidation.error}`, 'lunarBirthDate');
            }

            if (lunarValidation.warnings && lunarValidation.warnings.length > 0) {
                lunarValidation.warnings.forEach(warning => {
                    result.addWarning(warning, 'lunarBirthDate');
                });
            }

            // 验证时辰一致性
            const shichenValidation = validateShichenConsistency(config);
            
            if (!shichenValidation.valid) {
                shichenValidation.warnings.forEach(warning => {
                    result.addWarning(warning, 'shichen');
                });
            }

        } catch (error) {
            result.addError(`一致性验证异常: ${error.message}`);
        }
    }

    /**
     * 验证数据时效性
     */
    _validateTimeliness(config, result) {
        if (config.lastCalculated) {
            const lastCalc = new Date(config.lastCalculated);
            const now = new Date();
            const daysDiff = (now - lastCalc) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 30) {
                result.addWarning(`数据最后计算时间已超过 ${Math.floor(daysDiff)} 天，建议重新计算`);
            }
        }
    }

    /**
     * 自动修复配置数据
     * @param {Object} config 用户配置
     * @returns {Object} 修复后的配置
     */
    autoFixConfig(config) {
        if (!config) {
            return config;
        }

        try {
            // 1. 修复农历和时辰数据
            const fixedConfig = autoFixLunarAndShichenData(config);
            
            // 2. 确保必要字段存在
            const enhancedConfig = this._ensureRequiredFields(fixedConfig);
            
            // 3. 更新计算时间戳
            enhancedConfig.lastCalculated = new Date().toISOString();
            
            this.log.push({
                action: 'autoFixConfig',
                nickname: config.nickname,
                timestamp: new Date().toISOString(),
                changes: this._getChanges(config, enhancedConfig)
            });

            return enhancedConfig;

        } catch (error) {
            console.error('自动修复配置失败:', error);
            return config;
        }
    }

    /**
     * 确保必要字段存在
     */
    _ensureRequiredFields(config) {
        const enhancedConfig = { ...config };
        
        // 确保时辰存在
        if (!enhancedConfig.shichen && enhancedConfig.birthTime) {
            try {
                const { calculateShichenForZiWei } = require('./ConfigValidationHelper');
                const shichenResult = calculateShichenForZiWei(
                    enhancedConfig.birthTime,
                    enhancedConfig.birthLocation?.lng || 116.48,
                    enhancedConfig.birthDate
                );
                
                if (!shichenResult.error) {
                    enhancedConfig.shichen = shichenResult.shichenSimple;
                }
            } catch (error) {
                console.warn('无法计算时辰:', error);
            }
        }

        return enhancedConfig;
    }

    /**
     * 获取配置变化
     */
    _getChanges(oldConfig, newConfig) {
        const changes = {};
        const fields = ['shichen', 'lunarBirthDate', 'trueSolarTime', 'lastCalculated'];
        
        fields.forEach(field => {
            if (oldConfig[field] !== newConfig[field]) {
                changes[field] = {
                    from: oldConfig[field],
                    to: newConfig[field]
                };
            }
        });
        
        return changes;
    }

    /**
     * 批量验证配置数组
     * @param {Array} configs 配置数组
     * @returns {Object} 批量验证结果
     */
    batchValidateConfigs(configs) {
        const results = {
            total: configs.length,
            valid: 0,
            invalid: 0,
            details: [],
            summary: {
                errors: 0,
                warnings: 0,
                corrections: 0
            }
        };

        configs.forEach((config, index) => {
            const validation = this.validateConfig(config);
            
            if (validation.valid) {
                results.valid++;
            } else {
                results.invalid++;
            }

            results.summary.errors += validation.errors.length;
            results.summary.warnings += validation.warnings.length;
            results.summary.corrections += Object.keys(validation.corrections).length;

            results.details.push({
                index,
                nickname: config.nickname,
                valid: validation.valid,
                errors: validation.errors,
                warnings: validation.warnings,
                corrections: validation.corrections
            });
        });

        return results;
    }

    /**
     * 批量修复配置数组
     * @param {Array} configs 配置数组
     * @returns {Object} 批量修复结果
     */
    batchFixConfigs(configs) {
        const results = {
            total: configs.length,
            fixed: 0,
            unchanged: 0,
            errors: [],
            details: []
        };

        configs.forEach((config, index) => {
            try {
                const fixedConfig = this.autoFixConfig(config);
                const changed = JSON.stringify(config) !== JSON.stringify(fixedConfig);
                
                if (changed) {
                    results.fixed++;
                    results.details.push({
                        index,
                        nickname: config.nickname,
                        changed: true,
                        changes: this._getChanges(config, fixedConfig)
                    });
                } else {
                    results.unchanged++;
                    results.details.push({
                        index,
                        nickname: config.nickname,
                        changed: false
                    });
                }

            } catch (error) {
                results.errors.push(`配置 ${index} (${config.nickname}): ${error.message}`);
                results.details.push({
                    index,
                    nickname: config.nickname,
                    changed: false,
                    error: error.message
                });
            }
        });

        return results;
    }

    /**
     * 生成修复报告
     * @param {Object} results 修复结果
     * @returns {string} 报告文本
     */
    generateReport(results) {
        const report = [];
        
        report.push(`# 出生数据完整性报告`);
        report.push(`生成时间: ${new Date().toLocaleString()}`);
        report.push(`版本: ${this.version}`);
        report.push('');

        if (results.total) {
            report.push(`## 统计信息`);
            report.push(`- 总配置数: ${results.total}`);
            
            if (results.valid !== undefined) {
                report.push(`- 有效配置: ${results.valid}`);
                report.push(`- 无效配置: ${results.invalid}`);
            }
            
            if (results.fixed !== undefined) {
                report.push(`- 已修复: ${results.fixed}`);
                report.push(`- 未变化: ${results.unchanged}`);
            }
            
            if (results.summary) {
                report.push(`- 错误数: ${results.summary.errors}`);
                report.push(`- 警告数: ${results.summary.warnings}`);
                report.push(`- 修正数: ${results.summary.corrections}`);
            }
            
            report.push('');
        }

        if (results.errors && results.errors.length > 0) {
            report.push(`## 错误列表`);
            results.errors.forEach(error => {
                report.push(`- ${error}`);
            });
            report.push('');
        }

        if (results.details && results.details.length > 0) {
            report.push(`## 详细结果`);
            results.details.forEach(detail => {
                report.push(`### ${detail.nickname || '未知配置'}`);
                
                if (detail.valid !== undefined) {
                    report.push(`- 状态: ${detail.valid ? '✅ 有效' : '❌ 无效'}`);
                }
                
                if (detail.changed !== undefined) {
                    report.push(`- 修复: ${detail.changed ? '✅ 已修复' : '⏭️ 未变化'}`);
                }
                
                if (detail.errors && detail.errors.length > 0) {
                    report.push(`- 错误:`);
                    detail.errors.forEach(error => {
                        report.push(`  - ${error.message} (${error.field || '未知字段'})`);
                    });
                }
                
                if (detail.warnings && detail.warnings.length > 0) {
                    report.push(`- 警告:`);
                    detail.warnings.forEach(warning => {
                        report.push(`  - ${warning.message} (${warning.field || '未知字段'})`);
                    });
                }
                
                if (detail.changes && Object.keys(detail.changes).length > 0) {
                    report.push(`- 变更:`);
                    Object.entries(detail.changes).forEach(([field, change]) => {
                        report.push(`  - ${field}: ${change.from || '空'} → ${change.to || '空'}`);
                    });
                }
                
                report.push('');
            });
        }

        return report.join('\n');
    }

    /**
     * 清除日志
     */
    clearLog() {
        this.log = [];
    }

    /**
     * 获取日志
     */
    getLog() {
        return [...this.log];
    }
}

// 创建单例实例
const birthDataIntegrityManager = new BirthDataIntegrityManager();

export default birthDataIntegrityManager;
export { BirthDataIntegrityManager, BirthDataIntegrityResult };