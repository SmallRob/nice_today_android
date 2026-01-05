import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DocumentHistoryManager.css';

const DocumentHistoryManager = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 从localStorage加载历史记录
    const storedHistory = JSON.parse(localStorage.getItem('documentHistory') || '[]');
    setHistory(storedHistory);
  }, []);

  const handleOpenDocument = (historyItem) => {
    navigate('/document-viewer', { 
      state: { 
        content: historyItem.content, 
        title: historyItem.title, 
        path: historyItem.path,
        scrollPosition: historyItem.scrollPosition || 0
      } 
    });
  };

  const handleDeleteHistory = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    localStorage.setItem('documentHistory', JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('documentHistory');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="document-history-manager">
      <div className="history-header">
        <h2>历史文档</h2>
        {history.length > 0 && (
          <button className="clear-history-button" onClick={clearAllHistory}>
            清空历史
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <p>暂无历史文档</p>
        </div>
      ) : (
        <ul className="history-list">
          {history.map((item, index) => (
            <li key={index} className="history-item">
              <div className="history-item-content" onClick={() => handleOpenDocument(item)}>
                <div className="history-item-icon">
                  {item.path.endsWith('.md') ? '📝' : '📄'}
                </div>
                <div className="history-item-info">
                  <div className="history-item-title">{item.title}</div>
                  <div className="history-item-path">{item.path}</div>
                  <div className="history-item-time">{formatDate(item.timestamp)}</div>
                </div>
              </div>
              <button 
                className="delete-history-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteHistory(index);
                }}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentHistoryManager;