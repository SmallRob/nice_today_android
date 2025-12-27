import React, { memo } from 'react';
import { useUserSummary } from '../../hooks/useUserInfo';
import './UserCard.css';

/**
 * 用户信息展示卡片
 * 在Dashboard顶部显示用户昵称、出生日期、星座等信息
 */
const UserCard = () => {
  const {
    nickname,
    zodiacSign,
    chineseZodiac,
    age,
    birthDate,
    hasUserInfo,
    isLoading
  } = useUserSummary();

  if (isLoading) {
    return (
      <div className="user-card loading">
        <div className="user-avatar">
          <div className="avatar-placeholder"></div>
        </div>
        <div className="user-info">
          <div className="skeleton-line name"></div>
          <div className="skeleton-line info"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-card">
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
          <div className="user-details">
            {zodiacSign && (
              <span className="user-tag zodiac">{zodiacSign}座</span>
            )}
            {chineseZodiac && (
              <span className="user-tag zodiac">{chineseZodiac}年</span>
            )}
            {age && (
              <span className="user-tag age">{age}岁</span>
            )}
          </div>
        )}
        {birthDate && (
          <div className="user-birth-date">
            <svg className="calendar-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {birthDate}
          </div>
        )}
        {!hasUserInfo && (
          <div className="user-guest-prompt">
            <span>完善个人信息以获得个性化体验</span>
            <button 
              className="setup-profile-btn"
              onClick={() => window.location.href = '/settings'}
            >
              设置资料
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(UserCard);