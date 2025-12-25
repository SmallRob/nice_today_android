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
    
    // 验证输入参数
    if (!birthDateStr || typeof birthDateStr !== 'string') {
        throw new Error('出生日期格式错误');
    }
    
    if (birthDateStr && !/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthDateStr)) {
        throw new Error('出生日期格式错误');
    }

    const dateParts = birthDateStr.split('-');
    if (dateParts.length !== 3) {
        throw new Error('出生日期格式错误');
    }
    
    const [year, month, day] = dateParts.map(Number);
    
    // 验证日期有效性
    if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error('出生日期格式错误');
    }

    const timeParts = (birthTimeStr || '12:00').split(':');
    if (timeParts.length !== 2) {
        throw new Error('出生时间格式错误');
    }
    const [hour, minute] = timeParts.map(Number);
    
    // 验证时间有效性
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error('出生时间格式错误');
    }

    let solar;
    try {
        // 1. 创建公历对象
        solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    } catch (error) {
        throw new Error('无效的日期或时间');
    }

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
 * 获取指定日期的月份干支
 * @param {Date} date 日期对象
 * @returns {string} 月份干支
 */
export const getMonthGanzhi = (date = new Date()) => {
    const lunar = Lunar.fromDate(date);
    return lunar.getEightChar().getMonth();
};

/**
 * 保持兼容: 获取当前月份干支
 */
export const getCurrentMonthGanzhi = () => {
    return getMonthGanzhi(new Date());
};

/**
 * 获取指定月份的八字运势描述
 * @param {Array} pillars 八字四柱
 * @param {Date} targetDate 目标日期（默认为当前日期）
 * @returns {Object} 运势信息
 */
export const getMonthlyBaziFortune = (pillars, targetDate = new Date()) => {
    // 复用之前的逻辑
    if (!pillars || pillars.length < 3 || pillars[2] === '未知' || pillars[2].includes('未知')) {
        return {
            summary: '出生日期信息不全，目前的分析仅供参考。',
            score: 70,
            relation: '未知',
            dayMaster: '?',
            masterElement: '未知',
            monthGanzhi: '未知',
            monthText: '未知月份'
        };
    }

    const dayMaster = pillars[2].charAt(0); // 日主
    const targetMonthG = getMonthGanzhi(targetDate);
    
    // 获取月份名称
    const lunar = Lunar.fromDate(targetDate);
    const monthText = `${lunar.getMonthInChinese()}月`;

    const elements = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };

    const masterElement = elements[dayMaster];
    const monthElement = targetMonthG ? elements[targetMonthG.charAt(0)] : null;

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
            dayMaster: dayMaster || '?',
            masterElement: masterElement || '未知',
            monthGanzhi: targetMonthG || '未知',
            monthText
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
        monthGanzhi: targetMonthG,
        monthText
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

/**
 * 计算流年大运
 * @param {Object} baziData 八字数据
 * @param {number} targetYear 目标年份
 * @returns {Object} 流年运势信息
 */
export const calculateLiuNianDaYun = (baziData, targetYear = new Date().getFullYear()) => {
    if (!baziData || !baziData.bazi) {
        return null;
    }

    // 获取流年干支
    const solar = Solar.fromYmd(targetYear, 1, 1);
    const lunar = solar.getLunar();
    const yearGanZhi = lunar.getYearInGanZhi(); // 如"乙巳"

    // 解析八字五行信息
    const dayMaster = baziData.bazi.day.charAt(0); // 日主（日干）
    const dayBranch = baziData.bazi.day.charAt(1); // 日支

    // 五行对应表
    const wuxingMap = {
        '甲': '木', '乙': '木', '寅': '木', '卯': '木',
        '丙': '火', '丁': '火', '巳': '火', '午': '火',
        '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
        '庚': '金', '辛': '金', '申': '金', '酉': '金',
        '壬': '水', '癸': '水', '亥': '水', '子': '水'
    };

    // 获取日主五行
    const dayMasterElement = wuxingMap[dayMaster] || '未知';

    // 获取流年天干地支五行
    const liuNianGan = yearGanZhi.charAt(0);
    const liuNianBranch = yearGanZhi.charAt(1);
    const liuNianGanElement = wuxingMap[liuNianGan];
    const liuNianBranchElement = wuxingMap[liuNianBranch];

    // 五行生克关系
    const wuxingRelations = {
        '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
        '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
        '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
        '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
        '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
    };

    // 分析流年与日主的关系
    const getRelation = (element1, element2) => {
        if (element1 === element2) return '比劫'; // 同为比劫
        if (wuxingRelations[element1]['生'] === element2) return '食伤'; // 我生者为食伤
        if (wuxingRelations[element1]['克'] === element2) return '财星'; // 我克者为财星
        if (wuxingRelations[element1]['被克'] === element2) return '官杀'; // 克我者为官杀
        if (wuxingRelations[element1]['被生'] === element2) return '印星'; // 生我者为印星
        return '未知';
    };

    const ganRelation = getRelation(dayMasterElement, liuNianGanElement);
    const branchRelation = getRelation(dayMasterElement, liuNianBranchElement);

    // 各维度关系映射
    const dimensionRelations = {
        love: ['食伤', '财星', '比劫'], // 爱情多受食伤财星比劫影响
        career: ['官杀', '印星', '财星'], // 事业多受官杀印星财星影响
        study: ['印星', '食伤', '官杀'], // 学习多受印星食伤官杀影响
        health: ['比劫', '印星', '食伤'], // 健康多受比劫印星食伤影响
        wealth: ['财星', '食伤', '官杀'], // 财运多受财星食伤官杀影响
        social: ['比劫', '食伤', '印星'] // 人际多受比劫食伤印星影响
    };

    const calculateDimensionScore = (dimension) => {
        const relations = dimensionRelations[dimension] || [];
        const baseScore = 70;
        let bonus = 0;

        // 根据流年天干和地支关系加分
        relations.forEach(rel => {
            if (ganRelation === rel) bonus += 10;
            if (branchRelation === rel) bonus += 8;
        });

        // 同一五行加分
        if (ganRelation === '比劫' || branchRelation === '比劫') bonus += 5;

        // 随机波动（基于年份）
        const random = ((targetYear * 7 + targetYear % 11) % 15) - 7;

        return Math.min(100, Math.max(40, baseScore + bonus + random));
    };

    // 生成各维度运势
    const generateDimensionFortune = (dimension, score) => {
        const descriptions = {
            love: {
                high: '桃花运旺盛，单身者有望邂逅良缘，有伴侣者感情升温。',
                mid: '感情平稳，适合与伴侣增进了解，共同规划未来。',
                low: '感情运势一般，宜低调处理感情问题，多沟通少争执。'
            },
            career: {
                high: '事业运势强劲，有晋升机会或获得贵人相助，可大胆行动。',
                mid: '工作状态平稳，按部就班推进项目，积累经验。',
                low: '工作压力较大，宜保持低调，避免冲动决策，稳扎稳打。'
            },
            study: {
                high: '思维活跃，记忆力佳，适合学习新知识或考证深造。',
                mid: '学习状态平稳，按计划进行会有不错的收获。',
                low: '注意力易分散，需要更多耐心和专注，循序渐进。'
            },
            health: {
                high: '精力充沛，身体状态良好，适合运动锻炼，保持健康。',
                mid: '身体状况稳定，注意规律作息，均衡饮食。',
                low: '注意休息，避免过度劳累，关注小病小痛，预防为主。'
            },
            wealth: {
                high: '财运亨通，有投资机会，但需谨慎选择，理性分析。',
                mid: '财运平稳，适合保守理财，稳健投资。',
                low: '财运一般，宜减少不必要开支，避免冒险投资。'
            },
            social: {
                high: '人缘极佳，社交活动频繁，结识良友或获得贵人相助。',
                mid: '人际关系和谐，适度社交有助于拓展人脉。',
                low: '社交运势一般，宜保持低调，避免人际冲突，专注自我。'
            }
        };

        const advice = {
            love: {
                high: '积极社交，把握良机',
                mid: '保持真诚，耐心经营',
                low: '低调处理，避免争执'
            },
            career: {
                high: '展现能力，争取机会',
                mid: '稳步前进，积累经验',
                low: '低调行事，谨言慎行'
            },
            study: {
                high: '制定计划，全力以赴',
                mid: '坚持学习，温故知新',
                low: '调整状态，循序渐进'
            },
            health: {
                high: '保持运动，养生保健',
                mid: '规律作息，均衡饮食',
                low: '注意休息，预防疾病'
            },
            wealth: {
                high: '把握机遇，理性投资',
                mid: '稳健理财，控制消费',
                low: '节省开支，避免借贷'
            },
            social: {
                high: '广结善缘，真诚待人',
                mid: '适度社交，拓展人脉',
                low: '保持低调，避免冲突'
            }
        };

        let level = 'mid';
        if (score >= 80) level = 'high';
        else if (score < 60) level = 'low';

        return {
            score,
            level,
            description: descriptions[dimension][level],
            advice: advice[dimension][level]
        };
    };

    // 生成流年整体运势
    const generateOverallFortune = () => {
        const scores = [
            calculateDimensionScore('love'),
            calculateDimensionScore('career'),
            calculateDimensionScore('study'),
            calculateDimensionScore('health'),
            calculateDimensionScore('wealth'),
            calculateDimensionScore('social')
        ];
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        const overallDescriptions = {
            high: `今年是${yearGanZhi}年，流年运势总体向好。把握机遇，积极行动，会有不错的发展。`,
            mid: `今年是${yearGanZhi}年，流年运势平稳。保持耐心，稳步前进，稳中求进。`,
            low: `今年是${yearGanZhi}年，流年运势有起伏。需谨慎行事，避免冲动，稳扎稳打。`
        };

        const level = avgScore >= 80 ? 'high' : avgScore < 60 ? 'low' : 'mid';

        return {
            score: avgScore,
            level,
            description: overallDescriptions[level],
            yearGanZhi,
            yearShengXiao: lunar.getYearShengXiao()
        };
    };

    // 生成注意事项提醒
    const generateReminders = () => {
        const reminders = [];
        const loveScore = calculateDimensionScore('love');
        const careerScore = calculateDimensionScore('career');
        const healthScore = calculateDimensionScore('health');
        const wealthScore = calculateDimensionScore('wealth');
        const socialScore = calculateDimensionScore('social');

        if (loveScore < 60) {
            reminders.push({
                type: 'warning',
                icon: '💔',
                text: '感情运势偏弱，避免因小事引发争执，保持平和心态。'
            });
        }
        if (careerScore >= 80) {
            reminders.push({
                type: 'success',
                icon: '💼',
                text: '事业运势强劲，可主动争取机会，展现能力。'
            });
        }
        if (healthScore < 60) {
            reminders.push({
                type: 'warning',
                icon: '🏥',
                text: '注意身体健康，避免过度劳累，定期体检。'
            });
        }
        if (wealthScore >= 80) {
            reminders.push({
                type: 'success',
                icon: '💰',
                text: '财运亨通，投资需谨慎，理性分析风险。'
            });
        }
        if (wealthScore < 60) {
            reminders.push({
                type: 'warning',
                icon: '💸',
                text: '财运一般，控制开支，避免高风险投资。'
            });
        }
        if (socialScore >= 80) {
            reminders.push({
                type: 'success',
                icon: '🤝',
                text: '人缘极佳，广结善缘，贵人相助机会增多。'
            });
        }
        if (socialScore < 60) {
            reminders.push({
                type: 'warning',
                icon: '👥',
                text: '社交运势一般，宜低调行事，避免人际冲突。'
            });
        }

        // 基于五行的通用提醒
        if (ganRelation === '官杀' || branchRelation === '官杀') {
            reminders.push({
                type: 'info',
                icon: '⚖️',
                text: '今年压力可能较大，注意调节情绪，劳逸结合。'
            });
        }
        if (ganRelation === '比劫' || branchRelation === '比劫') {
            reminders.push({
                type: 'info',
                icon: '🤝',
                text: '今年适合团队合作，但需注意守财，避免冲动消费。'
            });
        }
        if (ganRelation === '印星' || branchRelation === '印星') {
            reminders.push({
                type: 'info',
                icon: '📚',
                text: '贵人相助，学习力强，适合深造进修。'
            });
        }

        return reminders;
    };

    return {
        overall: generateOverallFortune(),
        love: generateDimensionFortune('love', calculateDimensionScore('love')),
        career: generateDimensionFortune('career', calculateDimensionScore('career')),
        study: generateDimensionFortune('study', calculateDimensionScore('study')),
        health: generateDimensionFortune('health', calculateDimensionScore('health')),
        wealth: generateDimensionFortune('wealth', calculateDimensionScore('wealth')),
        social: generateDimensionFortune('social', calculateDimensionScore('social')),
        reminders: generateReminders(),
        dayMaster: dayMaster,
        dayMasterElement: dayMasterElement,
        liuNianGanZhi: yearGanZhi,
        liuNianGan: liuNianGan,
        liuNianBranch: liuNianBranch,
        liuNianGanElement: liuNianGanElement,
        liuNianBranchElement: liuNianBranchElement,
        ganRelation: ganRelation,
        branchRelation: branchRelation,
        year: targetYear
    };
};

/**
 * 计算今日能量提示（基于当日五行信息结合用户八字动态计算）
 * @param {Object} baziData 八字数据
 * @param {Date} targetDate 目标日期（默认为今天）
 * @returns {Object} 今日能量提示信息
 */
export const calculateDailyEnergy = (baziData, targetDate = new Date()) => {
    if (!baziData || !baziData.bazi) {
        // 返回默认值
        return {
            overallScore: 75,
            description: '今天能量平稳，适合处理日常事务和规划未来。保持耐心，稳步前进。',
            suggestions: [
                { icon: '🎤', label: '积极工作', type: 'good' }
            ],
            attentions: [
                { icon: '💰', label: '谨慎消费', type: 'warning' }
            ],
            dailyWuxing: {
                gan: '未知',
                ganElement: '未知',
                branch: '未知',
                branchElement: '未知',
                ganzhi: '未知'
            }
        };
    }

    // 获取当日干支
    const solar = Solar.fromDate(targetDate);
    const lunar = solar.getLunar();
    const dayGanZhi = lunar.getDayInGanZhi(); // 当日日柱干支

    // 解析八字五行信息
    const dayMaster = baziData.bazi.day.charAt(0); // 日主（日干）
    
    // 五行对应表
    const wuxingMap = {
        '甲': '木', '乙': '木', '寅': '木', '卯': '木',
        '丙': '火', '丁': '火', '巳': '火', '午': '火',
        '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
        '庚': '金', '辛': '金', '申': '金', '酉': '金',
        '壬': '水', '癸': '水', '亥': '水', '子': '水'
    };

    // 获取日主五行
    const dayMasterElement = wuxingMap[dayMaster] || '未知';

    // 获取当日天干地支五行
    const dailyGan = dayGanZhi.charAt(0);
    const dailyBranch = dayGanZhi.charAt(1);
    const dailyGanElement = wuxingMap[dailyGan];
    const dailyBranchElement = wuxingMap[dailyBranch];

    // 五行生克关系
    const wuxingRelations = {
        '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
        '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
        '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
        '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
        '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
    };

    // 分析当日与日主的关系
    const getRelation = (element1, element2) => {
        if (element1 === element2) return '比劫';
        if (wuxingRelations[element1]['生'] === element2) return '食伤';
        if (wuxingRelations[element1]['克'] === element2) return '财星';
        if (wuxingRelations[element1]['被克'] === element2) return '官杀';
        if (wuxingRelations[element1]['被生'] === element2) return '印星';
        return '未知';
    };

    const ganRelation = getRelation(dayMasterElement, dailyGanElement);
    const branchRelation = getRelation(dayMasterElement, dailyBranchElement);

    // 计算今日综合能量分数
    const relationScores = {
        '比劫': 75,
        '食伤': 85,
        '财星': 90,
        '官杀': 65,
        '印星': 80
    };

    let energyScore = (relationScores[ganRelation] || 75 + relationScores[branchRelation] || 75) / 2;

    // 根据关系添加额外分数
    if (ganRelation === branchRelation) energyScore += 5; // 天地同气
    if (dayMasterElement === dailyGanElement) energyScore += 3; // 天干同五行
    if (dayMasterElement === dailyBranchElement) energyScore += 3; // 地支同五行

    // 基于日期添加随机波动（固定算法，保证同一天相同结果）
    const dateSeed = targetDate.getFullYear() * 10000 + (targetDate.getMonth() + 1) * 100 + targetDate.getDate();
    const random = ((dateSeed * 3 + dateSeed % 7) % 10) - 5;
    energyScore = Math.min(100, Math.max(40, energyScore + random));

    // 生成今日运势描述
    const getEnergyDescription = (score, relation) => {
        const descriptions = {
            '比劫': '今天能量适中，适合与人合作、结交朋友。保持平和心态，稳步前进。',
            '食伤': '今天能量充沛，灵感迸发，适合创意工作和自我表达。',
            '财星': '今天财运不错，适合处理财务事务和商业活动。',
            '官杀': '今天可能有一定压力，适合处理重要决策，保持理性思考。',
            '印星': '今天贵人相助，适合学习进修和规划未来。'
        };
        
        const scoreDescriptions = score >= 60
            ? '今天能量充沛，适合开展新的计划，把握机遇。保持积极心态，会有不错的收获。'
            : '今天相对平静，适合处理日常事务和规划未来。保持耐心，稳步前进。';
            
        return score >= 60 ? descriptions[relation] || scoreDescriptions : scoreDescriptions;
    };

    // 生成建议（根据关系和分数）
    const generateSuggestions = (score, relation) => {
        const suggestions = [];
        
        // 基本建议
        if (score >= 60) {
            suggestions.push({ icon: '🎤', label: '积极工作', type: 'good' });
        }
        
        // 根据关系添加特定建议
        const relationSuggestions = {
            '比劫': [
                { icon: '🤝', label: '团队合作', type: 'good' },
                { icon: '🎯', label: '设定目标', type: 'good' }
            ],
            '食伤': [
                { icon: '🎨', label: '发挥创意', type: 'good' },
                { icon: '📝', label: '记录灵感', type: 'good' }
            ],
            '财星': [
                { icon: '💼', label: '把握商机', type: 'good' },
                { icon: '📊', label: '理性投资', type: 'good' }
            ],
            '官杀': [
                { icon: '⚖️', label: '处理决策', type: 'good' },
                { icon: '📋', label: '制定计划', type: 'good' }
            ],
            '印星': [
                { icon: '📚', label: '学习进修', type: 'good' },
                { icon: '🧘', label: '静心思考', type: 'good' }
            ]
        };
        
        if (relationSuggestions[relation]) {
            suggestions.push(...relationSuggestions[relation].slice(0, 2));
        }
        
        return suggestions.slice(0, 2);
    };

    // 生成注意事项（根据关系和分数）
    const generateAttentions = (score, relation) => {
        const attentions = [];
        
        // 基本注意事项
        if (score < 60) {
            attentions.push({ icon: '💰', label: '谨慎消费', type: 'warning' });
        }
        
        // 根据关系添加特定注意事项
        const relationAttentions = {
            '比劫': [
                { icon: '💳', label: '避免冲动消费', type: 'warning' }
            ],
            '食伤': [
                { icon: '⚠️', label: '避免过度冒险', type: 'warning' }
            ],
            '财星': [
                { icon: '🎲', label: '谨慎投资', type: 'warning' }
            ],
            '官杀': [
                { icon: '😰', label: '注意情绪调节', type: 'warning' }
            ],
            '印星': [
                { icon: '😴', label: '避免过度劳累', type: 'warning' }
            ]
        };
        
        if (relationAttentions[relation]) {
            attentions.push(...relationAttentions[relation].slice(0, 2));
        }
        
        return attentions.slice(0, 2);
    };

    return {
        overallScore: Math.round(energyScore),
        description: getEnergyDescription(energyScore, ganRelation),
        suggestions: generateSuggestions(energyScore, ganRelation),
        attentions: generateAttentions(energyScore, ganRelation),
        dailyWuxing: {
            gan: dailyGan,
            ganElement: dailyGanElement,
            branch: dailyBranch,
            branchElement: dailyBranchElement,
            ganzhi: dayGanZhi,
            relation: ganRelation
        }
    };
};
