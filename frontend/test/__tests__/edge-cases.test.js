/**
 * 边界条件和异常输入测试套件
 * 测试极端情况、异常输入、错误恢复等场景
 */

import { enhancedUserConfigManager } from '../../src/utils/EnhancedUserConfigManager';
import { calculateDetailedBazi } from '../../src/utils/baziHelper';
import { getShichen } from '../../src/utils/astronomy';
import birthDataIntegrityManager from '../../src/utils/BirthDataIntegrityManager';

// 极端边界测试数据
const EXTREME_TEST_CASES = {
  dates: {
    minPossible: '1900-01-01',
    maxPossible: '2100-12-31',
    leapYear: '2000-02-29',
    invalid: {
      before1900: '1899-12-31',
      after2100: '2101-01-01',
      invalidFormat: 'invalid-date',
      invalidMonth: '2023-13-01',
      invalidDay: '2023-02-30'
    }
  },
  times: {
    min: '00:00',
    max: '23:59',
    boundary: '23:59:59',
    invalid: {
      over24: '25:00',
      over60: '12:60',
      invalidFormat: 'invalid-time'
    }
  },
  locations: {
    extremes: {
      northPole: { lng: 0, lat: 90 },
      southPole: { lng: 0, lat: -90 },
      primeMeridian: { lng: 0, lat: 0 },
      internationalDateLine: { lng: 180, lat: 0 }
    },
    invalid: {
      outOfRange: { lng: 200, lat: 100 },
      negative: { lng: -200, lat: -100 },
      invalidType: { lng: 'invalid', lat: 'invalid' },
      missing: { lng: null, lat: null }
    }
  },
  names: {
    extremeLength: {
      veryShort: 'A',
      veryLong: '这是一个非常非常非常非常非常长的名字测试',
      specialChars: '张·李',
      numbers: '张三123',
      emoji: '张😊三'
    }
  }
};

// 错误恢复测试数据
const ERROR_RECOVERY_CASES = [
  {
    name: '部分缺失数据',
    config: {
      nickname: '部分缺失测试',
      birthDate: '1990-01-01'
      // 故意缺少 birthTime 和 birthLocation
    },
    shouldRecover: true
  },
  {
    name: '格式错误数据',
    config: {
      nickname: '格式错误测试',
      birthDate: 'invalid-date',
      birthTime: 'invalid-time',
      birthLocation: { lng: 'invalid', lat: 'invalid' }
    },
    shouldRecover: true
  },
  {
    name: '空数据',
    config: {
      nickname: '',
      birthDate: '',
      birthTime: '',
      birthLocation: {}
    },
    shouldRecover: true
  },
  {
    name: 'null数据',
    config: {
      nickname: null,
      birthDate: null,
      birthTime: null,
      birthLocation: null
    },
    shouldRecover: true
  }
];

// 并发操作测试配置
const CONCURRENCY_TEST_CONFIG = {
  basic: {
    nickname: '并发测试用户',
    birthDate: '1990-01-01',
    birthTime: '12:30',
    birthLocation: { lng: 116.40, lat: 39.90 }
  },
  count: 10, // 并发操作数量
  timeout: 5000 // 超时时间（毫秒）
};

// 测试套件描述
describe('边界条件和异常输入测试套件', () => {
  beforeEach(async () => {
    await enhancedUserConfigManager.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 测试1: 极端日期和时间处理
  describe('极端日期和时间处理', () => {
    test('应该处理极早和极晚的日期', async () => {
      // 测试极早日期
      const earlyResult = await enhancedUserConfigManager.addBasicConfig({
        nickname: '极早日期测试',
        birthDate: EXTREME_TEST_CASES.dates.minPossible,
        birthTime: '12:00',
        birthLocation: { lng: 116.40, lat: 39.90 }
      });
      
      expect(earlyResult).toBeTruthy();

      // 测试极晚日期
      const lateResult = await enhancedUserConfigManager.addBasicConfig({
        nickname: '极晚日期测试',
        birthDate: EXTREME_TEST_CASES.dates.maxPossible,
        birthTime: '12:00',
        birthLocation: { lng: 116.40, lat: 39.90 }
      });
      
      expect(lateResult).toBeTruthy();
    });

    test('应该正确处理闰年日期', async () => {
      const result = await enhancedUserConfigManager.addBasicConfig({
        nickname: '闰年测试',
        birthDate: EXTREME_TEST_CASES.dates.leapYear,
        birthTime: '12:00',
        birthLocation: { lng: 116.40, lat: 39.90 }
      });
      
      expect(result).toBeTruthy();
    });

    test('应该拒绝明显无效的日期', async () => {
      const invalidDates = Object.values(EXTREME_TEST_CASES.dates.invalid);
      
      for (const invalidDate of invalidDates) {
        const result = await enhancedUserConfigManager.addBasicConfig({
          nickname: `无效日期测试-${invalidDate}`,
          birthDate: invalidDate,
          birthTime: '12:00',
          birthLocation: { lng: 116.40, lat: 39.90 }
        });
        
        // 无效日期应该被拒绝或使用默认值
        if (result) {
          const configs = enhancedUserConfigManager.getAllConfigs();
          const config = configs[configs.length - 1];
          expect(config.birthDate).not.toBe(invalidDate);
        }
      }
    });

    test('应该处理边界时间值', () => {
      const boundaryTimes = [
        { time: '00:00', expectedShichen: '子' },
        { time: '23:59', expectedShichen: '子' },
        { time: '23:59:59', expectedShichen: '子' }
      ];

      boundaryTimes.forEach(({ time, expectedShichen }) => {
        const shichen = getShichen(time);
        expect(shichen.name).toBe(expectedShichen);
      });
    });
  });

  // 测试2: 极端地理位置处理
  describe('极端地理位置处理', () => {
    test('应该处理极地坐标', async () => {
      const extremeLocations = Object.values(EXTREME_TEST_CASES.locations.extremes);
      
      for (const location of extremeLocations) {
        const result = await enhancedUserConfigManager.addBasicConfig({
          nickname: `极地坐标测试-${location.lng},${location.lat}`,
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthLocation: location
        });
        
        expect(result).toBeTruthy();
      }
    });

    test('应该处理超出范围的坐标', async () => {
      const invalidLocations = Object.values(EXTREME_TEST_CASES.locations.invalid);
      
      for (const location of invalidLocations) {
        const result = await enhancedUserConfigManager.addBasicConfig({
          nickname: '无效坐标测试',
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthLocation: location
        });
        
        // 应该使用默认值或有效处理
        if (result) {
          const configs = enhancedUserConfigManager.getAllConfigs();
          const config = configs[configs.length - 1];
          expect(typeof config.birthLocation.lng).toBe('number');
          expect(typeof config.birthLocation.lat).toBe('number');
          expect(isNaN(config.birthLocation.lng)).toBe(false);
          expect(isNaN(config.birthLocation.lat)).toBe(false);
        }
      }
    });
  });

  // 测试3: 特殊姓名处理
  describe('特殊姓名处理', () => {
    test('应该处理极端长度的姓名', async () => {
      const extremeNames = Object.values(EXTREME_TEST_CASES.names.extremeLength);
      
      for (const name of extremeNames) {
        const result = await enhancedUserConfigManager.addBasicConfig({
          nickname: `极端姓名测试-${name.substring(0, 10)}`,
          realName: name,
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthLocation: { lng: 116.40, lat: 39.90 }
        });
        
        expect(result).toBeTruthy();
        
        // 验证姓名被正确保存
        if (result) {
          const configs = enhancedUserConfigManager.getAllConfigs();
          const config = configs[configs.length - 1];
          expect(config.realName).toBe(name);
        }
      }
    });

    test('应该处理特殊字符和表情符号', async () => {
      const specialCases = [
        { name: '张·李', description: '包含特殊分隔符' },
        { name: '张三123', description: '包含数字' },
        { name: '张😊三', description: '包含表情符号' },
        { name: '张  三', description: '包含多个空格' },
        { name: '张\n三', description: '包含换行符' }
      ];

      for (const { name, description } of specialCases) {
        const result = await enhancedUserConfigManager.addBasicConfig({
          nickname: `特殊字符测试-${description}`,
          realName: name,
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthLocation: { lng: 116.40, lat: 39.90 }
        });
        
        expect(result).toBeTruthy();
      }
    });
  });

  // 测试4: 错误恢复和容错机制
  describe('错误恢复和容错机制', () => {
    ERROR_RECOVERY_CASES.forEach(testCase => {
      test(`应该正确处理${testCase.name}`, async () => {
        const result = await enhancedUserConfigManager.addBasicConfig(testCase.config);
        
        if (testCase.shouldRecover) {
          expect(result).toBeTruthy();
          
          // 验证数据被正确恢复
          const configs = enhancedUserConfigManager.getAllConfigs();
          const config = configs[configs.length - 1];
          
          // 验证必填字段存在
          expect(config.nickname).toBeDefined();
          expect(config.birthDate).toBeDefined();
          expect(config.birthTime).toBeDefined();
          expect(config.birthLocation).toBeDefined();
          
          // 验证数据类型正确
          expect(typeof config.birthLocation.lng).toBe('number');
          expect(typeof config.birthLocation.lat).toBe('number');
        }
      });
    });

    test('应该正确处理数据完整性检查', () => {
      ERROR_RECOVERY_CASES.forEach(testCase => {
        const integrityCheck = birthDataIntegrityManager.checkDataIntegrity(testCase.config);
        
        // 验证完整性检查返回合理结果
        expect(integrityCheck).toBeDefined();
        expect(integrityCheck.isComplete).toBeDefined();
        expect(integrityCheck.missingFields).toBeDefined();
        expect(Array.isArray(integrityCheck.missingFields)).toBe(true);
      });
    });

    test('应该正确自动修复数据', () => {
      ERROR_RECOVERY_CASES.forEach(testCase => {
        const fixedConfig = birthDataIntegrityManager.autoFixMissingData(testCase.config);
        
        // 验证修复后的配置
        expect(fixedConfig).toBeDefined();
        expect(fixedConfig.birthLocation).toBeDefined();
        expect(fixedConfig.birthLocation.lng).toBeDefined();
        expect(fixedConfig.birthLocation.lat).toBeDefined();
        expect(fixedConfig.birthTime).toBeDefined();
      });
    });
  });

  // 测试5: 并发操作测试
  describe('并发操作测试', () => {
    test('应该正确处理并发配置添加', async () => {
      const promises = [];
      
      // 创建多个并发添加请求
      for (let i = 0; i < CONCURRENCY_TEST_CONFIG.count; i++) {
        const config = {
          ...CONCURRENCY_TEST_CONFIG.basic,
          nickname: `${CONCURRENCY_TEST_CONFIG.basic.nickname}-${i}`
        };
        
        promises.push(
          enhancedUserConfigManager.addBasicConfig(config)
        );
      }
      
      // 等待所有操作完成
      const results = await Promise.allSettled(promises);
      
      // 验证所有操作都完成（成功或失败）
      expect(results).toHaveLength(CONCURRENCY_TEST_CONFIG.count);
      
      // 统计成功和失败的数量
      const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
      const failed = results.filter(result => result.status === 'rejected' || !result.value).length;
      
      console.log(`并发添加结果: ${successful} 成功, ${failed} 失败`);
      
      // 验证最终配置数量
      const finalConfigs = enhancedUserConfigManager.getAllConfigs();
      console.log(`最终配置数量: ${finalConfigs.length}`);
      
      // 至少应该有一些配置成功添加
      expect(successful).toBeGreaterThan(0);
    }, CONCURRENCY_TEST_CONFIG.timeout);

    test('应该正确处理并发配置修改', async () => {
      // 先添加一个基础配置
      await enhancedUserConfigManager.addBasicConfig(CONCURRENCY_TEST_CONFIG.basic);
      const configs = enhancedUserConfigManager.getAllConfigs();
      const configIndex = configs.length - 1;
      
      const promises = [];
      
      // 创建多个并发修改请求
      for (let i = 0; i < CONCURRENCY_TEST_CONFIG.count; i++) {
        const updatedConfig = {
          ...configs[configIndex],
          nickname: `${CONCURRENCY_TEST_CONFIG.basic.nickname}-修改-${i}`
        };
        
        promises.push(
          enhancedUserConfigManager.updateConfigWithNodeUpdate(configIndex, updatedConfig)
        );
      }
      
      // 等待所有操作完成
      const results = await Promise.allSettled(promises);
      
      // 验证所有操作都完成
      expect(results).toHaveLength(CONCURRENCY_TEST_CONFIG.count);
      
      // 验证最终配置状态
      const finalConfigs = enhancedUserConfigManager.getAllConfigs();
      const finalConfig = finalConfigs[configIndex];
      
      // 昵称应该是最后一次修改的结果
      expect(finalConfig.nickname).toMatch(/修改-\d+$/);
    }, CONCURRENCY_TEST_CONFIG.timeout);
  });

  // 测试6: 性能压力测试
  describe('性能压力测试', () => {
    test('应该处理大量八字计算', () => {
      const startTime = performance.now();
      
      // 计算1000个八字
      for (let i = 0; i < 1000; i++) {
        calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 1000次计算应该在5秒内完成
      expect(executionTime).toBeLessThan(5000);
      console.log(`1000次八字计算耗时: ${executionTime}ms`);
    });

    test('应该处理大量时辰计算', () => {
      const startTime = performance.now();
      
      // 计算5000个时辰
      for (let i = 0; i < 5000; i++) {
        getShichen('12:30');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 5000次计算应该在1秒内完成
      expect(executionTime).toBeLessThan(1000);
      console.log(`5000次时辰计算耗时: ${executionTime}ms`);
    });
  });

  // 测试7: 内存和资源管理
  describe('内存和资源管理', () => {
    test('应该正确处理大量配置存储', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 添加大量配置
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const config = {
          nickname: `内存测试-${i}`,
          birthDate: '1990-01-01',
          birthTime: '12:30',
          birthLocation: { lng: 116.40, lat: 39.90 }
        };
        promises.push(enhancedUserConfigManager.addBasicConfig(config));
      }
      
      await Promise.all(promises);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
      
      // 内存增加应该在合理范围内（小于100MB）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    test('应该正确清理临时数据', async () => {
      // 添加一些配置
      for (let i = 0; i < 10; i++) {
        await enhancedUserConfigManager.addBasicConfig({
          nickname: `清理测试-${i}`,
          birthDate: '1990-01-01',
          birthTime: '12:30',
          birthLocation: { lng: 116.40, lat: 39.90 }
        });
      }
      
      const initialCount = enhancedUserConfigManager.getAllConfigs().length;
      
      // 删除部分配置
      for (let i = 0; i < 5; i++) {
        await enhancedUserConfigManager.removeConfig(i);
      }
      
      const finalCount = enhancedUserConfigManager.getAllConfigs().length;
      
      // 验证配置数量正确减少
      expect(finalCount).toBe(initialCount - 5);
    });
  });
});