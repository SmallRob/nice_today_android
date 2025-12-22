/**
 * 八字/历法计算实用工具
 * 包含阴阳历转换、干支计算、真太阳时调整等
 * 使用 lunar-javascript 库提供精确计算
 */

import { Solar, Lunar } from 'lunar-javascript';

/**
 * 计算完整的八字及详细信息
 * @param {string} birthDateStr YYYY-MM-DD
 * @param {string} birthTimeStr HH:mm
 * @param {number} longitude 经度
 */
export const calculateDetailedBazi = (birthDateStr, birthTimeStr, longitude) => {
    if (!birthDateStr) return null;

    const [year, month, day] = birthDateStr.split('-').map(Number);
    const [hour, minute] = (birthTimeStr || '12:00').split(':').map(Number);

    // 1. 创建公历对象
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);

    // 2. 转换为农历对象 (lunar-javascript 会自动处理节气等八字计算)
    let lunar = solar.getLunar();

    // 3. 如果有经度，使用真太阳时获取更准确的八字
    if (longitude !== undefined && longitude !== null) {
        // 简单真太阳时调整逻辑 (120度为基准)
        // 经度差1度 = 4分钟
        const offsetMinutes = (longitude - 120) * 4;

        // 手动调整时间戳
        const newDate = new Date(year, month - 1, day, hour, minute);
        newDate.setMinutes(newDate.getMinutes() + offsetMinutes);

        const adjustSolar = Solar.fromDate(newDate);
        lunar = adjustSolar.getLunar();
    }

    const eightChar = lunar.getEightChar();

    // 获取详细信息
    return {
        solar: {
            year: solar.getYear(),
            month: solar.getMonth(),
            day: solar.getDay(),
            hour: solar.getHour(),
            minute: solar.getMinute(),
            text: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`
        },
        lunar: {
            yearStr: lunar.getYearInGanZhi() + '年', // 辛丑年
            monthStr: lunar.getMonthInChinese() + '月', // 八月
            dayStr: lunar.getDayInChinese(), // 初四
            text: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
        },
        bazi: {
            year: eightChar.getYear(), // 辛丑
            month: eightChar.getMonth(), // 丁酉
            day: eightChar.getDay(), // 辛酉
            hour: eightChar.getTime(), // 己亥
            text: `${eightChar.getYear()} ${eightChar.getMonth()} ${eightChar.getDay()} ${eightChar.getTime()}`
        },
        wuxing: {
            year: eightChar.getYearWuXing(), // 金土
            month: eightChar.getMonthWuXing(), // 火金
            day: eightChar.getDayWuXing(), // 金金
            hour: eightChar.getTimeWuXing(), // 土水
            text: `${eightChar.getYearWuXing()} ${eightChar.getMonthWuXing()} ${eightChar.getDayWuXing()} ${eightChar.getTimeWuXing()}`
        },
        nayin: {
            year: eightChar.getYearNaYin(), // 壁上土
            month: eightChar.getMonthNaYin(), // 山下火
            day: eightChar.getDayNaYin(), // 石榴木
            hour: eightChar.getTimeNaYin(), // 平地木
            text: `${eightChar.getYearNaYin()} ${eightChar.getMonthNaYin()} ${eightChar.getDayNaYin()} ${eightChar.getTimeNaYin()}`
        },
        shichen: {
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            ganzhi: lunar.getTimeInGanZhi() // 亥时 or 己亥，注意 lunar库 timeInGanZhi 返回可能是 己亥
        },
        full: lunar
    };
};

/**
 * 保持兼容的旧接口: 计算八字
 * @deprecated 建议使用 calculateDetailedBazi
 */
export const calculateBazi = (birthDateStr, birthTimeStr, longitude) => {
    if (!birthDateStr) {
        return {
            error: true,
            message: '缺失出生日期',
            pillars: ['未知', '未知', '未知', '未知']
        };
    }
    const info = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);

    return {
        pillars: [info.bazi.year, info.bazi.month, info.bazi.day, info.bazi.hour],
        zodiac: info.full.getYearShengXiao(), // 生肖
        isApproximate: !birthTimeStr || !longitude
    };
};

/**
 * 保持兼容: 获取指定日期的月份干支
 */
export const getCurrentMonthGanzhi = () => {
    const lunar = Lunar.fromDate(new Date());
    return lunar.getEightChar().getMonth();
};

/**
 * 保持兼容: 获取简易八字运势描述
 */
export const getMonthlyBaziFortune = (pillars) => {
    // 复用之前的逻辑
    if (!pillars || pillars.length < 3 || pillars[2] === '未知' || pillars[2].includes('未知')) {
        return {
            summary: '出生日期信息不全，目前的分析仅供参考。',
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
    const monthElement = currentMonthG ? elements[currentMonthG.charAt(0)] : null;

    const relations = {
        '木': { '木': '比劫', '火': '食伤', '土': '财星', '金': '官杀', '水': '印星' },
        '火': { '木': '印星', '火': '比劫', '土': '食伤', '金': '财星', '水': '官杀' },
        '土': { '木': '官杀', '火': '印星', '土': '比劫', '金': '食伤', '水': '财星' },
        '金': { '木': '财星', '火': '官杀', '土': '印星', '金': '比劫', '水': '食伤' },
        '水': { '木': '食伤', '火': '财星', '土': '官杀', '金': '印星', '水': '比劫' }
    };

    if (!masterElement || !monthElement || !relations[masterElement] || !relations[masterElement][monthElement]) {
        return {
            summary: '暂无法分析当前运势。',
            score: 75,
            relation: '未知',
            dayMaster: dayMaster || '?'
        };
    }

    const relation = relations[masterElement][monthElement];

    const fortuneMap = {
        '比劫': { summary: '本月职场竞争压力较大，但有利于与朋友合伙。宜守财，不宜盲目投资。', score: 75 },
        '食伤': { summary: '文思泉涌，才华展现之月。利于创意工作与表达。', score: 85 },
        '财星': { summary: '财运走高，偏财亦有小喜。是突破瓶颈的大好时机。', score: 90 },
        '官杀': { summary: '责任加重，可能感到一定的精神压力。宜稳扎稳打。', score: 70 },
        '印星': { summary: '贵人相助，学习力强。适合深造、签约。', score: 88 }
    };

    return {
        summary: fortuneMap[relation]?.summary || '本月运势平稳。',
        score: fortuneMap[relation]?.score || 80,
        relation,
        dayMaster,
        masterElement,
        monthGanzhi: currentMonthG
    };
};

/**
 * 保持兼容: 阴阳历转换描述
 */
export const solarToLunarDescription = (dateStr) => {
    if (!dateStr) return '未知';
    const [year, month, day] = dateStr.split('-').map(Number);
    const lunar = Solar.fromYmd(year, month, day).getLunar();
    return `${lunar.getYearInGanZhi()}${lunar.getYearShengXiao()}年`;
};
