import React from 'react';
import './HexagramDisplay.css';

const HexagramDisplay = ({ result }) => {
  const { 
    method, 
    numbers, 
    time, 
    upperTrigram, 
    lowerTrigram, 
    changingLine,
    originalHexagram,
    interchangingHexagram,
    changingHexagram
  } = result;

  // 八卦名称和符号
  const trigramNames = {
    1: { name: '乾', symbol: '☰', nature: '天', attribute: '健' },
    2: { name: '兑', symbol: '☱', nature: '泽', attribute: '悦' },
    3: { name: '离', symbol: '☲', nature: '火', attribute: '丽' },
    4: { name: '震', symbol: '☳', nature: '雷', attribute: '动' },
    5: { name: '巽', symbol: '☴', nature: '风', attribute: '入' },
    6: { name: '坎', symbol: '☵', nature: '水', attribute: '陷' },
    7: { name: '艮', symbol: '☶', nature: '山', attribute: '止' },
    8: { name: '坤', symbol: '☷', nature: '地', attribute: '顺' }
  };

  // 64卦名称 (示例)
  const hexagramNames = {
    1: { name: '乾为天', enName: 'The Creative', description: '元亨利贞' },
    2: { name: '坤为地', enName: 'The Receptive', description: '元亨，利牝马之贞' },
    11: { name: '地天泰', enName: 'Peace', description: '小往大来，吉亨' },
    12: { name: '天地否', enName: 'Standstill', description: '否之匪人，不利君子贞' },
    63: { name: '水火既济', enName: 'After Completion', description: '亨小，利贞' },
    64: { name: '火水未济', enName: 'Before Completion', description: '亨，小狐汔济' }
  };

  // 获取卦名
  const getHexagramName = (id) => {
    return hexagramNames[id] || { 
      name: `卦${id}`, 
      enName: 'Hexagram', 
      description: '卦象描述'
    };
  };

  // 绘制卦象
  const renderHexagram = (upperId, lowerId, changingLine = 0) => {
    const upper = trigramNames[upperId];
    const lower = trigramNames[lowerId];
    
    // 卦爻绘制 (简化版)
    const lines = [];
    
    // 上卦三爻
    for (let i = 3; i >= 1; i--) {
      const lineNum = i + 3;
      const isChanging = lineNum === changingLine;
      lines.push(
        <div key={`upper-${i}`} className={`hexagram-line ${isChanging ? 'changing' : ''}`}>
          <div className="line-yang"></div>
          <span className="line-number">上{lineNum}</span>
        </div>
      );
    }
    
    // 下卦三爻
    for (let i = 3; i >= 1; i--) {
      const isChanging = i === changingLine;
      lines.push(
        <div key={`lower-${i}`} className={`hexagram-line ${isChanging ? 'changing' : ''}`}>
          <div className="line-yin"></div>
          <span className="line-number">初{i}</span>
        </div>
      );
    }
    
    return lines;
  };

  const originalName = getHexagramName(originalHexagram);
  const interchangingName = getHexagramName(interchangingHexagram);
  const changingName = getHexagramName(changingHexagram);

  return (
    <div className="hexagram-display">
      <div className="divination-info">
        <h3>起卦信息</h3>
        <p><strong>起卦方式：</strong>{method}</p>
        {numbers && <p><strong>所用数字：</strong>{numbers.join(', ')}</p>}
        {time && <p><strong>起卦时间：</strong>{time}</p>}
        <p><strong>上卦：</strong>{trigramNames[upperTrigram].name} ({trigramNames[upperTrigram].nature})</p>
        <p><strong>下卦：</strong>{trigramNames[lowerTrigram].name} ({trigramNames[lowerTrigram].nature})</p>
        <p><strong>动爻：</strong>第{changingLine}爻</p>
      </div>

      <div className="hexagrams-container">
        <div className="hexagram-card">
          <h4>本卦</h4>
          <div className="hexagram-symbol">
            {renderHexagram(upperTrigram, lowerTrigram)}
          </div>
          <div className="hexagram-info">
            <p className="hexagram-name">{originalName.name}</p>
            <p className="hexagram-enname">{originalName.enName}</p>
            <p className="hexagram-desc">{originalName.description}</p>
            <p className="hexagram-composition">
              {trigramNames[upperTrigram].nature} + {trigramNames[lowerTrigram].nature}
            </p>
          </div>
        </div>

        <div className="hexagram-card">
          <h4>互卦</h4>
          <div className="hexagram-symbol">
            {renderHexagram(upperTrigram, lowerTrigram)}
          </div>
          <div className="hexagram-info">
            <p className="hexagram-name">{interchangingName.name}</p>
            <p className="hexagram-enname">{interchangingName.enName}</p>
            <p className="hexagram-desc">{interchangingName.description}</p>
            <p className="hexagram-composition">卦中藏卦，事中藏事</p>
          </div>
        </div>

        <div className="hexagram-card changing">
          <h4>变卦 <span className="changing-badge">动爻变化</span></h4>
          <div className="hexagram-symbol">
            {renderHexagram(upperTrigram, lowerTrigram, changingLine)}
          </div>
          <div className="hexagram-info">
            <p className="hexagram-name">{changingName.name}</p>
            <p className="hexagram-enname">{changingName.enName}</p>
            <p className="hexagram-desc">{changingName.description}</p>
            <p className="hexagram-composition">动爻在第{changingLine}爻</p>
          </div>
        </div>
      </div>

      <div className="trigram-explanation">
        <h4>八卦属性</h4>
        <div className="trigrams-grid">
          {Object.values(trigramNames).map((trigram, index) => (
            <div key={index} className="trigram-item">
              <span className="trigram-symbol">{trigram.symbol}</span>
              <span className="trigram-name">{trigram.name}</span>
              <span className="trigram-nature">{trigram.nature}</span>
              <span className="trigram-attribute">{trigram.attribute}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HexagramDisplay;