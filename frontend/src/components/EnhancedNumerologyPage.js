import React, { useState, useEffect } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import { HOROSCOPE_DATA_ENHANCED } from '../utils/horoscopeAlgorithm';
import '../styles/enhanced-numerology.css';

const EnhancedNumerologyPage = () => {
  const currentConfig = useCurrentConfig();
  const [userInfo, setUserInfo] = useState({
    birthDate: '',
    zodiac: '',
    nickname: ''
  });
  const [tempInfo, setTempInfo] = useState({
    birthDate: '',
    zodiac: '',
    name: ''
  });
  const [numerologyData, setNumerologyData] = useState(null);
  const [energyStats, setEnergyStats] = useState(null);
  const [fortunePrediction, setFortunePrediction] = useState(null);
  const [personalityAnalysis, setPersonalityAnalysis] = useState(null);
  const [currentMode, setCurrentMode] = useState('self'); // 'self' 或 'other'
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  // 根据日期获取星座
  const getZodiacFromDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 星座日期范围
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '白羊座';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '金牛座';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座';
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '巨蟹座';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '狮子座';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '处女座';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座';
    if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '天蝎座';
    if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '摩羯座';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return '双鱼座';
    
    return '';
  };

  // 获取星座详细信息
  const getZodiacInfo = (zodiacName) => {
    return HOROSCOPE_DATA_ENHANCED.find(z => z.name === zodiacName) || null;
  };

  // 计算生命灵数
  const calculateLifePathNumber = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const sumAllDigits = (num) => {
      let total = num;
      while (total > 9) {
        total = total.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
      }
      return total;
    };
    
    const lifePathNumber = sumAllDigits(year + month + day);
    const yearSum = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const monthSum = month.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const daySum = day.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const talentNumber = yearSum + monthSum + daySum;
    const birthdayNumber = sumAllDigits(day);
    const yearLastTwo = parseInt(year.toString().slice(-2));
    const innateNumber = yearLastTwo + month + day;
    
    return {
      lifePathNumber,
      talentNumber,
      birthdayNumber,
      innateNumber,
      year,
      month,
      day
    };
  };

  // 计算能量统计
  const calculateEnergyStats = (data, zodiacName) => {
    const totalNumbers = [
      data.lifePathNumber,
      data.talentNumber,
      data.birthdayNumber,
      data.innateNumber
    ];
    
    const numberCounts = {};
    totalNumbers.forEach(num => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
    
    const energyLevel = Object.values(numberCounts).reduce((sum, count) => sum + count * count, 0);
    const uniqueNumbers = Object.keys(numberCounts).length;
    const balanceScore = Math.round((uniqueNumbers / totalNumbers.length) * 100);
    
    return {
      energyLevel,
      balanceScore,
      numberCounts,
      dominantNumber: Object.keys(numberCounts).reduce((a, b) => numberCounts[a] > numberCounts[b] ? a : b),
      totalNumbers: totalNumbers.length
    };
  };

  // 生成运势预测
  const generateFortunePrediction = (numerologyData, zodiacInfo) => {
    const lifePathNumber = numerologyData.lifePathNumber;
    const currentMonth = new Date().getMonth() + 1;
    
    const fortuneLevels = {
      1: { level: '极佳', color: '#4CAF50', description: '充满机遇和成功的月份' },
      2: { level: '良好', color: '#8BC34A', description: '平稳发展，人际关系良好' },
      3: { level: '中等', color: '#FFC107', description: '需要努力和耐心的时期' },
      4: { level: '一般', color: '#FF9800', description: '面临挑战，需要谨慎应对' },
      5: { level: '较差', color: '#F44336', description: '需要特别小心和调整策略' }
    };
    
    const fortuneIndex = (lifePathNumber + currentMonth) % 5 + 1;
    const fortune = fortuneLevels[fortuneIndex];
    
    return {
      fortuneLevel: fortune.level,
      fortuneColor: fortune.color,
      description: fortune.description,
      luckyNumbers: [lifePathNumber, numerologyData.birthdayNumber, currentMonth],
      advice: `本月适合${zodiacInfo?.element || '所有'}星座的活动，把握机会`
    };
  };

  // 生成性格分析
  const generatePersonalityAnalysis = (numerologyData, zodiacInfo) => {
    const number = numerologyData.lifePathNumber;
    
    const personalityTraits = {
      1: { main: '独立自信', secondary: '领导力强', weakness: '可能过于自我' },
      2: { main: '合作协调', secondary: '敏感细腻', weakness: '容易优柔寡断' },
      3: { main: '创意表达', secondary: '社交活跃', weakness: '可能不够专注' },
      4: { main: '稳定务实', secondary: '责任感强', weakness: '可能固执保守' },
      5: { main: '自由冒险', secondary: '适应力强', weakness: '缺乏耐心' },
      6: { main: '关爱责任', secondary: '家庭观念', weakness: '可能过度控制' },
      7: { main: '智慧分析', secondary: '内省深刻', weakness: '可能孤僻批判' },
      8: { main: '权力成就', secondary: '执行力强', weakness: '可能物质至上' },
      9: { main: '服务奉献', secondary: '理想主义', weakness: '可能理想化过度' }
    };
    
    const traits = personalityTraits[number] || personalityTraits[1];
    
    return {
      mainTrait: traits.main,
      secondaryTrait: traits.secondary,
      weakness: traits.weakness,
      compatibility: `${zodiacInfo?.compatible?.slice(0, 2).join('、') || '白羊座、狮子座'}最相配`,
      careerSuggestions: ['管理岗位', '创意工作', zodiacInfo?.element === '火象' ? '销售' : '技术']
    };
  };

  // 获取数字描述信息
  const getNumberInfo = (number) => {
    const numberDescriptions = {
      1: { keywords: ["独立", "开创", "领导", "自信"], description: "天生的领导者，充满创新精神和行动力" },
      2: { keywords: ["合作", "平衡", "和谐", "敏感"], description: "擅长合作与协调，注重人际关系" },
      3: { keywords: ["创意", "表达", "快乐", "社交"], description: "充满创造力和表达能力，热爱社交" },
      4: { keywords: ["稳定", "务实", "责任", "纪律"], description: "注重安全和稳定，具有强烈的责任感" },
      5: { keywords: ["自由", "冒险", "变化", "适应"], description: "热爱自由和冒险，适应能力强" },
      6: { keywords: ["责任", "关爱", "家庭", "服务"], description: "具有强烈的责任感和关爱之心" },
      7: { keywords: ["智慧", "分析", "内省", "灵性"], description: "具有深刻的智慧和洞察力" },
      8: { keywords: ["权力", "成就", "财富", "权威"], description: "具有强大的执行力和领导能力" },
      9: { keywords: ["服务", "机会", "成功", "智慧"], description: "善良，拥有天使般的品格" }
    };
    
    return numberDescriptions[number] || {
      keywords: ["神秘", "未知", "探索", "潜力"],
      description: "这是一个特殊的数字，蕴含着独特的能量和潜力"
    };
  };

  // 初始化数据
  useEffect(() => {
    if (currentConfig && currentConfig.birthDate) {
      const zodiac = getZodiacFromDate(currentConfig.birthDate);
      setUserInfo({
        birthDate: currentConfig.birthDate,
        zodiac: zodiac,
        nickname: currentConfig.nickname || '神秘用户'
      });
    }
  }, [currentConfig]);

  // 计算灵数数据
  useEffect(() => {
    const calculateNumerology = async () => {
      setIsLoading(true);
      
      const info = currentMode === 'self' ? userInfo : tempInfo;
      if (!info.birthDate) {
        setIsLoading(false);
        return;
      }
      
      try {
        const numerologyData = calculateLifePathNumber(info.birthDate);
        const zodiacInfo = getZodiacInfo(info.zodiac || getZodiacFromDate(info.birthDate));
        const energyStats = calculateEnergyStats(numerologyData, info.zodiac);
        const fortunePrediction = generateFortunePrediction(numerologyData, zodiacInfo);
        const personalityAnalysis = generatePersonalityAnalysis(numerologyData, zodiacInfo);
        
        setNumerologyData(numerologyData);
        setEnergyStats(energyStats);
        setFortunePrediction(fortunePrediction);
        setPersonalityAnalysis(personalityAnalysis);
      } catch (error) {
        console.error('计算灵数数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateNumerology();
  }, [userInfo, tempInfo, currentMode]);

  // 处理日期变化
  const handleTempDateChange = (e) => {
    const date = e.target.value;
    const zodiac = getZodiacFromDate(date);
    setTempInfo({
      ...tempInfo,
      birthDate: date,
      zodiac: zodiac
    });
  };

  // 处理星座变化
  const handleTempZodiacChange = (e) => {
    setTempInfo({
      ...tempInfo,
      zodiac: e.target.value
    });
  };

  // 处理姓名变化
  const handleTempNameChange = (e) => {
    setTempInfo({
      ...tempInfo,
      name: e.target.value
    });
  };

  // 切换查询模式
  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  // 分享功能
  const handleShare = () => {
    const info = currentMode === 'self' ? userInfo : tempInfo;
    const shareText = `${info.name || info.nickname || '神秘用户'}的生命灵数分析：\n` +
      `主命数：${numerologyData?.lifePathNumber || '未知'}\n` +
      `星座：${info.zodiac || '未知'}\n` +
      `运势：${fortunePrediction?.fortuneLevel || '未知'}\n` +
      `来自：万象花园 - 生命灵数解读`;
    
    if (navigator.share) {
      navigator.share({
        title: '我的生命灵数分析',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('分析结果已复制到剪贴板！');
      });
    }
  };

  if (isLoading) {
    return (
      <div className="enhanced-numerology-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在计算灵数能量...</p>
        </div>
      </div>
    );
  }

  const info = currentMode === 'self' ? userInfo : tempInfo;
  const numberInfo = numerologyData ? getNumberInfo(numerologyData.lifePathNumber) : null;

  return (
    <div className="enhanced-numerology-container">
      {/* 顶部标题和模式切换 */}
      <header className="header">
        <h1 className="title">增强版生命灵数解读</h1>
        
        {/* 模式切换 */}
        <div className="mode-switch">
          <button
            className={`mode-btn ${currentMode === 'self' ? 'active' : ''}`}
            onClick={() => handleModeChange('self')}
          >
            <svg className="mode-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            我的灵数
          </button>
          <button
            className={`mode-btn ${currentMode === 'other' ? 'active' : ''}`}
            onClick={() => handleModeChange('other')}
          >
            <svg className="mode-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            查询他人
          </button>
        </div>

        {/* 信息输入区域 */}
        <div className="info-input-section">
          {currentMode === 'other' && (
            <div className="input-group">
              <label>姓名（可选）:</label>
              <input
                type="text"
                value={tempInfo.name}
                onChange={handleTempNameChange}
                placeholder="输入姓名"
                className="input-field"
              />
            </div>
          )}
          
          <div className="input-group">
            <label>出生日期:</label>
            <input
              type="date"
              value={currentMode === 'self' ? userInfo.birthDate : tempInfo.birthDate}
              onChange={currentMode === 'self' ? undefined : handleTempDateChange}
              disabled={currentMode === 'self'}
              max="2024-12-31"
              className="input-field"
            />
          </div>
          
          <div className="input-group">
            <label>星座:</label>
            <select
              value={currentMode === 'self' ? userInfo.zodiac : tempInfo.zodiac}
              onChange={currentMode === 'self' ? undefined : handleTempZodiacChange}
              disabled={currentMode === 'self'}
              className="input-field"
            >
              <option value="">自动计算</option>
              {HOROSCOPE_DATA_ENHANCED.map(zodiac => (
                <option key={zodiac.name} value={zodiac.name}>
                  {zodiac.icon} {zodiac.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {numerologyData && energyStats && fortunePrediction && personalityAnalysis && (
        <main className="main-content">
          {/* 用户信息卡片 */}
          <section className="user-card">
            <div className="user-avatar">
              <span className="avatar-text">{info.name?.charAt(0) || info.nickname?.charAt(0) || '?'}</span>
            </div>
            <div className="user-info">
              <h3 className="user-name">{info.name || info.nickname || '神秘用户'}</h3>
              <div className="user-details">
                <span className="zodiac-badge">{info.zodiac || '未知星座'}</span>
                <span className="birth-date">{numerologyData.year}年{numerologyData.month}月{numerologyData.day}日</span>
              </div>
            </div>
            <button className="share-btn" onClick={handleShare}>
              <svg className="share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享
            </button>
          </section>

          {/* 能量统计 */}
          <section className="energy-stats-section">
            <h3 className="section-title">灵数能量分析</h3>
            <div className="energy-stats-grid">
              <div className="energy-stat">
                <div className="stat-value">{energyStats.energyLevel}</div>
                <div className="stat-label">能量级别</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill" 
                    style={{width: `${Math.min(energyStats.energyLevel / 50 * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              <div className="energy-stat">
                <div className="stat-value">{energyStats.balanceScore}%</div>
                <div className="stat-label">平衡度</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill" 
                    style={{width: `${energyStats.balanceScore}%`}}
                  ></div>
                </div>
              </div>
              <div className="energy-stat">
                <div className="stat-value">{energyStats.dominantNumber}</div>
                <div className="stat-label">主导数字</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill" 
                    style={{width: `${(energyStats.numberCounts[energyStats.dominantNumber] / energyStats.totalNumbers) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* 主数字显示 */}
          <section className="main-number-section">
            <div className="number-circle">
              <span className="big-number">{numerologyData.lifePathNumber}</span>
            </div>
            
            <div className="keywords">
              {numberInfo.keywords.map((keyword, index) => (
                <div key={index} className="keyword-item">
                  <div className="keyword-icon">{index + 1}</div>
                  <span className="keyword-text">{keyword}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 运势预测 */}
          <section className="fortune-section">
            <h3 className="section-title">本月运势预测</h3>
            <div className="fortune-card" style={{borderLeftColor: fortunePrediction.fortuneColor}}>
              <div className="fortune-header">
                <span className="fortune-level" style={{color: fortunePrediction.fortuneColor}}>
                  {fortunePrediction.fortuneLevel}
                </span>
                <span className="fortune-description">{fortunePrediction.description}</span>
              </div>
              <div className="fortune-details">
                <div className="lucky-numbers">
                  <span>幸运数字：</span>
                  {fortunePrediction.luckyNumbers.map((num, idx) => (
                    <span key={idx} className="lucky-number">{num}</span>
                  ))}
                </div>
                <p className="fortune-advice">{fortunePrediction.advice}</p>
              </div>
            </div>
          </section>

          {/* 性格分析 */}
          <section className="personality-section">
            <h3 className="section-title">性格特征分析</h3>
            <div className="personality-grid">
              <div className="personality-card">
                <h4>主要特质</h4>
                <p>{personalityAnalysis.mainTrait}</p>
              </div>
              <div className="personality-card">
                <h4>次要特质</h4>
                <p>{personalityAnalysis.secondaryTrait}</p>
              </div>
              <div className="personality-card">
                <h4>需要注意</h4>
                <p>{personalityAnalysis.weakness}</p>
              </div>
              <div className="personality-card">
                <h4>最佳配对</h4>
                <p>{personalityAnalysis.compatibility}</p>
              </div>
            </div>
          </section>

          {/* 灵数归类 */}
          <section className="classification-section">
            <h3 className="section-title">灵数归类</h3>
            <div className="classification-grid">
              <div className="classification-item">
                <div className="classification-value">{numerologyData.birthdayNumber}</div>
                <div className="classification-label">生日数</div>
              </div>
              <div className="classification-item">
                <div className="classification-value">{numerologyData.innateNumber}</div>
                <div className="classification-label">先天数</div>
              </div>
              <div className="classification-item">
                <div className="classification-value">{numerologyData.talentNumber}</div>
                <div className="classification-label">天赋数</div>
              </div>
              <div className="classification-item">
                <div className="classification-value">{numerologyData.lifePathNumber}</div>
                <div className="classification-label">生命数</div>
              </div>
            </div>
          </section>

          {/* 免责声明 */}
          <section className="disclaimer-section">
            <p className="disclaimer-text">
              当前内容为免费娱乐内容，仅供探索自我，不等于专业测评，不代表价值评判，无任何现实指导意义。
            </p>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>© {currentYear} 万象花园 - 增强版生命灵数解读</p>
      </footer>
    </div>
  );
};

export default EnhancedNumerologyPage;