import React, { useState, useEffect } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import './DelegationManager.css';

/**
 * 委托管理组件
 * 用于管理用户的投票权委托
 */
const DelegationManager = () => {
  const { 
    delegateVote, 
    revokeDelegation, 
    loadCurrentDelegation, 
    currentDelegation, 
    votingPower, 
    isLoading, 
    error, 
    successMessage, 
    clearMessages 
  } = useDAO();
  const { account, active } = useBlockchain();
  
  // 状态
  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegateAmount, setDelegateAmount] = useState('');
  const [delegateEndTime, setDelegateEndTime] = useState('');
  const [delegateRestrictions, setDelegateRestrictions] = useState({
    categoryRestrictions: [],
    minVotingPower: '',
    maxProposals: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // 加载当前委托信息
  useEffect(() => {
    if (active && account) {
      loadCurrentDelegation();
    }
  }, [active, account, loadCurrentDelegation]);
  
  // 处理委托表单提交
  const handleDelegateSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    const errors = {};
    
    if (!delegateAddress.trim()) {
      errors.delegateAddress = '请输入委托地址';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress)) {
      errors.delegateAddress = '无效的以太坊地址';
    }
    
    if (delegateAmount && (isNaN(parseFloat(delegateAmount)) || parseFloat(delegateAmount) <= 0)) {
      errors.delegateAmount = '请输入有效的委托数量';
    }
    
    if (delegateEndTime) {
      const endTimeDate = new Date(delegateEndTime);
      if (isNaN(endTimeDate.getTime()) || endTimeDate <= new Date()) {
        errors.delegateEndTime = '请选择未来的日期和时间';
      }
    }
    
    if (delegateRestrictions.minVotingPower && 
        (isNaN(parseFloat(delegateRestrictions.minVotingPower)) || 
         parseFloat(delegateRestrictions.minVotingPower) < 0)) {
      errors.minVotingPower = '请输入有效的最小投票权重';
    }
    
    if (delegateRestrictions.maxProposals && 
        (isNaN(parseInt(delegateRestrictions.maxProposals)) || 
         parseInt(delegateRestrictions.maxProposals) <= 0)) {
      errors.maxProposals = '请输入有效的最大提案数量';
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // 准备委托参数
    const amount = delegateAmount ? delegateAmount : '0';
    const endTime = delegateEndTime ? Math.floor(new Date(delegateEndTime).getTime() / 1000).toString() : '0';
    const restrictions = {
      categoryRestrictions: delegateRestrictions.categoryRestrictions,
      minVotingPower: delegateRestrictions.minVotingPower || '0',
      maxProposals: delegateRestrictions.maxProposals || '0'
    };
    
    // 提交委托
    await delegateVote(delegateAddress, amount, endTime, restrictions);
  };
  
  // 处理撤销委托
  const handleRevokeDelegation = async () => {
    if (window.confirm('确定要撤销当前委托吗？')) {
      await revokeDelegation();
    }
  };
  
  // 处理类别限制变更
  const handleCategoryChange = (category, isChecked) => {
    setDelegateRestrictions(prev => {
      const updatedCategories = isChecked
        ? [...prev.categoryRestrictions, category]
        : prev.categoryRestrictions.filter(c => c !== category);
      
      return {
        ...prev,
        categoryRestrictions: updatedCategories
      };
    });
  };
  
  // 预定义类别
  const predefinedCategories = ['财务', '治理', '社区', '技术', '合作', '其他'];
  
  // 格式化日期时间
  const formatDateTime = (timestamp) => {
    if (!timestamp || timestamp === '0') return '无限期';
    
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="delegation-manager">
      <div className="delegation-header">
        <h2>投票权委托管理</h2>
        <p className="delegation-description">
          委托允许您将投票权授予其他地址，使其能够代表您参与DAO治理投票。
          您可以随时撤销委托或设置委托限制。
        </p>
      </div>
      
      {error && (
        <div className="delegation-error">
          <p>{error}</p>
          <button type="button" className="close-btn" onClick={clearMessages}>&times;</button>
        </div>
      )}
      
      {successMessage && (
        <div className="delegation-success">
          <p>{successMessage}</p>
          <button type="button" className="close-btn" onClick={clearMessages}>&times;</button>
        </div>
      )}
      
      <div className="delegation-content">
        {currentDelegation ? (
          <div className="current-delegation">
            <h3>当前委托</h3>
            
            <div className="delegation-info">
              <div className="info-row">
                <span className="info-label">委托地址:</span>
                <span className="info-value">{currentDelegation.delegatee}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">委托数量:</span>
                <span className="info-value">
                  {currentDelegation.amount === '0' ? '全部投票权' : `${currentDelegation.amount} 票`}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">到期时间:</span>
                <span className="info-value">{formatDateTime(currentDelegation.endTime)}</span>
              </div>
              
              {currentDelegation.restrictions && (
                <>
                  <div className="info-row">
                    <span className="info-label">类别限制:</span>
                    <span className="info-value">
                      {currentDelegation.restrictions.categoryRestrictions.length > 0
                        ? currentDelegation.restrictions.categoryRestrictions.join(', ')
                        : '无限制'}
                    </span>
                  </div>
                  
                  {currentDelegation.restrictions.minVotingPower !== '0' && (
                    <div className="info-row">
                      <span className="info-label">最小投票权重:</span>
                      <span className="info-value">{currentDelegation.restrictions.minVotingPower}</span>
                    </div>
                  )}
                  
                  {currentDelegation.restrictions.maxProposals !== '0' && (
                    <div className="info-row">
                      <span className="info-label">最大提案数量:</span>
                      <span className="info-value">{currentDelegation.restrictions.maxProposals}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <button 
              type="button"
              className="dao-btn danger-btn revoke-btn"
              onClick={handleRevokeDelegation}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '撤销委托'}
            </button>
          </div>
        ) : (
          <div className="new-delegation">
            <h3>创建新委托</h3>
            
            <form onSubmit={handleDelegateSubmit}>
              <div className="form-group">
                <label htmlFor="delegate-address">委托地址 <span className="required-mark">*</span></label>
                <input 
                  type="text"
                  id="delegate-address"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                  placeholder="输入接收委托的以太坊地址"
                  className={formErrors.delegateAddress ? 'input-error' : ''}
                />
                {formErrors.delegateAddress && <p className="error-message">{formErrors.delegateAddress}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="delegate-amount">委托数量</label>
                <input 
                  type="text"
                  id="delegate-amount"
                  value={delegateAmount}
                  onChange={(e) => setDelegateAmount(e.target.value)}
                  placeholder="留空表示委托全部投票权"
                  className={formErrors.delegateAmount ? 'input-error' : ''}
                />
                {formErrors.delegateAmount && <p className="error-message">{formErrors.delegateAmount}</p>}
                <p className="field-hint">您当前的投票权重: {votingPower}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="delegate-end-time">到期时间</label>
                <input 
                  type="datetime-local"
                  id="delegate-end-time"
                  value={delegateEndTime}
                  onChange={(e) => setDelegateEndTime(e.target.value)}
                  className={formErrors.delegateEndTime ? 'input-error' : ''}
                />
                {formErrors.delegateEndTime && <p className="error-message">{formErrors.delegateEndTime}</p>}
                <p className="field-hint">留空表示无限期委托，直到手动撤销</p>
              </div>
              
              <div className="advanced-toggle">
                <button 
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
                </button>
              </div>
              
              {showAdvanced && (
                <div className="advanced-options">
                  <div className="form-group">
                    <label>类别限制</label>
                    <div className="categories-container">
                      {predefinedCategories.map((category, index) => (
                        <label key={index} className="category-checkbox">
                          <input 
                            type="checkbox"
                            checked={delegateRestrictions.categoryRestrictions.includes(category)}
                            onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                    <p className="field-hint">选择委托人可以代表您投票的提案类别，不选择表示无限制</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="min-voting-power">最小投票权重</label>
                    <input 
                      type="text"
                      id="min-voting-power"
                      value={delegateRestrictions.minVotingPower}
                      onChange={(e) => setDelegateRestrictions(prev => ({
                        ...prev,
                        minVotingPower: e.target.value
                      }))}
                      placeholder="0"
                      className={formErrors.minVotingPower ? 'input-error' : ''}
                    />
                    {formErrors.minVotingPower && <p className="error-message">{formErrors.minVotingPower}</p>}
                    <p className="field-hint">要求委托人至少拥有指定数量的投票权重，0表示无限制</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="max-proposals">最大提案数量</label>
                    <input 
                      type="text"
                      id="max-proposals"
                      value={delegateRestrictions.maxProposals}
                      onChange={(e) => setDelegateRestrictions(prev => ({
                        ...prev,
                        maxProposals: e.target.value
                      }))}
                      placeholder="0"
                      className={formErrors.maxProposals ? 'input-error' : ''}
                    />
                    {formErrors.maxProposals && <p className="error-message">{formErrors.maxProposals}</p>}
                    <p className="field-hint">限制委托人可以代表您投票的最大提案数量，0表示无限制</p>
                  </div>
                </div>
              )}
              
              <div className="delegation-warning">
                <p>
                  <strong>注意:</strong> 委托投票权是一项重要决定，请确保您信任接收委托的地址。
                  您可以随时撤销委托或设置限制条件。
                </p>
              </div>
              
              <button 
                type="submit"
                className="dao-btn primary-btn delegate-btn"
                disabled={isLoading}
              >
                {isLoading ? '处理中...' : '委托投票权'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegationManager;
