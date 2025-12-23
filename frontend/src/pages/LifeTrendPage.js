import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import KlineChart from '../components/KlineChart';
import RadarChart from '../components/RadarChart';
import DatePickerModal from '../components/DatePickerModal';
import { storageManager } from '../utils/storageManager';
import { userConfigManager } from '../utils/userConfigManager';
import { calculateDetailedBazi } from '../utils/baziHelper';
import { Solar, Lunar } from 'lunar-javascript';

const LifeTrendPage = () => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState('kline'); // 'kline' 或 'radar'
  const [chartType, setChartType] = useState('kline'); // 'kline' 或 'line'
  const [timeDimension, setTimeDimension] = useState('year'); // 'year', 'month', 'day'
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedDate, setSelectedDate] = useState(23);
  const [selectedHour, setSelectedHour] = useState(12); // 新增：时辰（小时）
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [klineData, setKlineData] = useState([]);
  const [hoveredAge, setHoveredAge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAge, setCurrentAge] = useState(34);

  // 新增：临时计算相关状态
  const [isTempCalcMode, setIsTempCalcMode] = useState(false);
  const [tempBazi, setTempBazi] = useState(null);
  const [tempLatitude, setTempLatitude] = useState(30); // 默认北纬30度
  const [tempLongitude, setTempLongitude] = useState(110); // 默认东经110度

  // 新增：农历数据
  const [lunarData, setLunarData] = useState(null);
  const [currentBazi, setCurrentBazi] = useState(null);

  // 从用户配置加载出生日期和八字
  useEffect(() => {
    let isMounted = true;
    const loadUserConfig = async () => {
      try {
        setLoading(true); // 开始加载
        const config = userConfigManager.getCurrentConfig();
        if (config && config.birthDate && isMounted) {
          const birthDate = new Date(config.birthDate);
          setSelectedYear(birthDate.getFullYear());
          setSelectedMonth(birthDate.getMonth() + 1);
          setSelectedDate(birthDate.getDate());

          // 加载出生时间（小时）
          if (config.birthTime) {
            const [hours] = config.birthTime.split(':').map(Number);
            setSelectedHour(hours || 12);
          }

          // 加载经纬度
          if (config.birthLocation) {
            setTempLatitude(config.birthLocation.lat || 30);
            setTempLongitude(config.birthLocation.lng || 110);
          }

          // 加载八字（如果存在）
          if (config.bazi) {
            // 直接使用已存储的八字数据
            setCurrentBazi(config.bazi);
          } else {
            // 如果没有存储的八字，根据出生日期计算
            const birthDateStr = config.birthDate;
            const birthTimeStr = config.birthTime || '12:00';
            const longitude = config.birthLocation?.lng || 110;
            const calculatedBazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
            setCurrentBazi(calculatedBazi);
          }
        }
      } catch (error) {
        console.warn('加载用户配置失败，使用默认值:', error);
        // 使用默认值：1991年1月1日12:30，北京朝阳区
        if (isMounted) {
          setSelectedYear(1991);
          setSelectedMonth(1);
          setSelectedDate(1);
          setSelectedHour(12);
          setTempLatitude(39.95);
          setTempLongitude(116.48);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // 结束加载
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

  // 保存用户选择的日期到永久配置
  const saveDateToConfig = (year, month, date, hour, longitude, latitude) => {
    try {
      const newBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const newBirthTime = `${String(hour).padStart(2, '0')}:00`;
      const configIndex = userConfigManager.getActiveConfigIndex();

      // 计算八字
      const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const birthTimeStr = `${String(hour).padStart(2, '0')}:00`;
      const bazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);

      // 计算时辰
      const solar = Solar.fromYmdHms(year, month, date, hour, 0, 0);
      const lunar = solar.getLunar();
      const shichenInfo = {
        name: lunar.getTimeInGanZhi().slice(-1) + '时' // 获取时柱的天干地支并加上'时'
      };

      const updates = {
        birthDate: newBirthDate,
        birthTime: newBirthTime,
        shichen: shichenInfo.name,
        birthLocation: {
          province: '默认',
          city: '默认',
          district: '默认',
          lng: longitude,
          lat: latitude
        },
        bazi: bazi
      };

      userConfigManager.updateConfig(configIndex, updates);
      setCurrentBazi(bazi);
      setIsTempCalcMode(false); // 保存后退出临时计算模式
      setLoading(false); // 保存完成后停止加载

      console.log('保存日期和八字到配置成功:', updates);
    } catch (error) {
      console.warn('保存日期到配置失败:', error);
      setLoading(false); // 出错时也停止加载
    }
  };

  // 保存到localStorage（用于临时计算）
  const saveDateToLocalStorage = (year, month, date) => {
    try {
      localStorage.setItem('lifeTrend_birthDate', JSON.stringify({ year, month, date }));
    } catch (error) {
      console.warn('保存日期到localStorage失败:', error);
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

  // 生成数据（临时计算模式使用临时八字，永久模式使用配置八字）
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {

      // 确定使用的八字（用于生成不同的数据）
      const usedBazi = isTempCalcMode ? tempBazi : currentBazi;

      // 从缓存加载数据（包含八字信息）
      const baziKey = usedBazi ? `${usedBazi.year}${usedBazi.month}${usedBazi.day}${usedBazi.hour}` : 'default';
      const cacheKey = `lifeTrend_data_${selectedYear}_${selectedMonth}_${selectedDate}_${selectedHour}_${tempLongitude}_${baziKey}`;
      const cachedData = storageManager.getGlobalCache(cacheKey);

      if (cachedData) {
        if (isMounted) {
          setKlineData(cachedData);
        }
      } else {
        const newData = generateKlineData(selectedYear, selectedMonth, selectedDate);
        if (isMounted) {
          setKlineData(newData);
          // 缓存数据
          storageManager.setGlobalCache(cacheKey, newData);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth, selectedDate, selectedHour, tempBazi, currentBazi, isTempCalcMode, tempLongitude]);

  // 计算农历日期
  useEffect(() => {
    const solar = Solar.fromYmd(selectedYear, selectedMonth, selectedDate);
    const lunar = solar.getLunar();
    setLunarData({
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay(),
      lunarYearStr: lunar.getYearInGanZhi() + '年',
      lunarMonthStr: lunar.getMonthInChinese() + '月',
      lunarDayStr: lunar.getDayInChinese(),
      lunarFullStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    });
  }, [selectedYear, selectedMonth, selectedDate]);

  // 获取当前选中年份的数据（用于雷达图）
  const currentYearData = klineData.find(d => d.age === currentAge) || klineData[0];

  // 日期选择处理（永久保存）
  const handleDateChange = (year, month, date, hour, longitude, latitude, isSaveToConfig = true) => {
    setLoading(true);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDate(date);
    setSelectedHour(hour);
    setTempLongitude(longitude);
    setTempLatitude(latitude);
    setIsTempCalcMode(false);
    setIsCalendarOpen(false);

    if (isSaveToConfig) {
      saveDateToConfig(year, month, date, hour, longitude, latitude);
    } else {
      // 仅保存到localStorage，不影响永久配置
      saveDateToLocalStorage(year, month, date);
      setLoading(false);
    }
  };

  // 临时计算处理（不保存到配置）
  const handleTempCalculation = (year, month, date, hour, longitude, latitude) => {
    // 计算临时八字
    setLoading(true);
    const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const birthTimeStr = `${String(hour).padStart(2, '0')}:00`;
    const bazi = calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
    setTempBazi(bazi);
    setIsTempCalcMode(true);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDate(date);
    setSelectedHour(hour);
    setTempLongitude(longitude);
    setTempLatitude(latitude);
    setIsCalendarOpen(false);
    setLoading(false);

    console.log('临时计算八字:', bazi);
  };

  // 获取当前八字（优先使用临时计算，否则使用配置八字）
  const getDisplayBazi = () => {
    if (isTempCalcMode && tempBazi) {
      return tempBazi;
    }
    if (currentBazi) {
      return currentBazi;
    }
    // 如果没有八字，则实时计算
    const birthDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const birthTimeStr = `${String(selectedHour).padStart(2, '0')}:00`;
    return calculateDetailedBazi(birthDateStr, birthTimeStr, tempLongitude);
  };

  const displayBazi = getDisplayBazi();

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>加载中...</p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>正在计算您的八字和人生能量轨迹</p>
          </div>
        </div>
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
            <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {isTempCalcMode ? '🔮 临时计算' : '生辰八字'}
            </div>
            {/* 公历日期 */}
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedYear}年 {selectedMonth}月 {selectedDate}日
            </div>
            {/* 农历日期 */}
            {lunarData && (
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                农历{lunarData.lunarMonthStr}{lunarData.lunarDayStr}
              </div>
            )}
            {/* 时辰 */}
            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              时辰：{displayBazi.shichen?.ganzhi || displayBazi.bazi?.hour?.slice(-1) + '时' || '未知'}
            </div>
            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {isTempCalcMode ? '点击返回永久配置' : '点击修改日期 / 临时计算'}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: '年柱', value: displayBazi.bazi ? displayBazi.bazi.year : displayBazi.year },
              { label: '月柱', value: displayBazi.bazi ? displayBazi.bazi.month : displayBazi.month },
              { label: '日柱', value: displayBazi.bazi ? displayBazi.bazi.day : displayBazi.day },
              { label: '时柱', value: displayBazi.bazi ? displayBazi.bazi.hour : displayBazi.hour },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* 临时计算指示器 */}
          {isTempCalcMode && (
            <div className={`mt-3 text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border`}>
              <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                🔮 临时计算模式 - 不影响永久配置
              </span>
            </div>
          )}
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
        selectedHour={selectedHour}
        latitude={tempLatitude}
        longitude={tempLongitude}
        onConfirm={handleDateChange}
        onTempCalc={handleTempCalculation}
        theme={theme}
      />
    </div>
  );
};

export default LifeTrendPage;
