import React, { useState, useEffect } from 'react';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const actions = [
    { icon: '💬', label: '快速聊天', action: () => console.log('快速聊天') },
    { icon: '📚', label: '开始学习', action: () => console.log('开始学习') },
    { icon: '🎯', label: '每日任务', action: () => console.log('每日任务') },
    { icon: '🎁', label: '领取奖励', action: () => console.log('领取奖励') },
  ];

  return (
    <div className={`fab-container ${isVisible ? 'visible' : 'hidden'}`}>
      {/* 子按钮 */}
      {actions.map((action, index) => (
        <button
          key={index}
          className={`fab-action ${isExpanded ? 'expanded' : ''}`}
          style={{ '--delay': `${index * 0.1}s` }}
          onClick={action.action}
          title={action.label}
        >
          <span className="fab-icon">{action.icon}</span>
          <span className="fab-label">{action.label}</span>
        </button>
      ))}
      
      {/* 主按钮 */}
      <button
        className={`fab-main ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`fab-icon ${isExpanded ? 'rotated' : ''}`}>
          {isExpanded ? '✕' : '⚡'}
        </span>
      </button>
    </div>
  );
};

export default FloatingActionButton;

