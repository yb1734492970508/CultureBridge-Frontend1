# NFT与治理系统视觉增强实现建议 (CB-DESIGN for CB-FRONTEND - Day 15)

## 1. 概述

本文档基于《NFT与治理系统视觉设计增强指南》，为CB-FRONTEND团队提供具体的实现建议和代码片段，旨在协助将视觉增强方案落地到实际的前端组件中。重点关注NFT成就卡片、治理提案卡片、色彩、排版、图标和动效的实现细节。

## 2. 色彩系统实现

确保所有颜色定义在全局CSS变量中，并根据明暗模式进行调整。

```css
/* /src/styles/colors.css */
:root {
  /* 主色 - 蓝色 */
  --primary-50: #e6f0ff; --primary-100: #cce0ff; --primary-200: #99c2ff; --primary-300: #66a3ff; --primary-400: #3385ff; --primary-500: #0066ff; --primary-600: #0052cc; --primary-700: #003d99; --primary-800: #002966; --primary-900: #001433;
  
  /* 次要色 - 紫色 */
  --secondary-50: #f2e6ff; --secondary-100: #e5ccff; --secondary-200: #cc99ff; --secondary-300: #b266ff; --secondary-400: #9933ff; --secondary-500: #7f00ff; --secondary-600: #6600cc; --secondary-700: #4c0099; --secondary-800: #330066; --secondary-900: #190033;

  /* 功能色 */
  --success-500: #2ECC71; --warning-500: #F39C12; --error-500: #E74C3C; --info-500: #3498DB;

  /* 灰度 */
  --gray-50: #f8f9fa; --gray-100: #f1f3f5; --gray-200: #e9ecef; --gray-300: #dee2e6; --gray-400: #ced4da; --gray-500: #adb5bd; --gray-600: #868e96; --gray-700: #495057; --gray-800: #343a40; --gray-900: #212529;

  /* 文本颜色 */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-disabled: var(--gray-500);

  /* 背景颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: var(--gray-50);
  --bg-tertiary: var(--gray-100);

  /* 边框颜色 */
  --border-light: var(--gray-300);
  --border-medium: var(--gray-400);

  /* 成就稀有度色彩 */
  --rarity-common: #7E8C8D; --rarity-uncommon: #2ECC71; --rarity-rare: #3498DB; --rarity-epic: #9B59B6; --rarity-legendary: #F1C40F;
  --gradient-common: linear-gradient(135deg, #7E8C8D, #95A5A6);
  --gradient-uncommon: linear-gradient(135deg, #2ECC71, #27AE60);
  --gradient-rare: linear-gradient(135deg, #3498DB, #2980B9);
  --gradient-epic: linear-gradient(135deg, #9B59B6, #8E44AD);
  --gradient-legendary: linear-gradient(135deg, #F1C40F, #F39C12);

  /* 治理状态色彩 */
  --status-pending: #95A5A6; --status-active: #3498DB; --status-succeeded: #2ECC71; --status-defeated: #E74C3C; --status-queued: #F39C12; --status-executed: #9B59B6; --status-canceled: #7F8C8D; --status-expired: #BDC3C7;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: rgba(255, 255, 255, 0.87);
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-disabled: rgba(255, 255, 255, 0.38);
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-tertiary: #2c2c2c;
    --border-light: rgba(255, 255, 255, 0.12);
    --border-medium: rgba(255, 255, 255, 0.24);

    /* 暗色模式下稀有度渐变调整 */
    --gradient-common: linear-gradient(135deg, #95A5A6, #BDC3C7);
    /* 其他稀有度渐变类似调整 */
  }
}
```

## 3. 排版系统实现

同样使用CSS变量定义字体样式。

```css
/* /src/styles/typography.css */
:root {
  /* 字体家族 */
  --font-family-heading: 'Poppins', sans-serif;
  --font-family-body: 'Inter', sans-serif;

  /* 标题 */
  --font-h1: 700 2.5rem/1.2 var(--font-family-heading);
  --font-h2: 700 2rem/1.25 var(--font-family-heading);
  /* ... 其他标题 */
  --font-h6: 600 1rem/1.45 var(--font-family-heading);
  
  /* 正文 */
  --font-body-large: 400 1.125rem/1.5 var(--font-family-body);
  --font-body: 400 1rem/1.5 var(--font-family-body);
  /* ... 其他正文 */
  --font-body-xs: 400 0.75rem/1.5 var(--font-family-body);
  
  /* 特殊文本 */
  --font-caption: 400 0.75rem/1.3 var(--font-family-body);
  --font-overline: 400 0.625rem/1.5 var(--font-family-body);
  --font-button: 500 0.875rem/1 var(--font-family-body);
  --font-label: 500 0.75rem/1 var(--font-family-body);
}

body {
  font: var(--font-body);
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

h1 { font: var(--font-h1); } h2 { font: var(--font-h2); } /* ... 其他标题 */
```

## 4. 图标系统实现 (Phosphor Icons)

推荐使用 `phosphor-react` 库。

```bash
npm install phosphor-react
# or
yarn add phosphor-react
```

```jsx
// /src/components/Icon.jsx
import React from 'react';
import * as Icons from 'phosphor-react';

const Icon = ({ name, size = 24, color = 'currentColor', weight = 'regular', ...props }) => {
  // 将kebab-case转换为PascalCase (e.g., trophy-bold -> TrophyBold)
  const iconName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
    
  const IconComponent = Icons[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Phosphor Icons.`);
    return null; // 或者返回一个默认图标
  }

  return <IconComponent size={size} color={color} weight={weight} {...props} />;
};

export default Icon;

// 使用示例
import Icon from './Icon';

const MyComponent = () => (
  <div>
    <Icon name="Trophy" size={32} color="var(--rarity-legendary)" weight="fill" />
    <Icon name="CheckCircle" size={20} color="var(--success-500)" />
    <Icon name="Warning" size={16} color="var(--warning-500)" weight="bold" />
  </div>
);
```

## 5. 组件实现建议

### 5.1 NFT成就卡片 (React + CSS Modules)

```jsx
// /src/components/AchievementCard/AchievementCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../Icon';
import styles from './AchievementCard.module.css';

const AchievementCard = ({ achievement, locked }) => {
  const { id, title, description, rarity, imageUrl } = achievement;
  
  const rarityClass = styles[rarity.toLowerCase()] || styles.common;
  const lockedClass = locked ? styles.locked : '';

  return (
    <motion.div 
      className={`${styles.card} ${rarityClass} ${lockedClass}`}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.image} />
        {locked && (
          <div className={styles.lockOverlay}>
            <Icon name="Lock" size={32} color="white" weight="bold" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {!locked && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.rarityBadge}>{rarity}</div>
    </motion.div>
  );
};

AchievementCard.propTypes = {
  achievement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    rarity: PropTypes.oneOf(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).isRequired,
    imageUrl: PropTypes.string.isRequired,
  }).isRequired,
  locked: PropTypes.bool,
};

AchievementCard.defaultProps = {
  locked: false,
};

export default AchievementCard;
```

```css
/* /src/components/AchievementCard/AchievementCard.module.css */
.card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

/* 稀有度边框 */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 2px; /* 边框宽度 */
  background: var(--gradient-common); /* 默认边框 */
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.uncommon::before { background: var(--gradient-uncommon); }
.rare::before { background: var(--gradient-rare); }
.epic::before { background: var(--gradient-epic); }
.legendary::before { background: var(--gradient-legendary); padding: 3px; }

.imageContainer {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 aspect ratio */
  background-color: var(--bg-tertiary);
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 16px;
  flex-grow: 1;
}

.title {
  font: var(--font-h6);
  color: var(--text-primary);
  margin-bottom: 8px;
  /* 应用渐变色 - 可选 */
  /* background: var(--gradient-rare); 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; */
}

.description {
  font: var(--font-body-small);
  color: var(--text-secondary);
  line-height: 1.4;
}

.rarityBadge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font: var(--font-label);
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2;
}

/* 锁定状态 */
.locked .image {
  filter: grayscale(1);
}

.locked .content {
  opacity: 0.7;
}

.lockOverlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 响应式调整 */
@media (max-width: 639px) {
  .card {
    flex-direction: row;
    align-items: center;
  }
  .imageContainer {
    width: 80px;
    height: 80px;
    padding-top: 0;
    flex-shrink: 0;
    border-radius: 8px 0 0 8px;
  }
  .image {
     border-radius: 8px 0 0 8px;
  }
  .content {
    flex: 1;
    padding: 12px;
  }
  .description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
  }
  .rarityBadge {
    position: static;
    margin-top: 8px;
    align-self: flex-start;
    background: none;
    color: var(--text-secondary);
    padding: 0;
  }
  .card::before { /* 移动端可简化或移除边框 */
    display: none;
  }
}
```

### 5.2 治理提案卡片 (React + CSS Modules)

```jsx
// /src/components/ProposalCard/ProposalCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../Icon';
import ProgressBar from './ProgressBar'; // 进度条子组件
import styles from './ProposalCard.module.css';

const ProposalCard = ({ proposal, userVote }) => {
  const { id, title, proposer, status, votesFor, votesAgainst, totalVotes, endDate } = proposal;
  
  const statusClass = styles[status.toLowerCase()] || styles.pending;
  const statusColorVar = `var(--status-${status.toLowerCase()})`;

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'Clock';
      case 'succeeded': return 'CheckCircle';
      case 'defeated': return 'XCircle';
      case 'queued': return 'HourglassMedium';
      case 'executed': return 'RocketLaunch';
      case 'canceled': return 'Prohibit';
      case 'expired': return 'Timer';
      default: return 'Question';
    }
  };

  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${styles.status} ${statusClass}`}>
        <Icon name={getStatusIcon(status)} size={16} color={statusColorVar} />
        <span>{status}</span>
      </div>
      
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.proposer}>提案人: {proposer}</p>
      
      <ProgressBar 
        votesFor={votesFor}
        votesAgainst={votesAgainst}
        totalVotes={totalVotes}
      />
      
      <div className={styles.details}>
        <span>结束时间: {new Date(endDate).toLocaleDateString()}</span>
        {userVote && (
          <span className={styles.userVoted}>
            <Icon name="CheckCircle" size={14} color="var(--success-500)" />
            您已投票
          </span>
        )}
      </div>
    </motion.div>
  );
};

// PropTypes 定义...

export default ProposalCard;
```

```jsx
// /src/components/ProposalCard/ProgressBar.jsx
import React from 'react';
import styles from './ProposalCard.module.css';

const ProgressBar = ({ votesFor, votesAgainst, totalVotes }) => {
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFor}
          style={{ width: `${forPercentage}%` }}
        />
        <div 
          className={styles.progressAgainst}
          style={{ width: `${againstPercentage}%` }}
        />
      </div>
      <div className={styles.progressLabels}>
        <span className={styles.labelFor}>{votesFor.toLocaleString()} 赞成</span>
        <span className={styles.labelAgainst}>{votesAgainst.toLocaleString()} 反对</span>
      </div>
    </div>
  );
};

export default ProgressBar;
```

```css
/* /src/components/ProposalCard/ProposalCard.module.css */
.card {
  position: relative;
  border-radius: 12px;
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  border-left: 4px solid var(--status-pending); /* 默认状态边框 */
  transition: border-color 0.3s ease;
}

/* 状态颜色边框 */
.active { border-left-color: var(--status-active); }
.succeeded { border-left-color: var(--status-succeeded); }
.defeated { border-left-color: var(--status-defeated); }
/* ... 其他状态 */

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

/* 状态文字颜色 */
.active span { color: var(--status-active); }
.succeeded span { color: var(--status-succeeded); }
.defeated span { color: var(--status-defeated); }
/* ... 其他状态 */

.title {
  font: var(--font-h5);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.proposer {
  font: var(--font-body-small);
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* 进度条容器 */
.progressContainer {
  margin-bottom: 16px;
}

.progressBar {
  height: 8px;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  overflow: hidden;
  position: relative;
}

.progressFor {
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  background-color: var(--success-500);
  transition: width 0.5s ease-out;
}

.progressAgainst {
  position: absolute;
  height: 100%;
  right: 0;
  top: 0;
  background-color: var(--error-500);
  transition: width 0.5s ease-out;
}

.progressLabels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font: var(--font-caption);
  color: var(--text-secondary);
}

.labelFor { color: var(--success-500); }
.labelAgainst { color: var(--error-500); }

.details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: var(--font-body-small);
  color: var(--text-secondary);
}

.userVoted {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success-500);
  font: var(--font-label);
}
```

## 6. 动效实现 (Framer Motion)

建议使用 `framer-motion` 实现页面转场和列表项动画。

```jsx
// /src/App.jsx (示例)
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import PageWrapper from './components/PageWrapper'; // 包含 motion.div 的包装器
import AchievementsPage from './pages/AchievementsPage';
import GovernancePage from './pages/GovernancePage';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait"> {/* mode="wait" 确保退出动画完成后再进入 */} 
      <Routes location={location} key={location.pathname}>
        <Route path="/achievements" element={<PageWrapper><AchievementsPage /></PageWrapper>} />
        <Route path="/governance" element={<PageWrapper><GovernancePage /></PageWrapper>} />
        {/* 其他路由 */}
      </Routes>
    </AnimatePresence>
  );
}

// /src/components/PageWrapper.jsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="enter"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
);

export default PageWrapper;
```

## 7. 响应式设计实现

使用CSS媒体查询或响应式UI库（如Tailwind CSS, Chakra UI）的断点功能来实现布局调整。

```css
/* /src/components/AchievementGrid/AchievementGrid.module.css */
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr; /* 移动端默认单列 */
}

/* 平板端 */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
```

## 8. 可访问性 (A11y)

- **语义化HTML**: 使用正确的HTML标签（`<nav>`, `<main>`, `<button>`, `<h1>`-`<h6>`等）。
- **ARIA属性**: 为动态组件添加适当的ARIA属性（如`aria-live`, `aria-expanded`, `role`）。
- **键盘导航**: 确保所有交互元素都可以通过键盘访问和操作。
- **焦点管理**: 在模态框、抽屉菜单等打开时管理焦点。
- **颜色对比度**: 确保文本和背景有足够的对比度，遵循WCAG AA标准。
- **图像Alt文本**: 为所有图像提供有意义的`alt`文本。

## 9. 结论

请CB-FRONTEND团队参考以上建议和代码片段，将视觉设计增强指南中的理念转化为具体的代码实现。在实现过程中，注重代码的可维护性、性能和可访问性。CB-DESIGN团队将持续提供支持，解答疑问并审核实现效果。
