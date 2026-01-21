import React from 'react';

const SeasonalHealthIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.2" />
            {/* Spring - Leaf */}
            <path
                d="M12 12c0-3 2-5 5-5m-5 5c3 0 5 2 5 5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Summer - Sun */}
            <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
            <path
                d="M12 7V5M12 19v-2M7 12H5M19 12h-2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Autumn - Falling leaf/Wind */}
            <path
                d="M7 7c1 1 2 0 3 1M5 9c1 1 2 0 3 1"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Winter - Snowflake */}
            <path
                d="M12 12l-3-3m3 3l3-3m-3 3l-3 3m3-3l3 3"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default SeasonalHealthIcon;
