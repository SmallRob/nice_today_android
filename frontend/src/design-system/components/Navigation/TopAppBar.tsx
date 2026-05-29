import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '../../utils/useHaptics';

// TopAppBar变体类型
type TopAppBarVariant = 'small' | 'medium' | 'large';

// 操作按钮类型
type AppBarAction = {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
};

// TopAppBar Props
type TopAppBarProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: AppBarAction[];
  variant?: TopAppBarVariant;
  transparent?: boolean;
  onBack?: () => void;
  className?: string;
};

// 高度样式映射
const heightStyles: Record<TopAppBarVariant, string> = {
  small: 'h-14',
  medium: 'h-20',
  large: 'h-28',
};

// TopAppBar组件
export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  actions = [],
  variant = 'small',
  transparent = false,
  onBack,
  className = '',
}) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleBack = () => {
    triggerHaptic('light');
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const headerClasses = [
    heightStyles[variant],
    transparent ? 'bg-transparent' : 'bg-surface',
    'flex items-end',
    'transition-colors duration-200',
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className="flex items-center w-full h-14 px-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors -ml-2"
            aria-label="返回"
          >
            <svg
              className="w-6 h-6 text-on-surface"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className={`flex-1 ${showBack ? 'ml-2' : ''}`}>
          {variant === 'small' ? (
            <h1 className="text-on-surface text-lg font-medium truncate">
              {title}
            </h1>
          ) : (
            <>
              {subtitle && (
                <p className="text-on-surface-variant text-sm">{subtitle}</p>
              )}
              <h1 className="text-on-surface text-2xl font-medium">{title}</h1>
            </>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  triggerHaptic('light');
                  action.onClick();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                aria-label={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
