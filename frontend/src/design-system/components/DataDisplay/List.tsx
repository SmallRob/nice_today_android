import React from 'react';

// ListItem Props
type ListItemProps = {
  leading?: React.ReactNode;
  headline: string;
  supporting?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
};

// List Props
type ListProps = {
  children: React.ReactNode;
  dividers?: boolean;
  className?: string;
};

// ListItem组件
export const ListItem: React.FC<ListItemProps> = ({
  leading,
  headline,
  supporting,
  trailing,
  onClick,
  disabled = false,
  selected = false,
  className = '',
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-3
        transition-colors duration-150
        ${onClick ? 'hover:bg-surface-container-high cursor-pointer' : ''}
        ${selected ? 'bg-primary-container' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-on-surface text-base truncate">{headline}</p>
        {supporting && (
          <p className="text-on-surface-variant text-sm truncate mt-0.5">
            {supporting}
          </p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Component>
  );
};

// List组件
export const List: React.FC<ListProps> = ({
  children,
  dividers = false,
  className = '',
}) => (
  <div className={`py-2 ${className}`}>
    {React.Children.map(children, (child, index) => (
      <>
        {index > 0 && dividers && (
          <div className="border-b border-outline-variant mx-4" />
        )}
        {child}
      </>
    ))}
  </div>
);
