import React, { useState, useEffect } from 'react';
import './ShaoyongYixue.css';
import './shaoyong-mobile-styles.css';

// 导入梅花易数组件
import HexagramDisplay from './HexagramDisplay';
import DivinationForm from './DivinationForm';
import InterpretationPanel from './InterpretationPanel';

// 导入铁板神数组件
import BaziInput from './BaziInput';
import TiebanshenshuCalculation from './TiebanshenshuCalculation';
import ClauseDisplay from './ClauseDisplay';

// 导入共享组件
import HistoryPanel from './HistoryPanel';

const ShaoyongYixue = () => {
  const [activeTab, setActiveTab] = useState('meihua'); // 梅花易数 | 铁板神数
  const [theme, setTheme] = useState('dark'); // light | dark
  
  // 梅花易数状态
  const [divinationResult, setDivinationResult] = useState(null);
  const [meihuaHistory, setMeihuaHistory] = useState([]);
  
  // 铁板神数状态
  const [baziData, setBaziData] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedClause, setSelectedClause] = useState(null);
  const [tiebanHistory, setTiebanHistory] = useState([]);

  // 主题切换
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 本地存储管理
  useEffect(() => {
    // 加载历史记录
    const savedMeihuaHistory = localStorage.getItem('shaoyong_meihua_history');
    const savedTiebanHistory = localStorage.getItem('shaoyong_tieban_history');
    
    if (savedMeihuaHistory) {
      try {
        setMeihuaHistory(JSON.parse(savedMeihuaHistory));
      } catch (e) {
        console.error('加载梅花易数历史记录失败:', e);
      }
    }
    
    if (savedTiebanHistory) {
      try {
        setTiebanHistory(JSON.parse(savedTiebanHistory));
      } catch (e) {
        console.error('加载铁板神数历史记录失败:', e);
      }
    }
  }, []);

  // 保存历史记录
  const saveHistory = (type, record) => {
    if (type === 'meihua') {
      const newHistory = [record, ...meihuaHistory.slice(0, 9)];
      setMeihuaHistory(newHistory);
      localStorage.setItem('shaoyong_meihua_history', JSON.stringify(newHistory));
    } else {
      const newHistory = [record, ...tiebanHistory.slice(0, 9)];
      setTiebanHistory(newHistory);
      localStorage.setItem('shaoyong_tieban_history', JSON.stringify(newHistory));
    }
  };

  // 梅花易数处理函数
  const handleDivination = (result) => {
    const newResult = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      type: 'meihua'
    };
    setDivinationResult(newResult);
    saveHistory('meihua', newResult);
  };

  const loadMeihuaHistory = (record) => {
    setDivinationResult(record);
  };

  const clearMeihuaHistory = () => {
    setMeihuaHistory([]);
    localStorage.removeItem('shaoyong_meihua_history');
  };

  // 铁板神数处理函数
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
      type: 'tieban',
      bazi: baziData
    };
    setCalculationResult(newResult);
    saveHistory('tieban', newResult);
  };

  const handleClauseSelect = (clause) => {
    setSelectedClause(clause);
  };

  const loadTiebanHistory = (record) => {
    setBaziData(record.bazi);
    setCalculationResult(record);
    setSelectedClause(null);
  };

  const clearTiebanHistory = () => {
    setTiebanHistory([]);
    localStorage.removeItem('shaoyong_tieban_history');
  };

  // 主题切换函数
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="shaoyong-yixue safe-area-inset-top">
      {/* 头部导航 */}
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>邵雍易学</h1>
            <p className="subtitle">梅花易数 • 铁板神数 • 皇极经世</p>
          </div>
          
          <div className="header-controls">
            <button 
              className={`theme-toggle ${theme}`}
              onClick={toggleTheme}
              title={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'meihua' ? 'active' : ''}`}
            onClick={() => setActiveTab('meihua')}
          >
            <span className="tab-icon">🌸</span>
            <span className="tab-label">梅花易数</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'tieban' ? 'active' : ''}`}
            onClick={() => setActiveTab('tieban')}
          >
            <span className="tab-icon">🧮</span>
            <span className="tab-label">铁板神数</span>
          </button>
        </nav>
      </header>

      {/* 主要内容区域 */}
      <main className="main-content">
        {activeTab === 'meihua' ? (
          // 梅花易数标签页
          <div className="tab-content meihua-content">
            <div className="content-grid">
              {/* 左侧面板 - 起卦和历史 */}
              <div className="left-panel">
                <div className="card">
                  <h2>起卦方式</h2>
                  <DivinationForm onDivination={handleDivination} />
                </div>
                
                <div className="card">
                  <h2>历史记录</h2>
                  <HistoryPanel 
                    history={meihuaHistory}
                    onLoad={loadMeihuaHistory}
                    onClear={clearMeihuaHistory}
                  />
                </div>
              </div>

              {/* 右侧面板 - 卦象展示和解读 */}
              <div className="right-panel">
                <div className="card">
                  <h2>卦象展示</h2>
                  {divinationResult ? (
                    <HexagramDisplay result={divinationResult} />
                  ) : (
                    <div className="placeholder">
                      <div className="yin-yang"></div>
                      <p>请选择起卦方式，开始占卜</p>
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
          </div>
        ) : (
          // 铁板神数标签页
          <div className="tab-content tieban-content">
            <div className="content-grid">
              {/* 左侧面板 - 八字输入和历史 */}
              <div className="left-panel">
                <div className="card">
                  <h2>八字信息输入</h2>
                  <BaziInput onSubmit={handleBaziSubmit} />
                </div>
                
                <div className="card">
                  <h2>历史记录</h2>
                  <HistoryPanel 
                    history={tiebanHistory}
                    onLoad={loadTiebanHistory}
                    onClear={clearTiebanHistory}
                  />
                </div>
              </div>

              {/* 右侧面板 - 计算和条文 */}
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
          </div>
        )}
      </main>

      {/* 底部信息 */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>邵雍易学 - 融合梅花易数之简易与铁板神数之精微</p>
          <p className="tip">
            {activeTab === 'meihua' 
              ? '提示：梅花易数强调"心易"，卦象解读需结合当下心境' 
              : '提示：铁板神数乃"数术之王"，条文解读需结合八字整体'}
          </p>
          <div className="footer-links">
            <span>🌸 以数观象</span>
            <span>🧮 以象明理</span>
            <span>📜 以理知命</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShaoyongYixue;