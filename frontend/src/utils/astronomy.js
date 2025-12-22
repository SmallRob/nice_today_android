
/**
 * 天文/历法计算工具
 */

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 获取时辰 (例如: 12:30 -> 午时二刻)
export const getShichen = (timeStr) => {
    if (!timeStr) return '';

    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // 计算地支索引
    // 子时: 23:00 - 01:00 (index 0)
    // 丑时: 01:00 - 03:00 (index 1)
    // (hour + 1) // 2
    const branchIndex = Math.floor((hour + 1) / 2) % 12;
    const branch = EARTHLY_BRANCHES[branchIndex];

    // 计算刻
    // 0-14: 初刻, 15-29: 一刻, 30-44: 二刻, 45-59: 三刻
    const keIndex = Math.floor(minute / 15);
    const keMap = ['初刻', '一刻', '二刻', '三刻'];
    const ke = keMap[keIndex] || '初刻';

    return `${branch}时${ke}`;
};

/**
 * 计算真太阳时
 * @param {string} birthDateStr YYYY-MM-DD
 * @param {string} birthTimeStr HH:MM
 * @param {number} longitude 经度 (例如 116.40)
 * @returns {string} HH:MM (真太阳时)
 */
export const calculateTrueSolarTime = (birthDateStr, birthTimeStr, longitude) => {
    if (!birthDateStr || !birthTimeStr || longitude === undefined || longitude === null) {
        return birthTimeStr || '12:00';
    }

    const [year, month, day] = birthDateStr.split('-').map(Number);
    const [hour, minute] = birthTimeStr.split(':').map(Number);

    // 1. 经度校正
    // 中国标准时间使用东经120度
    // 每差1度，时间差4分钟
    const standardLongitude = 120.0;
    const longitudeDifference = longitude - standardLongitude;
    const longitudeCorrectionMinutes = longitudeDifference * 4;

    // 2. 均时差 (Equation of Time) 校正
    // 这是一个简化公式
    // N = 是一年中的第几天 (0-364)
    const date = new Date(year, month - 1, day);
    const startOfYear = new Date(year, 0, 0);
    const diff = date - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
    // eot in minutes
    const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

    // 总修正分钟数
    const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;

    // 计算原始总分钟数
    let totalMinutes = hour * 60 + minute + totalCorrectionMinutes;

    // 处理跨天
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;

    const resultHour = Math.floor(totalMinutes / 60);
    const resultMinute = Math.floor(totalMinutes % 60);

    const pad = (n) => n.toString().padStart(2, '0');

    return `${pad(resultHour)}:${pad(resultMinute)}`;
};
