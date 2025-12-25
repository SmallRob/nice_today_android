/**
 * 用户配置数据测试套件
 * 测试用户配置数据的存储、读取、修改和一致性检查
 */

import { enhancedUserConfigManager } from '../../src/utils/EnhancedUserConfigManager';
import { calculateDetailedBazi } from '../../src/utils/baziHelper';
import { getShichen } from '../../src/utils/astronomy';

// 测试数据配置
const TEST_CONFIGS = {
  basic: {
    nickname: '测试用户',
    realName: '张三',
    birthDate: '1990-01-01',
    birthTime: '12:30',
    birthLocation: {
      province: '北京',
      city: '北京市',
      district: '朝阳区',
      lng: 116.40,
      lat: 39.90
    },
    gender: 'male'
  },
  edgeCases: {
    // 边界条件测试数据
    minAge: {
      nickname: '最小年龄',
      birthDate: '2023-12-25',
      birthTime: '00:00',
      birthLocation: { lng: 116.40, lat: 39.90 }
    },
    maxAge: {
      nickname: '最大年龄',
      birthDate: '1900-01-01',
      birthTime: '23:59',
      birthLocation: { lng: 116.40, lat: 39.90 }
    },
    leapYear: {
      nickname: '闰年测试',
      birthDate: '2000-02-29',
      birthTime: '12:00',
      birthLocation: { lng: 116.40, lat: 39.90 }
    }
  },
  invalid: {
    // 无效数据测试
    invalidDate: {
      nickname: '无效日期',
      birthDate: 'invalid-date',
      birthTime: '12:30',
      birthLocation: { lng: 116.40, lat: 39.90 }
    },
    invalidTime: {
      nickname: '无效时间',
      birthDate: '1990-01-01',
      birthTime: '25:70',
      birthLocation: { lng: 116.40, lat: 39.90 }
    },
    missingLocation: {
      nickname: '缺少位置',
      birthDate: '1990-01-01',
      birthTime: '12:30'
    }
  }
};

// 八字测试数据
const BAZI_TEST_CASES = [
  {
    name: '标准八字案例1',
    birthDate: '1990-01-01',
    birthTime: '12:30',
    longitude: 116.40,
    expected: {
      yearGanZhi: '己巳',
      monthGanZhi: '丙子',
      dayGanZhi: '丙寅',
      hourGanZhi: '甲午'
    }
  },
  {
    name: '标准八字案例2',
    birthDate: '1985-05-15',
    birthTime: '08:45',
    longitude: 121.47,
    expected: {
      yearGanZhi: '乙丑',
      monthGanZhi: '辛巳',
      dayGanZhi: '甲寅',
      hourGanZhi: '戊辰'
    }
  }
];

// 测试套件描述
describe('用户配置数据测试套件', () => {
  beforeEach(async () => {
    // 每次测试前重置配置管理器
    await enhancedUserConfigManager.initialize();
  });

  afterEach(() => {
    // 清理测试数据
    jest.clearAllMocks();
  });

  // 测试1: 配置数据的基本存储和读取
  describe('配置数据存储和读取', () => {
    test('应该正确添加和读取基本配置', async () => {
      const result = await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.basic);
      expect(result).toBeTruthy();

      const configs = enhancedUserConfigManager.getAllConfigs();
      expect(configs.length).toBeGreaterThan(0);

      const config = configs[configs.length - 1];
      expect(config.nickname).toBe(TEST_CONFIGS.basic.nickname);
      expect(config.birthDate).toBe(TEST_CONFIGS.basic.birthDate);
      expect(config.birthTime).toBe(TEST_CONFIGS.basic.birthTime);
    });

    test('应该正确设置和获取活跃配置', async () => {
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.basic);
      
      const activeIndex = enhancedUserConfigManager.getActiveConfigIndex();
      expect(activeIndex).toBeGreaterThanOrEqual(0);

      const activeConfig = enhancedUserConfigManager.getCurrentConfig();
      expect(activeConfig).toBeDefined();
      expect(activeConfig.nickname).toBeDefined();
    });
  });

  // 测试2: 配置数据的修改和一致性检查
  describe('配置数据修改和一致性', () => {
    test('应该正确更新配置数据', async () => {
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.basic);
      const configs = enhancedUserConfigManager.getAllConfigs();
      const originalConfig = { ...configs[configs.length - 1] };

      // 修改配置
      const updatedConfig = {
        ...originalConfig,
        nickname: '修改后的昵称',
        realName: '李四'
      };

      const updateResult = await enhancedUserConfigManager.updateConfigWithNodeUpdate(
        configs.length - 1,
        updatedConfig
      );

      expect(updateResult.success).toBe(true);

      // 验证修改后的数据
      const freshConfigs = enhancedUserConfigManager.getAllConfigs();
      const modifiedConfig = freshConfigs[configs.length - 1];
      expect(modifiedConfig.nickname).toBe('修改后的昵称');
      expect(modifiedConfig.realName).toBe('李四');
    });

    test('修改配置后应保持数据完整性', async () => {
      await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.basic);
      const configs = enhancedUserConfigManager.getAllConfigs();
      const configIndex = configs.length - 1;

      // 修改配置，确保必填字段存在
      const updatedConfig = {
        ...configs[configIndex],
        birthDate: '1995-05-15',
        birthTime: '14:30'
      };

      await enhancedUserConfigManager.updateConfigWithNodeUpdate(configIndex, updatedConfig);

      const freshConfig = enhancedUserConfigManager.getAllConfigs()[configIndex];
      
      // 验证必填字段
      expect(freshConfig.nickname).toBeDefined();
      expect(freshConfig.birthDate).toBe('1995-05-15');
      expect(freshConfig.birthTime).toBe('14:30');
      expect(freshConfig.birthLocation).toBeDefined();
      expect(freshConfig.birthLocation.lng).toBeDefined();
      expect(freshConfig.birthLocation.lat).toBeDefined();
    });
  });

  // 测试3: 八字运算算法准确性验证
  describe('八字运算算法验证', () => {
    BAZI_TEST_CASES.forEach(testCase => {
      test(`应该正确计算八字: ${testCase.name}`, () => {
        const baziInfo = calculateDetailedBazi(
          testCase.birthDate,
          testCase.birthTime,
          testCase.longitude
        );

        expect(baziInfo).toBeDefined();
        expect(baziInfo.bazi).toBeDefined();
        
        // 验证八字结构
        expect(baziInfo.bazi.year).toBe(testCase.expected.yearGanZhi);
        expect(baziInfo.bazi.month).toBe(testCase.expected.monthGanZhi);
        expect(baziInfo.bazi.day).toBe(testCase.expected.dayGanZhi);
        expect(baziInfo.bazi.hour).toBe(testCase.expected.hourGanZhi);

        // 验证五行信息
        expect(baziInfo.wuxing).toBeDefined();
        expect(baziInfo.wuxing.year).toBeDefined();
        expect(baziInfo.wuxing.month).toBeDefined();
        expect(baziInfo.wuxing.day).toBeDefined();
        expect(baziInfo.wuxing.hour).toBeDefined();

        // 验证农历信息
        expect(baziInfo.lunar).toBeDefined();
        expect(baziInfo.lunar.text).toBeDefined();
      });
    });

    test('应该正确处理时辰计算', () => {
      const testTimes = [
        { time: '23:00', expectedShichen: '子' },
        { time: '01:30', expectedShichen: '丑' },
        { time: '03:45', expectedShichen: '寅' },
        { time: '05:15', expectedShichen: '卯' },
        { time: '07:30', expectedShichen: '辰' },
        { time: '09:45', expectedShichen: '巳' },
        { time: '11:15', expectedShichen: '午' },
        { time: '13:30', expectedShichen: '未' },
        { time: '15:45', expectedShichen: '申' },
        { time: '17:15', expectedShichen: '酉' },
        { time: '19:30', expectedShichen: '戌' },
        { time: '21:45', expectedShichen: '亥' }
      ];

      testTimes.forEach(({ time, expectedShichen }) => {
        const shichen = getShichen(time);
        expect(shichen.name).toBe(expectedShichen);
      });
    });
  });

  // 测试4: 边界条件和异常输入处理
  describe('边界条件和异常输入处理', () => {
    test('应该正确处理边界年龄数据', async () => {
      const result = await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.edgeCases.minAge);
      expect(result).toBeTruthy();

      const configs = enhancedUserConfigManager.getAllConfigs();
      const config = configs[configs.length - 1];
      expect(config.birthDate).toBe(TEST_CONFIGS.edgeCases.minAge.birthDate);
    });

    test('应该正确处理无效日期输入', async () => {
      // 无效日期应该被拒绝或使用默认值
      const result = await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.invalid.invalidDate);
      
      // 根据实际实现，可能返回false或抛出异常
      if (result) {
        const configs = enhancedUserConfigManager.getAllConfigs();
        const config = configs[configs.length - 1];
        // 检查是否使用了默认值或有效处理
        expect(config.birthDate).not.toBe('invalid-date');
      }
    });

    test('应该正确处理缺少位置信息的情况', async () => {
      const result = await enhancedUserConfigManager.addBasicConfig(TEST_CONFIGS.invalid.missingLocation);
      
      if (result) {
        const configs = enhancedUserConfigManager.getAllConfigs();
        const config = configs[configs.length - 1];
        // 应该自动填充默认位置信息
        expect(config.birthLocation).toBeDefined();
        expect(config.birthLocation.lng).toBeDefined();
        expect(config.birthLocation.lat).toBeDefined();
      }
    });
  });

  // 测试5: 性能测试
  describe('性能测试', () => {
    test('批量操作应该保持良好性能', async () => {
      const startTime = performance.now();
      
      // 批量添加配置
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const config = {
          ...TEST_CONFIGS.basic,
          nickname: `测试用户${i}`
        };
        promises.push(enhancedUserConfigManager.addBasicConfig(config));
      }
      
      await Promise.all(promises);
      const endTime = performance.now();
      
      // 批量操作应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成
    });

    test('八字计算应该高效', () => {
      const startTime = performance.now();
      
      // 连续计算多个八字
      for (let i = 0; i < 100; i++) {
        calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      }
      
      const endTime = performance.now();
      
      // 100次八字计算应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });
  });
});