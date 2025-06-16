import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import './LoadingSpinner.css';

// 加载动画变体
const SPINNER_VARIANTS = {
  dots: 'dots',
  circle: 'circle',
  bars: 'bars',
  pulse: 'pulse',
  wave: 'wave',
  skeleton: 'skeleton'
};

// 加载动画尺寸
const SPINNER_SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

// 基础加载动画组件
const LoadingSpinner = ({
  variant = 'circle',
  size = 'md',
  color = 'primary',
  text = '加载中...',
  showText = true,
  fullScreen = false,
  overlay = false,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  // 构建CSS类名
  const containerClasses = [
    'cb-loading-spinner',
    `cb-loading-spinner--${variant}`,
    `cb-loading-spinner--${size}`,
    `cb-loading-spinner--${color}`,
    fullScreen && 'cb-loading-spinner--fullscreen',
    overlay && 'cb-loading-spinner--overlay',
    className
  ].filter(Boolean).join(' ');

  // 渲染不同变体的加载动画
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="cb-spinner-dots">
            <div className="cb-spinner-dot"></div>
            <div className="cb-spinner-dot"></div>
            <div className="cb-spinner-dot"></div>
          </div>
        );

      case 'circle':
        return (
          <div className="cb-spinner-circle">
            <svg viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          </div>
        );

      case 'bars':
        return (
          <div className="cb-spinner-bars">
            <div className="cb-spinner-bar"></div>
            <div className="cb-spinner-bar"></div>
            <div className="cb-spinner-bar"></div>
            <div className="cb-spinner-bar"></div>
            <div className="cb-spinner-bar"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="cb-spinner-pulse">
            <div className="cb-spinner-pulse-ring"></div>
            <div className="cb-spinner-pulse-ring"></div>
            <div className="cb-spinner-pulse-ring"></div>
          </div>
        );

      case 'wave':
        return (
          <div className="cb-spinner-wave">
            <div className="cb-spinner-wave-bar"></div>
            <div className="cb-spinner-wave-bar"></div>
            <div className="cb-spinner-wave-bar"></div>
            <div className="cb-spinner-wave-bar"></div>
            <div className="cb-spinner-wave-bar"></div>
          </div>
        );

      case 'skeleton':
        return (
          <div className="cb-spinner-skeleton">
            <div className="cb-skeleton-line cb-skeleton-line--title"></div>
            <div className="cb-skeleton-line cb-skeleton-line--text"></div>
            <div className="cb-skeleton-line cb-skeleton-line--text"></div>
            <div className="cb-skeleton-line cb-skeleton-line--short"></div>
          </div>
        );

      default:
        return (
          <div className="cb-spinner-circle">
            <svg viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={containerClasses} {...props}>
      <div className="cb-loading-spinner__content">
        {renderSpinner()}
        {showText && text && (
          <div className="cb-loading-spinner__text">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

// 页面加载组件
export const PageLoader = ({ text = '页面加载中...', ...props }) => (
  <LoadingSpinner
    variant="circle"
    size="lg"
    text={text}
    fullScreen
    {...props}
  />
);

// 内容加载组件
export const ContentLoader = ({ text = '内容加载中...', ...props }) => (
  <LoadingSpinner
    variant="skeleton"
    size="md"
    text={text}
    showText={false}
    {...props}
  />
);

// 按钮加载组件
export const ButtonLoader = ({ size = 'sm', ...props }) => (
  <LoadingSpinner
    variant="circle"
    size={size}
    showText={false}
    {...props}
  />
);

// 覆盖层加载组件
export const OverlayLoader = ({ text = '处理中...', ...props }) => (
  <LoadingSpinner
    variant="pulse"
    size="lg"
    text={text}
    overlay
    {...props}
  />
);

// 骨架屏组件
export const SkeletonLoader = ({
  lines = 3,
  avatar = false,
  title = false,
  className = '',
  ...props
}) => {
  const skeletonClasses = [
    'cb-skeleton-loader',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={skeletonClasses} {...props}>
      {avatar && (
        <div className="cb-skeleton-avatar"></div>
      )}
      <div className="cb-skeleton-content">
        {title && (
          <div className="cb-skeleton-line cb-skeleton-line--title"></div>
        )}
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`cb-skeleton-line ${
              index === lines - 1 ? 'cb-skeleton-line--short' : 'cb-skeleton-line--text'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// 卡片骨架屏组件
export const CardSkeleton = ({ ...props }) => (
  <div className="cb-card-skeleton">
    <div className="cb-skeleton-image"></div>
    <div className="cb-skeleton-content">
      <div className="cb-skeleton-line cb-skeleton-line--title"></div>
      <div className="cb-skeleton-line cb-skeleton-line--text"></div>
      <div className="cb-skeleton-line cb-skeleton-line--short"></div>
    </div>
  </div>
);

// 列表骨架屏组件
export const ListSkeleton = ({ items = 5, ...props }) => (
  <div className="cb-list-skeleton">
    {Array.from({ length: items }, (_, index) => (
      <SkeletonLoader
        key={index}
        lines={2}
        avatar
        className="cb-list-skeleton-item"
      />
    ))}
  </div>
);

// 表格骨架屏组件
export const TableSkeleton = ({ rows = 5, columns = 4, ...props }) => (
  <div className="cb-table-skeleton">
    <div className="cb-table-skeleton-header">
      {Array.from({ length: columns }, (_, index) => (
        <div key={index} className="cb-skeleton-line cb-skeleton-line--header"></div>
      ))}
    </div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="cb-table-skeleton-row">
        {Array.from({ length: columns }, (_, colIndex) => (
          <div key={colIndex} className="cb-skeleton-line cb-skeleton-line--cell"></div>
        ))}
      </div>
    ))}
  </div>
);

// 高阶组件：为组件添加加载状态
export const withLoading = (Component, LoaderComponent = LoadingSpinner) => {
  const WrappedComponent = ({ isLoading, loadingProps, ...props }) => {
    if (isLoading) {
      return <LoaderComponent {...loadingProps} />;
    }
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook：管理加载状态
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggleLoading = React.useCallback(() => {
    setIsLoading(prev => !prev);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};

// 导出常量
export { SPINNER_VARIANTS, SPINNER_SIZES };

export default LoadingSpinner;

