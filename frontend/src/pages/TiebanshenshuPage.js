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
  const [step, setStep] = useState(0); // 0: Intro, 1: Input, 2: Calculation, 3: Result
  const [baziData, setBaziData] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedClause, setSelectedClause] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
    setStep(2); // 进入计算步骤
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
    
    // 延迟一点跳转，让用户看到进度完成
    setTimeout(() => {
        setStep(3); // 进入结果步骤
    }, 500);
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
    setStep(3); // 直接进入结果页
    setShowHistory(false);
  }, []);

  // 清除历史记录
  const clearHistory = useCallback(async () => {
    const confirmed = await toast.confirm('确定要清除所有历史记录吗？');
    if (confirmed) {
      setHistory([]);
    }
  }, []);

  // 重置
  const handleReset = useCallback(() => {
    setBaziData(null);
    setCalculationResult(null);
    setSelectedClause(null);
    setStep(1); // 回到输入页
  }, []);

  // 获取八字摘要
  const getBaziSummary = (data) => {
    if (!data) return '';
    const { year, month, day, hour } = data;
    return `${year.stem}${year.branch} ${month.stem}${month.branch} ${day.stem}${day.branch} ${hour.stem}${hour.branch}`;
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="step-indicator">
      {['输入八字', '皇极起数', '神数条文'].map((label, index) => {
        const stepNum = index + 1;
        const isActive = step === stepNum;
        const isCompleted = step > stepNum;
        
        return (
          <div key={index} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="step-circle">
              {isCompleted ? '✓' : stepNum}
            </div>
            <div className="step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`tiebanshenshu-page-container ${theme === 'dark' ? 'tiebanshenshu-bg-gradient-dark dark' : 'tiebanshenshu-bg-gradient-light'}`}>
      <div className="tiebanshenshu-content-wrapper">
        
        {/* 顶部标题栏 */}
        <header className="mb-8 pt-4 flex justify-between items-start animate-fade-in">
          <div className="flex-1">
             <h1 className="page-title">铁板神数</h1>
             <p className="page-subtitle">邵雍皇极经世 · 数演天命玄机</p>
          </div>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
            aria-label="历史记录"
          >
            <span className="text-xl">📜</span>
          </button>
        </header>

        {/* 步骤 0: 引导页 */}
        {step === 0 && (
          <div className="animate-fade-in space-y-6 flex-1 flex flex-col justify-center">
             <div className="glass-card text-center py-10">
                <div className="text-6xl mb-6">🧮</div>
                <h2 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">探寻命运的数字密码</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  铁板神数相传为北宋邵雍所创，通过“皇极起数”将生辰八字转化为先天卦数，
                  在万条文库中定位属于你的命运断辞。
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => setStep(1)} className="btn-primary">
                        开始推算
                    </button>
                    <div className="text-xs text-gray-400 mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                        ⚠️ 仅供文化研究与娱乐，请勿迷信
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* 步骤 1-3 的通用容器 */}
        {step > 0 && (
          <div className="animate-fade-in">
            {renderStepIndicator()}
            
            {/* 步骤 1: 输入八字 */}
            {step === 1 && (
              <div className="glass-card animate-fade-in">
                <h2 className="text-xl font-bold mb-6 text-center text-gray-800 dark:text-white">请输入生辰信息</h2>
                <BaziInput onSubmit={handleBaziSubmit} />
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setStep(0)} 
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                        返回首页
                    </button>
                </div>
              </div>
            )}

            {/* 步骤 2: 计算过程 */}
            {step === 2 && baziData && (
              <div className="glass-card animate-fade-in">
                 <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">皇极起数推演中</h2>
                 <TiebanshenshuCalculation
                  baziData={baziData}
                  onCalculationComplete={handleCalculationComplete}
                  result={calculationResult}
                />
              </div>
            )}

            {/* 步骤 3: 结果展示 */}
            {step === 3 && calculationResult && (
              <div className="space-y-4 animate-fade-in">
                <div className="glass-card">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                     <div>
                        <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">推算结果</h2>
                        <p className="text-xs text-gray-500">{calculationResult.timestamp}</p>
                     </div>
                     <button onClick={handleReset} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        重新推算
                     </button>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl mb-6">
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">八字乾坤：</p>
                     <p className="text-lg font-serif font-bold text-indigo-800 dark:text-indigo-200">
                        {getBaziSummary(calculationResult.bazi)}
                     </p>
                  </div>

                  <ClauseDisplay
                    calculationResult={calculationResult}
                    onClauseSelect={handleClauseSelect}
                    selectedClause={selectedClause}
                  />
                </div>
                
                <div className="text-center pb-8">
                    <button onClick={handleReset} className="btn-secondary">
                        开启新的推算
                    </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 历史记录抽屉 */}
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${showHistory ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowHistory(false)} />
        <div className={`history-drawer ${showHistory ? 'open' : ''}`}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">历史记录</h3>
              <div className="flex gap-4">
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="text-sm text-red-500 font-medium">
                        清空
                    </button>
                  )}
                  <button onClick={() => setShowHistory(false)} className="text-gray-500">
                    ✕
                  </button>
              </div>
           </div>
           
           {history.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
                暂无推算记录
             </div>
           ) : (
             <div className="space-y-3">
                {history.map(record => (
                   <div 
                     key={record.id} 
                     onClick={() => handleLoadHistory(record)}
                     className="history-item rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
                   >
                      <div>
                         <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {getBaziSummary(record.bazi)}
                         </p>
                         <p className="text-xs text-gray-500">{record.timestamp}</p>
                      </div>
                      <div className="text-indigo-500 text-sm font-medium">
                         查看 ›
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default TiebanshenshuPageContent;