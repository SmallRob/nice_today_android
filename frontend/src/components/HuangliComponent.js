import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { calculateLunarDate } from '../utils/LunarCalendarHelper';

// 黄历宜忌数据（简化版）
const HUANGLI_DATA = {
  yi: [
    '结婚', '搬家', '合婚订婚', '动土', '祈福', '栽种', '安床', '出行'
  ],
  ji: [
    '签订合同', '开业', '入宅', '安葬', '破土', '开市', '装修', '开业'
  ]
};

// 根据日期计算黄历吉凶
const calculateAuspiciousness = (lunarInfo) => {
  const ganzhi = lunarInfo.dayGanZhi;
  let score = 50;

  if (['甲子', '丙寅', '戊辰', '庚午', '壬申'].includes(ganzhi)) {
    score += 15;
  } else if (['乙丑', '丁卯', '己巳', '辛未', '癸酉'].includes(ganzhi)) {
    score += 10;
  } else if (['甲戌', '丙子', '戊寅', '庚辰', '壬午'].includes(ganzhi)) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));

  let level = '平';
  if (score >= 70) level = '大吉';
  else if (score >= 60) level = '吉';
  else if (score >= 40) level = '平';
  else if (score >= 30) level = '凶';
  else level = '大凶';

  return { score, level };
};

// 获取指定日期的黄历信息
const getHuangliForDate = (date) => {
  const dateStr = date.toISOString().slice(0, 10);
  const lunarInfo = calculateLunarDate(dateStr);
  const auspiciousness = calculateAuspiciousness(lunarInfo);

  const shuffledYi = [...HUANGLI_DATA.yi].sort(() => 0.5 - Math.random());
  const shuffledJi = [...HUANGLI_DATA.ji].sort(() => 0.5 - Math.random());

  return {
    date: dateStr,
    lunarDate: lunarInfo ? (lunarInfo.dayInChinese === '初一' ? lunarInfo.monthInChinese : lunarInfo.dayInChinese) : '未知',
    ganzhi: lunarInfo?.dayGanZhi || '未知',
    wuxing: lunarInfo?.lunarObject?.getDayWuXing?.() || '未知',
    zhiri: lunarInfo?.lunarObject?.getZhiRi?.() || '未知',
    chongsha: lunarInfo?.lunarObject?.getDayChongShua?.() || '未知',
    pengzu: lunarInfo?.lunarObject?.getPengZuWu?.() || '未知',
    yi: shuffledYi.slice(0, 3),
    ji: shuffledJi.slice(0, 3),
    suitable: shuffledYi[0] || '祈福',
    avoid: shuffledJi[0] || '动土',
    lunarDateShort: lunarInfo ? (lunarInfo.dayInChinese === '初一' ?
      (lunarInfo.monthInChinese.length > 2 ? lunarInfo.monthInChinese.substring(0, 2) : lunarInfo.monthInChinese.charAt(0)) :
      lunarInfo.dayInChinese) : '',
    auspiciousness: auspiciousness
  };
};

const HuangliComponent = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [huangliData, setHuangliData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isToday: isToday(date), huangli: getHuangliForDate(date) });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true, isToday: isToday(date), huangli: getHuangliForDate(date) });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false, isToday: isToday(date), huangli: getHuangliForDate(date) });
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatMonth = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setHuangliData(getHuangliForDate(date));
  };

  useEffect(() => {
    setHuangliData(getHuangliForDate(selectedDate));
  }, [selectedDate]);

  const calendarDays = getCalendarDays();

  return (
    <div className={`space-y-4 max-w-full overflow-hidden ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
      <header className="flex items-center justify-between px-2 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">黄历择吉</h1>
        </div>
      </header>

      <div className={`rounded-2xl p-5 shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{formatDate(selectedDate)}</h2>
        {huangliData && (
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="px-3 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              农历: {huangliData.lunarDate}
            </span>
            <span className="px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              干支: {huangliData.ganzhi}
            </span>
            <span className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              吉凶: {huangliData.auspiciousness.level}
            </span>
          </div>
        )}
      </div>

      <div className={`rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 dark' : 'bg-white border-gray-100 light'
        }`}>
        <div className="flex items-center justify-between mb-6 px-4 pt-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
          </button>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-widest">{formatMonth(currentMonth)}</span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-xl">arrow_forward_ios</span>
          </button>
        </div>

        {/* 星期标题 - 强制 Grid 布局 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            width: '100%',
            marginBottom: '16px'
          }}
        >
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-center text-sm font-semibold text-gray-400 dark:text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 - 强制 Grid 布局 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '24px 4px', // calc(gap-y-6) calc(gap-x-1)
            width: '100%'
          }}
        >
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate.toDateString() === day.date.toDateString();
            const isToday = day.isToday;

            return (
              <div
                key={index}
                onClick={() => selectDate(day.date)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* 圆角方块内容 */}
                <div
                  className={`
                    w-11 h-11 sm:w-12 sm:h-12 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative
                    ${isToday
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105'
                      : isSelected
                        ? 'bg-slate-700 text-white shadow-md scale-105'
                        : day.isCurrentMonth
                          ? theme === 'dark'
                            ? 'text-gray-200 hover:bg-slate-700/50'
                            : 'text-gray-800 hover:bg-gray-100'
                          : theme === 'dark'
                            ? 'text-gray-600'
                            : 'text-gray-300'
                    }
                  `}
                >
                  {/* 日期数字 */}
                  <div className={`font-bold text-lg sm:text-xl leading-none mb-0.5 ${!day.isCurrentMonth && !isSelected && !isToday ? 'opacity-50' : ''
                    }`}>
                    {day.date.getDate()}
                  </div>

                  {/* 吉凶圆点 - 仅在非选中且非今日状态下显示在底部，选中状态不显示以保持简洁，或显示在右上角 */}
                  {(isToday || isSelected) ? null : day.huangli && day.huangli.auspiciousness && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full opacity-80" style={{
                      backgroundColor: day.huangli.auspiciousness.level === '大吉' ? '#ef4444' :
                        day.huangli.auspiciousness.level === '吉' ? '#22c55e' :
                          'transparent'
                    }}></div>
                  )}
                </div>

                {/* 农历日期 - 在圈外显示 */}
                <div className={`text-[10px] sm:text-xs mt-1.5 font-medium truncate w-full text-center ${isSelected || isToday
                    ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                    : !day.isCurrentMonth
                      ? 'opacity-0'
                      : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  {day.huangli?.lunarDateShort || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className={`rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-red-500 font-bold text-lg">close</span>
            <h3 className="text-base font-bold text-red-500">今日禁忌</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {huangliData?.ji.map(item => (
              <div key={item} className="px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-sm text-red-700 dark:text-red-300 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-500 text-white rounded w-5 h-5 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm font-bold">check</span>
            </div>
            <h3 className="text-base font-bold text-green-500">宜做之事</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {huangliData?.yi.map(item => (
              <div key={item} className="px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 text-sm text-green-700 dark:text-green-300 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">详细信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">五行:</span>
            <span className="text-amber-500 dark:text-yellow-400 font-medium">{huangliData?.wuxing}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">值日:</span>
            <span className="text-amber-500 dark:text-yellow-400 font-medium">{huangliData?.zhiri}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">冲煞:</span>
            <span className="text-amber-500 dark:text-yellow-400 font-medium">{huangliData?.chongsha}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">彭祖:</span>
            <span className="text-amber-500 dark:text-yellow-400 font-medium">{huangliData?.pengzu}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">吉凶等级:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${huangliData?.auspiciousness.level === '大吉' ? 'bg-red-500 text-white' :
              huangliData?.auspiciousness.level === '吉' ? 'bg-green-500 text-white' :
                'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200'
              }`}>
              {huangliData?.auspiciousness.level || '平'}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({huangliData?.auspiciousness.score})</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${huangliData?.auspiciousness.score >= 70 ? 'bg-red-500' :
                  huangliData?.auspiciousness.score >= 60 ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                style={{ width: `${huangliData?.auspiciousness.score || 50}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 shadow-sm bg-gradient-to-br from-indigo-700 via-purple-800 to-indigo-900 dark:from-slate-800 dark:via-purple-900/50 dark:to-slate-900 border border-indigo-200/20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="text-xl">💡</span>
          <h3 className="text-lg font-bold">择吉建议</h3>
        </div>
        <p className="text-sm text-indigo-100 leading-relaxed relative z-10 opacity-90">
          今日{huangliData?.suitable}为佳，{huangliData?.avoid}为忌。建议在吉时进行重要活动，避开凶时。
        </p>
      </div>
    </div>
  );
};

export default HuangliComponent;