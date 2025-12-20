/**
 * 生物节律计算器
 * 用于计算体力、情绪和智力三种基本节律
 */

/**
 * 计算生物节律值
 * @param {string} birthDate - 出生日期 (YYYY-MM-DD格式)
 * @param {Date} targetDate - 目标日期
 * @returns {object} 包含physical, emotional, intellectual三个节律值的对象
 */
export const calculateBiorhythm = (birthDate, targetDate) => {
  // 将字符串转换为Date对象
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  
  // 计算出生到目标日期的总天数
  const diffTime = Math.abs(target - birth);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 三种基本节律的周期（天）
  const physicalCycle = 23;   // 体力周期
  const emotionalCycle = 28;  // 情绪周期
  const intellectualCycle = 33; // 智力周期
  
  // 计算各节律值（范围：-1 到 1）
  const physical = Math.sin((2 * Math.PI * totalDays) / physicalCycle);
  const emotional = Math.sin((2 * Math.PI * totalDays) / emotionalCycle);
  const intellectual = Math.sin((2 * Math.PI * totalDays) / intellectualCycle);
  
  return {
    physical: physical * 100,      // 转换为百分比
    emotional: emotional * 100,
    intellectual: intellectual * 100
  };
};

/**
 * 计算临界日
 * @param {string} birthDate - 出生日期 (YYYY-MM-DD格式)
 * @param {Date} targetDate - 目标日期
 * @returns {array} 包含临界日类型的数组
 */
export const calculateCriticalDays = (birthDate, targetDate) => {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  
  const diffTime = Math.abs(target - birth);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const criticalDays = [];
  
  // 体力临界日
  if (totalDays % 23 === 0) {
    criticalDays.push('体力');
  }
  
  // 情绪临界日
  if (totalDays % 28 === 0) {
    criticalDays.push('情绪');
  }
  
  // 智力临界日
  if (totalDays % 33 === 0) {
    criticalDays.push('智力');
  }
  
  return criticalDays;
};

export default {
  calculateBiorhythm,
  calculateCriticalDays
};