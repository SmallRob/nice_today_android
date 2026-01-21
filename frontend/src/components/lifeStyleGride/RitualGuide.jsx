import { useState, useMemo } from 'react';
import { getDimensionColor } from '../../utils/matrixData';

/**
 * 仪式指南组件
 * 提供仪式建议和指引，帮助用户深化能量印记的意义
 */
const RitualGuide = ({ matrixData, totalScore, matrixSize, theme = 'light' }) => {
  // Get weak dimensions
  const weakDimensions = useMemo(() => {
    const list = [];
    matrixData.forEach(row => {
      row.forEach(cell => {
        if (cell.energy < 30) list.push(cell);
      });
    });
    return list.sort((a, b) => a.energy - b.energy).slice(0, 3);
  }, [matrixData]);

  const suggestions = useMemo(() => {
    const s = [];
    const stats = {
      total: matrixSize * matrixSize,
      filled: 0,
      avg: Math.round(totalScore / (matrixSize * matrixSize))
    };

    matrixData.forEach(row => row.forEach(c => { if (c.energy > 0) stats.filled++; }));
    const emptyCount = stats.total - stats.filled;

    if (emptyCount > 0) s.push(`还有 ${emptyCount} 个维度待探索，尝试添加不同类别的印记`);
    if (stats.avg < 40) s.push(`平均能量偏低，为已有印记添加更多相关内容`);
    s.push('保持平衡发展，关注身体、精神、关系、创造等各个维度');
    s.push('定期回顾和更新印记，记录新的成长体验');

    return s.slice(0, 4);
  }, [matrixData, totalScore, matrixSize]);

  return (
    <div className={`p-5 rounded-[2rem] border transition-all duration-300 ${theme === 'dark'
        ? 'bg-[#1C1C1E] border-amber-500/20 shadow-[0_10px_30px_rgba(245,158,11,0.05)]'
        : 'bg-amber-50 border-amber-100 shadow-sm'
      }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xl ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>💡</span>
        <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
          }`}>
          发展建议
        </h3>
      </div>

      <ul className="space-y-2.5">
        {suggestions.map((text, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${theme === 'dark' ? 'bg-amber-500/40' : 'bg-amber-400'
              }`}></div>
            <p className={`text-[11px] leading-relaxed font-medium ${theme === 'dark' ? 'text-amber-100/60' : 'text-amber-900/70'
              }`}>
              {text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RitualGuide;