import React, { useState, useEffect } from 'react';
import { calculateBiorhythm } from '../utils/biorhythmCalculator';
import { userConfigManager } from '../../utils/userConfigManager';
import '../styles/globalLiteStyles.css';

const BiorhythmLitePage = ({ userInfo: propsUserInfo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [biorhythms, setBiorhythms] = useState(null);
  const [userInfo, setUserInfo] = useState({
    nickname: propsUserInfo?.nickname || '',
    birthDate: propsUserInfo?.birthDate || ''
  });

  // 直接从用户配置管理器读取配置
  // 响应 props 更新
  useEffect(() => {
    if (propsUserInfo) {
      setUserInfo({
        nickname: propsUserInfo.nickname || '',
        birthDate: propsUserInfo.birthDate || ''
      });
    }
  }, [propsUserInfo]);

  // 初始化和监听配置更新
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!userInfo.birthDate) {
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }
        const currentConfig = userConfigManager.getCurrentConfig();
        if (currentConfig) {
          setUserInfo({
            nickname: currentConfig.nickname || '',
            birthDate: currentConfig.birthDate || ''
          });
        }
      }
    };

    loadUserInfo();
  }, [userInfo.birthDate]);

  // 计算生物节律 - 简化计算逻辑
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
  const getLifeTips = () => {
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
  };

  // 生物节律知识卡片数据
  const biorhythmKnowledge = [
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
  ];

  // 获取节律状态说明
  const getBiorhythmStatusDescription = (value) => {
    if (value > 50) return '极佳状态';
    if (value > 20) return '良好状态';
    if (value > -20) return '普通状态';
    if (value > -50) return '较差状态';
    return '极差状态';
  };

  // 获取节律状态建议
  const getBiorhythmStatusAdvice = (value) => {
    if (value > 50) return '充分利用此状态，进行挑战性活动';
    if (value > 20) return '正常发挥，保持当前节奏';
    if (value > -20) return '适度活动，避免过度劳累';
    if (value > -50) return '注意休息，减少压力';
    return '充分休息，恢复精力';
  };

  // 获取综合状态
  const getOverallStatus = () => {
    if (!biorhythms) return '';

    const avg = (biorhythms.physical + biorhythms.emotional + biorhythms.intellectual) / 3;

    if (avg > 30) return '状态良好';
    if (avg > 0) return '状态平稳';
    if (avg > -30) return '状态一般';
    return '状态欠佳';
  };

  // 获取未来7天节律趋势
  const getFutureTrends = () => {
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
  };

  // 获取趋势符号
  const getTrendSymbol = (currentValue, futureValue) => {
    const diff = futureValue - currentValue;
    if (diff > 2) return '↑↑';
    if (diff > 0.5) return '↑';
    if (diff < -2) return '↓↓';
    if (diff < -0.5) return '↓';
    return '→';
  };

  // 获取趋势颜色
  const getTrendColor = (symbol) => {
    if (symbol === '↑↑') return 'trend-up-strong';
    if (symbol === '↑') return 'trend-up';
    if (symbol === '↓↓') return 'trend-down-strong';
    if (symbol === '↓') return 'trend-down';
    return 'trend-stable';
  };

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
          <div className="lite-flex lite-justify-between lite-items-center">
            <h3 className="lite-h3" style={{ margin: 0 }}>当前日期</h3>
            <span className="lite-text-bold" style={{ fontSize: '18px' }}>{currentDate.toISOString().split('T')[0]}</span>
          </div>
          <div className="date-navigation lite-flex lite-gap-base lite-mt-base">
            <button className="lite-button" style={{ flex: 1 }} onClick={() => handleDateChange(-1)}>前一天</button>
            <button className="lite-button" style={{ flex: 1 }} onClick={() => setCurrentDate(new Date())}>今天</button>
            <button className="lite-button" style={{ flex: 1 }} onClick={() => handleDateChange(1)}>后一天</button>
          </div>
        </div>

        <div className="lite-card">
          <div className="lite-flex lite-justify-between lite-items-center">
            <div>
              <h3 className="lite-h3" style={{ margin: 0 }}>用户信息</h3>
              <p className="lite-text-sm lite-mb-0">{userInfo.nickname || '未设置'} | {userInfo.birthDate}</p>
            </div>
            <div className="lite-text-center" style={{ padding: '8px 12px', background: 'var(--text-primary)', color: 'var(--bg-color)', borderRadius: '4px' }}>
              <div className="lite-text-sm" style={{ fontWeight: 700 }}>{getOverallStatus()}</div>
            </div>
          </div>
        </div>

        {biorhythms && (
          <>
            <div className="lite-card">
              <h3 className="lite-h3">节律指数</h3>

              {/* 体力节律 */}
              <div className="biorhythm-item lite-mb-base" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div className="lite-flex lite-justify-between lite-items-center lite-mb-0">
                  <span className="lite-text-bold" style={{ color: '#4CAF50' }}>体力节律</span>
                  <span className="lite-text-lg lite-text-bold">{biorhythms.physical.toFixed(1)}%</span>
                </div>
                <div className="lite-text-sm lite-mb-base" style={{ color: 'var(--text-secondary)' }}>{getBiorhythmStatusDescription(biorhythms.physical)}</div>
                <div className="progress-bar" style={{ height: '6px', background: '#222' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.abs(biorhythms.physical)}%`,
                      backgroundColor: '#4CAF50',
                      boxShadow: '0 0 10px rgba(76, 175, 80, 0.4)'
                    }}
                  ></div>
                </div>
                <p className="lite-text-sm lite-mt-base" style={{ fontSize: '12px', margin: '8px 0 0' }}>💡 {getBiorhythmStatusAdvice(biorhythms.physical)}</p>
              </div>

              {/* 情绪节律 */}
              <div className="biorhythm-item lite-mb-base" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div className="lite-flex lite-justify-between lite-items-center lite-mb-0">
                  <span className="lite-text-bold" style={{ color: '#2196F3' }}>情绪节律</span>
                  <span className="lite-text-lg lite-text-bold">{biorhythms.emotional.toFixed(1)}%</span>
                </div>
                <div className="lite-text-sm lite-mb-base" style={{ color: 'var(--text-secondary)' }}>{getBiorhythmStatusDescription(biorhythms.emotional)}</div>
                <div className="progress-bar" style={{ height: '6px', background: '#222' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.abs(biorhythms.emotional)}%`,
                      backgroundColor: '#2196F3',
                      boxShadow: '0 0 10px rgba(33, 150, 243, 0.4)'
                    }}
                  ></div>
                </div>
                <p className="lite-text-sm lite-mt-base" style={{ fontSize: '12px', margin: '8px 0 0' }}>💡 {getBiorhythmStatusAdvice(biorhythms.emotional)}</p>
              </div>

              {/* 智力节律 */}
              <div className="biorhythm-item lite-mb-base" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div className="lite-flex lite-justify-between lite-items-center lite-mb-0">
                  <span className="lite-text-bold" style={{ color: '#9C27B0' }}>智力节律</span>
                  <span className="lite-text-lg lite-text-bold">{biorhythms.intellectual.toFixed(1)}%</span>
                </div>
                <div className="lite-text-sm lite-mb-base" style={{ color: 'var(--text-secondary)' }}>{getBiorhythmStatusDescription(biorhythms.intellectual)}</div>
                <div className="progress-bar" style={{ height: '6px', background: '#222' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.abs(biorhythms.intellectual)}%`,
                      backgroundColor: '#9C27B0',
                      boxShadow: '0 0 10px rgba(156, 39, 176, 0.4)'
                    }}
                  ></div>
                </div>
                <p className="lite-text-sm lite-mt-base" style={{ fontSize: '12px', margin: '8px 0 0' }}>💡 {getBiorhythmStatusAdvice(biorhythms.intellectual)}</p>
              </div>
            </div>

            {/* 今日提醒 */}
            {getLifeTips().length > 0 && (
              <div className="lite-card" style={{ borderLeft: '4px solid var(--text-primary)' }}>
                <h3 className="lite-h3" style={{ border: 'none', padding: 0 }}>今日建议</h3>
                <div className="life-tips-list">
                  {getLifeTips().map((tip, index) => (
                    <div key={index} className="life-tip-item lite-text-sm lite-mt-base" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: tip.type === '体力' ? '#4CAF50' : tip.type === '情绪' ? '#2196F3' : '#9C27B0' }}>•</span>
                      <span><span className="lite-text-bold">{tip.type}:</span> {tip.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 未来趋势 */}
            <div className="lite-card">
              <h3 className="lite-h3">未来7天趋势</h3>
              <div className="trend-table">
                <div className="trend-header lite-text-bold" style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  <span>日期</span>
                  <span style={{ textAlign: 'center' }}>体力</span>
                  <span style={{ textAlign: 'center' }}>情绪</span>
                  <span style={{ textAlign: 'center' }}>智力</span>
                </div>
                {getFutureTrends().map((trend, index) => (
                  <div key={index} className="trend-row" style={{ alignItems: 'center' }}>
                    <span className="trend-day">{trend.day}</span>
                    <span className={`trend-value ${getTrendColor(trend.physical)}`} style={{ textAlign: 'center' }}>
                      {trend.physical}
                    </span>
                    <span className={`trend-value ${getTrendColor(trend.emotional)}`} style={{ textAlign: 'center' }}>
                      {trend.emotional}
                    </span>
                    <span className={`trend-value ${getTrendColor(trend.intellectual)}`} style={{ textAlign: 'center' }}>
                      {trend.intellectual}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 知识广角 */}
            <div className="lite-card knowledge-card">
              <h3 className="knowledge-card-title">节律小知识</h3>
              <div className="knowledge-grid">
                {biorhythmKnowledge.map((item, index) => (
                  <div key={index} className="knowledge-item" style={{ borderLeft: `4px solid ${item.color}`, background: 'rgba(255,255,255,0.03)' }}>
                    <div className="knowledge-header">
                      <span className="knowledge-type" style={{ color: item.color }}>{item.type}</span>
                      <span className="knowledge-cycle" style={{ backgroundColor: item.color, color: '#fff' }}>{item.cycle}</span>
                    </div>
                    <p className="lite-text-sm knowledge-description" style={{ opacity: 0.8 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BiorhythmLitePage;