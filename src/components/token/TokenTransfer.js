import React, { useState } from 'react';
import { useToken } from '../../context/token/TokenContext';
import { ethers } from 'ethers';
import '../../styles/token.css';

/**
 * 文化通证转账组件
 * 允许用户向其他地址转账代币
 */
const TokenTransfer = ({ onTransferComplete }) => {
  const { balance, transfer, isLoading } = useToken();
  
  // 表单状态
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  
  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    // 验证接收地址
    if (!recipient) {
      newErrors.recipient = '请输入接收地址';
    } else if (!ethers.utils.isAddress(recipient)) {
      newErrors.recipient = '请输入有效的以太坊地址';
    }
    
    // 验证金额
    if (!amount) {
      newErrors.amount = '请输入转账金额';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = '请输入有效的金额';
    } else if (parseFloat(amount) > parseFloat(balance)) {
      newErrors.amount = '余额不足';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理转账
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await transfer(recipient, amount);
    
    if (result.success) {
      // 清空表单
      setRecipient('');
      setAmount('');
      
      // 通知父组件转账完成
      if (onTransferComplete) {
        onTransferComplete();
      }
    }
  };
  
  // 设置最大金额
  const setMaxAmount = () => {
    setAmount(balance);
    // 清除金额错误
    setErrors(prev => ({ ...prev, amount: undefined }));
  };
  
  return (
    <div className="transfer-form-container">
      <h3 className="token-section-title">转账代币</h3>
      
      <form className="transfer-form" onSubmit={handleTransfer}>
        <div className="form-group">
          <label htmlFor="recipient">接收地址</label>
          <input
            type="text"
            id="recipient"
            className={`form-control ${errors.recipient ? 'error' : ''}`}
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              // 清除地址错误
              if (errors.recipient) {
                setErrors(prev => ({ ...prev, recipient: undefined }));
              }
            }}
            placeholder="输入有效的以太坊地址"
            disabled={isLoading}
          />
          {errors.recipient && <div className="form-error">{errors.recipient}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">金额</label>
          <div className="amount-input-container" style={{ position: 'relative' }}>
            <input
              type="text"
              id="amount"
              className={`form-control ${errors.amount ? 'error' : ''}`}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                // 清除金额错误
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: undefined }));
                }
              }}
              placeholder="输入转账金额"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="max-btn"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#1890ff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              disabled={isLoading}
            >
              最大
            </button>
          </div>
          {errors.amount && <div className="form-error">{errors.amount}</div>}
          <div className="balance-hint" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            可用余额: {balance} CULT
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="token-btn primary-btn"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '转账'}
          </button>
        </div>
      </form>
      
      <div className="transfer-tips" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>转账提示</h4>
        <ul style={{ paddingLeft: '20px' }}>
          <li>转账前请仔细核对接收地址</li>
          <li>转账将消耗少量gas费用</li>
          <li>转账完成后无法撤销</li>
          <li>大额转账建议先进行小额测试</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenTransfer;
