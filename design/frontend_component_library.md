# CultureBridge Frontend Component Library Design Specification
# CultureBridge 前端组件库设计规范

## 1. Design System Overview
## 1. 设计系统概述

The CultureBridge application adopts a unified design system to ensure consistency, usability, and aesthetics of the user interface. The design system is based on the following principles:
CultureBridge应用采用一套统一的设计系统，确保用户界面的一致性、可用性和美观性。设计系统基于以下原则：

- **Consistency**: Maintain visual and interactive consistency throughout the application
- **一致性**：在整个应用中保持视觉和交互的一致性
- **Accessibility**: Ensure all users (including users with disabilities) can effectively use the application
- **可访问性**：确保所有用户（包括残障用户）都能有效使用应用
- **Responsiveness**: Adapt to different screen sizes and device orientations
- **响应式**：适应不同屏幕尺寸和设备方向
- **Internationalization**: Support multiple languages and different cultural backgrounds
- **国际化**：支持多语言和不同文化背景
- **Performance Optimization**: Component design considers performance impact
- **性能优化**：组件设计考虑性能影响

### 1.1 Design Language
### 1.1 设计语言

CultureBridge's design language integrates the structural principles of Material Design with custom visual styles, creating a unique and professional user experience:
CultureBridge的设计语言融合了Material Design的结构化原则和自定义的视觉风格，创造出独特而专业的用户体验：

- **Simple and Clear**: Clear visual hierarchy and intuitive interaction
- **简洁明了**：清晰的视觉层次和直观的交互
- **Friendly and Warm**: Use soft colors and rounded shapes
- **友好温暖**：使用柔和的色彩和圆润的形状
- **Cultural Diversity**: Visual elements reflect global cultural diversity
- **文化多样性**：视觉元素反映全球文化多样性
- **Learning-Oriented**: Interface design promotes learning and communication
- **学习导向**：界面设计促进学习和交流
- **Professional and Reliable**: Convey the professionalism and reliability of the application
- **专业可靠**：传达应用的专业性和可靠性

## 2. Color System
## 2. 色彩系统

### 2.1 Primary Colors
### 2.1 主色调

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Primary | `#4A6FA5` | Main brand color, used for primary buttons, title bars, etc. |
| 主色    | `#4A6FA5` | 主要品牌色，用于主要按钮、标题栏等 |
| Primary-Light | `#7B9CD2` | Secondary elements, backgrounds, highlights |
| 主色-浅 | `#7B9CD2` | 次要元素、背景、高亮 |
| Primary-Dark | `#2A4674` | Button hover state, emphasis elements |
| 主色-深 | `#2A4674` | 按钮悬停状态、强调元素 |

### 2.2 Secondary Colors
### 2.2 辅助色

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Secondary-Green | `#4CAF50` | Success state, positive actions |
| 辅助色-绿 | `#4CAF50` | 成功状态、积极操作 |
| Secondary-Red | `#F44336` | Error state, delete actions |
| 辅助色-红 | `#F44336` | 错误状态、删除操作 |
| Secondary-Yellow | `#FFC107` | Warning state, prompt information |
| 辅助色-黄 | `#FFC107` | 警告状态、提示信息 |
| Secondary-Purple | `#9C27B0` | Special functions, advanced features |
| 辅助色-紫 | `#9C27B0` | 特殊功能、高级特性 |

### 2.3 Neutral Colors
### 2.3 中性色

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Black | `#212121` | Primary text |
| 黑色    | `#212121` | 主要文本 |
| Dark Gray | `#616161` | Secondary text |
| 深灰    | `#616161` | 次要文本 |
| Medium Gray | `#9E9E9E` | Disabled state, separators |
| 中灰    | `#9E9E9E` | 禁用状态、分隔线 |
| Light Gray | `#E0E0E0` | Borders, backgrounds |
| 浅灰    | `#E0E0E0` | 边框、背景 |
| Extra Light Gray | `#F5F5F5` | Backgrounds, cards |
| 超浅灰  | `#F5F5F5` | 背景、卡片 |
| White | `#FFFFFF` | Backgrounds, text |
| 白色    | `#FFFFFF` | 背景、文本 |

### 2.4 Language-Specific Colors
### 2.4 语言特定色彩

Specific colors designed for different language learning modules:
为不同语言学习模块设计的特定色彩：

| Language | Primary Color | Secondary Color | Usage |
|----------|---------------|-----------------|-------|
| English | `#3F51B5` | `#C5CAE9` | English learning module |
| 英语     | `#3F51B5` | `#C5CAE9` | 英语学习模块 |
| Spanish | `#E91E63` | `#F8BBD0` | Spanish learning module |
| 西班牙语 | `#E91E63` | `#F8BBD0` | 西班牙语学习模块 |
| French | `#009688` | `#B2DFDB` | French learning module |
| 法语     | `#009688` | `#B2DFDB` | 法语学习模块 |
| Chinese | `#FF5722` | `#FFCCBC` | Chinese learning module |
| 中文     | `#FF5722` | `#FFCCBC` | 中文学习模块 |
| Japanese | `#673AB7` | `#D1C4E9` | Japanese learning module |
| 日语     | `#673AB7` | `#D1C4E9` | 日语学习模块 |

### 2.5 Dark Theme Colors
### 2.5 暗色主题色彩

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Background-Dark | `#121212` | Primary background |
| 背景-深 | `#121212` | 主要背景 |
| Surface-Dark | `#1E1E1E` | Card, dialog background |
| 表面-深 | `#1E1E1E` | 卡片、对话框背景 |
| Primary-Dark (Theme) | `#5D82B5` | Main brand color (dark theme) |
| 主色-暗 | `#5D82B5` | 主要品牌色（暗色主题） |
| Text-Primary | `#E0E0E0` | Primary text |
| 文本-主要 | `#E0E0E0` | 主要文本 |
| Text-Secondary | `#A0A0A0` | Secondary text |
| 文本-次要 | `#A0A0A0` | 次要文本 |

## 3. Typography System
## 3. 排版系统

### 3.1 Font Families
### 3.1 字体家族

```css
/* Primary font */
/* 主要字体 */
--font-primary: 'Roboto', 'Noto Sans', sans-serif;

/* Heading font */
/* 标题字体 */
--font-heading: 'Montserrat', 'Noto Sans', sans-serif;

/* Monospace font (for code examples, etc.) */
/* 等宽字体（用于代码示例等） */
--font-mono: 'Roboto Mono', 'Noto Sans Mono', monospace;
```

### 3.2 Font Sizes
### 3.2 字体大小

```css
/* Base font sizes - mobile devices */
/* 基础字体大小 - 移动设备 */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

/* Responsive adjustment - tablet and desktop */
/* 响应式调整 - 平板和桌面 */
@media (min-width: 768px) {
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-2xl: 30px;
  --font-size-3xl: 36px;
  --font-size-4xl: 48px;
}
```

### 3.3 Font Weights
### 3.3 字体粗细

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

### 3.4 Line Heights
### 3.4 行高

```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.8;
```

### 3.5 Text Styles
### 3.5 文本样式

| Style Name | Usage | Attributes |
|------------|-------|------------|
| Heading-1 | Homepage title, welcome screen | Font: Heading font, Size: 4xl, Weight: Bold |
| 标题-1     | 主页标题、欢迎屏幕 | 字体：标题字体，大小：4xl，粗细：粗体 |
| Heading-2 | Main page title | Font: Heading font, Size: 3xl, Weight: Bold |
| 标题-2     | 主要页面标题 | 字体：标题字体，大小：3xl，粗细：粗体 |
| Heading-3 | Card title, section title | Font: Heading font, Size: 2xl, Weight: Medium |
| 标题-3     | 卡片标题、部分标题 | 字体：标题字体，大小：2xl，粗细：中等 |
| Heading-4 | Subsection title | Font: Heading font, Size: xl, Weight: Medium |
| 标题-4     | 小节标题 | 字体：标题字体，大小：xl，粗细：中等 |
| Heading-5 | List item title | Font: Heading font, Size: lg, Weight: Medium |
| 标题-5     | 列表项标题 | 字体：标题字体，大小：lg，粗细：中等 |
| Body-Large | Important content, introduction | Font: Primary font, Size: lg, Weight: Regular |
| 正文-大    | 重要内容、引言 | 字体：主要字体，大小：lg，粗细：常规 |
| Body | Main content text | Font: Primary font, Size: md, Weight: Regular |
| 正文       | 主要内容文本 | 字体：主要字体，大小：md，粗细：常规 |
| Body-Small | Secondary content, descriptive text | Font: Primary font, Size: sm, Weight: Regular |
| 正文-小    | 次要内容、说明文本 | 字体：主要字体，大小：sm，粗细：常规 |
| Caption | Labels, badges, timestamps | Font: Primary font, Size: xs, Weight: Medium |
| 标注       | 标签、徽章、时间戳 | 字体：主要字体，大小：xs，粗细：中等 |
| Button Text | Button labels | Font: Primary font, Size: md, Weight: Medium, Uppercase |
| 按钮文本   | 按钮标签 | 字体：主要字体，大小：md，粗细：中等，大写 |
| Link | Clickable links | Font: Primary font, Size: Inherit, Weight: Regular, Underline |
| 链接       | 可点击链接 | 字体：主要字体，大小：继承，粗细：常规，下划线 |

## 4. Spacing System
## 4. 间距系统

### 4.1 Base Spacing Unit
### 4.1 基础间距单位

```css
/* Base spacing unit - 4px grid system */
/* 基础间距单位 - 4px网格系统 */
--space-unit: 4px;

/* Spacing variables */
/* 间距变量 */
--space-xs: calc(var(--space-unit) * 1); /* 4px */
--space-sm: calc(var(--space-unit) * 2); /* 8px */
--space-md: calc(var(--space-unit) * 4); /* 16px */
--space-lg: calc(var(--space-unit) * 6); /* 24px */
--space-xl: calc(var(--space-unit) * 8); /* 32px */
--space-2xl: calc(var(--space-unit) * 12); /* 48px */
--space-3xl: calc(var(--space-unit) * 16); /* 64px */
```

### 4.2 Component Spacing
### 4.2 组件间距

| Context | Recommended Spacing | Variable |
|---------|---------------------|----------|
| Between related elements (e.g., labels and input fields) | 8px | `--space-sm` |
| 相关元素之间（如标签和输入框） | 8px                 | `--space-sm` |
| Card internal content padding | 16px | `--space-md` |
| 卡片内部内容填充 | 16px                | `--space-md` |
| Between list items | 8px-16px | `--space-sm` to `--space-md` |
| 列表项之间 | 8px-16px            | `--space-sm` 到 `--space-md` |
| Between sections | 24px-32px | `--space-lg` to `--space-xl` |
| 部分之间 | 24px-32px           | `--space-lg` 到 `--space-xl` |
| Page top and bottom margins | 16px-24px | `--space-md` to `--space-lg` |
| 页面顶部和底部边距 | 16px-24px           | `--space-md` 到 `--space-lg` |
| Between related component groups | 24px | `--space-lg` |
| 相关组件组之间 | 24px                | `--space-lg` |
| Between unrelated component groups | 32px-48px | `--space-xl` to `--space-2xl` |
| 不相关组件组之间 | 32px-48px           | `--space-xl` 到 `--space-2xl` |

## 5. Borders and Corner Radii
## 5. 边框与圆角

### 5.1 Border Widths
### 5.1 边框宽度

```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;
```

### 5.2 Border Styles
### 5.2 边框样式

```css
--border-style-solid: solid;
--border-style-dashed: dashed;
```

### 5.3 Border Colors
### 5.3 边框颜色

```css
--border-color-light: var(--color-gray-200);
--border-color-medium: var(--color-gray-300);
--border-color-dark: var(--color-gray-400);
--border-color-focus: var(--color-primary);
```

### 5.4 Corner Radii
### 5.4 圆角半径

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### 5.5 Application Scenarios
### 5.5 应用场景

| Element | Corner Radius | Border |
|---------|---------------|--------|
| Button | `--radius-md` | No border |
| 按钮    | `--radius-md` | 无边框 |
| Input Field | `--radius-md` | `--border-width-thin` + `--border-color-medium` |
| 输入框  | `--radius-md` | `--border-width-thin` + `--border-color-medium` |
| Card | `--radius-lg` | No border or `--border-width-thin` + `--border-color-light` |
| 卡片    | `--radius-lg` | 无边框或 `--border-width-thin` + `--border-color-light` |
| Dialog | `--radius-lg` | No border |
| 对话框  | `--radius-lg` | 无边框 |
| Avatar | `--radius-full` | Optional border |
| 头像    | `--radius-full` | 可选边框 |
| Tag/Badge | `--radius-full` or `--radius-sm` | No border |
| 标签/徽章 | `--radius-full` 或 `--radius-sm` | 无边框 |
| Selector/Dropdown | `--radius-md` | `--border-width-thin` + `--border-color-medium` |
| 选择器/下拉菜单 | `--radius-md` | `--border-width-thin` + `--border-color-medium` |

## 6. Shadow System
## 6. 阴影系统

### 6.1 Shadow Variables
### 6.1 阴影变量

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-outline: 0 0 0 3px rgba(66, 153, 225, 0.5);
--shadow-none: none;
```

### 6.2 Application Scenarios
### 6.2 应用场景

| Element | Default State | Hover/Active State |
|---------|---------------|--------------------|
| Card | `--shadow-md` | `--shadow-lg` |
| 卡片    | `--shadow-md` | `--shadow-lg` |
| Button | `--shadow-sm` | `--shadow-md` |
| 按钮    | `--shadow-sm` | `--shadow-md` |
| Dialog/Modal | `--shadow-xl` | - |
| 对话框/模态框 | `--shadow-xl` | - |
| Dropdown Menu | `--shadow-lg` | - |
| 下拉菜单    | `--shadow-lg` | - |
| Navigation Bar | `--shadow-md` | - |
| 导航栏    | `--shadow-md` | - |
| Input Field (Focused) | `--shadow-none` | `--shadow-outline` |
| 输入框（聚焦） | `--shadow-none` | `--shadow-outline` |
| Floating Action Button | `--shadow-lg` | `--shadow-xl` |
| 浮动操作按钮 | `--shadow-lg` | `--shadow-xl` |

## 7. Core Component Specifications
## 7. 核心组件规范

### 7.1 Buttons
### 7.1 按钮

#### 7.1.1 Button Variants
#### 7.1.1 按钮变体

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Primary Button | Main page actions | Filled background (primary color), white text, `--radius-md` rounded corners |
| 主要按钮    | 页面主要操作 | 填充背景（主色），白色文本，`--radius-md`圆角 |
| Secondary Button | Secondary actions | Outlined border (primary color), primary color text, `--radius-md` rounded corners |
| 次要按钮    | 次要操作 | 轮廓边框（主色），主色文本，`--radius-md`圆角 |
| Text Button | Low emphasis actions | No background, no border, primary color text |
| 文本按钮    | 低强调操作 | 无背景，无边框，主色文本 |
| Icon Button | Actions in compact interfaces | Icon only, optional background or border |
| 图标按钮    | 紧凑界面中的操作 | 仅图标，可选背景或边框 |
| Floating Action Button | Main page actions | Circular, primary color background, white icon, `--shadow-lg` shadow |
| 浮动操作按钮 | 页面主要操作 | 圆形，主色背景，白色图标，`--shadow-lg`阴影 |

#### 7.1.2 Button States
#### 7.1.2 按钮状态

| State | Visual Change |
|-------|---------------|
| Default | Base style |
| 默认    | 基础样式 |
| Hover | Slight color darkening/lightening, optional shadow enhancement |
| 悬停    | 轻微颜色变暗/变亮，可选阴影增强 |
| Pressed | Further color change, slight scaling effect |
| 按下    | 颜色进一步变化，轻微缩放效果 |
| Focused | Focus ring (`--shadow-outline`) |
| 聚焦    | 焦点环（`--shadow-outline`） |
| Disabled | Reduced opacity, removed interactive effects |
| 禁用    | 降低不透明度，移除交互效果 |
| Loading | Display loading indicator, optional disabled state |
| 加载中  | 显示加载指示器，可选禁用状态 |

#### 7.1.3 Button Sizes
#### 7.1.3 按钮尺寸

| Size | Height | Horizontal Padding | Font Size |
|------|--------|--------------------|-----------|
| Small | 32px | 12px | `--font-size-sm` |
| 小型 | 32px   | 12px               | `--font-size-sm` |
| Medium (Default) | 40px | 16px | `--font-size-md` |
| 中型（默认） | 40px   | 16px               | `--font-size-md` |
| Large | 48px | 20px | `--font-size-lg` |
| 大型 | 48px   | 20px               | `--font-size-lg` |

### 7.2 Input Fields
### 7.2 输入框

#### 7.2.1 Input Field Variants
#### 7.2.1 输入框变体

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Filled Input Field | Standard forms | Light gray background, optional border, `--radius-md` rounded corners |
| 填充输入框    | 标准表单 | 浅灰背景，可选边框，`--radius-md`圆角 |
| Outlined Input Field | Emphasize input area | Prominent border, no background, `--radius-md` rounded corners |
| 轮廓输入框    | 强调输入区域 | 明显边框，无背景，`--radius-md`圆角 |
| Underlined Input Field | Concise interfaces | Bottom border only, no rounded corners |
| 底线输入框    | 简洁界面 | 仅底部边框，无圆角 |
| Search Input Field | Search function | Search icon, optional clear button, `--radius-full` rounded corners |
| 搜索输入框    | 搜索功能 | 搜索图标，可选清除按钮，`--radius-full`圆角 |

#### 7.2.2 Input Field States
#### 7.2.2 输入框状态

| State | Visual Change |
|-------|---------------|
| Default | Base style |
| 默认    | 基础样式 |
| Focused | Border color changes to primary color, optional `--shadow-outline` |
| 聚焦    | 边框颜色变为主色，可选`--shadow-outline` |
| Filled | Optional slight background color change |
| 填充    | 可选轻微背景色变化 |
| Error | Border and text change to error color (red) |
| 错误    | 边框和文本变为错误色（红色） |
| Success | Border changes to success color (green) |
| 成功    | 边框变为成功色（绿色） |
| Disabled | Reduced opacity, background color change |
| 禁用    | 降低不透明度，背景色变化 |
| Read-only | Slight background color change, removed interactive effects |
| 只读    | 轻微背景色变化，移除交互效果 |

#### 7.2.3 Input Field Sizes
#### 7.2.3 输入框尺寸

| Size | Height | Font Size | Padding |
|------|--------|-----------|---------|
| Small | 32px | `--font-size-sm` | Horizontal 12px |
| 小型 | 32px   | `--font-size-sm` | 水平12px |
| Medium (Default) | 40px | `--font-size-md` | Horizontal 16px |
| 中型（默认） | 40px   | `--font-size-md` | 水平16px |
| Large | 48px | `--font-size-lg` | Horizontal 16px |
| 大型 | 48px   | `--font-size-lg` | 水平16px |

### 7.3 Cards
### 7.3 卡片

#### 7.3.1 Card Variants
#### 7.3.1 卡片变体

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Basic Card | Content grouping | White background, `--shadow-md` shadow, `--radius-lg` rounded corners |
| 基础卡片    | 内容分组 | 白色背景，`--shadow-md`阴影，`--radius-lg`圆角 |
| Outlined Card | Low emphasis content | Border, no shadow or slight shadow, `--radius-lg` rounded corners |
| 轮廓卡片    | 低强调内容 | 边框，无阴影或轻微阴影，`--radius-lg`圆角 |
| Flat Card | Concise interfaces | Light background, no shadow, `--radius-lg` rounded corners |
| 平面卡片    | 简洁界面 | 浅色背景，无阴影，`--radius-lg`圆角 |
| Interactive Card | Clickable content | Hover effect, pointer cursor, `--radius-lg` rounded corners |
| 交互式卡片  | 可点击内容 | 悬停效果，指针光标，`--radius-lg`圆角 |

#### 7.3.2 Card Internal Structure
#### 7.3.2 卡片内部结构

| Area | Padding | Usage |
|------|---------|-------|
| Card Header | 16px | Title, subtitle, action buttons |
| 卡片头部 | 16px    | 标题，副标题，操作按钮 |
| Card Content | 16px | Main content |
| 卡片内容 | 16px    | 主要内容 |
| Card Media | 0px | Images, videos (no padding) |
| 卡片媒体 | 0px     | 图像，视频（无内边距） |
| Card Footer | 16px | Action buttons, additional information |
| 卡片底部 | 16px    | 操作按钮，附加信息 |
| Card Separator | - | 1px wide, light gray |
| 卡片分隔线 | -       | 1px宽，浅灰色 |

### 7.4 Lists
### 7.4 列表

#### 7.4.1 List Variants
#### 7.4.1 列表变体

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Basic List | Simple item list | Minimal style, optional separators |
| 基础列表    | 简单项目列表 | 最小样式，可选分隔线 |
| Card List | Complex content list | Each item uses card style |
| 卡片列表    | 复杂内容列表 | 每项使用卡片样式 |
| Grouped List | Categorized content | With group titles, optional background color distinction |
| 分组列表    | 分类内容 | 带分组标题，可选背景色区分 |
| Interactive List | Clickable items | Hover effect, active state |
| 交互式列表  | 可点击项目 | 悬停效果，活动状态 |

#### 7.4.2 List Item Structure
#### 7.4.2 列表项结构

| Element | Position | Usage |
|---------|----------|-------|
| Primary Text | Left or top | Item title |
| 主要文本    | 左侧或顶部 | 项目标题 |
| Secondary Text | Below primary text | Item description or details |
| 次要文本    | 主要文本下方 | 项目描述或详情 |
| Leading Icon/Image | Far left | Visual identifier or avatar |
| 前导图标/图像 | 最左侧 | 视觉标识或头像 |
| Trailing Element | Far right | Action buttons, badges, toggles |
| 尾随元素    | 最右侧 | 操作按钮，徽章，切换开关 |
| Separator | Between items | Visual separation |
| 分隔线    | 项目之间 | 视觉分隔 |

### 7.5 Navigation Components
### 7.5 导航组件

#### 7.5.1 Bottom Navigation Bar
#### 7.5.1 底部导航栏

| Feature | Specification |
|---------|---------------|
| Height | 56px (excluding safe area) |
| 高度    | 56px（不含安全区域） |
| Number of Items | 3-5 items |
| 项目数量 | 3-5个项目 |
| Active State | Primary color icon and text, optional indicator |
| 激活状态 | 主色图标和文本，可选指示器 |
| Inactive State | Gray icon and text |
| 未激活状态 | 灰色图标和文本 |
| Label Position | Below icon |
| 标签位置 | 图标下方 |
| Background | White or extra light gray, optional top separator |
| 背景    | 白色或超浅灰，可选顶部分隔线 |

#### 7.5.2 Top App Bar
#### 7.5.2 顶部应用栏

| Feature | Specification |
|---------|---------------|
| Height | 56px (excluding status bar) |
| 高度    | 56px（不含状态栏） |
| Title | Left-aligned or centered, `--font-size-lg` |
| 标题    | 左对齐或居中，`--font-size-lg` |
| Navigation Icon | Left, 24px size |
| 导航图标 | 左侧，24px大小 |
| Action Icons | Right, 24px size |
| 操作图标 | 右侧，24px大小 |
| Background | Primary color or white |
| 背景    | 主色或白色 |
| Shadow | `--shadow-md` |
| 阴影    | `--shadow-md` |

#### 7.5.3 Tab Bar
#### 7.5.3 标签栏

| Feature | Specification |
|---------|---------------|
| Height | 48px |
| 高度    | 48px |
| Tab Width | Adaptive or equal width |
| 标签宽度 | 自适应或等宽 |
| Active State | Primary color text, bottom indicator |
| 激活状态 | 主色文本，底部指示器 |
| Inactive State | Gray text |
| 未激活状态 | 灰色文本 |
| Indicator | 2px high, primary color |
| 指示器 | 2px高，主色 |
| Background | White or extra light gray |
| 背景    | 白色或超浅灰 |

#### 7.5.4 Side Navigation Drawer
#### 7.5.4 侧边导航抽屉

| Feature | Specification |
|---------|---------------|
| Width | Mobile: 80% screen width (max 320px); Tablet/Desktop: Fixed 256px |
| 宽度    | 移动端：80%屏幕宽度（最大320px）；平板/桌面：固定256px |
| Header | User information, variable height |
| 头部    | 用户信息，高度可变 |
| Navigation Item | Height 48px, left icon, text |
| 导航项 | 高度48px，左侧图标，文本 |
| Grouping | Optional group titles, separators |
| 分组    | 可选分组标题，分隔线 |
| Background | White |
| 背景    | 白色 |
| Shadow | `--shadow-xl` when displayed |
| 阴影    | 显示时`--shadow-xl` |

### 7.6 Dialogs and Modals
### 7.6 对话框与模态框

#### 7.6.1 Dialog Variants
#### 7.6.1 对话框变体

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Alert Dialog | Confirm actions | Small size, title, message, action buttons |
| 警告对话框 | 确认操作 | 小尺寸，标题，消息，操作按钮 |
| Form Dialog | Collect input | Medium size, form elements, action buttons |
| 表单对话框 | 收集输入 | 中等尺寸，表单元素，操作按钮 |
| Full-screen Dialog | Complex interactions | Full-screen on mobile, large size on desktop |
| 全屏对话框 | 复杂交互 | 移动端全屏，桌面大尺寸 |
| Bottom Sheet | Simple input | Slides in from bottom, rounded top corners |
| 底部表单 | 简单输入 | 从底部滑入，圆角顶部 |

#### 7.6.2 Dialog Structure
#### 7.6.2 对话框结构

| Element | Specification |
|---------|---------------|
| Width | Mobile: 92% screen width; Tablet/Desktop: Fixed width (based on type) |
| 宽度    | 移动端：92%屏幕宽度；平板/桌面：固定宽度（根据类型） |
| Corner Radius | `--radius-lg` |
| 圆角    | `--radius-lg` |
| Title | `--font-size-xl`, bold, 16px top padding |
| 标题    | `--font-size-xl`，粗体，顶部16px内边距 |
| Content | 16px padding |
| 内容    | 16px内边距 |
| Action Area | Bottom, 8px-16px padding, right-aligned or justified |
| 操作区 | 底部，8px-16px内边距，右对齐或两端对齐 |
| Background | White |
| 背景    | 白色 |
| Shadow | `--shadow-xl` |
| 阴影    | `--shadow-xl` |
| Backdrop | Semi-transparent black (rgba(0,0,0,0.5)) |
| 背景遮罩 | 半透明黑色（rgba(0,0,0,0.5)） |

### 7.7 Form Components
### 7.7 表单组件

#### 7.7.1 Checkbox
#### 7.7.1 复选框

| Feature | Specification |
|---------|---------------|
| Size | 20px × 20px |
| 尺寸    | 20px × 20px |
| Unchecked State | Outlined border, light background |
| 未选中状态 | 轮廓边框，浅色背景 |
| Checked State | Primary color background, white checkmark icon |
| 选中状态 | 主色背景，白色对勾图标 |
| Label | Right, 8px spacing |
| 标签    | 右侧，8px间距 |
| Disabled State | Reduced opacity |
| 禁用状态 | 降低不透明度 |

#### 7.7.2 Radio Button
#### 7.7.2 单选按钮

| Feature | Specification |
|---------|---------------|
| Size | 20px × 20px |
| 尺寸    | 20px × 20px |
| Unchecked State | Circular outlined border |
| 未选中状态 | 圆形轮廓边框 |
| Checked State | Primary color outer ring, primary color inner dot |
| 选中状态 | 外圈主色，内部主色圆点 |
| Label | Right, 8px spacing |
| 标签    | 右侧，8px间距 |
| Disabled State | Reduced opacity |
| 禁用状态 | 降低不透明度 |

#### 7.7.3 Switch
#### 7.7.3 开关

| Feature | Specification |
|---------|---------------|
| Size | 40px × 24px |
| 尺寸    | 40px × 24px |
| Off State | Gray track, white thumb |
| 关闭状态 | 灰色轨道，白色滑块 |
| On State | Primary color track, white thumb |
| 开启状态 | 主色轨道，白色滑块 |
| Track Corner Radius | `--radius-full` |
| 轨道圆角 | `--radius-full` |
| Thumb Corner Radius | `--radius-full` |
| 滑块圆角 | `--radius-full` |
| Label | Left or right, 8px spacing |
| 标签    | 左侧或右侧，8px间距 |
| Disabled State | Reduced opacity |
| 禁用状态 | 降低不透明度 |

#### 7.7.4 Selector/Dropdown Menu
#### 7.7.4 选择器/下拉菜单

| Feature | Specification |
|---------|---------------|
| Height | Consistent with input fields |
| 高度    | 与输入框一致 |
| Default State | Consistent with input fields, dropdown icon on right |
| 默认状态 | 与输入框一致，右侧下拉图标 |
| Expanded State | Displays option list, optional highlight for current option |
| 展开状态 | 显示选项列表，可选高亮当前选项 |
| Option Height | 40px |
| 选项高度 | 40px |
| Option Hover | Light background |
| 选项悬停 | 浅色背景 |
| Option Selected | Primary color text, optional checkmark icon |
| 选项选中 | 主色文本，可选对勾图标 |

### 7.8 Feedback Components
### 7.8 反馈组件

#### 7.8.1 Notification Alerts
#### 7.8.1 通知提示

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Info Alert | General information | Blue, info icon |
| 信息提示 | 一般信息 | 蓝色，信息图标 |
| Success Alert | Operation successful | Green, checkmark icon |
| 成功提示 | 操作成功 | 绿色，对勾图标 |
| Warning Alert | Needs attention | Yellow, warning icon |
| 警告提示 | 需要注意 | 黄色，警告图标 |
| Error Alert | Operation failed | Red, error icon |
| 错误提示 | 操作失败 | 红色，错误图标 |

#### 7.8.2 Snackbar/Toast
#### 7.8.2 提示条（Snackbar/Toast）

| Feature | Specification |
|---------|---------------|
| Position | Bottom or top center |
| 位置    | 底部或顶部居中 |
| Width | Mobile: 92% screen width; Tablet/Desktop: Fixed width |
| 宽度    | 移动端：92%屏幕宽度；平板/桌面：固定宽度 |
| Height | Content adaptive |
| 高度    | 自适应内容 |
| Corner Radius | `--radius-md` |
| 圆角    | `--radius-md` |
| Background | Dark (near black) |
| 背景    | 深色（近黑色） |
| Text | White |
| 文本    | 白色 |
| Action Button | Optional, primary color or white |
| 操作按钮 | 可选，主色或白色 |
| Duration | Short: 2 seconds; Long: 3.5 seconds |
| 持续时间 | 短：2秒；长：3.5秒 |

#### 7.8.3 Progress Indicators
#### 7.8.3 进度指示器

| Variant | Usage | Style Characteristics |
|---------|-------|-----------------------|
| Circular Loader | Page or component loading | Primary color, circular animation |
| 圆形加载器 | 页面或组件加载 | 主色，圆形动画 |
| Linear Progress Bar | Display operation progress | Primary color, horizontal progress bar |
| 线性进度条 | 显示操作进度 | 主色，水平进度条 |
| Skeleton Screen | Content loading placeholder | Light gray, simulates content shape |
| 骨架屏 | 内容加载占位 | 浅灰色，模拟内容形状 |
| Pull-to-Refresh | List refresh | Top circular loader |
| 下拉刷新 | 列表刷新 | 顶部圆形加载器 |

## 8. Specific Function Components
## 8. 特定功能组件

### 8.1 Language Learning Card
### 8.1 语言学习卡片

| Feature | Specification |
|---------|---------------|
| Layout | Vertical arrangement: vocabulary/phrase, pronunciation, translation, example sentences |
| 布局    | 垂直排列：词汇/短语、发音、翻译、例句 |
| Actions | Play pronunciation, mark as learned, add to favorites |
| 操作    | 播放发音、标记已学、添加到收藏 |
| Visual | Theme color corresponding to the language, optional related images |
| 视觉    | 对应语言的主题色，可选相关图像 |
| Interaction | Flip card to show more information, swipe to switch |
| 交互    | 翻转卡片显示更多信息，滑动切换 |

### 8.2 Chat Message Bubble
### 8.2 聊天消息气泡

| Feature | Specification |
|---------|---------------|
| Sent Message | Right-aligned, primary color background, white text, smaller right corner radius |
| 发送消息 | 右对齐，主色背景，白色文本，右侧圆角较小 |
| Received Message | Left-aligned, light gray background, dark text, smaller left corner radius |
| 接收消息 | 左对齐，浅灰背景，深色文本，左侧圆角较小 |
| Timestamp | Below message, small font, light color |
| 时间戳 | 消息下方，小字体，浅色 |
| Translation Toggle | Below message, small icon button |
| 翻译切换 | 消息下方，小图标按钮 |
| Original/Translated Text | Switchable display, visual distinction |
| 原文/译文 | 可切换显示，视觉区分 |

### 8.3 User Matching Card
### 8.3 用户匹配卡片

| Feature | Specification |
|---------|---------------|
| Layout | User avatar (large), name, language proficiency, common interests |
| 布局    | 用户头像（大），姓名，语言能力，共同兴趣 |
| Match Score | Visual indicator (e.g., percentage or stars) |
| 匹配度 | 视觉指示器（如百分比或星级） |
| Actions | Send request, skip, view details |
| 操作    | 发送请求，跳过，查看详情 |
| Visual | Card design, highlight avatar and key information |
| 视觉    | 卡片设计，突出头像和关键信息 |
| Interaction | Swipe gestures (Tinder-like experience) |
| 交互    | 滑动手势（类Tinder体验） |

### 8.4 Translation Input Area
### 8.4 翻译输入区域

| Feature | Specification |
|---------|---------------|
| Layout | Source language selector, input area, target language selector, translation result |
| 布局    | 源语言选择器，输入区域，目标语言选择器，翻译结果 |
| Input Area | Multi-line text input, auto-growing height |
| 输入区域 | 多行文本输入，自动增长高度 |
| Language Selector | Dropdown menu, current language icon + name |
| 语言选择器 | 下拉菜单，当前语言图标+名称 |
| Action Buttons | Translate button (primary color), clear, voice input, copy |
| 操作按钮 | 翻译按钮（主色），清除，语音输入，复制 |
| Result Area | Clearly distinguish original and translated text |
| 结果区域 | 清晰区分原文和译文 |

### 8.5 Learning Progress Indicator
### 8.5 学习进度指示器

| Feature | Specification |
|---------|---------------|
| Visual | Circular or linear progress bar, primary color fill |
| 视觉    | 圆形或线性进度条，主色填充 |
| Percentage | Center or side display of number |
| 百分比 | 中心或旁边显示数字 |
| Target Indicator | Optional display of target and current progress |
| 目标指示 | 可选显示目标和当前进度 |
| Reward Animation | Celebration animation when milestones are reached |
| 奖励动画 | 达成里程碑时的庆祝动画 |

## 9. Responsive Design Guidelines
## 9. 响应式设计指南

### 9.1 Breakpoint System
### 9.1 断点系统

```css
/* Breakpoint variables */
/* 断点变量 */
--breakpoint-xs: 0px;
--breakpoint-sm: 600px;
--breakpoint-md: 960px;
--breakpoint-lg: 1280px;
--breakpoint-xl: 1920px;
```

### 9.2 Responsive Layout Strategies
### 9.2 响应式布局策略

| Screen Size | Layout Strategy |
|-------------|-----------------|
| Mobile (<600px) | Single column layout, full-width components, bottom navigation |
| 移动端（<600px） | 单列布局，全宽组件，底部导航 |
| Tablet (600px-959px) | Single or dual column layout, some components side-by-side, bottom or side navigation |
| 平板（600px-959px） | 单列或双列布局，部分组件并排，底部或侧边导航 |
| Small Desktop (960px-1279px) | Multi-column layout, side navigation fixed visible |
| 小桌面（960px-1279px） | 多列布局，侧边导航固定可见 |
| Large Desktop (≥1280px) | Multi-column layout, max content width limit, side margins |
| 大桌面（≥1280px） | 多列布局，最大内容宽度限制，两侧留白 |

### 9.3 Component Responsive Behavior
### 9.3 组件响应式行为

| Component | Responsive Behavior |
|-----------|---------------------|
| Card | Mobile: Full width; Tablet+: Fixed width or grid |
| 卡片      | 移动端：全宽；平板+：固定宽度或网格 |
| Dialog | Mobile: Full screen or 92% width; Tablet+: Fixed max width |
| 对话框    | 移动端：全屏或92%宽；平板+：固定最大宽度 |
| Navigation | Mobile: Bottom navigation bar; Tablet+: Side navigation |
| 导航      | 移动端：底部导航栏；平板+：侧边导航 |
| Table | Mobile: Stacked or scrollable; Tablet+: Full display |
| 表格      | 移动端：堆叠或滚动；平板+：完整显示 |
| Form | Mobile: Vertically stacked; Tablet+: Side-by-side layout |
| 表单      | 移动端：垂直堆叠；平板+：并排布局 |

## 10. Motion Design Guidelines
## 10. 动效设计指南

### 10.1 Motion Principles
### 10.1 动效原则

- **Purposeful**: Motion should serve user experience, not just decoration
- **目的性**：动效应服务于用户体验，而非纯装饰
- **Natural**: Simulate real-world physical properties
- **自然性**：模拟真实世界的物理特性
- **Continuous**: Maintain visual continuity, avoid abrupt changes
- **连续性**：保持视觉连续性，避免突兀变化
- **Concise**: Avoid overly complex or distracting motion
- **简洁性**：避免过度复杂或干扰性的动效
- **Responsive**: Provide immediate visual feedback
- **响应性**：提供即时视觉反馈

### 10.2 Transition Animations
### 10.2 过渡动画

```css
/* Transition duration */
/* 过渡持续时间 */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 350ms;

/* Transition easing functions */
/* 过渡缓动函数 */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
```

### 10.3 Common Motions
### 10.3 常用动效

| Motion Type | Usage | Specification |
|-------------|-------|---------------|
| Fade In/Out | Content switching, modals | Opacity change, `--transition-normal`, `--ease-standard` |
| 淡入淡出    | 内容切换，模态框 | 透明度变化，`--transition-normal`，`--ease-standard` |
| Scale | Click feedback, emphasis | Slight scaling (0.95-1.05), `--transition-fast`, `--ease-standard` |
| 缩放      | 点击反馈，强调 | 轻微缩放（0.95-1.05），`--transition-fast`，`--ease-standard` |
| Slide | Page switching, drawers | Directional movement, `--transition-normal`, `--ease-decelerate` or `--ease-accelerate` |
| 滑动      | 页面切换，抽屉 | 方向性移动，`--transition-normal`，`--ease-decelerate`或`--ease-accelerate` |
| Ripple | Touch feedback | Spreads from touch point, `--transition-fast` |
| 波纹      | 触摸反馈 | 从触摸点扩散，`--transition-fast` |
| Loading Animation | Waiting state | Looping animation, soft, non-disruptive |
| 加载动画    | 等待状态 | 循环动画，柔和，不干扰 |

### 10.4 Page Transitions
### 10.4 页面转场

| Transition Type | Usage | Specification |
|-----------------|-------|---------------|
| Horizontal Slide | Same-level page switching | Left/right slide, `--transition-normal`, `--ease-standard` |
| 水平滑动        | 同级页面切换 | 左右滑动，`--transition-normal`，`--ease-standard` |
| Vertical Slide | Hierarchical page switching | Slide in from bottom, `--transition-normal`, `--ease-decelerate` |
| 垂直滑动        | 层级页面切换 | 底部滑入，`--transition-normal`，`--ease-decelerate` |
| Fade In Scale | Modals, dialogs | Center scale + fade in, `--transition-normal`, `--ease-decelerate` |
| 淡入缩放        | 模态框，对话框 | 中心缩放+淡入，`--transition-normal`，`--ease-decelerate` |
| Shared Element | Detail page switching | Element morphing transition, `--transition-normal`, `--ease-standard` |
| 共享元素        | 详情页切换 | 元素变形过渡，`--transition-normal`，`--ease-standard` |

## 11. Accessibility Guidelines
## 11. 可访问性指南

### 11.1 Color Contrast
### 11.1 颜色对比度

- Text to background contrast ratio at least 4.5:1
- 文本与背景的对比度至少为4.5:1
- Large text (18pt or above, or 14pt bold or above) to background contrast ratio at least 3:1
- 大文本（18pt以上或14pt粗体以上）与背景的对比度至少为3:1
- Provide sufficient color contrast checking tools and guidelines
- 提供足够的颜色对比度检查工具和指南

### 11.2 Keyboard Navigation
### 11.2 键盘导航

- All interactive elements are keyboard accessible
- 所有交互元素可通过键盘访问
- Visible focus indicator
- 可见的焦点指示器
- Logical Tab order
- 逻辑的Tab顺序
- Shortcut key support (with documentation)
- 快捷键支持（带文档）

### 11.3 Screen Reader Support
### 11.3 屏幕阅读器支持

- All images provide alternative text
- 所有图像提供替代文本
- Form elements have appropriate labels
- 表单元素有适当的标签
- ARIA roles and attributes are used correctly
- ARIA角色和属性正确使用
- Dynamic content change notifications
- 动态内容变化通知

### 11.4 Touch Target Size
### 11.4 触摸目标尺寸

- Minimum touch target size: 44px × 44px
- 最小触摸目标尺寸：44px × 44px
- Minimum spacing between touch targets: 8px
- 触摸目标之间的最小间距：8px
- Provide sufficient click/touch area
- 提供足够的点击/触摸区域

## 12. Internationalization Design Guidelines
## 12. 国际化设计指南

### 12.1 Text Expansion
### 12.1 文本扩展

- Reserve space for text length changes (some languages may be 30-50% longer than English after translation)
- 为文本长度变化预留空间（某些语言翻译后可能比英文长30-50%）
- Avoid layouts based on fixed text length
- 避免基于固定文本长度的布局
- Use flexible layouts and text truncation strategies
- 使用弹性布局和文本截断策略

### 12.2 Text Direction
### 12.2 文本方向

- Support Left-to-Right (LTR) and Right-to-Left (RTL) text direction
- 支持从左到右(LTR)和从右到左(RTL)的文本方向
- Use relative positioning and margins (start/end instead of left/right)
- 使用相对定位和边距（start/end而非left/right）
- Icons and UI elements mirror correctly in RTL mode
- 图标和UI元素在RTL模式下正确镜像

### 12.3 Date, Time, and Number Formats
### 12.3 日期、时间和数字格式

- Format dates and times according to user locale settings
- 根据用户区域设置格式化日期和时间
- Support different number formats (decimal point, thousands separator)
- 支持不同的数字格式（小数点、千位分隔符）
- Support different measurement unit systems
- 支持不同的度量单位系统

### 12.4 Cultural Considerations
### 12.4 文化考量

- Avoid culturally specific metaphors and images
- 避免特定文化的隐喻和图像
- Consider the meaning of colors in different cultures
- 考虑色彩在不同文化中的含义
- Provide culturally neutral icons and illustrations
- 提供文化中立的图标和插图

## 13. Component Library Implementation Guide
## 13. 组件库实施指南

### 13.1 Component Development Process
### 13.1 组件开发流程

1. Component Requirement Analysis
1. 组件需求分析
2. Design Specification Reference
2. 设计规范参考
3. Component Prototype Development
3. 组件原型开发
4. Review and Testing
4. 审查与测试
5. Documentation Writing
5. 文档编写
6. Release and Integration
6. 发布与集成

### 13.2 Component Documentation Template
### 13.2 组件文档模板

Each component's documentation should include:
每个组件的文档应包含：

- Component overview and usage
- 组件概述和用途
- Properties/Props API
- 属性/Props API
- Variants and examples
- 变体和示例
- Accessibility considerations
- 可访问性考量
- Responsive behavior
- 响应式行为
- Code examples
- 代码示例
- Best practices and usage guidelines
- 最佳实践和使用指南

### 13.3 Component Library Structure
### 13.3 组件库结构

```
src/
  components/
    common/           # Basic components
    common/           # 基础组件
      Button/
      Input/
      Card/
      ...
    navigation/       # Navigation components
    navigation/       # 导航组件
      BottomNav/
      Tabs/
      Drawer/
      ...
    feedback/         # Feedback components
    feedback/         # 反馈组件
      Toast/
      Dialog/
      ProgressIndicator/
      ...
    form/             # Form components
    form/             # 表单组件
      Checkbox/
      RadioButton/
      Select/
      ...
    language/         # Language learning specific components
    language/         # 语言学习特定组件
      LearningCard/
      TranslationInput/
      ...
    social/           # Social specific components
    social/           # 社交特定组件
      ChatBubble/
      UserMatchCard/
      ...
```

## 14. Design Resources
## 14. 设计资源

### 14.1 Design Tools
### 14.1 设计工具

- Figma: UI design and prototyping
- Figma：UI设计和原型
- Adobe XD: Alternative design tool
- Adobe XD：替代设计工具
- Zeplin/Avocode: Design delivery
- Zeplin/Avocode：设计交付
- Lottie: Advanced animations
- Lottie：高级动画

### 14.2 Design Resource Library
### 14.2 设计资源库

- Component Figma library
- 组件Figma库
- Icon set
- 图标集
- Color system
- 色彩系统
- Typography styles
- 排版样式
- Common illustrations and images
- 常用插图和图像

### 14.3 Design Review Checklist
### 14.3 设计审查清单

- Visual consistency check
- 视觉一致性检查
- Responsive design validation
- 响应式设计验证
- Accessibility review
- 可访问性审查
- Internationalization support check
- 国际化支持检查
- User experience flow validation
- 用户体验流程验证

## 15. Component Library Evolution Strategy
## 15. 组件库演进策略

### 15.1 Version Control
### 15.1 版本控制

- Follow semantic versioning (SemVer)
- 遵循语义化版本控制（SemVer）
- Major version: Incompatible API changes
- 主版本：不兼容的API更改
- Minor version: Backward-compatible feature additions
- 次版本：向后兼容的功能添加
- Patch version: Backward-compatible bug fixes
- 修订版本：向后兼容的错误修复

### 15.2 Deprecation Strategy
### 15.2 废弃策略

- Mark deprecated components/properties in new versions
- 在新版本中标记废弃的组件/属性
- Provide migration paths and documentation
- 提供迁移路径和文档
- Retain for at least two minor version cycles before removal
- 至少保留两个次要版本周期后才移除

### 15.3 Feedback Loop
### 15.3 反馈循环

- Collect developer and user feedback
- 收集开发者和用户反馈
- Regularly review component usage
- 定期审查组件使用情况
- Adjust and improve components based on feedback
- 基于反馈调整和改进组件
- Document common issues and solutions
- 记录常见问题和解决方案


