import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useUserSummary } from '../../hooks/useUserInfo';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope, HOROSCOPE_DATA_ENHANCED } from '../../utils/horoscopeAlgorithm';
import '../../styles/horoscope-date-selector.css';

const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const userSummary = useUserSummary();

  // 状态管理
  const [selectedZodiac, setSelectedZodiac] = useState(currentConfig?.zodiac || '金牛座');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置时间为午夜，确保日期比较准确
    return today;
  });
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

  const dateListRef = useRef(null);

  // 生成日期列表 (过去3天 + 今天 + 未来3天) - 确保今天是默认选中
  const generateDateList = () => {
    const list = [];
    const today = new Date();
    // 设置时间为0时0分0秒，避免时区导致的问题
    today.setHours(0, 0, 0, 0);
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0); // 确保每个日期都是当天的零时零分零秒
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  };

  const dateList = generateDateList();

  // 格式化日期显示 (用于日期选择器)
  const formatDateForPicker = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return { day: '今天', date: '' };

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
      day: weekDays[date.getDay()],
      date: date.getDate()
    };
  };

  // 格式化完整日期 (2026/01/12-星期一)
  const formatFullDate = (date) => {
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}-${weekDays[date.getDay()]}`;
  };

  // 加载星座运势数据
  const loadHoroscopeData = useCallback(async () => {
    if (!selectedZodiac) return;

    setLoading(true);
    setError(null);

    try {
      let data;
      // 根据视图模式加载不同类型的运势
      if (viewMode === 'daily') {
        data = generateDailyHoroscope(selectedZodiac, selectedDate);
      } else if (viewMode === 'weekly') {
        data = generateWeeklyHoroscope(selectedZodiac, selectedDate);
      } else if (viewMode === 'monthly') {
        data = generateMonthlyHoroscope(selectedZodiac, selectedDate);
      }

      if (data) {
        setHoroscopeData(data);
      } else {
        throw new Error('无法生成运势数据');
      }
    } catch (err) {
      console.error('加载星座运势失败:', err);
      setError('加载运势数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selectedZodiac, selectedDate, viewMode]);

  useEffect(() => {
    loadHoroscopeData();
  }, [loadHoroscopeData]);

  // 星座列表
  const zodiacList = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];

  // 渲染彩虹能量柱状图
  const RainbowScoreBar = ({ score, label, index }) => {
    // 彩虹颜色渐变数组
    const rainbowColors = [
      'linear-gradient(to top, #ff0000, #ff7f00)',      // 红-橙
      'linear-gradient(to top, #ffff00, #7fff00)',      // 黄-绿
      'linear-gradient(to top, #00ff00, #00ffff)',      // 绿-青
      'linear-gradient(to top, #0000ff, #4b0082)',      // 蓝-靛
      'linear-gradient(to top, #8b00ff, #9400d3)'       // 靛-紫
    ];
    
    const colorIndex = index % rainbowColors.length;
    
    return (
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="relative h-28 w-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-lg">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 ease-out transform-gpu"
            style={{
              height: `${score}%`,
              background: rainbowColors[colorIndex],
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          {/* 顶部高光效果 */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-white opacity-30 rounded-t-full"
            style={{
              background: `linear-gradient(to bottom, ${rainbowColors[colorIndex].split('gradient')[1].split(')')[0]}, transparent)`
            }}
          />
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{score}</span>
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center font-medium">{label}</span>
      </div>
    );
  };

  // 渲染宜忌标签
  const TagList = ({ title, items, type }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${type === 'suitable' ? 'bg-yellow-400' : 'bg-yellow-200'}`} />
        <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
        {type === 'suitable' && <span className="text-[10px] text-gray-400 ml-auto">根据总体星象对你的影响建议</span>}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 py-1.5 px-1 rounded-lg text-center text-xs font-medium text-gray-700 dark:text-gray-200 truncate"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-black dark:bg-gray-900 pb-10">
      {/* 视图切换按钮 */}
      <div className="bg-black dark:bg-gray-900 pt-4 px-4">
        <div className="flex bg-gray-900/50 p-1 rounded-2xl gap-1">
          {['daily', 'weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${viewMode === mode
                ? 'bg-yellow-200 text-gray-900 shadow-lg shadow-yellow-200/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {mode === 'daily' ? '今日日运' : mode === 'weekly' ? '本周周运' : '本月月运'}
            </button>
          ))}
        </div>
      </div>

      {/* 顶部日期选择器 - 仅在日运模式显示 */}
      {viewMode === 'daily' && (
        <div className="sticky top-0 z-20 bg-black dark:bg-gray-900 pt-4 pb-2 horoscope-date-selector-container">
          <div
            ref={dateListRef}
            className="flex overflow-x-auto hide-scrollbar px-2 sm:px-4 gap-1.5 sm:gap-3 items-center flex-nowrap whitespace-nowrap scroll-smooth pb-2 horoscope-date-selector-scroll"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {dateList.map((date, idx) => {
              const { day, date: dateNum } = formatDateForPicker(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`horoscope-date-selector-item ${isSelected
                      ? 'horoscope-date-selector-item-selected'
                      : isToday 
                        ? 'horoscope-date-selector-item-today'
                        : 'horoscope-date-selector-item-default'} ${!isSelected && !isToday ? 'hover:text-yellow-200/80 hover:bg-gray-800/30 dark:hover:bg-gray-700/50' : ''}`}
                >
                  <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wide horoscope-date-selector-day ${isSelected ? 'text-gray-900' : isToday ? 'text-yellow-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {day}
                  </span>
                  {dateNum && (
                    <span className={`text-[10px] sm:text-[12px] font-black mt-0.5 horoscope-date-selector-date ${isSelected ? 'text-gray-900' : isToday ? 'text-yellow-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {dateNum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 mt-2 max-w-2xl mx-auto space-y-6 pb-20">
        {/* 核心卡片 */}
        <div className="bg-[#fefff0] dark:bg-gray-800 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden border border-yellow-100/50 dark:border-gray-700" style={{ minHeight: '280px' }}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current Forecast</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                {viewMode === 'daily' ? formatFullDate(selectedDate) :
                  viewMode === 'weekly' ? '本周运势概览' :
                    '本月运势趋势'}
                <span className="text-[11px] bg-gray-900 text-yellow-200 px-3 py-1 rounded-full font-black">
                  {selectedZodiac}
                </span>
              </h2>
            </div>
          </div>

          {!loading && horoscopeData && (
            <div className="flex items-center gap-8 mb-8">
              {/* 总分 */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="text-6xl sm:text-7xl font-black text-gray-800 dark:text-white tracking-tighter">
                    {horoscopeData.overallScore}
                  </span>
                  {/* 装饰环 */}
                  <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-20 sm:w-24 h-20 sm:h-24 border border-gray-200 rounded-full opacity-30 rotate-12" />
                </div>
                <div className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  综合评分
                </div>
              </div>

              {/* 彩虹能量提示条 - 水平布局整体显示 */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-end" style={{ height: '160px' }}>
                  <RainbowScoreBar score={horoscopeData.dailyForecast.love.score} label="爱情" index={0} />
                  <RainbowScoreBar score={horoscopeData.dailyForecast.wealth.score} label="财富" index={1} />
                  <RainbowScoreBar score={horoscopeData.dailyForecast.career.score} label="事业" index={2} />
                  <RainbowScoreBar score={horoscopeData.dailyForecast.study.score} label="学业" index={3} />
                </div>
              </div>
            </div>
          )}

          {/* 解读文本 - 周运/月运增加整体描述 */}
          {horoscopeData?.overallDescription && (
            <p className="text-xs text-gray-600 dark:text-gray-300 font-bold mb-6 leading-relaxed italic border-l-2 border-yellow-200 dark:border-yellow-700 pl-3">
              "{horoscopeData.overallDescription}"
            </p>
          )}

          {/* 幸运/速配信息网格 - 仅日运显示详细网格 */}
          {!loading && horoscopeData && (
            <div className="grid grid-cols-3 gap-y-6 border-t border-gray-200/50 dark:border-gray-700 pt-6">
              {[
                { label: '幸运颜色', value: horoscopeData.recommendations.luckyColorNames[0], color: 'text-yellow-600/60' },
                { label: '幸运物品', value: horoscopeData.recommendations.luckyItem || '能量水晶', color: 'text-yellow-600/60' },
                { label: '幸运数字', value: horoscopeData.recommendations.luckyNumbers[0], color: 'text-yellow-600/60' },
                { label: '速配星座', value: horoscopeData.recommendations.compatibleSigns[0], color: 'text-yellow-600/60' },
                { label: '贵人星座', value: horoscopeData.recommendations.nobleSigns && horoscopeData.recommendations.nobleSigns.length > 0 ? horoscopeData.recommendations.nobleSigns[0] : '天秤座', color: 'text-yellow-600/60' },
                { label: '提防星座', value: horoscopeData.recommendations.cautionSigns && horoscopeData.recommendations.cautionSigns.length > 0 ? horoscopeData.recommendations.cautionSigns[0] : '摩羯座', color: 'text-yellow-600/60' },
              ].map((item, i) => (
                <div key={i} className={`text-center ${i % 3 !== 2 ? 'border-r border-gray-100 dark:border-gray-700' : ''}`}>
                  <div className={`text-[10px] mb-2 font-black uppercase tracking-tighter ${item.color} dark:text-gray-300`}>{item.label}</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 趋势概览列表 (仅在周运/月运模式显示) */}
        {!loading && viewMode === 'weekly' && horoscopeData?.dailyOverview && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 italic">
              <span className="w-1 h-3 bg-yellow-400 rounded-full" /> 本周趋势概览
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {horoscopeData.dailyOverview.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 mb-2">{day.day}</span>
                  <div className="w-full bg-gray-50 dark:bg-gray-700 h-20 rounded-full relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-yellow-400 transition-all duration-700"
                      style={{ height: `${day.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black mt-2 dark:text-gray-300">{day.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && viewMode === 'monthly' && horoscopeData?.weeklyOverview && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 italic">
              <span className="w-1 h-3 bg-yellow-400 rounded-full" /> 本月阶段趋势
            </h3>
            <div className="space-y-4">
              {horoscopeData.weeklyOverview.map((week, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500 w-12">{week.week}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-200 to-yellow-400"
                      style={{ width: `${week.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white w-6">{week.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 宜忌区域 (仅在日运显示效果更佳，周运显示为综合建议) */}
        {!loading && horoscopeData && (
          <div className="space-y-3">
            <TagList
              title={viewMode === 'daily' ? "今天你更适合做" : "本阶段宜行建议"}
              items={viewMode === 'daily' ? (() => {
                const pool = ['大扫除', '对镜微笑', '做体操', '鲜榨果汁', '喷香水', '牵手', '犒劳自己', '换新床单', '散步', '阅读', '冥想', '给老友电话', '修剪指甲', '整理桌面', '泡脚', '听轻音乐', '瑜伽', '烘焙', '插花', '观影', '郊游', '写作', '绘画', '烹饪'];
                const seed = (selectedDate.getDate() + selectedZodiac.length) % pool.length;
                return [...pool.slice(seed, seed + 8), ...pool.slice(0, Math.max(0, 8 - (pool.length - seed)))].slice(0, 8);
              })() : ['积极社交', '专注职场', '财务规划', '健康饮食', '学习提升', '断舍离', '目标复盘', '深入沟通']}
              type="suitable"
            />
            <TagList
              title={viewMode === 'daily' ? "今天你需要避免" : "本阶段注意事项"}
              items={viewMode === 'daily' ? (() => {
                const pool = ['不吃早餐', '应酬', '发牢骚', '拖延', '手揉眼睛', '借债', '暴食', '生闷气', '熬夜', '剧烈运动', '冲动购物', '大声喧哗', '频繁刷手机', '喝冷饮', '久坐', '盲目跟风', '赖床', '争执', '抱怨', '奢侈', '说谎', '迟到', '浪费', '悲观'];
                const seed = (selectedDate.getDate() + selectedZodiac.length + 5) % pool.length;
                return [...pool.slice(seed, seed + 8), ...pool.slice(0, Math.max(0, 8 - (pool.length - seed)))].slice(0, 8);
              })() : ['过度消费', '消极怠工', '情绪化沟通', '盲目决策', '忽视健康', '逃避责任', '浪费时间', '犹豫不决']}
              type="avoid"
            />
          </div>
        )}

        {/* 综合运势图表 - 包含爱情、财富、事业 */}
        {!loading && horoscopeData && (
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 px-6 py-1.5 rounded-full relative mb-4">
                <span className="text-lg font-black text-gray-900 dark:text-white italic">综合运势</span>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-pink-300">✦</div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-blue-300">✦</div>
              </div>
            </div>

            {/* 多维度趋势图 */}
            <div className="h-48 w-full relative mb-6">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <defs>
                  <linearGradient id="loveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff7eb3" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff7eb3" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="wealthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffcc33" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffcc33" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="careerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6a85f2" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6a85f2" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* 爱情运势线 */}
                <path
                  d="M0,100 Q50,150 100,80 T200,120 T300,80 T400,130"
                  fill="url(#loveGradient)"
                  stroke="#ff7eb3"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="80" r="4" fill="white" stroke="#ff7eb3" strokeWidth="1.5" />
                
                {/* 财富运势线 */}
                <path
                  d="M0,120 Q50,100 100,140 T200,100 T300,160 T400,110"
                  fill="url(#wealthGradient)"
                  stroke="#ffcc33"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="140" r="4" fill="white" stroke="#ffcc33" strokeWidth="1.5" />
                
                {/* 事业运势线 */}
                <path
                  d="M0,140 Q50,160 100,100 T200,140 T300,90 T400,150"
                  fill="url(#careerGradient)"
                  stroke="#6a85f2"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="4" fill="white" stroke="#6a85f2" strokeWidth="1.5" />
                
                {/* 图例 */}
                <g transform="translate(10, 10)">
                  <rect x="0" y="0" width="120" height="50" rx="5" fill="rgba(255,255,255,0.8)" stroke="#eee" strokeWidth="0.5" />
                  <circle cx="10" cy="15" r="4" fill="#ff7eb3" />
                  <text x="20" y="18" fontSize="10" fontWeight="bold" fill="#ff4081">爱情: {horoscopeData.dailyForecast.love.score}</text>
                  <circle cx="10" cy="30" r="4" fill="#ffcc33" />
                  <text x="20" y="33" fontSize="10" fontWeight="bold" fill="#ffcc33">财富: {horoscopeData.dailyForecast.wealth.score}</text>
                  <circle cx="10" cy="45" r="4" fill="#6a85f2" />
                  <text x="20" y="48" fontSize="10" fontWeight="bold" fill="#6a85f2">事业: {horoscopeData.dailyForecast.career.score}</text>
                </g>
              </svg>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
              {horoscopeData.recommendations.dailyReminder || "各项运势均衡发展，注意把握机遇，迎接挑战。"}
            </p>
          </div>
        )}

        {/* 星座选择器 - 响应式3列 */}
        <div className="bg-gray-900/50 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-300 italic">切换星座</h2>
            {currentConfig?.zodiac && (
              <span className="text-[10px] text-yellow-200/50 dark:text-yellow-300/70">当前：{currentConfig.zodiac}</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {zodiacList.map(zodiac => (
              <button
                key={zodiac}
                onClick={() => setSelectedZodiac(zodiac)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${selectedZodiac === zodiac
                  ? 'bg-yellow-200 text-gray-900 shadow-lg shadow-yellow-200/20 scale-105'
                  : 'bg-gray-800 dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
              >
                {zodiac}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 运势说明 */}
      <div className="mt-8 text-center text-gray-600 dark:text-gray-500 text-[10px] px-8">
        <p>数据生成时间：{new Date().toLocaleString('zh-CN')}</p>
        <p className="mt-1 opacity-50 italic">星座运势基于天文历法模拟生成，仅供参考，切勿过度沉迷。</p>
      </div>
    </div>
  );
};

export default HoroscopePage;