import React from 'react';
import '../../styles/variables.css';
import './Card.css';

/**
 * 卡片组件
 * @param {Object} props - 组件属性
 * @param {string} [props.variant='basic'] - 卡片变体: 'basic', 'outline', 'flat', 'interactive'
 * @param {React.ReactNode} [props.header] - 卡片头部内容
 * @param {React.ReactNode} props.children - 卡片主体内容
 * @param {React.ReactNode} [props.footer] - 卡片底部内容
 * @param {React.ReactNode} [props.media] - 卡片媒体内容
 * @param {Function} [props.onClick] - 点击事件处理函数（仅用于interactive变体）
 * @param {string} [props.className] - 额外的CSS类名
 */
const Card = ({
  variant = 'basic',
  header,
  children,
  footer,
  media,
  onClick,
  className = '',
  ...rest
}) => {
  const isInteractive = variant === 'interactive';
  
  const cardClasses = [
    'cb-card',
    `cb-card--${variant}`,
    isInteractive ? 'cb-card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...rest}
    >
      {media && <div className="cb-card__media">{media}</div>}
      
      {header && <div className="cb-card__header">{header}</div>}
      
      <div className="cb-card__content">{children}</div>
      
      {footer && <div className="cb-card__footer">{footer}</div>}
    </div>
  );
};

export default Card;
