import { useState } from 'react';
import { getDimensionColor, IMPRINT_TYPES } from '../../utils/matrixData';

/**
 * 维度信息组件
 * 显示选中单元格的详细信息和能量印记操作
 */
const DimensionInfo = ({ cell, onAddImprint, theme = 'light' }) => {
  const [showAddImprint, setShowAddImprint] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [customImprint, setCustomImprint] = useState('');

  if (!cell) return null;

  // Filter imprint types based on selection
  const filteredImprintTypes = selectedCategory === 'all'
    ? IMPRINT_TYPES
    : IMPRINT_TYPES.filter(type => type.category === selectedCategory);

  const handleAddImprint = (imprint) => {
    onAddImprint(cell.row, cell.col, imprint);
    setShowAddImprint(false);
    setCustomImprint('');
  };

  const handleCustomImprint = () => {
    if (!customImprint.trim()) return;
    handleAddImprint({
      type: 'custom',
      name: customImprint.trim(),
      category: 'custom',
      power: 10,
      description: '自定义能量印记'
    });
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      material: '#FF6B6B',
      spiritual: '#45B7D1',
      relational: '#DDA0DD',
      creative: '#FDCB6E',
      custom: '#96CEB4'
    };
    return colorMap[category] || '#CCCCCC';
  };

  const cellColor = getDimensionColor(cell.dimension.id);

  return (
    <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${theme === 'dark' ? 'bg-[#161618] border-[#242427]' : 'bg-white border-slate-100 shadow-sm'
      }`}>
      {/* Header with Color Accent */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black tracking-tight" style={{ color: cellColor }}>
            {cell.dimension.name}
          </h3>
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-400'
            }`}>
            维度同步详情
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: cellColor }}>{cell.energy}</div>
          <div className="text-xs font-bold opacity-40">DEPTH</div>
        </div>
      </div>

      <p className={`text-xs leading-relaxed mb-6 font-medium ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-500'
        }`}>
        {cell.dimension.description}
      </p>

      {/* Modern thin energy bar */}
      <div className={`w-full h-1 rounded-full mb-8 overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'
        }`}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${cell.energy}%`, backgroundColor: cellColor }}
        ></div>
      </div>

      {/* Imprints Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#A1A1AA]' : 'text-slate-400'
            }`}>
            能量印记 ({cell.imprints.length})
          </h4>
          <button
            onClick={() => setShowAddImprint(true)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
          >
            +
          </button>
        </div>

        {cell.imprints.length === 0 ? (
          <div className={`py-8 rounded-2xl border border-dashed text-center ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">暂无印记</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {cell.imprints.map((imprint, idx) => (
              <div
                key={imprint.id || idx}
                className={`p-4 rounded-2xl border flex justify-between items-center ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}
              >
                <div>
                  <div className="text-xs font-bold">{imprint.name}</div>
                  <div className="text-[9px] opacity-40 uppercase tracking-tighter mt-0.5">
                    {new Date(imprint.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-black" style={{ color: cellColor }}>+{imprint.power}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加印记模态框 */}
      {showAddImprint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddImprint(false)}>
          <div className={`rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">为"{cell.dimension.name}"添加能量印记</h3>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setShowAddImprint(false)}
              >
                ×
              </button>
            </div>

            {/* 类别筛选 */}
            <div className="p-4 border-b flex flex-wrap gap-2">
              {['all', 'material', 'spiritual', 'relational', 'creative'].map(category => (
                <button
                  key={category}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize ${selectedCategory === category
                    ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                    }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? '全部' :
                    category === 'material' ? '物质' :
                      category === 'spiritual' ? '精神' :
                        category === 'relational' ? '关系' : '创造'}
                </button>
              ))}
            </div>

            {/* 印记列表 */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredImprintTypes.map(type => (
                <button
                  key={type.id}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-95 min-h-[100px] ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  onClick={() => handleAddImprint(type)}
                  style={{
                    borderTopColor: getCategoryColor(type.category),
                    borderTopWidth: '3px'
                  }}
                >
                  <div className="text-2xl mb-2">{getImprintIcon(type.category)}</div>
                  <div className="font-bold text-sm mb-1">{type.name}</div>
                  <div className={`text-xs mb-2 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {type.description}
                  </div>
                  <div className="font-black text-sm" style={{ color: getCategoryColor(type.category) }}>
                    +{type.power}
                  </div>
                </button>
              ))}
            </div>

            {/* 自定义印记 */}
            <div className="p-4 border-t">
              <h5 className="font-medium mb-3">自定义印记</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImprint}
                  onChange={(e) => setCustomImprint(e.target.value)}
                  placeholder="输入自定义印记描述..."
                  maxLength={50}
                  className={`flex-1 p-2 rounded border ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                    }`}
                />
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${customImprint.trim()
                    ? `${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'}`
                    }`}
                  onClick={handleCustomImprint}
                  disabled={!customImprint.trim()}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 获取印记类别图标
const getImprintIcon = (category) => {
  const iconMap = {
    material: '🏆',
    spiritual: '🔮',
    relational: '🤝',
    creative: '✨',
    custom: '📝'
  };
  return iconMap[category] || '⚡';
};

export default DimensionInfo;