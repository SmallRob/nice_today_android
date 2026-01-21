import { useMemo } from 'react';

/**
 * 总分显示组件
 * 显示当前矩阵的总能量分数和统计信息
 */
const TotalScore = ({ score, matrixSize, archiveName, theme = 'light' }) => {
  // 计算最大可能分数
  const maxScore = useMemo(() => {
    const totalCells = matrixSize * matrixSize;
    return totalCells * 100;
  }, [matrixSize]);

  // 计算完成百分比
  const percentage = Math.round((score / maxScore) * 100);

  // 获取等级描述
  const getLevelDescription = () => {
    if (percentage >= 80) return '你的生命矩阵达到了卓越状态，各维度都充分发展。';
    if (percentage >= 50) return '你的生命矩阵展现了良好的整合水平，继续保持。';
    return '你的生命矩阵刚刚起步，开始添加能量印记。';
  };

  return (
    <section className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-[#161618] border-[#242427]' : 'bg-white border-slate-100 shadow-sm'
      }`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {archiveName.substring(0, 3)}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${theme === 'dark' ? 'bg-white/5 text-[#A1A1AA]' : 'bg-slate-100 text-slate-500'
              }`}>
              {matrixSize}×{matrixSize}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">矩阵存档</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#8B5CF6]">{score}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">能量总和</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <div className="relative group">
          {theme === 'dark' && (
            <div className="absolute -inset-4 bg-[#8B5CF6] rounded-full blur-2xl opacity-20"></div>
          )}
          <button className={`
            relative px-12 py-3.5 rounded-full font-bold shadow-lg transition-all transform active:scale-95 text-sm tracking-wide
            ${theme === 'dark' ? 'bg-[#8B5CF6] text-white shadow-[#8B5CF6]/30' : 'bg-indigo-600 text-white shadow-indigo-200'}
          `}>
            同步
          </button>
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
            <span>0</span>
            <span>{maxScore}</span>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div
              className="h-full bg-[#8B5CF6] rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-center">
            <span className="text-sm font-black text-[#8B5CF6]">{percentage}%</span>
          </div>
        </div>
      </div>

      <p className={`text-xs text-center leading-relaxed italic mt-2 ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-400'
        }`}>
        “{getLevelDescription()}”
      </p>
    </section>
  );
};

export default TotalScore;