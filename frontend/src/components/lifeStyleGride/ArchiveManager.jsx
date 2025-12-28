import { useState } from 'react';

const ArchiveManager = ({ archives, onCreateArchive, onLoadArchive, onDeleteArchive }) => {
  const [showNewArchiveForm, setShowNewArchiveForm] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState('');
  const [selectedSize, setSelectedSize] = useState(3);
  
  const handleCreateArchive = (e) => {
    e.preventDefault();
    if (newArchiveName.trim()) {
      onCreateArchive(newArchiveName.trim(), selectedSize);
      setNewArchiveName('');
      setShowNewArchiveForm(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="archive-manager">
      <h2>生命矩阵存档</h2>
      <p className="archive-subtitle">选择一个存档继续，或创建新的矩阵</p>
      
      <button 
        className="btn-primary create-archive-btn"
        onClick={() => setShowNewArchiveForm(true)}
      >
        + 创建新矩阵
      </button>
      
      {showNewArchiveForm && (
        <div className="new-archive-form">
          <h3>创建新矩阵</h3>
          <form onSubmit={handleCreateArchive}>
            <div className="form-group">
              <label htmlFor="archiveName">矩阵名称</label>
              <input
                type="text"
                id="archiveName"
                value={newArchiveName}
                onChange={(e) => setNewArchiveName(e.target.value)}
                placeholder="例如：我的2024意义探索"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>矩阵大小</label>
              <div className="size-options">
                <label className="size-option">
                  <input
                    type="radio"
                    name="matrixSize"
                    value="3"
                    checked={selectedSize === 3}
                    onChange={() => setSelectedSize(3)}
                  />
                  <div className="size-option-content">
                    <h4>3×3 基础矩阵</h4>
                    <p>9个核心生命维度</p>
                    <p>适合初次探索</p>
                  </div>
                </label>
                
                <label className="size-option">
                  <input
                    type="radio"
                    name="matrixSize"
                    value="7"
                    checked={selectedSize === 7}
                    onChange={() => setSelectedSize(7)}
                  />
                  <div className="size-option-content">
                    <h4>7×7 完整矩阵</h4>
                    <p>49个生命维度</p>
                    <p>深度意义探索</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowNewArchiveForm(false)}>
                取消
              </button>
              <button type="submit" className="btn-primary">
                创建矩阵
              </button>
            </div>
          </form>
        </div>
      )}
      
      {archives.length > 0 ? (
        <div className="archive-list">
          <h3>现有存档 ({archives.length})</h3>
          <div className="archives-grid">
            {archives.map(archive => (
              <div key={archive.id} className="archive-card">
                <div className="archive-header">
                  <h4>{archive.name}</h4>
                  <span className="matrix-size-badge">{archive.matrixSize}×{archive.matrixSize}</span>
                </div>
                
                <div className="archive-details">
                  <p>创建时间: {formatDate(archive.created)}</p>
                  {archive.lastModified && (
                    <p>最后修改: {formatDate(archive.lastModified)}</p>
                  )}
                  <p>能量总分: <strong>{archive.totalScore || 0}</strong></p>
                </div>
                
                <div className="archive-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => onLoadArchive(archive.id)}
                  >
                    继续
                  </button>
                  <button 
                    className="btn-warning"
                    onClick={() => onDeleteArchive(archive.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-archives">
          <div className="empty-state">
            <div className="empty-icon">✧</div>
            <h3>还没有创建任何矩阵</h3>
            <p>创建你的第一个生命矩阵，开始意义探索之旅</p>
          </div>
        </div>
      )}
      
      <div className="archive-info">
        <h4>关于存档</h4>
        <p>所有数据都保存在您的浏览器本地存储中，不会上传到任何服务器。</p>
        <p>您可以在同一设备上创建多个矩阵，分别探索不同的生命阶段或主题。</p>
        <p className="warning-note">⚠️ 清除浏览器数据会删除所有存档，请定期备份重要数据。</p>
      </div>
    </div>
  );
};

export default ArchiveManager;