import React from 'react';
import { useHaptics } from '../../utils/useHaptics';

// 按钮变体类型
type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';

// 按钮尺寸类型
type ButtonSize = 'small' | 'medium' | 'large';

// 基础Props
type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
};

// 使用discriminated unions处理不同变体
type ButtonProps = ButtonBaseProps &
  Omit<React.ComponentPropsWithoutRef<'button'>, keyof ButtonBaseProps>;

// 变体样式映射
const variantStyles: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80',
  outlined: 'border border-outline text-primary hover:bg-primary/8 active:bg-primary/12',
  text: 'text-primary hover:bg-primary/8 active:bg-primary/12',
  elevated: 'bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1',
  tonal: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/80',
};

// 禁用状态样式
const disabledStyles: Record<ButtonVariant, string> = {
  filled: 'bg-on-surface/12 text-on-surface/38',
  outlined: 'border-on-surface/12 text-on-surface/38',
  text: 'text-on-surface/38',
  elevated: 'bg-on-surface/12 text-on-surface/38 shadow-none',
  tonal: 'bg-on-surface/12 text-on-surface/38',
};

// 尺寸样式映射
const sizeStyles: Record<ButtonSize, string> = {
  small: 'h-8 px-4 text-xs gap-1.5',
  medium: 'h-10 px-6 text-sm gap-2',
  large: 'h-12 px-8 text-base gap-2',
};

// 图标尺寸映射
const iconSizes: Record<ButtonSize, number> = {
  small: 16,
  medium: 18,
  large: 20,
};

// Button组件
export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  haptic = true,
  disabled = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const { triggerHaptic } = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    if (haptic) {
      triggerHaptic('light');
    }

    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  const buttonClasses = [
    // 基础样式
    'inline-flex items-center justify-center',
    'rounded-full font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
    'select-none',
    // 变体样式
    isDisabled ? disabledStyles[variant] : variantStyles[variant],
    // 尺寸样式
    sizeStyles[size],
    // 全宽
    fullWidth ? 'w-full' : '',
    // 禁用时的光标
    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
    // 自定义类名
    className,
  ].filter(Boolean).join(' ');

  const iconSize = iconSizes[size];

  const renderIcon = () => {
    if (loading) {
      return (
        <svg
          className="animate-spin"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      );
    }

    if (icon) {
      return <span style={{ width: iconSize, height: iconSize }}>{icon}</span>;
    }

    return null;
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};
