import AppBanner from '../components/dashboard/AppBanner';
import UserCard from '../components/dashboard/UserInfoCard';
import FeatureCardsWithUserInfo from '../components/dashboard/FeatureCardsWithUserInfo';
import {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  PersonalityTraitCard,
  EnergyBoostCard,
  PeriodTrackerCard
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
  
  // 跳转到用户星座特质页面
  const goToUserZodiacTraits = () => {
    const userZodiac = currentConfig?.zodiac;
    if (userZodiac) {
      navigate(`/zodiac-traits/${encodeURIComponent(userZodiac)}`, {
        state: { from: 'dashboard', userZodiac: userZodiac }
      });
    } else {
      // 如果用户没有配置星座，跳转到星座选择页面
      navigate('/horoscope');
    }
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

      {/* 用户信息卡片 */}
      <UserCard />

      {/* 欢迎卡片 */}
      <div className="welcome-card">
        <h2 className="welcome-title">探索您的专属运势</h2>
        <p className="welcome-text">
          全方位的性格分析、运势解读和能量管理，助您每一天都充满活力
        </p>
        {currentConfig?.zodiac && (
          <button 
            onClick={goToUserZodiacTraits}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            查看您的专属星座特质：{currentConfig.zodiac}
          </button>
        )}
      </div>

      {/* 个性化功能展示 */}
      <FeatureCardsWithUserInfo />

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
        <PeriodTrackerCard />
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
