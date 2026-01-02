import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 定义六爻基本数据
const YAO_TYPES = {
  SHAO_YANG: { name: '少阴', symbol: '⚊', value: 1, desc: '少阳' },
  SHAO_YIN: { name: '少阳', symbol: '⚋', value: 0, desc: '少阴' },
  LAO_YANG: { name: '老阳', symbol: '⚊○', value: 3, desc: '老阳(变爻)' },
  LAO_YIN: { name: '老阴', symbol: '⚋×', value: 2, desc: '老阴(变爻)' }
};

// 常量定义
const STORAGE_KEY = 'liuyaoHistory';
const MAX_HISTORY_LENGTH = 20;
const SHAKE_INTERVAL = 50;
const SHAKE_STEP = 10;

// 八卦数据
const EIGHT_TRIGRAMS = {
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
const WUXING_SHENGKE = {
  '金': { 生: '水', 克: '木', 被生: '土', 被克: '火' },
  '木': { 生: '火', 克: '土', 被生: '水', 被克: '金' },
  '水': { 生: '木', 克: '火', 被生: '金', 被克: '土' },
  '火': { 生: '土', 克: '金', 被生: '木', 被克: '水' },
  '土': { 生: '金', 克: '水', 被生: '火', 被克: '木' }
};

// 六十四卦辞
const HEXAGRAMS = {
  '111111': { name: '乾为天', desc: '刚健中正，自强不息' },
  '000000': { name: '坤为地', desc: '柔顺包容，厚德载物' },
  '010001': { name: '水雷屯', desc: '初生艰难，积蓄力量' },
  '100010': { name: '山水蒙', desc: '启蒙教育，启发智慧' },
  '111011': { name: '水天需', desc: '需要等待，耐心守时' },
  '011111': { name: '水地比', desc: '亲附比和，择善而从' },
  '111001': { name: '天水讼', desc: '争议诉讼，宜和解不宜争' },
  '111101': { name: '天火同人', desc: '志同道合，人际关系和谐' },
  '111110': { name: '天风姤', desc: '不期而遇，机缘巧合' },
  '101111': { name: '火天大有', desc: '大有收获，光明昌隆' },
  '011101': { name: '火泽睽', desc: '意见相左，求同存异' },
  '111101': { name: '离为火', desc: '光明美丽，依附依靠' },
  '101001': { name: '火雷噬嗑', desc: '咬合咀嚼，解决阻碍' },
  '101110': { name: '火风鼎', desc: '鼎新变革，稳中求进' },
  '101010': { name: '火水未济', desc: '事未完成，坚持到底' },
  '111100': { name: '火山旅', desc: '旅行不定，暂时安顿' },
  '011100': { name: '山地剥', desc: '剥落侵蚀，顺势而止' },
  '111000': { name: '地火明夷', desc: '光明负伤，晦而转明' },
  '000111': { name: '地雷复', desc: '复归回复，周而复始' },
  '000110': { name: '地风升', desc: '上升发展，积小成高' },
  '000010': { name: '地水师', desc: '统师率众，用险而顺' },
  '000000': { name: '坤为地', desc: '柔顺包容，厚德载物' },
  '001111': { name: '雷天大壮', desc: '强壮盛大，适可而止' },
  '001011': { name: '雷泽归妹', desc: '婚嫁归宿，名正言顺' },
  '001101': { name: '雷火丰', desc: '丰盛盛大，持盈保泰' },
  '000111': { name: '震为雷', desc: '震动奋发，积极行动' },
  '001110': { name: '雷风恒', desc: '恒久持续，持之以恒' },
  '001010': { name: '雷水解', desc: '解除困境，舒缓解放' },
  '001100': { name: '雷山小过', desc: '小有过错，谨慎谦逊' },
  '001000': { name: '雷地豫', desc: '愉悦安乐，预做准备' },
  '110111': { name: '风天小畜', desc: '小有积蓄，蓄势待发' },
  '110011': { name: '风泽中孚', desc: '诚信中道，内心诚实' },
  '110101': { name: '风火家人', desc: '家庭和谐，内外有序' },
  '111110': { name: '巽为风', desc: '顺从进入，无孔不入' },
  '110001': { name: '风雷益', desc: '增益有利，损上益下' },
  '110010': { name: '风水涣', desc: '涣散离散，重聚人心' },
  '110100': { name: '风山渐', desc: '渐进发展，循序渐进' },
  '110000': { name: '风地观', desc: '观察审时，展示示范' },
  '010111': { name: '泽天夬', desc: '决断明快，当断则断' },
  '011111': { name: '兑为泽', desc: '喜悦和顺，沟通顺畅' },
  '011101': { name: '泽火革', desc: '变革革新，破旧立新' },
  '011001': { name: '泽雷随', desc: '随从顺从，随机应变' },
  '011110': { name: '泽风大过', desc: '过度非常，谨慎行事' },
  '011010': { name: '泽水困', desc: '困境束缚，耐心等待' },
  '011100': { name: '泽山咸', desc: '感应相应，情感交流' },
  '010011': { name: '泽地萃', desc: '荟萃聚集，人才汇集' },
  '010010': { name: '坎为水', desc: '险陷艰难，诚信突破' },
  '010101': { name: '水火既济', desc: '事已完成，慎终如始' },
  '010001': { name: '水雷屯', desc: '初生艰难，积蓄力量' },
  '010110': { name: '水风井', desc: '水井养人，修身养性' },
  '010100': { name: '水山蹇', desc: '艰难险阻，见险能止' },
  '010000': { name: '水地比', desc: '亲附比和，择善而从' },
  '100111': { name: '山天大畜', desc: '大有积蓄，厚积薄发' },
  '100011': { name: '山泽损', desc: '减损损失，损下益上' },
  '100101': { name: '山火贲', desc: '装饰美化，文饰有礼' },
  '000111': { name: '山雷颐', desc: '颐养养生，自求口实' },
  '100110': { name: '山风蛊', desc: '腐败革新，整治混乱' },
  '100100': { name: '艮为山', desc: '静止稳重，适可而止' },
  '100000': { name: '山地剥', desc: '剥落侵蚀，顺势而止' },
  '000111': { name: '地天泰', desc: '通泰安泰，小往大来' },
  '000011': { name: '地泽临', desc: '临下视察，教思无穷' },
  '000101': { name: '地火明夷', desc: '光明负伤，晦而转明' },
  '000001': { name: '地雷复', desc: '复归回复，周而复始' },
  '000110': { name: '地风升', desc: '上升发展，积小成高' },
  '000010': { name: '地水师', desc: '统师率众，用险而顺' },
  '000100': { name: '地山谦', desc: '谦逊退让，卑以自牧' },
  '000000': { name: '坤为地', desc: '柔顺包容，厚德载物' }
};

const SixYaoDivination = () => {
  // 当前卦象状态
  const [currentGua, setCurrentGua] = useState([]);
  const [guaName, setGuaName] = useState('');
  const [guaDesc, setGuaDesc] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [shakeProgress, setShakeProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

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

  // 模拟铜钱摇卦 - 使用useCallback优化
  const shakeCoin = useCallback(() => {
    const random = Math.random();
    if (random < 0.25) return YAO_TYPES.SHAO_YANG;
    if (random < 0.5) return YAO_TYPES.SHAO_YIN;
    if (random < 0.75) return YAO_TYPES.LAO_YANG;
    return YAO_TYPES.LAO_YIN;
  }, []);

  // 执行摇卦动画
  const startShaking = useCallback(() => {
    if (isShaking) return;

    setIsShaking(true);
    setShowResult(false);
    setShakeProgress(0);

    const interval = setInterval(() => {
      setShakeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishShaking();
          return 100;
        }
        return prev + SHAKE_STEP;
      });
    }, SHAKE_INTERVAL);
  }, [isShaking]);

  // 完成摇卦
  const finishShaking = useCallback(() => {
    try {
      const newGua = [];
      for (let i = 0; i < 6; i++) {
        newGua.push(shakeCoin());
      }
      
      setCurrentGua(newGua);
      setIsShaking(false);
      
      // 解析卦象
      interpretGua(newGua);
      
      setShowResult(true);
    } catch (error) {
      console.error('摇卦过程出错:', error);
      setIsShaking(false);
      alert('摇卦过程出现错误，请重试');
    }
  }, [shakeCoin, interpretGua]);

  // 解析卦象 - 使用useCallback优化
  const interpretGua = useCallback((gua) => {
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

    setGuaName(hexagram.name);
    setGuaDesc(hexagram.desc);
  }, []);

  // 清除历史记录 - 使用useCallback优化
  const clearHistory = useCallback(() => {
    if (window.confirm('确定要清除所有历史记录吗？')) {
      setHistory([]);
    }
  }, []);

  // 重新摇卦 - 使用useCallback优化
  const reshake = useCallback(() => {
    setCurrentGua([]);
    setShowResult(false);
  }, []);

  // 计算变爻数量 - 使用useMemo优化
  const changingYaoCount = useMemo(() => {
    return currentGua.filter(yao => yao.value >= 2).length;
  }, [currentGua]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4 text-gray-800">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <header className="text-center mb-6 pt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-2">六爻占卜</h1>
          <p className="text-gray-600 text-sm">摇卦六次，记录爻象，生成卦象</p>
        </header>

        {/* 摇卦区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-amber-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-amber-800">摇卦区</h2>
            <button 
              onClick={reshake}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full text-sm"
            >
              重新摇卦
            </button>
          </div>
          
          {/* 摇卦按钮 */}
          <div className="mb-6">
            <button
              onClick={startShaking}
              disabled={isShaking}
              className={`w-full py-4 rounded-xl text-lg font-medium transition-all duration-300 ${isShaking 
                ? 'bg-amber-300 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isShaking ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  摇卦中 {shakeProgress}%
                </div>
              ) : (
                '开始摇卦'
              )}
            </button>
            
            {/* 摇卦进度条 */}
            {isShaking && (
              <div className="mt-4">
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${shakeProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">手持三枚铜钱，集中意念，默念所求之事</p>
              </div>
            )}
          </div>
          
          {/* 卦象展示 */}
          {currentGua.length > 0 && (
            <div className="border-t border-amber-100 pt-5">
              <h3 className="text-center font-medium text-amber-800 mb-4">本次卦象 (从下到上)</h3>
              
              <div className="space-y-2 mb-6">
                {currentGua.slice().reverse().map((yao, index) => {
                  const position = 5 - index;
                  return (
                    <div key={index} className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 mr-3">
                          {position + 1}爻
                        </span>
                        <span className="text-2xl">{yao.symbol}</span>
                      </div>
                      <span className={`font-medium ${yao.value >= 2 ? 'text-red-600' : 'text-blue-600'}`}>
                        {yao.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* 卦辞结果 */}
              {showResult && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="font-bold text-amber-900 text-lg mb-2">{guaName}</h3>
                  <p className="text-gray-700">{guaDesc}</p>
                  <div className="mt-4 text-sm text-gray-600 flex justify-between">
                    <span>变爻: {changingYaoCount}个</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-amber-800">历史记录</h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-sm"
              >
                清除记录
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">⚱️</div>
              <p>暂无历史记录</p>
              <p className="text-sm mt-1">摇卦后记录将保存在本地</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className="border border-amber-100 rounded-xl p-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-amber-800">{record.name}</h4>
                    <span className="text-xs text-gray-500">{record.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex space-x-1">
                      {record.gua.slice().reverse().map((yao, idx) => (
                        <span key={idx} className="text-xl" title={yao.desc}>
                          {yao.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{record.desc}</p>
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
        <div className="mt-6 bg-white/80 rounded-xl p-4 border border-amber-200">
          <h3 className="font-medium text-amber-800 mb-2">使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 点击"开始摇卦"按钮，系统将模拟六次铜钱摇卦</li>
            <li>• 从下到上显示六爻，老阳(⚊○)、老阴(⚋×)为变爻</li>
            <li>• 卦象和记录将保存在浏览器本地</li>
            <li>• 此系统为模拟演示，结果仅供参考</li>
          </ul>
        </div>

        <footer className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-amber-200">
          <p>六爻占卜系统 - 基于《周易》卦象原理</p>
          <p className="mt-1">本工具仅供文化学习参考</p>
        </footer>
      </div>
    </div>
  );
};

export default SixYaoDivination;
