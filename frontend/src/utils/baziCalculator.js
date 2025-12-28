/**
 * 八字计算工具
 * 基于公历日期和时辰计算八字（四柱）
 * 支持根据经纬度计算真太阳时
 */

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应的地支
const TIME_ZHI = [
  { name: '子', start: 23, end: 1 },
  { name: '丑', start: 1, end: 3 },
  { name: '寅', start: 3, end: 5 },
  { name: '卯', start: 5, end: 7 },
  { name: '辰', start: 7, end: 9 },
  { name: '巳', start: 9, end: 11 },
  { name: '午', start: 11, end: 13 },
  { name: '未', start: 13, end: 15 },
  { name: '申', start: 15, end: 17 },
  { name: '酉', start: 17, end: 19 },
  { name: '戌', start: 19, end: 21 },
  { name: '亥', start: 21, end: 23 }
];

// 二十四节气（公历日期参考）
const JIEQI = [
  { name: '立春', month: 2, day: [3, 4, 5] },
  { name: '惊蛰', month: 3, day: [5, 6, 7] },
  { name: '清明', month: 4, day: [4, 5, 6] },
  { name: '立夏', month: 5, day: [5, 6, 7] },
  { name: '芒种', month: 6, day: [5, 6, 7] },
  { name: '小暑', month: 7, day: [7, 8, 9] },
  { name: '立秋', month: 8, day: [7, 8, 9] },
  { name: '白露', month: 9, day: [7, 8, 9] },
  { name: '寒露', month: 10, day: [8, 9, 10] },
  { name: '立冬', month: 11, day: [7, 8, 9] },
  { name: '大雪', month: 12, day: [7, 8, 9] },
  { name: '小寒', month: 1, day: [5, 6, 7] }
];

class BaziCalculator {
  /**
   * 计算真太阳时
   * 根据经度计算真太阳时与平太阳时的差值
   * @param {number} year 年
   * @param {number} month 月
   * @param {number} day 日
   * @param {number} hour 小时
   * @param {number} minute 分钟
   * @param {number} longitude 经度（东经为正，西经为负）
   * @returns {Date} 真太阳时
   */
  static calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
    // 计算儒略日
    const y = year;
    const m = month;
    const d = day + hour / 24 + minute / 1440;

    let jd;
    if (m <= 2) {
      jd = Math.floor(365.25 * (y - 1)) + Math.floor(30.6001 * (m + 13)) + d + 1720994.5;
    } else {
      jd = Math.floor(365.25 * y) + Math.floor(30.6001 * (m + 1)) + d + 1720994.5;
    }

    // 计算太阳平黄经
    const T = (jd - 2451545.0) / 36525;

    // 计算太阳时差
    const M = 357.5291 + 35999.0503 * T - 0.0001559 * T * T - 0.00000048 * T * T * T;
    const deltaT = -0.0057183 - 0.0249 * Math.sin(M * Math.PI / 180) - 0.0048 * Math.sin(2 * M * Math.PI / 180)
      + 0.0053 * Math.cos(M * Math.PI / 180) + 0.0023 * Math.cos(2 * M * Math.PI / 180);

    // 计算时区修正（北京时间东经120度）
    const timezoneOffset = (120 - longitude) * 4; // 分钟

    // 真太阳时 = 平太阳时 + 时差 + 经度修正
    const totalMinutes = hour * 60 + minute + deltaT + timezoneOffset;

    // 调整到0-1440范围
    let adjustedMinutes = totalMinutes % 1440;
    if (adjustedMinutes < 0) {
      adjustedMinutes += 1440;
    }

    const newHour = Math.floor(adjustedMinutes / 60);
    const newMinute = Math.floor(adjustedMinutes % 60);

    return { hour: newHour, minute: newMinute, totalMinutes };
  }

  /**
   * 判断是否在立春之后
   * @param {number} year 年
   * @param {number} month 月
   * @param {number} day 日
   * @returns {boolean} 是否立春之后
   */
  static isAfterLichun(year, month, day) {
    const lichun = JIEQI[0];
    if (month > lichun.month) return true;
    if (month < lichun.month) return false;
    // 同月比较日期
    return day >= lichun.day[0];
  }

  /**
   * 获取年柱
   * @param {number} year 公历年
   * @param {number} month 月
   * @param {number} day 日
   * @returns {string} 年柱
   */
  static getYearPillar(year, month, day) {
    // 以立春为界，立春后为新年
    let baziYear = year;
    if (!this.isAfterLichun(year, month, day)) {
      baziYear--;
    }

    // 年干：(年份-4)%10
    const yearGanIndex = (baziYear - 4) % 10;
    // 年支：(年份-4)%12
    const yearZhiIndex = (baziYear - 4) % 12;

    return {
      gan: GAN[yearGanIndex],
      zhi: ZHI[yearZhiIndex],
      full: GAN[yearGanIndex] + ZHI[yearZhiIndex]
    };
  }

  /**
   * 获取月柱
   * @param {number} year 公历年
   * @param {number} month 月
   * @param {number} day 日
   * @returns {string} 月柱
   */
  static getMonthPillar(year, month, day) {
    const yearPillar = this.getYearPillar(year, month, day);
    const yearGanIndex = GAN.indexOf(yearPillar.gan);

    // 确定月支（以节气为界，简化处理，以立春为起点）
    // 立春=寅月，惊蛰=卯月，...
    const monthZhiMap = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1];
    const key = (month - 1) * 2 + Math.floor(day / 15);
    const monthZhiIndex = monthZhiMap[Math.min(key, 23)];

    // 月干：(年干索引*2+月支索引)%10
    // 甲己之年丙作首，乙庚之岁戊为头
    const monthGanMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    const monthGanIndex = (monthGanMap[yearGanIndex] + monthZhiIndex) % 10;

    return {
      gan: GAN[monthGanIndex],
      zhi: ZHI[monthZhiIndex],
      full: GAN[monthGanIndex] + ZHI[monthZhiIndex]
    };
  }

  /**
   * 获取日柱
   * @param {number} year 公历年
   * @param {number} month 月
   * @param {number} day 日
   * @returns {string} 日柱
   */
  static getDayPillar(year, month, day) {
    // 基于基准日期计算（1900年1月1日为甲戌日）
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

    // 1900年1月1日为甲戌日，甲索引0，戌索引10
    const baseGanIndex = 0;
    const baseZhiIndex = 10;

    const dayGanIndex = (baseGanIndex + diffDays) % 10;
    const dayZhiIndex = (baseZhiIndex + diffDays) % 12;

    return {
      gan: GAN[dayGanIndex],
      zhi: ZHI[dayZhiIndex],
      full: GAN[dayGanIndex] + ZHI[dayZhiIndex]
    };
  }

  /**
   * 获取时柱
   * @param {number} hour 小时（真太阳时）
   * @param {number} dayGanIndex 日干索引
   * @returns {string} 时柱
   */
  static getHourPillar(hour, dayGanIndex) {
    // 确定时支
    let hourZhiIndex;
    if (hour >= 23 || hour < 1) {
      hourZhiIndex = 0; // 子时
    } else {
      hourZhiIndex = Math.floor((hour + 1) / 2);
    }

    // 时干：(日干索引*2+时支索引)%10
    // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
    const hourGanMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
    const hourGanIndex = (hourGanMap[dayGanIndex] + hourZhiIndex) % 10;

    return {
      gan: GAN[hourGanIndex],
      zhi: ZHI[hourZhiIndex],
      full: GAN[hourGanIndex] + ZHI[hourZhiIndex],
      shichen: TIME_ZHI[hourZhiIndex].name
    };
  }

  /**
   * 计算完整的八字
   * @param {number} year 公历年
   * @param {number} month 公历月
   * @param {number} day 公历日
   * @param {number} hour 小时
   * @param {number} minute 分钟
   * @param {number} longitude 经度（默认110度东经）
   * @returns {Object} 八字信息
   */
  static calculateBazi(year, month, day, hour = 12, minute = 30, longitude = 110) {
    // 计算真太阳时
    const trueSolarTime = this.calculateTrueSolarTime(year, month, day, hour, minute, longitude);

    // 获取四柱
    const yearPillar = this.getYearPillar(year, month, day);
    const monthPillar = this.getMonthPillar(year, month, day);
    const dayPillar = this.getDayPillar(year, month, day);
    const hourPillar = this.getHourPillar(trueSolarTime.hour, GAN.indexOf(dayPillar.gan));

    return {
      year: yearPillar.full,
      month: monthPillar.full,
      day: dayPillar.full,
      hour: hourPillar.full,
      shichen: hourPillar.shichen,
      details: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
      },
      trueSolarTime,
      longitude
    };
  }

  /**
   * 格式化八字为字符串
   * @param {Object} bazi 八字对象
   * @returns {string} 格式化字符串
   */
  static formatBazi(bazi) {
    return `${bazi.year}  ${bazi.month}  ${bazi.day}  ${bazi.hour}`;
  }

  /**
   * 获取八字详细描述
   * @param {Object} bazi 八字对象
   * @returns {string} 详细描述
   */
  static getBaziDescription(bazi) {
    return `年柱：${bazi.year}\n月柱：${bazi.month}\n日柱：${bazi.day}\n时柱：${bazi.hour}`;
  }

  /**
   * 计算八字运势趋势
   * @param {Date} birthDate 出生日期
   * @param {Date} currentDate 当前日期
   * @param {string} timeRange 时间范围（week/month/year）
   * @returns {Object} 趋势数据
   */
  static calculateBaziTrend(birthDate, currentDate, timeRange = 'week') {
    const trend = [];
    const today = new Date(currentDate);
    
    // 根据时间范围确定数据点数量
    let dataPoints, periodLabel;
    switch (timeRange) {
      case 'week':
        dataPoints = 7;
        periodLabel = '天';
        break;
      case 'month':
        dataPoints = 30;
        periodLabel = '日';
        break;
      case 'year':
        dataPoints = 12;
        periodLabel = '月';
        break;
      default:
        dataPoints = 7;
        periodLabel = '天';
    }

    // 生成趋势数据
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(today);
      
      if (timeRange === 'week') {
        date.setDate(today.getDate() - (dataPoints - 1) + i);
      } else if (timeRange === 'month') {
        date.setDate(today.getDate() - (dataPoints - 1) + i);
      } else if (timeRange === 'year') {
        date.setMonth(today.getMonth() - (dataPoints - 1) + i);
      }

      // 简化版运势评分（基于随机数，实际应用中应基于八字算法）
      const baseScore = Math.sin((i / dataPoints) * Math.PI * 2) * 0.8;
      const randomFactor = (Math.random() - 0.5) * 0.4;
      const overallScore = baseScore + randomFactor;

      trend.push({
        period: timeRange === 'year' ? 
          `${date.getMonth() + 1}月` : 
          `${i + 1}${periodLabel}`,
        date: date.toISOString().split('T')[0],
        overallScore: parseFloat(overallScore.toFixed(2)),
        career: parseFloat((overallScore * 0.8 + (Math.random() - 0.5) * 0.3).toFixed(2)),
        wealth: parseFloat((overallScore * 0.9 + (Math.random() - 0.5) * 0.2).toFixed(2)),
        health: parseFloat((overallScore * 0.7 + (Math.random() - 0.5) * 0.4).toFixed(2)),
        relationship: parseFloat((overallScore * 0.6 + (Math.random() - 0.5) * 0.5).toFixed(2))
      });
    }

    // 当前运势数据
    const current = trend[trend.length - 1];

    return {
      trend,
      current,
      timeRange,
      birthDate: birthDate.toISOString().split('T')[0],
      currentDate: today.toISOString().split('T')[0]
    };
  }

  /**
   * 获取八字运势洞察
   * @param {Object} currentData 当前运势数据
   * @returns {string} 运势洞察文本
   */
  static getBaziInsight(currentData) {
    const { overallScore, career, wealth, health, relationship } = currentData;
    
    if (overallScore > 0.7) {
      return "当前运势极佳，各方面都处于有利时期，适合大胆尝试新事物，把握机会，积极进取。";
    } else if (overallScore > 0.3) {
      return "运势良好，事业和财运发展顺利，保持积极心态，稳步前进会有不错收获。";
    } else if (overallScore > -0.3) {
      return "运势平稳，适合稳扎稳打，注意健康管理和人际关系维护，避免冲动决策。";
    } else if (overallScore > -0.7) {
      return "运势稍有波动，需要更加谨慎，注意控制开支，保持良好作息，多与亲友沟通。";
    } else {
      return "当前运势面临挑战，建议保守行事，注意身体健康，保持耐心，等待时机好转。";
    }
  }
}

export default BaziCalculator;
