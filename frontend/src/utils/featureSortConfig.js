/**
 * 功能排序配置管理工具
 * 用于保存和加载用户的功能卡片排序配置
 */

const STORAGE_KEY = 'feature_cards_sort_order';

// 默认功能卡片顺序
export const DEFAULT_FEATURE_ORDER = [
  'todo',
  'finance',
  'takashima',
  'zodiac',
  'horoscope',
  'bazi',
  'ziwei',
  'mbti',
  'personality-trait',
  'energy',
  'life-matrix',
  'daily-cards',
  'tarot-garden',
  'cultural-cup',
  'biorhythm',
  'period-tracker'
];

/**
 * 获取功能卡片的唯一ID
 */
export const getFeatureId = (componentName) => {
  const idMap = {
    'TodoCard': 'todo',
    'FinanceCard': 'finance',
    'TakashimaDivinationCard': 'takashima',
    'ChineseZodiacCard': 'zodiac',
    'HoroscopeCard': 'horoscope',
    'BaziCard': 'bazi',
    'ZiWeiCard': 'ziwei',
    'MBTICard': 'mbti',
    'PersonalityTraitCard': 'personality-trait',
    'EnergyBoostCard': 'energy',
    'LifeMatrixCard': 'life-matrix',
    'DailyCardCard': 'daily-cards',
    'TarotGardenCard': 'tarot-garden',
    'CulturalCupCard': 'cultural-cup',
    'BiorhythmCard': 'biorhythm',
    'PeriodTrackerCard': 'period-tracker'
  };
  return idMap[componentName] || componentName.toLowerCase().replace(/card/g, '').replace(/([A-Z])/g, '-$1').replace(/^-/, '');
};

/**
 * 从本地存储加载排序配置
 */
export const loadFeatureSortOrder = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_FEATURE_ORDER;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return DEFAULT_FEATURE_ORDER;
    }

    const parsed = JSON.parse(saved);

    // 验证配置格式
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.warn('功能排序配置格式错误，使用默认排序');
      return DEFAULT_FEATURE_ORDER;
    }

    // 验证每个ID是否为字符串
    if (!parsed.every(id => typeof id === 'string' && id.trim())) {
      console.warn('功能排序配置包含无效ID，使用默认排序');
      return DEFAULT_FEATURE_ORDER;
    }

    return parsed;
  } catch (error) {
    console.error('加载功能排序配置失败:', error);
    return DEFAULT_FEATURE_ORDER;
  }
};

/**
 * 保存排序配置到本地存储
 */
export const saveFeatureSortOrder = (order) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('无法保存排序配置：localStorage不可用');
      return false;
    }

    if (!Array.isArray(order) || order.length === 0) {
      console.warn('无法保存无效的排序配置');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    return true;
  } catch (error) {
    console.error('保存功能排序配置失败:', error);
    return false;
  }
};

/**
 * 合并默认顺序和保存的顺序
 * 新增的功能会添加到保存顺序的后面
 */
export const mergeFeatureOrder = (savedOrder, currentFeatures) => {
  try {
    // 提取当前所有功能的ID
    const currentIds = currentFeatures.map(getFeatureId);

    // 创建已存在功能的集合
    const existingIds = new Set(savedOrder);

    // 找出新增的功能ID
    const newIds = currentIds.filter(id => !existingIds.has(id));

    // 合并：保存的顺序 + 新增的功能
    const mergedOrder = [...savedOrder, ...newIds];

    // 过滤掉不存在于当前功能中的ID（已删除的功能）
    const validOrder = mergedOrder.filter(id => currentIds.includes(id));

    return validOrder;
  } catch (error) {
    console.error('合并功能排序失败:', error);
    return DEFAULT_FEATURE_ORDER;
  }
};

/**
 * 重置为默认排序
 */
export const resetFeatureSortOrder = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('重置功能排序失败:', error);
    return false;
  }
};
