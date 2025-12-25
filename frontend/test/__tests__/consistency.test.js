/**
 * 配置数据一致性测试套件
 * 测试配置数据的完整性、一致性验证和错误恢复机制
 */

const { enhancedUserConfigManager } = require('../../src/utils/EnhancedUserConfigManager.js');
const birthDataIntegrityManager = require('../../src/utils/BirthDataIntegrityManager.js');

// 测试数据：完整配置和部分配置
const TEST_CONFIGS = {
  complete: {
    nickname: '完整配置测试',
    realName: '王五',
    birthDate: '1985-06-15',
    birthTime: '14:30',
    birthLocation: {
      province: '上海',
      city: '上海市',
      district: '浦东新区',
      lng: 121.47,
      lat: 31.23
    },
    gender: 'female',
    zodiac: '双子座',
    zodiacAnimal: '牛',
    mbti: 'ENFP'
  },
  partial: {
    nickname: '部分配置测试',
    birthDate: '1995-03-20',
    birthTime: '08:00'
    // 缺少位置、姓名等信息
  },
  corrupted: {
    nickname: '损坏数据测试',
    birthDate: 'invalid-date',
    birthTime: 'invalid-time',
    birthLocation: {
      lng: 'invalid-number',
      lat: 'invalid-number'
    }
  }
};

// 数据完整性验证函数
const validateConfigIntegrity = (config) => {
  const errors = [];
  const warnings = [];

  // 必填字段检查
  if (!config.nickname || config.nickname.trim() === '') {
    errors.push('昵称不能为空');
  }

  if (!config.birthDate) {
    errors.push('出生日期不能为空');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(config.birthDate)) {
    errors.push('出生日期格式不正确');
  }

  if (!config.birthTime) {
    errors.push('出生时间不能为空');
  } else if (!/^\d{1,2}:\d{2}$/.test(config.birthTime)) {
    errors.push('出生时间格式不正确');
  }

  // 位置信息检查
  if (!config.birthLocation) {
    warnings.push('缺少出生位置信息');
  } else {
    if (config.birthLocation.lng === undefined || config.birthLocation.lng === null) {
      warnings.push('经度信息缺失');
    } else if (isNaN(parseFloat(config.birthLocation.lng))) {
      errors.push('经度格式不正确');
    }

    if (config.birthLocation.lat === undefined || config.birthLocation.lat === null) {
      warnings.push('纬度信息缺失');
    } else if (isNaN(parseFloat(config.birthLocation.lat))) {
      errors.push('纬度格式不正确');
    }
  }

  // 数据范围检查
  if (config.birthDate) {
    const birthYear = parseInt(config.birthDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (birthYear < 1900 || birthYear > currentYear) {
      warnings.push(`出生年份${birthYear}可能超出合理范围`);
    }
  }

  if (config.birthTime) {
    const [hours, minutes] = config.birthTime.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      errors.push('出生时间超出有效范围');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};

// 测试套件描述
describe('配置数据一致性测试套件', () => {
  beforeEach(async () => {
    await enhancedUserConfigManager.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 测试1: 数据完整性验证
  describe('数据完整性验证', () => {
    test('应该验证完整配置数据的完整性', () => {
      const validation = validateConfigIntegrity(TEST_CONFIGS.complete);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    test('应该检测部分配置数据的问题', () => {
      const validation = validateConfigIntegrity(TEST_CONFIGS.partial);
      
      expect(validation.valid).toBe(true); // 部分配置可能仍然有效
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings).toContain('缺少出生位置信息');
    });

    test('应该拒绝损坏的配置数据', () => {
      const validation = validateConfigIntegrity(TEST_CONFIGS.corrupted);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('出生日期格式不正确');
      expect(validation.errors).toContain('出生时间格式不正确');
    });
  });

  // 测试2: 配置数据一致性检查
  describe('配置数据一致性检查', () => {
    test('保存和读取的配置数据应该一致', async () => {
      // 保存配置
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.complete);
      
      // 读取配置
      const configs = enhancedUserConfigManager.getAllConfigs();
      const savedConfig = configs[configs.length - 1];
      
      // 验证数据一致性
      expect(savedConfig.nickname).toBe(TEST_CONFIGS.complete.nickname);
      expect(savedConfig.birthDate).toBe(TEST_CONFIGS.complete.birthDate);
      expect(savedConfig.birthTime).toBe(TEST_CONFIGS.complete.birthTime);
      
      // 验证位置信息一致性
      expect(savedConfig.birthLocation.province).toBe(TEST_CONFIGS.complete.birthLocation.province);
      expect(savedConfig.birthLocation.city).toBe(TEST_CONFIGS.complete.birthLocation.city);
      expect(savedConfig.birthLocation.lng).toBeCloseTo(TEST_CONFIGS.complete.birthLocation.lng, 2);
      expect(savedConfig.birthLocation.lat).toBeCloseTo(TEST_CONFIGS.complete.birthLocation.lat, 2);
    });

    test('修改配置后相关字段应该同步更新', async () => {
      // 添加初始配置
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.complete);
      const configs = enhancedUserConfigManager.getAllConfigs();
      const configIndex = configs.length - 1;
      
      // 修改配置
      const updatedConfig = {
        ...configs[configIndex],
        birthDate: '2000-01-01',
        birthTime: '20:00',
        birthLocation: {
          ...configs[configIndex].birthLocation,
          province: '广东',
          city: '广州市'
        }
      };

      await enhancedUserConfigManager.updateConfigWithNodeUpdate(configIndex, updatedConfig);
      
      // 验证修改后的数据一致性
      const freshConfigs = enhancedUserConfigManager.getAllConfigs();
      const modifiedConfig = freshConfigs[configIndex];
      
      expect(modifiedConfig.birthDate).toBe('2000-01-01');
      expect(modifiedConfig.birthTime).toBe('20:00');
      expect(modifiedConfig.birthLocation.province).toBe('广东');
      expect(modifiedConfig.birthLocation.city).toBe('广州市');
      
      // 验证其他字段保持不变
      expect(modifiedConfig.nickname).toBe(TEST_CONFIGS.complete.nickname);
      expect(modifiedConfig.gender).toBe(TEST_CONFIGS.complete.gender);
    });
  });

  // 测试3: 错误恢复和容错机制
  describe('错误恢复和容错机制', () => {
    test('应该自动修复部分损坏的数据', async () => {
      // 尝试保存有问题的数据
      const result = await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.corrupted);
      
      if (result) {
        const configs = enhancedUserConfigManager.getAllConfigs();
        const savedConfig = configs[configs.length - 1];
        
        // 验证数据被修复
        expect(savedConfig.birthDate).not.toBe('invalid-date');
        expect(savedConfig.birthTime).not.toBe('invalid-time');
        
        // 验证经纬度被转换为数字或使用默认值
        expect(typeof savedConfig.birthLocation.lng).toBe('number');
        expect(typeof savedConfig.birthLocation.lat).toBe('number');
        expect(isNaN(savedConfig.birthLocation.lng)).toBe(false);
        expect(isNaN(savedConfig.birthLocation.lat)).toBe(false);
      }
    });

    test('应该处理缺失字段的默认值填充', async () => {
      const partialConfig = {
        nickname: '缺失字段测试',
        birthDate: '1990-01-01'
        // 故意缺少 birthTime 和 birthLocation
      };

      const result = await enhancedUserConfigManager.addBasicConfig(partialConfig);
      
      if (result) {
        const configs = enhancedUserConfigManager.getAllConfigs();
        const savedConfig = configs[configs.length - 1];
        
        // 验证缺失字段被填充默认值
        expect(savedConfig.birthTime).toBeDefined();
        expect(savedConfig.birthLocation).toBeDefined();
        expect(savedConfig.birthLocation.lng).toBeDefined();
        expect(savedConfig.birthLocation.lat).toBeDefined();
      }
    });
  });

  // 测试4: 数据完整性管理器测试
  describe('数据完整性管理器测试', () => {
    test('应该检测配置数据的完整性', () => {
      const completeCheck = birthDataIntegrityManager.checkDataIntegrity(TEST_CONFIGS.complete);
      expect(completeCheck.isComplete).toBe(true);
      expect(completeCheck.missingFields).toHaveLength(0);

      const partialCheck = birthDataIntegrityManager.checkDataIntegrity(TEST_CONFIGS.partial);
      expect(partialCheck.isComplete).toBe(false);
      expect(partialCheck.missingFields.length).toBeGreaterThan(0);
    });

    test('应该自动修复不完整的数据', () => {
      const fixedConfig = birthDataIntegrityManager.autoFixMissingData(TEST_CONFIGS.partial);
      
      expect(fixedConfig.birthLocation).toBeDefined();
      expect(fixedConfig.birthLocation.lng).toBeDefined();
      expect(fixedConfig.birthLocation.lat).toBeDefined();
      expect(fixedConfig.birthTime).toBeDefined();
    });
  });

  // 测试5: 并发操作测试
  describe('并发操作测试', () => {
    test('应该正确处理并发配置修改', async () => {
      // 添加初始配置
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.complete);
      
      // 并发修改测试
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push((async () => {
          const configs = enhancedUserConfigManager.getAllConfigs();
          const configIndex = configs.length - 1;
          
          const updatedConfig = {
            ...configs[configIndex],
            nickname: `并发测试${i}`
          };
          
          return await enhancedUserConfigManager.updateConfigWithNodeUpdate(configIndex, updatedConfig);
        })());
      }
      
      const results = await Promise.all(promises);
      
      // 验证所有操作都成功
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // 验证最终状态一致性
      const finalConfigs = enhancedUserConfigManager.getAllConfigs();
      const finalConfig = finalConfigs[finalConfigs.length - 1];
      
      // 昵称应该是最后一次修改的结果
      expect(finalConfig.nickname).toMatch(/^并发测试\d$/);
    });
  });

  // 测试6: 数据版本兼容性测试
  describe('数据版本兼容性测试', () => {
    test('应该处理旧版本配置数据格式', async () => {
      // 模拟旧版本数据格式
      const legacyConfig = {
        nickname: '旧版本测试',
        birth_date: '1990-01-01', // 旧版本字段名
        birth_time: '12:30',
        location: { // 旧版本字段名
          longitude: 116.40,
          latitude: 39.90
        }
      };

      // 测试数据迁移兼容性
      const result = await enhancedUserConfigManager.addBasicConfig(legacyConfig);
      
      if (result) {
        const configs = enhancedUserConfigManager.getAllConfigs();
        const savedConfig = configs[configs.length - 1];
        
        // 验证数据被正确转换
        expect(savedConfig.birthDate).toBeDefined();
        expect(savedConfig.birthTime).toBeDefined();
        expect(savedConfig.birthLocation).toBeDefined();
      }
    });
  });
});