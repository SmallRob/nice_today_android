import React from 'react';

const EnergyHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  // 检查是否存在昨天的记录
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const hasYesterdayRecord = history.some(record => {
    const recordDate = new Date(record.date);
    return recordDate.toDateString() === yesterday.toDateString();
  });
  
  // 如果有昨天的记录，保留所有记录（包括能量为0的昨天记录）
  // 如果没有昨天的记录，只显示有能量的记录
  const filteredHistory = hasYesterdayRecord 
    ? history 
    : history.filter(record => record.collected > 0);
  
  // 如果过滤后没有记录，则不显示历史记录
  if (filteredHistory.length === 0) {
    return null;
  }
  
  // 使用之前已定义的日期变量
  
  // 计算最大收集值，用于进度条宽度计算
  const maxCollected = Math.max(...filteredHistory.map(h => h.collected), 100);
  
  // 进一步过滤：如果存在昨天的记录，保留昨天记录和所有有能量的记录
  const finalFilteredHistory = hasYesterdayRecord
    ? filteredHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === yesterday.toDateString() || record.collected > 0;
      })
    : filteredHistory;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const formatToday = new Date();
    const formatYesterday = new Date(formatToday);
    formatYesterday.setDate(formatYesterday.getDate() - 1);

    if (date.toDateString() === formatToday.toDateString()) {
      return '今天';
    } else if (date.toDateString() === formatYesterday.toDateString()) {
      return '昨天';
    } else {
      // 使用更清晰的日期格式
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getBarWidth = (collected) => {
    return (collected / maxCollected) * 100;
  };

  const getBarColor = (collected) => {
    const percentage = (collected / maxCollected) * 100;
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
        {finalFilteredHistory.slice(0, 7).map((record, index) => {
          const recordDate = new Date(record.date);
          const todayInLoop = new Date();
          const yesterdayInLoop = new Date(todayInLoop);
          yesterdayInLoop.setDate(yesterdayInLoop.getDate() - 1);
          const isYesterday = recordDate.toDateString() === yesterdayInLoop.toDateString();
          
          return (
          <div key={record.date} className={`history-compact-item ${isYesterday ? 'yesterday-record' : ''}`}>
            <div className="history-compact-left">
              <span className="date-label-compact">{formatDate(record.date)}</span>
              <div
                className="progress-bar-compact"
                style={{
                  width: `${getBarWidth(record.collected)}%`,
                  background: getBarColor(record.collected),
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
          )})}
      </div>
    </div>
  );
};

export default EnergyHistory;
