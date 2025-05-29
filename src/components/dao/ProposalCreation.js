import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import { useToken } from '../../context/token/TokenContext';
import '../../styles/dao.css';

/**
 * 提案创建组件
 * 提供用户创建治理提案的界面
 */
const ProposalCreation = () => {
  const navigate = useNavigate();
  const { account, active, library, chainId } = useBlockchain();
  const { userReputation } = useIdentity();
  const { tokenBalance, getVotingPower } = useToken();
  const { submitProposal, isLoading, error, clearMessages } = useDAO();
  
  // 本地状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState([{ target: '', value: '0', calldata: '' }]);
  const [currentStep, setCurrentStep] = useState(1);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [proposalId, setProposalId] = useState(null);
  
  // 检查提案创建资格
  const checkEligibility = async () => {
    if (!active || !account) {
      setEligibilityError('请先连接钱包');
      setIsEligible(false);
      setEligibilityChecked(true);
      return;
    }
    
    try {
      // 获取用户代币余额和投票权重
      const votingPower = await getVotingPower(account);
      
      // 最低要求：持有至少1%的总供应量和60分以上的声誉
      const minVotingPower = 100; // 示例值，实际应从合约获取
      const minReputation = 60;
      
      if (votingPower < minVotingPower) {
        setEligibilityError(`代币余额不足，创建提案需要至少${minVotingPower}投票权重`);
        setIsEligible(false);
      } else if (userReputation < minReputation) {
        setEligibilityError(`声誉评分不足，创建提案需要至少${minReputation}分声誉`);
        setIsEligible(false);
      } else {
        setEligibilityError('');
        setIsEligible(true);
      }
      
      setEligibilityChecked(true);
    } catch (error) {
      console.error('检查资格失败:', error);
      setEligibilityError('检查资格失败，请稍后再试');
      setIsEligible(false);
      setEligibilityChecked(true);
    }
  };
  
  // 处理标题变更
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    validateField('title', e.target.value);
  };
  
  // 处理描述变更
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    validateField('description', e.target.value);
  };
  
  // 处理操作变更
  const handleActionChange = (index, field, value) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
    validateAction(index, field, value);
  };
  
  // 添加操作
  const addAction = () => {
    setActions([...actions, { target: '', value: '0', calldata: '' }]);
  };
  
  // 删除操作
  const removeAction = (index) => {
    if (actions.length > 1) {
      const newActions = [...actions];
      newActions.splice(index, 1);
      setActions(newActions);
    }
  };
  
  // 验证字段
  const validateField = (field, value) => {
    let errors = { ...formErrors };
    
    switch (field) {
      case 'title':
        if (!value.trim()) {
          errors.title = '标题不能为空';
        } else if (value.length > 100) {
          errors.title = '标题不能超过100个字符';
        } else {
          delete errors.title;
        }
        break;
      case 'description':
        if (!value.trim()) {
          errors.description = '描述不能为空';
        } else {
          delete errors.description;
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 验证操作
  const validateAction = (index, field, value) => {
    let errors = { ...formErrors };
    const actionErrors = errors.actions || [];
    
    if (!actionErrors[index]) {
      actionErrors[index] = {};
    }
    
    switch (field) {
      case 'target':
        if (!value.trim()) {
          actionErrors[index].target = '目标地址不能为空';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          actionErrors[index].target = '无效的以太坊地址';
        } else {
          delete actionErrors[index].target;
        }
        break;
      case 'value':
        if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
          actionErrors[index].value = '无效的ETH数量';
        } else {
          delete actionErrors[index].value;
        }
        break;
      case 'calldata':
        if (value && !/^0x[a-fA-F0-9]*$/.test(value)) {
          actionErrors[index].calldata = '无效的调用数据格式';
        } else {
          delete actionErrors[index].calldata;
        }
        break;
      default:
        break;
    }
    
    // 清理空对象
    if (Object.keys(actionErrors[index]).length === 0) {
      actionErrors.splice(index, 1);
    }
    
    if (actionErrors.length > 0) {
      errors.actions = actionErrors;
    } else {
      delete errors.actions;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 验证表单
  const validateForm = () => {
    let isValid = true;
    let errors = {};
    
    // 验证标题
    if (!title.trim()) {
      errors.title = '标题不能为空';
      isValid = false;
    } else if (title.length > 100) {
      errors.title = '标题不能超过100个字符';
      isValid = false;
    }
    
    // 验证描述
    if (!description.trim()) {
      errors.description = '描述不能为空';
      isValid = false;
    }
    
    // 验证操作
    const actionErrors = [];
    actions.forEach((action, index) => {
      const actionError = {};
      
      if (!action.target.trim()) {
        actionError.target = '目标地址不能为空';
        isValid = false;
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(action.target)) {
        actionError.target = '无效的以太坊地址';
        isValid = false;
      }
      
      if (isNaN(parseFloat(action.value)) || parseFloat(action.value) < 0) {
        actionError.value = '无效的ETH数量';
        isValid = false;
      }
      
      if (action.calldata && !/^0x[a-fA-F0-9]*$/.test(action.calldata)) {
        actionError.calldata = '无效的调用数据格式';
        isValid = false;
      }
      
      if (Object.keys(actionError).length > 0) {
        actionErrors[index] = actionError;
      }
    });
    
    if (actionErrors.length > 0) {
      errors.actions = actionErrors;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // 处理下一步
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateField('title', title) && validateField('description', description)) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      let isValid = true;
      actions.forEach((action, index) => {
        if (!validateAction(index, 'target', action.target) ||
            !validateAction(index, 'value', action.value) ||
            !validateAction(index, 'calldata', action.calldata)) {
          isValid = false;
        }
      });
      
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };
  
  // 处理上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmissionError('');
      
      // 准备提案数据
      const targets = actions.map(action => action.target);
      const values = actions.map(action => library.utils.parseEther(action.value).toString());
      const calldatas = actions.map(action => action.calldata || '0x');
      const fullDescription = `${title}\n\n${description}`;
      
      // 提交提案
      const result = await submitProposal(targets, values, calldatas, fullDescription);
      
      if (result.success) {
        setSubmissionSuccess(true);
        setProposalId(result.proposalId);
      } else {
        setSubmissionError(result.error || '创建提案失败');
      }
    } catch (error) {
      console.error('提交提案失败:', error);
      setSubmissionError(`提交提案失败: ${error.message}`);
    }
  };
  
  // 渲染资格检查步骤
  const renderEligibilityStep = () => {
    return (
      <div className="proposal-creation-step">
        <h2>创建提案资格检查</h2>
        <p className="step-description">
          创建提案需要满足以下条件：
        </p>
        <ul className="eligibility-requirements">
          <li>持有足够的代币（总供应量的1%以上）</li>
          <li>声誉评分达到60分以上</li>
          <li>账户年龄超过7天</li>
        </ul>
        
        {!eligibilityChecked ? (
          <button 
            onClick={checkEligibility} 
            className="dao-btn primary-btn"
            disabled={!active || isLoading}
          >
            检查资格
          </button>
        ) : isEligible ? (
          <div className="eligibility-result success">
            <p>✅ 您有资格创建提案</p>
            <button 
              onClick={() => setCurrentStep(1)} 
              className="dao-btn primary-btn"
            >
              开始创建提案
            </button>
          </div>
        ) : (
          <div className="eligibility-result error">
            <p>❌ {eligibilityError}</p>
            <button 
              onClick={checkEligibility} 
              className="dao-btn secondary-btn"
              disabled={isLoading}
            >
              重新检查
            </button>
          </div>
        )}
        
        {!active && (
          <div className="wallet-warning">
            <p>请先连接钱包以检查资格</p>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染基本信息步骤
  const renderBasicInfoStep = () => {
    return (
      <div className="proposal-creation-step">
        <h2>步骤 1: 提案基本信息</h2>
        <div className="form-group">
          <label htmlFor="proposal-title">提案标题</label>
          <input 
            type="text"
            id="proposal-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="输入简洁明了的提案标题"
            className={formErrors.title ? 'input-error' : ''}
          />
          {formErrors.title && <p className="error-message">{formErrors.title}</p>}
          <p className="char-count">{title.length}/100</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="proposal-description">提案描述</label>
          <textarea 
            id="proposal-description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="详细描述您的提案，包括背景、目标和预期结果"
            rows={10}
            className={formErrors.description ? 'input-error' : ''}
          />
          {formErrors.description && <p className="error-message">{formErrors.description}</p>}
        </div>
        
        <div className="form-actions">
          <button 
            onClick={() => setCurrentStep(0)} 
            className="dao-btn secondary-btn"
          >
            返回
          </button>
          <button 
            onClick={handleNextStep} 
            className="dao-btn primary-btn"
          >
            下一步
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染操作配置步骤
  const renderActionsStep = () => {
    return (
      <div className="proposal-creation-step">
        <h2>步骤 2: 提案操作配置</h2>
        <p className="step-description">
          配置提案通过后要执行的操作。如果只是文本提案，可以保留默认操作。
        </p>
        
        {actions.map((action, index) => (
          <div key={index} className="action-config">
            <h3>操作 #{index + 1}</h3>
            
            <div className="form-group">
              <label htmlFor={`target-${index}`}>目标合约地址</label>
              <input 
                type="text"
                id={`target-${index}`}
                value={action.target}
                onChange={(e) => handleActionChange(index, 'target', e.target.value)}
                placeholder="0x..."
                className={formErrors.actions && formErrors.actions[index]?.target ? 'input-error' : ''}
              />
              {formErrors.actions && formErrors.actions[index]?.target && (
                <p className="error-message">{formErrors.actions[index].target}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor={`value-${index}`}>发送ETH数量</label>
              <input 
                type="text"
                id={`value-${index}`}
                value={action.value}
                onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                placeholder="0"
                className={formErrors.actions && formErrors.actions[index]?.value ? 'input-error' : ''}
              />
              {formErrors.actions && formErrors.actions[index]?.value && (
                <p className="error-message">{formErrors.actions[index].value}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor={`calldata-${index}`}>调用数据 (可选)</label>
              <input 
                type="text"
                id={`calldata-${index}`}
                value={action.calldata}
                onChange={(e) => handleActionChange(index, 'calldata', e.target.value)}
                placeholder="0x..."
                className={formErrors.actions && formErrors.actions[index]?.calldata ? 'input-error' : ''}
              />
              {formErrors.actions && formErrors.actions[index]?.calldata && (
                <p className="error-message">{formErrors.actions[index].calldata}</p>
              )}
            </div>
            
            {actions.length > 1 && (
              <button 
                onClick={() => removeAction(index)} 
                className="dao-btn danger-btn"
              >
                删除操作
              </button>
            )}
          </div>
        ))}
        
        <button 
          onClick={addAction} 
          className="dao-btn secondary-btn add-action-btn"
        >
          添加操作
        </button>
        
        <div className="form-actions">
          <button 
            onClick={handlePrevStep} 
            className="dao-btn secondary-btn"
          >
            上一步
          </button>
          <button 
            onClick={handleNextStep} 
            className="dao-btn primary-btn"
          >
            下一步
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染预览和确认步骤
  const renderPreviewStep = () => {
    return (
      <div className="proposal-creation-step">
        <h2>步骤 3: 预览和确认</h2>
        
        <div className="proposal-preview">
          <h3>提案预览</h3>
          
          <div className="preview-section">
            <h4>标题</h4>
            <p>{title}</p>
          </div>
          
          <div className="preview-section">
            <h4>描述</h4>
            <div className="preview-description">
              {description.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          
          <div className="preview-section">
            <h4>操作 ({actions.length})</h4>
            {actions.map((action, index) => (
              <div key={index} className="preview-action">
                <p><strong>操作 #{index + 1}</strong></p>
                <p>目标: {action.target}</p>
                <p>数量: {action.value} ETH</p>
                <p>数据: {action.calldata || '0x'}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="submission-notice">
          <p>
            <strong>注意:</strong> 提交提案后，将锁定一定数量的代币作为保证金，
            直到提案投票结束。提案创建后无法修改。
          </p>
        </div>
        
        {submissionError && (
          <div className="submission-error">
            <p>{submissionError}</p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            onClick={handlePrevStep} 
            className="dao-btn secondary-btn"
            disabled={isLoading || submissionSuccess}
          >
            上一步
          </button>
          <button 
            onClick={handleSubmit} 
            className="dao-btn primary-btn"
            disabled={isLoading || submissionSuccess}
          >
            {isLoading ? '提交中...' : '提交提案'}
          </button>
        </div>
        
        {submissionSuccess && (
          <div className="submission-success">
            <h3>提案创建成功!</h3>
            <p>提案ID: {proposalId}</p>
            <div className="success-actions">
              <button 
                onClick={() => navigate(`/dao/proposal/${proposalId}`)} 
                className="dao-btn primary-btn"
              >
                查看提案
              </button>
              <button 
                onClick={() => navigate('/dao')} 
                className="dao-btn secondary-btn"
              >
                返回提案列表
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderEligibilityStep();
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderActionsStep();
      case 3:
        return renderPreviewStep();
      default:
        return renderEligibilityStep();
    }
  };
  
  return (
    <div className="dao-container">
      <div className="proposal-creation-header">
        <button onClick={() => navigate('/dao')} className="back-button">
          &larr; 返回提案列表
        </button>
        <h1>创建提案</h1>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearMessages} className="dao-btn secondary-btn">关闭</button>
        </div>
      )}
      
      <div className="proposal-creation-content">
        {currentStep > 0 && (
          <div className="proposal-creation-progress">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">基本信息</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">操作配置</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">预览确认</div>
            </div>
          </div>
        )}
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default ProposalCreation;
