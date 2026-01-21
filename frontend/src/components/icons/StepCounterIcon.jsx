import React from 'react';

const StepCounterIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
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
                d="M17 10c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
                stroke={color}
                strokeWidth="2"
            />
            <path
                d="M7 14c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
                stroke={color}
                strokeWidth="2"
            />
            <path
                d="M14 13c1 2 2 4 1 6s-3 3-5 3-4-1-4-3 1-4 2-6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
            />
            <path
                d="M4 17c1 2 2 4 1 6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
            />
        </svg>
    );
};

export default StepCounterIcon;
