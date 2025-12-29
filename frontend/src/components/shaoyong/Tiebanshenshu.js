import React, { useState } from 'react';
import './Tiebanshenshu.css';
import BaziInput from './BaziInput';
import TiebanshenshuCalculation from './TiebanshenshuCalculation';
import ClauseDisplay from './ClauseDisplay';
import HistoryPanel from './HistoryPanel';

function App() {
  const [baziData, setBaziData] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedClause, setSelectedClause] = useState(null);
  const [history, setHistory] = useState([]);

  const handleBaziSubmit = (data) => {
    setBaziData(data);
    setCalculationResult(null);
    setSelectedClause(null);
  };

  const handleCalculationComplete = (result) => {
    const newResult = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      bazi: baziData
    };
    setCalculationResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };

  const handleClauseSelect = (clause) => {
    setSelectedClause(clause);
  };

  const handleLoadHistory = (record) => {
    setBaziData(record.bazi);
    setCalculationResult(record);
    setSelectedClause(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>铁板神数模拟抽算</h1>
        <p className="subtitle">邵雍铁板神数 - 皇极经世，数演天命</p>
        <div className="warning-banner">
          <span className="warning-icon">⚠</span>
          <span>本页面为模拟演示，仅供了解铁板神数之用，不作为实际命理推算依据</span>
        </div>
      </header>

      <div className="app-container">
        <div className="left-panel">
          <div className="card">
            <h2>八字信息输入</h2>
            <BaziInput onSubmit={handleBaziSubmit} />
          </div>
          
          <div className="card">
            <h2>历史记录</h2>
            <HistoryPanel 
              history={history}
              onLoad={handleLoadHistory}
              onClear={clearHistory}
            />
          </div>
        </div>

        <div className="right-panel">
          {baziData ? (
            <>
              <div className="card">
                <h2>皇极起数计算</h2>
                <TiebanshenshuCalculation 
                  baziData={baziData}
                  onCalculationComplete={handleCalculationComplete}
                  result={calculationResult}
                />
              </div>

              {calculationResult && (
                <div className="card">
                  <h2>神数条文抽取与解读</h2>
                  <ClauseDisplay 
                    calculationResult={calculationResult}
                    onClauseSelect={handleClauseSelect}
                    selectedClause={selectedClause}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="card placeholder-card">
              <div className="placeholder-content">
                <div className="abacus-icon">🧮</div>
                <h3>铁板神数演示</h3>
                <p>请输入八字信息开始模拟抽算</p>
                <div className="features-list">
                  <div className="feature">
                    <span className="feature-icon">①</span>
                    <span>输入八字或随机生成</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">②</span>
                    <span>皇极起数算法模拟</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">③</span>
                    <span>万条文库抽取演示</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">④</span>
                    <span>条文详细解读说明</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="info-panel">
        <h3>铁板神数简介</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>源流</h4>
            <p>相传为北宋邵雍（邵康节）所创，是古代最高层次的命理推算术之一。</p>
          </div>
          <div className="info-item">
            <h4>特点</h4>
            <p>以八字为基础，通过"皇极起数法"将命运化为卦数，在万条文库中定位命运断辞。</p>
          </div>
          <div className="info-item">
            <h4>皇极起数</h4>
            <p>核心算法，将八字天干地支转化为先天八卦数，再演算得到条文编号。</p>
          </div>
          <div className="info-item">
            <h4>万条文库</h4>
            <p>据说有12000条或更多条文，每条对应特定命运特征，准确度极高。</p>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>铁板神数被称为"数术之王"，是邵雍易学的最高成就之一</p>
        <p className="tip">提示：命运如数，数可变；了解命运是为了更好地把握人生</p>
      </footer>
    </div>
  );
}

export default App;