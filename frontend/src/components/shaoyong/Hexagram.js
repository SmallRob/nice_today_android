import React, { useState } from 'react';
import './Hexagram.css';
import HexagramDisplay from './HexagramDisplay';
import DivinationForm from './DivinationForm';
import InterpretationPanel from './InterpretationPanel';
import HistoryPanel from './HistoryPanel';

function App() {
  const [divinationResult, setDivinationResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleDivination = (result) => {
    const newResult = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toLocaleString()
    };
    setDivinationResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]); // 保留最近10条
  };

  const loadHistoryResult = (result) => {
    setDivinationResult(result);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>梅花易数问卦占卜</h1>
        <p className="subtitle">邵雍梅花易数 - 万物皆数，以数起卦，以卦明理</p>
      </header>

      <div className="app-container">
        <div className="left-panel">
          <div className="card">
            <h2>起卦方式</h2>
            <DivinationForm onDivination={handleDivination} />
          </div>
          
          <div className="card">
            <h2>历史记录</h2>
            <HistoryPanel 
              history={history} 
              onLoad={loadHistoryResult}
              onClear={clearHistory}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="card">
            <h2>卦象展示</h2>
            {divinationResult ? (
              <HexagramDisplay result={divinationResult} />
            ) : (
              <div className="placeholder">
                <div className="yin-yang"></div>
                <p>请选择一种起卦方式，开始占卜</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2>卦象解读</h2>
            {divinationResult ? (
              <InterpretationPanel result={divinationResult} />
            ) : (
              <div className="placeholder">
                <p>卦象显示后，解读将在此处呈现</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>梅花易数乃邵雍所创，以简单数字起卦，窥探天地万物之理</p>
        <p className="tip">提示：占卜结果仅供参考，命运掌握在自己手中</p>
      </footer>
    </div>
  );
}

export default App;