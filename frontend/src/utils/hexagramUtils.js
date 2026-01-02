/**
 * 六爻占卜工具库
 * 提供卦象生成、解析、八卦、六十四卦等计算功能
 */

// 定义六爻基本数据
export const YAO_TYPES = {
  SHAO_YANG: { name: '少阳', symbol: '⚊', value: 1, desc: '少阳' },
  SHAO_YIN: { name: '少阴', symbol: '⚋', value: 0, desc: '少阴' },
  LAO_YANG: { name: '老阳', symbol: '⚊○', value: 3, desc: '老阳(变爻)' },
  LAO_YIN: { name: '老阴', symbol: '⚋×', value: 2, desc: '老阴(变爻)' }
};

// 八卦数据
export const EIGHT_TRIGRAMS = {
  '111': { name: '乾', nature: '天', image: '☰', wuxing: '金', number: 1, family: '父' },
  '011': { name: '兑', nature: '泽', image: '☱', wuxing: '金', number: 2, family: '少女' },
  '101': { name: '离', nature: '火', image: '☲', wuxing: '火', number: 3, family: '中女' },
  '001': { name: '震', nature: '雷', image: '☳', wuxing: '木', number: 4, family: '长男' },
  '110': { name: '巽', nature: '风', image: '☴', wuxing: '木', number: 5, family: '长女' },
  '010': { name: '坎', nature: '水', image: '☵', wuxing: '水', number: 6, family: '中男' },
  '100': { name: '艮', nature: '山', image: '☶', wuxing: '土', number: 7, family: '少男' },
  '000': { name: '坤', nature: '地', image: '☷', wuxing: '土', number: 8, family: '母' }
};

// 五行生克关系
export const WUXING_SHENGKE = {
  '金': { 生: '水', 克: '木', 被生: '土', 被克: '火' },
  '木': { 生: '火', 克: '土', 被生: '水', 被克: '金' },
  '水': { 生: '木', 克: '火', 被生: '金', 被克: '土' },
  '火': { 生: '土', 克: '金', 被生: '木', 被克: '水' },
  '土': { 生: '金', 克: '水', 被生: '火', 被克: '木' }
};

// 六十四卦辞
export const HEXAGRAMS = {
  '111111': { name: '乾为天', desc: '刚健中正，自强不息' },
  '011111': { name: '天泽履', desc: '脚踏实地，谨慎行事' },
  '101111': { name: '天火同人', desc: '志同道合，人际关系和谐' },
  '001111': { name: '天雷无妄', desc: '真实无虚，顺其自然' },
  '110111': { name: '天风姤', desc: '不期而遇，机缘巧合' },
  '010111': { name: '天水讼', desc: '争议诉讼，宜和解不宜争' },
  '100111': { name: '天山遁', desc: '退避隐遁，待时而动' },
  '000111': { name: '天地否', desc: '闭塞不通，等待转机' },
  '111011': { name: '泽天夬', desc: '决断明快，当断则断' },
  '011011': { name: '兑为泽', desc: '喜悦和顺，沟通顺畅' },
  '101011': { name: '泽火革', desc: '变革革新，破旧立新' },
  '001011': { name: '泽雷随', desc: '随从顺从，随机应变' },
  '110011': { name: '泽风大过', desc: '过度非常，谨慎行事' },
  '010011': { name: '泽水困', desc: '困境束缚，耐心等待' },
  '100011': { name: '泽山咸', desc: '感应相应，情感交流' },
  '000011': { name: '泽地萃', desc: '荟萃聚集，人才汇集' },
  '111101': { name: '火天大有', desc: '大有收获，光明昌隆' },
  '011101': { name: '火泽睽', desc: '意见相左，求同存异' },
  '101101': { name: '离为火', desc: '光明美丽，依附依靠' },
  '001101': { name: '火雷噬嗑', desc: '咬合咀嚼，解决阻碍' },
  '110101': { name: '火风鼎', desc: '鼎新变革，稳中求进' },
  '010101': { name: '火水未济', desc: '事未完成，坚持到底' },
  '100101': { name: '火山旅', desc: '旅行不定，暂时安顿' },
  '000101': { name: '火地晋', desc: '晋升前进，光明在望' },
  '111001': { name: '雷天大壮', desc: '强壮盛大，适可而止' },
  '011001': { name: '雷泽归妹', desc: '婚嫁归宿，名正言顺' },
  '101001': { name: '雷火丰', desc: '丰盛盛大，持盈保泰' },
  '001001': { name: '震为雷', desc: '震动奋发，积极行动' },
  '110001': { name: '雷风恒', desc: '恒久持续，持之以恒' },
  '010001': { name: '雷水解', desc: '解除困境，舒缓解放' },
  '100001': { name: '雷山小过', desc: '小有过错，谨慎谦逊' },
  '000001': { name: '雷地豫', desc: '愉悦安乐，预做准备' },
  '111110': { name: '风天小畜', desc: '小有积蓄，蓄势待发' },
  '011110': { name: '风泽中孚', desc: '诚信中道，内心诚实' },
  '101110': { name: '风火家人', desc: '家庭和谐，内外有序' },
  '001110': { name: '风雷益', desc: '增益有利，损上益下' },
  '110110': { name: '巽为风', desc: '顺从进入，无孔不入' },
  '010110': { name: '风水涣', desc: '涣散离散，重聚人心' },
  '100110': { name: '风山渐', desc: '渐进发展，循序渐进' },
  '000110': { name: '风地观', desc: '观察审时，展示示范' },
  '111010': { name: '水天需', desc: '需要等待，耐心守时' },
  '011010': { name: '水泽节', desc: '节制约束，适可而止' },
  '101010': { name: '水火既济', desc: '事已完成，慎终如始' },
  '001010': { name: '水雷屯', desc: '初生艰难，积蓄力量' },
  '110010': { name: '水风井', desc: '水井养人，修身养性' },
  '010010': { name: '坎为水', desc: '险陷艰难，诚信突破' },
  '100010': { name: '水山蹇', desc: '艰难险阻，见险能止' },
  '000010': { name: '水地比', desc: '亲附比和，择善而从' },
  '111100': { name: '山天大畜', desc: '大有积蓄，厚积薄发' },
  '011100': { name: '山泽损', desc: '减损损失，损下益上' },
  '101100': { name: '山火贲', desc: '装饰美化，文饰有礼' },
  '001100': { name: '山雷颐', desc: '颐养养生，自求口实' },
  '110100': { name: '山风蛊', desc: '腐败革新，整治混乱' },
  '010100': { name: '山水蒙', desc: '启蒙教育，启发智慧' },
  '100100': { name: '艮为山', desc: '静止稳重，适可而止' },
  '000100': { name: '山地剥', desc: '剥落侵蚀，顺势而止' },
  '111000': { name: '地天泰', desc: '通泰安泰，小往大来' },
  '011000': { name: '地泽临', desc: '临下视察，教思无穷' },
  '101000': { name: '地火明夷', desc: '光明负伤，晦而转明' },
  '001000': { name: '地雷复', desc: '复归回复，周而复始' },
  '110000': { name: '地风升', desc: '上升发展，积小成高' },
  '010000': { name: '地水师', desc: '统师率众，用险而顺' },
  '100000': { name: '地山谦', desc: '谦逊退让，卑以自牧' },
  '000000': { name: '坤为地', desc: '柔顺包容，厚德载物' }
};

// 常量定义
export const STORAGE_KEY = 'liuyaoHistory';
export const MAX_HISTORY_LENGTH = 20;
export const SHAKE_INTERVAL = 50;
export const SHAKE_STEP = 10;

/**
 * 解析卦象（纯函数）
 * @param {Array} gua - 卦象数组，包含6个爻对象
 * @returns {Object} 包含卦名和描述的对象
 */
export const interpretGua = (gua) => {
  let upperCode = '';
  let lowerCode = '';

  // 下卦 (1-3爻)
  for (let i = 2; i >= 0; i--) {
    lowerCode += gua[i].value % 2;
  }

  // 上卦 (4-6爻)
  for (let i = 5; i >= 3; i--) {
    upperCode += gua[i].value % 2;
  }

  const upperTrigram = EIGHT_TRIGRAMS[upperCode] || { name: '?', nature: '未知', wuxing: '', image: '?' };
  const lowerTrigram = EIGHT_TRIGRAMS[lowerCode] || { name: '?', nature: '未知', wuxing: '', image: '?' };

  const fullCode = lowerCode + upperCode;
  const hexagram = HEXAGRAMS[fullCode] || {
    name: `${lowerTrigram.name}${upperTrigram.name}`,
    desc: `${lowerTrigram.nature}${upperTrigram.nature}相叠，需结合具体爻辞解卦`
  };

  return { name: hexagram.name, desc: hexagram.desc };
};

/**
 * 模拟铜钱摇卦
 * @returns {Object} 爻类型对象
 */
export const shakeCoin = () => {
  const random = Math.random();
  if (random < 0.25) return YAO_TYPES.SHAO_YANG;
  if (random < 0.5) return YAO_TYPES.SHAO_YIN;
  if (random < 0.75) return YAO_TYPES.LAO_YANG;
  return YAO_TYPES.LAO_YIN;
};

/**
 * 生成六爻卦象
 * @returns {Array} 包含6个爻对象的数组
 */
export const generateHexagram = () => {
  const gua = [];
  for (let i = 0; i < 6; i++) {
    gua.push(shakeCoin());
  }
  return gua;
};

/**
 * 计算卦象中的变爻数量
 * @param {Array} gua - 卦象数组
 * @returns {number} 变爻数量
 */
export const getChangingYaoCount = (gua) => {
  return gua.filter(yao => yao.value >= 2).length;
};

/**
 * 获取卦象的二进制表示
 * @param {Array} gua - 卦象数组
 * @returns {string} 6位二进制字符串
 */
export const getBinaryCode = (gua) => {
  let code = '';
  // 从下到上（爻1到爻6）
  for (let i = 0; i < 6; i++) {
    code += gua[i].value % 2;
  }
  return code;
};

/**
 * 根据二进制代码获取卦象
 * @param {string} binaryCode - 6位二进制字符串
 * @returns {Object} 卦象对象，包含卦名和描述
 */
export const getHexagramByBinary = (binaryCode) => {
  return HEXAGRAMS[binaryCode] || {
    name: '未知卦象',
    desc: '未找到对应的卦象'
  };
};

/**
 * 获取八卦的五行属性
 * @param {string} trigramName - 八卦名称（如 '乾'）
 * @returns {string} 五行属性
 */
export const getTrigramWuxing = (trigramName) => {
  const trigram = Object.values(EIGHT_TRIGRAMS).find(t => t.name === trigramName);
  return trigram ? trigram.wuxing : '';
};

/**
 * 获取卦象的完整解析（包含八卦信息）
 * @param {Array} gua - 卦象数组
 * @returns {Object} 完整的解析结果
 */
export const getFullInterpretation = (gua) => {
  const { name, desc } = interpretGua(gua);
  const binaryCode = getBinaryCode(gua);
  const changingCount = getChangingYaoCount(gua);
  
  let upperCode = '';
  let lowerCode = '';
  for (let i = 2; i >= 0; i--) lowerCode += gua[i].value % 2;
  for (let i = 5; i >= 3; i--) upperCode += gua[i].value % 2;
  
  const upperTrigram = EIGHT_TRIGRAMS[upperCode] || { name: '?', nature: '未知', wuxing: '', image: '?' };
  const lowerTrigram = EIGHT_TRIGRAMS[lowerCode] || { name: '?', nature: '未知', wuxing: '', image: '?' };
  
  return {
    hexagram: { name, desc },
    binaryCode,
    changingCount,
    upperTrigram,
    lowerTrigram,
    wuxingRelations: {
      upper: WUXING_SHENGKE[upperTrigram.wuxing] || null,
      lower: WUXING_SHENGKE[lowerTrigram.wuxing] || null
    }
  };
};

/**
 * 八卦数字映射（梅花易数专用）
 * 数字 1-8 对应八卦
 */
export const TRIGRAM_NUMBER_MAP = {
  1: '111', // 乾
  2: '011', // 兑
  3: '101', // 离
  4: '001', // 震
  5: '110', // 巽
  6: '010', // 坎
  7: '100', // 艮
  8: '000'  // 坤
};

/**
 * 计算八卦数字（梅花易数）
 * @param {number} num - 任意数字
 * @returns {number} 八卦数字（1-8）
 */
export const calculateTrigramNumber = (num) => {
  let remainder = num % 8;
  if (remainder === 0) remainder = 8;
  return remainder;
};

/**
 * 计算动爻（梅花易数）
 * @param {number} num - 任意数字
 * @returns {number} 动爻位置（1-6）
 */
export const calculateMovingYao = (num) => {
  let remainder = num % 6;
  if (remainder === 0) remainder = 6;
  return remainder;
};

/**
 * 根据数字获取八卦（梅花易数）
 * @param {number} num - 八卦数字（1-8）
 * @returns {Object} 八卦对象
 */
export const getTrigramByNumber = (num) => {
  const binaryCode = TRIGRAM_NUMBER_MAP[num] || '111';
  return EIGHT_TRIGRAMS[binaryCode] || EIGHT_TRIGRAMS['111'];
};

/**
 * 确定体用关系（梅花易数）
 * @param {Object} lowerTrigram - 下卦对象
 * @param {Object} upperTrigram - 上卦对象
 * @param {number} movingYao - 动爻位置（1-6）
 * @returns {Object} 体用关系对象
 */
export const determineTiYong = (lowerTrigram, upperTrigram, movingYao) => {
  // 简单判断：有动爻的卦为用卦，无动爻的为体卦
  // 这里简化处理，假设下卦为体卦，上卦为用卦
  return {
    ti: lowerTrigram,  // 体卦
    yong: upperTrigram, // 用卦
    relation: getWuxingRelation(lowerTrigram.wuxing, upperTrigram.wuxing)
  };
};

/**
 * 获取五行关系（梅花易数）
 * @param {string} tiWuxing - 体卦五行
 * @param {string} yongWuxing - 用卦五行
 * @returns {Object} 五行关系对象
 */
export const getWuxingRelation = (tiWuxing, yongWuxing) => {
  const tiRelation = WUXING_SHENGKE[tiWuxing] || {};
  const yongRelation = WUXING_SHENGKE[yongWuxing] || {};

  if (tiWuxing === yongWuxing) {
    return { type: '比和', meaning: '吉，和谐相助' };
  } else if (tiRelation.生 === yongWuxing) {
    return { type: '体生用', meaning: '小凶，泄体之气' };
  } else if (tiRelation.克 === yongWuxing) {
    return { type: '体克用', meaning: '吉，我能胜事' };
  } else if (tiRelation.被生 === yongWuxing) {
    return { type: '用生体', meaning: '大吉，得助成功' };
  } else if (tiRelation.被克 === yongWuxing) {
    return { type: '用克体', meaning: '大凶，事来克我' };
  }

  return { type: '关系不明', meaning: '需结合具体分析' };
};

/**
 * 解读结果（梅花易数）
 * @param {Object} lowerTrigram - 下卦对象
 * @param {Object} upperTrigram - 上卦对象
 * @param {Object} tiYong - 体用关系对象
 * @param {number} movingYao - 动爻位置（1-6）
 * @param {string} externalSign - 外应描述
 * @returns {string} 解读文本
 */
export const interpretResult = (lowerTrigram, upperTrigram, tiYong, movingYao, externalSign = '') => {
  const tiName = lowerTrigram.nature;
  const yongName = upperTrigram.nature;
  const relation = tiYong.relation;

  let interpretation = `本卦为${lowerTrigram.name}${upperTrigram.name}，${lowerTrigram.nature}${upperTrigram.nature}相叠。`;
  interpretation += `体卦为${tiName}（${lowerTrigram.wuxing}），用卦为${yongName}（${upperTrigram.wuxing}）。`;
  interpretation += `体用关系：${relation.type}，主${relation.meaning}。`;

  if (movingYao) {
    interpretation += `动爻在第${movingYao}爻，主事态变化的关键所在。`;
  }

  if (externalSign) {
    interpretation += `外应"${externalSign}"提示需结合具体情境综合判断。`;
  }

  return interpretation;
};

/**
 * 根据下卦和上卦数字获取六十四卦键值
 * @param {number} lowerNum - 下卦数字（1-8）
 * @param {number} upperNum - 上卦数字（1-8）
 * @returns {string} 六位二进制键值
 */
export const getHexagramKeyFromNumbers = (lowerNum, upperNum) => {
  const lowerBinary = TRIGRAM_NUMBER_MAP[lowerNum] || '111';
  const upperBinary = TRIGRAM_NUMBER_MAP[upperNum] || '111';
  return lowerBinary + upperBinary;
};

/**
 * 根据下卦和上卦数字获取卦象
 * @param {number} lowerNum - 下卦数字（1-8）
 * @param {number} upperNum - 上卦数字（1-8）
 * @returns {Object} 卦象对象
 */
export const getHexagramByNumbers = (lowerNum, upperNum) => {
  const key = getHexagramKeyFromNumbers(lowerNum, upperNum);
  return HEXAGRAMS[key] || {
    name: `${getTrigramByNumber(lowerNum).name}${getTrigramByNumber(upperNum).name}`,
    desc: '无具体卦辞，需结合体用生克解卦'
  };
};

export default {
  YAO_TYPES,
  EIGHT_TRIGRAMS,
  HEXAGRAMS,
  WUXING_SHENGKE,
  STORAGE_KEY,
  MAX_HISTORY_LENGTH,
  SHAKE_INTERVAL,
  SHAKE_STEP,
  interpretGua,
  shakeCoin,
  generateHexagram,
  getChangingYaoCount,
  getBinaryCode,
  getHexagramByBinary,
  getTrigramWuxing,
  getFullInterpretation,
  TRIGRAM_NUMBER_MAP,
  calculateTrigramNumber,
  calculateMovingYao,
  getTrigramByNumber,
  determineTiYong,
  getWuxingRelation,
  interpretResult,
  getHexagramKeyFromNumbers,
  getHexagramByNumbers
};