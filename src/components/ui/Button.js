import React, { forwardRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import './Button.css';

// 按钮变体类型
const BUTTON_VARIANTS = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  ghost: 'ghost',
  outline: 'outline',
  link: 'link'
};

// 按钮尺寸
const BUTTON_SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

// 现代化按钮组件
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const { theme } = useTheme();

  // 构建CSS类名
  const classes = [
    'cb-button',
    `cb-button--${variant}`,
    `cb-button--${size}`,
    disabled && 'cb-button--disabled',
    loading && 'cb-button--loading',
    fullWidth && 'cb-button--full-width',
    className
  ].filter(Boolean).join(' ');

  // 处理点击事件
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* 加载状态 */}
      {loading && (
        <span className="cb-button__loading">
          <svg className="cb-button__spinner" viewBox="0 0 24 24">
            <circle
              className="cb-button__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      )}
      
      {/* 左侧图标 */}
      {leftIcon && !loading && (
        <span className="cb-button__icon cb-button__icon--left">
          {leftIcon}
        </span>
      )}
      
      {/* 按钮内容 */}
      <span className="cb-button__content">
        {children}
      </span>
      
      {/* 右侧图标 */}
      {rightIcon && !loading && (
        <span className="cb-button__icon cb-button__icon--right">
          {rightIcon}
        </span>
      )}
      
      {/* 涟漪效果 */}
      <span className="cb-button__ripple"></span>
    </button>
  );
});

Button.displayName = 'Button';

// 图标按钮组件
export const IconButton = forwardRef(({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`cb-icon-button ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// 按钮组组件
export const ButtonGroup = ({
  children,
  variant = 'primary',
  size = 'md',
  orientation = 'horizontal',
  className = '',
  ...props
}) => {
  const classes = [
    'cb-button-group',
    `cb-button-group--${orientation}`,
    className
  ].filter(Boolean).join(' ');

  // 为子按钮添加统一的props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Button) {
      return React.cloneElement(child, {
        variant: child.props.variant || variant,
        size: child.props.size || size,
        className: `${child.props.className || ''} cb-button-group__item`.trim()
      });
    }
    return child;
  });

  return (
    <div className={classes} {...props}>
      {enhancedChildren}
    </div>
  );
};

// 浮动操作按钮
export const FloatingActionButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'lg',
  position = 'bottom-right',
  className = '',
  ...props
}, ref) => {
  const classes = [
    'cb-fab',
    `cb-fab--${position}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={classes}
      {...props}
    >
      {children}
    </Button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

// 导出常量
export { BUTTON_VARIANTS, BUTTON_SIZES };

export default Button;

