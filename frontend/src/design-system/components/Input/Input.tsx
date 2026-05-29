import React, { useState, useRef, useEffect } from 'react';

// 输入框变体类型
type InputVariant = 'outlined' | 'filled';

// 输入框Props
type InputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  variant?: InputVariant;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<'input'>, 'label'>;

// Select选项类型
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

// Select Props
type SelectProps = {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

// 变体样式映射
const variantContainerStyles: Record<InputVariant, string> = {
  outlined: 'border border-outline rounded-lg',
  filled: 'bg-surface-container-highest rounded-t-lg',
};

const variantFocusStyles: Record<InputVariant, string> = {
  outlined: 'border-primary border-2',
  filled: 'border-primary border-b-2',
};

// Input组件
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  variant = 'outlined',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  prefixIcon,
  suffixIcon,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const isActive = isFocused || hasValue;

  const containerClasses = [
    'relative w-full',
    disabled ? 'opacity-50' : '',
    className,
  ].filter(Boolean).join(' ');

  const inputContainerClasses = [
    'relative flex items-center',
    variantContainerStyles[variant],
    isFocused ? variantFocusStyles[variant] : '',
    error ? 'border-error' : '',
    'transition-all duration-200',
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'w-full bg-transparent outline-none',
    variant === 'outlined' ? 'px-4 pt-4 pb-1' : 'px-4 pt-5 pb-1',
    'text-on-surface',
    'placeholder-transparent',
    prefixIcon ? 'pl-10' : '',
    suffixIcon ? 'pr-10' : '',
    'disabled:cursor-not-allowed',
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'absolute left-4 transition-all duration-200 pointer-events-none',
    isActive
      ? 'top-2 text-xs'
      : variant === 'filled'
        ? 'top-4 text-base'
        : 'top-3.5 text-base',
    error ? 'text-error' : isFocused ? 'text-primary' : 'text-on-surface-variant',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={inputContainerClasses}>
        {prefixIcon && (
          <div className="absolute left-3 text-on-surface-variant">
            {prefixIcon}
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          placeholder={placeholder || label}
          {...props}
        />
        <label className={labelClasses}>
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </label>
        {suffixIcon && (
          <div className="absolute right-3 text-on-surface-variant">
            {suffixIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p
          className={`mt-1 text-xs px-4 ${
            error ? 'text-error' : 'text-on-surface-variant'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Select组件
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error = '',
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerClasses = [
    'relative w-full',
    disabled ? 'opacity-50' : '',
    className,
  ].filter(Boolean).join(' ');

  const triggerClasses = [
    'w-full flex items-center justify-between',
    'bg-surface-container-high rounded-t-lg',
    'border-b-2 transition-all duration-200',
    isOpen ? 'border-primary' : 'border-on-surface-variant',
    error ? 'border-error' : '',
    'px-4 py-3',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  ].filter(Boolean).join(' ');

  return (
    <div ref={selectRef} className={containerClasses}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={triggerClasses}
      >
        <div className="text-left">
          <span
            className={`block text-xs transition-colors ${
              value ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </span>
          <span
            className={`block mt-0.5 ${
              value ? 'text-on-surface' : 'text-transparent'
            }`}
          >
            {selectedOption?.label || '\u00A0'}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-on-surface-variant transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-surface-container-high rounded-lg shadow-elevation-3 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={option.disabled}
              className={`
                w-full px-4 py-3 text-left
                transition-colors duration-150
                hover:bg-surface-container-high/80
                ${option.value === value ? 'bg-primary-container' : ''}
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error px-4">{error}</p>}
    </div>
  );
};
