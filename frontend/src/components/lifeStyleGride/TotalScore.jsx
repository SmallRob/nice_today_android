import { useMemo } from 'react';

/**
 * 总分显示组件
 * 显示当前矩阵的总能量分数和统计信息
 */
const TotalScore = ({ score, matrixSize, archiveName }) => {
  // 计算最大可能分数
  const maxScore = useMemo(() => {
    const totalCells = matrixSize * matrixSize;
    const maxEnergyPerCell = 100;
    return totalCells * maxEnergyPerCell;
  }, [matrixSize]);

  // 计算完成百分比
  const percentage = useMemo(() => {
    return Math.round((score / maxScore) * 100);
  }, [score, maxScore]);

  // 获取能量等级
  const getEnergyLevel = () => {
    if (percentage >= 80) return { level: '卓越', color: '#10B981', icon: '🌟' };
    if (percentage >= 60) return { level: '优秀', color: '#34D399', icon: '✨' };
    if (percentage >= 40) return { level: '良好', color: '#60A5FA', icon: '🔵' };
    if (percentage >= 20) return { level: '发展中', color: '#FBBF24', icon: '📈' };
    return { level: '开始', color: '#F87171', icon: '🌱' };
  };

  const energyLevel = getEnergyLevel();

  // 计算矩阵统计
  const getMatrixStats = () => {
    const totalCells = matrixSize * matrixSize;
    const filledCells = Math.min(totalCells, Math.ceil(score / 20)); // 假设每个有印记的单元格至少有20能量
    const avgEnergy = Math.round(score / Math.max(1, filledCells));

    return {
      totalCells,
      filledCells,
      avgEnergy,
      emptyCells: totalCells - filledCells
    };
  };

  const stats = getMatrixStats();

  // 获取等级描述
  const getLevelDescription = () => {
    const descriptions = {
      '开始': '你的生命矩阵刚刚起步，开始添加能量印记来构建各个维度。',
      '发展中': '你的生命矩阵正在成长，持续探索和发展各个维度。',
      '良好': '你的生命矩阵展现了良好的平衡性，保持这个发展势头。',
      '优秀': '你的生命矩阵能量充沛，达到了优秀的整合水平。',
      '卓越': '你的生命矩阵达到了卓越状态，各维度都得到了充分发展。'
    };
    return descriptions[energyLevel.level];
  };

  return (
    <div className="total-score-container">
      {/* 存档名称 */}
      <div className="archive-name-display">
        <h3>{archiveName || '未命名存档'}</h3>
        <span className="matrix-size-badge">{matrixSize}×{matrixSize}</span>
      </div>

      {/* 总分显示 */}
      <div className="score-display">
        <div className="score-main">
          <div className="score-icon">{energyLevel.icon}</div>
          <div className="score-value">
            <span className="score-number">{score}</span>
            <span className="score-label">总能量</span>
          </div>
        </div>

        <div className="score-level">
          <span
            className="level-badge"
            style={{ backgroundColor: energyLevel.color }}
          >
            {energyLevel.level}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-labels">
            <span>0</span>
            <span>{maxScore}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: energyLevel.color
              }}
            ></div>
          </div>
          <div className="progress-percentage">
            {percentage}%
          </div>
        </div>
      </div>

      {/* 等级描述 */}
      <div className="level-description">
        <p>{getLevelDescription()}</p>
      </div>

      {/* 统计信息 */}
      <div className="matrix-stats">
        <h4>矩阵统计</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">总单元格</span>
            <span className="stat-value">{stats.totalCells}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已激活</span>
            <span className="stat-value" style={{ color: energyLevel.color }}>
              {stats.filledCells}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">未激活</span>
            <span className="stat-value">{stats.emptyCells}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">平均能量</span>
            <span className="stat-value">{stats.avgEnergy}</span>
          </div>
        </div>
      </div>

      {/* 发展建议 */}
      {percentage < 50 && (
        <div className="development-tips">
          <h5>💡 发展建议</h5>
          <ul>
            {stats.emptyCells > 0 && (
              <li>还有 {stats.emptyCells} 个维度待探索，尝试添加不同类别的印记</li>
            )}
            {stats.avgEnergy < 50 && (
              <li>平均能量偏低，为已有印记添加更多相关内容</li>
            )}
            <li>保持平衡发展，关注身体、精神、关系、创造等各个维度</li>
            <li>定期回顾和更新印记，记录新的成长体验</li>
          </ul>
        </div>
      )}

      {/* 成就展示 */}
      {percentage >= 80 && (
        <div className="achievements">
          <h5>🏆 已达成成就</h5>
          <div className="achievements-list">
            <div className="achievement-item">
              <span className="achievement-icon">⭐</span>
              <span className="achievement-name">卓越发展</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🌈</span>
              <span className="achievement-name">全面整合</span>
            </div>
            {matrixSize === 7 && (
              <div className="achievement-item">
                <span className="achievement-icon">🎯</span>
                <span className="achievement-name">深度探索者</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalScore;
