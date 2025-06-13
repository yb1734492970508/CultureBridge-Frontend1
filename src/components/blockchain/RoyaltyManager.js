import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, Tooltip, Space, Divider, Card, Alert } from 'antd';
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined, PercentageOutlined } from '@ant-design/icons';
import './RoyaltyManager.css';

const { Option } = Select;

/**
 * 版税管理组件
 * 用于设置NFT的版税比例和接收人信息
 */
const RoyaltyManager = ({ value = {}, onChange }) => {
  // 状态管理
  const [errors, setErrors] = useState({});
  
  // 版税信息默认值
  const royaltyInfo = {
    percentage: 10,
    recipients: [{ address: '', share: 100 }],
    ...value
  };
  
  // 处理版税信息变更
  const handleRoyaltyChange = (field, newValue) => {
    if (onChange) {
      onChange({
        ...royaltyInfo,
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
  
  // 处理版税接收人添加
  const handleAddRecipient = () => {
    // 计算当前总份额
    const currentTotal = royaltyInfo.recipients.reduce((sum, r) => sum + r.share, 0);
    
    // 如果已经达到100%，显示警告
    if (currentTotal >= 100) {
      setErrors(prev => ({
        ...prev,
        recipients: '版税份额总和已达100%，请先调整现有接收人的份额'
      }));
      return;
    }
    
    // 添加新接收人，默认份额为剩余可分配份额
    const newRecipients = [
      ...royaltyInfo.recipients,
      { address: '', share: 100 - currentTotal }
    ];
    
    handleRoyaltyChange('recipients', newRecipients);
  };
  
  // 处理版税接收人移除
  const handleRemoveRecipient = (index) => {
    // 至少保留一个接收人
    if (royaltyInfo.recipients.length <= 1) {
      setErrors(prev => ({
        ...prev,
        recipients: '至少需要一个版税接收人'
      }));
      return;
    }
    
    // 移除接收人并重新分配份额
    const removedShare = royaltyInfo.recipients[index].share;
    const remainingRecipients = royaltyInfo.recipients.filter((_, i) => i !== index);
    
    // 将移除的份额平均分配给剩余接收人
    const sharePerRecipient = removedShare / remainingRecipients.length;
    
    const newRecipients = remainingRecipients.map(r => ({
      ...r,
      share: Math.round((r.share + sharePerRecipient) * 100) / 100
    }));
    
    handleRoyaltyChange('recipients', newRecipients);
  };
  
  // 处理版税接收人信息变更
  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...royaltyInfo.recipients];
    
    // 如果是修改份额，需要确保总和为100%
    if (field === 'share') {
      const oldShare = newRecipients[index].share;
      const difference = value - oldShare;
      
      // 计算当前总份额
      const currentTotal = newRecipients.reduce((sum, r) => sum + r.share, 0);
      
      // 如果新总和超过100%，调整值
      if (currentTotal + difference > 100) {
        setErrors(prev => ({
          ...prev,
          [`recipient_${index}_share`]: '版税份额总和不能超过100%'
        }));
        value = 100 - (currentTotal - oldShare);
      } else {
        // 清除错误
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`recipient_${index}_share`];
          delete newErrors.recipients;
          return newErrors;
        });
      }
      
      // 如果只有一个接收人，强制设为100%
      if (newRecipients.length === 1) {
        value = 100;
      }
    }
    
    // 如果是修改地址，验证格式
    if (field === 'address') {
      if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        setErrors(prev => ({
          ...prev,
          [`recipient_${index}_address`]: '请输入有效的以太坊地址'
        }));
      } else {
        // 清除错误
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`recipient_${index}_address`];
          return newErrors;
        });
      }
    }
    
    newRecipients[index] = {
      ...newRecipients[index],
      [field]: value
    };
    
    handleRoyaltyChange('recipients', newRecipients);
  };
  
  // 计算总份额
  const totalShare = royaltyInfo.recipients.reduce((sum, r) => sum + r.share, 0);
  
  // 检查总份额是否为100%
  const isShareValid = Math.abs(totalShare - 100) < 0.01;
  
  return (
    <div className="royalty-manager">
      <Card title="版税设置" className="royalty-card">
        <Form layout="vertical">
          <Form.Item 
            label={
              <span>
                版税比例 
                <Tooltip title="二级市场销售时，创作者将获得的销售额百分比">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            extra="大多数市场支持0-15%的版税"
          >
            <InputNumber
              min={0}
              max={15}
              value={royaltyInfo.percentage}
              onChange={(value) => handleRoyaltyChange('percentage', value)}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace('%', '')}
              className="percentage-input"
              prefix={<PercentageOutlined />}
            />
          </Form.Item>
          
          <Divider orientation="left">
            <Space>
              版税接收人
              <Tooltip title="设置接收版税的钱包地址和分配比例">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          </Divider>
          
          {errors.recipients && (
            <Alert 
              message={errors.recipients} 
              type="warning" 
              showIcon 
              className="recipients-alert"
            />
          )}
          
          <div className="recipients-list">
            {royaltyInfo.recipients.map((recipient, index) => (
              <div key={index} className="recipient-item">
                <div className="recipient-inputs">
                  <Form.Item 
                    label="钱包地址"
                    validateStatus={errors[`recipient_${index}_address`] ? 'error' : ''}
                    help={errors[`recipient_${index}_address`]}
                  >
                    <Input 
                      placeholder="0x..." 
                      value={recipient.address}
                      onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                      addonBefore="ETH"
                    />
                  </Form.Item>
                  
                  <Form.Item 
                    label="份额比例"
                    validateStatus={errors[`recipient_${index}_share`] ? 'error' : ''}
                    help={errors[`recipient_${index}_share`]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      value={recipient.share}
                      onChange={(value) => handleRecipientChange(index, 'share', value)}
                      formatter={(value) => `${value}%`}
                      parser={(value) => value.replace('%', '')}
                      className="share-input"
                    />
                  </Form.Item>
                </div>
                
                <Button 
                  type="text" 
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => handleRemoveRecipient(index)}
                  disabled={royaltyInfo.recipients.length <= 1}
                  className="remove-recipient-btn"
                />
              </div>
            ))}
            
            <Button 
              type="dashed" 
              onClick={handleAddRecipient} 
              block
              icon={<PlusOutlined />}
              className="add-recipient-btn"
            >
              添加接收人
            </Button>
          </div>
          
          <div className="royalty-summary">
            <div className="summary-item">
              <span>版税总额:</span>
              <span className="summary-value">{royaltyInfo.percentage}%</span>
            </div>
            <div className="summary-item">
              <span>接收人数量:</span>
              <span className="summary-value">{royaltyInfo.recipients.length}</span>
            </div>
            <div className="summary-item">
              <span>份额总和:</span>
              <span className={`summary-value ${!isShareValid ? 'error' : ''}`}>
                {totalShare.toFixed(2)}%
                {!isShareValid && (
                  <Tooltip title="总和必须为100%">
                    <InfoCircleOutlined className="error-icon" />
                  </Tooltip>
                )}
              </span>
            </div>
          </div>
          
          <div className="royalty-tips">
            <p>
              <InfoCircleOutlined /> 版税将在NFT二级市场交易时自动分配给接收人
            </p>
            <p>
              <InfoCircleOutlined /> 不同的市场平台可能有不同的版税支持政策
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RoyaltyManager;
