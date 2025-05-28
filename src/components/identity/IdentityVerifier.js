import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { IdentityContext } from '../../context/identity/IdentityContext';
import { Button, Steps, Form, Input, Upload, message, Card, Alert, Spin, Result, Divider, Typography, Space } from 'antd';
import { UploadOutlined, CheckCircleOutlined, SyncOutlined, LinkOutlined, SafetyOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

/**
 * 身份验证组件
 * 引导用户完成不同类型的身份验证流程
 */
const IdentityVerifier = ({ identityId, onSuccess }) => {
  const { account, active } = useWeb3React();
  const { 
    addVerification, 
    verifyIdentity, 
    getVerifications, 
    currentIdentity, 
    identityLoading 
  } = useContext(IdentityContext);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationType, setVerificationType] = useState('basic');
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationFile, setVerificationFile] = useState(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  // 验证类型选项
  const verificationTypes = [
    { key: 'basic', title: '基础验证', description: '验证钱包所有权和基本信息' },
    { key: 'social', title: '社交验证', description: '验证社交媒体账号' },
    { key: 'professional', title: '专业验证', description: '验证专业资质和证书' },
    { key: 'community', title: '社区验证', description: '获取社区成员背书' }
  ];
  
  // 加载已有验证信息
  useEffect(() => {
    const loadVerifications = async () => {
      try {
        setLoading(true);
        
        // 使用传入的identityId或当前身份的ID
        const targetId = identityId || (currentIdentity ? currentIdentity.identityId : null);
        
        if (!targetId) {
          setError('未找到有效的身份ID');
          setLoading(false);
          return;
        }
        
        const result = await getVerifications(targetId);
        if (result.success) {
          setVerifications(result.verifications);
        } else {
          throw new Error(result.error || '获取验证信息失败');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载验证信息失败:', error);
        setError(error.message || '加载验证信息失败');
        setLoading(false);
      }
    };
    
    loadVerifications();
  }, [identityId, currentIdentity, getVerifications]);

  // 生成验证码
  const generateVerificationCode = () => {
    const code = `CBID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setVerificationCode(code);
    return code;
  };

  // 处理验证类型选择
  const handleTypeSelect = (type) => {
    setVerificationType(type);
    setCurrentStep(1);
    
    // 如果选择基础验证，自动生成验证码
    if (type === 'basic') {
      generateVerificationCode();
    }
  };

  // 处理文件上传
  const handleFileChange = (info) => {
    if (info.file.status === 'done') {
      setVerificationFile(info.file.originFileObj);
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // 提交验证申请
  const handleSubmit = async (values) => {
    if (!active || !account) {
      message.error('请先连接钱包');
      return;
    }
    
    setLoading(true);
    
    try {
      // 使用传入的identityId或当前身份的ID
      const targetId = identityId || (currentIdentity ? currentIdentity.identityId : null);
      
      if (!targetId) {
        throw new Error('未找到有效的身份ID');
      }
      
      let proof = '';
      
      // 根据验证类型处理不同的验证流程
      switch (verificationType) {
        case 'basic':
          // 基础验证：签名消息
          proof = verificationCode;
          break;
          
        case 'social':
          // 社交验证：社交媒体链接
          proof = values.socialLink;
          break;
          
        case 'professional':
          // 专业验证：上传证书
          if (!verificationFile) {
            throw new Error('请上传验证文件');
          }
          
          // 上传文件到IPFS（实际实现中需要调用IPFS上传函数）
          // const ipfsHash = await uploadToIPFS(verificationFile);
          // proof = ipfsHash;
          
          // 模拟IPFS哈希
          proof = `ipfs://QmXyz...${Math.random().toString(36).substring(2, 10)}`;
          break;
          
        case 'community':
          // 社区验证：社区成员背书
          proof = values.communityEndorsement;
          break;
          
        default:
          throw new Error('不支持的验证类型');
      }
      
      // 添加验证
      const result = await addVerification(targetId, verificationType, proof);
      
      if (result.success) {
        message.success('验证申请提交成功');
        setCurrentStep(2);
        
        // 如果是基础验证，自动完成验证
        if (verificationType === 'basic') {
          const verifyResult = await verifyIdentity(targetId, verificationType, true);
          
          if (verifyResult.success) {
            message.success('基础验证完成');
            setVerificationComplete(true);
            
            // 刷新验证列表
            const refreshResult = await getVerifications(targetId);
            if (refreshResult.success) {
              setVerifications(refreshResult.verifications);
            }
            
            if (onSuccess) {
              onSuccess({
                identityId: targetId,
                verificationType,
                verified: true
              });
            }
          } else {
            throw new Error(verifyResult.error || '验证失败');
          }
        }
      } else {
        throw new Error(result.error || '提交验证申请失败');
      }
    } catch (error) {
      console.error('验证操作失败:', error);
      setError(error.message || '验证操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染验证类型选择
  const renderTypeSelection = () => {
    return (
      <div className="verification-type-selection">
        <Title level={4}>选择验证类型</Title>
        <Paragraph>
          不同类型的验证可以增强您身份的可信度。您可以完成多种验证以获得更高的信任度。
        </Paragraph>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {verificationTypes.map(type => {
            // 检查该类型验证是否已完成
            const isVerified = verifications.some(v => 
              v.verificationType === type.key && v.valid
            );
            
            return (
              <Card 
                key={type.key}
                hoverable
                className={`verification-type-card ${isVerified ? 'verified' : ''}`}
                onClick={() => !isVerified && handleTypeSelect(type.key)}
              >
                <div className="verification-type-content">
                  <div className="verification-type-info">
                    <Title level={5}>{type.title}</Title>
                    <Paragraph>{type.description}</Paragraph>
                  </div>
                  <div className="verification-type-status">
                    {isVerified ? (
                      <CheckCircleOutlined className="verified-icon" />
                    ) : (
                      <Button type="primary">开始验证</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </Space>
      </div>
    );
  };

  // 渲染验证表单
  const renderVerificationForm = () => {
    switch (verificationType) {
      case 'basic':
        return (
          <div className="basic-verification-form">
            <Title level={4}>基础验证</Title>
            <Paragraph>
              基础验证将确认您对此钱包地址的所有权，并将其与您的身份绑定。
            </Paragraph>
            
            <Card className="verification-code-card">
              <div className="verification-code">
                <Text strong>验证码: </Text>
                <Text code copyable>{verificationCode}</Text>
              </div>
              <Paragraph type="secondary">
                请使用您的钱包签名此验证码，以证明您是钱包的所有者。
              </Paragraph>
              <Button 
                type="primary" 
                onClick={handleSubmit}
                loading={loading}
                disabled={!active}
              >
                签名并验证
              </Button>
            </Card>
          </div>
        );
        
      case 'social':
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Title level={4}>社交验证</Title>
            <Paragraph>
              社交验证将确认您对特定社交媒体账号的所有权，增强您身份的可信度。
            </Paragraph>
            
            <Form.Item
              label="选择社交平台"
              name="socialPlatform"
              rules={[{ required: true, message: '请选择社交平台' }]}
            >
              <select>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
              </select>
            </Form.Item>
            
            <Form.Item
              label="社交账号链接"
              name="socialLink"
              rules={[{ required: true, message: '请输入社交账号链接' }]}
            >
              <Input placeholder="例如: https://twitter.com/yourusername" />
            </Form.Item>
            
            <Alert
              message="验证步骤"
              description={
                <ol>
                  <li>在您的社交媒体账号上发布包含以下验证码的公开内容: <Text code copyable>{verificationCode || generateVerificationCode()}</Text></li>
                  <li>确保该内容是公开可见的</li>
                  <li>复制内容链接并粘贴到上方输入框</li>
                  <li>点击提交验证申请</li>
                </ol>
              }
              type="info"
              showIcon
            />
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} disabled={!active}>
                提交验证申请
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 'professional':
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Title level={4}>专业验证</Title>
            <Paragraph>
              专业验证将确认您的专业资质和证书，提升您在相关领域的可信度。
            </Paragraph>
            
            <Form.Item
              label="专业类型"
              name="professionalType"
              rules={[{ required: true, message: '请选择专业类型' }]}
            >
              <select>
                <option value="artist">艺术家</option>
                <option value="musician">音乐家</option>
                <option value="writer">作家</option>
                <option value="filmmaker">电影制作人</option>
                <option value="designer">设计师</option>
                <option value="other">其他</option>
              </select>
            </Form.Item>
            
            <Form.Item
              label="资质描述"
              name="professionalDescription"
              rules={[{ required: true, message: '请描述您的专业资质' }]}
            >
              <TextArea rows={4} placeholder="请描述您的专业背景、资质和经验" />
            </Form.Item>
            
            <Form.Item
              label="上传证明文件"
              name="professionalProof"
              rules={[{ required: true, message: '请上传证明文件' }]}
            >
              <Upload
                name="file"
                beforeUpload={() => false}
                onChange={handleFileChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
            </Form.Item>
            
            <Paragraph type="secondary">
              请上传能够证明您专业资质的文件，如证书、作品集、获奖证明等。文件将被安全地存储在IPFS上。
            </Paragraph>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} disabled={!active}>
                提交验证申请
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 'community':
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Title level={4}>社区验证</Title>
            <Paragraph>
              社区验证通过获取社区成员的背书来增强您的身份可信度。
            </Paragraph>
            
            <Form.Item
              label="社区选择"
              name="community"
              rules={[{ required: true, message: '请选择社区' }]}
            >
              <select>
                <option value="artists">艺术家社区</option>
                <option value="musicians">音乐家社区</option>
                <option value="writers">作家社区</option>
                <option value="filmmakers">电影制作人社区</option>
                <option value="designers">设计师社区</option>
              </select>
            </Form.Item>
            
            <Form.Item
              label="背书申请说明"
              name="communityEndorsement"
              rules={[{ required: true, message: '请填写背书申请说明' }]}
            >
              <TextArea rows={4} placeholder="请说明您为什么申请该社区的背书，以及您与该社区的关系" />
            </Form.Item>
            
            <Alert
              message="社区验证流程"
              description={
                <ol>
                  <li>提交背书申请</li>
                  <li>社区成员将对您的申请进行投票</li>
                  <li>达到背书阈值后，您将获得社区验证</li>
                  <li>验证结果将在7天内通知您</li>
                </ol>
              }
              type="info"
              showIcon
            />
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} disabled={!active}>
                提交背书申请
              </Button>
            </Form.Item>
          </Form>
        );
        
      default:
        return <Alert message="不支持的验证类型" type="error" />;
    }
  };

  // 渲染验证状态
  const renderVerificationStatus = () => {
    // 查找当前验证类型的验证记录
    const verification = verifications.find(v => v.verificationType === verificationType);
    
    if (verification && verification.valid) {
      return (
        <Result
          status="success"
          title="验证成功"
          subTitle={`您已成功完成${verificationTypes.find(t => t.key === verificationType)?.title || verificationType}验证`}
          extra={[
            <Button type="primary" key="back" onClick={() => setCurrentStep(0)}>
              返回验证类型选择
            </Button>
          ]}
        />
      );
    }
    
    if (verificationComplete) {
      return (
        <Result
          status="success"
          title="验证申请已提交"
          subTitle="您的验证申请已成功提交，我们将尽快处理"
          extra={[
            <Button type="primary" key="back" onClick={() => setCurrentStep(0)}>
              返回验证类型选择
            </Button>
          ]}
        />
      );
    }
    
    return (
      <Result
        status="info"
        title="验证处理中"
        subTitle={`您的${verificationTypes.find(t => t.key === verificationType)?.title || verificationType}验证申请正在处理中`}
        extra={[
          <Button type="primary" key="back" onClick={() => setCurrentStep(0)}>
            返回验证类型选择
          </Button>
        ]}
      />
    );
  };

  // 渲染验证历史
  const renderVerificationHistory = () => {
    if (verifications.length === 0) {
      return (
        <Empty description="暂无验证历史" />
      );
    }
    
    return (
      <div className="verification-history">
        <Title level={4}>验证历史</Title>
        
        {verifications.map((verification, index) => {
          const typeInfo = verificationTypes.find(t => t.key === verification.verificationType) || {
            title: verification.verificationType,
            description: '验证'
          };
          
          return (
            <Card key={index} className="verification-history-item">
              <div className="verification-history-header">
                <div className="verification-type">
                  <Text strong>{typeInfo.title}</Text>
                  {verification.valid ? (
                    <Tag color="success">已验证</Tag>
                  ) : (
                    <Tag color="processing">处理中</Tag>
                  )}
                </div>
                <div className="verification-time">
                  {new Date(verification.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className="verification-history-content">
                <div className="verification-info">
                  <div>
                    <Text type="secondary">验证者: </Text>
                    <Text>{verification.verifier || '系统自动'}</Text>
                  </div>
                  {verification.proof && (
                    <div>
                      <Text type="secondary">证明: </Text>
                      <Text>{verification.proof.startsWith('ipfs://') ? (
                        <a href={`https://ipfs.io/ipfs/${verification.proof.replace('ipfs://', '')}`} target="_blank" rel="noopener noreferrer">
                          <LinkOutlined /> 查看证明
                        </a>
                      ) : verification.proof}</Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading || identityLoading) {
    return <Spin tip="加载中..." />;
  }

  if (error) {
    return (
      <Alert
        message="操作错误"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="identity-verifier">
      <div className="identity-verifier-header">
        <Title level={3}>身份验证</Title>
        <Paragraph>
          完成身份验证可以增强您的身份可信度，解锁更多平台功能。
        </Paragraph>
      </div>
      
      <div className="identity-verifier-content">
        <Steps current={currentStep}>
          <Step title="选择验证类型" />
          <Step title="完成验证" />
          <Step title="验证结果" />
        </Steps>
        
        <Divider />
        
        <div className="identity-verifier-step-content">
          {currentStep === 0 && renderTypeSelection()}
          {currentStep === 1 && renderVerificationForm()}
          {currentStep === 2 && renderVerificationStatus()}
        </div>
      </div>
      
      <Divider />
      
      <div className="identity-verifier-history">
        {renderVerificationHistory()}
      </div>
    </div>
  );
};

export default IdentityVerifier;
