/**
 * 时间工具函数
 */

/**
 * 格式化时间显示
 * @param {string} time - 时间字符串 (如: "23:30")
 * @returns {string} 格式化后的时间
 */
export const formatTime = (time) => {
  if (!time) return '--:--';
  return time;
};

/**
 * 格式化日期显示
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期
 */
export const formatDate = (date) => {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * 计算时间差
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {number} 时间差（分钟）
 */
export const calculateTimeDiff = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  if (end < start) {
    // 如果结束时间早于开始时间，假设是跨天
    end.setDate(end.getDate() + 1);
  }
  
  const diff = (end - start) / (1000 * 60); // 转换为分钟
  return Math.max(0, diff);
};

/**
 * 检查是否是有效时间格式
 * @param {string} time - 时间字符串
 * @returns {boolean} 是否有效
 */
export const isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * 获取当前时间
 * @returns {string} 当前时间 (HH:MM)
 */
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

/**
 * 获取当前日期
 * @returns {string} 当前日期 (YYYY-MM-DD)
 */
export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

/**
 * 将分钟转换为小时和分钟
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化的时间字符串
 */
export const formatMinutesToTime = (minutes) => {
  if (minutes === null || minutes === undefined) return '0分钟';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}分钟`;
  } else {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
};