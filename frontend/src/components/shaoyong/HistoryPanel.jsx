import React from 'react';

const HistoryPanel = ({ history, onLoad, onClear }) => {
  // 获取卦象名称简写
  const getHexagramShortName = (hexagramId) => {
    const names = {
      1: '乾', 2: '坤', 11: '泰', 12: '否', 
      63: '既济', 64: '未济'
    };
    return names[hexagramId] || `卦${hexagramId}`;
  };

  // 获取铁板神数摘要
  const getTiebanSummary = (record) => {
    if (!record.bazi) return '八字信息缺失';
    const { year, month, day, hour } = record.bazi;
    return `${year.stem}${year.branch} ${month.stem}${month.branch} ${day.stem}${day.branch} ${hour.stem}${hour.branch}`;
  };

  if (history.length === 0) {
    return (
      <div className="history-panel empty">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>暂无历史记录</p>
          <p className="hint">使用功能后，记录将保存在这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>最近记录</h3>
        <button className="btn-secondary clear-btn" onClick={onClear}>
          清空记录
        </button>
      </div>
      
      <div className="history-list">
        {history.map((record) => (
          <div 
            key={record.id} 
            className="history-item"
            onClick={() => onLoad(record)}
          >
            <div className="history-item-header">
              <span className={`type-badge ${record.type || 'meihua'}`}>
                {record.type === 'tieban' ? '🧮 铁板' : '🌸 梅花'}
              </span>
              <span className="timestamp">{record.timestamp}</span>
            </div>
            
            <div className="history-item-body">
              {record.type === 'tieban' ? (
                // 铁板神数记录
                <div className="tieban-record">
                  <div className="bazi-summary">
                    <span className="bazi-text">{getTiebanSummary(record)}</span>
                    <span className="gender">{record.bazi?.gender === 'male' ? '男命' : '女命'}</span>
                  </div>
                  <div className="clause-info">
                    <span className="clause-count">
                      条文：{record.clauseNumbers?.length || 0}条
                    </span>
                    <span className="calculation-id">
                      ID: {record.calculationId?.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              ) : (
                // 梅花易数记录
                <div className="meihua-record">
                  <div className="hexagram-preview">
                    <span className="upper-trigram">
                      {getHexagramShortName(record.upperTrigram)}
                    </span>
                    <span className="over">上</span>
                    <span className="lower-trigram">
                      {getHexagramShortName(record.lowerTrigram)}
                    </span>
                    <span className="over">下</span>
                  </div>
                  <div className="hexagram-info">
                    <p className="hexagram-name">
                      本卦：{getHexagramShortName(record.originalHexagram)}
                    </p>
                    <p className="changing-line">
                      动爻：第{record.changingLine}爻
                    </p>
                    <p className="method">
                      方式：{record.method}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="history-footer">
        <p>共 {history.length} 条记录，点击可查看详情</p>
        <p className="hint">记录保存在浏览器本地存储中</p>
      </div>
    </div>
  );
};

export default HistoryPanel;