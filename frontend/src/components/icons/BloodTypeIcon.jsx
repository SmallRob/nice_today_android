import React from 'react';

const BloodTypeIcon = ({ type = 'A', className = '', size = 24, color = 'white' }) => {
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
                d="M12 21.5c4.142 0 7.5-3.358 7.5-7.5 0-3.5-3.5-8.5-7.5-11.5-4 3-7.5 8-7.5 11.5 0 4.142 3.358 7.5 7.5 7.5z"
                fill={color}
                fillOpacity="0.2"
                stroke={color}
                strokeWidth="2"
            />
            <text
                x="12"
                y="16"
                textAnchor="middle"
                fill={color}
                fontSize="8"
                fontWeight="900"
                fontFamily="Arial, sans-serif"
            >
                {type}
            </text>
        </svg>
    );
};

export default BloodTypeIcon;
