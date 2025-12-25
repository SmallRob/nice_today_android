/**
 * 紫微命宫计算工具
 * 根据出生日期、时辰、经纬度计算紫微命盘各宫位信息
 */

import { Solar, Lunar } from 'lunar-javascript';

/**
 * 紫微十二宫位定义
 */
const ZIWEI_PALACES = {
  MING_GONG: '命宫',
  QIAN_YI_GONG: '迁移宫',
  FU_DI_GONG: '福德宫',
  TIAN_TONG_GONG: '田宅宫',
  LUAN_YAN_GONG: '官禄宫',
  NUO_BO_GONG: '奴仆宫',
  TIAN_JI_GONG: '迁移宫',
  ZAI_WU_GONG: '疾厄宫',
  CAI_BO_GONG: '财帛宫',
  ZI_NU_GONG: '子女宫',
  FU_FU_GONG: '夫妻宫',
  XIONG_DI_GONG: '兄弟宫'
};

/**
 * 根据时辰计算命宫位置（简化版）
 * @param {string} birthTimeStr 出生时间 HH:mm
 * @param {number} longitude 经度
 * @returns {Object} 命宫信息
 */
const calculateMingGong = (birthTimeStr, longitude) => {
  const [hours, minutes] = birthTimeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  // 根据经度调整真太阳时
  const timeOffset = (longitude - 120) * 4;
  const adjustedMinutes = totalMinutes + timeOffset;
  const adjustedHours = Math.floor((adjustedMinutes % 1440) / 60);

  // 简化命宫计算（基于时辰）
  const shichen = Math.floor(adjustedHours / 2) % 12;

  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  const mingGongZhi = diZhi[shichen];
  const mingGongGan = tianGan[(Math.floor(new Date().getHours() / 2)) % 10];

  return {
    zhi: mingGongZhi,
    gan: mingGongGan,
    ganzhi: mingGongGan + mingGongZhi,
    shichenIndex: shichen
  };
};

/**
 * 计算十二宫位分布（简化版）
 * @param {Object} baziInfo 八字信息
 * @param {string} birthDate 出生日期 YYYY-MM-DD
 * @param {string} birthTime 出生时间 HH:mm
 * @param {number} longitude 经度
 * @returns {Object} 十二宫位信息
 */
export const calculateZiWeiPalaces = (baziInfo, birthDate, birthTime, longitude) => {
  if (!baziInfo || !baziInfo.bazi) {
    return null;
  }

  try {
    const mingGong = calculateMingGong(birthTime, longitude);

    // 简化宫位分布算法
    // 实际紫微命盘需要复杂的星曜计算，这里使用简化版本
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

    // 基于八字日柱计算各宫位
    const dayGan = baziInfo.bazi.day.charAt(0);
    const dayZhi = baziInfo.bazi.day.charAt(1);

    const dayGanIndex = tianGan.indexOf(dayGan);
    const dayZhiIndex = diZhi.indexOf(dayZhi);

    // 计算各宫位（简化算法）
    const calculatePalace = (offset, name, description) => {
      const zhiIndex = (dayZhiIndex + offset + 12) % 12;
      const ganIndex = (dayGanIndex + offset + 10) % 10;
      
      return {
        name,
        description,
        zhi: diZhi[zhiIndex],
        gan: tianGan[ganIndex],
        ganzhi: tianGan[ganIndex] + diZhi[zhiIndex],
        strength: calculatePalaceStrength(baziInfo, zhiIndex)
      };
    };

    // 计算十二宫位
    const palaces = [
      calculatePalace(0, ZIWEI_PALACES.MING_GONG, '本命元、先天禀赋、一生格局'),
      calculatePalace(1, ZIWEI_PALACES.QIAN_YI_GONG, '社交关系、外出旅行、环境适应'),
      calculatePalace(2, ZIWEI_PALACES.FU_DI_GONG, '精神状态、内心修养、道德品质'),
      calculatePalace(3, ZIWEI_PALACES.TIAN_TONG_GONG, '不动产、家庭环境、资产状况'),
      calculatePalace(4, ZIWEI_PALACES.LUAN_YAN_GONG, '事业运势、职业发展、官运升迁'),
      calculatePalace(5, ZIWEI_PALACES.NUO_BO_GONG, '人际关系、下属部属、服务关系'),
      calculatePalace(6, ZIWEI_PALACES.QIAN_YI_GONG, '变动迁居、环境改变、适应能力'),
      calculatePalace(7, ZIWEI_PALACES.ZAI_WU_GONG, '健康状况、疾病隐患、养生之道'),
      calculatePalace(8, ZIWEI_PALACES.CAI_BO_GONG, '财运状况、理财能力、经济基础'),
      calculatePalace(9, ZIWEI_PALACES.ZI_NU_GONG, '子女运、子女关系、亲子关系'),
      calculatePalace(10, ZIWEI_PALACES.FU_FU_GONG, '婚姻感情、配偶关系、家庭生活'),
      calculatePalace(11, ZIWEI_PALACES.XIONG_DI_GONG, '兄弟姐妹、同辈关系、人脉网络')
    ];

    return {
      mingGong,
      palaces,
      summary: generatePalaceSummary(palaces, baziInfo)
    };
  } catch (error) {
    console.error('计算紫微命宫失败:', error);
    return null;
  }
};

/**
 * 计算宫位强度（简化版）
 * @param {Object} baziInfo 八字信息
 * @param {number} zhiIndex 地支索引
 * @returns {Object} 强度信息
 */
const calculatePalaceStrength = (baziInfo, zhiIndex) => {
  // 基于日主与地支的关系计算强度
  const wuxingElements = ['木', '火', '土', '金', '水'];
  const zhiToElement = { '寅': '木', '卯': '木', '巳': '火', '午': '火',
    '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '申': '金', '酉': '金', '子': '水', '亥': '水' };

  const zhiArray = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const palaceElement = zhiToElement[zhiArray[zhiIndex]];

  const dayGan = baziInfo.bazi.day.charAt(0);
  const dayMasterElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火',
    '戊': '土', '己': '土', '庚': '金', '辛': '金',
    '壬': '水', '癸': '水' }[dayGan] || '未知';

  // 计算强度
  let strength = '中';
  let score = 50;

  if (palaceElement === dayMasterElement) {
    strength = '强';
    score = 80;
  } else {
    // 五行生克关系
    const wuxingRelations = {
      '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
      '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
      '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
      '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
      '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
    };

    if (wuxingRelations[dayMasterElement]['被生'] === palaceElement) {
      strength = '偏强';
      score = 70;
    } else if (wuxingRelations[dayMasterElement]['生'] === palaceElement) {
      strength = '偏弱';
      score = 30;
    } else if (wuxingRelations[dayMasterElement]['被克'] === palaceElement) {
      strength = '弱';
      score = 20;
    } else if (wuxingRelations[dayMasterElement]['克'] === palaceElement) {
      strength = '中偏强';
      score = 60;
    }
  }

  return { strength, score, element: palaceElement };
};

/**
 * 生成宫位总结
 * @param {Array} palaces 十二宫位数组
 * @param {Object} baziInfo 八字信息
 * @returns {Object} 总结信息
 */
const generatePalaceSummary = (palaces, baziInfo) => {
  const strengthScores = palaces.map(p => p.strength.score);
  const avgScore = Math.round(strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length);

  // 找出最强和最弱的宫位
  const sortedPalaces = [...palaces].sort((a, b) => b.strength.score - a.strength.score);
  const strongestPalace = sortedPalaces[0];
  const weakestPalace = sortedPalaces[sortedPalaces.length - 1];

  // 找出财运和事业运
  const caiBoGong = palaces.find(p => p.name === ZIWEI_PALACES.CAI_BO_GONG);
  const luanYanGong = palaces.find(p => p.name === ZIWEI_PALACES.LUAN_YAN_GONG);
  const fuFuGong = palaces.find(p => p.name === ZIWEI_PALACES.FU_FU_GONG);
  const qianYiGong = palaces.find(p => p.name === ZIWEI_PALACES.QIAN_YI_GONG);

  return {
    avgScore,
    overallStrength: avgScore >= 60 ? '偏强' : avgScore >= 40 ? '中和' : '偏弱',
    strongestPalace,
    weakestPalace,
    caiBoGong,
    luanYanGong,
    fuFuGong,
    qianYiGong,
    advice: generateAdvice(strongestPalace, weakestPalace, caiBoGong, luanYanGong)
  };
};

/**
 * 生成建议
 */
const generateAdvice = (strongest, weakest, caiBo, luanYan) => {
  const advices = [];

  if (caiBo) {
    if (caiBo.strength.strength === '强' || caiBo.strength.strength === '偏强') {
      advices.push({
        type: 'success',
        title: '财运亨通',
        content: '财帛宫吉旺，有利于财富积累和理财投资。'
      });
    } else if (caiBo.strength.strength === '弱' || caiBo.strength.strength === '偏弱') {
      advices.push({
        type: 'warning',
        title: '财运需加强',
        content: '财帛宫偏弱，建议稳健理财，避免冒险投资。'
      });
    }
  }

  if (luanYan) {
    if (luanYan.strength.strength === '强' || luanYan.strength.strength === '偏强') {
      advices.push({
        type: 'success',
        title: '事业运佳',
        content: '官禄宫吉旺，事业发展顺利，有晋升机会。'
      });
    } else if (luanYan.strength.strength === '弱' || luanYan.strength.strength === '偏弱') {
      advices.push({
        type: 'warning',
        title: '事业需努力',
        content: '官禄宫偏弱，建议踏实做事，积累经验。'
      });
    }
  }

  if (strongest) {
    advices.push({
      type: 'info',
      title: `${strongest.name}最强`,
      content: `最强的宫位是${strongest.name}，这是您的先天优势领域。`
    });
  }

  return advices;
};

/**
 * 获取紫微命宫展示数据
 * @param {Object} config 用户配置
 * @returns {Promise<Object>} 紫微命宫数据
 */
export const getZiWeiDisplayData = async (config) => {
  if (!config || !config.birthDate) {
    return null;
  }

  try {
    const birthDate = config.birthDate;
    const birthTime = config.birthTime || '12:30';
    const longitude = config.birthLocation?.lng || 116.40;

    // 使用八字信息计算
    const { calculateDetailedBazi } = await import('./baziHelper');
    const baziInfo = calculateDetailedBazi(birthDate, birthTime, longitude);

    if (!baziInfo) {
      return null;
    }

    const ziweiData = calculateZiWeiPalaces(baziInfo, birthDate, birthTime, longitude);

    return {
      baziInfo,
      ziweiData,
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取紫微命宫数据失败:', error);
    return null;
  }
};
