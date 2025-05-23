import React from 'react';
import '../../styles/variables.css';
import './Button.css';

/**
 * 按钮组件
 * @param {Object} props - 组件属性
 * @param {string} [props.variant='primary'] - 按钮变体: 'primary', 'secondary', 'text', 'icon'
 * @param {string} [props.size='medium'] - 按钮尺寸: 'small', 'medium', 'large'
 * @param {boolean} [props.disabled=false] - 是否禁用
 * @param {boolean} [props.loading=false] - 是否加载中
 * @param {string} [props.icon] - 图标名称（如果有）
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {React.ReactNode} props.children - 按钮内容
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  onClick,
  children,
  ...rest
}) => {
  const buttonClasses = [
    'cb-button',
    `cb-button--${variant}`,
    `cb-button--${size}`,
    disabled ? 'cb-button--disabled' : '',
    loading ? 'cb-button--loading' : '',
    icon && !children ? 'cb-button--icon-only' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="cb-button__loader"></span>}
      {icon && <span className="cb-button__icon">{icon}</span>}
      {children && <span className="cb-button__text">{children}</span>}
    </button>
  );
};

export default Button;
