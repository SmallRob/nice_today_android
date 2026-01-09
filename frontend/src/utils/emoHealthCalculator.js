/**
 * 情绪健康计算工具函数
 */

/**
 * 计算情绪健康评分
 * @param {Object} emoHealthData - 情绪健康数据对象
 * @returns {Object} 情绪健康评分结果
 */
export const calculateEmoHealthScore = (emoHealthData) => {
  if (!emoHealthData) return null;
  
  const { stressLevel, stability, moodSwings, positivity, sleepQuality, activityLevel } = emoHealthData;
  
  // 压力水平评分
  const stressScore = calculateStressScore(stressLevel);
  
  // 情绪稳定性评分
  const stabilityScore = calculateStabilityScore(stability);
  
  // 情绪波动评分
  const moodSwingsScore = calculateMoodSwingsScore(moodSwings);
  
  // 积极情绪评分
  const positivityScore = calculatePositivityScore(positivity);
  
  // 总分计算
  const totalScore = Math.round((stressScore * 0.25 + stabilityScore * 0.25 + moodSwingsScore * 0.2 + positivityScore * 0.3) * 10) / 10;
  
  return {
    totalScore,
    stressScore,
    stabilityScore,
    moodSwingsScore,
    positivityScore,
    stressLevel,
    stability,
    moodSwings,
    positivity,
    sleepQuality,
    activityLevel
  };
};

/**
 * 计算压力水平评分
 * @param {string} stressLevel - 压力水平（低/中等/高）
 * @returns {number} 压力评分（0-100）
 */
const calculateStressScore = (stressLevel) => {
  switch (stressLevel) {
    case '低': return 90;
    case '中等': return 70;
    case '高': return 40;
    default: return 70;
  }
};

/**
 * 计算情绪稳定性评分
 * @param {string} stability - 情绪稳定性（稳定/较稳定/波动大）
 * @returns {number} 稳定性评分（0-100）
 */
const calculateStabilityScore = (stability) => {
  switch (stability) {
    case '稳定': return 90;
    case '较稳定': return 75;
    case '波动大': return 50;
    default: return 75;
  }
};

/**
 * 计算情绪波动评分
 * @param {string} moodSwings - 情绪波动（轻微/中等/严重）
 * @returns {number} 波动评分（0-100）
 */
const calculateMoodSwingsScore = (moodSwings) => {
  switch (moodSwings) {
    case '轻微': return 85;
    case '中等': return 60;
    case '严重': return 35;
    default: return 60;
  }
};

/**
 * 计算积极情绪评分
 * @param {number} positivity - 积极情绪指数（0-100）
 * @returns {number} 积极情绪评分（0-100）
 */
const calculatePositivityScore = (positivity) => {
  return Math.min(100, positivity);
};

/**
 * 生成模拟情绪健康数据（用于测试）
 * @param {Object} options - 配置选项
 * @returns {Object} 模拟情绪健康数据
 */
export const generateMockEmoHealthData = (options = {}) => {
  const defaults = {
    stressLevel: '中等',
    stability: '较稳定',
    moodSwings: '轻微',
    positivity: 75,
    sleepQuality: 80,
    activityLevel: 70,
    totalScore: 75
  };
  
  return { ...defaults, ...options };
};

/**
 * 格式化情绪健康数据显示
 * @param {Object} emoData - 情绪健康数据
 * @returns {Object} 格式化后的数据
 */
export const formatEmoHealthData = (emoData) => {
  if (!emoData) return null;
  
  return {
    ...emoData,
    formattedStress: emoData.stressLevel,
    formattedStability: emoData.stability,
    formattedMoodSwings: emoData.moodSwings,
    formattedPositivity: `${emoData.positivity}%`
  };
};