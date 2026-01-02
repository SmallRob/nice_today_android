/**
 * 能量等级配置
 */

export const ENERGY_LEVELS = {
  1: { name: '种子', minEnergy: 0, treeSize: 20, color: '#90EE90' },
  2: { name: '种子', minEnergy: 100, treeSize: 25, color: '#90EE90' },
  3: { name: '种子', minEnergy: 200, treeSize: 30, color: '#90EE90' },
  4: { name: '种子', minEnergy: 300, treeSize: 35, color: '#90EE90' },
  5: { name: '种子', minEnergy: 500, treeSize: 40, color: '#90EE90' },
  6: { name: '幼苗', minEnergy: 500, treeSize: 45, color: '#7CFC00' },
  7: { name: '幼苗', minEnergy: 700, treeSize: 50, color: '#7CFC00' },
  8: { name: '幼苗', minEnergy: 900, treeSize: 55, color: '#7CFC00' },
  9: { name: '幼苗', minEnergy: 1200, treeSize: 60, color: '#7CFC00' },
  10: { name: '幼苗', minEnergy: 1500, treeSize: 65, color: '#7CFC00' },
  11: { name: '小树', minEnergy: 2000, treeSize: 70, color: '#32CD32' },
  12: { name: '小树', minEnergy: 2500, treeSize: 75, color: '#32CD32' },
  13: { name: '小树', minEnergy: 3000, treeSize: 80, color: '#32CD32' },
  14: { name: '小树', minEnergy: 4000, treeSize: 85, color: '#32CD32' },
  15: { name: '小树', minEnergy: 5000, treeSize: 90, color: '#32CD32' },
  16: { name: '小树', minEnergy: 6000, treeSize: 95, color: '#228B22' },
  17: { name: '小树', minEnergy: 7000, treeSize: 100, color: '#228B22' },
  18: { name: '小树', minEnergy: 8000, treeSize: 105, color: '#228B22' },
  19: { name: '小树', minEnergy: 9000, treeSize: 110, color: '#228B22' },
  20: { name: '成树', minEnergy: 10000, treeSize: 120, color: '#228B22' },
  21: { name: '成树', minEnergy: 12000, treeSize: 130, color: '#006400' },
  22: { name: '成树', minEnergy: 14000, treeSize: 140, color: '#006400' },
  23: { name: '成树', minEnergy: 16000, treeSize: 150, color: '#006400' },
  24: { name: '成树', minEnergy: 18000, treeSize: 160, color: '#006400' },
  25: { name: '成树', minEnergy: 20000, treeSize: 170, color: '#006400' },
  26: { name: '成树', minEnergy: 23000, treeSize: 180, color: '#2E8B57' },
  27: { name: '成树', minEnergy: 26000, treeSize: 190, color: '#2E8B57' },
  28: { name: '成树', minEnergy: 29000, treeSize: 200, color: '#2E8B57' },
  29: { name: '古树', minEnergy: 30000, treeSize: 220, color: '#006400' },
  30: { name: '古树', minEnergy: 35000, treeSize: 240, color: '#006400' },
  31: { name: '古树', minEnergy: 40000, treeSize: 260, color: '#006400' },
  32: { name: '神树', minEnergy: 50000, treeSize: 280, color: '#FFD700' },
};

// 每日能量配置
export const DAILY_CONFIG = {
  SIGN_IN_REWARD: 100,       // 签到奖励
  VISIT_REWARD: 50,          // 访问功能奖励
  ENERGY_BOOST_PAGE_REWARD: 100, // 打开能量提升页面奖励
  DAILY_LIMIT: 1300,          // 每日能量上限
  ENERGY_BOOST_UP_LIMIT: 1000,  // 能量提升UP上限
  BUBBLE_RETENTION_DAYS: 3,   // 气泡保留天数
};

// 能量气泡大小配置
export const BUBBLE_SIZES = {
  small: { minEnergy: 50, maxEnergy: 100, size: 30 },
  medium: { minEnergy: 100, maxEnergy: 200, size: 45 },
  large: { minEnergy: 200, maxEnergy: 300, size: 60 },
};

/**
 * 根据总能量获取当前等级
 */
export const getCurrentLevel = (totalEnergy) => {
  let level = 1;
  for (const [lvl, config] of Object.entries(ENERGY_LEVELS)) {
    if (totalEnergy >= config.minEnergy) {
      level = parseInt(lvl);
    } else {
      break;
    }
  }
  return level;
};

/**
 * 获取等级配置
 */
export const getLevelConfig = (level) => {
  return ENERGY_LEVELS[level] || ENERGY_LEVELS[1];
};

/**
 * 计算下一级所需能量
 */
export const getNextLevelEnergy = (currentLevel) => {
  const nextLevel = currentLevel + 1;
  const nextConfig = ENERGY_LEVELS[nextLevel];
  return nextConfig ? nextConfig.minEnergy : null;
};

/**
 * 生成随机能量气泡
 */
export const generateBubble = (baseEnergy = 100) => {
  const sizes = ['small', 'medium', 'large'];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
  const config = BUBBLE_SIZES[randomSize];

  return {
    id: Date.now() + Math.random(),
    energy: Math.floor(Math.random() * (config.maxEnergy - config.minEnergy) + config.minEnergy),
    x: Math.random() * 80 + 10, // 10%-90% 位置
    y: Math.random() * 60 + 20, // 20%-80% 位置
    size: config.size,
    sizeType: randomSize,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + DAILY_CONFIG.BUBBLE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
};
