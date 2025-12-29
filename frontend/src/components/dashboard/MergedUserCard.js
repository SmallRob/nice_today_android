import React, { memo } from 'react';
import { useUserSummary } from '../../hooks/useUserInfo';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext';
import './MergedUserCard.css';

/**
 * 合并的用户信息卡片 - 整合问候信息和用户标签
 * 展示年龄、星座、属相和MBTI类型，支持点击跳转
 */
const MergedUserCard = () => {
  const {
    nickname,
    zodiacSign,
    chineseZodiac,
    age,
    birthDate,
    hasUserInfo,
    isLoading
  } = useUserSummary();
  
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
      // 跳转到用户的MBTI详情页面
      navigate(`/mbti-detail?mbti=${encodeURIComponent(userMBTI)}`, {
        state: { 
          from: 'dashboard', 
          mbtiType: userMBTI,
          timestamp: Date.now() 
        }
      });
    } else {
      // 如果没有MBTI类型，跳转到测试页面
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
      <div className="merged-card loading">
        <div className="greeting-section">
          <div className="skeleton-line greeting"></div>
          <div className="skeleton-line date"></div>
        </div>
        <div className="user-section">
          <div className="user-avatar">
            <div className="avatar-placeholder"></div>
          </div>
          <div className="user-info">
            <div className="skeleton-line name"></div>
            <div className="skeleton-line tags"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="merged-card">
      {/* 问候区域 */}
      <div className="greeting-section">
        <h1 className="greeting">{getGreeting()}</h1>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      {/* 用户信息区域 */}
      <div className="user-section">
        <div className="user-avatar">
          {hasUserInfo ? (
            <div className="avatar-initial">
              {nickname ? nickname.charAt(0).toUpperCase() : '?'}
            </div>
          ) : (
            <div className="avatar-guest">?</div>
          )}
        </div>
        
        <div className="user-info">
          <div className="user-name">{nickname}</div>
          
          {hasUserInfo && (
            <div className="user-tags">
              {/* 年龄标签 */}
              {age && (
                <button 
                  className="user-tag age"
                  onClick={navigateToAgeAnalysis}
                  title="点击查看年龄分析"
                >
                  {age}岁
                </button>
              )}
              
              {/* 星座标签 */}
              {zodiacSign && (
                <button 
                  className="user-tag zodiac"
                  onClick={navigateToZodiacTraits}
                  title="点击查看星座特质"
                >
                  {zodiacSign.endsWith('座') ? zodiacSign : `${zodiacSign}座`}
                </button>
              )}
              
              {/* 生肖标签 */}
              {chineseZodiac && (
                <button 
                  className="user-tag chinese-zodiac"
                  onClick={navigateToChineseZodiac}
                  title="点击查看生肖运势"
                >
                  {chineseZodiac}
                </button>
              )}
              
              {/* MBTI标签 */}
              {currentConfig?.mbti && (
                <button 
                  className="user-tag mbti"
                  onClick={navigateToMBTI}
                  title="点击查看MBTI人格分析"
                >
                  {currentConfig.mbti}
                </button>
              )}
            </div>
          )}
          
          {/* 引导提示 */}
          {!hasUserInfo && (
            <div className="user-guide">
              <span>完善个人信息以获得个性化体验</span>
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

export default memo(MergedUserCard);