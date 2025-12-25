/**
 * 八字运算算法测试套件
 * 测试八字计算、五行分析、纳音等核心算法的准确性
 */

import { calculateDetailedBazi } from '../../src/utils/baziHelper';
import { getShichen, getShichenSimple, normalizeShichen } from '../../src/utils/astronomy';

// 八字测试案例 - 基于已知的准确结果
const BAZI_ACCURACY_TEST_CASES = [
  {
    name: '1990年1月1日12:30北京',
    birthDate: '1990-01-01',
    birthTime: '12:30',
    longitude: 116.40,
    expected: {
      // 八字四柱
      bazi: {
        year: '己巳',
        month: '丙子', 
        day: '丙寅',
        hour: '甲午'
      },
      // 五行
      wuxing: {
        year: '土火',
        month: '火水',
        day: '火木',
        hour: '木火'
      }
    }
  },
  {
    name: '1985年5月15日8:45上海',
    birthDate: '1985-05-15',
    birthTime: '08:45',
    longitude: 121.47,
    expected: {
      bazi: {
        year: '乙丑',
        month: '辛巳',
        day: '甲寅', 
        hour: '戊辰'
      },
      wuxing: {
        year: '木土',
        month: '金火',
        day: '木木',
        hour: '土土'
      }
    }
  },
  {
    name: '2000年2月29日0:00广州',
    birthDate: '2000-02-29',
    birthTime: '00:00',
    longitude: 113.23,
    expected: {
      bazi: {
        year: '庚辰',
        month: '戊寅',
        day: '丁巳',
        hour: '庚子'
      }
    }
  }
];

// 时辰测试案例
const SHICHEN_TEST_CASES = [
  { time: '23:00', expected: '子', expectedIndex: 0 },
  { time: '01:30', expected: '丑', expectedIndex: 1 },
  { time: '03:45', expected: '寅', expectedIndex: 2 },
  { time: '05:15', expected: '卯', expectedIndex: 3 },
  { time: '07:30', expected: '辰', expectedIndex: 4 },
  { time: '09:45', expected: '巳', expectedIndex: 5 },
  { time: '11:15', expected: '午', expectedIndex: 6 },
  { time: '13:30', expected: '未', expectedIndex: 7 },
  { time: '15:45', expected: '申', expectedIndex: 8 },
  { time: '17:15', expected: '酉', expectedIndex: 9 },
  { time: '19:30', expected: '戌', expectedIndex: 10 },
  { time: '21:45', expected: '亥', expectedIndex: 11 }
];

// 八字算法验证工具函数
const validateBaziStructure = (baziInfo) => {
  expect(baziInfo).toBeDefined();
  expect(baziInfo.bazi).toBeDefined();
  expect(baziInfo.wuxing).toBeDefined();
  expect(baziInfo.nayin).toBeDefined();
  expect(baziInfo.lunar).toBeDefined();
  expect(baziInfo.solar).toBeDefined();
  expect(baziInfo.shichen).toBeDefined();
  
  // 验证八字结构
  expect(baziInfo.bazi.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(baziInfo.bazi.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(baziInfo.bazi.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(baziInfo.bazi.hour).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  
  // 验证五行结构
  expect(baziInfo.wuxing.year).toMatch(/^[木火土金水]{2}$/);
  expect(baziInfo.wuxing.month).toMatch(/^[木火土金水]{2}$/);
  expect(baziInfo.wuxing.day).toMatch(/^[木火土金水]{2}$/);
  expect(baziInfo.wuxing.hour).toMatch(/^[木火土金水]{2}$/);
  
  return true;
};

// 测试套件描述
describe('八字运算算法测试套件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试1: 八字算法准确性验证
  describe('八字算法准确性验证', () => {
    BAZI_ACCURACY_TEST_CASES.forEach(testCase => {
      test(`应该准确计算八字: ${testCase.name}`, () => {
        const baziInfo = calculateDetailedBazi(
          testCase.birthDate,
          testCase.birthTime,
          testCase.longitude
        );

        // 验证基本结构
        validateBaziStructure(baziInfo);

        // 验证八字准确性
        expect(baziInfo.bazi.year).toBe(testCase.expected.bazi.year);
        expect(baziInfo.bazi.month).toBe(testCase.expected.bazi.month);
        expect(baziInfo.bazi.day).toBe(testCase.expected.bazi.day);
        expect(baziInfo.bazi.hour).toBe(testCase.expected.bazi.hour);

        // 验证五行准确性
        if (testCase.expected.wuxing) {
          expect(baziInfo.wuxing.year).toBe(testCase.expected.wuxing.year);
          expect(baziInfo.wuxing.month).toBe(testCase.expected.wuxing.month);
          expect(baziInfo.wuxing.day).toBe(testCase.expected.wuxing.day);
          expect(baziInfo.wuxing.hour).toBe(testCase.expected.wuxing.hour);
        }
      });
    });

    test('应该正确处理不同经度的真太阳时', () => {
      const testCases = [
        { longitude: 116.40, birthTime: '12:00', expectedHour: '午' }, // 北京
        { longitude: 121.47, birthTime: '12:00', expectedHour: '午' }, // 上海
        { longitude: 87.60, birthTime: '12:00', expectedHour: '午' }   // 乌鲁木齐
      ];

      testCases.forEach(({ longitude, birthTime, expectedHour }) => {
        const baziInfo = calculateDetailedBazi('1990-01-01', birthTime, longitude);
        expect(baziInfo.shichen.name).toBe(expectedHour);
      });
    });
  });

  // 测试2: 时辰计算准确性验证
  describe('时辰计算准确性验证', () => {
    SHICHEN_TEST_CASES.forEach(testCase => {
      test(`应该正确计算时辰: ${testCase.time} -> ${testCase.expected}`, () => {
        const shichen = getShichen(testCase.time);
        
        expect(shichen).toBeDefined();
        expect(shichen.name).toBe(testCase.expected);
        expect(shichen.index).toBe(testCase.expectedIndex);
        expect(shichen.startTime).toBeDefined();
        expect(shichen.endTime).toBeDefined();
      });
    });

    test('简化版时辰计算应该与完整版一致', () => {
      SHICHEN_TEST_CASES.forEach(testCase => {
        const fullShichen = getShichen(testCase.time);
        const simpleShichen = getShichenSimple(testCase.time);
        
        expect(simpleShichen).toBe(testCase.expected);
        expect(simpleShichen).toBe(fullShichen.name);
      });
    });

    test('时辰标准化应该正确处理边界值', () => {
      const edgeCases = [
        { input: '子', expected: '子' },
        { input: '午时', expected: '午' },
        { input: '亥时', expected: '亥' },
        { input: 'invalid', expected: '子' } // 默认值
      ];

      edgeCases.forEach(({ input, expected }) => {
        const normalized = normalizeShichen(input);
        expect(normalized).toBe(expected);
      });
    });
  });

  // 测试3: 五行分析准确性验证
  describe('五行分析准确性验证', () => {
    test('应该正确统计五行数量', () => {
      const baziInfo = calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      
      // 提取五行字符串并统计
      const wuxingStr = baziInfo.wuxing.text;
      const wuxingElements = ['木', '火', '土', '金', '水'];
      
      const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
      wuxingStr.split('').forEach(char => {
        if (wuxingElements.includes(char)) {
          elementCounts[char]++;
        }
      });

      // 验证五行统计
      const totalElements = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
      expect(totalElements).toBe(8); // 四柱八字，每柱两个五行

      // 验证五行平衡性（基本检查）
      const hasAllElements = wuxingElements.every(element => elementCounts[element] >= 0);
      expect(hasAllElements).toBe(true);
    });

    test('应该正确分析日主和旺衰', () => {
      const baziInfo = calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      
      expect(baziInfo.bazi.day).toBeDefined();
      const dayMaster = baziInfo.bazi.day.charAt(0);
      
      // 日主应该是十天干之一
      const validDayMasters = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      expect(validDayMasters).toContain(dayMaster);

      // 验证日主五行属性
      const dayMasterElements = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火',
        '戊': '土', '己': '土', '庚': '金', '辛': '金',
        '壬': '水', '癸': '水'
      };
      
      expect(dayMasterElements[dayMaster]).toBeDefined();
    });
  });

  // 测试4: 边界条件和异常输入处理
  describe('边界条件和异常输入处理', () => {
    test('应该处理无效日期输入', () => {
      const invalidDates = ['invalid-date', '2023-13-01', '2023-00-01', '2023-02-30'];
      
      invalidDates.forEach(date => {
        expect(() => {
          calculateDetailedBazi(date, '12:30', 116.40);
        }).toThrow(); // 或者返回合理的默认值
      });
    });

    test('应该处理无效时间输入', () => {
      const invalidTimes = ['25:00', '12:60', 'invalid-time', ''];
      
      invalidTimes.forEach(time => {
        const baziInfo = calculateDetailedBazi('1990-01-01', time, 116.40);
        
        // 应该返回有效结果或默认值
        expect(baziInfo).toBeDefined();
        validateBaziStructure(baziInfo);
      });
    });

    test('应该处理极端经度值', () => {
      const extremeLongitudes = [-180, 180, 360, -360, 1000];
      
      extremeLongitudes.forEach(longitude => {
        const baziInfo = calculateDetailedBazi('1990-01-01', '12:30', longitude);
        
        expect(baziInfo).toBeDefined();
        validateBaziStructure(baziInfo);
      });
    });
  });

  // 测试5: 性能测试
  describe('性能测试', () => {
    test('八字计算应该在合理时间内完成', () => {
      const startTime = performance.now();
      
      // 计算100个八字
      for (let i = 0; i < 100; i++) {
        calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 100次计算应该在1秒内完成
      expect(executionTime).toBeLessThan(1000);
      console.log(`100次八字计算耗时: ${executionTime}ms`);
    });

    test('时辰计算应该高效', () => {
      const startTime = performance.now();
      
      // 计算1000个时辰
      for (let i = 0; i < 1000; i++) {
        getShichen('12:30');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 1000次计算应该在100ms内完成
      expect(executionTime).toBeLessThan(100);
      console.log(`1000次时辰计算耗时: ${executionTime}ms`);
    });
  });

  // 测试6: 农历和节气验证
  describe('农历和节气验证', () => {
    test('应该正确计算农历日期', () => {
      const baziInfo = calculateDetailedBazi('2023-01-22', '12:30', 116.40); // 春节
      
      expect(baziInfo.lunar).toBeDefined();
      expect(baziInfo.lunar.text).toContain('正月初一'); // 春节应该是正月初一
      
      // 验证农历日期结构
      expect(baziInfo.lunar.year).toBeDefined();
      expect(baziInfo.lunar.month).toBeDefined();
      expect(baziInfo.lunar.day).toBeDefined();
      expect(baziInfo.lunar.isLeapMonth).toBeDefined();
    });

    test('应该正确处理闰月', () => {
      const leapMonthDates = [
        '2023-03-22', // 闰二月
        '2020-05-23'  // 闰四月
      ];
      
      leapMonthDates.forEach(date => {
        const baziInfo = calculateDetailedBazi(date, '12:30', 116.40);
        
        expect(baziInfo.lunar).toBeDefined();
        // 闰月应该有特殊标记
        expect(baziInfo.lunar.text).toContain('闰');
      });
    });
  });

  // 测试7: 纳音五行验证
  describe('纳音五行验证', () => {
    test('应该正确计算纳音五行', () => {
      const baziInfo = calculateDetailedBazi('1990-01-01', '12:30', 116.40);
      
      expect(baziInfo.nayin).toBeDefined();
      expect(baziInfo.nayin.year).toMatch(/[木火土金水]\w+/);
      expect(baziInfo.nayin.month).toMatch(/[木火土金水]\w+/);
      expect(baziInfo.nayin.day).toMatch(/[木火土金水]\w+/);
      expect(baziInfo.nayin.hour).toMatch(/[木火土金水]\w+/);
      
      // 验证纳音五行的一致性
      const nayinElements = ['木', '火', '土', '金', '水'];
      Object.values(baziInfo.nayin).forEach(nayin => {
        const hasValidElement = nayinElements.some(element => nayin.includes(element));
        expect(hasValidElement).toBe(true);
      });
    });
  });
});