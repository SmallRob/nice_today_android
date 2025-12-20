import React, { useState, useEffect } from 'react';

const DressGuideLitePage = ({ userInfo }) => {
  const [dressAdvice, setDressAdvice] = useState(null);

  useEffect(() => {
    if (userInfo.birthDate) {
      // 简化的穿衣指南逻辑
      // 实际应用中应该根据五行理论计算
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // 示例穿衣建议
      const advice = {
        color: getColorOfTheDay(dayOfWeek),
        description: getDescription(dayOfWeek),
        food: getFoodRecommendation(dayOfWeek)
      };
      
      setDressAdvice(advice);
    }
  }, [userInfo.birthDate]);

  // 根据星期几获取推荐颜色
  const getColorOfTheDay = (day) => {
    const colors = [
      "黑色", // Sunday
      "白色", // Monday
      "红色", // Tuesday
      "绿色", // Wednesday
      "黄色", // Thursday
      "蓝色", // Friday
      "紫色"  // Saturday
    ];
    return colors[day];
  };

  // 根据星期几获取描述
  const getDescription = (day) => {
    const descriptions = [
      "宁静与休息的一天，适合穿深色系服装",
      "清新与纯净的一天，适合穿白色或浅色系服装",
      "活力与激情的一天，适合穿红色系服装",
      "成长与和谐的一天，适合穿绿色系服装",
      "快乐与光明的一天，适合穿黄色系服装",
      "平静与信任的一天，适合穿蓝色系服装",
      "神秘与创意的一天，适合穿紫色系服装"
    ];
    return descriptions[day];
  };

  // 根据星期几获取食物推荐
  const getFoodRecommendation = (day) => {
    const foods = [
      "清淡的食物，如蔬菜汤、水果",
      "新鲜的蔬果，如苹果、梨子",
      "辛辣的食物，如辣椒、生姜",
      "绿色蔬菜，如菠菜、西兰花",
      "黄色食物，如玉米、香蕉",
      "海鲜和咸味食物",
      "紫色食物，如葡萄、茄子"
    ];
    return foods[day];
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
    <div className="lite-dress-page">
      <h2 className="lite-page-title">穿衣指南</h2>
      
      <div className="lite-card">
        <h3>用户信息</h3>
        <p>昵称: {userInfo.nickname || '未设置'}</p>
        <p>出生日期: {userInfo.birthDate}</p>
      </div>
      
      {dressAdvice && (
        <div className="lite-card">
          <h3>今日穿衣建议</h3>
          <p>推荐颜色: {dressAdvice.color}</p>
          <p>说明: {dressAdvice.description}</p>
          <p>饮食建议: {dressAdvice.food}</p>
        </div>
      )}
      
      <div className="lite-card">
        <h3>穿衣指南说明</h3>
        <p>根据传统五行理论和现代色彩心理学，不同颜色的服装会对人的情绪和运势产生不同的影响。</p>
        <p>选择合适的颜色不仅能让您看起来更有精神，还可能带来更好的心情和运势。</p>
      </div>
    </div>
  );
};

export default DressGuideLitePage;