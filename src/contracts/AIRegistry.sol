// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AIRegistry
 * @dev 管理AI服务提供商注册和发现的智能合约
 */
contract AIRegistry is Ownable, Pausable, ReentrancyGuard {
    // 服务结构
    struct Service {
        address provider;           // 服务提供商地址
        string serviceType;         // 服务类型（翻译、文化解释等）
        string[] supportedLanguages; // 支持的语言
        uint256 performanceScore;   // 性能评分(0-100)
        uint256 pricePerToken;      // 每个代币的价格
        bool isActive;              // 是否活跃
        string metadataURI;         // 元数据URI(IPFS)
    }
    
    // 存储
    mapping(uint256 => Service) public services;
    uint256 public serviceCount;
    
    // 索引
    mapping(address => uint256[]) public providerServices;
    mapping(string => uint256[]) public serviceTypeIndex;
    mapping(string => uint256[]) public languageIndex;
    
    // 事件
    event ServiceRegistered(uint256 indexed serviceId, address indexed provider, string serviceType);
    event ServiceUpdated(uint256 indexed serviceId, address indexed provider);
    event ServiceDeactivated(uint256 indexed serviceId, address indexed provider);
    event ServiceActivated(uint256 indexed serviceId, address indexed provider);
    event PerformanceScoreUpdated(uint256 indexed serviceId, uint256 newScore);
    
    /**
     * @dev 构造函数
     */
    constructor() {
        serviceCount = 0;
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 注册新服务
     * @param serviceType 服务类型
     * @param languages 支持的语言
     * @param pricePerToken 每个代币的价格
     * @param metadataURI 元数据URI
     */
    function registerService(
        string calldata serviceType,
        string[] calldata languages,
        uint256 pricePerToken,
        string calldata metadataURI
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(serviceType).length > 0, "Service type required");
        require(languages.length > 0, "At least one language required");
        require(pricePerToken > 0, "Price must be positive");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        uint256 serviceId = serviceCount;
        serviceCount++;
        
        services[serviceId] = Service({
            provider: msg.sender,
            serviceType: serviceType,
            supportedLanguages: languages,
            performanceScore: 0,
            pricePerToken: pricePerToken,
            isActive: true,
            metadataURI: metadataURI
        });
        
        // 更新索引
        providerServices[msg.sender].push(serviceId);
        serviceTypeIndex[serviceType].push(serviceId);
        
        for (uint i = 0; i < languages.length; i++) {
            languageIndex[languages[i]].push(serviceId);
        }
        
        emit ServiceRegistered(serviceId, msg.sender, serviceType);
        
        return serviceId;
    }
    
    /**
     * @dev 更新服务
     * @param serviceId 服务ID
     * @param serviceType 服务类型
     * @param languages 支持的语言
     * @param pricePerToken 每个代币的价格
     * @param metadataURI 元数据URI
     */
    function updateService(
        uint256 serviceId,
        string calldata serviceType,
        string[] calldata languages,
        uint256 pricePerToken,
        string calldata metadataURI
    ) external whenNotPaused nonReentrant {
        require(serviceId < serviceCount, "Service does not exist");
        require(services[serviceId].provider == msg.sender, "Not the provider");
        require(bytes(serviceType).length > 0, "Service type required");
        require(languages.length > 0, "At least one language required");
        require(pricePerToken > 0, "Price must be positive");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        Service storage service = services[serviceId];
        
        // 更新服务
        service.serviceType = serviceType;
        service.supportedLanguages = languages;
        service.pricePerToken = pricePerToken;
        service.metadataURI = metadataURI;
        
        emit ServiceUpdated(serviceId, msg.sender);
    }
    
    /**
     * @dev 停用服务
     * @param serviceId 服务ID
     */
    function deactivateService(uint256 serviceId) external whenNotPaused {
        require(serviceId < serviceCount, "Service does not exist");
        require(services[serviceId].provider == msg.sender || msg.sender == owner(), "Not authorized");
        
        services[serviceId].isActive = false;
        
        emit ServiceDeactivated(serviceId, services[serviceId].provider);
    }
    
    /**
     * @dev 激活服务
     * @param serviceId 服务ID
     */
    function activateService(uint256 serviceId) external whenNotPaused {
        require(serviceId < serviceCount, "Service does not exist");
        require(services[serviceId].provider == msg.sender, "Not the provider");
        
        services[serviceId].isActive = true;
        
        emit ServiceActivated(serviceId, msg.sender);
    }
    
    /**
     * @dev 更新性能评分
     * @param serviceId 服务ID
     * @param newScore 新评分
     */
    function updatePerformanceScore(uint256 serviceId, uint256 newScore) external onlyOwner whenNotPaused {
        require(serviceId < serviceCount, "Service does not exist");
        require(newScore <= 100, "Score must be 0-100");
        
        services[serviceId].performanceScore = newScore;
        
        emit PerformanceScoreUpdated(serviceId, newScore);
    }
    
    /**
     * @dev 查找服务
     * @param serviceType 服务类型
     * @param language 语言
     * @param maxPrice 最高价格
     */
    function findServices(
        string calldata serviceType,
        string calldata language,
        uint256 maxPrice
    ) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 计算符合条件的服务数量
        for (uint i = 0; i < serviceCount; i++) {
            if (services[i].isActive &&
                keccak256(abi.encodePacked(services[i].serviceType)) == keccak256(abi.encodePacked(serviceType)) &&
                services[i].pricePerToken <= maxPrice &&
                containsLanguage(services[i].supportedLanguages, language)) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory result = new uint256[](count);
        uint256 resultIndex = 0;
        
        // 填充结果
        for (uint i = 0; i < serviceCount; i++) {
            if (services[i].isActive &&
                keccak256(abi.encodePacked(services[i].serviceType)) == keccak256(abi.encodePacked(serviceType)) &&
                services[i].pricePerToken <= maxPrice &&
                containsLanguage(services[i].supportedLanguages, language)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev 获取提供商的服务
     * @param provider 提供商地址
     */
    function getProviderServices(address provider) external view returns (uint256[] memory) {
        return providerServices[provider];
    }
    
    /**
     * @dev 获取特定类型的服务
     * @param serviceType 服务类型
     */
    function getServicesByType(string calldata serviceType) external view returns (uint256[] memory) {
        return serviceTypeIndex[serviceType];
    }
    
    /**
     * @dev 获取支持特定语言的服务
     * @param language 语言
     */
    function getServicesByLanguage(string calldata language) external view returns (uint256[] memory) {
        return languageIndex[language];
    }
    
    /**
     * @dev 检查语言数组是否包含特定语言
     * @param languages 语言数组
     * @param language 要检查的语言
     */
    function containsLanguage(string[] memory languages, string memory language) internal pure returns (bool) {
        for (uint i = 0; i < languages.length; i++) {
            if (keccak256(abi.encodePacked(languages[i])) == keccak256(abi.encodePacked(language))) {
                return true;
            }
        }
        return false;
    }
}
