import React from 'react';

// Badge类型
type BadgeVariant = 'standard' | 'dot';

// Badge Props
type BadgeProps = {
  content?: string | number;
  variant?: BadgeVariant;
  color?: 'primary' | 'secondary' | 'error' | 'success';
  max?: number;
  showZero?: boolean;
  invisible?: boolean;
  children?: React.ReactNode;
  className?: string;
};

// 颜色样式映射
const colorStyles = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  error: 'bg-error text-on-error',
  success: 'bg-success text-on-success',
};

// Badge组件
export const Badge: React.FC<BadgeProps> = ({
  content,
  variant = 'standard',
  color = 'error',
  max = 99,
  showZero = false,
  invisible = false,
  children,
  className = '',
}) => {
  const shouldShow =
    !invisible &&
    (variant === 'dot' || content !== undefined || showZero);

  const displayContent = () => {
    if (variant === 'dot') return null;
    if (typeof content === 'number') {
      return content > max ? `${max}+` : content.toString();
    }
    return content;
  };

  if (!shouldShow) {
    return <>{children}</>;
  }

  const badgeClasses = [
    'inline-flex items-center justify-center',
    variant === 'dot' ? 'w-2.5 h-2.5' : 'min-w-5 h-5 px-1',
    'rounded-full',
    'text-xs font-medium',
    colorStyles[color],
    children ? 'absolute -top-1 -right-1' : '',
    className,
  ].filter(Boolean).join(' ');

  if (!children) {
    return <span className={badgeClasses}>{displayContent()}</span>;
  }

  return (
    <div className="relative inline-flex">
      {children}
      <span className={badgeClasses}>{displayContent()}</span>
    </div>
  );
};
