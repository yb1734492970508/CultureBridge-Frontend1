/**
 * 加载动画组件
 * 提供多种样式和大小的加载指示器
 */

import React from 'react';
import { cn } from '../../lib/utils';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    default: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
    white: 'text-white',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
};

export default LoadingSpinner;

