# CultureBridge 项目GitHub协作结构

## 仓库组织

为支持8个账号的高效协作，我们将采用以下GitHub仓库结构：

### 主仓库
- **CultureBridge-Frontend1**: 前端和移动端代码
  - 负责账号: CB-FRONTEND, CB-FRONTEND, CB-MOBILE, CB-DESIGN

### 关联仓库
- **CultureBridge-Backend**: 后端API和服务
  - 负责账号: CB-BACKEND, CB-BACKEND
- **CultureBridge-Features**: 特性开发和集成
  - 负责账号: CB-FEATURES, CB-AI-TEST

## 分支策略

### 长期分支
- `main`: 生产就绪代码，只接受经过充分测试的合并
- `dev`: 开发集成分支，所有功能开发完成后合并到此
- `staging`: 预发布测试分支

### 短期分支
- `feature/[账号识别码]-[功能名称]`: 功能开发分支
- `bugfix/[账号识别码]-[问题描述]`: 问题修复分支
- `hotfix/[问题描述]`: 生产环境紧急修复分支

## 工作流程

1. **功能开发流程**
   ```
   dev分支 → 创建feature分支 → 开发 → 提交PR → 代码审核 → 合并到dev
   ```

2. **发布流程**
   ```
   dev分支 → 合并到staging → 测试 → 合并到main → 部署
   ```

3. **紧急修复流程**
   ```
   main分支 → 创建hotfix分支 → 修复 → 提交PR → 合并到main和dev
   ```

## Pull Request规范

每个PR必须包含以下信息：
- 标题格式: `[账号识别码] 功能/修复描述`
- 描述模板:
  ```
  ## 变更内容
  - 详细描述变更

  ## 相关账号
  - 标记需要协作的账号，如 @CB-BACKEND

  ## 测试情况
  - 描述测试方法和结果

  ## 截图（如适用）
  - 添加UI变更截图
  ```

## 代码审核分配

为确保代码质量和知识共享，我们采用以下代码审核分配：

| 提交账号 | 主要审核账号 | 次要审核账号 |
|----------|--------------|--------------|
| CB-DESIGN | CB-FRONTEND | CB-MOBILE |
| CB-FRONTEND | CB-FRONTEND | CB-MOBILE |
| CB-BACKEND | CB-BACKEND | CB-FEATURES |
| CB-AI-TEST | CB-FEATURES | CB-BACKEND |
| CB-FRONTEND | CB-FRONTEND | CB-DESIGN |
| CB-BACKEND | CB-BACKEND | CB-AI-TEST |
| CB-FEATURES | CB-AI-TEST | CB-FRONTEND |
| CB-MOBILE | CB-FRONTEND | CB-DESIGN |

## 提交信息规范

所有提交信息必须遵循以下格式：
```
[账号识别码] 类型: 简短描述

详细描述（可选）

相关问题: #问题编号（可选）
```

类型包括：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档变更
- `style`: 代码格式变更
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变更

示例：
```
[CB-MOBILE] feat: 添加文化推荐卡片组件

实现了文化推荐卡片组件，支持图片、标题、描述和分类标签展示。
优化了移动端触摸交互和响应式布局。

相关问题: #42
```

## CI/CD配置

我们将设置以下CI/CD流程：

1. **持续集成**
   - 代码提交时自动运行lint检查
   - 运行单元测试和集成测试
   - 生成测试覆盖率报告

2. **持续部署**
   - dev分支自动部署到开发环境
   - staging分支自动部署到测试环境
   - main分支手动触发部署到生产环境

## 项目看板

我们将使用GitHub Projects创建以下看板：

1. **开发看板**
   - 待办
   - 进行中
   - 代码审核
   - 已完成

2. **发布看板**
   - 计划中
   - 开发中
   - 测试中
   - 已发布

## 里程碑追踪

我们将使用GitHub Milestones追踪项目进度：

1. **MVP 1.0**
   - 基础架构搭建
   - 核心功能实现
   - 初步测试

2. **Beta 1.0**
   - 完整功能集
   - 全面测试
   - 性能优化

3. **Release 1.0**
   - 最终优化
   - 生产部署
   - 监控设置

通过以上GitHub协作结构，我们将确保8个账号能够高效协作，齐头并进完成CultureBridge项目。
