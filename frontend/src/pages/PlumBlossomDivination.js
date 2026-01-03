import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from '../utils/toast';
import {
  calculateTrigramNumber,
  calculateMovingYao,
  getTrigramByNumber,
  determineTiYong,
  getWuxingRelation,
  interpretResult,
  getHexagramByNumbers,
  EIGHT_TRIGRAMS,
  HEXAGRAMS,
  WUXING_SHENGKE
} from '../utils/hexagramUtils';

// 常量定义
const STORAGE_KEY = 'plumHistory';
const MAX_HISTORY_LENGTH = 20;
const CALCULATION_DELAY = 800;

const PlumBlossomPageContent = () => {
  // 状态管理
  const [method, setMethod] = useState('number');
  const [numbers, setNumbers] = useState(['', '', '']);
  const [currentGua, setCurrentGua] = useState(null);
  const [history, setHistory] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [externalSign, setExternalSign] = useState('');
  const [dateTime, setDateTime] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes()
  });

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



  // 数字起卦 - 使用useCallback优化
  const divineByNumbers = useCallback(() => {
    if (numbers.some(n => n === '')) {
      toast.warning('请先输入三个数字');
      return;
    }

    setCalculating(true);

    setTimeout(() => {
      const [num1, num2, num3] = numbers.map(n => parseInt(n) || 1);

      const upperNum = calculateTrigramNumber(num1);
      const upperTrigram = getTrigramByNumber(upperNum);

      const lowerNum = calculateTrigramNumber(num2);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(num3);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '无具体卦辞，需结合体用生克解卦'
      };

      const interLower = calculateTrigramNumber(lowerNum + 1);
      const interUpper = calculateTrigramNumber(upperNum - 1);
      const huGuaKey = `${interLower}${interUpper}`;
      const huGua = HEXAGRAMS[huGuaKey] || {
        name: `${getTrigramByNumber(interLower).name}${getTrigramByNumber(interUpper).name}`,
        desc: '互卦'
      };

      const bianGuaKey = `${lowerNum}${upperNum}`;
      const bianGua = HEXAGRAMS[bianGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}之卦`,
        desc: '变卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '数字起卦',
        numbers: [...numbers],
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        huGua: { ...huGua, key: huGuaKey },
        bianGua: { ...bianGua, key: bianGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [numbers]);

  // 时间起卦 - 使用useCallback优化
  const divineByTime = useCallback(() => {
    setCalculating(true);

    setTimeout(() => {
      const { year, month, day, hour, minute } = dateTime;

      const yearNum = (year % 12) || 12;
      const upperNum = calculateTrigramNumber(yearNum + month + day);
      const upperTrigram = getTrigramByNumber(upperNum);

      const lowerNum = calculateTrigramNumber(hour + minute);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(yearNum + month + day + hour + minute);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '无具体卦辞，需结合体用生克解卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '时间起卦',
        time: { year, month, day, hour, minute },
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [dateTime]);

  // 外应起卦 - 使用useCallback优化
  const divineByExternal = useCallback(() => {
    if (!externalSign.trim()) {
      toast.warning('请输入外应描述');
      return;
    }

    setCalculating(true);

    setTimeout(() => {
      const charCount = externalSign.length;
      const upperNum = calculateTrigramNumber(charCount);
      const upperTrigram = getTrigramByNumber(upperNum);

      const minute = new Date().getMinutes();
      const lowerNum = calculateTrigramNumber(minute || 1);
      const lowerTrigram = getTrigramByNumber(lowerNum);

      const movingYao = calculateMovingYao(charCount + minute);

      const benGuaKey = `${lowerNum}${upperNum}`;
      const benGua = HEXAGRAMS[benGuaKey] || {
        name: `${lowerTrigram.name}${upperTrigram.name}`,
        desc: '外应起卦，需结合具体情境解卦'
      };

      const tiYong = determineTiYong(lowerTrigram, upperTrigram, movingYao);

      const result = {
        id: Date.now(),
        method: '外应起卦',
        externalSign,
        timestamp: new Date().toLocaleString(),
        upperTrigram,
        lowerTrigram,
        movingYao,
        benGua: { ...benGua, key: benGuaKey },
        tiYong,
        interpretation: interpretResult(lowerTrigram, upperTrigram, tiYong, movingYao, externalSign)
      };

      setCurrentGua(result);
      setCalculating(false);
      setShowDetails(true);

      setHistory(prev => [result, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);
    }, CALCULATION_DELAY);
  }, [externalSign]);



  // 清除历史记录 - 使用useCallback优化
  const clearHistory = useCallback(async () => {
    const confirmed = await toast.confirm('确定要清除所有历史记录吗？');
    if (confirmed) {
      setHistory([]);
    }
  }, []);

  // 重置当前卦 - 使用useCallback优化
  const resetCurrent = useCallback(() => {
    setCurrentGua(null);
    setShowDetails(false);
    setNumbers(['', '', '']);
    setExternalSign('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4 text-gray-800 dark:text-gray-100">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <header className="text-center mb-6 pt-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-2">
            梅花易数
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">以数起卦，观象明理</p>
        </header>

        {/* 起卦方法选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6 border border-purple-200 dark:border-purple-700">
          <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">选择起卦方法</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { id: 'number', name: '数字起卦', desc: '输入三个数字' },
              { id: 'time', name: '时间起卦', desc: '使用当前时间' },
              { id: 'external', name: '外应起卦', desc: '观物取象' }
            ].map(methodItem => (
              <button
                key={methodItem.id}
                onClick={() => {
                  setMethod(methodItem.id);
                  resetCurrent();
                }}
                className={`p-3 rounded-xl transition-all ${method === methodItem.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white dark:from-purple-700 dark:to-pink-700 shadow-md'
                  : 'bg-purple-50 dark:bg-gray-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{methodItem.name}</div>
                <div className="text-xs mt-1 opacity-80">{methodItem.desc}</div>
              </button>
            ))}
          </div>

          {/* 数字起卦 */}
          {method === 'number' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 dark:text-purple-300 font-medium mb-3">请输入三个数字（1-100）</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(index => (
                    <div key={index}>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">数字{index + 1}</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numbers[index]}
                        onChange={(e) => {
                          const newNumbers = [...numbers];
                          newNumbers[index] = e.target.value;
                          setNumbers(newNumbers);
                        }}
                        className="w-full p-3 border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={`如: ${[7, 8, 9][index]}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">三个数字分别对应：上卦、下卦、动爻</p>
              </div>
              
              <button
                onClick={divineByNumbers}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    推算中...
                  </div>
                ) : '开始起卦'}
              </button>
            </div>
          )}

          {/* 时间起卦 */}
          {method === 'time' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 dark:text-purple-300 font-medium mb-3">选择起卦时间</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'year', label: '年', value: dateTime.year, min: 1900, max: 2100 },
                    { id: 'month', label: '月', value: dateTime.month, min: 1, max: 12 },
                    { id: 'day', label: '日', value: dateTime.day, min: 1, max: 31 },
                    { id: 'hour', label: '时', value: dateTime.hour, min: 0, max: 23 },
                  ].map(item => (
                    <div key={item.id}>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{item.label}</label>
                      <input
                        type="number"
                        min={item.min}
                        max={item.max}
                        value={item.value}
                        onChange={(e) => setDateTime({
                          ...dateTime,
                          [item.id]: parseInt(e.target.value) || item.min
                        })}
                        className="w-full p-3 border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">以年月日为上卦，时分秒为下卦</p>
              </div>
              
              <button
                onClick={divineByTime}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    推算中...
                  </div>
                ) : '以此时起卦'}
              </button>
            </div>
          )}

          {/* 外应起卦 */}
          {method === 'external' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-purple-700 dark:text-purple-300 font-medium mb-3">输入外应（所见所闻所想）</h3>
                <textarea
                  value={externalSign}
                  onChange={(e) => setExternalSign(e.target.value)}
                  className="w-full h-32 p-3 border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="如：见喜鹊鸣叫、心中突然想到某事、听到特定声音等..."
                />
                <p className="text-sm text-gray-500 mt-2">外应即起卦时观察到的特殊现象或心中所想</p>
              </div>
              
              <button
                onClick={divineByExternal}
                disabled={calculating}
                className={`w-full py-3 rounded-xl font-medium text-white transition-all ${calculating
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-700 dark:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calculating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    观象中...
                  </div>
                ) : '以外应起卦'}
              </button>
            </div>
          )}
        </div>

        {/* 卦象结果展示 */}
        {currentGua && showDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-purple-200 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-800">卦象结果</h2>
              <button 
                onClick={resetCurrent}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm"
              >
                重新起卦
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 卦象基本信息 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-purple-900">{currentGua.benGua.name}</h3>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {currentGua.method}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{currentGua.benGua.desc}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-4xl mb-2">{currentGua.lowerTrigram.image}</div>
                    <div className="font-medium">{currentGua.lowerTrigram.name}卦（{currentGua.lowerTrigram.nature}）</div>
                    <div className="text-sm text-gray-600">下卦 · 体卦</div>
                    <div className="text-sm mt-1">五行：{currentGua.lowerTrigram.wuxing}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-4xl mb-2">{currentGua.upperTrigram.image}</div>
                    <div className="font-medium">{currentGua.upperTrigram.name}卦（{currentGua.upperTrigram.nature}）</div>
                    <div className="text-sm text-gray-600">上卦 · 用卦</div>
                    <div className="text-sm mt-1">五行：{currentGua.upperTrigram.wuxing}</div>
                  </div>
                </div>
              </div>

              {/* 体用生克 */}
              {currentGua.tiYong && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3">体用生克</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-blue-600 font-medium">体卦</div>
                      <div className="text-xl font-bold">{currentGua.tiYong.ti.nature}</div>
                      <div className="text-sm text-gray-600">{currentGua.tiYong.ti.wuxing}行</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-pink-600 font-medium">用卦</div>
                      <div className="text-xl font-bold">{currentGua.tiYong.yong.nature}</div>
                      <div className="text-sm text-gray-600">{currentGua.tiYong.yong.wuxing}行</div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center font-medium ${
                    currentGua.tiYong.relation.type.includes('吉') 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : currentGua.tiYong.relation.type.includes('凶')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {currentGua.tiYong.relation.type} · {currentGua.tiYong.relation.meaning}
                  </div>
                </div>
              )}

              {/* 动爻信息 */}
              {currentGua.movingYao && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-2">动爻信息</h3>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xl font-bold mr-4">
                      {currentGua.movingYao}
                    </div>
                    <div>
                      <div className="font-medium">第{currentGua.movingYao}爻为动爻</div>
                      <div className="text-sm text-gray-600">主事态变化、关键转折</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 卦象解读 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">卦象解读</h3>
                <p className="text-gray-700 leading-relaxed">{currentGua.interpretation}</p>
              </div>

              {/* 卦象时间 */}
              <div className="text-center text-sm text-gray-500 border-t pt-3">
                起卦时间：{currentGua.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-800">历史记录</h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-red-50 dark:bg-red-900 hover:bg-red-100 text-red-600 dark:text-red-300 rounded-full text-sm"
              >
                清除记录
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">🌸</div>
              <p>暂无历史记录</p>
              <p className="text-sm mt-1">起卦后记录将保存在本地</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className="border border-purple-100 rounded-xl p-4 hover:bg-purple-50 transition-colors"
                  onClick={() => {
                    setCurrentGua(record);
                    setShowDetails(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-purple-800">{record.benGua.name}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {record.method}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{record.lowerTrigram.image}{record.upperTrigram.image}</span>
                    <div className="text-sm text-gray-600">
                      {record.lowerTrigram.name}·{record.upperTrigram.name}卦
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{record.benGua.desc}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className={`px-2 py-1 rounded ${
                      record.tiYong?.relation.type.includes('吉') 
                        ? 'bg-green-100 text-green-700'
                        : record.tiYong?.relation.type.includes('凶')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.tiYong?.relation.type}
                    </div>
                    <span>{record.timestamp.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {history.length > 0 && (
            <div className="mt-4 text-center text-xs text-gray-500">
              共保存 {history.length} 条记录，最多保存{MAX_HISTORY_LENGTH}条
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white/80 rounded-xl p-4 border border-purple-200">
          <h3 className="font-medium text-purple-800 mb-3">梅花易数简介</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>数字起卦</strong>：输入任意三个数字，转化为卦象</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>时间起卦</strong>：以年月日时为数，计算卦象</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>外应起卦</strong>：观物取象，以所见所闻起卦</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>体用生克</strong>：体卦为问卦者，用卦为所问事，生克关系定吉凶</span>
            </li>
          </ul>
          <div className="mt-3 text-xs text-gray-500">
            注：本工具为梅花易数入门演示，实际占卜需结合卦辞爻辞、五行生克、外应等综合判断。
          </div>
        </div>

        <footer className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-purple-200">
          <p>梅花易数占卜系统 - 邵雍梅花易数原理</p>
          <p className="mt-1">观物取象，以数明理，仅供文化学习参考</p>
        </footer>
      </div>
    </div>
  );
};

export default PlumBlossomPageContent;