# CultureBridge 技术栈与开发环境规范

## 1. 技术栈概述

CultureBridge应用采用现代化的技术栈，以确保高性能、可扩展性和良好的开发体验。技术选型基于以下原则：

- 成熟稳定的主流技术
- 活跃的社区支持
- 良好的性能和可扩展性
- 适合移动优先的应用开发
- 支持国际化和本地化

### 1.1 前端技术栈

#### 核心框架与库

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.72.x | 跨平台移动应用开发框架 |
| TypeScript | 5.1.x | 类型安全的JavaScript超集 |
| Redux | 4.2.x | 状态管理 |
| Redux Toolkit | 1.9.x | Redux开发工具集 |
| React Navigation | 6.x | 应用导航管理 |
| i18next | 23.x | 国际化支持 |

#### UI组件与样式

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native Paper | 5.x | Material Design组件库 |
| Styled Components | 6.x | CSS-in-JS样式解决方案 |
| React Native Vector Icons | 9.x | 图标库 |
| React Native Reanimated | 3.x | 高性能动画库 |
| React Native Gesture Handler | 2.x | 手势处理 |

#### 网络与数据处理

| 技术 | 版本 | 用途 |
|------|------|------|
| Axios | 1.4.x | HTTP客户端 |
| React Query | 4.x | 数据获取与缓存 |
| Socket.IO Client | 4.x | 实时通信 |
| AsyncStorage | 1.19.x | 本地存储 |

#### 测试工具

| 技术 | 版本 | 用途 |
|------|------|------|
| Jest | 29.x | 单元测试框架 |
| React Native Testing Library | 12.x | 组件测试 |
| Detox | 20.x | 端到端测试 |

### 1.2 后端技术栈

#### 核心框架与语言

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x LTS | 服务器运行环境 |
| Express.js | 4.18.x | Web应用框架 |
| TypeScript | 5.1.x | 类型安全的JavaScript超集 |

#### 数据库与ORM

| 技术 | 版本 | 用途 |
|------|------|------|
| PostgreSQL | 15.x | 主要关系型数据库 |
| MongoDB | 6.x | NoSQL数据库（聊天记录、翻译历史） |
| Prisma | 4.x | TypeScript ORM（PostgreSQL） |
| Mongoose | 7.x | MongoDB ODM |
| Redis | 7.x | 缓存和会话存储 |

#### API与通信

| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | 4.18.x | REST API实现 |
| Socket.IO | 4.x | 实时通信 |
| JSON Web Token | 9.x | 认证 |
| Swagger/OpenAPI | 3.x | API文档 |

#### 测试与质量保证

| 技术 | 版本 | 用途 |
|------|------|------|
| Jest | 29.x | 单元测试框架 |
| Supertest | 6.x | API测试 |
| ESLint | 8.x | 代码质量检查 |

### 1.3 AI与翻译服务

#### 翻译API选项

| 技术 | 用途 | 特点 |
|------|------|------|
| Google Cloud Translation API | 文本翻译 | 支持100+语言，高质量翻译 |
| Microsoft Azure Translator | 文本翻译 | 支持90+语言，语言检测 |
| DeepL API | 文本翻译 | 高质量翻译，支持29种语言 |
| OpenAI API (GPT-4) | 上下文感知翻译，文化注释 | 高度上下文感知，可提供文化解释 |

#### 语言学习内容生成

| 技术 | 用途 | 特点 |
|------|------|------|
| OpenAI API (GPT-4) | 生成学习内容和练习 | 高质量内容生成，上下文理解 |
| Azure Speech Service | 文本到语音转换 | 自然发音，多语言支持 |
| Google Text-to-Speech | 文本到语音转换 | 高质量语音合成 |

### 1.4 DevOps与基础设施

#### 容器化与编排

| 技术 | 版本 | 用途 |
|------|------|------|
| Docker | 24.x | 容器化 |
| Docker Compose | 2.x | 本地开发环境编排 |

#### CI/CD

| 技术 | 用途 |
|------|------|
| GitHub Actions | 持续集成与部署 |
| Jest | 自动化测试 |
| ESLint | 代码质量检查 |

#### 云服务提供商选项

| 提供商 | 服务 | 用途 |
|------|------|------|
| AWS | EC2, RDS, S3, ElastiCache | 计算、数据库、存储、缓存 |
| Google Cloud | Compute Engine, Cloud SQL, Cloud Storage | 计算、数据库、存储 |
| Microsoft Azure | Virtual Machines, Azure Database, Blob Storage | 计算、数据库、存储 |

#### 监控与日志

| 技术 | 用途 |
|------|------|
| Prometheus | 系统监控 |
| Grafana | 监控可视化 |
| ELK Stack | 日志管理 |
| Sentry | 错误跟踪 |

## 2. 开发环境设置

### 2.1 开发工具

#### 推荐IDE与插件

| IDE/工具 | 推荐插件 |
|------|------|
| Visual Studio Code | ESLint, Prettier, GitLens, React Native Tools, Thunder Client |
| WebStorm | 内置支持React Native和TypeScript |
| Android Studio | 用于Android模拟器和调试 |
| Xcode | 用于iOS模拟器和调试（仅macOS） |

#### 版本控制

| 工具 | 用途 |
|------|------|
| Git | 版本控制 |
| GitHub | 代码托管与协作 |
| GitHub Desktop/GitKraken | Git图形界面（可选） |

#### API测试工具

| 工具 | 用途 |
|------|------|
| Postman/Insomnia | API测试 |
| Thunder Client (VS Code插件) | 轻量级API测试 |
| Swagger UI | API文档与测试 |

### 2.2 本地开发环境设置

#### 前端开发环境

```bash
# 安装Node.js和npm（推荐使用nvm管理Node.js版本）
nvm install 18
nvm use 18

# 安装React Native CLI
npm install -g react-native-cli

# 安装Yarn（可选，但推荐）
npm install -g yarn

# 克隆项目
git clone https://github.com/yb1734492970508/CultureBridge-Frontend1.git
cd CultureBridge-Frontend1

# 安装依赖
yarn install

# 启动Metro服务器
yarn start

# 在单独的终端中启动应用（iOS或Android）
yarn ios
# 或
yarn android
```

#### 后端开发环境

```bash
# 克隆后端仓库
git clone https://github.com/your-org/culturebridge-backend.git
cd culturebridge-backend

# 安装依赖
yarn install

# 设置环境变量
cp .env.example .env
# 编辑.env文件，填入必要的配置

# 启动数据库（使用Docker Compose）
docker-compose up -d

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
yarn dev
```

### 2.3 环境变量管理

#### 前端环境变量

使用`react-native-dotenv`管理环境变量：

```javascript
// .env.development
API_URL=http://localhost:3000/api/v1
SOCKET_URL=http://localhost:3000
TRANSLATION_API_KEY=your_dev_key
```

```javascript
// .env.production
API_URL=https://api.culturebridge.com/v1
SOCKET_URL=https://api.culturebridge.com
TRANSLATION_API_KEY=your_prod_key
```

#### 后端环境变量

使用`dotenv`管理环境变量：

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/culturebridge
MONGODB_URI=mongodb://localhost:27017/culturebridge
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_dev_jwt_secret
TRANSLATION_API_KEY=your_dev_translation_api_key
```

### 2.4 Docker开发环境

使用Docker Compose设置完整的开发环境：

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: culturebridge
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    depends_on:
      - postgres
      - mongodb
      - redis
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://postgres:password@postgres:5432/culturebridge
      MONGODB_URI: mongodb://mongodb:27017/culturebridge
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_dev_jwt_secret
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

## 3. 开发环境最佳实践

### 3.1 依赖管理

- 使用Yarn或npm管理依赖
- 锁定依赖版本（使用yarn.lock或package-lock.json）
- 定期更新依赖以修复安全漏洞
- 使用`npm-check-updates`或`yarn upgrade-interactive`检查和更新依赖

### 3.2 环境隔离

- 使用不同的环境配置（开发、测试、生产）
- 环境变量存储敏感信息，不要硬编码
- 使用`.env.local`存储本地开发特定的配置（不提交到版本控制）
- 使用Docker确保环境一致性

### 3.3 性能优化

- 使用React Native性能监控工具（如Flipper）
- 实施代码分割和懒加载
- 优化图像和资源
- 使用缓存策略减少网络请求
- 实施服务器端渲染（SSR）或静态站点生成（SSG）（适用于Web版本）

### 3.4 安全最佳实践

- 不要在客户端存储敏感信息
- 使用HTTPS进行所有API通信
- 实施适当的认证和授权
- 定期更新依赖以修复安全漏洞
- 使用环境变量存储API密钥和密码
- 实施CORS策略
- 使用内容安全策略（CSP）

## 4. 技术选型理由

### 4.1 React Native vs Flutter

我们选择React Native而不是Flutter的原因：

1. **团队熟悉度**：大多数前端开发人员已经熟悉React和JavaScript/TypeScript
2. **生态系统**：React Native拥有成熟的生态系统和大量第三方库
3. **社区支持**：活跃的社区和广泛的学习资源
4. **热重载**：快速的开发迭代
5. **与Web版本共享代码**：可以与React Web版本共享大部分业务逻辑代码

### 4.2 Node.js/Express vs Spring Boot/Django

我们选择Node.js/Express而不是Spring Boot或Django的原因：

1. **全栈JavaScript**：前后端使用相同的语言，减少上下文切换
2. **异步I/O**：适合I/O密集型应用，如聊天和实时翻译
3. **JSON处理**：原生支持JSON，简化API开发
4. **微服务友好**：轻量级，适合微服务架构
5. **NPM生态系统**：丰富的包和库

### 4.3 PostgreSQL vs MySQL

我们选择PostgreSQL而不是MySQL的原因：

1. **JSON支持**：原生支持JSON数据类型和操作
2. **高级特性**：更强大的索引选项和查询优化
3. **并发性能**：更好的读写并发性能
4. **扩展性**：支持自定义数据类型和函数
5. **地理数据支持**：内置PostGIS扩展，支持地理位置功能

### 4.4 MongoDB vs Firebase

我们选择MongoDB而不是Firebase的原因：

1. **灵活性**：更灵活的数据模型和查询能力
2. **成本控制**：可预测的成本结构，避免使用量增加导致的意外费用
3. **数据控制**：完全控制数据存储和访问
4. **本地开发**：更容易在本地环境中开发和测试
5. **与关系型数据库集成**：更容易与PostgreSQL集成

## 5. 技术栈实施路线图

### 5.1 MVP阶段

- 实现核心前端框架（React Native + TypeScript）
- 设置基本UI组件库（React Native Paper）
- 实现基础后端API（Node.js + Express + TypeScript）
- 设置主要数据库（PostgreSQL + Prisma）
- 集成基本翻译API（Google Cloud Translation或Azure Translator）
- 实现基础认证系统（JWT）

### 5.2 后续阶段

- 添加实时通信功能（Socket.IO）
- 集成NoSQL数据库（MongoDB）用于聊天和翻译历史
- 实现高级AI功能（OpenAI API）
- 添加缓存层（Redis）
- 设置CI/CD流程（GitHub Actions）
- 实现监控和日志系统
- 优化性能和可扩展性

## 6. 技术风险评估

| 风险 | 影响 | 缓解策略 |
|------|------|------|
| React Native版本更新 | 可能导致兼容性问题 | 锁定依赖版本，谨慎升级，编写全面的测试 |
| 第三方API依赖 | 服务中断或API变更 | 实现API抽象层，准备备选方案，监控API状态 |
| 数据库性能 | 用户增长导致性能下降 | 实施适当的索引和查询优化，准备分片策略 |
| 安全漏洞 | 数据泄露或未授权访问 | 定期安全审计，及时更新依赖，实施安全最佳实践 |
| 移动设备兼容性 | 在某些设备上体验不佳 | 全面的设备测试，响应式设计，渐进增强 |

## 7. 技术文档与知识共享

### 7.1 文档类型

- **架构文档**：系统架构、组件交互、数据流
- **API文档**：使用Swagger/OpenAPI自动生成
- **代码文档**：使用JSDoc/TSDoc注释代码
- **开发指南**：设置说明、编码规范、最佳实践
- **用户指南**：应用功能和使用说明

### 7.2 知识共享平台

- GitHub Wiki：存储项目文档
- Notion/Confluence：团队知识库
- Slack/Discord：团队沟通
- 定期技术分享会议

## 8. 技术债务管理

- 使用TODO注释标记需要改进的代码
- 在GitHub Issues中跟踪技术债务
- 分配专门的时间处理技术债务（如每个冲刺的20%）
- 定期代码审查和重构
- 维护测试覆盖率以支持重构
