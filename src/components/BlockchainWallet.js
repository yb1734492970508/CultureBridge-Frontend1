import React, { useState } from 'react';
import { Card, Button, Input, message, Spin, Typography, Space, Divider } from 'antd';
import { WalletOutlined, SendOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { useBlockchain } from '../context/BlockchainContext';

const { Title, Text, Paragraph } = Typography;

const BlockchainWallet = () => {
  const {
    account,
    balance,
    networkStatus,
    tokenInfo,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    transferToken
  } = useBlockchain();

  const [transferForm, setTransferForm] = useState({
    to: '',
    amount: '',
    privateKey: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);

  // 连接钱包
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      message.success('钱包连接成功！');
    } catch (err) {
      message.error(err.message);
    }
  };

  // 断开钱包
  const handleDisconnectWallet = () => {
    disconnectWallet();
    message.info('钱包已断开连接');
  };

  // 刷新余额
  const handleRefreshBalance = async () => {
    if (account) {
      try {
        await fetchBalance(account);
        message.success('余额已刷新');
      } catch (err) {
        message.error('刷新余额失败');
      }
    }
  };

  // 复制地址
  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      message.success('地址已复制到剪贴板');
    }
  };

  // 处理转账
  const handleTransfer = async () => {
    if (!transferForm.to || !transferForm.amount) {
      message.error('请填写完整的转账信息');
      return;
    }

    if (!transferForm.privateKey) {
      message.error('请输入私钥（仅用于测试）');
      return;
    }

    try {
      setTransferLoading(true);
      const result = await transferToken(
        transferForm.to,
        transferForm.amount,
        transferForm.privateKey
      );
      
      message.success(`转账成功！交易哈希: ${result.transactionHash}`);
      setTransferForm({ to: '', amount: '', privateKey: '' });
    } catch (err) {
      message.error(err.message);
    } finally {
      setTransferLoading(false);
    }
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>CultureBridge 区块链钱包</Title>
      
      {error && (
        <Card style={{ marginBottom: '16px', borderColor: '#ff4d4f' }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}

      {/* 网络状态 */}
      {networkStatus && (
        <Card title="网络状态" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>网络: <strong>{networkStatus.network}</strong></Text>
            <Text>链ID: <strong>{networkStatus.chainId}</strong></Text>
            <Text>最新区块: <strong>{networkStatus.blockNumber}</strong></Text>
            <Text>连接状态: <strong style={{ color: networkStatus.connected ? '#52c41a' : '#ff4d4f' }}>
              {networkStatus.connected ? '已连接' : '未连接'}
            </strong></Text>
          </Space>
        </Card>
      )}

      {/* 代币信息 */}
      {tokenInfo && (
        <Card title="CBT代币信息" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>名称: <strong>{tokenInfo.name}</strong></Text>
            <Text>符号: <strong>{tokenInfo.symbol}</strong></Text>
            <Text>小数位: <strong>{tokenInfo.decimals}</strong></Text>
            <Text>总供应量: <strong>{tokenInfo.totalSupply} {tokenInfo.symbol}</strong></Text>
            <Text>合约地址: <strong>{formatAddress(tokenInfo.contractAddress)}</strong></Text>
          </Space>
        </Card>
      )}

      {/* 钱包连接 */}
      <Card title="钱包连接" style={{ marginBottom: '16px' }}>
        {!account ? (
          <Button 
            type="primary" 
            icon={<WalletOutlined />} 
            onClick={handleConnectWallet}
            loading={loading}
            size="large"
          >
            连接MetaMask钱包
          </Button>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>钱包地址: <strong>{formatAddress(account)}</strong>
              <Button 
                type="link" 
                icon={<CopyOutlined />} 
                onClick={handleCopyAddress}
                size="small"
              />
            </Text>
            <Space>
              <Button onClick={handleDisconnectWallet}>断开连接</Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefreshBalance}
                loading={loading}
              >
                刷新余额
              </Button>
            </Space>
          </Space>
        )}
      </Card>

      {/* 余额显示 */}
      {account && (
        <Card title="钱包余额" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>CBT余额: <strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {balance.cbt} CBT
            </strong></Text>
            <Text>BNB余额: <strong style={{ fontSize: '16px' }}>
              {parseFloat(balance.bnb).toFixed(4)} BNB
            </strong></Text>
          </Space>
        </Card>
      )}

      {/* 转账功能 */}
      {account && tokenInfo && (
        <Card title="CBT代币转账" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="接收地址"
              value={transferForm.to}
              onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
            />
            <Input
              placeholder="转账数量"
              type="number"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              suffix="CBT"
            />
            <Input.Password
              placeholder="私钥 (仅用于测试)"
              value={transferForm.privateKey}
              onChange={(e) => setTransferForm({ ...transferForm, privateKey: e.target.value })}
            />
            <Paragraph type="warning" style={{ fontSize: '12px' }}>
              注意: 在生产环境中，私钥应该通过MetaMask等钱包进行安全管理，不应该在前端输入。
            </Paragraph>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleTransfer}
              loading={transferLoading}
              disabled={!transferForm.to || !transferForm.amount || !transferForm.privateKey}
            >
              发送转账
            </Button>
          </Space>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>1. 首先安装并配置MetaMask钱包</Text>
          <Text>2. 切换到BSC测试网络</Text>
          <Text>3. 从水龙头获取测试BNB: <a href="https://testnet.binance.org/faucet-smart" target="_blank" rel="noopener noreferrer">BSC测试网水龙头</a></Text>
          <Text>4. 连接钱包查看CBT代币余额</Text>
          <Text>5. 使用转账功能发送CBT代币</Text>
        </Space>
      </Card>
    </div>
  );
};

export default BlockchainWallet;

