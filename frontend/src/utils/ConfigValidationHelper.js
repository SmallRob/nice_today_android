/**
 * 配置验证助手
 * 提供全面的出生日期、时辰、经纬度数据验证功能
 * 确保紫微命宫计算的准确性
 */

/**
 * 简化验证出生日期
 * @param {string} birthDateStr YYYY-MM-DD 格式
 * @returns {Object} { valid, error, normalizedDate }
 */
export const validateBirthDate = (birthDateStr) => {
  if (!birthDateStr || typeof birthDateStr !== 'string') {
    return { valid: false, error: '出生日期不能为空', normalizedDate: null };
  }

  // 简化格式检查
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(birthDateStr)) {
    return { valid: false, error: '出生日期格式错误，应为 YYYY-MM-DD', normalizedDate: null };
  }

  // 简化日期验证
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // 只检查基本有效性
  if (isNaN(date.getTime())) {
    return { valid: false, error: '出生日期无效', normalizedDate: null };
  }

  return { 
    valid: true, 
    error: null, 
    normalizedDate: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  };
};

/**
 * 简化验证出生时间
 * @param {string} birthTimeStr HH:MM 格式
 * @returns {Object} { valid, error, normalizedTime }
 */
export const validateBirthTime = (birthTimeStr) => {
  if (!birthTimeStr || typeof birthTimeStr !== 'string') {
    return { valid: false, error: '出生时间不能为空', normalizedTime: null };
  }

  // 简化格式检查（只支持 HH:MM）
  const timePattern = /^\d{1,2}:\d{2}$/;
  if (!timePattern.test(birthTimeStr)) {
    return { valid: false, error: '出生时间格式错误，应为 HH:MM', normalizedTime: null };
  }

  const [hourStr, minuteStr] = birthTimeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // 简化范围检查
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { valid: false, error: '出生时间无效', normalizedTime: null };
  }

  return { valid: true, error: null, normalizedTime: birthTimeStr };
};

/**
 * 验证经纬度（增强版）
 * @param {number|object} location 经度、纬度或位置对象
 * @returns {Object} { valid, error, normalizedLocation }
 */
export const validateLocation = (location) => {
  // 支持多种输入格式
  let lng, lat;

  if (typeof location === 'number') {
    // 单独传入经度（这种情况较少见）
    return { valid: false, error: '需要同时提供经度和纬度', normalizedLocation: null };
  }

  if (typeof location === 'object' && location !== null) {
    lng = location.lng ?? location.longitude;
    lat = location.lat ?? location.latitude;
  }

  // 检查必填性
  if (lng === undefined || lng === null || isNaN(lng)) {
    return { valid: false, error: '经度不能为空', normalizedLocation: null };
  }

  if (lat === undefined || lat === null || isNaN(lat)) {
    return { valid: false, error: '纬度不能为空', normalizedLocation: null };
  }

  // 转换为数字
  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);

  if (isNaN(lngNum) || isNaN(latNum)) {
    return { valid: false, error: '经纬度必须是有效数字', normalizedLocation: null };
  }

  // 检查经度范围（-180 到 180）
  if (lngNum < -180 || lngNum > 180) {
    return { valid: false, error: '经度必须在 -180 到 180 之间', normalizedLocation: null };
  }

  // 检查纬度范围（-90 到 90）
  if (latNum < -90 || latNum > 90) {
    return { valid: false, error: '纬度必须在 -90 到 90 之间', normalizedLocation: null };
  }

  // 检查精度（保留 6 位小数，约等于 0.1 米）
  const maxPrecision = 6;
  const lngStr = lngNum.toString();
  const latStr = latNum.toString();
  
  const lngDecimalPlaces = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;
  const latDecimalPlaces = latStr.includes('.') ? latStr.split('.')[1].length : 0;

  // 如果精度过高，进行截断
  const finalLng = lngDecimalPlaces > maxPrecision ? 
    parseFloat(lngNum.toFixed(maxPrecision)) : lngNum;
  const finalLat = latDecimalPlaces > maxPrecision ? 
    parseFloat(latNum.toFixed(maxPrecision)) : latNum;

  const normalizedLocation = {
    lng: finalLng,
    lat: finalLat,
    province: location?.province || '',
    city: location?.city || '',
    district: location?.district || ''
  };

  return { valid: true, error: null, normalizedLocation };
};

/**
 * 简化验证出生信息
 * @param {Object} config 用户配置对象
 * @returns {Object} { valid, errors, warnings, normalizedData }
 */
export const validateBirthInfoForZiWei = (config) => {
  const errors = [];
  const warnings = [];
  const normalizedData = { ...config };

  // 1. 验证出生日期
  if (!config.birthDate) {
    errors.push({ field: 'birthDate', message: '出生日期不能为空' });
  } else {
    const dateValidation = validateBirthDate(config.birthDate);
    if (!dateValidation.valid) {
      errors.push({ field: 'birthDate', message: dateValidation.error });
    }
  }

  // 2. 验证出生时间
  if (!config.birthTime) {
    errors.push({ field: 'birthTime', message: '出生时间不能为空' });
  } else {
    const timeValidation = validateBirthTime(config.birthTime);
    if (!timeValidation.valid) {
      errors.push({ field: 'birthTime', message: timeValidation.error });
    }
  }

  // 3. 验证地理位置（简化检查）
  if (!config.birthLocation) {
    errors.push({ field: 'birthLocation', message: '出生地点不能为空' });
  } else if (!config.birthLocation.lng || !config.birthLocation.lat) {
    errors.push({ field: 'birthLocation', message: '请提供完整的经纬度信息' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedData
  };
};

/**
 * 检测出生信息是否发生变化
 * @param {Object} oldConfig 旧配置
 * @param {Object} newConfig 新配置
 * @returns {Object} { hasChanges, changedFields, shouldRecalculate }
 */
export const detectBirthInfoChanges = (oldConfig, newConfig) => {
  const criticalFields = ['birthDate', 'birthTime', 'birthLocation'];
  const changedFields = [];

  for (const field of criticalFields) {
    const oldValue = oldConfig?.[field];
    const newValue = newConfig?.[field];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changedFields.push(field);
    }
  }

  const hasChanges = changedFields.length > 0;
  
  // 判断是否需要重新计算紫微命宫
  const shouldRecalculate = hasChanges || 
                                !oldConfig?.ziweiData || 
                                !oldConfig?.ziweiCalculatedAt;

  return {
    hasChanges,
    changedFields,
    shouldRecalculate
  };
};

/**
 * 计算时辰（增强版，用于紫微命宫）
 * @param {string} birthTimeStr HH:MM 格式
 * @param {number} longitude 经度
 * @param {string} birthDateStr YYYY-MM-DD 格式（用于真太阳时计算）
 * @returns {Object} { shichenSimple, shichenFull, trueSolarTime, error }
 */
export const calculateShichenForZiWei = (birthTimeStr, longitude, birthDateStr) => {
  try {
    // 1. 验证输入
    if (!birthTimeStr || longitude === undefined || longitude === null) {
      return { 
        shichenSimple: null, 
        shichenFull: null, 
        trueSolarTime: null, 
        error: '缺少必要参数' 
      };
    }

    // 2. 验证时间格式
    const timeValidation = validateBirthTime(birthTimeStr);
    if (!timeValidation.valid) {
      return { 
        shichenSimple: null, 
        shichenFull: null, 
        trueSolarTime: null, 
        error: timeValidation.error 
      };
    }

    // 3. 计算真太阳时
    let trueSolarTime = birthTimeStr;
    if (birthDateStr) {
      // 使用统一的天文计算函数
      const { calculateTrueSolarTime } = require('./astronomy');
      trueSolarTime = calculateTrueSolarTime(birthDateStr, birthTimeStr, longitude);
    }

    // 4. 解析真太阳时
    const [trueHour, trueMinute] = trueSolarTime.split(':').map(Number);

    // 5. 根据真太阳时计算时辰（每2小时为一个时辰）
    // 子时: 23:00-01:00，丑时: 01:00-03:00，以此类推
    const shichenIndex = Math.floor((trueHour + 1) / 2) % 12;
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const shichenZhi = diZhi[shichenIndex];

    // 6. 计算刻（每15分钟一刻）
    const keIndex = Math.floor(trueMinute / 15);
    const keMap = ['初刻', '一刻', '二刻', '三刻'];
    const ke = keMap[keIndex];

    // 7. 生成时辰信息
    const shichenSimple = `${shichenZhi}时`;
    const shichenFull = `${shichenZhi}时${ke}`;

    // 8. 数据完整性检查
    if (!shichenZhi || !ke) {
      throw new Error('时辰计算异常');
    }

    return {
      shichenSimple,
      shichenFull,
      trueSolarTime,
      shichenIndex,
      shichenZhi,
      ke,
      error: null
    };
  } catch (error) {
    console.error('计算时辰失败:', error);
    return {
      shichenSimple: null,
      shichenFull: null,
      trueSolarTime: null,
      error: error.message
    };
  }
};

/**
 * 验证时辰数据一致性
 * @param {Object} config 用户配置
 * @returns {Object} { valid, warnings, correctedData }
 */
export const validateShichenConsistency = (config) => {
  const warnings = [];
  const correctedData = {};
  
  if (!config) {
    return { valid: false, warnings: ['配置为空'], correctedData: {} };
  }

  // 检查时辰与出生时间的一致性
  if (config.birthTime && config.shichen) {
    try {
      const { calculateShichenForZiWei } = require('./ConfigValidationHelper');
      const calculated = calculateShichenForZiWei(config.birthTime, config.birthLocation?.lng || 116.48, config.birthDate);
      
      if (calculated.error) {
        warnings.push(`时辰计算失败: ${calculated.error}`);
      } else if (calculated.shichenSimple !== config.shichen) {
        warnings.push(`时辰不一致: 配置中为 ${config.shichen}，计算为 ${calculated.shichenSimple}`);
        correctedData.shichen = calculated.shichenSimple;
      }
    } catch (error) {
      warnings.push(`时辰验证异常: ${error.message}`);
    }
  }

  // 检查农历日期与真太阳时的一致性
  if (config.birthDate && config.birthTime && config.birthLocation) {
    try {
      const { generateLunarAndTrueSolarFields } = require('./LunarCalendarHelper');
      const calculated = generateLunarAndTrueSolarFields(config);
      
      if (calculated.lunarBirthDate && config.lunarBirthDate !== calculated.lunarBirthDate) {
        warnings.push(`农历日期不一致: 配置中为 ${config.lunarBirthDate}，计算为 ${calculated.lunarBirthDate}`);
        correctedData.lunarBirthDate = calculated.lunarBirthDate;
      }
      
      if (calculated.trueSolarTime && config.trueSolarTime !== calculated.trueSolarTime) {
        warnings.push(`真太阳时不一致: 配置中为 ${config.trueSolarTime}，计算为 ${calculated.trueSolarTime}`);
        correctedData.trueSolarTime = calculated.trueSolarTime;
      }
    } catch (error) {
      warnings.push(`农历验证异常: ${error.message}`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
    correctedData
  };
};

/**
 * 批量修复配置中的时辰和农历数据
 * @param {Array} configs 配置数组
 * @returns {Object} 修复结果
 */
export const batchFixShichenAndLunarData = (configs) => {
  const results = {
    total: configs.length,
    fixed: 0,
    errors: [],
    details: []
  };

  configs.forEach((config, index) => {
    try {
      const validation = validateShichenConsistency(config);
      
      if (!validation.valid && Object.keys(validation.correctedData).length > 0) {
        // 应用修正
        const fixedConfig = { ...config, ...validation.correctedData };
        results.fixed++;
        results.details.push({
          index,
          nickname: config.nickname,
          warnings: validation.warnings,
          corrections: validation.correctedData
        });
      }
    } catch (error) {
      results.errors.push(`配置 ${index} (${config.nickname}): ${error.message}`);
    }
  });

  return results;
};

/**
 * 格式化经纬度显示
 * @param {Object} location 包含 lng, lat 的对象
 * @param {number} precision 小数位数（默认 4）
 * @returns {string} 格式化后的字符串
 */
export const formatCoordinateDisplay = (location, precision = 4) => {
  if (!location) return '';
  
  const { lng, lat, province, city, district } = location;
  
  if (lng === undefined || lat === undefined) {
    return province && city ? `${province} ${city} ${district || ''}` : '';
  }

  const lngStr = typeof lng === 'number' ? lng.toFixed(precision) : lng;
  const latStr = typeof lat === 'number' ? lat.toFixed(precision) : lat;

  let result = '';
  if (province && city) {
    result = `${province} ${city} ${district || ''}`;
  }

  result += ` (经度: ${lngStr}°, 纬度: ${latStr}°)`;

  return result;
};

/**
 * 验证紫微命宫计算所需的所有数据
 * @param {Object} config 用户配置
 * @returns {Object} { valid, canCalculate, missingFields, errors, warnings }
 */
export const validateZiWeiCalculationRequirements = (config) => {
  const errors = [];
  const warnings = [];
  const missingFields = [];

  // 1. 检查必填字段
  const requiredFields = ['birthDate', 'birthTime', 'birthLocation'];
  for (const field of requiredFields) {
    if (!config[field]) {
      missingFields.push(field);
      errors.push({ field, message: `缺少必填字段: ${field}` });
    }
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      canCalculate: false,
      missingFields,
      errors,
      warnings
    };
  }

  // 2. 验证每个字段
  const dateValidation = validateBirthDate(config.birthDate);
  if (!dateValidation.valid) {
    errors.push({ field: 'birthDate', message: dateValidation.error });
  }

  const timeValidation = validateBirthTime(config.birthTime);
  if (!timeValidation.valid) {
    errors.push({ field: 'birthTime', message: timeValidation.error });
  }

  const locationValidation = validateLocation(config.birthLocation);
  if (!locationValidation.valid) {
    errors.push({ field: 'birthLocation', message: locationValidation.error });
  }

  // 3. 检查数据质量
  if (config.birthLocation) {
    const { lng, lat } = config.birthLocation;
    
    // 检查是否在经纬度的极端值
    if (Math.abs(lng) > 175 || Math.abs(lat) > 85) {
      warnings.push({
        field: 'birthLocation',
        message: '出生地点位置较偏僻，紫微命盘计算精度可能降低'
      });
    }

    // 检查是否在中国境内
    if (lng < 73 || lng > 135 || lat < 18 || lat > 54) {
      warnings.push({
        field: 'birthLocation',
        message: '出生地点位于中国境外，紫微命盘算法可能不适用'
      });
    }
  }

  const valid = errors.length === 0;
  const canCalculate = valid && missingFields.length === 0;

  return {
    valid,
    canCalculate,
    missingFields,
    errors,
    warnings
  };
};

export default {
  validateBirthDate,
  validateBirthTime,
  validateLocation,
  validateBirthInfoForZiWei,
  detectBirthInfoChanges,
  calculateShichenForZiWei,
  formatCoordinateDisplay,
  validateZiWeiCalculationRequirements
};
