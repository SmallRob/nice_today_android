import React from 'react';

// 线性进度条Props
type LinearProgressProps = {
  value?: number;
  indeterminate?: boolean;
  variant?: 'determinate' | 'indeterminate';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  className?: string;
};

// 环形进度条Props
type CircularProgressProps = {
  value?: number;
  indeterminate?: boolean;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  className?: string;
};

// 颜色样式映射
const colorStyles = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  error: 'bg-error',
};

const strokeColorStyles = {
  primary: 'stroke-primary',
  secondary: 'stroke-secondary',
  tertiary: 'stroke-tertiary',
  error: 'stroke-error',
};

// 线性进度条组件
export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  indeterminate = false,
  variant,
  color = 'primary',
  className = '',
}) => {
  const isIndeterminate = variant === 'indeterminate' || indeterminate;

  return (
    <div
      className={`
        w-full h-1 bg-surface-container-highest
        rounded-full overflow-hidden
        ${className}
      `}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`
          h-full rounded-full transition-all duration-300
          ${colorStyles[color]}
          ${isIndeterminate ? 'animate-linear-progress' : ''}
        `}
        style={isIndeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// 环形进度条组件
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  indeterminate = false,
  size = 40,
  strokeWidth = 4,
  color = 'primary',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = indeterminate ? 25 : (value / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* 背景圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-surface-container-highest"
      />
      {/* 进度圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={`${strokeColorStyles[color]}`}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: dashOffset,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: indeterminate ? 'none' : 'stroke-dashoffset 0.3s ease',
        }}
      />
    </svg>
  );
};

// 骨架屏Props
type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
};

// 骨架屏组件
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className = '',
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`
        bg-surface-container-highest animate-pulse
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
};
