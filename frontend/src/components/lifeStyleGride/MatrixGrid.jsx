import { useState } from 'react';
import { getDimensionColor } from '../../utils/matrixData';

const MatrixGrid = ({ matrixData, matrixSize, onCellClick, selectedCell, onAddImprint, theme = 'light' }) => {
  const [showImprintMenu, setShowImprintMenu] = useState(null);
  
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
    <div className="space-y-4">
      <div 
        className="grid gap-2 p-4 rounded-xl"
        style={{ 
          gridTemplateColumns: `repeat(${validMatrixSize}, 1fr)`,
          gridTemplateRows: `repeat(${validMatrixSize}, 1fr)`,
          aspectRatio: '1/1',
          maxHeight: '70vh',
          maxWidth: '100%',
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {matrixData.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isSelected = selectedCell && 
              selectedCell.row === rowIndex && 
              selectedCell.col === colIndex;
            
            const energyLevel = getCellEnergyLevel(cell.energy);
            const cellColor = getDimensionColor(cell.dimension.id);
            
            return (
              <div
                key={cell.id}
                className={`
                  rounded-lg border-2 p-2 cursor-pointer transition-all duration-300 relative overflow-visible min-h-[70px] flex flex-col justify-between
                  ${isSelected 
                    ? 'transform scale-105 z-10 shadow-xl border-4' 
                    : 'transform hover:scale-102 z-0 hover:shadow-lg'}
                  ${energyLevel === 'empty' ? 'opacity-70' : 
                    energyLevel === 'low' ? 'opacity-80' : 
                    energyLevel === 'medium' ? 'opacity-90' : 
                    energyLevel === 'high' ? 'opacity-100' : 
                    'opacity-100 animate-pulse'}
                `}
                style={{ 
                  backgroundColor: cellColor,
                  borderColor: isSelected ? (theme === 'dark' ? '#1f2937' : '#333') : cellColor
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
                <div className="text-white text-shadow text-center flex flex-col justify-between h-full">
                  <div className="text-xs md:text-sm font-medium text-center">
                    {cell.dimension.name}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-bold">{cell.energy}</div>
                    <div className={`w-full h-1.5 rounded-full mt-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${Math.min(100, cell.energy)}%`,
                          backgroundColor: cellColor
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {cell.imprints.length > 0 && (
                    <div className="text-xs bg-black/30 rounded px-1 text-center">
                      {cell.imprints.length}印记
                    </div>
                  )}
                </div>
                
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
          })
        ))}
      </div>
      
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
    </div>
  );
};

export default MatrixGrid;