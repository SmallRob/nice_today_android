import React, { useEffect, useRef } from 'react';

// Dialog Props
type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

// 最大宽度样式映射
const maxWidthStyles = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

// Dialog组件
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 处理点击外部关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // 阻止背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* 对话框 */}
      <div
        ref={dialogRef}
        className={`
          relative w-full ${maxWidthStyles[maxWidth]}
          bg-surface-container-high rounded-2xl
          shadow-elevation-3
          animate-scale-in
          ${className}
        `}
      >
        {/* 标题 */}
        {title && (
          <div className="p-6 pb-2">
            <h2 className="text-on-surface text-xl font-medium">{title}</h2>
          </div>
        )}

        {/* 内容 */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* 操作按钮 */}
        {actions && (
          <div className="p-4 pt-2 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// 确认对话框Props
type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
};

// 确认对话框组件
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary hover:bg-primary/8 rounded-full transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`
              px-4 py-2 rounded-full transition-colors
              ${
                variant === 'danger'
                  ? 'bg-error text-on-error hover:bg-error/90'
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }
            `}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-on-surface-variant">{message}</p>
    </Dialog>
  );
};
