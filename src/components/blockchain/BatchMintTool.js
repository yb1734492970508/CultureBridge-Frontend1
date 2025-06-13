import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Upload, message, Table, Modal, Input, Spin, Progress, Alert } from 'antd';
import { UploadOutlined, FileExcelOutlined, FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import './BatchMintTool.css';

/**
 * 批量铸造工具组件
 * 用于批量上传和铸造多个NFT
 */
const BatchMintTool = ({ creatorService, walletConnected }) => {
  // 状态管理
  const [fileList, setFileList] = useState([]);
  const [nftDataList, setNftDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mintingStatus, setMintingStatus] = useState({
    status: 'idle', // idle, processing, success, error
    progress: 0,
    message: '',
    txHash: ''
  });
  
  // 处理文件上传
  const handleFileUpload = (info) => {
    const { status } = info.file;
    
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      
      // 解析上传的CSV或Excel文件
      parseFile(info.file.originFileObj);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
    
    setFileList(info.fileList.slice(-1)); // 只保留最后一个文件
  };
  
  // 解析上传的文件
  const parseFile = (file) => {
    setLoading(true);
    
    // 模拟文件解析过程
    setTimeout(() => {
      // 这里应该实际解析CSV或Excel文件
      // 这里仅作为示例，生成模拟数据
      const mockData = Array(5).fill(0).map((_, index) => ({
        id: `nft_${index + 1}`,
        name: `测试NFT #${index + 1}`,
        description: `这是一个测试NFT，编号 #${index + 1}`,
        image: `https://example.com/image${index + 1}.jpg`,
        attributes: [
          { trait_type: '类型', value: '测试' },
          { trait_type: '编号', value: index + 1 }
        ]
      }));
      
      setNftDataList(mockData);
      setLoading(false);
    }, 1500);
  };
  
  // 处理预览
  const handlePreview = (record) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };
  
  // 处理批量铸造
  const handleBatchMint = async () => {
    if (!walletConnected) {
      message.error('请先连接钱包');
      return;
    }
    
    if (nftDataList.length === 0) {
      message.error('请先上传并解析NFT数据');
      return;
    }
    
    try {
      setMintingStatus({
        status: 'processing',
        progress: 0,
        message: '准备批量铸造...',
        txHash: ''
      });
      
      // 模拟上传媒体文件到IPFS的进度
      for (let i = 0; i <= 50; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMintingStatus(prev => ({
          ...prev,
          progress: i,
          message: `上传媒体文件到IPFS (${i}%)...`
        }));
      }
      
      // 模拟上传元数据到IPFS的进度
      for (let i = 50; i <= 80; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMintingStatus(prev => ({
          ...prev,
          progress: i,
          message: `上传元数据到IPFS (${i}%)...`
        }));
      }
      
      // 模拟铸造NFT的进度
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMintingStatus(prev => ({
        ...prev,
        progress: 90,
        message: '提交铸造交易...'
      }));
      
      // 模拟铸造完成
      const result = await creatorService.batchMintNFTs(nftDataList);
      
      setMintingStatus({
        status: 'success',
        progress: 100,
        message: '批量铸造成功！',
        txHash: result.txHash
      });
      
      message.success('批量铸造成功！');
    } catch (error) {
      setMintingStatus({
        status: 'error',
        progress: 0,
        message: `铸造失败: ${error.message}`,
        txHash: ''
      });
      
      message.error(`批量铸造失败: ${error.message}`);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">查看图片</a>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handlePreview(record)}>
          预览
        </Button>
      )
    }
  ];
  
  // 渲染预览模态框
  const renderPreviewModal = () => {
    if (!previewData) return null;
    
    return (
      <Modal
        title="NFT预览"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        <div className="nft-preview">
          <div className="preview-header">
            <h3>{previewData.name}</h3>
            <p>{previewData.description}</p>
          </div>
          
          <div className="preview-image">
            <img src={previewData.image} alt={previewData.name} />
          </div>
          
          <div className="preview-attributes">
            <h4>属性</h4>
            <div className="attributes-list">
              {previewData.attributes.map((attr, index) => (
                <div key={index} className="attribute-item">
                  <span className="attribute-name">{attr.trait_type}:</span>
                  <span className="attribute-value">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    );
  };
  
  // 渲染铸造状态
  const renderMintingStatus = () => {
    if (mintingStatus.status === 'idle') return null;
    
    return (
      <div className="minting-status">
        {mintingStatus.status === 'processing' && (
          <>
            <Progress percent={mintingStatus.progress} status="active" />
            <div className="status-message">{mintingStatus.message}</div>
          </>
        )}
        
        {mintingStatus.status === 'success' && (
          <Alert
            message="铸造成功"
            description={
              <div>
                <p>{mintingStatus.message}</p>
                <p>交易哈希: <a href={`https://etherscan.io/tx/${mintingStatus.txHash}`} target="_blank" rel="noopener noreferrer">{mintingStatus.txHash}</a></p>
              </div>
            }
            type="success"
            showIcon
          />
        )}
        
        {mintingStatus.status === 'error' && (
          <Alert
            message="铸造失败"
            description={mintingStatus.message}
            type="error"
            showIcon
          />
        )}
      </div>
    );
  };
  
  // 渲染模板下载按钮
  const renderTemplateDownload = () => {
    // 实际项目中，这里应该提供一个真实的模板文件下载链接
    return (
      <div className="template-download">
        <Button icon={<FileExcelOutlined />}>
          下载批量铸造模板
        </Button>
        <span className="template-tip">下载Excel模板文件，填写NFT信息后上传</span>
      </div>
    );
  };
  
  return (
    <div className="batch-mint-tool">
      <Card title="批量铸造工具" className="batch-mint-card">
        <div className="tool-description">
          <p>使用此工具可以一次性批量铸造多个NFT，提高创作效率。</p>
        </div>
        
        {renderTemplateDownload()}
        
        <div className="upload-section">
          <Upload
            name="file"
            accept=".csv,.xlsx,.xls"
            fileList={fileList}
            onChange={handleFileUpload}
            beforeUpload={() => {
              // 允许上传，但由onChange处理
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} disabled={loading}>
              上传NFT数据文件
            </Button>
          </Upload>
          <span className="upload-tip">支持CSV或Excel文件格式</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Spin />
            <span>解析文件中...</span>
          </div>
        ) : (
          nftDataList.length > 0 && (
            <div className="data-preview">
              <h3>数据预览 ({nftDataList.length}个NFT)</h3>
              <Table
                columns={columns}
                dataSource={nftDataList}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
              
              <div className="action-buttons">
                <Button
                  type="primary"
                  onClick={handleBatchMint}
                  disabled={!walletConnected || mintingStatus.status === 'processing'}
                  loading={mintingStatus.status === 'processing'}
                >
                  批量铸造 ({nftDataList.length}个NFT)
                </Button>
              </div>
            </div>
          )
        )}
        
        {renderMintingStatus()}
        {renderPreviewModal()}
      </Card>
    </div>
  );
};

export default BatchMintTool;
