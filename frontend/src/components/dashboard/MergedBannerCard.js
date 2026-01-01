/**
 * 合并的Banner和用户信息卡片
 * 整合应用Banner和用户信息展示
 */
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSummary } from '../../hooks/useUserInfo';
import { useUserConfig } from '../../contexts/UserConfigContext';
import niceDayImage from '../../images/nice_day.png';
import BreadCrumbMenu from './BreadCrumbMenu';
import './MergedBannerCard.css';

const MergedBannerCard = () => {
  const navigate = useNavigate();
  const {
    nickname,
    zodiacSign,
    chineseZodiac,
    age,
    hasUserInfo,
    isLoading
  } = useUserSummary();

  const { currentConfig } = useUserConfig();

  const handleSwitchToOldVersion = () => {
    navigate('/old-dashboard');
  };

  // 获取当前日期和星期
  const getCurrentDate = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return now.toLocaleDateString('zh-CN', options);
  };

  // 跳转函数
  const navigateToZodiacTraits = () => {
    const userZodiac = currentConfig?.zodiac || zodiacSign;
    if (userZodiac) {
      navigate(`/zodiac-traits/${encodeURIComponent(userZodiac)}`, {
        state: { from: 'dashboard', userZodiac, timestamp: Date.now() }
      });
    } else {
      navigate('/horoscope');
    }
  };

  const navigateToChineseZodiac = () => {
    navigate('/chinese-zodiac', {
      state: { from: 'dashboard', timestamp: Date.now() }
    });
  };

  const navigateToMBTI = () => {
    const userMBTI = currentConfig?.mbti;
    if (userMBTI) {
      navigate(`/mbti-detail?mbti=${encodeURIComponent(userMBTI)}`, {
        state: {
          from: 'dashboard',
          mbtiType: userMBTI,
          timestamp: Date.now()
        }
      });
    } else {
      navigate('/mbti-test', {
        state: { from: 'dashboard', timestamp: Date.now() }
      });
    }
  };

  const navigateToAgeAnalysis = () => {
    navigate('/age-analysis', {
      state: {
        from: 'dashboard',
        userAge: age,
        timestamp: Date.now()
      }
    });
  };

  if (isLoading) {
    return (
      <div className="merged-banner-card loading">
        <div className="banner-left-skeleton">
          <div className="app-section-skeleton"></div>
          <div className="date-skeleton"></div>
        </div>
        <div className="banner-right-skeleton">
          <div className="user-header-skeleton"></div>
          <div className="tags-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="merged-banner-card">
      {/* 五行装饰背景 */}
      <div className="wuxing-bg"></div>

      {/* 五行装饰符号 */}
      <div className="wuxing-symbol wuxing-symbol-1">木</div>
      <div className="wuxing-symbol wuxing-symbol-2">火</div>
      <div className="wuxing-symbol wuxing-symbol-3">土</div>
      <div className="wuxing-symbol wuxing-symbol-4">金</div>
      <div className="wuxing-symbol wuxing-symbol-5">水</div>

      {/* 五行装饰圆圈 */}
      <div className="wuxing-circle wuxing-circle-1"></div>
      <div className="wuxing-circle wuxing-circle-2"></div>
      <div className="wuxing-circle wuxing-circle-3"></div>

      {/* 左侧：应用图标和名称 + 日期信息 */}
      <div className="banner-left">
        <div className="app-section">
          <img
            src={niceDayImage}
            alt="Nice Today"
            className="app-icon"
          />
          <div className="app-info">
            <h1 className="app-title">Nice Today</h1>
            <p className="app-subtitle">探索运势·了解自己·精彩每一天</p>
            <p className="current-date">{getCurrentDate()}</p>
          </div>
        </div>

        {/* 新增面包屑菜单 - 移动到图标下方 */}
        <div className="banner-menu-container">
          <BreadCrumbMenu />
        </div>
      </div>

      {/* 右侧：用户信息 */}
      <div className="banner-right">
        <div className="user-info-section">
          {hasUserInfo ? (
            <>
              <div className="user-header">
                <div className="user-avatar-small">
                  {nickname ? nickname.charAt(0).toUpperCase() : '?'}
                </div>
                {nickname && (
                  <h2 className="user-nickname">{nickname}</h2>
                )}
              </div>

              {hasUserInfo && (
                <div className="user-tags-inline">
                  {age && (
                    <button
                      className="user-tag-inline age"
                      onClick={navigateToAgeAnalysis}
                      title="点击查看年龄分析"
                    >
                      {age}岁
                    </button>
                  )}
                  {/* {zodiacSign && (
                    <button
                      className="user-tag-inline zodiac"
                      onClick={navigateToZodiacTraits}
                      title="点击查看星座特质"
                    >
                      {zodiacSign.endsWith('座') ? zodiacSign : `${zodiacSign}座`}
                    </button>
                  )} */}
                  {chineseZodiac && (
                    <button
                      className="user-tag-inline chinese-zodiac"
                      onClick={navigateToChineseZodiac}
                      title="点击查看生肖运势"
                    >
                      {chineseZodiac}
                    </button>
                  )}
                  {currentConfig?.mbti && (
                    <button
                      className="user-tag-inline mbti"
                      onClick={navigateToMBTI}
                      title="点击查看MBTI人格分析"
                    >
                      {currentConfig.mbti}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="guest-section">
              <div className="user-avatar-small guest">?</div>
              <button
                className="setup-profile-btn"
                onClick={() => navigate('/settings')}
              >
                设置资料
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 回到旧版主页链接 - 右下角 */}
      <button
        onClick={handleSwitchToOldVersion}
        className="old-version-btn"
        title="回到旧版炫彩版主页"
      >
        <svg className="old-version-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="old-version-text">旧版</span>
      </button>
    </div>
  );
};

export default memo(MergedBannerCard);
