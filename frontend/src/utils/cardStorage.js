/**
 * 每日集卡功能 - 存储管理
 */

import { DAILY_DRAW_LIMIT } from './cardConfig';

// LocalStorage 键名
const STORAGE_KEYS = {
  USER_CARDS: 'daily_cards_user_cards',
  DAILY_DRAWS: 'daily_cards_draws',
  CARD_FRAGMENTS: 'daily_cards_fragments',
  PITY_SYSTEM: 'daily_cards_pity',
  COLLECTION_PROGRESS: 'daily_cards_collection_progress',
  SETTINGS: 'daily_cards_settings'
};

/**
 * 获取今日日期（YYYY-MM-DD格式）
 */
export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 初始化用户数据
 */
export function initializeUserCards() {
  try {
    // 检查是否已初始化
    const existing = localStorage.getItem(STORAGE_KEYS.USER_CARDS);
    if (existing) {
      return false;
    }

    // 初始化空数据
    const initialData = {
      traditional: {},
      hexagram: {},
      initialized: true,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(initialData));
    console.log('用户卡牌数据初始化成功');
    return true;
  } catch (error) {
    console.error('初始化用户卡牌数据失败:', error);
    return false;
  }
}

/**
 * 加载用户卡牌收藏
 */
export function loadUserCards() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_CARDS);
    if (!data) {
      initializeUserCards();
      return { traditional: {}, hexagram: {} };
    }

    const parsed = JSON.parse(data);

    // 验证数据格式
    if (!parsed.traditional || !parsed.hexagram) {
      console.warn('用户卡牌数据格式错误，重新初始化');
      initializeUserCards();
      return { traditional: {}, hexagram: {} };
    }

    return parsed;
  } catch (error) {
    console.error('加载用户卡牌数据失败:', error);
    initializeUserCards();
    return { traditional: {}, hexagram: {} };
  }
}

/**
 * 保存用户卡牌收藏
 */
export function saveUserCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(cards));
    return true;
  } catch (error) {
    console.error('保存用户卡牌数据失败:', error);
    return false;
  }
}

/**
 * 添加卡牌到收藏
 */
export function addCardToCollection(card, rarity) {
  try {
    const userCards = loadUserCards();
    const cardType = card.type === 'hexagram' ? 'hexagram' : 'traditional';

    if (!userCards[cardType]) {
      userCards[cardType] = {};
    }

    const existingCard = userCards[cardType][card.id];

    if (existingCard) {
      // 更新现有卡牌
      existingCard.count += 1;
      existingCard.obtainedAt.push(new Date().toISOString());
      existingCard.isNew = false;
    } else {
      // 添加新卡牌
      userCards[cardType][card.id] = {
        id: card.id,
        name: card.name,
        englishName: card.englishName,
        rarity: rarity,
        type: card.type,
        count: 1,
        obtainedAt: [new Date().toISOString()],
        isNew: true,
        ...card
      };
    }

    saveUserCards(userCards);
    updateCollectionProgress();

    return userCards[cardType][card.id];
  } catch (error) {
    console.error('添加卡牌到收藏失败:', error);
    return null;
  }
}

/**
 * 加载每日抽卡数据
 */
export function loadDailyDraws() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_DRAWS);
    if (!data) {
      return {
        date: getTodayDate(),
        remaining: DAILY_DRAW_LIMIT,
        draws: []
      };
    }

    const parsed = JSON.parse(data);
    const today = getTodayDate();

    // 检查是否是今天的数据
    if (parsed.date !== today) {
      // 不是今天的数据，重置
      console.log('日期变化，重置每日抽卡次数');
      return {
        date: today,
        remaining: DAILY_DRAW_LIMIT,
        draws: []
      };
    }

    return parsed;
  } catch (error) {
    console.error('加载每日抽卡数据失败:', error);
    return {
      date: getTodayDate(),
      remaining: DAILY_DRAW_LIMIT,
      draws: []
    };
  }
}

/**
 * 保存每日抽卡数据
 */
export function saveDailyDraws(dailyDraws) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_DRAWS, JSON.stringify(dailyDraws));
    return true;
  } catch (error) {
    console.error('保存每日抽卡数据失败:', error);
    return false;
  }
}

/**
 * 记录一次抽卡
 */
export function recordDraw(card, rarity) {
  try {
    const dailyDraws = loadDailyDraws();

    if (dailyDraws.remaining <= 0) {
      console.warn('今日抽卡次数已用完');
      return false;
    }

    // 添加抽卡记录
    dailyDraws.draws.push({
      cardId: card.id,
      cardType: card.type,
      rarity: rarity,
      timestamp: new Date().toISOString()
    });

    // 更新剩余次数
    dailyDraws.remaining = Math.max(0, dailyDraws.remaining - 1);

    saveDailyDraws(dailyDraws);
    return true;
  } catch (error) {
    console.error('记录抽卡失败:', error);
    return false;
  }
}

/**
 * 加载保底数据
 */
export function loadPityData() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PITY_SYSTEM);
    if (!data) {
      return {
        streak: { sr: 0, ssr: 0 },
        lastSR: null,
        lastSSR: null
      };
    }

    const parsed = JSON.parse(data);

    // 验证数据格式
    if (!parsed.streak || typeof parsed.streak.sr !== 'number' || typeof parsed.streak.ssr !== 'number') {
      console.warn('保底数据格式错误，重置');
      return {
        streak: { sr: 0, ssr: 0 },
        lastSR: null,
        lastSSR: null
      };
    }

    return parsed;
  } catch (error) {
    console.error('加载保底数据失败:', error);
    return {
      streak: { sr: 0, ssr: 0 },
      lastSR: null,
      lastSSR: null
    };
  }
}

/**
 * 保存保底数据
 */
export function savePityData(pityData) {
  try {
    localStorage.setItem(STORAGE_KEYS.PITY_SYSTEM, JSON.stringify(pityData));
    return true;
  } catch (error) {
    console.error('保存保底数据失败:', error);
    return false;
  }
}

/**
 * 更新收集进度
 */
export function updateCollectionProgress() {
  try {
    const userCards = loadUserCards();

    const progress = {
      traditional: {
        total: 52,
        collected: Object.keys(userCards.traditional).length,
        R: Object.values(userCards.traditional).filter(c => c.rarity === 'R').length,
        SR: Object.values(userCards.traditional).filter(c => c.rarity === 'SR').length,
        SSR: Object.values(userCards.traditional).filter(c => c.rarity === 'SSR').length
      },
      hexagram: {
        total: 64,
        collected: Object.keys(userCards.hexagram).length,
        R: Object.values(userCards.hexagram).filter(c => c.rarity === 'R').length,
        SR: Object.values(userCards.hexagram).filter(c => c.rarity === 'SR').length,
        SSR: Object.values(userCards.hexagram).filter(c => c.rarity === 'SSR').length
      },
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.COLLECTION_PROGRESS, JSON.stringify(progress));
    return progress;
  } catch (error) {
    console.error('更新收集进度失败:', error);
    return null;
  }
}

/**
 * 加载收集进度
 */
export function loadCollectionProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COLLECTION_PROGRESS);
    if (!data) {
      return updateCollectionProgress();
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('加载收集进度失败:', error);
    return updateCollectionProgress();
  }
}

/**
 * 获取收集统计
 */
export function getCollectionStats() {
  const progress = loadCollectionProgress();
  const totalCards = progress.traditional.total + progress.hexagram.total;
  const collectedCards = progress.traditional.collected + progress.hexagram.collected;

  return {
    total: totalCards,
    collected: collectedCards,
    percentage: ((collectedCards / totalCards) * 100).toFixed(1),
    byType: {
      traditional: progress.traditional,
      hexagram: progress.hexagram
    },
    byRarity: {
      R: progress.traditional.R + progress.hexagram.R,
      SR: progress.traditional.SR + progress.hexagram.SR,
      SSR: progress.traditional.SSR + progress.hexagram.SSR
    }
  };
}

/**
 * 清除所有卡牌数据
 */
export function clearAllCardData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('所有卡牌数据已清除');
    return true;
  } catch (error) {
    console.error('清除卡牌数据失败:', error);
    return false;
  }
}

/**
 * 导出卡牌数据（用于备份）
 */
export function exportCardData() {
  try {
    const data = {
      userCards: loadUserCards(),
      dailyDraws: loadDailyDraws(),
      pityData: loadPityData(),
      collectionProgress: loadCollectionProgress(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('导出卡牌数据失败:', error);
    return null;
  }
}

/**
 * 导入卡牌数据
 */
export function importCardData(jsonData) {
  try {
    const data = JSON.parse(jsonData);

    if (!data.userCards || !data.dailyDraws || !data.pityData) {
      console.error('导入的数据格式不正确');
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(data.userCards));
    localStorage.setItem(STORAGE_KEYS.DAILY_DRAWS, JSON.stringify(data.dailyDraws));
    localStorage.setItem(STORAGE_KEYS.PITY_SYSTEM, JSON.stringify(data.pityData));
    if (data.collectionProgress) {
      localStorage.setItem(STORAGE_KEYS.COLLECTION_PROGRESS, JSON.stringify(data.collectionProgress));
    }

    console.log('卡牌数据导入成功');
    return true;
  } catch (error) {
    console.error('导入卡牌数据失败:', error);
    return false;
  }
}

/**
 * 标记卡牌为已查看（取消新卡标识）
 */
export function markCardAsViewed(cardId, cardType) {
  try {
    const userCards = loadUserCards();
    const typeKey = cardType === 'hexagram' ? 'hexagram' : 'traditional';

    if (userCards[typeKey] && userCards[typeKey][cardId]) {
      userCards[typeKey][cardId].isNew = false;
      saveUserCards(userCards);
    }
    return true;
  } catch (error) {
    console.error('标记卡牌为已查看失败:', error);
    return false;
  }
}

export default {
  getTodayDate,
  initializeUserCards,
  loadUserCards,
  saveUserCards,
  addCardToCollection,
  loadDailyDraws,
  saveDailyDraws,
  recordDraw,
  loadPityData,
  savePityData,
  updateCollectionProgress,
  loadCollectionProgress,
  getCollectionStats,
  clearAllCardData,
  exportCardData,
  importCardData,
  markCardAsViewed
};
