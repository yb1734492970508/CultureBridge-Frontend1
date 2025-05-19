import React from 'react';
import '../../styles/variables.css';
import './Input.css';

/**
 * 输入框组件
 * @param {Object} props - 组件属性
 * @param {string} [props.type='text'] - 输入类型
 * @param {string} [props.variant='outline'] - 输入框变体: 'outline', 'filled', 'underline'
 * @param {string} [props.size='medium'] - 输入框尺寸: 'small', 'medium', 'large'
 * @param {string} props.id - 输入框ID
 * @param {string} props.name - 输入框名称
 * @param {string} props.value - 输入框值
 * @param {string} [props.placeholder] - 占位文本
 * @param {string} [props.label] - 标签文本
 * @param {string} [props.helperText] - 辅助文本
 * @param {string} [props.errorText] - 错误文本
 * @param {boolean} [props.disabled=false] - 是否禁用
 * @param {boolean} [props.readOnly=false] - 是否只读
 * @param {boolean} [props.required=false] - 是否必填
 * @param {Function} props.onChange - 值变化事件处理函数
 * @param {Function} [props.onFocus] - 获取焦点事件处理函数
 * @param {Function} [props.onBlur] - 失去焦点事件处理函数
 * @param {string} [props.icon] - 图标名称（如果有）
 * @param {string} [props.iconPosition='left'] - 图标位置: 'left', 'right'
 */
const Input = ({
  type = 'text',
  variant = 'outline',
  size = 'medium',
  id,
  name,
  value,
  placeholder,
  label,
  helperText,
  errorText,
  disabled = false,
  readOnly = false,
  required = false,
  onChange,
  onFocus,
  onBlur,
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  const hasError = !!errorText;
  
  const inputClasses = [
    'cb-input',
    `cb-input--${variant}`,
    `cb-input--${size}`,
    disabled ? 'cb-input--disabled' : '',
    readOnly ? 'cb-input--readonly' : '',
    hasError ? 'cb-input--error' : '',
    icon ? `cb-input--with-icon-${iconPosition}` : ''
  ].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    'cb-input-wrapper',
    hasError ? 'cb-input-wrapper--error' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={inputWrapperClasses}>
      {label && (
        <label htmlFor={id} className="cb-input__label">
          {label}
          {required && <span className="cb-input__required">*</span>}
        </label>
      )}
      
      <div className="cb-input__container">
        {icon && iconPosition === 'left' && (
          <span className="cb-input__icon cb-input__icon--left">{icon}</span>
        )}
        
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={helperText ? `${id}-helper` : undefined}
          {...rest}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="cb-input__icon cb-input__icon--right">{icon}</span>
        )}
      </div>
      
      {(helperText || errorText) && (
        <div 
          id={`${id}-helper`}
          className={`cb-input__helper-text ${hasError ? 'cb-input__helper-text--error' : ''}`}
        >
          {errorText || helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
