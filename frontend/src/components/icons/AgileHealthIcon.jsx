import React from 'react';

const AgileHealthIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
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
                d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={color}
                fillOpacity="0.2"
            />
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.2" />
        </svg>
    );
};

export default AgileHealthIcon;
