/**
 * 年龄组枚举定义
 * 统一项目中的年龄段划分标准
 */

/**
 * 年龄组定义
 * key: 年龄段范围字符串 (如 '18-25岁')
 * value: { range, stage, description, color }
 */
export const AGE_GROUPS = {
  '0-5岁': {
    range: '0-5岁',
    stage: '婴幼儿期',
    description: '快速成长和学习基础能力',
    color: '#FF6B6B'
  },
  '6-12岁': {
    range: '6-12岁',
    stage: '儿童期',
    description: '认知能力迅速发展，性格形成',
    color: '#FF8E53'
  },
  '13-17岁': {
    range: '13-17岁',
    stage: '青少年期',
    description: '青春期，自我认同形成',
    color: '#FFD700'
  },
  '18-25岁': {
    range: '18-25岁',
    stage: '青年早期',
    description: '探索自我，建立独立性',
    color: '#4ECDC4'
  },
  '26-35岁': {
    range: '26-35岁',
    stage: '青年中期',
    description: '事业和家庭发展的关键期',
    color: '#44A08D'
  },
  '36-45岁': {
    range: '36-45岁',
    stage: '中年早期',
    description: '事业稳定，家庭责任增加',
    color: '#64B3F4'
  },
  '46-55岁': {
    range: '46-55岁',
    stage: '中年中期',
    description: '经验丰富，人生智慧积累',
    color: '#4A90E2'
  },
  '56-65岁': {
    range: '56-65岁',
    stage: '中年晚期',
    description: '准备退休，享受生活',
    color: '#9370DB'
  },
  '66岁+': {
    range: '66岁+',
    stage: '老年期',
    description: '智慧传承，安享晚年',
    color: '#8A2BE2'
  }
};

/**
 * 根据年龄获取对应的年龄组
 * @param {number} age - 年龄
 * @returns {Object} 年龄组对象，如果找不到则返回默认的'18-25岁'组
 */
export const getAgeGroupByAge = (age) => {
  if (age >= 0 && age <= 5) return AGE_GROUPS['0-5岁'];
  if (age >= 6 && age <= 12) return AGE_GROUPS['6-12岁'];
  if (age >= 13 && age <= 17) return AGE_GROUPS['13-17岁'];
  if (age >= 18 && age <= 25) return AGE_GROUPS['18-25岁'];
  if (age >= 26 && age <= 35) return AGE_GROUPS['26-35岁'];
  if (age >= 36 && age <= 45) return AGE_GROUPS['36-45岁'];
  if (age >= 46 && age <= 55) return AGE_GROUPS['46-55岁'];
  if (age >= 56 && age <= 65) return AGE_GROUPS['56-65岁'];
  if (age >= 66) return AGE_GROUPS['66岁+'];
  
  // 默认返回青年早期组
  return AGE_GROUPS['18-25岁'];
};

/**
 * 获取所有年龄组数组
 * @returns {Array} 年龄组对象数组
 */
export const getAllAgeGroups = () => Object.values(AGE_GROUPS);

/**
 * 获取年龄组范围字符串数组
 * @returns {Array} 年龄段字符串数组
 */
export const getAgeGroupRanges = () => Object.keys(AGE_GROUPS);

/**
 * 年龄组常量
 */
export const AGE_GROUP_RANGES = {
  INFANT_TODDLER: '0-5岁',
  CHILDHOOD: '6-12岁',
  ADOLESCENCE: '13-17岁',
  EARLY_YOUTH: '18-25岁',
  MID_YOUTH: '26-35岁',
  EARLY_MIDDLE_AGE: '36-45岁',
  MID_MIDDLE_AGE: '46-55岁',
  LATE_MIDDLE_AGE: '56-65岁',
  ELDERLY: '66岁+'
};

export default AGE_GROUPS;