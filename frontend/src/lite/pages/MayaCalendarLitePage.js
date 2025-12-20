import React, { useState, useEffect } from 'react';
import '../styles/globalLiteStyles.css';
import '../styles/mayaLiteStyles.css';

// 简化的玛雅历法计算工具类
class SimpleMayaCalendarUtils {
  // 13种调性（银河音调）
  static TONES = [
    '磁性', '月亮', '电力', '自我存在', '超频', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];
  
  // 20种图腾（太阳印记）
  static SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', '黄星星',
    '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜', '蓝风暴', '黄太阳'
  ];
  
  // 参考日期：2025年9月23日 = KIN 183 磁性的蓝夜
  static REFERENCE_DATE = new Date('2025-09-23');
  static REFERENCE_KIN = 183;
  
  // 简化的玛雅日期计算
  static calculateMayaDate(gregorianDate) {
    try {
      const targetDate = new Date(gregorianDate);
      
      // 计算从参考日期到目标日期的天数
      const timeDiff = targetDate.getTime() - this.REFERENCE_DATE.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // 计算KIN数（1-260的循环）
      let kin = this.REFERENCE_KIN + daysDiff;
      kin = ((kin - 1) % 260) + 1;
      
      // 从KIN数计算调性和图腾
      const toneIndex = (kin - 1) % 13;
      const sealIndex = (kin - 1) % 20;
      
      const tone = this.TONES[toneIndex];
      const seal = this.SEALS[sealIndex];
      
      return {
        kin: kin,
        tone: tone,
        seal: seal,
        fullName: `${tone}的${seal}`,
        daysDiff: daysDiff,
        toneIndex: toneIndex,
        sealIndex: sealIndex
      };
    } catch (error) {
      console.error('计算玛雅日期失败:', error);
      return {
        kin: 1,
        tone: this.TONES[0],
        seal: this.SEALS[0],
        fullName: `${this.TONES[0]}的${this.SEALS[0]}`,
        daysDiff: 0,
        toneIndex: 0,
        sealIndex: 0
      };
    }
  }
  
  // 生成简单的每日启示
  static getDailyInspiration(kin) {
    const inspirations = [
      "相信自己的直觉，它会引导你走向正确的道路。",
      "今天的能量非常适合开始新项目或做出重要决定。",
      "保持开放的心态，接受生活带来的惊喜。",
      "专注于当下，珍惜每一刻的独特体验。",
      "与他人分享你的知识和经验，这会让你感到充实。",
      "倾听内心的声音，它知道什么对你最重要。",
      "保持耐心，好事会在适当的时候发生。",
      "今天是表达感激之情的绝佳时机。",
      "信任宇宙的安排，一切都在正确的轨道上。",
      "花点时间照顾自己，你的身心健康很重要。"
    ];
    
    // 使用KIN数作为种子生成确定性的启示
    const seed = kin % inspirations.length;
    return inspirations[seed];
  }
}

const MayaCalendarLitePage = ({ userInfo }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mayaData, setMayaData] = useState(null);
  
  // 计算选中日期的玛雅信息
  useEffect(() => {
    if (userInfo.birthDate) {
      const calculated = SimpleMayaCalendarUtils.calculateMayaDate(selectedDate);
      setMayaData(calculated);
    }
  }, [userInfo.birthDate, selectedDate]);
  
  // 处理日期选择
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  // 渲染月历
  const renderCalendar = () => {
    const today = new Date();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几 (0=Sunday, 1=Monday, ..., 6=Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取当月天数
    const daysInMonth = lastDay.getDate();
    
    // 创建日期数组
    const dates = [];
    
    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // 添加当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - dates.length; // 6行7列
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    
    // 星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return (
      <div className="calendar">
        <section>
          <div className="hd">
            <span className="year">{year}</span>
            <span className="month">{month + 1}</span>
          </div>
          <div className="bd">
            <ol className="weeks">
              {weekdays.map((day, index) => (
                <li key={index} className={`week_${index}`}>
                  {day}
                </li>
              ))}
            </ol>
            <ol className="days">
              {dates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                let className = '';
                if (!isCurrentMonth) className += 'other ';
                if (isToday) className += 'now ';
                if (isSelected) className += 'selected ';
                
                // 高亮周末
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0) className += 'sun ';
                if (dayOfWeek === 6) className += 'sat ';
                
                return (
                  <li 
                    key={index} 
                    className={className.trim()}
                    onClick={() => isCurrentMonth && handleDateSelect(date)}
                  >
                    <div className="item">
                      <span className="num">{date.getDate()}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    );
  };
  
  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">玛雅日历</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }
  
  return (
    <div className="lite-maya-page lite-page-container">
      <h2 className="lite-h2 lite-text-center">玛雅日历</h2>
      
      {/* 月历 */}
      <div className="lite-card">
        <h3 className="lite-h3">选择日期</h3>
        {renderCalendar()}
      </div>
      
      <div className="lite-card">
        <h3 className="lite-h3">用户信息</h3>
        <p className="lite-text">昵称: {userInfo.nickname || '未设置'}</p>
        <p className="lite-text">出生日期: {userInfo.birthDate}</p>
      </div>
      
      {/* 玛雅信息 */}
      {mayaData && (
        <div className="lite-card">
          <h3 className="lite-h3">玛雅历法信息 - {selectedDate.toISOString().split('T')[0]}</h3>
          <div className="lite-grid lite-grid-cols-3">
            <div className="lite-card lite-text-center">
              <div className="lite-text-muted">KIN</div>
              <div className="lite-text-lg lite-text-bold">{mayaData.kin}</div>
            </div>
            <div className="lite-card lite-text-center">
              <div className="lite-text-muted">调性</div>
              <div className="lite-text-lg lite-text-bold">{mayaData.tone}</div>
            </div>
            <div className="lite-card lite-text-center">
              <div className="lite-text-muted">图腾</div>
              <div className="lite-text-lg lite-text-bold">{mayaData.seal}</div>
            </div>
          </div>
          <div className="lite-card lite-text-center lite-mt-base">
            <div className="lite-text-xl lite-text-bold">{mayaData.fullName}</div>
          </div>
          
          {/* 每日启示 */}
          <div className="lite-card lite-mt-base">
            <h4 className="lite-h4">今日启示</h4>
            <p className="lite-text">{SimpleMayaCalendarUtils.getDailyInspiration(mayaData.kin)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MayaCalendarLitePage;