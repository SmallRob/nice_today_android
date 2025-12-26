import React, { useState, useEffect } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import '../styles/numerology.css';

const NumerologyPage = () => {
  const currentConfig = useCurrentConfig();
  const [birthDate, setBirthDate] = useState('1991-04-21');
  const [numerologyData, setNumerologyData] = useState(null);
  const [energyStats, setEnergyStats] = useState(null);
  const currentYear = new Date().getFullYear();

  // 计算生命灵数
  const calculateLifePathNumber = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始
    const day = date.getDate();
    
    // 方法1：将所有数字相加直到个位数
    const sumAllDigits = (num) => {
      let total = num;
      while (total > 9) {
        total = total.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
      }
      return total;
    };
    
    // 计算生命灵数（主命数）
    const lifePathNumber = sumAllDigits(year + month + day);
    
    // 计算天赋数（年份、月份、日期的和）
    const yearSum = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const monthSum = month.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const daySum = day.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const talentNumber = yearSum + monthSum + daySum;
    
    // 生日数
    const birthdayNumber = sumAllDigits(day);
    
    // 先天数（年份后两位+月份+日期）
    const yearLastTwo = parseInt(year.toString().slice(-2));
    const innateNumber = yearLastTwo + month + day;
    
    // 星座数（金牛座对应数字2）
    const zodiacNumber = 2; // 金牛座对应数字2
    
    // 流年数（当前年份+月份+日期）
    const currentYearNum = currentYear;
    const yearFlow = currentYearNum.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const flowNumber = sumAllDigits(yearFlow + month + day);
    
    return {
      lifePathNumber,
      talentNumber,
      birthdayNumber,
      innateNumber,
      zodiacNumber,
      flowNumber,
      year,
      month,
      day
    };
  };

  // 计算能量统计
  const calculateEnergyStats = (data) => {
    const totalNumbers = [
      data.lifePathNumber,
      data.talentNumber,
      data.birthdayNumber,
      data.innateNumber,
      data.zodiacNumber,
      data.flowNumber
    ];
    
    // 计算各数字出现次数
    const numberCounts = {};
    totalNumbers.forEach(num => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
    
    // 计算能量级别（基于数字重复程度）
    const energyLevel = Object.values(numberCounts).reduce((sum, count) => sum + count * count, 0);
    
    // 计算平衡度（数字分布的均匀程度）
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

  // 获取数字描述信息
  const getNumberInfo = (number) => {
    const numberDescriptions = {
      1: {
        keywords: ["独立", "开创", "领导", "自信"],
        description: "天生的领导者，充满创新精神和行动力，具有强烈的个人主义。",
        strengths: "果断、创新、独立",
        challenges: "可能过于自我、固执"
      },
      2: {
        keywords: ["合作", "平衡", "和谐", "敏感"],
        description: "擅长合作与协调，注重人际关系，具有敏锐的直觉和共情能力。",
        strengths: "合作、耐心、直觉强",
        challenges: "可能优柔寡断、依赖性强"
      },
      3: {
        keywords: ["创意", "表达", "快乐", "社交"],
        description: "充满创造力和表达能力，热爱社交，能给他人带来欢乐和灵感。",
        strengths: "有创意、乐观、表达力强",
        challenges: "可能肤浅、不够专注"
      },
      4: {
        keywords: ["稳定", "务实", "责任", "纪律"],
        description: "注重安全和稳定，具有强烈的责任感和纪律性，是可靠的建设者。",
        strengths: "可靠、务实、有组织",
        challenges: "可能固执、缺乏灵活性"
      },
      5: {
        keywords: ["自由", "冒险", "变化", "适应"],
        description: "热爱自由和冒险，适应能力强，充满活力和好奇心，追求多样性。",
        strengths: "适应性强、有活力、开放",
        challenges: "可能缺乏耐心、不够专注"
      },
      6: {
        keywords: ["责任", "关爱", "家庭", "服务"],
        description: "具有强烈的责任感和关爱之心，重视家庭和社区，是优秀的照顾者。",
        strengths: "有爱心、负责任、可靠",
        challenges: "可能过于控制、牺牲自我"
      },
      7: {
        keywords: ["智慧", "分析", "内省", "灵性"],
        description: "具有深刻的智慧和洞察力，喜欢内省和分析，追求精神层面的成长。",
        strengths: "有智慧、分析力强、直觉",
        challenges: "可能孤僻、过于批判"
      },
      8: {
        keywords: ["权力", "成就", "财富", "权威"],
        description: "具有强大的执行力和领导能力，追求物质成就和权力，是成功的实践者。",
        strengths: "有执行力、务实、有权威",
        challenges: "可能过于物质、控制欲强"
      },
      9: {
        keywords: ["服务", "机会", "成功", "智慧"],
        description: "善良，拥有天使般的品格，热心公益，有时挺有野心。",
        strengths: "有爱心、理想主义、包容",
        challenges: "可能过于理想化、牺牲自我"
      }
    };
    
    return numberDescriptions[number] || {
      keywords: ["神秘", "未知", "探索", "潜力"],
      description: "这是一个特殊的数字，蕴含着独特的能量和潜力，等待你去发现。",
      strengths: "独特、有潜力、神秘",
      challenges: "需要更多探索和理解"
    };
  };

  // 获取金字塔结构
  const getPyramid = () => {
    return [
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9]
    ];
  };

  // 初始化数据 - 从全局配置获取出生日期
  useEffect(() => {
    if (currentConfig && currentConfig.birthDate) {
      setBirthDate(currentConfig.birthDate);
    }
  }, [currentConfig]);

  // 计算生命灵数数据
  useEffect(() => {
    if (birthDate) {
      const data = calculateLifePathNumber(birthDate);
      setNumerologyData(data);
      
      // 计算能量统计
      const stats = calculateEnergyStats(data);
      setEnergyStats(stats);
    }
  }, [birthDate]);

  // 处理日期变化
  const handleDateChange = (e) => {
    setBirthDate(e.target.value);
  };

  if (!numerologyData || !energyStats) {
    return (
      <div className="numerology-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在计算灵数能量...</p>
        </div>
      </div>
    );
  }

  const numberInfo = getNumberInfo(numerologyData.lifePathNumber);
  const pyramid = getPyramid();

  return (
    <div className="numerology-container">
      {/* 顶部标题 */}
      <header className="header">
        <h1 className="title">玛雅灵数解读</h1>
        <div className="date-selector">
          <label htmlFor="birthdate">选择出生日期：</label>
          <input 
            type="date" 
            id="birthdate" 
            value={birthDate}
            onChange={handleDateChange}
            max="2024-12-31"
          />
          <span className="selected-date">
            已选择：{numerologyData.year}年{numerologyData.month}月{numerologyData.day}日
          </span>
        </div>
      </header>

      <main className="main-content">
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

        {/* 数字描述 */}
        <section className="description-section">
          <p className="description-text">{numberInfo.description}</p>
          <div className="strengths-challenges">
            <div className="strength-item">
              <span className="strength-label">优势：</span>
              {numberInfo.strengths}
            </div>
            <div className="challenge-item">
              <span className="challenge-label">挑战：</span>
              {numberInfo.challenges}
            </div>
          </div>
        </section>

        {/* 数字金字塔 */}
        <section className="pyramid-section">
          <h3 className="section-title">灵数能量金字塔</h3>
          <div className="pyramid">
            {pyramid.map((row, rowIndex) => (
              <div key={rowIndex} className="pyramid-row">
                {row.map((num, numIndex) => (
                  <div 
                    key={numIndex} 
                    className={`pyramid-number ${num === numerologyData.lifePathNumber ? 'active' : ''}`}
                  >
                    {num}
                  </div>
                ))}
                {rowIndex < pyramid.length - 1 && (
                  <div className="arrow-down">↓</div>
                )}
              </div>
            ))}
          </div>
          <div className="pyramid-explanation">
            <p>数字金字塔展示了灵数能量的流动与层级关系</p>
          </div>
        </section>

        {/* 免责声明 */}
        <section className="disclaimer-section">
          <p className="disclaimer-text">当前内容为免费内容，仅供您在娱乐中探索自我，不等于专业测评，不代表价值评判，无任何现实指导意义。</p>
        </section>

        {/* 灵数归类 */}
        <section className="classification-section">
          <h3 className="section-title">灵数归类</h3>
          
          <div className="classification-grid">
            <div className="classification-row">
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
            </div>
            
            <div className="classification-row">
              <div className="classification-item">
                <div className="classification-value">{numerologyData.lifePathNumber}</div>
                <div className="classification-label">生命数</div>
              </div>
              <div className="classification-item">
                <div className="classification-value">{numerologyData.zodiacNumber}</div>
                <div className="classification-label">星座数</div>
              </div>
              <div className="classification-item">
                <div className="classification-value">{numerologyData.flowNumber}</div>
                <div className="classification-label">流年数</div>
              </div>
            </div>
          </div>
          
          <div className="classification-explanation">
            <div className="explanation-item">
              <h4>生日数</h4>
              <p>根据出生日期计算，代表基础性格</p>
            </div>
            <div className="explanation-item">
              <h4>先天数</h4>
              <p>出生年份后两位+月份+日期，代表先天能量</p>
            </div>
            <div className="explanation-item">
              <h4>天赋数</h4>
              <p>年份、月份、日期分别相加，代表潜在天赋</p>
            </div>
            <div className="explanation-item">
              <h4>生命数</h4>
              <p>生命灵数/主命数，代表人生道路</p>
            </div>
            <div className="explanation-item">
              <h4>星座数</h4>
              <p>根据星座对应的数字(金牛座=2)</p>
            </div>
            <div className="explanation-item">
              <h4>流年数</h4>
              <p>当前年份+生日，代表年度能量</p>
            </div>
          </div>
        </section>

        {/* 详细解读 */}
        <section className="interpretation-section">
          <h3 className="section-title">数字{numerologyData.lifePathNumber}详细解读</h3>
          
          <div className="interpretation-content">
            <div className="interpretation-card">
              <h4>性格特质</h4>
              <p>你是一个天生的服务者，拥有慈悲心和宽广的胸怀。你乐于助人，常常将别人的需求放在自己之前。</p>
            </div>
            
            <div className="interpretation-card">
              <h4>人生机遇</h4>
              <p>你的人生充满了各种机遇，但需要学会识别和把握。你的智慧会引导你走向正确的道路。</p>
            </div>
            
            <div className="interpretation-card">
              <h4>成功密码</h4>
              <p>通过服务他人实现自我价值是你的成功密码。当你帮助他人时，你也为自己创造了最好的机会。</p>
            </div>
            
            <div className="interpretation-card">
              <h4>注意事项</h4>
              <p>注意不要过度牺牲自己，在帮助他人的同时也要照顾好自己的需求。学会设定健康的界限。</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 玛雅灵数解读 | 仅供娱乐参考</p>
        <p>当前年份：{currentYear} | 计算结果基于玛雅历法及数字能量学</p>
      </footer>
    </div>
  );
};

export default NumerologyPage;