import { useState } from 'react';
import { getDimensionColor } from '../../utils/matrixData';

const MatrixGrid = ({ matrixData, matrixSize, onCellClick, selectedCell, onAddImprint, theme = 'light', hideInternalLegend = false }) => {
  const [showImprintMenu, setShowImprintMenu] = useState(null);

  // ... rest of logic stays similar but we use hideInternalLegend at bottom ...


  const handleCellClick = (cell) => {
    onCellClick(cell);
  };

  const handleAddImprint = (cell, imprintType) => {
    onAddImprint(cell.row, cell.col, imprintType);
    setShowImprintMenu(null);
  };

  const getCellEnergyLevel = (energy) => {
    if (energy === 0) return 'empty';
    if (energy < 20) return 'low';
    if (energy < 50) return 'medium';
    if (energy < 80) return 'high';
    return 'max';
  };

  // 确保matrixSize有效
  const validMatrixSize = matrixSize && (matrixSize === 3 || matrixSize === 7) ? matrixSize : 3;

  if (!matrixData || matrixData.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>矩阵尚未初始化</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`matrix-grid-container w-full`}>
        <div
          id="life-matrix-grid-host"
          className={`life-matrix-grid life-matrix-grid-${validMatrixSize}`}
          style={{
            gap: validMatrixSize === 7 ? '6px' : '10px',
          }}
        >
          {matrixData.flat().map((cell) => {
            const rowIndex = cell.row;
            const colIndex = cell.col;
            const isSelected = selectedCell &&
              selectedCell.row === rowIndex &&
              selectedCell.col === colIndex;

            const energyLevel = getCellEnergyLevel(cell.energy);
            const cellColor = getDimensionColor(cell.dimension.id);

            return (
              <div
                key={cell.id}
                className={`
                aspect-square cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center text-center
                ${validMatrixSize === 7 ? 'rounded-lg' : 'rounded-[1.5rem]'}
                ${isSelected
                    ? 'transform scale-105 z-10 shadow-2xl ring-4 ring-white/40'
                    : 'transform hover:scale-[1.02] z-0 shadow-lg hover:shadow-xl shadow-black/10'}
              `}
                style={{
                  backgroundColor: cellColor,
                  color: '#fff',
                }}
                onClick={() => handleCellClick(cell)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowImprintMenu({ row: rowIndex, col: colIndex });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCellClick(cell);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`维度: ${cell.dimension.name}, 能量: ${cell.energy}, 行: ${rowIndex + 1}, 列: ${colIndex + 1}`}
              >
                <div className="flex flex-col items-center justify-center h-full w-full p-1 relative">
                  <span className={`font-bold uppercase tracking-wider opacity-90 mb-0.5 ${validMatrixSize === 7 ? 'text-[6px]' : 'text-[10px]'}`}>
                    {cell.dimension.name}
                  </span>
                  <span className={`font-black tracking-tighter ${validMatrixSize === 7 ? 'text-sm' : 'text-2xl'}`}>
                    {cell.energy}
                  </span>

                  {/* Simple indicator bar matching design/life-gride-game.html */}
                  <div className={`
                  ${validMatrixSize === 7 ? 'mt-0.5 w-2 h-0.5' : 'mt-1 w-4 h-1'} 
                  bg-white/30 rounded-full overflow-hidden
                `}>
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, cell.energy)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Selection Glow Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
                )}

                {cell.imprints.length > 0 && validMatrixSize === 3 && (
                  <div className="absolute top-2 right-2 text-[8px] bg-black/20 rounded-full px-1 py-0.5">
                    {cell.imprints.length}印记
                  </div>
                )}

                {showImprintMenu &&
                  showImprintMenu.row === rowIndex &&
                  showImprintMenu.col === colIndex && (
                    <div className={`absolute top-full left-0 mt-2 z-50 p-4 rounded-xl shadow-2xl min-w-[280px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold">为"{cell.dimension.name}"添加印记</h4>
                        <button
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                          onClick={() => setShowImprintMenu(null)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          className="p-2 rounded-lg flex flex-col items-center gap-1 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          onClick={() => handleAddImprint(cell, {
                            type: 'physical-badge',
                            name: '实物徽章',
                            category: 'material',
                            power: 15,
                            description: '代表具体成就'
                          })}
                        >
                          <span className="text-lg">🏆</span>
                          <span className="text-xs">实物徽章</span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">+15</span>
                        </button>

                        <button
                          className="p-2 rounded-lg flex flex-col items-center gap-1 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                          onClick={() => handleAddImprint(cell, {
                            type: 'insight-crystal',
                            name: '洞察水晶',
                            category: 'spiritual',
                            power: 25,
                            description: '重要领悟'
                          })}
                        >
                          <span className="text-lg">🔮</span>
                          <span className="text-xs">洞察水晶</span>
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-300">+25</span>
                        </button>

                        <button
                          className="p-2 rounded-lg flex flex-col items-center gap-1 bg-pink-100 dark:bg-pink-900/50 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                          onClick={() => handleAddImprint(cell, {
                            type: 'connection-bridge',
                            name: '连接之桥',
                            category: 'relational',
                            power: 16,
                            description: '重要关系'
                          })}
                        >
                          <span className="text-lg">🌉</span>
                          <span className="text-xs">连接之桥</span>
                          <span className="text-xs font-bold text-pink-600 dark:text-pink-300">+16</span>
                        </button>

                        <button
                          className="p-2 rounded-lg flex flex-col items-center gap-1 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          onClick={() => handleAddImprint(cell, {
                            type: 'creation-spark',
                            name: '创造火花',
                            category: 'creative',
                            power: 18,
                            description: '新想法'
                          })}
                        >
                          <span className="text-lg">✨</span>
                          <span className="text-xs">创造火花</span>
                          <span className="text-xs font-bold text-green-600 dark:text-green-300">+18</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="自定义印记描述..."
                          className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <button className={`px-3 py-2 rounded text-white ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}>
                          添加自定义印记
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {!hideInternalLegend && (
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h4 className="font-bold mb-3">能量等级</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <span className="text-sm">空 (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm">低 (1-19)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                <span className="text-sm">中 (20-49)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                <span className="text-sm">高 (50-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse"></div>
                <span className="text-sm">满 (80-100)</span>
              </div>
            </div>

            <div className="text-sm">
              <p>点击单元格查看详情，右键点击添加能量印记</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixGrid;