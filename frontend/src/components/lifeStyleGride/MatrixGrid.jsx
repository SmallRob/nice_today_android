import { useState } from 'react';
import { getDimensionColor } from '../../utils/matrixData';

const MatrixGrid = ({ matrixData, matrixSize, onCellClick, selectedCell, onAddImprint }) => {
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
      <div className="matrix-empty">
        <p>矩阵尚未初始化</p>
      </div>
    );
  }
  
  return (
    <div className="matrix-container">
      <div className="matrix-grid" style={{ '--grid-size': validMatrixSize, display: 'grid', height: '100%' }}>
        {matrixData.map((row, rowIndex) => (
          <div key={rowIndex} className="matrix-row">
            {row.map((cell, colIndex) => {
              const isSelected = selectedCell && 
                selectedCell.row === rowIndex && 
                selectedCell.col === colIndex;
              
              const energyLevel = getCellEnergyLevel(cell.energy);
              const cellColor = getDimensionColor(cell.dimension.id);
              
              return (
                <div
                  key={cell.id}
                  className={`matrix-cell ${energyLevel} ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: cellColor,
                    borderColor: isSelected ? '#333' : cellColor
                  }}
                  onClick={() => handleCellClick(cell)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowImprintMenu({ row: rowIndex, col: colIndex });
                  }}
                >
                  <div className="cell-content">
                    <div className="cell-dimension">
                      <span className="dimension-name">{cell.dimension.name}</span>
                    </div>
                    
                    <div className="cell-energy">
                      <span className="energy-value">{cell.energy}</span>
                      <div className="energy-bar">
                        <div 
                          className="energy-fill"
                          style={{ width: `${Math.min(100, cell.energy)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {cell.imprints.length > 0 && (
                      <div className="cell-imprints">
                        <span className="imprint-count">{cell.imprints.length}个印记</span>
                      </div>
                    )}
                  </div>
                  
                  {showImprintMenu && 
                   showImprintMenu.row === rowIndex && 
                   showImprintMenu.col === colIndex && (
                    <div className="imprint-menu">
                      <div className="imprint-menu-header">
                        <h4>为"{cell.dimension.name}"添加印记</h4>
                        <button 
                          className="close-menu"
                          onClick={() => setShowImprintMenu(null)}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="imprint-options">
                        <button 
                          className="imprint-option material"
                          onClick={() => handleAddImprint(cell, {
                            type: 'physical-badge',
                            name: '实物徽章',
                            category: 'material',
                            power: 15,
                            description: '代表具体成就'
                          })}
                        >
                          <span className="imprint-icon">🏆</span>
                          <span className="imprint-name">实物徽章</span>
                          <span className="imprint-power">+15</span>
                        </button>
                        
                        <button 
                          className="imprint-option spiritual"
                          onClick={() => handleAddImprint(cell, {
                            type: 'insight-crystal',
                            name: '洞察水晶',
                            category: 'spiritual',
                            power: 25,
                            description: '重要领悟'
                          })}
                        >
                          <span className="imprint-icon">🔮</span>
                          <span className="imprint-name">洞察水晶</span>
                          <span className="imprint-power">+25</span>
                        </button>
                        
                        <button 
                          className="imprint-option relational"
                          onClick={() => handleAddImprint(cell, {
                            type: 'connection-bridge',
                            name: '连接之桥',
                            category: 'relational',
                            power: 16,
                            description: '重要关系'
                          })}
                        >
                          <span className="imprint-icon">🌉</span>
                          <span className="imprint-name">连接之桥</span>
                          <span className="imprint-power">+16</span>
                        </button>
                        
                        <button 
                          className="imprint-option creative"
                          onClick={() => handleAddImprint(cell, {
                            type: 'creation-spark',
                            name: '创造火花',
                            category: 'creative',
                            power: 18,
                            description: '新想法'
                          })}
                        >
                          <span className="imprint-icon">✨</span>
                          <span className="imprint-name">创造火花</span>
                          <span className="imprint-power">+18</span>
                        </button>
                      </div>
                      
                      <div className="custom-imprint">
                        <input 
                          type="text" 
                          placeholder="自定义印记描述..."
                          className="custom-input"
                        />
                        <button className="btn-secondary">添加自定义印记</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="matrix-legend">
        <h4>能量等级</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color empty"></div>
            <span>空 (0)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>低 (1-19)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>中 (20-49)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>高 (50-79)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color max"></div>
            <span>满 (80-100)</span>
          </div>
        </div>
        
        <div className="legend-note">
          <p>点击单元格查看详情，右键点击添加能量印记</p>
        </div>
      </div>
    </div>
  );
};

export default MatrixGrid;