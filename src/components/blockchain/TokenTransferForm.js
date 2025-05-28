import React, { useContext, useState } from 'react';
import { TokenContext } from '../../context/blockchain/TokenContext';
import { BlockchainContext } from '../../context/blockchain';
import './TokenTransfer.css';

/**
 * 文化通证转账组件
 * 允许用户向其他地址转账CULT通证
 */
const TokenTransferForm = () => {
  const { userBalance, transferTokens, isLoading, error } = useContext(TokenContext);
  const { isConnected } = useContext(BlockchainContext);
  
  // 表单状态
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setFormError('');
    setTxHash('');
    setTxSuccess(false);
    
    // 表单验证
    if (!recipient) {
      setFormError('请输入接收地址');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('请输入有效的转账金额');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(userBalance)) {
      setFormError('余额不足');
      return;
    }
    
    // 地址格式验证
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setFormError('无效的以太坊地址格式');
      return;
    }
    
    try {
      // 执行转账
      const tx = await transferTokens(recipient, amount);
      setTxHash(tx.hash);
      setTxSuccess(true);
      
      // 清空表单
      setRecipient('');
      setAmount('');
    } catch (err) {
      console.error('转账失败:', err);
      setFormError(err.message || '转账失败，请重试');
    }
  };
  
  return (
    <div className="token-transfer-container">
      <h2>转账文化通证</h2>
      
      {!isConnected ? (
        <div className="token-transfer-not-connected">
          <p>请连接钱包使用转账功能</p>
        </div>
      ) : (
        <>
          <div className="token-transfer-balance">
            <p>可用余额: <span>{parseFloat(userBalance).toFixed(2)} CULT</span></p>
          </div>
          
          <form className="token-transfer-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="recipient">接收地址</label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">转账金额</label>
              <div className="amount-input-container">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
                <span className="amount-symbol">CULT</span>
              </div>
            </div>
            
            {formError && (
              <div className="token-transfer-error">
                <p>{formError}</p>
              </div>
            )}
            
            {error && (
              <div className="token-transfer-error">
                <p>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="token-transfer-button"
              disabled={isLoading || !isConnected}
            >
              {isLoading ? '处理中...' : '转账'}
            </button>
          </form>
          
          {txSuccess && (
            <div className="token-transfer-success">
              <p>转账成功!</p>
              <p>
                交易哈希: 
                <a 
                  href={`https://etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {`${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`}
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TokenTransferForm;
