import React, { useState } from 'react';
import { Form, Input, Button, Select, Tag, Tooltip, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './MetadataEditor.css';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 元数据编辑器组件
 * 用于编辑NFT的元数据信息，包括名称、描述、属性等
 */
const MetadataEditor = ({ value = {}, onChange }) => {
  // 状态管理
  const [attributeInput, setAttributeInput] = useState({ trait_type: '', value: '', display_type: 'string' });
  const [inputVisible, setInputVisible] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 元数据默认值
  const metadata = {
    name: '',
    description: '',
    attributes: [],
    external_url: '',
    background_color: '',
    ...value
  };
  
  // 处理元数据变更
  const handleMetadataChange = (field, newValue) => {
    if (onChange) {
      onChange({
        ...metadata,
        [field]: newValue
      });
    }
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  // 处理属性添加
  const handleAddAttribute = () => {
    // 验证属性输入
    const newErrors = {};
    if (!attributeInput.trait_type.trim()) {
      newErrors.trait_type = '请输入属性名称';
    }
    if (!attributeInput.value.toString().trim()) {
      newErrors.value = '请输入属性值';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({
        ...prev,
        ...newErrors
      }));
      return;
    }
    
    // 添加新属性
    const newAttributes = [
      ...metadata.attributes,
      { ...attributeInput }
    ];
    
    handleMetadataChange('attributes', newAttributes);
    
    // 重置输入
    setAttributeInput({ trait_type: '', value: '', display_type: 'string' });
    setInputVisible(false);
    setErrors({});
  };
  
  // 处理属性移除
  const handleRemoveAttribute = (index) => {
    const newAttributes = metadata.attributes.filter((_, i) => i !== index);
    handleMetadataChange('attributes', newAttributes);
  };
  
  // 处理属性输入变更
  const handleAttributeInputChange = (field, value) => {
    setAttributeInput(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  // 获取显示类型标签颜色
  const getDisplayTypeColor = (displayType) => {
    switch (displayType) {
      case 'number':
        return 'blue';
      case 'boost_percentage':
        return 'green';
      case 'boost_number':
        return 'cyan';
      case 'date':
        return 'purple';
      default:
        return 'default';
    }
  };
  
  // 获取显示类型标签文本
  const getDisplayTypeText = (displayType) => {
    switch (displayType) {
      case 'number':
        return '数字';
      case 'boost_percentage':
        return '百分比';
      case 'boost_number':
        return '加成值';
      case 'date':
        return '日期';
      default:
        return '文本';
    }
  };
  
  // 渲染属性标签
  const renderAttributeTag = (attr, index) => {
    const displayTypeColor = getDisplayTypeColor(attr.display_type);
    const displayTypeText = getDisplayTypeText(attr.display_type);
    
    return (
      <Tag 
        key={index} 
        closable 
        onClose={() => handleRemoveAttribute(index)}
        className="attribute-tag"
      >
        <span className="attribute-name">{attr.trait_type}:</span>
        <span className="attribute-value">{attr.value}</span>
        <Tag color={displayTypeColor} className="display-type-tag">
          {displayTypeText}
        </Tag>
      </Tag>
    );
  };
  
  return (
    <div className="metadata-editor">
      <Form layout="vertical">
        <Form.Item 
          label="NFT名称" 
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name}
        >
          <Input 
            placeholder="输入NFT名称" 
            value={metadata.name}
            onChange={(e) => handleMetadataChange('name', e.target.value)}
            maxLength={100}
          />
        </Form.Item>
        
        <Form.Item 
          label="描述" 
          required
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description}
        >
          <TextArea 
            placeholder="描述你的NFT..." 
            value={metadata.description}
            onChange={(e) => handleMetadataChange('description', e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            showCount
          />
        </Form.Item>
        
        <Form.Item label="外部链接">
          <Input 
            placeholder="https://..." 
            value={metadata.external_url}
            onChange={(e) => handleMetadataChange('external_url', e.target.value)}
            addonBefore="URL:"
          />
        </Form.Item>
        
        <Form.Item label="背景颜色">
          <Input 
            placeholder="FFFFFF" 
            value={metadata.background_color}
            onChange={(e) => handleMetadataChange('background_color', e.target.value)}
            addonBefore="#"
            maxLength={6}
          />
          {metadata.background_color && (
            <div 
              className="color-preview" 
              style={{ backgroundColor: `#${metadata.background_color}` }}
            />
          )}
        </Form.Item>
        
        <Divider orientation="left">
          <Space>
            属性
            <Tooltip title="属性用于描述NFT的特征，可以帮助用户筛选和分类">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        </Divider>
        
        <div className="attributes-section">
          <div className="attributes-list">
            {metadata.attributes.map((attr, index) => (
              renderAttributeTag(attr, index)
            ))}
            
            {inputVisible ? (
              <div className="attribute-input-container">
                <Form layout="inline" className="attribute-input-form">
                  <Form.Item 
                    validateStatus={errors.trait_type ? 'error' : ''}
                    help={errors.trait_type}
                  >
                    <Input
                      placeholder="属性名称"
                      value={attributeInput.trait_type}
                      onChange={(e) => handleAttributeInputChange('trait_type', e.target.value)}
                      onPressEnter={handleAddAttribute}
                      autoFocus
                    />
                  </Form.Item>
                  <Form.Item 
                    validateStatus={errors.value ? 'error' : ''}
                    help={errors.value}
                  >
                    <Input
                      placeholder="属性值"
                      value={attributeInput.value}
                      onChange={(e) => handleAttributeInputChange('value', e.target.value)}
                      onPressEnter={handleAddAttribute}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      value={attributeInput.display_type}
                      onChange={(value) => handleAttributeInputChange('display_type', value)}
                      style={{ width: 100 }}
                    >
                      <Option value="string">文本</Option>
                      <Option value="number">数字</Option>
                      <Option value="boost_percentage">百分比</Option>
                      <Option value="boost_number">加成值</Option>
                      <Option value="date">日期</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" onClick={handleAddAttribute}>
                        添加
                      </Button>
                      <Button onClick={() => setInputVisible(false)}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <Button 
                type="dashed" 
                onClick={() => setInputVisible(true)} 
                className="add-attribute-button"
              >
                <PlusOutlined /> 添加属性
              </Button>
            )}
          </div>
          
          <div className="attributes-tips">
            <p>
              <InfoCircleOutlined /> 属性将显示在NFT详情页面，帮助买家了解NFT的特征
            </p>
            <p>
              <InfoCircleOutlined /> 不同的显示类型会影响属性在市场中的展示方式
            </p>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default MetadataEditor;
