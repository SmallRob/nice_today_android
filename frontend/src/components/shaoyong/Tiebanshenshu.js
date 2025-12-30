import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('input'); // 'input' 或 'calculation'

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
    <div className="space-y-4 performance-optimized pb-4 shadow-inner app-container">
      {/* 页面标题 - 移动端优化 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-3 shadow-lg dark:from-indigo-800 dark:to-purple-900">
        <h2 className="text-base md:text-lg font-bold mb-1 whitespace-nowrap">铁板神数模拟抽算</h2>
        <p className="text-indigo-100 text-xs md:text-sm dark:text-indigo-200 opacity-90 whitespace-nowrap overflow-hidden text-ellipsis">
          邵雍铁板神数 - 皇极经世，数演天命
        </p>
      </div>

      {/* 警告信息 */}
      <div className="mb-3 rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-base md:text-xl">⚠</span>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-lg whitespace-nowrap">重要提示</span>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
            本页面为模拟演示，仅供了解铁板神数之用，不作为实际命理推算依据
          </p>
        </div>
      </div>

      {/* 标签切换 - 移动端优化 */}
      {baziData && (
        <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 p-1">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 px-3 text-center rounded-xl transition-all duration-300 touch-manipulation ${activeTab === 'input'
              ? 'bg-indigo-500 text-white shadow-md font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <span className="text-xs md:text-sm whitespace-nowrap">八字信息</span>
          </button>
          <button
            onClick={() => setActiveTab('calculation')}
            className={`flex-1 py-2 px-3 text-center rounded-xl transition-all duration-300 touch-manipulation ${activeTab === 'calculation'
              ? 'bg-purple-500 text-white shadow-md font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <span className="text-xs md:text-sm whitespace-nowrap">神数推算</span>
          </button>
        </div>
      )}

      {/* 根据标签显示内容 */}
      {(!baziData || activeTab === 'input') && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold mb-3 whitespace-nowrap">八字信息输入</h2>
            <BaziInput onSubmit={handleBaziSubmit} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold mb-3 whitespace-nowrap">历史记录</h2>
            <HistoryPanel
              history={history}
              onLoad={handleLoadHistory}
              onClear={clearHistory}
            />
          </div>
        </div>
      )}

      {/* 神数推算内容 */}
      {baziData && activeTab === 'calculation' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold mb-3 whitespace-nowrap">皇极起数计算</h2>
            <TiebanshenshuCalculation
              baziData={baziData}
              onCalculationComplete={handleCalculationComplete}
              result={calculationResult}
            />
          </div>

          {calculationResult && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-base md:text-lg font-bold mb-3 whitespace-nowrap">神数条文抽取与解读</h2>
              <ClauseDisplay
                calculationResult={calculationResult}
                onClauseSelect={handleClauseSelect}
                selectedClause={selectedClause}
              />
            </div>
          )}
        </div>
      )}

      {/* 空状态显示 */}
      {!baziData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-center py-6 md:py-10">
            <div className="text-4xl md:text-6xl mb-3">🧮</div>
            <h3 className="text-base md:text-xl font-bold mb-3 whitespace-nowrap">铁板神数演示</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6 whitespace-nowrap overflow-hidden text-ellipsis">请输入八字信息开始模拟抽算</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <span className="text-lg md:text-2xl">①</span>
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">输入八字或随机生成</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <span className="text-lg md:text-2xl">②</span>
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">皇极起数算法模拟</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <span className="text-lg md:text-2xl">③</span>
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">万条文库抽取演示</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <span className="text-lg md:text-2xl">④</span>
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">条文详细解读说明</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 铁板神数简介 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-3 md:p-4 shadow-sm border border-indigo-100 dark:border-slate-700">
        <h3 className="text-base md:text-lg font-bold mb-3 whitespace-nowrap">铁板神数简介</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-sm md:text-base whitespace-nowrap">源流</h4>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">相传为北宋邵雍（邵康节）所创，是古代最高层次的命理推算术之一。</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-sm md:text-base whitespace-nowrap">特点</h4>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">以八字为基础，通过"皇极起数法"将命运化为卦数，在万条文库中定位命运断辞。</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-sm md:text-base whitespace-nowrap">皇极起数</h4>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">核心算法，将八字天干地支转化为先天八卦数，再演算得到条文编号。</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-sm md:text-base whitespace-nowrap">万条文库</h4>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">据说有12000条或更多条文，每条对应特定命运特征，准确度极高。</p>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-3 shadow-md">
        <p className="text-xs md:text-sm font-medium mb-1 whitespace-nowrap overflow-hidden text-ellipsis">铁板神数被称为"数术之王"，是邵雍易学的最高成就之一</p>
        <p className="text-xs opacity-90 whitespace-nowrap overflow-hidden text-ellipsis">提示：命运如数，数可变；了解命运是为了更好地把握人生</p>
      </div>
    </div>
  );
}

export default App;