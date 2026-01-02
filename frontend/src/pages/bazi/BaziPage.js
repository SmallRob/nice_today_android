/**
 * 八字月运模块页面
 * 从星座运势分离出的独立功能
 * 专门展示八字相关月运内容
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { normalizeBirthInfo } from '../../utils/baziDataManager';
import { calculateLiuNianDaYun, getMonthlyBaziFortune, getDailyBaziFortune, getYearlyBaziFortune, calculateDailyEnergy } from '../../utils/baziHelper';
import BaziCalculator from '../../utils/baziCalculator';
import FortuneTrendChart from '../../components/bazi/FortuneTrendChart.js';
import '../../styles/bazi-page.css';

const BaziPage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [baziData, setBaziData] = useState(null);
  const [liuNianData, setLiuNianData] = useState(null);
  const [monthlyFortune, setMonthlyFortune] = useState(null);
  const [dailyEnergyData, setDailyEnergyData] = useState(null);
  const [fortuneTrendData, setFortuneTrendData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'weekly', 'yearly'

  // 监听URL参数变化，自动设置视图模式
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    console.log('🔍 URL参数 mode:', modeParam);
    console.log('🔍 当前查询字符串:', searchParams.toString());

    if (modeParam === 'weekly' || modeParam === 'yearly' || modeParam === 'monthly') {
      console.log('✅ 根据URL参数设置视图模式为:', modeParam);
      setViewMode(modeParam);
    } else {
      console.log('⚠️ URL参数无效，使用默认值 monthly');
      setViewMode('monthly');
    }
  }, [searchParams.toString()]); // 使用 searchParams.toString() 作为依赖，确保URL变化时触发



  // 处理视图模式切换
  const handleViewModeChange = (mode) => {
    console.log('🔄 切换视图模式为:', mode);
    setViewMode(mode);
    setSearchParams({ mode });
  };

  // 计算八字月运
  const calculateBaziFortune = useCallback(async () => {
    if (!currentConfig?.birthDate) {
      setError('请先设置您的出生信息');
      setLoading(false);
      return;
    }

    try {
      setCalculating(true);
      setLoading(true);

      // 规范化出生信息
      const birthInfo = normalizeBirthInfo(currentConfig);

      // 从字符串格式解析日期和时间
      let year, month, day, hour, minute;

      try {
        // 解析出生日期 (格式: YYYY-MM-DD)
        const dateParts = birthInfo.birthDate.split('-');
        year = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]);
        day = parseInt(dateParts[2]);

        // 解析出生时间 (格式: HH:mm)，默认使用 12:00
        const timeParts = birthInfo.birthTime.split(':');
        hour = timeParts.length >= 1 ? parseInt(timeParts[0]) : 12;
        minute = timeParts.length >= 2 ? parseInt(timeParts[1]) : 0;
      } catch (parseError) {
        // 如果解析失败，使用默认值
        console.warn('日期时间解析失败，使用默认值:', parseError);
        year = 1990;
        month = 1;
        day = 1;
        hour = 12;
        minute = 0;
      }

      // 验证解析结果
      if (!year || !month || !day) {
        throw new Error('出生日期解析失败');
      }

      if (!hour || isNaN(hour)) {
        hour = 12; // 默认使用 12:00
        console.log('使用默认出生时间: 12:00');
      }

      // 使用 BaziCalculator 计算八字
      const calculatedBazi = BaziCalculator.calculateBazi(year, month, day, hour, minute, 110);

      // 添加 pillars 数组以兼容现有代码
      calculatedBazi.pillars = [calculatedBazi.year, calculatedBazi.month, calculatedBazi.day, calculatedBazi.hour];

      // 添加生肖（地支计算生肖）
      const zhi = calculatedBazi.details.year.zhi;
      const zhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(zhi);
      const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
      calculatedBazi.zodiac = zodiacs[zhiIndex];

      // 先设置 baziData，确保其他函数可以使用
      setBaziData(calculatedBazi);

      // 计算流年大运 - 传递正确的 baziData 对象
      const liuNian = calculateLiuNianDaYun(calculatedBazi);
      setLiuNianData(liuNian);

      // 创建目标日期对象
      let targetDate = new Date(selectedYear, selectedMonth - 1, 1);

      // 使用 calculatedBazi 而不是 baziData（此时 baziData 状态还未更新）
      const monthlyFortune = getMonthlyBaziFortune([
        calculatedBazi.year,
        calculatedBazi.month,
        calculatedBazi.day,
        calculatedBazi.hour
      ], targetDate);
      setMonthlyFortune(monthlyFortune);

      // 计算每日能量运势 - 使用 calculatedBazi
      const baziDataForDaily = {
        bazi: {
          year: calculatedBazi.year,
          month: calculatedBazi.month,
          day: calculatedBazi.day,
          hour: calculatedBazi.hour
        },
        day: calculatedBazi.day
      };
      const dailyEnergy = calculateDailyEnergy(baziDataForDaily);
      setDailyEnergyData(dailyEnergy);

      // 生成运势趋势数据
      let trendData = [];
      console.log('🎯 开始生成运势趋势数据，当前视图模式:', viewMode);

      if (viewMode === 'monthly') {
        // 月运模式：生成未来6个月的数据
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 6; i++) {
          const targetMonth = currentMonth + i;
          const targetDate = new Date(
            currentYear + Math.floor(targetMonth / 12),
            targetMonth % 12,
            1
          );
          const monthFortune = getMonthlyBaziFortune([
            calculatedBazi.year,
            calculatedBazi.month,
            calculatedBazi.day,
            calculatedBazi.hour
          ], targetDate);
          trendData.push({
            date: `${targetDate.getMonth() + 1}月`,
            lifeScore: monthFortune.score * 0.9 + Math.random() * 10,
            careerScore: monthFortune.score * 0.85 + Math.random() * 15,
            healthScore: monthFortune.score * 0.8 + Math.random() * 20,
            loveScore: monthFortune.score * 0.95 + Math.random() * 10,
          });
        }
        console.log('📅 月运趋势数据生成完成，数据量:', trendData.length);
      } else if (viewMode === 'weekly') {
        // 周运模式：生成本周7天的数据
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diff);

        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(startOfWeek);
          targetDate.setDate(startOfWeek.getDate() + i);
          const dailyFortune = getDailyBaziFortune([
            calculatedBazi.year,
            calculatedBazi.month,
            calculatedBazi.day,
            calculatedBazi.hour
          ], targetDate);
          const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
          trendData.push({
            date: weekDayNames[i],
            lifeScore: dailyFortune.score * 0.9 + Math.random() * 10,
            careerScore: dailyFortune.score * 0.85 + Math.random() * 15,
            healthScore: dailyFortune.score * 0.8 + Math.random() * 20,
            loveScore: dailyFortune.score * 0.95 + Math.random() * 10,
          });
        }
        console.log('📅 周运趋势数据生成完成，数据量:', trendData.length);
      } else {
        console.log('⚠️ 当前模式不支持趋势图，viewMode:', viewMode);
      }

      // 只有当有数据时才设置
      if (trendData.length > 0) {
        setFortuneTrendData(trendData);
        console.log('✅ 趋势数据已设置，包含', trendData.length, '个数据点');
      } else {
        setFortuneTrendData(null);
        console.log('❌ 趋势数据为空，设置为null');
      }

      // 根据选择的视图模式计算不同的运势
      if (viewMode === 'monthly') {
        // 月运模式：基于月份干支计算
        targetDate = new Date(selectedYear, selectedMonth - 1, 1);
        const monthlyFortune = getMonthlyBaziFortune([
          calculatedBazi.year,
          calculatedBazi.month,
          calculatedBazi.day,
          calculatedBazi.hour
        ], targetDate);
        setMonthlyFortune(monthlyFortune);
      } else if (viewMode === 'weekly') {
        // 周运模式：基于日干支计算（使用本周周一的日期）
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diff);
        targetDate = startOfWeek;
        const weeklyFortune = getDailyBaziFortune([
          calculatedBazi.year,
          calculatedBazi.month,
          calculatedBazi.day,
          calculatedBazi.hour
        ], targetDate);
        setMonthlyFortune(weeklyFortune);
      } else if (viewMode === 'yearly') {
        // 年运模式：基于年干支计算
        targetDate = new Date(selectedYear, 0, 1);
        const yearlyFortune = getYearlyBaziFortune([
          calculatedBazi.year,
          calculatedBazi.month,
          calculatedBazi.day,
          calculatedBazi.hour
        ], selectedYear);
        setMonthlyFortune(yearlyFortune);
      }
      // yearly 模式使用流年运势数据，已经在前面计算

      // 年运模式下生成流年运势明细数据
      if (viewMode === 'yearly') {
        const yearlyFortunes = [];
        for (let i = 0; i < 11; i++) {
          const year = selectedYear + i;
          const yearFortune = calculateLiuNianDaYun(calculatedBazi, year);
          if (yearFortune) {
            yearlyFortunes.push({
              year,
              overallScore: yearFortune.overall.score,
              loveScore: yearFortune.love.score,
              careerScore: yearFortune.career.score,
              studyScore: yearFortune.study.score,
              healthScore: yearFortune.health.score,
              wealthScore: yearFortune.wealth.score,
              socialScore: yearFortune.social.score,
              description: yearFortune.overall.description
            });
          }
        }
        setLiuNianData({ yearlyFortune: yearlyFortunes });
      }

      setError(null);
      console.log('✅ 运势趋势数据已生成:', trendData);
      console.log('📊 当前视图模式:', viewMode);
    } catch (err) {
      setError('计算八字运势失败：' + err.message);
      console.error('八字运势计算错误:', err);
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  }, [currentConfig, selectedYear, selectedMonth, viewMode]);

  // 初始化和视图模式变化时重新计算
  useEffect(() => {
    calculateBaziFortune();
  }, [viewMode]);

  // 月份选择
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 月份名称
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];

  // 使用 useMemo 缓存八字分析结果，优化性能
  const baziAnalysis = useMemo(() => {
    if (!baziData) return null;
    return BaziCalculator.analyzeBazi(baziData);
  }, [baziData]);

  // 使用 useMemo 缓存五行颜色配置
  const elementColors = useMemo(() => ({
    '金': { bg: '#FFD700', text: '#B8860B', darkBg: '#B8860B', darkText: '#FFF8DC' },
    '木': { bg: '#4CAF50', text: '#1B5E20', darkBg: '#1B5E20', darkText: '#C8E6C9' },
    '水': { bg: '#2196F3', text: '#0D47A1', darkBg: '#0D47A1', darkText: '#BBDEFB' },
    '火': { bg: '#FF5722', text: '#BF360C', darkBg: '#BF360C', darkText: '#FFCCBC' },
    '土': { bg: '#8D6E63', text: '#3E2723', darkBg: '#3E2723', darkText: '#D7CCC8' }
  }), []);

  // 使用 useMemo 缓存十神颜色配置
  const tenGodColors = useMemo(() => ({
    '正官': { bg: '#E3F2FD', text: '#1976D2', darkBg: '#1565C0', darkText: '#E3F2FD' },
    '七杀': { bg: '#FFEBEE', text: '#C62828', darkBg: '#C62828', darkText: '#FFEBEE' },
    '正财': { bg: '#E8F5E9', text: '#388E3C', darkBg: '#388E3C', darkText: '#E8F5E9' },
    '偏财': { bg: '#FFF3E0', text: '#F57C00', darkBg: '#F57C00', darkText: '#FFF3E0' },
    '正印': { bg: '#F3E5F5', text: '#7B1FA2', darkBg: '#7B1FA2', darkText: '#F3E5F5' },
    '偏印': { bg: '#ECEFF1', text: '#455A64', darkBg: '#455A64', darkText: '#ECEFF1' },
    '比肩': { bg: '#E0F2F1', text: '#00695C', darkBg: '#00695C', darkText: '#E0F2F1' },
    '劫财': { bg: '#FFEBEE', text: '#C62828', darkBg: '#C62828', darkText: '#FFEBEE' },
    '食神': { bg: '#FFF8E1', text: '#FF8F00', darkBg: '#FF8F00', darkText: '#FFF8E1' },
    '伤官': { bg: '#FFEBEE', text: '#D32F2F', darkBg: '#D32F2F', darkText: '#FFEBEE' }
  }), []);

  // 移动端响应式样式

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 头部 */}
      <div className={`px-4 pt-6 pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">☯️</span>
              <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                八字运势
              </h1>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              八字月运分析 · 每日能量预测
            </p>
          </div>
          <div className="ml-4">
            <button 
              onClick={() => navigate('/bazi/analysis')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${theme === 'dark' 
                ? 'bg-purple-700 text-white hover:bg-purple-600' 
                : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              命格分析
            </button>
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div className={`px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex justify-center space-x-2 md:space-x-4 py-3">
          <button
            onClick={() => handleViewModeChange('monthly')}
            className={`flex-1 min-w-[70px] max-w-[120px] px-4 py-2 rounded-full font-medium transition-all text-sm ${viewMode === 'monthly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
          >
            月运
          </button>
          <button
            onClick={() => handleViewModeChange('weekly')}
            className={`flex-1 min-w-[70px] max-w-[120px] px-4 py-2 rounded-full font-medium transition-all text-sm ${viewMode === 'weekly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
          >
            周运
          </button>
          <button
            onClick={() => handleViewModeChange('yearly')}
            className={`flex-1 min-w-[70px] max-w-[120px] px-4 py-2 rounded-full font-medium transition-all text-sm ${viewMode === 'yearly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
          >
            年运
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="px-4 py-6 max-w-4xl mx-auto flex-1 overflow-y-auto">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 时间选择器 */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 ${theme}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {viewMode === 'monthly' ? '选择月份' : viewMode === 'weekly' ? '选择周数' : '选择年份'}
            </h3>
            {viewMode === 'monthly' && (
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedYear(parseInt(year));
                  setSelectedMonth(parseInt(month));
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base text-gray-800 dark:text-white dark:bg-gray-700"
              >
                {[2024, 2025, 2026].map(year => (
                  months.map(month => (
                    <option key={`${year}-${month}`} value={`${year}-${month}`}>
                      {year}年{month}月
                    </option>
                  ))
                ))}
              </select>
            )}
            {viewMode === 'yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base text-gray-800 dark:text-white dark:bg-gray-700"
              >
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            )}
            {viewMode === 'weekly' && (
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base text-gray-800 dark:text-white dark:bg-gray-700"
              >
                {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>第{week}周</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 八字运势卡片 */}
        {baziData && (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
              <span className="mr-2">☯️</span>
              {viewMode === 'monthly' ? (
                `${selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() ? '本月' : monthNames[selectedMonth - 1]}八字运势`
              ) : viewMode === 'weekly' ? (
                `本周八字运势`
              ) : (
                `${selectedYear}年八字运势`
              )}
            </h3>

            {/* 八字展示 */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {['年柱', '月柱', '日柱', '时柱'].map((title, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</span>
                  <div className={`w-full aspect-[4/5] flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                    i === 2 ? 'bg-amber-500 border-amber-400 text-white shadow-lg scale-105' : 
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'
                  }`}>
                    <span className="text-xl md:text-2xl font-bold tracking-widest flex flex-col items-center leading-tight">
                      <span>{baziData.pillars[i].charAt(0)}</span>
                      <span>{baziData.pillars[i].charAt(1)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 运势分析 */}
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded mr-3 text-sm font-medium ${theme === 'dark' ? 'bg-amber-800/50 text-amber-200' : 'bg-amber-200/50 text-amber-900'}`}>
                      {monthlyFortune?.relation || '暂无数据'}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>流月核心</span>
                  </div>
                  <div className={`flex items-center px-3 py-1.5 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700/80 border-amber-800' : 'bg-white/80 border-amber-100'}`}>
                    <span className={`text-xs mr-2 uppercase tracking-tighter ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Score</span>
                    <span className={`text-lg font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{monthlyFortune?.score || '0'}</span>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  {monthlyFortune?.summary || '暂无运势分析数据'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg border relative overflow-hidden ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-100/50'}`}>
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <span className="text-2xl md:text-3xl">👤</span>
                  </div>
                  <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>命主元神</div>
                  <div className="flex items-center">
                    <span className={`text-base md:text-lg font-medium mr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{monthlyFortune?.dayMaster || '未知'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                      {monthlyFortune?.masterElement}命人
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border relative overflow-hidden ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-100/50'}`}>
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <span className="text-2xl md:text-3xl">📅</span>
                  </div>
                  <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {viewMode === 'monthly' ? '月份干支' : viewMode === 'weekly' ? '日柱干支' : '年份干支'}
                  </div>
                  <div className={`text-xs font-black mt-1.5 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                    <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                      {viewMode === 'monthly' ? (monthlyFortune?.monthGanzhi || '未知') :
                       viewMode === 'weekly' ? (monthlyFortune?.dayGanzhi || '未知') :
                       (monthlyFortune?.yearGanzhi || '未知')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提示 */}
            <div className={`mt-4 pt-4 border-t flex items-center text-xs ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-400'}`}>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              注：{viewMode === 'monthly' ? `基于日干与${selectedYear}年${monthNames[selectedMonth - 1]}干支的生克关系计算` : viewMode === 'weekly' ? '基于日干与本周日柱干支的生克关系计算' : `基于日干与${selectedYear}年干支的生克关系计算`}
            </div>
          </div>
        )}

        {/* 每日运势提醒 */}
        {dailyEnergyData && (
          <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2 text-2xl">✨</span>
              <span className="text-lg">今日运势提醒</span>
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">今日能量指数</span>
                <span className="text-xl font-bold">{dailyEnergyData.overallScore}分</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full"
                  style={{ width: `${dailyEnergyData.overallScore}%` }}
                ></div>
              </div>
            </div>

            <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-blue-100' : 'text-blue-100'}`}>{dailyEnergyData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 建议 */}
              <div>
                <h4 className={`font-semibold mb-2 flex items-center text-sm ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                  <span className="mr-2">💡</span>
                  今日建议
                </h4>
                <div className="space-y-2">
                  {dailyEnergyData.suggestions && dailyEnergyData.suggestions.map((suggestion, index) => (
                    <div key={`suggestion-${index}`} className="flex items-center bg-white/10 rounded-lg p-2">
                      <span className="mr-2 text-base">{suggestion.icon}</span>
                      <span className="text-xs">{suggestion.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 注意事项 */}
              <div>
                <h4 className={`font-semibold mb-2 flex items-center text-sm ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                  <span className="mr-2">⚠️</span>
                  注意事项
                </h4>
                <div className="space-y-2">
                  {dailyEnergyData.attentions && dailyEnergyData.attentions.map((attention, index) => (
                    <div key={`attention-${index}`} className="flex items-center bg-white/10 rounded-lg p-2">
                      <span className="mr-2 text-base">{attention.icon}</span>
                      <span className="text-xs">{attention.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 运势趋势图 - 仅在月运和周运模式下显示 */}
        {viewMode === 'monthly' || viewMode === 'weekly' ? (
          <div className="mb-6">
            {fortuneTrendData ? (
              <FortuneTrendChart
                data={fortuneTrendData}
                isMobile={window.innerWidth <= 768}
              />
            ) : (
              <div className={`rounded-lg p-4 text-center text-sm ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                ⚠️ 运势趋势图数据为空
              </div>
            )}
          </div>
        ) : null}

        {/* 流年运势 - 仅在年运模式下显示 */}
        {viewMode === 'yearly' && liuNianData && liuNianData.yearlyFortune && (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <span className="mr-2">📅</span>
              流年运势趋势
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>年份</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>总运势</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>爱情</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>事业</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>学习</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>健康</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>财运</th>
                    <th className={`py-2 px-1 sm:py-3 sm:px-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>人际</th>
                  </tr>
                </thead>
                <tbody>
                  {liuNianData.yearlyFortune.map((yearData, index) => (
                    <tr key={index} className={`border-b last:border-b-0 ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                      <td className={`py-3 px-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {yearData.year}年
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.overallScore >= 80 ? 'text-green-600 dark:text-green-400 font-bold' : yearData.overallScore < 60 ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {yearData.overallScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.loveScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.loveScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.loveScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.careerScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.careerScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.careerScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.studyScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.studyScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.studyScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.healthScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.healthScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.healthScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.wealthScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.wealthScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.wealthScore}
                      </td>
                      <td className={`py-3 px-2 text-center ${yearData.socialScore >= 80 ? 'text-green-600 dark:text-green-400' : yearData.socialScore < 60 ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {yearData.socialScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                💡 表格说明：分数越高代表运势越好（80分以上为优秀，60分以下需注意）。绿色表示高分，红色表示低分。
              </p>
            </div>
          </div>
        )}

        {/* 八字信息卡片 */}
        {baziData && baziAnalysis && (
          <>
            {/* 基本信息卡片 */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <span className="mr-2">📋</span>
                八字基本信息
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: '年柱', value: baziData.year, detail: `(${baziData.details.year.gan}${baziData.details.year.zhi})` },
                  { label: '月柱', value: baziData.month, detail: `(${baziData.details.month.gan}${baziData.details.month.zhi})` },
                  { label: '日柱', value: baziData.day, detail: `(${baziData.details.day.gan}${baziData.details.day.zhi})` },
                  { label: '时柱', value: baziData.hour, detail: `(${baziData.details.hour.gan}${baziData.details.hour.zhi})` }
                ].map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>{item.label}</strong>
                    </div>
                    <div className={`text-base md:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {item.value} <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`flex flex-wrap gap-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-amber-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>时辰</strong>：{baziData.shichen}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>生肖</strong>：{baziData.zodiac}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>日主</strong>：{baziData.details.day.gan}（{baziAnalysis.elementPreference.dayElement}命）
                </p>
              </div>
            </div>

            {/* 五行能量分布卡片 */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
              <div className="flex items-center mb-6 pb-4 border-b">
                <span className="text-3xl mr-3">⚖️</span>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>五行能量分布</h2>
              </div>

              {/* 五行能量条 */}
              <div className="mb-6">
                {Object.entries(baziAnalysis.fiveElements.percentages).map(([element, percentage], index) => {
                  const colors = elementColors[element];
                  const bgColor = theme === 'dark' ? colors.darkBg : colors.bg;
                  const textColor = theme === 'dark' ? colors.darkText : colors.text;
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm" style={{ color: textColor, background: bgColor, padding: '3px 10px', borderRadius: '4px' }}>
                          {element}
                        </span>
                        <span className={`font-bold text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-5 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f0f0f0' }}>
                        <div className="h-full transition-all duration-700" style={{
                          width: `${percentage}%`,
                          backgroundColor: bgColor,
                          borderRadius: '9999px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 五行喜好 */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-amber-50'} mb-4`}>
                <h3 className={`text-base font-bold mb-3 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                  五行喜好
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: '用神', value: baziAnalysis.elementPreference.useGod },
                    { label: '喜神', value: baziAnalysis.elementPreference.happyGods.join('、') },
                    { label: '最旺', value: baziAnalysis.elementPreference.strongest },
                    { label: '最弱', value: baziAnalysis.elementPreference.weakest }
                  ].map((item, index) => (
                    <span key={index} className="px-4 py-2 rounded-full text-sm font-bold" style={{
                      background: elementColors[item.value]?.darkBg || '#374151',
                      color: elementColors[item.value]?.darkText || '#fff',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      {item.label}：{item.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 十神占比卡片 */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${theme}`}>
              <div className="flex items-center mb-6 pb-4 border-b">
                <span className="text-3xl mr-3">⭐</span>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>十神占比</h2>
              </div>

              <div className="mb-6">
                {Object.entries(baziAnalysis.tenGods.percentages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([god, percentage], index) => {
                    const colors = tenGodColors[god] || { bg: '#E0E0E0', text: '#333', darkBg: '#424242', darkText: '#fff' };
                    const bgColor = theme === 'dark' ? colors.darkBg : colors.bg;
                    const textColor = theme === 'dark' ? colors.darkText : colors.text;
                    return (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between mb-2 items-center">
                          <span className="font-bold text-sm px-3 py-1 rounded text-center min-w-[60px]" style={{
                            color: textColor,
                            background: bgColor
                          }}>
                            {god}
                          </span>
                          <span className={`font-bold text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-[18px] rounded-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f0f0f0' }}>
                          <div className="h-full transition-all duration-700" style={{
                            width: `${percentage}%`,
                            backgroundColor: bgColor,
                            borderRadius: '9999px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 十神解析 */}
              <div className={`p-4 rounded-lg text-sm leading-relaxed ${theme === 'dark' ? 'bg-gray-700/50 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                <p className="mb-2">
                  <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>十神解读</strong>：十神代表命局中各天干地支与日干的关系，反映您的性格特质、处事风格和人生方向。
                </p>
              </div>
            </div>

            {/* 适合职业卡片 */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${theme}`}>
              <div className="flex items-center mb-6 pb-4 border-b">
                <span className="text-3xl mr-3">💼</span>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>适合职业</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {baziAnalysis.elementPreference.suggestedCareers.slice(0, 12).map((career, index) => (
                  <span key={index} className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200" style={{
                    background: theme === 'dark' ? '#374151' : '#FFF3E0',
                    color: theme === 'dark' ? '#FCA5A5' : '#E65100',
                    border: theme === 'dark' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid #FFB74D'
                  }}>
                    {career}
                  </span>
                ))}
              </div>

              <div className={`p-4 rounded-lg text-sm leading-relaxed ${theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                <p>
                  <strong className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>职业建议</strong>：根据您的八字五行喜好，以上行业与您的命局较为契合。建议选择能发挥您天赋优势的职业，并注意与喜神五行相关的行业发展。
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BaziPage;
