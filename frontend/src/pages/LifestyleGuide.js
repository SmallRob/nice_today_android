import React, { useState, useEffect } from 'react';
import './styles/lifegrid-styles.css';
import ArchiveManager from '../components/lifeStyleGride/ArchiveManager';
import MatrixGrid from '../components/lifeStyleGride/MatrixGrid';
import DimensionInfo from '../components/lifeStyleGride/DimensionInfo';
import TotalScore from '../components/lifeStyleGride/TotalScore';
import RitualGuide from '../components/lifeStyleGride/RitualGuide';
import { initializeStorage, getArchives, getCurrentArchive } from '../utils/lifeGridStorage';
import { DIMENSIONS_3x3, DIMENSIONS_7x7, IMPRINT_TYPES } from '../utils/matrixData';

function LifestyleGuide() {
  const [currentArchive, setCurrentArchive] = useState(null);
  const [matrixSize, setMatrixSize] = useState(3); // 3x3 或 7x7
  const [matrixData, setMatrixData] = useState([]);
  const [archives, setArchives] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showRitual, setShowRitual] = useState(false);

  // 初始化应用
  useEffect(() => {
    initializeStorage();
    const savedArchives = getArchives();
    setArchives(savedArchives);

    const savedCurrent = getCurrentArchive();
    if (savedCurrent) {
      loadArchive(savedCurrent);
    }
  }, []);

  // 计算总分
  useEffect(() => {
    if (matrixData.length > 0) {
      const score = matrixData.reduce((total, row) => {
        return total + row.reduce((rowTotal, cell) => {
          return rowTotal + (cell.energy || 0);
        }, 0);
      }, 0);
      setTotalScore(score);
    }
  }, [matrixData]);

  // 加载存档
  const loadArchive = (archiveId) => {
    try {
      const archiveData = JSON.parse(localStorage.getItem(`life_matrix_archive_${archiveId}`));
      if (archiveData) {
        setCurrentArchive(archiveId);
        setMatrixSize(archiveData.matrixSize || 3);
        setMatrixData(archiveData.matrix || createEmptyMatrix(archiveData.matrixSize || 3));
        localStorage.setItem('life_matrix_current_archive', archiveId);
      }
    } catch (error) {
      console.error('加载存档失败:', error);
    }
  };

  // 创建新存档
  const createNewArchive = (archiveName, size) => {
    const archiveId = `archive_${Date.now()}`;
    const newArchive = {
      id: archiveId,
      name: archiveName,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      matrixSize: size,
      matrix: createEmptyMatrix(size),
      totalScore: 0
    };

    // 保存到本地存储
    localStorage.setItem(`life_matrix_archive_${archiveId}`, JSON.stringify(newArchive));

    // 更新存档列表
    const updatedArchives = [...archives, {
      id: archiveId,
      name: archiveName,
      created: newArchive.created,
      matrixSize: size,
      totalScore: 0
    }];

    localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
    setArchives(updatedArchives);

    // 设置为当前存档
    loadArchive(archiveId);
  };

  // 创建空矩阵
  const createEmptyMatrix = (size) => {
    const matrix = [];
    const dimensions = size === 3 ? DIMENSIONS_3x3 : DIMENSIONS_7x7;

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const dimensionIndex = i * size + j;
        row.push({
          id: `${i}-${j}`,
          row: i,
          col: j,
          dimension: dimensions[dimensionIndex] || { id: 'unknown', name: '未知维度', description: '' },
          energy: 0,
          imprints: [],
          connections: []
        });
      }
      matrix.push(row);
    }

    return matrix;
  };

  // 切换矩阵大小
  const toggleMatrixSize = () => {
    const newSize = matrixSize === 3 ? 7 : 3;
    if (currentArchive) {
      const confirmSwitch = window.confirm(
        `切换矩阵大小将从${matrixSize}x${matrixSize}变为${newSize}x${newSize}，当前矩阵数据将会重置。确定要继续吗？`
      );

      if (confirmSwitch) {
        setMatrixSize(newSize);
        const newMatrix = createEmptyMatrix(newSize);
        setMatrixData(newMatrix);

        // 更新存档
        updateArchive({ matrixSize: newSize, matrix: newMatrix });
      }
    }
  };

  // 更新存档
  const updateArchive = (updates) => {
    if (!currentArchive) return;

    try {
      const archiveData = JSON.parse(localStorage.getItem(`life_matrix_archive_${currentArchive}`));
      const updatedData = {
        ...archiveData,
        ...updates,
        lastModified: new Date().toISOString(),
        totalScore: totalScore
      };

      localStorage.setItem(`life_matrix_archive_${currentArchive}`, JSON.stringify(updatedData));
      setMatrixData(updatedData.matrix);

      // 更新存档列表中的信息
      const updatedArchives = archives.map(archive => {
        if (archive.id === currentArchive) {
          return {
            ...archive,
            lastModified: updatedData.lastModified,
            totalScore: totalScore
          };
        }
        return archive;
      });

      localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
      setArchives(updatedArchives);
    } catch (error) {
      console.error('更新存档失败:', error);
    }
  };

  // 添加能量印记
  const addImprintToCell = (row, col, imprint) => {
    if (!currentArchive) {
      alert('请先选择一个存档！');
      return;
    }

    const newMatrix = [...matrixData];
    const cell = newMatrix[row][col];

    // 添加印记
    cell.imprints.push({
      ...imprint,
      id: `imprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date().toISOString()
    });

    // 计算新的能量值
    const energyIncrease = imprint.power || 10;
    cell.energy = Math.min(100, (cell.energy || 0) + energyIncrease);

    setMatrixData(newMatrix);
    updateArchive({ matrix: newMatrix });

    // 检查是否触发能量叠加效果
    checkEnergyEffects(row, col, newMatrix);
  };

  // 检查能量叠加效果
  const checkEnergyEffects = (row, col, matrix) => {
    const size = matrix.length;
    const cell = matrix[row][col];

    // 横向连接检查（同一行）
    const rowConnections = matrix[row].filter(c => c.energy > 20);
    if (rowConnections.length >= 3) {
      console.log(`触发横向连接！行${row}有${rowConnections.length}个高能量单元格`);
    }

    // 纵向连接检查（同一列）
    const colConnections = matrix.map(r => r[col]).filter(c => c.energy > 20);
    if (colConnections.length >= 3) {
      console.log(`触发纵向连接！列${col}有${colConnections.length}个高能量单元格`);
    }

    // 检查3x3能量集群
    if (size === 7) {
      checkEnergyCluster(row, col, matrix);
    }
  };

  // 检查能量集群
  const checkEnergyCluster = (centerRow, centerCol, matrix) => {
    let clusterEnergy = 0;
    let clusterCells = [];

    for (let i = Math.max(0, centerRow - 1); i <= Math.min(6, centerRow + 1); i++) {
      for (let j = Math.max(0, centerCol - 1); j <= Math.min(6, centerCol + 1); j++) {
        if (matrix[i][j].energy > 15) {
          clusterEnergy += matrix[i][j].energy;
          clusterCells.push(`${i}-${j}`);
        }
      }
    }

    if (clusterCells.length >= 6 && clusterEnergy > 100) {
      console.log('发现能量集群！', clusterCells);
      // 这里可以触发特殊效果或仪式
    }
  };

  // 重置当前存档
  const resetCurrentArchive = () => {
    if (currentArchive && window.confirm('确定要重置当前存档吗？所有能量印记将被清除。')) {
      const newMatrix = createEmptyMatrix(matrixSize);
      setMatrixData(newMatrix);
      updateArchive({ matrix: newMatrix });
    }
  };

  // 删除存档
  const deleteArchive = (archiveId) => {
    if (window.confirm('确定要删除这个存档吗？此操作不可撤销。')) {
      // 从本地存储移除
      localStorage.removeItem(`life_matrix_archive_${archiveId}`);

      // 更新存档列表
      const updatedArchives = archives.filter(archive => archive.id !== archiveId);
      localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
      setArchives(updatedArchives);

      // 如果删除的是当前存档，清空当前状态
      if (archiveId === currentArchive) {
        setCurrentArchive(null);
        setMatrixData([]);
        localStorage.removeItem('life_matrix_current_archive');
      }
    }
  };

  return (
    <div className="lifestyle-guide-page">
      <div className="app">
        <header className="app-header">
          <h1>生命矩阵</h1>
          <p className="subtitle">构建你的意义能量图谱</p>
        </header>

        <main className="app-main">
          {!currentArchive ? (
            <ArchiveManager
              archives={archives}
              onCreateArchive={createNewArchive}
              onLoadArchive={loadArchive}
              onDeleteArchive={deleteArchive}
            />
          ) : (
            <>
              <div className="game-controls">
                <button
                  className="btn-secondary"
                  onClick={() => setCurrentArchive(null)}
                >
                  返回存档选择
                </button>

                <button
                  className="btn-secondary"
                  onClick={toggleMatrixSize}
                >
                  切换矩阵: {matrixSize}x{matrixSize}
                </button>

                <button
                  className="btn-warning"
                  onClick={resetCurrentArchive}
                >
                  重置当前存档
                </button>

                <button
                  className="btn-ritual"
                  onClick={() => setShowRitual(!showRitual)}
                >
                  {showRitual ? '隐藏仪式指南' : '显示仪式指南'}
                </button>
              </div>

              <div className="game-area">
                <div className="matrix-section">
                  <TotalScore
                    score={totalScore}
                    matrixSize={matrixSize}
                    archiveName={archives.find(a => a.id === currentArchive)?.name || '未命名存档'}
                  />

                  <MatrixGrid
                    matrixData={matrixData}
                    matrixSize={matrixSize}
                    onCellClick={setSelectedCell}
                    selectedCell={selectedCell}
                    onAddImprint={addImprintToCell}
                  />
                </div>

                <div className="info-section">
                  {selectedCell ? (
                    <DimensionInfo
                      cell={selectedCell}
                      matrixData={matrixData}
                      onAddImprint={addImprintToCell}
                    />
                  ) : (
                    <div className="dimension-placeholder">
                      <h3>点击矩阵中的单元格查看详细信息</h3>
                      <p>每个单元格代表你生命的一个维度</p>
                      <p>添加能量印记来增强该维度的能量</p>
                      <div className="imprint-types-preview">
                        <h4>能量印记类型</h4>
                        <ul>
                          {IMPRINT_TYPES.slice(0, 5).map(type => (
                            <li key={type.id}>
                              <span className={`imprint-badge ${type.category}`}>{type.name}</span>
                              <span> - {type.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {showRitual && (
                    <RitualGuide
                      matrixData={matrixData}
                      totalScore={totalScore}
                      matrixSize={matrixSize}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="app-footer">
          <p>生命矩阵 - 离线版本 | 数据存储在本地浏览器中</p>
          <p>所有数据仅保存在您的设备上，不会被上传到任何服务器</p>
        </footer>
      </div>
    </div>
  );
}

export default LifestyleGuide;