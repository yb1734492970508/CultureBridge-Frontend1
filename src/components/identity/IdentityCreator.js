import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { uploadToIPFS } from '../../utils/ipfsUtils';
import { Button, Form, Input, Select, Switch, Spin, message, Upload, Divider, Card, Alert } from 'antd';
import { UploadOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 身份创建组件
 * 允许用户创建和编辑去中心化身份
 */
const IdentityCreator = ({ onSuccess }) => {
  const { account, active } = useWeb3React();
  const { createIdentity, updateIdentity, currentIdentity, identityLoading, identityError } = useContext(IdentityContext);
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // 文化领域选项
  const culturalDomains = [
    { value: 'visual_arts', label: '视觉艺术' },
    { value: 'music', label: '音乐' },
    { value: 'literature', label: '文学' },
    { value: 'film', label: '电影' },
    { value: 'dance', label: '舞蹈' },
    { value: 'theater', label: '戏剧' },
    { value: 'photography', label: '摄影' },
    { value: 'digital_art', label: '数字艺术' },
    { value: 'traditional_crafts', label: '传统工艺' },
    { value: 'culinary_arts', label: '烹饪艺术' },
    { value: 'fashion', label: '时尚' },
    { value: 'architecture', label: '建筑' },
    { value: 'cultural_heritage', label: '文化遗产' },
    { value: 'other', label: '其他' }
  ];

  // 如果已有身份，加载身份信息
  useEffect(() => {
    if (currentIdentity) {
      setEditMode(true);
      
      // 从IPFS加载完整身份信息
      const loadIdentityDetails = async () => {
        try {
          // 假设currentIdentity.didDocument是IPFS哈希
          const response = await fetch(`https://ipfs.io/ipfs/${currentIdentity.didDocument}`);
          const data = await response.json();
          
          form.setFieldsValue({
            name: data.name,
            bio: data.bio,
            culturalDomains: data.culturalDomains,
            expertise: data.expertise,
            interests: data.interests,
            publicEmail: data.publicEmail,
            website: data.website,
            socialLinks: data.socialLinks,
            privacySettings: data.privacySettings || {}
          });
          
          if (data.avatar) {
            setAvatarPreview(`https://ipfs.io/ipfs/${data.avatar}`);
          }
        } catch (error) {
          console.error('加载身份详情失败:', error);
          message.error('加载身份详情失败，请重试');
        }
      };
      
      loadIdentityDetails();
    }
  }, [currentIdentity, form]);

  // 处理头像上传
  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      setAvatarFile(info.file.originFileObj);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 切换预览模式
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    if (!active || !account) {
      message.error('请先连接钱包');
      return;
    }
    
    setLoading(true);
    
    try {
      // 准备身份数据
      const identityData = {
        ...values,
        walletAddress: account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 上传头像到IPFS（如果有）
      if (avatarFile) {
        const avatarCID = await uploadToIPFS(avatarFile);
        identityData.avatar = avatarCID;
      }
      
      // 上传完整身份数据到IPFS
      const didDocumentCID = await uploadToIPFS(JSON.stringify(identityData));
      
      let result;
      if (editMode && currentIdentity) {
        // 更新现有身份
        result = await updateIdentity(currentIdentity.identityId, didDocumentCID);
      } else {
        // 创建新身份
        result = await createIdentity(didDocumentCID);
      }
      
      if (result.success) {
        message.success(editMode ? '身份更新成功' : '身份创建成功');
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('身份操作失败:', error);
      message.error(`身份${editMode ? '更新' : '创建'}失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 渲染预览模式
  const renderPreview = () => {
    const values = form.getFieldsValue();
    
    return (
      <Card className="identity-preview">
        <div className="identity-preview-header">
          {avatarPreview ? (
            <img src={avatarPreview} alt="头像" className="identity-avatar" />
          ) : (
            <div className="identity-avatar-placeholder">
              <UserOutlined />
            </div>
          )}
          <h2>{values.name || '未命名身份'}</h2>
          {values.culturalDomains && values.culturalDomains.map(domain => {
            const domainObj = culturalDomains.find(d => d.value === domain);
            return (
              <span key={domain} className="identity-domain-tag">
                {domainObj ? domainObj.label : domain}
              </span>
            );
          })}
        </div>
        
        <Divider />
        
        <div className="identity-preview-content">
          <h3>个人简介</h3>
          <p>{values.bio || '暂无简介'}</p>
          
          <h3>专长</h3>
          <p>{values.expertise || '暂无专长'}</p>
          
          <h3>兴趣</h3>
          <p>{values.interests || '暂无兴趣'}</p>
          
          {values.publicEmail && (
            <>
              <h3>公开邮箱</h3>
              <p>{values.publicEmail}</p>
            </>
          )}
          
          {values.website && (
            <>
              <h3>网站</h3>
              <p>{values.website}</p>
            </>
          )}
          
          {values.socialLinks && (
            <>
              <h3>社交链接</h3>
              <p>{values.socialLinks}</p>
            </>
          )}
        </div>
        
        <Divider />
        
        <div className="identity-preview-footer">
          <p>
            <SafetyOutlined /> 隐私设置: 
            {values.privacySettings?.showEmail ? ' 显示邮箱' : ' 隐藏邮箱'} | 
            {values.privacySettings?.showSocial ? ' 显示社交链接' : ' 隐藏社交链接'}
          </p>
          <p>钱包地址: {account}</p>
        </div>
      </Card>
    );
  };

  // 渲染表单模式
  const renderForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          privacySettings: {
            showEmail: true,
            showSocial: true
          }
        }}
      >
        <Form.Item
          label="头像"
          name="avatar"
        >
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarChange}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="头像" style={{ width: '100%' }} />
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        
        <Form.Item
          label="姓名/艺名"
          name="name"
          rules={[{ required: true, message: '请输入姓名或艺名' }]}
        >
          <Input placeholder="请输入您的姓名或艺名" />
        </Form.Item>
        
        <Form.Item
          label="个人简介"
          name="bio"
        >
          <TextArea rows={4} placeholder="请简要介绍自己" />
        </Form.Item>
        
        <Form.Item
          label="文化领域"
          name="culturalDomains"
          rules={[{ required: true, message: '请选择至少一个文化领域' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择您的文化领域"
            style={{ width: '100%' }}
          >
            {culturalDomains.map(domain => (
              <Option key={domain.value} value={domain.value}>{domain.label}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="专长"
          name="expertise"
        >
          <TextArea rows={3} placeholder="请描述您的专长和技能" />
        </Form.Item>
        
        <Form.Item
          label="兴趣"
          name="interests"
        >
          <TextArea rows={3} placeholder="请描述您的兴趣爱好" />
        </Form.Item>
        
        <Form.Item
          label="公开邮箱"
          name="publicEmail"
        >
          <Input placeholder="请输入您的公开邮箱" />
        </Form.Item>
        
        <Form.Item
          label="网站"
          name="website"
        >
          <Input placeholder="请输入您的网站地址" />
        </Form.Item>
        
        <Form.Item
          label="社交链接"
          name="socialLinks"
        >
          <TextArea rows={3} placeholder="请输入您的社交媒体链接，每行一个" />
        </Form.Item>
        
        <Divider orientation="left">隐私设置</Divider>
        
        <Form.Item
          label="显示邮箱"
          name={['privacySettings', 'showEmail']}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          label="显示社交链接"
          name={['privacySettings', 'showSocial']}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!active}>
            {editMode ? '更新身份' : '创建身份'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={togglePreviewMode}>
            预览
          </Button>
        </Form.Item>
        
        {!active && (
          <Alert
            message="请先连接钱包"
            description="创建身份需要连接Web3钱包，请先连接您的钱包。"
            type="warning"
            showIcon
          />
        )}
        
        {identityError && (
          <Alert
            message="操作错误"
            description={identityError}
            type="error"
            showIcon
          />
        )}
      </Form>
    );
  };

  if (identityLoading) {
    return <Spin tip="加载中..." />;
  }

  return (
    <div className="identity-creator">
      <h1>{editMode ? '编辑身份' : '创建身份'}</h1>
      <p className="identity-creator-description">
        创建您的去中心化身份，展示您的文化背景和专长。您的身份将存储在区块链上，确保其真实性和不可篡改性。
      </p>
      
      <div className="identity-creator-toggle">
        <span>编辑</span>
        <Switch checked={previewMode} onChange={togglePreviewMode} />
        <span>预览</span>
      </div>
      
      {previewMode ? renderPreview() : renderForm()}
    </div>
  );
};

export default IdentityCreator;
