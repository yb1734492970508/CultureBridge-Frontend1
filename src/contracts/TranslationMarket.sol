// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CultureToken.sol";

/**
 * @title TranslationMarket
 * @dev 管理翻译请求、提供和验证的智能合约
 */
contract TranslationMarket is Ownable, Pausable, ReentrancyGuard {
    // 代币合约
    CultureToken public cultureToken;
    
    // 翻译请求状态
    enum RequestStatus { Created, Assigned, Completed, Verified, Disputed, Cancelled }
    
    // 翻译请求结构
    struct TranslationRequest {
        address requester;           // 请求者地址
        string contentHash;          // 内容IPFS哈希
        string sourceLanguage;       // 源语言
        string targetLanguage;       // 目标语言
        uint256 reward;              // 奖励金额
        uint256 deadline;            // 截止时间
        address translator;          // 翻译者地址
        string translationHash;      // 翻译结果IPFS哈希
        RequestStatus status;        // 请求状态
        uint256 createdAt;           // 创建时间
        uint256 completedAt;         // 完成时间
        uint8 quality;               // 质量评分(0-100)
        bool isAIAssisted;           // 是否AI辅助
    }
    
    // 翻译者资料
    struct Translator {
        address wallet;              // 钱包地址
        string[] languages;          // 支持的语言
        uint256 completedJobs;       // 已完成工作数
        uint256 totalEarned;         // 总收入
        uint256 averageQuality;      // 平均质量评分
        uint256 reputation;          // 声誉分数
        bool isVerified;             // 是否经过验证
        bool isActive;               // 是否活跃
    }
    
    // 存储
    mapping(bytes32 => TranslationRequest) public requests;
    mapping(address => Translator) public translators;
    mapping(address => bytes32[]) public userRequests;
    mapping(address => bytes32[]) public translatorJobs;
    bytes32[] public allRequestIds;
    
    // 平台参数
    uint256 public platformFee = 5;  // 5% 平台费用
    uint256 public minReward = 10 * 10**18; // 最低奖励10代币
    uint256 public disputeWindow = 3 days; // 争议窗口期
    uint256 public assignmentTimeout = 1 days; // 分配超时
    
    // 事件
    event RequestCreated(bytes32 indexed requestId, address indexed requester, string sourceLanguage, string targetLanguage, uint256 reward);
    event RequestAssigned(bytes32 indexed requestId, address indexed translator);
    event RequestCompleted(bytes32 indexed requestId, address indexed translator, string translationHash);
    event RequestVerified(bytes32 indexed requestId, uint8 quality);
    event RequestDisputed(bytes32 indexed requestId, address disputer);
    event RequestCancelled(bytes32 indexed requestId);
    event TranslatorRegistered(address indexed translator, string[] languages);
    event RewardPaid(bytes32 indexed requestId, address indexed translator, uint256 amount);
    event PlatformParametersUpdated(uint256 platformFee, uint256 minReward, uint256 disputeWindow, uint256 assignmentTimeout);
    
    /**
     * @dev 构造函数
     * @param _cultureToken CultureToken合约地址
     */
    constructor(address _cultureToken) {
        require(_cultureToken != address(0), "Invalid token address");
        cultureToken = CultureToken(_cultureToken);
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
     * @dev 更新平台参数
     */
    function updatePlatformParameters(
        uint256 _platformFee,
        uint256 _minReward,
        uint256 _disputeWindow,
        uint256 _assignmentTimeout
    ) external onlyOwner {
        require(_platformFee <= 20, "Fee too high"); // 最高20%
        platformFee = _platformFee;
        minReward = _minReward;
        disputeWindow = _disputeWindow;
        assignmentTimeout = _assignmentTimeout;
        
        emit PlatformParametersUpdated(platformFee, minReward, disputeWindow, assignmentTimeout);
    }
    
    /**
     * @dev 注册为翻译者
     * @param languages 支持的语言数组
     */
    function registerTranslator(string[] calldata languages) external whenNotPaused {
        require(languages.length > 0, "Must support at least one language");
        
        Translator storage translator = translators[msg.sender];
        translator.wallet = msg.sender;
        translator.languages = languages;
        translator.isActive = true;
        
        if (translator.completedJobs == 0) {
            translator.reputation = 50; // 初始声誉值
        }
        
        emit TranslatorRegistered(msg.sender, languages);
    }
    
    /**
     * @dev 创建翻译请求
     * @param contentHash 内容IPFS哈希
     * @param sourceLanguage 源语言
     * @param targetLanguage 目标语言
     * @param reward 奖励金额
     * @param deadline 截止时间
     * @param isAIAssisted 是否AI辅助
     */
    function createRequest(
        string calldata contentHash,
        string calldata sourceLanguage,
        string calldata targetLanguage,
        uint256 reward,
        uint256 deadline,
        bool isAIAssisted
    ) external whenNotPaused nonReentrant returns (bytes32) {
        require(bytes(contentHash).length > 0, "Content hash required");
        require(bytes(sourceLanguage).length > 0, "Source language required");
        require(bytes(targetLanguage).length > 0, "Target language required");
        require(reward >= minReward, "Reward too low");
        require(deadline > block.timestamp, "Invalid deadline");
        
        // 转移代币到合约
        require(cultureToken.transferFrom(msg.sender, address(this), reward), "Token transfer failed");
        
        // 创建请求ID
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            contentHash,
            sourceLanguage,
            targetLanguage,
            block.timestamp
        ));
        
        // 存储请求
        requests[requestId] = TranslationRequest({
            requester: msg.sender,
            contentHash: contentHash,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            reward: reward,
            deadline: deadline,
            translator: address(0),
            translationHash: "",
            status: RequestStatus.Created,
            createdAt: block.timestamp,
            completedAt: 0,
            quality: 0,
            isAIAssisted: isAIAssisted
        });
        
        // 更新索引
        userRequests[msg.sender].push(requestId);
        allRequestIds.push(requestId);
        
        emit RequestCreated(requestId, msg.sender, sourceLanguage, targetLanguage, reward);
        
        return requestId;
    }
    
    /**
     * @dev 接受翻译请求
     * @param requestId 请求ID
     */
    function acceptRequest(bytes32 requestId) external whenNotPaused nonReentrant {
        TranslationRequest storage request = requests[requestId];
        
        require(request.requester != address(0), "Request does not exist");
        require(request.status == RequestStatus.Created, "Request not available");
        require(block.timestamp < request.deadline, "Request expired");
        require(translators[msg.sender].isActive, "Translator not active");
        
        // 检查翻译者是否支持目标语言
        bool supportsLanguage = false;
        for (uint i = 0; i < translators[msg.sender].languages.length; i++) {
            if (keccak256(abi.encodePacked(translators[msg.sender].languages[i])) == 
                keccak256(abi.encodePacked(request.targetLanguage))) {
                supportsLanguage = true;
                break;
            }
        }
        require(supportsLanguage, "Translator does not support target language");
        
        // 分配请求
        request.translator = msg.sender;
        request.status = RequestStatus.Assigned;
        
        // 更新索引
        translatorJobs[msg.sender].push(requestId);
        
        emit RequestAssigned(requestId, msg.sender);
    }
    
    /**
     * @dev 提交翻译结果
     * @param requestId 请求ID
     * @param translationHash 翻译结果IPFS哈希
     */
    function submitTranslation(bytes32 requestId, string calldata translationHash) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.requester != address(0), "Request does not exist");
        require(request.status == RequestStatus.Assigned, "Request not assigned");
        require(request.translator == msg.sender, "Not assigned to you");
        require(block.timestamp < request.deadline, "Request expired");
        require(bytes(translationHash).length > 0, "Translation hash required");
        
        // 更新请求
        request.translationHash = translationHash;
        request.status = RequestStatus.Completed;
        request.completedAt = block.timestamp;
        
        emit RequestCompleted(requestId, msg.sender, translationHash);
    }
    
    /**
     * @dev 验证翻译质量
     * @param requestId 请求ID
     * @param quality 质量评分(0-100)
     */
    function verifyTranslation(bytes32 requestId, uint8 quality) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.requester == msg.sender, "Only requester can verify");
        require(request.status == RequestStatus.Completed, "Request not completed");
        require(quality <= 100, "Quality must be 0-100");
        require(block.timestamp <= request.completedAt + disputeWindow, "Verification window closed");
        
        // 更新请求
        request.quality = quality;
        request.status = RequestStatus.Verified;
        
        // 计算奖励
        uint256 platformFeeAmount = (request.reward * platformFee) / 100;
        uint256 translatorReward = request.reward - platformFeeAmount;
        
        // 根据质量调整奖励
        if (quality < 50) {
            // 质量低于50%，减少奖励
            translatorReward = (translatorReward * quality) / 100;
        }
        
        // 更新翻译者统计
        Translator storage translator = translators[request.translator];
        translator.completedJobs += 1;
        translator.totalEarned += translatorReward;
        
        // 更新平均质量
        translator.averageQuality = (
            (translator.averageQuality * (translator.completedJobs - 1)) + quality
        ) / translator.completedJobs;
        
        // 更新声誉
        if (quality >= 80) {
            // 高质量工作增加声誉
            translator.reputation += 2;
        } else if (quality >= 50) {
            // 中等质量工作略微增加声誉
            translator.reputation += 1;
        } else {
            // 低质量工作减少声誉
            if (translator.reputation > 10) {
                translator.reputation -= 2;
            }
        }
        
        // 支付奖励
        require(cultureToken.transfer(request.translator, translatorReward), "Reward transfer failed");
        
        // 平台费用转移到所有者
        if (platformFeeAmount > 0) {
            require(cultureToken.transfer(owner(), platformFeeAmount), "Fee transfer failed");
        }
        
        emit RequestVerified(requestId, quality);
        emit RewardPaid(requestId, request.translator, translatorReward);
    }
    
    /**
     * @dev 对翻译提出争议
     * @param requestId 请求ID
     */
    function disputeTranslation(bytes32 requestId) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.requester == msg.sender, "Only requester can dispute");
        require(request.status == RequestStatus.Completed, "Request not completed");
        require(block.timestamp <= request.completedAt + disputeWindow, "Dispute window closed");
        
        // 更新请求状态
        request.status = RequestStatus.Disputed;
        
        emit RequestDisputed(requestId, msg.sender);
    }
    
    /**
     * @dev 解决争议
     * @param requestId 请求ID
     * @param quality 质量评分
     * @param refundPercentage 退款百分比
     */
    function resolveDispute(bytes32 requestId, uint8 quality, uint8 refundPercentage) 
        external 
        onlyOwner 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.status == RequestStatus.Disputed, "Request not disputed");
        require(quality <= 100, "Quality must be 0-100");
        require(refundPercentage <= 100, "Refund must be 0-100");
        
        // 更新请求
        request.quality = quality;
        request.status = RequestStatus.Verified;
        
        // 计算奖励和退款
        uint256 refundAmount = (request.reward * refundPercentage) / 100;
        uint256 remainingAmount = request.reward - refundAmount;
        uint256 platformFeeAmount = (remainingAmount * platformFee) / 100;
        uint256 translatorReward = remainingAmount - platformFeeAmount;
        
        // 更新翻译者统计
        if (translatorReward > 0) {
            Translator storage translator = translators[request.translator];
            translator.completedJobs += 1;
            translator.totalEarned += translatorReward;
            
            // 更新平均质量
            translator.averageQuality = (
                (translator.averageQuality * (translator.completedJobs - 1)) + quality
            ) / translator.completedJobs;
            
            // 更新声誉
            if (quality >= 80) {
                translator.reputation += 1;
            } else if (quality < 50) {
                if (translator.reputation > 10) {
                    translator.reputation -= 1;
                }
            }
            
            // 支付翻译者
            require(cultureToken.transfer(request.translator, translatorReward), "Reward transfer failed");
            emit RewardPaid(requestId, request.translator, translatorReward);
        }
        
        // 退款给请求者
        if (refundAmount > 0) {
            require(cultureToken.transfer(request.requester, refundAmount), "Refund transfer failed");
        }
        
        // 平台费用
        if (platformFeeAmount > 0) {
            require(cultureToken.transfer(owner(), platformFeeAmount), "Fee transfer failed");
        }
        
        emit RequestVerified(requestId, quality);
    }
    
    /**
     * @dev 取消请求
     * @param requestId 请求ID
     */
    function cancelRequest(bytes32 requestId) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.requester == msg.sender, "Only requester can cancel");
        require(request.status == RequestStatus.Created, "Can only cancel unassigned requests");
        
        // 更新请求状态
        request.status = RequestStatus.Cancelled;
        
        // 退还代币
        require(cultureToken.transfer(request.requester, request.reward), "Refund transfer failed");
        
        emit RequestCancelled(requestId);
    }
    
    /**
     * @dev 处理过期的分配请求
     * @param requestId 请求ID
     */
    function handleExpiredAssignment(bytes32 requestId) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        TranslationRequest storage request = requests[requestId];
        
        require(request.status == RequestStatus.Assigned, "Request not assigned");
        require(block.timestamp > request.deadline, "Request not expired");
        
        // 重置请求状态
        request.status = RequestStatus.Created;
        address previousTranslator = request.translator;
        request.translator = address(0);
        
        // 更新翻译者声誉
        Translator storage translator = translators[previousTranslator];
        if (translator.reputation > 5) {
            translator.reputation -= 5; // 未完成工作减少声誉
        }
        
        emit RequestCreated(requestId, request.requester, request.sourceLanguage, request.targetLanguage, request.reward);
    }
    
    /**
     * @dev 获取翻译者信息
     * @param translator 翻译者地址
     */
    function getTranslatorInfo(address translator) 
        external 
        view 
        returns (
            address wallet,
            string[] memory languages,
            uint256 completedJobs,
            uint256 totalEarned,
            uint256 averageQuality,
            uint256 reputation,
            bool isVerified,
            bool isActive
        ) 
    {
        Translator storage t = translators[translator];
        return (
            t.wallet,
            t.languages,
            t.completedJobs,
            t.totalEarned,
            t.averageQuality,
            t.reputation,
            t.isVerified,
            t.isActive
        );
    }
    
    /**
     * @dev 获取用户的请求列表
     * @param user 用户地址
     */
    function getUserRequests(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userRequests[user];
    }
    
    /**
     * @dev 获取翻译者的工作列表
     * @param translator 翻译者地址
     */
    function getTranslatorJobs(address translator) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return translatorJobs[translator];
    }
    
    /**
     * @dev 获取所有请求数量
     */
    function getRequestCount() 
        external 
        view 
        returns (uint256) 
    {
        return allRequestIds.length;
    }
    
    /**
     * @dev 分页获取请求ID
     * @param offset 偏移量
     * @param limit 限制数量
     */
    function getRequestIds(uint256 offset, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        uint256 endIndex = offset + limit;
        if (endIndex > allRequestIds.length) {
            endIndex = allRequestIds.length;
        }
        
        bytes32[] memory result = new bytes32[](endIndex - offset);
        for (uint256 i = offset; i < endIndex; i++) {
            result[i - offset] = allRequestIds[i];
        }
        
        return result;
    }
}
