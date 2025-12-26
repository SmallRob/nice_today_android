/**
 * 八字数据标准模式（Schema）
 * 统一的八字数据结构，兼容所有取值计算的地方
 * 涵盖阴阳历日期、八字四柱、真太阳时、出生时辰、经纬度等信息
 */

import { Solar, Lunar } from 'lunar-javascript';
import { calculateLunarDate, calculateTrueSolarTime } from './LunarCalendarHelper';

/**
 * 八字数据版本号（用于数据迁移和兼容性）
 */
export const BAZI_DATA_VERSION = '1.0.0';

/**
 * 默认值常量
 */
export const DEFAULT_VALUES = {
  BIRTH_TIME: '12:30',
  LONGITUDE: 116.40,
  LATITUDE: 39.90,
  TIMEZONE: 'Asia/Shanghai'
};

/**
 * 标准八字数据结构（Schema）
 *
 * @typedef {Object} StandardBaziData
 * @property {Object} meta - 元数据
 * @property {string} meta.version - 数据版本号
 * @property {string} meta.calculatedAt - 计算时间（ISO 8601格式）
 * @property {string} [meta.dataSource] - 数据来源（'calculate'|'cache'|'storage'）
 * @property {string} [meta.nickname] - 用户昵称
 *
 * @property {Object} birth - 出生信息
 * @property {Object} birth.solar - 公历出生信息
 * @property {number} birth.solar.year - 公历年份
 * @property {number} birth.solar.month - 公历月份（1-12）
 * @property {number} birth.solar.day - 公历日期（1-31）
 * @property {number} birth.solar.hour - 公历小时（0-23）
 * @property {number} birth.solar.minute - 公历分钟（0-59）
 * @property {number} birth.solar.weekday - 星期（0-6，0=周日）
 * @property {string} birth.solar.zodiac - 西方星座
 * @property {string} birth.solar.text - 公历日期文本（如：1991年4月30日）
 * @property {string} birth.solar.fullDate - 完整公历日期（YYYY-MM-DD）
 * @property {string} birth.solar.fullTime - 完整公历时间（HH:mm:ss）
 * @property {string} birth.solar.fullDateTime - 完整公历日期时间（YYYY-MM-DD HH:mm:ss）
 *
 * @property {Object} birth.lunar - 农历出生信息
 * @property {number} birth.lunar.year - 农历年份数字（如1991）
 * @property {string} birth.lunar.yearInChinese - 农历年份中文（如辛未年）
 * @property {string} birth.lunar.yearGanZhi - 年柱干支（如辛未）
 * @property {number} birth.lunar.month - 农历月份数字（1-12）
 * @property {string} birth.lunar.monthInChinese - 农历月份中文（如三月）
 * @property {string} birth.lunar.monthGanZhi - 月柱干支（如壬辰）
 * @property {string} birth.lunar.isLeapMonth - 是否闰月
 * @property {number} birth.lunar.day - 农历日期数字（1-30）
 * @property {string} birth.lunar.dayInChinese - 农历日期中文（如初七）
 * @property {string} birth.lunar.dayGanZhi - 日柱干支（如乙巳）
 * @property {string} birth.lunar.zodiacAnimal - 生肖（如羊）
 * @property {string} birth.lunar.text - 农历日期文本（如辛未年三月初七）
 * @property {string} birth.lunar.fullText - 完整农历文本（如辛未年三月初七 羊）
 * @property {string} birth.lunar.shortText - 简短农历文本（如三月初七）
 *
 * @property {Object} birth.location - 出生地点
 * @property {number} birth.location.longitude - 经度（-180到180）
 * @property {number} birth.location.latitude - 纬度（-90到90）
 * @property {string} [birth.location.province] - 省份
 * @property {string} [birth.location.city] - 城市
 * @property {string} [birth.location.district] - 区县
 * @property {string} birth.location.text - 地点文本（如：北京市东城区）
 *
 * @property {Object} birth.time - 出生时间信息
 * @property {string} birth.time.original - 原始出生时间（HH:mm）
 * @property {string} birth.time.solarTime - 真太阳时（HH:mm）
 * @property {string} birth.time.shichen - 时辰（如：申时）
 * @property {string} birth.time.shichenGanZhi - 时辰干支（如：壬申）
 * @property {string} birth.time.shichenIndex - 时辰索引（0-11）
 * @property {string} birth.time.text - 时间文本（如：12:30 申时）
 *
 * @property {Object} bazi - 八字四柱
 * @property {Object} bazi.year - 年柱
 * @property {string} bazi.year.ganZhi - 干支（如辛未）
 * @property {string} bazi.year.gan - 天干（如辛）
 * @property {string} bazi.year.zhi - 地支（如未）
 * @property {string} bazi.year.wuXing - 五行（如土）
 * @property {string} bazi.year.naYin - 纳音（如壁上土）
 * @property {Object} bazi.month - 月柱
 * @property {Object} bazi.day - 日柱
 * @property {Object} bazi.hour - 时柱
 * @property {string} bazi.text - 八字文本（如辛未 壬辰 乙巳 壬申）
 *
 * @property {Object} wuXing - 五行信息
 * @property {string} wuXing.year - 年柱五行（如土）
 * @property {string} wuXing.month - 月柱五行（如水）
 * @property {string} wuXing.day - 日柱五行（如火）
 * @property {string} wuXing.hour - 时柱五行（如金）
 * @property {string} wuXing.text - 五行文本（如土 水 火 金）
 * @property {Object} wuXing.counts - 五行计数
 * @property {number} wuXing.counts.木 - 木的数量
 * @property {number} wuXing.counts.火 - 火的数量
 * @property {number} wuXing.counts.土 - 土的数量
 * @property {number} wuXing.counts.金 - 金的数量
 * @property {number} wuXing.counts.水 - 水的数量
 * @property {string} wuXing.elementArray - 五行数组（按数量排序）
 * @property {string} wuXing.dominantElement - 主导五行
 * @property {string} wuXing.missingElements - 缺失五行（数组）
 *
 * @property {Object} naYin - 纳音信息
 * @property {string} naYin.year - 年柱纳音（如壁上土）
 * @property {string} naYin.month - 月柱纳音（如长流水）
 * @property {string} naYin.day - 日柱纳音（如覆灯火）
 * @property {string} naYin.hour - 时柱纳音（如剑锋金）
 * @property {string} naYin.text - 纳音文本（如壁上土 长流水 覆灯火 剑锋金）
 *
 * @property {Object} dayMaster - 日主信息
 * @property {string} dayMaster.gan - 日干（如乙）
 * @property {string} dayMaster.zhi - 日支（如巳）
 * @property {string} dayMaster.ganZhi - 日柱干支（如乙巳）
 * @property {string} dayMaster.element - 日主五行（如火）
 * @property {string} dayMaster.yangYin - 日主阴阳（阳或阴）
 * @property {Object} dayMaster.strength - 日主强弱
 * @property {string} dayMaster.strength.type - 强弱类型（如'偏强'）
 * @property {number} dayMaster.strength.score - 强弱分数（0-100）
 * @property {string} [dayMaster.luckyElement] - 喜用神
 * @property {string} [dayMaster.unluckyElement] - 忌神
 *
 * @property {Object} analysis - 八字分析
 * @property {string} analysis.fortuneType - 命格类型（如八字偏强、八字偏弱）
 * @property {string} analysis.luckyElement - 喜用神
 * @property {string} analysis.description - 命格描述
 * @property {Array} [analysis.advice] - 命理建议
 *
 * @property {Object} lunar - 完整农历对象（lunar-javascript库的原始对象）
 * @property {Object} solar - 完整公历对象（lunar-javascript库的原始对象）
 *
 * @property {string} [birthDate] - 公历出生日期（YYYY-MM-DD，兼容旧版）
 * @property {string} [birthTime] - 公历出生时间（HH:mm，兼容旧版）
 * @property {string} [lunarBirthDate] - 农历出生日期（兼容旧版）
 * @property {string} [trueSolarTime] - 真太阳时（兼容旧版）
 */

/**
 * 创建标准八字数据对象
 * @param {Object} params - 参数
 * @param {string} params.birthDate - 公历出生日期（YYYY-MM-DD）
 * @param {string} params.birthTime - 公历出生时间（HH:mm）
 * @param {Object} params.birthLocation - 出生地点
 * @param {number} params.birthLocation.lng - 经度
 * @param {number} params.birthLocation.lat - 纬度
 * @param {string} [params.birthLocation.province] - 省份
 * @param {string} [params.birthLocation.city] - 城市
 * @param {string} [params.birthLocation.district] - 区县
 * @param {string} [params.nickname] - 用户昵称
 * @returns {StandardBaziData} 标准八字数据对象
 */
export const createStandardBaziData = (params) => {
  const {
    birthDate,
    birthTime = DEFAULT_VALUES.BIRTH_TIME,
    birthLocation,
    nickname
  } = params || {};

  // 验证必要参数
  if (!birthDate) {
    throw new Error('出生日期不能为空');
  }

  // 解析公历日期
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  // 获取经纬度
  const longitude = birthLocation?.lng ?? DEFAULT_VALUES.LONGITUDE;
  const latitude = birthLocation?.lat ?? DEFAULT_VALUES.LATITUDE;

  // 创建公历对象
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 计算真太阳时
  const trueSolarTime = calculateTrueSolarTime(birthDate, birthTime, longitude);
  const [trueHour, trueMinute] = trueSolarTime.split(':').map(Number);

  // 使用真太阳时调整
  const adjustSolar = Solar.fromYmdHms(year, month, day, trueHour, trueMinute, 0);
  const adjustLunar = adjustSolar.getLunar();
  const adjustEightChar = adjustLunar.getEightChar();

  // 计算星座
  const zodiacSigns = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
    '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座'];
  const zodiacDays = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  const zodiacIndex = (month - 1 + (day >= zodiacDays[month - 1] ? 0 : 11)) % 12;
  const zodiacSign = zodiacSigns[zodiacIndex];

  // 计算时辰
  const shichenIndex = Math.floor((trueHour + 1) / 2) % 12;
  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 计算时辰天干（根据年干）
  const yearGan = eightChar.getYear().charAt(0);
  const yearGanIndex = tianGan.indexOf(yearGan);
  const shichenGan = tianGan[(yearGanIndex + shichenIndex) % 10];
  const shichenZhi = diZhi[shichenIndex];

  // 获取五行映射
  const wuxingMap = {
    '甲': '木', '乙': '木', '寅': '木', '卯': '木',
    '丙': '火', '丁': '火', '巳': '火', '午': '火',
    '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '庚': '金', '辛': '金', '申': '金', '酉': '金',
    '壬': '水', '癸': '水', '亥': '水', '子': '水'
  };

  // 统计五行数量
  const wuxingCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  ['year', 'month', 'day', 'hour'].forEach(pillar => {
    const pillarGanzhi = eightChar[pillar === 'year' ? 'getYear' : pillar === 'month' ? 'getMonth' : pillar === 'day' ? 'getDay' : 'getTime']();
    pillarGanzhi.split('').forEach(char => {
      const element = wuxingMap[char];
      if (element) {
        wuxingCounts[element]++;
      }
    });
  });

  // 找出主导五行和缺失五行
  const maxCount = Math.max(...Object.values(wuxingCounts));
  const dominantElement = Object.keys(wuxingCounts).find(e => wuxingCounts[e] === maxCount);
  const missingElements = Object.keys(wuxingCounts).filter(e => wuxingCounts[e] === 0);

  // 日主信息
  const dayGan = eightChar.getDay().charAt(0);
  const dayZhi = eightChar.getDay().charAt(1);
  const dayMasterElement = wuxingMap[dayGan] || '未知';
  const yangGan = ['甲', '丙', '戊', '庚', '壬'].includes(dayGan) ? '阳' : '阴';

  // 计算日主强弱（简化版）
  let strengthType = '中和';
  let strengthScore = 50;
  const sameTypeCount = wuxingCounts[dayMasterElement];
  const totalCount = Object.values(wuxingCounts).reduce((a, b) => a + b, 0);

  if (sameTypeCount > totalCount / 2) {
    strengthType = '偏强';
    strengthScore = 70;
  } else if (sameTypeCount < totalCount / 4) {
    strengthType = '偏弱';
    strengthScore = 30;
  }

  // 构建标准八字数据对象
  const standardData = {
    // 元数据
    meta: {
      version: BAZI_DATA_VERSION,
      calculatedAt: new Date().toISOString(),
      dataSource: 'calculate',
      nickname: nickname || null
    },

    // 出生信息
    birth: {
      // 公历信息
      solar: {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
        hour: solar.getHour(),
        minute: solar.getMinute(),
        weekday: solar.getWeek(),
        zodiac: zodiacSign,
        text: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
        fullDate: birthDate,
        fullTime: `${birthTime}:00`,
        fullDateTime: `${birthDate} ${birthTime}:00`
      },

      // 农历信息
      lunar: {
        year: lunar.getYear(),
        yearInChinese: lunar.getYearInChinese(),
        yearGanZhi: lunar.getYearInGanZhi(),
        month: lunar.getMonth(),
        monthInChinese: lunar.getMonthInChinese(),
        monthGanZhi: lunar.getMonthInGanZhi(),
        isLeapMonth: lunar.getMonth() === lunar.getLeapMonth(),
        day: lunar.getDay(),
        dayInChinese: lunar.getDayInChinese(),
        dayGanZhi: lunar.getDayInGanZhi(),
        zodiacAnimal: lunar.getYearShengXiao(),
        text: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
        fullText: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getYearShengXiao()}`,
        shortText: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
      },

      // 出生地点
      location: {
        longitude: longitude,
        latitude: latitude,
        province: birthLocation?.province || '',
        city: birthLocation?.city || '',
        district: birthLocation?.district || '',
        text: [birthLocation?.province, birthLocation?.city, birthLocation?.district].filter(Boolean).join(' ') ||
          `经度: ${longitude}°, 纬度: ${latitude}°`
      },

      // 出生时间
      time: {
        original: birthTime,
        solarTime: trueSolarTime,
        shichen: `${shichenZhi}时`,
        shichenGanZhi: `${shichenGan}${shichenZhi}`,
        shichenIndex: shichenIndex,
        text: `${trueSolarTime} ${shichenZhi}时`
      }
    },

    // 八字四柱
    bazi: {
      year: {
        ganZhi: adjustEightChar.getYear(),
        gan: adjustEightChar.getYear().charAt(0),
        zhi: adjustEightChar.getYear().charAt(1),
        wuXing: adjustEightChar.getYearWuXing(),
        naYin: adjustEightChar.getYearNaYin()
      },
      month: {
        ganZhi: adjustEightChar.getMonth(),
        gan: adjustEightChar.getMonth().charAt(0),
        zhi: adjustEightChar.getMonth().charAt(1),
        wuXing: adjustEightChar.getMonthWuXing(),
        naYin: adjustEightChar.getMonthNaYin()
      },
      day: {
        ganZhi: adjustEightChar.getDay(),
        gan: adjustEightChar.getDay().charAt(0),
        zhi: adjustEightChar.getDay().charAt(1),
        wuXing: adjustEightChar.getDayWuXing(),
        naYin: adjustEightChar.getDayNaYin()
      },
      hour: {
        ganZhi: adjustEightChar.getTime(),
        gan: adjustEightChar.getTime().charAt(0),
        zhi: adjustEightChar.getTime().charAt(1),
        wuXing: adjustEightChar.getTimeWuXing(),
        naYin: adjustEightChar.getTimeNaYin()
      },
      text: `${adjustEightChar.getYear()} ${adjustEightChar.getMonth()} ${adjustEightChar.getDay()} ${adjustEightChar.getTime()}`
    },

    // 五行信息
    wuXing: {
      year: adjustEightChar.getYearWuXing(),
      month: adjustEightChar.getMonthWuXing(),
      day: adjustEightChar.getDayWuXing(),
      hour: adjustEightChar.getTimeWuXing(),
      text: `${adjustEightChar.getYearWuXing()} ${adjustEightChar.getMonthWuXing()} ${adjustEightChar.getDayWuXing()} ${adjustEightChar.getTimeWuXing()}`,
      counts: wuxingCounts,
      elementArray: Object.keys(wuxingCounts).sort((a, b) => wuxingCounts[b] - wuxingCounts[a]),
      dominantElement: dominantElement,
      missingElements: missingElements
    },

    // 纳音信息
    naYin: {
      year: adjustEightChar.getYearNaYin(),
      month: adjustEightChar.getMonthNaYin(),
      day: adjustEightChar.getDayNaYin(),
      hour: adjustEightChar.getTimeNaYin(),
      text: `${adjustEightChar.getYearNaYin()} ${adjustEightChar.getMonthNaYin()} ${adjustEightChar.getDayNaYin()} ${adjustEightChar.getTimeNaYin()}`
    },

    // 日主信息
    dayMaster: {
      gan: dayGan,
      zhi: dayZhi,
      ganZhi: eightChar.getDay(),
      element: dayMasterElement,
      yangYin: yangGan,
      strength: {
        type: strengthType,
        score: strengthScore
      },
      luckyElement: missingElements.length > 0 ? missingElements[0] : null,
      unluckyElement: dominantElement !== dayMasterElement ? dominantElement : null
    },

    // 八字分析
    analysis: {
      fortuneType: strengthType,
      luckyElement: missingElements.length > 0 ? missingElements[0] : '无特别喜用',
      description: `日主${dayGan}，五行${dayMasterElement}，${strengthType}`
    },

    // 完整对象
    lunar: adjustLunar,
    solar: adjustSolar,

    // 兼容旧版的字段
    birthDate: birthDate,
    birthTime: birthTime,
    lunarBirthDate: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    trueSolarTime: trueSolarTime,

    // 兼容旧版的数据结构（用于兼容性）
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      hour: solar.getHour(),
      minute: solar.getMinute(),
      text: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`
    },
    lunar: {
      yearStr: lunar.getYearInGanZhi() + '年',
      monthStr: lunar.getMonthInChinese() + '月',
      dayStr: lunar.getDayInChinese(),
      text: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    },
    bazi: {
      year: adjustEightChar.getYear(),
      month: adjustEightChar.getMonth(),
      day: adjustEightChar.getDay(),
      hour: adjustEightChar.getTime(),
      text: `${adjustEightChar.getYear()} ${adjustEightChar.getMonth()} ${adjustEightChar.getDay()} ${adjustEightChar.getTime()}`
    },
    wuxing: {
      year: adjustEightChar.getYearWuXing(),
      month: adjustEightChar.getMonthWuXing(),
      day: adjustEightChar.getDayWuXing(),
      hour: adjustEightChar.getTimeWuXing(),
      text: `${adjustEightChar.getYearWuXing()} ${adjustEightChar.getMonthWuXing()} ${adjustEightChar.getDayWuXing()} ${adjustEightChar.getTimeWuXing()}`
    },
    nayin: {
      year: adjustEightChar.getYearNaYin(),
      month: adjustEightChar.getMonthNaYin(),
      day: adjustEightChar.getDayNaYin(),
      hour: adjustEightChar.getTimeNaYin(),
      text: `${adjustEightChar.getYearNaYin()} ${adjustEightChar.getMonthNaYin()} ${adjustEightChar.getDayNaYin()} ${adjustEightChar.getTimeNaYin()}`
    },
    shichen: {
      time: birthTime,
      ganzhi: `${shichenGan}${shichenZhi}`
    },
    // 顶层属性（用于兼容）
    year: adjustEightChar.getYear(),
    month: adjustEightChar.getMonth(),
    day: adjustEightChar.getDay(),
    hour: adjustEightChar.getTime()
  };

  return standardData;
};

/**
 * 从用户配置创建标准八字数据
 * @param {Object} config - 用户配置
 * @returns {StandardBaziData} 标准八字数据对象
 */
export const createBaziFromConfig = (config) => {
  if (!config || !config.birthDate) {
    throw new Error('配置或出生日期为空');
  }

  return createStandardBaziData({
    birthDate: config.birthDate,
    birthTime: config.birthTime || DEFAULT_VALUES.BIRTH_TIME,
    birthLocation: config.birthLocation || {
      lng: DEFAULT_VALUES.LONGITUDE,
      lat: DEFAULT_VALUES.LATITUDE
    },
    nickname: config.nickname
  });
};

/**
 * 验证八字数据
 * @param {Object} baziData - 八字数据
 * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
 */
export const validateBaziData = (baziData) => {
  const errors = [];
  const warnings = [];

  if (!baziData) {
    errors.push('八字数据为空');
    return { valid: false, errors, warnings };
  }

  // 检查元数据
  if (!baziData.meta) {
    warnings.push('缺少元数据（meta）');
  }

  // 检查出生信息
  if (!baziData.birth || !baziData.birth.solar || !baziData.birth.lunar) {
    errors.push('出生信息不完整');
    return { valid: false, errors, warnings };
  }

  // 检查八字四柱
  if (!baziData.bazi || !baziData.bazi.year || !baziData.bazi.month ||
      !baziData.bazi.day || !baziData.bazi.hour) {
    errors.push('八字四柱信息不完整');
  }

  // 检查五行信息
  if (!baziData.wuXing || !baziData.wuXing.counts) {
    warnings.push('五行信息可能不完整');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * 从旧版八字数据转换到标准格式
 * @param {Object} oldBaziData - 旧版八字数据
 * @returns {Object} 标准格式八字数据
 */
export const convertLegacyBaziToStandard = (oldBaziData) => {
  if (!oldBaziData) {
    throw new Error('旧版八字数据为空');
  }

  // 如果已经是标准格式，直接返回
  if (oldBaziData.meta && oldBaziData.birth && oldBaziData.bazi) {
    return oldBaziData;
  }

  // 转换旧版格式
  return {
    meta: {
      version: BAZI_DATA_VERSION,
      calculatedAt: new Date().toISOString(),
      dataSource: 'converted'
    },
    birth: {
      solar: oldBaziData.solar || {},
      lunar: oldBaziData.lunar || {},
      location: {
        longitude: oldBaziData.longitude || DEFAULT_VALUES.LONGITUDE,
        latitude: oldBaziData.latitude || DEFAULT_VALUES.LATITUDE,
        text: ''
      },
      time: {
        original: oldBaziData.birthTime || DEFAULT_VALUES.BIRTH_TIME,
        solarTime: oldBaziData.trueSolarTime || oldBaziData.birthTime || DEFAULT_VALUES.BIRTH_TIME,
        shichen: oldBaziData.shichen?.ganzhi?.charAt(1) + '时' || '未知',
        shichenGanZhi: oldBaziData.shichen?.ganzhi || '未知',
        shichenIndex: 0,
        text: oldBaziData.birthTime || DEFAULT_VALUES.BIRTH_TIME
      }
    },
    bazi: {
      year: { ganZhi: oldBaziData.bazi?.year || oldBaziData.year || '未知' },
      month: { ganZhi: oldBaziData.bazi?.month || oldBaziData.month || '未知' },
      day: { ganZhi: oldBaziData.bazi?.day || oldBaziData.day || '未知' },
      hour: { ganZhi: oldBaziData.bazi?.hour || oldBaziData.hour || '未知' },
      text: oldBaziData.bazi?.text || `${oldBaziData.year || ''} ${oldBaziData.month || ''} ${oldBaziData.day || ''} ${oldBaziData.hour || ''}`
    },
    wuXing: oldBaziData.wuxing || oldBaziData.wuXing || {},
    naYin: oldBaziData.nayin || oldBaziData.naYin || {},
    dayMaster: {
      gan: oldBaziData.bazi?.day?.charAt(0) || '未知',
      zhi: oldBaziData.bazi?.day?.charAt(1) || '未知',
      ganZhi: oldBaziData.bazi?.day || '未知',
      element: '未知',
      yangYin: '未知',
      strength: { type: '未知', score: 50 }
    },
    analysis: {},
    lunar: oldBaziData.full,
    solar: oldBaziData.solar,
    // 兼容旧版
    ...oldBaziData
  };
};

/**
 * 从配置中提取八字信息（兼容多种格式）
 * @param {Object} config - 用户配置
 * @returns {Object|null} 八字数据
 */
export const getBaziFromConfig = (config) => {
  if (!config) return null;

  // 优先从 bazi.bazi 获取
  if (config.bazi && config.bazi.bazi) {
    return config.bazi;
  }

  // 其次从 bazi 直接获取
  if (config.bazi && config.bazi.year) {
    return config.bazi;
  }

  // 返回 null
  return null;
};

/**
 * 从八字数据中获取显示用的八字信息（兼容多种格式）
 * @param {Object} baziData - 八字数据
 * @returns {Object} 显示用的八字信息
 */
export const getDisplayBaziInfo = (baziData) => {
  if (!baziData) {
    return {
      bazi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
      shichen: { ganzhi: '丁卯' },
      lunar: { text: '请设置出生信息' },
      wuxing: { text: '木火 火火 土水' },
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    };
  }

  // 如果已经是标准格式，直接返回
  if (baziData.meta && baziData.bazi) {
    return baziData;
  }

  // 如果是旧版格式，转换后返回
  return convertLegacyBaziToStandard(baziData);
};

/**
 * 从八字数据中获取八字四柱（兼容多种格式）
 * @param {Object} baziData - 八字数据
 * @returns {Object|null} 八字四柱
 */
export const getBaziPillars = (baziData) => {
  if (!baziData) return null;

  // 标准格式
  if (baziData.bazi && baziData.bazi.year) {
    return {
      year: baziData.bazi.year.ganZhi,
      month: baziData.bazi.month.ganZhi,
      day: baziData.bazi.day.ganZhi,
      hour: baziData.bazi.hour.ganZhi,
      text: baziData.bazi.text
    };
  }

  // 旧版格式
  if (baziData.bazi && baziData.bazi.year) {
    return {
      year: baziData.bazi.year,
      month: baziData.bazi.month,
      day: baziData.bazi.day,
      hour: baziData.bazi.hour,
      text: baziData.bazi.text
    };
  }

  // 顶层属性
  if (baziData.year && baziData.month && baziData.day && baziData.hour) {
    return {
      year: baziData.year,
      month: baziData.month,
      day: baziData.day,
      hour: baziData.hour,
      text: `${baziData.year} ${baziData.month} ${baziData.day} ${baziData.hour}`
    };
  }

  return null;
};

/**
 * 从八字数据中获取时辰（兼容多种格式）
 * @param {Object} baziData - 八字数据
 * @returns {string|null} 时辰
 */
export const getShichenFromBazi = (baziData) => {
  if (!baziData) return null;

  // 标准格式
  if (baziData.birth && baziData.birth.time) {
    return baziData.birth.time.shichen;
  }

  // 旧版格式
  if (baziData.shichen && baziData.shichen.ganzhi) {
    return baziData.shichen.ganzhi;
  }

  return null;
};

/**
 * 从八字数据中获取农历日期（兼容多种格式）
 * @param {Object} baziData - 八字数据
 * @returns {string|null} 农历日期
 */
export const getLunarDateFromBazi = (baziData) => {
  if (!baziData) return null;

  // 标准格式
  if (baziData.birth && baziData.birth.lunar) {
    return baziData.birth.lunar.text;
  }

  // 旧版格式
  if (baziData.lunar && baziData.lunar.text) {
    return baziData.lunar.text;
  }

  // 顶层属性
  if (baziData.lunarBirthDate) {
    return baziData.lunarBirthDate;
  }

  return null;
};

/**
 * 从八字数据中获取真太阳时（兼容多种格式）
 * @param {Object} baziData - 八字数据
 * @returns {string|null} 真太阳时
 */
export const getTrueSolarTimeFromBazi = (baziData) => {
  if (!baziData) return null;

  // 标准格式
  if (baziData.birth && baziData.birth.time) {
    return baziData.birth.time.solarTime;
  }

  // 旧版格式
  if (baziData.trueSolarTime) {
    return baziData.trueSolarTime;
  }

  return null;
};

export default {
  BAZI_DATA_VERSION,
  DEFAULT_VALUES,
  createStandardBaziData,
  createBaziFromConfig,
  validateBaziData,
  convertLegacyBaziToStandard,
  getBaziFromConfig,
  getDisplayBaziInfo,
  getBaziPillars,
  getShichenFromBazi,
  getLunarDateFromBazi,
  getTrueSolarTimeFromBazi
};
