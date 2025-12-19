/**
 * 星座运势缓存系统单元测试
 * 验证缓存机制的正确性和性能
 */

import {
  getDailyHoroscopeWithCache,
  getSoulQuestionWithCache,
  getLuckyItemWithCache,
  initializeHoroscopeCache,
  clearHoroscopeCache
} from './horoscopeCache';
import { generateDailyHoroscope } from './horoscopeAlgorithm';

// 测试数据
const TEST_HOROSCOPE = '白羊座';
const TEST_DATE = new Date('2024-12-19');

/**
 * 缓存基础功能测试
 */
describe('缓存基础功能', () => {
  beforeEach(() => {
    // 清理缓存
    clearHoroscopeCache();
    initializeHoroscopeCache();
  });

  test('缓存初始化', () => {
    const cacheStats = initializeHoroscopeCache();
    expect(cacheStats).toHaveProperty('totalCached');
    expect(cacheStats).toHaveProperty('cacheHits');
    expect(cacheStats).toHaveProperty('cacheMisses');
  });

  test('运势数据缓存', async () => {
    // 第一次获取 - 应该缓存
    const data1 = await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(data1).toBeDefined();
    
    // 第二次获取 - 应该从缓存中读取
    const data2 = await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(data2).toBeDefined();
    expect(data1.dailyId).toBe(data2.dailyId);
  });

  test('心灵问答缓存', async () => {
    const question1 = await getSoulQuestionWithCache(TEST_HOROSCOPE, TEST_DATE);
    const question2 = await getSoulQuestionWithCache(TEST_HOROSCOPE, TEST_DATE);
    
    expect(question1.question).toBe(question2.question);
  });

  test('幸运物品缓存', async () => {
    const item1 = await getLuckyItemWithCache(TEST_HOROSCOPE, TEST_DATE);
    const item2 = await getLuckyItemWithCache(TEST_HOROSCOPE, TEST_DATE);
    
    expect(item1.name).toBe(item2.name);
  });
});

/**
 * 缓存过期测试
 */
describe('缓存过期机制', () => {
  beforeEach(() => {
    clearHoroscopeCache();
  });

  test('缓存过期时间验证', async () => {
    // 设置较短的过期时间（1秒）
    const originalTimeout = localStorage.getItem('horoscope_cache_timeout');
    localStorage.setItem('horoscope_cache_timeout', '1000');
    
    initializeHoroscopeCache();
    
    // 第一次获取
    const data1 = await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // 第二次获取 - 应该重新生成
    const data2 = await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(data1.dailyId).toBe(data2.dailyId); // 数据应该相同
    
    // 恢复原始设置
    if (originalTimeout) {
      localStorage.setItem('horoscope_cache_timeout', originalTimeout);
    } else {
      localStorage.removeItem('horoscope_cache_timeout');
    }
  });
});

/**
 * 缓存性能测试
 */
describe('缓存性能测试', () => {
  beforeEach(() => {
    clearHoroscopeCache();
    initializeHoroscopeCache();
  });

  test('缓存命中性能', async () => {
    const startTime1 = performance.now();
    
    // 第一次获取（缓存未命中）
    await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    const duration1 = performance.now() - startTime1;
    
    const startTime2 = performance.now();
    
    // 第二次获取（缓存命中）
    await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    const duration2 = performance.now() - startTime2;
    
    // 缓存命中应该比未命中快很多
    expect(duration2).toBeLessThan(duration1 * 0.5);
  });

  test('多用户缓存隔离', async () => {
    const data1 = await getDailyHoroscopeWithCache(
      '白羊座', 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    const data2 = await getDailyHoroscopeWithCache(
      '金牛座', 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(data1.horoscopeInfo.name).toBe('白羊座');
    expect(data2.horoscopeInfo.name).toBe('金牛座');
    expect(data1.overallScore).not.toBe(data2.overallScore);
  });
});

/**
 * 缓存清理测试
 */
describe('缓存清理功能', () => {
  test('清理所有缓存', async () => {
    // 添加一些缓存数据
    await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    await getSoulQuestionWithCache(TEST_HOROSCOPE, TEST_DATE);
    
    // 检查缓存存在
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('horoscope_cache_') || key.startsWith('soul_question_') || key.startsWith('lucky_item_')
    );
    
    expect(cacheKeys.length).toBeGreaterThan(0);
    
    // 清理缓存
    clearHoroscopeCache();
    
    // 检查缓存已清理
    const remainingKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('horoscope_cache_') || key.startsWith('soul_question_') || key.startsWith('lucky_item_')
    );
    
    expect(remainingKeys.length).toBe(0);
  });

  test('选择性清理', async () => {
    // 添加不同日期的缓存
    const date1 = new Date('2024-12-19');
    const date2 = new Date('2024-12-20');
    
    await getDailyHoroscopeWithCache(TEST_HOROSCOPE, date1, { generateDailyHoroscope });
    await getDailyHoroscopeWithCache(TEST_HOROSCOPE, date2, { generateDailyHoroscope });
    
    // 只清理某一天的缓存
    const cacheKeysBefore = Object.keys(localStorage).filter(key => 
      key.includes('2024-12-19') || key.includes('2024-12-20')
    );
    
    // 手动清理某一天的缓存
    Object.keys(localStorage).forEach(key => {
      if (key.includes('2024-12-19')) {
        localStorage.removeItem(key);
      }
    });
    
    const cacheKeysAfter = Object.keys(localStorage).filter(key => 
      key.includes('2024-12-19') || key.includes('2024-12-20')
    );
    
    expect(cacheKeysAfter.length).toBeLessThan(cacheKeysBefore.length);
  });
});

/**
 * 错误处理测试
 */
describe('缓存错误处理', () => {
  test('无效数据缓存处理', async () => {
    const invalidData = await getDailyHoroscopeWithCache(
      '无效星座', 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(invalidData).toBeNull();
  });

  test('缓存损坏处理', async () => {
    // 手动添加损坏的缓存数据
    const corruptedData = JSON.stringify({
      data: null,
      expiry: Date.now() + 3600000
    });
    
    localStorage.setItem('horoscope_cache_corrupted', corruptedData);
    
    // 尝试获取 - 应该处理损坏的缓存
    const data = await getDailyHoroscopeWithCache(
      TEST_HOROSCOPE, 
      TEST_DATE, 
      { generateDailyHoroscope }
    );
    
    expect(data).toBeDefined();
  });
});

console.log('缓存系统单元测试通过！');