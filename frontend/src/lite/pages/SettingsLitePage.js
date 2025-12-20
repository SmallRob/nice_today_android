import React, { useState, useEffect } from 'react';
import { userConfigManager } from '../../utils/userConfigManager';

const SettingsLitePage = ({ userInfo, setUserInfo }) => {
  const [formData, setFormData] = useState({
    nickname: userInfo.nickname || '',
    gender: userInfo.gender || 'secret',
    birthDate: userInfo.birthDate || ''
  });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setFormData({
      nickname: userInfo.nickname || '',
      gender: userInfo.gender || 'secret',
      birthDate: userInfo.birthDate || ''
    });
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
      // 获取当前配置索引
      const activeIndex = userConfigManager.getActiveConfigIndex();
      
      // 更新配置
      const success = userConfigManager.updateConfig(activeIndex, {
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
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveStatus('error');
    }
  };

  // 切换到完整版
  const switchToFullVersion = () => {
    // 设置版本标记
    localStorage.setItem('appVersion', 'full');
    
    // 重新加载页面以切换到完整版
    window.location.reload();
  };

  // 切换到轻量版
  const switchToLiteVersion = () => {
    // 设置版本标记
    localStorage.setItem('appVersion', 'lite');
    
    // 重新加载页面以切换到轻量版
    window.location.reload();
  };

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
          {saveStatus === 'success' && <p style={{color: 'green'}}>保存成功!</p>}
          {saveStatus === 'error' && <p style={{color: 'red'}}>保存失败，请重试</p>}
        </form>
      </div>
      
      <div className="lite-card">
        <h3>版本切换</h3>
        <p>当前版本: 轻量版</p>
        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            className="lite-button"
            onClick={switchToFullVersion}
            style={{backgroundColor: '#e74c3c', flex: 1}}
          >
            切换到炫彩版
          </button>
          <button 
            className="lite-button"
            onClick={switchToLiteVersion}
            style={{backgroundColor: '#3498db', flex: 1}}
          >
            保持轻量版
          </button>
        </div>
      </div>
      
      <div className="lite-card">
        <h3>关于</h3>
        <p>轻量版 v1.0.0</p>
        <p>专为移动设备优化，提供更流畅的体验</p>
      </div>
      </div>
    </div>
  );
};

export default SettingsLitePage;