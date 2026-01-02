import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 常量定义
const STORAGE_KEY = 'plumHistory';
const MAX_HISTORY_LENGTH = 20;
const CALCULATION_DELAY = 800;

// 八卦数据
const EIGHT_TRIGRAMS = {
  1: { name: '乾', nature: '天', image: '☰', wuxing: '金', number: 1, family: '父' },
  2: { name: '兑', nature: '泽', image: '☱', wuxing: '金', number: 2, family: '少女' },
  3: { name: '离', nature: '火', image: '☲', wuxing: '火', number: 3, family: '中女' },
  4: { name: '震', nature: '雷', image: '☳', wuxing: '木', number: 4, family: '长男' },
  5: { name: '巽', nature: '风', image: '☴', wuxing: '木', number: 5, family: '长女' },
  6: { name: '坎', nature: '水', image: '☵', wuxing: '水', number: 6, family: '中男' },
  7: { name: '艮', nature: '山', image: '☶', wuxing: '土', number: 7, family: '少男' },
  8: { name: '坤', nature: '地', image: '☷', wuxing: '土', number: 8, family: '母' }
};

// 六十四卦数据
const HEXAGRAMS = {
  '11': { name: '乾为天', desc: '刚健中正，自强不息' },
  '12': { name: '天泽履', desc: '脚踏实地，谨慎行事' },
  '13': { name: '天火同人', desc: '志同道合，人际关系和谐' },
  '14': { name: '天雷无妄', desc: '真实无虚，顺其自然' },
  '15': { name: '天风姤', desc: '不期而遇，机缘巧合' },
  '16': { name: '天水讼', desc: '争议诉讼，宜和解不宜争' },
  '17': { name: '天山遁', desc: '退避隐遁，待时而动' },
  '18': { name: '天地否', desc: '闭塞不通，等待转机' },
  '21': { name: '泽天夬', desc: '决断明快，当断则断' },
  '22': { name: '兑为泽', desc: '喜悦和顺，沟通顺畅' },
  '23': { name: '泽火革', desc: '变革革新，破旧立新' },
  '24': { name: '泽雷随', desc: '随从顺从，随机应变' },
  '25': { name: '泽风大过', desc: '过度非常，谨慎行事' },
  '26': { name: '泽水困', desc: '困境束缚，耐心等待' },
  '27': { name: '泽山咸', desc: '感应相应，情感交流' },
  '28': { name: '泽地萃', desc: '荟萃聚集，人才汇集' },
  '31': { name: '火天大有', desc: '大有收获，光明昌隆' },
  '32': { name: '火泽睽', desc: '意见相左，求同存异' },
  '33': { name: '离为火', desc: '光明美丽，依附依靠' },
  '34': { name: '火雷噬嗑', desc: '咬合咀嚼，解决阻碍' },
  '35': { name: '火风鼎', desc: '鼎新变革，稳中求进' },
  '36': { name: '火水未济', desc: '事未完成，坚持到底' },
  '37': { name: '火山旅', desc: '旅行不定，暂时安顿' },
  '38': { name: '火地晋', desc: '晋升前进，光明在望' },
  '41': { name: '雷天大壮', desc: '强壮盛大，适可而止' },
  '42': { name: '雷泽归妹', desc: '婚嫁归宿，名正言顺' },
  '43': { name: '雷火丰', desc: '丰盛盛大，持盈保泰' },
  '44': { name: '震为雷', desc: '震动奋发，积极行动' },
  '45': { name: '雷风恒', desc: '恒久持续，持之以恒' },
  '46': { name: '雷水解', desc: '解除困境，舒缓解放' },
  '47': { name: '雷山小过', desc: '小有过错，谨慎谦逊' },
  '48': { name: '雷地豫', desc: '愉悦安乐，预做准备' },
  '51': { name: '风天小畜', desc: '小有积蓄，蓄势待发' },
  '52': { name: '风泽中孚', desc: '诚信中道，内心诚实' },
  '53': { name: '风火家人', desc: '家庭和谐，内外有序' },
  '54': { name: '风雷益', desc: '增益有利，损上益下' },
  '55': { name: '巽为风', desc: '顺从进入，无孔不入' },
  '56': { name: '风水涣', desc: '涣散离散，重聚人心' },
  '57': { name: '风山渐', desc: '渐进发展，循序渐进' },
  '58': { name: '风地观', desc: '观察审时，展示示范' },
  '61': { name: '水天需', desc: '需要等待，耐心守时' },
  '62': { name: '水泽节', desc: '节制约束，适可而止' },
  '63': { name: '水火既济', desc: '事已完成，慎终如始' },
  '64': { name: '水雷屯', desc: '初生艰难，积蓄力量' },
  '65': { name: '水风井', desc: '水井养人，修身养性' },
  '66': { name: '坎为水', desc: '险陷艰难，诚信突破' },
  '67': { name: '水山蹇', desc: '艰难险阻，见险能止' },
  '68': { name: '水地比', desc: '亲附比和，择善而从' },
  '71': { name: '山天大畜', desc: '大有积蓄，厚积薄发' },
  '72': { name: '山泽损', desc: '减损损失，损下益上' },
  '73': { name: '山火贲', desc: '装饰美化，文饰有礼' },
  '74': { name: '山雷颐', desc: '颐养养生，自求口实' },
  '75': { name: '山风蛊', desc: '腐败革新，整治混乱' },
  '76': { name: '山水蒙', desc: '启蒙教育，启发智慧' },
  '77': { name: '艮为山', desc: '静止稳重，适可而止' },
  '78': { name: '山地剥', desc: '剥落侵蚀，顺势而止' },
  '81': { name: '地天泰', desc: '通泰安泰，小往大来' },
  '82': { name: '地泽临', desc: '临下视察，教思无穷' },
  '83': { name: '地火明夷', desc: '光明负伤，晦而转明' },
  '84': { name: '地雷复', desc: '复归回复，周而复始' },
  '85': { name: '地风升', desc: '上升发展，积小成高' },
  '86': { name: '地水师', desc: '统师率众，用险而顺' },
  '87': { name: '地山谦', desc: '谦逊退让，卑以自牧' },
  '88': { name: '坤为地', desc: '柔顺包容，厚德载物' }
};

// 五行生克关系
const WUXING_SHENGKE = {
  '金': { 生: '水', 克: '木', 被生: '土', 被克: '火' },
  '木': { 生: '火', 克: '土', 被生: '水', 被克: '金' },
  '水': { 生: '木', 克: '火', 被生: '金', 被克: '土' },
  '火': { 生: '土', 克: '金', 被生: '木', 被克: '水' },
  '土': { 生: '金', 克: '水', 被生: '火', 被克: '木' }
};

const PlumBlossomDivination = () => {
  // 状态管理
  const [method, setMethod] = useState('number');
  const [numbers, setNumbers] = useState(['', '', '']);
  const [currentGua, setCurrentGua] = useState(null);
  const [history, setHistory] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [externalSign, setExternalSign] = useState('');
  const [dateTime, setDateTime] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes()
  });

  // 从localStorage加载历史记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 保存历史记录到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, [history]);

  // 计算八卦数字
  const calculateTrigramNumber = (num) => {
    let remainder = num % 8;
    if (remainder === 0) remainder = 8;
    return remainder;
  };

  // 计算动爻
  const calculateMovingYao = (num) => {
    let remainder = num % 6;
    if (remainder === 0) remainder = 6;
    return remainder;
  };

  // 根据数字获取八卦
  const getTrigramByNumber = (num) => {
    return EIGHT_TRIGRAMS[num] || EIGHT_TRIGRAMS[1];
  };

  // 数字起卦 - 使用useCallback优化
  const divineByNumbers = useCallback(() => {
    if (numbers.some(n => n === '')) {
      alert('请先输入三个数字');
      return;
    }

    setCalculating(true);

    setTimeout(() => {
      const [num1, num2, num3] = numbers.map(n => parseInt(n) || 1);

      const upperNum = calculateTrigramNumber(num1);
      const upperTrigram = getTrigramByNumber(upperNum);

      const lowerNum = calculateTrigramNumber(num2);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(num3);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '无具体卦辞，需结合体用生克解卦'
      };

      const interLower = calculateTrigramNumber(lowerNum + 1);
      const interUpper = calculateTrigramNumber(upperNum - 1);
      const huGuaKey = `${interLower}${interUpper}`;
      const huGua = HEXAGRAMS[huGuaKey] || {
        name: `${getTrigramByNumber(interLower).name}${getTrigramByNumber(interUpper).name}`,
        desc: '互卦'
      };

      const bianGuaKey = `${lowerNum}${upperNum}`;
      const bianGua = HEXAGRAMS[bianGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}之卦`,
        desc: '变卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '数字起卦',
        numbers: [...numbers],
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        huGua: { ...huGua, key: huGuaKey },
        bianGua: { ...bianGua, key: bianGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [numbers]);

  // 时间起卦 - 使用useCallback优化
  const divineByTime = useCallback(() => {
    setCalculating(true);

    setTimeout(() => {
      const { year, month, day, hour, minute } = dateTime;

      const yearNum = (year % 12) || 12;
      const upperNum = calculateTrigramNumber(yearNum + month + day);
      const upperTrigram = getTrigramByNumber(upperNum);

      const lowerNum = calculateTrigramNumber(hour + minute);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(yearNum + month + day + hour + minute);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '无具体卦辞，需结合体用生克解卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '时间起卦',
        time: { year, month, day, hour, minute },
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [dateTime]);

  // 外应起卦 - 使用useCallback优化
  const divineByExternal = useCallback(() => {
    if (!externalSign.trim()) {
      alert('请输入外应描述');
      return;
    }

    setCalculating(true);

    setTimeout(() => {
      const charCount = externalSign.length;
      const upperNum = calculateTrigramNumber(charCount);
      const upperTrigram = getTrigramByNumber(upperNum);

      const minute = new Date().getMinutes();
      const lowerNum = calculateTrigramNumber(minute || 1);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(charCount + minute);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '外应起卦，需结合具体情境解卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '外应起卦',
        externalSign,
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao, externalSign)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [externalSign]);

  // 确定体用关系 - 使用useCallback优化
  const determineTiYong = useCallback((lowerTrigram, upperTrigram, movingYao) => {
    // 简单判断：有动爻的卦为用卦，无动爻的为体卦
    // 这里简化处理，假设下卦为体卦，上卦为用卦
    return {
      ti: lowerTrigram,  // 体卦
      yong: upperTrigram, // 用卦
      relation: getWuxingRelation(lowerTrigram.wuxing, upperTrigram.wuxing)
    };
  }, []);

  // 获取五行关系 - 使用useCallback优化
  const getWuxingRelation = useCallback((tiWuxing, yongWuxing) => {
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
  }, []);

  // 解读结果 - 使用useCallback优化
  const interpretResult = useCallback((lowerTrigram, upperTrigram, tiYong, movingYao, externalSign = '') => {
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
  }, []);

  // 清除历史记录 - 使用useCallback优化
  const clearHistory = useCallback(() => {
    if (window.confirm('确定要清除所有历史记录吗？')) {
      setHistory([]);
    }
  }, []);

  // 重置当前卦 - 使用useCallback优化
  const resetCurrent = useCallback(() => {
    setCurrentGua(null);
    setShowDetails(false);
    setNumbers(['', '', '']);
    setExternalSign('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4 text-gray-800 dark:text-gray-100">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <header className="text-center mb-6 pt-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-2">
            梅花易数
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">以数起卦，观象明理</p>
        </header>

        {/* 起卦方法选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6 border border-purple-200 dark:border-purple-700">
          <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">选择起卦方法</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { id: 'number', name: '数字起卦', desc: '输入三个数字' },
              { id: 'time', name: '时间起卦', desc: '使用当前时间' },
              { id: 'external', name: '外应起卦', desc: '观物取象' }
            ].map(methodItem => (
              <button
                key={methodItem.id}
                onClick={() => {
                  setMethod(methodItem.id);
                  resetCurrent();
                }}
                className={`p-3 rounded-xl transition-all ${method === methodItem.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white dark:from-purple-700 dark:to-pink-700 shadow-md'
                  : 'bg-purple-50 dark:bg-gray-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{methodItem.name}</div>
                <div className="text-xs mt-1 opacity-80">{methodItem.desc}</div>
              </button>
            ))}
          </div>

          {/* 数字起卦 */}
          {method === 'number' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 dark:text-purple-300 font-medium mb-3">请输入三个数字（1-100）</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(index => (
                    <div key={index}>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">数字{index + 1}</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numbers[index]}
                        onChange={(e) => {
                          const newNumbers = [...numbers];
                          newNumbers[index] = e.target.value;
                          setNumbers(newNumbers);
                        }}
                        className="w-full p-3 border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800 dark:text-gray-100"
                        placeholder={`如: ${[7, 8, 9][index]}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">三个数字分别对应：上卦、下卦、动爻</p>
              </div>
              
              <button
                onClick={divineByNumbers}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    推算中...
                  </div>
                ) : '开始起卦'}
              </button>
            </div>
          )}

          {/* 时间起卦 */}
          {method === 'time' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 font-medium mb-3">选择起卦时间</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'year', label: '年', value: dateTime.year, min: 1900, max: 2100 },
                    { id: 'month', label: '月', value: dateTime.month, min: 1, max: 12 },
                    { id: 'day', label: '日', value: dateTime.day, min: 1, max: 31 },
                    { id: 'hour', label: '时', value: dateTime.hour, min: 0, max: 23 },
                  ].map(item => (
                    <div key={item.id}>
                      <label className="block text-sm text-gray-600 mb-1">{item.label}</label>
                      <input
                        type="number"
                        min={item.min}
                        max={item.max}
                        value={item.value}
                        onChange={(e) => setDateTime({
                          ...dateTime,
                          [item.id]: parseInt(e.target.value) || item.min
                        })}
                        className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">以年月日为上卦，时分秒为下卦</p>
              </div>
              
              <button
                onClick={divineByTime}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    推算中...
                  </div>
                ) : '以此时起卦'}
              </button>
            </div>
          )}

          {/* 外应起卦 */}
          {method === 'external' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 font-medium mb-3">输入外应（所见所闻所想）</h3>
                <textarea
                  value={externalSign}
                  onChange={(e) => setExternalSign(e.target.value)}
                  className="w-full h-32 p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  placeholder="如：见喜鹊鸣叫、心中突然想到某事、听到特定声音等..."
                />
                <p className="text-sm text-gray-500 mt-2">外应即起卦时观察到的特殊现象或心中所想</p>
              </div>
              
              <button
                onClick={divineByExternal}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    观象中...
                  </div>
                ) : '以外应起卦'}
              </button>
            </div>
          )}
        </div>

        {/* 卦象结果展示 */}
        {currentGua && showDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-purple-200 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-800">卦象结果</h2>
              <button 
                onClick={resetCurrent}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm"
              >
                重新起卦
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 卦象基本信息 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-purple-900">{currentGua.benGua.name}</h3>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {currentGua.method}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{currentGua.benGua.desc}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-4xl mb-2">{currentGua.lowerTrigram.image}</div>
                    <div className="font-medium">{currentGua.lowerTrigram.name}卦（{currentGua.lowerTrigram.nature}）</div>
                    <div className="text-sm text-gray-600">下卦 · 体卦</div>
                    <div className="text-sm mt-1">五行：{currentGua.lowerTrigram.wuxing}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-4xl mb-2">{currentGua.upperTrigram.image}</div>
                    <div className="font-medium">{currentGua.upperTrigram.name}卦（{currentGua.upperTrigram.nature}）</div>
                    <div className="text-sm text-gray-600">上卦 · 用卦</div>
                    <div className="text-sm mt-1">五行：{currentGua.upperTrigram.wuxing}</div>
                  </div>
                </div>
              </div>

              {/* 体用生克 */}
              {currentGua.tiYong && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3">体用生克</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-blue-600 font-medium">体卦</div>
                      <div className="text-xl font-bold">{currentGua.tiYong.ti.nature}</div>
                      <div className="text-sm text-gray-600">{currentGua.tiYong.ti.wuxing}行</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-pink-600 font-medium">用卦</div>
                      <div className="text-xl font-bold">{currentGua.tiYong.yong.nature}</div>
                      <div className="text-sm text-gray-600">{currentGua.tiYong.yong.wuxing}行</div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center font-medium ${
                    currentGua.tiYong.relation.type.includes('吉') 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : currentGua.tiYong.relation.type.includes('凶')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {currentGua.tiYong.relation.type} · {currentGua.tiYong.relation.meaning}
                  </div>
                </div>
              )}

              {/* 动爻信息 */}
              {currentGua.movingYao && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-2">动爻信息</h3>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xl font-bold mr-4">
                      {currentGua.movingYao}
                    </div>
                    <div>
                      <div className="font-medium">第{currentGua.movingYao}爻为动爻</div>
                      <div className="text-sm text-gray-600">主事态变化、关键转折</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 卦象解读 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">卦象解读</h3>
                <p className="text-gray-700 leading-relaxed">{currentGua.interpretation}</p>
              </div>

              {/* 卦象时间 */}
              <div className="text-center text-sm text-gray-500 border-t pt-3">
                起卦时间：{currentGua.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-800">历史记录</h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-red-50 dark:bg-red-900 hover:bg-red-100 text-red-600 dark:text-red-300 rounded-full text-sm"
              >
                清除记录
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">🌸</div>
              <p>暂无历史记录</p>
              <p className="text-sm mt-1">起卦后记录将保存在本地</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className="border border-purple-100 rounded-xl p-4 hover:bg-purple-50 transition-colors"
                  onClick={() => {
                    setCurrentGua(record);
                    setShowDetails(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-purple-800">{record.benGua.name}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {record.method}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{record.lowerTrigram.image}{record.upperTrigram.image}</span>
                    <div className="text-sm text-gray-600">
                      {record.lowerTrigram.name}·{record.upperTrigram.name}卦
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{record.benGua.desc}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className={`px-2 py-1 rounded ${
                      record.tiYong?.relation.type.includes('吉') 
                        ? 'bg-green-100 text-green-700'
                        : record.tiYong?.relation.type.includes('凶')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.tiYong?.relation.type}
                    </div>
                    <span>{record.timestamp.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {history.length > 0 && (
            <div className="mt-4 text-center text-xs text-gray-500">
              共保存 {history.length} 条记录，最多保存{MAX_HISTORY_LENGTH}条
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white/80 rounded-xl p-4 border border-purple-200">
          <h3 className="font-medium text-purple-800 mb-3">梅花易数简介</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>数字起卦</strong>：输入任意三个数字，转化为卦象</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>时间起卦</strong>：以年月日时为数，计算卦象</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>外应起卦</strong>：观物取象，以所见所闻起卦</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>体用生克</strong>：体卦为问卦者，用卦为所问事，生克关系定吉凶</span>
            </li>
          </ul>
          <div className="mt-3 text-xs text-gray-500">
            注：本工具为梅花易数入门演示，实际占卜需结合卦辞爻辞、五行生克、外应等综合判断。
          </div>
        </div>

        <footer className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-purple-200">
          <p>梅花易数占卜系统 - 邵雍梅花易数原理</p>
          <p className="mt-1">观物取象，以数明理，仅供文化学习参考</p>
        </footer>
      </div>
    </div>
  );
};

export default PlumBlossomDivination;