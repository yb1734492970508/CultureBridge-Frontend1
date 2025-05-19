import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * 路由守卫组件
 * 用于保护需要认证的路由
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 * @param {boolean} props.requireAuth - 是否需要认证
 * @param {string} props.redirectTo - 未认证时重定向路径
 */
const RouteGuard = ({ children, requireAuth = false, redirectTo = '/' }) => {
  const navigate = useNavigate();
  
  // 模拟用户认证状态，后续将从Context中获取
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // 如果需要认证但用户未认证，则重定向
  React.useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [requireAuth, isAuthenticated, navigate, redirectTo]);
  
  // 如果不需要认证或用户已认证，则渲染子组件
  return requireAuth && !isAuthenticated ? null : children;
};

/**
 * 动态路由参数处理Hook
 * 用于获取和处理路由参数
 * @returns {Object} 路由参数对象
 */
export const useRouteParams = () => {
  const params = useParams();
  return params;
};

export default RouteGuard;
