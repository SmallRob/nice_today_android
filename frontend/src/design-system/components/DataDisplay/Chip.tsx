import React from 'react';

// Chip变体类型
type ChipVariant = 'filled' | 'outlined';

// Chip Props
type ChipProps = {
  label: string;
  variant?: ChipVariant;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
};

// 变体样式映射
const variantStyles: Record<ChipVariant, string> = {
  filled: 'bg-surface-container-high',
  outlined: 'border border-outline',
};

// 选中状态样式
const selectedStyles: Record<ChipVariant, string> = {
  filled: 'bg-secondary-container text-on-secondary-container',
  outlined: 'border-secondary bg-secondary-container text-on-secondary-container',
};

// Chip组件
export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filled',
  icon,
  selected = false,
  onClick,
  onDelete,
  disabled = false,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-lg
        text-sm font-medium
        transition-all duration-150
        ${selected ? selectedStyles[variant] : variantStyles[variant]}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-4 h-4 hover:opacity-70 transition-opacity"
          aria-label="删除"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </Component>
  );
};
