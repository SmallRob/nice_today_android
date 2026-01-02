import { useMemo } from 'react';

/**
 * 总分显示组件
 * 显示当前矩阵的总能量分数和统计信息
 */
const TotalScore = ({ score, matrixSize, archiveName, theme = 'light' }) => {
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
    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
      {/* 存档名称 */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold truncate max-w-[70%]">{archiveName || '未命名存档'}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'} shadow`}>
          {matrixSize}×{matrixSize}
        </span>
      </div>

      {/* 总分显示 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{energyLevel.icon}</div>
          <div>
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-sm opacity-75">总能量</div>
          </div>
        </div>

        <div>
          <span
            className="px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: energyLevel.color }}
          >
            {energyLevel.level}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>0</span>
          <span>{maxScore}</span>
        </div>
        <div className={`w-full h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: energyLevel.color
            }}
          ></div>
        </div>
        <div className="text-center text-lg font-bold mt-2" style={{ color: energyLevel.color }}>
          {percentage}%
        </div>
      </div>

      {/* 等级描述 */}
      <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/50'} backdrop-blur-sm`}>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {getLevelDescription()}
        </p>
      </div>

      {/* 统计信息 */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">矩阵统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.totalCells}</div>
            <div className="text-sm opacity-75">总单元格</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold" style={{ color: energyLevel.color }}>
              {stats.filledCells}
            </div>
            <div className="text-sm opacity-75">已激活</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.emptyCells}</div>
            <div className="text-sm opacity-75">未激活</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.avgEnergy}</div>
            <div className="text-sm opacity-75">平均能量</div>
          </div>
        </div>
      </div>

      {/* 发展建议 */}
      {percentage < 50 && (
        <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-100 border border-yellow-200'}`}>
          <h5 className="font-bold mb-2 flex items-center gap-2">
            <span>💡</span> 发展建议
          </h5>
          <ul className="space-y-1 text-sm">
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
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800' : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'}`}>
          <h5 className="font-bold mb-3 flex items-center gap-2">
            <span>🏆</span> 已达成成就
          </h5>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
              <span className="text-xl">⭐</span>
              <span>卓越发展</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
              <span className="text-xl">🌈</span>
              <span>全面整合</span>
            </div>
            {matrixSize === 7 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
                <span className="text-xl">🎯</span>
                <span>深度探索者</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalScore;