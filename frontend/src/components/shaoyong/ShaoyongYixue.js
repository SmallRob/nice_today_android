import { useState, useEffect } from 'react';

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

  // 主题切换 - update Tailwind theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* 头部导航 */}
      <header className={`py-4 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-light">邵雍易学</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>梅花易数 • 铁板神数 • 皇极经世</p>
          </div>

          <div className="flex items-center">
            <button
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors duration-300`}
              onClick={toggleTheme}
              title={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <nav className="max-w-6xl mx-auto px-4 mt-3">
          <div className="flex gap-2 sm:gap-3">
            <button
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'meihua' 
                  ? (theme === 'dark' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20') 
                  : (theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('meihua')}
            >
              <span className="text-lg">🌸</span>
              <span className="whitespace-nowrap">梅花易数</span>
            </button>

            <button
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'tieban' 
                  ? (theme === 'dark' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20') 
                  : (theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('tieban')}
            >
              <span className="text-lg">🧮</span>
              <span className="whitespace-nowrap">铁板神数</span>
            </button>
          </div>
        </nav>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1">
        {activeTab === 'meihua' ? (
          // 梅花易数标签页
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 主要内容区域 - 起卦和卦象展示 */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-2xl p-5 shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">起卦方式</h2>
                  <DivinationForm onDivination={handleDivination} />
                </div>

                <div className={`rounded-2xl p-5 shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">卦象展示</h2>
                  {divinationResult ? (
                    <HexagramDisplay result={divinationResult} />
                  ) : (
                    <div className="text-center py-10">
                      <div className="text-6xl mb-4">☯️</div>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>请选择起卦方式，开始占卜</p>
                    </div>
                  )}
                </div>

                <div className={`rounded-2xl p-5 shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">卦象解读</h2>
                  {divinationResult ? (
                    <InterpretationPanel result={divinationResult} />
                  ) : (
                    <div className="text-center py-10">
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>卦象显示后，解读将在此处呈现</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 历史记录 - 放到最后 */}
              <div className={`rounded-2xl p-5 shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h2 className="text-lg font-semibold mb-4">历史记录</h2>
                <HistoryPanel
                  history={meihuaHistory}
                  onLoad={loadMeihuaHistory}
                  onClear={clearMeihuaHistory}
                />
              </div>
            </div>
          </div>
        ) : (
          // 铁板神数标签页
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 主要内容区域 - 八字输入和计算 */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-2xl p-5 shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">八字信息输入</h2>
                  <BaziInput onSubmit={handleBaziSubmit} />
                </div>

                {baziData ? (
                  <>
                    <div className={`rounded-2xl p-5 shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <h2 className="text-lg font-semibold mb-4">皇极起数计算</h2>
                      <TiebanshenshuCalculation
                        baziData={baziData}
                        onCalculationComplete={handleCalculationComplete}
                        result={calculationResult}
                      />
                    </div>

                    {calculationResult && (
                      <div className={`rounded-2xl p-5 shadow-lg ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <h2 className="text-lg font-semibold mb-4">神数条文抽取与解读</h2>
                        <ClauseDisplay
                          calculationResult={calculationResult}
                          onClauseSelect={handleClauseSelect}
                          selectedClause={selectedClause}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`rounded-2xl p-5 shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className="text-center py-10">
                      <div className="text-6xl mb-4">🧮</div>
                      <h3 className="text-xl font-semibold mb-2">铁板神数演示</h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>请输入八字信息开始模拟抽算</p>
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">①</span>
                          <span>输入八字或随机生成</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">②</span>
                          <span>皇极起数算法模拟</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">③</span>
                          <span>万条文库抽取演示</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">④</span>
                          <span>条文详细解读说明</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 历史记录 - 放到最后 */}
              {tiebanHistory.length > 0 && (
                <div className={`rounded-2xl p-5 shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">历史记录</h2>
                  <HistoryPanel
                    history={tiebanHistory}
                    onLoad={loadTiebanHistory}
                    onClear={clearTiebanHistory}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 底部信息 */}
      <footer className={`py-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2">邵雍易学 - 融合梅花易数之简易与铁板神数之精微</p>
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {activeTab === 'meihua'
              ? '提示：梅花易数强调"心易"，卦象解读需结合当下心境'
              : '提示：铁板神数乃"数术之王"，条文解读需结合八字整体'}
          </p>
          <div className="flex justify-center gap-4 text-sm">
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