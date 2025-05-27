import React, { useState } from 'react';
import { useToken } from '../../context/token/TokenContext';
import { ethers } from 'ethers';
import '../../styles/token.css';

/**
 * 通证转账组件 - 允许用户向其他地址转账CULT通证
 */
const TokenTransfer = () => {
  const { 
    balance, 
    loading, 
    error, 
    success, 
    transfer, 
    clearMessages, 
    formatTokenAmount 
  } = useToken();
  
  // 表单状态
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState({
    recipient: '',
    amount: ''
  });
  
  // 验证表单
  const validateForm = () => {
    let isValid = true;
    const errors = {
      recipient: '',
      amount: ''
    };
    
    // 验证接收地址
    if (!recipient) {
      errors.recipient = '请输入接收地址';
      isValid = false;
    } else if (!ethers.utils.isAddress(recipient)) {
      errors.recipient = '无效的以太坊地址';
      isValid = false;
    }
    
    // 验证金额
    if (!amount) {
      errors.amount = '请输入转账金额';
      isValid = false;
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = '请输入有效的金额';
      isValid = false;
    } else if (parseFloat(amount) > parseFloat(balance)) {
      errors.amount = '余额不足';
      isValid = false;
    }
    
    setFormError(errors);
    return isValid;
  };
  
  // 处理转账
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // 清除之前的消息
    clearMessages();
    
    // 验证表单
    if (!validateForm()) return;
    
    // 执行转账
    await transfer(recipient, amount);
    
    // 成功后清空表单
    if (!error) {
      setRecipient('');
      setAmount('');
    }
  };
  
  return (
    <div className="token-transfer-card">
      <h3>转账CULT通证</h3>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}
      
      <form onSubmit={handleTransfer} className="token-transfer-form">
        <div className="form-group">
          <label htmlFor="recipient">接收地址</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={loading}
          />
          {formError.recipient && (
            <p className="field-error">{formError.recipient}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">金额</label>
          <div className="amount-input-container">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={loading}
            />
            <span className="amount-symbol">CULT</span>
          </div>
          {formError.amount && (
            <p className="field-error">{formError.amount}</p>
          )}
          <p className="balance-info">
            可用余额: {formatTokenAmount(balance)} CULT
          </p>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAmount(balance)}
            disabled={loading || parseFloat(balance) <= 0}
          >
            全部
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                处理中...
              </>
            ) : (
              '转账'
            )}
          </button>
        </div>
      </form>
      
      <div className="transfer-note">
        <p>
          <i className="fas fa-info-circle"></i>
          转账前请仔细核对接收地址，转账一旦完成无法撤销。
        </p>
      </div>
    </div>
  );
};

export default TokenTransfer;
