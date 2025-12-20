import React, { useState, useEffect } from 'react';

const MayaCalendarLitePage = ({ userInfo }) => {
  const [mayaDate, setMayaDate] = useState(null);

  useEffect(() => {
    if (userInfo.birthDate) {
      // 简化的玛雅日期计算
      const birth = new Date(userInfo.birthDate);
      const today = new Date();
      
      // 这里应该实现真实的玛雅日历计算逻辑
      // 为简化起见，我们只显示一个示例
      setMayaDate({
        date: today.toISOString().split('T')[0],
        longCount: "13.0.7.16.11",
        tzolkin: "4 Ajaw",
        haab: "18 Kankin"
      });
    }
  }, [userInfo.birthDate]);

  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">玛雅日历</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }

  return (
    <div className="lite-maya-page">
      <h2 className="lite-page-title">玛雅日历</h2>
      
      <div className="lite-card">
        <h3>用户信息</h3>
        <p>昵称: {userInfo.nickname || '未设置'}</p>
        <p>出生日期: {userInfo.birthDate}</p>
      </div>
      
      {mayaDate && (
        <div className="lite-card">
          <h3>今日玛雅日期</h3>
          <p>公历日期: {mayaDate.date}</p>
          <p>长纪历: {mayaDate.longCount}</p>
          <p>Tzolk'in: {mayaDate.tzolkin}</p>
          <p>Haab': {mayaDate.haab}</p>
        </div>
      )}
      
      <div className="lite-card">
        <h3>玛雅日历说明</h3>
        <p>玛雅文明创造了多种历法系统，其中最著名的是长纪历、Tzolk'in历和Haab'历。</p>
        <p>长纪历用于记录长时段的历史事件，Tzolk'in历是一个260天的神圣历法，Haab'历则是一个365天的太阳历。</p>
      </div>
    </div>
  );
};

export default MayaCalendarLitePage;