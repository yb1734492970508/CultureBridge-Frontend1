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

// 每页显示的服务数量
const SERVICES_PER_PAGE = 6;

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
  
  // 无限滚动引用
  const observerRef = useRef(null);
  const lastServiceElementRef = useRef(null);
  
  // 添加通知
  const addNotification = useCallback((notification) => {
    // 检查是否需要分组相似通知
    if (notificationConfig.groupSimilar && notification.type !== 'error') {
      setNotifications(prev => {
        // 查找相似通知
        const similarIndex = prev.findIndex(n => 
          n.type === notification.type && 
          n.title === notification.title &&
          (!n.txHash || n.txHash === notification.txHash)
        );
        
        if (similarIndex >= 0) {
          // 更新相似通知
          const updatedNotifications = [...prev];
          const similarNotification = updatedNotifications[similarIndex];
          
          // 如果是交易状态更新，则替换
          if (notification.txHash) {
            updatedNotifications[similarIndex] = {
              ...notification,
              id: similarNotification.id,
              count: (similarNotification.count || 1) + 1,
              timestamp: Date.now()
            };
          } else {
            // 否则增加计数
            updatedNotifications[similarIndex] = {
              ...similarNotification,
              count: (similarNotification.count || 1) + 1,
              message: notification.message,
              timestamp: Date.now()
            };
          }
          
          return updatedNotifications;
        } else {
          // 添加新通知
          return [...prev, notification];
        }
      });
    } else {
      // 直接添加新通知
      setNotifications(prev => [...prev, notification]);
    }
    
    // 如果启用了声音提示
    if (notificationConfig.soundEnabled) {
      playNotificationSound(notification.type);
    }
  }, [notificationConfig.groupSimilar, notificationConfig.soundEnabled]);
  
  // 播放通知声音
  const playNotificationSound = (type) => {
    let sound;
    switch (type) {
      case 'success':
        sound = new Audio('/sounds/success.mp3');
        break;
      case 'error':
        sound = new Audio('/sounds/error.mp3');
        break;
      case 'warning':
        sound = new Audio('/sounds/warning.mp3');
        break;
      case 'info':
      default:
        sound = new Audio('/sounds/info.mp3');
        break;
    }
    sound.play().catch(e => console.log('无法播放通知声音:', e));
  };
  
  // 更新交易状态
  const updateTransactionStatus = useCallback((txHash, status, message) => {
    addNotification({
      type: status === 'confirmed' ? 'success' : status === 'failed' ? 'error' : 'info',
      title: status === 'confirmed' ? '交易已确认' : status === 'failed' ? '交易失败' : '交易状态更新',
      message: message || (status === 'confirmed' ? '您的交易已成功确认' : status === 'failed' ? '交易处理失败' : '交易状态已更新'),
      txHash,
      status,
      duration: 7000,
      animate: true
    });
    
    // 更新待处理交易状态
    setPendingTransactions(prev => ({
      ...prev,
      [txHash]: status
    }));
  }, [addNotification]);
  
  // 加载服务 - 提前声明以解决依赖顺序问题
  const loadServices = useCallback(async (page = 1, loadAll = false) => {
    if (!contracts.aiRegistry) return;
    
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      // 获取服务数量
      const serviceCount = await contracts.aiRegistry.serviceCount();
      setTotalServices(serviceCount.toNumber());
      
      // 计算总页数
      const pages = Math.ceil(serviceCount.toNumber() / SERVICES_PER_PAGE);
      setTotalPages(pages);
      
      // 计算起始和结束索引
      let startIndex = 0;
      let endIndex = serviceCount.toNumber();
      
      if (!loadAll) {
        startIndex = (page - 1) * SERVICES_PER_PAGE;
        endIndex = Math.min(startIndex + SERVICES_PER_PAGE, serviceCount.toNumber());
      }
      
      // 获取服务
      const servicesData = [];
      for (let i = startIndex; i < endIndex; i++) {
        const service = await contracts.aiRegistry.services(i);
        
        // 解析元数据
        let metadata = {};
        try {
          // 这里假设元数据是JSON格式的字符串
          // 实际应用中可能需要从IPFS获取
          metadata = JSON.parse(atob(service.metadataURI.replace('data:application/json;base64,', '')));
        } catch (error) {
          console.error(`Error parsing metadata for service ${i}:`, error);
          metadata = {
            name: `Service #${i}`,
            description: 'No description available',
            capabilities: [],
            apiEndpoint: '',
          };
        }
        
        servicesData.push({
          id: i,
          provider: service.provider,
          serviceType: service.serviceType,
          supportedLanguages: service.supportedLanguages,
          performanceScore: service.performanceScore.toString(),
          pricePerToken: ethers.utils.formatEther(service.pricePerToken),
          isActive: service.isActive,
          metadataURI: service.metadataURI,
          name: metadata.name || `Service #${i}`,
          description: metadata.description || '',
          capabilities: metadata.capabilities || [],
          apiEndpoint: metadata.apiEndpoint || '',
        });
      }
      
      if (loadAll) {
        setAllServices(servicesData);
        applyFilters(servicesData);
      } else if (page === 1) {
        setServices(servicesData);
      } else {
        setServices(prev => [...prev, ...servicesData]);
      }
      
      // 获取我的服务
      if (account) {
        const myServicesIds = await contracts.aiRegistry.getProviderServices(account);
        const myServicesData = [];
        
        for (const id of myServicesIds) {
          const service = await contracts.aiRegistry.services(id);
          
          // 解析元数据
          let metadata = {};
          try {
            metadata = JSON.parse(atob(service.metadataURI.replace('data:application/json;base64,', '')));
          } catch (error) {
            console.error(`Error parsing metadata for service ${id}:`, error);
            metadata = {
              name: `Service #${id}`,
              description: 'No description available',
              capabilities: [],
              apiEndpoint: '',
            };
          }
          
          myServicesData.push({
            id: id.toNumber(),
            provider: service.provider,
            serviceType: service.serviceType,
            supportedLanguages: service.supportedLanguages,
            performanceScore: service.performanceScore.toString(),
            pricePerToken: ethers.utils.formatEther(service.pricePerToken),
            isActive: service.isActive,
            metadataURI: service.metadataURI,
            name: metadata.name || `Service #${id}`,
            description: metadata.description || '',
            capabilities: metadata.capabilities || [],
            apiEndpoint: metadata.apiEndpoint || '',
          });
        }
        
        setMyServices(myServicesData);
      }
      
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
      
      // 添加加载失败通知
      addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载服务列表，请检查网络连接',
        duration: 5000
      });
    }
  }, [contracts.aiRegistry, account, addNotification]);
  
  // 应用筛选条件
  const applyFilters = useCallback((services = allServices) => {
    if (!services.length) return;
    
    let filteredServices = [...services];
    
    // 筛选服务类型
    if (searchParams.serviceTypes.length > 0) {
      filteredServices = filteredServices.filter(service => 
        searchParams.serviceTypes.includes(service.serviceType)
      );
    }
    
    // 筛选语言
    if (searchParams.languages.length > 0) {
      filteredServices = filteredServices.filter(service => 
        service.supportedLanguages.some(lang => searchParams.languages.includes(lang))
      );
    }
    
    // 筛选价格区间
    filteredServices = filteredServices.filter(service => {
      const price = parseFloat(service.pricePerToken);
      return price >= searchParams.priceRange[0] && price <= searchParams.priceRange[1];
    });
    
    // 筛选评分区间
    filteredServices = filteredServices.filter(service => {
      const score = parseInt(service.performanceScore);
      return score >= searchParams.scoreRange[0] && score <= searchParams.scoreRange[1];
    });
    
    // 排序
    filteredServices.sort((a, b) => {
      let comparison = 0;
      
      switch (searchParams.sortBy) {
        case 'score':
          comparison = parseInt(b.performanceScore) - parseInt(a.performanceScore);
          break;
        case 'price':
          comparison = parseFloat(a.pricePerToken) - parseFloat(b.pricePerToken);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = parseInt(b.performanceScore) - parseInt(a.performanceScore);
      }
      
      return searchParams.sortDirection === 'asc' ? comparison * -1 : comparison;
    });
    
    // 更新服务列表
    setServices(filteredServices);
    
    // 更新分页信息
    setTotalServices(filteredServices.length);
    setTotalPages(Math.ceil(filteredServices.length / SERVICES_PER_PAGE));
    setCurrentPage(1);
    
    // 添加筛选结果通知
    addNotification({
      type: 'info',
      title: '筛选完成',
      message: `找到 ${filteredServices.length} 个匹配的服务`,
      duration: 3000
    });
  }, [allServices, searchParams, addNotification]);
  
  // 初始化Web3
  const initWeb3 = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal({
        network: "testnet",
        cacheProvider: true,
      });
      
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setConnected(true);
      
      // 初始化合约
      const aiRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.aiRegistry,
        AIRegistryABI.abi,
        signer
      );
      
      const cultureToken = new ethers.Contract(
        CONTRACT_ADDRESSES.cultureToken,
        CultureTokenABI.abi,
        signer
      );
      
      setContracts({
        aiRegistry,
        cultureToken
      });
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        window.location.reload();
      });
      
      // 监听链变化
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
      // 添加连接成功通知
      addNotification({
        type: 'success',
        title: '钱包已连接',
        message: `已成功连接到地址 ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
        duration: 5000
      });
      
    } catch (error) {
      console.error("Error initializing web3:", error);
      
      // 添加连接失败通知
      addNotification({
        type: 'error',
        title: '连接失败',
        message: '无法连接到钱包，请确保已安装MetaMask并授权访问',
        duration: 5000
      });
    }
  }, [addNotification]);
  
  // 连接钱包
  const connectWallet = useCallback(async () => {
    try {
      await initWeb3();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [initWeb3]);
  
  // 初始化
  useEffect(() => {
    if (window.ethereum) {
      initWeb3();
    }
  }, [initWeb3]);
  
  // 设置事件监听
  useEffect(() => {
    if (!contracts.aiRegistry) return;
    
    // 监听服务注册事件
    const serviceRegisteredFilter = contracts.aiRegistry.filters.ServiceRegistered();
    const serviceUpdatedFilter = contracts.aiRegistry.filters.ServiceUpdated();
    const serviceDeactivatedFilter = contracts.aiRegistry.filters.ServiceDeactivated();
    const serviceActivatedFilter = contracts.aiRegistry.filters.ServiceActivated();
    const performanceScoreUpdatedFilter = contracts.aiRegistry.filters.PerformanceScoreUpdated();
    
    // 处理服务注册事件
    const handleServiceRegistered = (serviceId, provider, serviceType) => {
      addNotification({
        type: 'info',
        title: '新服务已注册',
        message: `服务ID: ${serviceId}，类型: ${SERVICE_TYPES.find(t => t.value === serviceType)?.label || serviceType}`,
        duration: 5000
      });
      
      // 重新加载服务列表
      loadServices(1, true);
    };
    
    // 处理服务更新事件
    const handleServiceUpdated = (serviceId, provider) => {
      addNotification({
        type: 'info',
        title: '服务已更新',
        message: `服务ID: ${serviceId} 已被更新`,
        duration: 5000
      });
      
      // 重新加载服务列表
      loadServices(1, true);
    };
    
    // 处理服务停用事件
    const handleServiceDeactivated = (serviceId, provider) => {
      addNotification({
        type: 'warning',
        title: '服务已停用',
        message: `服务ID: ${serviceId} 已被停用`,
        duration: 5000
      });
      
      // 重新加载服务列表
      loadServices(1, true);
    };
    
    // 处理服务激活事件
    const handleServiceActivated = (serviceId, provider) => {
      addNotification({
        type: 'success',
        title: '服务已激活',
        message: `服务ID: ${serviceId} 已被激活`,
        duration: 5000
      });
      
      // 重新加载服务列表
      loadServices(1, true);
    };
    
    // 处理性能评分更新事件
    const handlePerformanceScoreUpdated = (serviceId, newScore) => {
      addNotification({
        type: 'info',
        title: '性能评分已更新',
        message: `服务ID: ${serviceId} 的性能评分已更新为 ${newScore}`,
        duration: 5000
      });
      
      // 重新加载服务列表
      loadServices(1, true);
    };
    
    // 添加事件监听器
    contracts.aiRegistry.on(serviceRegisteredFilter, handleServiceRegistered);
    contracts.aiRegistry.on(serviceUpdatedFilter, handleServiceUpdated);
    contracts.aiRegistry.on(serviceDeactivatedFilter, handleServiceDeactivated);
    contracts.aiRegistry.on(serviceActivatedFilter, handleServiceActivated);
    contracts.aiRegistry.on(performanceScoreUpdatedFilter, handlePerformanceScoreUpdated);
    
    // 清理函数
    return () => {
      contracts.aiRegistry.off(serviceRegisteredFilter, handleServiceRegistered);
      contracts.aiRegistry.off(serviceUpdatedFilter, handleServiceUpdated);
      contracts.aiRegistry.off(serviceDeactivatedFilter, handleServiceDeactivated);
      contracts.aiRegistry.off(serviceActivatedFilter, handleServiceActivated);
      contracts.aiRegistry.off(performanceScoreUpdatedFilter, handlePerformanceScoreUpdated);
    };
  }, [contracts.aiRegistry, addNotification, loadServices]);
  
  // 设置无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'infinite') return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [viewMode, isLoadingMore, currentPage, totalPages]);
  
  // 观察最后一个服务元素
  useEffect(() => {
    if (viewMode !== 'infinite' || !lastServiceElementRef.current || !observerRef.current) return;
    
    const currentObserver = observerRef.current;
    const currentElement = lastServiceElementRef.current;
    
    currentObserver.observe(currentElement);
    
    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [services, viewMode]);
  
  // 页面变化时加载服务
  useEffect(() => {
    if (connected && currentPage > 0) {
      if (viewMode === 'paginated') {
        // 分页模式下，每次加载当前页的服务
        loadServices(currentPage);
      } else if (viewMode === 'infinite' && currentPage > 1) {
        // 无限滚动模式下，加载下一页服务
        loadServices(currentPage);
      }
    }
  }, [connected, currentPage, viewMode, loadServices]);
  
  // 初始加载所有服务（用于筛选）
  useEffect(() => {
    if (connected) {
      loadServices(1, true);
    }
  }, [connected, loadServices]);
  
  // 搜索服务
  const searchServices = useCallback(async () => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 应用筛选条件
      applyFilters();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error searching services:", error);
      setIsLoading(false);
      
      // 添加搜索失败通知
      addNotification({
        type: 'error',
        title: '搜索失败',
        message: '无法完成搜索，请检查搜索参数',
        duration: 5000
      });
    }
  }, [contracts.aiRegistry, applyFilters, addNotification]);
  
  // 注册服务
  const registerService = useCallback(async () => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 准备元数据
      const metadata = {
        name: registrationForm.name,
        description: registrationForm.description,
        capabilities: registrationForm.capabilities.split(',').map(cap => cap.trim()),
        apiEndpoint: registrationForm.apiEndpoint,
      };
      
      // 编码元数据为Base64
      const metadataBase64 = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // 注册服务
      const priceWei = ethers.utils.parseEther(registrationForm.pricePerToken);
      
      // 添加交易发送通知
      addNotification({
        type: 'info',
        title: '交易发送中',
        message: '正在发送服务注册交易，请等待确认',
        duration: 5000
      });
      
      const tx = await contracts.aiRegistry.registerService(
        registrationForm.serviceType,
        registrationForm.languages,
        priceWei,
        metadataBase64
      );
      
      // 添加交易待确认通知
      addNotification({
        type: 'info',
        title: '交易已提交',
        message: '服务注册交易已提交，等待区块确认',
        txHash: tx.hash,
        status: 'pending',
        duration: 10000
      });
      
      // 更新待处理交易
      setPendingTransactions(prev => ({
        ...prev,
        [tx.hash]: 'pending'
      }));
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 更新交易状态
      updateTransactionStatus(
        tx.hash, 
        'confirmed', 
        `服务 "${registrationForm.name}" 已成功注册！`
      );
      
      // 重新加载服务
      await loadServices(1, true);
      
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
      
      setIsRegistering(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error registering service:", error);
      setIsLoading(false);
      
      // 添加注册失败通知
      addNotification({
        type: 'error',
        title: '注册失败',
        message: `服务注册失败: ${error.message}`,
        duration: 7000
      });
    }
  }, [contracts.aiRegistry, registrationForm, loadServices, addNotification, updateTransactionStatus]);
  
  // 更新服务
  const updateService = useCallback(async (serviceId) => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 获取当前服务
      const service = myServices.find(s => s.id.toString() === serviceId.toString());
      if (!service) {
        throw new Error("Service not found");
      }
      
      // 准备元数据
      const metadata = {
        name: registrationForm.name || service.name,
        description: registrationForm.description || service.description,
        capabilities: (registrationForm.capabilities ? 
          registrationForm.capabilities.split(',').map(cap => cap.trim()) : 
          service.capabilities),
        apiEndpoint: registrationForm.apiEndpoint || service.apiEndpoint,
      };
      
      // 编码元数据为Base64
      const metadataBase64 = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // 更新服务
      const priceWei = ethers.utils.parseEther(registrationForm.pricePerToken || service.pricePerToken);
      
      // 添加交易发送通知
      addNotification({
        type: 'info',
        title: '交易发送中',
        message: '正在发送服务更新交易，请等待确认',
        duration: 5000
      });
      
      const tx = await contracts.aiRegistry.updateService(
        serviceId,
        registrationForm.serviceType || service.serviceType,
        registrationForm.languages || service.supportedLanguages,
        priceWei,
        metadataBase64
      );
      
      // 添加交易待确认通知
      addNotification({
        type: 'info',
        title: '交易已提交',
        message: '服务更新交易已提交，等待区块确认',
        txHash: tx.hash,
        status: 'pending',
        duration: 10000
      });
      
      // 更新待处理交易
      setPendingTransactions(prev => ({
        ...prev,
        [tx.hash]: 'pending'
      }));
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 更新交易状态
      updateTransactionStatus(
        tx.hash, 
        'confirmed', 
        `服务 "${metadata.name}" 已成功更新！`
      );
      
      // 重新加载服务
      await loadServices(1, true);
      
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
      
      setIsRegistering(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating service:", error);
      setIsLoading(false);
      
      // 添加更新失败通知
      addNotification({
        type: 'error',
        title: '更新失败',
        message: `服务更新失败: ${error.message}`,
        duration: 7000
      });
    }
  }, [contracts.aiRegistry, registrationForm, myServices, loadServices, addNotification, updateTransactionStatus]);
  
  // 停用服务
  const deactivateService = useCallback(async (serviceId) => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 添加交易发送通知
      addNotification({
        type: 'info',
        title: '交易发送中',
        message: '正在发送服务停用交易，请等待确认',
        duration: 5000
      });
      
      const tx = await contracts.aiRegistry.deactivateService(serviceId);
      
      // 添加交易待确认通知
      addNotification({
        type: 'info',
        title: '交易已提交',
        message: '服务停用交易已提交，等待区块确认',
        txHash: tx.hash,
        status: 'pending',
        duration: 10000
      });
      
      // 更新待处理交易
      setPendingTransactions(prev => ({
        ...prev,
        [tx.hash]: 'pending'
      }));
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 更新交易状态
      updateTransactionStatus(
        tx.hash, 
        'confirmed', 
        `服务 ID: ${serviceId} 已成功停用！`
      );
      
      // 重新加载服务
      await loadServices(1, true);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error deactivating service:", error);
      setIsLoading(false);
      
      // 添加停用失败通知
      addNotification({
        type: 'error',
        title: '停用失败',
        message: `服务停用失败: ${error.message}`,
        duration: 7000
      });
    }
  }, [contracts.aiRegistry, loadServices, addNotification, updateTransactionStatus]);
  
  // 激活服务
  const activateService = useCallback(async (serviceId) => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 添加交易发送通知
      addNotification({
        type: 'info',
        title: '交易发送中',
        message: '正在发送服务激活交易，请等待确认',
        duration: 5000
      });
      
      const tx = await contracts.aiRegistry.activateService(serviceId);
      
      // 添加交易待确认通知
      addNotification({
        type: 'info',
        title: '交易已提交',
        message: '服务激活交易已提交，等待区块确认',
        txHash: tx.hash,
        status: 'pending',
        duration: 10000
      });
      
      // 更新待处理交易
      setPendingTransactions(prev => ({
        ...prev,
        [tx.hash]: 'pending'
      }));
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 更新交易状态
      updateTransactionStatus(
        tx.hash, 
        'confirmed', 
        `服务 ID: ${serviceId} 已成功激活！`
      );
      
      // 重新加载服务
      await loadServices(1, true);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error activating service:", error);
      setIsLoading(false);
      
      // 添加激活失败通知
      addNotification({
        type: 'error',
        title: '激活失败',
        message: `服务激活失败: ${error.message}`,
        duration: 7000
      });
    }
  }, [contracts.aiRegistry, loadServices, addNotification, updateTransactionStatus]);
  
  // 选择服务
  const selectService = useCallback((service) => {
    setSelectedService(service);
    
    // 触发自定义事件，通知其他组件
    const event = new CustomEvent('aiServiceSelected', { detail: service });
    window.dispatchEvent(event);
    
    // 添加服务选择通知
    addNotification({
      type: 'info',
      title: '服务已选择',
      message: `已选择服务: ${service.name}`,
      duration: 3000
    });
  }, [addNotification]);
  
  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理语言选择变化
  const handleLanguageChange = (e) => {
    const options = e.target.options;
    const selectedLanguages = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedLanguages.push(options[i].value);
      }
    }
    setRegistrationForm(prev => ({
      ...prev,
      languages: selectedLanguages
    }));
  };
  
  // 处理搜索参数变化
  const handleSearchParamChange = (name, value) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理通知配置变化
  const handleNotificationConfigChange = (name, value) => {
    setNotificationConfig(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 添加配置更新通知
    addNotification({
      type: 'info',
      title: '通知设置已更新',
      message: `${name} 已设置为 ${value}`,
      duration: 3000
    });
  };
  
  // 处理分页变化
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'paginated' ? 'infinite' : 'paginated');
    setCurrentPage(1);
  };
  
  // 渲染钱包连接按钮
  const renderWalletButton = () => {
    if (!connected) {
      return (
        <button className="wallet-connect-button" onClick={connectWallet}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M21 8h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          连接钱包
        </button>
      );
    }
    
    return (
      <div className="wallet-info">
        <div className="wallet-address">
          {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </div>
      </div>
    );
  };
  
  // 渲染服务列表
  const renderServices = () => {
    if (services.length === 0) {
      return <div className="empty-message">暂无可用服务</div>;
    }
    
    // 计算当前页显示的服务
    let displayedServices = services;
    if (viewMode === 'paginated') {
      const startIndex = 0;
      const endIndex = Math.min(SERVICES_PER_PAGE, services.length);
      displayedServices = services.slice(startIndex, endIndex);
    }
    
    return displayedServices.map((service, index) => {
      // 为无限滚动模式的最后一个元素添加引用
      const isLastElement = index === displayedServices.length - 1;
      const ref = isLastElement && viewMode === 'infinite' ? lastServiceElementRef : null;
      
      return (
        <div 
          key={service.id} 
          ref={ref}
          className={`service-card ${selectedService && selectedService.id === service.id ? 'selected' : ''} ${!service.isActive ? 'inactive' : ''}`}
          onClick={() => selectService(service)}
        >
          <div className="service-header">
            <h3>{service.name}</h3>
            <div className="service-type-badge">{SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</div>
            {!service.isActive && <div className="inactive-badge">已停用</div>}
          </div>
          
          <div className="service-description">{service.description}</div>
          
          <div className="service-languages">
            <strong>支持语言:</strong>
            <div className="language-tags">
              {service.supportedLanguages.map(lang => (
                <span key={lang} className="language-tag">
                  {LANGUAGE_OPTIONS.find(l => l.value === lang)?.label || lang}
                </span>
              ))}
            </div>
          </div>
          
          <div className="service-capabilities">
            <strong>能力:</strong>
            <div className="capability-tags">
              {service.capabilities.map((cap, index) => (
                <span key={index} className="capability-tag">{cap}</span>
              ))}
            </div>
          </div>
          
          <div className="service-footer">
            <div className="service-score">
              <div className="score-gauge">
                <svg viewBox="0 0 36 36" className="score-circle">
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
              </div>
            </div>
            
            <div className="service-price">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
              </svg>
              {service.pricePerToken} CULT/token
            </div>
          </div>
          
          {service.provider.toLowerCase() === account.toLowerCase() && (
            <div className="service-actions">
              <button 
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRegistrationForm({
                    serviceType: service.serviceType,
                    languages: service.supportedLanguages,
                    pricePerToken: service.pricePerToken,
                    metadataURI: service.metadataURI,
                    name: service.name,
                    description: service.description,
                    capabilities: service.capabilities.join(', '),
                    apiEndpoint: service.apiEndpoint,
                  });
                  setIsRegistering(true);
                }}
              >
                编辑
              </button>
              
              {service.isActive ? (
                <button 
                  className="deactivate-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deactivateService(service.id);
                  }}
                >
                  停用
                </button>
              ) : (
                <button 
                  className="activate-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateService(service.id);
                  }}
                >
                  激活
                </button>
              )}
            </div>
          )}
        </div>
      );
    });
  };
  
  // 渲染高级筛选面板
  const renderAdvancedFilters = () => {
    return (
      <div className="advanced-filters">
        <h3>高级筛选</h3>
        
        <div className="filter-group">
          <label>服务类型</label>
          <MultiSelect
            options={SERVICE_TYPES}
            selected={searchParams.serviceTypes}
            onChange={(selected) => handleSearchParamChange('serviceTypes', selected)}
            placeholder="选择服务类型"
          />
        </div>
        
        <div className="filter-group">
          <label>支持语言</label>
          <MultiSelect
            options={LANGUAGE_OPTIONS}
            selected={searchParams.languages}
            onChange={(selected) => handleSearchParamChange('languages', selected)}
            placeholder="选择语言"
          />
        </div>
        
        <div className="filter-group">
          <label>价格区间 (CULT)</label>
          <RangeSlider
            min={0}
            max={100}
            step={1}
            values={searchParams.priceRange}
            onChange={(values) => handleSearchParamChange('priceRange', values)}
          />
          <div className="range-values">
            <span>{searchParams.priceRange[0]}</span>
            <span>{searchParams.priceRange[1]}</span>
          </div>
        </div>
        
        <div className="filter-group">
          <label>性能评分</label>
          <RangeSlider
            min={0}
            max={100}
            step={1}
            values={searchParams.scoreRange}
            onChange={(values) => handleSearchParamChange('scoreRange', values)}
          />
          <div className="range-values">
            <span>{searchParams.scoreRange[0]}</span>
            <span>{searchParams.scoreRange[1]}</span>
          </div>
        </div>
        
        <div className="filter-group">
          <label>排序方式</label>
          <div className="sort-controls">
            <select
              value={searchParams.sortBy}
              onChange={(e) => handleSearchParamChange('sortBy', e.target.value)}
            >
              <option value="score">按评分</option>
              <option value="price">按价格</option>
              <option value="name">按名称</option>
            </select>
            
            <button
              className={`sort-direction ${searchParams.sortDirection === 'desc' ? 'desc' : 'asc'}`}
              onClick={() => handleSearchParamChange('sortDirection', searchParams.sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              {searchParams.sortDirection === 'asc' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <button className="apply-filters-button" onClick={searchServices}>
          应用筛选
        </button>
        
        <button 
          className="reset-filters-button"
          onClick={() => {
            setSearchParams({
              serviceTypes: ['translation'],
              languages: ['zh-CN'],
              priceRange: [0, 100],
              scoreRange: [0, 100],
              sortBy: 'score',
              sortDirection: 'desc',
            });
            
            // 重新加载所有服务
            loadServices(1, true);
          }}
        >
          重置筛选
        </button>
      </div>
    );
  };
  
  // 渲染通知设置面板
  const renderNotificationSettings = () => {
    return (
      <div className="notification-settings">
        <h3>通知设置</h3>
        
        <div className="setting-group">
          <label>通知位置</label>
          <select
            value={notificationConfig.position}
            onChange={(e) => handleNotificationConfigChange('position', e.target.value)}
          >
            <option value="top-right">右上角</option>
            <option value="top-left">左上角</option>
            <option value="bottom-right">右下角</option>
            <option value="bottom-left">左下角</option>
          </select>
        </div>
        
        <div className="setting-group">
          <label>分组相似通知</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="groupSimilar"
              checked={notificationConfig.groupSimilar}
              onChange={(e) => handleNotificationConfigChange('groupSimilar', e.target.checked)}
            />
            <label htmlFor="groupSimilar"></label>
          </div>
        </div>
        
        <div className="setting-group">
          <label>声音提示</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="soundEnabled"
              checked={notificationConfig.soundEnabled}
              onChange={(e) => handleNotificationConfigChange('soundEnabled', e.target.checked)}
            />
            <label htmlFor="soundEnabled"></label>
          </div>
        </div>
        
        <div className="setting-group">
          <label>悬停时保持显示</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="persistOnHover"
              checked={notificationConfig.persistOnHover}
              onChange={(e) => handleNotificationConfigChange('persistOnHover', e.target.checked)}
            />
            <label htmlFor="persistOnHover"></label>
          </div>
        </div>
        
        <div className="setting-group">
          <label>最大显示数量</label>
          <input
            type="number"
            min="1"
            max="10"
            value={notificationConfig.maxVisible}
            onChange={(e) => handleNotificationConfigChange('maxVisible', parseInt(e.target.value))}
          />
        </div>
        
        <button 
          className="test-notification-button"
          onClick={() => {
            addNotification({
              type: 'info',
              title: '测试通知',
              message: '这是一条测试通知，用于验证通知设置',
              duration: 5000
            });
          }}
        >
          发送测试通知
        </button>
      </div>
    );
  };
  
  // 渲染注册表单
  const renderRegistrationForm = () => {
    if (!isRegistering) return null;
    
    return (
      <div className="registration-form-overlay">
        <div className="registration-form">
          <h2>{registrationForm.metadataURI ? '编辑服务' : '注册新服务'}</h2>
          
          <div className="form-group">
            <label htmlFor="name">服务名称</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={registrationForm.name} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">服务描述</label>
            <textarea 
              id="description" 
              name="description" 
              value={registrationForm.description} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="serviceType">服务类型</label>
            <select 
              id="serviceType" 
              name="serviceType" 
              value={registrationForm.serviceType} 
              onChange={handleFormChange} 
              required
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="languages">支持语言 (多选)</label>
            <select 
              id="languages" 
              name="languages" 
              multiple 
              value={registrationForm.languages} 
              onChange={handleLanguageChange} 
              required
            >
              {LANGUAGE_OPTIONS.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="capabilities">能力 (逗号分隔)</label>
            <input 
              type="text" 
              id="capabilities" 
              name="capabilities" 
              value={registrationForm.capabilities} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pricePerToken">每Token价格 (CULT)</label>
            <input 
              type="number" 
              id="pricePerToken" 
              name="pricePerToken" 
              min="0" 
              value={registrationForm.pricePerToken} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apiEndpoint">API端点</label>
            <input 
              type="text" 
              id="apiEndpoint" 
              name="apiEndpoint" 
              value={registrationForm.apiEndpoint} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="cancel-button" 
              onClick={() => {
                setIsRegistering(false);
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
              }}
            >
              取消
            </button>
            
            <button 
              className="submit-button" 
              onClick={() => {
                if (registrationForm.metadataURI) {
                  updateService(selectedService.id);
                } else {
                  registerService();
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : (registrationForm.metadataURI ? '更新' : '注册')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="ai-service-registry">
      <ToastNotification 
        notifications={notifications} 
        position={notificationConfig.position}
        persistOnHover={notificationConfig.persistOnHover}
        maxVisible={notificationConfig.maxVisible}
      />
      
      <div className="header">
        <h1>AI服务注册中心</h1>
        {renderWalletButton()}
      </div>
      
      {connected && (
        <div className="content">
          <div className="sidebar">
            <div className="view-mode-toggle">
              <span>视图模式:</span>
              <button 
                className={`view-mode-button ${viewMode === 'paginated' ? 'active' : ''}`}
                onClick={() => viewMode !== 'paginated' && toggleViewMode()}
              >
                分页
              </button>
              <button 
                className={`view-mode-button ${viewMode === 'infinite' ? 'active' : ''}`}
                onClick={() => viewMode !== 'infinite' && toggleViewMode()}
              >
                无限滚动
              </button>
            </div>
            
            {renderAdvancedFilters()}
            
            {renderNotificationSettings()}
            
            <div className="my-services">
              <h2>我的服务</h2>
              
              {myServices.length === 0 ? (
                <div className="empty-message">您还没有注册服务</div>
              ) : (
                <div className="my-services-list">
                  {myServices.map(service => (
                    <div 
                      key={service.id} 
                      className={`my-service-item ${!service.isActive ? 'inactive' : ''}`}
                      onClick={() => selectService(service)}
                    >
                      <div className="my-service-name">{service.name}</div>
                      <div className="my-service-type">{SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</div>
                      {!service.isActive && <div className="inactive-badge small">已停用</div>}
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="register-button" 
                onClick={() => setIsRegistering(true)}
              >
                注册新服务
              </button>
            </div>
          </div>
          
          <div className="services-container">
            <div className="services-header">
              <h2>可用服务</h2>
              <div className="services-stats">
                {totalServices > 0 && (
                  <span className="services-count">
                    共 {totalServices} 个服务
                    {viewMode === 'paginated' && `, 当前显示 ${Math.min(SERVICES_PER_PAGE, services.length)} 个`}
                  </span>
                )}
              </div>
            </div>
            
            <div className="services-grid">
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>加载中...</span>
                </div>
              ) : (
                renderServices()
              )}
              
              {isLoadingMore && (
                <div className="loading-more">
                  <div className="spinner small"></div>
                  <span>加载更多...</span>
                </div>
              )}
            </div>
            
            {viewMode === 'paginated' && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}
      
      {renderRegistrationForm()}
    </div>
  );
};

export default AIServiceRegistry;
