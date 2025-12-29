import React, { useState } from 'react';
import './styles/birthChart.css';

const BirthChart = () => {
  // 五行能量数据
  const elementsData = [
    { name: '金', percentage: 48, color: '#D4AF37' },
    { name: '土', percentage: 28, color: '#8D6E63' },
    { name: '水', percentage: 12, color: '#2196F3' },
    { name: '木', percentage: 5, color: '#4CAF50' },
    { name: '火', percentage: 7, color: '#F44336' }
  ];

  // 行业数据
  const industries = [
    '金融、法律、精密技术',
    '咨询、教育、写作',
    '互联网、数据分析、新兴科技',
    '公关、媒介、外联'
  ];

  // 伴侣信息
  const partnerInfo = {
    element: '火',
    traits: '性格开朗、有领导力',
    fields: '管理、文化、能源相关行业',
    bestAge: '30岁后'
  };

  // 切换显示更多运势详情
  const [showMoreFortune, setShowMoreFortune] = useState(false);

  return (
    <div className="birth-chart-container">
      {/* 标题区域 */}
      <div className="header-section">
        <h1>生辰八字分析</h1>
        <div className="birth-info">
          <p><strong>出生时间</strong>：1991年农历三月初七 丑时（公历：1991年4月21日 1:00-3:00）</p>
          <p><strong>八字四柱</strong>：辛未 癸巳 辛酉 己丑</p>
          <p><strong>十神分布</strong>：比肩 食神 正官 偏印</p>
          <p><strong>当前大运</strong>：辛卯 (25-34岁)</p>
          <p><strong>起运时间</strong>：5岁4个月起运，大运逆排</p>
        </div>
      </div>

      {/* 格局卡片 */}
      <div className="card pattern-card">
        <div className="card-header">
          <span className="card-icon">📜</span>
          <h2>命局格局</h2>
        </div>
        <div className="pattern-content">
          <div className="pattern-title">
            <h3>【辛金从革 · 食神吐秀】</h3>
          </div>
          <p className="pattern-description">
            日主辛金，生于巳月，地支巳酉丑三合金局，金气极旺，构成<strong>从革格</strong>（金刚从旺）。天干透出癸水食神、己土偏印，形成"食神佩印"的聪明组合。你为人重义守信，内心坚韧，有自己的一套原则与傲骨，不喜受人约束，但在关键时刻懂得借势发力，以柔化刚。
          </p>
          <div className="quote">
            金白水清，灵秀内藏。不鸣则已，一鸣惊人。
          </div>
        </div>
      </div>

      {/* 五行能量分布 */}
      <div className="card elements-card">
        <div className="card-header">
          <span className="card-icon">⚖️</span>
          <h2>五行能量分布</h2>
        </div>
        <p className="card-subtitle">（以下为示意图，呈现命局五行气势）</p>
        
        <div className="elements-container">
          {elementsData.map((element, index) => (
            <div key={index} className="element-item">
              <div className="element-header">
                <span className="element-name">{element.name}</span>
                <span className="element-percentage">{element.percentage}%</span>
              </div>
              <div className="element-bar">
                <div 
                  className="element-fill" 
                  style={{ 
                    width: `${element.percentage}%`,
                    backgroundColor: element.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="elements-interpretation">
          <ul>
            <li><strong>日主辛金</strong>极旺，象征意志坚定、执行力强，但也容易固执。</li>
            <li><strong>水（食神）</strong>为泄秀之源，代表才华、表达与流动性智慧。</li>
            <li><strong>火（官星）</strong>深藏于月支，事业中有压力也有机遇，需待时而发。</li>
            <li><strong>木（财星）</strong>微弱，正财不显，暗示财运多来自专业能力与机遇把握，而非固定收入。</li>
          </ul>
        </div>
      </div>

      {/* 近期财运走势 */}
      <div className="card fortune-card">
        <div className="card-header">
          <span className="card-icon">📈</span>
          <h2>近期财运走势</h2>
        </div>
        <p>
          当前大运<strong>辛卯</strong>，卯木为偏财，但与原局酉金相冲，财运波动较大，常有"财来财去"之象。2025年乙巳，流年天干乙木为偏财，地支巳火助旺官星，<strong>财运有望通过合作、副业或技术项目提升</strong>，尤其利于下半年。但需注意人际往来中的财务纠纷，合同文书务必谨慎。
        </p>
        <div className="quote">
          财如流水，技为舟。稳中求进，莫贪急利。
        </div>
        
        {/* 查看详情按钮 */}
        <div className="view-details">
          <button 
            className="view-details-btn" 
            onClick={() => setShowMoreFortune(!showMoreFortune)}
          >
            {showMoreFortune ? '收起详情' : '查看未来三年详细运势'}
          </button>
          
          {showMoreFortune && (
            <div className="more-fortune-details">
              <h4>未来三年运势详情</h4>
              <ul>
                <li><strong>2025年（乙巳）</strong>：偏财透出，利于投资、副业，但需注意合同细节，避免口舌之争。</li>
                <li><strong>2026年（丙午）</strong>：官星旺盛，事业压力增大，但也是晋升机遇期，财运稳步上升。</li>
                <li><strong>2027年（丁未）</strong>：印星得力，适合学习提升、考取证书，技术类投资回报可观。</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 适合行业 */}
      <div className="card industry-card">
        <div className="card-header">
          <span className="card-icon">📌</span>
          <h2>适合行业</h2>
        </div>
        <div className="industries-list">
          {industries.map((industry, index) => (
            <div key={index} className="industry-item">
              <div className="industry-bullet"></div>
              <span>{industry}</span>
            </div>
          ))}
        </div>
        <p className="industry-note">
          * 金性行业发挥专长，食神行业以智生财，新兴行业契合时代潮流
        </p>
      </div>

      {/* 契合伴侣 */}
      <div className="card partner-card">
        <div className="card-header">
          <span className="card-icon">💞</span>
          <h2>契合伴侣</h2>
        </div>
        <div className="partner-details">
          <div className="partner-element">
            <div className="element-circle">
              <span>{partnerInfo.element}</span>
            </div>
            <div className="partner-element-info">
              <h4>配偶星属{partnerInfo.element}</h4>
              <p>（官星为{partnerInfo.element}，能暖局助运）</p>
            </div>
          </div>
          
          <div className="partner-traits">
            <h4>对方特质</h4>
            <p>{partnerInfo.traits}</p>
          </div>
          
          <div className="partner-fields">
            <h4>可能从事行业</h4>
            <p>{partnerInfo.fields}</p>
          </div>
          
          <div className="partner-timing">
            <h4>最佳婚配年龄段</h4>
            <div className="timing-highlight">
              <strong>{partnerInfo.bestAge}</strong>，运势稳定时易遇正缘
            </div>
          </div>
        </div>
      </div>

      {/* 底部声明 */}
      <div className="footer">
        <p>
          本分析由专业八字排盘推导得出，仅供娱乐参考。
          <br />
          <em>命理如镜，照见趋势；人生如舟，舵在手中。</em>
        </p>
      </div>
    </div>
  );
};

export default BirthChart;