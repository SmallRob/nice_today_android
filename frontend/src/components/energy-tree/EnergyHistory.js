import React from 'react';

const EnergyHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getBarWidth = (collected) => {
    const maxCollected = Math.max(...history.map(h => h.collected), 100);
    return (collected / maxCollected) * 100;
  };

  const getBarColor = (percentage) => {
    if (percentage >= 80) {
      return '#10b981'; // 绿色
    } else if (percentage >= 50) {
      return '#3b82f6'; // 蓝色
    } else {
      return '#f59e0b'; // 橙色
    }
  };

  return (
    <div className="energy-history-section">
      <div className="history-compact-list">
        {history.slice(0, 7).map((record, index) => (
          <div key={record.date} className="history-compact-item">
            <div className="history-compact-left">
              <span className="date-label-compact">{formatDate(record.date)}</span>
              <div
                className="progress-bar-compact"
                style={{
                  width: `${getBarWidth(record.collected)}%`,
                  background: getBarColor((record.collected / 1500) * 100),
                }}
              />
            </div>
            <div className="history-compact-right">
              <span 
                className="value-number-compact" 
                data-value={record.collected === 0 ? "0" : undefined}
              >
                {record.collected}
              </span>
              <span className="value-unit-compact">能量</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyHistory;
