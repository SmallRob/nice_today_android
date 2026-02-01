import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ArchiveManager from '../components/lifeStyleGride/ArchiveManager.jsx';
import MatrixGrid from '../components/lifeStyleGride/MatrixGrid.jsx';
import DimensionInfo from '../components/lifeStyleGride/DimensionInfo.jsx';
import TotalScore from '../components/lifeStyleGride/TotalScore.jsx';
import RitualGuide from '../components/lifeStyleGride/RitualGuide.jsx';
import OnboardingModal from '../components/lifeStyleGride/OnboardingModal.jsx';
import { initializeStorage, getArchives, getCurrentArchive } from '../utils/lifeGridStorage';
import { DIMENSIONS_3x3, DIMENSIONS_7x7, IMPRINT_TYPES } from '../utils/matrixData';
import { IconLibrary } from '../components/IconLibrary';
import { LifeMatrixIcon } from '../components/icons';
import './LifestyleGuide.css';

function LifestyleGuideContent() {
  const navigate = useNavigate();
  const [currentArchive, setCurrentArchive] = useState(null);
  const [matrixSize, setMatrixSize] = useState(3);
  const [matrixData, setMatrixData] = useState([]);
  const [archives, setArchives] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showRitual, setShowRitual] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { theme } = useTheme();

  // Onboarding logic
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('lifestyle-guide-onboarding-shown');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // App Initialization
  useEffect(() => {
    initializeStorage();
    const savedArchives = getArchives();
    setArchives(savedArchives);

    const savedCurrent = getCurrentArchive();
    if (savedCurrent) {
      loadArchive(savedCurrent);
    }
  }, []);

  // Calculate Total Score
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
      console.error('Failed to load archive:', error);
    }
  };

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

    localStorage.setItem(`life_matrix_archive_${archiveId}`, JSON.stringify(newArchive));

    const updatedArchives = [...archives, {
      id: archiveId,
      name: archiveName,
      created: newArchive.created,
      matrixSize: size,
      totalScore: 0
    }];

    localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
    setArchives(updatedArchives);
    loadArchive(archiveId);
  };

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

      const updatedArchives = archives.map(archive =>
        archive.id === currentArchive ? { ...archive, lastModified: updatedData.lastModified, totalScore } : archive
      );
      localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
      setArchives(updatedArchives);
    } catch (error) {
      console.error('Failed to update archive:', error);
    }
  };

  const toggleMatrixSize = () => {
    const newSize = matrixSize === 3 ? 7 : 3;
    if (currentArchive && window.confirm(`切换大小将重置当前矩阵数据，确定要切换到 ${newSize}x${newSize} 吗？`)) {
      setMatrixSize(newSize);
      const newMatrix = createEmptyMatrix(newSize);
      setMatrixData(newMatrix);
      updateArchive({ matrixSize: newSize, matrix: newMatrix });
    }
  };

  const resetCurrentArchive = () => {
    if (currentArchive && window.confirm('确定要重置当前存档吗？所有印记将被清除。')) {
      const newMatrix = createEmptyMatrix(matrixSize);
      setMatrixData(newMatrix);
      updateArchive({ matrix: newMatrix });
    }
  };

  const deleteArchive = (archiveId) => {
    if (window.confirm('确定要删除这个存档吗？此操作不可撤销。')) {
      localStorage.removeItem(`life_matrix_archive_${archiveId}`);
      const updatedArchives = archives.filter(a => a.id !== archiveId);
      localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
      setArchives(updatedArchives);
      if (archiveId === currentArchive) {
        setCurrentArchive(null);
        setMatrixData([]);
        localStorage.removeItem('life_matrix_current_archive');
      }
    }
  };

  const addImprintToCell = (row, col, imprint) => {
    if (!currentArchive) return;
    const newMatrix = [...matrixData];
    const cell = newMatrix[row][col];
    cell.imprints.push({
      ...imprint,
      id: `imprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date().toISOString()
    });
    const energyIncrease = imprint.power || 10;
    cell.energy = Math.min(100, (cell.energy || 0) + energyIncrease);
    setMatrixData(newMatrix);
    updateArchive({ matrix: newMatrix });
  };

  return (
    <div className={`lifestyle-guide-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {/* Premium Header - Centered Title with More Menu */}
      <header className="lifestyle-guide-header pt-safe-top">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <IconLibrary.Icon name="back" size={24} color="white" />
          </button>
        </div>

        <div className="header-center">
          <div className="header-title-area">
            <h1>
              <LifeMatrixIcon size={20} color="white" />
              生命矩阵
            </h1>
            <p className="subtitle">Life Matrix Pro</p>
          </div>
        </div>

        <div className="header-right">
          <button
            className="more-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More options"
          >
            <IconLibrary.Icon name="settings" size={24} color="white" />
          </button>

          {showMenu && (
            <div className="more-menu-dropdown animate-in fade-in zoom-in duration-200">
              <button className="menu-item" onClick={() => { setCurrentArchive(null); setShowMenu(false); }}>
                <IconLibrary.Icon name="folder" size={18} />
                返回存档管理
              </button>
              <button className="menu-item" onClick={() => { toggleMatrixSize(); setShowMenu(false); }}>
                <IconLibrary.Icon name="chart" size={18} />
                切换 {matrixSize === 3 ? '7x7' : '3x3'} 模式
              </button>
              <button className="menu-item" onClick={() => { setShowRitual(!showRitual); setShowMenu(false); }}>
                <IconLibrary.Icon name="help" size={18} />
                {showRitual ? '隐藏维度建议' : '显示维度建议'}
              </button>
              <div className="menu-divider"></div>
              <button className="menu-item text-red-500" onClick={() => { resetCurrentArchive(); setShowMenu(false); }}>
                <IconLibrary.Icon name="refresh" size={18} color="#ef4444" />
                重置当前矩阵
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lifestyle-guide-content no-scrollbar fill-container" onClick={() => setShowMenu(false)}>
        {!currentArchive ? (
          <div className="archive-manager-view">
            <ArchiveManager
              archives={archives}
              onCreateArchive={createNewArchive}
              onLoadArchive={loadArchive}
              onDeleteArchive={deleteArchive}
              theme={theme}
            />
          </div>
        ) : (
          <div className="matrix-play-view">
            {/* 1. Score Card (Primary Section) */}
            <TotalScore
              score={totalScore}
              matrixSize={matrixSize}
              archiveName={archives.find(a => a.id === currentArchive)?.name || '未命名存档'}
              theme={theme}
            />

            {/* 2. Stats Grid (2x2) */}
            <MatrixStats
              matrixData={matrixData}
              theme={theme}
            />

            {/* 3. Suggestions (Development Recommendations) */}
            {showRitual && (
              <div className="ritual-addon-panel mb-2">
                <RitualGuide
                  matrixData={matrixData}
                  totalScore={totalScore}
                  matrixSize={matrixSize}
                  theme={theme}
                />
              </div>
            )}

            {/* 4. Matrix Grid Section */}
            <div className="matrix-view-port">
              <div className="matrix-scroll-wrapper no-scrollbar">
                <MatrixGrid
                  matrixData={matrixData}
                  matrixSize={matrixSize}
                  onCellClick={setSelectedCell}
                  selectedCell={selectedCell}
                  onAddImprint={addImprintToCell}
                  theme={theme}
                  hideInternalLegend={true}
                />
              </div>
            </div>

            {/* 5. Energy Level Legend */}
            <EnergyLevelLegend theme={theme} />

            {/* 6. Selection Detail or Instruction */}
            <div className="interaction-panel border-none bg-transparent p-0">
              {selectedCell ? (
                <DimensionInfo
                  cell={selectedCell}
                  onAddImprint={addImprintToCell}
                  theme={theme}
                />
              ) : (
                <DimensionInstructionCard theme={theme} />
              )}
            </div>

          </div>
        )}
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => localStorage.setItem('lifestyle-guide-onboarding-shown', 'true')}
        theme={theme}
      />
    </div>
  );
}

const EnergyLevelLegend = ({ theme }) => (
  <section className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#161618] border-[#242427]' : 'bg-white border-slate-100 shadow-sm'} space-y-3`}>
    <div className="flex justify-between items-center">
      <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-400'}`}>能量等级</h4>
    </div>
    <div className="grid grid-cols-3 gap-y-2 gap-x-3">
      {[
        { label: '空 (0)', color: theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-200' },
        { label: '低 (1-19)', color: theme === 'dark' ? 'bg-white/20' : 'bg-slate-400' },
        { label: '中 (20-49)', color: theme === 'dark' ? 'bg-white/40' : 'bg-slate-600' },
        { label: '高 (50-79)', color: theme === 'dark' ? 'bg-white/70' : 'bg-slate-800' },
        { label: '满 (80-100)', color: 'bg-gradient-to-br from-amber-300 to-orange-500' }
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
          <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-500'}`}>{item.label}</span>
        </div>
      ))}
    </div>
    <p className={`text-[10px] border-t pt-3 ${theme === 'dark' ? 'text-[#A1A1AA] border-white/5' : 'text-slate-400 border-slate-50'}`}>
      点击单元格查看详情，长按添加能量印记
    </p>
  </section>
);

const DimensionInstructionCard = ({ theme }) => (
  <section className={`p-5 rounded-xl border text-center space-y-4 ${theme === 'dark' ? 'bg-[#161618] border-[#242427]' : 'bg-white border-slate-100 shadow-sm'}`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
      <span className="text-2xl">✨</span>
    </div>
    <h3 className="font-bold text-sm">点击矩阵格子</h3>
    <p className={`text-xs ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-500'}`}>选择一个生命维度进行探索</p>

    <div className={`text-left pt-5 space-y-3 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
      <h4 className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-400'}`}>能量印记说明</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <p className="text-[11px]"><span className="font-bold">实物徽章:</span> 代表具体成就的物理符号</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></div>
          <p className="text-[11px]"><span className="font-bold">环境能量石:</span> 特定场所的能量记录</p>
        </div>
      </div>
    </div>
  </section>
);

// Helper Component for Matrix Statistics (2x2 grid matching design)
const MatrixStats = ({ matrixData, theme }) => {
  const stats = useMemo(() => {
    let total = 0;
    let filled = 0;
    let score = 0;
    matrixData.forEach(row => row.forEach(cell => {
      total++;
      if (cell.energy > 0) filled++;
      score += (cell.energy || 0);
    }));
    return {
      total,
      filled,
      empty: total - filled,
      avg: Math.round(score / Math.max(1, filled))
    };
  }, [matrixData]);

  const items = [
    { label: '总单元格', val: stats.total, color: theme === 'dark' ? 'text-white' : 'text-slate-900' },
    { label: '已激活', val: stats.filled, color: 'text-rose-500' },
    { label: '未激活', val: stats.empty, color: theme === 'dark' ? 'text-white' : 'text-slate-900' },
    { label: '平均能量', val: stats.avg, color: theme === 'dark' ? 'text-white' : 'text-slate-900' }
  ];

  return (
    <section className="grid grid-cols-4 gap-2 mb-3">
      {items.map((stat, idx) => (
        <div key={idx} className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${theme === 'dark' ? 'bg-[#161618] border-[#242427]' : 'bg-white border-slate-100 shadow-sm'
          }`}>
          <span className={`text-lg font-bold ${stat.color}`}>{stat.val}</span>
          <span className={`text-[9px] text-slate-400 mt-0.5`}>{stat.label}</span>
        </div>
      ))}
    </section>
  );
};

function LifestyleGuide() {
  return (
    <LifestyleGuideContent />
  );
}

export default LifestyleGuide;