import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useUserSummary } from '../../hooks/useUserInfo';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope, HOROSCOPE_DATA_ENHANCED } from '../../utils/horoscopeAlgorithm';

const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const userSummary = useUserSummary();

  // 状态管理
  const [selectedZodiac, setSelectedZodiac] = useState(currentConfig?.zodiac || '金牛座');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

  const dateListRef = useRef(null);

  // 生成日期列表 (过去3天 + 今天 + 未来3天)
  const generateDateList = () => {
    const list = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
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

  // 渲染得分柱状图
  const ScoreBar = ({ score, label, color }) => (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000"
          style={{
            height: `${score}%`,
            background: color || 'linear-gradient(to top, #ff7eb3, #ff758c)'
          }}
        />
      </div>
      <span className="text-xs font-bold mt-2 dark:text-gray-300">{score}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{label}</span>
    </div>
  );

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
    <div className="min-h-full bg-black pb-10">
      {/* 视图切换按钮 */}
      <div className="bg-black pt-4 px-4">
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
        <div className="sticky top-0 z-20 bg-black pt-4 pb-2">
          <div
            ref={dateListRef}
            className="flex overflow-x-auto hide-scrollbar px-4 gap-4 items-center flex-nowrap whitespace-nowrap scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {dateList.map((date, idx) => {
              const { day, date: dateNum } = formatDateForPicker(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[60px] py-2.5 transition-all duration-300 ${isSelected
                      ? 'bg-yellow-200 rounded-2xl text-gray-900 px-4 scale-105 shadow-[0_4px_12px_rgba(254,240,138,0.3)]'
                      : 'text-yellow-200/30 hover:text-yellow-200/60'
                    }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-gray-900' : 'text-yellow-200/50'}`}>
                    {day}
                  </span>
                  {dateNum && (
                    <span className={`text-sm font-black mt-0.5 ${isSelected ? 'text-gray-900' : 'text-yellow-200/80'}`}>
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
        <div className="bg-[#fefff0] rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden border border-yellow-100/50">
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
            <div className="bg-yellow-400/20 text-yellow-800 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-400/30">
              PRO
            </div>
          </div>

          {!loading && horoscopeData && (
            <div className="flex items-center gap-8 mb-8">
              {/* 总分 */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="text-7xl font-black text-gray-800 tracking-tighter">
                    {horoscopeData.overallScore}
                  </span>
                  {/* 装饰环 */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 border border-gray-200 rounded-full opacity-30 rotate-12" />
                </div>
                <div className="mt-2 bg-gray-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Score
                </div>
              </div>

              {/* 四维柱状图 */}
              <div className="flex-1 grid grid-cols-4 gap-2">
                <ScoreBar score={horoscopeData.dailyForecast.love.score} label="爱情" color="linear-gradient(to top, #ff7eb3, #ff758c)" />
                <ScoreBar score={horoscopeData.dailyForecast.wealth.score} label="财富" color="linear-gradient(to top, #ffcc33, #ffb347)" />
                <ScoreBar score={horoscopeData.dailyForecast.career.score} label="事业" color="linear-gradient(to top, #6a85f2, #7c9ff2)" />
                <ScoreBar score={horoscopeData.dailyForecast.study.score} label="学业" color="linear-gradient(to top, #48c6ef, #00d2ff)" />
              </div>
            </div>
          )}

          {/* 解读文本 - 周运/月运增加整体描述 */}
          {horoscopeData?.overallDescription && (
            <p className="text-xs text-gray-600 font-bold mb-6 leading-relaxed italic border-l-2 border-yellow-200 pl-3">
              "{horoscopeData.overallDescription}"
            </p>
          )}

          {/* 幸运/速配信息网格 - 仅日运显示详细网格 */}
          {!loading && horoscopeData && (
            <div className="grid grid-cols-3 gap-y-6 border-t border-gray-200/50 pt-6">
              {[
                { label: '幸运颜色', value: horoscopeData.recommendations.luckyColorNames[0], color: 'text-yellow-600/60' },
                { label: '幸运物品', value: horoscopeData.recommendations.luckyItem || '能量水晶', color: 'text-yellow-600/60' },
                { label: '幸运数字', value: horoscopeData.recommendations.luckyNumbers[0], color: 'text-yellow-600/60' },
                { label: '速配星座', value: horoscopeData.recommendations.compatibleSigns[0], color: 'text-yellow-600/60' },
                { label: '贵人星座', value: horoscopeData.recommendations.nobleSigns ? horoscopeData.recommendations.nobleSigns[0] : '天秤座', color: 'text-yellow-600/60' },
                { label: '提防星座', value: horoscopeData.recommendations.cautionSigns ? horoscopeData.recommendations.cautionSigns[0] : '摩羯座', color: 'text-yellow-600/60' },
              ].map((item, i) => (
                <div key={i} className={`text-center ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}>
                  <div className={`text-[10px] mb-2 font-black uppercase tracking-tighter ${item.color}`}>{item.label}</div>
                  <div className="text-sm font-black text-gray-900">{item.value}</div>
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

        {/* 感情运势图表 */}
        {!loading && horoscopeData && (
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-pink-50 dark:bg-pink-900/20 px-6 py-1.5 rounded-full relative mb-4">
                <span className="text-lg font-black text-gray-900 dark:text-white italic">感情运势</span>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-pink-300">✦</div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-pink-300">✦</div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`text-xl ${star <= 4 ? 'text-pink-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
            </div>

            {/* 趋势图模拟 */}
            <div className="h-40 w-full relative mb-6">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                <path
                  d="M0,70 Q50,120 100,50 T200,80 T300,50 T400,90"
                  fill="none"
                  stroke="#ff7eb3"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="50" r="6" fill="white" stroke="#ff7eb3" strokeWidth="2" />
                <rect x="70" y="10" width="70" height="30" rx="10" fill="#fce4ec" />
                <text x="105" y="30" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#ff4081">感情运: 68</text>
              </svg>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
              {horoscopeData.recommendations.dailyReminder || "感情运势尚佳，尽量以谅解、包容的态度来对待感情。"}
            </p>
          </div>
        )}

        {/* 星座选择器 - 响应式3列 */}
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 italic">切换星座</h2>
            {currentConfig?.zodiac && (
              <span className="text-[10px] text-yellow-200/50">当前：{currentConfig.zodiac}</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {zodiacList.map(zodiac => (
              <button
                key={zodiac}
                onClick={() => setSelectedZodiac(zodiac)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${selectedZodiac === zodiac
                  ? 'bg-yellow-200 text-gray-900 shadow-lg shadow-yellow-200/20 scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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