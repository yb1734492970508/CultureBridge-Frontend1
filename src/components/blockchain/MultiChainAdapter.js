import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Card, Button, Form, Select, Input, Table, Tabs, Alert, Spin, Badge, Modal, Tooltip } from 'antd';
import { SwapOutlined, LinkOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';
import MultiChainAdapterABI from '../../contracts/abis/MultiChainAdapterABI';
import './MultiChainAdapter.css';

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * 跨链适配器组件
 * 提供多链资产管理、跨链交易和状态查询功能
 */
const MultiChainAdapter = ({ adapterAddress }) => {
  // 上下文
  const { provider, account, chainId, isConnected } = useContext(Web3Context);
  const { addNotification } = useContext(NotificationContext);

  // 状态变量
  const [loading, setLoading] = useState(false);
  const [supportedChains, setSupportedChains] = useState([]);
  const [selectedSourceChain, setSelectedSourceChain] = useState(null);
  const [selectedTargetChain, setSelectedTargetChain] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [adapterContract, setAdapterContract] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [messagePayload, setMessagePayload] = useState('');
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 交易状态映射
  const txStatusMap = {
    0: { text: '等待中', color: 'processing', icon: <LoadingOutlined /> },
    1: { text: '已确认', color: 'success', icon: <CheckCircleOutlined /> },
    2: { text: '失败', color: 'error', icon: <CloseCircleOutlined /> },
    3: { text: '已撤销', color: 'warning', icon: <CloseCircleOutlined /> }
  };

  // 初始化合约
  useEffect(() => {
    if (provider && adapterAddress) {
      const contract = new ethers.Contract(adapterAddress, MultiChainAdapterABI, provider.getSigner());
      setAdapterContract(contract);
    }
  }, [provider, adapterAddress]);

  // 加载支持的链
  useEffect(() => {
    const loadSupportedChains = async () => {
      if (!adapterContract) return;

      try {
        setLoading(true);
        const chainIds = await adapterContract.getSupportedChains();
        
        const chains = await Promise.all(chainIds.map(async (id) => {
          const name = await adapterContract.chainIdToName(id);
          return {
            id: id.toNumber(),
            name
          };
        }));
        
        setSupportedChains(chains);
        
        // 设置当前链为源链
        const currentChain = chains.find(chain => chain.id === chainId);
        if (currentChain) {
          setSelectedSourceChain(currentChain.id);
        }
      } catch (error) {
        console.error('加载支持的链失败:', error);
        addNotification('error', '加载失败', '无法加载支持的区块链列表');
      } finally {
        setLoading(false);
      }
    };

    loadSupportedChains();
  }, [adapterContract, chainId, addNotification]);

  // 加载资产
  useEffect(() => {
    const loadAssets = async () => {
      if (!adapterContract || !selectedSourceChain) return;

      try {
        setLoading(true);
        
        // 这里应该从合约或API获取资产列表
        // 由于合约可能没有直接提供资产列表的方法，这里使用模拟数据
        const mockAssets = [
          { address: '0x1234567890123456789012345678901234567890', name: 'CultureBridge Token', symbol: 'CBT', type: 1 },
          { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef', name: 'Digital Heritage NFT', symbol: 'DHNFT', type: 2 },
          { address: '0x9876543210987654321098765432109876543210', name: 'Cultural Artifacts', symbol: 'CA', type: 2 }
        ];
        
        setAssets(mockAssets);
      } catch (error) {
        console.error('加载资产失败:', error);
        addNotification('error', '加载失败', '无法加载资产列表');
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [adapterContract, selectedSourceChain, addNotification]);

  // 加载交易历史
  useEffect(() => {
    const loadTransactions = async () => {
      if (!adapterContract || !account) return;

      try {
        setRefreshing(true);
        
        // 这里应该从合约事件中获取交易历史
        // 由于需要过滤和处理事件，这里使用模拟数据
        const mockTransactions = [
          { 
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            sourceChainId: 1,
            targetChainId: 137,
            sourceAsset: '0x1234567890123456789012345678901234567890',
            targetAsset: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
            sender: account,
            recipient: '0x9876543210987654321098765432109876543210',
            amount: ethers.utils.parseEther('10'),
            timestamp: Date.now() - 3600000,
            status: 1
          },
          { 
            txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            sourceChainId: 137,
            targetChainId: 1,
            sourceAsset: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
            targetAsset: '0x1234567890123456789012345678901234567890',
            sender: '0x9876543210987654321098765432109876543210',
            recipient: account,
            amount: ethers.utils.parseEther('5'),
            timestamp: Date.now() - 86400000,
            status: 0
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('加载交易历史失败:', error);
        addNotification('error', '加载失败', '无法加载交易历史');
      } finally {
        setRefreshing(false);
      }
    };

    loadTransactions();
  }, [adapterContract, account, addNotification]);

  // 加载消息历史
  useEffect(() => {
    const loadMessages = async () => {
      if (!adapterContract || !account) return;

      try {
        setRefreshing(true);
        
        // 这里应该从合约事件中获取消息历史
        // 由于需要过滤和处理事件，这里使用模拟数据
        const mockMessages = [
          { 
            messageId: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
            sourceChainId: 1,
            targetChainId: 137,
            sender: account,
            recipient: '0x9876543210987654321098765432109876543210',
            payload: '0x1234567890abcdef',
            timestamp: Date.now() - 1800000,
            isProcessed: true
          },
          { 
            messageId: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            sourceChainId: 137,
            targetChainId: 1,
            sender: '0x9876543210987654321098765432109876543210',
            recipient: account,
            payload: '0xfedcba9876543210',
            timestamp: Date.now() - 43200000,
            isProcessed: false
          }
        ];
        
        setMessages(mockMessages);
      } catch (error) {
        console.error('加载消息历史失败:', error);
        addNotification('error', '加载失败', '无法加载消息历史');
      } finally {
        setRefreshing(false);
      }
    };

    loadMessages();
  }, [adapterContract, account, addNotification]);

  // 处理链选择变化
  const handleSourceChainChange = (value) => {
    setSelectedSourceChain(value);
    setSelectedAsset(null);
  };

  const handleTargetChainChange = (value) => {
    setSelectedTargetChain(value);
  };

  // 处理资产选择变化
  const handleAssetChange = (value) => {
    setSelectedAsset(value);
  };

  // 处理发起跨链交易
  const handleInitiateTransaction = async () => {
    if (!adapterContract || !selectedTargetChain || !selectedAsset || !recipient || !amount) {
      addNotification('warning', '输入不完整', '请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      
      // 检查接收地址格式
      if (!ethers.utils.isAddress(recipient)) {
        addNotification('error', '无效地址', '接收地址格式不正确');
        return;
      }
      
      // 转换金额为wei
      const amountInWei = ethers.utils.parseEther(amount);
      
      // 调用合约发起跨链交易
      const tx = await adapterContract.initiateTransaction(
        selectedTargetChain,
        selectedAsset,
        recipient,
        amountInWei
      );
      
      addNotification('info', '交易已提交', '跨链交易已提交，等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      addNotification('success', '交易已确认', '跨链交易已成功发起，等待跨链处理');
      
      // 重置表单
      setAmount('');
      setRecipient('');
      
      // 刷新交易列表
      // 实际应用中应该监听事件或轮询更新
      setTimeout(() => {
        const newTx = {
          txHash: tx.hash,
          sourceChainId: selectedSourceChain,
          targetChainId: selectedTargetChain,
          sourceAsset: selectedAsset,
          targetAsset: '0x', // 实际应用中应该从合约获取
          sender: account,
          recipient: recipient,
          amount: amountInWei,
          timestamp: Date.now(),
          status: 0
        };
        
        setTransactions([newTx, ...transactions]);
      }, 1000);
      
    } catch (error) {
      console.error('发起跨链交易失败:', error);
      addNotification('error', '交易失败', '发起跨链交易失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理发送跨链消息
  const handleSendMessage = async () => {
    if (!adapterContract || !selectedTargetChain || !recipient || !messagePayload) {
      addNotification('warning', '输入不完整', '请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      
      // 检查接收地址格式
      if (!ethers.utils.isAddress(recipient)) {
        addNotification('error', '无效地址', '接收地址格式不正确');
        return;
      }
      
      // 转换消息为字节
      const payload = ethers.utils.toUtf8Bytes(messagePayload);
      
      // 调用合约发送跨链消息
      const tx = await adapterContract.sendMessage(
        selectedTargetChain,
        recipient,
        payload
      );
      
      addNotification('info', '消息已提交', '跨链消息已提交，等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      addNotification('success', '消息已确认', '跨链消息已成功发送，等待跨链处理');
      
      // 重置表单
      setMessagePayload('');
      setRecipient('');
      
      // 刷新消息列表
      // 实际应用中应该监听事件或轮询更新
      setTimeout(() => {
        const newMessage = {
          messageId: ethers.utils.id(Date.now().toString()),
          sourceChainId: selectedSourceChain,
          targetChainId: selectedTargetChain,
          sender: account,
          recipient: recipient,
          payload: ethers.utils.hexlify(payload),
          timestamp: Date.now(),
          isProcessed: false
        };
        
        setMessages([newMessage, ...messages]);
      }, 1000);
      
    } catch (error) {
      console.error('发送跨链消息失败:', error);
      addNotification('error', '发送失败', '发送跨链消息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 查看交易详情
  const viewTransactionDetails = (record) => {
    setTransactionDetails(record);
    setDetailsVisible(true);
  };

  // 刷新数据
  const refreshData = () => {
    if (activeTab === 'transactions') {
      // 刷新交易历史
      const loadTransactions = async () => {
        if (!adapterContract || !account) return;
  
        try {
          setRefreshing(true);
          
          // 实际应用中应该从合约获取最新数据
          // 这里简单模拟刷新
          setTimeout(() => {
            setRefreshing(false);
          }, 1000);
          
        } catch (error) {
          console.error('刷新交易历史失败:', error);
          addNotification('error', '刷新失败', '无法刷新交易历史');
          setRefreshing(false);
        }
      };
  
      loadTransactions();
    } else if (activeTab === 'messages') {
      // 刷新消息历史
      const loadMessages = async () => {
        if (!adapterContract || !account) return;
  
        try {
          setRefreshing(true);
          
          // 实际应用中应该从合约获取最新数据
          // 这里简单模拟刷新
          setTimeout(() => {
            setRefreshing(false);
          }, 1000);
          
        } catch (error) {
          console.error('刷新消息历史失败:', error);
          addNotification('error', '刷新失败', '无法刷新消息历史');
          setRefreshing(false);
        }
      };
  
      loadMessages();
    }
  };

  // 交易表格列定义
  const transactionColumns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={txStatusMap[status].color} 
          text={txStatusMap[status].text} 
          icon={txStatusMap[status].icon} 
        />
      )
    },
    {
      title: '源链',
      dataIndex: 'sourceChainId',
      key: 'sourceChainId',
      render: (chainId) => {
        const chain = supportedChains.find(c => c.id === chainId);
        return chain ? chain.name : chainId;
      }
    },
    {
      title: '目标链',
      dataIndex: 'targetChainId',
      key: 'targetChainId',
      render: (chainId) => {
        const chain = supportedChains.find(c => c.id === chainId);
        return chain ? chain.name : chainId;
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => ethers.utils.formatEther(amount)
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => viewTransactionDetails(record)}>
          详情
        </Button>
      )
    }
  ];

  // 消息表格列定义
  const messageColumns = [
    {
      title: '状态',
      dataIndex: 'isProcessed',
      key: 'isProcessed',
      render: (isProcessed) => (
        <Badge 
          status={isProcessed ? 'success' : 'processing'} 
          text={isProcessed ? '已处理' : '处理中'} 
          icon={isProcessed ? <CheckCircleOutlined /> : <LoadingOutlined />} 
        />
      )
    },
    {
      title: '源链',
      dataIndex: 'sourceChainId',
      key: 'sourceChainId',
      render: (chainId) => {
        const chain = supportedChains.find(c => c.id === chainId);
        return chain ? chain.name : chainId;
      }
    },
    {
      title: '目标链',
      dataIndex: 'targetChainId',
      key: 'targetChainId',
      render: (chainId) => {
        const chain = supportedChains.find(c => c.id === chainId);
        return chain ? chain.name : chainId;
      }
    },
    {
      title: '发送者',
      dataIndex: 'sender',
      key: 'sender',
      render: (sender) => `${sender.substring(0, 6)}...${sender.substring(sender.length - 4)}`
    },
    {
      title: '接收者',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (recipient) => `${recipient.substring(0, 6)}...${recipient.substring(recipient.length - 4)}`
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Tooltip title={`消息ID: ${record.messageId}`}>
          <Button type="link">
            <InfoCircleOutlined />
          </Button>
        </Tooltip>
      )
    }
  ];

  // 如果未连接钱包，显示提示
  if (!isConnected) {
    return (
      <Card className="multi-chain-adapter-container">
        <Alert
          message="请连接钱包"
          description="请连接钱包以使用跨链适配器功能。"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div className="multi-chain-adapter-container">
      <Card 
        title={
          <div className="adapter-header">
            <span>跨链适配器</span>
            <Badge count={supportedChains.length} overflowCount={99} className="chain-count-badge">
              <span className="chain-count-text">支持的链</span>
            </Badge>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<SwapOutlined />} 
            onClick={refreshData}
            loading={refreshing}
          >
            刷新
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="资产管理" key="assets">
            <div className="adapter-section">
              <h3>跨链资产转移</h3>
              <p className="section-description">
                在不同区块链网络间安全转移您的资产，支持代币和NFT。
              </p>
              
              <Form layout="vertical">
                <Form.Item label="源链">
                  <Select
                    placeholder="选择源链"
                    value={selectedSourceChain}
                    onChange={handleSourceChainChange}
                    disabled={loading}
                  >
                    {supportedChains.map(chain => (
                      <Option key={chain.id} value={chain.id}>{chain.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item label="目标链">
                  <Select
                    placeholder="选择目标链"
                    value={selectedTargetChain}
                    onChange={handleTargetChainChange}
                    disabled={loading}
                  >
                    {supportedChains
                      .filter(chain => chain.id !== selectedSourceChain)
                      .map(chain => (
                        <Option key={chain.id} value={chain.id}>{chain.name}</Option>
                      ))}
                  </Select>
                </Form.Item>
                
                <Form.Item label="资产">
                  <Select
                    placeholder="选择资产"
                    value={selectedAsset}
                    onChange={handleAssetChange}
                    disabled={loading || !selectedSourceChain}
                  >
                    {assets.map(asset => (
                      <Option key={asset.address} value={asset.address}>
                        {asset.name} ({asset.symbol})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item label="接收地址">
                  <Input
                    placeholder="输入接收地址"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    disabled={loading}
                  />
                </Form.Item>
                
                <Form.Item label="金额">
                  <Input
                    placeholder="输入金额"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={loading}
                    type="number"
                    min="0"
                    step="0.000001"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleInitiateTransaction}
                    loading={loading}
                    disabled={!selectedTargetChain || !selectedAsset || !recipient || !amount}
                    icon={<SwapOutlined />}
                    block
                  >
                    发起跨链交易
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          
          <TabPane tab="交易历史" key="transactions">
            <div className="adapter-section">
              <h3>跨链交易历史</h3>
              <p className="section-description">
                查看您的跨链交易记录和状态。
              </p>
              
              <Table
                dataSource={transactions}
                columns={transactionColumns}
                rowKey="txHash"
                loading={refreshing}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </TabPane>
          
          <TabPane tab="消息传递" key="messages">
            <div className="adapter-section">
              <h3>跨链消息</h3>
              <p className="section-description">
                在不同区块链网络间发送和接收消息。
              </p>
              
              <Form layout="vertical">
                <Form.Item label="目标链">
                  <Select
                    placeholder="选择目标链"
                    value={selectedTargetChain}
                    onChange={handleTargetChainChange}
                    disabled={loading}
                  >
                    {supportedChains
                      .filter(chain => chain.id !== selectedSourceChain)
                      .map(chain => (
                        <Option key={chain.id} value={chain.id}>{chain.name}</Option>
                      ))}
                  </Select>
                </Form.Item>
                
                <Form.Item label="接收地址">
                  <Input
                    placeholder="输入接收地址"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    disabled={loading}
                  />
                </Form.Item>
                
                <Form.Item label="消息内容">
                  <Input.TextArea
                    placeholder="输入消息内容"
                    value={messagePayload}
                    onChange={e => setMessagePayload(e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!selectedTargetChain || !recipient || !messagePayload}
                    icon={<LinkOutlined />}
                    block
                  >
                    发送跨链消息
                  </Button>
                </Form.Item>
              </Form>
              
              <h3 className="mt-4">消息历史</h3>
              <Table
                dataSource={messages}
                columns={messageColumns}
                rowKey="messageId"
                loading={refreshing}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 交易详情模态框 */}
      <Modal
        title="交易详情"
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {transactionDetails && (
          <div className="transaction-details">
            <p><strong>交易哈希:</strong> {transactionDetails.txHash}</p>
            <p>
              <strong>状态:</strong> 
              <Badge 
                status={txStatusMap[transactionDetails.status].color} 
                text={txStatusMap[transactionDetails.status].text} 
                style={{ marginLeft: '8px' }}
              />
            </p>
            <p>
              <strong>源链:</strong> {
                supportedChains.find(c => c.id === transactionDetails.sourceChainId)?.name || 
                transactionDetails.sourceChainId
              }
            </p>
            <p>
              <strong>目标链:</strong> {
                supportedChains.find(c => c.id === transactionDetails.targetChainId)?.name || 
                transactionDetails.targetChainId
              }
            </p>
            <p><strong>源资产:</strong> {transactionDetails.sourceAsset}</p>
            <p><strong>目标资产:</strong> {transactionDetails.targetAsset}</p>
            <p><strong>发送者:</strong> {transactionDetails.sender}</p>
            <p><strong>接收者:</strong> {transactionDetails.recipient}</p>
            <p><strong>金额:</strong> {ethers.utils.formatEther(transactionDetails.amount)}</p>
            <p><strong>时间:</strong> {new Date(transactionDetails.timestamp).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MultiChainAdapter;
