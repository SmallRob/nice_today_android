/**
 * 农历转换工具
 * 基于查表法实现公历与农历之间的转换
 */

// 农历年数据表（1900-2100）
// 每个字节的十六进制表示该年的闰月月份和大小月信息
// 例如：0x04bd8 表示：闰四月，大小月分别为1,0,1,1,0,1,0,1,0,1,1,0,1
const LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
];

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 生肖
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// 农历月名称
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
// 农历日名称
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
// 节气
const JIEQI = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满',
  '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至'];
// 节气对应的公历日期（近似）
const JIEQI_DATES = [
  [6, 6], [20, 20], [4, 4], [19, 19], [6, 6], [21, 21], [5, 5], [20, 20],
  [6, 6], [21, 21], [6, 6], [22, 22], [7, 7], [23, 23], [8, 8], [23, 23],
  [8, 8], [23, 23], [8, 8], [24, 24], [8, 8], [23, 23], [7, 7], [22, 22]
];

class LunarCalendar {
  /**
   * 获取农历年的闰月信息
   * @param {number} year 农历年
   * @returns {number} 闰月月份，0表示无闰月
   */
  static getLeapMonth(year) {
    return LUNAR_INFO[year - 1900] & 0xf;
  }

  /**
   * 获取农历年总天数
   * @param {number} year 农历年
   * @returns {number} 总天数
   */
  static getLunarYearDays(year) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
    }
    return sum + this.getLeapMonthDays(year);
  }

  /**
   * 获取闰月的天数
   * @param {number} year 农历年
   * @returns {number} 闰月天数
   */
  static getLeapMonthDays(year) {
    if (this.getLeapMonth(year)) {
      return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  /**
   * 获取农历月天数
   * @param {number} year 农历年
   * @param {number} month 农历月
   * @param {boolean} isLeap 是否闰月
   * @returns {number} 月天数
   */
  static getLunarMonthDays(year, month, isLeap = false) {
    if (isLeap && month === this.getLeapMonth(year)) {
      return this.getLeapMonthDays(year);
    }
    return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  }

  /**
   * 公历转农历
   * @param {number} year 公历年
   * @param {number} month 公历月（1-12）
   * @param {number} day 公历日
   * @returns {Object} 农历日期信息
   */
  static solarToLunar(year, month, day) {
    const solarDate = new Date(year, month - 1, day);
    let offset = Math.floor((solarDate.getTime() - new Date(1900, 0, 31).getTime()) / 86400000);

    let lunarYear, lunarMonth, lunarDay, isLeap, days;

    for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
      days = this.getLunarYearDays(lunarYear);
      offset -= days;
    }
    if (offset < 0) {
      offset += days;
      lunarYear--;
    }

    const leapMonth = this.getLeapMonth(lunarYear);
    isLeap = false;

    for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
      // 判断是否闰月
      if (leapMonth > 0 && lunarMonth === (leapMonth + 1) && !isLeap) {
        lunarMonth--;
        isLeap = true;
        days = this.getLeapMonthDays(lunarYear);
      } else {
        days = this.getLunarMonthDays(lunarYear, lunarMonth, false);
      }

      // 解除闰月
      if (isLeap && lunarMonth === (leapMonth + 1)) {
        isLeap = false;
      }

      offset -= days;
    }

    if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        lunarMonth--;
      }
    }

    if (offset < 0) {
      offset += days;
      lunarMonth--;
    }

    lunarDay = offset + 1;

    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeap,
      lunarYearStr: `${lunarYear}年`,
      lunarMonthStr: `${isLeap ? '闰' : ''}${LUNAR_MONTHS[lunarMonth - 1]}月`,
      lunarDayStr: LUNAR_DAYS[lunarDay - 1],
      lunarFullStr: `${lunarYear}年 ${isLeap ? '闰' : ''}${LUNAR_MONTHS[lunarMonth - 1]}月${LUNAR_DAYS[lunarDay - 1]}`
    };
  }

  /**
   * 农历转公历（简化版本）
   * @param {number} lunarYear 农历年
   * @param {number} lunarMonth 农历月（1-12）
   * @param {number} lunarDay 农历日
   * @param {boolean} isLeap 是否闰月
   * @returns {Object} 公历日期信息
   */
  static lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
    // 简化实现：基于1900年1月31日（农历1900年正月初一）计算偏移量
    let offset = 0;

    // 累加年份天数
    for (let y = 1900; y < lunarYear; y++) {
      offset += this.getLunarYearDays(y);
    }

    // 累加月天数
    const leapMonth = this.getLeapMonth(lunarYear);
    for (let m = 1; m < lunarMonth; m++) {
      if (leapMonth > 0 && m === leapMonth) {
        offset += this.getLeapMonthDays(lunarYear);
      }
      offset += this.getLunarMonthDays(lunarYear, m, false);
    }

    // 检查闰月
    if (isLeap && leapMonth > 0 && lunarMonth > leapMonth) {
      offset += this.getLeapMonthDays(lunarYear);
    }

    offset += lunarDay - 1;

    // 转换为公历日期
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(baseDate.getTime() + offset * 86400000);

    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      day: targetDate.getDate()
    };
  }

  /**
   * 获取时辰
   * @param {number} hour 小时（0-23）
   * @returns {Object} 时辰信息
   */
  static getShichen(hour) {
    const shichenList = [
      { name: '子时', index: 0, start: 23, end: 1 },
      { name: '丑时', index: 1, start: 1, end: 3 },
      { name: '寅时', index: 2, start: 3, end: 5 },
      { name: '卯时', index: 3, start: 5, end: 7 },
      { name: '辰时', index: 4, start: 7, end: 9 },
      { name: '巳时', index: 5, start: 9, end: 11 },
      { name: '午时', index: 6, start: 11, end: 13 },
      { name: '未时', index: 7, start: 13, end: 15 },
      { name: '申时', index: 8, start: 15, end: 17 },
      { name: '酉时', index: 9, start: 17, end: 19 },
      { name: '戌时', index: 10, start: 19, end: 21 },
      { name: '亥时', index: 11, start: 21, end: 23 }
    ];

    // 处理子时跨越午夜的情况
    if (hour === 23) {
      return shichenList[0];
    }

    return shichenList.find(s => hour >= s.start && hour < s.end) || shichenList[0];
  }

  /**
   * 获取生肖
   * @param {number} year 公历年
   * @returns {string} 生肖名称
   */
  static getZodiac(year) {
    return ZODIAC[(year - 4) % 12];
  }

  /**
   * 格式化农历日期
   * @param {Object} lunarData 农历数据
   * @returns {string} 格式化字符串
   */
  static formatLunarDate(lunarData) {
    return `${lunarData.lunarMonthStr}${lunarData.lunarDayStr}`;
  }

  /**
   * 格式化完整农历日期
   * @param {Object} lunarData 农历数据
   * @returns {string} 格式化字符串
   */
  static formatFullLunarDate(lunarData) {
    return lunarData.lunarFullStr;
  }
}

export default LunarCalendar;
