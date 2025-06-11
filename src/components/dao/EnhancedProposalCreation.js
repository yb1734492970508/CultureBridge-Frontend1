import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import { useToken } from '../../context/token/TokenContext';
import TemplateLibrary from './TemplateLibrary';
import '../../styles/dao.css';
import './EnhancedProposalCreation.css';

/**
 * 增强版提案创建组件
 * 支持模板选择和基于模板创建提案
 */
const EnhancedProposalCreation = () => {
  const navigate = useNavigate();
  const { account, active, library, chainId } = useBlockchain();
  const { userReputation } = useIdentity();
  const { tokenBalance, getVotingPower } = useToken();
  const { submitProposal, isLoading, error, clearMessages } = useDAO();
  
  // 本地状态
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [actions, setActions] = useState([{ target: '', value: '0', calldata: '' }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [proposalId, setProposalId] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  
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
  
  // 处理模板选择
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    
    // 预填充表单
    setTitle(template.structure.title.placeholder || '');
    
    // 初始化部分
    const initialSections = template.structure.sections.map(section => ({
      id: section.id,
      title: section.title,
      content: section.placeholder || '',
      type: section.type,
      required: section.required,
      hint: section.hint
    }));
    setSections(initialSections);
    
    // 初始化操作
    if (template.structure.actions && template.structure.actions.length > 0) {
      setActions(template.structure.actions.map(action => ({
        target: action.target || '',
        value: action.value || '0',
        calldata: action.calldata || '',
        description: action.description || ''
      })));
    }
    
    setShowTemplateLibrary(false);
    setCurrentStep(1);
  };
  
  // 处理从头创建
  const handleCreateFromScratch = () => {
    setSelectedTemplate(null);
    setTitle('');
    setDescription('');
    setSections([]);
    setActions([{ target: '', value: '0', calldata: '' }]);
    setShowTemplateLibrary(false);
    setCurrentStep(1);
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
  
  // 处理部分内容变更
  const handleSectionChange = (index, content) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
    validateSection(index, content);
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
    setActions([...actions, { target: '', value: '0', calldata: '', description: '' }]);
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
  
  // 验证部分
  const validateSection = (index, content) => {
    let errors = { ...formErrors };
    const sectionErrors = errors.sections || [];
    
    if (!sectionErrors[index]) {
      sectionErrors[index] = {};
    }
    
    if (sections[index].required && !content.trim()) {
      sectionErrors[index].content = `${sections[index].title}不能为空`;
    } else {
      delete sectionErrors[index].content;
    }
    
    // 清理空对象
    if (Object.keys(sectionErrors[index]).length === 0) {
      sectionErrors.splice(index, 1);
    }
    
    if (sectionErrors.length > 0) {
      errors.sections = sectionErrors;
    } else {
      delete errors.sections;
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
    
    // 验证部分
    const sectionErrors = [];
    sections.forEach((section, index) => {
      if (section.required && !section.content.trim()) {
        if (!sectionErrors[index]) {
          sectionErrors[index] = {};
        }
        sectionErrors[index].content = `${section.title}不能为空`;
        isValid = false;
      }
    });
    
    if (sectionErrors.length > 0) {
      errors.sections = sectionErrors;
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
      if (validateField('title', title)) {
        // 验证所有必填部分
        let isValid = true;
        sections.forEach((section, index) => {
          if (section.required && !validateSection(index, section.content)) {
            isValid = false;
          }
        });
        
        if (isValid) {
          setCurrentStep(2);
        }
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
    } else if (currentStep === 1) {
      setShowTemplateLibrary(true);
      setCurrentStep(0);
    }
  };
  
  // 保存草稿
  const saveDraft = () => {
    try {
      const draft = {
        templateId: selectedTemplate?.id,
        title,
        sections,
        actions,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('proposalDraft', JSON.stringify(draft));
      setDraftSaved(true);
      
      // 3秒后重置保存状态
      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  };
  
  // 加载草稿
  const loadDraft = () => {
    try {
      const draftJson = localStorage.getItem('proposalDraft');
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        setTitle(draft.title || '');
        setSections(draft.sections || []);
        setActions(draft.actions || [{ target: '', value: '0', calldata: '' }]);
        
        // 如果有模板ID，尝试加载模板
        if (draft.templateId) {
          // 这里应该有加载特定模板的逻辑
          // 暂时简化处理
          setSelectedTemplate({ id: draft.templateId });
        }
        
        setShowTemplateLibrary(false);
        setCurrentStep(1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('加载草稿失败:', error);
      return false;
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
      
      // 构建完整描述
      let fullDescription = `# ${title}\n\n`;
      
      // 添加各部分内容
      sections.forEach(section => {
        fullDescription += `## ${section.title}\n\n${section.content}\n\n`;
      });
      
      // 添加操作描述
      if (actions.length > 0 && actions[0].target !== '') {
        fullDescription += '## 操作\n\n';
        actions.forEach((action, index) => {
          fullDescription += `### 操作 ${index + 1}\n\n`;
          if (action.description) {
            fullDescription += `${action.description}\n\n`;
          }
          fullDescription += `- 目标: ${action.target}\n`;
          fullDescription += `- 数量: ${action.value} ETH\n`;
          fullDescription += `- 数据: ${action.calldata || '0x'}\n\n`;
        });
      }
      
      // 如果使用了模板，添加模板信息
      if (selectedTemplate) {
        fullDescription += `\n---\n使用模板: ${selectedTemplate.title}\n`;
      }
      
      // 提交提案
      const result = await submitProposal(targets, values, calldatas, fullDescription);
      
      if (result.success) {
        setSubmissionSuccess(true);
        setProposalId(result.proposalId);
        
        // 清除草稿
        localStorage.removeItem('proposalDraft');
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
              onClick={() => setShowTemplateLibrary(true)} 
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
        
        {selectedTemplate && (
          <div className="template-info">
            <p>使用模板: <strong>{selectedTemplate.title}</strong></p>
            <button 
              onClick={() => setShowTemplateLibrary(true)} 
              className="dao-btn text-btn"
            >
              更换模板
            </button>
          </div>
        )}
        
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
        
        {sections.map((section, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`section-${section.id}`}>
              {section.title}
              {section.required && <span className="required-mark">*</span>}
            </label>
            {section.hint && <p className="field-hint">{section.hint}</p>}
            
            {section.type === 'text' ? (
              <textarea 
                id={`section-${section.id}`}
                value={section.content}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                placeholder={`输入${section.title}...`}
                rows={6}
                className={formErrors.sections && formErrors.sections[index]?.content ? 'input-error' : ''}
              />
            ) : section.type === 'list' ? (
              <textarea 
                id={`section-${section.id}`}
                value={section.content}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                placeholder={`输入${section.title}，每行一项...`}
                rows={6}
                className={formErrors.sections && formErrors.sections[index]?.content ? 'input-error' : ''}
              />
            ) : (
              <textarea 
                id={`section-${section.id}`}
                value={section.content}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                placeholder={`输入${section.title}...`}
                rows={6}
                className={formErrors.sections && formErrors.sections[index]?.content ? 'input-error' : ''}
              />
            )}
            
            {formErrors.sections && formErrors.sections[index]?.content && (
              <p className="error-message">{formErrors.sections[index].content}</p>
            )}
          </div>
        ))}
        
        <div className="form-actions">
          <div className="left-actions">
            <button 
              onClick={saveDraft} 
              className="dao-btn text-btn"
              type="button"
            >
              {draftSaved ? '✓ 已保存' : '保存草稿'}
            </button>
          </div>
          
          <div className="right-actions">
            <button 
              onClick={handlePrevStep} 
              className="dao-btn secondary-btn"
              type="button"
            >
              返回
            </button>
            <button 
              onClick={handleNextStep} 
              className="dao-btn primary-btn"
              type="button"
            >
              下一步
            </button>
          </div>
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
              <label htmlFor={`action-description-${index}`}>操作描述 (可选)</label>
              <textarea 
                id={`action-description-${index}`}
                value={action.description || ''}
                onChange={(e) => handleActionChange(index, 'description', e.target.value)}
                placeholder="描述此操作的目的和影响..."
                rows={3}
              />
            </div>
            
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
                type="button"
              >
                删除操作
              </button>
            )}
          </div>
        ))}
        
        <button 
          onClick={addAction} 
          className="dao-btn secondary-btn add-action-btn"
          type="button"
        >
          添加操作
        </button>
        
        <div className="form-actions">
          <div className="left-actions">
            <button 
              onClick={saveDraft} 
              className="dao-btn text-btn"
              type="button"
            >
              {draftSaved ? '✓ 已保存' : '保存草稿'}
            </button>
          </div>
          
          <div className="right-actions">
            <button 
              onClick={handlePrevStep} 
              className="dao-btn secondary-btn"
              type="button"
            >
              上一步
            </button>
            <button 
              onClick={handleNextStep} 
              className="dao-btn primary-btn"
              type="button"
            >
              下一步
            </button>
          </div>
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
          
          {sections.map((section, index) => (
            <div key={index} className="preview-section">
              <h4>{section.title}</h4>
              <div className="preview-content">
                {section.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          
          <div className="preview-section">
            <h4>操作 ({actions.length})</h4>
            {actions.map((action, index) => (
              <div key={index} className="preview-action">
                <p><strong>操作 #{index + 1}</strong></p>
                {action.description && <p>描述: {action.description}</p>}
                <p>目标: {action.target}</p>
                <p>数量: {action.value} ETH</p>
                <p>数据: {action.calldata || '0x'}</p>
              </div>
            ))}
          </div>
          
          {selectedTemplate && (
            <div className="preview-section">
              <h4>使用的模板</h4>
              <p>{selectedTemplate.title}</p>
            </div>
          )}
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
            disabled={isLoading}
            type="button"
          >
            上一步
          </button>
          <button 
            onClick={handleSubmit} 
            className="dao-btn primary-btn"
            disabled={isLoading}
            type="button"
          >
            {isLoading ? '提交中...' : '提交提案'}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染成功步骤
  const renderSuccessStep = () => {
    return (
      <div className="proposal-creation-step">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>提案创建成功！</h2>
          <p>您的提案已成功提交，提案ID: {proposalId}</p>
          
          <div className="success-actions">
            <button 
              onClick={() => navigate(`/dao/proposals/${proposalId}`)} 
              className="dao-btn primary-btn"
            >
              查看提案
            </button>
            <button 
              onClick={() => navigate('/dao/proposals')} 
              className="dao-btn secondary-btn"
            >
              返回提案列表
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染模板选择步骤
  const renderTemplateSelectionStep = () => {
    return (
      <div className="template-selection-container">
        <TemplateLibrary 
          onSelectTemplate={handleSelectTemplate}
          onClose={() => {
            setShowTemplateLibrary(false);
            handleCreateFromScratch();
          }}
        />
        
        <div className="template-selection-footer">
          <p>或者</p>
          <button 
            onClick={handleCreateFromScratch} 
            className="dao-btn secondary-btn"
          >
            从头创建提案
          </button>
          
          {localStorage.getItem('proposalDraft') && (
            <button 
              onClick={loadDraft} 
              className="dao-btn text-btn"
            >
              加载草稿
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染当前步骤
  const renderCurrentStep = () => {
    if (!eligibilityChecked || !isEligible) {
      return renderEligibilityStep();
    }
    
    if (showTemplateLibrary) {
      return renderTemplateSelectionStep();
    }
    
    if (submissionSuccess) {
      return renderSuccessStep();
    }
    
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderActionsStep();
      case 3:
        return renderPreviewStep();
      default:
        return null;
    }
  };
  
  // 渲染步骤指示器
  const renderStepIndicator = () => {
    if (!eligibilityChecked || !isEligible || showTemplateLibrary || submissionSuccess) {
      return null;
    }
    
    const steps = [
      { number: 1, label: '基本信息' },
      { number: 2, label: '操作配置' },
      { number: 3, label: '预览确认' }
    ];
    
    return (
      <div className="step-indicator">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="enhanced-proposal-creation">
      {renderStepIndicator()}
      {renderCurrentStep()}
    </div>
  );
};

export default EnhancedProposalCreation;
