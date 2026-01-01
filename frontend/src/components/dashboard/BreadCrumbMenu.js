import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserSummary } from '../../hooks/useUserInfo';
import './BreadCrumbMenu.css';

const ENTERTAINMENT_FEATURES = [
    { id: 'home', icon: '🏠', name: '首页面板', route: '/' },
    { id: 'tarot', icon: '🎴', name: '塔罗抽卡', route: '/tarot', category: 'main' },
    { id: 'daily-card', icon: '🃏', name: '每日抽卡', route: '/daily-card', category: 'main' },
    { id: 'cultural-cup', icon: '🏵️', name: '文化抽签', route: '/cultural-cup', category: 'main' },
    { id: 'fishing', icon: '🎣', name: '垂钓游戏', route: '/fishing-game', category: 'main' },
    { id: 'profile', icon: '👤', name: '个人中心', route: '/settings', category: 'main' },
];

const COMMON_FEATURES = [
    { id: 'finance', icon: '💰', name: '财务管理', route: '/finance' },
    { id: 'todo', icon: '📝', name: '日程清单', route: '/todo' },
    { id: 'dress', icon: '👕', name: '穿衣指南', route: '/dress' },
    { id: 'bazi', icon: '☯️', name: '八字命理', route: '/bazi-analysis' },
    { id: 'horoscope', icon: '📅', name: '星座运势', route: '/horoscope' },
];

const BreadCrumbMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { nickname, hasUserInfo } = useUserSummary();

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 注意：因为使用了 Portal，我们要检查点击是否在菜单内容内
            // 这里的 menuRef 现在只绑定在 wrapper 上（按钮位置）
            // 我们可以在菜单内容上也加一个 ref，或者简单的判断点击目标
        };
        if (isOpen) {
            // document.addEventListener('mousedown', handleClickOutside);
            // document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            // document.removeEventListener('mousedown', handleClickOutside);
            // document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleNavigate = (route) => {
        navigate(route);
        closeMenu();
    };

    const isActive = (route) => {
        if (route === '/' && location.pathname === '/') return true;
        if (route !== '/' && location.pathname.startsWith(route)) return true;
        return false;
    };

    const menuContent = (
        <>
            <div className={`breadcrumb-side-menu ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="menu-blur-bg"></div>

                <div className="menu-header">
                    <div className="user-profile-mini">
                        <div className={`user-avatar-placeholder ${!hasUserInfo ? 'guest' : ''}`}>
                            {nickname ? nickname.charAt(0).toUpperCase() : 'N'}
                        </div>
                        <div className="user-info-text">
                            <div className="user-name">{nickname || '访客用户'}</div>
                            <div className="user-status">Nice Today Explorer</div>
                        </div>
                    </div>
                    <button className="menu-close-btn" onClick={closeMenu}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                        </svg>
                    </button>
                </div>

                <div className="menu-content hide-scrollbar">
                    <div className="menu-section">
                        <ul className="menu-list">
                            {ENTERTAINMENT_FEATURES.map(item => (
                                <li key={item.id} className={`menu-item ${isActive(item.route) ? 'active' : ''}`}>
                                    <button onClick={() => handleNavigate(item.route)}>
                                        <div className="item-icon-box">{item.icon}</div>
                                        <span className="item-name">{item.name}</span>
                                        {isActive(item.route) && <div className="active-dot"></div>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="menu-separator">
                        <span>常用功能</span>
                    </div>

                    <div className="menu-section">
                        <ul className="menu-list secondary">
                            {COMMON_FEATURES.map(item => (
                                <li key={item.id} className={`menu-item ${isActive(item.route) ? 'active' : ''}`}>
                                    <button onClick={() => handleNavigate(item.route)}>
                                        <div className="item-icon-box">{item.icon}</div>
                                        <span className="item-name">{item.name}</span>
                                        {isActive(item.route) && <div className="active-dot"></div>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            {isOpen && <div className="menu-overlay global-overlay" onClick={closeMenu}></div>}
        </>
    );

    return (
        <div className="breadcrumb-menu-wrapper" ref={menuRef}>
            <button
                className={`breadcrumb-trigger-btn pill-style ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-label="快捷入口菜单"
            >
                <div className="trigger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span className="trigger-text">快捷入口</span>
            </button>

            {createPortal(menuContent, document.body)}
        </div>
    );
};

export default BreadCrumbMenu;
