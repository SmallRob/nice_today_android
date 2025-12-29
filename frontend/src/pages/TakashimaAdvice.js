import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './styles/takashima-advice.css';

// 完整的64卦数据
const hexagramData = [
  { id: 1, name: "乾", symbol: "䷀", nature: "天", description: "天行健，君子以自强不息", lines: [9, 9, 9, 9, 9, 9] },
  { id: 2, name: "坤", symbol: "䷁", nature: "地", description: "地势坤，君子以厚德载物", lines: [6, 6, 6, 6, 6, 6] },
  { id: 3, name: "屯", symbol: "䷂", nature: "水雷", description: "云雷屯，君子以经纶", lines: [9, 6, 6, 6, 8, 6] },
  { id: 4, name: "蒙", symbol: "䷃", nature: "山水", description: "山水蒙，君子以果行育德", lines: [6, 8, 6, 6, 6, 9] },
  { id: 5, name: "需", symbol: "䷄", nature: "水天", description: "水天需，君子以饮食宴乐", lines: [7, 9, 9, 6, 9, 7] },
  { id: 6, name: "讼", symbol: "䷅", nature: "天水", description: "天水讼，君子以作事谋始", lines: [6, 9, 6, 9, 9, 7] },
  { id: 7, name: "师", symbol: "䷆", nature: "地水", description: "地水师，君子以容民畜众", lines: [6, 6, 6, 6, 6, 8] },
  { id: 8, name: "比", symbol: "䷇", nature: "水地", description: "水地比，先王以建万国，亲诸侯", lines: [8, 6, 6, 6, 6, 6] },
  { id: 9, name: "小畜", symbol: "䷈", nature: "风天", description: "风天小畜，君子以懿文德", lines: [9, 9, 9, 7, 9, 9] },
  { id: 10, name: "履", symbol: "䷉", nature: "天泽", description: "天泽履，君子以辨上下，定民志", lines: [9, 9, 7, 9, 9, 9] },
  { id: 11, name: "泰", symbol: "䷊", nature: "地天", description: "天地交泰，后以财（裁）成天地之道", lines: [9, 9, 9, 6, 6, 6] },
  { id: 12, name: "否", symbol: "䷋", nature: "天地", description: "天地不交，否，君子以俭德辟难", lines: [6, 6, 6, 9, 9, 9] },
  { id: 13, name: "同人", symbol: "䷌", nature: "天火", description: "天火同人，君子以类族辨物", lines: [9, 9, 9, 7, 9, 9] },
  { id: 14, name: "大有", symbol: "䷍", nature: "火天", description: "火天大有，君子以遏恶扬善，顺天休命", lines: [9, 9, 9, 9, 7, 9] },
  { id: 15, name: "谦", symbol: "䷎", nature: "地山", description: "地山谦，君子以裒多益寡，称物平施", lines: [6, 6, 6, 8, 6, 6] },
  { id: 16, name: "豫", symbol: "䷏", nature: "雷地", description: "雷地豫，先王以作乐崇德", lines: [6, 6, 6, 6, 8, 6] },
  { id: 17, name: "随", symbol: "䷐", nature: "泽雷", description: "泽雷随，君子以向晦入宴息", lines: [9, 8, 6, 7, 9, 9] },
  { id: 18, name: "蛊", symbol: "䷑", nature: "山风", description: "山风蛊，君子以振民育德", lines: [6, 7, 9, 9, 8, 6] },
  { id: 19, name: "临", symbol: "䷒", nature: "地泽", description: "地泽临，君子以教思无穷，容保民无疆", lines: [8, 8, 6, 6, 6, 6] },
  { id: 20, name: "观", symbol: "䷓", nature: "风地", description: "风地观，先王以省方观民设教", lines: [6, 6, 6, 6, 8, 8] },
  { id: 21, name: "噬嗑", symbol: "䷔", nature: "火雷", description: "火雷噬嗑，先王以明罚敕法", lines: [7, 9, 8, 6, 9, 9] },
  { id: 22, name: "贲", symbol: "䷕", nature: "山火", description: "山火贲，君子以明庶政，无敢折狱", lines: [9, 7, 6, 9, 8, 7] },
  { id: 23, name: "剥", symbol: "䷖", nature: "山地", description: "山地剥，上以厚下安宅", lines: [7, 6, 6, 6, 6, 6] },
  { id: 24, name: "复", symbol: "䷗", nature: "地雷", description: "地雷复，先王以至日闭关，商旅不行，后不省方", lines: [6, 6, 6, 6, 8, 8] },
  { id: 25, name: "无妄", symbol: "䷘", nature: "天雷", description: "天雷无妄，先王以茂对时育万物", lines: [9, 9, 9, 9, 7, 9] },
  { id: 26, name: "大畜", symbol: "䷙", nature: "山天", description: "山天大畜，君子以多识前言往行，以畜其德", lines: [7, 9, 9, 9, 9, 7] },
  { id: 27, name: "颐", symbol: "䷚", nature: "山雷", description: "山雷颐，君子以慎言语，节饮食", lines: [7, 9, 8, 6, 6, 7] },
  { id: 28, name: "大过", symbol: "䷛", nature: "泽风", description: "泽风大过，君子以独立不惧，遁世无闷", lines: [8, 6, 6, 7, 9, 8] },
  { id: 29, name: "坎", symbol: "䷜", nature: "水水", description: "水洊至，习坎，君子以常德行，习教事", lines: [6, 7, 6, 9, 6, 8] },
  { id: 30, name: "离", symbol: "䷝", nature: "火火", description: "明两作，离，大人以继明照于四方", lines: [9, 8, 9, 7, 9, 9] },
  { id: 31, name: "咸", symbol: "䷞", nature: "泽山", description: "泽山咸，君子以虚受人", lines: [7, 8, 9, 9, 7, 6] },
  { id: 32, name: "恒", symbol: "䷟", nature: "雷风", description: "雷风恒，君子以立不易方", lines: [6, 7, 9, 9, 8, 7] },
  { id: 33, name: "遁", symbol: "䷠", nature: "天山", description: "天下有山，遁，君子以远小人，不恶而严", lines: [7, 9, 9, 9, 8, 6] },
  { id: 34, name: "大壮", symbol: "䷡", nature: "雷天", description: "雷在天上，大壮，君子以非礼弗履", lines: [9, 8, 7, 9, 9, 9] },
  { id: 35, name: "晋", symbol: "䷢", nature: "火地", description: "明出地上，晋，君子以自昭明德", lines: [7, 9, 6, 6, 6, 6] },
  { id: 36, name: "明夷", symbol: "䷣", nature: "地火", description: "明入地中，明夷，君子以莅众，用晦而明", lines: [6, 6, 6, 9, 8, 6] },
  { id: 37, name: "家人", symbol: "䷤", nature: "风火", description: "风自火出，家人，君子以言有物，而行有恒", lines: [9, 7, 6, 9, 8, 9] },
  { id: 38, name: "睽", symbol: "䷥", nature: "火泽", description: "上火下泽，睽，君子以同而异", lines: [9, 8, 9, 7, 9, 7] },
  { id: 39, name: "蹇", symbol: "䷦", nature: "水山", description: "山上有水，蹇，君子以反身修德", lines: [6, 7, 8, 6, 6, 8] },
  { id: 40, name: "解", symbol: "䷧", nature: "雷水", description: "雷雨作，解，君子以赦过宥罪", lines: [6, 6, 6, 8, 7, 6] },
  { id: 41, name: "损", symbol: "䷨", nature: "山泽", description: "山下有泽，损，君子以惩忿窒欲", lines: [7, 8, 6, 6, 6, 8] },
  { id: 42, name: "益", symbol: "䷩", nature: "风雷", description: "风雷，益，君子以见善则迁，有过则改", lines: [8, 6, 6, 7, 8, 8] },
  { id: 43, name: "夬", symbol: "䷪", nature: "泽天", description: "泽上于天，夬，君子以施禄及下，居德则忌", lines: [7, 9, 9, 9, 9, 8] },
  { id: 44, name: "姤", symbol: "䷫", nature: "天风", description: "天下有风，姤，后以施命诰四方", lines: [9, 8, 9, 9, 9, 7] },
  { id: 45, name: "萃", symbol: "䷬", nature: "泽地", description: "泽上于地，萃，君子以除戎器，戒不虞", lines: [8, 6, 6, 6, 8, 8] },
  { id: 46, name: "升", symbol: "䷭", nature: "地风", description: "地中生木，升，君子以顺德，积小以高大", lines: [8, 8, 7, 6, 6, 6] },
  { id: 47, name: "困", symbol: "䷮", nature: "泽水", description: "泽无水，困，君子以致命遂志", lines: [6, 8, 7, 6, 9, 8] },
  { id: 48, name: "井", symbol: "䷯", nature: "水风", description: "木上有水，井，君子以劳民劝相", lines: [6, 8, 9, 7, 6, 8] },
  { id: 49, name: "革", symbol: "䷰", nature: "泽火", description: "泽中有火，革，君子以治历明时", lines: [8, 7, 9, 9, 7, 8] },
  { id: 50, name: "鼎", symbol: "䷱", nature: "火风", description: "木上有火，鼎，君子以正位凝命", lines: [7, 9, 8, 7, 8, 8] },
  { id: 51, name: "震", symbol: "䷲", nature: "雷雷", description: "洊雷，震，君子以恐惧修省", lines: [7, 7, 6, 9, 8, 7] },
  { id: 52, name: "艮", symbol: "䷳", nature: "山山", description: "兼山，艮，君子以思不出其位", lines: [7, 6, 6, 6, 8, 7] },
  { id: 53, name: "渐", symbol: "䷴", nature: "风山", description: "山上有木，渐，君子以居贤德善俗", lines: [6, 7, 9, 9, 6, 6] },
  { id: 54, name: "归妹", symbol: "䷵", nature: "雷泽", description: "泽上有雷，归妹，君子以永终知弊", lines: [9, 7, 8, 7, 9, 7] },
  { id: 55, name: "丰", symbol: "䷶", nature: "雷火", description: "雷电皆至，丰，君子以折狱致刑", lines: [6, 6, 9, 9, 8, 8] },
  { id: 56, name: "旅", symbol: "䷷", nature: "火山", description: "山上有火，旅，君子以明慎用刑，而不留狱", lines: [7, 9, 8, 7, 6, 9] },
  { id: 57, name: "巽", symbol: "䷸", nature: "风风", description: "随风，巽，君子以申命行事", lines: [8, 7, 9, 8, 8, 8] },
  { id: 58, name: "兑", symbol: "䷹", nature: "泽泽", description: "丽泽，兑，君子以朋友讲习", lines: [8, 8, 7, 9, 8, 8] },
  { id: 59, name: "涣", symbol: "䷺", nature: "风水", description: "风行水上，涣，先王以享于帝，立庙", lines: [9, 7, 8, 6, 9, 8] },
  { id: 60, name: "节", symbol: "䷻", nature: "水泽", description: "泽上有水，节，君子以制数度，议德行", lines: [8, 7, 6, 6, 8, 7] },
  { id: 61, name: "中孚", symbol: "䷼", nature: "风泽", description: "泽上有风，中孚，君子以议狱缓死", lines: [8, 8, 9, 7, 8, 8] },
  { id: 62, name: "小过", symbol: "䷽", nature: "雷山", description: "山上有雷，小过，君子以行过乎恭，丧过乎哀，用过乎俭", lines: [7, 6, 6, 8, 8, 7] },
  { id: 63, name: "既济", symbol: "䷾", nature: "水火", description: "水在火上，既济，君子以思患而豫防之", lines: [9, 8, 7, 6, 9, 8] },
  { id: 64, name: "未济", symbol: "䷿", nature: "火水", description: "火在水上，未济，君子以慎辨物居方", lines: [8, 7, 6, 9, 8, 7] }
];

// 爻位名称
const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

// 爻象符号映射
const lineSymbols = {
  6: { symbol: "×", name: "老阴", type: "yin", moving: true },
  7: { symbol: "—", name: "少阳", type: "yang", moving: false },
  8: { symbol: "- -", name: "少阴", type: "yin", moving: false },
  9: { symbol: "○", name: "老阳", type: "yang", moving: true }
};

const TakashimaAdvice = () => {
  const { theme, toggleTheme } = useTheme();

  // 状态管理
  const [question, setQuestion] = useState("");
  const [isDivining, setIsDivining] = useState(false);
  const [divinationStep, setDivinationStep] = useState(0);
  const [currentHexagram, setCurrentHexagram] = useState(null);
  const [originalHexagram, setOriginalHexagram] = useState(null);
  const [changingHexagram, setChangingHexagram] = useState(null);
  const [lines, setLines] = useState([]);
  const [divinationHistory, setDivinationHistory] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [divinationLog, setDivinationLog] = useState([]);

  // 从本地存储加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('takashimaDivinationHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setDivinationHistory(parsed);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // 保存历史记录到本地存储
  const saveHistory = (newHistory) => {
    try {
      localStorage.setItem('takashimaDivinationHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清空所有占卜历史记录吗？此操作不可恢复。')) {
      setDivinationHistory([]);
      localStorage.removeItem('takashimaDivinationHistory');
    }
  };

  // 初始化蓍草
  const initialStalks = Array(50).fill(0).map((_, i) => i + 1);

  // 计算卦象ID（根据六爻计算）
  const calculateHexagramId = (finalLines) => {
    let binary = "";
    finalLines.forEach(line => {
      // 将6/7/8/9转换为阴阳：7和9为阳，6和8为阴
      binary += (line === 7 || line === 9) ? "1" : "0";
    });
    
    // 二进制转十进制（从下到上）
    const decimal = parseInt(binary.split('').reverse().join(''), 2);
    // 确保在1-64范围内
    return decimal + 1;
  };

  // 模拟蓍草占卜流程
  const performDivination = () => {
    if (!question.trim()) {
      alert("请先诚心提问");
      return;
    }
    
    setIsDivining(true);
    setDivinationStep(0);
    setDivinationLog([]);
    setLines([]);
    
    // 清空之前的卦象
    setCurrentHexagram(null);
    setOriginalHexagram(null);
    setChangingHexagram(null);
    setExplanation("");
    
    // 记录初始状态
    addToLog("占卜开始：净化身心，诚心正意");
    addToLog(`所问之事：${question}`);
    addToLog("大衍之数五十，其用四十有九");
    
    // 开始占卜过程
    setTimeout(() => startDivinationProcess(), 1000);
  };

  // 开始占卜流程
  const startDivinationProcess = () => {
    const newLines = [];
    
    // 六爻循环
    const calculateLine = (lineIndex) => {
      if (lineIndex >= 6) {
        // 六爻完成
        finishDivination(newLines);
        return;
      }
      
      setDivinationStep(lineIndex + 1);
      addToLog(`开始计算第${lineNames[lineIndex]}（${lineIndex + 1}/6）`);
      
      // 模拟三变过程
      setTimeout(() => {
        addToLog("第一变：分二、挂一、揲四、归奇");
        
        setTimeout(() => {
          addToLog("第二变：重复分二、挂一、揲四、归奇");
          
          setTimeout(() => {
            addToLog("第三变：再次分二、挂一、揲四、归奇");
            
            // 随机生成爻象（模拟真实计算）
            setTimeout(() => {
              const possibleResults = [6, 7, 8, 9];
              const lineResult = possibleResults[Math.floor(Math.random() * possibleResults.length)];
              newLines.push(lineResult);
              
              const lineInfo = lineSymbols[lineResult];
              addToLog(`得到：${lineInfo.name} (${lineInfo.symbol})，记为${lineResult}`);
              
              setLines([...newLines]);
              
              // 计算下一爻
              calculateLine(lineIndex + 1);
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    };
    
    calculateLine(0);
  };

  // 完成占卜，确定卦象
  const finishDivination = (finalLines) => {
    addToLog("六爻已定，正在解析卦象...");
    
    setTimeout(() => {
      // 根据爻象确定卦象ID
      const hexagramId = calculateHexagramId(finalLines);
      
      // 查找卦象
      const foundHexagram = hexagramData.find(h => h.id === hexagramId) || hexagramData[0];
      
      setOriginalHexagram(foundHexagram);
      setCurrentHexagram(foundHexagram);
      
      // 确定变卦（如果有动爻）
      const movingLines = finalLines.filter(line => line === 6 || line === 9);
      
      if (movingLines.length > 0) {
        addToLog(`发现${movingLines.length}个动爻，计算变卦...`);
        
        // 生成变卦的爻（老阳变阴，老阴变阳）
        const changedLines = finalLines.map(line => {
          if (line === 6) return 7; // 老阴变少阳
          if (line === 9) return 8; // 老阳变少阴
          return line;
        });
        
        // 根据变爻确定变卦
        const changingHexagramId = calculateHexagramId(changedLines);
        
        const foundChangingHexagram = hexagramData.find(h => h.id === changingHexagramId) || hexagramData[1];
        setChangingHexagram(foundChangingHexagram);
        
        addToLog(`变卦为：${foundChangingHexagram.name}卦 ${foundChangingHexagram.symbol}`);
      }
      
      // 生成解卦解释
      generateExplanation(foundHexagram, finalLines, movingLines.length);
      
      // 记录到历史
      const now = new Date();
      const newRecord = {
        id: now.getTime(),
        question,
        hexagram: foundHexagram,
        lines: [...finalLines],
        date: now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime()
      };

      // 保存历史记录（最多10条）
      const newHistory = [newRecord, ...divinationHistory].slice(0, 10);
      setDivinationHistory(newHistory);
      saveHistory(newHistory);
      
      // 完成占卜
      setTimeout(() => {
        setIsDivining(false);
        addToLog("占卜完成，请查看解卦结果");
      }, 1000);
    }, 1000);
  };

  // 生成解卦解释
  const generateExplanation = (hexagram, lines, movingCount) => {
    let exp = `您占得：${hexagram.name}卦 ${hexagram.symbol}\n\n`;
    exp += `卦辞：${hexagram.description}\n\n`;
    
    // 根据动爻数量解释
    if (movingCount === 0) {
      exp += "六爻皆静，无动爻。直接以本卦卦辞卦象为断。\n";
      exp += `高岛易断提示：${hexagram.name}卦象征${getHexagramSymbolism(hexagram.id)}，应仔细体会卦辞深意，结合所问之事进行判断。`;
    } else {
      // 找出动爻位置
      const movingPositions = lines.map((line, idx) => 
        (line === 6 || line === 9) ? idx : -1
      ).filter(idx => idx !== -1);
      
      exp += `动爻数量：${movingCount}个\n`;
      exp += `动爻位置：${movingPositions.map(pos => lineNames[pos]).join('、')}\n\n`;
      
      if (movingCount === 1) {
        exp += "一爻动，以该动爻的爻辞为主要判断依据，参考本卦和变卦的卦辞。\n";
        exp += `高岛易断法：重点关注${lineNames[movingPositions[0]]}的爻象变化，结合"${hexagram.name}"卦的整体情境进行判断。`;
      } else {
        exp += "多爻动，以最下方（初爻）的动爻为主断，并综合观察几个动爻的关系。\n";
        exp += `高岛易断法：初爻为事始，${lineNames[movingPositions[0]]}的变化提示事情的初始动向。需结合卦象整体分析趋势。`;
      }
      
      if (changingHexagram) {
        exp += `\n\n变卦为：${changingHexagram.name}卦，象征${getHexagramSymbolism(changingHexagram.id)}。`;
        exp += ` 这提示事情的发展趋势可能从"${hexagram.name}"转向"${changingHexagram.name}"。`;
      }
    }
    
    // 添加具体建议
    exp += `\n\n高岛易断启示：\n${getTakashimaAdvice(hexagram.id, movingCount)}`;
    
    setExplanation(exp);
  };

  // 获取卦象象征
  const getHexagramSymbolism = (id) => {
    const hexagram = hexagramData.find(h => h.id === id);
    if (!hexagram) return "变化、发展、循环";
    
    const natureMapping = {
      "天": "天、刚健、创始、主动",
      "地": "地、柔顺、承载、包容",
      "雷": "雷、震动、起始、惊醒",
      "风": "风、渗透、影响、跟随",
      "水": "水、险陷、滋润、深沉",
      "火": "火、光明、热情、向上",
      "山": "山、静止、稳固、阻碍",
      "泽": "泽、喜悦、沟通、汇聚",
      "水雷": "水雷、险阻震动、艰难启动",
      "山水": "山水、险阻静止、艰难启蒙",
      "水天": "水天、险阻刚健、需待时机",
      "天水": "天水、刚健险阻、争讼矛盾",
      "地水": "地水、承载险阻、组织众人",
      "水地": "水地、滋润承载、亲近团结",
      "风天": "风天、渗透刚健、小畜等待",
      "天泽": "天泽、刚健喜悦、履行礼仪",
      "地天": "地天、承载刚健、天地交泰",
      "天地": "天地、刚健承载、天地不交",
      "天火": "天火、刚健光明、同仁聚合",
      "火天": "火天、光明刚健、大有丰盛",
      "地山": "地山、承载静止、谦虚包容",
      "雷地": "雷地、震动承载、欢乐豫悦",
      "泽雷": "泽雷、喜悦震动、跟随顺从",
      "山风": "山风、静止渗透、整顿治理",
      "地泽": "地泽、承载喜悦、临进视察",
      "风地": "风地、渗透承载、观察教化",
      "火雷": "火雷、光明震动、噬嗑决断",
      "山火": "山火、静止光明、文饰美化",
      "山地": "山地、静止险阻、剥落损失",
      "地雷": "地雷、承载震动、回归复始",
      "天雷": "天雷、刚健震动、无妄进取",
      "山天": "山天、静止刚健、大畜积蓄",
      "山雷": "山雷、静止震动、颐养调适",
      "泽风": "泽风、喜悦渗透、大过挑战",
      "水水": "水水、险陷险阻、重险困顿",
      "火火": "火火、光明光明、离火附着",
      "泽山": "泽山、喜悦静止、咸感感应",
      "雷风": "雷风、震动渗透、恒久坚持",
      "天山": "天山、静止刚健、遁退隐居",
      "雷天": "雷天、震动刚健、大壮进发",
      "火地": "火地、光明承载、晋升前进",
      "地火": "地火、承载光明、明夷内藏",
      "风火": "风火、渗透光明、家人和谐",
      "火泽": "火泽、光明喜悦、睽别对立",
      "水山": "水山、险阻静止、蹇难前行",
      "雷水": "雷水、震动险阻、解脱化解",
      "山泽": "山泽、静止喜悦、损减克制",
      "风雷": "风雷、渗透震动、增益增进",
      "泽天": "泽天、喜悦刚健、夬决断言",
      "天风": "天风、刚健渗透、姤遇机遇",
      "泽地": "泽地、喜悦承载、萃聚集合",
      "地风": "地风、承载渗透、升进提升",
      "泽水": "泽水、喜悦险阻、困顿等待",
      "水风": "水风、险阻渗透、井水滋养",
      "泽火": "泽火、喜悦光明、变革更新",
      "火风": "火风、光明渗透、鼎器成事",
      "雷雷": "雷雷、震动震动、震惧惊醒",
      "山山": "山山、静止静止、艮止思考",
      "风山": "风山、渗透静止、渐次进步",
      "雷泽": "雷泽、震动喜悦、归妹归宿",
      "雷火": "雷火、震动光明、丰盛大好",
      "火山": "火山、震动静止、旅居在外",
      "风风": "风风、渗透渗透、巽顺从入",
      "泽泽": "泽泽、喜悦喜悦、兑悦沟通",
      "风水": "风水、渗透险阻、涣散消解",
      "水泽": "水泽、险阻喜悦、节度节制",
      "风泽": "风泽、渗透喜悦、中孚诚信",
      "雷山": "雷山、震动静止、小过谨慎",
      "水火": "水火、险阻光明、既济成功",
      "火水": "火水、光明险阻、未济未成"
    };
    
    return natureMapping[hexagram.nature] || "变化、发展、循环";
  };

  // 获取高岛易断式建议
  const getTakashimaAdvice = (hexagramId, movingCount) => {
    const advice = {
      1: "乾卦象征天行健，君子应自强不息。高岛易断提示：当有重大决策时，应如天行健般持续努力，不可半途而废。",
      2: "坤卦象征地势坤，君子应厚德载物。高岛易断提示：处事宜宽容柔顺，以德服人，方能承载万物。",
      3: "屯卦象征云雷屯，君子以经纶。高岛易断提示：万事开头难，此时宜打好基础，耐心经营。",
      4: "蒙卦象征山水蒙，君子以果行育德。高岛易断提示：处于启蒙阶段，应勇于行动同时培养德行。",
      5: "需卦象征水天需，君子以饮食宴乐。高岛易断提示：时机未到，需耐心等待，养精蓄锐。",
      6: "讼卦象征天水讼，君子以作事谋始。高岛易断提示：争议难免，但应在一开始就规划好，避免冲突。",
      7: "师卦象征地水师，君子以容民畜众。高岛易断提示：此卦宜用智不用力，以德服众，方能成功。",
      8: "比卦象征水地比，先王以建万国。高岛易断提示：宜亲近贤能，团结力量，共同发展。",
      9: "小畜卦象征风天小畜，君子以懿文德。高岛易断提示：时机未成熟，宜小畜积，等待大好时机。",
      10: "履卦象征天泽履，君子以辨上下。高岛易断提示：行事需谨慎，分清上下级，遵循礼仪。",
      11: "泰卦象征天地交泰，君子以财成天地。高岛易断提示：天地交泰，诸事顺利，宜把握良机。",
      12: "否卦象征天地不交，君子以俭德辟难。高岛易断提示：天地不交，诸事不利，宜修身养德，等待时机。",
      13: "同人卦象征天火同人，君子以类族辨物。高岛易断提示：宜与人合作，团结力量，共同进退。",
      14: "大有卦象征火天大有，君子以遏恶扬善。高岛易断提示：此卦大吉，宜把握机会，大展宏图。",
      15: "谦卦象征地山谦，君子以裒多益寡。高岛易断提示：此卦大吉，谦虚受益，宜低调行事。",
      16: "豫卦象征雷地豫，先王以作乐崇德。高岛易断提示：此卦提示及时行乐，但也需防备不测。",
      17: "随卦象征泽雷随，君子以向晦入宴息。高岛易断提示：宜随大流，顺其自然，不强求。",
      18: "蛊卦象征山风蛊，君子以振民育德。高岛易断提示：此卦提示宜整顿内部，清理积弊。",
      19: "临卦象征地泽临，君子以教思无穷。高岛易断提示：此卦大吉，宜把握时机，大展宏图。",
      20: "观卦象征风地观，先王以省方观民。高岛易断提示：宜观象察理，不宜妄动。",
      21: "噬嗑卦象征火雷噬嗑，先王以明罚敕法。高岛易断提示：宜果断处理问题，不可拖延。",
      22: "贲卦象征山火贲，君子以明庶政。高岛易断提示：宜注重文饰，但要内外兼修。",
      23: "剥卦象征山地剥，上以厚下安宅。高岛易断提示：此卦不利，宜低调行事，避免损失。",
      24: "复卦象征地雷复，君子以修身养德。高岛易断提示：此卦提示回归本源，重新开始。",
      25: "无妄卦象征天雷无妄，君子以茂对时育。高岛易断提示：宜顺其自然，不可妄为。",
      26: "大畜卦象征山天大畜，君子以多识前言。高岛易断提示：宜大畜积，等待时机，方能成功。",
      27: "颐卦象征山雷颐，君子以慎言语。高岛易断提示：宜颐养身心，调理饮食。",
      28: "大过卦象征泽风大过，君子以独立不惧。高岛易断提示：此卦提示压力过大，宜谨慎应对。",
      29: "坎卦象征水水至，君子以常德行。高岛易断提示：此卦不利，宜谨慎行事，避免险阻。",
      30: "离卦象征明两作离，君子以继明照四方。高岛易断提示：此卦大吉，宜把握光明，照亮四方。",
      31: "咸卦象征泽山咸，君子以虚受人。高岛易断提示：此卦提示感应，宜虚心接受。",
      32: "恒卦象征雷风恒，君子以立不易方。高岛易断提示：此卦提示坚持，不可轻易改变。",
      33: "遁卦象征天下有山，君子以远小人。高岛易断提示：此卦提示宜退让，远离小人。",
      34: "大壮卦象征雷在天上，君子以非礼弗履。高岛易断提示：此卦提示力量强大，但需谨慎行事。",
      35: "晋卦象征明出地上，君子以自昭明德。高岛易断提示：此卦大吉，宜把握时机，晋升发展。",
      36: "明夷卦象征明入地中，君子以莅众用晦。高岛易断提示：此卦不利，宜韬光养晦，等待时机。",
      37: "家人卦象征风自火出，君子以言有物。高岛易断提示：此卦提示家庭和谐，宜注重家风。",
      38: "睽卦象征上火下泽，君子以同而异。高岛易断提示：此卦提示分歧，宜求同存异。",
      39: "蹇卦象征山上有水，君子以反身修德。高岛易断提示：此卦不利，宜反身修德，克服困难。",
      40: "解卦象征雷雨作，君子以赦过宥罪。高岛易断提示：此卦提示问题将解，宜把握时机。",
      41: "损卦象征山下有泽，君子以惩忿窒欲。高岛易断提示：此卦提示损失，宜克制欲望。",
      42: "益卦象征风雷益，君子以见善则迁。高岛易断提示：此卦大吉，宜把握机会，增益发展。",
      43: "夬卦象征泽上于天，君子以施禄及下。高岛易断提示：此卦提示决断，宜果断行动。",
      44: "姤卦象征天下有风，君子以施命诰四方。高岛易断提示：此卦提示机遇，宜把握相遇。",
      45: "萃卦象征泽上于地，君子以除戎器。高岛易断提示：此卦提示聚集，宜团结力量。",
      46: "升卦象征地中生木，君子以顺德积小。高岛易断提示：此卦大吉，宜把握机会，升进发展。",
      47: "困卦象征泽无水，君子以致命遂志。高岛易断提示：此卦不利，宜坚守理想，等待转机。",
      48: "井卦象征木上有水，君子以劳民劝相。高岛易断提示：此卦提示滋养，宜持续付出。",
      49: "革卦象征泽中有火，君子以治历明时。高岛易断提示：此卦提示变革，宜把握时机，更新自我。",
      50: "鼎卦象征木上有火，君子以正位凝命。高岛易断提示：此卦大吉，宜把握时机，成就事业。",
      51: "震卦象征洊雷震，君子以恐惧修省。高岛易断提示：此卦提示震动，宜谨慎应对。",
      52: "艮卦象征兼山艮，君子以思不出位。高岛易断提示：此卦提示静止，宜坚守本分。",
      53: "渐卦象征山上有木，君子以居贤德。高岛易断提示：此卦大吉，宜循序渐进，稳步发展。",
      54: "归妹卦象征泽上有雷，君子以永终知弊。高岛易断提示：此卦提示归宿，宜回归本源。",
      55: "丰卦象征雷电皆至，君子以折狱致刑。高岛易断提示：此卦大吉，宜把握时机，大展宏图。",
      56: "旅卦象征山上有火，君子以慎辨物居。高岛易断提示：此卦提示旅居在外，宜谨慎行事。",
      57: "巽卦象征随风巽，君子以申命行事。高岛易断提示：此卦提示顺从，宜跟随大势。",
      58: "兑卦象征丽泽兑，君子以朋友讲习。高岛易断提示：此卦提示喜悦，宜与人分享。",
      59: "涣卦象征风行水上，君子以享于帝立庙。高岛易断提示：此卦提示消解，宜涣散积弊。",
      60: "节卦象征泽上有水，君子以制数度。高岛易断提示：此卦提示节制，宜控制欲望。",
      61: "中孚卦象征泽上有风，君子以议狱缓死。高岛易断提示：此卦大吉，宜以诚待人，建立信任。",
      62: "小过卦象征山上有雷，君子以行过乎恭。高岛易断提示：此卦提示谨慎，宜小心行事。",
      63: "既济卦象征水在火上，君子以思患豫防。高岛易断提示：此卦提示成功，但需防患未然。",
      64: "未济卦象征火在水上，君子以慎辨物居。高岛易断提示：此卦提示未成，宜继续努力，不要放弃。"
    };
    
    let baseAdvice = advice[hexagramId] || "高岛易断提示：观卦象而明事理，察爻变而知吉凶。应结合具体情境灵活判断。";
    
    if (movingCount > 0) {
      baseAdvice += " 卦中有动爻，显示事情正在变化之中，应密切关注发展趋势。";
    } else {
      baseAdvice += " 六爻安静，局势相对稳定，但也不可掉以轻心。";
    }
    
    return baseAdvice;
  };

  // 添加日志
  const addToLog = (message) => {
    setDivinationLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('zh-CN'),
      message
    }]);
  };

  // 清除占卜记录
  const clearDivination = () => {
    setQuestion("");
    setCurrentHexagram(null);
    setOriginalHexagram(null);
    setChangingHexagram(null);
    setLines([]);
    setExplanation("");
    setDivinationLog([]);
  };

  // 查看历史记录
  const viewHistoryRecord = (record) => {
    setQuestion(record.question);
    setLines(record.lines);
    setCurrentHexagram(record.hexagram);
    setOriginalHexagram(record.hexagram);
    setChangingHexagram(null);
    setExplanation(`历史记录 - ${record.date} ${record.time}\n\n您曾占得：${record.hexagram.name}卦 ${record.hexagram.symbol}\n\n卦辞：${record.hexagram.description}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 渲染爻象
  const renderLines = () => {
    return lines.map((line, index) => {
      const lineInfo = lineSymbols[line];
      return (
        <div key={index} className={`line ${lineInfo.type} ${lineInfo.moving ? 'moving' : ''}`}>
          <div className="line-position">{lineNames[index]}</div>
          <div className="line-symbol">{lineInfo.symbol}</div>
          <div className="line-name">{lineInfo.name}</div>
          <div className="line-number">({line})</div>
        </div>
      );
    });
  };

  // 渲染卦象图
  const renderHexagramDiagram = () => {
    if (!originalHexagram) return null;
    
    return (
      <div className="hexagram-diagram">
        <div className="hexagram-name">
          {originalHexagram.name}卦 {originalHexagram.symbol}
        </div>
        <div className="hexagram-nature">{originalHexagram.nature}</div>
        <div className="hexagram-lines">
          {originalHexagram.lines.slice().reverse().map((line, idx) => (
            <div key={idx} className={`diagram-line ${lineSymbols[line].type}`}>
              {lineSymbols[line].symbol}
            </div>
          ))}
        </div>
        <div className="hexagram-description">
          {originalHexagram.description}
        </div>
      </div>
    );
  };

  return (
    <div className={`takshima-divination ${theme}`}>
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>高岛易断卜卦系统</h1>
            <p className="subtitle">日本易圣高岛嘉右卫门占卜法 - 以象解易，直断吉凶</p>
          </div>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <div className="divination-container">
          <div className="left-panel">
            <div className="question-section">
              <h2>诚心提问</h2>
              <p className="instruction">高岛易断强调"不动不占，不疑不占"。请诚心正意，清晰思考您要询问的事情。</p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您要占问的事情（一事一问）..."
                rows="4"
                disabled={isDivining}
              />
              
              <div className="button-group">
                <button 
                  className="divination-button" 
                  onClick={performDivination}
                  disabled={isDivining || !question.trim()}
                >
                  {isDivining ? "占卜中..." : "开始占卜"}
                </button>
                <button 
                  className="clear-button" 
                  onClick={clearDivination}
                  disabled={isDivining}
                >
                  清除
                </button>
              </div>
              
              {isDivining && (
                <div className="divination-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${(divinationStep / 6) * 100}%`}}
                    ></div>
                  </div>
                  <div className="progress-text">
                    正在计算 {divinationStep > 0 ? `第${divinationStep}爻` : "准备中..."} 
                    <span className="progress-step">({divinationStep}/6)</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="explanation-section">
              <h2>解卦结果</h2>
              {explanation ? (
                <div className="explanation-content">
                  <pre>{explanation}</pre>
                </div>
              ) : (
                <div className="placeholder">
                  {isDivining ? "卦象计算中，请稍候..." : "占卜结果将显示在这里"}
                </div>
              )}
            </div>
          </div>
          
          <div className="right-panel">
            <div className="hexagram-section">
              <h2>卦象展示</h2>
              {currentHexagram ? (
                <>
                  {renderHexagramDiagram()}
                  
                  <div className="lines-display">
                    <h3>六爻明细（从下到上）</h3>
                    <div className="lines-container">
                      {renderLines()}
                    </div>
                  </div>
                  
                  {changingHexagram && (
                    <div className="changing-hexagram">
                      <h3>变卦：{changingHexagram.name}卦 {changingHexagram.symbol}</h3>
                      <div className="hexagram-nature">{changingHexagram.nature}</div>
                      <p>{changingHexagram.description}</p>
                      <p className="changing-note">
                        提示：本卦中有动爻，故产生变卦。变卦代表事情的发展趋势。
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="hexagram-placeholder">
                  <div className="stalks-icon">
                    {initialStalks.slice(0, 20).map((_, i) => (
                      <div key={i} className="stalk"></div>
                    ))}
                  </div>
                  <p>卦象将在此显示</p>
                  <p className="small-note">高岛易断使用50根蓍草，经过"四营十八变"得到卦象</p>
                </div>
              )}
            </div>
            
            <div className="log-section">
              <h2>占卜过程</h2>
              <div className="log-container">
                {divinationLog.length > 0 ? (
                  divinationLog.map((entry, index) => (
                    <div key={index} className="log-entry">
                      <span className="log-time">[{entry.time}]</span>
                      <span className="log-message">{entry.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="log-placeholder">
                    <p>占卜过程记录将显示在这里</p>
                    <ul className="process-steps">
                      <li>1. 分二：任意分成左右两堆（象征天地）</li>
                      <li>2. 挂一：取出一根夹在手指间（象征人）</li>
                      <li>3. 揲四：每四根一组数出（象征四季）</li>
                      <li>4. 归奇：取出余数，重复三变得一爻</li>
                      <li>5. 重复六次得到六爻卦</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {divinationHistory.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <h2>占卜历史</h2>
              <button className="clear-history-button" onClick={clearHistory}>
                清空记录
              </button>
            </div>
            <div className="history-container">
              {divinationHistory.map(record => (
                <div
                  key={record.id}
                  className="history-record"
                  onClick={() => viewHistoryRecord(record)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      viewHistoryRecord(record);
                    }
                  }}
                >
                  <div className="record-question">{record.question}</div>
                  <div className="record-info">
                    <div className="record-hexagram">{record.hexagram.name}卦 {record.hexagram.symbol}</div>
                    <div className="record-time">
                      <span className="record-date">{record.date}</span>
                      <span className="record-clock">{record.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>高岛易断卜卦系统 - 本系统模拟高岛嘉右卫门蓍草占卜法，仅供文化学习参考</p>
          <p className="disclaimer">高岛易断精髓：占卜的真正价值不在"准"，而在通过卦象反思事理、修炼心性。</p>
        </div>
      </footer>
    </div>
  );
};

export default TakashimaAdvice;
