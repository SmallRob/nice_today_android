/**
 * 八字计算 Web Worker
 * 用于后台异步处理八字计算，避免阻塞主线程
 */

/* eslint-disable no-restricted-globals */

// 监听主线程消息
self.onmessage = function(e) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'CALCULATE_DETAILED_BAZI':
        handleCalculateDetailedBazi(payload);
        break;
      case 'CALCULATE_LIU_NIAN_DA_YUN':
        handleCalculateLiuNianDaYun(payload);
        break;
      default:
        self.postMessage({
          type: 'ERROR',
          error: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      payload
    });
  }
};

/**
 * 处理八字计算
 */
function handleCalculateDetailedBazi({ birthDateStr, birthTimeStr, longitude }) {
  if (!birthDateStr) {
    self.postMessage({
      type: 'BAZI_CALC_RESULT',
      payload: null,
      error: '出生日期不能为空'
    });
    return;
  }

  try {
    const baziResult = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);

    self.postMessage({
      type: 'BAZI_CALC_RESULT',
      payload: baziResult
    });
  } catch (error) {
    self.postMessage({
      type: 'BAZI_CALC_RESULT',
      payload: null,
      error: error.message
    });
  }
}

/**
 * 处理流年大运计算
 */
function handleCalculateLiuNianDaYun({ baziData, targetYear }) {
  if (!baziData || !baziData.bazi) {
    self.postMessage({
      type: 'LIU_NIAN_RESULT',
      payload: null,
      error: '八字数据无效'
    });
    return;
  }

  try {
    const liuNianResult = calculateLiuNianDaYun(baziData, targetYear);

    self.postMessage({
      type: 'LIU_NIAN_RESULT',
      payload: liuNianResult
    });
  } catch (error) {
    self.postMessage({
      type: 'LIU_NIAN_RESULT',
      payload: null,
      error: error.message
    });
  }
}

// ========== 八字计算函数（从 baziHelper.js 复制） ==========

/**
 * 计算完整的八字及详细信息
 */
function calculateDetailedBazi(birthDateStr, birthTimeStr, longitude) {
  if (!birthDateStr) return null;

  const [year, month, day] = birthDateStr.split('-').map(Number);
  const [hour, minute] = (birthTimeStr || '12:00').split(':').map(Number);

  // 简化版八字计算（无需lunar-javascript库）
  // 真实项目中应引入库或通过importWorkerScripts引入

  const result = {
    solar: {
      year,
      month,
      day,
      hour,
      minute,
      text: `${year}年${month}月${day}日`
    },
    lunar: {
      yearStr: getYearGanZhi(year) + '年',
      monthStr: `${month}月`,
      dayStr: `${day}日`,
      text: `${getYearGanZhi(year)}年 ${month}月${day}日`
    },
    bazi: {
      year: getYearGanZhi(year),
      month: getMonthGanZhi(year, month),
      day: getDayGanZhi(year, month, day),
      hour: getHourGanZhi(year, month, day, hour),
      text: `${getYearGanZhi(year)} ${getMonthGanZhi(year, month)} ${getDayGanZhi(year, month, day)} ${getHourGanZhi(year, month, day, hour)}`
    },
    shichen: {
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      ganzhi: getHourGanZhi(year, month, day, hour)
    },
    full: null
  };

  return result;
}

// 简化的干支计算函数
function getYearGanZhi(year) {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return gan[(year - 4) % 10] + zhi[(year - 4) % 12];
}

function getMonthGanZhi(year, month) {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const yearGanIndex = (year - 4) % 10;
  const monthGanIndex = (yearGanIndex * 2 + month) % 10;
  return gan[monthGanIndex] + zhi[month - 1];
}

function getDayGanZhi(year, month, day) {
  // 简化版日柱计算
  const date = new Date(year, month - 1, day);
  const days = Math.floor(date.getTime() / 86400000);
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return gan[days % 10] + zhi[days % 12];
}

function getHourGanZhi(year, month, day, hour) {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const dayGan = getDayGanZhi(year, month, day).charAt(0);
  const dayGanIndex = gan.indexOf(dayGan);
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourGanIndex = (dayGanIndex * 2 + hourIndex) % 10;
  return gan[hourGanIndex] + zhi[hourIndex];
}

/**
 * 计算流年大运
 */
function calculateLiuNianDaYun(baziData, targetYear) {
  if (!baziData || !baziData.bazi) {
    return null;
  }

  const yearGanZhi = getYearGanZhi(targetYear);
  const dayMaster = baziData.bazi.day.charAt(0);

  const wuxingMap = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
  };

  const dayMasterElement = wuxingMap[dayMaster] || '未知';
  const liuNianGan = yearGanZhi.charAt(0);
  const liuNianBranch = yearGanZhi.charAt(1);
  const liuNianGanElement = wuxingMap[liuNianGan];
  const liuNianBranchElement = wuxingMap[liuNianBranch];

  const wuxingRelations = {
    '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
    '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
    '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
    '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
    '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
  };

  const getRelation = (element1, element2) => {
    if (element1 === element2) return '比劫';
    if (wuxingRelations[element1]['生'] === element2) return '食伤';
    if (wuxingRelations[element1]['克'] === element2) return '财星';
    if (wuxingRelations[element1]['被克'] === element2) return '官杀';
    if (wuxingRelations[element1]['被生'] === element2) return '印星';
    return '未知';
  };

  const ganRelation = getRelation(dayMasterElement, liuNianGanElement);
  const branchRelation = getRelation(dayMasterElement, liuNianBranchElement);

  const getScoreByRelation = (relation) => {
    const scoreMap = { '比劫': 70, '食伤': 85, '财星': 90, '官杀': 65, '印星': 80 };
    return scoreMap[relation] || 75;
  };

  const calculateDimensionScore = (dimension) => {
    const dimensionRelations = {
      love: ['食伤', '财星'],
      career: ['官杀', '印星'],
      study: ['印星', '食伤'],
      health: ['比劫', '印星'],
      wealth: ['财星', '食伤']
    };
    const relations = dimensionRelations[dimension] || [];
    const baseScore = 70;
    let bonus = 0;
    relations.forEach(rel => {
      if (ganRelation === rel) bonus += 10;
      if (branchRelation === rel) bonus += 8;
    });
    if (ganRelation === '比劫' || branchRelation === '比劫') bonus += 5;
    const random = ((targetYear * 7 + targetYear % 11) % 15) - 7;
    return Math.min(100, Math.max(40, baseScore + bonus + random));
  };

  const generateDimensionFortune = (dimension, score) => {
    const descriptions = {
      love: { high: '桃花运旺，适合表白或深入了解对方。单身者有望遇到心仪之人。', mid: '感情平稳，适合维持现状。有伴侣者可增进彼此了解。', low: '感情运一般，宜低调处理感情问题，避免冲突。' },
      career: { high: '事业运势强劲，有晋升机会或获得贵人相助。', mid: '工作平稳，适合稳步推进现有项目。', low: '工作压力较大，宜保持低调，避免冲动决策。' },
      study: { high: '思维活跃，记忆力佳，适合学习新知识或考证。', mid: '学习状态平稳，按计划进行会有收获。', low: '注意力易分散，需要更多耐心和专注。' },
      health: { high: '精力充沛，身体状态良好，适合运动锻炼。', mid: '身体状况稳定，注意规律作息。', low: '注意休息，避免过度劳累，关注小病小痛。' },
      wealth: { high: '财运亨通，有投资机会，但需谨慎选择。', mid: '财运平稳，适合保守理财。', low: '财运一般，宜减少不必要开支，避免冒险投资。' }
    };
    const advice = {
      love: { high: '积极社交，把握机会', mid: '保持真诚，耐心经营', low: '低调处理，避免争执' },
      career: { high: '展现能力，争取机会', mid: '稳步前进，积累经验', low: '低调行事，谨言慎行' },
      study: { high: '制定计划，全力以赴', mid: '坚持学习，温故知新', low: '调整状态，循序渐进' },
      health: { high: '保持运动，养生保健', mid: '规律作息，均衡饮食', low: '注意休息，预防疾病' },
      wealth: { high: '把握机遇，理性投资', mid: '稳健理财，控制消费', low: '节省开支，避免借贷' }
    };
    let level = score >= 80 ? 'high' : score < 60 ? 'low' : 'mid';
    return { score, level, description: descriptions[dimension][level], advice: advice[dimension][level] };
  };

  const generateOverallFortune = () => {
    const scores = ['love', 'career', 'study', 'health', 'wealth'].map(calculateDimensionScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const overallDescriptions = {
      high: `今年是${yearGanZhi}年，流年运势总体向好。把握机遇，积极行动，会有不错的发展。`,
      mid: `今年是${yearGanZhi}年，流年运势平稳。保持耐心，稳步前进，稳中求进。`,
      low: `今年是${yearGanZhi}年，流年运势有起伏。需谨慎行事，避免冲动，稳扎稳打。`
    };
    const level = avgScore >= 80 ? 'high' : avgScore < 60 ? 'low' : 'mid';
    return { score: avgScore, level, description: overallDescriptions[level], yearGanZhi, yearShengXiao: '未知' };
  };

  const generateReminders = () => {
    const reminders = [];
    const loveScore = calculateDimensionScore('love');
    const careerScore = calculateDimensionScore('career');
    const healthScore = calculateDimensionScore('health');
    const wealthScore = calculateDimensionScore('wealth');

    if (loveScore < 60) reminders.push({ type: 'warning', icon: '💔', text: '感情运势偏弱，避免因小事引发争执，保持平和心态。' });
    if (careerScore >= 80) reminders.push({ type: 'success', icon: '💼', text: '事业运势强劲，可主动争取机会，展现能力。' });
    if (healthScore < 60) reminders.push({ type: 'warning', icon: '🏥', text: '注意身体健康，避免过度劳累，定期体检。' });
    if (wealthScore >= 80) reminders.push({ type: 'success', icon: '💰', text: '财运亨通，投资需谨慎，理性分析风险。' });
    if (wealthScore < 60) reminders.push({ type: 'warning', icon: '💸', text: '财运一般，控制开支，避免高风险投资。' });
    if (ganRelation === '官杀' || branchRelation === '官杀') reminders.push({ type: 'info', icon: '⚖️', text: '今年压力可能较大，注意调节情绪，劳逸结合。' });
    if (ganRelation === '比劫' || branchRelation === '比劫') reminders.push({ type: 'info', icon: '🤝', text: '今年适合团队合作，但需注意守财，避免冲动消费。' });

    return reminders;
  };

  return {
    overall: generateOverallFortune(),
    love: generateDimensionFortune('love', calculateDimensionScore('love')),
    career: generateDimensionFortune('career', calculateDimensionScore('career')),
    study: generateDimensionFortune('study', calculateDimensionScore('study')),
    health: generateDimensionFortune('health', calculateDimensionScore('health')),
    wealth: generateDimensionFortune('wealth', calculateDimensionScore('wealth')),
    reminders: generateReminders(),
    dayMaster,
    dayMasterElement,
    liuNianGanZhi: yearGanZhi,
    liuNianGan,
    liuNianBranch,
    liuNianGanElement,
    liuNianBranchElement,
    ganRelation,
    branchRelation,
    year: targetYear
  };
}
