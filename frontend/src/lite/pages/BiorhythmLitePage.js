import React, { useState, useEffect } from 'react';
import { calculateBiorhythm } from '../utils/biorhythmCalculator';
import { userConfigManager } from '../../utils/userConfigManager';

const BiorhythmLitePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [biorhythms, setBiorhythms] = useState(null);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: ''
  });

  // 直接从用户配置管理器读取配置
  useEffect(() => {
    const loadUserInfo = async () => {
      // 确保配置管理器已初始化
      if (!userConfigManager.initialized) {
        await userConfigManager.initialize();
      }
      
      // 获取当前配置
      const currentConfig = userConfigManager.getCurrentConfig();
      if (currentConfig) {
        setUserInfo({
          nickname: currentConfig.nickname || '',
          birthDate: currentConfig.birthDate || ''
        });
      }
    };
    
    loadUserInfo();
  }, []);

  // 计算生物节律
  useEffect(() => {
    if (userInfo.birthDate) {
      const calculated = calculateBiorhythm(userInfo.birthDate, currentDate);
      setBiorhythms(calculated);
    }
  }, [userInfo.birthDate, currentDate]);

  // 添加配置变更监听器
  useEffect(() => {
    const removeListener = userConfigManager.addListener((configData) => {
      if (configData.currentConfig) {
        setUserInfo({
          nickname: configData.currentConfig.nickname || '',
          birthDate: configData.currentConfig.birthDate || ''
        });
      }
    });
    
    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // 获取简单的生活提醒
  const getSimpleLifeTips = (biorhythms) => {
    if (!biorhythms) return [];
    
    const tips = [];
    
    // 体力节律提醒
    if (biorhythms.physical > 50) {
      tips.push({ type: '体力', tip: '体力充沛，适合运动锻炼' });
    } else if (biorhythms.physical < -50) {
      tips.push({ type: '体力', tip: '体力较低，注意休息' });
    }
    
    // 情绪节律提醒
    if (biorhythms.emotional > 50) {
      tips.push({ type: '情绪', tip: '情绪积极，适合社交活动' });
    } else if (biorhythms.emotional < -50) {
      tips.push({ type: '情绪', tip: '情绪波动，保持平和心态' });
    }
    
    // 智力节律提醒
    if (biorhythms.intellectual > 50) {
      tips.push({ type: '智力', tip: '思维敏捷，适合学习思考' });
    } else if (biorhythms.intellectual < -50) {
      tips.push({ type: '智力', tip: '注意力下降，避免复杂决策' });
    }
    
    return tips;
  };

  // 获取综合状态
  const getOverallStatus = (biorhythms) => {
    if (!biorhythms) return '';
    
    const avg = (biorhythms.physical + biorhythms.emotional + biorhythms.intellectual) / 3;
    
    if (avg > 30) return '状态良好';
    if (avg > 0) return '状态平稳';
    if (avg > -30) return '状态一般';
    return '状态欠佳';
  };

  const lifeTips = getSimpleLifeTips(biorhythms);
  const overallStatus = getOverallStatus(biorhythms);

  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">生物节律</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }

  return (
    <div className="lite-biorhythm-page">
      <h2 className="lite-page-title">生物节律</h2>
      
      <div className="lite-card">
        <h3>用户信息</h3>
        <p>昵称: {userInfo.nickname || '未设置'}</p>
        <p>出生日期: {userInfo.birthDate}</p>
      </div>
      
      <div className="lite-card">
        <h3>当前日期: {currentDate.toISOString().split('T')[0]}</h3>
        <div className="date-navigation">
          <button onClick={() => handleDateChange(-1)}>前一天</button>
          <button onClick={() => setCurrentDate(new Date())}>今天</button>
          <button onClick={() => handleDateChange(1)}>后一天</button>
        </div>
      </div>
      
      {biorhythms && (
        <>
          <div className="lite-card">
            <h3>节律指数</h3>
            <div className="biorhythm-item">
              <p>体力节律: {biorhythms.physical.toFixed(2)}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.abs(biorhythms.physical)}%`,
                    backgroundColor: biorhythms.physical >= 0 ? '#4CAF50' : '#F44336'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="biorhythm-item">
              <p>情绪节律: {biorhythms.emotional.toFixed(2)}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.abs(biorhythms.emotional)}%`,
                    backgroundColor: biorhythms.emotional >= 0 ? '#2196F3' : '#FF9800'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="biorhythm-item">
              <p>智力节律: {biorhythms.intellectual.toFixed(2)}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.abs(biorhythms.intellectual)}%`,
                    backgroundColor: biorhythms.intellectual >= 0 ? '#9C27B0' : '#795548'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="biorhythm-summary">
              <p>综合状态: {overallStatus}</p>
            </div>
          </div>
          
          {lifeTips.length > 0 && (
            <div className="lite-card">
              <h3>今日提醒</h3>
              <ul className="life-tips-list">
                {lifeTips.map((tip, index) => (
                  <li key={index} className="life-tip-item">
                    <span className="tip-type">{tip.type}:</span> {tip.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BiorhythmLitePage;