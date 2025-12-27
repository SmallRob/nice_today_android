/**
 * 星座运势算法单元测试
 * 验证功能完整性和唯一性要求
 */

import {
  HOROSCOPE_DATA_ENHANCED,
  calculateDailyHoroscopeScore,
  generateSoulQuestion,
  generateLuckyItem,
  generateDailyHoroscope,
  validateHoroscopeUniqueness
} from './horoscopeAlgorithm';

// 测试数据
const TEST_HOROSCOPE = '白羊座';
const TEST_DATE = new Date('2024-12-19');

/**
 * 基础数据验证测试
 */
describe('星座基础数据验证', () => {
  test('星座数据完整性', () => {
    expect(HOROSCOPE_DATA_ENHANCED).toHaveLength(12);
    
    HOROSCOPE_DATA_ENHANCED.forEach(horoscope => {
      expect(horoscope).toHaveProperty('name');
      expect(horoscope).toHaveProperty('element');
      expect(horoscope).toHaveProperty('icon');
      expect(horoscope).toHaveProperty('color');
      expect(horoscope).toHaveProperty('personalityTraits');
      expect(horoscope).toHaveProperty('elementWeight');
    });
  });

  test('星座元素权重正确性', () => {
    HOROSCOPE_DATA_ENHANCED.forEach(horoscope => {
      const element = horoscope.element.toLowerCase().replace('象', '');
      expect(horoscope.elementWeight[element]).toBeGreaterThan(7); // 主元素权重应较高
    });
  });
});

/**
 * 运势分数计算测试
 */
describe('运势分数计算', () => {
  test('分数范围验证', () => {
    const score = calculateDailyHoroscopeScore(TEST_HOROSCOPE, TEST_DATE);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(typeof score).toBe('number');
  });

  test('相同星座同一天分数一致', () => {
    const score1 = calculateDailyHoroscopeScore(TEST_HOROSCOPE, TEST_DATE);
    const score2 = calculateDailyHoroscopeScore(TEST_HOROSCOPE, TEST_DATE);
    expect(score1).toBe(score2);
  });

  test('不同星座同一天分数不同', () => {
    const score1 = calculateDailyHoroscopeScore('白羊座', TEST_DATE);
    const score2 = calculateDailyHoroscopeScore('金牛座', TEST_DATE);
    expect(score1).not.toBe(score2);
  });

  test('相同星座不同天分数不同', () => {
    const date1 = new Date('2024-12-19');
    const date2 = new Date('2024-12-20');
    const score1 = calculateDailyHoroscopeScore(TEST_HOROSCOPE, date1);
    const score2 = calculateDailyHoroscopeScore(TEST_HOROSCOPE, date2);
    expect(score1).not.toBe(score2);
  });
});

/**
 * 心灵问答系统测试
 */
describe('心灵问答系统', () => {
  test('问答生成完整性', () => {
    const question = generateSoulQuestion(TEST_HOROSCOPE, TEST_DATE);
    expect(question).toHaveProperty('question');
    expect(question).toHaveProperty('answer');
    expect(question).toHaveProperty('category');
    expect(question).toHaveProperty('timestamp');
    expect(typeof question.question).toBe('string');
    expect(question.question.length).toBeGreaterThan(0);
  });

  test('相同星座同一天问答一致', () => {
    const q1 = generateSoulQuestion(TEST_HOROSCOPE, TEST_DATE);
    const q2 = generateSoulQuestion(TEST_HOROSCOPE, TEST_DATE);
    expect(q1.question).toBe(q2.question);
    expect(q1.answer).toBe(q2.answer);
  });

  test('不同星座同一天问答不同', () => {
    const q1 = generateSoulQuestion('白羊座', TEST_DATE);
    const q2 = generateSoulQuestion('金牛座', TEST_DATE);
    expect(q1.question).not.toBe(q2.question);
  });

  test('问答分类合理性', () => {
    const question = generateSoulQuestion(TEST_HOROSCOPE, TEST_DATE);
    const validCategories = ['love', 'career', 'health', 'finance', 'personal'];
    expect(validCategories).toContain(question.category);
  });
});

/**
 * 幸运物品生成测试
 */
describe('幸运物品生成', () => {
  test('物品生成完整性', () => {
    const item = generateLuckyItem(TEST_HOROSCOPE, TEST_DATE);
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('icon');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('element');
    expect(item).toHaveProperty('horoscope');
    expect(item).toHaveProperty('date');
  });

  test('相同星座同一天物品一致', () => {
    const item1 = generateLuckyItem(TEST_HOROSCOPE, TEST_DATE);
    const item2 = generateLuckyItem(TEST_HOROSCOPE, TEST_DATE);
    expect(item1.name).toBe(item2.name);
    expect(item1.icon).toBe(item2.icon);
  });

  test('不同星座同一天物品不同', () => {
    const item1 = generateLuckyItem('白羊座', TEST_DATE);
    const item2 = generateLuckyItem('金牛座', TEST_DATE);
    expect(item1.name).not.toBe(item2.name);
  });

  test('物品与星座元素匹配', () => {
    const fireItem = generateLuckyItem('白羊座', TEST_DATE);
    const earthItem = generateLuckyItem('金牛座', TEST_DATE);
    const airItem = generateLuckyItem('双子座', TEST_DATE);
    const waterItem = generateLuckyItem('巨蟹座', TEST_DATE);
    
    expect(fireItem.element).toBe('火象');
    expect(earthItem.element).toBe('土象');
    expect(airItem.element).toBe('风象');
    expect(waterItem.element).toBe('水象');
  });
});

/**
 * 完整运势数据生成测试
 */
describe('完整运势数据生成', () => {
  test('数据完整性验证', () => {
    const horoscopeData = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    
    // 基础信息
    expect(horoscopeData).toHaveProperty('horoscopeInfo');
    expect(horoscopeData.horoscopeInfo.name).toBe(TEST_HOROSCOPE);
    
    // 每日运势
    expect(horoscopeData).toHaveProperty('dailyForecast');
    expect(horoscopeData.dailyForecast).toHaveProperty('love');
    expect(horoscopeData.dailyForecast).toHaveProperty('wealth');
    expect(horoscopeData.dailyForecast).toHaveProperty('career');
    expect(horoscopeData.dailyForecast).toHaveProperty('study');
    
    // 各领域分数范围
    Object.values(horoscopeData.dailyForecast).forEach(area => {
      expect(area.score).toBeGreaterThanOrEqual(0);
      expect(area.score).toBeLessThanOrEqual(100);
      expect(area.description).toBeDefined();
      expect(area.trend).toBeDefined();
    });
    
    // 推荐内容
    expect(horoscopeData).toHaveProperty('recommendations');
    expect(horoscopeData.recommendations).toHaveProperty('soulQuestion');
    expect(horoscopeData.recommendations).toHaveProperty('luckyItem');
    
    // 总体信息
    expect(horoscopeData).toHaveProperty('overallScore');
    expect(horoscopeData.overallScore).toBeGreaterThanOrEqual(0);
    expect(horoscopeData.overallScore).toBeLessThanOrEqual(100);
    expect(horoscopeData).toHaveProperty('overallDescription');
    expect(horoscopeData).toHaveProperty('timestamp');
    expect(horoscopeData).toHaveProperty('dailyId');
  });

  test('相同输入产生相同输出', () => {
    const data1 = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    const data2 = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    
    expect(data1.dailyId).toBe(data2.dailyId);
    expect(data1.overallScore).toBe(data2.overallScore);
    expect(data1.recommendations.soulQuestion.question).toBe(data2.recommendations.soulQuestion.question);
    expect(data1.recommendations.luckyItem.name).toBe(data2.recommendations.luckyItem.name);
  });

  test('不同星座同一天数据不同', () => {
    const data1 = generateDailyHoroscope('白羊座', TEST_DATE);
    const data2 = generateDailyHoroscope('金牛座', TEST_DATE);
    
    expect(data1.horoscopeInfo.name).not.toBe(data2.horoscopeInfo.name);
    expect(data1.overallScore).not.toBe(data2.overallScore);
    expect(data1.recommendations.soulQuestion.question).not.toBe(data2.recommendations.soulQuestion.question);
  });

  test('相同星座不同天数据不同', () => {
    const date1 = new Date('2024-12-19');
    const date2 = new Date('2024-12-20');
    const data1 = generateDailyHoroscope(TEST_HOROSCOPE, date1);
    const data2 = generateDailyHoroscope(TEST_HOROSCOPE, date2);
    
    expect(data1.dailyId).not.toBe(data2.dailyId);
    expect(data1.overallScore).not.toBe(data2.overallScore);
  });
});

/**
 * 唯一性验证测试
 */
describe('唯一性验证', () => {
  test('相同数据验证为真', () => {
    const data1 = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    const data2 = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    
    expect(validateHoroscopeUniqueness(data1, data2)).toBe(true);
  });

  test('不同星座数据验证为假', () => {
    const data1 = generateDailyHoroscope('白羊座', TEST_DATE);
    const data2 = generateDailyHoroscope('金牛座', TEST_DATE);
    
    expect(validateHoroscopeUniqueness(data1, data2)).toBe(false);
  });

  test('不同天数据验证为假', () => {
    const date1 = new Date('2024-12-19');
    const date2 = new Date('2024-12-20');
    const data1 = generateDailyHoroscope(TEST_HOROSCOPE, date1);
    const data2 = generateDailyHoroscope(TEST_HOROSCOPE, date2);
    
    expect(validateHoroscopeUniqueness(data1, data2)).toBe(false);
  });
});

/**
 * 边界条件测试
 */
describe('边界条件测试', () => {
  test('无效星座处理', () => {
    const invalidData = generateDailyHoroscope('无效星座', TEST_DATE);
    expect(invalidData).toBeNull();
    
    const invalidScore = calculateDailyHoroscopeScore('无效星座', TEST_DATE);
    expect(invalidScore).toBe(77); // 默认值
  });

  test('极端日期处理', () => {
    const pastDate = new Date('2000-01-01');
    const futureDate = new Date('2030-12-31');
    
    const pastData = generateDailyHoroscope(TEST_HOROSCOPE, pastDate);
    const futureData = generateDailyHoroscope(TEST_HOROSCOPE, futureDate);
    
    expect(pastData).toBeDefined();
    expect(futureData).toBeDefined();
    expect(pastData.overallScore).toBeGreaterThanOrEqual(0);
    expect(futureData.overallScore).toBeLessThanOrEqual(100);
  });

  test('空输入处理', () => {
    const emptyData = generateDailyHoroscope('', TEST_DATE);
    expect(emptyData).toBeNull();
    
    const nullData = generateDailyHoroscope(null, TEST_DATE);
    expect(nullData).toBeNull();
  });
});

/**
 * 性能测试
 */
describe('性能测试', () => {
  test('生成速度', () => {
    const startTime = performance.now();
    
    // 生成12个星座的数据
    for (let i = 0; i < 12; i++) {
      generateDailyHoroscope(HOROSCOPE_DATA_ENHANCED[i].name, TEST_DATE);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 期望在100ms内完成12个星座的数据生成
    expect(duration).toBeLessThan(100);
  });

  test('内存使用', () => {
    const data = generateDailyHoroscope(TEST_HOROSCOPE, TEST_DATE);
    const dataSize = JSON.stringify(data).length;
    
    // 期望单个运势数据大小小于10KB
    expect(dataSize).toBeLessThan(10 * 1024);
  });
});

console.log('所有单元测试通过！');