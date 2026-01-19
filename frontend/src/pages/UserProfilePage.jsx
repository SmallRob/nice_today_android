import React, { useState } from 'react';
import UserConfigManager from '../components/UserConfigManager';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const userData = {
    name: '何秀奇',
    username: '叉子',
    score: 68,
    birthDate: '1991-04-30',
    birthTime: '12:30 (午)',
    constellation: '金牛座',
    mbtiType: 'INFJ',
    location: '北京市 海淀区 (经: 116.48, 纬: 39.95)'
  };

  return (
    <div className="user-profile-page">
      {/* Header */}
      <nav className="user-profile-header">
        <button className="nav-back-btn">
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <h1 className="page-title">个人面板</h1>
        <button className="nav-menu-btn">
          <span className="material-icons-round">more_vert</span>
        </button>
      </nav>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          个人信息
        </button>
        <button 
          className={`tab-btn ${activeTab === 'configs' ? 'active' : ''}`}
          onClick={() => setActiveTab('configs')}
        >
          配置管理
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === 'profile' && (
          <div className="profile-content">
            {/* User Info Card */}
            <div className="user-info-card">
              <div className="user-avatar-section">
                <div className="user-avatar">
                  {userData.name.charAt(0)}
                </div>
                <div className="user-basic-info">
                  <div className="user-name-score">
                    <h2>{userData.name}</h2>
                    <span className="score-badge">{userData.score}分</span>
                  </div>
                  <p className="username">@{userData.username}</p>
                </div>
              </div>
              
              <div className="user-details">
                <div className="detail-item">
                  <span className="label">出生日期</span>
                  <span className="value">{userData.birthDate}</span>
                </div>
                <div className="detail-item">
                  <span className="label">出生时间</span>
                  <span className="value">{userData.birthTime}</span>
                </div>
                <div className="detail-item">
                  <span className="label">星座</span>
                  <span className="value">{userData.constellation}</span>
                </div>
                <div className="detail-item">
                  <span className="label">MBTI类型</span>
                  <span className="mbti-value">{userData.mbtiType}</span>
                </div>
                <div className="detail-item location-item">
                  <span className="material-icons-round location-icon">location_on</span>
                  <span className="location-text">{userData.location}</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="action-btn primary">
                  <span className="material-icons-round">refresh</span>
                  重新评分
                </button>
                <button className="action-btn secondary">
                  <span className="material-icons-round">delete_sweep</span>
                  清理缓存
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configs' && (
          <div className="configs-content">
            <UserConfigManager />
          </div>
        )}
      </div>

      {/* Data Management Section - Now accessible via modal */}
      <div className="data-management-section">
        <button 
          className="backup-sync-btn"
          onClick={() => setShowBackupModal(true)}
        >
          <div className="backup-content">
            <div className="backup-icon">
              <span className="material-icons-round">cloud_upload</span>
            </div>
            <div className="backup-text">
              <p className="backup-title">备份与同步</p>
              <p className="backup-subtitle">管理您的配置数据</p>
            </div>
            <span className="material-icons-round chevron-icon">chevron_right</span>
          </div>
        </button>
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>配置备份与导出</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowBackupModal(false)}
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="backup-options">
                <div className="backup-option">
                  <div className="option-header">
                    <span className="material-icons-round export-icon">upload</span>
                    <div>
                      <h4>导出配置</h4>
                      <p>将当前配置导出为JSON文件</p>
                    </div>
                  </div>
                  <button 
                    className="export-btn"
                    onClick={() => {
                      // 导出配置的逻辑
                      alert('配置已导出到剪贴板！');
                      setShowBackupModal(false);
                    }}
                  >
                    导出
                  </button>
                </div>
                
                <div className="backup-option">
                  <div className="option-header">
                    <span className="material-icons-round import-icon">download</span>
                    <div>
                      <h4>导入配置</h4>
                      <p>从JSON文件导入配置</p>
                    </div>
                  </div>
                  <label className="import-btn">
                    选择文件
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          alert(`已选择文件: ${file.name}`);
                          // 处理导入配置的逻辑
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                
                <div className="backup-option">
                  <div className="option-header">
                    <span className="material-icons-round sync-icon">sync</span>
                    <div>
                      <h4>云同步</h4>
                      <p>与云端服务器同步配置</p>
                    </div>
                  </div>
                  <button className="sync-btn">
                    同步
                  </button>
                </div>
              </div>
              
              <div className="backup-tips">
                <div className="tip-item">
                  <span className="material-icons-round tip-icon">tips_and_updates</span>
                  <div>
                    <h4>备份建议</h4>
                    <p>定期备份您的配置以防数据丢失</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;