import React from 'react';
import { useHaptics } from '../../utils/useHaptics';

// 卡片变体类型
type CardVariant = 'elevated' | 'filled' | 'outlined';

// 卡片基础Props
type CardBaseProps = {
  variant?: CardVariant;
  onClick?: () => void;
  onLongPress?: () => void;
  haptic?: boolean;
};

// 卡片Props
type CardProps = CardBaseProps &
  Omit<React.ComponentPropsWithoutRef<'div'>, keyof CardBaseProps>;

// 卡片头部Props
type CardHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

// 卡片内容Props
type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

// 卡片媒体Props
type CardMediaProps = {
  src: string;
  alt?: string;
  aspectRatio?: string;
  className?: string;
};

// 卡片操作区Props
type CardActionsProps = {
  children: React.ReactNode;
  className?: string;
};

// 变体样式映射
const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-surface-container-low shadow-elevation-1 hover:shadow-elevation-2',
  filled: 'bg-surface-container-high',
  outlined: 'border border-outline-variant bg-surface',
};

// Card组件
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  onClick,
  onLongPress,
  haptic = true,
  children,
  className = '',
  ...props
}) => {
  const { triggerHaptic } = useHaptics();

  const handleClick = () => {
    if (haptic) {
      triggerHaptic('light');
    }
    onClick?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onLongPress) {
      e.preventDefault();
      if (haptic) {
        triggerHaptic('medium');
      }
      onLongPress();
    }
  };

  const cardClasses = [
    'rounded-xl overflow-hidden',
    'transition-all duration-200',
    variantStyles[variant],
    onClick ? 'cursor-pointer active:scale-[0.98]' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick ? handleClick : undefined}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {children}
    </div>
  );
};

// CardHeader组件
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => (
  <div className={`p-4 pb-2 ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-on-surface font-medium text-base">{title}</h3>
        {subtitle && (
          <p className="text-on-surface-variant text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);

// CardContent组件
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 py-2 ${className}`}>
    {children}
  </div>
);

// CardMedia组件
export const CardMedia: React.FC<CardMediaProps> = ({
  src,
  alt = '',
  aspectRatio = '16/9',
  className = '',
}) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{ aspectRatio }}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
);

// CardActions组件
export const CardActions: React.FC<CardActionsProps> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 pt-2 flex items-center justify-end gap-2 ${className}`}>
    {children}
  </div>
);
