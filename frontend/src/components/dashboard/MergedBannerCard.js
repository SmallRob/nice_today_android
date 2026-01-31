/**
 * 合并的Banner和用户信息卡片
 * 整合应用Banner和用户信息展示
 */
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSummary } from '../../hooks/useUserInfo';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { getZodiacNumber } from '../../utils/horoscopeAlgorithm';
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

  // 获取当前日期和星期
  const getCurrentDate = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return now.toLocaleDateString('zh-CN', options);
  };

  // 跳转函数
  const navigateToZodiacTraits = () => {
    try {
      const userZodiac = currentConfig?.zodiac || zodiacSign;
      if (userZodiac) {
        // 使用数字编码作为URL参数，避免中文编码问题
        const zodiacNumber = getZodiacNumber(userZodiac);
        navigate(`/horoscope-traits/${zodiacNumber}`, {
          state: { from: 'dashboard', userZodiac, timestamp: Date.now() }
        });
      } else {
        navigate('/horoscope');
      }
    } catch (error) {
      console.error('导航到星座特质页面时出错:', error);
      navigate('/horoscope');
    }
  };

  // const navigateToChineseZodiac = () => {
  //   try {
  //     navigate('/zodiac', {
  //       state: { from: 'dashboard', timestamp: Date.now() }
  //     });
  //   } catch (error) {
  //     console.error('导航到生肖运势页面时出错:', error);
  //     // 可以添加备用导航或错误提示
  //     navigate('/ZodiacEnergySimple');
  //   }
  // };

  const navigateToMBTI = () => {
    try {
      const userMBTI = currentConfig?.mbti;
      if (userMBTI) {
        const encodedMBTI = encodeURIComponent(String(userMBTI));
        navigate(`/mbti-detail?mbti=${encodedMBTI}`, {
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
    } catch (error) {
      console.error('导航到MBTI详情页面时出错:', error);
      navigate('/mbti-test', {
        state: { from: 'dashboard', timestamp: Date.now() }
      });
    }
  };

  const navigateToAgeAnalysis = () => {
    try {
      navigate('/age-analysis', {
        state: {
          from: 'dashboard',
          userAge: age,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('导航到年龄分析页面时出错:', error);
      // 可以添加备用导航或错误提示
    }
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
      {/* 星辰装饰背景 */}
      <div className="stars-bg"></div>

      {/* 星辰装饰 */}
      <div className="star star-1">★</div>
      <div className="star star-2">★</div>
      <div className="star star-3">★</div>
      <div className="star star-4">★</div>
      <div className="star star-5">★</div>
      <div className="star star-6">★</div>
      <div className="star star-7">★</div>

      {/* 流星装饰 */}
      <div className="shooting-star shooting-star-1"></div>
      <div className="shooting-star shooting-star-2"></div>
      <div className="shooting-star shooting-star-3"></div>

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
            <p className="app-subtitle">探索运势·发现生活</p>
            <p className="current-date">{getCurrentDate()}</p>
          </div>
        </div>

        {/* 新增面包屑菜单 - 移动到图标下方 */}
        <div className="banner-menu-container">
          <BreadCrumbMenu hideText={true} />
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
                  {zodiacSign && (
                    <button
                      className="user-tag-inline zodiac"
                      onClick={navigateToZodiacTraits}
                      title="点击查看星座特质"
                    >
                      {zodiacSign.endsWith('座') ? zodiacSign : `${zodiacSign}座`}
                    </button>
                  )}
                  {/* {chineseZodiac && (
                    <button
                      className="user-tag-inline chinese-zodiac"
                      onClick={navigateToChineseZodiac}
                      title="点击查看生肖运势"
                    >
                      {chineseZodiac}
                    </button>
                  )} */}
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
    </div>
  );
};

export default memo(MergedBannerCard);
