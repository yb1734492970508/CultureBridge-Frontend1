import React, { useState, useCallback } from 'react';
import { useDelegationWizard } from '../../hooks/useDelegationWizard';
import DelegationTypeSelector from './DelegationTypeSelector';
import PowerAllocationSlider from './PowerAllocationSlider';
import DelegationConditions from './DelegationConditions';
import DelegationPreview from './DelegationPreview';
import './DelegationWizard.css';

/**
 * 委托配置向导组件
 * 提供分步骤的委托创建流程
 */
const DelegationWizard = ({ 
  delegate,
  userVotingPower,
  onComplete,
  onCancel,
  className = ""
}) => {
  const {
    currentStep,
    totalSteps,
    delegationConfig,
    validationErrors,
    isValid,
    progress,
    nextStep,
    previousStep,
    updateConfig,
    validateStep,
    createDelegation
  } = useDelegationWizard(delegate, userVotingPower);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 步骤配置
  const steps = [
    {
      id: 'type',
      title: '选择委托类型',
      description: '选择最适合您需求的委托方式',
      component: DelegationTypeSelector
    },
    {
      id: 'power',
      title: '分配投票权',
      description: '设置要委托的投票权数量',
      component: PowerAllocationSlider
    },
    {
      id: 'conditions',
      title: '设置委托条件',
      description: '配置委托的限制和条件',
      component: DelegationConditions
    },
    {
      id: 'preview',
      title: '确认委托',
      description: '预览并确认您的委托配置',
      component: DelegationPreview
    }
  ];

  // 获取当前步骤配置
  const getCurrentStep = () => {
    return steps[currentStep] || steps[0];
  };

  // 处理配置更新
  const handleConfigUpdate = useCallback((updates) => {
    updateConfig(updates);
  }, [updateConfig]);

  // 处理下一步
  const handleNext = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      nextStep();
    }
  };

  // 处理上一步
  const handlePrevious = () => {
    previousStep();
  };

  // 处理提交委托
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const delegation = await createDelegation();
      if (onComplete) {
        onComplete(delegation);
      }
    } catch (error) {
      console.error('创建委托失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (window.confirm('确定要取消创建委托吗？')) {
      if (onCancel) {
        onCancel();
      }
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    const step = getCurrentStep();
    const StepComponent = step.component;

    const commonProps = {
      config: delegationConfig,
      delegate,
      userVotingPower,
      errors: validationErrors,
      onChange: handleConfigUpdate
    };

    return <StepComponent {...commonProps} />;
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="wizard-steps">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`wizard-step ${
            index === currentStep ? 'active' : 
            index < currentStep ? 'completed' : ''
          }`}
        >
          <div className="step-circle">
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className="step-info">
            <div className="step-title">{step.title}</div>
            <div className="step-description">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染导航按钮
  const renderNavigation = () => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return (
      <div className="wizard-navigation">
        <div className="nav-left">
          {!isFirstStep && (
            <button
              className="nav-button secondary"
              onClick={handlePrevious}
            >
              <span className="button-icon">←</span>
              上一步
            </button>
          )}
        </div>

        <div className="nav-center">
          <button
            className="nav-button tertiary"
            onClick={handleCancel}
          >
            取消
          </button>
        </div>

        <div className="nav-right">
          {!isLastStep ? (
            <button
              className="nav-button primary"
              onClick={handleNext}
              disabled={!isValid}
            >
              下一步
              <span className="button-icon">→</span>
            </button>
          ) : (
            <button
              className="nav-button primary"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner small" />
                  创建中...
                </>
              ) : (
                <>
                  <span className="button-icon">✓</span>
                  创建委托
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`delegation-wizard ${className}`}>
      {/* 向导头部 */}
      <div className="wizard-header">
        <div className="header-content">
          <h1 className="wizard-title">创建委托</h1>
          <p className="wizard-subtitle">
            委托给 <strong>{delegate.identity.name}</strong>
          </p>
          
          {/* 进度条 */}
          <div className="wizard-progress">
            <div 
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
            <div className="progress-text">
              步骤 {currentStep + 1} / {totalSteps}
            </div>
          </div>
        </div>

        {/* 代表信息卡片 */}
        <div className="delegate-info-card">
          <img
            src={delegate.identity.avatar}
            alt={delegate.identity.name}
            className="delegate-avatar"
          />
          <div className="delegate-details">
            <h3 className="delegate-name">{delegate.identity.name}</h3>
            <div className="delegate-stats">
              <span className="stat-item">
                <span className="stat-value">{delegate.statistics.performanceScore}</span>
                <span className="stat-label">评分</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{Math.round(delegate.statistics.participationRate * 100)}%</span>
                <span className="stat-label">参与率</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{delegate.statistics.totalDelegations}</span>
                <span className="stat-label">委托数</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      {renderStepIndicator()}

      {/* 步骤内容 */}
      <div className="wizard-content">
        <div className="step-container">
          <div className="step-header">
            <h2 className="step-title">{getCurrentStep().title}</h2>
            <p className="step-description">{getCurrentStep().description}</p>
          </div>
          
          <div className="step-body">
            {renderStepContent()}
          </div>

          {/* 验证错误 */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="step-errors">
              <h4>请修正以下错误：</h4>
              <ul>
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 导航区域 */}
      {renderNavigation()}

      {/* 帮助提示 */}
      <div className="wizard-help">
        <div className="help-content">
          <span className="help-icon">💡</span>
          <span className="help-text">
            {currentStep === 0 && "选择适合您需求的委托类型。全权委托适合完全信任的代表，部分委托可以保留部分控制权。"}
            {currentStep === 1 && "设置要委托的投票权数量。您可以委托部分或全部投票权。"}
            {currentStep === 2 && "配置委托条件和限制，如期限、适用范围等。这些条件将自动执行。"}
            {currentStep === 3 && "最后确认您的委托配置。提交后将在区块链上创建委托合约。"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DelegationWizard;

