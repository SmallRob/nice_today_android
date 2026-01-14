/**
 * 奇门遁甲历史记录组件
 * 显示和管理工作历史记录
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const QimenHistory = () => {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * 加载历史记录
   */
  const loadHistory = async () => {
    setIsLoading(true);
    
    try {
      // 从本地存储加载历史记录
      const historyStr = localStorage.getItem('qimen_history');
      if (historyStr) {
        const parsedHistory = JSON.parse(historyStr);
        setHistory(parsedHistory);
      } else {
        // 如果没有历史记录，初始化为空数组
        setHistory([]);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 删除历史记录
   */
  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    
    // 同步更新本地存储
    try {
      localStorage.setItem('qimen_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('更新本地存储失败:', error);
    }
  };

  /**
   * 清空所有历史记录
   */
  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      setHistory([]);
      
      // 同步更新本地存储
      try {
        localStorage.removeItem('qimen_history');
      } catch (error) {
        console.error('清空本地存储失败:', error);
      }
    }
  };

  if (isLoading) {
    return <div className={`history-loading ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>加载中...</div>;
  }

  return (
    <div className={`qimen-history ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="history-header">
        <h2 className={`history-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>计算历史记录</h2>
        <div className="history-actions">
          <button
            onClick={clearAllHistory}
            disabled={history.length === 0}
            className={`clear-button ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
          >
            清空历史
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className={`empty-history ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>暂无历史记录</p>
        </div>
      ) : (
        <div className={`history-list ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
          {history.map((item) => (
            <div key={item.id} className={`history-item ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
              <div className="history-item-header">
                <span className={`calculation-time ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.calculationTime}
                </span>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className={`delete-button ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
                >
                  删除
                </button>
              </div>
              
              <div className="history-item-content">
                <div className="result-summary">
                  <div className={`summary-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                    <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>总体运势：</span>
                    <span className={`value ${item.result.总体运势 === '吉' ? 'good' : item.result.总体运势 === '中吉' ? 'neutral' : 'bad'} ${theme === 'dark' ? 'dark-text' : 'light-text'}`}>
                      {item.result.总体运势}
                    </span>
                  </div>
                  <div className={`summary-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                    <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>事业财运：</span>
                    <span className={`value ${item.result.事业财运 === '吉' ? 'good' : item.result.事业财运 === '中吉' ? 'neutral' : 'bad'} ${theme === 'dark' ? 'dark-text' : 'light-text'}`}>
                      {item.result.事业财运}
                    </span>
                  </div>
                  <div className={`summary-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                    <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>感情婚姻：</span>
                    <span className={`value ${item.result.感情婚姻 === '吉' ? 'good' : item.result.感情婚姻 === '中吉' ? 'neutral' : 'bad'} ${theme === 'dark' ? 'dark-text' : 'light-text'}`}>
                      {item.result.感情婚姻}
                    </span>
                  </div>
                  <div className={`summary-item ${theme === 'dark' ? 'dark-item' : 'light-item'}`}>
                    <span className={`label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>健康平安：</span>
                    <span className={`value ${item.result.健康平安 === '吉' ? 'good' : item.result.健康平安 === '中吉' ? 'neutral' : 'bad'} ${theme === 'dark' ? 'dark-text' : 'light-text'}`}>
                      {item.result.健康平安}
                    </span>
                  </div>
                </div>
                
                <div className={`quick-preview ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
                  <h3 className={`preview-title ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>九宫速览</h3>
                  <div className="preview-grid">
                    {Object.entries(item.九宫).slice(0, 3).map(([position, content]) => (
                      <div key={position} className={`preview-cell ${theme === 'dark' ? 'dark-bg' : 'light-bg'}`}>
                        <div className="cell-content">
                          <div className={`position ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {position}
                          </div>
                          <div className={`star ${theme === 'dark' ? 'text-yellow-300' : 'text-gray-800'}`}>
                            {content.star}
                          </div>
                          <div className={`door ${theme === 'dark' ? 'text-green-300' : 'text-gray-800'}`}>
                            {content.door}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QimenHistory;

// 样式
const styles = `
  .qimen-history {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .history-title {
    font-size: 20px;
    font-weight: bold;
  }
  
  .history-actions {
    display: flex;
    gap: 10px;
  }
  
  .clear-button {
    padding: 8px 16px;
    font-size: 14px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .clear-button:hover {
    background: #c82333;
  }
  
  .clear-button:disabled {
    background: #999;
    cursor: not-allowed;
  }
  
  /* 暗黑模式下的清空按钮 */
  .clear-button.dark-mode {
    background: #e53e3e;
  }
  
  .clear-button.dark-mode:hover {
    background: #c53030;
  }
  
  .history-loading {
    text-align: center;
    padding: 40px;
    font-size: 16px;
  }
  
  /* 暗黑模式下的加载状态 */
  .history-loading.dark-mode {
    color: #cbd5e0;
  }
  
  .empty-history {
    text-align: center;
    padding: 40px;
    color: #666;
  }
  
  /* 暗黑模式下的空历史记录 */
  .empty-history.dark-mode {
    color: #a0aec0;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  /* 暗黑模式下的历史列表 */
  .history-list.dark-mode {
    color: white;
  }
  
  .history-item {
    background: white;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  /* 暗黑模式下的历史项 */
  .history-item.dark-bg {
    background: #2d3748;
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  .history-item:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .history-item.dark-bg:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  
  .history-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .calculation-time {
    font-size: 14px;
    color: #666;
  }
  
  /* 暗黑模式下的计算时间 */
  .calculation-time.dark-mode {
    color: #a0aec0;
  }
  
  .delete-button {
    padding: 4px 8px;
    font-size: 12px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* 暗黑模式下的删除按钮 */
  .delete-button.dark-mode {
    background: #e53e3e;
  }
  
  .history-item-content {
    margin-top: 10px;
  }
  
  .result-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 6px;
  }
  
  /* 暗黑模式下的摘要项 */
  .summary-item.dark-item {
    background: #4a5568;
    color: white;
  }
  
  .label {
    font-weight: bold;
    color: #666;
  }
  
  /* 暗黑模式下的标签 */
  .label.dark-mode {
    color: #cbd5e0;
  }
  
  .value {
    font-weight: bold;
  }
  
  /* 暗黑模式下的值 */
  .value.dark-text {
    color: #e2e8f0;
  }
  
  .value.good {
    color: #28a745;
  }
  
  /* 暗黑模式下好的运势 */
  .value.good.dark-text {
    color: #48bb78;
  }
  
  .value.neutral {
    color: #ffc107;
  }
  
  /* 暗黑模式下中性运势 */
  .value.neutral.dark-text {
    color: #faf089;
  }
  
  .value.bad {
    color: #dc3545;
  }
  
  /* 暗黑模式下坏的运势 */
  .value.bad.dark-text {
    color: #fc8181;
  }
  
  .quick-preview {
    margin-top: 15px;
  }
  
  /* 暗黑模式下的预览区 */
  .quick-preview.dark-mode {
    color: white;
  }
  
  .preview-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .preview-cell {
    background: #f5e6d3;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    text-align: center;
    font-size: 12px;
  }
  
  /* 暗黑模式下的预览单元格 */
  .preview-cell.dark-bg {
    background: #4a5568;
    border: 1px solid #718096;
    color: white;
  }
  
  .position {
    font-weight: bold;
    margin-bottom: 5px;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}