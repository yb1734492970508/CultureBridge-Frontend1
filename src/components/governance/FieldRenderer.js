import React from 'react';
import TextInput from './fields/TextInput';
import TextArea from './fields/TextArea';
import RichTextEditor from './fields/RichTextEditor';
import NumberInput from './fields/NumberInput';
import SelectInput from './fields/SelectInput';
import DateInput from './fields/DateInput';
import FileUpload from './fields/FileUpload';
import TeamInfoField from './fields/TeamInfoField';
import TimelineField from './fields/TimelineField';
import BudgetField from './fields/BudgetField';
import MetricsField from './fields/MetricsField';
import './FieldRenderer.css';

/**
 * 字段渲染器组件
 * 根据字段类型渲染相应的输入组件
 */
const FieldRenderer = ({ 
  field, 
  value, 
  error, 
  onChange, 
  disabled = false,
  className = ""
}) => {
  const {
    id,
    type,
    label,
    placeholder,
    required,
    helpText,
    validation,
    options,
    ...fieldProps
  } = field;

  // 通用字段属性
  const commonProps = {
    id,
    value: value || '',
    onChange,
    disabled,
    error,
    required,
    placeholder,
    ...fieldProps
  };

  // 渲染字段标签
  const renderLabel = () => (
    <label htmlFor={id} className="field-label">
      {label}
      {required && <span className="required-indicator">*</span>}
    </label>
  );

  // 渲染帮助文本
  const renderHelpText = () => {
    if (!helpText) return null;
    
    return (
      <div className="field-help">
        <span className="help-icon">💡</span>
        <span className="help-text">{helpText}</span>
      </div>
    );
  };

  // 渲染错误信息
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="field-error">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{error}</span>
      </div>
    );
  };

  // 根据字段类型渲染输入组件
  const renderInput = () => {
    switch (type) {
      case 'text':
        return <TextInput {...commonProps} />;
      
      case 'textarea':
        return <TextArea {...commonProps} />;
      
      case 'richtext':
        return <RichTextEditor {...commonProps} />;
      
      case 'number':
        return <NumberInput {...commonProps} />;
      
      case 'select':
        return <SelectInput {...commonProps} options={options} />;
      
      case 'date':
        return <DateInput {...commonProps} />;
      
      case 'file':
        return <FileUpload {...commonProps} />;
      
      case 'team':
        return <TeamInfoField {...commonProps} />;
      
      case 'timeline':
        return <TimelineField {...commonProps} />;
      
      case 'budget':
        return <BudgetField {...commonProps} />;
      
      case 'metrics':
        return <MetricsField {...commonProps} />;
      
      default:
        console.warn(`未知的字段类型: ${type}`);
        return <TextInput {...commonProps} />;
    }
  };

  return (
    <div className={`field-renderer field-${type} ${error ? 'has-error' : ''} ${className}`}>
      {renderLabel()}
      {renderHelpText()}
      <div className="field-input-container">
        {renderInput()}
      </div>
      {renderError()}
    </div>
  );
};

export default FieldRenderer;

