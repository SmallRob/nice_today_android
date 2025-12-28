import { useState } from 'react';
import { getDimensionColor, IMPRINT_TYPES } from '../../utils/matrixData';

/**
 * 维度信息组件
 * 显示选中单元格的详细信息和能量印记操作
 */
const DimensionInfo = ({ cell, onAddImprint }) => {
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
    <div className="dimension-info">
      <div className="dimension-header">
        <h3 className="dimension-name">{cell.dimension.name}</h3>
        <div className="dimension-energy">
          <span className="energy-label">能量</span>
          <span className="energy-value" style={{ color: cellColor }}>
            {cell.energy}/100
          </span>
        </div>
      </div>

      <div className="dimension-description">
        <p>{cell.dimension.description}</p>
      </div>

      <div className="energy-bar-large">
        <div
          className="energy-bar-fill"
          style={{
            width: `${cell.energy}%`,
            backgroundColor: cellColor
          }}
        ></div>
      </div>

      {/* 能量印记列表 */}
      <div className="imprints-section">
        <div className="section-header">
          <h4>能量印记 ({cell.imprints.length})</h4>
          <button
            className="btn-add-imprint"
            onClick={() => setShowAddImprint(true)}
          >
            + 添加印记
          </button>
        </div>

        {cell.imprints.length === 0 ? (
          <div className="no-imprints">
            <p>还没有添加能量印记</p>
            <p className="hint">点击"添加印记"开始构建此维度</p>
          </div>
        ) : (
          <div className="imprints-list">
            {cell.imprints.map(imprint => (
              <div
                key={imprint.id}
                className="imprint-item"
                style={{
                  borderLeftColor: getCategoryColor(imprint.category)
                }}
              >
                <div className="imprint-main">
                  <div className="imprint-header">
                    <span className="imprint-name">{imprint.name}</span>
                    <span className="imprint-power">
                      +{imprint.power}
                    </span>
                  </div>
                  {imprint.description && (
                    <p className="imprint-desc">{imprint.description}</p>
                  )}
                </div>
                <div className="imprint-meta">
                  <span className="imprint-date">
                    {formatDate(imprint.addedAt)}
                  </span>
                  <button
                    className="btn-remove-imprint"
                    onClick={() => handleRemoveImprint(imprint.id)}
                    title="删除印记"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加印记模态框 */}
      {showAddImprint && (
        <div className="modal-overlay" onClick={() => setShowAddImprint(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>为"{cell.dimension.name}"添加能量印记</h3>
              <button
                className="btn-close"
                onClick={() => setShowAddImprint(false)}
              >
                ×
              </button>
            </div>

            {/* 类别筛选 */}
            <div className="category-filter">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </button>
              <button
                className={`category-btn ${selectedCategory === 'material' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('material')}
              >
                物质
              </button>
              <button
                className={`category-btn ${selectedCategory === 'spiritual' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('spiritual')}
              >
                精神
              </button>
              <button
                className={`category-btn ${selectedCategory === 'relational' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('relational')}
              >
                关系
              </button>
              <button
                className={`category-btn ${selectedCategory === 'creative' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('creative')}
              >
                创造
              </button>
            </div>

            {/* 印记列表 */}
            <div className="imprint-types-grid">
              {filteredImprintTypes.map(type => (
                <button
                  key={type.id}
                  className="imprint-type-card"
                  onClick={() => handleAddImprint(type)}
                  style={{
                    borderColor: getCategoryColor(type.category)
                  }}
                >
                  <div className="imprint-type-icon">
                    {getImprintIcon(type.category)}
                  </div>
                  <div className="imprint-type-info">
                    <h5 className="imprint-type-name">{type.name}</h5>
                    <p className="imprint-type-desc">{type.description}</p>
                  </div>
                  <div className="imprint-type-power">
                    +{type.power}
                  </div>
                </button>
              ))}
            </div>

            {/* 自定义印记 */}
            <div className="custom-imprint-section">
              <h5>自定义印记</h5>
              <div className="custom-input-group">
                <input
                  type="text"
                  value={customImprint}
                  onChange={(e) => setCustomImprint(e.target.value)}
                  placeholder="输入自定义印记描述..."
                  maxLength={50}
                />
                <button
                  className="btn-primary"
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
