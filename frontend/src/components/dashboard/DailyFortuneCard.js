import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useTheme } from '../../context/ThemeContext';
import './DailyFortuneCard.css';

const ZODIAC_LIST = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const DailyFortuneCard = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const [fortuneData, setFortuneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userZodiac, setUserZodiac] = useState('羊');

  // 根据出生日期计算生肖
  useEffect(() => {
    if (currentConfig?.birthDate) {
      const birthDate = new Date(currentConfig.birthDate.replace(/-/g, '/'));
      if (!isNaN(birthDate.getTime())) {
        const birthYear = birthDate.getFullYear();
        if (birthYear && birthYear > 1900 && birthYear < 2100) {
          const calculatedZodiac = ZODIAC_LIST[(birthYear - 4) % 12];
          if (calculatedZodiac) {
            setUserZodiac(calculatedZodiac);
          }
        }
      }
    }
  }, [currentConfig]);

  // 生成确定性运势数据
  const generateFortuneData = useCallback(() => {
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 372;
    const zodiacSeed = userZodiac.charCodeAt(0);

    // 基于确定性算法生成各维度分数 (0-100)
    const baseScore = 60 + ((seed * zodiacSeed) % 35);
    
    const dimensions = [
      { name: '爱情', icon: '💕', color: '#ec4899' },
      { name: '工作', icon: '💼', color: '#f59e0b' },
      { name: '事业', icon: '🚀', color: '#8b5cf6' },
      { name: '健康', icon: '💚', color: '#10b981' }
    ];

    const scores = {};
    let totalScore = 0;

    dimensions.forEach((dim, index) => {
      const variation = ((seed * (index + 1) * zodiacSeed) % 40) - 20;
      const score = Math.max(30, Math.min(98, baseScore + variation));
      scores[dim.name] = score;
      totalScore += score;
    });

    return {
      scores,
      totalScore: Math.round(totalScore / 4),
      date: today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
      zodiac: userZodiac
    };
  }, [userZodiac]);

  useEffect(() => {
    setLoading(true);
    const data = generateFortuneData();
    setFortuneData(data);
    setLoading(false);
  }, [generateFortuneData]);

  // 动态能量球动画
  const EnergyBall = ({ score, color }) => {
    const animationDuration = `${2 + (100 - score) / 50}s`;
    const scale = 0.6 + (score / 100) * 0.4;

    return (
      <div className="energy-ball-container">
        <div 
          className="energy-ball"
          style={{
            '--ball-color': color,
            '--animation-duration': animationDuration,
            '--scale': scale
          }}
        >
          <div className="energy-ball-inner">
            <span className="energy-score">{score}</span>
            <span className="energy-label">总分</span>
          </div>
          <div className="energy-ball-pulse"></div>
          <div className="energy-ball-pulse-2"></div>
        </div>
      </div>
    );
  };

  // 能量进度条
  const EnergyProgressBar = ({ label, score, icon, color }) => {
    const width = `${score}%`;

    return (
      <div className="energy-progress-item">
        <div className="energy-progress-header">
          <div className="energy-progress-label">
            <span className="energy-progress-icon">{icon}</span>
            <span className="energy-progress-name">{label}</span>
          </div>
          <span className="energy-progress-value" style={{ color }}>
            {score}/100
          </span>
        </div>
        <div className="energy-progress-track">
          <div 
            className="energy-progress-fill"
            style={{ 
              width,
              backgroundColor: color,
              background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`
            }}
          >
            <div className="energy-progress-shine"></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !fortuneData) {
    return (
      <div className="daily-fortune-card loading">
        <div className="fortune-header-skeleton"></div>
        <div className="fortune-content-skeleton">
          <div className="fortune-left-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="progress-bar-skeleton"></div>
            ))}
          </div>
          <div className="fortune-right-skeleton"></div>
        </div>
      </div>
    );
  }

  const dimensions = [
    { name: '爱情', icon: '💕', color: '#ec4899', score: fortuneData.scores['爱情'] },
    { name: '工作', icon: '💼', color: '#f59e0b', score: fortuneData.scores['工作'] },
    { name: '事业', icon: '🚀', color: '#8b5cf6', score: fortuneData.scores['事业'] },
    { name: '健康', icon: '💚', color: '#10b981', score: fortuneData.scores['健康'] }
  ];

  return (
    <div className="daily-fortune-card">
      <div className="fortune-header">
        <div className="fortune-title-section">
          <span className="fortune-date">{fortuneData.date}</span>
          <h3 className="fortune-title">今日运势能量</h3>
        </div>
        <div className="fortune-zodiac-badge">
          <span className="zodiac-icon">🐲</span>
          <span className="zodiac-name">{fortuneData.zodiac}</span>
        </div>
      </div>

      <div className="fortune-content">
        {/* 左侧：能量进度条 */}
        <div className="fortune-left">
          <div className="energy-progress-list">
            {dimensions.map((dim) => (
              <EnergyProgressBar
                key={dim.name}
                label={dim.name}
                score={dim.score}
                icon={dim.icon}
                color={dim.color}
              />
            ))}
          </div>
        </div>

        {/* 右侧：能量球 */}
        <div className="fortune-right">
          <EnergyBall 
            score={fortuneData.totalScore} 
            color={theme === 'dark' ? '#6366f1' : '#667eea'} 
          />
        </div>
      </div>
    </div>
  );
};

export default DailyFortuneCard;
