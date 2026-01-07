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

// 根据日期计算黄历吉凶（基于干支和传统算法）
const calculateAuspiciousness = (lunarInfo) => {
  const ganzhi = lunarInfo.dayGanZhi;
  
  // 计算吉凶分数（0-100）
  let score = 50; // 基础分数
  
  // 根据天干地支组合调整分数
  if (['甲子', '丙寅', '戊辰', '庚午', '壬申'].includes(ganzhi)) {
    score += 15; // 大吉日
  } else if (['乙丑', '丁卯', '己巳', '辛未', '癸酉'].includes(ganzhi)) {
    score += 10; // 吉日
  } else if (['甲戌', '丙子', '戊寅', '庚辰', '壬午'].includes(ganzhi)) {
    score += 5; // 小吉
  }
  
  // 确保分数在合理范围内
  score = Math.max(0, Math.min(100, score));
  
  // 确定吉凶等级
  let level = '平';
  if (score >= 70) level = '大吉';
  else if (score >= 60) level = '吉';
  else if (score >= 40) level = '平';
  else if (score >= 30) level = '凶';
  else level = '大凶';
  
  return {
    score,
    level
  };
};

// 获取指定日期的黄历信息
const getHuangliForDate = (date) => {
  // 生成基于日期的宜忌数据
  const dateStr = date.toISOString().slice(0, 10);
  
  // 使用 LunarCalendarHelper 获取准确的农历信息
  const lunarInfo = calculateLunarDate(dateStr);
  
  // 计算吉凶
  const auspiciousness = calculateAuspiciousness(lunarInfo);
  
  // 从宜忌数据中随机选择几个
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
    yi: shuffledYi.slice(0, 3), // 随机选择几个宜事项
    ji: shuffledJi.slice(0, 3), // 随机选择几个忌事项
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
  const [showCalendar, setShowCalendar] = useState(true); // Show calendar by default

  // 计算当前月份的日历
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: date,
        isCurrentMonth: false,
        isToday: isToday(date),
        huangli: getHuangliForDate(date)
      });
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date,
        isCurrentMonth: true,
        isToday: isToday(date),
        huangli: getHuangliForDate(date)
      });
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date,
        isCurrentMonth: false,
        isToday: isToday(date),
        huangli: getHuangliForDate(date)
      });
    }
    
    return days;
  };

  // 检查是否是今天
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 格式化日期显示
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 格式化月份显示
  const formatMonth = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 切换月份
  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // 选择日期
  const selectDate = (date) => {
    setSelectedDate(date);
    setHuangliData(getHuangliForDate(date));
    setShowCalendar(false);
  };

  // 获取指定日期的黄历数据
  useEffect(() => {
    setHuangliData(getHuangliForDate(selectedDate));
  }, [selectedDate]);

  const calendarDays = getCalendarDays();

  return (
    <div className={`huangli-component rounded-xl shadow-lg overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700' 
        : 'bg-white/90 backdrop-blur-sm border border-gray-200'
    }`}>
      {/* 头部 - 优化版 */}
      <div className={`p-3 border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            <span className="mr-2">📅</span> 黄历择吉
          </h2>
        </div>
        
        {/* 当前选择日期显示 - 优化版 */}
        <div className={`p-2 rounded-lg mb-3 ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-amber-50'
        }`}>
          <div className={`text-base sm:text-lg font-semibold mb-1 truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {formatDate(selectedDate)}
          </div>
          {huangliData && (
            <div className="flex flex-wrap gap-1 text-xs">
              <span className={`px-1.5 py-0.5 rounded ${
                theme === 'dark' ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
              }`}>
                农历: {huangliData.lunarDate}
              </span>
              <span className={`px-1.5 py-0.5 rounded ${
                theme === 'dark' ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
              }`}>
                干支: {huangliData.ganzhi}
              </span>
              <span className={`px-1.5 py-0.5 rounded ${
                theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                吉凶: {huangliData.auspiciousness.level}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 月历视图 - 默认显示 */}
      <div className="p-3 overflow-hidden">
        {/* 月份导航 - 优化版 */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-1 rounded-lg ${
              theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className={`text-xs sm:text-sm font-semibold px-2 truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {formatMonth(currentMonth)}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className={`p-1 rounded-lg ${
              theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 星期标题 - 优化版 */}
        <div className="grid grid-cols-7 gap-0.5 mb-1 overflow-hidden">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div
              key={index}
              className={`text-center text-xs font-medium py-0.5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 - 优化版，适配小屏幕 */}
        <div className="grid grid-cols-7 gap-0.5 w-full max-w-full overflow-hidden">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => selectDate(day.date)}
              className={`relative p-0.5 rounded text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-w-0 w-full max-w-full overflow-hidden ${
                day.isToday
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : selectedDate.toDateString() === day.date.toDateString()
                  ? theme === 'dark'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-500 text-white'
                  : day.isCurrentMonth
                  ? theme === 'dark'
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  : theme === 'dark'
                    ? 'text-gray-500 hover:bg-gray-800'
                    : 'text-gray-400 hover:bg-gray-50'
              }`}
              style={{ minHeight: '2.2rem' }}
            >
              <div className="font-medium text-base sm:text-lg text-center w-full leading-tight truncate">
                {day.date.getDate()}
              </div>
              <div className="text-[0.6rem] sm:text-xs opacity-70 text-center w-full leading-tight truncate" style={{ minHeight: '0.8rem' }}>
                {day.huangli?.lunarDateShort || ''}
              </div>
              
              {/* 吉凶指示器 */}
              {day.huangli && day.huangli.auspiciousness && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full">
                  <div 
                    className={`w-1.5 h-1.5 rounded-full ${
                      day.huangli.auspiciousness.level === '大吉' ? 'bg-red-500'
                      : day.huangli.auspiciousness.level === '吉' ? 'bg-green-500'
                      : day.huangli.auspiciousness.level === '平' ? 'bg-gray-400'
                      : day.huangli.auspiciousness.level === '凶' ? 'bg-yellow-500'
                      : 'bg-purple-500'
                    }`}
                    title={`吉凶: ${day.huangli.auspiciousness.level}`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 黄历详情 - 重点展示禁忌 */}
      {huangliData && (
        <div className="p-3 overflow-hidden">
          {/* 忌做之事 - 重点突出 */}
          <div className="mb-3">
            <h3 className={`text-base sm:text-lg font-semibold mb-2 flex items-center ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              <span className="mr-2">❌</span> 今日禁忌
            </h3>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {huangliData.ji.map((item, index) => (
                <span
                  key={index}
                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    theme === 'dark'
                      ? 'bg-red-900/30 text-red-300 border border-red-800'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 宜做之事 */}
          <div className="mb-3">
            <h3 className={`text-base sm:text-lg font-semibold mb-2 flex items-center ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <span className="mr-2">✅</span> 宜做之事
            </h3>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {huangliData.yi.map((item, index) => (
                <span
                  key={index}
                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    theme === 'dark'
                      ? 'bg-green-900/30 text-green-300 border border-green-800'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 详细信息 */}
          <div className={`p-3 rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              📊 详细信息
            </h3>
            <div className="grid grid-cols-2 gap-1 text-xs min-w-0">
              <div className="min-w-0">
                <span className={`font-medium text-[0.6rem] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>五行:</span>
                <span className={`ml-1 truncate text-[0.6rem] ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`}>{huangliData.wuxing}</span>
              </div>
              <div className="min-w-0">
                <span className={`font-medium text-[0.6rem] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>值日:</span>
                <span className={`ml-1 truncate text-[0.6rem] ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`}>{huangliData.zhiri}</span>
              </div>
              <div className="min-w-0">
                <span className={`font-medium text-[0.6rem] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>冲煞:</span>
                <span className={`ml-1 truncate text-[0.6rem] ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`}>{huangliData.chongsha}</span>
              </div>
              <div className="min-w-0">
                <span className={`font-medium text-[0.6rem] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>彭祖:</span>
                <span className={`ml-1 truncate text-[0.6rem] ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`}>{huangliData.pengzu}</span>
              </div>
            </div>
            
            {/* 吉凶等级 */}
            <div className="mt-2 pt-2 border-t border-gray-300/30">
              <div className="flex items-center justify-between min-w-0 w-full">
                <span className={`font-medium text-xs whitespace-nowrap ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>吉凶等级:</span>
                <div className="flex items-center min-w-0 flex-nowrap overflow-hidden">
                  <span className={`px-1 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                    huangliData.auspiciousness.level === '大吉' 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : huangliData.auspiciousness.level === '吉'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : huangliData.auspiciousness.level === '平'
                      ? theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                      : huangliData.auspiciousness.level === '凶'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {huangliData.auspiciousness.level}
                  </span>
                  <span className={`ml-1 text-xs flex-shrink-0 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ({huangliData.auspiciousness.score})
                  </span>
                </div>
              </div>
              
              {/* 吉凶进度条 */}
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    huangliData.auspiciousness.score >= 70 ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : huangliData.auspiciousness.score >= 60 ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : huangliData.auspiciousness.score >= 40 ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                    : huangliData.auspiciousness.score >= 30 ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${huangliData.auspiciousness.score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 择吉建议 */}
          <div className={`mt-3 p-3 rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
          }`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-1 flex items-center ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <span className="mr-2">💡</span> 择吉建议
            </h3>
            <p className={`text-sm truncate ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              今日{huangliData.suitable}为佳，{huangliData.avoid}为忌。建议在吉时进行重要活动，避开凶时。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HuangliComponent;