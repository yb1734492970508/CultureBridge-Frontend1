# CultureBridge 开发流程与代码规范

## 1. 开发流程概述

CultureBridge项目采用敏捷开发方法，结合Git工作流和持续集成/持续部署(CI/CD)实践，确保高效、协作和高质量的开发过程。

### 1.1 开发生命周期

CultureBridge的开发生命周期包括以下阶段：

1. **需求分析与规划**
   - 用户故事编写
   - 功能优先级排序
   - 工作量估算
   - 迭代计划制定

2. **设计**
   - UI/UX设计
   - 架构设计
   - API设计
   - 数据库设计

3. **开发**
   - 任务分配
   - 编码实现
   - 代码审查
   - 单元测试

4. **测试**
   - 集成测试
   - 功能测试
   - 性能测试
   - 用户验收测试

5. **部署**
   - 构建与打包
   - 环境配置
   - 发布管理
   - 监控设置

6. **维护与迭代**
   - 用户反馈收集
   - 缺陷修复
   - 性能优化
   - 功能迭代

### 1.2 敏捷开发实践

- **迭代周期**：2周一个迭代
- **每日站会**：15分钟，讨论进度、计划和阻碍
- **迭代计划会**：迭代开始前，确定迭代目标和任务
- **迭代评审**：迭代结束时，演示完成的功能
- **迭代回顾**：总结经验教训，持续改进
- **看板管理**：使用Trello或Jira跟踪任务状态

## 2. Git工作流

### 2.1 分支策略

CultureBridge采用GitHub Flow分支策略的变体：

- **main**：主分支，始终保持可部署状态
- **feature/***：功能分支，用于开发新功能
- **bugfix/***：修复分支，用于修复缺陷
- **hotfix/***：热修复分支，用于紧急修复生产环境问题
- **release/***：发布分支，用于版本发布准备

### 2.2 分支命名规范

```
feature/[issue-id]-short-description
bugfix/[issue-id]-short-description
hotfix/[issue-id]-short-description
release/vX.Y.Z
```

示例：
- `feature/CB-123-user-authentication`
- `bugfix/CB-456-fix-login-validation`
- `hotfix/CB-789-critical-security-fix`
- `release/v1.0.0`

### 2.3 提交信息规范

采用[Conventional Commits](https://www.conventionalcommits.org/)规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**：提交类型
  - `feat`：新功能
  - `fix`：缺陷修复
  - `docs`：文档更新
  - `style`：代码风格调整（不影响代码功能）
  - `refactor`：代码重构（既不是新功能也不是缺陷修复）
  - `perf`：性能优化
  - `test`：添加或修改测试
  - `chore`：构建过程或辅助工具变动
  - `ci`：CI配置变更
  - `revert`：回滚之前的提交

- **scope**：变更范围（可选）
  - `auth`：认证模块
  - `api`：API相关
  - `ui`：用户界面
  - `db`：数据库
  - `i18n`：国际化
  - 等等

- **subject**：简短描述，不超过50个字符
- **body**：详细描述（可选）
- **footer**：关闭Issue等信息（可选）

示例：
```
feat(auth): implement social login with Google

- Add Google OAuth2 integration
- Create user profile from Google account data
- Add tests for Google authentication flow

Closes #123
```

### 2.4 Pull Request流程

1. **创建PR**：
   - 描述功能或修复的内容
   - 关联相关Issue
   - 添加测试结果或截图
   - 标记需要审查的人员

2. **代码审查**：
   - 至少一名团队成员审查
   - 使用GitHub的评论功能讨论代码
   - 解决所有评论和问题

3. **自动化检查**：
   - 代码风格检查
   - 单元测试
   - 构建验证

4. **合并**：
   - 所有审查通过后合并
   - 使用"Squash and merge"策略保持主分支历史清晰
   - 删除已合并的功能分支

### 2.5 版本管理

采用[语义化版本](https://semver.org/)：

- **主版本号(X)**：不兼容的API变更
- **次版本号(Y)**：向后兼容的功能新增
- **修订号(Z)**：向后兼容的问题修复

版本标签格式：`vX.Y.Z`

示例：`v1.0.0`、`v1.1.0`、`v1.1.1`

## 3. 前端代码规范

### 3.1 React Native / TypeScript规范

#### 3.1.1 文件组织

```
src/
  components/         # 组件
    common/           # 通用组件
    feature1/         # 特定功能组件
    feature2/
  screens/            # 屏幕/页面
  navigation/         # 导航配置
  hooks/              # 自定义Hooks
  services/           # API服务
  utils/              # 工具函数
  constants/          # 常量
  types/              # TypeScript类型定义
  assets/             # 静态资源
  i18n/               # 国际化资源
  store/              # 状态管理
```

#### 3.1.2 命名规范

- **文件名**：
  - 组件：PascalCase.tsx（例：`Button.tsx`）
  - 非组件：camelCase.ts（例：`apiService.ts`）
  - 样式：PascalCase.styles.ts（例：`Button.styles.ts`）
  - 测试：PascalCase.test.tsx（例：`Button.test.tsx`）

- **组件命名**：
  - 使用PascalCase（例：`UserProfile`）
  - 高阶组件使用with前缀（例：`withAuth`）
  - 自定义Hooks使用use前缀（例：`useForm`）

- **变量和函数命名**：
  - 使用camelCase（例：`getUserData`）
  - 布尔值使用is/has/should前缀（例：`isLoading`）
  - 事件处理函数使用handle前缀（例：`handleSubmit`）

- **常量命名**：
  - 使用UPPER_SNAKE_CASE（例：`API_BASE_URL`）

- **接口和类型命名**：
  - 接口使用I前缀（例：`IUser`）
  - 类型使用T前缀（例：`TUserState`）
  - Props类型使用组件名+Props（例：`ButtonProps`）

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
  // 状态和钩子
  const [state, setState] = useState<string>('');
  
  // 副作用
  useEffect(() => {
    // 副作用逻辑
    return () => {
      // 清理逻辑
    };
  }, [dependencies]);
  
  // 事件处理函数
  const handleEvent = () => {
    // 处理逻辑
    if (onSomething) {
      onSomething();
    }
  };
  
  // 渲染辅助函数
  const renderSomething = () => {
    return <Text>Something</Text>;
  };
  
  // 主渲染函数
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prop1}</Text>
      {renderSomething()}
    </View>
  );
};
```

#### 3.1.4 样式规范

使用Styled Components或React Native StyleSheet：

```typescript
// 使用StyleSheet
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

// 或使用Styled Components
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

#### 3.1.5 TypeScript最佳实践

- 始终为组件props定义接口
- 使用类型而非接口定义简单的数据结构
- 使用泛型增强代码复用性
- 避免使用`any`类型，优先使用`unknown`
- 使用类型断言时优先使用`as`语法而非尖括号
- 使用类型守卫进行类型收窄
- 为API响应定义类型

```typescript
// 类型守卫示例
function isError(obj: unknown): obj is Error {
  return obj instanceof Error;
}

// API响应类型示例
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

// 使用
async function fetchUser(id: string): Promise<ApiResponse<UserData>> {
  // 实现
}
```

### 3.2 状态管理规范

#### 3.2.1 Redux最佳实践

- 使用Redux Toolkit简化Redux代码
- 按功能模块组织状态
- 使用切片（slices）组织reducer和action
- 使用选择器（selectors）访问状态
- 异步逻辑使用createAsyncThunk

```typescript
// 切片示例
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

// 选择器
export const selectUser = (state: RootState) => state.user.data;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
```

#### 3.2.2 本地状态管理

- 简单组件使用useState
- 复杂组件使用useReducer
- 共享状态使用Context API
- 避免过深的props传递

```typescript
// useReducer示例
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
  
  // 组件实现
};
```

### 3.3 API调用规范

#### 3.3.1 API服务结构

```typescript
// api.ts - 基础API配置
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.culturebridge.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证令牌等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理错误，如401重定向到登录
    if (error.response && error.response.status === 401) {
      // 处理未授权
    }
    return Promise.reject(error);
  }
);

export default api;

// userApi.ts - 特定模块API
import api from './api';
import { IUser, IUserUpdateData } from '../types/user';

export const userApi = {
  getUser: (userId: string) => api.get<IUser>(`/users/${userId}`),
  updateUser: (userId: string, data: IUserUpdateData) => 
    api.put<IUser>(`/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
};
```

#### 3.3.2 API调用最佳实践

- 使用React Query管理服务器状态
- 集中管理API端点
- 处理加载、错误和成功状态
- 实现请求重试和缓存策略
- 使用TypeScript类型确保类型安全

```typescript
// 使用React Query示例
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi } from '../services/userApi';

// 查询钩子
export const useUser = (userId: string) => {
  return useQuery(
    ['user', userId], 
    () => userApi.getUser(userId).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch user:', error);
      },
    }
  );
};

// 变更钩子
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ userId, data }: { userId: string; data: IUserUpdateData }) => 
      userApi.updateUser(userId, data).then(res => res.data),
    {
      onSuccess: (data, variables) => {
        // 更新缓存
        queryClient.setQueryData(['user', variables.userId], data);
        // 显示成功消息
      },
      onError: (error) => {
        // 显示错误消息
        console.error('Failed to update user:', error);
      },
    }
  );
};
```

### 3.4 测试规范

#### 3.4.1 单元测试

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

#### 3.4.2 集成测试

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
    
    // 验证登录成功，检查主页元素是否存在
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    // 验证错误消息
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

#### 3.4.3 测试覆盖率要求

- 单元测试覆盖率目标：80%
- 关键业务逻辑覆盖率目标：90%
- 每个PR必须包含相关测试
- 定期运行全套测试

### 3.5 性能优化规范

- 使用React.memo避免不必要的重渲染
- 使用useCallback和useMemo缓存函数和计算值
- 实现虚拟列表（FlatList）处理长列表
- 延迟加载非关键组件
- 优化图像（大小、格式、缓存）
- 避免过度使用内联样式
- 使用性能监控工具（如Flipper）

```typescript
// 性能优化示例
import React, { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';

// 使用React.memo
const ListItem = React.memo(({ title, onPress }: ListItemProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(title)}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

// 父组件
const ItemList: React.FC<{ items: string[] }> = ({ items }) => {
  // 使用useCallback
  const handleItemPress = useCallback((title: string) => {
    console.log(`Item pressed: ${title}`);
  }, []);
  
  // 使用useMemo
  const sortedItems = useMemo(() => {
    return [...items].sort();
  }, [items]);
  
  // 使用FlatList
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

## 4. 后端代码规范

### 4.1 Node.js / Express / TypeScript规范

#### 4.1.1 项目结构

```
src/
  api/              # API路由
    v1/             # API版本
      controllers/  # 控制器
      routes/       # 路由定义
      middlewares/  # 中间件
      validators/   # 请求验证
  services/         # 业务逻辑
  models/           # 数据模型
  repositories/     # 数据访问
  config/           # 配置
  utils/            # 工具函数
  types/            # TypeScript类型
  app.ts            # 应用入口
  server.ts         # 服务器启动
```

#### 4.1.2 命名规范

- **文件名**：
  - 使用camelCase（例：`userController.ts`）
  - 测试文件：`*.test.ts`或`*.spec.ts`

- **类命名**：
  - 使用PascalCase（例：`UserService`）
  - 控制器使用Controller后缀（例：`UserController`）
  - 服务使用Service后缀（例：`AuthService`）

- **函数和方法命名**：
  - 使用camelCase（例：`getUserById`）
  - HTTP方法处理函数使用动词（例：`getUser`，`createUser`）
  - 中间件使用动词+名词（例：`validateToken`）

- **变量命名**：
  - 使用camelCase（例：`userData`）
  - 常量使用UPPER_SNAKE_CASE（例：`MAX_LOGIN_ATTEMPTS`）

- **接口和类型命名**：
  - 接口使用I前缀（例：`IUser`）
  - 类型使用T前缀（例：`TUserData`）
  - DTO使用后缀DTO（例：`CreateUserDTO`）

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
  
  // 其他方法...
}
```

#### 4.1.4 错误处理

```typescript
// types/error.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/error';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  
  // 未预期的错误
  console.error('Unexpected error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

// 使用示例
import { AppError } from '../types/error';

export class UserService {
  public async getById(id: string) {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
}
```

#### 4.1.5 验证

使用Joi或class-validator进行请求验证：

```typescript
// validators/userValidator.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../types/error';

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});

export const validateUserCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createUserSchema.validate(req.body);
  
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return next(new AppError(message, 400));
  }
  
  next();
};
```

### 4.2 数据库访问规范

#### 4.2.1 Prisma ORM使用规范

```typescript
// repositories/userRepository.ts
import { PrismaClient, User } from '@prisma/client';
import { ICreateUserData, IUpdateUserData } from '../types/user';

export class UserRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  public async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  
  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  
  public async create(data: ICreateUserData): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }
  
  public async update(id: string, data: IUpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
  
  public async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

#### 4.2.2 MongoDB使用规范

```typescript
// models/chatMessage.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  sessionId: string;
  senderId: string;
  content: string;
  originalLanguage: string;
  translatedContent: Record<string, string>;
  sentAt: Date;
  readBy: string[];
  isDeleted: boolean;
}

const ChatMessageSchema = new Schema({
  sessionId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  originalLanguage: { type: String, required: true },
  translatedContent: { type: Map, of: String, default: {} },
  sentAt: { type: Date, default: Date.now },
  readBy: { type: [String], default: [] },
  isDeleted: { type: Boolean, default: false },
});

// 创建复合索引
ChatMessageSchema.index({ sessionId: 1, sentAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

// repositories/chatMessageRepository.ts
import { ChatMessage, IChatMessage } from '../models/chatMessage';
import { ICreateMessageData } from '../types/chat';

export class ChatMessageRepository {
  public async findBySessionId(
    sessionId: string,
    limit = 50,
    before?: Date
  ): Promise<IChatMessage[]> {
    const query: any = { sessionId, isDeleted: false };
    
    if (before) {
      query.sentAt = { $lt: before };
    }
    
    return ChatMessage.find(query)
      .sort({ sentAt: -1 })
      .limit(limit)
      .exec();
  }
  
  public async create(data: ICreateMessageData): Promise<IChatMessage> {
    const message = new ChatMessage(data);
    return message.save();
  }
  
  public async markAsRead(messageId: string, userId: string): Promise<IChatMessage | null> {
    return ChatMessage.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    ).exec();
  }
  
  public async markAsDeleted(messageId: string): Promise<IChatMessage | null> {
    return ChatMessage.findByIdAndUpdate(
      messageId,
      { isDeleted: true },
      { new: true }
    ).exec();
  }
}
```

### 4.3 安全最佳实践

- 使用Helmet设置安全相关HTTP头
- 实施CORS策略
- 使用速率限制防止暴力攻击
- 验证和清理所有用户输入
- 使用参数化查询防止注入攻击
- 实施适当的认证和授权
- 安全存储密码（使用bcrypt）
- 使用HTTPS
- 实施CSRF保护
- 定期更新依赖

```typescript
// app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorMiddleware';

const app = express();

// 安全HTTP头
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP 100个请求
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10kb' }));

// 路由
app.use('/api/v1/users', userRoutes);
// 其他路由...

// 错误处理
app.use(errorHandler);

export default app;
```

### 4.4 测试规范

#### 4.4.1 单元测试

使用Jest和Supertest：

```typescript
// userService.test.ts
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../types/error';

// 模拟UserRepository
jest.mock('../repositories/userRepository');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(userRepository);
  });
  
  describe('getById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', username: 'test' };
      userRepository.findById.mockResolvedValue(mockUser as any);
      
      const result = await userService.getById('1');
      
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });
    
    it('should throw AppError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      
      await expect(userService.getById('1')).rejects.toThrow(AppError);
      await expect(userService.getById('1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });
});
```

#### 4.4.2 集成测试

```typescript
// userRoutes.test.ts
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User API', () => {
  let authToken: string;
  let userId: string;
  
  beforeAll(async () => {
    // 设置测试数据和获取认证令牌
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
    
    await prisma.$disconnect();
  });
  
  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe('testuser');
      
      userId = response.body.data.id;
    });
    
    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'te', // 太短
          email: 'invalid-email',
          password: 'short',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  // 其他测试...
});
```

## 5. 文档规范

### 5.1 代码注释

#### 5.1.1 JSDoc/TSDoc规范

```typescript
/**
 * 用户服务类，处理用户相关业务逻辑
 */
export class UserService {
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  
  /**
   * 根据ID获取用户
   * 
   * @param id - 用户ID
   * @returns 用户对象
   * @throws {AppError} 404 - 用户不存在
   */
  public async getById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
  
  /**
   * 创建新用户
   * 
   * @param data - 用户创建数据
   * @returns 创建的用户对象
   * @throws {AppError} 400 - 邮箱已存在
   */
  public async create(data: ICreateUserData): Promise<IUser> {
    // 实现...
  }
}
```

#### 5.1.2 注释最佳实践

- 使用JSDoc/TSDoc注释公共API
- 复杂逻辑需要添加内联注释
- 避免注释显而易见的代码
- 保持注释与代码同步更新
- 使用TODO/FIXME标记需要改进的地方

### 5.2 API文档

使用Swagger/OpenAPI：

```typescript
// routes/userRoutes.ts
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: 获取用户列表
 *     description: 返回所有用户的列表
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', authenticate, userController.getUsers);
```

### 5.3 README和项目文档

每个仓库应包含：

- README.md：项目概述、安装说明、使用示例
- CONTRIBUTING.md：贡献指南
- LICENSE：许可证
- CHANGELOG.md：版本变更记录
- docs/：详细文档目录

README.md模板：

```markdown
# CultureBridge [前端/后端]

CultureBridge是一个全球语言交换与文化学习平台，帮助用户学习新语言并与来自世界各地的人交流。

## 功能

- 实时翻译对话
- 语言学习课程
- 用户匹配系统
- 文化情境学习

## 技术栈

- [技术列表]

## 开始使用

### 前提条件

- Node.js 18+
- [其他依赖]

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/culturebridge-[frontend/backend].git
cd culturebridge-[frontend/backend]

# 安装依赖
yarn install
```

### 开发

```bash
# 启动开发服务器
yarn dev
```

### 构建

```bash
# 构建生产版本
yarn build
```

### 测试

```bash
# 运行测试
yarn test
```

## 项目结构

[项目结构描述]

## 贡献

请阅读[CONTRIBUTING.md](CONTRIBUTING.md)了解贡献流程。

## 许可证

本项目采用[许可证类型]许可 - 详见[LICENSE](LICENSE)文件。
```

## 6. 代码审查规范

### 6.1 代码审查清单

#### 6.1.1 一般检查项

- 代码是否遵循项目的编码规范
- 是否有不必要的复杂性
- 是否有重复代码可以提取
- 变量和函数命名是否清晰明确
- 注释是否充分且有用
- 是否有潜在的性能问题
- 错误处理是否完善
- 是否包含适当的测试

#### 6.1.2 前端特定检查项

- 组件设计是否符合单一职责原则
- 是否有不必要的重渲染
- 状态管理是否合理
- UI是否符合设计规范
- 是否考虑了可访问性
- 是否处理了加载和错误状态
- 响应式设计是否完善
- 国际化支持是否正确

#### 6.1.3 后端特定检查项

- API设计是否符合RESTful原则
- 是否有适当的输入验证
- 安全措施是否充分
- 数据库查询是否优化
- 是否有适当的日志记录
- 事务处理是否正确
- 是否考虑了并发问题
- 是否有适当的缓存策略

### 6.2 代码审查流程

1. **自我审查**：
   - 提交PR前进行自我审查
   - 使用自动化工具检查代码质量
   - 确保所有测试通过

2. **审查分配**：
   - 至少一名团队成员审查
   - 复杂变更需要多人审查
   - 考虑领域专业知识分配审查者

3. **审查进行**：
   - 审查者提供具体、建设性的反馈
   - 使用GitHub的评论功能讨论代码
   - 关注代码质量而非风格（风格应由自动化工具处理）

4. **解决反馈**：
   - 作者解决所有评论和问题
   - 对于有争议的问题进行讨论
   - 必要时进行实时讨论解决复杂问题

5. **最终审查**：
   - 所有问题解决后进行最终审查
   - 确认所有自动化检查通过
   - 批准并合并PR

### 6.3 代码审查工具

- ESLint/TSLint：静态代码分析
- Prettier：代码格式化
- SonarQube：代码质量和安全分析
- GitHub Actions：自动化检查
- Codecov：测试覆盖率报告

## 7. 持续集成与部署

### 7.1 CI/CD流程

使用GitHub Actions实现CI/CD：

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Run linting
        run: yarn lint
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Run tests
        run: yarn test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Build
        run: yarn build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/
```

### 7.2 部署流程

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Build
        run: yarn build
      
      # 前端部署到AWS S3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy to S3
        run: aws s3 sync build/ s3://culturebridge-app --delete
      - name: Invalidate CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
      
      # 或后端部署到AWS ECS
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.login-ecr.outputs.registry }}/culturebridge-api:${{ github.sha }}
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster culturebridge-cluster --service culturebridge-api --force-new-deployment
```

### 7.3 环境管理

- **开发环境**：
  - 用于日常开发
  - 自动部署develop分支
  - 可能包含实验性功能

- **测试环境**：
  - 用于QA和测试
  - 部署发布候选版本
  - 尽可能接近生产环境

- **生产环境**：
  - 面向最终用户
  - 仅部署经过充分测试的版本
  - 部署需要手动批准

## 8. 质量保证

### 8.1 代码质量工具

- ESLint：JavaScript/TypeScript代码质量
- Prettier：代码格式化
- SonarQube：代码质量和安全分析
- Husky：Git钩子，用于提交前检查
- lint-staged：仅对暂存文件运行linters

配置示例：

```json
// package.json
{
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    "test": "jest --coverage"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "yarn test"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

### 8.2 测试策略

- **单元测试**：
  - 测试独立组件和函数
  - 目标覆盖率：80%
  - 每个PR必须包含相关测试

- **集成测试**：
  - 测试组件和服务之间的交互
  - 测试API端点和数据流
  - 关键流程必须有集成测试

- **端到端测试**：
  - 测试完整用户流程
  - 覆盖关键业务流程
  - 使用真实或模拟的后端

- **性能测试**：
  - 负载测试关键API
  - 监控前端性能指标
  - 定期进行性能基准测试

### 8.3 代码审查

- 所有代码必须经过审查
- 使用GitHub的PR功能
- 至少一名团队成员批准
- 关注代码质量、安全性和可维护性
- 使用审查清单确保一致性

### 8.4 缺陷管理

- 使用GitHub Issues跟踪缺陷
- 缺陷分类：严重性和优先级
- 严重缺陷需要立即修复
- 每个缺陷修复需要相应的测试
- 定期审查和清理缺陷列表

## 9. 团队协作

### 9.1 沟通渠道

- **GitHub**：代码和技术讨论
- **Slack/Discord**：日常沟通
- **Zoom/Teams**：视频会议
- **Notion/Confluence**：文档和知识库
- **Jira/Trello**：任务和项目管理

### 9.2 会议结构

- **每日站会**：15分钟，同步进度和阻碍
- **迭代计划会**：每两周，规划下一迭代
- **迭代评审**：展示完成的功能
- **迭代回顾**：总结经验教训
- **技术讨论会**：按需，深入讨论技术问题

### 9.3 知识共享

- 维护团队知识库
- 定期技术分享会
- 代码示例和最佳实践文档
- 新成员入职指南
- 鼓励结对编程和代码审查

## 10. 开发流程实施路线图

### 10.1 MVP阶段

- 建立基本的Git工作流
- 实施核心编码规范
- 设置基础CI流程
- 建立基本的测试框架
- 创建项目文档结构

### 10.2 成长阶段

- 完善自动化测试
- 增强CI/CD流程
- 实施代码质量监控
- 改进文档和知识共享
- 优化团队协作流程

### 10.3 成熟阶段

- 实施高级测试策略
- 优化部署和监控
- 建立性能基准和优化流程
- 完善安全审计和合规
- 持续改进开发流程
