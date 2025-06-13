import React, { useState } from 'react';
import './TransactionButton.css';

/**
 * 交易按钮组件
 * 支持加载状态、禁用状态和不同的按钮类型
 */
const TransactionButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, danger, success
  size = 'medium', // small, medium, large
  className = '',
  type = 'button',
  fullWidth = false,
  icon = null,
  loadingText = '处理中...',
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  // 处理点击事件
  const handleClick = async (e) => {
    if (disabled || loading) return;
    
    setIsClicked(true);
    
    try {
      if (onClick) {
        await onClick(e);
      }
    } catch (error) {
      console.error('Button click error:', error);
    } finally {
      // 延迟重置点击状态，提供视觉反馈
      setTimeout(() => setIsClicked(false), 150);
    }
  };

  // 构建CSS类名
  const getClassName = () => {
    const classes = [
      'transaction-button',
      `transaction-button--${variant}`,
      `transaction-button--${size}`,
      className
    ];

    if (loading) classes.push('transaction-button--loading');
    if (disabled) classes.push('transaction-button--disabled');
    if (fullWidth) classes.push('transaction-button--full-width');
    if (isClicked) classes.push('transaction-button--clicked');

    return classes.filter(Boolean).join(' ');
  };

  // 渲染加载图标
  const renderLoadingIcon = () => (
    <svg 
      className="transaction-button__loading-icon" 
      width="16" 
      height="16" 
      viewBox="0 0 16 16"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        fill="none"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="2s"
          values="0 31.416;15.708 15.708;0 31.416;0 31.416"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="2s"
          values="0;-15.708;-31.416;-31.416"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );

  // 渲染按钮内容
  const renderContent = () => {
    if (loading) {
      return (
        <span className="transaction-button__content">
          {renderLoadingIcon()}
          <span className="transaction-button__text">
            {loadingText}
          </span>
        </span>
      );
    }

    return (
      <span className="transaction-button__content">
        {icon && (
          <span className="transaction-button__icon">
            {icon}
          </span>
        )}
        <span className="transaction-button__text">
          {children}
        </span>
      </span>
    );
  };

  return (
    <button
      type={type}
      className={getClassName()}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
      
      {/* 点击波纹效果 */}
      <span className="transaction-button__ripple"></span>
    </button>
  );
};

// 预定义的按钮变体
export const PrimaryButton = (props) => (
  <TransactionButton variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <TransactionButton variant="secondary" {...props} />
);

export const DangerButton = (props) => (
  <TransactionButton variant="danger" {...props} />
);

export const SuccessButton = (props) => (
  <TransactionButton variant="success" {...props} />
);

// 预定义的尺寸变体
export const SmallButton = (props) => (
  <TransactionButton size="small" {...props} />
);

export const LargeButton = (props) => (
  <TransactionButton size="large" {...props} />
);

export default TransactionButton;

