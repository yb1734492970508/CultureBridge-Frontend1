import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import AIRegistryABI from '../../contracts/abis/AIRegistry.json';
import CultureTokenABI from '../../contracts/abis/CultureToken.json';
import ToastNotification from '../notifications/ToastNotification';
import Pagination from '../common/Pagination';
import RangeSlider from '../common/RangeSlider';
import MultiSelect from '../common/MultiSelect';
import '../../styles/components/ai/AIServiceRegistry.css';

// 合约地址 - 测试网
const CONTRACT_ADDRESSES = {
  aiRegistry: '0xAIRegistry...', // 替换为实际部署地址
  cultureToken: '0xCultureToken...', // 替换为实际部署地址
};

// 服务类型选项
const SERVICE_TYPES = [
  { value: 'translation', label: '翻译服务' },
  { value: 'cultural', label: '文化解释' },
  { value: 'language', label: '语言学习' },
  { value: 'manus', label: 'Manus AI集成' },
];

// 语言选项
const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: '英语' },
  { value: 'ja-JP', label: '日语' },
  { value: 'ko-KR', label: '韩语' },
  { value: 'fr-FR', label: '法语' },
  { value: 'de-DE', label: '德语' },
  { value: 'es-ES', label: '西班牙语' },
  { value: 'ru-RU', label: '俄语' },
  { value: 'ar-SA', label: '阿拉伯语' },
];

// 服务状态枚举（与合约保持一致）
const SERVICE_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  SUSPENDED: 3,
};

// 服务状态标签
const SERVICE_STATUS_LABELS = {
  [SERVICE_STATUS.PENDING]: { label: '待审核', color: '#f39c12' },
  [SERVICE_STATUS.APPROVED]: { label: '已批准', color: '#2ecc71' },
  [SERVICE_STATUS.REJECTED]: { label: '已拒绝', color: '#e74c3c' },
  [SERVICE_STATUS.SUSPENDED]: { label: '已暂停', color: '#95a5a6' },
};

// 角色定义（与合约保持一致）
const ROLES = {
  ADMIN: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE")),
  REVIEWER: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REVIEWER_ROLE")),
  PROVIDER: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROVIDER_ROLE")),
};

// 每页显示的服务数量
const SERVICES_PER_PAGE = 6;

// 数据刷新间隔（毫秒）
const DATA_REFRESH_INTERVAL = 30000; // 30秒

const AIServiceRegistry = () => {
  // 状态变量
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [contracts, setContracts] = useState({});
  const [allServices, setAllServices] = useState([]); // 所有服务（用于筛选）
  const [services, setServices] = useState([]); // 当前显示的服务
  const [myServices, setMyServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('paginated'); // 'paginated' 或 'infinite'
  
  // 高级筛选状态
  const [searchParams, setSearchParams] = useState({
    serviceTypes: ['translation'], // 多选
    languages: ['zh-CN'], // 多选
    priceRange: [0, 100], // 价格区间
    scoreRange: [0, 100], // 评分区间
    sortBy: 'score', // 排序字段
    sortDirection: 'desc', // 排序方向
  });
  
  // 通知状态
  const [notifications, setNotifications] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState({});
  const [notificationConfig, setNotificationConfig] = useState({
    position: 'top-right',
    groupSimilar: true,
    soundEnabled: false,
    persistOnHover: true,
    maxVisible: 5,
  });
  
  // 注册表单状态
  const [registrationForm, setRegistrationForm] = useState({
    serviceType: 'translation',
    languages: ['zh-CN', 'en-US'],
    pricePerToken: '10',
    metadataURI: '',
    name: '',
    description: '',
    capabilities: '',
    apiEndpoint: '',
  });
  
  // 批量操作状态
  const [selectedServices, setSelectedServices] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  
  // 权限与角色状态
  const [userRoles, setUserRoles] = useState({
    isAdmin: false,
    isReviewer: false,
    isProvider: false,
  });
  
  // 审核面板状态
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [pendingServices, setPendingServices] = useState([]);
  const [rejectedServices, setRejectedServices] = useState([]);
  const [suspendedServices, setSuspendedServices] = useState([]);
  const [selectedServiceForReview, setSelectedServiceForReview] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHistory, setReviewHistory] = useState([]);
  const [isLoadingReviewHistory, setIsLoadingReviewHistory] = useState(false);
  
  // 黑白名单管理状态
  const [blacklistPanelOpen, setBlacklistPanelOpen] = useState(false);
  const [blacklistedProviders, setBlacklistedProviders] = useState([]);
  const [whitelistedProviders, setWhitelistedProviders] = useState([]);
  const [isWhitelistRequired, setIsWhitelistRequired] = useState(false);
  const [providerAddressInput, setProviderAddressInput] = useState('');
  
  // 服务详情状态
  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(false);
  const [serviceDetails, setServiceDetails] = useState(null);
  
  // 事件监听器引用
  const eventListenersRef = useRef({});
  
  // 定时刷新引用
  const refreshTimerRef = useRef(null);
  
  // 连接钱包
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });
      
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // 初始化合约
      const aiRegistryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.aiRegistry,
        AIRegistryABI.abi,
        signer
      );
      
      const cultureTokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.cultureToken,
        CultureTokenABI.abi,
        signer
      );
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setConnected(true);
      setContracts({
        aiRegistry: aiRegistryContract,
        cultureToken: cultureTokenContract,
      });
      
      // 检查用户角色
      await checkUserRoles(aiRegistryContract, address);
      
      // 加载服务数据
      await loadServices(aiRegistryContract);
      
      // 如果是审核员或管理员，加载待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        await loadPendingServices(aiRegistryContract);
      }
      
      // 如果是管理员，加载黑白名单
      if (userRoles.isAdmin) {
        await loadBlacklistWhitelist(aiRegistryContract);
      }
      
      // 设置事件监听器
      setupEventListeners(aiRegistryContract);
      
      // 设置定时刷新
      setupRefreshTimer(aiRegistryContract);
      
      // 连接成功通知
      addNotification({
        type: 'success',
        title: '连接成功',
        message: `已连接到钱包: ${shortenAddress(address)}`,
      });
      
    } catch (error) {
      console.error('连接钱包失败:', error);
      addNotification({
        type: 'error',
        title: '连接失败',
        message: `连接钱包时出错: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 检查用户角色
  const checkUserRoles = async (contract, address) => {
    try {
      const isAdmin = await contract.hasRole(ROLES.ADMIN, address);
      const isReviewer = await contract.hasRole(ROLES.REVIEWER, address);
      const isProvider = await contract.hasRole(ROLES.PROVIDER, address);
      
      setUserRoles({
        isAdmin,
        isReviewer,
        isProvider,
      });
      
      return { isAdmin, isReviewer, isProvider };
    } catch (error) {
      console.error('检查用户角色失败:', error);
      return { isAdmin: false, isReviewer: false, isProvider: false };
    }
  };
  
  // 加载服务数据
  const loadServices = async (contract) => {
    try {
      setIsLoading(true);
      
      // 获取服务总数
      const serviceCount = await contract.serviceCount();
      setTotalServices(serviceCount.toNumber());
      
      // 计算总页数
      const pages = Math.ceil(serviceCount.toNumber() / SERVICES_PER_PAGE);
      setTotalPages(pages);
      
      // 获取已批准的服务
      const approvedServiceIds = await contract.getApprovedServices();
      
      // 获取服务详情
      const servicesData = await Promise.all(
        approvedServiceIds.map(async (id) => {
          const service = await contract.services(id);
          return formatServiceData(id, service);
        })
      );
      
      // 获取当前用户的服务
      const myServiceIds = await contract.getProviderServices(account);
      const myServicesData = await Promise.all(
        myServiceIds.map(async (id) => {
          const service = await contract.services(id);
          return formatServiceData(id, service);
        })
      );
      
      setAllServices(servicesData);
      setServices(servicesData.slice(0, SERVICES_PER_PAGE));
      setMyServices(myServicesData);
      
    } catch (error) {
      console.error('加载服务数据失败:', error);
      addNotification({
        type: 'error',
        title: '加载失败',
        message: `加载服务数据时出错: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载待审核服务
  const loadPendingServices = async (contract) => {
    try {
      // 获取待审核服务
      const pendingServiceIds = await contract.getPendingServices();
      const pendingServicesData = await Promise.all(
        pendingServiceIds.map(async (id) => {
          const service = await contract.services(id);
          return formatServiceData(id, service);
        })
      );
      
      // 获取已拒绝服务
      const rejectedServiceIds = await contract.getRejectedServices();
      const rejectedServicesData = await Promise.all(
        rejectedServiceIds.map(async (id) => {
          const service = await contract.services(id);
          return formatServiceData(id, service);
        })
      );
      
      // 获取已暂停服务
      const suspendedServiceIds = await contract.getSuspendedServices();
      const suspendedServicesData = await Promise.all(
        suspendedServiceIds.map(async (id) => {
          const service = await contract.services(id);
          return formatServiceData(id, service);
        })
      );
      
      setPendingServices(pendingServicesData);
      setRejectedServices(rejectedServicesData);
      setSuspendedServices(suspendedServicesData);
      
    } catch (error) {
      console.error('加载待审核服务失败:', error);
    }
  };
  
  // 加载黑白名单
  const loadBlacklistWhitelist = async (contract) => {
    try {
      // 获取是否需要白名单
      const whitelistRequired = await contract.whitelistRequired();
      setIsWhitelistRequired(whitelistRequired);
      
      // 由于合约没有直接提供黑白名单列表的方法，这里需要通过事件或其他方式获取
      // 这里仅作为示例，实际实现可能需要根据合约设计调整
      setBlacklistedProviders([]);
      setWhitelistedProviders([]);
      
    } catch (error) {
      console.error('加载黑白名单失败:', error);
    }
  };
  
  // 格式化服务数据
  const formatServiceData = (id, serviceData) => {
    return {
      id: id.toString(),
      provider: serviceData.provider,
      serviceType: serviceData.serviceType,
      supportedLanguages: serviceData.supportedLanguages || [],
      performanceScore: serviceData.performanceScore.toNumber(),
      pricePerToken: ethers.utils.formatEther(serviceData.pricePerToken),
      status: serviceData.status,
      metadataURI: serviceData.metadataURI,
      reputationScore: serviceData.reputationScore.toNumber(),
      registrationTime: new Date(serviceData.registrationTime.toNumber() * 1000),
      lastUpdateTime: new Date(serviceData.lastUpdateTime.toNumber() * 1000),
      rejectionReason: serviceData.rejectionReason || '',
      statusLabel: SERVICE_STATUS_LABELS[serviceData.status].label,
      statusColor: SERVICE_STATUS_LABELS[serviceData.status].color,
    };
  };
  
  // 设置事件监听器
  const setupEventListeners = (contract) => {
    // 清除现有的事件监听器
    if (eventListenersRef.current.serviceRegistered) {
      eventListenersRef.current.serviceRegistered.removeAllListeners();
    }
    
    // 服务注册事件
    const serviceRegisteredListener = contract.on('ServiceRegistered', 
      (serviceId, provider, serviceType, status, event) => {
        addNotification({
          type: 'info',
          title: '新服务注册',
          message: `服务ID: ${serviceId.toString()}, 提供商: ${shortenAddress(provider)}`,
          txHash: event.transactionHash,
        });
        
        // 如果是审核员或管理员，刷新待审核服务
        if (userRoles.isReviewer || userRoles.isAdmin) {
          loadPendingServices(contract);
        }
        
        // 如果是当前用户注册的，刷新我的服务
        if (provider.toLowerCase() === account.toLowerCase()) {
          loadServices(contract);
        }
      }
    );
    
    // 服务状态变更事件
    const serviceStatusChangedListener = contract.on('ServiceStatusChanged',
      (serviceId, provider, newStatus, event) => {
        const statusInfo = SERVICE_STATUS_LABELS[newStatus];
        
        addNotification({
          type: newStatus === SERVICE_STATUS.APPROVED ? 'success' : 
                newStatus === SERVICE_STATUS.REJECTED ? 'error' : 'warning',
          title: '服务状态更新',
          message: `服务ID: ${serviceId.toString()}, 新状态: ${statusInfo.label}`,
          txHash: event.transactionHash,
        });
        
        // 刷新服务列表
        loadServices(contract);
        
        // 如果是审核员或管理员，刷新待审核服务
        if (userRoles.isReviewer || userRoles.isAdmin) {
          loadPendingServices(contract);
        }
      }
    );
    
    // 服务审核事件
    const serviceReviewedListener = contract.on('ServiceReviewed',
      (serviceId, reviewer, decision, comment, event) => {
        const statusInfo = SERVICE_STATUS_LABELS[decision];
        
        addNotification({
          type: decision === SERVICE_STATUS.APPROVED ? 'success' : 'warning',
          title: '服务审核完成',
          message: `服务ID: ${serviceId.toString()}, 决定: ${statusInfo.label}`,
          txHash: event.transactionHash,
        });
        
        // 如果是审核员或管理员，刷新待审核服务
        if (userRoles.isReviewer || userRoles.isAdmin) {
          loadPendingServices(contract);
        }
        
        // 刷新服务列表
        loadServices(contract);
      }
    );
    
    // 黑名单事件
    const providerBlacklistedListener = contract.on('ProviderBlacklisted',
      (provider, event) => {
        addNotification({
          type: 'warning',
          title: '提供商已加入黑名单',
          message: `提供商: ${shortenAddress(provider)}`,
          txHash: event.transactionHash,
        });
        
        // 如果是管理员，刷新黑白名单
        if (userRoles.isAdmin) {
          loadBlacklistWhitelist(contract);
        }
        
        // 刷新服务列表
        loadServices(contract);
      }
    );
    
    // 白名单事件
    const providerWhitelistedListener = contract.on('ProviderWhitelisted',
      (provider, event) => {
        addNotification({
          type: 'success',
          title: '提供商已加入白名单',
          message: `提供商: ${shortenAddress(provider)}`,
          txHash: event.transactionHash,
        });
        
        // 如果是管理员，刷新黑白名单
        if (userRoles.isAdmin) {
          loadBlacklistWhitelist(contract);
        }
      }
    );
    
    // 保存事件监听器引用，以便后续清除
    eventListenersRef.current = {
      serviceRegistered: serviceRegisteredListener,
      serviceStatusChanged: serviceStatusChangedListener,
      serviceReviewed: serviceReviewedListener,
      providerBlacklisted: providerBlacklistedListener,
      providerWhitelisted: providerWhitelistedListener,
    };
  };
  
  // 设置定时刷新
  const setupRefreshTimer = (contract) => {
    // 清除现有的定时器
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    // 设置新的定时器
    refreshTimerRef.current = setInterval(() => {
      loadServices(contract);
      
      // 如果是审核员或管理员，刷新待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        loadPendingServices(contract);
      }
      
      // 如果是管理员，刷新黑白名单
      if (userRoles.isAdmin) {
        loadBlacklistWhitelist(contract);
      }
    }, DATA_REFRESH_INTERVAL);
  };
  
  // 添加通知
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // 如果是交易通知，添加到待处理交易
    if (notification.txHash) {
      setPendingTransactions((prev) => ({
        ...prev,
        [notification.txHash]: {
          id,
          status: 'pending',
          ...notification,
        },
      }));
      
      // 监听交易确认
      if (provider) {
        provider.once(notification.txHash, (transaction) => {
          // 交易确认后更新状态
          setPendingTransactions((prev) => ({
            ...prev,
            [notification.txHash]: {
              ...prev[notification.txHash],
              status: 'confirmed',
            },
          }));
          
          // 添加确认通知
          addNotification({
            type: 'success',
            title: '交易已确认',
            message: `交易哈希: ${shortenTxHash(notification.txHash)}`,
            txHash: notification.txHash,
          });
        });
      }
    }
  };
  
  // 移除通知
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };
  
  // 注册服务
  const registerService = async () => {
    try {
      setIsRegistering(true);
      
      // 验证表单
      if (!registrationForm.serviceType) {
        throw new Error('请选择服务类型');
      }
      
      if (registrationForm.languages.length === 0) {
        throw new Error('请至少选择一种语言');
      }
      
      if (!registrationForm.pricePerToken || parseFloat(registrationForm.pricePerToken) <= 0) {
        throw new Error('请输入有效的价格');
      }
      
      // 构建元数据
      const metadata = {
        name: registrationForm.name,
        description: registrationForm.description,
        capabilities: registrationForm.capabilities,
        apiEndpoint: registrationForm.apiEndpoint,
      };
      
      // 在实际应用中，应该将元数据上传到IPFS或其他存储
      // 这里简化为JSON字符串
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
      
      // 调用合约
      const tx = await contracts.aiRegistry.registerService(
        registrationForm.serviceType,
        registrationForm.languages,
        ethers.utils.parseEther(registrationForm.pricePerToken),
        metadataURI
      );
      
      addNotification({
        type: 'info',
        title: '服务注册中',
        message: '您的服务注册请求已提交，等待区块链确认',
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 重置表单
      setRegistrationForm({
        serviceType: 'translation',
        languages: ['zh-CN', 'en-US'],
        pricePerToken: '10',
        metadataURI: '',
        name: '',
        description: '',
        capabilities: '',
        apiEndpoint: '',
      });
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
    } catch (error) {
      console.error('注册服务失败:', error);
      addNotification({
        type: 'error',
        title: '注册失败',
        message: `注册服务时出错: ${error.message}`,
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  // 审核服务
  const reviewService = async (serviceId, approve) => {
    try {
      if (!reviewComment && !approve) {
        throw new Error('拒绝服务时必须提供评论');
      }
      
      // 调用合约
      const tx = await contracts.aiRegistry.reviewService(
        serviceId,
        approve,
        reviewComment
      );
      
      addNotification({
        type: 'info',
        title: '服务审核中',
        message: `服务ID: ${serviceId}, 决定: ${approve ? '批准' : '拒绝'}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 重置评论
      setReviewComment('');
      setSelectedServiceForReview(null);
      
      // 刷新待审核服务
      await loadPendingServices(contracts.aiRegistry);
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
    } catch (error) {
      console.error('审核服务失败:', error);
      addNotification({
        type: 'error',
        title: '审核失败',
        message: `审核服务时出错: ${error.message}`,
      });
    }
  };
  
  // 加载服务审核历史
  const loadServiceReviewHistory = async (serviceId) => {
    try {
      setIsLoadingReviewHistory(true);
      
      const history = await contracts.aiRegistry.getServiceReviewHistory(serviceId);
      
      // 格式化历史记录
      const formattedHistory = history.map((record) => ({
        serviceId: record.serviceId.toString(),
        reviewer: record.reviewer,
        decision: record.decision,
        comment: record.comment,
        timestamp: new Date(record.timestamp.toNumber() * 1000),
        statusLabel: SERVICE_STATUS_LABELS[record.decision].label,
        statusColor: SERVICE_STATUS_LABELS[record.decision].color,
      }));
      
      setReviewHistory(formattedHistory);
      
    } catch (error) {
      console.error('加载服务审核历史失败:', error);
      addNotification({
        type: 'error',
        title: '加载失败',
        message: `加载服务审核历史时出错: ${error.message}`,
      });
    } finally {
      setIsLoadingReviewHistory(false);
    }
  };
  
  // 暂停服务
  const suspendService = async (serviceId) => {
    try {
      // 调用合约
      const tx = await contracts.aiRegistry.suspendService(serviceId);
      
      addNotification({
        type: 'info',
        title: '服务暂停中',
        message: `服务ID: ${serviceId}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
      // 如果是审核员或管理员，刷新待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        await loadPendingServices(contracts.aiRegistry);
      }
      
    } catch (error) {
      console.error('暂停服务失败:', error);
      addNotification({
        type: 'error',
        title: '暂停失败',
        message: `暂停服务时出错: ${error.message}`,
      });
    }
  };
  
  // 重新激活服务
  const reactivateService = async (serviceId) => {
    try {
      // 调用合约
      const tx = await contracts.aiRegistry.reactivateService(serviceId);
      
      addNotification({
        type: 'info',
        title: '服务重新激活中',
        message: `服务ID: ${serviceId}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
      // 如果是审核员或管理员，刷新待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        await loadPendingServices(contracts.aiRegistry);
      }
      
    } catch (error) {
      console.error('重新激活服务失败:', error);
      addNotification({
        type: 'error',
        title: '激活失败',
        message: `重新激活服务时出错: ${error.message}`,
      });
    }
  };
  
  // 更新性能评分
  const updatePerformanceScore = async (serviceId, newScore) => {
    try {
      if (newScore < 0 || newScore > 100) {
        throw new Error('评分必须在0-100之间');
      }
      
      // 调用合约
      const tx = await contracts.aiRegistry.updatePerformanceScore(serviceId, newScore);
      
      addNotification({
        type: 'info',
        title: '更新性能评分中',
        message: `服务ID: ${serviceId}, 新评分: ${newScore}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
    } catch (error) {
      console.error('更新性能评分失败:', error);
      addNotification({
        type: 'error',
        title: '更新失败',
        message: `更新性能评分时出错: ${error.message}`,
      });
    }
  };
  
  // 更新信誉评分
  const updateReputationScore = async (provider, newScore) => {
    try {
      if (newScore < 0 || newScore > 100) {
        throw new Error('评分必须在0-100之间');
      }
      
      // 调用合约
      const tx = await contracts.aiRegistry.updateReputationScore(provider, newScore);
      
      addNotification({
        type: 'info',
        title: '更新信誉评分中',
        message: `提供商: ${shortenAddress(provider)}, 新评分: ${newScore}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
    } catch (error) {
      console.error('更新信誉评分失败:', error);
      addNotification({
        type: 'error',
        title: '更新失败',
        message: `更新信誉评分时出错: ${error.message}`,
      });
    }
  };
  
  // 将提供商添加到黑名单
  const blacklistProvider = async (provider) => {
    try {
      // 验证地址
      if (!ethers.utils.isAddress(provider)) {
        throw new Error('无效的以太坊地址');
      }
      
      // 调用合约
      const tx = await contracts.aiRegistry.blacklistProvider(provider);
      
      addNotification({
        type: 'info',
        title: '添加到黑名单中',
        message: `提供商: ${shortenAddress(provider)}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新黑白名单
      await loadBlacklistWhitelist(contracts.aiRegistry);
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
      // 重置输入
      setProviderAddressInput('');
      
    } catch (error) {
      console.error('添加到黑名单失败:', error);
      addNotification({
        type: 'error',
        title: '添加失败',
        message: `添加到黑名单时出错: ${error.message}`,
      });
    }
  };
  
  // 将提供商从黑名单中移除
  const removeFromBlacklist = async (provider) => {
    try {
      // 调用合约
      const tx = await contracts.aiRegistry.removeFromBlacklist(provider);
      
      addNotification({
        type: 'info',
        title: '从黑名单移除中',
        message: `提供商: ${shortenAddress(provider)}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新黑白名单
      await loadBlacklistWhitelist(contracts.aiRegistry);
      
    } catch (error) {
      console.error('从黑名单移除失败:', error);
      addNotification({
        type: 'error',
        title: '移除失败',
        message: `从黑名单移除时出错: ${error.message}`,
      });
    }
  };
  
  // 将提供商添加到白名单
  const whitelistProvider = async (provider) => {
    try {
      // 验证地址
      if (!ethers.utils.isAddress(provider)) {
        throw new Error('无效的以太坊地址');
      }
      
      // 调用合约
      const tx = await contracts.aiRegistry.whitelistProvider(provider);
      
      addNotification({
        type: 'info',
        title: '添加到白名单中',
        message: `提供商: ${shortenAddress(provider)}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新黑白名单
      await loadBlacklistWhitelist(contracts.aiRegistry);
      
      // 重置输入
      setProviderAddressInput('');
      
    } catch (error) {
      console.error('添加到白名单失败:', error);
      addNotification({
        type: 'error',
        title: '添加失败',
        message: `添加到白名单时出错: ${error.message}`,
      });
    }
  };
  
  // 将提供商从白名单中移除
  const removeFromWhitelist = async (provider) => {
    try {
      // 调用合约
      const tx = await contracts.aiRegistry.removeFromWhitelist(provider);
      
      addNotification({
        type: 'info',
        title: '从白名单移除中',
        message: `提供商: ${shortenAddress(provider)}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新黑白名单
      await loadBlacklistWhitelist(contracts.aiRegistry);
      
    } catch (error) {
      console.error('从白名单移除失败:', error);
      addNotification({
        type: 'error',
        title: '移除失败',
        message: `从白名单移除时出错: ${error.message}`,
      });
    }
  };
  
  // 设置是否需要白名单
  const setWhitelistRequired = async (required) => {
    try {
      // 调用合约
      const tx = await contracts.aiRegistry.setWhitelistRequired(required);
      
      addNotification({
        type: 'info',
        title: '白名单要求更新中',
        message: `白名单要求: ${required ? '启用' : '禁用'}`,
        txHash: tx.hash,
      });
      
      // 等待交易确认
      await tx.wait();
      
      // 刷新黑白名单
      await loadBlacklistWhitelist(contracts.aiRegistry);
      
    } catch (error) {
      console.error('设置白名单要求失败:', error);
      addNotification({
        type: 'error',
        title: '设置失败',
        message: `设置白名单要求时出错: ${error.message}`,
      });
    }
  };
  
  // 查看服务详情
  const viewServiceDetails = async (service) => {
    setServiceDetails(service);
    setServiceDetailsOpen(true);
    
    // 如果是审核员或管理员，加载审核历史
    if ((userRoles.isReviewer || userRoles.isAdmin) && service) {
      await loadServiceReviewHistory(service.id);
    }
  };
  
  // 处理分页变化
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    const startIndex = (page - 1) * SERVICES_PER_PAGE;
    const endIndex = startIndex + SERVICES_PER_PAGE;
    
    setServices(allServices.slice(startIndex, endIndex));
  };
  
  // 处理筛选参数变化
  const handleSearchParamsChange = (params) => {
    setSearchParams(params);
    
    // 应用筛选
    const filteredServices = allServices.filter((service) => {
      // 服务类型筛选
      if (params.serviceTypes.length > 0 && !params.serviceTypes.includes(service.serviceType)) {
        return false;
      }
      
      // 语言筛选
      if (params.languages.length > 0 && !service.supportedLanguages.some(lang => params.languages.includes(lang))) {
        return false;
      }
      
      // 价格区间筛选
      const price = parseFloat(service.pricePerToken);
      if (price < params.priceRange[0] || price > params.priceRange[1]) {
        return false;
      }
      
      // 评分区间筛选
      if (service.performanceScore < params.scoreRange[0] || service.performanceScore > params.scoreRange[1]) {
        return false;
      }
      
      return true;
    });
    
    // 排序
    const sortedServices = [...filteredServices].sort((a, b) => {
      let valueA, valueB;
      
      switch (params.sortBy) {
        case 'score':
          valueA = a.performanceScore;
          valueB = b.performanceScore;
          break;
        case 'price':
          valueA = parseFloat(a.pricePerToken);
          valueB = parseFloat(b.pricePerToken);
          break;
        case 'name':
          valueA = a.metadataURI;
          valueB = b.metadataURI;
          break;
        default:
          valueA = a.performanceScore;
          valueB = b.performanceScore;
      }
      
      if (params.sortDirection === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    setTotalServices(sortedServices.length);
    setTotalPages(Math.ceil(sortedServices.length / SERVICES_PER_PAGE));
    setCurrentPage(1);
    setServices(sortedServices.slice(0, SERVICES_PER_PAGE));
  };
  
  // 处理批量选择
  const handleBatchSelection = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };
  
  // 批量激活服务
  const batchReactivateServices = async () => {
    try {
      for (const serviceId of selectedServices) {
        // 调用合约
        const tx = await contracts.aiRegistry.reactivateService(serviceId);
        
        addNotification({
          type: 'info',
          title: '批量激活中',
          message: `服务ID: ${serviceId}`,
          txHash: tx.hash,
        });
        
        // 等待交易确认
        await tx.wait();
      }
      
      // 清除选择
      setSelectedServices([]);
      setBatchMode(false);
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
      // 如果是审核员或管理员，刷新待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        await loadPendingServices(contracts.aiRegistry);
      }
      
    } catch (error) {
      console.error('批量激活服务失败:', error);
      addNotification({
        type: 'error',
        title: '批量激活失败',
        message: `批量激活服务时出错: ${error.message}`,
      });
    }
  };
  
  // 批量暂停服务
  const batchSuspendServices = async () => {
    try {
      for (const serviceId of selectedServices) {
        // 调用合约
        const tx = await contracts.aiRegistry.suspendService(serviceId);
        
        addNotification({
          type: 'info',
          title: '批量暂停中',
          message: `服务ID: ${serviceId}`,
          txHash: tx.hash,
        });
        
        // 等待交易确认
        await tx.wait();
      }
      
      // 清除选择
      setSelectedServices([]);
      setBatchMode(false);
      
      // 刷新服务列表
      await loadServices(contracts.aiRegistry);
      
      // 如果是审核员或管理员，刷新待审核服务
      if (userRoles.isReviewer || userRoles.isAdmin) {
        await loadPendingServices(contracts.aiRegistry);
      }
      
    } catch (error) {
      console.error('批量暂停服务失败:', error);
      addNotification({
        type: 'error',
        title: '批量暂停失败',
        message: `批量暂停服务时出错: ${error.message}`,
      });
    }
  };
  
  // 辅助函数：缩短地址显示
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 辅助函数：缩短交易哈希显示
  const shortenTxHash = (hash) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  // 清理函数
  useEffect(() => {
    return () => {
      // 清除事件监听器
      Object.values(eventListenersRef.current).forEach((listener) => {
        if (listener && listener.removeAllListeners) {
          listener.removeAllListeners();
        }
      });
      
      // 清除定时器
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  // 渲染服务卡片
  const renderServiceCard = (service) => {
    return (
      <div 
        key={service.id} 
        className={`service-card ${batchMode && selectedServices.includes(service.id) ? 'selected' : ''}`}
        onClick={() => batchMode ? handleBatchSelection(service.id) : viewServiceDetails(service)}
      >
        {batchMode && (
          <div className="batch-checkbox">
            <input 
              type="checkbox" 
              checked={selectedServices.includes(service.id)}
              onChange={() => handleBatchSelection(service.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        <div className="service-header">
          <h3>{service.metadataURI.includes('name') ? JSON.parse(decodeURIComponent(service.metadataURI.replace('data:application/json,', ''))).name : `服务 #${service.id}`}</h3>
          <div className="service-status" style={{ backgroundColor: service.statusColor }}>
            {service.statusLabel}
          </div>
        </div>
        
        <div className="service-body">
          <div className="service-info">
            <p><strong>类型:</strong> {SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</p>
            <p><strong>提供商:</strong> {shortenAddress(service.provider)}</p>
            <p><strong>价格:</strong> {service.pricePerToken} CULT</p>
            <p><strong>语言:</strong> {service.supportedLanguages.map(lang => LANGUAGE_OPTIONS.find(l => l.value === lang)?.label || lang).join(', ')}</p>
          </div>
          
          <div className="service-scores">
            <div className="score-circle performance">
              <svg viewBox="0 0 36 36">
                <path
                  className="score-circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="score-circle-fill"
                  strokeDasharray={`${service.performanceScore}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="score-text">{service.performanceScore}</text>
              </svg>
              <span>性能评分</span>
            </div>
            
            <div className="score-circle reputation">
              <svg viewBox="0 0 36 36">
                <path
                  className="score-circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="score-circle-fill"
                  strokeDasharray={`${service.reputationScore}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="score-text">{service.reputationScore}</text>
              </svg>
              <span>信誉评分</span>
            </div>
          </div>
        </div>
        
        <div className="service-footer">
          <p className="service-date">注册于: {service.registrationTime.toLocaleDateString()}</p>
          <button 
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              viewServiceDetails(service);
            }}
          >
            查看详情
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染审核面板
  const renderReviewPanel = () => {
    return (
      <div className={`review-panel ${reviewPanelOpen ? 'open' : ''}`}>
        <div className="review-panel-header">
          <h2>服务审核面板</h2>
          <button className="close-btn" onClick={() => setReviewPanelOpen(false)}>×</button>
        </div>
        
        <div className="review-panel-tabs">
          <button 
            className={`tab-btn ${!selectedServiceForReview ? 'active' : ''}`}
            onClick={() => setSelectedServiceForReview(null)}
          >
            待审核 ({pendingServices.length})
          </button>
          <button 
            className="tab-btn"
            onClick={() => setSelectedServiceForReview(null)}
          >
            已拒绝 ({rejectedServices.length})
          </button>
          <button 
            className="tab-btn"
            onClick={() => setSelectedServiceForReview(null)}
          >
            已暂停 ({suspendedServices.length})
          </button>
        </div>
        
        <div className="review-panel-content">
          {selectedServiceForReview ? (
            <div className="service-review-form">
              <h3>审核服务 #{selectedServiceForReview.id}</h3>
              
              <div className="service-details">
                <p><strong>提供商:</strong> {shortenAddress(selectedServiceForReview.provider)}</p>
                <p><strong>类型:</strong> {SERVICE_TYPES.find(t => t.value === selectedServiceForReview.serviceType)?.label || selectedServiceForReview.serviceType}</p>
                <p><strong>价格:</strong> {selectedServiceForReview.pricePerToken} CULT</p>
                <p><strong>语言:</strong> {selectedServiceForReview.supportedLanguages.map(lang => LANGUAGE_OPTIONS.find(l => l.value === lang)?.label || lang).join(', ')}</p>
                <p><strong>注册时间:</strong> {selectedServiceForReview.registrationTime.toLocaleString()}</p>
                
                {selectedServiceForReview.metadataURI && (
                  <div className="metadata">
                    <h4>元数据</h4>
                    {(() => {
                      try {
                        const metadata = JSON.parse(decodeURIComponent(selectedServiceForReview.metadataURI.replace('data:application/json,', '')));
                        return (
                          <>
                            <p><strong>名称:</strong> {metadata.name}</p>
                            <p><strong>描述:</strong> {metadata.description}</p>
                            <p><strong>能力:</strong> {metadata.capabilities}</p>
                            <p><strong>API端点:</strong> {metadata.apiEndpoint}</p>
                          </>
                        );
                      } catch (e) {
                        return <p>无法解析元数据: {selectedServiceForReview.metadataURI}</p>;
                      }
                    })()}
                  </div>
                )}
              </div>
              
              <div className="review-form">
                <label htmlFor="review-comment">审核评论:</label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="请输入审核评论（拒绝时必填）"
                  rows={4}
                />
                
                <div className="review-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => reviewService(selectedServiceForReview.id, true)}
                  >
                    批准
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => reviewService(selectedServiceForReview.id, false)}
                  >
                    拒绝
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setSelectedServiceForReview(null);
                      setReviewComment('');
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="services-list">
              <h3>待审核服务</h3>
              {pendingServices.length === 0 ? (
                <p className="empty-message">没有待审核的服务</p>
              ) : (
                <div className="services-grid">
                  {pendingServices.map((service) => (
                    <div key={service.id} className="service-card pending" onClick={() => setSelectedServiceForReview(service)}>
                      <div className="service-header">
                        <h3>{service.metadataURI.includes('name') ? JSON.parse(decodeURIComponent(service.metadataURI.replace('data:application/json,', ''))).name : `服务 #${service.id}`}</h3>
                        <div className="service-status" style={{ backgroundColor: service.statusColor }}>
                          {service.statusLabel}
                        </div>
                      </div>
                      
                      <div className="service-body">
                        <p><strong>提供商:</strong> {shortenAddress(service.provider)}</p>
                        <p><strong>类型:</strong> {SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</p>
                        <p><strong>价格:</strong> {service.pricePerToken} CULT</p>
                        <p><strong>注册时间:</strong> {service.registrationTime.toLocaleString()}</p>
                      </div>
                      
                      <div className="service-footer">
                        <button className="review-btn">审核</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染黑白名单管理面板
  const renderBlacklistPanel = () => {
    return (
      <div className={`blacklist-panel ${blacklistPanelOpen ? 'open' : ''}`}>
        <div className="blacklist-panel-header">
          <h2>黑白名单管理</h2>
          <button className="close-btn" onClick={() => setBlacklistPanelOpen(false)}>×</button>
        </div>
        
        <div className="blacklist-panel-tabs">
          <button className="tab-btn active">黑名单</button>
          <button className="tab-btn">白名单</button>
        </div>
        
        <div className="blacklist-panel-content">
          <div className="whitelist-settings">
            <h3>白名单设置</h3>
            <div className="whitelist-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={isWhitelistRequired}
                  onChange={() => setWhitelistRequired(!isWhitelistRequired)}
                />
                启用白名单要求
              </label>
              <p className="whitelist-info">
                {isWhitelistRequired 
                  ? '当前设置: 只有白名单中的提供商可以注册服务' 
                  : '当前设置: 任何未被列入黑名单的提供商都可以注册服务'}
              </p>
            </div>
          </div>
          
          <div className="provider-input">
            <h3>添加提供商</h3>
            <div className="input-group">
              <input 
                type="text"
                value={providerAddressInput}
                onChange={(e) => setProviderAddressInput(e.target.value)}
                placeholder="输入提供商地址"
              />
              <div className="input-actions">
                <button 
                  className="blacklist-btn"
                  onClick={() => blacklistProvider(providerAddressInput)}
                >
                  添加到黑名单
                </button>
                <button 
                  className="whitelist-btn"
                  onClick={() => whitelistProvider(providerAddressInput)}
                >
                  添加到白名单
                </button>
              </div>
            </div>
          </div>
          
          <div className="providers-list">
            <h3>黑名单提供商</h3>
            {blacklistedProviders.length === 0 ? (
              <p className="empty-message">黑名单中没有提供商</p>
            ) : (
              <ul className="providers-grid">
                {blacklistedProviders.map((provider) => (
                  <li key={provider} className="provider-item">
                    <span>{shortenAddress(provider)}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromBlacklist(provider)}
                    >
                      移除
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            <h3>白名单提供商</h3>
            {whitelistedProviders.length === 0 ? (
              <p className="empty-message">白名单中没有提供商</p>
            ) : (
              <ul className="providers-grid">
                {whitelistedProviders.map((provider) => (
                  <li key={provider} className="provider-item">
                    <span>{shortenAddress(provider)}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromWhitelist(provider)}
                    >
                      移除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染服务详情面板
  const renderServiceDetailsPanel = () => {
    if (!serviceDetails) return null;
    
    return (
      <div className={`service-details-panel ${serviceDetailsOpen ? 'open' : ''}`}>
        <div className="service-details-header">
          <h2>服务详情</h2>
          <button className="close-btn" onClick={() => setServiceDetailsOpen(false)}>×</button>
        </div>
        
        <div className="service-details-content">
          <div className="service-details-main">
            <div className="service-details-info">
              <h3>{serviceDetails.metadataURI.includes('name') ? JSON.parse(decodeURIComponent(serviceDetails.metadataURI.replace('data:application/json,', ''))).name : `服务 #${serviceDetails.id}`}</h3>
              
              <div className="service-status-badge" style={{ backgroundColor: serviceDetails.statusColor }}>
                {serviceDetails.statusLabel}
              </div>
              
              <div className="service-details-grid">
                <div className="details-item">
                  <span className="label">ID:</span>
                  <span className="value">{serviceDetails.id}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">提供商:</span>
                  <span className="value">{shortenAddress(serviceDetails.provider)}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">类型:</span>
                  <span className="value">{SERVICE_TYPES.find(t => t.value === serviceDetails.serviceType)?.label || serviceDetails.serviceType}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">价格:</span>
                  <span className="value">{serviceDetails.pricePerToken} CULT</span>
                </div>
                
                <div className="details-item">
                  <span className="label">性能评分:</span>
                  <span className="value">{serviceDetails.performanceScore}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">信誉评分:</span>
                  <span className="value">{serviceDetails.reputationScore}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">注册时间:</span>
                  <span className="value">{serviceDetails.registrationTime.toLocaleString()}</span>
                </div>
                
                <div className="details-item">
                  <span className="label">最后更新:</span>
                  <span className="value">{serviceDetails.lastUpdateTime.toLocaleString()}</span>
                </div>
                
                <div className="details-item full-width">
                  <span className="label">支持语言:</span>
                  <div className="languages-list">
                    {serviceDetails.supportedLanguages.map((lang) => (
                      <span key={lang} className="language-tag">
                        {LANGUAGE_OPTIONS.find(l => l.value === lang)?.label || lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                {serviceDetails.rejectionReason && (
                  <div className="details-item full-width">
                    <span className="label">拒绝原因:</span>
                    <span className="value rejection-reason">{serviceDetails.rejectionReason}</span>
                  </div>
                )}
              </div>
              
              {serviceDetails.metadataURI && (
                <div className="metadata-section">
                  <h4>元数据</h4>
                  {(() => {
                    try {
                      const metadata = JSON.parse(decodeURIComponent(serviceDetails.metadataURI.replace('data:application/json,', '')));
                      return (
                        <div className="metadata-content">
                          <div className="details-item full-width">
                            <span className="label">名称:</span>
                            <span className="value">{metadata.name}</span>
                          </div>
                          
                          <div className="details-item full-width">
                            <span className="label">描述:</span>
                            <span className="value">{metadata.description}</span>
                          </div>
                          
                          <div className="details-item full-width">
                            <span className="label">能力:</span>
                            <span className="value">{metadata.capabilities}</span>
                          </div>
                          
                          <div className="details-item full-width">
                            <span className="label">API端点:</span>
                            <span className="value">{metadata.apiEndpoint}</span>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return <p className="metadata-error">无法解析元数据: {serviceDetails.metadataURI}</p>;
                    }
                  })()}
                </div>
              )}
            </div>
            
            <div className="service-details-actions">
              {/* 根据用户角色和服务状态显示不同的操作按钮 */}
              {serviceDetails.status === SERVICE_STATUS.APPROVED && (
                <>
                  {(userRoles.isAdmin || userRoles.isReviewer || serviceDetails.provider.toLowerCase() === account.toLowerCase()) && (
                    <button 
                      className="suspend-btn"
                      onClick={() => suspendService(serviceDetails.id)}
                    >
                      暂停服务
                    </button>
                  )}
                </>
              )}
              
              {serviceDetails.status === SERVICE_STATUS.SUSPENDED && (
                <>
                  {(userRoles.isAdmin || userRoles.isReviewer || serviceDetails.provider.toLowerCase() === account.toLowerCase()) && (
                    <button 
                      className="reactivate-btn"
                      onClick={() => reactivateService(serviceDetails.id)}
                    >
                      重新激活
                    </button>
                  )}
                </>
              )}
              
              {serviceDetails.status === SERVICE_STATUS.PENDING && userRoles.isReviewer && (
                <>
                  <button 
                    className="review-btn"
                    onClick={() => {
                      setSelectedServiceForReview(serviceDetails);
                      setServiceDetailsOpen(false);
                      setReviewPanelOpen(true);
                    }}
                  >
                    审核服务
                  </button>
                </>
              )}
              
              {(userRoles.isAdmin || userRoles.isReviewer) && (
                <div className="score-update">
                  <h4>更新评分</h4>
                  <div className="score-update-form">
                    <div className="score-input">
                      <label>性能评分 (0-100):</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue={serviceDetails.performanceScore}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            updatePerformanceScore(serviceDetails.id, value);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="score-input">
                      <label>信誉评分 (0-100):</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue={serviceDetails.reputationScore}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            updateReputationScore(serviceDetails.provider, value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {userRoles.isAdmin && (
                <div className="admin-actions">
                  <h4>管理员操作</h4>
                  <button 
                    className="blacklist-btn"
                    onClick={() => blacklistProvider(serviceDetails.provider)}
                  >
                    将提供商加入黑名单
                  </button>
                  
                  <button 
                    className="whitelist-btn"
                    onClick={() => whitelistProvider(serviceDetails.provider)}
                  >
                    将提供商加入白名单
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 审核历史 */}
          {(userRoles.isAdmin || userRoles.isReviewer) && (
            <div className="review-history-section">
              <h3>审核历史</h3>
              {isLoadingReviewHistory ? (
                <p className="loading-message">加载审核历史...</p>
              ) : reviewHistory.length === 0 ? (
                <p className="empty-message">没有审核历史记录</p>
              ) : (
                <div className="review-history-list">
                  {reviewHistory.map((record, index) => (
                    <div key={index} className="review-record">
                      <div className="review-record-header">
                        <span className="reviewer">{shortenAddress(record.reviewer)}</span>
                        <span 
                          className="decision"
                          style={{ backgroundColor: record.statusColor }}
                        >
                          {record.statusLabel}
                        </span>
                        <span className="timestamp">{record.timestamp.toLocaleString()}</span>
                      </div>
                      {record.comment && (
                        <div className="review-comment">
                          <p>{record.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="ai-service-registry">
      <ToastNotification 
        notifications={notifications}
        removeNotification={removeNotification}
        config={notificationConfig}
      />
      
      <div className="registry-header">
        <h1>AI服务注册中心</h1>
        
        <div className="header-actions">
          {!connected ? (
            <button 
              className="connect-wallet-btn"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? '连接中...' : '连接钱包'}
            </button>
          ) : (
            <>
              <div className="account-info">
                <span className="account-address">{shortenAddress(account)}</span>
                <div className="roles-badges">
                  {userRoles.isAdmin && <span className="role admin">管理员</span>}
                  {userRoles.isReviewer && <span className="role reviewer">审核员</span>}
                  {userRoles.isProvider && <span className="role provider">提供商</span>}
                </div>
              </div>
              
              <div className="action-buttons">
                {(userRoles.isReviewer || userRoles.isAdmin) && (
                  <button 
                    className="review-panel-btn"
                    onClick={() => setReviewPanelOpen(true)}
                  >
                    审核面板
                    {pendingServices.length > 0 && (
                      <span className="badge">{pendingServices.length}</span>
                    )}
                  </button>
                )}
                
                {userRoles.isAdmin && (
                  <button 
                    className="blacklist-panel-btn"
                    onClick={() => setBlacklistPanelOpen(true)}
                  >
                    黑白名单管理
                  </button>
                )}
                
                <button 
                  className="register-service-btn"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? '取消注册' : '注册服务'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isRegistering && (
        <div className="registration-form">
          <h2>注册新服务</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="service-name">服务名称:</label>
              <input 
                id="service-name"
                type="text"
                value={registrationForm.name}
                onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                placeholder="输入服务名称"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="service-type">服务类型:</label>
              <select
                id="service-type"
                value={registrationForm.serviceType}
                onChange={(e) => setRegistrationForm({...registrationForm, serviceType: e.target.value})}
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="service-price">价格 (CULT):</label>
              <input 
                id="service-price"
                type="number"
                min="0"
                step="0.01"
                value={registrationForm.pricePerToken}
                onChange={(e) => setRegistrationForm({...registrationForm, pricePerToken: e.target.value})}
                placeholder="输入每个代币的价格"
              />
            </div>
            
            <div className="form-group full-width">
              <label>支持语言:</label>
              <div className="languages-select">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <label key={lang.value} className="language-checkbox">
                    <input 
                      type="checkbox"
                      checked={registrationForm.languages.includes(lang.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRegistrationForm({
                            ...registrationForm, 
                            languages: [...registrationForm.languages, lang.value]
                          });
                        } else {
                          setRegistrationForm({
                            ...registrationForm, 
                            languages: registrationForm.languages.filter(l => l !== lang.value)
                          });
                        }
                      }}
                    />
                    {lang.label}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="service-description">服务描述:</label>
              <textarea 
                id="service-description"
                value={registrationForm.description}
                onChange={(e) => setRegistrationForm({...registrationForm, description: e.target.value})}
                placeholder="描述您的服务功能和特点"
                rows={3}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="service-capabilities">服务能力:</label>
              <textarea 
                id="service-capabilities"
                value={registrationForm.capabilities}
                onChange={(e) => setRegistrationForm({...registrationForm, capabilities: e.target.value})}
                placeholder="列出服务的主要能力和功能"
                rows={3}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="service-api">API端点:</label>
              <input 
                id="service-api"
                type="text"
                value={registrationForm.apiEndpoint}
                onChange={(e) => setRegistrationForm({...registrationForm, apiEndpoint: e.target.value})}
                placeholder="输入API端点URL"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              className="register-btn"
              onClick={registerService}
              disabled={isRegistering && !registrationForm.name}
            >
              注册服务
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setIsRegistering(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      <div className="services-container">
        <div className="services-header">
          <h2>AI服务列表</h2>
          
          <div className="services-actions">
            <div className="view-mode-toggle">
              <button 
                className={`view-mode-btn ${viewMode === 'paginated' ? 'active' : ''}`}
                onClick={() => setViewMode('paginated')}
              >
                分页视图
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'infinite' ? 'active' : ''}`}
                onClick={() => setViewMode('infinite')}
              >
                无限滚动
              </button>
            </div>
            
            <div className="batch-mode-toggle">
              <button 
                className={`batch-mode-btn ${batchMode ? 'active' : ''}`}
                onClick={() => setBatchMode(!batchMode)}
              >
                {batchMode ? '退出批量模式' : '批量操作'}
              </button>
            </div>
          </div>
        </div>
        
        {batchMode && selectedServices.length > 0 && (
          <div className="batch-actions">
            <span className="selected-count">已选择 {selectedServices.length} 个服务</span>
            <button 
              className="batch-activate-btn"
              onClick={batchReactivateServices}
            >
              批量激活
            </button>
            <button 
              className="batch-suspend-btn"
              onClick={batchSuspendServices}
            >
              批量暂停
            </button>
            <button 
              className="batch-clear-btn"
              onClick={() => setSelectedServices([])}
            >
              清除选择
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载服务中...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-services">
            <p>没有找到服务</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(renderServiceCard)}
          </div>
        )}
        
        {viewMode === 'paginated' && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        
        {viewMode === 'infinite' && isLoadingMore && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <p>加载更多...</p>
          </div>
        )}
      </div>
      
      {/* 审核面板 */}
      {renderReviewPanel()}
      
      {/* 黑白名单管理面板 */}
      {renderBlacklistPanel()}
      
      {/* 服务详情面板 */}
      {renderServiceDetailsPanel()}
    </div>
  );
};

export default AIServiceRegistry;
