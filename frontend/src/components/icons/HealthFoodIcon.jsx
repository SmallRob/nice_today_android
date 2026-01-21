import React from 'react';

const HealthFoodIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 3L4 9v12h16V9l-8-6z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
            />
            <circle cx="12" cy="13" r="5" stroke={color} strokeWidth="2" />
            <path
                d="M12 10v6M9 13h6"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M7 3l2 2m8-2l-2 2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default HealthFoodIcon;
