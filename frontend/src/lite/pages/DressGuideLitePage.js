import React, { useState, useEffect } from 'react';
import { generateDressInfo } from '../../services/localDataService';
import '../styles/dressGuideLiteStyles.css';
import '../styles/globalLiteStyles.css';

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
    <div className="lite-dress-page lite-page-container" style={{ WebkitOverflowScrolling: 'touch' }}>
      <h2 className="lite-h2 lite-text-center">穿衣指南</h2>
      
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
  );
};

export default DressGuideLitePage;