import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import KlineChart from '../components/KlineChart';
import RadarChart from '../components/RadarChart';
import DatePickerModal from '../components/DatePickerModal';
import { storageManager } from '../utils/storageManager';
import { userConfigManager } from '../utils/userConfigManager';

const LifeTrendPage = () => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState('kline'); // 'kline' 或 'radar'
  const [chartType, setChartType] = useState('kline'); // 'kline' 或 'line'
  const [timeDimension, setTimeDimension] = useState('year'); // 'year', 'month', 'day'
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedDate, setSelectedDate] = useState(23);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [klineData, setKlineData] = useState([]);
  const [hoveredAge, setHoveredAge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAge, setCurrentAge] = useState(34);

  // 从用户配置加载出生日期
  useEffect(() => {
    let isMounted = true;
    const loadUserConfig = () => {
      try {
        const config = userConfigManager.getCurrentConfig();
        if (config && config.birthDate && isMounted) {
          const birthDate = new Date(config.birthDate);
          setSelectedYear(birthDate.getFullYear());
          setSelectedMonth(birthDate.getMonth() + 1);
          setSelectedDate(birthDate.getDate());
        }
      } catch (error) {
        console.warn('加载用户配置失败，使用默认值:', error);
        // 使用默认值：1991年1月1日12:30，北京朝阳区
        if (isMounted) {
          setSelectedYear(1991);
          setSelectedMonth(1);
          setSelectedDate(1);
        }
      }
    };
    loadUserConfig();
    return () => { isMounted = false; };
  }, []);

  // 计算当前年龄
  useEffect(() => {
    const today = new Date();
    const birth = new Date(selectedYear, selectedMonth - 1, selectedDate);
    const age = today.getFullYear() - birth.getFullYear();
    setCurrentAge(Math.max(0, Math.min(100, age)));
  }, [selectedYear, selectedMonth, selectedDate]);

  // 保存用户选择的日期
  const saveDate = (year, month, date) => {
    try {
      localStorage.setItem('lifeTrend_birthDate', JSON.stringify({ year, month, date }));
      // 同时更新用户配置
      const newBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const configIndex = userConfigManager.getActiveConfigIndex();
      userConfigManager.updateConfig(configIndex, { birthDate: newBirthDate });
    } catch (error) {
      console.warn('保存日期失败:', error);
    }
  };

  // 模拟数据 - 基于生辰八字的运势数据
  const generateKlineData = (year, month, date) => {
    const data = [];
    const seed = year * 10000 + month * 100 + date;
    
    for (let age = 0; age <= 100; age++) {
      // 使用确定性算法生成数据（基于生辰八字）
      const baseValue = 50 + 
        Math.sin((age + seed) * 0.15) * 20 + 
        Math.cos((age + seed) * 0.08) * 15 +
        Math.sin((age + seed) * 0.03) * 10;
      
      // 添加轻微波动但保持趋势
      const value = Math.min(100, Math.max(0, baseValue));
      
      data.push({
        age,
        value: Math.round(value),
        // 细分领域数据
        career: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 100) * 0.1) * 20))),
        wealth: Math.round(Math.min(100, Math.max(0, value + Math.cos((age + seed + 200) * 0.1) * 20))),
        relationship: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 300) * 0.1) * 20))),
        health: Math.round(Math.min(100, Math.max(0, value + Math.cos((age + seed + 400) * 0.1) * 20))),
        social: Math.round(Math.min(100, Math.max(0, value + Math.sin((age + seed + 500) * 0.1) * 20))),
      });
    }
    return data;
  };

  // 生成数据
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      // 从缓存加载数据
      const cacheKey = `lifeTrend_data_${selectedYear}_${selectedMonth}_${selectedDate}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData) {
        if (isMounted) {
          setKlineData(cachedData);
          setLoading(false);
        }
      } else {
        const newData = generateKlineData(selectedYear, selectedMonth, selectedDate);
        if (isMounted) {
          setKlineData(newData);
          // 缓存数据
          storageManager.setGlobalCache(cacheKey, newData);
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth, selectedDate]);

  // 获取当前选中年份的数据（用于雷达图）
  const currentYearData = klineData.find(d => d.age === currentAge) || klineData[0];

  // 日期选择处理
  const handleDateChange = (year, month, date) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDate(date);
    saveDate(year, month, date);
    setIsCalendarOpen(false);
  };

  // 生成八字
  const generateBazi = (year, month, date) => {
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 简化的八字计算（实际应用中需要更复杂的算法）
    const yearGan = heavenlyStems[(year - 4) % 10];
    const yearZhi = earthlyBranches[(year - 4) % 12];
    const monthGan = heavenlyStems[(month + year * 5) % 10];
    const monthZhi = earthlyBranches[(month - 1) % 12];
    const dayGan = heavenlyStems[(date + year * 3 + month * 2) % 10];
    const dayZhi = earthlyBranches[(date - 1) % 12];
    const hourGan = heavenlyStems[(year + month + date) % 10];
    const hourZhi = earthlyBranches[(month + date) % 12];
    
    return {
      year: `${yearGan}${yearZhi}`,
      month: `${monthGan}${monthZhi}`,
      day: `${dayGan}${dayZhi}`,
      hour: `${hourGan}${hourZhi}`
    };
  };

  const bazi = generateBazi(selectedYear, selectedMonth, selectedDate);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* 头部 */}
      <div className={`px-4 pt-6 pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">☯</span>
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              人生能量轨迹
            </h1>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            能量趋势分析 · 人生节奏感知
          </p>
        </div>

        {/* 日期卡片 */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 shadow-sm`}>
          <div 
            className={`text-center py-3 px-4 rounded-xl cursor-pointer transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setIsCalendarOpen(true)}
          >
            <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>生辰八字</div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedYear}年 {selectedMonth}月 {selectedDate}日
            </div>
            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              点击修改日期
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: '年柱', value: bazi.year },
              { label: '月柱', value: bazi.month },
              { label: '日柱', value: bazi.day },
              { label: '时柱', value: bazi.hour },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div className={`flex gap-2 mx-4 mb-4 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            selectedView === 'kline'
              ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          onClick={() => setSelectedView('kline')}
        >
          <span>📈</span>
          <span className="text-sm font-medium">生命K线</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            selectedView === 'radar'
              ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          onClick={() => setSelectedView('radar')}
        >
          <span>🎯</span>
          <span className="text-sm font-medium">人生雷达</span>
        </button>
      </div>

      {/* 当 K线视图时，显示图表类型和时间维度切换 */}
      {selectedView === 'kline' && (
        <div className={`flex flex-col gap-2 mx-4 mb-4`}>
          {/* 图表类型切换 */}
          <div className={`flex gap-2 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                chartType === 'kline'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setChartType('kline')}
            >
              <span>📊</span>
              <span className="font-medium">K线图</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                chartType === 'line'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setChartType('line')}
            >
              <span>📈</span>
              <span className="font-medium">曲线图</span>
            </button>
          </div>

          {/* 时间维度切换 */}
          <div className={`flex gap-2 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'year'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('year')}
            >
              <span>📅</span>
              <span className="font-medium">年</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'month'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('month')}
            >
              <span>📆</span>
              <span className="font-medium">月</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs ${
                timeDimension === 'day'
                  ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} text-white shadow-md`
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
              onClick={() => setTimeDimension('day')}
            >
              <span>📋</span>
              <span className="font-medium">日</span>
            </button>
          </div>
        </div>
      )}

      {/* 主图表区域 */}
      <div className="px-4">
        {selectedView === 'kline' ? (
          <KlineChart
            data={klineData}
            hoveredAge={hoveredAge}
            onHoverAge={setHoveredAge}
            theme={theme}
            chartType={chartType}
            timeDimension={timeDimension}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
          />
        ) : (
          <RadarChart
            data={currentYearData}
            year={new Date().getFullYear()}
            theme={theme}
          />
        )}
      </div>

      {/* 能量提示卡片 */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💭</span>
            <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              今日能量提示
            </span>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {selectedYear}.{selectedMonth}.{selectedDate}
          </span>
        </div>

        {currentYearData && (
          <>
            <div className={`mb-4 p-3 rounded-xl text-sm leading-relaxed ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              {currentYearData.value >= 60 
                ? '今天能量充沛，适合开展新的计划，把握机遇。保持积极心态，会有不错的收获。'
                : '今天相对平静，适合处理日常事务和规划未来。保持耐心，稳步前进。'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>建议</div>
                <div className="space-y-2">
                  {currentYearData.career >= 50 && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                      <span>🎤</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>积极工作</span>
                    </div>
                  )}
                  {currentYearData.relationship >= 50 && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                      <span>👥</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>社交活动</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>注意</div>
                <div className="space-y-2">
                  {currentYearData.wealth < 50 && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                      <span>💰</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>谨慎消费</span>
                    </div>
                  )}
                  {currentYearData.health < 50 && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                      <span>🏃</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>注意休息</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 能量趋势解读 */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📊 能量趋势解读
        </h3>
        <p className={`text-sm leading-relaxed mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          当前处于<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>能量{currentYearData?.value >= 50 ? '上升' : '调整'}期</b>，整体趋势{currentYearData?.value >= 50 ? '向好' : '平稳'}。
          根据能量轨迹分析，您正处于人生的<b className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>发展阶段</b>，
          适合尝试新事物，但需注意保持节奏。
        </p>
        <div className={`flex justify-between items-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>当前趋势</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            currentYearData?.value >= 50
              ? `${theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100'}`
              : `${theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100'}`
          }`}>
            📈 {currentYearData?.value >= 50 ? '上涨中' : '平稳中'}
          </span>
        </div>
      </div>

      {/* 免责声明 */}
      <div className="mx-4 mt-6 px-4 py-3 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/10">
        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-yellow-200/70' : 'text-yellow-800/80'}`}>
          ⚠️ 提示：本工具基于传统智慧进行能量趋势分析，旨在帮助您感知人生节奏，不用于预测具体事件。请理性看待分析结果，您的选择与行动才是人生的决定性因素。
        </p>
      </div>

      {/* 日期选择器 */}
      <DatePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        onChange={handleDateChange}
        theme={theme}
      />
    </div>
  );
};

export default LifeTrendPage;
