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
      
      // 标准化日期，避免时区差异影响
      const normalizedTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const normalizedReferenceDate = new Date(this.REFERENCE_DATE.getFullYear(), this.REFERENCE_DATE.getMonth(), this.REFERENCE_DATE.getDate());

      // 计算从参考日期到目标日期的天数
      const timeDiff = normalizedTargetDate.getTime() - normalizedReferenceDate.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24)); // 使用round确保精确计算

      // 计算KIN数（1-260的循环）
      let kin = this.REFERENCE_KIN + daysDiff;
      kin = ((kin - 1) % 260) + 1;
      if (kin <= 0) kin += 260; // 确保KIN数在1-260范围内

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

  // 计算当日能量强度
  static calculateEnergyLevel(kin, toneIndex, sealIndex) {
    // 基于KIN数、调性和图腾计算能量强度 (0-100)
    // 使用简单的算法：基于KIN数的周期性变化
    const baseEnergy = (kin % 20) * 5; // 0-95
    
    // 根据调性调整能量
    const toneModifier = toneIndex * 2; // 0-24
    
    // 根据图腾调整能量
    const sealModifier = sealIndex * 1.5; // 0-28.5
    
    // 计算最终能量值 (0-100)
    let energy = baseEnergy + toneModifier + sealModifier;
    
    // 确保能量值在0-100范围内
    energy = Math.min(Math.max(energy, 0), 100);
    
    return Math.round(energy);
  }

  // 获取能量强度描述
  static getEnergyDescription(energyLevel) {
    if (energyLevel >= 80) return '高能量';
    if (energyLevel >= 60) return '中高能量';
    if (energyLevel >= 40) return '中等能量';
    if (energyLevel >= 20) return '中低能量';
    return '低能量';
  }
}

const MOOD_ICONS = [
  { icon: '😊', label: '开心' },
  { icon: '😀', label: '愉快' },
  { icon: '😐', label: '一般' },
  { icon: '😢', label: '伤心' },
  { icon: '😠', label: '生气' },
  { icon: '😴', label: '疲劳' },
  { icon: '🤯', label: '压力' },
  { icon: '🤒', label: '不适' },
];

const SYMPTOMS = [
  { label: '痛经', icon: '😭' },
  { label: '头痛', icon: '🤕' },
  { label: '疲劳', icon: '😴' },
  { label: '腹胀', icon: '🤰' },
  { label: '情绪波动', icon: '😤' },
  { label: '恶心', icon: '🤢' },
];

const MayaCalendarLitePage = ({ userInfo }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // 用于切换月份的主日期
  const [mayaData, setMayaData] = useState(null);
  const [moodRecords, setMoodRecords] = useState({});
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [writingMood, setWritingMood] = useState({
    date: '',
    moodLevel: 3,
    symptoms: [],
    note: '',
    moodIcon: '😊'
  });

  // 从本地存储加载心情记录
  useEffect(() => {
    const savedRecords = localStorage.getItem('maya_mood_records');
    if (savedRecords) {
      try {
        setMoodRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error('加载心情记录失败:', error);
      }
    }
  }, []);

  // 保存心情记录到本地存储
  useEffect(() => {
    if (Object.keys(moodRecords).length > 0) {
      localStorage.setItem('maya_mood_records', JSON.stringify(moodRecords));
    }
  }, [moodRecords]);

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
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const handleOpenMoodModal = () => {
    const dateStr = formatDate(new Date());
    const existing = moodRecords[dateStr] || {
      date: dateStr,
      moodLevel: 3,
      symptoms: [],
      note: '',
      moodIcon: '😊'
    };
    setWritingMood(existing);
    setIsEditingMood(true);
    setShowMoodModal(true);
  };

  const handleViewMood = (dateStr) => {
    const record = moodRecords[dateStr];
    if (record) {
      setWritingMood(record);
      setIsEditingMood(false);
      setShowMoodModal(true);
    }
  };

  const handleSaveMood = () => {
    const dateStr = writingMood.date;
    setMoodRecords(prev => ({
      ...prev,
      [dateStr]: writingMood
    }));
    setShowMoodModal(false);
  };

  const handleToggleSymptom = (label) => {
    if (!isEditingMood) return;
    setWritingMood(prev => {
      const symptoms = prev.symptoms.includes(label)
        ? prev.symptoms.filter(s => s !== label)
        : [...prev.symptoms, label];
      return { ...prev, symptoms };
    });
  };

  // 渲染月历
  const renderCalendar = () => {
    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

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
      <div className="calendar-content">
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
            const dateStr = formatDate(date);
            const mood = moodRecords[dateStr];

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
                onClick={() => handleDateSelect(date)}
              >
                <div className="item">
                  <span className="num">{date.getDate()}</span>
                  {mood && <span className="mood-dot">{mood.moodIcon}</span>}
                </div>
              </li>
            );
          })}
        </ol>
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
    <div className="lite-page-container">
      <div className="lite-page-header">
        <h2 className="lite-page-title">玛雅日历</h2>
      </div>
      <div className="lite-maya-page">

        {/* 月历 */}
        <div className="lite-card">
          <div className="calendar">
            <div className="hd-nav">
              <button className="nav-btn" onClick={prevMonth}>&lt;</button>
              <div>
                <span className="year">{viewDate.getFullYear()}</span>
                <span className="month">{viewDate.getMonth() + 1}</span>
              </div>
              <button className="nav-btn" onClick={nextMonth}>&gt;</button>
            </div>
            <div className="bd">
              {renderCalendar()}
            </div>
          </div>
        </div>

        <div className="lite-card">
          <div className="lite-flex lite-justify-between lite-items-center">
            <div>
              <h3 className="lite-h3" style={{ margin: 0 }}>用户信息</h3>
              <p className="lite-text-sm lite-mb-0">昵称: {userInfo.nickname || '未设置'}</p>
              <p className="lite-text-sm lite-mb-0">出生日期: {userInfo.birthDate}</p>
            </div>
            <div>
              {formatDate(selectedDate) === formatDate(new Date()) ? (
                <button className="lite-button lite-button-sm" onClick={handleOpenMoodModal}>
                  {moodRecords[formatDate(new Date())] ? '修改记录' : '记录健康'}
                </button>
              ) : (
                moodRecords[formatDate(selectedDate)] && (
                  <button className="lite-button lite-button-sm" onClick={() => handleViewMood(formatDate(selectedDate))}>
                    查看记录
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* 玛雅信息 */}
        {mayaData && (
          <div className="lite-card">
            <h3 className="lite-h3">玛雅历法信息 - {formatDate(selectedDate)}</h3>
            <div className="lite-grid lite-grid-cols-3">
              <div className="lite-text-center" style={{ border: '1px solid var(--border-color)', padding: '12px 0', borderRadius: '4px' }}>
                <div className="lite-text-muted lite-text-sm">KIN</div>
                <div className="lite-text-lg lite-text-bold">{mayaData.kin}</div>
              </div>
              <div className="lite-text-center" style={{ border: '1px solid var(--border-color)', padding: '12px 0', borderRadius: '4px' }}>
                <div className="lite-text-muted lite-text-sm">调性</div>
                <div className="lite-text-lg lite-text-bold">{mayaData.tone}</div>
              </div>
              <div className="lite-text-center" style={{ border: '1px solid var(--border-color)', padding: '12px 0', borderRadius: '4px' }}>
                <div className="lite-text-muted lite-text-sm">图腾</div>
                <div className="lite-text-lg lite-text-bold">{mayaData.seal}</div>
              </div>
            </div>
            <div className="lite-text-center lite-mt-base" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)' }}>
              <div className="lite-text-xl lite-text-bold" style={{ letterSpacing: '2px' }}>{mayaData.fullName}</div>
            </div>

            {/* 当日能量强度提示条 */}
            <div className="energy-bar-container">
              <div className="energy-bar-header">
                <h4 className="energy-bar-title">当日能量强度</h4>
                <span className="energy-bar-value">
                  {SimpleMayaCalendarUtils.calculateEnergyLevel(mayaData.kin, mayaData.toneIndex, mayaData.sealIndex)}% - 
                  {SimpleMayaCalendarUtils.getEnergyDescription(SimpleMayaCalendarUtils.calculateEnergyLevel(mayaData.kin, mayaData.toneIndex, mayaData.sealIndex))}
                </span>
              </div>
              <div className="energy-bar">
                <div 
                  className="energy-bar-fill energy-bar-pulse"
                  style={{ 
                    width: `${SimpleMayaCalendarUtils.calculateEnergyLevel(mayaData.kin, mayaData.toneIndex, mayaData.sealIndex)}%` 
                  }}
                ></div>
              </div>
              <div className="energy-bar-labels">
                <span>低能量</span>
                <span>中等能量</span>
                <span>高能量</span>
              </div>
            </div>

            {/* 每日启示 */}
            <div className="lite-mt-base">
              <h4 className="lite-h4">今日启示</h4>
              <p className="lite-text" style={{ borderLeft: '2px solid var(--text-primary)', paddingLeft: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                {SimpleMayaCalendarUtils.getDailyInspiration(mayaData.kin)}
              </p>
            </div>
          </div>
        )}

        {/* 玛雅知识小卡片 */}
        <div className="lite-card knowledge-card">
          <h3 className="knowledge-card-title">玛雅历法知识</h3>
          <div className="knowledge-grid">
            <div className="knowledge-item">
              <div className="knowledge-header">
                <span className="knowledge-type">13种调性</span>
                <span className="knowledge-cycle">银河音调</span>
              </div>
              <p className="lite-text-sm knowledge-description">
                代表宇宙的振动频率，从磁性到宇宙，每个调性都有独特的能量特质和指引方向。
              </p>
            </div>

            <div className="knowledge-item">
              <div className="knowledge-header">
                <span className="knowledge-type">20种图腾</span>
                <span className="knowledge-cycle">太阳印记</span>
              </div>
              <p className="lite-text-sm knowledge-description">
                象征自然的能量原型，从红龙到黄太阳，每个图腾都承载着特定的智慧和品质。
              </p>
            </div>

            <div className="knowledge-item">
              <div className="knowledge-header">
                <span className="knowledge-type">260天周期</span>
                <span className="knowledge-cycle">神圣历法</span>
              </div>
              <p className="lite-text-sm knowledge-description">
                13调性 × 20图腾 = 260天的神圣周期，对应人类的孕育周期和银河的振动频率。
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 心情记录模态框 */}
      {showMoodModal && (
        <div className="mood-modal-overlay" onClick={() => setShowMoodModal(false)}>
          <div className="mood-modal" onClick={e => e.stopPropagation()}>
            <div className="mood-modal-header">
              <h3 className="lite-h3 lite-m-0">{isEditingMood ? '添加健康记录' : '查看健康记录'}</h3>
              <button className="mood-modal-close" onClick={() => setShowMoodModal(false)}>&times;</button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div className="lite-flex lite-justify-between lite-items-center">
                <label className="lite-text-sm">记录日期</label>
                <div className="lite-text-sm lite-text-bold">{writingMood.date}</div>
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label className="lite-text-sm">今日状态</label>
              <div className="mood-icons-grid">
                {MOOD_ICONS.map(item => (
                  <div
                    key={item.label}
                    className={`mood-icon-item ${writingMood.moodIcon === item.icon ? 'active' : ''}`}
                    onClick={() => isEditingMood && setWritingMood(prev => ({ ...prev, moodIcon: item.icon }))}
                  >
                    <span className="emoji">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label className="lite-text-sm">健康记录</label>
              <div className="symptoms-grid">
                {SYMPTOMS.map(item => (
                  <div
                    key={item.label}
                    className="symptom-item"
                    onClick={() => handleToggleSymptom(item.label)}
                  >
                    <input
                      type="checkbox"
                      checked={writingMood.symptoms.includes(item.label)}
                      readOnly
                      disabled={!isEditingMood}
                    />
                    <span className="lite-text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mood-level-container">
              <div className="lite-flex lite-justify-between">
                <label className="lite-text-sm">情绪指数</label>
                <span className="lite-text-bold lite-text-sm" style={{ color: 'var(--text-primary)' }}>{writingMood.moodLevel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                className="mood-slider"
                value={writingMood.moodLevel}
                onChange={e => isEditingMood && setWritingMood(prev => ({ ...prev, moodLevel: parseInt(e.target.value) }))}
                disabled={!isEditingMood}
              />
              <div className="mood-level-display">
                <span>低落</span>
                <span>极佳</span>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className="lite-text-sm">备注</label>
              <textarea
                className="lite-input"
                rows="2"
                value={writingMood.note}
                onChange={e => isEditingMood && setWritingMood(prev => ({ ...prev, note: e.target.value }))}
                placeholder="添加备注..."
                disabled={!isEditingMood}
                style={{ resize: 'none', padding: '6px', fontSize: '13px' }}
              />
            </div>

            {isEditingMood && (
              <div className="lite-flex lite-gap-base">
                <button
                  className="lite-button lite-button-sm"
                  style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  onClick={() => setShowMoodModal(false)}
                >
                  取消
                </button>
                <button
                  className="lite-button lite-button-sm"
                  style={{ flex: 1 }}
                  onClick={handleSaveMood}
                >
                  保存记录
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MayaCalendarLitePage;