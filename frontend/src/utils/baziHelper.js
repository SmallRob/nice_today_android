/**
 * 八字/历法计算实用工具
 * 包含阴阳历转换、干支计算、真太阳时调整等
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const LUNAR_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/**
 * 儒略日计算 (Julian Day)
 */
const getJulianDay = (year, month, day, hour = 12, minute = 0) => {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    return jd + (hour + minute / 60) / 24;
};

/**
 * 计算干支 (从0-59的索引转换为字符串)
 */
const getGanzhiStr = (index) => {
    return TIANGAN[index % 10] + DIZHI[index % 12];
};

/**
 * 获取年份干支
 * 注意：八字以立春为岁首，此处为简化版，大致判断
 */
const getYearGanzhi = (year, month, day) => {
    // 粗略判断立春（通常在2月4日或5日）
    let effectiveYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
        effectiveYear -= 1;
    }
    const index = (effectiveYear - 4) % 60;
    return {
        str: getGanzhiStr(index >= 0 ? index : index + 60),
        index: index >= 0 ? index : index + 60
    };
};

/**
 * 获取月份干支
 * 基于立春后的节气，此处为简化逻辑：每月一个节气
 */
const getMonthGanzhi = (yearGanzhiIndex, month, day) => {
    // 月干由年干决定（五虎遁）
    // 甲己之年丙作首，乙庚之岁戊为头...
    const yearStemIndex = yearGanzhiIndex % 10;
    let startMonthStem = (yearStemIndex % 5) * 2 + 2;

    // 粗略判断节气月（从寅月开始）
    // 1月: 丑, 2月: 寅 (立春), 3月: 卯, ..., 12月: 子
    // 这里的month是公历
    let monthIndex; // 0 for 寅, 1 for 卯...
    if (month === 2 && day >= 4) monthIndex = 0;
    else if (month === 3 && day >= 6) monthIndex = 1;
    else if (month === 4 && day >= 5) monthIndex = 2;
    else if (month === 5 && day >= 6) monthIndex = 3;
    else if (month === 6 && day >= 6) monthIndex = 4;
    else if (month === 7 && day >= 7) monthIndex = 5;
    else if (month === 8 && day >= 8) monthIndex = 6;
    else if (month === 9 && day >= 8) monthIndex = 7;
    else if (month === 10 && day >= 8) monthIndex = 8;
    else if (month === 11 && day >= 8) monthIndex = 9;
    else if (month === 12 && day >= 7) monthIndex = 10;
    else if (month === 1 && day >= 6) monthIndex = 11;
    else monthIndex = (month + 9) % 12; // 默认逻辑

    const stem = (startMonthStem + monthIndex) % 10;
    const branch = (monthIndex + 2) % 12;

    return TIANGAN[stem] + DIZHI[branch];
};

/**
 * 获取日期干支
 */
const getDayGanzhi = (year, month, day) => {
    const jd = getJulianDay(year, month, day);
    const index = Math.floor(jd + 0.5 + 49) % 60;
    return {
        str: getGanzhiStr(index),
        index: index
    };
};

/**
 * 获取时辰干支
 * @param {number} dayStemIndex 日干索引
 * @param {number} hour 24小时制小时
 */
const getHourGanzhi = (dayStemIndex, hour) => {
    // 地支：23-1 子, 1-3 丑...
    const branchIndex = Math.floor((hour + 1) / 2) % 12;

    // 天干由日干决定（五鼠遁）
    // 甲己还加甲，乙庚丙作初...
    let startHourStem = (dayStemIndex % 5) * 2;
    const stemIndex = (startHourStem + branchIndex) % 10;

    return TIANGAN[stemIndex] + DIZHI[branchIndex];
};

/**
 * 计算完整的八字信息
 */
export const calculateBazi = (birthDateStr, birthTimeStr, longitude) => {
    if (!birthDateStr) {
        return {
            error: true,
            message: '缺失出生日期',
            pillars: ['未知', '未知', '未知', '未知']
        };
    }

    const [year, month, day] = birthDateStr.split('-').map(Number);
    const [origHour, origMinute] = (birthTimeStr || '12:00').split(':').map(Number);

    // 1. 如果有经度，校正为真太阳时 (暂时直接使用公历小时计算)
    let hour = origHour;
    if (longitude) {
        const diff = (longitude - 120) * 4;
        const totalMinutes = origHour * 60 + origMinute + diff;
        hour = Math.floor((totalMinutes + 1440) % 1440 / 60);
    }

    const yearG = getYearGanzhi(year, month, day);
    const monthG = getMonthGanzhi(yearG.index, month, day);
    const dayG = getDayGanzhi(year, month, day);
    const hourG = getHourGanzhi(dayG.index % 10, hour);

    return {
        pillars: [yearG.str, monthG, dayG.str, hourG],
        zodiac: LUNAR_ANIMALS[yearG.index % 12],
        isApproximate: !birthTimeStr || !longitude
    };
};

/**
 * 获取指定日期的月份干支
 */
export const getCurrentMonthGanzhi = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const yearG = getYearGanzhi(year, month, day);
    return getMonthGanzhi(yearG.index, month, day);
};

/**
 * 获取简易八字运势描述
 * @param {Array} pillars 八字四柱 [年, 月, 日, 时]
 */
export const getMonthlyBaziFortune = (pillars) => {
    if (!pillars || pillars.length < 3 || pillars[2] === '未知' || pillars[2].includes('未知')) {
        return {
            summary: '出生日期信息不全，目前的分析仅供参考。建议在设置中完善出生日期、具体时辰及地点。',
            score: 70,
            details: []
        };
    }

    const dayMaster = pillars[2].charAt(0); // 日主
    const currentMonthG = getCurrentMonthGanzhi();

    const elements = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };

    const masterElement = elements[dayMaster];
    // 增加对 currentMonthG 的非空检查
    const monthElement = currentMonthG ? elements[currentMonthG.charAt(0)] : null;

    const relations = {
        '木': { '木': '比劫', '火': '食伤', '土': '财星', '金': '官杀', '水': '印星' },
        '火': { '木': '印星', '火': '比劫', '土': '食伤', '金': '财星', '水': '官杀' },
        '土': { '木': '官杀', '火': '印星', '土': '比劫', '金': '食伤', '水': '财星' },
        '金': { '木': '财星', '火': '官杀', '土': '印星', '金': '比劫', '水': '食伤' },
        '水': { '木': '食伤', '火': '财星', '土': '官杀', '金': '印星', '水': '比劫' }
    };

    // 严谨的空值检查
    if (!masterElement || !monthElement || !relations[masterElement] || !relations[masterElement][monthElement]) {
        return {
            summary: '暂无法分析当前运势，请稍后再试。',
            score: 75,
            relation: '未知',
            dayMaster: dayMaster || '?'
        };
    }

    const relation = relations[masterElement][monthElement];

    const fortuneMap = {
        '比劫': { summary: '本月职场竞争压力较大，但有利于与朋友合伙或寻求帮助。宜守财，不宜盲目投资。', score: 75 },
        '食伤': { summary: '文思泉涌，才华展现之月。利于创意工作与表达，但也容易因言语不慎引起误会。', score: 85 },
        '财星': { summary: '财运走高，偏财亦有小喜。本月目标明确，行动力强，是突破瓶颈的大好时机。', score: 90 },
        '官杀': { summary: '责任加重，可能感到一定的精神压力。职场上易受上司关注，也容易招惹是非，宜稳扎稳打。', score: 70 },
        '印星': { summary: '贵人相助，学习力强。本月心境平和，适合深造、签约或处理房产等长远事务。', score: 88 }
    };

    return {
        summary: fortuneMap[relation]?.summary || '本月运势平稳，适合按部就班。',
        score: fortuneMap[relation]?.score || 80,
        relation,
        dayMaster,
        masterElement,
        monthGanzhi: currentMonthG
    };
};

/**
 * 阴阳历转换 (简化版)
 */
export const solarToLunarDescription = (dateStr) => {
    if (!dateStr) return '未知';
    const [year, month, day] = dateStr.split('-').map(Number);
    const yearG = getYearGanzhi(year, month, day);
    const animal = LUNAR_ANIMALS[yearG.index % 12];
    return `${yearG.str}${animal}年`;
};
