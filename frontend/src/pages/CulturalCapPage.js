import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './styles/culturalcap-tailwind.css';

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
    let cupStyle = "w-16 h-20 md:w-20 md:h-24 relative transition-all duration-500 flex items-center justify-center ";

    if (type === 0) { // 平
      cupStyle += theme === 'dark'
        ? "bg-amber-200 text-amber-900 border-2 border-amber-300"
        : "bg-amber-100 text-amber-800 border-2 border-amber-200";
    } else if (type === 1) { // 凸
      cupStyle += theme === 'dark'
        ? "bg-amber-800 text-amber-100 border-2 border-amber-700"
        : "bg-amber-800 text-amber-100 border-2 border-amber-900";
    } else { // 立 (2)
      cupStyle += theme === 'dark'
        ? "bg-green-700 text-green-100 border-2 border-green-600 transform rotate-90"
        : "bg-green-600 text-green-50 border-2 border-green-700 transform rotate-90";
    }

    if (isShaking) {
      cupStyle += " animate-shake";
    }

    return (
      <div
        key={index}
        className={cupStyle + " rounded-xl shadow-lg flex items-center justify-center font-bold text-lg md:text-xl"}
        aria-label={"卦杯 " + (index + 1) + ": " + (type === 0 ? '平' : type === 1 ? '凸' : '立')}
        role="img"
        aria-hidden="false"
      >
        <div className="text-center">
          {type === 0 ? "平" : type === 1 ? "凸" : "立"}
        </div>
      </div>
    );
  };

  return (
    <div className={"min-h-screen w-full " + (theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-amber-50 to-orange-100 text-gray-800')}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className={"mb-8 p-6 rounded-3xl shadow-lg " + (theme === 'dark' ? 'bg-gradient-to-r from-amber-900 via-orange-900 to-red-900' : 'bg-gradient-to-r from-amber-400 via-orange-400 to-red-400') + " text-white"}>
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-3 animate-spin-slow" aria-hidden="true">☯</div>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">摔杯请卦</h1>
            <p className="text-lg opacity-90 text-center">在线卜卦 · 传统智慧 · 心诚则灵</p>
          </div>
        </header>

        <main className="space-y-6">
          <div className={"p-5 rounded-2xl " + (theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90') + " backdrop-blur-sm shadow-md"}>
            <p className="text-center mb-3">点击"摔杯请卦"按钮，三个卦杯将随机落下，根据卦杯的组合显示卦象结果。</p>
            <p className={"text-center font-medium " + (theme === 'dark' ? 'text-amber-300' : 'text-amber-700')}>心诚则灵，请在心中默念所求之事后再进行占卜。</p>
          </div>

          <div className={"p-6 rounded-2xl " + (theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90') + " backdrop-blur-sm shadow-lg"}>
            <div className="flex flex-col items-center">
              <div className="flex justify-center gap-4 md:gap-8 mb-8 flex-wrap">
                {cups.map((cup, index) => renderCup(cup, index))}
              </div>

              <div className="flex flex-wrap justify-center gap-4 w-full max-w-xs">
                <button
                  className={"px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-105 " + (isShaking ? 'bg-gray-400 cursor-not-allowed' : (theme === 'dark' ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'))}
                  onClick={throwCups}
                  disabled={isShaking}
                  aria-label={isShaking ? '卦杯摇动中...' : '摔杯请卦'}
                  aria-describedby="instructions"
                >
                  {isShaking ? '卦杯摇动中...' : '摔杯请卦'}
                </button>
                <button
                  className={"px-6 py-3 rounded-full font-medium " + (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800') + " shadow transition-colors"}
                  onClick={resetCups}
                  aria-label="重置卦杯"
                >
                  重置卦杯
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className={"p-6 rounded-2xl " + (theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200') + " shadow-xl"} role="region" aria-labelledby="result-heading">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 id="result-heading" className="text-2xl font-bold">卦象结果</h2>
                <div className="flex items-center gap-4">
                  <span className="text-5xl" aria-hidden="true">{result.interpretation.symbol}</span>
                  <span className={"text-2xl md:text-3xl font-bold " + (
                    result.result === '圣杯' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') :
                      result.result === '笑杯' ? (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600') :
                        result.result === '阴杯' ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') :
                          (theme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                  )}>
                    {result.result}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className={"p-4 rounded-lg " + (theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100')}>
                  <h3 className="text-lg font-bold mb-2">解卦：{result.interpretation.meaning}</h3>
                  <p className="mb-3">{result.interpretation.description}</p>
                  <div className={"p-3 rounded " + (theme === 'dark' ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-100 border border-blue-200')}>
                    <strong>建议：</strong> {result.interpretation.advice}
                  </div>
                </div>

                <button
                  className={"w-full py-3 rounded-lg font-medium " + (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800') + " transition-colors"}
                  onClick={() => setShowExplanation(!showExplanation)}
                  aria-expanded={showExplanation}
                  aria-controls="explanation-content"
                >
                  {showExplanation ? '隐藏卦象说明' : '显示卦象说明'}
                </button>

                {showExplanation && (
                  <div id="explanation-content" className={"p-5 rounded-xl " + (theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200')}>
                    <h4 className="text-lg font-bold mb-3">卦象说明：</h4>
                    <ul className="space-y-2 mb-4">
                      <li><strong>圣杯（一平一凸）</strong>：表示神明认同，所问之事可行，是吉兆。</li>
                      <li><strong>笑杯（双平）</strong>：表示神明未决，需重新思考或等待时机。</li>
                      <li><strong>阴杯（双凸）</strong>：表示神明不赞同，宜暂缓行动。</li>
                      <li><strong>立杯（直立）</strong>：特殊指示，需特别注意或静心思考。</li>
                    </ul>
                    <p className={"text-sm italic " + (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                      * 摔杯请卦是传统占卜方式，卦象结果仅供参考。卦由心生，心诚则灵。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className={"p-6 rounded-2xl " + (theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90') + " backdrop-blur-sm shadow-lg"} role="region" aria-labelledby="history-heading">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h3 id="history-heading" className="text-xl font-bold">最近占卜记录</h3>
                <button
                  className={"px-4 py-2 rounded-lg font-medium " + (theme === 'dark' ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white') + " transition-colors"}
                  onClick={clearHistory}
                  aria-label="清除所有占卜记录"
                >
                  清除记录
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2" role="list">
                {history.map(item => (
                  <div
                    key={item.id}
                    className={"p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 " + (theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200') + " transition-colors"}
                    role="listitem"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold">{item.date}</div>
                        <div className={"text-xs " + (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>{item.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">{item.interpretation.symbol}</span>
                        <span className="font-medium">{item.result}</span>
                      </div>
                    </div>
                    <div className={"text-sm text-center sm:text-right flex-1 " + (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
                      {item.interpretation.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={"p-6 rounded-2xl " + (theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90') + " backdrop-blur-sm shadow-lg"}>
            <h3 className="text-xl font-bold mb-4 text-center">传统文化背景</h3>
            <div className="space-y-3">
              <p>摔杯请卦，又称掷筊、掷杯，是道教与民间信仰中向神明请示的传统占卜方式。使用一对半月形木制卦杯，通过掷出后卦杯的阴阳组合来解读神明的指示。</p>
              <p>卦杯一面平坦（阳）、一面隆起（阴），分别代表太极中的阴阳两极。占卜时需心怀敬意，默念所求之事后掷出卦杯，根据落地后的组合判断吉凶。</p>
            </div>
          </div>
        </main>

        <footer className={"mt-8 py-6 text-center text-sm " + (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
          <p>本应用仅供娱乐与文化学习使用，卦象结果仅供参考。</p>
          <p>传统文化 · 智慧传承 · 心诚则灵</p>
        </footer>
      </div>
    </div>
  );
};

export default CulturalCup;