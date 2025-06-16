# CultureBridge Development Workflow and Code Specification
# CultureBridge 开发流程与代码规范

## 1. Development Workflow Overview
## 1. 开发流程概述

The CultureBridge project adopts an agile development approach, combining Git workflow and Continuous Integration/Continuous Deployment (CI/CD) practices to ensure an efficient, collaborative, and high-quality development process.
CultureBridge项目采用敏捷开发方法，结合Git工作流和持续集成/持续部署(CI/CD)实践，确保高效、协作和高质量的开发过程。

### 1.1 Development Lifecycle
### 1.1 开发生命周期

The CultureBridge development lifecycle includes the following stages:
CultureBridge的开发生命周期包括以下阶段：

1. **Requirements Analysis and Planning**
1. **需求分析与规划**
   - User story writing
   - 用户故事编写
   - Feature prioritization
   - 功能优先级排序
   - Workload estimation
   - 工作量估算
   - Iteration planning
   - 迭代计划制定

2. **Design**
2. **设计**
   - UI/UX design
   - UI/UX设计
   - Architecture design
   - 架构设计
   - API design
   - API设计
   - Database design
   - 数据库设计

3. **Development**
3. **开发**
   - Task assignment
   - 任务分配
   - Coding implementation
   - 编码实现
   - Code review
   - 代码审查
   - Unit testing
   - 单元测试

4. **Testing**
4. **测试**
   - Integration testing
   - 集成测试
   - Functional testing
   - 功能测试
   - Performance testing
   - 性能测试
   - User acceptance testing
   - 用户验收测试

5. **Deployment**
5. **部署**
   - Build and packaging
   - 构建与打包
   - Environment configuration
   - 环境配置
   - Release management
   - 发布管理
   - Monitoring setup
   - 监控设置

6. **Maintenance and Iteration**
6. **维护与迭代**
   - User feedback collection
   - 用户反馈收集
   - Bug fixing
   - 缺陷修复
   - Performance optimization
   - 性能优化
   - Feature iteration
   - 功能迭代

### 1.2 Agile Development Practices
### 1.2 敏捷开发实践

- **Iteration Cycle**: 2 weeks per iteration
- **迭代周期**：2周一个迭代
- **Daily Stand-up**: 15 minutes, discuss progress, plans, and blockers
- **每日站会**：15分钟，讨论进度、计划和阻碍
- **Iteration Planning Meeting**: Before the start of the iteration, determine iteration goals and tasks
- **迭代计划会**：迭代开始前，确定迭代目标和任务
- **Iteration Review**: At the end of the iteration, demonstrate completed features
- **迭代评审**：迭代结束时，演示完成的功能
- **Iteration Retrospective**: Summarize lessons learned, continuous improvement
- **迭代回顾**：总结经验教训，持续改进
- **Kanban Management**: Use Trello or Jira to track task status
- **看板管理**：使用Trello或Jira跟踪任务状态

## 2. Git Workflow
## 2. Git工作流

### 2.1 Branching Strategy
### 2.1 分支策略

CultureBridge adopts a variation of the GitHub Flow branching strategy:
CultureBridge采用GitHub Flow分支策略的变体：

- **main**: Main branch, always kept in a deployable state
- **main**：主分支，始终保持可部署状态
- **feature/***: Feature branches, used for developing new features
- **feature/***：功能分支，用于开发新功能
- **bugfix/***: Bugfix branches, used for fixing defects
- **bugfix/***：修复分支，用于修复缺陷
- **hotfix/***: Hotfix branches, used for urgent fixes to production issues
- **hotfix/***：热修复分支，用于紧急修复生产环境问题
- **release/***: Release branches, used for preparing releases
- **release/***：发布分支，用于版本发布准备

### 2.2 Branch Naming Convention
### 2.2 分支命名规范

```
feature/[issue-id]-short-description
bugfix/[issue-id]-short-description
hotfix/[issue-id]-short-description
release/vX.Y.Z
```

Examples:
示例：
- `feature/CB-123-user-authentication`
- `feature/CB-123-user-authentication`
- `bugfix/CB-456-fix-login-validation`
- `bugfix/CB-456-fix-login-validation`
- `hotfix/CB-789-critical-security-fix`
- `hotfix/CB-789-critical-security-fix`
- `release/v1.0.0`
- `release/v1.0.0`

### 2.3 Commit Message Convention
### 2.3 提交信息规范

Adopts [Conventional Commits](https://www.conventionalcommits.org/) specification:
采用[Conventional Commits](https://www.conventionalcommits.org/)规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: Commit type
- **type**：提交类型
  - `feat`: New feature
  - `feat`：新功能
  - `fix`: Bug fix
  - `fix`：缺陷修复
  - `docs`: Documentation update
  - `docs`：文档更新
  - `style`: Code style adjustment (does not affect code functionality)
  - `style`：代码风格调整（不影响代码功能）
  - `refactor`: Code refactoring (neither new feature nor bug fix)
  - `refactor`：代码重构（既不是新功能也不是缺陷修复）
  - `perf`: Performance optimization
  - `perf`：性能优化
  - `test`: Add or modify tests
  - `test`：添加或修改测试
  - `chore`: Build process or auxiliary tool changes
  - `chore`：构建过程或辅助工具变动
  - `ci`: CI configuration changes
  - `ci`：CI配置变更
  - `revert`: Revert previous commits
  - `revert`：回滚之前的提交

- **scope**: Scope of change (optional)
- **scope**：变更范围（可选）
  - `auth`: Authentication module
  - `auth`：认证模块
  - `api`: API related
  - `api`：API相关
  - `ui`: User interface
  - `ui`：用户界面
  - `db`: Database
  - `db`：数据库
  - `i18n`: Internationalization
  - `i18n`：国际化
  - etc.
  - 等等

- **subject**: Brief description, no more than 50 characters
- **subject**：简短描述，不超过50个字符
- **body**: Detailed description (optional)
- **body**：详细描述（可选）
- **footer**: Information like closing Issue (optional)
- **footer**：关闭Issue等信息（可选）

Example:
示例：
```
feat(auth): implement social login with Google
feat(auth): 使用Google实现社交登录

- Add Google OAuth2 integration
- 添加Google OAuth2集成
- Create user profile from Google account data
- 从Google账户数据创建用户资料
- Add tests for Google authentication flow
- 为Google认证流程添加测试

Closes #123
Closes #123
```

### 2.4 Pull Request Process
### 2.4 Pull Request流程

1. **Create PR**:
1. **创建PR**：
   - Describe the feature or fix
   - 描述功能或修复的内容
   - Link related Issues
   - 关联相关Issue
   - Add test results or screenshots
   - 添加测试结果或截图
   - Tag reviewers
   - 标记需要审查的人员

2. **Code Review**:
2. **代码审查**：
   - At least one team member reviews
   - 至少一名团队成员审查
   - Use GitHub comments to discuss code
   - 使用GitHub的评论功能讨论代码
   - Resolve all comments and issues
   - 解决所有评论和问题

3. **Automated Checks**:
3. **自动化检查**：
   - Code style check
   - 代码风格检查
   - Unit tests
   - 单元测试
   - Build verification
   - 构建验证

4. **Merge**:
4. **合并**：
   - Merge after all reviews pass
   - 所有审查通过后合并
   - Use "Squash and merge" strategy to keep main branch history clean
   - 使用"Squash and merge"策略保持主分支历史清晰
   - Delete merged feature branches
   - 删除已合并的功能分支

### 2.5 Version Management
### 2.5 版本管理

Adopts [Semantic Versioning](https://semver.org/):
采用[语义化版本](https://semver.org/)：

- **Major Version (X)**: Incompatible API changes
- **主版本号(X)**：不兼容的API变更
- **Minor Version (Y)**: Backward-compatible feature additions
- **次版本号(Y)**：向后兼容的功能新增
- **Patch Version (Z)**: Backward-compatible bug fixes
- **修订号(Z)**：向后兼容的问题修复

Version tag format: `vX.Y.Z`
版本标签格式：`vX.Y.Z`

Examples: `v1.0.0`, `v1.1.0`, `v1.1.1`
示例：`v1.0.0`、`v1.1.0`、`v1.1.1`

## 3. Frontend Code Specification
## 3. 前端代码规范

### 3.1 React Native / TypeScript Specification
### 3.1 React Native / TypeScript规范

#### 3.1.1 File Organization
#### 3.1.1 文件组织

```
src/
  components/         # Components / 组件
    common/           # Common components / 通用组件
    feature1/         # Specific feature components / 特定功能组件
    feature2/
  screens/            # Screens/Pages / 屏幕/页面
  navigation/         # Navigation configuration / 导航配置
  hooks/              # Custom Hooks / 自定义Hooks
  services/           # API services / API服务
  utils/              # Utility functions / 工具函数
  constants/          # Constants / 常量
  types/              # TypeScript type definitions / TypeScript类型定义
  assets/             # Static assets / 静态资源
  i18n/               # Internationalization resources / 国际化资源
  store/              # State management / 状态管理
```

#### 3.1.2 Naming Convention
#### 3.1.2 命名规范

- **File Names**:
- **文件名**：
  - Components: PascalCase.tsx (e.g., `Button.tsx`)
  - 组件：PascalCase.tsx（例：`Button.tsx`）
  - Non-components: camelCase.ts (e.g., `apiService.ts`)
  - 非组件：camelCase.ts（例：`apiService.ts`）
  - Styles: PascalCase.styles.ts (e.g., `Button.styles.ts`)
  - 样式：PascalCase.styles.ts（例：`Button.styles.ts`）
  - Tests: PascalCase.test.tsx (e.g., `Button.test.tsx`)
  - 测试：PascalCase.test.tsx（例：`Button.test.tsx`）

- **Component Naming**:
- **组件命名**：
  - Use PascalCase (e.g., `UserProfile`)
  - 使用PascalCase（例：`UserProfile`）
  - Higher-order components use `with` prefix (e.g., `withAuth`)
  - 高阶组件使用with前缀（例：`withAuth`）
  - Custom Hooks use `use` prefix (e.g., `useForm`)
  - 自定义Hooks使用use前缀（例：`useForm`）

- **Variable and Function Naming**:
- **变量和函数命名**：
  - Use camelCase (e.g., `getUserData`)
  - 使用camelCase（例：`getUserData`）
  - Booleans use `is`/`has`/`should` prefix (e.g., `isLoading`)
  - 布尔值使用is/has/should前缀（例：`isLoading`）
  - Event handlers use `handle` prefix (e.g., `handleSubmit`)
  - 事件处理函数使用handle前缀（例：`handleSubmit`）

- **Constant Naming**:
- **常量命名**：
  - Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - 使用UPPER_SNAKE_CASE（例：`API_BASE_URL`）

- **Interface and Type Naming**:
- **接口和类型命名**：
  - Interfaces use `I` prefix (e.g., `IUser`)
  - 接口使用I前缀（例：`IUser`）
  - Types use `T` prefix (e.g., `TUserState`)
  - 类型使用T前缀（例：`TUserState`）
  - Props types use ComponentName+Props (e.g., `ButtonProps`)
  - Props类型使用组件名+Props（例：`ButtonProps`）

#### 3.1.3 Component Structure
#### 3.1.3 组件结构

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles } from './ComponentName.styles';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onSomething?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0,
  onSomething,
}) => {
  // State and Hooks / 状态和钩子
  const [state, setState] = useState<string>('');
  
  // Side Effects / 副作用
  useEffect(() => {
    // Side effect logic / 副作用逻辑
    return () => {
      // Cleanup logic / 清理逻辑
    };
  }, [dependencies]);
  
  // Event Handlers / 事件处理函数
  const handleEvent = () => {
    // Handling logic / 处理逻辑
    if (onSomething) {
      onSomething();
    }
  };
  
  // Render Helper Functions / 渲染辅助函数
  const renderSomething = () => {
    return <Text>Something</Text>;
  };
  
  // Main Render Function / 主渲染函数
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prop1}</Text>
      {renderSomething()}
    </View>
  );
};
```

#### 3.1.4 Styling Specification
#### 3.1.4 样式规范

Use Styled Components or React Native StyleSheet:
使用Styled Components或React Native StyleSheet：

```typescript
// Using StyleSheet / 使用StyleSheet
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 16,
    color: '#212121',
  },
});

// Or using Styled Components / 或使用Styled Components
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #ffffff;
`;

export const StyledText = styled.Text`
  font-size: 16px;
  color: #212121;
`;
```

#### 3.1.5 TypeScript Best Practices
#### 3.1.5 TypeScript最佳实践

- Always define interfaces for component props
- 始终为组件props定义接口
- Use types instead of interfaces for simple data structures
- 使用类型而非接口定义简单的数据结构
- Use generics to enhance code reusability
- 使用泛型增强代码复用性
- Avoid using `any` type, prefer `unknown`
- 避免使用`any`类型，优先使用`unknown`
- When using type assertions, prefer `as` syntax over angle brackets
- 使用类型断言时优先使用`as`语法而非尖括号
- Use type guards for type narrowing
- 使用类型守卫进行类型收窄
- Define types for API responses
- 为API响应定义类型

```typescript
// Type Guard Example / 类型守卫示例
function isError(obj: unknown): obj is Error {
  return obj instanceof Error;
}

// API Response Type Example / API响应类型示例
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

// Usage / 使用
async function fetchUser(id: string): Promise<ApiResponse<UserData>> {
  // Implementation / 实现
}
```

### 3.2 State Management Specification
### 3.2 状态管理规范

#### 3.2.1 Redux Best Practices
#### 3.2.1 Redux最佳实践

- Use Redux Toolkit to simplify Redux code
- 使用Redux Toolkit简化Redux代码
- Organize state by functional modules
- 按功能模块组织状态
- Use slices to organize reducers and actions
- 使用切片（slices）组织reducer和action
- Use selectors to access state
- 使用选择器（selectors）访问状态
- Use createAsyncThunk for asynchronous logic
- 异步逻辑使用createAsyncThunk

```typescript
// Slice Example / 切片示例
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { userApi } from '../../services/userApi';

interface UserState {
  data: IUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await userApi.getUser(userId);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUser: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export const { resetUser } = userSlice.actions;

// Selectors / 选择器
export const selectUser = (state: RootState) => state.user.data;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
```

#### 3.2.2 Local State Management
#### 3.2.2 本地状态管理

- Simple components use useState
- 简单组件使用useState
- Complex components use useReducer
- 复杂组件使用useReducer
- Shared state uses Context API
- 共享状态使用Context API
- Avoid deep prop drilling
- 避免过深的props传递

```typescript
// useReducer Example / useReducer示例
import React, { useReducer } from 'react';

interface FormState {
  username: string;
  password: string;
  isValid: boolean;
}

type FormAction = 
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'VALIDATE_FORM' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'VALIDATE_FORM':
      return { 
        ...state, 
        isValid: state.username.length > 0 && state.password.length >= 6 
      };
    default:
      return state;
  }
};

const LoginForm: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, {
    username: '',
    password: '',
    isValid: false,
  });
  
  // Component implementation / 组件实现
};
```

### 3.3 API Calling Specification
### 3.3 API调用规范

#### 3.3.1 API Service Structure
#### 3.3.1 API服务结构

```typescript
// api.ts - Basic API configuration / 基础API配置
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.culturebridge.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor / 请求拦截器
api.interceptors.request.use(
  (config) => {
    // Add authentication token, etc. / 添加认证令牌等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor / 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors, e.g., 401 redirect to login / 处理错误，如401重定向到登录
    if (error.response && error.response.status === 401) {
      // Handle unauthorized / 处理未授权
    }
    return Promise.reject(error);
  }
);

export default api;

// userApi.ts - Specific module API / 特定模块API
import api from './api';
import { IUser, IUserUpdateData } from '../types/user';

export const userApi = {
  getUser: (userId: string) => api.get<IUser>(`/users/${userId}`),
  updateUser: (userId: string, data: IUserUpdateData) => 
    api.put<IUser>(`/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
};
```

#### 3.3.2 API Calling Best Practices
#### 3.3.2 API调用最佳实践

- Use React Query to manage server state
- 使用React Query管理服务器状态
- Centralize API endpoint management
- 集中管理API端点
- Handle loading, error, and success states
- 处理加载、错误和成功状态
- Implement request retries and caching strategies
- 实现请求重试和缓存策略
- Use TypeScript types to ensure type safety
- 使用TypeScript类型确保类型安全

```typescript
// React Query Example / 使用React Query示例
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi } from '../services/userApi';

// Query Hook / 查询钩子
export const useUser = (userId: string) => {
  return useQuery(
    ['user', userId], 
    () => userApi.getUser(userId).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes / 5分钟
      cacheTime: 10 * 60 * 1000, // 10 minutes / 10分钟
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch user:', error);
      },
    }
  );
};

// Mutation Hook / 变更钩子
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ userId, data }: { userId: string; data: IUserUpdateData }) => 
      userApi.updateUser(userId, data).then(res => res.data),
    {
      onSuccess: (data, variables) => {
        // Update cache / 更新缓存
        queryClient.setQueryData(['user', variables.userId], data);
        // Show success message / 显示成功消息
      },
      onError: (error) => {
        // Show error message / 显示错误消息
        console.error('Failed to update user:', error);
      },
    }
  );
};
```

### 3.4 Testing Specification
### 3.4 测试规范

#### 3.4.1 Unit Testing
#### 3.4.1 单元测试

Use Jest and React Testing Library:
使用Jest和React Testing Library：

```typescript
// Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Press me" />);
    expect(getByText('Press me')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Press me" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Press me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders disabled state correctly', () => {
    const { getByText } = render(
      <Button title="Press me" disabled />
    );
    
    const button = getByText('Press me');
    expect(button.props.style).toMatchObject({ opacity: 0.5 });
  });
});
```

#### 3.4.2 Integration Testing
#### 3.4.2 集成测试

Use Detox for end-to-end testing:
使用Detox进行端到端测试：

```typescript
// login.spec.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Verify successful login, check if home screen elements exist
    // 验证登录成功，检查主页元素是否存在
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    // Verify error message / 验证错误消息
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

#### 3.4.3 Test Coverage Requirements
#### 3.4.3 测试覆盖率要求

- Unit test coverage target: 80%
- 单元测试覆盖率目标：80%
- Critical business logic coverage target: 90%
- 关键业务逻辑覆盖率目标：90%
- Each PR must include relevant tests
- 每个PR必须包含相关测试
- Regularly run full test suite
- 定期运行全套测试

### 3.5 Performance Optimization Specification
### 3.5 性能优化规范

- Use React.memo to avoid unnecessary re-renders
- 使用React.memo避免不必要的重渲染
- Use useCallback and useMemo to cache functions and computed values
- 使用useCallback和useMemo缓存函数和计算值
- Implement virtualized lists (FlatList) for long lists
- 实现虚拟列表（FlatList）处理长列表
- Lazy load non-critical components
- 延迟加载非关键组件
- Optimize images (size, format, caching)
- 优化图像（大小、格式、缓存）
- Avoid excessive use of inline styles
- 避免过度使用内联样式
- Use performance monitoring tools (e.g., Flipper)
- 使用性能监控工具（如Flipper）

```typescript
// Performance Optimization Example / 性能优化示例
import React, { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';

// Using React.memo / 使用React.memo
const ListItem = React.memo(({ title, onPress }: ListItemProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(title)}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

// Parent Component / 父组件
const ItemList: React.FC<{ items: string[] }> = ({ items }) => {
  // Using useCallback / 使用useCallback
  const handleItemPress = useCallback((title: string) => {
    console.log(`Item pressed: ${title}`);
  }, []);
  
  // Using useMemo / 使用useMemo
  const sortedItems = useMemo(() => {
    return [...items].sort();
  }, [items]);
  
  // Using FlatList / 使用FlatList
  return (
    <FlatList
      data={sortedItems}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <ListItem title={item} onPress={handleItemPress} />
      )}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};
```

## 4. Backend Code Specification
## 4. 后端代码规范

### 4.1 Node.js / Express / TypeScript Specification
### 4.1 Node.js / Express / TypeScript规范

#### 4.1.1 Project Structure
#### 4.1.1 项目结构

```
src/
  api/              # API routes / API路由
    v1/             # API version / API版本
      controllers/  # Controllers / 控制器
      routes/       # Route definitions / 路由定义
      middlewares/  # Middleware / 中间件
      validators/   # Request validation / 请求验证
  services/         # Business logic / 业务逻辑
  models/           # Data models / 数据模型
  repositories/     # Data access / 数据访问
  config/           # Configuration / 配置
  utils/            # Utility functions / 工具函数
  types/            # TypeScript types / TypeScript类型
  app.ts            # Application entry point / 应用入口
  server.ts         # Server startup / 服务器启动
```

#### 4.1.2 Naming Convention
#### 4.1.2 命名规范

- **File Names**:
- **文件名**：
  - Use camelCase (e.g., `userController.ts`)
  - 使用camelCase（例：`userController.ts`）
  - Test files: `*.test.ts` or `*.spec.ts`
  - 测试文件：`*.test.ts`或`*.spec.ts`

- **Class Naming**:
- **类命名**：
  - Use PascalCase (e.g., `UserService`)
  - 使用PascalCase（例：`UserService`）
  - Controllers use `Controller` suffix (e.g., `UserController`)
  - 控制器使用Controller后缀（例：`UserController`）
  - Services use `Service` suffix (e.g., `AuthService`)
  - 服务使用Service后缀（例：`AuthService`）

- **Function and Method Naming**:
- **函数和方法命名**：
  - Use camelCase (e.g., `getUserById`)
  - 使用camelCase（例：`getUserById`）
  - HTTP method handlers use verbs (e.g., `getUser`, `createUser`)
  - HTTP方法处理函数使用动词（例：`getUser`，`createUser`）
  - Middleware uses verb+noun (e.g., `validateToken`)
  - 中间件使用动词+名词（例：`validateToken`）

- **Variable Naming**:
- **变量命名**：
  - Use camelCase (e.g., `userData`)
  - 使用camelCase（例：`userData`）
  - Constants use UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`)
  - 常量使用UPPER_SNAKE_CASE（例：`MAX_LOGIN_ATTEMPTS`）

- **Interface and Type Naming**:
- **接口和类型命名**：
  - Interfaces use `I` prefix (e.g., `IUser`)
  - 接口使用I前缀（例：`IUser`）
  - Types use `T` prefix (e.g., `TUserData`)
  - 类型使用T前缀（例：`TUserData`）
  - DTOs use `DTO` suffix (e.g., `CreateUserDTO`)
  - DTO使用后缀DTO（例：`CreateUserDTO`）

#### 4.1.3 API Structure
#### 4.1.3 API结构

```typescript
// routes/userRoutes.ts
import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateUserCreate } from '../validators/userValidator';

const router = express.Router();
const userController = new UserController();

router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.post('/', authenticate, validateUserCreate, userController.createUser);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

export default router;

// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/userService';

export class UserController {
  private userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAll();
      return res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  };
  
  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };
  
  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.userService.create(req.body);
      return res.status(201).json({ data: newUser });
    } catch (error) {
      next(error);
    }
  };
  
  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.update(id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ data: updatedUser });
    } catch (error) {
      next(error);
    }
  };
  
  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(204).send(); // No Content
    } catch (error) {
      next(error);
    }
  };
}
```

#### 4.1.4 Error Handling
#### 4.1.4 错误处理

- Use a centralized error handling middleware
- 使用集中式错误处理中间件
- Define custom error classes for specific error types
- 为特定错误类型定义自定义错误类
- Log errors with appropriate severity levels
- 以适当的严重级别记录错误
- Return consistent error responses to the client
- 向客户端返回一致的错误响应

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal Server Error' });
};

// utils/errors.ts
export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Usage in controllers:
// 在控制器中使用：
// throw new CustomError('User not found', 404);
```

### 4.2 Database Interaction Specification
### 4.2 数据库交互规范

- Use an ORM (e.g., TypeORM, Sequelize, Prisma) for relational databases
- 关系型数据库使用ORM（如TypeORM, Sequelize, Prisma）
- Use official drivers or ODM (e.g., Mongoose) for NoSQL databases
- NoSQL数据库使用官方驱动或ODM（如Mongoose）
- Implement repository pattern to abstract data access logic
- 实现仓储模式以抽象数据访问逻辑
- Handle database transactions for atomic operations
- 处理数据库事务以实现原子操作

```typescript
// repositories/userRepository.ts
import { AppDataSource } from '../data-source';
import { User } from '../models/User';

export class UserRepository {
  private userRepository = AppDataSource.getRepository(User);
  
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
  
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }
  
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected === 1;
  }
}
```

### 4.3 Authentication and Authorization
### 4.3 认证与授权

- Use JWT (JSON Web Tokens) for stateless authentication
- 使用JWT (JSON Web Tokens) 实现无状态认证
- Implement middleware for authentication and authorization checks
- 实现中间件进行认证和授权检查
- Store sensitive information (e.g., JWT secret) in environment variables
- 敏感信息（如JWT密钥）存储在环境变量中
- Use bcrypt for password hashing
- 使用bcrypt进行密码哈希

```typescript
// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### 4.4 Logging and Monitoring
### 4.4 日志与监控

- Use a structured logging library (e.g., Winston, Pino)
- 使用结构化日志库（如Winston, Pino）
- Log requests, responses, and errors
- 记录请求、响应和错误
- Implement metrics collection (e.g., Prometheus, Grafana)
- 实施指标收集（如Prometheus, Grafana）
- Set up alerts for critical issues
- 为关键问题设置警报

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;

// Usage:
// logger.info('User logged in', { userId: '123' });
// logger.error('Database connection failed', { error: err.message });
```

## 5. 智能合约开发规范

### 5.1 Solidity规范

#### 5.1.1 文件组织

```
contracts/
  interfaces/         # 接口定义
  libraries/          # 库
  tokens/             # 代币合约
  governance/         # 治理合约
  utils/              # 工具合约
  MyContract.sol      # 主合约
```

#### 5.1.2 命名规范

- **文件名**：PascalCase.sol（例：`MyToken.sol`）
- **合约、库、接口**：PascalCase（例：`ERC20`, `SafeMath`）
- **函数**：camelCase（例：`transferFrom`）
- **事件**：PascalCase（例：`Transfer`）
- **状态变量**：camelCase（例：`totalSupply`）
- **常量**：UPPER_SNAKE_CASE（例：`MAX_SUPPLY`）
- **修饰符**：camelCase（例：`onlyOwner`）

#### 5.1.3 安全最佳实践

- **重入保护**：使用`reentrancyGuard`修饰符或检查-效果-交互模式
- **整数溢出/下溢**：使用SafeMath库
- **访问控制**：使用`onlyOwner`, `onlyRole`等修饰符
- **短地址攻击**：检查`msg.sender`和`msg.value`
- **外部调用**：使用`call`而不是`transfer`/`send`，并检查返回值
- **Gas限制**：避免无限循环和高Gas消耗操作
- **时间戳依赖**：避免使用`block.timestamp`作为随机数或关键逻辑
- **升级性**：考虑使用代理模式实现合约升级

```solidity
// 重入保护示例
contract MyContract is ReentrancyGuard {
    function withdraw() public nonReentrant {
        // ...
    }
}

// 访问控制示例
contract Ownable {
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
```

### 5.2 Hardhat / Truffle测试规范

- 编写全面的单元测试和集成测试
- 使用`chai`和`ethers.js`进行断言
- 模拟外部合约和链上状态
- 测试所有可能的边缘情况和错误路径

```javascript
// MyContract.test.js (Hardhat/Ethers.js)
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
  let MyContract;
  let myContract;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    MyContract = await ethers.getContractFactory("MyContract");
    myContract = await MyContract.deploy();
    await myContract.deployed();
  });

  it("Should set the right owner", async function () {
    expect(await myContract.owner()).to.equal(owner.address);
  });

  it("Should allow owner to withdraw", async function () {
    await myContract.connect(owner).deposit({ value: ethers.utils.parseEther("1.0") });
    await expect(myContract.connect(owner).withdraw())
      .to.emit(myContract, "Withdrawal")
      .withArgs(owner.address, ethers.utils.parseEther("1.0"));
  });

  it("Should not allow non-owner to withdraw", async function () {
    await expect(myContract.connect(addr1).withdraw()).to.be.revertedWith("Not owner");
  });
});
```

### 5.3 部署与升级规范

- 使用确定性部署地址
- 部署前进行充分测试
- 记录部署信息（合约地址、交易哈希、部署时间）
- 考虑使用OpenZeppelin Upgrades插件进行安全升级
- 部署到主网前进行多签确认

## 6. CI/CD流程

### 6.1 前端CI/CD

- **代码提交**：触发CI
- **CI阶段**：
  - 代码风格检查（ESLint, Prettier）
  - 类型检查（TypeScript）
  - 单元测试
  - 构建应用
- **CD阶段**：
  - 部署到开发/测试环境
  - 运行集成测试
  - 部署到生产环境（手动触发或定时）

### 6.2 后端CI/CD

- **代码提交**：触发CI
- **CI阶段**：
  - 代码风格检查
  - 类型检查
  - 单元测试
  - 构建Docker镜像
- **CD阶段**：
  - 部署到开发/测试环境
  - 运行集成测试
  - 部署到生产环境（手动触发或定时）

### 6.3 智能合约CI/CD

- **代码提交**：触发CI
- **CI阶段**：
  - 编译合约
  - 运行单元测试
  - 运行安全审计工具
- **CD阶段**：
  - 部署到测试网
  - 运行集成测试
  - 部署到主网（手动触发，多签确认）

## 7. 文档规范

- **README.md**：项目概述、安装、运行、贡献指南
- **CONTRIBUTING.md**：贡献指南
- **ARCHITECTURE.md**：系统架构设计
- **API.md**：API接口文档
- **DESIGN.md**：UI/UX设计规范
- **TESTING.md**：测试策略与报告
- **DEPLOYMENT.md**：部署指南
- **ROADMAP.md**：项目路线图
- **CHANGELOG.md**：版本更新日志
- **LICENSE.md**：许可证信息

## 8. 安全规范

### 8.1 通用安全实践

- **最小权限原则**：所有系统、用户、服务只拥有完成其任务所需的最小权限
- **安全编码实践**：遵循OWASP Top 10，防止常见漏洞
- **依赖项安全**：定期更新依赖项，扫描已知漏洞
- **数据验证**：所有输入数据进行严格验证和清理
- **错误处理**：避免在错误消息中泄露敏感信息
- **安全审计**：定期进行代码审计和渗透测试

### 8.2 敏感信息管理

- **环境变量**：敏感信息（API密钥、数据库凭据）通过环境变量注入
- **密钥管理服务**：使用云服务商提供的密钥管理服务
- **版本控制**：绝不将敏感信息直接提交到版本控制系统

### 8.3 应急响应

- **事件响应计划**：制定详细的事件响应流程
- **监控与警报**：实时监控系统，对异常行为设置警报
- **备份与恢复**：定期备份数据，并测试恢复流程
- **沟通计划**：在安全事件发生时，与用户和社区的沟通计划

## 9. 国际化 (i18n) 规范

- **文本提取**：所有用户可见文本提取到语言文件中
- **占位符**：使用占位符处理动态内容
- **日期/时间格式**：根据用户区域设置进行格式化
- **数字格式**：根据用户区域设置进行格式化
- **复数形式**：处理不同语言的复数规则
- **翻译工具**：使用专业的翻译管理工具

## 10. 性能规范

- **前端**：
  - 优化图片和媒体资源
  - 代码分割和懒加载
  - 减少HTTP请求
  - 使用CDN
  - 优化渲染性能
- **后端**：
  - 数据库查询优化
  - 缓存策略
  - 异步处理
  - 负载均衡
- **智能合约**：
  - 优化Gas消耗
  - 避免不必要的存储操作
  - 优化循环和计算

## 11. 部署规范

- **环境分离**：开发、测试、生产环境严格分离
- **自动化部署**：使用CI/CD工具实现自动化部署
- **回滚策略**：制定快速回滚方案
- **监控与日志**：部署后配置全面的监控和日志系统
- **弹性伸缩**：设计支持自动伸缩的架构

## 12. 团队协作规范

- **沟通工具**：使用Slack/Discord进行日常沟通
- **任务管理**：使用Jira/Trello进行任务分配和跟踪
- **文档共享**：使用Confluence/Notion共享文档
- **代码审查**：强制进行代码审查
- **知识共享**：定期进行技术分享和知识沉淀

## 13. 贡献指南

- **Fork仓库**
- **创建功能分支**
- **编写代码和测试**
- **提交更改**
- **创建Pull Request**
- **参与代码审查**

## 14. 许可证

- **MIT License**


