// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IAIRegistry
 * @dev AI服务注册中心接口
 */
interface IAIRegistry {
    function getService(uint256 serviceId) external view returns (
        address provider,
        string memory serviceType,
        string[] memory supportedLanguages,
        uint256 performanceScore,
        uint256 pricePerUnit,
        bool active,
        string memory metadataURI,
        uint256 reputationScore
    );
}

/**
 * @title AIRequest
 * @dev 管理AI服务请求的智能合约
 */
contract AIRequest is Ownable, ReentrancyGuard {
    // 请求状态枚举
    enum RequestStatus {
        Created,    // 已创建
        Accepted,   // 已接受
        Processing, // 处理中
        Completed,  // 已完成
        Verified,   // 已验证
        Disputed,   // 有争议
        Cancelled   // 已取消
    }
    
    // 请求结构 - 移除嵌套动态数组，改为单独存储
    struct Request {
        address requester;          // 请求者地址
        uint256 serviceId;          // 服务ID
        address provider;           // 服务提供商地址
        string requestType;         // 请求类型
        uint256 inputTokenCount;    // 输入代币数量
        uint256 reward;             // 奖励金额
        uint256 deadline;           // 截止日期
        RequestStatus status;       // 请求状态
        string inputDataURI;        // 输入数据URI
        string outputDataURI;       // 输出数据URI
        uint256 qualityScore;       // 质量评分(0-100)
        uint256 creationTime;       // 创建时间
        uint256 completionTime;     // 完成时间
        string disputeReason;       // 争议原因
    }
    
    // 单独存储语言数组，避免嵌套动态数组
    mapping(uint256 => string[]) public requestInputLanguages;
    mapping(uint256 => string[]) public requestOutputLanguages;
    
    // 代币合约
    IERC20 public cultureToken;
    
    // AI服务注册中心
    IAIRegistry public aiRegistry;
    
    // 存储
    mapping(uint256 => Request) public requests;
    uint256 public requestCount;
    
    // 索引
    mapping(address => uint256[]) public requesterRequests;
    mapping(address => uint256[]) public providerRequests;
    mapping(RequestStatus => uint256[]) public statusIndex;
    
    // 费率
    uint256 public platformFeePercent; // 平台费率(百分比)
    
    // 事件
    event RequestCreated(uint256 indexed requestId, address indexed requester, uint256 indexed serviceId, uint256 reward);
    event RequestAccepted(uint256 indexed requestId, address indexed provider);
    event RequestProcessing(uint256 indexed requestId);
    event RequestCompleted(uint256 indexed requestId, string outputDataURI);
    event RequestVerified(uint256 indexed requestId, uint256 qualityScore);
    event RequestDisputed(uint256 indexed requestId, string disputeReason);
    event RequestCancelled(uint256 indexed requestId);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    /**
     * @dev 构造函数
     * @param tokenAddress CultureToken合约地址
     * @param registryAddress AIRegistry合约地址
     */
    constructor(address tokenAddress, address registryAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        require(registryAddress != address(0), "Invalid registry address");
        cultureToken = IERC20(tokenAddress);
        aiRegistry = IAIRegistry(registryAddress);
        platformFeePercent = 5; // 默认5%平台费
        requestCount = 0;
    }
    
    /**
     * @dev 设置平台费率
     * @param newFeePercent 新费率(百分比)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 20, "Fee too high"); // 最高20%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev 创建AI服务请求
     * @param serviceId 服务ID
     * @param requestType 请求类型
     * @param inputLanguages 输入语言
     * @param outputLanguages 输出语言
     * @param inputTokenCount 输入代币数量
     * @param reward 奖励金额
     * @param deadline 截止日期
     * @param inputDataURI 输入数据URI
     */
    function createRequest(
        uint256 serviceId,
        string memory requestType,
        string[] memory inputLanguages,
        string[] memory outputLanguages,
        uint256 inputTokenCount,
        uint256 reward,
        uint256 deadline,
        string memory inputDataURI
    ) external nonReentrant returns (uint256) {
        require(bytes(requestType).length > 0, "Request type required");
        require(inputLanguages.length > 0, "Input language required");
        require(outputLanguages.length > 0, "Output language required");
        require(inputTokenCount > 0, "Input token count must be positive");
        require(reward > 0, "Reward must be positive");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(bytes(inputDataURI).length > 0, "Input data URI required");
        
        // 获取服务提供商
        (address provider, , , , , bool active, , ) = aiRegistry.getService(serviceId);
        require(provider != address(0), "Service not found");
        require(active, "Service not active");
        
        // 转移代币到合约
        require(cultureToken.transferFrom(msg.sender, address(this), reward), "Token transfer failed");
        
        uint256 requestId = requestCount;
        requestCount++;
        
        // 创建请求对象，避免嵌套动态数组
        requests[requestId] = Request({
            requester: msg.sender,
            serviceId: serviceId,
            provider: provider,
            requestType: requestType,
            inputTokenCount: inputTokenCount,
            reward: reward,
            deadline: deadline,
            status: RequestStatus.Created,
            inputDataURI: inputDataURI,
            outputDataURI: "",
            qualityScore: 0,
            creationTime: block.timestamp,
            completionTime: 0,
            disputeReason: ""
        });
        
        // 单独存储语言数组
        for (uint i = 0; i < inputLanguages.length; i++) {
            requestInputLanguages[requestId].push(inputLanguages[i]);
        }
        
        for (uint i = 0; i < outputLanguages.length; i++) {
            requestOutputLanguages[requestId].push(outputLanguages[i]);
        }
        
        // 更新索引
        requesterRequests[msg.sender].push(requestId);
        providerRequests[provider].push(requestId);
        statusIndex[RequestStatus.Created].push(requestId);
        
        emit RequestCreated(requestId, msg.sender, serviceId, reward);
        
        return requestId;
    }
    
    /**
     * @dev 获取请求的输入语言
     * @param requestId 请求ID
     */
    function getInputLanguages(uint256 requestId) external view returns (string[] memory) {
        require(requestId < requestCount, "Request does not exist");
        return requestInputLanguages[requestId];
    }
    
    /**
     * @dev 获取请求的输出语言
     * @param requestId 请求ID
     */
    function getOutputLanguages(uint256 requestId) external view returns (string[] memory) {
        require(requestId < requestCount, "Request does not exist");
        return requestOutputLanguages[requestId];
    }
    
    /**
     * @dev 接受请求
     * @param requestId 请求ID
     */
    function acceptRequest(uint256 requestId) external nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(request.provider == msg.sender, "Not the provider");
        require(request.status == RequestStatus.Created, "Request not in created state");
        require(block.timestamp < request.deadline, "Request expired");
        
        // 更新状态索引
        _removeFromStatusIndex(requestId, request.status);
        request.status = RequestStatus.Accepted;
        statusIndex[RequestStatus.Accepted].push(requestId);
        
        emit RequestAccepted(requestId, msg.sender);
    }
    
    /**
     * @dev 标记请求为处理中
     * @param requestId 请求ID
     */
    function markRequestAsProcessing(uint256 requestId) external nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(request.provider == msg.sender, "Not the provider");
        require(request.status == RequestStatus.Accepted, "Request not in accepted state");
        require(block.timestamp < request.deadline, "Request expired");
        
        // 更新状态索引
        _removeFromStatusIndex(requestId, request.status);
        request.status = RequestStatus.Processing;
        statusIndex[RequestStatus.Processing].push(requestId);
        
        emit RequestProcessing(requestId);
    }
    
    /**
     * @dev 完成请求
     * @param requestId 请求ID
     * @param outputDataURI 输出数据URI
     */
    function completeRequest(uint256 requestId, string memory outputDataURI) external nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(request.provider == msg.sender, "Not the provider");
        require(
            request.status == RequestStatus.Accepted || 
            request.status == RequestStatus.Processing, 
            "Request not in accepted or processing state"
        );
        require(block.timestamp < request.deadline, "Request expired");
        require(bytes(outputDataURI).length > 0, "Output data URI required");
        
        // 更新状态索引
        _removeFromStatusIndex(requestId, request.status);
        request.status = RequestStatus.Completed;
        statusIndex[RequestStatus.Completed].push(requestId);
        
        request.outputDataURI = outputDataURI;
        request.completionTime = block.timestamp;
        
        emit RequestCompleted(requestId, outputDataURI);
    }
    
    /**
     * @dev 验证请求
     * @param requestId 请求ID
     * @param accepted 是否接受
     * @param qualityScore 质量评分
     */
    function verifyRequest(uint256 requestId, bool accepted, uint256 qualityScore) external nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(request.requester == msg.sender, "Not the requester");
        require(request.status == RequestStatus.Completed, "Request not in completed state");
        require(qualityScore <= 100, "Quality score must be 0-100");
        
        if (accepted) {
            // 更新状态索引
            _removeFromStatusIndex(requestId, request.status);
            request.status = RequestStatus.Verified;
            statusIndex[RequestStatus.Verified].push(requestId);
            
            request.qualityScore = qualityScore;
            
            // 计算平台费
            uint256 platformFee = (request.reward * platformFeePercent) / 100;
            uint256 providerReward = request.reward - platformFee;
            
            // 转移代币
            require(cultureToken.transfer(request.provider, providerReward), "Provider reward transfer failed");
            require(cultureToken.transfer(owner(), platformFee), "Platform fee transfer failed");
            
            emit RequestVerified(requestId, qualityScore);
        } else {
            // 标记为有争议
            _removeFromStatusIndex(requestId, request.status);
            request.status = RequestStatus.Disputed;
            statusIndex[RequestStatus.Disputed].push(requestId);
            
            request.disputeReason = "Quality not acceptable";
            
            emit RequestDisputed(requestId, "Quality not acceptable");
        }
    }
    
    /**
     * @dev 取消请求
     * @param requestId 请求ID
     */
    function cancelRequest(uint256 requestId) external nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(
            request.requester == msg.sender || 
            request.provider == msg.sender || 
            msg.sender == owner(), 
            "Not authorized"
        );
        require(
            request.status == RequestStatus.Created || 
            request.status == RequestStatus.Accepted, 
            "Cannot cancel in current state"
        );
        
        // 更新状态索引
        _removeFromStatusIndex(requestId, request.status);
        request.status = RequestStatus.Cancelled;
        statusIndex[RequestStatus.Cancelled].push(requestId);
        
        // 如果是请求者或管理员取消，退还代币
        if (request.requester == msg.sender || msg.sender == owner()) {
            require(cultureToken.transfer(request.requester, request.reward), "Token return failed");
        }
        
        emit RequestCancelled(requestId);
    }
    
    /**
     * @dev 解决争议
     * @param requestId 请求ID
     * @param refundToRequester 是否退款给请求者
     */
    function resolveDispute(uint256 requestId, bool refundToRequester) external onlyOwner nonReentrant {
        require(requestId < requestCount, "Request does not exist");
        Request storage request = requests[requestId];
        require(request.status == RequestStatus.Disputed, "Request not disputed");
        
        if (refundToRequester) {
            // 退款给请求者
            require(cultureToken.transfer(request.requester, request.reward), "Refund failed");
        } else {
            // 支付给提供商
            uint256 platformFee = (request.reward * platformFeePercent) / 100;
            uint256 providerReward = request.reward - platformFee;
            
            require(cultureToken.transfer(request.provider, providerReward), "Provider payment failed");
            require(cultureToken.transfer(owner(), platformFee), "Platform fee transfer failed");
            
            // 更新状态索引
            _removeFromStatusIndex(requestId, request.status);
            request.status = RequestStatus.Verified;
            statusIndex[RequestStatus.Verified].push(requestId);
            
            emit RequestVerified(requestId, request.qualityScore);
        }
    }
    
    /**
     * @dev 获取请求者的所有请求
     * @param requester 请求者地址
     */
    function getRequesterRequests(address requester) external view returns (uint256[] memory) {
        return requesterRequests[requester];
    }
    
    /**
     * @dev 获取提供商的所有请求
     * @param provider 提供商地址
     */
    function getProviderRequests(address provider) external view returns (uint256[] memory) {
        return providerRequests[provider];
    }
    
    /**
     * @dev 获取特定状态的所有请求
     * @param status 请求状态
     */
    function getRequestsByStatus(RequestStatus status) external view returns (uint256[] memory) {
        return statusIndex[status];
    }
    
    /**
     * @dev 从状态索引中移除请求
     * @param requestId 请求ID
     * @param status 状态
     */
    function _removeFromStatusIndex(uint256 requestId, RequestStatus status) private {
        uint256[] storage statusArr = statusIndex[status];
        for (uint i = 0; i < statusArr.length; i++) {
            if (statusArr[i] == requestId) {
                // 将最后一个元素移到当前位置，然后删除最后一个元素
                statusArr[i] = statusArr[statusArr.length - 1];
                statusArr.pop();
                break;
            }
        }
    }
}
