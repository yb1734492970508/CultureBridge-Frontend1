import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './ProposalCreation.css';

// 治理合约ABI（简化版，实际使用时需要完整ABI）
const GOVERNANCE_ABI = [
  "function propose(string calldata description, bytes[] calldata calldatas, address[] calldata targets) external returns (uint256)",
  "function getVotingPower(address account) external view returns (uint256)",
  "function proposalThreshold() external view returns (uint256)",
  "function proposalDeposit() external view returns (uint256)"
];

// 治理合约地址（测试网）
const GOVERNANCE_ADDRESS = "0xA3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

// 代币合约ABI（简化版）
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// 代币合约地址（测试网）
const TOKEN_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * 提案创建组件
 * 支持多步骤创建流程，包括提案基本信息、执行操作和确认提交
 */
const ProposalCreation = () => {
  const { active, account, library } = useBlockchain();
  
  // 步骤控制
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // 用户数据
  const [votingPower, setVotingPower] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenAllowance, setTokenAllowance] = useState('0');
  const [proposalThreshold, setProposalThreshold] = useState('0');
  const [proposalDeposit, setProposalDeposit] = useState('0');
  
  // 提案数据
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState([{ target: '', functionSignature: '', parameters: [] }]);
  
  // 操作状态
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // 初始化合约实例
  const getGovernanceContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      library.getSigner()
    );
  };

  const getTokenContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      library.getSigner()
    );
  };

  // 加载用户数据
  useEffect(() => {
    if (!active || !account || !library) return;
    
    const loadUserData = async () => {
      try {
        const governanceContract = getGovernanceContract();
        const tokenContract = getTokenContract();
        
        if (!governanceContract || !tokenContract) return;
        
        // 获取投票权重
        const power = await governanceContract.getVotingPower(account);
        setVotingPower(ethers.utils.formatEther(power));
        
        // 获取提案门槛
        const threshold = await governanceContract.proposalThreshold();
        setProposalThreshold(ethers.utils.formatEther(threshold));
        
        // 获取提案押金
        const deposit = await governanceContract.proposalDeposit();
        setProposalDeposit(ethers.utils.formatEther(deposit));
        
        // 获取用户代币余额
        const balance = await tokenContract.balanceOf(account);
        setTokenBalance(ethers.utils.formatEther(balance));
        
        // 获取代币授权额度
        const allowance = await tokenContract.allowance(account, GOVERNANCE_ADDRESS);
        setTokenAllowance(ethers.utils.formatEther(allowance));
      } catch (err) {
        console.error('加载用户数据失败:', err);
        setError('加载用户数据失败，请刷新页面重试');
      }
    };
    
    loadUserData();
  }, [active, account, library]);

  // 授权代币
  const approveTokens = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsApproving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const tokenContract = getTokenContract();
      
      if (!tokenContract) {
        throw new Error('无法连接代币合约');
      }
      
      // 授权金额（可以授权一个较大的金额，避免频繁授权）
      const amount = ethers.utils.parseEther('1000000'); // 授权100万代币
      
      const tx = await tokenContract.approve(GOVERNANCE_ADDRESS, amount);
      
      setSuccessMessage('授权交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      // 更新授权额度
      const newAllowance = await tokenContract.allowance(account, GOVERNANCE_ADDRESS);
      setTokenAllowance(ethers.utils.formatEther(newAllowance));
      
      setSuccessMessage('代币授权成功！');
    } catch (err) {
      console.error('代币授权失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`代币授权失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  // 添加执行操作
  const addAction = () => {
    setActions([...actions, { target: '', functionSignature: '', parameters: [] }]);
  };

  // 删除执行操作
  const removeAction = (index) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  // 更新执行操作
  const updateAction = (index, field, value) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };

  // 添加参数
  const addParameter = (actionIndex) => {
    const newActions = [...actions];
    newActions[actionIndex].parameters.push({ type: 'address', value: '' });
    setActions(newActions);
  };

  // 删除参数
  const removeParameter = (actionIndex, paramIndex) => {
    const newActions = [...actions];
    newActions[actionIndex].parameters.splice(paramIndex, 1);
    setActions(newActions);
  };

  // 更新参数
  const updateParameter = (actionIndex, paramIndex, field, value) => {
    const newActions = [...actions];
    newActions[actionIndex].parameters[paramIndex][field] = value;
    setActions(newActions);
  };

  // 生成调用数据
  const generateCalldata = (action) => {
    try {
      const iface = new ethers.utils.Interface([`function ${action.functionSignature}`]);
      const functionName = action.functionSignature.split('(')[0];
      
      // 准备参数
      const params = action.parameters.map(param => {
        switch (param.type) {
          case 'address':
            return param.value;
          case 'uint256':
            return ethers.utils.parseUnits(param.value, 'ether').toString();
          case 'bool':
            return param.value === 'true';
          case 'string':
            return param.value;
          default:
            return param.value;
        }
      });
      
      return iface.encodeFunctionData(functionName, params);
    } catch (err) {
      console.error('生成调用数据失败:', err);
      throw new Error(`生成调用数据失败: ${err.message}`);
    }
  };

  // 提交提案
  const submitProposal = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    // 验证提案数据
    if (!title.trim()) {
      setError('请输入提案标题');
      return;
    }
    
    if (!description.trim()) {
      setError('请输入提案描述');
      return;
    }
    
    if (actions.length === 0) {
      setError('请添加至少一个执行操作');
      return;
    }
    
    // 验证执行操作
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      
      if (!action.target.trim() || !ethers.utils.isAddress(action.target)) {
        setError(`执行操作 #${i + 1} 的目标地址无效`);
        return;
      }
      
      if (!action.functionSignature.trim()) {
        setError(`执行操作 #${i + 1} 的函数签名无效`);
        return;
      }
    }
    
    // 验证投票权重
    if (parseFloat(votingPower) < parseFloat(proposalThreshold)) {
      setError(`您的投票权重不足，需要至少 ${proposalThreshold} CBT`);
      return;
    }
    
    // 验证代币授权
    if (parseFloat(tokenAllowance) < parseFloat(proposalDeposit)) {
      setError(`请先授权代币作为提案押金`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const governanceContract = getGovernanceContract();
      
      if (!governanceContract) {
        throw new Error('无法连接治理合约');
      }
      
      // 准备提案数据
      const fullDescription = `# ${title}\n\n${description}`;
      const targets = [];
      const calldatas = [];
      
      // 生成调用数据
      for (const action of actions) {
        targets.push(action.target);
        
        try {
          const calldata = generateCalldata(action);
          calldatas.push(calldata);
        } catch (err) {
          throw new Error(`生成调用数据失败: ${err.message}`);
        }
      }
      
      // 提交提案
      const tx = await governanceContract.propose(fullDescription, calldatas, targets);
      
      setSuccessMessage('提案交易已提交，请等待确认...');
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 解析事件获取提案ID
      const proposalCreatedEvent = receipt.events.find(event => event.event === 'ProposalCreated');
      const proposalId = proposalCreatedEvent ? proposalCreatedEvent.args.proposalId.toString() : '未知';
      
      setSuccessMessage(`提案创建成功！提案ID: ${proposalId}`);
      
      // 重置表单
      setTitle('');
      setDescription('');
      setActions([{ target: '', functionSignature: '', parameters: [] }]);
      setCurrentStep(1);
    } catch (err) {
      console.error('提案创建失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`提案创建失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下一步
  const nextStep = () => {
    // 验证当前步骤
    if (currentStep === 1) {
      if (!title.trim()) {
        setError('请输入提案标题');
        return;
      }
      
      if (!description.trim()) {
        setError('请输入提案描述');
        return;
      }
    } else if (currentStep === 2) {
      if (actions.length === 0) {
        setError('请添加至少一个执行操作');
        return;
      }
      
      // 验证执行操作
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        
        if (!action.target.trim() || !ethers.utils.isAddress(action.target)) {
          setError(`执行操作 #${i + 1} 的目标地址无效`);
          return;
        }
        
        if (!action.functionSignature.trim()) {
          setError(`执行操作 #${i + 1} 的函数签名无效`);
          return;
        }
      }
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  // 上一步
  const prevStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`step ${currentStep > index ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">
              {index === 0 ? '基本信息' : index === 1 ? '执行操作' : '确认提交'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染基本信息步骤
  const renderBasicInfoStep = () => {
    return (
      <div className="proposal-step">
        <h3>提案基本信息</h3>
        
        <div className="form-group">
          <label htmlFor="title">提案标题</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入简洁明了的标题"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">提案描述</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述提案的目的、背景和预期结果（支持Markdown格式）"
            rows={10}
          />
        </div>
        
        <div className="markdown-tips">
          <h4>Markdown格式提示:</h4>
          <ul>
            <li><code># 标题1</code> - 一级标题</li>
            <li><code>## 标题2</code> - 二级标题</li>
            <li><code>**粗体**</code> - <strong>粗体</strong></li>
            <li><code>*斜体*</code> - <em>斜体</em></li>
            <li><code>[链接文本](URL)</code> - 超链接</li>
          </ul>
        </div>
      </div>
    );
  };

  // 渲染执行操作步骤
  const renderActionsStep = () => {
    return (
      <div className="proposal-step">
        <h3>提案执行操作</h3>
        <p className="step-description">
          定义提案通过后将执行的链上操作。每个操作包括目标合约地址和要调用的函数。
        </p>
        
        {actions.map((action, actionIndex) => (
          <div key={actionIndex} className="action-item">
            <div className="action-header">
              <h4>执行操作 #{actionIndex + 1}</h4>
              {actions.length > 1 && (
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeAction(actionIndex)}
                >
                  删除
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor={`target-${actionIndex}`}>目标合约地址</label>
              <input
                type="text"
                id={`target-${actionIndex}`}
                value={action.target}
                onChange={(e) => updateAction(actionIndex, 'target', e.target.value)}
                placeholder="0x..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor={`function-${actionIndex}`}>函数签名</label>
              <input
                type="text"
                id={`function-${actionIndex}`}
                value={action.functionSignature}
                onChange={(e) => updateAction(actionIndex, 'functionSignature', e.target.value)}
                placeholder="transfer(address,uint256)"
              />
              <div className="input-hint">例如: transfer(address,uint256) 或 setMaxHoldingAmount(uint256)</div>
            </div>
            
            <div className="parameters-section">
              <div className="parameters-header">
                <h5>函数参数</h5>
                <button 
                  type="button" 
                  className="add-button small"
                  onClick={() => addParameter(actionIndex)}
                >
                  添加参数
                </button>
              </div>
              
              {action.parameters.length === 0 ? (
                <div className="no-parameters">无参数</div>
              ) : (
                <div className="parameters-list">
                  {action.parameters.map((param, paramIndex) => (
                    <div key={paramIndex} className="parameter-item">
                      <div className="parameter-type">
                        <label htmlFor={`param-type-${actionIndex}-${paramIndex}`}>类型</label>
                        <select
                          id={`param-type-${actionIndex}-${paramIndex}`}
                          value={param.type}
                          onChange={(e) => updateParameter(actionIndex, paramIndex, 'type', e.target.value)}
                        >
                          <option value="address">address</option>
                          <option value="uint256">uint256</option>
                          <option value="bool">bool</option>
                          <option value="string">string</option>
                        </select>
                      </div>
                      
                      <div className="parameter-value">
                        <label htmlFor={`param-value-${actionIndex}-${paramIndex}`}>值</label>
                        {param.type === 'bool' ? (
                          <select
                            id={`param-value-${actionIndex}-${paramIndex}`}
                            value={param.value}
                            onChange={(e) => updateParameter(actionIndex, paramIndex, 'value', e.target.value)}
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            id={`param-value-${actionIndex}-${paramIndex}`}
                            value={param.value}
                            onChange={(e) => updateParameter(actionIndex, paramIndex, 'value', e.target.value)}
                            placeholder={
                              param.type === 'address' ? '0x...' : 
                              param.type === 'uint256' ? '100' : 
                              param.type === 'string' ? '文本' : ''
                            }
                          />
                        )}
                      </div>
                      
                      <button 
                        type="button" 
                        className="remove-button small"
                        onClick={() => removeParameter(actionIndex, paramIndex)}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          className="add-button"
          onClick={addAction}
        >
          添加执行操作
        </button>
      </div>
    );
  };

  // 渲染确认步骤
  const renderConfirmStep = () => {
    const needsApproval = parseFloat(tokenAllowance) < parseFloat(proposalDeposit);
    const hasEnoughVotingPower = parseFloat(votingPower) >= parseFloat(proposalThreshold);
    
    return (
      <div className="proposal-step">
        <h3>确认提案</h3>
        
        <div className="proposal-summary">
          <h4>提案摘要</h4>
          
          <div className="summary-item">
            <div className="summary-label">标题:</div>
            <div className="summary-value">{title}</div>
          </div>
          
          <div className="summary-item">
            <div className="summary-label">描述:</div>
            <div className="summary-value description">{description}</div>
          </div>
          
          <div className="summary-item">
            <div className="summary-label">执行操作:</div>
            <div className="summary-value">
              {actions.map((action, index) => (
                <div key={index} className="action-summary">
                  <div>操作 #{index + 1}:</div>
                  <div>目标: {action.target}</div>
                  <div>函数: {action.functionSignature}</div>
                  {action.parameters.length > 0 && (
                    <div>
                      参数: {action.parameters.map((param, pIndex) => (
                        <span key={pIndex}>
                          {param.type}: {param.value}{pIndex < action.parameters.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="proposal-requirements">
          <h4>提案要求</h4>
          
          <div className="requirement-item">
            <div className="requirement-label">提案门槛:</div>
            <div className="requirement-value">
              {proposalThreshold} CBT
              <span className={`requirement-status ${hasEnoughVotingPower ? 'met' : 'not-met'}`}>
                {hasEnoughVotingPower ? '已满足' : '未满足'}
              </span>
            </div>
          </div>
          
          <div className="requirement-item">
            <div className="requirement-label">您的投票权重:</div>
            <div className="requirement-value">{parseFloat(votingPower).toLocaleString()} CBT</div>
          </div>
          
          <div className="requirement-item">
            <div className="requirement-label">提案押金:</div>
            <div className="requirement-value">
              {proposalDeposit} CBT
              <span className="requirement-hint">（提案通过后返还）</span>
            </div>
          </div>
          
          <div className="requirement-item">
            <div className="requirement-label">代币授权:</div>
            <div className="requirement-value">
              {parseFloat(tokenAllowance).toLocaleString()} CBT
              <span className={`requirement-status ${!needsApproval ? 'met' : 'not-met'}`}>
                {!needsApproval ? '已授权' : '未授权'}
              </span>
            </div>
          </div>
        </div>
        
        {needsApproval && (
          <button 
            type="button" 
            className="approve-button"
            onClick={approveTokens}
            disabled={isApproving}
          >
            {isApproving ? '授权中...' : '授权代币押金'}
          </button>
        )}
        
        {!hasEnoughVotingPower && (
          <div className="warning-message">
            您的投票权重不足，无法创建提案。请质押更多代币或获取更多投票权重。
          </div>
        )}
      </div>
    );
  };

  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderActionsStep();
      case 3:
        return renderConfirmStep();
      default:
        return null;
    }
  };

  // 渲染步骤导航
  const renderStepNavigation = () => {
    const needsApproval = currentStep === 3 && parseFloat(tokenAllowance) < parseFloat(proposalDeposit);
    const hasEnoughVotingPower = parseFloat(votingPower) >= parseFloat(proposalThreshold);
    
    return (
      <div className="step-navigation">
        {currentStep > 1 && (
          <button 
            type="button" 
            className="prev-button"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            上一步
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button 
            type="button" 
            className="next-button"
            onClick={nextStep}
            disabled={isSubmitting}
          >
            下一步
          </button>
        ) : (
          <button 
            type="button" 
            className="submit-button"
            onClick={submitProposal}
            disabled={isSubmitting || needsApproval || !hasEnoughVotingPower}
          >
            {isSubmitting ? '提交中...' : '提交提案'}
          </button>
        )}
      </div>
    );
  };

  // 渲染组件
  return (
    <div className="proposal-creation">
      <div className="proposal-header">
        <h2>创建治理提案</h2>
        <p>提交社区治理提案，参与CultureBridge的决策过程</p>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          <p>请连接您的钱包以创建提案</p>
        </div>
      ) : (
        <div className="proposal-content">
          {renderStepIndicator()}
          
          <div className="proposal-form">
            {renderCurrentStep()}
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {renderStepNavigation()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalCreation;
