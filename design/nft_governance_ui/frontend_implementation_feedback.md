# NFT与治理系统前端实现反馈与优化建议 (CB-DESIGN for CB-FRONTEND - Day 17)

## 1. 概述

本文档基于集成测试反馈和视觉设计增强指南，为CB-FRONTEND团队提供实现过程中的反馈和优化建议。我们已经回顾了前端组件的当前实现状态，并结合集成测试中发现的问题，提出针对性的优化建议，以确保前端界面既符合设计规范，又能满足功能需求和用户体验目标。

## 2. 成就卡片组件优化

### 2.1 当前实现状态

CB-FRONTEND团队已基本实现了NFT成就卡片组件，包括稀有度边框、锁定状态和响应式布局。但在集成测试中发现以下问题：

1. 稀有度边框在某些浏览器中显示不一致
2. 锁定状态下的交互反馈不够明确
3. 成就解锁动画缺乏视觉冲击力

### 2.2 优化建议

#### 2.2.1 稀有度边框跨浏览器兼容性

```css
/* 替代原有的mask方案，提高兼容性 */
.card {
  position: relative;
  border-radius: 12px;
  background: var(--bg-primary);
  /* 其他样式保持不变 */
}

/* 使用伪元素实现边框效果 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  padding: 2px;
  background: var(--gradient-common);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* 为不支持mask的浏览器提供回退方案 */
@supports not ((mask-composite: exclude) or (-webkit-mask-composite: xor)) {
  .card {
    border: 2px solid transparent;
    background-clip: padding-box;
    position: relative;
  }
  
  .card::before {
    content: '';
    position: absolute;
    top: -2px; left: -2px;
    bottom: -2px; right: -2px;
    background: var(--gradient-common);
    border-radius: 14px;
    z-index: -1;
  }
}
```

#### 2.2.2 锁定状态交互增强

```jsx
// 增强锁定状态的交互反馈
const AchievementCard = ({ achievement, locked, onCardClick }) => {
  // ... 其他代码保持不变
  
  return (
    <motion.div 
      className={`${styles.card} ${rarityClass} ${lockedClass}`}
      whileHover={locked ? { scale: 1.02 } : { y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)' }}
      whileTap={locked ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onCardClick(achievement, locked)}
      role="button"
      tabIndex={0}
      aria-label={locked ? `锁定的成就: ${title}` : `成就: ${title}`}
    >
      {/* ... 其他内容保持不变 */}
      
      {locked && (
        <div className={styles.lockOverlay}>
          <Icon name="Lock" size={32} color="white" weight="bold" />
          <p className={styles.lockText}>点击查看解锁条件</p>
        </div>
      )}
    </motion.div>
  );
};
```

```css
/* 锁定状态样式增强 */
.lockOverlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: background-color 0.2s ease;
}

.card:hover .lockOverlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.lockText {
  color: white;
  font: var(--font-caption);
  margin-top: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.card:hover .lockText {
  opacity: 1;
  transform: translateY(0);
}
```

#### 2.2.3 成就解锁动画增强

```jsx
// 成就解锁动画组件
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import styles from './AchievementUnlockAnimation.module.css';

const AchievementUnlockAnimation = ({ achievement, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    // 触发彩色粒子效果
    if (animationStage === 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // 动画阶段控制
    const timer = setTimeout(() => {
      if (animationStage < 3) {
        setAnimationStage(animationStage + 1);
      } else {
        onComplete();
      }
    }, animationStage === 0 ? 500 : 1500);
    
    return () => clearTimeout(timer);
  }, [animationStage, onComplete, achievement]);
  
  // 根据稀有度选择动画效果
  const getAnimationVariants = () => {
    const baseVariants = {
      initial: { scale: 0.8, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
        transition: { 
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1] // 弹性曲线
        }
      },
      exit: { 
        scale: 1.2, 
        opacity: 0,
        transition: { duration: 0.3 }
      }
    };
    
    // 稀有度越高，动画效果越强
    switch (achievement.rarity.toLowerCase()) {
      case 'legendary':
        return {
          ...baseVariants,
          animate: {
            ...baseVariants.animate,
            scale: [0.8, 1.1, 1],
            rotate: [0, -5, 5, -3, 0],
            transition: {
              duration: 0.8,
              times: [0, 0.5, 1],
              ease: "easeOut"
            }
          }
        };
      case 'epic':
      case 'rare':
        return {
          ...baseVariants,
          animate: {
            ...baseVariants.animate,
            scale: [0.8, 1.05, 1],
            transition: {
              duration: 0.6,
              ease: "easeOut"
            }
          }
        };
      default:
        return baseVariants;
    }
  };
  
  return (
    <div className={styles.overlay}>
      <AnimatePresence>
        {animationStage === 0 && (
          <motion.div 
            className={styles.preReveal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>成就解锁!</h2>
          </motion.div>
        )}
        
        {animationStage === 1 && (
          <motion.div 
            className={styles.cardContainer}
            variants={getAnimationVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AchievementCard achievement={achievement} locked={false} />
            <motion.div 
              className={styles.rarityBadge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {achievement.rarity}级成就!
            </motion.div>
          </motion.div>
        )}
        
        {animationStage === 2 && (
          <motion.div 
            className={styles.rewardInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3>获得奖励</h3>
            <p>{achievement.rewardDescription}</p>
            <motion.button 
              className={styles.continueButton}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setAnimationStage(3)}
            >
              继续
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementUnlockAnimation;
```

```css
/* AchievementUnlockAnimation.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preReveal {
  color: white;
  font-size: 2.5rem;
  text-align: center;
}

.cardContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
}

.rarityBadge {
  margin-top: 24px;
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--gradient-rare); /* 根据成就稀有度动态设置 */
  color: white;
  font: var(--font-button);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rewardInfo {
  color: white;
  text-align: center;
  max-width: 400px;
}

.rewardInfo h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.continueButton {
  margin-top: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  background-color: var(--primary-500);
  color: white;
  font: var(--font-button);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continueButton:hover {
  background-color: var(--primary-600);
}
```

## 3. 治理提案组件优化

### 3.1 当前实现状态

CB-FRONTEND团队已实现了基本的治理提案卡片组件，但在集成测试中发现以下问题：

1. 投票进度条在投票比例极端情况下显示不佳
2. 提案状态标签在移动端显示位置不合理
3. 用户投票状态反馈不够明显

### 3.2 优化建议

#### 3.2.1 投票进度条优化

```jsx
// 优化的ProgressBar组件
const ProgressBar = ({ votesFor, votesAgainst, totalVotes }) => {
  // 确保即使比例极端，也有最小显示宽度
  const minDisplayPercentage = 2; // 最小显示百分比
  
  let forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  let againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  
  // 如果有投票但比例极小，确保有最小显示宽度
  if (votesFor > 0 && forPercentage < minDisplayPercentage) {
    forPercentage = minDisplayPercentage;
    againstPercentage = 100 - minDisplayPercentage;
  } else if (votesAgainst > 0 && againstPercentage < minDisplayPercentage) {
    againstPercentage = minDisplayPercentage;
    forPercentage = 100 - minDisplayPercentage;
  }
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFor}
          style={{ width: `${forPercentage}%` }}
        >
          {forPercentage > 10 && (
            <span className={styles.inlineLabel}>
              {Math.round(forPercentage)}%
            </span>
          )}
        </div>
        <div 
          className={styles.progressAgainst}
          style={{ width: `${againstPercentage}%` }}
        >
          {againstPercentage > 10 && (
            <span className={styles.inlineLabel}>
              {Math.round(againstPercentage)}%
            </span>
          )}
        </div>
      </div>
      <div className={styles.progressLabels}>
        <span className={styles.labelFor}>
          <Icon name="ThumbsUp" size={14} />
          {votesFor.toLocaleString()}
        </span>
        <span className={styles.labelAgainst}>
          <Icon name="ThumbsDown" size={14} />
          {votesAgainst.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
```

```css
/* 进度条样式优化 */
.progressBar {
  height: 12px; /* 增加高度 */
  border-radius: 6px;
  background-color: var(--bg-tertiary);
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
}

.progressFor, .progressAgainst {
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease-out;
}

.progressFor {
  left: 0;
  top: 0;
  background-color: var(--success-500);
  border-radius: 6px 0 0 6px;
}

.progressAgainst {
  right: 0;
  top: 0;
  background-color: var(--error-500);
  border-radius: 0 6px 6px 0;
}

.inlineLabel {
  color: white;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progressLabels {
  display: flex;
  justify-content: space-between;
  font: var(--font-caption);
}

.labelFor, .labelAgainst {
  display: flex;
  align-items: center;
  gap: 4px;
}

.labelFor { color: var(--success-500); }
.labelAgainst { color: var(--error-500); }
```

#### 3.2.2 移动端状态标签优化

```css
/* 移动端状态标签优化 */
.status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  font: var(--font-label);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-secondary);
}

@media (max-width: 639px) {
  .status {
    position: static;
    margin-bottom: 12px;
    align-self: flex-start;
    display: inline-flex;
  }
  
  .card {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }
  
  .title {
    font: var(--font-h6);
    margin-right: 0;
  }
}
```

#### 3.2.3 用户投票状态增强

```jsx
// 增强用户投票状态反馈
const ProposalCard = ({ proposal, userVote }) => {
  // ... 其他代码保持不变
  
  // 用户投票类型（支持/反对）
  const userVoteType = userVote ? userVote.support ? 'for' : 'against' : null;
  
  return (
    <motion.div 
      className={`${styles.card} ${statusClass} ${userVoteType ? styles[`voted${userVoteType}`] : ''}`}
      // ... 其他属性保持不变
    >
      {/* ... 其他内容保持不变 */}
      
      <div className={styles.details}>
        <span>结束时间: {new Date(endDate).toLocaleDateString()}</span>
        {userVote && (
          <span className={`${styles.userVoted} ${styles[`voted${userVoteType}`]}`}>
            <Icon 
              name={userVoteType === 'for' ? 'ThumbsUp' : 'ThumbsDown'} 
              size={14} 
              color={userVoteType === 'for' ? 'var(--success-500)' : 'var(--error-500)'} 
            />
            您已投{userVoteType === 'for' ? '赞成' : '反对'}票
          </span>
        )}
      </div>
    </motion.div>
  );
};
```

```css
/* 用户投票状态样式增强 */
.votedfor {
  border-right: 4px solid var(--success-500);
}

.votedagainst {
  border-right: 4px solid var(--error-500);
}

.userVoted {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font: var(--font-label);
}

.userVoted.votedfor {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success-500);
  border-right: none;
}

.userVoted.votedagainst {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--error-500);
  border-right: none;
}
```

## 4. 集成测试反馈的前端优化

### 4.1 数据加载状态优化

在集成测试中发现，当从区块链获取数据时，前端缺乏明确的加载状态指示，导致用户体验不佳。

```jsx
// 数据加载状态组件
import React from 'react';
import { motion } from 'framer-motion';
import styles from './LoadingState.module.css';

const LoadingState = ({ type = 'default', text = '加载中...' }) => {
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear"
      }
    }
  };
  
  const shimmerVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1.5,
        ease: "linear"
      }
    }
  };
  
  if (type === 'skeleton') {
    return (
      <motion.div 
        className={styles.skeleton}
        variants={shimmerVariants}
        animate="animate"
      />
    );
  }
  
  if (type === 'inline') {
    return (
      <span className={styles.inlineContainer}>
        <motion.span 
          className={styles.inlineSpinner}
          variants={loadingVariants}
          animate="animate"
        />
        {text}
      </span>
    );
  }
  
  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.spinner}
        variants={loadingVariants}
        animate="animate"
      />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default LoadingState;
```

```css
/* LoadingState.module.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--primary-500);
  border-radius: 50%;
}

.text {
  margin-top: 16px;
  color: var(--text-secondary);
  font: var(--font-body);
}

.inlineContainer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font: var(--font-body-small);
}

.inlineSpinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--bg-tertiary);
  border-top-color: var(--primary-500);
  border-radius: 50%;
}

.skeleton {
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
}
```

### 4.2 错误处理与反馈优化

集成测试发现，当合约调用失败时，错误提示不够友好和具体。

```jsx
// 错误提示组件
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ error, onRetry, onDismiss }) => {
  // 错误类型映射
  const getErrorDetails = () => {
    if (!error) return { title: '未知错误', message: '发生了未知错误', icon: 'Warning' };
    
    // 合约错误
    if (error.message && error.message.includes('gas')) {
      return {
        title: 'Gas费用不足',
        message: '交易所需的Gas费用不足，请增加Gas限制或检查账户余额。',
        icon: 'Gas'
      };
    }
    
    if (error.message && error.message.includes('user rejected')) {
      return {
        title: '用户取消',
        message: '您取消了交易签名。',
        icon: 'X'
      };
    }
    
    if (error.message && error.message.includes('nonce')) {
      return {
        title: '交易Nonce错误',
        message: '交易Nonce不正确，可能是由于多个交易同时发送。请稍后重试。',
        icon: 'ClockCounterClockwise'
      };
    }
    
    // 网络错误
    if (error.name === 'NetworkError' || (error.message && error.message.includes('network'))) {
      return {
        title: '网络错误',
        message: '连接服务器失败，请检查您的网络连接。',
        icon: 'CloudSlash'
      };
    }
    
    // 默认错误
    return {
      title: '操作失败',
      message: error.message || '发生了错误，请稍后重试。',
      icon: 'Warning'
    };
  };
  
  const { title, message, icon } = getErrorDetails();
  
  return (
    <AnimatePresence>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className={styles.iconContainer}>
          <Icon name={icon} size={24} color="var(--error-500)" />
        </div>
        <div className={styles.content}>
          <h4 className={styles.title}>{title}</h4>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.actions}>
          {onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              重试
            </button>
          )}
          {onDismiss && (
            <button className={styles.dismissButton} onClick={onDismiss}>
              关闭
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorMessage;
```

```css
/* ErrorMessage.module.css */
.container {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid var(--error-500);
  border-radius: 4px;
  margin-bottom: 16px;
}

.iconContainer {
  flex-shrink: 0;
  margin-right: 12px;
  padding-top: 2px;
}

.content {
  flex-grow: 1;
}

.title {
  font: var(--font-body);
  font-weight: 600;
  color: var(--error-500);
  margin-bottom: 4px;
}

.message {
  font: var(--font-body-small);
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.retryButton, .dismissButton {
  padding: 6px 12px;
  border-radius: 4px;
  font: var(--font-button);
  cursor: pointer;
  border: none;
}

.retryButton {
  background-color: var(--error-500);
  color: white;
}

.dismissButton {
  background-color: transparent;
  color: var(--text-secondary);
}

@media (max-width: 639px) {
  .container {
    flex-direction: column;
  }
  
  .iconContainer {
    margin-bottom: 8px;
  }
  
  .actions {
    margin-left: 0;
    margin-top: 12px;
    align-self: flex-end;
  }
}
```

### 4.3 链上数据缓存优化

集成测试发现，频繁的链上数据请求导致页面加载缓慢，需要优化缓存策略。

```jsx
// 缓存工具函数
// /src/utils/cacheUtils.js
const CACHE_PREFIX = 'cb_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5分钟默认过期时间

// 内存缓存
const memoryCache = new Map();

// 获取缓存键
const getCacheKey = (key) => `${CACHE_PREFIX}${key}`;

// 设置缓存（支持内存和localStorage）
export const setCache = (key, data, options = {}) => {
  const { ttl = DEFAULT_TTL, storage = 'both' } = options;
  const cacheKey = getCacheKey(key);
  const cacheItem = {
    data,
    expires: Date.now() + ttl
  };
  
  // 内存缓存
  if (storage === 'memory' || storage === 'both') {
    memoryCache.set(cacheKey, cacheItem);
  }
  
  // localStorage缓存
  if (storage === 'local' || storage === 'both') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (e) {
      console.warn('localStorage缓存失败:', e);
    }
  }
};

// 获取缓存
export const getCache = (key, options = {}) => {
  const { storage = 'both' } = options;
  const cacheKey = getCacheKey(key);
  let cacheItem;
  
  // 先尝试从内存缓存获取
  if (storage === 'memory' || storage === 'both') {
    cacheItem = memoryCache.get(cacheKey);
    if (cacheItem && cacheItem.expires > Date.now()) {
      return cacheItem.data;
    }
  }
  
  // 再尝试从localStorage获取
  if (storage === 'local' || storage === 'both') {
    try {
      const storedItem = localStorage.getItem(cacheKey);
      if (storedItem) {
        cacheItem = JSON.parse(storedItem);
        if (cacheItem && cacheItem.expires > Date.now()) {
          // 同步到内存缓存
          if (storage === 'both') {
            memoryCache.set(cacheKey, cacheItem);
          }
          return cacheItem.data;
        }
      }
    } catch (e) {
      console.warn('从localStorage获取缓存失败:', e);
    }
  }
  
  return null;
};

// 清除缓存
export const clearCache = (key, options = {}) => {
  const { storage = 'both' } = options;
  const cacheKey = key ? getCacheKey(key) : null;
  
  if (key) {
    // 清除特定键的缓存
    if (storage === 'memory' || storage === 'both') {
      memoryCache.delete(cacheKey);
    }
    
    if (storage === 'local' || storage === 'both') {
      try {
        localStorage.removeItem(cacheKey);
      } catch (e) {
        console.warn('从localStorage清除缓存失败:', e);
      }
    }
  } else {
    // 清除所有缓存
    if (storage === 'memory' || storage === 'both') {
      memoryCache.clear();
    }
    
    if (storage === 'local' || storage === 'both') {
      try {
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(storageKey);
          }
        });
      } catch (e) {
        console.warn('清除所有localStorage缓存失败:', e);
      }
    }
  }
};

// 使用示例
// 在合约数据获取hook中使用
export const useContractData = (contractFunction, args = [], options = {}) => {
  const { 
    enabled = true, 
    cacheTTL = DEFAULT_TTL,
    cacheKey = `${contractFunction.name}_${JSON.stringify(args)}`,
    onSuccess,
    onError
  } = options;
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async (useCache = true) => {
    if (!enabled) return;
    
    // 尝试从缓存获取
    if (useCache) {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        onSuccess?.(cachedData);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contractFunction(...args);
      setData(result);
      setCache(cacheKey, result, { ttl: cacheTTL });
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [contractFunction, args, cacheKey, cacheTTL, enabled, onSuccess, onError]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, isLoading, error, refetch: () => fetchData(false) };
};
```

## 5. 可访问性增强

集成测试发现，当前实现在可访问性方面存在一些不足，特别是键盘导航和屏幕阅读器支持。

### 5.1 键盘导航优化

```jsx
// 键盘导航增强示例 (NFT成就卡片)
const AchievementCard = ({ achievement, locked, onCardClick }) => {
  // ... 其他代码保持不变
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick(achievement, locked);
    }
  };
  
  return (
    <motion.div 
      className={`${styles.card} ${rarityClass} ${lockedClass}`}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onCardClick(achievement, locked)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={locked ? `锁定的成就: ${title}` : `成就: ${title}`}
    >
      {/* ... 其他内容保持不变 */}
    </motion.div>
  );
};
```

### 5.2 ARIA属性增强

```jsx
// 投票进度条ARIA属性增强
const ProgressBar = ({ votesFor, votesAgainst, totalVotes }) => {
  // ... 计算逻辑保持不变
  
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  
  return (
    <div 
      className={styles.progressContainer}
      role="group"
      aria-label="投票结果"
    >
      <div 
        className={styles.progressBar}
        role="presentation"
      >
        <div 
          className={styles.progressFor}
          style={{ width: `${forPercentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(forPercentage)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="赞成票百分比"
        >
          {/* ... 内容保持不变 */}
        </div>
        <div 
          className={styles.progressAgainst}
          style={{ width: `${againstPercentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(againstPercentage)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="反对票百分比"
        >
          {/* ... 内容保持不变 */}
        </div>
      </div>
      <div className={styles.progressLabels}>
        <span className={styles.labelFor}>
          <Icon name="ThumbsUp" size={14} aria-hidden="true" />
          <span>{votesFor.toLocaleString()} 赞成</span>
        </span>
        <span className={styles.labelAgainst}>
          <Icon name="ThumbsDown" size={14} aria-hidden="true" />
          <span>{votesAgainst.toLocaleString()} 反对</span>
        </span>
      </div>
    </div>
  );
};
```

## 6. 结论与后续步骤

基于集成测试反馈和视觉设计增强指南，我们为CB-FRONTEND团队提供了一系列具体的优化建议和代码示例。这些优化涵盖了NFT成就卡片、治理提案卡片、数据加载状态、错误处理、缓存策略和可访问性等多个方面，旨在提升用户体验和系统稳定性。

### 6.1 优先级建议

1. **高优先级**：
   - 实现错误处理与反馈优化，特别是合约交互错误的友好提示
   - 优化数据加载状态，提升用户体验
   - 修复NFT权重计算显示问题（与VM-002-P1问题相关）

2. **中优先级**：
   - 实现链上数据缓存优化，提升性能
   - 增强NFT成就卡片和治理提案卡片的视觉效果
   - 优化移动端响应式布局

3. **低优先级**：
   - 实现成就解锁动画增强
   - 完善可访问性支持
   - 优化暗色模式适配

### 6.2 后续步骤

1. CB-FRONTEND团队应优先实现高优先级的优化建议，特别是与集成测试发现的问题相关的部分。
2. 在实现过程中，应与CB-FEATURES团队保持沟通，确保前端优化与后端功能保持一致。
3. 实现完成后，应进行端到端测试，验证优化效果和用户体验。
4. CB-DESIGN团队将继续提供设计支持和反馈，确保最终实现符合设计规范和用户体验目标。

我们相信，通过这些优化，NFT与治理系统的前端界面将更加美观、易用和稳定，为用户提供更好的体验。
