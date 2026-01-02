import { useState } from 'react';
import { getDimensionColor, IMPRINT_TYPES } from '../../utils/matrixData';

/**
 * 维度信息组件
 * 显示选中单元格的详细信息和能量印记操作
 */
const DimensionInfo = ({ cell, onAddImprint, theme = 'light' }) => {
  const [showAddImprint, setShowAddImprint] = useState(false);
  const [customImprint, setCustomImprint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!cell) {
    return null;
  }

  // 过滤印记类型
  const filteredImprintTypes = selectedCategory === 'all'
    ? IMPRINT_TYPES
    : IMPRINT_TYPES.filter(type => type.category === selectedCategory);

  // 添加印记
  const handleAddImprint = (imprint) => {
    onAddImprint(cell.row, cell.col, imprint);
    setShowAddImprint(false);
    setCustomImprint('');
  };

  // 添加自定义印记
  const handleCustomImprint = () => {
    if (!customImprint.trim()) {
      alert('请输入自定义印记描述');
      return;
    }

    handleAddImprint({
      type: 'custom',
      name: customImprint.trim(),
      category: 'custom',
      power: 10,
      description: '自定义能量印记'
    });
  };

  // 删除印记
  const handleRemoveImprint = (_imprintId) => {
    if (!window.confirm('确定要删除这个印记吗？')) return;

    // 这里需要调用父组件的方法来删除印记
    // 暂时使用 alert 提示
    alert('删除印记功能待实现');
  };

  // 获取类别颜色
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

  // 格式化时间
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cellColor = getDimensionColor(cell.dimension.id);

  return (
    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold" style={{ color: cellColor }}>
          {cell.dimension.name}
        </h3>
        <div className="text-right">
          <div className="text-sm opacity-75">能量</div>
          <div className="text-xl font-bold" style={{ color: cellColor }}>
            {cell.energy}/100
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {cell.dimension.description}
        </p>
      </div>

      <div className={`w-full h-4 rounded-full mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${cell.energy}%`,
            backgroundColor: cellColor
          }}
        ></div>
      </div>

      {/* 能量印记列表 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold">能量印记 ({cell.imprints.length})</h4>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
            onClick={() => setShowAddImprint(true)}
          >
            + 添加印记
          </button>
        </div>

        {cell.imprints.length === 0 ? (
          <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>还没有添加能量印记</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>点击"添加印记"开始构建此维度</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cell.imprints.map(imprint => (
              <div
                key={imprint.id}
                className={`p-3 rounded-lg border-l-4 flex justify-between items-start ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                style={{
                  borderLeftColor: getCategoryColor(imprint.category)
                }}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{imprint.name}</span>
                    <span className="font-bold" style={{ color: getCategoryColor(imprint.category) }}>
                      +{imprint.power}
                    </span>
                  </div>
                  {imprint.description && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {imprint.description}
                    </p>
                  )}
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(imprint.addedAt)}
                  </div>
                </div>
                <button
                  className={`ml-2 w-6 h-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  onClick={() => handleRemoveImprint(imprint.id)}
                  title="删除印记"
                >
                  ×
                </button>
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
                  className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                    selectedCategory === category
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
            <div className="p-4 grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {filteredImprintTypes.map(type => (
                <button
                  key={type.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                    theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleAddImprint(type)}
                  style={{
                    borderLeftColor: getCategoryColor(type.category)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getImprintIcon(type.category)}</div>
                    <div className="text-left">
                      <div className="font-medium">{type.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {type.description}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold" style={{ color: getCategoryColor(type.category) }}>
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
                  className={`flex-1 p-2 rounded border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    customImprint.trim()
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