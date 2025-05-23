import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import AIRegistryABI from '../../contracts/abis/AIRegistry.json';
import CultureTokenABI from '../../contracts/abis/CultureToken.json';
import ToastNotification from '../notifications/ToastNotification';
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

const AIServiceRegistry = () => {
  // 状态变量
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [contracts, setContracts] = useState({});
  const [services, setServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchParams, setSearchParams] = useState({
    serviceType: 'translation',
    language: 'zh-CN',
    maxPrice: '100',
  });
  
  // 通知状态
  const [notifications, setNotifications] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState({});
  
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
  
  // 添加通知
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);
  
  // 更新交易状态
  const updateTransactionStatus = useCallback((txHash, status, message) => {
    setNotifications(prev => [
      ...prev,
      {
        type: status === 'confirmed' ? 'success' : status === 'failed' ? 'error' : 'info',
        title: status === 'confirmed' ? '交易已确认' : status === 'failed' ? '交易失败' : '交易状态更新',
        message: message || (status === 'confirmed' ? '您的交易已成功确认' : status === 'failed' ? '交易处理失败' : '交易状态已更新'),
        txHash,
        status,
        duration: 7000,
        animate: true
      }
    ]);
    
    // 更新待处理交易状态
    setPendingTransactions(prev => ({
      ...prev,
      [txHash]: status
    }));
  }, []);
  
  // 加载服务 - 提前声明以解决依赖顺序问题
  const loadServices = useCallback(async () => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      // 获取服务数量
      const serviceCount = await contracts.aiRegistry.serviceCount();
      
      // 获取所有服务
      const servicesData = [];
      for (let i = 0; i < serviceCount; i++) {
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
      
      setServices(servicesData);
      
      // 获取我的服务
      if (account) {
        const myServicesIds = await contracts.aiRegistry.getProviderServices(account);
        const myServicesData = myServicesIds.map(id => 
          servicesData.find(service => service.id.toString() === id.toString())
        ).filter(Boolean);
        
        setMyServices(myServicesData);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading services:", error);
      setIsLoading(false);
      
      // 添加加载失败通知
      addNotification({
        type: 'error',
        title: '加载失败',
        message: '无法加载服务列表，请检查网络连接',
        duration: 5000
      });
    }
  }, [contracts.aiRegistry, account, addNotification]);
  
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
      loadServices();
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
      loadServices();
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
      loadServices();
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
      loadServices();
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
      loadServices();
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
  
  // 搜索服务
  const searchServices = useCallback(async () => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      const maxPriceWei = ethers.utils.parseEther(searchParams.maxPrice || '100');
      
      const serviceIds = await contracts.aiRegistry.findServices(
        searchParams.serviceType,
        searchParams.language,
        maxPriceWei
      );
      
      // 获取服务详情
      const searchResults = [];
      for (const id of serviceIds) {
        const service = services.find(s => s.id.toString() === id.toString());
        if (service) {
          searchResults.push(service);
        }
      }
      
      // 按性能评分排序
      searchResults.sort((a, b) => parseInt(b.performanceScore) - parseInt(a.performanceScore));
      
      setServices(searchResults);
      setIsLoading(false);
      
      // 添加搜索结果通知
      addNotification({
        type: 'info',
        title: '搜索完成',
        message: `找到 ${searchResults.length} 个匹配的服务`,
        duration: 3000
      });
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
  }, [contracts.aiRegistry, searchParams, services, addNotification]);
  
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
      await loadServices();
      
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
      await loadServices();
      
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
      await loadServices();
      
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
      await loadServices();
      
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
  
  // 加载服务
  useEffect(() => {
    if (connected) {
      loadServices();
    }
  }, [connected, loadServices]);
  
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
  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    return services.map(service => (
      <div 
        key={service.id} 
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
    ));
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
      <ToastNotification notifications={notifications} position="top-right" />
      
      <div className="header">
        <h1>AI服务注册中心</h1>
        {renderWalletButton()}
      </div>
      
      {connected && (
        <div className="content">
          <div className="sidebar">
            <div className="search-form">
              <h2>搜索服务</h2>
              
              <div className="form-group">
                <label htmlFor="serviceType">服务类型</label>
                <select 
                  id="serviceType" 
                  name="serviceType" 
                  value={searchParams.serviceType} 
                  onChange={handleSearchParamChange}
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="language">语言</label>
                <select 
                  id="language" 
                  name="language" 
                  value={searchParams.language} 
                  onChange={handleSearchParamChange}
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="searchMaxPrice">最高价格 (CULT)</label>
                <input 
                  type="number" 
                  id="searchMaxPrice" 
                  name="maxPrice" 
                  min="0" 
                  value={searchParams.maxPrice} 
                  onChange={handleSearchParamChange} 
                />
              </div>
              
              <button className="search-button" onClick={searchServices}>搜索</button>
            </div>
            
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
            <h2>可用服务</h2>
            
            <div className="services-grid">
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>加载中...</span>
                </div>
              ) : (
                renderServices()
              )}
            </div>
          </div>
        </div>
      )}
      
      {renderRegistrationForm()}
    </div>
  );
};

export default AIServiceRegistry;
