import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import toast from '../utils/toast';
import {
  YAO_TYPES,
  STORAGE_KEY,
  MAX_HISTORY_LENGTH,
  SHAKE_INTERVAL,
  SHAKE_STEP,
  shakeCoin as utilsShakeCoin,
  interpretGua,
  generateHexagram,
  getChangingYaoCount
} from '../utils/hexagramUtils';



const SixYaoDivination = () => {
  const { theme } = useTheme();
  
  // 当前卦象状态
  const [currentGua, setCurrentGua] = useState([]);
  const [guaName, setGuaName] = useState('');
  const [guaDesc, setGuaDesc] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [shakeProgress, setShakeProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // 从localStorage加载历史记录
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

  // 保存历史记录到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, [history]);



  // 完成摇卦
  const finishShaking = useCallback(() => {
    try {
      const newGua = [];
      for (let i = 0; i < 6; i++) {
        newGua.push(utilsShakeCoin());
      }
      
      setCurrentGua(newGua);
      setIsShaking(false);
      
      // 解析卦象（使用外部纯函数）
      const { name, desc } = interpretGua(newGua);
      setGuaName(name);
      setGuaDesc(desc);
      
      setShowResult(true);
    } catch (error) {
      console.error('摇卦过程出错:', error);
      setIsShaking(false);
      toast.error('摇卦过程出现错误，请重试');
    }
  }, [utilsShakeCoin]);
  
  // 当卦象解析完成时，更新历史记录
  useEffect(() => {
    if (currentGua.length === 6 && guaName && guaDesc && showResult) {  // 确保是完整的六爻卦象
      const timestamp = new Date().toLocaleString();
      const guaRecord = {
        id: Date.now(),
        gua: [...currentGua],  // 使用副本以避免潜在的状态问题
        name: guaName,
        desc: guaDesc,
        timestamp
      };
      
      setHistory(prev => [guaRecord, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]); // 最多保存20条
    }
  }, [currentGua, guaName, guaDesc, showResult, MAX_HISTORY_LENGTH]);

  // 执行摇卦动画
  const startShaking = useCallback(() => {
    if (isShaking) return;

    setIsShaking(true);
    setShowResult(false);
    setShakeProgress(0);

    const interval = setInterval(() => {
      setShakeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishShaking();
          return 100;
        }
        return prev + SHAKE_STEP;
      });
    }, SHAKE_INTERVAL);
  }, [isShaking, finishShaking]);



  // 清除历史记录 - 使用useCallback优化
  const clearHistory = useCallback(async () => {
    const confirmed = await toast.confirm('确定要清除所有历史记录吗？');
    if (confirmed) {
      setHistory([]);
    }
  }, []);

  // 重新摇卦 - 使用useCallback优化
  const reshake = useCallback(() => {
    setCurrentGua([]);
    setShowResult(false);
  }, []);

  // 计算变爻数量 - 使用useMemo优化
  const changingYaoCount = useMemo(() => {
    return currentGua.filter(yao => yao.value >= 2).length;
  }, [currentGua]);

  return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-amber-50 to-amber-100 text-gray-800'}`}>
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <header className="text-center mb-6 pt-4">
          <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-900'} mb-2`}>六爻占卜</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>摇卦六次，记录爻象，生成卦象</p>
        </header>

        {/* 摇卦区域 */}
        <div className={`rounded-2xl shadow-lg p-5 mb-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>摇卦区</h2>
            <button 
              onClick={reshake}
              className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-amber-300' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'}`}
            >
              重新摇卦
            </button>
          </div>
          
          {/* 摇卦按钮 */}
          <div className="mb-6">
            <button
              onClick={startShaking}
              disabled={isShaking}
              className={`w-full py-4 rounded-xl text-lg font-medium transition-all duration-300 ${isShaking 
                ? `${theme === 'dark' ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-300 cursor-not-allowed'}` 
                : `${theme === 'dark' ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'}`
              }`}
            >
              {isShaking ? (
                <div className="flex items-center justify-center">
                  <div className={`animate-spin rounded-full h-6 w-6 ${theme === 'dark' ? 'border-b-2 border-amber-300' : 'border-b-2 border-white'} mr-3`}></div>
                  摇卦中 {shakeProgress}%
                </div>
              ) : (
                '开始摇卦'
              )}
            </button>
            
            {/* 摇卦进度条 */}
            {isShaking && (
              <div className="mt-4">
                <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-amber-600'} transition-all duration-300`}
                    style={{ width: `${shakeProgress}%` }}
                  ></div>
                </div>
                <p className={`text-center text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>手持三枚铜钱，集中意念，默念所求之事</p>
              </div>
            )}
          </div>
          
          {/* 卦象展示 */}
          {currentGua.length > 0 && (
            <div className={`${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-amber-100'} pt-5`}>
              <h3 className={`text-center font-medium mb-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>本次卦象 (从下到上)</h3>
              
              <div className="space-y-2 mb-6">
                {currentGua.slice().reverse().map((yao, index) => {
                  const position = 5 - index;
                  return (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'}`}>
                      <div className="flex items-center">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${theme === 'dark' ? 'bg-gray-600 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                          {position + 1}爻
                        </span>
                        <span className="text-2xl">{yao.symbol}</span>
                      </div>
                      <span className={`font-medium ${yao.value >= 2 ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') : (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}`}>
                        {yao.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* 卦辞结果 */}
              {showResult && (
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-900'}`}>{guaName}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{guaDesc}</p>
                  <div className={`mt-4 text-sm flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>变爻: {changingYaoCount}个</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <div className={`rounded-2xl shadow-lg p-5 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>历史记录</h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-red-900/30 hover:bg-red-800/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
              >
                清除记录
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl mb-3">⚱️</div>
              <p>暂无历史记录</p>
              <p className="text-sm mt-1">摇卦后记录将保存在本地</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className={`border rounded-xl p-4 transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-amber-100 hover:bg-amber-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>{record.name}</h4>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{record.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex space-x-1">
                      {record.gua.slice().reverse().map((yao, idx) => (
                        <span key={idx} className="text-xl" title={yao.desc}>
                          {yao.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{record.desc}</p>
                </div>
              ))}
            </div>
          )}
          
          {history.length > 0 && (
            <div className={`mt-4 text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              共保存 {history.length} 条记录，最多保存{MAX_HISTORY_LENGTH}条
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className={`mt-6 rounded-xl p-4 border ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-amber-200'}`}>
          <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>使用说明</h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• 点击"开始摇卦"按钮，系统将模拟六次铜钱摇卦</li>
            <li>• 从下到上显示六爻，老阳(⚊○)、老阴(⚋×)为变爻</li>
            <li>• 卦象和记录将保存在浏览器本地</li>
            <li>• 此系统为模拟演示，结果仅供参考</li>
          </ul>
        </div>

        <footer className={`text-center text-xs mt-8 pt-4 border-t ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-amber-200'}`}>
          <p>六爻占卜系统 - 基于《周易》卦象原理</p>
          <p className="mt-1">本工具仅供文化学习参考</p>
        </footer>
      </div>
    </div>
  );
};

export default SixYaoDivination;
