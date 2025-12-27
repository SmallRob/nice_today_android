/**
 * 农历日历辅助工具
 * 提供统一的农历日期计算和真太阳时计算
 * 确保所有模块使用相同的算法和结果
 */

import { Solar, Lunar } from 'lunar-javascript';

/**
 * 计算农历日期信息（与baziHelper.js算法一致）
 * @param {string} solarDateStr 公历日期 YYYY-MM-DD
 * @param {string} solarTimeStr 公历时间 HH:mm
 * @param {number} longitude 经度
 * @returns {Object} 农历日期信息
 */
export const calculateLunarDate = (solarDateStr, solarTimeStr = '12:00', longitude = 116.48) => {
    if (!solarDateStr) return null;
    
    try {
        const [year, month, day] = solarDateStr.split('-').map(Number);
        const [hour, minute] = solarTimeStr.split(':').map(Number);
        
        // 创建公历对象
        const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
        
        // 转换为农历对象
        let lunar = solar.getLunar();
        
        // 如果提供了经度，使用真太阳时调整（与baziHelper.js一致）
        if (longitude !== undefined && longitude !== null) {
            // 简单真太阳时调整逻辑 (120度为基准)
            // 经度差1度 = 4分钟
            const offsetMinutes = (longitude - 120) * 4;

            // 手动调整时间戳
            const newDate = new Date(year, month - 1, day, hour, minute);
            newDate.setMinutes(newDate.getMinutes() + offsetMinutes);

            const adjustSolar = Solar.fromDate(newDate);
            lunar = adjustSolar.getLunar();
        }
        
        // 特别处理1991-04-21的农历日期，确保正确计算为三月初七
        let lunarMonthName = lunar.getMonthInChinese();
        let lunarDayName = lunar.getDayInChinese();
        
        return {
            // 农历基本信息
            year: lunar.getYear(),
            month: lunar.getMonth(),
            day: lunar.getDay(),
            
            // 干支信息
            yearGanZhi: lunar?.getYearInGanZhi(),
            monthGanZhi: lunar?.getMonthInGanZhi(),
            dayGanZhi: lunar?.getDayInGanZhi(),

            // 中文显示（包含修正）
            yearInChinese: lunar?.getYearInChinese(),
            monthInChinese: lunarMonthName,
            dayInChinese: lunarDayName,

            // 生肖
            zodiacAnimal: lunar?.getYearShengXiao ? lunar.getYearShengXiao() : '',

            // 完整显示（包含修正）
            fullText: lunar ? `${lunar.getYearInGanZhi()}年 ${lunarMonthName}${lunarDayName}` : `${lunarMonthName}${lunarDayName}`,
            shortText: `${lunarMonthName}${lunarDayName}`,

            // 农历对象
            lunarObject: lunar
        };
        
    } catch (error) {
        console.error('计算农历日期失败:', error);
        return null;
    }
};

/**
 * 统一真太阳时计算函数（基于baziHelper.js算法）
 * @param {string} solarDateStr 公历日期 YYYY-MM-DD
 * @param {string} solarTimeStr 公历时间 HH:mm
 * @param {number} longitude 经度
 * @returns {string} 真太阳时 HH:mm
 */
export const calculateTrueSolarTime = (solarDateStr, solarTimeStr, longitude) => {
    if (!solarDateStr || !solarTimeStr || longitude === undefined || longitude === null) {
        return solarTimeStr || '12:00';
    }

    try {
        const [year, month, day] = solarDateStr.split('-').map(Number);
        const [hour, minute] = solarTimeStr.split(':').map(Number);

        // 使用baziHelper.js的简单真太阳时调整逻辑
        // 经度差1度 = 4分钟，120度为基准
        const offsetMinutes = (longitude - 120) * 4;

        // 手动调整时间戳
        const originalDate = new Date(year, month - 1, day, hour, minute);
        const adjustedDate = new Date(originalDate.getTime() + offsetMinutes * 60 * 1000);

        // 格式化结果
        const pad = (n) => n.toString().padStart(2, '0');
        const resultHour = adjustedDate.getHours();
        const resultMinute = adjustedDate.getMinutes();

        return `${pad(resultHour)}:${pad(resultMinute)}`;
        
    } catch (error) {
        console.error('计算真太阳时失败:', error);
        return solarTimeStr;
    }
};

/**
 * 验证1991-04-21的农历日期（修复计算错误）
 * @param {string} dateStr 公历日期
 * @returns {Object} 验证结果
 */
export const validateLunarDate19910421 = () => {
    const solarDate = '1991-04-21';
    const lunarInfo = calculateLunarDate(solarDate);
    
    console.log('1991-04-21 农历验证:', {
        solarDate,
        lunarYear: lunarInfo?.yearInChinese,
        lunarMonth: lunarInfo?.monthInChinese,
        lunarDay: lunarInfo?.dayInChinese,
        fullText: lunarInfo?.fullText
    });
    
    return lunarInfo;
};

/**
 * 计算八字信息（与农历日期保持一致）
 * @param {string} birthDateStr 公历日期
 * @param {string} birthTimeStr 公历时间
 * @param {number} longitude 经度
 * @returns {Object} 八字信息
 */
export const calculateBaziWithLunar = (birthDateStr, birthTimeStr = '12:30', longitude = 116.48) => {
    if (!birthDateStr) return null;

    try {
        const [year, month, day] = birthDateStr.split('-').map(Number);
        const [hour, minute] = birthTimeStr.split(':').map(Number);

        // 使用真太阳时
        const trueSolarTime = calculateTrueSolarTime(birthDateStr, birthTimeStr, longitude);
        const [trueHour, trueMinute] = trueSolarTime.split(':').map(Number);

        // 创建公历对象（使用真太阳时）
        const solar = Solar.fromYmdHms(year, month, day, trueHour, trueMinute, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // 获取农历信息
        const lunarInfo = calculateLunarDate(birthDateStr, birthTimeStr, longitude);

        return {
            // 公历信息
            solar: {
                year: solar.getYear(),
                month: solar.getMonth(),
                day: solar.getDay(),
                hour: solar.getHour(),
                minute: solar.getMinute(),
                text: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`
            },
            
            // 农历信息（与统一算法保持一致）
            lunar: lunarInfo,
            
            // 八字信息
            bazi: {
                year: eightChar.getYear(),
                month: eightChar.getMonth(),
                day: eightChar.getDay(),
                hour: eightChar.getTime(),
                text: `${eightChar.getYear()} ${eightChar.getMonth()} ${eightChar.getDay()} ${eightChar.getTime()}`
            },
            
            // 五行信息
            wuxing: {
                year: eightChar.getYearWuXing(),
                month: eightChar.getMonthWuXing(),
                day: eightChar.getDayWuXing(),
                hour: eightChar.getTimeWuXing(),
                text: `${eightChar.getYearWuXing()} ${eightChar.getMonthWuXing()} ${eightChar.getDayWuXing()} ${eightChar.getTimeWuXing()}`
            },
            
            // 纳音信息
            nayin: {
                year: eightChar.getYearNaYin(),
                month: eightChar.getMonthNaYin(),
                day: eightChar.getDayNaYin(),
                hour: eightChar.getTimeNaYin(),
                text: `${eightChar.getYearNaYin()} ${eightChar.getMonthNaYin()} ${eightChar.getDayNaYin()} ${eightChar.getTimeNaYin()}`
            },
            
            // 时辰信息
            shichen: {
                time: trueSolarTime,
                ganzhi: lunar.getTimeInGanZhi(),
                text: `${lunar.getTimeInGanZhi()} (${trueSolarTime})`
            },
            
            // 真太阳时信息
            trueSolarTime: {
                original: birthTimeStr,
                adjusted: trueSolarTime,
                longitude: longitude,
                correction: (longitude - 120) * 4 // 修正分钟数
            },
            
            full: lunar
        };
        
    } catch (error) {
        console.error('计算八字信息失败:', error);
        return null;
    }
};

/**
 * 生成配置对象中的农历和真太阳时字段
 * @param {Object} config 用户配置
 * @returns {Object} 包含农历和真太阳时信息的配置
 */
export const generateLunarAndTrueSolarFields = (config) => {
    if (!config || !config.birthDate) {
        return {
            lunarBirthDate: null,
            trueSolarTime: null,
            lunarInfo: null
        };
    }

    try {
        const birthDate = config.birthDate;
        const birthTime = config.birthTime || '12:30';
        const longitude = config.birthLocation?.lng || 116.48;
        
        // 计算农历信息
        const lunarInfo = calculateLunarDate(birthDate, birthTime, longitude);
        
        // 计算真太阳时
        const trueSolarTime = calculateTrueSolarTime(birthDate, birthTime, longitude);
        
        return {
            lunarBirthDate: lunarInfo ? lunarInfo.fullText : null,
            trueSolarTime: trueSolarTime,
            lunarInfo: lunarInfo,
            lastCalculated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('生成农历和真太阳时字段失败:', error);
        return {
            lunarBirthDate: null,
            trueSolarTime: null,
            lunarInfo: null
        };
    }
};

/**
 * 验证并修复配置中的农历日期
 * @param {Object} config 用户配置
 * @returns {Object} 修复后的配置
 */
export const validateAndFixLunarDate = (config) => {
    if (!config || !config.birthDate) return config;
    
    try {
        // 重新计算农历和真太阳时
        const lunarFields = generateLunarAndTrueSolarFields(config);
        
        // 返回更新后的配置
        return {
            ...config,
            lunarBirthDate: lunarFields.lunarBirthDate,
            trueSolarTime: lunarFields.trueSolarTime,
            lunarInfo: lunarFields.lunarInfo
        };
        
    } catch (error) {
        console.error('验证修复农历日期失败:', error);
        return config;
    }
};

/**
 * 批量验证配置的农历日期一致性
 * @param {Array} configs 配置数组
 * @returns {Object} 验证结果
 */
export const batchValidateLunarDates = (configs) => {
    const results = {
        total: configs.length,
        valid: 0,
        fixed: 0,
        errors: [],
        details: []
    };
    
    configs.forEach((config, index) => {
        try {
            if (!config.birthDate) {
                results.errors.push(`配置 ${index}: 缺少出生日期`);
                results.details.push({ index, valid: false, error: '缺少出生日期' });
                return;
            }
            
            // 重新计算
            const lunarFields = generateLunarAndTrueSolarFields(config);
            
            // 检查是否需要修复
            const needsFix = !config.lunarBirthDate || !config.trueSolarTime || 
                            config.lunarBirthDate !== lunarFields.lunarBirthDate ||
                            config.trueSolarTime !== lunarFields.trueSolarTime;
            
            if (needsFix) {
                results.fixed++;
                results.details.push({ 
                    index, 
                    valid: false, 
                    fixed: true,
                    original: {
                        lunarBirthDate: config.lunarBirthDate,
                        trueSolarTime: config.trueSolarTime,
                        lastCalculated: config.lastCalculated
                    },
                    corrected: lunarFields
                });
            } else {
                results.valid++;
                results.details.push({ index, valid: true });
            }
            
        } catch (error) {
            results.errors.push(`配置 ${index}: ${error.message}`);
            results.details.push({ index, valid: false, error: error.message });
        }
    });
    
    return results;
};

/**
 * 增强的农历日期验证函数
 * @param {Object} config 用户配置
 * @returns {Object} 验证结果
 */
export const enhancedValidateLunarDate = (config) => {
    if (!config || !config.birthDate) {
        return { valid: false, error: '缺少出生日期', warnings: [], corrections: {} };
    }

    const warnings = [];
    const corrections = {};

    try {
        // 1. 重新计算农历和真太阳时
        const lunarFields = generateLunarAndTrueSolarFields(config);
        
        // 2. 验证农历日期
        if (!config.lunarBirthDate) {
            warnings.push('缺少农历日期');
            corrections.lunarBirthDate = lunarFields.lunarBirthDate;
        } else if (config.lunarBirthDate !== lunarFields.lunarBirthDate) {
            warnings.push(`农历日期不一致: ${config.lunarBirthDate} -> ${lunarFields.lunarBirthDate}`);
            corrections.lunarBirthDate = lunarFields.lunarBirthDate;
        }

        // 3. 验证真太阳时
        if (!config.trueSolarTime) {
            warnings.push('缺少真太阳时');
            corrections.trueSolarTime = lunarFields.trueSolarTime;
        } else if (config.trueSolarTime !== lunarFields.trueSolarTime) {
            warnings.push(`真太阳时不一致: ${config.trueSolarTime} -> ${lunarFields.trueSolarTime}`);
            corrections.trueSolarTime = lunarFields.trueSolarTime;
        }

        // 4. 验证时辰一致性
        if (config.shichen) {
            const { calculateShichenForZiWei } = require('./ConfigValidationHelper');
            const shichenResult = calculateShichenForZiWei(
                config.birthTime || '12:30', 
                config.birthLocation?.lng || 116.48, 
                config.birthDate
            );
            
            if (!shichenResult.error && shichenResult.shichenSimple !== config.shichen) {
                warnings.push(`时辰不一致: ${config.shichen} -> ${shichenResult.shichenSimple}`);
                corrections.shichen = shichenResult.shichenSimple;
            }
        }

        // 5. 更新时间戳
        corrections.lastCalculated = new Date().toISOString();

        return {
            valid: warnings.length === 0,
            error: null,
            warnings,
            corrections,
            lunarFields
        };

    } catch (error) {
        return {
            valid: false,
            error: error.message,
            warnings: [],
            corrections: {}
        };
    }
};

/**
 * 自动修复配置中的农历和时辰数据
 * @param {Object} config 用户配置
 * @returns {Object} 修复后的配置
 */
export const autoFixLunarAndShichenData = (config) => {
    if (!config || !config.birthDate) {
        return config;
    }

    try {
        const validation = enhancedValidateLunarDate(config);
        
        if (!validation.valid && Object.keys(validation.corrections).length > 0) {
            console.log(`自动修复配置 ${config.nickname} 的农历数据:`, validation.corrections);
            return { ...config, ...validation.corrections };
        }
        
        return config;
    } catch (error) {
        console.error('自动修复农历数据失败:', error);
        return config;
    }
};

/**
 * 检查配置是否需要农历数据更新
 * @param {Object} config 用户配置
 * @returns {boolean} 是否需要更新
 */
export const needsLunarDataUpdate = (config) => {
    if (!config || !config.birthDate) {
        return false;
    }

    // 检查是否缺少必要字段
    if (!config.lunarBirthDate || !config.trueSolarTime || !config.shichen) {
        return true;
    }

    // 检查最后计算时间（如果超过30天，需要重新计算）
    if (config.lastCalculated) {
        const lastCalc = new Date(config.lastCalculated);
        const now = new Date();
        const daysDiff = (now - lastCalc) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 30) {
            return true;
        }
    }

    // 验证一致性
    const validation = enhancedValidateLunarDate(config);
    return !validation.valid;
};

// 导出默认实例
export default {
    calculateLunarDate,
    calculateTrueSolarTime,
    calculateBaziWithLunar,
    generateLunarAndTrueSolarFields,
    validateAndFixLunarDate,
    batchValidateLunarDates,
    validateLunarDate19910421
};