import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import AIRegistryABI from '../../contracts/abis/AIRegistry.json';
import CultureTokenABI from '../../contracts/abis/CultureToken.json';
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
      
    } catch (error) {
      console.error("Error initializing web3:", error);
    }
  }, []);
  
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
  
  // 加载服务
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
    }
  }, [contracts.aiRegistry, account]);
  
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
    } catch (error) {
      console.error("Error searching services:", error);
      setIsLoading(false);
    }
  }, [contracts.aiRegistry, searchParams, services]);
  
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
      
      const tx = await contracts.aiRegistry.registerService(
        registrationForm.serviceType,
        registrationForm.languages,
        priceWei,
        metadataBase64
      );
      
      await tx.wait();
      
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
    }
  }, [contracts.aiRegistry, registrationForm, loadServices]);
  
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
      
      const tx = await contracts.aiRegistry.updateService(
        serviceId,
        registrationForm.serviceType || service.serviceType,
        registrationForm.languages || service.supportedLanguages,
        priceWei,
        metadataBase64
      );
      
      await tx.wait();
      
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
    }
  }, [contracts.aiRegistry, registrationForm, myServices, loadServices]);
  
  // 停用服务
  const deactivateService = useCallback(async (serviceId) => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      const tx = await contracts.aiRegistry.deactivateService(serviceId);
      await tx.wait();
      
      // 重新加载服务
      await loadServices();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error deactivating service:", error);
      setIsLoading(false);
    }
  }, [contracts.aiRegistry, loadServices]);
  
  // 激活服务
  const activateService = useCallback(async (serviceId) => {
    if (!contracts.aiRegistry) return;
    
    try {
      setIsLoading(true);
      
      const tx = await contracts.aiRegistry.activateService(serviceId);
      await tx.wait();
      
      // 重新加载服务
      await loadServices();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error activating service:", error);
      setIsLoading(false);
    }
  }, [contracts.aiRegistry, loadServices]);
  
  // 选择服务
  const selectService = useCallback((service) => {
    setSelectedService(service);
    
    // 触发自定义事件，通知其他组件
    const event = new CustomEvent('aiServiceSelected', { detail: service });
    window.dispatchEvent(event);
  }, []);
  
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
        className={`service-card ${selectedService && selectedService.id === service.id ? 'selected' : ''}`}
        onClick={() => selectService(service)}
      >
        <div className="service-header">
          <h3>{service.name}</h3>
          <div className="service-type-badge">{SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</div>
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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {service.performanceScore}/100
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
    return (
      <div className="registration-form">
        <h2>{registrationForm.id ? '更新服务' : '注册新服务'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">服务名称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={registrationForm.name}
            onChange={handleFormChange}
            placeholder="输入服务名称"
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
            placeholder="描述您的服务"
            rows="3"
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
          <label htmlFor="languages">支持的语言</label>
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
          <small>按住Ctrl键可多选</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="pricePerToken">每Token价格 (CULT)</label>
          <input
            type="number"
            id="pricePerToken"
            name="pricePerToken"
            value={registrationForm.pricePerToken}
            onChange={handleFormChange}
            min="0.000000000000000001"
            step="0.000000000000000001"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="capabilities">能力 (逗号分隔)</label>
          <input
            type="text"
            id="capabilities"
            name="capabilities"
            value={registrationForm.capabilities}
            onChange={handleFormChange}
            placeholder="翻译, 文化解释, 语法纠正"
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
            placeholder="https://api.example.com/translate"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
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
            type="button" 
            className="submit-button"
            onClick={() => {
              if (registrationForm.id) {
                updateService(registrationForm.id);
              } else {
                registerService();
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : (registrationForm.id ? '更新' : '注册')}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染搜索表单
  const renderSearchForm = () => {
    return (
      <div className="search-form">
        <div className="form-group">
          <label htmlFor="searchServiceType">服务类型</label>
          <select
            id="searchServiceType"
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
          <label htmlFor="searchLanguage">语言</label>
          <select
            id="searchLanguage"
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
            value={searchParams.maxPrice}
            onChange={handleSearchParamChange}
            min="0"
          />
        </div>
        
        <button 
          className="search-button"
          onClick={searchServices}
          disabled={isLoading}
        >
          {isLoading ? '搜索中...' : '搜索'}
        </button>
      </div>
    );
  };
  
  return (
    <div className="ai-service-registry">
      <div className="registry-header">
        <h1>AI服务注册中心</h1>
        {renderWalletButton()}
      </div>
      
      {connected && (
        <div className="registry-actions">
          <button 
            className="register-button"
            onClick={() => setIsRegistering(true)}
            disabled={isRegistering}
          >
            注册新服务
          </button>
          
          <button 
            className="refresh-button"
            onClick={loadServices}
            disabled={isLoading}
          >
            刷新
          </button>
        </div>
      )}
      
      {isRegistering ? (
        renderRegistrationForm()
      ) : (
        <>
          {renderSearchForm()}
          
          <div className="services-container">
            <h2>可用服务</h2>
            <div className="services-grid">
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                renderServices()
              )}
            </div>
          </div>
          
          {myServices.length > 0 && (
            <div className="my-services-container">
              <h2>我的服务</h2>
              <div className="services-grid">
                {myServices.map(service => (
                  <div 
                    key={service.id} 
                    className={`service-card ${service.isActive ? '' : 'inactive'}`}
                  >
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <div className="service-type-badge">{SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}</div>
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
                    
                    <div className="service-footer">
                      <div className="service-score">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        {service.performanceScore}/100
                      </div>
                      
                      <div className="service-price">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
                        </svg>
                        {service.pricePerToken} CULT/token
                      </div>
                      
                      <div className="service-status">
                        {service.isActive ? '活跃' : '已停用'}
                      </div>
                    </div>
                    
                    <div className="service-actions">
                      <button 
                        className="edit-button"
                        onClick={() => {
                          setRegistrationForm({
                            id: service.id,
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
                          onClick={() => deactivateService(service.id)}
                        >
                          停用
                        </button>
                      ) : (
                        <button 
                          className="activate-button"
                          onClick={() => activateService(service.id)}
                        >
                          激活
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">处理中，请稍候...</div>
        </div>
      )}
    </div>
  );
};

export default AIServiceRegistry;
