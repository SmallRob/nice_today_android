import AppBanner from '../components/dashboard/AppBanner';
import {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  PersonalityTraitCard,
  EnergyBoostCard
} from '../components/dashboard/FeatureCards';
import '../styles/dashboard.css';

/**
 * Dashboard首页 - 功能导航中心
 * 采用响应式网格布局，提供清晰的功能入口
 */
const Dashboard = () => {
  // 获取当前日期和星期
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return now.toLocaleDateString('zh-CN', options);
  };

  return (
    <div className="dashboard-container">
      {/* App Banner - 应用名称和图标 */}
      <AppBanner />

      {/* 头部欢迎区域 */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">{getGreeting()}</h1>
        <p className="dashboard-subtitle">{getCurrentDate()}</p>
      </header>

      {/* 欢迎卡片 */}
      <div className="welcome-card">
        <h2 className="welcome-title">探索您的专属运势</h2>
        <p className="welcome-text">
          全方位的性格分析、运势解读和能量管理，助您每一天都充满活力
        </p>
      </div>

      {/* 热门功能 - 主功能 */}
      <h2 className="section-title">热门功能</h2>
      <div className="features-grid">
        <MBTICard />
        <HoroscopeCard />
        <BiorhythmCard />
      </div>

      {/* 全部功能 */}
      <h2 className="section-title">全部功能</h2>
      <div className="features-grid">
        <ChineseZodiacCard />
        <BaziCard />
        <PersonalityTraitCard />
        <EnergyBoostCard />
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <button className="quick-action-btn">
          <span>📅</span>
          <span>今日运势</span>
        </button>
        <button className="quick-action-btn">
          <span>📊</span>
          <span>本周趋势</span>
        </button>
        <button className="quick-action-btn">
          <span>💡</span>
          <span>每日建议</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
