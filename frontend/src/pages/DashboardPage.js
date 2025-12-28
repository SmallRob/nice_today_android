import AppBanner from '../components/dashboard/AppBanner';
import MergedUserCard from '../components/dashboard/MergedUserCard';
import DailyFortuneCard from '../components/dashboard/DailyFortuneCard';
import {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  PersonalityTraitCard,
  EnergyBoostCard,
  PeriodTrackerCard,
  ZiWeiCard,
  TodoCard,
  FinanceCard
} from '../components/dashboard/FeatureCards';
import { useUserConfig } from '../contexts/UserConfigContext';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

/**
 * Dashboard首页 - 功能导航中心
 * 采用响应式网格布局，提供清晰的功能入口
 */
const Dashboard = () => {
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* App Banner - 应用名称和图标 */}
      <AppBanner />

      {/* 合并的用户信息卡片 - 整合问候和用户信息 */}
      <MergedUserCard />

      {/* 每日运势能量卡片 - 新增顶部运势展示 */}
      <DailyFortuneCard />

      {/* 快速操作 - 置顶的功能 */}
      <div className="quick-actions">
        <button 
          className="quick-action-btn"
          onClick={() => navigate('/horoscope')}
        >
          <span>📅</span>
          <span>今日运势</span>
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => navigate('/trend')}
        >
          <span>📊</span>
          <span>本周趋势</span>
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => navigate('/biorhythm')}
        >
          <span>💡</span>
          <span>每日建议</span>
        </button>
      </div>

      {/* 全部功能 - 3列网格布局 */}
      <div className="features-grid-three-col">
        <TodoCard />
        <FinanceCard />
        <MBTICard />
        <HoroscopeCard />
        <BiorhythmCard />
        <ChineseZodiacCard />
        <BaziCard />
        <ZiWeiCard />
        <PersonalityTraitCard />
        <EnergyBoostCard />
        <PeriodTrackerCard />
      </div>

    </div>
  );
};

export default Dashboard;
