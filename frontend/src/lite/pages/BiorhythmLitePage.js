import React, { useState, useEffect, useMemo } from 'react';
import { calculateBiorhythm } from '../utils/biorhythmCalculator';
import { userConfigManager } from '../../utils/userConfigManager';
import '../styles/globalLiteStyles.css';

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

  // 计算生物节律 - 移除了通知检查以提高性能
  useEffect(() => {
    if (userInfo.birthDate) {
      // 使用 useMemo 优化计算性能
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

  // 获取简单的生活提醒 - 使用 useMemo 优化性能
  const lifeTips = useMemo(() => {
    if (!biorhythms) return [];
    
    const tips = [];
    
    // 体力节律提醒
    if (biorhythms.physical > 50) {
      tips.push({ type: '体力', tip: '体力充沛，适合运动锻炼' });
    } else if (biorhythms.physical < -50) {
      tips.push({ type: '体力', tip: '体力较低，注意休息' });
    } else {
      tips.push({ type: '体力', tip: '体力状态平稳，正常活动即可' });
    }
    
    // 情绪节律提醒
    if (biorhythms.emotional > 50) {
      tips.push({ type: '情绪', tip: '情绪积极，适合社交活动' });
    } else if (biorhythms.emotional < -50) {
      tips.push({ type: '情绪', tip: '情绪波动，保持平和心态' });
    } else {
      tips.push({ type: '情绪', tip: '情绪状态平稳，保持日常节奏' });
    }
    
    // 智力节律提醒
    if (biorhythms.intellectual > 50) {
      tips.push({ type: '智力', tip: '思维敏捷，适合学习思考' });
    } else if (biorhythms.intellectual < -50) {
      tips.push({ type: '智力', tip: '注意力下降，避免复杂决策' });
    } else {
      tips.push({ type: '智力', tip: '智力状态平稳，可进行常规工作' });
    }
    
    return tips;
  }, [biorhythms]);

  // 生物节律知识卡片数据
  const biorhythmKnowledge = useMemo(() => [
    {
      type: '体力节律',
      description: '反映了人的体力状况，影响运动能力、耐力和身体活力。',
      cycle: '周期为23天',
      color: '#4CAF50'
    },
    {
      type: '情绪节律',
      description: '反映了人的情绪状态，影响情感表达、创造力和人际交往。',
      cycle: '周期为28天',
      color: '#2196F3'
    },
    {
      type: '智力节律',
      description: '反映了人的思维能力，影响逻辑推理、记忆力和学习效率。',
      cycle: '周期为33天',
      color: '#9C27B0'
    }
  ], []);

  // 获取节律状态说明
  const getBiorhythmStatusDescription = useMemo(() => (value) => {
    if (value > 50) return '极佳状态';
    if (value > 20) return '良好状态';
    if (value > -20) return '普通状态';
    if (value > -50) return '较差状态';
    return '极差状态';
  }, []);

  // 获取节律状态建议
  const getBiorhythmStatusAdvice = useMemo(() => (value) => {
    if (value > 50) return '充分利用此状态，进行挑战性活动';
    if (value > 20) return '正常发挥，保持当前节奏';
    if (value > -20) return '适度活动，避免过度劳累';
    if (value > -50) return '注意休息，减少压力';
    return '充分休息，恢复精力';
  }, []);

  // 获取综合状态
  const overallStatus = useMemo(() => {
    if (!biorhythms) return '';
    
    const avg = (biorhythms.physical + biorhythms.emotional + biorhythms.intellectual) / 3;
    
    if (avg > 30) return '状态良好';
    if (avg > 0) return '状态平稳';
    if (avg > -30) return '状态一般';
    return '状态欠佳';
  }, [biorhythms]);

  // 获取未来7天节律趋势
  const futureTrends = useMemo(() => {
    if (!biorhythms || !userInfo.birthDate) return [];
    
    const trends = [];
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      const futureBiorhythm = calculateBiorhythm(userInfo.birthDate, futureDate);
      
      const trend = {
        day: i === 1 ? '明天' : `${i}天后`,
        date: futureDate.toISOString().split('T')[0],
        physical: getTrendSymbol(biorhythms.physical, futureBiorhythm.physical),
        emotional: getTrendSymbol(biorhythms.emotional, futureBiorhythm.emotional),
        intellectual: getTrendSymbol(biorhythms.intellectual, futureBiorhythm.intellectual)
      };
      
      trends.push(trend);
    }
    
    return trends;
  }, [biorhythms, currentDate, userInfo.birthDate]);

  // 获取趋势符号
  const getTrendSymbol = useMemo(() => (currentValue, futureValue) => {
    const diff = futureValue - currentValue;
    if (diff > 2) return '↑↑';
    if (diff > 0.5) return '↑';
    if (diff < -2) return '↓↓';
    if (diff < -0.5) return '↓';
    return '→';
  }, []);

  // 获取趋势颜色
  const getTrendColor = useMemo(() => (symbol) => {
    if (symbol === '↑↑') return 'trend-up-strong';
    if (symbol === '↑') return 'trend-up';
    if (symbol === '↓↓') return 'trend-down-strong';
    if (symbol === '↓') return 'trend-down';
    return 'trend-stable';
  }, []);

  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">生物节律</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }

  return (
    <div className="lite-page-container">
      <div className="lite-page-header">
        <h2 className="lite-page-title">生物节律</h2>
      </div>
      <div className="lite-biorhythm-page">
      
      <div className="lite-card">
        <h3 className="lite-h3">当前日期: {currentDate.toISOString().split('T')[0]}</h3>
        <div className="date-navigation lite-flex lite-gap-base">
          <button className="lite-button" onClick={() => handleDateChange(-1)}>前一天</button>
          <button className="lite-button" onClick={() => setCurrentDate(new Date())}>今天</button>
          <button className="lite-button" onClick={() => handleDateChange(1)}>后一天</button>
        </div>
      </div>
      
      <div className="lite-card">
        <h3 className="lite-h3">用户信息</h3>
        <p className="lite-text">昵称: {userInfo.nickname || '未设置'}</p>
        <p className="lite-text">出生日期: {userInfo.birthDate}</p>
      </div>
      
      {biorhythms && (
        <>
          <div className="lite-card">
            <h3 className="lite-h3">节律指数</h3>
            
            {/* 体力节律 */}
            <div className="biorhythm-item lite-mb-base">
              <p className="lite-text">
                <span className="lite-text-bold">体力节律:</span> {biorhythms.physical.toFixed(2)} 
                <span className="lite-text-sm">({getBiorhythmStatusDescription(biorhythms.physical)})</span>
              </p>
              <p className="lite-text-sm">建议: {getBiorhythmStatusAdvice(biorhythms.physical)}</p>
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
            
            {/* 情绪节律 */}
            <div className="biorhythm-item lite-mb-base">
              <p className="lite-text">
                <span className="lite-text-bold">情绪节律:</span> {biorhythms.emotional.toFixed(2)} 
                <span className="lite-text-sm">({getBiorhythmStatusDescription(biorhythms.emotional)})</span>
              </p>
              <p className="lite-text-sm">建议: {getBiorhythmStatusAdvice(biorhythms.emotional)}</p>
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
            
            {/* 智力节律 */}
            <div className="biorhythm-item lite-mb-base">
              <p className="lite-text">
                <span className="lite-text-bold">智力节律:</span> {biorhythms.intellectual.toFixed(2)} 
                <span className="lite-text-sm">({getBiorhythmStatusDescription(biorhythms.intellectual)})</span>
              </p>
              <p className="lite-text-sm">建议: {getBiorhythmStatusAdvice(biorhythms.intellectual)}</p>
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
            
            <div className="biorhythm-summary lite-card">
              <p className="lite-text-bold">综合状态: {overallStatus}</p>
            </div>
          </div>
          
          {/* 生物节律知识卡片 */}
          <div className="lite-card knowledge-card">
            <h3 className="knowledge-card-title">生物节律知识</h3>
            <div className="knowledge-grid">
              {biorhythmKnowledge.map((item, index) => (
                <div key={index} className="knowledge-item">
                  <div className="knowledge-header">
                    <span 
                      className="knowledge-type" 
                      style={{ color: item.color }}
                    >
                      {item.type}
                    </span>
                    <span className="knowledge-cycle">{item.cycle}</span>
                  </div>
                  <p className="lite-text-sm knowledge-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {lifeTips.length > 0 && (
            <div className="lite-card">
              <h3 className="lite-h3">今日提醒</h3>
              <ul className="life-tips-list">
                {lifeTips.map((tip, index) => (
                  <li key={index} className="life-tip-item lite-text">
                    <span className="tip-type lite-text-bold">{tip.type}:</span> {tip.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 未来7天节律趋势 */}
          {futureTrends.length > 0 && (
            <div className="lite-card">
              <h3 className="lite-h3">未来7天节律趋势</h3>
              <div className="trend-table">
                <div className="trend-header lite-text-bold">
                  <span>日期</span>
                  <span>体力</span>
                  <span>情绪</span>
                  <span>智力</span>
                </div>
                {futureTrends.map((trend, index) => (
                  <div key={index} className="trend-row">
                    <span className="trend-day">{trend.day}</span>
                    <span className={`trend-value ${getTrendColor(trend.physical)}`}>
                      {trend.physical}
                    </span>
                    <span className={`trend-value ${getTrendColor(trend.emotional)}`}>
                      {trend.emotional}
                    </span>
                    <span className={`trend-value ${getTrendColor(trend.intellectual)}`}>
                      {trend.intellectual}
                    </span>
                  </div>
                ))}
              </div>
              <div className="trend-legend lite-text-sm">
                <span>↑↑: 大幅上升</span>
                <span>↑: 上升</span>
                <span>→: 平稳</span>
                <span>↓: 下降</span>
                <span>↓↓: 大幅下降</span>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default BiorhythmLitePage;