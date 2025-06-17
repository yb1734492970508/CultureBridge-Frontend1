import React, { forwardRef, useState, useId } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import './Input.css';

// 输入框变体
const INPUT_VARIANTS = {
  default: 'default',
  filled: 'filled',
  outlined: 'outlined',
  underlined: 'underlined'
};

// 输入框尺寸
const INPUT_SIZES = {
  sm: 'sm',
  md: 'md',
  lg: 'lg'
};

// 基础输入组件
export const Input = forwardRef(({
  label,
  placeholder,
  helperText,
  errorText,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  required = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  className = '',
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();

  // 处理值变化
  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  // 处理焦点
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // 构建CSS类名
  const containerClasses = [
    'cb-input-container',
    `cb-input-container--${variant}`,
    `cb-input-container--${size}`,
    isFocused && 'cb-input-container--focused',
    hasValue && 'cb-input-container--has-value',
    disabled && 'cb-input-container--disabled',
    errorText && 'cb-input-container--error',
    fullWidth && 'cb-input-container--full-width',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'cb-input',
    leftIcon && 'cb-input--with-left-icon',
    rightIcon && 'cb-input--with-right-icon',
    leftAddon && 'cb-input--with-left-addon',
    rightAddon && 'cb-input--with-right-addon'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* 标签 */}
      {label && (
        <label htmlFor={inputId} className="cb-input-label">
          {label}
          {required && <span className="cb-input-required">*</span>}
        </label>
      )}
      
      {/* 输入框容器 */}
      <div className="cb-input-wrapper">
        {/* 左侧插件 */}
        {leftAddon && (
          <div className="cb-input-addon cb-input-addon--left">
            {leftAddon}
          </div>
        )}
        
        {/* 左侧图标 */}
        {leftIcon && (
          <div className="cb-input-icon cb-input-icon--left">
            {leftIcon}
          </div>
        )}
        
        {/* 输入框 */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-describedby={
            [
              helperText && helperId,
              errorText && errorId
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={Boolean(errorText)}
          {...props}
        />
        
        {/* 右侧图标 */}
        {rightIcon && (
          <div className="cb-input-icon cb-input-icon--right">
            {rightIcon}
          </div>
        )}
        
        {/* 右侧插件 */}
        {rightAddon && (
          <div className="cb-input-addon cb-input-addon--right">
            {rightAddon}
          </div>
        )}
        
        {/* 浮动标签 */}
        {variant === 'filled' && label && (
          <label htmlFor={inputId} className="cb-input-floating-label">
            {label}
            {required && <span className="cb-input-required">*</span>}
          </label>
        )}
      </div>
      
      {/* 帮助文本或错误信息 */}
      {(helperText || errorText) && (
        <div className="cb-input-help">
          {errorText ? (
            <span id={errorId} className="cb-input-error">
              {errorText}
            </span>
          ) : (
            <span id={helperId} className="cb-input-helper">
              {helperText}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// 密码输入组件
export const PasswordInput = forwardRef(({
  showPasswordToggle = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showPasswordToggle && (
          <button
            type="button"
            className="cb-password-toggle"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// 搜索输入组件
export const SearchInput = forwardRef(({
  onSearch,
  onClear,
  clearable = true,
  ...props
}, ref) => {
  const [value, setValue] = useState(props.value || '');

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
    props.onKeyPress?.(e);
  };

  const handleClear = () => {
    setValue('');
    onClear?.();
    if (props.onChange) {
      props.onChange({ target: { value: '' } });
    }
  };

  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );

  const ClearIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      leftIcon={<SearchIcon />}
      rightIcon={
        clearable && value && (
          <button
            type="button"
            className="cb-search-clear"
            onClick={handleClear}
            tabIndex={-1}
          >
            <ClearIcon />
          </button>
        )
      }
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// 文本域组件
export const Textarea = forwardRef(({
  label,
  placeholder,
  helperText,
  errorText,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  required = false,
  fullWidth = false,
  rows = 4,
  autoResize = false,
  maxRows,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const textareaId = useId();
  const helperId = useId();
  const errorId = useId();

  // 处理值变化
  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    
    // 自动调整高度
    if (autoResize) {
      const textarea = e.target;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = maxRows ? maxRows * 24 : Infinity; // 假设行高为24px
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
    
    onChange?.(e);
  };

  // 处理焦点
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // 构建CSS类名
  const containerClasses = [
    'cb-textarea-container',
    `cb-textarea-container--${variant}`,
    `cb-textarea-container--${size}`,
    isFocused && 'cb-textarea-container--focused',
    hasValue && 'cb-textarea-container--has-value',
    disabled && 'cb-textarea-container--disabled',
    errorText && 'cb-textarea-container--error',
    fullWidth && 'cb-textarea-container--full-width',
    autoResize && 'cb-textarea-container--auto-resize',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* 标签 */}
      {label && (
        <label htmlFor={textareaId} className="cb-textarea-label">
          {label}
          {required && <span className="cb-textarea-required">*</span>}
        </label>
      )}
      
      {/* 文本域容器 */}
      <div className="cb-textarea-wrapper">
        <textarea
          ref={ref}
          id={textareaId}
          className="cb-textarea"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-describedby={
            [
              helperText && helperId,
              errorText && errorId
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={Boolean(errorText)}
          {...props}
        />
      </div>
      
      {/* 帮助文本或错误信息 */}
      {(helperText || errorText) && (
        <div className="cb-textarea-help">
          {errorText ? (
            <span id={errorId} className="cb-textarea-error">
              {errorText}
            </span>
          ) : (
            <span id={helperId} className="cb-textarea-helper">
              {helperText}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// 导出常量
export { INPUT_VARIANTS, INPUT_SIZES };

export default Input;

