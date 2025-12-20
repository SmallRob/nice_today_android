import React, { useState, useEffect } from 'react';
import { userConfigManager } from '../../utils/userConfigManager';
import notificationService from '../../utils/notificationService';

const SettingsLitePage = ({ userInfo, setUserInfo }) => {
  const [formData, setFormData] = useState({
    nickname: userInfo.nickname || '',
    gender: userInfo.gender || 'secret',
    birthDate: userInfo.birthDate || ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  
  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    morningTime: '07:00',
    eveningTime: '21:00',
    permissionGranted: false
  });

  // 加载通知设置
  useEffect(() => {
    const loadNotificationSettings = () => {
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
    };
    
    loadNotificationSettings();
  }, []);

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

  // 处理通知设置变更
  const handleNotificationChange = (field, value) => {
    const newSettings = {
      ...notificationSettings,
      [field]: value
    };
    
    setNotificationSettings(newSettings);
    
    // 更新通知服务设置
    notificationService.updateSettings(newSettings);
  };

  // 请求通知权限
  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationSettings(prev => ({
      ...prev,
      permissionGranted: granted
    }));
    
    if (granted) {
      alert('通知权限已授权！');
    } else {
      alert('通知权限被拒绝，请在浏览器设置中手动开启。');
    }
  };

  // 测试通知
  const handleTestNotification = () => {
    if (!notificationSettings.permissionGranted) {
      alert('请先授权通知权限');
      return;
    }
    
    notificationService.sendNotification(
      '测试通知',
      '这是一个测试通知，确认通知功能正常工作。'
    );
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
      
      {/* 通知设置 */}
      <div className="lite-card">
        <h3>通知设置</h3>
        
        {!notificationSettings.permissionGranted ? (
          <div style={{marginBottom: '15px'}}>
            <p style={{color: '#ff9800', marginBottom: '10px'}}>
              通知权限未授权，需要授权后才能接收提醒
            </p>
            <button 
              className="lite-button" 
              onClick={handleRequestPermission}
              style={{backgroundColor: '#ff9800'}}
            >
              授权通知权限
            </button>
          </div>
        ) : (
          <div style={{marginBottom: '15px'}}>
            <p style={{color: '#4CAF50', marginBottom: '10px'}}>
              ✓ 通知权限已授权
            </p>
            <button 
              className="lite-button" 
              onClick={handleTestNotification}
              style={{backgroundColor: '#2196F3', marginBottom: '10px'}}
            >
              测试通知
            </button>
          </div>
        )}
        
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
          <input
            type="checkbox"
            id="notificationEnabled"
            checked={notificationSettings.enabled}
            onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
            disabled={!notificationSettings.permissionGranted}
            style={{marginRight: '10px'}}
          />
          <label htmlFor="notificationEnabled">启用通知提醒</label>
        </div>
        
        {notificationSettings.enabled && notificationSettings.permissionGranted && (
          <>
            <div style={{marginBottom: '15px'}}>
              <label htmlFor="morningTime" style={{display: 'block', marginBottom: '5px'}}>
                早上提醒时间:
              </label>
              <input
                type="time"
                id="morningTime"
                value={notificationSettings.morningTime}
                onChange={(e) => handleNotificationChange('morningTime', e.target.value)}
                className="lite-input"
                style={{width: '120px'}}
              />
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <label htmlFor="eveningTime" style={{display: 'block', marginBottom: '5px'}}>
                晚上提醒时间:
              </label>
              <input
                type="time"
                id="eveningTime"
                value={notificationSettings.eveningTime}
                onChange={(e) => handleNotificationChange('eveningTime', e.target.value)}
                className="lite-input"
                style={{width: '120px'}}
              />
            </div>
            
            <div style={{fontSize: '14px', color: '#666'}}>
              <p>• 系统会在指定时间推送节律提醒</p>
              <p>• 当节律值达到极值（≤-90或≥90）时，会额外推送预警提醒</p>
            </div>
          </>
        )}
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