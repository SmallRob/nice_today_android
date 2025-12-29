import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './culturalcap.css';

function CulturalCup() {
  const { theme } = useTheme();
  const [cups, setCups] = useState([0, 0, 0]); // 0:平, 1:凸, 2:侧
  const [result, setResult] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // 从本地存储加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('culturalCupHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // 保存历史记录到本地存储
  const saveHistory = (newHistory) => {
    localStorage.setItem('culturalCupHistory', JSON.stringify(newHistory));
  };

  // 卦象解释数据
  const interpretations = {
    "圣杯": {
      symbol: "⚊",
      meaning: "神明赞同，所问之事可行",
      description: "两个卦杯为一正一反（一阴一阳），表示神明认同，所询问的事情可以放心去做。这是最吉利的卦象之一。",
      advice: "可积极行动，把握时机。"
    },
    "笑杯": {
      symbol: "⚋",
      meaning: "神明未定，难以决断",
      description: "两个卦杯都是正面（阳面），表示神明对问题尚未有明确指示，或者事情还有变数。",
      advice: "需要更加谨慎，可以重新思考问题或等待时机再问。"
    },
    "阴杯": {
      symbol: "⚍",
      meaning: "神明不赞同，不宜进行",
      description: "两个卦杯都是反面（阴面），表示神明不认同或事情有阻碍，不宜贸然行动。",
      advice: "暂时不宜进行，建议调整计划或重新考虑。"
    },
    "立杯": {
      symbol: "◎",
      meaning: "特殊指示，需特别注意",
      description: "卦杯直立不倒，这是非常罕见的卦象，表示有特殊指示或警示，需要特别留意。",
      advice: "需静心思考，可能有重要启示。"
    }
  };

  // 摔杯动作
  const throwCups = () => {
    if (isShaking) return;

    setIsShaking(true);
    setResult(null);

    // 模拟摔杯动画
    setTimeout(() => {
      // 随机生成三个杯子的状态
      const newCups = cups.map(() => {
        const rand = Math.random();
        if (rand < 0.4) return 0; // 平
        if (rand < 0.8) return 1; // 凸
        return 2; // 侧 (立杯)
      });

      setCups(newCups);

      // 根据卦杯状态判断结果
      let cupResult;

      // 检查是否有立杯
      if (newCups.includes(2)) {
        cupResult = "立杯";
      }
      // 检查卦杯组合
      else {
        const flatCount = newCups.filter(cup => cup === 0).length;
        const convexCount = newCups.filter(cup => cup === 1).length;

        if (flatCount === 1 && convexCount === 2) {
          cupResult = "圣杯";
        } else if (flatCount === 2 && convexCount === 1) {
          cupResult = "圣杯";
        } else if (flatCount === 3) {
          cupResult = "笑杯";
        } else if (convexCount === 3) {
          cupResult = "阴杯";
        } else {
          // 其他组合按概率分配
          const results = ["圣杯", "笑杯", "阴杯"];
          cupResult = results[Math.floor(Math.random() * results.length)];
        }
      }

      const resultData = {
        id: Date.now(),
        result: cupResult,
        cups: [...newCups],
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        interpretation: interpretations[cupResult]
      };

      setResult(resultData);
      const newHistory = [resultData, ...history.slice(0, 9)]; // 保留最近10条记录
      setHistory(newHistory);
      saveHistory(newHistory);
      setIsShaking(false);
    }, 1200);
  };

  // 重置卦杯
  const resetCups = () => {
    setCups([0, 0, 0]);
    setResult(null);
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  // 渲染卦杯
  const renderCup = (type, index) => {
    let cupClass = "cup";
    
    if (type === 0) cupClass += " flat";
    if (type === 1) cupClass += " convex";
    if (type === 2) cupClass += " standing";
    if (isShaking) cupClass += " shaking";
    
    return (
      <div key={index} className={cupClass}>
        <div className="cup-inner">
          {type === 0 ? "平" : type === 1 ? "凸" : "立"}
        </div>
      </div>
    );
  };

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <h1><span className="taiji">☯</span> 摔杯请卦 <span className="taiji">☯</span></h1>
        <p className="subtitle">在线卜卦 · 传统智慧 · 心诚则灵</p>
      </header>
      
      <main className="main-content">
        <div className="instructions">
          <p>点击"摔杯请卦"按钮，三个卦杯将随机落下，根据卦杯的组合显示卦象结果。</p>
          <p className="note">心诚则灵，请在心中默念所求之事后再进行占卜。</p>
        </div>
        
        <div className="divination-area">
          <div className="cups-container">
            {cups.map((cup, index) => renderCup(cup, index))}
          </div>
          
          <div className="controls">
            <button 
              className={`throw-button ${isShaking ? 'shaking' : ''}`}
              onClick={throwCups}
              disabled={isShaking}
            >
              {isShaking ? '卦杯摇动中...' : '摔杯请卦'}
            </button>
            <button className="reset-button" onClick={resetCups}>
              重置卦杯
            </button>
          </div>
        </div>
        
        {result && (
          <div className="result-container">
            <div className="result-header">
              <h2>卦象结果</h2>
              <div className="result-symbol">
                <span className="symbol-large">{result.interpretation.symbol}</span>
                <span className="result-name">{result.result}</span>
              </div>
            </div>
            
            <div className="interpretation">
              <h3>解卦：{result.interpretation.meaning}</h3>
              <p>{result.interpretation.description}</p>
              <div className="advice">
                <strong>建议：</strong> {result.interpretation.advice}
              </div>
              
              <button 
                className="explanation-toggle"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? '隐藏卦象说明' : '显示卦象说明'}
              </button>
              
              {showExplanation && (
                <div className="explanation">
                  <h4>卦象说明：</h4>
                  <ul>
                    <li><strong>圣杯（一平一凸）</strong>：表示神明认同，所问之事可行，是吉兆。</li>
                    <li><strong>笑杯（双平）</strong>：表示神明未决，需重新思考或等待时机。</li>
                    <li><strong>阴杯（双凸）</strong>：表示神明不赞同，宜暂缓行动。</li>
                    <li><strong>立杯（直立）</strong>：特殊指示，需特别注意或静心思考。</li>
                  </ul>
                  <p className="cultural-note">
                    * 摔杯请卦是传统占卜方式，卦象结果仅供参考。卦由心生，心诚则灵。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {history.length > 0 && (
          <div className="history">
            <div className="history-header">
              <h3>最近占卜记录</h3>
              <button className="clear-history-button" onClick={clearHistory}>
                清除记录
              </button>
            </div>
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-time">
                    <span className="history-date">{item.date}</span>
                    <span className="history-clock">{item.time}</span>
                  </div>
                  <div className="history-result">
                    <span className="history-symbol">{item.interpretation.symbol}</span>
                    <span>{item.result}</span>
                  </div>
                  <div className="history-meaning">{item.interpretation.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="cultural-info">
          <h3>传统文化背景</h3>
          <p>摔杯请卦，又称掷筊、掷杯，是道教与民间信仰中向神明请示的传统占卜方式。使用一对半月形木制卦杯，通过掷出后卦杯的阴阳组合来解读神明的指示。</p>
          <p>卦杯一面平坦（阳）、一面隆起（阴），分别代表太极中的阴阳两极。占卜时需心怀敬意，默念所求之事后掷出卦杯，根据落地后的组合判断吉凶。</p>
        </div>
      </main>
      
      <footer className="footer">
        <p>本应用仅供娱乐与文化学习使用，卦象结果仅供参考。</p>
        <p>传统文化 · 智慧传承 · 心诚则灵</p>
      </footer>
    </div>
  );
}

export default CulturalCup;