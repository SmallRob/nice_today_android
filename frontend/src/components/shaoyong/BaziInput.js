import { useState } from 'react';
import { Lunar } from 'lunar-javascript';
import './BaziInput.css';

const BaziInput = ({ onSubmit }) => {
  const [method, setMethod] = useState('manual');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');

  // 八字各柱
  const [yearStem, setYearStem] = useState('甲');
  const [yearBranch, setYearBranch] = useState('子');
  const [monthStem, setMonthStem] = useState('甲');
  const [monthBranch, setMonthBranch] = useState('子');
  const [dayStem, setDayStem] = useState('甲');
  const [dayBranch, setDayBranch] = useState('子');
  const [hourStem, setHourStem] = useState('甲');
  const [hourBranch, setHourBranch] = useState('子');

  const [gender, setGender] = useState('male');
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // 天干地支选项
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 自动排盘
  const handleAutoCalculate = () => {
    if (!birthDate) {
      alert('请先选择出生日期');
      return;
    }

    try {
      const lunar = Lunar.fromDate(new Date(birthDate + ' ' + birthTime));

      // 年柱
      const yearGanzhi = lunar.getYearInGanZhi();
      setYearStem(yearGanzhi.charAt(0));
      setYearBranch(yearGanzhi.charAt(1));

      // 月柱
      const monthGanzhi = lunar.getMonthInGanZhi();
      setMonthStem(monthGanzhi.charAt(0));
      setMonthBranch(monthGanzhi.charAt(1));

      // 日柱
      const dayGanzhi = lunar.getDayInGanZhi();
      setDayStem(dayGanzhi.charAt(0));
      setDayBranch(dayGanzhi.charAt(1));

      // 时柱
      const hourGanzhi = lunar.getTimeInGanZhi();
      setHourStem(hourGanzhi.charAt(0));
      setHourBranch(hourGanzhi.charAt(1));

      // 检查是否闰月
      setIsLeapMonth(lunar.getMonth() > 12);

    } catch (error) {
      console.error('排盘错误:', error);
      alert('排盘失败，请检查日期格式');
    }
  };

  // 随机生成八字
  const handleRandomBazi = () => {
    const randomStem = () => heavenlyStems[Math.floor(Math.random() * 10)];
    const randomBranch = () => earthlyBranches[Math.floor(Math.random() * 12)];

    setYearStem(randomStem());
    setYearBranch(randomBranch());
    setMonthStem(randomStem());
    setMonthBranch(randomBranch());
    setDayStem(randomStem());
    setDayBranch(randomBranch());
    setHourStem(randomStem());
    setHourBranch(randomBranch());
    setGender(Math.random() > 0.5 ? 'male' : 'female');

    // 生成随机日期（1900-2023）
    const randomYear = Math.floor(Math.random() * 124) + 1900;
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomDate = `${randomYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`;

    setBirthDate(randomDate);
    setBirthTime(`${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`);
  };

  // 提交八字
  const handleSubmit = () => {
    const baziData = {
      year: { stem: yearStem, branch: yearBranch },
      month: { stem: monthStem, branch: monthBranch },
      day: { stem: dayStem, branch: dayBranch },
      hour: { stem: hourStem, branch: hourBranch },
      gender,
      isLeapMonth,
      solarDate: birthDate,
      lunarDate: birthDate ? Lunar.fromDate(new Date(birthDate)).toString() : '',
      birthTime
    };

    onSubmit(baziData);
  };

  // 天干地支对应关系说明
  const stemBranchInfo = {
    甲: { wuxing: '木', yinyang: '阳', direction: '东' },
    乙: { wuxing: '木', yinyang: '阴', direction: '东' },
    丙: { wuxing: '火', yinyang: '阳', direction: '南' },
    丁: { wuxing: '火', yinyang: '阴', direction: '南' },
    戊: { wuxing: '土', yinyang: '阳', direction: '中' },
    己: { wuxing: '土', yinyang: '阴', direction: '中' },
    庚: { wuxing: '金', yinyang: '阳', direction: '西' },
    辛: { wuxing: '金', yinyang: '阴', direction: '西' },
    壬: { wuxing: '水', yinyang: '阳', direction: '北' },
    癸: { wuxing: '水', yinyang: '阴', direction: '北' }
  };

  const branchInfo = {
    子: { zodiac: '鼠', wuxing: '水', season: '冬', hour: '23-1' },
    丑: { zodiac: '牛', wuxing: '土', season: '冬', hour: '1-3' },
    寅: { zodiac: '虎', wuxing: '木', season: '春', hour: '3-5' },
    卯: { zodiac: '兔', wuxing: '木', season: '春', hour: '5-7' },
    辰: { zodiac: '龙', wuxing: '土', season: '春', hour: '7-9' },
    巳: { zodiac: '蛇', wuxing: '火', season: '夏', hour: '9-11' },
    午: { zodiac: '马', wuxing: '火', season: '夏', hour: '11-13' },
    未: { zodiac: '羊', wuxing: '土', season: '夏', hour: '13-15' },
    申: { zodiac: '猴', wuxing: '金', season: '秋', hour: '15-17' },
    酉: { zodiac: '鸡', wuxing: '金', season: '秋', hour: '17-19' },
    戌: { zodiac: '狗', wuxing: '土', season: '秋', hour: '19-21' },
    亥: { zodiac: '猪', wuxing: '水', season: '冬', hour: '21-23' }
  };

  return (
    <div className="bazi-input">
      <div className="method-selector">
        <button
          className={`method-btn ${method === 'manual' ? 'active' : ''}`}
          onClick={() => setMethod('manual')}
        >
          手动输入八字
        </button>
        <button
          className={`method-btn ${method === 'auto' ? 'active' : ''}`}
          onClick={() => setMethod('auto')}
        >
          公历自动排盘
        </button>
      </div>

      {method === 'auto' && (
        <div className="auto-input">
          <div className="form-row">
            <div className="form-group">
              <label>出生日期</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>出生时间</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>性别</label>
              <div className="gender-selector">
                <button
                  className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  <span>男</span>
                </button>
                <button
                  className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  <span>女</span>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>闰月</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  id="leap-month"
                />
                <label htmlFor="leap-month">是否闰月出生</label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleAutoCalculate}>
              自动排盘
            </button>
            <button className="btn-secondary" onClick={handleRandomBazi}>
              随机八字
            </button>
          </div>
        </div>
      )}

      <div className="bazi-display-input">
        <h4>四柱八字</h4>
        <div className="bazi-grid">
          <div className="bazi-column">
            <div className="bazi-label">年柱</div>
            <div className="bazi-selectors">
              <select value={yearStem} onChange={(e) => setYearStem(e.target.value)}>
                {heavenlyStems.map(stem => (
                  <option key={stem} value={stem}>
                    {stem} ({stemBranchInfo[stem].wuxing} {stemBranchInfo[stem].yinyang})
                  </option>
                ))}
              </select>
              <select value={yearBranch} onChange={(e) => setYearBranch(e.target.value)}>
                {earthlyBranches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch} ({branchInfo[branch].zodiac})
                  </option>
                ))}
              </select>
            </div>
            <div className="bazi-info">
              {yearStem && yearBranch && (
                <>
                  <span className="whitespace-nowrap">{stemBranchInfo[yearStem].wuxing}{stemBranchInfo[yearStem].yinyang}年</span>
                  <span className="whitespace-nowrap">{branchInfo[yearBranch].zodiac}年</span>
                </>
              )}
            </div>
          </div>

          <div className="bazi-column">
            <div className="bazi-label whitespace-nowrap">月柱</div>
            <div className="bazi-selectors">
              <select value={monthStem} onChange={(e) => setMonthStem(e.target.value)}>
                {heavenlyStems.map(stem => (
                  <option key={stem} value={stem}>{stem}</option>
                ))}
              </select>
              <select value={monthBranch} onChange={(e) => setMonthBranch(e.target.value)}>
                {earthlyBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="bazi-info">
              {monthBranch && <span className="whitespace-nowrap">{branchInfo[monthBranch].season}季</span>}
            </div>
          </div>

          <div className="bazi-column">
            <div className="bazi-label whitespace-nowrap">日柱</div>
            <div className="bazi-selectors">
              <select value={dayStem} onChange={(e) => setDayStem(e.target.value)}>
                {heavenlyStems.map(stem => (
                  <option key={stem} value={stem}>{stem}</option>
                ))}
              </select>
              <select value={dayBranch} onChange={(e) => setDayBranch(e.target.value)}>
                {earthlyBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="bazi-info">
              {dayStem && <span className="whitespace-nowrap">日主{dayStem}{stemBranchInfo[dayStem].wuxing}</span>}
            </div>
          </div>

          <div className="bazi-column">
            <div className="bazi-label">时柱</div>
            <div className="bazi-selectors">
              <select value={hourStem} onChange={(e) => setHourStem(e.target.value)}>
                {heavenlyStems.map(stem => (
                  <option key={stem} value={stem}>{stem}</option>
                ))}
              </select>
              <select value={hourBranch} onChange={(e) => setHourBranch(e.target.value)}>
                {earthlyBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="bazi-info">
              {hourBranch && <span className="whitespace-nowrap">{branchInfo[hourBranch].hour}时</span>}
            </div>
          </div>
        </div>

        <div className="gender-selection">
          <label>性别：</label>
          <div className="gender-buttons">
            <button
              className={`gender-option ${gender === 'male' ? 'active' : ''}`}
              onClick={() => setGender('male')}
            >
              <span>男命</span>
            </button>
            <button
              className={`gender-option ${gender === 'female' ? 'active' : ''}`}
              onClick={() => setGender('female')}
            >
              <span>女命</span>
            </button>
          </div>
          <div className="gender-note">
            <span>{gender === 'male' ? '男命顺行，大运顺排' : '女命逆行，大运逆排'}</span>
          </div>
        </div>

        <div className="bazi-summary">
          <h4>八字摘要</h4>
          <div className="summary-content">
            <p>
              {yearStem}{yearBranch}年 {monthStem}{monthBranch}月 {dayStem}{dayBranch}日 {hourStem}{hourBranch}时
            </p>
            <p>
              {gender === 'male' ? '男' : '女'}命，日主{dayStem}{stemBranchInfo[dayStem].wuxing}
              ，生于{branchInfo[yearBranch].zodiac}年{branchInfo[monthBranch].season}季
            </p>
          </div>
        </div>

        <div className="submit-section">
          <button className="btn-primary" onClick={handleSubmit}>
            确认八字，开始皇极起数
          </button>
          <button className="btn-secondary" onClick={handleRandomBazi}>
            随机生成八字
          </button>
        </div>
      </div>

      <div className="bazi-guide">
        <h4>八字输入指南</h4>
        <div className="guide-content">
          <p><strong>年柱：</strong>出生年份的天干地支，代表祖上、父母</p>
          <p><strong>月柱：</strong>出生月份的天干地支，代表兄弟、事业</p>
          <p><strong>日柱：</strong>出生日的天干地支，日干代表自己，日支代表配偶</p>
          <p><strong>时柱：</strong>出生时辰的天干地支，代表子女、晚年</p>
          <p><strong>性别：</strong>铁板神数男女命推算方法不同，必须准确选择</p>
        </div>
      </div>
    </div>
  );
};

export default BaziInput;