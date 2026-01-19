import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserConfig } from '../contexts/UserConfigContext';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import { baziCacheManager } from '../utils/BaziCacheManager';
import mobileFileSystem, { checkAndRequestStoragePermission } from '../utils/mobileFileSystem';
import { getShichenSimple, normalizeShichen } from '../utils/astronomy';
import ConfigEditModal from './ConfigEditModal';
import NameScoringModal from './NameScoringModal';
import './user-config-manager/private-styles.css';

const UserConfigManager = () => {
  const {
    configs,
    currentConfig,
    activeConfigIndex: contextActiveIndex,
    loading: contextLoading,
    error: contextError,
  } = useUserConfig();

  // 本地展示状态
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'configs', 'data'
  const [message, setMessage] = useState(null);
  const [isTempScoringOpen, setIsTempScoringOpen] = useState(false);
  const [tempScoringConfigIndex, setTempScoringConfigIndex] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfigIndex, setEditingConfigIndex] = useState(null);

  // 数据管理相关状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupStatus, setBackupStatus] = useState({
    configs: false,
    cache: false,
    settings: false,
    total: 0
  });

  const activeIndex = contextActiveIndex ?? 0;
  const currentActiveConfig = configs[activeIndex] || configs[0];

  // 显示提示信息
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), type === 'error' ? 5000 : 3000);
  }, []);

  // 处理删除配置
  const handleDeleteConfig = async (e, index) => {
    e.stopPropagation();
    if (configs.length <= 1) {
      showMessage('至少需要保留一个配置', 'error');
      return;
    }
    if (window.confirm('确定要删除这个配置吗？')) {
      try {
        await enhancedUserConfigManager.removeConfig(index);
        showMessage('删除配置成功', 'success');
      } catch (error) {
        showMessage(`删除失败: ${error.message}`, 'error');
      }
    }
  };

  // 切换活跃配置
  const handleSetActiveConfig = async (index) => {
    try {
      await enhancedUserConfigManager.setActiveConfig(index);
      showMessage('配置已切换', 'success');
    } catch (error) {
      showMessage('切换失败: ' + error.message, 'error');
    }
  };

  /**
   * 数据管理核心逻辑 (从 UserDataManager 迁移)
   */
  const checkDeviceAndRequestPermission = useCallback(async () => {
    try {
      const env = mobileFileSystem.detectEnvironment();
      if (env.isNative) {
        const permissionResult = await checkAndRequestStoragePermission();
        if (!permissionResult.granted) {
          return { hasPermission: false, isMobile: true, error: permissionResult.message };
        }
      }
      return { hasPermission: true, isMobile: env.isNative || !env.isWeb };
    } catch (error) {
      return { hasPermission: false, isMobile: true, error: error.message || '权限检查失败' };
    }
  }, []);

  const handleExportConfigs = useCallback(async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const permission = await checkDeviceAndRequestPermission();
      if (!permission.hasPermission) {
        showMessage('存储权限不足：' + permission.error, 'error');
        return;
      }
      const jsonData = enhancedUserConfigManager.exportConfigs();
      if (!jsonData) {
        showMessage('导出失败，没有数据', 'error');
        return;
      }
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `nice-today-configs-${timestamp}.json`;
      const result = await mobileFileSystem.saveFile(filename, jsonData, 'application/json');
      if (result.success) showMessage(`导出成功`, 'success');
      else if (result.error !== '已取消保存') showMessage('导出失败: ' + result.error, 'error');
    } catch (error) {
      showMessage('导出失败: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [showMessage, checkDeviceAndRequestPermission, isProcessing]);

  const handleImportConfigs = useCallback(async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const permission = await checkDeviceAndRequestPermission();
      if (!permission.hasPermission) {
        showMessage('存储权限不足：' + permission.error, 'error');
        return;
      }
      const result = await mobileFileSystem.readFile('.json');
      if (result.success) {
        if (enhancedUserConfigManager.importConfigs(result.content)) showMessage('导入配置成功', 'success');
        else showMessage('导入失败，请检查格式', 'error');
      } else if (result.error !== '已取消选择' && result.error !== '未选择文件') {
        showMessage('导入失败: ' + result.error, 'error');
      }
    } catch (error) {
      showMessage('导入失败: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [showMessage, checkDeviceAndRequestPermission, isProcessing]);

  const collectUserData = useCallback(async () => {
    const data = { exportTime: new Date().toISOString(), version: '1.0.0', data: {} };
    try {
      const allConfigs = enhancedUserConfigManager.getAllConfigs();
      data.data.configs = { count: allConfigs.length, items: allConfigs };
      setBackupStatus(prev => ({ ...prev, configs: true }));
    } catch (e) { console.error(e); }
    try {
      const cacheData = baziCacheManager.getAllCache();
      data.data.cache = { count: Object.keys(cacheData || {}).length, items: cacheData };
      setBackupStatus(prev => ({ ...prev, cache: true }));
    } catch (e) { console.error(e); }
    const totalData = JSON.stringify(data).length;
    setBackupStatus(prev => ({ ...prev, total: (totalData / 1024).toFixed(2) }));
    return JSON.stringify(data, null, 2);
  }, []);

  const createJSONBackup = useCallback(async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const jsonData = await collectUserData();
      const permission = await checkDeviceAndRequestPermission();
      if (!permission.hasPermission) {
        showMessage('存储权限不足：' + permission.error, 'error');
        return;
      }
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `nice-today-backup-${timestamp}.json`;
      const result = await mobileFileSystem.saveFile(filename, jsonData, 'application/json');
      if (result.success) showMessage(`备份成功！大小: ${backupStatus.total}KB`, 'success');
      else if (result.error !== '已取消保存') showMessage('备份失败: ' + result.error, 'error');
    } catch (error) {
      showMessage('备份失败: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [collectUserData, checkDeviceAndRequestPermission, showMessage, backupStatus.total, isProcessing]);

  const restoreBackup = useCallback(async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const permission = await checkDeviceAndRequestPermission();
      if (!permission.hasPermission) {
        showMessage('存储权限不足：' + permission.error, 'error');
        return;
      }
      const result = await mobileFileSystem.readFile('.json');
      if (result.success) {
        try {
          const data = JSON.parse(result.content);
          if (!data.data || !data.exportTime) {
            showMessage('备份文件格式不正确', 'error');
            return;
          }
          if (data.data.configs?.items) enhancedUserConfigManager.importConfigs(JSON.stringify(data.data.configs.items));
          if (data.data.cache?.items) {
            Object.entries(data.data.cache.items).forEach(([k, v]) => baziCacheManager.cacheBazi(k, v.birthInfo, v.baziInfo));
          }
          showMessage('恢复成功！页面将刷新', 'success');
          setTimeout(() => window.location.reload(), 2000);
        } catch (e) { showMessage('解析失败: ' + e.message, 'error'); }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [checkDeviceAndRequestPermission, showMessage, isProcessing]);

  const clearAllData = useCallback(() => {
    if (window.confirm('确定要清空所有数据吗？不可撤销！')) {
      localStorage.removeItem('userConfigs');
      localStorage.removeItem('baziCache');
      localStorage.removeItem('theme');
      showMessage('已清空，页面刷新中', 'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  }, [showMessage]);

  /**
   * 用户信息视图 (参考图1)
   */
  const UserInfoView = () => {
    if (!currentActiveConfig) return <div className="text-center py-10 opacity-50">暂无用户信息</div>;

    const displayName = currentActiveConfig.realName || currentActiveConfig.nickname || '未命名';
    const avatarText = displayName.charAt(0);
    const score = currentActiveConfig.nameScore?.totalScore;

    const formatLocation = (loc) => {
      if (!loc) return '未设置';
      const parts = [loc.province, loc.city, loc.district].filter(Boolean);
      return parts.join(' ') + (loc.lng ? ` (经: ${parseFloat(loc.lng).toFixed(2)}, 纬: ${parseFloat(loc.lat).toFixed(2)})` : '');
    };

    return (
      <div className="uc-user-panel">
        <div className="uc-user-header">
          <div className="uc-avatar-wrapper">
            <div className="uc-avatar">{avatarText}</div>
          </div>
          <div className="uc-header-info">
            <div className="uc-name-row">
              <span className="uc-user-realname">{displayName}</span>
              {score && <span className="uc-score-tag">{score}分</span>}
            </div>
            <span className="uc-user-nickname">@{currentActiveConfig.nickname || '未设置'}</span>
          </div>
        </div>

        <div className="uc-info-list">
          <div className="uc-info-item">
            <span className="uc-info-label">出生日期</span>
            <span className="uc-info-value">{currentActiveConfig.birthDate || '1991-04-30'}</span>
          </div>
          <div className="uc-info-item">
            <span className="uc-info-label">出生时间</span>
            <span className="uc-info-value">
              {currentActiveConfig.birthTime || '12:30'} ({normalizeShichen(currentActiveConfig.shichen || getShichenSimple(currentActiveConfig.birthTime || '12:30'))})
            </span>
          </div>
          <div className="uc-info-item">
            <span className="uc-info-label">星座</span>
            <span className="uc-info-value">{currentActiveConfig.zodiac || '金牛座'}</span>
          </div>
          <div className="uc-info-item" style={{ borderBottom: 'none' }}>
            <span className="uc-info-label">MBTI类型</span>
            <span className="uc-info-value" style={{ color: '#818cf8', fontWeight: 'bold' }}>{currentActiveConfig.mbti || 'INFJ'}</span>
          </div>
        </div>

        <div className="uc-location-bar">
          <span className="text-blue-400">📍</span>
          <span>{formatLocation(currentActiveConfig.birthLocation)}</span>
        </div>

        <div className="uc-action-grid">
          <button
            className="uc-btn uc-btn-secondary"
            onClick={() => {
              setTempScoringConfigIndex(activeIndex);
              setIsTempScoringOpen(true);
            }}
          >
            <span>🔄</span> 重新评分
          </button>
          <button
            className="uc-btn uc-btn-secondary"
            onClick={() => {
              if (window.confirm('清理缓存将重新计算八字等数据，确定吗？')) {
                enhancedUserConfigManager.clearBaziCache(currentActiveConfig.nickname);
                showMessage('缓存已清理', 'success');
              }
            }}
          >
            <span>🗑️</span> 清理缓存
          </button>
        </div>
      </div>
    );
  };

  /**
   * 配置列表视图 (参考图2)
   */
  const ConfigListView = () => {
    return (
      <div className="uc-config-manager">
        <div className="uc-section-header">
          <h2 className="uc-section-title">配置管理</h2>
          <div className="uc-add-link" onClick={() => { setEditingConfigIndex(-1); setIsEditModalOpen(true); }}>
            <span className="text-xl">+</span> 添加配置
          </div>
        </div>

        <div className="uc-tip-card">
          <div className="uc-tip-icon">ℹ️</div>
          <div className="uc-tip-content">
            管理您的个人信息配置，您可以创建多个配置，并随时切换使用。
          </div>
        </div>

        {configs.map((config, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div key={idx} className={`uc-config-card ${isActive ? 'active' : ''}`}>
              <div className="uc-card-top">
                <div style={{ flex: 1 }}>
                  {isActive && <span className="uc-status-tag">当前使用</span>}
                  <span className="uc-config-nickname">{config.nickname || `配置 ${idx + 1}`}</span>
                </div>
                <div className="uc-card-actions">
                  <div className="uc-icon-btn" onClick={() => { setEditingConfigIndex(idx); setIsEditModalOpen(true); }}>
                    ✏️
                  </div>
                  <div className="uc-icon-btn delete" onClick={(e) => handleDeleteConfig(e, idx)}>
                    🗑️
                  </div>
                </div>
              </div>

              <div className="uc-card-body">
                <div className="uc-card-info-row">
                  <div className="uc-card-info-text">姓名: {config.realName || '-'}</div>
                  <div className="uc-card-info-text">
                    评分: <span className="uc-card-score-value">{config.nameScore?.totalScore || '--'}分</span>
                  </div>
                </div>
              </div>

              <div className="uc-card-sep" />

              <div className="uc-card-bottom">
                <div className="uc-wuxing-tags">
                  <div className="uc-wuxing-tag uc-wuxing-t">天</div>
                  <div className="uc-wuxing-tag uc-wuxing-r">人</div>
                  <div className="uc-wuxing-tag uc-wuxing-d">地</div>
                </div>
                {!isActive ? (
                  <button className="uc-btn-small" onClick={() => handleSetActiveConfig(idx)}>切换使用</button>
                ) : (
                  <button
                    className="uc-btn-small"
                    onClick={() => { setTempScoringConfigIndex(idx); setIsTempScoringOpen(true); }}
                  >
                    重新评分
                  </button>
                )}
              </div>

              {!isActive && config.lastUpdated && (
                <div className="uc-update-time" style={{ marginTop: '12px', textAlign: 'left' }}>
                  最后更新: {config.lastUpdated}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 数据管理视图 (参考图3)
   */
  const DataManagementView = () => {
    return (
      <div className="uc-data-container">
        <h2 className="uc-section-title">数据管理</h2>

        <div className="uc-backup-card" onClick={createJSONBackup}>
          <div className="uc-backup-icon-bg">☁️</div>
          <div className="uc-backup-info">
            <span className="uc-backup-title">全量数据备份</span>
            <span className="uc-backup-subtitle">包含配置、缓存与设置</span>
          </div>
          <div className="uc-arrow">›</div>
        </div>

        <div className="uc-action-grid" style={{ marginTop: '0' }}>
          <button className="uc-btn uc-btn-secondary" onClick={handleExportConfigs} disabled={isProcessing}>
            📤 导出配置
          </button>
          <button className="uc-btn uc-btn-secondary" onClick={handleImportConfigs} disabled={isProcessing}>
            📥 导入配置
          </button>
        </div>

        <div className="uc-action-grid" style={{ marginTop: '0' }}>
          <button className="uc-btn uc-btn-secondary" onClick={restoreBackup} disabled={isProcessing}>
            🔄 恢复备份
          </button>
          <button className="uc-btn uc-btn-secondary" style={{ color: '#ef4444' }} onClick={clearAllData} disabled={isProcessing}>
            ⚠️ 清空数据
          </button>
        </div>

        <div className="uc-tips-panel">
          <div className="uc-tips-header">
            <span className="text-yellow-400">💡</span>
            <h3 className="uc-tips-title">快速操作提示</h3>
          </div>
          <ul className="uc-tip-list">
            <li className="uc-tip-item">全量备份会将应用内所有数据打包存为 JSON 文件。</li>
            <li className="uc-tip-item">导入配置仅会追加配置项，不会覆盖当前数据。</li>
            <li className="uc-tip-item">恢复备份则会完全覆盖当前应用内的所有数据。</li>
            <li className="uc-tip-item">更换设备时，请先执行“全量备份”导出文件。</li>
          </ul>
        </div>
      </div>
    );
  };

  if (contextLoading) return <div className="user-config-manager-container flex justify-center items-center">加载中...</div>;

  return (
    <div className="user-config-manager-container">
      {/* 顶部标签切换 */}
      <div className="uc-tabs">
        <div className={`uc-tab-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>用户信息</div>
        <div className={`uc-tab-item ${activeTab === 'configs' ? 'active' : ''}`} onClick={() => setActiveTab('configs')}>配置管理</div>
        <div className={`uc-tab-item ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>数据管理</div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-900/40 text-red-200' : 'bg-green-900/40 text-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* 视图内容 */}
      {activeTab === 'info' && <UserInfoView />}
      {activeTab === 'configs' && <ConfigListView />}
      {activeTab === 'data' && <DataManagementView />}

      {/* 评分弹窗 */}
      {isTempScoringOpen && (
        <NameScoringModal
          isOpen={isTempScoringOpen}
          onClose={() => { setIsTempScoringOpen(false); setTempScoringConfigIndex(null); }}
          name={configs[tempScoringConfigIndex]?.realName || ''}
          isPersonal={tempScoringConfigIndex !== null}
          onSaveScore={async (score, inputName) => {
            if (tempScoringConfigIndex !== null && score) {
              const totalScore = score.totalScore || (score.tian + score.ren + score.di + score.wai + score.zong);
              const updateData = { nameScore: { ...score, totalScore } };
              if (inputName?.trim() && !configs[tempScoringConfigIndex].realName) {
                updateData.realName = inputName.trim();
              }
              try {
                await enhancedUserConfigManager.updateConfigWithNodeUpdate(tempScoringConfigIndex, updateData);
                showMessage('✅ 评分已更新', 'success');
              } catch (e) {
                showMessage('保存失败:' + e.message, 'error');
              }
            }
          }}
          showMessage={showMessage}
        />
      )}

      {/* 编辑弹窗 */}
      {isEditModalOpen && (
        <ConfigEditModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingConfigIndex(null); }}
          config={editingConfigIndex >= 0 ? configs[editingConfigIndex] : {}}
          index={editingConfigIndex}
          isNew={editingConfigIndex < 0}
          onSave={async (index, data) => {
            try {
              if (index < 0) await enhancedUserConfigManager.addBasicConfig(data);
              else await enhancedUserConfigManager.updateConfigWithNodeUpdate(index, data);
              showMessage('✅ 保存成功', 'success');
              return true;
            } catch (e) {
              showMessage('错误: ' + e.message, 'error');
              return false;
            }
          }}
          showMessage={showMessage}
        />
      )}
    </div>
  );
};

export default UserConfigManager;