import React, { useState, useEffect } from 'react';
import { liteUserConfigManager } from '../../utils/liteUserConfigManager';
import { useNotification } from '../../context/NotificationContext';
import versionDetector from '../../utils/versionDetector';
import { restartApp } from '../../utils/restartApp';
import versionData from '../../version.json';

const SettingsLitePage = ({ userInfo, setUserInfo }) => {
  const [formData, setFormData] = useState(() => {
    // 直接从全局配置管理器获取当前配置，避免异步加载导致的黑屏
    try {
      const currentConfig = liteUserConfigManager.getCurrentConfig();
      // 确保 config 是有效对象
      const safeConfig = currentConfig && typeof currentConfig === 'object' ? currentConfig : {};

      // 转换时辰格式：如果配置中有 birthTimeShichen，使用它；否则根据 birthTime 推断
      let birthTimeShichen = safeConfig.birthTimeShichen;
      if (!birthTimeShichen && safeConfig.birthTime) {
        const timeToShichenMap = {
          '23:00': '子', '00:00': '子', '00:30': '子',
          '01:00': '丑', '01:30': '丑', '02:00': '丑', '02:30': '丑',
          '03:00': '寅', '03:30': '寅', '04:00': '寅', '04:30': '寅',
          '05:00': '卯', '05:30': '卯', '06:00': '卯', '06:30': '卯',
          '07:00': '辰', '07:30': '辰', '08:00': '辰', '08:30': '辰',
          '09:00': '巳', '09:30': '巳', '10:00': '巳', '10:30': '巳',
          '11:00': '午', '11:30': '午', '12:00': '午', '12:30': '午', '13:00': '午',
          '13:00': '未', '13:30': '未', '14:00': '未', '14:30': '未',
          '15:00': '申', '15:30': '申', '16:00': '申', '16:30': '申',
          '17:00': '酉', '17:30': '酉', '18:00': '酉', '18:30': '酉',
          '19:00': '戌', '19:30': '戌', '20:00': '戌', '20:30': '戌',
          '21:00': '亥', '21:30': '亥', '22:00': '亥', '22:30': '亥'
        };
        birthTimeShichen = timeToShichenMap[safeConfig.birthTime] || '午';
      }

      return {
        nickname: (safeConfig.nickname || '').toString(),
        gender: (safeConfig.gender || 'secret').toString(),
        birthDate: (safeConfig.birthDate || '').toString(),
        birthTime: birthTimeShichen || '午'
      };
    } catch (error) {
      console.error('获取配置失败，使用默认值:', error);
      return {
        nickname: '',
        gender: 'secret',
        birthDate: '',
        birthTime: '午'
      };
    }
  });

  const [saveStatus, setSaveStatus] = useState('');
  const { showNotification } = useNotification();

  // 同步更新表单数据（当userInfo prop更新时）
  useEffect(() => {
    if (userInfo && typeof userInfo === 'object') {
      // 确保 userInfo 是有效对象
      const safeUserInfo = userInfo;

      // 转换时辰格式
      let birthTimeShichen = safeUserInfo.birthTime;
      if (typeof birthTimeShichen === 'string' && birthTimeShichen.includes(':')) {
        // 如果是时间格式，转换为时辰
        const timeToShichenMap = {
          '23:00': '子', '00:00': '子', '00:30': '子',
          '01:00': '丑', '01:30': '丑', '02:00': '丑', '02:30': '丑',
          '03:00': '寅', '03:30': '寅', '04:00': '寅', '04:30': '寅',
          '05:00': '卯', '05:30': '卯', '06:00': '卯', '06:30': '卯',
          '07:00': '辰', '07:30': '辰', '08:00': '辰', '08:30': '辰',
          '09:00': '巳', '09:30': '巳', '10:00': '巳', '10:30': '巳',
          '11:00': '午', '11:30': '午', '12:00': '午', '12:30': '午', '13:00': '午',
          '13:00': '未', '13:30': '未', '14:00': '未', '14:30': '未',
          '15:00': '申', '15:30': '申', '16:00': '申', '16:30': '申',
          '17:00': '酉', '17:30': '酉', '18:00': '酉', '18:30': '酉',
          '19:00': '戌', '19:30': '戌', '20:00': '戌', '20:30': '戌',
          '21:00': '亥', '21:30': '亥', '22:00': '亥', '22:30': '亥'
        };
        birthTimeShichen = timeToShichenMap[birthTimeShichen] || '午';
      } else if (!birthTimeShichen) {
        birthTimeShichen = '午';
      }

      setFormData({
        nickname: (safeUserInfo.nickname || '').toString(),
        gender: (safeUserInfo.gender || 'secret').toString(),
        birthDate: (safeUserInfo.birthDate || '').toString(),
        birthTime: birthTimeShichen
      });
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
      // 转换时辰为标准时间格式
      const shichenToTimeMap = {
        '子': '00:00',
        '丑': '01:00',
        '寅': '03:00',
        '卯': '05:00',
        '辰': '07:00',
        '巳': '09:00',
        '午': '12:30',
        '未': '13:00',
        '申': '15:00',
        '酉': '17:00',
        '戌': '19:00',
        '亥': '21:00'
      };

      const birthTime = formData.birthTime || '午';
      const birthTimeStandard = shichenToTimeMap[birthTime] || '12:30';

      // 直接更新配置（确保配置管理器已初始化）
      const success = liteUserConfigManager.updateCurrentConfig({
        nickname: formData.nickname,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: birthTimeStandard,
        birthTimeShichen: birthTime  // 保存时辰信息
      });

      if (success) {
        // 更新父组件状态
        setUserInfo({
          nickname: formData.nickname,
          gender: formData.gender,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime
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

            <div>
              <label htmlFor="birthTime">出生时辰:</label>
              <select
                id="birthTime"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                className="lite-input"
              >
                <option value="">未知</option>
                <option value="子">子时 (23:00-01:00)</option>
                <option value="丑">丑时 (01:00-03:00)</option>
                <option value="寅">寅时 (03:00-05:00)</option>
                <option value="卯">卯时 (05:00-07:00)</option>
                <option value="辰">辰时 (07:00-09:00)</option>
                <option value="巳">巳时 (09:00-11:00)</option>
                <option value="午">午时 (11:00-13:00)</option>
                <option value="未">未时 (13:00-15:00)</option>
                <option value="申">申时 (15:00-17:00)</option>
                <option value="酉">酉时 (17:00-19:00)</option>
                <option value="戌">戌时 (19:00-21:00)</option>
                <option value="亥">亥时 (21:00-23:00)</option>
              </select>
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