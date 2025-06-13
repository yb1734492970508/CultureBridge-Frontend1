import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Tabs, Upload, Form, Input, Button, Select, 
  Switch, InputNumber, Tag, Tooltip, message, Spin, 
  Divider, Space, Typography, Modal, Progress
} from 'antd';
import { 
  UploadOutlined, PlusOutlined, MinusCircleOutlined, 
  InfoCircleOutlined, EyeOutlined, SaveOutlined,
  FileImageOutlined, FileOutlined, VideoCameraOutlined,
  SoundOutlined, BlockOutlined
} from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';
import { useNFTContract } from '../../hooks/useNFTContract';
import './NFTCreatorWorkspace.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * NFT创建者工作区主组件
 * 提供NFT创建、编辑和铸造的完整工作流程
 */
const NFTCreatorWorkspace = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('basic');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    attributes: [],
    external_url: '',
    background_color: '',
  });
  const [royaltyInfo, setRoyaltyInfo] = useState({
    percentage: 10,
    recipients: [{ address: '', share: 100 }]
  });
  const [mintOptions, setMintOptions] = useState({
    mintType: 'immediate', // immediate, lazy, onDemand
    quantity: 1,
    tokenStandard: 'ERC721', // ERC721, ERC1155
    supplyType: 'unique', // unique, limited, unlimited
    maxSupply: 1,
  });
  const [seriesInfo, setSeriesInfo] = useState({
    isPartOfSeries: false,
    seriesId: '',
    seriesName: '',
    seriesDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Hooks
  const { account, chainId, connectWallet } = useWallet();
  const { mintNFT, estimateGas, uploadToIPFS } = useNFTContract();
  
  // 媒体文件上传前检查
  const beforeUpload = (file) => {
    // 文件类型检查
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isModel = file.type.endsWith('gltf') || file.type.endsWith('glb');
    
    if (!isImage && !isVideo && !isAudio && !isModel) {
      message.error('只支持图片、视频、音频和3D模型文件!');
      return Upload.LIST_IGNORE;
    }
    
    // 文件大小检查
    const isLessThan100MB = file.size / 1024 / 1024 < 100;
    if (!isLessThan100MB) {
      message.error('文件大小不能超过100MB!');
      return Upload.LIST_IGNORE;
    }
    
    // 设置媒体类型
    if (isImage) setMediaType('image');
    else if (isVideo) setMediaType('video');
    else if (isAudio) setMediaType('audio');
    else if (isModel) setMediaType('model');
    
    // 创建预览URL
    const previewURL = URL.createObjectURL(file);
    setMediaPreview(previewURL);
    setMediaFile(file);
    
    // 阻止自动上传
    return false;
  };
  
  // 处理媒体文件移除
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };
  
  // 处理元数据变更
  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
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
  
  // 处理属性添加
  const handleAddAttribute = () => {
    setMetadata(prev => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { trait_type: '', value: '', display_type: 'string' }
      ]
    }));
  };
  
  // 处理属性移除
  const handleRemoveAttribute = (index) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };
  
  // 处理属性变更
  const handleAttributeChange = (index, field, value) => {
    setMetadata(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes[index] = {
        ...newAttributes[index],
        [field]: value
      };
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };
  
  // 处理版税信息变更
  const handleRoyaltyChange = (field, value) => {
    setRoyaltyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 处理版税接收人添加
  const handleAddRecipient = () => {
    // 计算当前总份额
    const currentTotal = royaltyInfo.recipients.reduce((sum, r) => sum + r.share, 0);
    
    // 如果已经达到100%，显示警告
    if (currentTotal >= 100) {
      message.warning('版税份额总和已达100%，请先调整现有接收人的份额');
      return;
    }
    
    // 添加新接收人，默认份额为剩余可分配份额
    setRoyaltyInfo(prev => ({
      ...prev,
      recipients: [
        ...prev.recipients,
        { address: '', share: 100 - currentTotal }
      ]
    }));
  };
  
  // 处理版税接收人移除
  const handleRemoveRecipient = (index) => {
    // 至少保留一个接收人
    if (royaltyInfo.recipients.length <= 1) {
      message.warning('至少需要一个版税接收人');
      return;
    }
    
    // 移除接收人并重新分配份额
    setRoyaltyInfo(prev => {
      const removedShare = prev.recipients[index].share;
      const remainingRecipients = prev.recipients.filter((_, i) => i !== index);
      
      // 将移除的份额平均分配给剩余接收人
      const sharePerRecipient = removedShare / remainingRecipients.length;
      
      return {
        ...prev,
        recipients: remainingRecipients.map(r => ({
          ...r,
          share: r.share + sharePerRecipient
        }))
      };
    });
  };
  
  // 处理版税接收人信息变更
  const handleRecipientChange = (index, field, value) => {
    setRoyaltyInfo(prev => {
      const newRecipients = [...prev.recipients];
      
      // 如果是修改份额，需要确保总和为100%
      if (field === 'share') {
        const oldShare = newRecipients[index].share;
        const difference = value - oldShare;
        
        // 计算当前总份额
        const currentTotal = newRecipients.reduce((sum, r) => sum + r.share, 0);
        
        // 如果新总和超过100%，调整值
        if (currentTotal + difference > 100) {
          message.warning('版税份额总和不能超过100%');
          value = 100 - (currentTotal - oldShare);
        }
        
        // 如果只有一个接收人，强制设为100%
        if (newRecipients.length === 1) {
          value = 100;
        }
      }
      
      newRecipients[index] = {
        ...newRecipients[index],
        [field]: value
      };
      
      return {
        ...prev,
        recipients: newRecipients
      };
    });
  };
  
  // 处理铸造选项变更
  const handleMintOptionChange = (field, value) => {
    setMintOptions(prev => {
      const newOptions = {
        ...prev,
        [field]: value
      };
      
      // 特殊处理：如果选择ERC721，强制设置为unique
      if (field === 'tokenStandard' && value === 'ERC721') {
        newOptions.supplyType = 'unique';
        newOptions.maxSupply = 1;
        newOptions.quantity = 1;
      }
      
      // 特殊处理：如果选择unique，强制设置maxSupply为1
      if (field === 'supplyType' && value === 'unique') {
        newOptions.maxSupply = 1;
      }
      
      return newOptions;
    });
  };
  
  // 处理系列信息变更
  const handleSeriesChange = (field, value) => {
    setSeriesInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    // 验证媒体文件
    if (!mediaFile) {
      newErrors.mediaFile = '请上传媒体文件';
    }
    
    // 验证基本元数据
    if (!metadata.name.trim()) {
      newErrors.name = '请输入NFT名称';
    }
    
    if (!metadata.description.trim()) {
      newErrors.description = '请输入NFT描述';
    }
    
    // 验证属性
    metadata.attributes.forEach((attr, index) => {
      if (!attr.trait_type.trim()) {
        newErrors[`attribute_${index}_trait_type`] = '请输入属性名称';
      }
      if (!attr.value.toString().trim()) {
        newErrors[`attribute_${index}_value`] = '请输入属性值';
      }
    });
    
    // 验证版税接收人
    royaltyInfo.recipients.forEach((recipient, index) => {
      if (!recipient.address.trim()) {
        newErrors[`recipient_${index}_address`] = '请输入接收地址';
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.address)) {
        newErrors[`recipient_${index}_address`] = '请输入有效的以太坊地址';
      }
    });
    
    // 验证系列信息
    if (seriesInfo.isPartOfSeries) {
      if (!seriesInfo.seriesName.trim()) {
        newErrors.seriesName = '请输入系列名称';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 估算Gas费用
  const estimateGasFee = useCallback(async () => {
    if (!account || !mediaFile) return;
    
    try {
      setIsLoading(true);
      const estimate = await estimateGas(
        mintOptions.tokenStandard,
        mintOptions.quantity,
        royaltyInfo.percentage
      );
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Gas估算失败:', error);
      message.error('Gas费用估算失败');
    } finally {
      setIsLoading(false);
    }
  }, [account, mediaFile, mintOptions, royaltyInfo, estimateGas]);
  
  // 当铸造选项或版税信息变更时，重新估算Gas费用
  useEffect(() => {
    if (activeTab === 'mint' && account) {
      estimateGasFee();
    }
  }, [activeTab, account, mintOptions, royaltyInfo, estimateGasFee]);
  
  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      
      // 构建草稿数据
      const draftData = {
        metadata,
        royaltyInfo,
        mintOptions,
        seriesInfo,
        mediaType,
        // 媒体文件不能直接序列化，需要特殊处理
        mediaFileName: mediaFile ? mediaFile.name : null
      };
      
      // 保存到本地存储
      localStorage.setItem('nftCreatorDraft', JSON.stringify(draftData));
      
      // 如果有媒体文件，单独处理
      if (mediaFile) {
        // 这里可以使用IndexedDB等存储媒体文件
        // 简化处理，仅保存文件名
      }
      
      message.success('草稿保存成功');
    } catch (error) {
      console.error('保存草稿失败:', error);
      message.error('保存草稿失败');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 加载草稿
  const loadDraft = () => {
    try {
      const draftDataStr = localStorage.getItem('nftCreatorDraft');
      if (!draftDataStr) {
        message.info('没有找到保存的草稿');
        return;
      }
      
      const draftData = JSON.parse(draftDataStr);
      
      // 恢复状态
      setMetadata(draftData.metadata || {
        name: '',
        description: '',
        attributes: [],
        external_url: '',
        background_color: '',
      });
      
      setRoyaltyInfo(draftData.royaltyInfo || {
        percentage: 10,
        recipients: [{ address: '', share: 100 }]
      });
      
      setMintOptions(draftData.mintOptions || {
        mintType: 'immediate',
        quantity: 1,
        tokenStandard: 'ERC721',
        supplyType: 'unique',
        maxSupply: 1,
      });
      
      setSeriesInfo(draftData.seriesInfo || {
        isPartOfSeries: false,
        seriesId: '',
        seriesName: '',
        seriesDescription: '',
      });
      
      setMediaType(draftData.mediaType || null);
      
      // 媒体文件需要特殊处理，这里简化处理
      // 实际应用中可能需要从IndexedDB等存储中恢复
      
      message.success('草稿加载成功');
    } catch (error) {
      console.error('加载草稿失败:', error);
      message.error('加载草稿失败');
    }
  };
  
  // 铸造NFT
  const handleMint = async () => {
    // 验证表单
    if (!validateForm()) {
      message.error('请完善必填信息');
      return;
    }
    
    // 检查钱包连接
    if (!account) {
      message.warning('请先连接钱包');
      connectWallet();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 上传媒体文件到IPFS
      const mediaUrl = await uploadToIPFS(mediaFile);
      
      // 构建完整元数据
      const fullMetadata = {
        ...metadata,
        image: mediaUrl,
        animation_url: mediaType !== 'image' ? mediaUrl : undefined,
      };
      
      // 上传元数据到IPFS
      const metadataUrl = await uploadToIPFS(
        new Blob([JSON.stringify(fullMetadata)], { type: 'application/json' })
      );
      
      // 准备版税接收人信息
      const royaltyRecipients = royaltyInfo.recipients.map(r => ({
        address: r.address,
        bps: Math.floor(r.share * 100) // 转换为基点 (1% = 100 bps)
      }));
      
      // 铸造NFT
      const result = await mintNFT({
        metadataUrl,
        tokenStandard: mintOptions.tokenStandard,
        quantity: mintOptions.quantity,
        maxSupply: mintOptions.maxSupply,
        royaltyPercentage: royaltyInfo.percentage,
        royaltyRecipients,
        mintType: mintOptions.mintType,
        seriesId: seriesInfo.isPartOfSeries ? seriesInfo.seriesId : undefined
      });
      
      message.success('NFT铸造成功!');
      
      // 清除草稿
      localStorage.removeItem('nftCreatorDraft');
      
      // 重置表单
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      setMetadata({
        name: '',
        description: '',
        attributes: [],
        external_url: '',
        background_color: '',
      });
      setRoyaltyInfo({
        percentage: 10,
        recipients: [{ address: '', share: 100 }]
      });
      setMintOptions({
        mintType: 'immediate',
        quantity: 1,
        tokenStandard: 'ERC721',
        supplyType: 'unique',
        maxSupply: 1,
      });
      setSeriesInfo({
        isPartOfSeries: false,
        seriesId: '',
        seriesName: '',
        seriesDescription: '',
      });
      
    } catch (error) {
      console.error('铸造NFT失败:', error);
      message.error('铸造NFT失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 渲染媒体预览
  const renderMediaPreview = () => {
    if (!mediaPreview) {
      return (
        <div className="upload-placeholder">
          <p className="upload-text">上传媒体文件</p>
          <p className="upload-hint">支持图片、视频、音频和3D模型</p>
        </div>
      );
    }
    
    switch (mediaType) {
      case 'image':
        return <img src={mediaPreview} alt="NFT Preview" className="media-preview" />;
      case 'video':
        return (
          <video 
            src={mediaPreview} 
            controls 
            className="media-preview"
          />
        );
      case 'audio':
        return (
          <div className="audio-preview-container">
            <div className="audio-preview-icon">
              <SoundOutlined />
            </div>
            <audio 
              src={mediaPreview} 
              controls 
              className="audio-preview"
            />
          </div>
        );
      case 'model':
        return (
          <div className="model-preview-container">
            <div className="model-preview-icon">
              <BlockOutlined />
            </div>
            <p>3D模型预览</p>
            <a href={mediaPreview} target="_blank" rel="noopener noreferrer">
              查看模型文件
            </a>
          </div>
        );
      default:
        return <div className="media-preview-error">不支持的媒体类型</div>;
    }
  };
  
  // 渲染NFT预览模态框
  const renderPreviewModal = () => {
    return (
      <Modal
        title="NFT预览"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
        className="nft-preview-modal"
      >
        <div className="nft-preview-container">
          <div className="nft-preview-media">
            {renderMediaPreview()}
          </div>
          <div className="nft-preview-info">
            <Title level={4}>{metadata.name || '未命名NFT'}</Title>
            <Paragraph>{metadata.description || '无描述'}</Paragraph>
            
            {metadata.attributes.length > 0 && (
              <>
                <Divider orientation="left">属性</Divider>
                <div className="nft-preview-attributes">
                  {metadata.attributes.map((attr, index) => (
                    <Tag key={index} color="blue">
                      {attr.trait_type}: {attr.value}
                    </Tag>
                  ))}
                </div>
              </>
            )}
            
            <Divider orientation="left">版税信息</Divider>
            <p>版税比例: {royaltyInfo.percentage}%</p>
            
            {seriesInfo.isPartOfSeries && (
              <>
                <Divider orientation="left">系列信息</Divider>
                <p>系列名称: {seriesInfo.seriesName}</p>
                {seriesInfo.seriesDescription && (
                  <p>系列描述: {seriesInfo.seriesDescription}</p>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  };
  
  return (
    <div className="nft-creator-workspace">
      <div className="workspace-header">
        <Title level={2}>NFT创建工作区</Title>
        <div className="workspace-actions">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => setPreviewVisible(true)}
            disabled={!mediaFile}
          >
            预览
          </Button>
          <Button 
            icon={<SaveOutlined />} 
            onClick={handleSaveDraft}
            loading={isSaving}
          >
            保存草稿
          </Button>
          <Button type="link" onClick={loadDraft}>
            加载草稿
          </Button>
        </div>
      </div>
      
      <div className="workspace-content">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <div className="tab-content">
              <div className="media-upload-section">
                <Card title="媒体文件" className="section-card">
                  <Upload
                    name="media"
                    listType="picture-card"
                    className="media-uploader"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                  >
                    {mediaFile ? (
                      <div className="media-preview-container">
                        {renderMediaPreview()}
                        <div className="media-actions">
                          <Button 
                            icon={<MinusCircleOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMedia();
                            }}
                            size="small"
                          >
                            移除
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                      </div>
                    )}
                  </Upload>
                  {errors.mediaFile && (
                    <div className="error-message">{errors.mediaFile}</div>
                  )}
                  <div className="upload-tips">
                    <p>支持的文件类型: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, GLB, GLTF</p>
                    <p>最大文件大小: 100MB</p>
                  </div>
                </Card>
              </div>
              
              <div className="metadata-section">
                <Card title="基本信息" className="section-card">
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
                      />
                    </Form.Item>
                    
                    <Form.Item label="外部链接">
                      <Input 
                        placeholder="https://..." 
                        value={metadata.external_url}
                        onChange={(e) => handleMetadataChange('external_url', e.target.value)}
                      />
                    </Form.Item>
                    
                    <Form.Item label="背景颜色">
                      <Input 
                        placeholder="#FFFFFF" 
                        value={metadata.background_color}
                        onChange={(e) => handleMetadataChange('background_color', e.target.value)}
                        addonBefore="#"
                      />
                    </Form.Item>
                  </Form>
                </Card>
                
                <Card title="属性" className="section-card">
                  <div className="attributes-list">
                    {metadata.attributes.map((attr, index) => (
                      <div key={index} className="attribute-item">
                        <div className="attribute-inputs">
                          <Form.Item 
                            label="属性名称"
                            validateStatus={errors[`attribute_${index}_trait_type`] ? 'error' : ''}
                            help={errors[`attribute_${index}_trait_type`]}
                          >
                            <Input 
                              placeholder="属性名称" 
                              value={attr.trait_type}
                              onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                            />
                          </Form.Item>
                          
                          <Form.Item 
                            label="属性值"
                            validateStatus={errors[`attribute_${index}_value`] ? 'error' : ''}
                            help={errors[`attribute_${index}_value`]}
                          >
                            <Input 
                              placeholder="属性值" 
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            />
                          </Form.Item>
                          
                          <Form.Item label="显示类型">
                            <Select
                              value={attr.display_type || 'string'}
                              onChange={(value) => handleAttributeChange(index, 'display_type', value)}
                            >
                              <Option value="string">文本</Option>
                              <Option value="number">数字</Option>
                              <Option value="boost_percentage">百分比</Option>
                              <Option value="boost_number">加成值</Option>
                              <Option value="date">日期</Option>
                            </Select>
                          </Form.Item>
                        </div>
                        
                        <Button 
                          type="text" 
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => handleRemoveAttribute(index)}
                        />
                      </div>
                    ))}
                    
                    <Button 
                      type="dashed" 
                      onClick={handleAddAttribute} 
                      block
                      icon={<PlusOutlined />}
                    >
                      添加属性
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="版税设置" key="royalty">
            <div className="tab-content">
              <Card title="版税信息" className="section-card">
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
                  >
                    <InputNumber
                      min={0}
                      max={15}
                      value={royaltyInfo.percentage}
                      onChange={(value) => handleRoyaltyChange('percentage', value)}
                      formatter={(value) => `${value}%`}
                      parser={(value) => value.replace('%', '')}
                    />
                  </Form.Item>
                </Form>
              </Card>
              
              <Card title="版税接收人" className="section-card">
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
                          />
                        </Form.Item>
                        
                        <Form.Item label="份额比例">
                          <InputNumber
                            min={1}
                            max={100}
                            value={recipient.share}
                            onChange={(value) => handleRecipientChange(index, 'share', value)}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value.replace('%', '')}
                          />
                        </Form.Item>
                      </div>
                      
                      <Button 
                        type="text" 
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveRecipient(index)}
                        disabled={royaltyInfo.recipients.length <= 1}
                      />
                    </div>
                  ))}
                  
                  <Button 
                    type="dashed" 
                    onClick={handleAddRecipient} 
                    block
                    icon={<PlusOutlined />}
                  >
                    添加接收人
                  </Button>
                </div>
                
                <div className="royalty-summary">
                  <Text>版税总额: {royaltyInfo.percentage}%</Text>
                  <Text>接收人数量: {royaltyInfo.recipients.length}</Text>
                  <Text>
                    份额总和: {royaltyInfo.recipients.reduce((sum, r) => sum + r.share, 0)}%
                    {royaltyInfo.recipients.reduce((sum, r) => sum + r.share, 0) !== 100 && (
                      <Tag color="error" style={{ marginLeft: 8 }}>总和必须为100%</Tag>
                    )}
                  </Text>
                </div>
              </Card>
            </div>
          </TabPane>
          
          <TabPane tab="系列设置" key="series">
            <div className="tab-content">
              <Card title="系列信息" className="section-card">
                <Form layout="vertical">
                  <Form.Item label="是否属于系列">
                    <Switch 
                      checked={seriesInfo.isPartOfSeries}
                      onChange={(checked) => handleSeriesChange('isPartOfSeries', checked)}
                    />
                  </Form.Item>
                  
                  {seriesInfo.isPartOfSeries && (
                    <>
                      <Form.Item label="选择现有系列">
                        <Select
                          placeholder="选择系列"
                          value={seriesInfo.seriesId || undefined}
                          onChange={(value) => handleSeriesChange('seriesId', value)}
                          allowClear
                        >
                          <Option value="new">创建新系列</Option>
                          <Option value="series1">示例系列1</Option>
                          <Option value="series2">示例系列2</Option>
                        </Select>
                      </Form.Item>
                      
                      {(!seriesInfo.seriesId || seriesInfo.seriesId === 'new') && (
                        <>
                          <Form.Item 
                            label="系列名称"
                            required={seriesInfo.isPartOfSeries}
                            validateStatus={errors.seriesName ? 'error' : ''}
                            help={errors.seriesName}
                          >
                            <Input 
                              placeholder="输入系列名称" 
                              value={seriesInfo.seriesName}
                              onChange={(e) => handleSeriesChange('seriesName', e.target.value)}
                            />
                          </Form.Item>
                          
                          <Form.Item label="系列描述">
                            <TextArea 
                              placeholder="描述你的系列..." 
                              value={seriesInfo.seriesDescription}
                              onChange={(e) => handleSeriesChange('seriesDescription', e.target.value)}
                              autoSize={{ minRows: 3, maxRows: 6 }}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                </Form>
              </Card>
            </div>
          </TabPane>
          
          <TabPane tab="铸造设置" key="mint">
            <div className="tab-content">
              <Card title="铸造选项" className="section-card">
                <Form layout="vertical">
                  <Form.Item 
                    label={
                      <span>
                        代币标准 
                        <Tooltip title="ERC721: 适合独特的1/1作品; ERC1155: 适合多版本或系列作品">
                          <InfoCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                      </span>
                    }
                  >
                    <Select
                      value={mintOptions.tokenStandard}
                      onChange={(value) => handleMintOptionChange('tokenStandard', value)}
                    >
                      <Option value="ERC721">ERC721 (独特NFT)</Option>
                      <Option value="ERC1155">ERC1155 (多版本NFT)</Option>
                    </Select>
                  </Form.Item>
                  
                  {mintOptions.tokenStandard === 'ERC1155' && (
                    <>
                      <Form.Item 
                        label={
                          <span>
                            供应类型 
                            <Tooltip title="独特: 仅1个; 限量: 固定数量; 无限: 无上限">
                              <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                          </span>
                        }
                      >
                        <Select
                          value={mintOptions.supplyType}
                          onChange={(value) => handleMintOptionChange('supplyType', value)}
                        >
                          <Option value="unique">独特 (1个)</Option>
                          <Option value="limited">限量</Option>
                          <Option value="unlimited">无限</Option>
                        </Select>
                      </Form.Item>
                      
                      {mintOptions.supplyType === 'limited' && (
                        <Form.Item label="最大供应量">
                          <InputNumber
                            min={1}
                            value={mintOptions.maxSupply}
                            onChange={(value) => handleMintOptionChange('maxSupply', value)}
                          />
                        </Form.Item>
                      )}
                      
                      <Form.Item label="初始铸造数量">
                        <InputNumber
                          min={1}
                          max={mintOptions.supplyType === 'limited' ? mintOptions.maxSupply : undefined}
                          value={mintOptions.quantity}
                          onChange={(value) => handleMintOptionChange('quantity', value)}
                        />
                      </Form.Item>
                    </>
                  )}
                  
                  <Form.Item 
                    label={
                      <span>
                        铸造类型 
                        <Tooltip title="即时: 立即上链; 延迟: 仅创建元数据; 按需: 购买时铸造">
                          <InfoCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                      </span>
                    }
                  >
                    <Select
                      value={mintOptions.mintType}
                      onChange={(value) => handleMintOptionChange('mintType', value)}
                    >
                      <Option value="immediate">即时铸造</Option>
                      <Option value="lazy">延迟铸造</Option>
                      <Option value="onDemand">按需铸造</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
              
              <Card title="Gas费用估算" className="section-card">
                {isLoading ? (
                  <div className="loading-container">
                    <Spin />
                    <p>正在估算Gas费用...</p>
                  </div>
                ) : account ? (
                  gasEstimate ? (
                    <div className="gas-estimate">
                      <div className="gas-estimate-item">
                        <Text>估算Gas费用:</Text>
                        <Text strong>{gasEstimate.gasFee} ETH</Text>
                      </div>
                      <div className="gas-estimate-item">
                        <Text>当前Gas价格:</Text>
                        <Text>{gasEstimate.gasPrice} Gwei</Text>
                      </div>
                      <div className="gas-estimate-item">
                        <Text>估算美元价值:</Text>
                        <Text>${gasEstimate.usdValue}</Text>
                      </div>
                      <div className="gas-note">
                        <InfoCircleOutlined /> 实际Gas费用可能因网络状况而变化
                      </div>
                    </div>
                  ) : (
                    <div className="no-estimate">
                      <Button onClick={estimateGasFee}>估算Gas费用</Button>
                    </div>
                  )
                ) : (
                  <div className="wallet-connect-prompt">
                    <p>请先连接钱包以估算Gas费用</p>
                    <Button type="primary" onClick={connectWallet}>连接钱包</Button>
                  </div>
                )}
              </Card>
              
              <div className="mint-action">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleMint}
                  loading={isLoading}
                  disabled={!account || !mediaFile}
                  block
                >
                  铸造NFT
                </Button>
                {!account && (
                  <div className="mint-note">
                    <InfoCircleOutlined /> 请先连接钱包
                  </div>
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      {renderPreviewModal()}
    </div>
  );
};

export default NFTCreatorWorkspace;
