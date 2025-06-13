import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Card, Tabs, Button, Form, Input, Select, Table, Spin, Alert, Typography, Statistic, Row, Col, Divider, Modal, notification, Tag, Tooltip } from 'antd';
import { PlusOutlined, MinusOutlined, SwapOutlined, SettingOutlined, ReloadOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';
import LiquidityPoolABI from '../../contracts/abis/LiquidityPoolABI';
import NFTDerivativesABI from '../../contracts/abis/NFTDerivativesABI';
import MultiChainAdapterABI from '../../contracts/abis/MultiChainAdapterABI';
import './LiquidityPool.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * 市场流动性池组件
 * 提供NFT衍生品市场的流动性管理、交易和跨链流动性功能
 */
const LiquidityPool = ({ poolAddress }) => {
  // Web3上下文
  const { provider, account, chainId, isConnected } = useContext(Web3Context);
  const { addNotification } = useContext(NotificationContext);

  // 合约实例
  const [poolContract, setPoolContract] = useState(null);
  const [nftDerivativesContract, setNftDerivativesContract] = useState(null);
  const [multiChainAdapterContract, setMultiChainAdapterContract] = useState(null);

  // 组件状态
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [isManager, setIsManager] = useState(false);
  const [isOperator, setIsOperator] = useState(false);

  // 池数据
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [activePairs, setActivePairs] = useState([]);
  const [userLiquidity, setUserLiquidity] = useState({});
  const [poolInfo, setPoolInfo] = useState({});
  const [pairInfo, setPairInfo] = useState({});
  const [crossChainLiquidity, setCrossChainLiquidity] = useState([]);

  // 表单状态
  const [addLiquidityForm] = Form.useForm();
  const [removeLiquidityForm] = Form.useForm();
  const [swapForm] = Form.useForm();
  const [crossChainForm] = Form.useForm();
  const [createPoolForm] = Form.useForm();
  const [createPairForm] = Form.useForm();

  // 模态框状态
  const [createPoolModalVisible, setCreatePoolModalVisible] = useState(false);
  const [createPairModalVisible, setCreatePairModalVisible] = useState(false);
  const [pairDetailsModalVisible, setPairDetailsModalVisible] = useState(false);
  const [selectedPairHash, setSelectedPairHash] = useState(null);

  // 初始化
  useEffect(() => {
    if (isConnected && provider && poolAddress) {
      initializeContracts();
    }
  }, [isConnected, provider, poolAddress, account]);

  // 初始化合约
  const initializeContracts = async () => {
    try {
      setLoading(true);

      // 初始化流动性池合约
      const signer = provider.getSigner();
      const pool = new ethers.Contract(poolAddress, LiquidityPoolABI, signer);
      setPoolContract(pool);

      // 获取NFT衍生品合约地址
      const nftDerivativesAddress = await pool.nftDerivatives();
      const nftDerivatives = new ethers.Contract(nftDerivativesAddress, NFTDerivativesABI, signer);
      setNftDerivativesContract(nftDerivatives);

      // 获取跨链适配器合约地址
      const multiChainAdapterAddress = await pool.multiChainAdapter();
      const multiChainAdapter = new ethers.Contract(multiChainAdapterAddress, MultiChainAdapterABI, signer);
      setMultiChainAdapterContract(multiChainAdapter);

      // 检查用户角色
      const managerRole = await pool.MANAGER_ROLE();
      const operatorRole = await pool.OPERATOR_ROLE();
      const isUserManager = await pool.hasRole(managerRole, account);
      const isUserOperator = await pool.hasRole(operatorRole, account);
      setIsManager(isUserManager);
      setIsOperator(isUserOperator);

      // 加载数据
      await loadPoolData();

      setLoading(false);
    } catch (error) {
      console.error("初始化合约失败:", error);
      addNotification({
        type: 'error',
        message: '初始化失败',
        description: '无法初始化流动性池合约，请检查网络连接或合约地址。'
      });
      setLoading(false);
    }
  };

  // 加载池数据
  const loadPoolData = async () => {
    try {
      if (!poolContract) return;

      // 获取支持的代币
      const tokenCount = await poolContract.getSupportedTokenCount();
      const tokens = [];
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await poolContract.supportedTokens(i);
        const poolData = await poolContract.pools(tokenAddress);
        tokens.push({
          address: tokenAddress,
          totalLiquidity: ethers.utils.formatEther(poolData.totalLiquidity),
          totalShares: ethers.utils.formatEther(poolData.totalShares),
          feeRate: poolData.feeRate.toNumber() / 100, // 转换为百分比
          isActive: poolData.isActive
        });
      }
      setSupportedTokens(tokens);

      // 获取活跃交易对
      const pairCount = await poolContract.getActivePairCount();
      const pairs = [];
      const pairsData = {};
      for (let i = 0; i < pairCount; i++) {
        const pairHash = await poolContract.activePairs(i);
        const [baseToken, quoteToken, baseReserve, quoteReserve, kValue] = await poolContract.getPairInfo(pairHash);
        const pair = {
          hash: pairHash,
          baseToken,
          quoteToken,
          baseReserve: ethers.utils.formatEther(baseReserve),
          quoteReserve: ethers.utils.formatEther(quoteReserve),
          kValue: ethers.utils.formatEther(kValue)
        };
        pairs.push(pair);
        pairsData[pairHash] = pair;
      }
      setActivePairs(pairs);
      setPairInfo(pairsData);

      // 获取用户流动性
      const userLiquidityData = {};
      for (const token of tokens) {
        const [shares, liquidity] = await poolContract.getUserLiquidity(token.address, account);
        userLiquidityData[token.address] = {
          shares: ethers.utils.formatEther(shares),
          liquidity: ethers.utils.formatEther(liquidity)
        };
      }
      setUserLiquidity(userLiquidityData);

      // 获取池信息
      const poolInfoData = {};
      for (const token of tokens) {
        poolInfoData[token.address] = {
          totalLiquidity: token.totalLiquidity,
          totalShares: token.totalShares,
          feeRate: token.feeRate,
          isActive: token.isActive
        };
      }
      setPoolInfo(poolInfoData);

      // 获取跨链流动性信息
      // 注意：这里需要根据实际情况获取支持的链ID列表
      const supportedChainIds = [1, 56, 137, 42161]; // 示例：以太坊、BSC、Polygon、Arbitrum
      const crossChainData = [];
      for (const chainId of supportedChainIds) {
        for (const token of tokens) {
          try {
            const ccl = await poolContract.crossChainLiquidity(chainId, token.address);
            if (ccl.chainId.toNumber() !== 0 && ccl.isActive) {
              crossChainData.push({
                chainId: chainId,
                token: token.address,
                remotePool: ccl.remotePool,
                bridgedLiquidity: ethers.utils.formatEther(ccl.bridgedLiquidity),
                isActive: ccl.isActive
              });
            }
          } catch (error) {
            console.error(`获取跨链流动性信息失败 (chainId: ${chainId}, token: ${token.address}):`, error);
          }
        }
      }
      setCrossChainLiquidity(crossChainData);

    } catch (error) {
      console.error("加载池数据失败:", error);
      addNotification({
        type: 'error',
        message: '加载失败',
        description: '无法加载流动性池数据，请检查网络连接或刷新页面。'
      });
    }
  };

  // 刷新数据
  const refreshData = async () => {
    setRefreshing(true);
    await loadPoolData();
    setRefreshing(false);
  };

  // 添加流动性
  const handleAddLiquidity = async (values) => {
    try {
      const { token, amount } = values;
      
      // 转换为wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // 检查授权
      const tokenContract = new ethers.Contract(
        token,
        ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
        provider.getSigner()
      );
      
      const allowance = await tokenContract.allowance(account, poolAddress);
      if (allowance.lt(amountWei)) {
        // 需要授权
        const tx = await tokenContract.approve(poolAddress, ethers.constants.MaxUint256);
        await tx.wait();
        
        addNotification({
          type: 'success',
          message: '授权成功',
          description: '已成功授权流动性池合约使用您的代币。'
        });
      }
      
      // 添加流动性
      const tx = await poolContract.addLiquidity(token, amountWei);
      await tx.wait();
      
      addNotification({
        type: 'success',
        message: '添加流动性成功',
        description: `已成功添加 ${amount} 代币到流动性池。`
      });
      
      // 重置表单并刷新数据
      addLiquidityForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("添加流动性失败:", error);
      addNotification({
        type: 'error',
        message: '添加流动性失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 移除流动性
  const handleRemoveLiquidity = async (values) => {
    try {
      const { token, shares } = values;
      
      // 转换为wei
      const sharesWei = ethers.utils.parseEther(shares.toString());
      
      // 移除流动性
      const tx = await poolContract.removeLiquidity(token, sharesWei);
      await tx.wait();
      
      addNotification({
        type: 'success',
        message: '移除流动性成功',
        description: `已成功从流动性池移除 ${shares} 份额。`
      });
      
      // 重置表单并刷新数据
      removeLiquidityForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("移除流动性失败:", error);
      addNotification({
        type: 'error',
        message: '移除流动性失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 交换代币
  const handleSwap = async (values) => {
    try {
      const { pair, fromToken, toToken, amountIn, slippage } = values;
      
      // 转换为wei
      const amountInWei = ethers.utils.parseEther(amountIn.toString());
      
      // 获取报价
      const amountOutWei = await poolContract.getSwapQuote(pair, fromToken, toToken, amountInWei);
      
      // 计算最小输出金额（考虑滑点）
      const slippageBps = Math.floor(parseFloat(slippage) * 100);
      const minAmountOutWei = amountOutWei.mul(10000 - slippageBps).div(10000);
      
      // 检查授权
      const tokenContract = new ethers.Contract(
        fromToken,
        ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
        provider.getSigner()
      );
      
      const allowance = await tokenContract.allowance(account, poolAddress);
      if (allowance.lt(amountInWei)) {
        // 需要授权
        const tx = await tokenContract.approve(poolAddress, ethers.constants.MaxUint256);
        await tx.wait();
        
        addNotification({
          type: 'success',
          message: '授权成功',
          description: '已成功授权流动性池合约使用您的代币。'
        });
      }
      
      // 执行交换
      const tx = await poolContract.swap(pair, fromToken, toToken, amountInWei, minAmountOutWei);
      await tx.wait();
      
      addNotification({
        type: 'success',
        message: '交换成功',
        description: `已成功交换 ${amountIn} 代币。`
      });
      
      // 重置表单并刷新数据
      swapForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("交换代币失败:", error);
      addNotification({
        type: 'error',
        message: '交换代币失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 添加跨链流动性
  const handleAddCrossChainLiquidity = async (values) => {
    try {
      const { chainId, token, remotePool, amount } = values;
      
      // 转换为wei
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // 检查授权
      const tokenContract = new ethers.Contract(
        token,
        ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
        provider.getSigner()
      );
      
      const allowance = await tokenContract.allowance(account, poolAddress);
      if (allowance.lt(amountWei)) {
        // 需要授权
        const tx = await tokenContract.approve(poolAddress, ethers.constants.MaxUint256);
        await tx.wait();
        
        addNotification({
          type: 'success',
          message: '授权成功',
          description: '已成功授权流动性池合约使用您的代币。'
        });
      }
      
      // 添加跨链流动性
      const tx = await poolContract.addCrossChainLiquidity(chainId, token, remotePool, amountWei);
      await tx.wait();
      
      addNotification({
        type: 'success',
        message: '添加跨链流动性成功',
        description: `已成功添加 ${amount} 代币到链 ${chainId} 的跨链流动性池。`
      });
      
      // 重置表单并刷新数据
      crossChainForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("添加跨链流动性失败:", error);
      addNotification({
        type: 'error',
        message: '添加跨链流动性失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 创建流动性池
  const handleCreatePool = async (values) => {
    try {
      const { token, initialLiquidity, feeRate } = values;
      
      // 转换为wei和基点
      const initialLiquidityWei = ethers.utils.parseEther(initialLiquidity.toString());
      const feeRateBps = Math.floor(parseFloat(feeRate) * 100); // 转换为基点 (1% = 100)
      
      // 如果有初始流动性，需要授权
      if (parseFloat(initialLiquidity) > 0) {
        const tokenContract = new ethers.Contract(
          token,
          ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
          provider.getSigner()
        );
        
        const allowance = await tokenContract.allowance(account, poolAddress);
        if (allowance.lt(initialLiquidityWei)) {
          // 需要授权
          const tx = await tokenContract.approve(poolAddress, ethers.constants.MaxUint256);
          await tx.wait();
          
          addNotification({
            type: 'success',
            message: '授权成功',
            description: '已成功授权流动性池合约使用您的代币。'
          });
        }
      }
      
      // 创建池
      const tx = await poolContract.createPool(token, initialLiquidityWei, feeRateBps);
      await tx.wait();
      
      addNotification({
        type: 'success',
        message: '创建流动性池成功',
        description: `已成功创建代币 ${token} 的流动性池。`
      });
      
      // 关闭模态框，重置表单并刷新数据
      setCreatePoolModalVisible(false);
      createPoolForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("创建流动性池失败:", error);
      addNotification({
        type: 'error',
        message: '创建流动性池失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 创建交易对
  const handleCreatePair = async (values) => {
    try {
      const { baseToken, quoteToken, baseAmount, quoteAmount } = values;
      
      // 创建交易对
      const tx1 = await poolContract.createPair(baseToken, quoteToken);
      await tx1.wait();
      
      // 获取交易对哈希
      const pairHash = ethers.utils.solidityKeccak256(
        ['address', 'address'],
        [baseToken, quoteToken]
      );
      
      // 如果提供了初始流动性，则初始化
      if (parseFloat(baseAmount) > 0 && parseFloat(quoteAmount) > 0) {
        // 转换为wei
        const baseAmountWei = ethers.utils.parseEther(baseAmount.toString());
        const quoteAmountWei = ethers.utils.parseEther(quoteAmount.toString());
        
        // 授权基础代币
        const baseTokenContract = new ethers.Contract(
          baseToken,
          ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
          provider.getSigner()
        );
        
        const baseAllowance = await baseTokenContract.allowance(account, poolAddress);
        if (baseAllowance.lt(baseAmountWei)) {
          const tx2 = await baseTokenContract.approve(poolAddress, ethers.constants.MaxUint256);
          await tx2.wait();
        }
        
        // 授权报价代币
        const quoteTokenContract = new ethers.Contract(
          quoteToken,
          ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
          provider.getSigner()
        );
        
        const quoteAllowance = await quoteTokenContract.allowance(account, poolAddress);
        if (quoteAllowance.lt(quoteAmountWei)) {
          const tx3 = await quoteTokenContract.approve(poolAddress, ethers.constants.MaxUint256);
          await tx3.wait();
        }
        
        // 初始化交易对流动性
        const tx4 = await poolContract.initializePairLiquidity(pairHash, baseAmountWei, quoteAmountWei);
        await tx4.wait();
      }
      
      addNotification({
        type: 'success',
        message: '创建交易对成功',
        description: `已成功创建 ${baseToken} 和 ${quoteToken} 的交易对。`
      });
      
      // 关闭模态框，重置表单并刷新数据
      setCreatePairModalVisible(false);
      createPairForm.resetFields();
      await refreshData();
      
    } catch (error) {
      console.error("创建交易对失败:", error);
      addNotification({
        type: 'error',
        message: '创建交易对失败',
        description: error.message || '操作过程中发生错误，请稍后重试。'
      });
    }
  };

  // 查看交易对详情
  const handleViewPairDetails = (pairHash) => {
    setSelectedPairHash(pairHash);
    setPairDetailsModalVisible(true);
  };

  // 获取代币符号（简化版，实际应调用合约）
  const getTokenSymbol = (address) => {
    // 这里应该调用合约获取代币符号，为简化示例，使用地址的简短形式
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // 获取链名称
  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  // 渲染流动性池列表
  const renderPoolsList = () => {
    const columns = [
      {
        title: '代币',
        dataIndex: 'address',
        key: 'address',
        render: (address) => getTokenSymbol(address)
      },
      {
        title: '总流动性',
        dataIndex: 'totalLiquidity',
        key: 'totalLiquidity',
        render: (value) => parseFloat(value).toFixed(6)
      },
      {
        title: '总份额',
        dataIndex: 'totalShares',
        key: 'totalShares',
        render: (value) => parseFloat(value).toFixed(6)
      },
      {
        title: '手续费率',
        dataIndex: 'feeRate',
        key: 'feeRate',
        render: (value) => `${value}%`
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive) => (
          isActive ? 
            <Tag color="green" icon={<CheckCircleOutlined />}>活跃</Tag> : 
            <Tag color="red" icon={<CloseCircleOutlined />}>非活跃</Tag>
        )
      },
      {
        title: '我的流动性',
        key: 'userLiquidity',
        render: (_, record) => {
          const userLiq = userLiquidity[record.address] || { shares: '0', liquidity: '0' };
          return parseFloat(userLiq.liquidity).toFixed(6);
        }
      },
      {
        title: '我的份额',
        key: 'userShares',
        render: (_, record) => {
          const userLiq = userLiquidity[record.address] || { shares: '0', liquidity: '0' };
          return parseFloat(userLiq.shares).toFixed(6);
        }
      }
    ];

    return (
      <div className="pools-list-container">
        <div className="list-header">
          <Title level={4}>流动性池列表</Title>
          {isManager && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setCreatePoolModalVisible(true)}
            >
              创建新池
            </Button>
          )}
        </div>
        <Table 
          dataSource={supportedTokens} 
          columns={columns} 
          rowKey="address"
          pagination={false}
          loading={loading || refreshing}
        />
      </div>
    );
  };

  // 渲染交易对列表
  const renderPairsList = () => {
    const columns = [
      {
        title: '交易对',
        key: 'pair',
        render: (_, record) => (
          <span>
            {getTokenSymbol(record.baseToken)} / {getTokenSymbol(record.quoteToken)}
          </span>
        )
      },
      {
        title: '基础代币储备',
        dataIndex: 'baseReserve',
        key: 'baseReserve',
        render: (value) => parseFloat(value).toFixed(6)
      },
      {
        title: '报价代币储备',
        dataIndex: 'quoteReserve',
        key: 'quoteReserve',
        render: (value) => parseFloat(value).toFixed(6)
      },
      {
        title: 'K值',
        dataIndex: 'kValue',
        key: 'kValue',
        render: (value) => parseFloat(value).toFixed(2)
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="link" 
            onClick={() => handleViewPairDetails(record.hash)}
          >
            详情
          </Button>
        )
      }
    ];

    return (
      <div className="pairs-list-container">
        <div className="list-header">
          <Title level={4}>交易对列表</Title>
          {isManager && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setCreatePairModalVisible(true)}
            >
              创建交易对
            </Button>
          )}
        </div>
        <Table 
          dataSource={activePairs} 
          columns={columns} 
          rowKey="hash"
          pagination={false}
          loading={loading || refreshing}
        />
      </div>
    );
  };

  // 渲染跨链流动性列表
  const renderCrossChainLiquidityList = () => {
    const columns = [
      {
        title: '链',
        dataIndex: 'chainId',
        key: 'chainId',
        render: (chainId) => getChainName(chainId)
      },
      {
        title: '代币',
        dataIndex: 'token',
        key: 'token',
        render: (address) => getTokenSymbol(address)
      },
      {
        title: '远程池地址',
        dataIndex: 'remotePool',
        key: 'remotePool',
        render: (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      },
      {
        title: '桥接流动性',
        dataIndex: 'bridgedLiquidity',
        key: 'bridgedLiquidity',
        render: (value) => parseFloat(value).toFixed(6)
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive) => (
          isActive ? 
            <Tag color="green" icon={<CheckCircleOutlined />}>活跃</Tag> : 
            <Tag color="red" icon={<CloseCircleOutlined />}>非活跃</Tag>
        )
      }
    ];

    return (
      <div className="cross-chain-list-container">
        <Title level={4}>跨链流动性</Title>
        <Table 
          dataSource={crossChainLiquidity} 
          columns={columns} 
          rowKey={(record) => `${record.chainId}-${record.token}`}
          pagination={false}
          loading={loading || refreshing}
        />
      </div>
    );
  };

  // 渲染添加流动性表单
  const renderAddLiquidityForm = () => {
    return (
      <Card title="添加流动性" className="form-card">
        <Form
          form={addLiquidityForm}
          layout="vertical"
          onFinish={handleAddLiquidity}
        >
          <Form.Item
            name="token"
            label="选择代币"
            rules={[{ required: true, message: '请选择代币' }]}
          >
            <Select placeholder="选择代币">
              {supportedTokens.filter(token => token.isActive).map(token => (
                <Option key={token.address} value={token.address}>
                  {getTokenSymbol(token.address)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0, message: '金额必须大于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入金额" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加流动性
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // 渲染移除流动性表单
  const renderRemoveLiquidityForm = () => {
    return (
      <Card title="移除流动性" className="form-card">
        <Form
          form={removeLiquidityForm}
          layout="vertical"
          onFinish={handleRemoveLiquidity}
        >
          <Form.Item
            name="token"
            label="选择代币"
            rules={[{ required: true, message: '请选择代币' }]}
          >
            <Select 
              placeholder="选择代币"
              onChange={(value) => {
                const userLiq = userLiquidity[value] || { shares: '0', liquidity: '0' };
                removeLiquidityForm.setFieldsValue({
                  maxShares: userLiq.shares
                });
              }}
            >
              {supportedTokens.map(token => (
                <Option key={token.address} value={token.address}>
                  {getTokenSymbol(token.address)} (可用: {parseFloat(userLiquidity[token.address]?.shares || 0).toFixed(6)})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="maxShares"
            label="可用份额"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="shares"
            label="移除份额"
            rules={[
              { required: true, message: '请输入份额' },
              { type: 'number', min: 0, message: '份额必须大于0' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const token = getFieldValue('token');
                  const userLiq = userLiquidity[token] || { shares: '0', liquidity: '0' };
                  if (!value || parseFloat(value) <= parseFloat(userLiq.shares)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('份额不能超过可用份额'));
                }
              })
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入份额" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              移除流动性
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // 渲染交换表单
  const renderSwapForm = () => {
    return (
      <Card title="交换代币" className="form-card">
        <Form
          form={swapForm}
          layout="vertical"
          onFinish={handleSwap}
        >
          <Form.Item
            name="pair"
            label="选择交易对"
            rules={[{ required: true, message: '请选择交易对' }]}
          >
            <Select 
              placeholder="选择交易对"
              onChange={(value) => {
                const pair = activePairs.find(p => p.hash === value);
                if (pair) {
                  swapForm.setFieldsValue({
                    fromToken: pair.baseToken,
                    toToken: pair.quoteToken
                  });
                }
              }}
            >
              {activePairs.map(pair => (
                <Option key={pair.hash} value={pair.hash}>
                  {getTokenSymbol(pair.baseToken)} / {getTokenSymbol(pair.quoteToken)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fromToken"
            label="从"
            rules={[{ required: true, message: '请选择源代币' }]}
          >
            <Select placeholder="选择源代币">
              {activePairs.map(pair => (
                <React.Fragment key={pair.hash}>
                  <Option value={pair.baseToken}>{getTokenSymbol(pair.baseToken)}</Option>
                  <Option value={pair.quoteToken}>{getTokenSymbol(pair.quoteToken)}</Option>
                </React.Fragment>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="toToken"
            label="到"
            rules={[{ required: true, message: '请选择目标代币' }]}
          >
            <Select placeholder="选择目标代币">
              {activePairs.map(pair => (
                <React.Fragment key={pair.hash}>
                  <Option value={pair.baseToken}>{getTokenSymbol(pair.baseToken)}</Option>
                  <Option value={pair.quoteToken}>{getTokenSymbol(pair.quoteToken)}</Option>
                </React.Fragment>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="amountIn"
            label="输入金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0, message: '金额必须大于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入金额" />
          </Form.Item>
          <Form.Item
            name="slippage"
            label="滑点容忍度 (%)"
            initialValue="0.5"
            rules={[
              { required: true, message: '请输入滑点容忍度' },
              { type: 'number', min: 0, max: 100, message: '滑点必须在0-100%之间' }
            ]}
          >
            <Input type="number" step="0.1" placeholder="输入滑点容忍度" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block icon={<SwapOutlined />}>
              交换
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // 渲染跨链流动性表单
  const renderCrossChainLiquidityForm = () => {
    return (
      <Card title="添加跨链流动性" className="form-card">
        <Form
          form={crossChainForm}
          layout="vertical"
          onFinish={handleAddCrossChainLiquidity}
        >
          <Form.Item
            name="chainId"
            label="目标链"
            rules={[{ required: true, message: '请选择目标链' }]}
          >
            <Select placeholder="选择目标链">
              <Option value={1}>Ethereum</Option>
              <Option value={56}>BSC</Option>
              <Option value={137}>Polygon</Option>
              <Option value={42161}>Arbitrum</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="token"
            label="代币"
            rules={[{ required: true, message: '请选择代币' }]}
          >
            <Select placeholder="选择代币">
              {supportedTokens.filter(token => token.isActive).map(token => (
                <Option key={token.address} value={token.address}>
                  {getTokenSymbol(token.address)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="remotePool"
            label="远程池地址"
            rules={[
              { required: true, message: '请输入远程池地址' },
              { pattern: /^0x[a-fA-F0-9]{40}$/, message: '请输入有效的以太坊地址' }
            ]}
          >
            <Input placeholder="输入远程池地址" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0, message: '金额必须大于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入金额" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加跨链流动性
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // 渲染创建池模态框
  const renderCreatePoolModal = () => {
    return (
      <Modal
        title="创建新流动性池"
        visible={createPoolModalVisible}
        onCancel={() => setCreatePoolModalVisible(false)}
        footer={null}
      >
        <Form
          form={createPoolForm}
          layout="vertical"
          onFinish={handleCreatePool}
        >
          <Form.Item
            name="token"
            label="代币地址"
            rules={[
              { required: true, message: '请输入代币地址' },
              { pattern: /^0x[a-fA-F0-9]{40}$/, message: '请输入有效的以太坊地址' }
            ]}
          >
            <Input placeholder="输入代币地址" />
          </Form.Item>
          <Form.Item
            name="initialLiquidity"
            label="初始流动性"
            initialValue="0"
            rules={[
              { required: true, message: '请输入初始流动性' },
              { type: 'number', min: 0, message: '初始流动性必须大于等于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入初始流动性" />
          </Form.Item>
          <Form.Item
            name="feeRate"
            label="手续费率 (%)"
            initialValue="0.3"
            rules={[
              { required: true, message: '请输入手续费率' },
              { type: 'number', min: 0, max: 10, message: '手续费率必须在0-10%之间' }
            ]}
          >
            <Input type="number" step="0.1" placeholder="输入手续费率" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建池
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // 渲染创建交易对模态框
  const renderCreatePairModal = () => {
    return (
      <Modal
        title="创建新交易对"
        visible={createPairModalVisible}
        onCancel={() => setCreatePairModalVisible(false)}
        footer={null}
      >
        <Form
          form={createPairForm}
          layout="vertical"
          onFinish={handleCreatePair}
        >
          <Form.Item
            name="baseToken"
            label="基础代币"
            rules={[{ required: true, message: '请选择基础代币' }]}
          >
            <Select placeholder="选择基础代币">
              {supportedTokens.filter(token => token.isActive).map(token => (
                <Option key={token.address} value={token.address}>
                  {getTokenSymbol(token.address)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quoteToken"
            label="报价代币"
            rules={[
              { required: true, message: '请选择报价代币' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('baseToken') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('基础代币和报价代币不能相同'));
                }
              })
            ]}
          >
            <Select placeholder="选择报价代币">
              {supportedTokens.filter(token => token.isActive).map(token => (
                <Option key={token.address} value={token.address}>
                  {getTokenSymbol(token.address)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Divider>初始流动性（可选）</Divider>
          <Form.Item
            name="baseAmount"
            label="基础代币金额"
            initialValue="0"
            rules={[
              { required: true, message: '请输入基础代币金额' },
              { type: 'number', min: 0, message: '金额必须大于等于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入基础代币金额" />
          </Form.Item>
          <Form.Item
            name="quoteAmount"
            label="报价代币金额"
            initialValue="0"
            rules={[
              { required: true, message: '请输入报价代币金额' },
              { type: 'number', min: 0, message: '金额必须大于等于0' }
            ]}
          >
            <Input type="number" step="0.000001" placeholder="输入报价代币金额" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建交易对
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // 渲染交易对详情模态框
  const renderPairDetailsModal = () => {
    const pair = pairInfo[selectedPairHash] || {};
    
    return (
      <Modal
        title="交易对详情"
        visible={pairDetailsModalVisible}
        onCancel={() => setPairDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPairDetailsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedPairHash && (
          <>
            <Statistic title="交易对" value={`${getTokenSymbol(pair.baseToken)} / ${getTokenSymbol(pair.quoteToken)}`} />
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="基础代币" value={getTokenSymbol(pair.baseToken)} />
              </Col>
              <Col span={12}>
                <Statistic title="报价代币" value={getTokenSymbol(pair.quoteToken)} />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic title="基础代币储备" value={parseFloat(pair.baseReserve).toFixed(6)} />
              </Col>
              <Col span={12}>
                <Statistic title="报价代币储备" value={parseFloat(pair.quoteReserve).toFixed(6)} />
              </Col>
            </Row>
            <Divider />
            <Statistic title="K值" value={parseFloat(pair.kValue).toFixed(2)} />
            <Paragraph style={{ marginTop: 16 }}>
              <Text type="secondary">
                交易对哈希: {selectedPairHash}
              </Text>
            </Paragraph>
          </>
        )}
      </Modal>
    );
  };

  // 渲染钱包未连接状态
  const renderWalletNotConnected = () => {
    return (
      <div className="wallet-not-connected">
        <Alert
          message="请连接钱包"
          description="请连接钱包以使用流动性池功能"
          type="info"
          showIcon
        />
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="liquidity-pool-container">
      <div className="header">
        <Title level={2}>市场流动性池</Title>
        <div className="header-actions">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshData}
            loading={refreshing}
          >
            刷新
          </Button>
          {isManager && (
            <Tooltip title="管理员">
              <Tag color="blue" icon={<SettingOutlined />}>管理员</Tag>
            </Tooltip>
          )}
          {isOperator && (
            <Tooltip title="操作员">
              <Tag color="purple" icon={<SettingOutlined />}>操作员</Tag>
            </Tooltip>
          )}
        </div>
      </div>

      {!isConnected ? (
        renderWalletNotConnected()
      ) : loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>加载中...</p>
        </div>
      ) : (
        <>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="流动性管理" key="1">
              <div className="tab-content">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    {renderAddLiquidityForm()}
                  </Col>
                  <Col xs={24} md={12}>
                    {renderRemoveLiquidityForm()}
                  </Col>
                </Row>
                <div className="section">
                  {renderPoolsList()}
                </div>
              </div>
            </TabPane>
            <TabPane tab="交易" key="2">
              <div className="tab-content">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    {renderSwapForm()}
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="交易信息" className="info-card">
                      <Paragraph>
                        <InfoCircleOutlined /> 交易前请确认交易对和金额。
                      </Paragraph>
                      <Paragraph>
                        <WarningOutlined /> 滑点容忍度表示您愿意接受的最大价格变动百分比。
                      </Paragraph>
                      <Paragraph>
                        <InfoCircleOutlined /> 交易将收取手续费，费率根据池设置而定。
                      </Paragraph>
                    </Card>
                  </Col>
                </Row>
                <div className="section">
                  {renderPairsList()}
                </div>
              </div>
            </TabPane>
            <TabPane tab="跨链流动性" key="3">
              <div className="tab-content">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    {renderCrossChainLiquidityForm()}
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="跨链信息" className="info-card">
                      <Paragraph>
                        <InfoCircleOutlined /> 跨链流动性允许在不同区块链网络间共享流动性。
                      </Paragraph>
                      <Paragraph>
                        <WarningOutlined /> 跨链操作可能需要较长时间完成，请耐心等待。
                      </Paragraph>
                      <Paragraph>
                        <InfoCircleOutlined /> 确保目标链上的远程池地址正确，否则可能导致资金丢失。
                      </Paragraph>
                    </Card>
                  </Col>
                </Row>
                <div className="section">
                  {renderCrossChainLiquidityList()}
                </div>
              </div>
            </TabPane>
          </Tabs>

          {/* 模态框 */}
          {renderCreatePoolModal()}
          {renderCreatePairModal()}
          {renderPairDetailsModal()}
        </>
      )}
    </div>
  );
};

export default LiquidityPool;
