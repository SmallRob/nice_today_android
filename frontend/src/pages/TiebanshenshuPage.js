import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import toast from '../utils/toast';
import BaziInput from '../components/shaoyong/BaziInput';
import TiebanshenshuCalculation from '../components/shaoyong/TiebanshenshuCalculation';
import ClauseDisplay from '../components/shaoyong/ClauseDisplay';
import '../components/shaoyong/Tiebanshenshu.css';
import '../components/shaoyong/ClauseDisplay.css';

const STORAGE_KEY = 'tiebanshenshu_history';
const MAX_HISTORY_LENGTH = 20;

const TiebanshenshuPageContent = () => {
  const { theme } = useTheme();
  
  // 状态管理
  const [baziData, setBaziData] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedClause, setSelectedClause] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [history, setHistory] = useState([]);

  // 从 localStorage 加载历史记录
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

  // 保存历史记录到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, [history]);

  // 八字提交处理
  const handleBaziSubmit = useCallback((data) => {
    setBaziData(data);
    setCalculationResult(null);
    setSelectedClause(null);
    setActiveTab('calculation');
  }, []);

  // 计算完成处理
  const handleCalculationComplete = useCallback((result) => {
    const newResult = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      bazi: baziData,
      type: 'tieban'
    };
    setCalculationResult(newResult);
    
    // 更新历史记录
    setHistory(prev => [newResult, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
  }, [baziData]);

  // 条文选择处理
  const handleClauseSelect = useCallback((clause) => {
    setSelectedClause(clause);
  }, []);

  // 加载历史记录
  const handleLoadHistory = useCallback((record) => {
    setBaziData(record.bazi);
    setCalculationResult(record);
    setSelectedClause(null);
    setActiveTab('calculation');
  }, []);

  // 清除历史记录
  const clearHistory = useCallback(async () => {
    const confirmed = await toast.confirm('确定要清除所有历史记录吗？');
    if (confirmed) {
      setHistory([]);
    }
  }, []);

  // 重置所有状态
  const handleReset = useCallback(() => {
    setBaziData(null);
    setCalculationResult(null);
    setSelectedClause(null);
    setActiveTab('input');
  }, []);

  // 获取八字摘要
  const getBaziSummary = (data) => {
    if (!data) return '';
    const { year, month, day, hour } = data;
    return `${year.stem}${year.branch} ${month.stem}${month.branch} ${day.stem}${day.branch} ${hour.stem}${hour.branch}`;
  };

  return (
    <div className="tiebanshenshu-page-container min-h-screen pb-24 safe-area-bottom">
      <div className={`${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50'}`}>
        <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <header className="text-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>
            🧮 铁板神数
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            邵雍皇极经世，数演天命玄机
          </p>
        </header>

        {/* 警告提示 */}
        <div className={`mb-6 rounded-2xl overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-amber-700' : 'bg-white border-amber-200'} shadow-md`}>
          <div className={`p-3 flex items-center space-x-2 ${theme === 'dark' ? 'bg-gradient-to-r from-amber-900 to-orange-900' : 'bg-gradient-to-r from-amber-500 to-orange-600'} text-white`}>
            <span className="text-xl md:text-2xl">⚠️</span>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base whitespace-nowrap">重要提示</span>
            </div>
          </div>
          <div className="p-4">
            <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              本页面为模拟演示，仅供了解铁板神数之用，不作为实际命理推算依据
            </p>
          </div>
        </div>

        {/* 标签切换 */}
        {baziData && (
          <div className={`flex mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} p-1`}>
            <button
              onClick={() => setActiveTab('input')}
              className={`flex-1 py-2.5 px-4 text-center rounded-xl transition-all duration-300 touch-manipulation font-medium ${activeTab === 'input'
                ? `${theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-600'} text-white shadow-md`
                : `${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                }`}
            >
              <span className="text-sm md:text-base whitespace-nowrap">八字信息</span>
            </button>
            <button
              onClick={() => setActiveTab('calculation')}
              className={`flex-1 py-2.5 px-4 text-center rounded-xl transition-all duration-300 touch-manipulation font-medium ${activeTab === 'calculation'
                ? `${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600'} text-white shadow-md`
                : `${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                }`}
            >
              <span className="text-sm md:text-base whitespace-nowrap">神数推算</span>
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div className="space-y-6">
          {/* 八字输入区域 */}
          {(!baziData || activeTab === 'input') && (
            <div className={`rounded-2xl shadow-lg p-4 md:p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}`}>
              <h2 className={`text-lg md:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                八字信息输入
              </h2>
              <BaziInput onSubmit={handleBaziSubmit} />
            </div>
          )}

          {/* 历史记录 - 仅在输入标签显示 */}
          {(!baziData || activeTab === 'input') && (
            <div className={`rounded-2xl shadow-lg p-4 md:p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                  历史记录
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-red-900/30 hover:bg-red-800/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                  >
                    清除记录
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="text-4xl md:text-5xl mb-3">📚</div>
                  <p className={`text-sm md:text-base font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>暂无历史记录</p>
                  <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    推算后记录将保存在浏览器本地存储中
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {history.map((record) => (
                    <div 
                      key={record.id} 
                      className={`border rounded-xl p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-indigo-50'}`}
                      onClick={() => handleLoadHistory(record)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🧮</span>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                            铁板神数推算
                          </h4>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {record.timestamp}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {getBaziSummary(record.bazi)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {record.bazi?.gender === 'male' ? '男命' : '女命'} · {record.bazi?.solarDate}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span>条文：{record.clauseNumbers?.length || 0}条</span>
                          <span className="mx-2">·</span>
                          <span>ID: {record.calculationId?.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {history.length > 0 && (
                <div className={`mt-4 text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  共保存 {history.length} 条记录，最多保存 {MAX_HISTORY_LENGTH} 条
                </div>
              )}
            </div>
          )}

          {/* 神数推算内容 */}
          {baziData && activeTab === 'calculation' && (
            <>
              <div className={`rounded-2xl shadow-lg p-4 md:p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                    皇极起数计算
                  </h2>
                  {calculationResult && (
                    <button 
                      onClick={handleReset}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      重新开始
                    </button>
                  )}
                </div>
                <TiebanshenshuCalculation
                  baziData={baziData}
                  onCalculationComplete={handleCalculationComplete}
                  result={calculationResult}
                />
              </div>

              {calculationResult && (
                <div id="clause-display-section" className={`rounded-2xl shadow-lg p-4 md:p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}`}>
                  <h2 className={`text-lg md:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    神数条文抽取与解读
                  </h2>
                  <ClauseDisplay
                    calculationResult={calculationResult}
                    onClauseSelect={handleClauseSelect}
                    selectedClause={selectedClause}
                  />
                </div>
              )}
            </>
          )}

          {/* 空状态展示 */}
          {!baziData && (
            <div className={`rounded-2xl shadow-lg p-4 md:p-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}`}>
              <div className="text-center py-6 md:py-10">
                <div className="text-5xl md:text-6xl mb-4">🧮</div>
                <h3 className={`text-xl md:text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>
                  铁板神数演示
                </h3>
                <p className={`text-sm md:text-base mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  请输入八字信息开始模拟抽算
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                    <span className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>①</span>
                    <span className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      输入八字或随机生成
                    </span>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <span className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>②</span>
                    <span className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      皇极起数算法模拟
                    </span>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                    <span className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>③</span>
                    <span className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      万条文库抽取演示
                    </span>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <span className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>④</span>
                    <span className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      条文详细解读说明
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 铁板神数简介 */}
          <div className={`rounded-2xl shadow-lg p-4 md:p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'}`}>
            <h3 className={`text-lg md:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>
              铁板神数简介
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/60'}`}>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'} text-sm md:text-base`}>
                  源流
                </h4>
                <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  相传为北宋邵雍（邵康节）所创，是古代最高层次的命理推算术之一。
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/60'}`}>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'} text-sm md:text-base`}>
                  特点
                </h4>
                <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  以八字为基础，通过"皇极起数法"将命运化为卦数，在万条文库中定位命运断辞。
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/60'}`}>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'} text-sm md:text-base`}>
                  皇极起数
                </h4>
                <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  核心算法，将八字天干地支转化为先天八卦数，再演算得到条文编号。
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/60'}`}>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'} text-sm md:text-base`}>
                  万条文库
                </h4>
                <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  据说有12000条或更多条文，每条对应特定命运特征，准确度极高。
                </p>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className={`rounded-xl p-4 md:p-5 border ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-indigo-200'}`}>
            <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
              使用说明
            </h3>
            <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• 输入八字信息或使用随机生成的八字进行演示</li>
              <li>• 点击"皇极起数计算"按钮，系统将模拟推算过程</li>
              <li>• 计算完成后，系统将展示相关条文编号</li>
              <li>• 点击条文可查看详细解读和解析</li>
              <li>• 历史记录将保存在浏览器本地存储中</li>
              <li>• 此系统为模拟演示，结果仅供参考</li>
            </ul>
          </div>

          {/* 底部提示 */}
          <div className={`rounded-2xl p-4 md:p-6 shadow-md text-center ${theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-indigo-100' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>
            <p className={`text-sm md:text-base font-medium mb-2 ${theme === 'dark' ? 'text-indigo-200' : 'text-white'}`}>
              铁板神数被称为"数术之王"，是邵雍易学的最高成就之一
            </p>
            <p className={`text-xs md:text-sm opacity-90 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-100'}`}>
              提示：命运如数，数可变；了解命运是为了更好地把握人生
            </p>
          </div>
        </div>

        {/* 页脚 */}
        <footer className={`text-center text-xs mt-8 pt-6 border-t ${theme === 'dark' ? 'text-gray-500 border-gray-800' : 'text-gray-500 border-indigo-200'}`}>
          <p>铁板神数系统 - 基于邵雍《皇极经世》算法原理</p>
          <p className="mt-1">本工具仅供文化学习参考</p>
        </footer>
      </div>
    </div>
  </div>
);
};

export default TiebanshenshuPageContent;
