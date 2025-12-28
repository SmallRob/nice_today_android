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

  // 圆形水波效果
  const WaterFlask = ({ score }) => {
    const waterLevel = Math.max(10, Math.min(90, score));

    // 根据分数选择颜色主题
    const getColorTheme = (s) => {
      if (s >= 85) return ['#22c55e', '#3b82f6', '#8b5cf6']; // 绿-蓝-紫
      if (s >= 70) return ['#06b6d4', '#3b82f6', '#6366f1']; // 青绿-蓝-靛蓝
      if (s >= 55) return ['#f59e0b', '#8b5cf6', '#ec4899']; // 橙-紫-粉
      if (s >= 40) return ['#eab308', '#f59e0b', '#ef4444']; // 黄-橙-红
      return ['#64748b', '#64748b', '#94a3b8']; // 灰色系
    };

    const colors = getColorTheme(score);
    const radius = 60;
    const waterHeight = radius * 2 * (waterLevel / 100);
    const waterY = radius * 2 - waterHeight;

    return (
      <div className="water-flask-container">
        <svg
          className="water-flask-svg"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 水面渐变 */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.9" />
              <stop offset="50%" stopColor={colors[1]} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors[2]} stopOpacity="0.5" />
            </linearGradient>

            {/* 玻璃球渐变 */}
            <radialGradient id="glassGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'} />
              <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)'} />
            </radialGradient>

            {/* 气泡动画 */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" in2="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 剪切圆形 */}
            <clipPath id="circleClip">
              <circle cx={radius} cy={radius} r={radius - 2} />
            </clipPath>
          </defs>

          {/* 玻璃球外圈 */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="url(#glassGradient)"
            stroke={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
            strokeWidth="3"
          />

          {/* 玻璃球高光 */}
          <ellipse
            cx={radius - 18}
            cy={radius - 18}
            rx={15}
            ry={8}
            fill={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'}
            opacity="0.7"
            transform="rotate(-45, {radius - 18}, {radius - 18})"
          />

          {/* 水体（带剪切） */}
          <g clipPath="url(#circleClip)">
            {/* 水体背景 */}
            <rect
              x="0"
              y={waterY}
              width={radius * 2}
              height={radius * 2 - waterY}
              fill="url(#waterGradient)"
              filter="url(#glow)"
            />

            {/* 水波动画 - 第一层 */}
            <path
              d={`M 0 ${waterY}
                 Q ${radius} ${waterY + 15} ${radius * 2} ${waterY}
                 L ${radius * 2} ${radius * 2}
                 L 0 ${radius * 2}
                 Z`}
              fill={colors[0]}
              fillOpacity="0.6"
            >
              <animate
                attributeName="d"
                dur="3s"
                repeatCount="indefinite"
                values={`
                  M 0 ${waterY} Q ${radius} ${waterY + 15} ${radius * 2} ${waterY} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY} Q ${radius} ${waterY - 15} ${radius * 2} ${waterY} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY} Q ${radius} ${waterY + 15} ${radius * 2} ${waterY} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z
                `}
              />
            </path>

            {/* 水波动画 - 第二层 */}
            <path
              d={`M 0 ${waterY + 10}
                 Q ${radius} ${waterY + 25} ${radius * 2} ${waterY + 10}
                 L ${radius * 2} ${radius * 2}
                 L 0 ${radius * 2}
                 Z`}
              fill={colors[1]}
              fillOpacity="0.4"
            >
              <animate
                attributeName="d"
                dur="4s"
                repeatCount="indefinite"
                values={`
                  M 0 ${waterY + 10} Q ${radius} ${waterY + 25} ${radius * 2} ${waterY + 10} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY + 10} Q ${radius} ${waterY - 5} ${radius * 2} ${waterY + 10} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY + 10} Q ${radius} ${waterY + 25} ${radius * 2} ${waterY + 10} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z
                `}
              />
            </path>

            {/* 水波动画 - 第三层 */}
            <path
              d={`M 0 ${waterY + 20}
                 Q ${radius} ${waterY + 35} ${radius * 2} ${waterY + 20}
                 L ${radius * 2} ${radius * 2}
                 L 0 ${radius * 2}
                 Z`}
              fill={colors[2]}
              fillOpacity="0.3"
            >
              <animate
                attributeName="d"
                dur="5s"
                repeatCount="indefinite"
                values={`
                  M 0 ${waterY + 20} Q ${radius} ${waterY + 35} ${radius * 2} ${waterY + 20} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY + 20} Q ${radius} ${waterY + 5} ${radius * 2} ${waterY + 20} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z;
                  M 0 ${waterY + 20} Q ${radius} ${waterY + 35} ${radius * 2} ${waterY + 20} L ${radius * 2} ${radius * 2} L 0 ${radius * 2} Z
                `}
              />
            </path>
          </g>

          {/* 分数显示 */}
          <text
            x={radius}
            y={radius + 3}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={theme === 'dark' ? '#ffffff' : '#1f2937'}
            fontSize="24"
            fontWeight="bold"
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
          >
            {score}
          </text>

          <text
            x={radius}
            y={radius + 24}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize="9"
            fontWeight="600"
          >
            综合能量
          </text>
        </svg>

        {/* 气泡效果 */}
        <div className="bubbles">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                left: `${20 + Math.random() * 60}%`,
                bottom: `${10 + waterLevel * 0.7}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + Math.random() * 1.5}s`,
                backgroundColor: colors[i % 3],
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`
              }}
            />
          ))}
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

        {/* 右侧：水罐能量 */}
        <div className="fortune-right">
          <WaterFlask
            score={fortuneData.totalScore}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyFortuneCard;
