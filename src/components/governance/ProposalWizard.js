import React, { useState, useEffect } from 'react';
import { useProposalWizard } from '../../hooks/useProposalWizard';
import FieldRenderer from './FieldRenderer';
import WizardNavigation from './WizardNavigation';
import './ProposalWizard.css';

/**
 * 提案创建向导组件
 * 提供分步骤的提案创建流程
 */
const ProposalWizard = ({ 
  template, 
  initialData = {},
  onComplete,
  onCancel,
  onSaveDraft,
  className = ""
}) => {
  const {
    currentStep,
    totalSteps,
    formData,
    validationErrors,
    isValid,
    progress,
    nextStep,
    previousStep,
    goToStep,
    updateField,
    validateStep,
    saveDraft,
    submitProposal
  } = useProposalWizard(template, initialData);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // 自动保存草稿
  useEffect(() => {
    if (autoSaveEnabled && Object.keys(formData).length > 0) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // 30秒自动保存

      return () => clearTimeout(timer);
    }
  }, [formData, autoSaveEnabled, saveDraft]);

  // 获取当前步骤的字段
  const getCurrentStepFields = () => {
    if (!template?.steps || !template.steps[currentStep]) {
      return [];
    }
    return template.steps[currentStep].fields || [];
  };

  // 获取步骤标题
  const getStepTitle = () => {
    if (!template?.steps || !template.steps[currentStep]) {
      return '提案创建';
    }
    return template.steps[currentStep].title;
  };

  // 获取步骤描述
  const getStepDescription = () => {
    if (!template?.steps || !template.steps[currentStep]) {
      return '';
    }
    return template.steps[currentStep].description;
  };

  // 处理字段值变更
  const handleFieldChange = (fieldId, value) => {
    updateField(fieldId, value);
  };

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

  // 处理跳转到指定步骤
  const handleGoToStep = (stepIndex) => {
    goToStep(stepIndex);
  };

  // 处理保存草稿
  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      if (onSaveDraft) {
        onSaveDraft(formData);
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  };

  // 处理提交提案
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const proposal = await submitProposal();
      if (onComplete) {
        onComplete(proposal);
      }
    } catch (error) {
      console.error('提交提案失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (window.confirm('确定要取消创建提案吗？未保存的更改将丢失。')) {
      if (onCancel) {
        onCancel();
      }
    }
  };

  // 渲染预览模式
  const renderPreview = () => {
    return (
      <div className="proposal-preview">
        <div className="preview-header">
          <h2>提案预览</h2>
          <button
            className="close-preview"
            onClick={() => setShowPreview(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="preview-content">
          <div className="preview-section">
            <h3>基本信息</h3>
            <div className="preview-field">
              <label>提案标题：</label>
              <span>{formData.title || '未填写'}</span>
            </div>
            <div className="preview-field">
              <label>提案类型：</label>
              <span>{template.name}</span>
            </div>
          </div>

          {template.steps?.map((step, stepIndex) => (
            <div key={stepIndex} className="preview-section">
              <h3>{step.title}</h3>
              {step.fields?.map(field => (
                <div key={field.id} className="preview-field">
                  <label>{field.label}：</label>
                  <span>
                    {formData[field.id] || '未填写'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="preview-actions">
          <button
            className="preview-button secondary"
            onClick={() => setShowPreview(false)}
          >
            继续编辑
          </button>
          <button
            className="preview-button primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交提案'}
          </button>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return (
      <div className={`proposal-wizard preview-mode ${className}`}>
        {renderPreview()}
      </div>
    );
  }

  return (
    <div className={`proposal-wizard ${className}`}>
      {/* 向导头部 */}
      <div className="wizard-header">
        <div className="wizard-content">
          <h1 className="wizard-title">{template.name}</h1>
          <p className="wizard-subtitle">{template.description}</p>
          
          {/* 进度条 */}
          <div className="wizard-progress">
            <div 
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 步骤指示器 */}
          <div className="wizard-steps">
            {template.steps?.map((step, index) => (
              <div
                key={index}
                className={`wizard-step ${
                  index === currentStep ? 'active' : 
                  index < currentStep ? 'completed' : ''
                }`}
                onClick={() => handleGoToStep(index)}
              >
                <div className="step-number">
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="step-label">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 向导主体 */}
      <div className="wizard-body">
        <div className="wizard-content">
          {/* 当前步骤信息 */}
          <div className="step-header">
            <h2 className="step-title">{getStepTitle()}</h2>
            <p className="step-description">{getStepDescription()}</p>
          </div>

          {/* 字段渲染区域 */}
          <div className="step-fields">
            {getCurrentStepFields().map(field => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                error={validationErrors[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
              />
            ))}
          </div>

          {/* 步骤验证错误 */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="step-errors">
              <h4>请修正以下错误：</h4>
              <ul>
                {Object.entries(validationErrors).map(([fieldId, error]) => (
                  <li key={fieldId}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 向导导航 */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPreview={() => setShowPreview(true)}
        onCancel={handleCancel}
        showPreview={currentStep === totalSteps - 1}
      />

      {/* 自动保存指示器 */}
      <div className="auto-save-indicator">
        <label className="auto-save-toggle">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
          />
          <span>自动保存草稿</span>
        </label>
        <span className="save-status">
          {autoSaveEnabled ? '已启用自动保存' : '已禁用自动保存'}
        </span>
      </div>
    </div>
  );
};

export default ProposalWizard;

