import React from 'react';

const StageHealthIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.3" />
            <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="4 4"
            />
            <circle cx="12" cy="12" r="5" fill={color} opacity="0.8" />
            <path
                d="M12 7v10M7 12h10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="12" cy="7" r="1.5" fill={color} />
            <circle cx="17" cy="12" r="1.5" fill={color} />
            <circle cx="12" cy="17" r="1.5" fill={color} />
            <circle cx="7" cy="12" r="1.5" fill={color} />
        </svg>
    );
};

export default StageHealthIcon;
