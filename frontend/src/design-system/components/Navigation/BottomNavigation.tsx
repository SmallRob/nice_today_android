import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../utils/useHaptics';

// 导航项类型
type BottomNavItem = {
  path: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
};

// BottomNavigation Props
type BottomNavigationProps = {
  items: BottomNavItem[];
  className?: string;
};

// BottomNavigation组件
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();

  const handleNavClick = (path: string) => {
    triggerHaptic('light');
    navigate(path);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-surface-container-high shadow-elevation-2 z-50 ${className}`}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-on-surface-variant'}
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`
                  w-16 h-8 flex items-center justify-center rounded-full
                  transition-all duration-200
                  ${isActive ? 'bg-primary-container' : ''}
                `}
              >
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
