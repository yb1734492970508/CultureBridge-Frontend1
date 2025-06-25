/**
 * 登录页面
 * 用户登录界面
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Globe, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Wallet,
  Github,
  Chrome
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

import { login, walletLogin, selectAuth } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';

// 表单验证模式
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const auth = useSelector(selectAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  const from = location.state?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // 处理表单提交
  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: '登录成功',
        message: `欢迎回来，${result.user.name}！`,
        duration: 3000,
      }));
      
      navigate(from, { replace: true });
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.message || '登录失败，请检查邮箱和密码',
      });
    }
  };

  // 钱包登录
  const handleWalletLogin = async (walletType) => {
    setIsWalletConnecting(true);
    
    try {
      // 检查钱包是否可用
      if (walletType === 'metamask' && !window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      const result = await dispatch(walletLogin({ walletType })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: '钱包登录成功',
        message: `欢迎回来！`,
        duration: 3000,
      }));
      
      navigate(from, { replace: true });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: '钱包登录失败',
        message: error.message || '无法连接钱包，请重试',
        duration: 5000,
      }));
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // 第三方登录
  const handleSocialLogin = (provider) => {
    // 这里实现第三方登录逻辑
    dispatch(addNotification({
      type: 'info',
      title: '功能开发中',
      message: `${provider}登录功能即将上线`,
      duration: 3000,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">CultureBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            欢迎回来
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            登录您的账户继续文化之旅
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">登录账户</CardTitle>
            <CardDescription className="text-center">
              输入您的邮箱和密码登录
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 错误提示 */}
            {errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            {/* 登录表单 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="输入密码"
                    className="pl-10 pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="rounded border-gray-300"
                    {...register('rememberMe')}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    记住我
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  忘记密码？
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或者使用
                </span>
              </div>
            </div>

            {/* 钱包登录 */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleWalletLogin('metamask')}
                disabled={isWalletConnecting}
              >
                {isWalletConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                MetaMask钱包登录
              </Button>
            </div>

            {/* 第三方登录 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            {/* 注册链接 */}
            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                还没有账户？
              </span>
              <Link
                to="/register"
                className="text-primary hover:underline ml-1"
              >
                立即注册
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 帮助信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            登录即表示您同意我们的
            <a href="#" className="text-primary hover:underline mx-1">
              服务条款
            </a>
            和
            <a href="#" className="text-primary hover:underline ml-1">
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

