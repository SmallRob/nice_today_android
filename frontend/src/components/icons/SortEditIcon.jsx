import React from 'react';

const SortEditIcon = ({ size = 24, isEditMode = false, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="edit-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient id="check-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#43e97b" />
                    <stop offset="100%" stopColor="#38f9d7" />
                </linearGradient>
                <linearGradient id="colorful-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fa709a" />
                    <stop offset="100%" stopColor="#fee140" />
                </linearGradient>
                <filter id="icon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {isEditMode ? (
                <g filter="url(#icon-glow)">
                    <circle cx="12" cy="12" r="10" fill="url(#check-gradient-main)" />
                    <path
                        d="M8 12l3 3 5-5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            ) : (
                <g filter="url(#icon-glow)">
                    {/* 背景彩色圆圈，使其更好辨认 */}
                    <circle cx="12" cy="12" r="11" fill="url(#edit-gradient-main)" opacity="0.15" />

                    {/* 排序/编辑图标 */}
                    <rect x="4" y="7" width="10" height="2.5" rx="1.25" fill="url(#edit-gradient-main)" />
                    <rect x="4" y="12" width="16" height="2.5" rx="1.25" fill="url(#edit-gradient-main)" />
                    <rect x="10" y="17" width="10" height="2.5" rx="1.25" fill="url(#colorful-gradient)" />

                    {/* 小圆点装饰 */}
                    <circle cx="17" cy="8.25" r="2.25" fill="url(#colorful-gradient)" />
                    <circle cx="6" cy="18.25" r="2.25" fill="url(#edit-gradient-main)" />
                </g>
            )}
        </svg>
    );
};

export default SortEditIcon;
