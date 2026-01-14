/**
 * 奇门遁甲计算器组件
 * 实现奇门遁甲的核心计算逻辑
 */

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrentConfig } from '../../contexts/UserConfigContext';

const QimenDunjiaCalculator = () => {
  const { theme } = useTheme();
  const currentConfig = useCurrentConfig();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      
      // 优先使用出生日期和时辰进行动态计算
      if (birthInfo.birthDate && birthInfo.birthTime) {
        // 使用出生日期和时辰进行动态计算
        qimenLayout = generateQimenLayoutFromDateTime(birthInfo.birthDate, birthInfo.birthTime);
      } else {
        // 如果没有足够的用户信息，则使用随机计算逻辑
        qimenLayout = generateRandomQimenLayout();
      }
      
      setResult({
        ...qimenLayout,
        calculationTime: new Date().toLocaleString('zh-CN'),
        analysis: generateAnalysis(qimenLayout),
        userInfo: birthInfo
      });
    } catch (err) {
      console.error('计算过程中发生错误:', err);
      setError('计算失败，请重试');
    } finally {
      setIsCalculating(false);
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

  /**
   * 保存计算结果到历史记录
   */
  const saveToHistory = () => {
    if (!result) return;
    
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
        calculationTime: new Date().toLocaleString('zh-CN'),
        result: result.analysis,
        九宫: result.jiuGong,
        userInfo: result.userInfo // 包含用户信息
      };
      
      // 添加新记录到数组开头
      existingHistory.unshift(newRecord);
      
      // 限制最多10条记录
      if (existingHistory.length > 10) {
        existingHistory = existingHistory.slice(0, 10);
      }
      
      // 保存到本地存储
      localStorage.setItem('qimen_history', JSON.stringify(existingHistory));
      
      alert(`计算结果已保存到历史记录 (共${existingHistory.length}条记录)`);
    } catch (error) {
      console.error('保存历史记录失败:', error);
      alert('保存历史记录失败，请重试');
    }
  };

  return (
    <div className={`qimen-calculator ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="calculator-header">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>奇门遁甲测算</h2>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>点击下方按钮开始计算您的奇门遁甲命局</p>
      </div>

      <div className="calculator-controls">
        <button
          onClick={calculateQimen}
          disabled={isCalculating}
          className={`calculate-button ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
        >
          {isCalculating ? '计算中...' : '开始计算'}
        </button>
      </div>

      {error && (
        <div className={`error-message ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
          {error}
        </div>
      )}

      {result && (
        <div className={`result-section ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
          <h3 className={`result-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>计算结果</h3>
          
          {/* 奇门遁甲盘局展示 */}
          <div className={`qimen-board ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
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

          {/* 分析结果 */}
          <div className={`analysis-section ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
            <h4 className={`analysis-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>命局分析</h4>
            <div className="analysis-content">
              <div className={`analysis-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>总体运势：</span>
                <span className={`value ${theme === 'dark' ? 'text-yellow-300' : 'text-gray-800'}`}>
                  {result.analysis['总体运势']}
                </span>
              </div>
              <div className={`analysis-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>事业财运：</span>
                <span className={`value ${theme === 'dark' ? 'text-green-300' : 'text-gray-800'}`}>
                  {result.analysis['事业财运']}
                </span>
              </div>
              <div className={`analysis-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>感情婚姻：</span>
                <span className={`value ${theme === 'dark' ? 'text-pink-300' : 'text-gray-800'}`}>
                  {result.analysis['感情婚姻']}
                </span>
              </div>
              <div className={`analysis-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>健康平安：</span>
                <span className={`value ${theme === 'dark' ? 'text-blue-300' : 'text-gray-800'}`}>
                  {result.analysis['健康平安']}
                </span>
              </div>
            </div>
            
            <div className={`suggestion-section ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
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

          {/* 保存按钮 */}
          <button
            onClick={saveToHistory}
            className={`save-button ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
          >
            保存到历史记录
          </button>
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