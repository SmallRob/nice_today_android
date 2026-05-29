import React, { useEffect, useState } from 'react';

// Snackbar类型
type SnackbarType = 'default' | 'success' | 'error' | 'warning' | 'info';

// Snackbar Props
type SnackbarProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: SnackbarType;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHideDuration?: number;
  className?: string;
};

// 类型样式映射
const typeStyles: Record<SnackbarType, string> = {
  default: 'bg-inverse-surface text-inverse-on-surface',
  success: 'bg-success text-on-success',
  error: 'bg-error text-on-error',
  warning: 'bg-warning text-on-warning',
  info: 'bg-info text-on-info',
};

// Snackbar组件
export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  onClose,
  message,
  type = 'default',
  action,
  autoHideDuration = 4000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 等待动画结束
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  return (
    <div
      className={`
        fixed bottom-20 left-4 right-4 z-50
        flex items-center justify-between
        px-4 py-3 rounded-lg
        shadow-elevation-3
        transition-all duration-300
        ${typeStyles[type]}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${className}
      `}
    >
      <p className="flex-1 text-sm">{message}</p>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose();
          }}
          className="ml-4 px-2 py-1 text-sm font-medium hover:bg-white/10 rounded transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// useSnackbar Hook
type UseSnackbarReturn = {
  showSnackbar: (message: string, type?: SnackbarType) => void;
  snackbarProps: Omit<SnackbarProps, 'open'>;
};

export const useSnackbar = (): UseSnackbarReturn => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('default');

  const showSnackbar = (msg: string, snackType: SnackbarType = 'default') => {
    setMessage(msg);
    setType(snackType);
    setOpen(true);
  };

  return {
    showSnackbar,
    snackbarProps: {
      onClose: () => setOpen(false),
      message,
      type,
    },
  };
};
