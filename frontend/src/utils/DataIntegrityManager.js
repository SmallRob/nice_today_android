/**
 * 数据完整性管理器
 * 负责数据验证、完整性检查和数据校验
 */

class DataIntegrityManager {
  constructor() {
    this.validationRules = {
      nickname: { required: true, type: 'string', maxLength: 20 },
      realName: { required: false, type: 'string', maxLength: 20 },
      birthDate: { 
        required: true, 
        type: 'string', 
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        validate: this.validateBirthDate.bind(this)
      },
      birthTime: { 
        required: true, 
        type: 'string', 
        pattern: /^\d{1,2}:\d{2}$/ 
      },
      shichen: { required: true, type: 'string' },
      birthLocation: {
        required: true,
        type: 'object',
        validate: this.validateLocation.bind(this)
      },
      zodiac: { required: true, type: 'string' },
      zodiacAnimal: { required: true, type: 'string' },
      gender: { 
        required: true, 
        type: 'string', 
        enum: ['male', 'female'] 
      },
      mbti: { 
        required: true, 
        type: 'string', 
        pattern: /^[EI][SN][TF][JP]$/ 
      },
      nameScore: { required: false, type: 'object' },
      bazi: { required: false, type: 'object' },
      isused: { required: true, type: 'boolean' }
    };
  }

  /**
   * 验证出生日期
   */
  validateBirthDate(dateStr) {
    if (!dateStr) return false;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    // 检查日期是否在合理范围内（1900年至今）
    const currentYear = new Date().getFullYear();
    const year = date.getFullYear();
    return year >= 1900 && year <= currentYear;
  }

  /**
   * 验证出生地点
   */
  validateLocation(location) {
    if (!location || typeof location !== 'object') return false;
    
    const requiredFields = ['province', 'city', 'district', 'lng', 'lat'];
    for (const field of requiredFields) {
      if (location[field] === undefined || location[field] === null) {
        return false;
      }
    }
    
    // 验证经纬度范围
    const lng = parseFloat(location.lng);
    const lat = parseFloat(location.lat);
    
    return !isNaN(lng) && !isNaN(lat) && 
           lng >= -180 && lng <= 180 && 
           lat >= -90 && lat <= 90;
  }

  /**
   * 验证单个字段
   */
  validateField(fieldName, value) {
    const rule = this.validationRules[fieldName];
    if (!rule) return { valid: true, message: '无验证规则' };
    
    // 检查必填字段
    if (rule.required && (value === undefined || value === null || value === '')) {
      return { valid: false, message: `${fieldName} 是必填字段` };
    }
    
    // 检查类型
    if (rule.type && value !== undefined && value !== null) {
      if (rule.type === 'string' && typeof value !== 'string') {
        return { valid: false, message: `${fieldName} 必须是字符串类型` };
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        return { valid: false, message: `${fieldName} 必须是数字类型` };
      }
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        return { valid: false, message: `${fieldName} 必须是布尔类型` };
      }
      if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        return { valid: false, message: `${fieldName} 必须是对象类型` };
      }
    }
    
    // 检查枚举值
    if (rule.enum && !rule.enum.includes(value)) {
      return { valid: false, message: `${fieldName} 必须是 ${rule.enum.join(' 或 ')}` };
    }
    
    // 检查正则表达式
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return { valid: false, message: `${fieldName} 格式不正确` };
    }
    
    // 检查最大长度
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return { valid: false, message: `${fieldName} 长度不能超过 ${rule.maxLength} 个字符` };
    }
    
    // 执行自定义验证
    if (rule.validate && typeof rule.validate === 'function') {
      const customResult = rule.validate(value);
      if (!customResult) {
        return { valid: false, message: `${fieldName} 验证失败` };
      }
    }
    
    return { valid: true, message: '验证通过' };
  }

  /**
   * 验证完整配置对象
   */
  validateConfig(config) {
    const errors = [];
    const warnings = [];
    
    // 验证所有字段
    for (const [fieldName, rule] of Object.entries(this.validationRules)) {
      const value = config[fieldName];
      const validation = this.validateField(fieldName, value);
      
      if (!validation.valid) {
        errors.push({ field: fieldName, message: validation.message });
      }
    }
    
    // 检查配置完整性
    const requiredFields = Object.entries(this.validationRules)
      .filter(([_, rule]) => rule.required)
      .map(([fieldName]) => fieldName);
    
    for (const field of requiredFields) {
      if (config[field] === undefined || config[field] === null) {
        errors.push({ field, message: `${field} 字段缺失` });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 数据完整性检查
   */
  checkDataIntegrity(config) {
    const integrityIssues = [];
    
    // 检查关键字段是否为空
    const criticalFields = ['nickname', 'birthDate', 'zodiac', 'zodiacAnimal'];
    for (const field of criticalFields) {
      if (!config[field] || config[field].trim() === '') {
        integrityIssues.push(`${field} 字段为空`);
      }
    }
    
    // 检查数据一致性
    if (config.birthDate && config.birthTime) {
      const birthDateTime = new Date(`${config.birthDate}T${config.birthTime}:00`);
      if (isNaN(birthDateTime.getTime())) {
        integrityIssues.push('出生日期时间格式无效');
      }
    }
    
    // 检查地理位置数据
    if (config.birthLocation) {
      const { lng, lat } = config.birthLocation;
      if (lng === 0 && lat === 0) {
        integrityIssues.push('地理位置数据可能未正确设置');
      }
    }
    
    return {
      isIntegrity: integrityIssues.length === 0,
      issues: integrityIssues
    };
  }

  /**
   * 数据修复建议
   */
  suggestDataRepairs(config) {
    const repairs = [];
    const repairedConfig = { ...config };
    
    // 修复空字段
    if (!repairedConfig.nickname || repairedConfig.nickname.trim() === '') {
      repairedConfig.nickname = '新用户';
      repairs.push('昵称已设置为默认值');
    }
    
    if (!repairedConfig.birthDate || repairedConfig.birthDate.trim() === '') {
      repairedConfig.birthDate = '1991-01-01';
      repairs.push('出生日期已设置为默认值');
    }
    
    if (!repairedConfig.zodiac || repairedConfig.zodiac.trim() === '') {
      repairedConfig.zodiac = '未知';
      repairs.push('星座已设置为默认值');
    }
    
    if (!repairedConfig.zodiacAnimal || repairedConfig.zodiacAnimal.trim() === '') {
      repairedConfig.zodiacAnimal = '未知';
      repairs.push('属相已设置为默认值');
    }
    
    // 修复出生时间格式
    if (repairedConfig.birthTime && !/^\d{1,2}:\d{2}$/.test(repairedConfig.birthTime)) {
      repairedConfig.birthTime = '12:30';
      repairs.push('出生时间已修复为标准格式');
    }
    
    // 修复地理位置数据
    if (!repairedConfig.birthLocation || typeof repairedConfig.birthLocation !== 'object') {
      repairedConfig.birthLocation = {
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        lng: 116.48,
        lat: 38.95
      };
      repairs.push('出生地点已设置为默认值');
    }
    
    return {
      repairedConfig,
      repairs,
      hasRepairs: repairs.length > 0
    };
  }

  /**
   * 数据差异检查
   */
  checkDataDifferences(config1, config2) {
    const differences = [];
    const allFields = Object.keys(this.validationRules);
    
    for (const field of allFields) {
      const value1 = config1[field];
      const value2 = config2[field];
      
      // 深度比较对象
      if (typeof value1 === 'object' && typeof value2 === 'object') {
        const isEqual = JSON.stringify(value1) === JSON.stringify(value2);
        if (!isEqual) {
          differences.push({ field, type: 'object', changed: true });
        }
      } else if (value1 !== value2) {
        differences.push({ 
          field, 
          type: typeof value1, 
          changed: true,
          oldValue: value1,
          newValue: value2
        });
      }
    }
    
    return {
      hasDifferences: differences.length > 0,
      differences
    };
  }

  /**
   * 批量验证多个配置
   */
  batchValidate(configs) {
    const results = {
      validCount: 0,
      invalidCount: 0,
      totalCount: configs.length,
      details: []
    };
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const validation = this.validateConfig(config);
      const integrity = this.checkDataIntegrity(config);
      
      results.details.push({
        index: i,
        config,
        validation,
        integrity,
        isValid: validation.valid && integrity.isIntegrity
      });
      
      if (validation.valid && integrity.isIntegrity) {
        results.validCount++;
      } else {
        results.invalidCount++;
      }
    }
    
    return results;
  }
}

// 创建单例实例
export const dataIntegrityManager = new DataIntegrityManager();

export default DataIntegrityManager;