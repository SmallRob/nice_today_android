/**
 * 每日集卡功能 - 概率算法
 */

import { DRAW_WEIGHTS, CARD_POOLS, PITY_CONFIG } from './cardConfig';

/**
 * 根据权重随机抽取稀有度
 * @returns {string} 返回 'R', 'SR', 或 'SSR'
 */
export function drawRarity() {
  const weights = DRAW_WEIGHTS;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    currentWeight += weight;
    if (random < currentWeight) {
      return rarity;
    }
  }

  return 'R';
}

/**
 * 从指定稀有度的卡牌池中随机抽取卡牌
 * @param {string} rarity - 稀有度 'R', 'SR', 或 'SSR'
 * @param {string} cardType - 卡牌类型 'traditional' 或 'hexagram'
 * @returns {object} 返回随机抽取的卡牌对象
 */
export function drawCardFromPool(rarity, cardType) {
  const pool = CARD_POOLS[cardType][rarity];

  if (!pool || pool.length === 0) {
    console.error(`卡牌池为空: ${cardType} - ${rarity}`);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * 保底抽卡逻辑
 * @param {object} pityData - 保底数据 { streak: { sr: 0, ssr: 0 }, lastSR: null, lastSSR: null }
 * @returns {object} 返回 { rarity: string, updatedPityData: object }
 */
export function drawCardWithPity(pityData) {
  let rarity = drawRarity();

  // 检查是否触发SSR保底
  if (pityData.streak.ssr >= PITY_CONFIG.SSR.threshold) {
    pityData.streak.ssr = 0;
    pityData.streak.sr = 0;
    pityData.lastSSR = new Date().toISOString();

    console.log('触发SSR保底！');
    return {
      rarity: 'SSR',
      updatedPityData: { ...pityData },
      pityTriggered: true,
      pityType: 'SSR'
    };
  }

  // 检查是否触发SR保底
  if (pityData.streak.sr >= PITY_CONFIG.SR.threshold) {
    pityData.streak.sr = 0;
    pityData.lastSR = new Date().toISOString();

    console.log('触发SR保底！');
    return {
      rarity: 'SR',
      updatedPityData: { ...pityData },
      pityTriggered: true,
      pityType: 'SR'
    };
  }

  // 更新保底计数
  const updatedPityData = {
    ...pityData,
    streak: {
      ...pityData.streak,
      sr: pityData.streak.sr + (rarity === 'SR' || rarity === 'SSR' ? 0 : 1),
      ssr: pityData.streak.ssr + (rarity === 'SSR' ? 0 : 1)
    },
    lastSR: rarity === 'SR' || rarity === 'SSR' ? new Date().toISOString() : pityData.lastSR,
    lastSSR: rarity === 'SSR' ? new Date().toISOString() : pityData.lastSSR
  };

  return {
    rarity,
    updatedPityData,
    pityTriggered: false
  };
}

/**
 * 连续抽卡概率调整
 * 每日第1次抽卡SSR概率提升到10%
 * @param {number} drawCount - 今日已抽卡次数
 * @returns {object} 返回调整后的权重
 */
export function getAdjustedProbability(drawCount) {
  if (drawCount === 0) {
    // 第一次抽卡，SSR概率提升
    return {
      'R': 60,
      'SR': 30,
      'SSR': 10
    };
  } else if (drawCount === 1) {
    // 第二次抽卡，恢复正常
    return {
      'R': 70,
      'SR': 25,
      'SSR': 5
    };
  }
  // 第三次抽卡，正常
  return {
    'R': 70,
    'SR': 25,
    'SSR': 5
  };
}

/**
 * 使用调整后的概率进行抽卡
 * @param {number} drawCount - 今日已抽卡次数
 * @returns {string} 返回稀有度
 */
export function drawRarityWithAdjustment(drawCount) {
  const weights = getAdjustedProbability(drawCount);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    currentWeight += weight;
    if (random < currentWeight) {
      return rarity;
    }
  }

  return 'R';
}

/**
 * 完整的抽卡流程
 * @param {number} drawCount - 今日已抽卡次数
 * @param {object} pityData - 保底数据
 * @returns {object} 返回 { card, rarity, updatedPityData, pityTriggered }
 */
export function performDraw(drawCount, pityData, cardType = 'traditional') {
  // 根据抽卡次数调整概率
  const { rarity, updatedPityData, pityTriggered, pityType } = drawCardWithPity(pityData);

  // 从卡牌池中抽取卡牌
  const card = drawCardFromPool(rarity, cardType);

  return {
    card,
    rarity,
    updatedPityData,
    pityTriggered,
    pityType,
    drawCount: drawCount + 1
  };
}

/**
 * 模拟抽卡N次，用于测试
 * @param {number} times - 抽卡次数
 * @param {boolean} withPity - 是否启用保底
 * @returns {array} 返回抽卡结果统计
 */
export function simulateDraws(times, withPity = true) {
  const results = [];
  const pityData = {
    streak: { sr: 0, ssr: 0 },
    lastSR: null,
    lastSSR: null
  };

  for (let i = 0; i < times; i++) {
    const { rarity, updatedPityData, pityTriggered } = withPity
      ? drawCardWithPity(pityData)
      : { rarity: drawRarity(), updatedPityData: pityData, pityTriggered: false };

    results.push({
      index: i + 1,
      rarity,
      pityTriggered
    });

    if (withPity) {
      Object.assign(pityData, updatedPityData);
    }
  }

  // 统计结果
  const stats = {
    total: times,
    R: results.filter(r => r.rarity === 'R').length,
    SR: results.filter(r => r.rarity === 'SR').length,
    SSR: results.filter(r => r.rarity === 'SSR').length,
    pityTriggered: results.filter(r => r.pityTriggered).length
  };

  return {
    results,
    stats,
    pityData
  };
}

/**
 * 计算稀有度期望值
 * @returns {object} 返回期望值
 */
export function calculateExpectation() {
  const weights = DRAW_WEIGHTS;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return {
    R: (weights.R / totalWeight) * 100,
    SR: (weights.SR / totalWeight) * 100,
    SSR: (weights.SSR / totalWeight) * 100
  };
}

/**
 * 保底进度计算
 * @param {object} pityData - 保底数据
 * @returns {object} 返回保底进度
 */
export function calculatePityProgress(pityData) {
  return {
    SR: {
      current: pityData.streak.sr,
      max: PITY_CONFIG.SR.threshold,
      progress: (pityData.streak.sr / PITY_CONFIG.SR.threshold) * 100,
      guaranteed: pityData.streak.sr >= PITY_CONFIG.SR.threshold - 1
    },
    SSR: {
      current: pityData.streak.ssr,
      max: PITY_CONFIG.SSR.threshold,
      progress: (pityData.streak.ssr / PITY_CONFIG.SSR.threshold) * 100,
      guaranteed: pityData.streak.ssr >= PITY_CONFIG.SSR.threshold - 1
    }
  };
}

export default {
  drawRarity,
  drawCardFromPool,
  drawCardWithPity,
  drawRarityWithAdjustment,
  performDraw,
  simulateDraws,
  calculateExpectation,
  calculatePityProgress,
  getAdjustedProbability
};
