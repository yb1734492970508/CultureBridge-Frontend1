// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AIRegistry
 * @dev 管理AI服务提供商注册和发现的智能合约，支持多角色权限管理
 */
contract AIRegistry is AccessControl, Pausable, ReentrancyGuard {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");
    
    // 服务状态枚举
    enum ServiceStatus {
        Pending,    // 待审核
        Approved,   // 已批准
        Rejected,   // 已拒绝
        Suspended   // 已暂停
    }
    
    // 服务结构
    struct Service {
        address provider;           // 服务提供商地址
        string serviceType;         // 服务类型（翻译、文化解释等）
        string[] supportedLanguages; // 支持的语言
        uint256 performanceScore;   // 性能评分(0-100)
        uint256 pricePerToken;      // 每个代币的价格
        ServiceStatus status;       // 服务状态
        string metadataURI;         // 元数据URI(IPFS)
        uint256 reputationScore;    // 提供商信誉评分(0-100)
        uint256 registrationTime;   // 注册时间
        uint256 lastUpdateTime;     // 最后更新时间
        string rejectionReason;     // 拒绝原因（如果状态为Rejected）
    }
    
    // 审核记录结构
    struct ReviewRecord {
        uint256 serviceId;          // 服务ID
        address reviewer;           // 审核员地址
        ServiceStatus decision;     // 审核决定
        string comment;             // 审核评论
        uint256 timestamp;          // 审核时间戳
    }
    
    // 存储
    mapping(uint256 => Service) public services;
    uint256 public serviceCount;
    
    // 审核记录
    mapping(uint256 => ReviewRecord[]) public serviceReviews;
    
    // 索引
    mapping(address => uint256[]) public providerServices;
    mapping(string => uint256[]) public serviceTypeIndex;
    mapping(string => uint256[]) public languageIndex;
    mapping(ServiceStatus => uint256[]) public statusIndex;
    
    // 黑名单/白名单
    mapping(address => bool) public blacklist;
    mapping(address => bool) public whitelist;
    bool public whitelistRequired; // 是否需要白名单
    
    // 事件
    event ServiceRegistered(uint256 indexed serviceId, address indexed provider, string serviceType, ServiceStatus status);
    event ServiceUpdated(uint256 indexed serviceId, address indexed provider);
    event ServiceStatusChanged(uint256 indexed serviceId, address indexed provider, ServiceStatus newStatus);
    event PerformanceScoreUpdated(uint256 indexed serviceId, uint256 newScore);
    event ReputationScoreUpdated(address indexed provider, uint256 newScore);
    event ServiceReviewed(uint256 indexed serviceId, address indexed reviewer, ServiceStatus decision, string comment);
    event ProviderBlacklisted(address indexed provider);
    event ProviderRemovedFromBlacklist(address indexed provider);
    event ProviderWhitelisted(address indexed provider);
    event ProviderRemovedFromWhitelist(address indexed provider);
    event WhitelistRequirementChanged(bool required);
    
    /**
     * @dev 构造函数
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        serviceCount = 0;
        whitelistRequired = false;
    }
    
    /**
     * @dev 修饰符：仅限未被列入黑名单的地址
     */
    modifier notBlacklisted() {
        require(!blacklist[msg.sender], "Provider is blacklisted");
        _;
    }
    
    /**
     * @dev 修饰符：如果需要白名单，则仅限白名单地址
     */
    modifier whitelistedIfRequired() {
        if (whitelistRequired) {
            require(whitelist[msg.sender], "Provider is not whitelisted");
        }
        _;
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev 添加审核员
     * @param reviewer 审核员地址
     */
    function addReviewer(address reviewer) external onlyRole(ADMIN_ROLE) {
        grantRole(REVIEWER_ROLE, reviewer);
    }
    
    /**
     * @dev 移除审核员
     * @param reviewer 审核员地址
     */
    function removeReviewer(address reviewer) external onlyRole(ADMIN_ROLE) {
        revokeRole(REVIEWER_ROLE, reviewer);
    }
    
    /**
     * @dev 添加管理员
     * @param admin 管理员地址
     */
    function addAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, admin);
    }
    
    /**
     * @dev 移除管理员
     * @param admin 管理员地址
     */
    function removeAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, admin);
    }
    
    /**
     * @dev 将提供商添加到黑名单
     * @param provider 提供商地址
     */
    function blacklistProvider(address provider) external onlyRole(ADMIN_ROLE) {
        blacklist[provider] = true;
        
        // 自动暂停该提供商的所有服务
        uint256[] memory providerServiceIds = providerServices[provider];
        for (uint i = 0; i < providerServiceIds.length; i++) {
            uint256 serviceId = providerServiceIds[i];
            if (services[serviceId].status == ServiceStatus.Approved) {
                services[serviceId].status = ServiceStatus.Suspended;
                
                // 更新状态索引
                _removeFromStatusIndex(serviceId, ServiceStatus.Approved);
                statusIndex[ServiceStatus.Suspended].push(serviceId);
                
                emit ServiceStatusChanged(serviceId, provider, ServiceStatus.Suspended);
            }
        }
        
        emit ProviderBlacklisted(provider);
    }
    
    /**
     * @dev 将提供商从黑名单中移除
     * @param provider 提供商地址
     */
    function removeFromBlacklist(address provider) external onlyRole(ADMIN_ROLE) {
        blacklist[provider] = false;
        emit ProviderRemovedFromBlacklist(provider);
    }
    
    /**
     * @dev 将提供商添加到白名单
     * @param provider 提供商地址
     */
    function whitelistProvider(address provider) external onlyRole(ADMIN_ROLE) {
        whitelist[provider] = true;
        emit ProviderWhitelisted(provider);
    }
    
    /**
     * @dev 将提供商从白名单中移除
     * @param provider 提供商地址
     */
    function removeFromWhitelist(address provider) external onlyRole(ADMIN_ROLE) {
        whitelist[provider] = false;
        emit ProviderRemovedFromWhitelist(provider);
    }
    
    /**
     * @dev 设置是否需要白名单
     * @param required 是否需要
     */
    function setWhitelistRequired(bool required) external onlyRole(ADMIN_ROLE) {
        whitelistRequired = required;
        emit WhitelistRequirementChanged(required);
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
    ) external whenNotPaused nonReentrant notBlacklisted whitelistedIfRequired returns (uint256) {
        require(bytes(serviceType).length > 0, "Service type required");
        require(languages.length > 0, "At least one language required");
        require(pricePerToken > 0, "Price must be positive");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        uint256 serviceId = serviceCount;
        serviceCount++;
        
        // 授予提供商角色
        if (!hasRole(PROVIDER_ROLE, msg.sender)) {
            grantRole(PROVIDER_ROLE, msg.sender);
        }
        
        // 确定初始状态（管理员和审核员直接批准，其他人需要审核）
        ServiceStatus initialStatus = ServiceStatus.Pending;
        if (hasRole(ADMIN_ROLE, msg.sender) || hasRole(REVIEWER_ROLE, msg.sender)) {
            initialStatus = ServiceStatus.Approved;
        }
        
        services[serviceId] = Service({
            provider: msg.sender,
            serviceType: serviceType,
            supportedLanguages: languages,
            performanceScore: 0,
            pricePerToken: pricePerToken,
            status: initialStatus,
            metadataURI: metadataURI,
            reputationScore: 0,
            registrationTime: block.timestamp,
            lastUpdateTime: block.timestamp,
            rejectionReason: ""
        });
        
        // 更新索引
        providerServices[msg.sender].push(serviceId);
        serviceTypeIndex[serviceType].push(serviceId);
        statusIndex[initialStatus].push(serviceId);
        
        for (uint i = 0; i < languages.length; i++) {
            languageIndex[languages[i]].push(serviceId);
        }
        
        emit ServiceRegistered(serviceId, msg.sender, serviceType, initialStatus);
        
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
    ) external whenNotPaused nonReentrant notBlacklisted whitelistedIfRequired {
        require(serviceId < serviceCount, "Service does not exist");
        require(services[serviceId].provider == msg.sender, "Not the provider");
        require(bytes(serviceType).length > 0, "Service type required");
        require(languages.length > 0, "At least one language required");
        require(pricePerToken > 0, "Price must be positive");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        Service storage service = services[serviceId];
        
        // 重大更新需要重新审核
        bool needsReview = false;
        if (keccak256(abi.encodePacked(service.serviceType)) != keccak256(abi.encodePacked(serviceType)) ||
            service.pricePerToken != pricePerToken) {
            needsReview = true;
        }
        
        // 如果需要重新审核，更改状态
        if (needsReview && service.status == ServiceStatus.Approved && 
            !hasRole(ADMIN_ROLE, msg.sender) && !hasRole(REVIEWER_ROLE, msg.sender)) {
            // 更新状态索引
            _removeFromStatusIndex(serviceId, service.status);
            service.status = ServiceStatus.Pending;
            statusIndex[ServiceStatus.Pending].push(serviceId);
            
            emit ServiceStatusChanged(serviceId, msg.sender, ServiceStatus.Pending);
        }
        
        // 更新服务
        service.serviceType = serviceType;
        service.supportedLanguages = languages;
        service.pricePerToken = pricePerToken;
        service.metadataURI = metadataURI;
        service.lastUpdateTime = block.timestamp;
        
        emit ServiceUpdated(serviceId, msg.sender);
    }
    
    /**
     * @dev 审核服务
     * @param serviceId 服务ID
     * @param approve 是否批准
     * @param comment 审核评论
     */
    function reviewService(
        uint256 serviceId, 
        bool approve, 
        string calldata comment
    ) external whenNotPaused onlyRole(REVIEWER_ROLE) {
        require(serviceId < serviceCount, "Service does not exist");
        require(services[serviceId].status == ServiceStatus.Pending, "Service not pending review");
        
        Service storage service = services[serviceId];
        
        // 更新状态索引
        _removeFromStatusIndex(serviceId, service.status);
        
        // 更新服务状态
        if (approve) {
            service.status = ServiceStatus.Approved;
            service.rejectionReason = "";
        } else {
            service.status = ServiceStatus.Rejected;
            service.rejectionReason = comment;
        }
        
        // 添加到新状态索引
        statusIndex[service.status].push(serviceId);
        
        // 记录审核
        serviceReviews[serviceId].push(ReviewRecord({
            serviceId: serviceId,
            reviewer: msg.sender,
            decision: service.status,
            comment: comment,
            timestamp: block.timestamp
        }));
        
        emit ServiceReviewed(serviceId, msg.sender, service.status, comment);
        emit ServiceStatusChanged(serviceId, service.provider, service.status);
    }
    
    /**
     * @dev 暂停服务
     * @param serviceId 服务ID
     */
    function suspendService(uint256 serviceId) external whenNotPaused {
        require(serviceId < serviceCount, "Service does not exist");
        require(
            services[serviceId].provider == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(REVIEWER_ROLE, msg.sender), 
            "Not authorized"
        );
        require(services[serviceId].status == ServiceStatus.Approved, "Service not approved");
        
        Service storage service = services[serviceId];
        
        // 更新状态索引
        _removeFromStatusIndex(serviceId, service.status);
        service.status = ServiceStatus.Suspended;
        statusIndex[ServiceStatus.Suspended].push(serviceId);
        
        emit ServiceStatusChanged(serviceId, service.provider, ServiceStatus.Suspended);
    }
    
    /**
     * @dev 重新激活服务
     * @param serviceId 服务ID
     */
    function reactivateService(uint256 serviceId) external whenNotPaused notBlacklisted whitelistedIfRequired {
        require(serviceId < serviceCount, "Service does not exist");
        Service storage service = services[serviceId];
        
        require(
            (service.provider == msg.sender && service.status == ServiceStatus.Suspended) || 
            (hasRole(ADMIN_ROLE, msg.sender) || hasRole(REVIEWER_ROLE, msg.sender)),
            "Not authorized"
        );
        
        // 提供商只能重新激活自己暂停的服务，被拒绝的服务需要重新提交
        if (service.provider == msg.sender && !hasRole(ADMIN_ROLE, msg.sender) && !hasRole(REVIEWER_ROLE, msg.sender)) {
            require(service.status == ServiceStatus.Suspended, "Cannot reactivate rejected service");
        }
        
        // 更新状态索引
        _removeFromStatusIndex(serviceId, service.status);
        service.status = ServiceStatus.Approved;
        statusIndex[ServiceStatus.Approved].push(serviceId);
        
        emit ServiceStatusChanged(serviceId, service.provider, ServiceStatus.Approved);
    }
    
    /**
     * @dev 更新性能评分
     * @param serviceId 服务ID
     * @param newScore 新评分
     */
    function updatePerformanceScore(
        uint256 serviceId, 
        uint256 newScore
    ) external whenNotPaused onlyRole(REVIEWER_ROLE) {
        require(serviceId < serviceCount, "Service does not exist");
        require(newScore <= 100, "Score must be 0-100");
        
        services[serviceId].performanceScore = newScore;
        
        emit PerformanceScoreUpdated(serviceId, newScore);
    }
    
    /**
     * @dev 更新提供商信誉评分
     * @param provider 提供商地址
     * @param newScore 新评分
     */
    function updateReputationScore(
        address provider, 
        uint256 newScore
    ) external whenNotPaused onlyRole(REVIEWER_ROLE) {
        require(newScore <= 100, "Score must be 0-100");
        
        // 更新该提供商的所有服务
        uint256[] memory providerServiceIds = providerServices[provider];
        for (uint i = 0; i < providerServiceIds.length; i++) {
            services[providerServiceIds[i]].reputationScore = newScore;
        }
        
        emit ReputationScoreUpdated(provider, newScore);
    }
    
    /**
     * @dev 获取服务审核历史
     * @param serviceId 服务ID
     */
    function getServiceReviewHistory(uint256 serviceId) external view returns (ReviewRecord[] memory) {
        require(serviceId < serviceCount, "Service does not exist");
        return serviceReviews[serviceId];
    }
    
    /**
     * @dev 获取待审核服务
     */
    function getPendingServices() external view returns (uint256[] memory) {
        return statusIndex[ServiceStatus.Pending];
    }
    
    /**
     * @dev 获取已批准服务
     */
    function getApprovedServices() external view returns (uint256[] memory) {
        return statusIndex[ServiceStatus.Approved];
    }
    
    /**
     * @dev 获取已拒绝服务
     */
    function getRejectedServices() external view returns (uint256[] memory) {
        return statusIndex[ServiceStatus.Rejected];
    }
    
    /**
     * @dev 获取已暂停服务
     */
    function getSuspendedServices() external view returns (uint256[] memory) {
        return statusIndex[ServiceStatus.Suspended];
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
     * @dev 查找服务
     * @param serviceType 服务类型
     * @param language 语言
     * @param maxPrice 最高价格
     * @param minScore 最低评分
     */
    function findServices(
        string calldata serviceType,
        string calldata language,
        uint256 maxPrice,
        uint256 minScore
    ) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 计算符合条件的服务数量
        for (uint i = 0; i < serviceCount; i++) {
            if (services[i].status == ServiceStatus.Approved &&
                keccak256(abi.encodePacked(services[i].serviceType)) == keccak256(abi.encodePacked(serviceType)) &&
                services[i].pricePerToken <= maxPrice &&
                services[i].performanceScore >= minScore &&
                containsLanguage(services[i].supportedLanguages, language)) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory result = new uint256[](count);
        uint256 resultIndex = 0;
        
        // 填充结果
        for (uint i = 0; i < serviceCount; i++) {
            if (services[i].status == ServiceStatus.Approved &&
                keccak256(abi.encodePacked(services[i].serviceType)) == keccak256(abi.encodePacked(serviceType)) &&
                services[i].pricePerToken <= maxPrice &&
                services[i].performanceScore >= minScore &&
                containsLanguage(services[i].supportedLanguages, language)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        return result;
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
    
    /**
     * @dev 从状态索引中移除服务ID
     * @param serviceId 服务ID
     * @param status 状态
     */
    function _removeFromStatusIndex(uint256 serviceId, ServiceStatus status) internal {
        uint256[] storage statusArray = statusIndex[status];
        for (uint i = 0; i < statusArray.length; i++) {
            if (statusArray[i] == serviceId) {
                // 将最后一个元素移到当前位置，然后删除最后一个元素
                statusArray[i] = statusArray[statusArray.length - 1];
                statusArray.pop();
                break;
            }
        }
    }
}
