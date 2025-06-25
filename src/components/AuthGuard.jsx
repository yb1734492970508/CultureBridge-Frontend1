/**
 * 认证守卫组件
 * 保护需要登录才能访问的路由
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectAuth, selectIsAuthenticated, checkAuthStatus } from '../store/slices/authSlice';
import LoadingSpinner from './ui/LoadingSpinner';

const AuthGuard = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // 检查认证状态
    if (!auth.isChecked) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, auth.isChecked]);

  // 正在检查认证状态
  if (auth.isLoading || !auth.isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            验证登录状态...
          </div>
        </div>
      </div>
    );
  }

  // 需要认证但用户未登录
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 不需要认证但用户已登录（如登录页面）
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default AuthGuard;

