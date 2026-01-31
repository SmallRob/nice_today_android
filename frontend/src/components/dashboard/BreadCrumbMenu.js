import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserSummary } from '../../hooks/useUserInfo';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { getZodiacNumber } from '../../utils/horoscopeAlgorithm';
import styles from './BreadCrumbMenu.module.css';

const ENTERTAINMENT_FEATURES = [
    { id: 'tarot', icon: '🎴', name: '塔罗抽卡', route: '/tarot', category: 'main' },
    { id: 'daily-card', icon: '🃏', name: '每日抽卡', route: '/daily-cards', category: 'main' },
    { id: 'cultural-cup', icon: '🏵️', name: '文化抽签', route: '/cultural-cup', category: 'main' },
    { id: 'fishing', icon: '🎣', name: '垂钓游戏', route: '/fishing-game', category: 'main' },
];

const COMMON_FEATURES = [
    { id: 'finance', icon: '💰', name: '财务管理', route: '/finance' },
    { id: 'todo', icon: '📝', name: '日程清单', route: '/todo-list' },
    { id: 'focus-timer', icon: '⏱️', name: '专注时钟', route: '/focus-timer' },
    { id: 'habit-tracker', icon: '🎯', name: '习惯追踪', route: '/habit-tracker' },
    { id: 'document-history', icon: '📚', name: '本地阅读', route: '/documents' },
    { id: 'password-vault', icon: '🔐', name: '密码保管箱', route: '/password-vault' }
];

const BreadCrumbMenu = ({ hideText = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        nickname, 
        hasUserInfo, 
        zodiacSign, 
        age, 
        birthDate, 
        chineseZodiac 
    } = useUserSummary();
    const { currentConfig } = useUserConfig();

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const handleNavigate = (route) => {
        navigate(route);
        closeMenu();
    };

    const handleSwitchToOldVersion = () => {
        navigate('/old-dashboard');
        closeMenu();
    };

    const navigateToZodiacTraits = () => {
        const userZodiac = currentConfig?.zodiac || zodiacSign;
        if (userZodiac) {
            const zodiacNumber = getZodiacNumber(userZodiac);
            handleNavigate(`/horoscope-traits/${zodiacNumber}`);
        } else {
            handleNavigate('/horoscope');
        }
    };

    const navigateToMBTI = () => {
        const userMBTI = currentConfig?.mbti;
        if (userMBTI) {
            handleNavigate(`/mbti-detail?mbti=${encodeURIComponent(userMBTI)}`);
        } else {
            handleNavigate('/mbti-test');
        }
    };

    const navigateToAgeAnalysis = () => {
        handleNavigate('/age-analysis');
    };

    const isActive = (route) => {
        if (route === '/' && location.pathname === '/') return true;
        if (route !== '/' && location.pathname.startsWith(route)) return true;
        return false;
    };

    const menuContent = (
        <>
            <div
                className={`${styles['breadcrumb-side-menu']} ${isOpen ? styles.open : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles['menu-blur-bg']}></div>

                <div className={styles['menu-header']}>
                    <div className={styles['user-card-container']}>
                        <div className={styles['user-card-main']}>
                            <div className={styles['user-avatar-section']}>
                                <div className={`${styles['user-avatar-placeholder']} ${!hasUserInfo ? styles.guest : ''}`}>
                                    {nickname ? nickname.charAt(0).toUpperCase() : 'N'}
                                </div>
                                <div className={styles['avatar-decoration']}>✦</div>
                            </div>
                            <div className={styles['user-info-main']}>
                                <div className={styles['user-name-row']}>
                                    <span className={styles['user-name']}>{nickname || '访客用户'}</span>
                                    {currentConfig?.nameScore && (
                                        <span className={styles['user-score-badge']}>
                                            {currentConfig.nameScore.totalScore}分
                                        </span>
                                    )}
                                </div>
                                <div className={styles['user-handle']}>
                                    @{currentConfig?.nickName || 'Explorer'}
                                </div>
                            </div>
                        </div>

                        <div className={styles['user-tags-row']}>
                            {zodiacSign && (
                                <span className={`${styles['user-tag']} ${styles.zodiac}`} onClick={navigateToZodiacTraits}>
                                    {zodiacSign.endsWith('座') ? zodiacSign : `${zodiacSign}座`}
                                </span>
                            )}
                            {chineseZodiac && (
                                <span className={`${styles['user-tag']} ${styles.animal}`}>
                                    {chineseZodiac}
                                </span>
                            )}
                            {age && (
                                <span className={`${styles['user-tag']} ${styles.age}`} onClick={navigateToAgeAnalysis}>
                                    {age}岁
                                </span>
                            )}
                            {currentConfig?.mbti && (
                                <span className={`${styles['user-tag']} ${styles.mbti}`} onClick={navigateToMBTI}>
                                    {currentConfig.mbti}
                                </span>
                            )}
                        </div>

                        <div className={styles['user-birth-info']}>
                            <span className={styles['birth-icon']}>📅</span>
                            <span className={styles['birth-text']}>
                                {birthDate || '未设置出生日期'}
                            </span>
                        </div>
                    </div>

                    <button className={styles['menu-close-btn']} onClick={closeMenu}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                        </svg>
                    </button>
                </div>

                <div className={`${styles['menu-content']} hide-scrollbar`}>

                    {/* 旧版入口 - 移动到用户信息下方 */}
                    <div className={styles['old-version-section']}>
                        <button className={styles['old-version-link']} onClick={handleSwitchToOldVersion}>
                            <div className={styles['old-icon-box']}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className={styles['old-text']}>回到经典版主页</span>
                            <div className={styles['arrow-icon']}>→</div>
                        </button>
                    </div>

                    <div className={styles['menu-separator']}>
                        <span>娱乐功能</span>
                    </div>

                    <div className={styles['menu-section']}>
                        <ul className={styles['menu-list']}>
                            {ENTERTAINMENT_FEATURES.map(item => (
                                <li
                                    key={item.id}
                                    className={`${styles['menu-item']} ${isActive(item.route) ? styles.active : ''}`}
                                >
                                    <button onClick={() => handleNavigate(item.route)}>
                                        <div className={styles['item-icon-box']}>{item.icon}</div>
                                        <span className={styles['item-name']}>{item.name}</span>
                                        {isActive(item.route) && <div className={styles['active-dot']}></div>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles['menu-separator']}>
                        <span>常用工具</span>
                    </div>

                    <div className={styles['menu-section']}>
                        <ul className={`${styles['menu-list']} ${styles.secondary || ''}`}>
                            {COMMON_FEATURES.map(item => (
                                <li
                                    key={item.id}
                                    className={`${styles['menu-item']} ${isActive(item.route) ? styles.active : ''}`}
                                >
                                    <button onClick={() => handleNavigate(item.route)}>
                                        <div className={styles['item-icon-box']}>{item.icon}</div>
                                        <span className={styles['item-name']}>{item.name}</span>
                                        {isActive(item.route) && <div className={styles['active-dot']}></div>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={styles['menu-footer']}>
                    <div className={styles['version-info']}>
                        VERSION 2.4
                        <div className={styles['footer-decoration']}>♡ 🏆</div>
                    </div>
                </div>
            </div>
            {isOpen && <div className={`${styles['menu-overlay']} global-overlay`} onClick={closeMenu}></div>}
        </>
    );

    return (
        <div className={styles['breadcrumb-menu-wrapper']} ref={menuRef}>
            <button
                className={`${styles['breadcrumb-trigger-btn']} ${styles['pill-style']} ${isOpen ? styles.active : ''} ${hideText ? styles['no-text'] : ''}`}
                onClick={toggleMenu}
                aria-label="快捷入口菜单"
            >
                <div className={styles['trigger-icon']}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                {!hideText && <span className={styles['trigger-text']}>快捷入口</span>}
            </button>

            {createPortal(menuContent, document.body)}
        </div>
    );
};

export default BreadCrumbMenu;
