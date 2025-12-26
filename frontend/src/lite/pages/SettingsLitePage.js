import React, { useState, useEffect } from 'react';
import { liteUserConfigManager } from '../../utils/liteUserConfigManager';
import { useNotification } from '../../context/NotificationContext';
import versionDetector from '../../utils/versionDetector';
import { restartApp } from '../../utils/restartApp';
import versionData from '../../version.json';

const SettingsLitePage = ({ userInfo, setUserInfo }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    gender: 'secret',
    birthDate: ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { showNotification } = useNotification();

  // 初始化表单数据
  useEffect(() => {
    try {
      if (userInfo && userInfo.nickname) {
        setFormData({
          nickname: userInfo.nickname || '',
          gender: userInfo.gender || 'secret',
          birthDate: userInfo.birthDate || ''
        });
      } else {
        // 如果没有用户信息，使用默认值
        setFormData({
          nickname: '',
          gender: 'secret',
          birthDate: ''
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('设置页面数据加载失败:', error);
      setLoadError(error);
      setIsLoading(false);
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');

    try {
      // 确保配置管理器已初始化
      if (!liteUserConfigManager.initialized) {
        await liteUserConfigManager.initialize();
      }

      // 更新轻量版配置
      const success = liteUserConfigManager.updateCurrentConfig({
        nickname: formData.nickname,
        gender: formData.gender,
        birthDate: formData.birthDate
      });

      if (success) {
        // 更新父组件状态
        setUserInfo({
          nickname: formData.nickname,
          gender: formData.gender,
          birthDate: formData.birthDate
        });

        setSaveStatus('success');
        showNotification({
          type: 'success',
          title: '保存成功',
          message: '用户信息已更新',
          duration: 3000
        });
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        showNotification({
          type: 'error',
          title: '保存失败',
          message: '保存用户信息时出错，请重试',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveStatus('error');
      showNotification({
        type: 'error',
        title: '保存失败',
        message: error.message || '保存用户信息时出错',
        duration: 3000
      });
    }
  };

  // 切换到完整版
  const switchToFullVersion = () => {
    showNotification({
      type: 'warning',
      title: '版本切换确认',
      message: '确定要切换到炫彩版吗？建议重启应用以加载完整功能。',
      actions: [
        {
          label: '立即重启',
          primary: true,
          onClick: () => {
            versionDetector.switchVersion('full');
            restartApp();
          }
        },
        {
          label: '取消',
          onClick: () => {
            
            // // 设置版本标记
            // localStorage.setItem('appVersion', 'full');
            // // 重新加载页面以切换到完整版
            // window.location.reload();
          }
        }
      ]
    });
  };

  // 切换到轻量版
  const switchToLiteVersion = () => {
    showNotification({
      type: 'info',
      title: '提示',
      message: '您当前已处于轻量版。',
      duration: 3000
    });
  };

  // 加载错误处理
  if (loadError) {
    return (
      <div className="lite-page-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '16px' }}>设置页面加载失败</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            加载用户配置时发生错误
          </p>
          <button
            onClick={() => window.location.href = '/lite'}
            className="lite-button"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="lite-page-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#666' }}>正在加载设置...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lite-page-container">
      <div className="lite-page-header">
        <h2 className="lite-page-title">设置</h2>
      </div>
      <div className="lite-settings-page">

        <div className="lite-card">
          <h3>用户信息</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nickname">昵称:</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="lite-input"
                placeholder="请输入昵称"
              />
            </div>

            <div>
              <label htmlFor="gender">性别:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="lite-input"
              >
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="secret">保密</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthDate">出生日期:</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="lite-input"
              />
            </div>

            <button type="submit" className="lite-button">
              保存信息
            </button>

            {saveStatus === 'saving' && <p>保存中...</p>}
            {saveStatus === 'success' && <p style={{ color: 'green' }}>保存成功!</p>}
            {saveStatus === 'error' && <p style={{ color: 'red' }}>保存失败，请重试</p>}
          </form>
        </div>

        <div className="lite-card">
          <h3>版本切换</h3>
          <p>当前版本: 轻量版</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="lite-button"
              onClick={switchToFullVersion}
              style={{ backgroundColor: '#e74c3c', flex: 1 }}
            >
              切换到炫彩版
            </button>
            <button
              className="lite-button"
              onClick={switchToLiteVersion}
              style={{ backgroundColor: '#3498db', flex: 1 }}
            >
              保持轻量版
            </button>
          </div>
        </div>

        <div className="lite-card">
          <h3>关于</h3>
          <p>轻量版 v{versionData.versionName}</p>
          <p>专为移动设备优化，提供更流畅的体验</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsLitePage;