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
  const [analyzing, setAnalyzing] = useState(false);
  const [preloading, setPreloading] = useState(false);
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

  // 预加载八字命格资源
  const preloadBaziAnalysisData = useCallback(async () => {
    if (!currentConfig?.birthDate || preloading) return; // 避免重复预加载
    
    try {
      setPreloading(true);
      console.log('🔄 开始预加载八字命格分析数据');
      
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
      
      // 使用 BaziCalculator 预计算八字（不设置状态，仅用于预热缓存）
      const precalculatedBazi = BaziCalculator.calculateBazi(year, month, day, hour, minute, 110);
      
      // 预计算其他相关数据（使用setTimeout分割任务，避免阻塞UI）
      setTimeout(() => calculateLiuNianDaYun(precalculatedBazi), 0);
      
      // 预加载月运数据
      const currentMonthDate = new Date();
      setTimeout(() => getMonthlyBaziFortune([
        precalculatedBazi.year,
        precalculatedBazi.month,
        precalculatedBazi.day,
        precalculatedBazi.hour
      ], currentMonthDate), 0);
      
      // 预加载日运数据
      setTimeout(() => getDailyBaziFortune([
        precalculatedBazi.year,
        precalculatedBazi.month,
        precalculatedBazi.day,
        precalculatedBazi.hour
      ], new Date()), 0);
      
      // 预加载年运数据
      setTimeout(() => getYearlyBaziFortune([
        precalculatedBazi.year,
        precalculatedBazi.month,
        precalculatedBazi.day,
        precalculatedBazi.hour
      ], currentMonthDate.getFullYear()), 0);
      
      // 预计算每日能量
      const baziDataForDaily = {
        bazi: {
          year: precalculatedBazi.year,
          month: precalculatedBazi.month,
          day: precalculatedBazi.day,
          hour: precalculatedBazi.hour
        },
        day: precalculatedBazi.day
      };
      setTimeout(() => calculateDailyEnergy(baziDataForDaily), 0);
      
      // 预分析八字
      setTimeout(() => BaziCalculator.analyzeBazi(precalculatedBazi), 0);
      
      console.log('✅ 八字命格分析数据预加载启动');
      
    } catch (err) {
      console.error('❌ 八字命格分析数据预加载失败:', err);
    } finally {
      setPreloading(false);
    }
  }, [currentConfig, preloading]);
  
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

  // 页面加载时预加载八字命格分析所需资源（非阻塞方式）
  useEffect(() => {
    const preloadTimeout = setTimeout(() => {
      preloadBaziAnalysisData();
    }, 100); // 延迟100ms执行，确保主页面渲染不受影响
    
    return () => {
      clearTimeout(preloadTimeout);
    };
  }, [preloadBaziAnalysisData]);


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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#111827' : '#fff'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid',
          borderColor: theme === 'dark' ? '#e9d5ff' : '#9333ea',
          borderTopColor: theme === 'dark' ? '#9333ea' : '#7c3aed',
          borderRadius: '9999px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 12px 12px 16px',
        backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>☯️</span>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: theme === 'dark' ? '#fff' : '#111827'
              }}>
                八字运势
              </h1>
            </div>
            <p style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280'
            }}>
              八字月运分析 · 每日能量预测
            </p>
          </div>
          <div style={{ marginLeft: '12px' }}>
            <button 
              onClick={async () => {
                try {
                  setAnalyzing(true);
                  navigate('/bazi/analysis');
                } catch (error) {
                  console.error('导航到命格分析页面失败:', error);
                  setError('导航到命格分析页面失败，请稍后重试');
                } finally {
                  setAnalyzing(false);
                }
              }}
              disabled={analyzing}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                backgroundColor: analyzing ? '#9ca3af' : (theme === 'dark' ? '#7c3aed' : '#9333ea'),
                color: '#fff'
              }}
            >
              {analyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    height: '16px',
                    width: '16px',
                    border: '2px solid',
                    borderColor: '#fff',
                    borderTopColor: 'transparent',
                    borderRadius: '9999px',
                    animation: 'spin 1s linear infinite',
                    marginRight: '6px'
                  }}></span>
                  加载中...
                </span>
              ) : '命格分析'}
            </button>
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px 0'
        }}>
          <button
            onClick={() => handleViewModeChange('monthly')}
            style={{
              flex: '1',
              minWidth: '70px',
              maxWidth: '120px',
              padding: '8px 12px',
              borderRadius: '9999px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'monthly'
                ? (theme === 'dark' ? '#7c3aed' : '#9333ea')
                : (theme === 'dark' ? '#374151' : '#e5e7eb'),
              color: viewMode === 'monthly'
                ? '#fff'
                : (theme === 'dark' ? '#d1d5db' : '#4b5563')
            }}
          >
            月运
          </button>
          <button
            onClick={() => handleViewModeChange('weekly')}
            style={{
              flex: '1',
              minWidth: '70px',
              maxWidth: '120px',
              padding: '8px 12px',
              borderRadius: '9999px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'weekly'
                ? (theme === 'dark' ? '#7c3aed' : '#9333ea')
                : (theme === 'dark' ? '#374151' : '#e5e7eb'),
              color: viewMode === 'weekly'
                ? '#fff'
                : (theme === 'dark' ? '#d1d5db' : '#4b5563')
            }}
          >
            周运
          </button>
          <button
            onClick={() => handleViewModeChange('yearly')}
            style={{
              flex: '1',
              minWidth: '70px',
              maxWidth: '120px',
              padding: '8px 12px',
              borderRadius: '9999px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'yearly'
                ? (theme === 'dark' ? '#7c3aed' : '#9333ea')
                : (theme === 'dark' ? '#374151' : '#e5e7eb'),
              color: viewMode === 'yearly'
                ? '#fff'
                : (theme === 'dark' ? '#d1d5db' : '#4b5563')
            }}
          >
            年运
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        padding: '12px 16px',
        maxWidth: '80rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        flex: '1',
        overflowY: 'auto'
      }}>
        {/* 错误提示 */}
        {error && (
          <div style={{
            backgroundColor: theme === 'dark' ? 'rgba(153, 27, 27, 0.2)' : 'rgba(254, 226, 226, 0.1)',
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(153, 27, 27, 0.8)' : 'rgba(254, 226, 226, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#f87171' : '#dc2626'
            }}>{error}</p>
          </div>
        )}

        {/* 时间选择器 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme === 'dark' ? '#fff' : '#1f2937'
            }}>
              {viewMode === 'monthly' ? '选择月份' : viewMode === 'weekly' ? '选择周数' : '选择年份'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            {viewMode === 'monthly' && (
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedYear(parseInt(year));
                  setSelectedMonth(parseInt(month));
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff'
                }}
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
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff'
                }}
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
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff'
                }}
              >
                {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>第{week}周</option>
                ))}
              </select>
            )}
            </div>
          </div>
        </div>

        {/* 八字运势卡片 */}
        {baziData && (
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme === 'dark' ? '#fff' : '#1f2937',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>☯️</span>
              {viewMode === 'monthly' ? (
                `${selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() ? '本月' : monthNames[selectedMonth - 1]}八字运势`
              ) : viewMode === 'weekly' ? (
                `本周八字运势`
              ) : (
                `${selectedYear}年八字运势`
              )}
            </h3>

            {/* 八字展示 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '0'
            }}>
              {['年柱', '月柱', '日柱', '时柱'].map((title, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    marginBottom: '4px',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}>{title}</span>
                  <div style={{
                    width: '100%',
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '2px solid',
                    backgroundColor: i === 2 ? '#f59e0b' : (theme === 'dark' ? '#374151' : '#f9fafb'),
                    borderColor: i === 2 ? '#fbbf24' : (theme === 'dark' ? '#4b5563' : '#f3f4f6'),
                    color: i === 2 ? '#fff' : (theme === 'dark' ? '#fff' : '#1f2937'),
                    boxShadow: i === 2 ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: i === 2 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      lineHeight: '1.2'
                    }}>
                      <span>{baziData.pillars[i].charAt(0)}</span>
                      <span>{baziData.pillars[i].charAt(1)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 运势分析 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid',
                backgroundColor: theme === 'dark' ? 'rgba(120, 53, 15, 0.2)' : 'rgba(251, 191, 36, 0.1)',
                borderColor: theme === 'dark' ? 'rgba(146, 64, 14, 0.5)' : 'rgba(251, 191, 36, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginRight: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: theme === 'dark' ? 'rgba(146, 64, 14, 0.5)' : 'rgba(251, 191, 36, 0.3)',
                      color: theme === 'dark' ? '#fde68a' : '#78350f'
                    }}>
                      {monthlyFortune?.relation || '暂无数据'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme === 'dark' ? '#fbbf24' : '#b45309'
                    }}>流月核心</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: theme === 'dark' ? '#92400e' : '#fef3c7'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      marginRight: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.025em',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>Score</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: theme === 'dark' ? '#fbbf24' : '#d97706'
                    }}>{monthlyFortune?.score || '0'}</span>
                  </div>
                </div>
                <p style={{
                  fontSize: '12px',
                  lineHeight: '1.6',
                  margin: '0',
                  color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                }}>
                  {monthlyFortune?.summary || '暂无运势分析数据'}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                  borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                }}>
                  <div style={{ position: 'absolute', top: '0', right: '0', padding: '2px', opacity: '0.1' }}>
                    <span style={{ fontSize: '20px' }}>👤</span>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    marginBottom: '6px',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}>命主元神</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      marginRight: '6px',
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                    }}>{monthlyFortune?.dayMaster || '未知'}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      backgroundColor: theme === 'dark' ? 'rgba(30, 58, 138, 0.3)' : 'rgba(219, 234, 254, 1)',
                      color: theme === 'dark' ? '#93c5fd' : '#2563eb',
                      borderColor: theme === 'dark' ? '#1e3a8a' : '#bfdbfe'
                    }}>
                      {monthlyFortune?.masterElement}命人
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                  borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                }}>
                  <div style={{ position: 'absolute', top: '0', right: '0', padding: '2px', opacity: '0.1' }}>
                    <span style={{ fontSize: '20px' }}>📅</span>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    marginBottom: '6px',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}>
                    {viewMode === 'monthly' ? '月份干支' : viewMode === 'weekly' ? '日柱干支' : '年份干支'}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '900',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                  }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: theme === 'dark' ? 'rgba(120, 53, 15, 0.4)' : 'rgba(253, 230, 138, 1)',
                      color: theme === 'dark' ? '#fcd34d' : '#92400e'
                    }}>
                      {viewMode === 'monthly' ? (monthlyFortune?.monthGanzhi || '未知') :
                       viewMode === 'weekly' ? (monthlyFortune?.dayGanzhi || '未知') :
                       (monthlyFortune?.yearGanzhi || '未知')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提示 */}
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid',
              display: 'flex',
              alignItems: 'center',
              fontSize: '10px',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: theme === 'dark' ? '#9ca3af' : '#9ca3af'
            }}>
              <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              注：{viewMode === 'monthly' ? `基于日干与${selectedYear}年${monthNames[selectedMonth - 1]}干支的生克关系计算` : viewMode === 'weekly' ? '基于日干与本周日柱干支的生克关系计算' : `基于日干与${selectedYear}年干支的生克关系计算`}
            </div>
          </div>
        )}

        {/* 每日运势提醒 */}
        {dailyEnergyData && (
          <div style={{
            background: 'linear-gradient(to right, #3b82f6, #9333ea)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px', fontSize: '20px' }}>✨</span>
              <span style={{ fontSize: '16px' }}>今日运势提醒</span>
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>今日能量指数</span>
                <span style={{ fontSize: '18px', fontWeight: '700' }}>{dailyEnergyData.overallScore}分</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '9999px', height: '12px' }}>
                <div
                  style={{
                    backgroundColor: '#fff',
                    height: '12px',
                    borderRadius: '9999px',
                    width: `${dailyEnergyData.overallScore}%`
                  }}
                ></div>
              </div>
            </div>

            <p style={{
              marginBottom: '12px',
              fontSize: '12px',
              color: '#dbeafe',
              margin: '0 0 12px 0'
            }}>{dailyEnergyData.description}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px'
            }}>
              {/* 建议 */}
              <div>
                <h4 style={{
                  fontWeight: '600',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#fff'
                }}>
                  <span style={{ marginRight: '6px' }}>💡</span>
                  今日建议
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dailyEnergyData.suggestions && dailyEnergyData.suggestions.map((suggestion, index) => (
                    <div key={`suggestion-${index}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '6px'
                    }}>
                      <span style={{ marginRight: '6px', fontSize: '14px' }}>{suggestion.icon}</span>
                      <span style={{ fontSize: '10px' }}>{suggestion.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 注意事项 */}
              <div>
                <h4 style={{
                  fontWeight: '600',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#fff'
                }}>
                  <span style={{ marginRight: '6px' }}>⚠️</span>
                  注意事项
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dailyEnergyData.attentions && dailyEnergyData.attentions.map((attention, index) => (
                    <div key={`attention-${index}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '6px'
                    }}>
                      <span style={{ marginRight: '6px', fontSize: '14px' }}>{attention.icon}</span>
                      <span style={{ fontSize: '10px' }}>{attention.label}</span>
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
          <div style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              color: theme === 'dark' ? '#fff' : '#1f2937'
            }}>
              <span style={{ marginRight: '6px' }}>📅</span>
              流年运势趋势
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                fontSize: '10px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'left',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>年份</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>总运势</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>爱情</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>事业</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>学习</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>健康</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>财运</th>
                    <th style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>人际</th>
                  </tr>
                </thead>
                <tbody>
                  {liuNianData.yearlyFortune.map((yearData, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <td style={{
                        padding: '8px 6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme === 'dark' ? '#fff' : '#1f2937'
                      }}>
                        {yearData.year}年
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        fontWeight: '700',
                        color: yearData.overallScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.overallScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : ''
                      }}>
                        {yearData.overallScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.loveScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.loveScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.loveScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.careerScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.careerScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.careerScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.studyScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.studyScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.studyScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.healthScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.healthScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.healthScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.wealthScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.wealthScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.wealthScore}
                      </td>
                      <td style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: yearData.socialScore >= 80 ? (theme === 'dark' ? '#34d399' : '#16a34a') : yearData.socialScore < 60 ? (theme === 'dark' ? '#f87171' : '#dc2626') : (theme === 'dark' ? '#9ca3af' : '#374151')
                      }}>
                        {yearData.socialScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}>
              <p style={{
                fontSize: '10px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280'
              }}>
                💡 表格说明：分数越高代表运势越好（80分以上为优秀，60分以下需注意）。绿色表示高分，红色表示低分。
              </p>
            </div>
          </div>
        )}

        {/* 八字信息卡片 */}
        {baziData && baziAnalysis && (
          <>
            {/* 基本信息卡片 */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937'
              }}>
                <span style={{ marginRight: '6px' }}>📋</span>
                八字基本信息
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '12px'
              }}>
                {[
                  { label: '年柱', value: baziData.year, detail: `(${baziData.details.year.gan}${baziData.details.year.zhi})` },
                  { label: '月柱', value: baziData.month, detail: `(${baziData.details.month.gan}${baziData.details.month.zhi})` },
                  { label: '日柱', value: baziData.day, detail: `(${baziData.details.day.gan}${baziData.details.day.zhi})` },
                  { label: '时柱', value: baziData.hour, detail: `(${baziData.details.hour.gan}${baziData.details.hour.zhi})` }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      marginBottom: '6px',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>
                      <strong style={{
                        color: theme === 'dark' ? '#fbbf24' : '#b45309',
                        fontWeight: '700'
                      }}>{item.label}</strong>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: theme === 'dark' ? '#fff' : '#1f2937'
                    }}>
                      {item.value} <span style={{
                        fontSize: '12px',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }}>{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(251, 191, 36, 0.1)'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: theme === 'dark' ? '#e5e7eb' : '#374151',
                  margin: '0',
                  width: '100%'
                }}>
                  <strong style={{
                    color: theme === 'dark' ? '#fbbf24' : '#b45309',
                    fontWeight: '700'
                  }}>时辰</strong>：{baziData.shichen}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: theme === 'dark' ? '#e5e7eb' : '#374151',
                  margin: '0',
                  width: '100%'
                }}>
                  <strong style={{
                    color: theme === 'dark' ? '#fbbf24' : '#b45309',
                    fontWeight: '700'
                  }}>生肖</strong>：{baziData.zodiac}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: theme === 'dark' ? '#e5e7eb' : '#374151',
                  margin: '0',
                  width: '100%',
                  wordBreak: 'break-word'
                }}>
                  <strong style={{
                    color: theme === 'dark' ? '#fbbf24' : '#b45309',
                    fontWeight: '700'
                  }}>日主</strong>：{baziData.details.day.gan}（{baziAnalysis.elementPreference.dayElement}命）
                </p>
              </div>
            </div>

            {/* 五行能量分布卡片 */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>⚖️</span>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1f2937'
                }}>五行能量分布</h2>
              </div>

              {/* 五行能量条 */}
              <div style={{ marginBottom: '16px' }}>
                {Object.entries(baziAnalysis.fiveElements.percentages).map(([element, percentage], index) => {
                  const colors = elementColors[element];
                  const bgColor = theme === 'dark' ? colors.darkBg : colors.bg;
                  const textColor = theme === 'dark' ? colors.darkText : colors.text;
                  return (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '12px',
                          color: textColor,
                          background: bgColor,
                          padding: '3px 10px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {element}
                        </span>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '12px',
                          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                        }}>
                          {percentage}%
                        </span>
                      </div>
                      <div style={{
                        height: '20px',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        backgroundColor: theme === 'dark' ? '#374151' : '#f0f0f0'
                      }}>
                        <div style={{
                          height: '100%',
                          transition: 'all 0.7s ease',
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
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(251, 191, 36, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: theme === 'dark' ? '#fbbf24' : '#b45309'
                }}>
                  五行喜好
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { label: '用神', value: baziAnalysis.elementPreference.useGod },
                    { label: '喜神', value: baziAnalysis.elementPreference.happyGods.join('、') },
                    { label: '最旺', value: baziAnalysis.elementPreference.strongest },
                    { label: '最弱', value: baziAnalysis.elementPreference.weakest }
                  ].map((item, index) => (
                    <span key={index} style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: elementColors[item.value]?.darkBg || '#374151',
                      color: elementColors[item.value]?.darkText || '#fff',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      display: 'inline-block'
                    }}>
                      {item.label}：{item.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 十神占比卡片 */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>⭐</span>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1f2937'
                }}>十神占比</h2>
              </div>

              <div style={{ marginBottom: '16px' }}>
                {Object.entries(baziAnalysis.tenGods.percentages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([god, percentage], index) => {
                    const colors = tenGodColors[god] || { bg: '#E0E0E0', text: '#333', darkBg: '#424242', darkText: '#fff' };
                    const bgColor = theme === 'dark' ? colors.darkBg : colors.bg;
                    const textColor = theme === 'dark' ? colors.darkText : colors.text;
                    return (
                      <div key={index} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '12px',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            color: textColor,
                            background: bgColor,
                            textAlign: 'center',
                            minWidth: '60px',
                            display: 'inline-block'
                          }}>
                            {god}
                          </span>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '12px',
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                          }}>
                            {percentage}%
                          </span>
                        </div>
                        <div style={{
                          height: '18px',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          backgroundColor: theme === 'dark' ? '#374151' : '#f0f0f0'
                        }}>
                          <div style={{
                            height: '100%',
                            transition: 'all 0.7s ease',
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
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: '1.6',
                backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                color: theme === 'dark' ? '#e5e7eb' : '#374151'
              }}>
                <p style={{ marginBottom: '6px', margin: '0 0 6px 0' }}>
                  <strong style={{
                    color: theme === 'dark' ? '#fbbf24' : '#b45309',
                    fontWeight: '700'
                  }}>十神解读</strong>：十神代表命局中各天干地支与日干的关系，反映您的性格特质、处事风格和人生方向。
                </p>
              </div>
            </div>

            {/* 适合职业卡片 */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>💼</span>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1f2937'
                }}>适合职业</h2>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '12px'
              }}>
                {baziAnalysis.elementPreference.suggestedCareers.slice(0, 12).map((career, index) => (
                  <span key={index} style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    background: theme === 'dark' ? '#374151' : '#FFF3E0',
                    color: theme === 'dark' ? '#FCA5A5' : '#E65100',
                    border: theme === 'dark' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid #FFB74D',
                    display: 'inline-block'
                  }}>
                    {career}
                  </span>
                ))}
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: '1.6',
                backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                color: theme === 'dark' ? '#9ca3af' : '#374151'
              }}>
                <p style={{ margin: '0' }}>
                  <strong style={{
                    color: theme === 'dark' ? '#fbbf24' : '#b45309',
                    fontWeight: '700'
                  }}>职业建议</strong>：根据您的八字五行喜好，以上行业与您的命局较为契合。建议选择能发挥您天赋优势的职业，并注意与喜神五行相关的行业发展。
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
