import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useTheme } from '../../context/ThemeContext';
import LunarCalendar from '../../utils/lunarCalendar';
import './DailyFortuneCard.css';

const ZODIAC_LIST = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 每日禁忌数据生成器
const generateDailyTaboo = (lunarDay) => {
  const day = lunarDay;
  const beneficial = [
    '打扫', '沐浴', '出行', '会友', '读书', '运动', '购物', '理财',
    '工作', '学习', '娱乐', '休息', '锻炼', '烹饪', '整理', '思考'
  ];
  const avoid = [
    '出行', '动土', '婚嫁', '开张', '搬家', '动土', '借贷', '投资',
    '远行', '签约', '争斗', '争吵', '决策', '饮酒', '熬夜', '操劳'
  ];

  // 基于农历日期生成确定性结果
  const benIndex = (day * 7) % beneficial.length;
  const avoidIndex = (day * 13) % avoid.length;

  return {
    beneficial: beneficial[benIndex],
    avoid: avoid[avoidIndex]
  };
};

const DailyFortuneCard = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const [fortuneData, setFortuneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userZodiac, setUserZodiac] = useState('羊');
  const [lunarData, setLunarData] = useState(null);
  const [dailyTaboo, setDailyTaboo] = useState(null);

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

    // 生成运势数据
    const data = generateFortuneData();
    setFortuneData(data);

    // 计算农历数据
    const today = new Date();
    const lunarInfo = LunarCalendar.solarToLunar(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    setLunarData(lunarInfo);

    // 生成每日禁忌
    const taboo = generateDailyTaboo(lunarInfo.lunarDay);
    setDailyTaboo(taboo);

    setLoading(false);
  }, [generateFortuneData]);

  // 能量球展示效果
  const WaterFlask = ({ score }) => {
    const waterLevel = Math.max(15, Math.min(85, score));

    const getColorTheme = (s) => {
      if (s >= 85) return ['#4ade80', '#22c55e', '#166534']; // 卓越
      if (s >= 70) return ['#60a5fa', '#3b82f6', '#1e40af']; // 良好
      if (s >= 55) return ['#fbbf24', '#f59e0b', '#92400e']; // 一般
      if (s >= 40) return ['#f87171', '#ef4444', '#991b1b']; // 欠佳
      return ['#94a3b8', '#64748b', '#334155']; // 极低
    };

    const colors = getColorTheme(score);
    const radius = 60;
    const waterY = radius * 2 - (radius * 2 * (waterLevel / 100));

    return (
      <div className="energy-ball-container">
        <svg className="energy-ball-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* 核心发光 */}
            <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
            </radialGradient>

            {/* 发光滤镜 */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 边框/边沿渐变 */}
            <linearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)'} />
              <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} />
            </linearGradient>

            {/* 水面渐变 */}
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.95" />
              <stop offset="100%" stopColor={colors[2]} stopOpacity="0.8" />
            </linearGradient>

            {/* 玻璃质感 */}
            <radialGradient id="glassReflect" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <clipPath id="ballClip">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>

          {/* 基础容器与背景微光 */}
          <circle cx="60" cy="60" r="58" fill={theme === 'dark' ? '#111827' : '#f9fafb'} />
          <circle cx="60" cy="60" r="58" fill={colors[1]} opacity="0.05" />

          {/* 外溢发光环 */}
          <circle cx="60" cy="60" r="57" fill="none" stroke={colors[0]} strokeWidth="1" opacity="0.3" filter="url(#softGlow)" />

          {/* 渐变玻璃边沿 */}
          <circle cx="60" cy="60" r="57" fill="none" stroke="url(#rimGradient)" strokeWidth="1.5" opacity="0.8" />

          {/* 液体填充 */}
          <g clipPath="url(#ballClip)">
            <rect x="0" y={waterY} width="120" height="120" fill="url(#liquidGradient)" />

            {/* 动态波动 - 层1 */}
            <path fill={colors[0]} fillOpacity="0.4">
              <animate attributeName="d" dur="4s" repeatCount="indefinite"
                values={`
                  M0,${waterY} C30,${waterY - 10} 90,${waterY + 10} 120,${waterY} V120 H0 Z;
                  M0,${waterY} C30,${waterY + 10} 90,${waterY - 10} 120,${waterY} V120 H0 Z;
                  M0,${waterY} C30,${waterY - 10} 90,${waterY + 10} 120,${waterY} V120 H0 Z
                `}
              />
            </path>

            {/* 动态波动 - 层2 */}
            <path fill={colors[1]} fillOpacity="0.3">
              <animate attributeName="d" dur="6s" repeatCount="indefinite"
                values={`
                  M0,${waterY + 5} C40,${waterY + 15} 80,${waterY - 5} 120,${waterY + 5} V120 H0 Z;
                  M0,${waterY + 5} C40,${waterY - 5} 80,${waterY + 15} 120,${waterY + 5} V120 H0 Z;
                  M0,${waterY + 5} C40,${waterY + 15} 80,${waterY - 5} 120,${waterY + 5} V120 H0 Z
                `}
              />
            </path>
            {/* 顶部涟漪光效 */}
            <rect x="0" y={waterY - 2} width="120" height="4" fill="white" fillOpacity="0.15" filter="blur(1px)" />
          </g>

          {/* 玻璃反光层 - 高光点 */}
          <circle cx="60" cy="60" r="58" fill="url(#glassReflect)" pointerEvents="none" />
          <ellipse cx="40" cy="35" rx="10" ry="5" fill="white" fillOpacity="0.25" transform="rotate(-30, 40, 35)" />

          {/* 分数文本 */}
          <g className="score-group">
            <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="800" fill={theme === 'dark' ? 'white' : '#1f2937'} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
              {score}
            </text>
            <text x="60" y="78" textAnchor="middle" fontSize="10" fontWeight="600" fill={theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} letterSpacing="1">
              综合能量
            </text>
          </g>
        </svg>

        {/* 悬浮粒子 */}
        <div className="energy-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--p-color': colors[0],
              '--p-delay': `${i * 0.7}s`,
              '--p-left': `${30 + Math.random() * 40}%`
            }}></div>
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

        {/* 农历信息和禁忌 */}
        {lunarData && dailyTaboo && (
          <div className="lunar-info-section">
            <div className="lunar-date-info">
              <span className="lunar-label">农历</span>
              <span className="lunar-date">{lunarData.lunarMonthStr.replace('月', '')}{lunarData.lunarDayStr}</span>
            </div>
            <div className="lunar-taboo-info">
              <span className="taboo-benefit">
                <span className="taboo-label">宜</span>
                {dailyTaboo.beneficial}
              </span>
              <span className="taboo-avoid">
                <span className="taboo-label">忌</span>
                {dailyTaboo.avoid}
              </span>
            </div>
          </div>
        )}
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
