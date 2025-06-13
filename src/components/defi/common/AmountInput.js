import React, { useState, useEffect } from 'react';
import './AmountInput.css';

/**
 * 金额输入组件
 * 支持数值验证、格式化和最大值设置
 */
const AmountInput = ({
  value,
  onChange,
  placeholder = '0.0',
  className = '',
  readOnly = false,
  maxValue = null,
  decimals = 18,
  showMaxButton = false,
  onMaxClick = null,
  disabled = false,
  error = '',
  label = '',
  balance = null,
  tokenSymbol = ''
}) => {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  // 同步外部值变化
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // 验证输入值
  const validateInput = (inputValue) => {
    // 移除非数字和小数点字符
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    
    // 确保只有一个小数点
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 限制小数位数
    if (parts.length === 2 && parts[1].length > decimals) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, decimals);
    }
    
    // 移除开头的多个零
    if (cleanValue.startsWith('00')) {
      cleanValue = cleanValue.substring(1);
    }
    
    // 如果只有小数点，添加前导零
    if (cleanValue === '.') {
      cleanValue = '0.';
    }
    
    return cleanValue;
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    if (readOnly || disabled) return;
    
    const inputValue = e.target.value;
    const validatedValue = validateInput(inputValue);
    
    // 检查最大值限制
    if (maxValue && parseFloat(validatedValue) > parseFloat(maxValue)) {
      return;
    }
    
    setLocalValue(validatedValue);
    onChange(validatedValue);
  };

  // 处理焦点事件
  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    
    // 格式化值（移除末尾的小数点）
    let formattedValue = localValue;
    if (formattedValue.endsWith('.')) {
      formattedValue = formattedValue.slice(0, -1);
    }
    
    if (formattedValue !== localValue) {
      setLocalValue(formattedValue);
      onChange(formattedValue);
    }
  };

  // 处理最大值按钮点击
  const handleMaxClick = () => {
    if (onMaxClick) {
      onMaxClick();
    } else if (maxValue) {
      const maxVal = maxValue.toString();
      setLocalValue(maxVal);
      onChange(maxVal);
    }
  };

  // 格式化显示余额
  const formatBalance = (balance) => {
    if (!balance) return '0';
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  };

  // 检查输入是否有效
  const isValidInput = () => {
    if (!localValue) return true;
    const num = parseFloat(localValue);
    return !isNaN(num) && num >= 0;
  };

  // 检查是否超出余额
  const isExceedingBalance = () => {
    if (!balance || !localValue) return false;
    return parseFloat(localValue) > parseFloat(balance);
  };

  return (
    <div className={`amount-input-container ${className}`}>
      {/* 标签和余额 */}
      {(label || balance !== null) && (
        <div className="amount-input-header">
          {label && <span className="amount-input-label">{label}</span>}
          {balance !== null && (
            <div className="balance-info">
              <span className="balance-text">
                余额: {formatBalance(balance)} {tokenSymbol}
              </span>
              {showMaxButton && balance && parseFloat(balance) > 0 && (
                <button
                  type="button"
                  className="max-button"
                  onClick={handleMaxClick}
                  disabled={disabled}
                >
                  MAX
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 输入框容器 */}
      <div 
        className={`amount-input-wrapper ${focused ? 'focused' : ''} ${
          error || !isValidInput() || isExceedingBalance() ? 'error' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="amount-input"
          readOnly={readOnly}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* 最大值按钮（内联） */}
        {showMaxButton && !label && balance && parseFloat(balance) > 0 && (
          <button
            type="button"
            className="max-button-inline"
            onClick={handleMaxClick}
            disabled={disabled}
          >
            MAX
          </button>
        )}
      </div>

      {/* 错误信息和验证提示 */}
      <div className="amount-input-footer">
        {error && (
          <span className="error-message">{error}</span>
        )}
        
        {!error && !isValidInput() && localValue && (
          <span className="error-message">请输入有效的数字</span>
        )}
        
        {!error && isValidInput() && isExceedingBalance() && (
          <span className="error-message">金额超出可用余额</span>
        )}
        
        {!error && isValidInput() && !isExceedingBalance() && localValue && (
          <div className="input-info">
            {/* 显示USD等值（如果有价格数据） */}
            {/* 这里可以添加USD等值显示逻辑 */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmountInput;

