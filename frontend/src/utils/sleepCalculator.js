/**
 * 睡眠数据计算工具函数
 */

/**
 * 计算睡眠评分
 * @param {Object} sleepData - 睡眠数据对象
 * @returns {Object} 睡眠评分结果
 */
export const calculateSleepScore = (sleepData) => {
  if (!sleepData) return null;
  
  const { totalDuration, deepSleep, lightSleep, remSleep, awakeTime, sleepTime, wakeTime } = sleepData;
  
  // 基础评分（基于总睡眠时长）
  const durationScore = calculateDurationScore(totalDuration);
  
  // 睡眠质量评分
  const qualityScore = calculateQualityScore(deepSleep, lightSleep, remSleep, awakeTime);
  
  // 就寝时间评分
  const scheduleScore = calculateScheduleScore(sleepTime);
  
  // 总分计算
  const totalScore = Math.round((durationScore * 0.4 + qualityScore * 0.4 + scheduleScore * 0.2) * 10) / 10;
  
  return {
    totalScore,
    durationScore,
    qualityScore,
    scheduleScore,
    duration: totalDuration,
    deepSleep,
    lightSleep,
    remSleep,
    awakeTime,
    sleepTime,
    wakeTime
  };
};

/**
 * 计算睡眠时长评分
 * @param {number} duration - 总睡眠时长（分钟）
 * @returns {number} 时长评分（0-100）
 */
const calculateDurationScore = (duration) => {
  const idealDuration = 480; // 理想睡眠时长：8小时 = 480分钟
  const minDuration = 240; // 最小可接受时长：4小时 = 240分钟
  const maxDuration = 720; // 最大可接受时长：12小时 = 720分钟
  
  if (duration < minDuration) {
    return (duration / minDuration) * 50; // 低于最小时长，按比例扣分
  }
  
  if (duration > maxDuration) {
    return 100 - ((duration - idealDuration) / (maxDuration - idealDuration)) * 20; // 超过最大时长适当扣分
  }
  
  // 在理想范围内，根据偏离程度评分
  const deviation = Math.abs(duration - idealDuration);
  const maxDeviation = idealDuration - minDuration;
  return 100 - (deviation / maxDeviation) * 50;
};

/**
 * 计算睡眠质量评分
 * @param {number} deepSleep - 深度睡眠时长（分钟）
 * @param {number} lightSleep - 浅度睡眠时长（分钟）
 * @param {number} remSleep - REM睡眠时长（分钟）
 * @param {number} awakeTime - 醒来时长（分钟）
 * @returns {number} 质量评分（0-100）
 */
const calculateQualityScore = (deepSleep, lightSleep, remSleep, awakeTime) => {
  const totalSleep = deepSleep + lightSleep + remSleep;
  if (totalSleep === 0) return 0;
  
  // 深度睡眠占比评分
  const deepSleepRatio = deepSleep / totalSleep;
  const deepSleepScore = deepSleepRatio * 100;
  
  // REM睡眠占比评分
  const remSleepRatio = remSleep / totalSleep;
  const remSleepScore = Math.min(remSleepRatio * 200, 100); // REM睡眠理想占比约20-25%
  
  // 醒来时长扣分
  const awakePenalty = Math.min(awakeTime / 30 * 20, 50); // 每醒来30分钟扣20分，最多扣50分
  
  return (deepSleepScore * 0.4 + remSleepScore * 0.3 + (100 - awakePenalty) * 0.3);
};

/**
 * 计算就寝时间评分
 * @param {string} sleepTime - 就寝时间（HH:mm格式）
 * @returns {number} 时间评分（0-100）
 */
const calculateScheduleScore = (sleepTime) => {
  if (!sleepTime) return 80; // 无数据时给基础分
  
  const [hours, minutes] = sleepTime.split(':').map(Number);
  const sleepMinutes = hours * 60 + minutes;
  
  // 理想就寝时间范围：22:00 - 23:30 (1320-1410分钟)
  const idealStart = 1320; // 22:00
  const idealEnd = 1410; // 23:30
  const idealDuration = idealEnd - idealStart;
  
  if (sleepMinutes < idealStart - 120) { // 早于21:00
    return 60; // 较早就寝适当扣分
  }
  
  if (sleepMinutes > idealEnd + 60) { // 晚于00:30
    return 40; // 过晚就寝较多扣分
  }
  
  // 在理想范围内，根据偏离程度评分
  const deviation = Math.abs(sleepMinutes - (idealStart + idealDuration / 2));
  const maxDeviation = idealDuration / 2 + 90; // 允许偏离范围
  return 100 - (deviation / maxDeviation) * 40;
};

/**
 * 格式化睡眠时间显示
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时间字符串
 */
export const formatSleepTime = (minutes) => {
  if (!minutes) return '0分钟';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}小时${mins}分钟`;
};

/**
 * 格式化时间显示
 * @param {string} time - 时间字符串（HH:mm格式）
 * @returns {string} 格式化后的时间
 */
export const formatTime = (time) => {
  if (!time) return '--:--';
  return time;
};

/**
 * 生成模拟睡眠数据（用于测试）
 * @param {Object} options - 配置选项
 * @returns {Object} 模拟睡眠数据
 */
export const generateMockSleepData = (options = {}) => {
  const defaults = {
    totalDuration: 291, // 4小时51分钟
    deepSleep: 60,
    lightSleep: 180,
    remSleep: 45,
    awakeTime: 6,
    sleepTime: '04:49',
    wakeTime: '09:06'
  };
  
  return { ...defaults, ...options };
};