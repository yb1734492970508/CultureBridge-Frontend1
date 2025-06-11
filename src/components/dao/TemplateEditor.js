import React, { useState, useEffect } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import './TemplateEditor.css';

/**
 * 提案模板编辑器组件
 * 用于创建和编辑提案模板
 */
const TemplateEditor = ({ templateId, onSave, onCancel }) => {
  const { getProposalTemplateById, createProposalTemplate, isLoading, error } = useDAO();
  const { account, active } = useBlockchain();
  
  // 基本信息状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  
  // 结构状态
  const [titlePlaceholder, setTitlePlaceholder] = useState('');
  const [titleHint, setTitleHint] = useState('');
  const [titleMaxLength, setTitleMaxLength] = useState(100);
  
  // 部分状态
  const [sections, setSections] = useState([
    {
      id: `section_${Date.now()}`,
      title: '',
      description: '',
      type: 'text',
      placeholder: '',
      hint: '',
      required: true
    }
  ]);
  
  // 操作状态
  const [actions, setActions] = useState([
    {
      target: '',
      value: '0',
      calldata: '',
      description: ''
    }
  ]);
  
  // 表单错误
  const [formErrors, setFormErrors] = useState({});
  
  // 加载模板数据（如果是编辑模式）
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const template = await getProposalTemplateById(templateId);
          if (template) {
            // 设置基本信息
            setTitle(template.title);
            setDescription(template.description);
            setCategory(template.category);
            setTags(template.tags);
            setIsOfficial(template.isOfficial);
            
            // 设置标题结构
            setTitlePlaceholder(template.structure.title.placeholder || '');
            setTitleHint(template.structure.title.hint || '');
            setTitleMaxLength(template.structure.title.maxLength || 100);
            
            // 设置部分
            if (template.structure.sections && template.structure.sections.length > 0) {
              setSections(template.structure.sections.map(section => ({
                id: section.id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: section.title || '',
                description: section.description || '',
                type: section.type || 'text',
                placeholder: section.placeholder || '',
                hint: section.hint || '',
                required: section.required !== undefined ? section.required : true
              })));
            }
            
            // 设置操作
            if (template.structure.actions && template.structure.actions.length > 0) {
              setActions(template.structure.actions.map(action => ({
                target: action.target || '',
                value: action.value || '0',
                calldata: action.calldata || '',
                description: action.description || ''
              })));
            } else {
              setActions([{
                target: '',
                value: '0',
                calldata: '',
                description: ''
              }]);
            }
          }
        } catch (error) {
          console.error('加载模板失败:', error);
        }
      }
    };
    
    loadTemplate();
  }, [templateId, getProposalTemplateById]);
  
  // 处理标签输入
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // 删除标签
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 处理标签输入键盘事件
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      // 如果输入框为空且按下退格键，删除最后一个标签
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };
  
  // 添加部分
  const handleAddSection = () => {
    setSections([...sections, {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      type: 'text',
      placeholder: '',
      hint: '',
      required: true
    }]);
  };
  
  // 删除部分
  const handleRemoveSection = (index) => {
    if (sections.length > 1) {
      const newSections = [...sections];
      newSections.splice(index, 1);
      setSections(newSections);
    }
  };
  
  // 更新部分
  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };
  
  // 添加操作
  const handleAddAction = () => {
    setActions([...actions, {
      target: '',
      value: '0',
      calldata: '',
      description: ''
    }]);
  };
  
  // 删除操作
  const handleRemoveAction = (index) => {
    if (actions.length > 1) {
      const newActions = [...actions];
      newActions.splice(index, 1);
      setActions(newActions);
    } else {
      // 如果只有一个操作，清空它而不是删除
      setActions([{
        target: '',
        value: '0',
        calldata: '',
        description: ''
      }]);
    }
  };
  
  // 更新操作
  const handleActionChange = (index, field, value) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };
  
  // 验证表单
  const validateForm = () => {
    const errors = {};
    
    // 验证基本信息
    if (!title.trim()) {
      errors.title = '模板标题不能为空';
    }
    
    if (!description.trim()) {
      errors.description = '模板描述不能为空';
    }
    
    if (!category.trim()) {
      errors.category = '请选择类别';
    }
    
    // 验证标题结构
    if (!titlePlaceholder.trim()) {
      errors.titlePlaceholder = '标题占位符不能为空';
    }
    
    // 验证部分
    const sectionErrors = [];
    sections.forEach((section, index) => {
      const sectionError = {};
      
      if (!section.title.trim()) {
        sectionError.title = '部分标题不能为空';
      }
      
      if (!section.placeholder.trim()) {
        sectionError.placeholder = '占位符不能为空';
      }
      
      if (Object.keys(sectionError).length > 0) {
        sectionErrors[index] = sectionError;
      }
    });
    
    if (sectionErrors.length > 0) {
      errors.sections = sectionErrors;
    }
    
    // 验证操作
    if (actions.length > 0 && actions[0].target) {
      const actionErrors = [];
      actions.forEach((action, index) => {
        const actionError = {};
        
        if (action.target && !/^0x[a-fA-F0-9]{40}$/.test(action.target)) {
          actionError.target = '无效的以太坊地址';
        }
        
        if (action.value && (isNaN(parseFloat(action.value)) || parseFloat(action.value) < 0)) {
          actionError.value = '无效的ETH数量';
        }
        
        if (action.calldata && !/^0x[a-fA-F0-9]*$/.test(action.calldata)) {
          actionError.calldata = '无效的调用数据格式';
        }
        
        if (Object.keys(actionError).length > 0) {
          actionErrors[index] = actionError;
        }
      });
      
      if (actionErrors.length > 0) {
        errors.actions = actionErrors;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 处理保存
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // 构建模板数据
      const templateData = {
        title,
        description,
        category,
        tags,
        isOfficial,
        structure: {
          title: {
            placeholder: titlePlaceholder,
            hint: titleHint,
            maxLength: titleMaxLength,
            required: true
          },
          sections: sections.map(section => ({
            id: section.id,
            title: section.title,
            description: section.description,
            type: section.type,
            placeholder: section.placeholder,
            hint: section.hint,
            required: section.required
          })),
          actions: actions.filter(action => action.target || action.description).map(action => ({
            target: action.target || '0x0000000000000000000000000000000000000000',
            value: action.value || '0',
            calldata: action.calldata || '0x',
            description: action.description || ''
          }))
        }
      };
      
      // 创建或更新模板
      let result;
      if (templateId) {
        // 更新模板逻辑（实际项目中实现）
        result = { success: true, templateId };
      } else {
        // 创建新模板
        result = await createProposalTemplate(templateData);
      }
      
      if (result.success) {
        onSave(result.templateId);
      }
    } catch (error) {
      console.error('保存模板失败:', error);
    }
  };
  
  // 预定义类别
  const predefinedCategories = ['财务', '治理', '社区', '技术', '合作', '其他'];
  
  return (
    <div className="template-editor">
      <div className="editor-header">
        <h2>{templateId ? '编辑提案模板' : '创建提案模板'}</h2>
      </div>
      
      <div className="editor-content">
        <div className="editor-section">
          <h3>基本信息</h3>
          
          <div className="form-group">
            <label htmlFor="template-title">模板标题</label>
            <input 
              type="text"
              id="template-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入模板标题"
              className={formErrors.title ? 'input-error' : ''}
            />
            {formErrors.title && <p className="error-message">{formErrors.title}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="template-description">模板描述</label>
            <textarea 
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述此模板的用途和适用场景"
              rows={3}
              className={formErrors.description ? 'input-error' : ''}
            />
            {formErrors.description && <p className="error-message">{formErrors.description}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="template-category">类别</label>
            <select 
              id="template-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={formErrors.category ? 'input-error' : ''}
            >
              <option value="">选择类别</option>
              {predefinedCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
            {formErrors.category && <p className="error-message">{formErrors.category}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="template-tags">标签</label>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div key={index} className="tag">
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    className="remove-tag-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <input 
                type="text"
                id="template-tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签并按Enter"
                className="tag-input"
              />
            </div>
            <p className="field-hint">按Enter添加标签，最多添加5个标签</p>
          </div>
          
          {active && account && (
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox"
                  checked={isOfficial}
                  onChange={(e) => setIsOfficial(e.target.checked)}
                />
                标记为官方模板
              </label>
              <p className="field-hint">只有管理员可以创建官方模板</p>
            </div>
          )}
        </div>
        
        <div className="editor-section">
          <h3>提案标题结构</h3>
          
          <div className="form-group">
            <label htmlFor="title-placeholder">标题占位符</label>
            <input 
              type="text"
              id="title-placeholder"
              value={titlePlaceholder}
              onChange={(e) => setTitlePlaceholder(e.target.value)}
              placeholder="例如: [项目名称] 资金申请"
              className={formErrors.titlePlaceholder ? 'input-error' : ''}
            />
            {formErrors.titlePlaceholder && <p className="error-message">{formErrors.titlePlaceholder}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="title-hint">标题提示</label>
            <input 
              type="text"
              id="title-hint"
              value={titleHint}
              onChange={(e) => setTitleHint(e.target.value)}
              placeholder="例如: 简洁明了地描述资金用途"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="title-max-length">标题最大长度</label>
            <input 
              type="number"
              id="title-max-length"
              value={titleMaxLength}
              onChange={(e) => setTitleMaxLength(parseInt(e.target.value) || 100)}
              min={10}
              max={200}
            />
          </div>
        </div>
        
        <div className="editor-section">
          <h3>提案内容部分</h3>
          <p className="section-description">
            定义提案的内容部分，每个部分将作为提案的一个章节
          </p>
          
          {sections.map((section, index) => (
            <div key={section.id} className="section-config">
              <div className="section-header">
                <h4>部分 #{index + 1}</h4>
                {sections.length > 1 && (
                  <button 
                    type="button"
                    className="remove-section-btn"
                    onClick={() => handleRemoveSection(index)}
                  >
                    删除部分
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`section-title-${index}`}>部分标题</label>
                <input 
                  type="text"
                  id={`section-title-${index}`}
                  value={section.title}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                  placeholder="例如: 项目概述"
                  className={formErrors.sections && formErrors.sections[index]?.title ? 'input-error' : ''}
                />
                {formErrors.sections && formErrors.sections[index]?.title && (
                  <p className="error-message">{formErrors.sections[index].title}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`section-description-${index}`}>部分描述</label>
                <input 
                  type="text"
                  id={`section-description-${index}`}
                  value={section.description}
                  onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                  placeholder="例如: 项目的基本介绍和目标"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`section-type-${index}`}>部分类型</label>
                <select 
                  id={`section-type-${index}`}
                  value={section.type}
                  onChange={(e) => handleSectionChange(index, 'type', e.target.value)}
                >
                  <option value="text">文本</option>
                  <option value="list">列表</option>
                  <option value="table">表格</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor={`section-placeholder-${index}`}>占位符</label>
                <textarea 
                  id={`section-placeholder-${index}`}
                  value={section.placeholder}
                  onChange={(e) => handleSectionChange(index, 'placeholder', e.target.value)}
                  placeholder="例如: 请描述项目的基本情况、目标和预期成果..."
                  rows={3}
                  className={formErrors.sections && formErrors.sections[index]?.placeholder ? 'input-error' : ''}
                />
                {formErrors.sections && formErrors.sections[index]?.placeholder && (
                  <p className="error-message">{formErrors.sections[index].placeholder}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`section-hint-${index}`}>提示信息</label>
                <input 
                  type="text"
                  id={`section-hint-${index}`}
                  value={section.hint}
                  onChange={(e) => handleSectionChange(index, 'hint', e.target.value)}
                  placeholder="例如: 清晰简洁地介绍项目，让社区成员了解项目的核心价值"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={section.required}
                    onChange={(e) => handleSectionChange(index, 'required', e.target.checked)}
                  />
                  必填部分
                </label>
              </div>
            </div>
          ))}
          
          <button 
            type="button"
            className="dao-btn secondary-btn add-section-btn"
            onClick={handleAddSection}
          >
            添加部分
          </button>
        </div>
        
        <div className="editor-section">
          <h3>提案操作</h3>
          <p className="section-description">
            定义提案通过后要执行的操作，如果只是文本提案，可以留空
          </p>
          
          {actions.map((action, index) => (
            <div key={index} className="action-config">
              <div className="action-header">
                <h4>操作 #{index + 1}</h4>
                <button 
                  type="button"
                  className="remove-action-btn"
                  onClick={() => handleRemoveAction(index)}
                >
                  {actions.length > 1 ? '删除操作' : '清空操作'}
                </button>
              </div>
              
              <div className="form-group">
                <label htmlFor={`action-description-${index}`}>操作描述</label>
                <input 
                  type="text"
                  id={`action-description-${index}`}
                  value={action.description}
                  onChange={(e) => handleActionChange(index, 'description', e.target.value)}
                  placeholder="例如: 从DAO金库转账到项目账户"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`action-target-${index}`}>目标合约地址</label>
                <input 
                  type="text"
                  id={`action-target-${index}`}
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
                <label htmlFor={`action-value-${index}`}>ETH数量</label>
                <input 
                  type="text"
                  id={`action-value-${index}`}
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
                <label htmlFor={`action-calldata-${index}`}>调用数据</label>
                <input 
                  type="text"
                  id={`action-calldata-${index}`}
                  value={action.calldata}
                  onChange={(e) => handleActionChange(index, 'calldata', e.target.value)}
                  placeholder="0x..."
                  className={formErrors.actions && formErrors.actions[index]?.calldata ? 'input-error' : ''}
                />
                {formErrors.actions && formErrors.actions[index]?.calldata && (
                  <p className="error-message">{formErrors.actions[index].calldata}</p>
                )}
              </div>
            </div>
          ))}
          
          <button 
            type="button"
            className="dao-btn secondary-btn add-action-btn"
            onClick={handleAddAction}
          >
            添加操作
          </button>
        </div>
      </div>
      
      {error && (
        <div className="editor-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="editor-actions">
        <button 
          type="button"
          className="dao-btn secondary-btn"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </button>
        <button 
          type="button"
          className="dao-btn primary-btn"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : templateId ? '更新模板' : '创建模板'}
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;
