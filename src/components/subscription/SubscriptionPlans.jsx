/**
 * 订阅管理组件
 * 处理用户订阅计划的展示、购买和管理
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CreditCard, 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Users, 
  MessageCircle,
  Brain,
  Award,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userSubscription, setUserSubscription] = useState(null);
  
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchSubscriptionPlans();
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch(`/api/subscription/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setUserSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      // 跳转到登录页面
      return;
    }

    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan: plan.plan,
          billing_cycle: billingCycle
        })
      });

      const data = await response.json();
      if (data.success) {
        setUserSubscription(data.data);
        // 显示成功消息
        alert('订阅成功！');
      } else {
        alert('订阅失败：' + data.error);
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('订阅失败，请稍后重试');
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'free':
        return <Users className="w-8 h-8 text-gray-500" />;
      case 'basic':
        return <MessageCircle className="w-8 h-8 text-blue-500" />;
      case 'premium':
        return <Crown className="w-8 h-8 text-purple-500" />;
      case 'enterprise':
        return <Star className="w-8 h-8 text-yellow-500" />;
      default:
        return <Users className="w-8 h-8 text-gray-500" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'free':
        return 'border-gray-200 bg-white';
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'premium':
        return 'border-purple-200 bg-purple-50 ring-2 ring-purple-500';
      case 'enterprise':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const isCurrentPlan = (planType) => {
    return userSubscription && userSubscription.plan === planType;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 标题部分 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          选择适合您的订阅计划
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          解锁更多功能，加速您的语言学习之旅
        </p>
        
        {/* 计费周期切换 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                billingCycle === 'monthly'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              按月付费
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors relative",
                billingCycle === 'yearly'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              按年付费
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                省20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 订阅计划卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.plan}
            className={cn(
              "rounded-lg border-2 p-6 relative transition-all duration-200 hover:shadow-lg",
              getPlanColor(plan.plan),
              plan.plan === 'premium' && "transform scale-105"
            )}
          >
            {/* 推荐标签 */}
            {plan.plan === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  推荐
                </span>
              </div>
            )}

            {/* 计划图标和名称 */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                {getPlanIcon(plan.plan)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {plan.description}
              </p>
            </div>

            {/* 价格 */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">
                ¥{billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
              </div>
              <div className="text-gray-600 text-sm">
                {billingCycle === 'monthly' ? '每月' : '每年'}
              </div>
              {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                <div className="text-green-600 text-sm mt-1">
                  节省 ¥{(plan.price_monthly * 12 - plan.price_yearly).toFixed(0)}
                </div>
              )}
            </div>

            {/* 功能列表 */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {feature.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 限制信息 */}
            <div className="space-y-2 mb-6 text-xs text-gray-600">
              {plan.limits.ai_tutor_hours > 0 && (
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  AI导师：{plan.limits.ai_tutor_hours}小时/月
                </div>
              )}
              {plan.limits.premium_circles > 0 && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  专属圈子：{plan.limits.premium_circles}个
                </div>
              )}
              {plan.limits.content_downloads > 0 && (
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  内容下载：{plan.limits.content_downloads}次/月
                </div>
              )}
            </div>

            {/* 订阅按钮 */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={isCurrentPlan(plan.plan)}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium transition-colors",
                isCurrentPlan(plan.plan)
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.plan === 'premium'
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              {isCurrentPlan(plan.plan) ? '当前计划' : '选择此计划'}
            </button>
          </div>
        ))}
      </div>

      {/* 功能对比表 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            功能详细对比
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  功能
                </th>
                {plans.map((plan) => (
                  <th key={plan.plan} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI个人导师
                </td>
                {plans.map((plan) => (
                  <td key={plan.plan} className="px-6 py-4 whitespace-nowrap text-center">
                    {plan.limits.ai_tutor_hours > 0 ? (
                      <span className="text-green-600 font-medium">
                        {plan.limits.ai_tutor_hours}小时/月
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  专属交流圈
                </td>
                {plans.map((plan) => (
                  <td key={plan.plan} className="px-6 py-4 whitespace-nowrap text-center">
                    {plan.limits.premium_circles > 0 ? (
                      <span className="text-green-600 font-medium">
                        {plan.limits.premium_circles}个
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  优先客服
                </td>
                {plans.map((plan) => (
                  <td key={plan.plan} className="px-6 py-4 whitespace-nowrap text-center">
                    {plan.limits.priority_support ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          常见问题
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-2">
              可以随时取消订阅吗？
            </h4>
            <p className="text-gray-600 text-sm">
              是的，您可以随时取消订阅。取消后，您仍可以使用高级功能直到当前计费周期结束。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-2">
              支持哪些支付方式？
            </h4>
            <p className="text-gray-600 text-sm">
              我们支持支付宝、微信支付、银行卡等多种支付方式，确保您的支付安全便捷。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-2">
              可以升级或降级计划吗？
            </h4>
            <p className="text-gray-600 text-sm">
              可以的，您可以随时升级到更高级的计划。降级将在下个计费周期生效。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-2">
              有免费试用吗？
            </h4>
            <p className="text-gray-600 text-sm">
              新用户可以免费试用高级版7天，体验所有高级功能后再决定是否订阅。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

