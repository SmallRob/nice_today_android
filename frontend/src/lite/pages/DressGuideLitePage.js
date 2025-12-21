import React, { useState, useEffect } from 'react';
import { generateDressInfo } from '../../services/localDataService';
import '../styles/dressGuideLiteStyles.css';
import '../styles/globalLiteStyles.css';

// 简化版五行能量趋势组件
const SimpleWuxingTrend = ({ dailyElement }) => {
  // 五行关系定义
  const relationships = {
    '木': { 
      generates: '火', 
      restricts: '土', 
      generatedBy: '水', 
      restrictedBy: '金', 
      color: '#4CAF50', // 绿色
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    '火': { 
      generates: '土', 
      restricts: '金', 
      generatedBy: '木', 
      restrictedBy: '水', 
      color: '#F44336', // 红色
      bgColor: 'rgba(244, 67, 54, 0.1)'
    },
    '土': { 
      generates: '金', 
      restricts: '水', 
      generatedBy: '火', 
      restrictedBy: '木', 
      color: '#795548', // 棕色
      bgColor: 'rgba(121, 85, 72, 0.1)'
    },
    '金': { 
      generates: '水', 
      restricts: '木', 
      generatedBy: '土', 
      restrictedBy: '火', 
      color: '#607D8B', // 灰色
      bgColor: 'rgba(96, 125, 139, 0.1)'
    },
    '水': { 
      generates: '木', 
      restricts: '火', 
      generatedBy: '金', 
      restrictedBy: '土', 
      color: '#2196F3', // 蓝色
      bgColor: 'rgba(33, 150, 243, 0.1)'
    }
  };

  const current = relationships[dailyElement] || relationships['木'];

  // 五行顺序
  const elements = ['木', '火', '土', '金', '水'];

  return (
    <div className="lite-card" style={{ backgroundColor: current.bgColor }}>
      <h3 className="lite-h3" style={{ color: current.color }}>五行能量趋势</h3>
      
      {/* 五行关系图 - 纯文字版 */}
      <div className="wuxing-relationship" style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', marginBottom: '8px', color: '#cccccc' }}>相生相克关系</div>
        
        {/* 相生关系 */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#3498db', marginBottom: '4px' }}>相生关系 (生)</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <span style={{ color: relationships[current.generatedBy]?.color || '#4CAF50' }}>{current.generatedBy}</span>
            <span style={{ color: '#cccccc', margin: '0 4px' }}>→</span>
            <span style={{ color: current.color, backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{dailyElement}</span>
            <span style={{ color: '#cccccc', margin: '0 4px' }}>→</span>
            <span style={{ color: relationships[current.generates]?.color || '#F44336' }}>{current.generates}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cccccc', marginTop: '4px' }}>
            {current.generatedBy}生{dailyElement}，{dailyElement}生{current.generates}
          </div>
        </div>
        
        {/* 相克关系 */}
        <div>
          <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '4px' }}>相克关系 (克)</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <span style={{ color: relationships[current.restrictedBy]?.color || '#607D8B' }}>{current.restrictedBy}</span>
            <span style={{ color: '#cccccc', margin: '0 4px' }}>→</span>
            <span style={{ color: current.color, backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{dailyElement}</span>
            <span style={{ color: '#cccccc', margin: '0 4px' }}>→</span>
            <span style={{ color: relationships[current.restricts]?.color || '#795548' }}>{current.restricts}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cccccc', marginTop: '4px' }}>
            {current.restrictedBy}克{dailyElement}，{dailyElement}克{current.restricts}
          </div>
        </div>
      </div>

      {/* 五行循环图 - 简化版 */}
      <div className="wuxing-cycle" style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', marginBottom: '8px', color: '#cccccc' }}>五行能量循环</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 'bold' }}>
          {elements.map(element => (
            <div key={element} style={{ 
              color: relationships[element]?.color || '#cccccc',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: element === dailyElement ? 'rgba(255,255,255,0.3)' : 'transparent',
              border: element === dailyElement ? `1px solid ${relationships[element]?.color}` : '1px solid transparent'
            }}>
              {element}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#cccccc', marginTop: '8px' }}>
          木→火→土→金→水→木 (相生循环)
        </div>
      </div>

      {/* 能量关系说明 */}
      <div className="wuxing-explanation" style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <div style={{ color: '#3498db', marginBottom: '4px' }}><strong>相生关系:</strong> {dailyElement}生{current.generates} (能量传递)</div>
        <div style={{ color: '#e74c3c', marginBottom: '4px' }}><strong>相克关系:</strong> {dailyElement}克{current.restricts} (能量制约)</div>
        <div style={{ color: '#cccccc' }}><strong>穿衣建议:</strong> 今日宜穿「{current.generatedBy}」或「{dailyElement}」色系，可尝试「{current.restricts}」色系平衡能量</div>
      </div>
    </div>
  );
};

const DressGuideLitePage = ({ userInfo }) => {
  const [dressAdvice, setDressAdvice] = useState(null);

  useEffect(() => {
    if (userInfo.birthDate) {
      // 使用本地数据服务生成穿衣建议
      const today = new Date();
      const advice = generateDressInfo(today);
      
      setDressAdvice(advice);
    }
  }, [userInfo.birthDate]);

  // 获取健康提醒
  const getHealthAdvice = (element) => {
    const healthTips = {
      "木": "今日适合户外活动，多接触绿色植物，有助于肝胆健康。保持情绪舒畅，避免过度愤怒。",
      "火": "注意心脏健康，避免过度兴奋和激动。适当休息，保持心情愉快。",
      "土": "关注脾胃健康，饮食要有规律，避免暴饮暴食。适当运动，增强体质。",
      "金": "注意呼吸系统健康，避免干燥环境。保持室内湿度，多喝水。",
      "水": "关注肾脏健康，避免过度劳累。注意保暖，尤其是腰部和足部。"
    };
    
    return healthTips[element] || "保持良好的作息习惯，适度运动，均衡饮食。";
  };

  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">穿衣指南</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }

  return (
    <div className="lite-page-container">
      <div className="lite-page-header">
        <h2 className="lite-page-title">穿衣指南</h2>
      </div>
      <div className="lite-dress-page" style={{ WebkitOverflowScrolling: 'touch' }}>
      
      {/* <div className="lite-card">
        <h3 className="lite-h3">用户信息</h3>
        <p className="lite-text">昵称: {userInfo.nickname || '未设置'}</p>
        <p className="lite-text">出生日期: {userInfo.birthDate}</p>
      </div> */}
      
      {dressAdvice && (
        <>
          <div className="lite-card">
            <h3 className="lite-h3">今日五行信息</h3>
            <p className="lite-text">日期: {dressAdvice.date} ({dressAdvice.weekday})</p>
            <p className="lite-text">主导五行: {dressAdvice.daily_element}</p>
          </div>
          
          {/* 简化版五行能量趋势图 */}
          <SimpleWuxingTrend dailyElement={dressAdvice.daily_element} />
          
          <div className="lite-card">
            <h3 className="lite-h3">穿衣颜色推荐</h3>
            {dressAdvice.color_suggestions && dressAdvice.color_suggestions.length > 0 ? (
              <div className="color-suggestions">
                {dressAdvice.color_suggestions.map((suggestion, index) => (
                  <div key={index} className="color-suggestion-item lite-card" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}>
                    <p className="lite-text"><strong className="lite-text-bold">{suggestion["颜色系统"]}</strong> ({suggestion["吉凶"]})</p>
                    <p className="lite-text">推荐颜色: {suggestion["具体颜色"].join("、")}</p>
                    <p className="lite-text">说明: {suggestion["描述"]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="lite-text">暂无颜色推荐信息</p>
            )}
          </div>
          
          <div className="lite-card">
            <h3 className="lite-h3">饮食建议</h3>
            {dressAdvice.food_suggestions ? (
              <div className="food-suggestions lite-card">
                <p className="lite-text"><strong className="lite-text-bold">宜食:</strong> {dressAdvice.food_suggestions["宜"].join("、")}</p>
                <p className="lite-text"><strong className="lite-text-bold">忌食:</strong> {dressAdvice.food_suggestions["忌"].join("、")}</p>
              </div>
            ) : (
              <p className="lite-text">暂无饮食建议信息</p>
            )}
          </div>
          
          <div className="lite-card">
            <h3 className="lite-h3">健康提醒</h3>
            <p className="lite-text">{getHealthAdvice(dressAdvice.daily_element)}</p>
          </div>
        </>
      )}
      
      <div className="lite-card">
        <h3 className="lite-h3">穿衣指南说明</h3>
        <p className="lite-text">根据传统五行理论和现代色彩心理学，不同颜色的服装会对人的情绪和运势产生不同的影响。</p>
        <p className="lite-text">选择合适的颜色不仅能让您看起来更有精神，还可能带来更好的心情和运势。</p>
      </div>
      </div>
    </div>
  );
};

export default DressGuideLitePage;