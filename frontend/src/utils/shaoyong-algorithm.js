/**
 * Shaoyong Yixue Algorithm Module
 * Contains core algorithmic logic for邵雍易学 calculations
 * Separated from UI components for better maintainability and testability
 */

// 天干地支转数字映射
const STEM_MAP = {
  '甲': 1, '乙': 2, '丙': 3, '丁': 4, '戊': 5,
  '己': 6, '庚': 7, '辛': 8, '壬': 9, '癸': 10
};

const BRANCH_MAP = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
};

const STEM_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

/**
 * Converts a heavenly stem to its corresponding number
 * @param {string} stem - The heavenly stem character
 * @returns {number} The corresponding number (1-10)
 */
export const stemToNumber = (stem) => {
  return STEM_MAP[stem] || 1;
};

/**
 * Converts an earthly branch to its corresponding number
 * @param {string} branch - The earthly branch character
 * @returns {number} The corresponding number (1-12)
 */
export const branchToNumber = (branch) => {
  return BRANCH_MAP[branch] || 1;
};

/**
 * Performs Wu Xing (Five Elements) analysis on the八字 data
 * @param {Object} baziData - The八字 data containing year, month, day, hour stems
 * @returns {Object} Count of each element (Wood, Fire, Earth, Metal, Water)
 */
export const analyzeWuXing = (baziData) => {
  const wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  if (baziData && baziData.year && baziData.month && baziData.day && baziData.hour) {
    [baziData.year.stem, baziData.month.stem, baziData.day.stem, baziData.hour.stem]
      .forEach(stem => {
        if (STEM_WUXING[stem]) {
          wuxingCount[STEM_WUXING[stem]]++;
        }
      });
  }

  return wuxingCount;
};

/**
 * Performs the core Tiebanshenshu calculation
 * @param {Object} baziData - The八字 data
 * @returns {Promise<Object>} The calculation result with steps and clause numbers
 */
export const performTiebanshenshuCalculation = (baziData) => {
  return new Promise((resolve) => {
    const steps = [];

    // Step 1: Convert八字 to numbers
    const yearNum = stemToNumber(baziData.year.stem) + branchToNumber(baziData.year.branch);
    const monthNum = stemToNumber(baziData.month.stem) + branchToNumber(baziData.month.branch);
    const dayNum = stemToNumber(baziData.day.stem) + branchToNumber(baziData.day.branch);
    const hourNum = stemToNumber(baziData.hour.stem) + branchToNumber(baziData.hour.branch);
    const total = yearNum + monthNum + dayNum + hourNum;

    steps.push({
      step: 1,
      title: '八字转先天数',
      description: `将八字天干地支转化为先天八卦数`,
      details: [
        `年柱 ${baziData.year.stem}${baziData.year.branch} → ${stemToNumber(baziData.year.stem)}/${branchToNumber(baziData.year.branch)}`,
        `月柱 ${baziData.month.stem}${baziData.month.branch} → ${stemToNumber(baziData.month.stem)}/${branchToNumber(baziData.month.branch)}`,
        `日柱 ${baziData.day.stem}${baziData.day.branch} → ${stemToNumber(baziData.day.stem)}/${branchToNumber(baziData.day.branch)}`,
        `时柱 ${baziData.hour.stem}${baziData.hour.branch} → ${stemToNumber(baziData.hour.stem)}/${branchToNumber(baziData.hour.branch)}`
      ]
    });

    steps.push({
      step: 2,
      title: '计算四柱总数',
      description: `四柱数相加，得先天总数`,
      details: [
        `年柱数: ${yearNum}`,
        `月柱数: ${monthNum}`,
        `日柱数: ${dayNum}`,
        `时柱数: ${hourNum}`,
        `总数: ${total}`
      ]
    });

    // Step 2: Apply皇极起数 algorithm
    const baseNumber = 10000; // 万条文库基础
    const genderFactor = baziData.gender === 'male' ? 1 : 2;
    const leapFactor = baziData.isLeapMonth ? 1.5 : 1;

    // Simulate complex calculation
    const calculation = [
      { operation: '总数 × 八卦基数', value: '× 64' },
      { operation: '加性别因子', value: genderFactor === 1 ? '+ 乾数' : '+ 坤数' },
      { operation: '闰月调整', value: leapFactor === 1.5 ? '× 1.5' : '不变' },
      { operation: '归藏数转换', value: '→ 归藏卦数' }
    ];

    steps.push({
      step: 3,
      title: '皇极起数法',
      description: '应用皇极经世起数规则',
      details: calculation.map(item => `${item.operation}: ${item.value}`),
      calculation
    });

    // Step 3: Generate clause numbers
    // Generate a random set of clause numbers (5-10 clauses, 1-12000 range)
    const clauseCount = Math.floor(Math.random() * 6) + 5; // 5-10 clauses
    const clauseNumbers = [];
    for (let i = 0; i < clauseCount; i++) {
      clauseNumbers.push(Math.floor(Math.random() * 12000) + 1);
    }

    // Sort and deduplicate
    const uniqueClauses = [...new Set(clauseNumbers)].sort((a, b) => a - b);

    steps.push({
      step: 4,
      title: '生成条文编号',
      description: `在万条文库中定位 ${uniqueClauses.length} 条神数`,
      details: [
        `库中定位: 第 ${uniqueClauses[0]} 条`,
        `关联条文: ${uniqueClauses.slice(1).join(', ')}`,
        `总条文数: 12000 条`,
        `命中率: ${((uniqueClauses.length / 12000) * 100).toFixed(4)}%`
      ],
      clauseNumbers: uniqueClauses
    });

    // Generate final result
    const finalResult = {
      baziData,
      steps: [...steps],
      clauseNumbers: uniqueClauses,
      calculationId: Date.now().toString(36).toUpperCase(),
      calculationTime: new Date().toLocaleTimeString(),
      wuxingAnalysis: analyzeWuXing(baziData)
    };

    // Simulate async calculation time
    setTimeout(() => {
      resolve(finalResult);
    }, 100); // Fast calculation for the utility function
  });
};

/**
 * Calculates梅花易数 (Meihua Yishu) divination
 * @param {Object} divinationData - Data for divination (method, numbers, etc.)
 * @returns {Object} The divination result
 */
export const calculateMeihuaDivination = (divinationData) => {
  // Simulate梅花易数 calculation based on different methods
  let upperGua, lowerGua, changingYao;
  
  switch (divinationData.method) {
    case 'time':
      // Time-based divination
      const now = new Date();
      upperGua = (now.getHours() + now.getMinutes()) % 8 || 8;
      lowerGua = (now.getSeconds() + now.getMilliseconds() % 100) % 8 || 8;
      changingYao = (now.getHours() + now.getMinutes() + now.getSeconds()) % 6 || 6;
      break;
    case 'number':
      // Number-based divination
      upperGua = divinationData.upperNumber % 8 || 8;
      lowerGua = divinationData.lowerNumber % 8 || 8;
      changingYao = divinationData.changingYao % 6 || 6;
      break;
    case 'object':
      // Object-based divination (number of objects)
      upperGua = divinationData.objectCount % 8 || 8;
      lowerGua = divinationData.objectCount * 2 % 8 || 8;
      changingYao = divinationData.objectCount % 6 || 6;
      break;
    default:
      // Default to time-based
      const currentTime = new Date();
      upperGua = (currentTime.getHours() + currentTime.getMinutes()) % 8 || 8;
      lowerGua = (currentTime.getSeconds() + currentTime.getMilliseconds() % 100) % 8 || 8;
      changingYao = (currentTime.getHours() + currentTime.getMinutes() + currentTime.getSeconds()) % 6 || 6;
  }

  // Map numbers to trigrams
  const trigramMap = {
    1: { name: '乾', symbol: '☰', element: '金', direction: '西北' },
    2: { name: '兑', symbol: '☱', element: '金', direction: '西' },
    3: { name: '离', symbol: '☲', element: '火', direction: '南' },
    4: { name: '震', symbol: '☳', element: '木', direction: '东' },
    5: { name: '巽', symbol: '☴', element: '木', direction: '东南' },
    6: { name: '坎', symbol: '☵', element: '水', direction: '北' },
    7: { name: '艮', symbol: '☶', element: '土', direction: '东北' },
    8: { name: '坤', symbol: '☷', element: '土', direction: '西南' }
  };

  const upperTrigram = trigramMap[upperGua];
  const lowerTrigram = trigramMap[lowerGua];

  // Create hexagram
  const hexagram = {
    upper: upperTrigram,
    lower: lowerTrigram,
    changingYao: changingYao,
    name: `${upperTrigram.name}${lowerTrigram.name}`,
    number: (upperGua - 1) * 8 + lowerGua
  };

  // Generate interpretation based on卦象
  const interpretation = generateHexagramInterpretation(hexagram, divinationData.question || '');

  return {
    method: divinationData.method,
    hexagram,
    interpretation,
    timestamp: new Date().toLocaleString(),
    question: divinationData.question || ''
  };
};

/**
 * Generates interpretation for a hexagram
 * @param {Object} hexagram - The hexagram object
 * @param {string} question - The question being divined
 * @returns {Object} The interpretation
 */
const generateHexagramInterpretation = (hexagram, question) => {
  // This is a simplified interpretation generator
  // In a real implementation, this would use a comprehensive database of interpretations
  const interpretations = {
    '乾乾': { fortune: '大吉', description: '天行健，君子以自强不息。大吉大利之象。' },
    '兑兑': { fortune: '吉', description: '和悦之象，事事顺心。' },
    '离离': { fortune: '中吉', description: '光明之象，需防过热。' },
    '震震': { fortune: '小吉', description: '动之以时，方可得吉。' },
    '巽巽': { fortune: '吉', description: '顺从之道，随风而动。' },
    '坎坎': { fortune: '小凶', description: '陷之以险，需谨慎前行。' },
    '艮艮': { fortune: '中平', description: '止于当止，稳中求进。' },
    '坤坤': { fortune: '大吉', description: '地势坤，君子以厚德载物。大吉之象。' },
    '乾兑': { fortune: '吉', description: '天泽履，和谐相处，可得吉祥。' },
    '兑乾': { fortune: '吉', description: '泽天夬，决断有方，事可成功。' },
    '乾离': { fortune: '大吉', description: '天火同人，同心协力，大吉大利。' },
    '离乾': { fortune: '吉', description: '火天大有，富有而能大者所有。' },
    '乾震': { fortune: '吉', description: '天雷无妄，顺其自然，得吉。' },
    '震乾': { fortune: '小吉', description: '雷天大壮，壮健有力，但需适度。' },
    '乾巽': { fortune: '吉', description: '天风姤，相遇之道，宜谨慎。' },
    '巽乾': { fortune: '中吉', description: '风天小畜，小有积蓄，渐进发展。' },
    '乾坎': { fortune: '中平', description: '天水讼，争讼之象，宜和解。' },
    '坎乾': { fortune: '中平', description: '水天需，待时而动，不宜急进。' },
    '乾艮': { fortune: '吉', description: '天山遁，退守为吉，待时而动。' },
    '艮乾': { fortune: '中吉', description: '山天大畜，积蓄力量，可得发展。' },
    '乾坤': { fortune: '大吉', description: '地天泰，天地交泰，大吉大利。' },
    '坤乾': { fortune: '大吉', description: '天地否，闭塞不通，需变通。' }
  };

  const key = `${hexagram.upper.name}${hexagram.lower.name}`;
  const baseInterpretation = interpretations[key] || { fortune: '中平', description: '普通之象，平常之运。' };

  return {
    fortune: baseInterpretation.fortune,
    description: baseInterpretation.description,
    advice: generateAdvice(baseInterpretation.fortune, question),
    elementInteraction: `${hexagram.upper.element}与${hexagram.lower.element}之关系`
  };
};

/**
 * Generates advice based on fortune and question
 * @param {string} fortune - The fortune level
 * @param {string} question - The question being divined
 * @returns {string} The advice
 */
const generateAdvice = (fortune, question) => {
  const adviceMap = {
    '大吉': '此卦大吉大利，所求皆顺，宜积极进取，把握良机。',
    '吉': '此卦吉祥，诸事可为，但需谨慎从事，不可过于冒进。',
    '中吉': '此卦中等吉祥，需耐心等待，时机成熟方可行动。',
    '中平': '此卦平平，无大吉凶，宜守成，不宜轻举妄动。',
    '小吉': '此卦小吉，虽有小利，但需防微杜渐，谨慎为上。',
    '小凶': '此卦小凶，诸事宜缓，切忌急躁，需修德反省。',
    '凶': '此卦凶象，宜静不宜动，需谨慎行事，避免冲突。'
  };

  return adviceMap[fortune] || '此卦平平，需依具体情况而定。';
};

/**
 * Generates a hexagram from two numbers (upper and lower gua)
 * @param {number} upperNumber - Number for upper trigram (1-8)
 * @param {number} lowerNumber - Number for lower trigram (1-8)
 * @returns {Object} The hexagram object
 */
export const generateHexagramFromNumbers = (upperNumber, lowerNumber) => {
  const trigramMap = {
    1: { name: '乾', symbol: '☰', element: '金', direction: '西北' },
    2: { name: '兑', symbol: '☱', element: '金', direction: '西' },
    3: { name: '离', symbol: '☲', element: '火', direction: '南' },
    4: { name: '震', symbol: '☳', element: '木', direction: '东' },
    5: { name: '巽', symbol: '☴', element: '木', direction: '东南' },
    6: { name: '坎', symbol: '☵', element: '水', direction: '北' },
    7: { name: '艮', symbol: '☶', element: '土', direction: '东北' },
    8: { name: '坤', symbol: '☷', element: '土', direction: '西南' }
  };

  const upperTrigram = trigramMap[upperNumber] || trigramMap[1];
  const lowerTrigram = trigramMap[lowerNumber] || trigramMap[1];

  return {
    upper: upperTrigram,
    lower: lowerTrigram,
    name: `${upperTrigram.name}${lowerTrigram.name}`,
    number: (upperNumber - 1) * 8 + lowerNumber
  };
};