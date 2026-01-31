/**
 * 奇门遁甲计算器组件
 * 实现奇门遁甲的核心计算逻辑
 */

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrentConfig } from '../../contexts/UserConfigContext';
import { aiService } from '../../services/aiService';

const QimenDunjiaCalculator = () => {
  const { theme } = useTheme();
  const currentConfig = useCurrentConfig();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 起局信息状态
  const [matterTopic, setMatterTopic] = useState('');
  const [matterDirection, setMatterDirection] = useState('综合');
  const [calculationTime, setCalculationTime] = useState(new Date().toISOString().slice(0, 16));

  // 问事方向选项
  const directionOptions = [
    '综合', '事业', '财运', '感情', '健康', '学业', '出行', '寻物'
  ];

  // 八卦数组
  const bagua = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  
  // 九星数组
  const jiuXing = ['天蓬', '天芮', '天冲', '天辅', '天英', '天禽', '天柱', '天心', '玄武'];
  
  // 八门数组
  const baMen = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
  
  // 八神数组
  const baShen = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

  /**
   * 计算奇门遁甲盘局
   */
  const calculateQimen = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // 模拟计算过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 获取用户出生信息
      const birthInfo = {
        birthDate: currentConfig?.birthDate || new Date().toISOString().split('T')[0],
        birthTime: currentConfig?.birthTime || '12:00',
        birthLocation: {
          lng: currentConfig?.birthLocation?.lng || 116.40,
          lat: currentConfig?.birthLocation?.lat || 39.90
        },
        nickname: currentConfig?.nickname || '默认用户'
      };
      
      let qimenLayout;
      
      // 使用起局时间进行计算
      const [datePart, timePart] = calculationTime.split('T');
      qimenLayout = generateQimenLayoutFromDateTime(datePart, timePart);
      
      // 生成初步分析
      const basicAnalysis = generateAnalysis(qimenLayout);

      // AI 解卦
      let aiAnalysis = null;
      try {
        const prompt = `
          你是一位精通奇门遁甲的大师。
          用户起局问事：
          主题：${matterTopic || '未指定'}
          方向：${matterDirection}
          起局时间：${calculationTime.replace('T', ' ')}
          
          奇门盘面信息：
          ${JSON.stringify(qimenLayout, null, 2)}
          
          请根据以上信息，进行专业的奇门遁甲解卦。
          要求：
          1. 语气专业、玄妙但易懂。
          2. 结合九星、八门、八神进行分析。
          3. 给出具体的吉凶判断和行动建议。
          4. 如果用户没有提供具体问题，则进行综合运势分析。
          5. 字数控制在 300 字以内。
        `;
        
        const aiResponse = await aiService.generateCompletion(prompt);
        aiAnalysis = aiResponse.trim();
      } catch (aiErr) {
        console.error("AI Analysis Error:", aiErr);
        // AI 失败时不阻断流程，仅显示基础分析
      }
      
      const finalResult = {
        ...qimenLayout,
        calculationTime: calculationTime.replace('T', ' '),
        analysis: basicAnalysis,
        aiAnalysis: aiAnalysis,
        userInfo: birthInfo,
        matterTopic,
        matterDirection
      };

      setResult(finalResult);
      
      // 自动保存到历史记录
      saveToHistory(finalResult);

    } catch (err) {
      console.error('计算过程中发生错误:', err);
      setError('计算失败，请重试');
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * 保存计算结果到历史记录
   */
  const saveToHistory = (resultToSave) => {
    if (!resultToSave) return;
    
    try {
      // 获取现有历史记录
      let existingHistory = [];
      const historyStr = localStorage.getItem('qimen_history');
      if (historyStr) {
        existingHistory = JSON.parse(historyStr);
      }
      
      // 添加新记录
      const newRecord = {
        id: Date.now(), // 使用时间戳作为唯一ID
        calculationTime: resultToSave.calculationTime,
        result: resultToSave.analysis,
        aiAnalysis: resultToSave.aiAnalysis, // 保存 AI 分析
        matterTopic: resultToSave.matterTopic, // 保存问事主题
        matterDirection: resultToSave.matterDirection, // 保存问事方向
        九宫: resultToSave.jiuGong,
        userInfo: resultToSave.userInfo // 包含用户信息
      };
      
      // 添加新记录到数组开头
      existingHistory.unshift(newRecord);
      
      // 限制最多20条记录
      if (existingHistory.length > 20) {
        existingHistory = existingHistory.slice(0, 20);
      }
      
      // 保存到本地存储
      localStorage.setItem('qimen_history', JSON.stringify(existingHistory));
      
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };

  /**
   * 生成随机奇门遁甲盘局
   */
  const generateRandomQimenLayout = () => {
    // 生成九宫格布局
    const jiuGong = {};
    
    // 随机生成各宫的星、门、神
    for (let i = 1; i <= 9; i++) {
      jiuGong[i] = {
        star: jiuXing[Math.floor(Math.random() * jiuXing.length)],
        door: baMen[Math.floor(Math.random() * baMen.length)],
        god: baShen[Math.floor(Math.random() * baShen.length)],
        trigram: bagua[Math.floor(Math.random() * bagua.length)]
      };
    }
    
    // 生成天盘和地盘（简化版）
    const tianPan = {};
    const diPan = {};
    
    for (let i = 1; i <= 9; i++) {
      tianPan[i] = jiuXing[Math.floor(Math.random() * jiuXing.length)];
      diPan[i] = baMen[Math.floor(Math.random() * baMen.length)];
    }
    
    return {
      jiuGong,
      tianPan,
      diPan
    };
  };

  /**
   * 根据用户生辰信息生成奇门遁甲盘局
   * @param {Object} birthInfo - 用户生辰信息
   */
  const generateQimenLayoutFromBirthInfo = (birthInfo) => {
    // 使用用户信息生成更个性化的盘局
    // 这里是模拟逻辑，实际应用中应使用真实的奇门遁甲算法
    
    // 使用生日信息作为随机种子的一部分
    const birthDateStr = birthInfo.birthDate || new Date().toISOString().split('T')[0];
    const timeStr = birthInfo.birthTime || '12:00';
    const seed = (birthDateStr + timeStr + birthInfo.nickname).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // 生成九宫格布局
    const jiuGong = {};
    
    // 基于用户信息生成各宫的星、门、神
    for (let i = 1; i <= 9; i++) {
      // 使用种子和位置来生成更一致的结果
      const positionSeed = (seed + i) % 10000;
      jiuGong[i] = {
        star: jiuXing[positionSeed % jiuXing.length],
        door: baMen[positionSeed % baMen.length],
        god: baShen[positionSeed % baShen.length],
        trigram: bagua[positionSeed % bagua.length]
      };
    }
    
    // 生成天盘和地盘（简化版）
    const tianPan = {};
    const diPan = {};
    
    for (let i = 1; i <= 9; i++) {
      const positionSeed = (seed + i * 10) % 10000;
      tianPan[i] = jiuXing[positionSeed % jiuXing.length];
      diPan[i] = baMen[positionSeed % baMen.length];
    }
    
    return {
      jiuGong,
      tianPan,
      diPan
    };
  };

  /**
   * 根据出生日期和时辰动态计算奇门遁甲盘局
   * @param {string} birthDate - 出生日期 (YYYY-MM-DD格式)
   * @param {string} birthTime - 出生时辰 (HH:mm格式)
   */
  const generateQimenLayoutFromDateTime = (birthDate, birthTime) => {
    // 解析出生日期和时间
    const dateObj = new Date(birthDate);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    // 使用日期和时间信息生成种子
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // 月份从0开始，需要加1
    const day = dateObj.getDate();
    
    // 创建一个复合种子，结合年月日时分
    const compositeSeed = year * 1000000 + month * 10000 + day * 100 + hour;
    
    // 生成九宫格布局
    const jiuGong = {};
    
    // 基于日期时间信息生成各宫的星、门、神
    for (let i = 1; i <= 9; i++) {
      // 使用复合种子和位置来生成结果
      const positionSeed = (compositeSeed + i * 100) % 10000;
      jiuGong[i] = {
        star: jiuXing[positionSeed % jiuXing.length],
        door: baMen[positionSeed % baMen.length],
        god: baShen[positionSeed % baShen.length],
        trigram: bagua[positionSeed % bagua.length]
      };
    }
    
    // 生成天盘和地盘
    const tianPan = {};
    const diPan = {};
    
    for (let i = 1; i <= 9; i++) {
      const positionSeed = (compositeSeed + i * 1000) % 10000;
      tianPan[i] = jiuXing[positionSeed % jiuXing.length];
      diPan[i] = baMen[positionSeed % baMen.length];
    }
    
    return {
      jiuGong,
      tianPan,
      diPan
    };
  };

  /**
   * 生成分析结果
   */
  const generateAnalysis = (qimenLayout) => {
    const analysisResult = {
      总体运势: '吉',
      事业财运: '中吉',
      感情婚姻: '小吉',
      健康平安: '大吉',
      趋吉避凶建议: [
        '宜：出行、合作、投资',
        '忌：诉讼、冒险、大额交易'
      ]
    };
    
    return analysisResult;
  };



  return (
    <div className={`qimen-calculator ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="calculator-header">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>奇门遁甲测算</h2>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>填写起局信息，洞悉时空玄机</p>
      </div>

      {/* 起局信息输入区域 */}
      <div className={`mb-8 p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/60 border border-amber-100 shadow-sm'}`}>
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-amber-500 rounded-full mr-3"></div>
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>起局信息</h3>
          <span className="ml-auto text-xs opacity-60">越具体越准：人/事/时间/期望</span>
        </div>

        <div className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>问事主题</label>
            <textarea
              value={matterTopic}
              onChange={(e) => setMatterTopic(e.target.value)}
              placeholder="例如：下个月是否适合跳槽？我需要先补齐哪项能力？"
              className={`w-full p-4 rounded-xl border transition-all resize-none h-24 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500' 
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>问事方向</label>
              <div className="relative">
                <select
                  value={matterDirection}
                  onChange={(e) => setMatterDirection(e.target.value)}
                  className={`w-full p-3 pr-8 rounded-xl border appearance-none text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white focus:border-amber-500'
                      : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                  }`}
                >
                  {directionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>起局时间</label>
              <input
                type="datetime-local"
                value={calculationTime}
                onChange={(e) => setCalculationTime(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-700 text-white focus:border-amber-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={calculateQimen}
            disabled={isCalculating}
            className={`w-full py-4 rounded-xl text-base font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
              isCalculating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-500/20'
            }`}
          >
            {isCalculating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在起局推演...
              </span>
            ) : '生成奇门盘并 AI 解卦'}
          </button>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-xl mb-6 text-center text-sm ${theme === 'dark' ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {error}
        </div>
      )}

      {/* 使用小贴士 */}
      {!result && (
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">ⓘ</span>
            <h4 className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>使用小贴士</h4>
          </div>
          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <li className="flex items-start"><span className="mr-2 text-amber-500">•</span> 问得具体：把时间范围、人物关系、目标写清楚。</li>
            <li className="flex items-start"><span className="mr-2 text-amber-500">•</span> 一事一占：同一个问题不要频繁反复起局。</li>
            <li className="flex items-start"><span className="mr-2 text-amber-500">•</span> 以行动应卦：把建议拆成小步骤，观察反馈再调整。</li>
          </ul>
        </div>
      )}

      {result && (
        <div className={`result-section animate-fadeIn ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
          <h3 className={`result-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>推演结果</h3>
          
          {/* AI 解卦结果 */}
          {result.aiAnalysis && (
            <div className={`mb-8 p-6 rounded-2xl border relative overflow-hidden ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-800/50' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                  <path d="M12 6a1 1 0 0 0-1 1v4.59l-3.29 3.29a1 1 0 0 0 1.42 1.42l4-4a1 1 0 0 0 .29-.71V7a1 1 0 0 0-1-1z"/>
                </svg>
              </div>
              <h4 className={`text-lg font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                <span className="mr-2 text-2xl">🤖</span> AI 大师解卦
              </h4>
              <div className={`whitespace-pre-line leading-relaxed text-sm md:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.aiAnalysis}
              </div>
            </div>
          )}

          {/* 奇门遁甲盘局展示 */}
          <div className={`qimen-board mb-8 ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
            <div className="board-grid">
              {/* 九宫格布局 */}
              {Object.entries(result.jiuGong).map(([position, content]) => (
                <div key={position} className={`board-cell ${theme === 'dark' ? 'dark-cell' : 'light-cell'}`}>
                  <div className="cell-content">
                    <div className={`star ${theme === 'dark' ? 'text-yellow-300' : 'text-gray-800'}`}>{content.star}</div>
                    <div className={`door ${theme === 'dark' ? 'text-green-300' : 'text-gray-800'}`}>{content.door}</div>
                    <div className={`god ${theme === 'dark' ? 'text-purple-300' : 'text-gray-800'}`}>{content.god}</div>
                    <div className={`trigram ${theme === 'dark' ? 'text-red-300' : 'text-gray-800'}`}>{content.trigram}</div>
                  </div>
                </div>
              ))}
              
              {/* 中心太极图 */}
              <div className="board-center">
                <div className="taiji">
                  <div className="yin-yang"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 基础分析结果 */}
          <div className={`analysis-section ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
            <h4 className={`analysis-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>基础盘面分析</h4>
            <div className="analysis-content">
              {Object.entries(result.analysis).filter(([key]) => key !== '趋吉避凶建议').map(([key, value]) => (
                <div key={key} className={`analysis-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                  <span className={`label ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{key}：</span>
                  <span className={`value font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
                </div>
              ))}
            </div>
            
            <div className={`suggestion-section mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
              <h4 className={`suggestion-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>趋吉避凶建议</h4>
              <ul className="suggestion-list">
                {result.analysis['趋吉避凶建议'].map((item, index) => (
                  <li key={index} className={`${theme === 'dark' ? 'dark-suggestion' : 'light-suggestion'}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QimenDunjiaCalculator;

// 样式
const styles = `
  .qimen-calculator {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .calculator-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .calculator-controls {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .calculate-button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    background: linear-gradient(135deg, #8B4513, #D2691E);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .calculate-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .calculate-button:disabled {
    background: #999;
    cursor: not-allowed;
  }
  
  /* 暗黑模式下的计算按钮 */
  .calculate-button.dark-mode {
    background: linear-gradient(135deg, #5a2c02, #8b4513);
  }
  
  .error-message {
    color: #ff4444;
    text-align: center;
    margin: 20px 0;
  }
  
  /* 暗黑模式下的错误消息 */
  .error-message.dark-mode {
    color: #ff6b6b;
  }
  
  .result-section {
    margin-top: 30px;
  }
  
  /* 暗黑模式下的结果部分 */
  .result-section.dark-mode {
    color: white;
  }
  
  .result-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .qimen-board {
    background: #f5e6d3;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    position: relative;
  }
  
  /* 暗黑模式下的奇门盘 */
  .qimen-board.dark-bg {
    background: #2d3748;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .board-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
    position: relative;
  }
  
  .board-cell {
    background: rgba(255,255,255,0.8);
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px;
    text-align: center;
    font-size: 14px;
    position: relative;
  }
  
  /* 暗黑模式下的单元格 */
  .board-cell.dark-cell {
    background: rgba(45, 55, 72, 0.9);
    border: 1px solid #4a5568;
    color: white;
  }
  
  .board-cell .cell-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .star, .door, .god, .trigram {
    margin: 2px 0;
  }
  
  .board-center {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  
  .taiji {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(45deg, #8B4513 0%, #8B4513 50%, #D2691E 50%, #D2691E 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 暗黑模式下的太极图 */
  .taiji.dark-mode {
    background: linear-gradient(45deg, #5a2c02 0%, #5a2c02 50%, #8b4513 50%, #8b4513 100%);
  }
  
  .yin-yang {
    width: 30px;
    height: 30px;
    background: white;
    border-radius: 50%;
    position: relative;
    z-index: 2;
  }
  
  .analysis-section {
    margin-top: 30px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  /* 暗黑模式下的分析部分 */
  .analysis-section.dark-bg {
    background: #2d3748;
    color: white;
  }
  
  .analysis-title, .suggestion-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  
  .analysis-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .analysis-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 6px;
  }
  
  /* 暗黑模式下的分析项 */
  .analysis-item.dark-item {
    background: #4a5568;
    color: white;
  }
  
  .label {
    font-weight: bold;
    color: #666;
  }
  
  .value {
    color: #333;
  }
  
  .suggestion-list {
    list-style: none;
    padding: 0;
  }
  
  .suggestion-list li {
    padding: 8px;
    margin: 5px 0;
    background: #f0f8ff;
    border-left: 4px solid #4682B4;
    border-radius: 0 4px 4px 0;
  }
  
  /* 暗黑模式下的建议列表项 */
  .suggestion-list li.dark-suggestion {
    background: #2d3748;
    border-left: 4px solid #63b3ed;
    color: white;
  }
  
  .save-button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 14px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .save-button:hover {
    background: #218838;
  }
  
  /* 暗黑模式下的保存按钮 */
  .save-button.dark-mode {
    background: #38a169;
  }
  
  .save-button.dark-mode:hover {
    background: #2f855e;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}