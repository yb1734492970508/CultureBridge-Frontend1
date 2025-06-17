import React, { useEffect, useRef, useState } from 'react';
import './animations.css';

// 页面过渡动画组件
export const PageTransition = ({ children, isVisible = true, duration = 300 }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass('page-transition-enter');
      const timer = setTimeout(() => {
        setAnimationClass('page-transition-enter-active');
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass('page-transition-exit');
      const timer = setTimeout(() => {
        setAnimationClass('page-transition-exit-active');
      }, 10);
      const hideTimer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [isVisible, duration]);

  if (!shouldRender) return null;

  return (
    <div className={animationClass} style={{ animationDuration: `${duration}ms` }}>
      {children}
    </div>
  );
};

// 滚动显示动画组件
export const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  threshold = 0.1,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay, threshold]);

  const getDirectionClass = () => {
    switch (direction) {
      case 'left': return 'scroll-reveal-left';
      case 'right': return 'scroll-reveal-right';
      default: return 'scroll-reveal';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${getDirectionClass()} ${isVisible ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// 错层动画组件
export const StaggerContainer = ({ children, delay = 100, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = containerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${isVisible ? 'stagger-children' : ''} ${className}`}
      style={{
        '--stagger-delay': `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// 涟漪效果组件
export const RippleButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const buttonRef = useRef(null);

  const createRipple = (event) => {
    const button = buttonRef.current;
    if (!button) return;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-effect');

    const ripple = button.getElementsByClassName('ripple-effect')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    // 清理涟漪效果
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  const handleClick = (event) => {
    if (!disabled) {
      createRipple(event);
      onClick?.(event);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`click-ripple ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...props.style
      }}
    >
      {children}
      <style jsx>{`
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

// 浮动动画组件
export const FloatingElement = ({ 
  children, 
  duration = 3000, 
  reverse = false, 
  className = '' 
}) => {
  return (
    <div
      className={`${reverse ? 'animate-float-reverse' : 'animate-float'} ${className}`}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// 打字机效果组件
export const TypewriterText = ({ 
  text, 
  speed = 100, 
  delay = 0, 
  className = '',
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted || currentIndex >= text.length) {
      if (currentIndex >= text.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isStarted, onComplete]);

  return (
    <span className={`animate-typing ${className}`}>
      {displayText}
    </span>
  );
};

// 粒子效果组件
export const ParticleEffect = ({ 
  count = 20, 
  color = '#3B82F6', 
  size = 4, 
  className = '' 
}) => {
  const particles = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        animation: `particle${(i % 3) + 1} ${2 + Math.random() * 3}s infinite linear`,
        animationDelay: `${Math.random() * 2}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className={`particle-container ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {particles}
    </div>
  );
};

// 加载动画组件
export const LoadingAnimation = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500'
  };

  if (type === 'dots') {
    return (
      <div className={`loading-dots ${colorClasses[color]} ${className}`}>
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    );
  }

  if (type === 'wave') {
    return (
      <div className={`loading-wave ${className}`}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  return (
    <div 
      className={`loading-spinner ${sizeClasses[size]} ${className}`}
      style={{
        borderTopColor: `var(--color-${color}-500)`,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent'
      }}
    />
  );
};

// 渐变动画组件
export const GradientText = ({ 
  children, 
  colors = ['#3B82F6', '#8B5CF6'], 
  animated = true, 
  className = '' 
}) => {
  const gradientStyle = {
    background: `linear-gradient(45deg, ${colors.join(', ')})`,
    backgroundSize: animated ? '200% 200%' : '100% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  return (
    <span
      className={`${animated ? 'animate-gradient-shift' : ''} ${className}`}
      style={gradientStyle}
    >
      {children}
    </span>
  );
};

// 悬停效果组件
export const HoverEffect = ({ 
  children, 
  effect = 'lift', 
  intensity = 'normal', 
  className = '' 
}) => {
  const effectClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    rotate: 'hover-rotate',
    glow: 'hover-glow',
    gradient: 'hover-gradient'
  };

  const intensityStyles = {
    subtle: { '--hover-intensity': '0.02' },
    normal: { '--hover-intensity': '0.05' },
    strong: { '--hover-intensity': '0.1' }
  };

  return (
    <div
      className={`${effectClasses[effect]} ${className}`}
      style={intensityStyles[intensity]}
    >
      {children}
    </div>
  );
};

// 脉冲动画组件
export const PulseEffect = ({ 
  children, 
  color = 'primary', 
  intensity = 'normal', 
  className = '' 
}) => {
  const intensityClasses = {
    subtle: 'animate-pulse',
    normal: 'animate-heartbeat',
    strong: 'animate-glow'
  };

  return (
    <div className={`${intensityClasses[intensity]} ${className}`}>
      {children}
    </div>
  );
};

// 摇摆动画组件
export const ShakeEffect = ({ 
  children, 
  trigger = false, 
  type = 'shake', 
  className = '' 
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, type === 'wobble' ? 1000 : 500);
      return () => clearTimeout(timer);
    }
  }, [trigger, type]);

  const animationClass = type === 'wobble' ? 'animate-wobble' : 'animate-shake';

  return (
    <div className={`${isShaking ? animationClass : ''} ${className}`}>
      {children}
    </div>
  );
};

// 视差滚动组件
export const ParallaxElement = ({ 
  children, 
  speed = 0.5, 
  direction = 'vertical', 
  className = '' 
}) => {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;

      if (direction === 'vertical') {
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={elementRef}
      className={`parallax-element ${className}`}
      style={{
        transform: direction === 'vertical' 
          ? `translateY(${offset}px)` 
          : `translateX(${offset}px)`
      }}
    >
      {children}
    </div>
  );
};

// 动画工具函数
export const animationUtils = {
  // 延迟执行动画
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 错层动画
  stagger: (elements, animation, delay = 100) => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(animation);
      }, index * delay);
    });
  },
  
  // 序列动画
  sequence: async (animations) => {
    for (const animation of animations) {
      await animation();
    }
  },
  
  // 并行动画
  parallel: (animations) => {
    return Promise.all(animations.map(animation => animation()));
  },
  
  // 检测动画支持
  supportsAnimation: () => {
    return typeof window !== 'undefined' && 
           'animation' in document.createElement('div').style;
  },
  
  // 检测用户偏好
  prefersReducedMotion: () => {
    return typeof window !== 'undefined' && 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// 动画钩子
export const useAnimation = (animationName, options = {}) => {
  const elementRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    if (!elementRef.current || animationUtils.prefersReducedMotion()) return;

    setIsAnimating(true);
    elementRef.current.classList.add(animationName);

    const duration = options.duration || 300;
    setTimeout(() => {
      setIsAnimating(false);
      if (elementRef.current) {
        elementRef.current.classList.remove(animationName);
      }
      options.onComplete?.();
    }, duration);
  }, [animationName, options]);

  return { elementRef, isAnimating, startAnimation };
};

// 滚动动画钩子
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return { elementRef, isVisible };
};

// 视差滚动钩子
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { elementRef, offset };
};

