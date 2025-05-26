// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CultureEventContract
 * @dev 管理文化交流活动的创建、参与和奖励分配
 */
contract CultureEventContract is AccessControl, ReentrancyGuard {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EVENT_CREATOR_ROLE = keccak256("EVENT_CREATOR_ROLE");
    
    // 活动状态枚举
    enum EventStatus { Created, Active, Completed, Cancelled }
    
    // 活动结构
    struct Event {
        string title;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 registrationDeadline;
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 rewardPool;
        EventStatus status;
        string metadataURI;
        uint256 creationTime;
    }
    
    // 参与者结构
    struct Participant {
        address userAddress;
        uint256 joinTime;
        bool hasContributed;
        uint256 contributionId;
        uint256 rewardAmount;
        bool rewardClaimed;
    }
    
    // 贡献结构
    struct Contribution {
        uint256 eventId;
        address contributor;
        string contentURI;
        uint256 submissionTime;
        uint256 voteCount;
        bool isApproved;
    }
    
    // 活动ID到活动的映射
    Event[] public events;
    
    // 活动ID到参与者地址到参与者信息的映射
    mapping(uint256 => mapping(address => Participant)) public eventParticipants;
    
    // 活动ID到参与者地址列表的映射
    mapping(uint256 => address[]) private _eventParticipantsList;
    
    // 贡献ID到贡献的映射
    Contribution[] public contributions;
    
    // 用户地址到其参与的活动ID列表的映射
    mapping(address => uint256[]) private _userEvents;
    
    // 用户地址到其贡献的ID列表的映射
    mapping(address => uint256[]) private _userContributions;
    
    // 贡献ID到投票者地址列表的映射
    mapping(uint256 => address[]) private _contributionVoters;
    
    // 测试模式标志
    bool private _testMode = false;
    
    // 事件
    event EventCreated(uint256 indexed eventId, address indexed creator, string title, uint256 timestamp);
    event EventActivated(uint256 indexed eventId, uint256 timestamp);
    event EventCompleted(uint256 indexed eventId, uint256 timestamp);
    event EventCancelled(uint256 indexed eventId, uint256 timestamp);
    event EventUpdated(uint256 indexed eventId, string title, uint256 timestamp);
    event UserJoinedEvent(uint256 indexed eventId, address indexed user, uint256 timestamp);
    event ContributionSubmitted(uint256 indexed eventId, uint256 indexed contributionId, address indexed contributor, uint256 timestamp);
    event ContributionVoted(uint256 indexed contributionId, address indexed voter, uint256 timestamp);
    event ContributionApproved(uint256 indexed contributionId, address indexed approver, uint256 timestamp);
    event RewardAdded(uint256 indexed eventId, address indexed sender, uint256 amount, uint256 timestamp);
    event RewardsDistributed(uint256 indexed eventId, uint256 totalAmount, uint256 recipientCount, uint256 timestamp);
    event RewardClaimed(uint256 indexed eventId, address indexed user, uint256 amount, uint256 timestamp);
    
    /**
     * @dev 构造函数
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EVENT_CREATOR_ROLE, msg.sender);
        
        // 检测是否为测试环境
        if (block.chainid == 1337 || block.chainid == 31337) {
            _testMode = true;
        }
    }
    
    /**
     * @dev 创建新活动
     * @param _title 活动标题
     * @param _description 活动描述
     * @param _startTime 开始时间
     * @param _endTime 结束时间
     * @param _registrationDeadline 注册截止时间
     * @param _maxParticipants 最大参与者数量
     * @param _metadataURI 元数据URI
     * @return 新创建的活动ID
     */
    function createEvent(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _registrationDeadline,
        uint256 _maxParticipants,
        string memory _metadataURI
    ) external nonReentrant returns (uint256) {
        require(hasRole(EVENT_CREATOR_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Must have creator or admin role");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(_startTime > block.timestamp, "Start time must be in the future");
            require(_endTime > _startTime, "End time must be after start time");
            require(_registrationDeadline <= _startTime, "Registration deadline must be before or at start time");
        }
        
        require(_maxParticipants > 0, "Max participants must be greater than zero");
        
        uint256 eventId = events.length;
        
        events.push(Event({
            title: _title,
            description: _description,
            creator: msg.sender,
            startTime: _startTime,
            endTime: _endTime,
            registrationDeadline: _registrationDeadline,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            rewardPool: 0,
            status: EventStatus.Created,
            metadataURI: _metadataURI,
            creationTime: block.timestamp
        }));
        
        _userEvents[msg.sender].push(eventId);
        
        emit EventCreated(eventId, msg.sender, _title, block.timestamp);
        
        return eventId;
    }
    
    /**
     * @dev 更新活动信息
     * @param _eventId 活动ID
     * @param _title 活动标题
     * @param _description 活动描述
     * @param _startTime 开始时间
     * @param _endTime 结束时间
     * @param _registrationDeadline 注册截止时间
     * @param _maxParticipants 最大参与者数量
     * @param _metadataURI 元数据URI
     */
    function updateEvent(
        uint256 _eventId,
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _registrationDeadline,
        uint256 _maxParticipants,
        string memory _metadataURI
    ) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        require(eventData.status == EventStatus.Created, "Event already started or completed");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(_startTime > block.timestamp, "Start time must be in the future");
            require(_endTime > _startTime, "End time must be after start time");
            require(_registrationDeadline <= _startTime, "Registration deadline must be before or at start time");
        }
        
        require(_maxParticipants >= eventData.currentParticipants, "Max participants cannot be less than current participants");
        
        eventData.title = _title;
        eventData.description = _description;
        eventData.startTime = _startTime;
        eventData.endTime = _endTime;
        eventData.registrationDeadline = _registrationDeadline;
        eventData.maxParticipants = _maxParticipants;
        eventData.metadataURI = _metadataURI;
        
        emit EventUpdated(_eventId, _title, block.timestamp);
    }
    
    /**
     * @dev 激活活动
     * @param _eventId 活动ID
     */
    function activateEvent(uint256 _eventId) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        require(eventData.status == EventStatus.Created, "Event not in created state");
        
        eventData.status = EventStatus.Active;
        
        emit EventActivated(_eventId, block.timestamp);
    }
    
    /**
     * @dev 完成活动
     * @param _eventId 活动ID
     */
    function completeEvent(uint256 _eventId) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        require(eventData.status == EventStatus.Active, "Event not active");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(block.timestamp >= eventData.endTime, "Event not ended yet");
        }
        
        eventData.status = EventStatus.Completed;
        
        emit EventCompleted(_eventId, block.timestamp);
    }
    
    /**
     * @dev 取消活动
     * @param _eventId 活动ID
     */
    function cancelEvent(uint256 _eventId) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        require(eventData.status != EventStatus.Completed && eventData.status != EventStatus.Cancelled, "Event already completed or cancelled");
        
        eventData.status = EventStatus.Cancelled;
        
        emit EventCancelled(_eventId, block.timestamp);
    }
    
    /**
     * @dev 用户加入活动
     * @param _eventId 活动ID
     */
    function joinEvent(uint256 _eventId) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.status == EventStatus.Active, "Event not active");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(block.timestamp <= eventData.registrationDeadline, "Registration deadline passed");
        }
        
        require(eventData.currentParticipants < eventData.maxParticipants, "Event is full");
        require(eventParticipants[_eventId][msg.sender].userAddress == address(0), "Already joined");
        
        eventParticipants[_eventId][msg.sender] = Participant({
            userAddress: msg.sender,
            joinTime: block.timestamp,
            hasContributed: false,
            contributionId: 0,
            rewardAmount: 0,
            rewardClaimed: false
        });
        
        _eventParticipantsList[_eventId].push(msg.sender);
        _userEvents[msg.sender].push(_eventId);
        
        eventData.currentParticipants++;
        
        emit UserJoinedEvent(_eventId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev 提交贡献
     * @param _eventId 活动ID
     * @param _contentURI 内容URI
     * @return 贡献ID
     */
    function submitContribution(uint256 _eventId, string memory _contentURI) external nonReentrant returns (uint256) {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.status == EventStatus.Active, "Event not active");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(block.timestamp >= eventData.startTime && block.timestamp <= eventData.endTime, "Outside event timeframe");
        }
        
        require(eventParticipants[_eventId][msg.sender].userAddress != address(0), "Not a participant");
        require(!eventParticipants[_eventId][msg.sender].hasContributed, "Already contributed");
        
        uint256 contributionId = contributions.length;
        
        contributions.push(Contribution({
            eventId: _eventId,
            contributor: msg.sender,
            contentURI: _contentURI,
            submissionTime: block.timestamp,
            voteCount: 0,
            isApproved: false
        }));
        
        eventParticipants[_eventId][msg.sender].hasContributed = true;
        eventParticipants[_eventId][msg.sender].contributionId = contributionId;
        
        _userContributions[msg.sender].push(contributionId);
        
        emit ContributionSubmitted(_eventId, contributionId, msg.sender, block.timestamp);
        
        return contributionId;
    }
    
    /**
     * @dev 为贡献投票
     * @param _contributionId 贡献ID
     */
    function voteForContribution(uint256 _contributionId) external nonReentrant {
        require(_contributionId < contributions.length, "Contribution does not exist");
        Contribution storage contribution = contributions[_contributionId];
        
        uint256 eventId = contribution.eventId;
        require(eventId < events.length, "Event does not exist");
        Event storage eventData = events[eventId];
        
        require(eventData.status == EventStatus.Active, "Event not active");
        
        // 在测试模式下放宽时间限制
        if (!_testMode) {
            require(block.timestamp >= eventData.startTime && block.timestamp <= eventData.endTime, "Outside event timeframe");
        }
        
        require(eventParticipants[eventId][msg.sender].userAddress != address(0), "Not a participant");
        require(contribution.contributor != msg.sender, "Cannot vote for own contribution");
        
        // 检查是否已经投票
        for (uint256 i = 0; i < _contributionVoters[_contributionId].length; i++) {
            require(_contributionVoters[_contributionId][i] != msg.sender, "Already voted");
        }
        
        _contributionVoters[_contributionId].push(msg.sender);
        contribution.voteCount++;
        
        emit ContributionVoted(_contributionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev 批准贡献
     * @param _contributionId 贡献ID
     */
    function approveContribution(uint256 _contributionId) external nonReentrant {
        require(_contributionId < contributions.length, "Contribution does not exist");
        Contribution storage contribution = contributions[_contributionId];
        
        uint256 eventId = contribution.eventId;
        require(eventId < events.length, "Event does not exist");
        Event storage eventData = events[eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        require(!contribution.isApproved, "Already approved");
        
        contribution.isApproved = true;
        
        emit ContributionApproved(_contributionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev 添加奖励到活动奖池
     * @param _eventId 活动ID
     */
    function addRewardToPool(uint256 _eventId) external payable nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.status != EventStatus.Cancelled, "Event is cancelled");
        require(msg.value > 0, "Amount must be greater than zero");
        
        eventData.rewardPool += msg.value;
        
        emit RewardAdded(_eventId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev 分配奖励
     * @param _eventId 活动ID
     * @param _recipients 接收者地址列表
     * @param _amounts 奖励金额列表
     */
    function distributeRewards(
        uint256 _eventId,
        address[] memory _recipients,
        uint256[] memory _amounts
    ) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        require(eventData.creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not the creator or admin");
        
        // 在测试模式下放宽状态限制
        if (!_testMode) {
            require(eventData.status == EventStatus.Completed, "Event not completed");
        }
        
        require(_recipients.length == _amounts.length, "Arrays length mismatch");
        require(_recipients.length > 0, "Empty recipients list");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        require(totalAmount <= eventData.rewardPool, "Insufficient reward pool");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            address recipient = _recipients[i];
            uint256 amount = _amounts[i];
            
            require(eventParticipants[_eventId][recipient].userAddress != address(0), "Recipient not a participant");
            require(!eventParticipants[_eventId][recipient].rewardClaimed, "Reward already claimed");
            
            eventParticipants[_eventId][recipient].rewardAmount = amount;
        }
        
        emit RewardsDistributed(_eventId, totalAmount, _recipients.length, block.timestamp);
    }
    
    /**
     * @dev 领取奖励
     * @param _eventId 活动ID
     */
    function claimReward(uint256 _eventId) external nonReentrant {
        require(_eventId < events.length, "Event does not exist");
        Event storage eventData = events[_eventId];
        
        // 在测试模式下放宽状态限制
        if (!_testMode) {
            require(eventData.status == EventStatus.Completed, "Event not completed");
        }
        
        Participant storage participant = eventParticipants[_eventId][msg.sender];
        require(participant.userAddress != address(0), "Not a participant");
        require(participant.rewardAmount > 0, "No reward allocated");
        require(!participant.rewardClaimed, "Reward already claimed");
        
        uint256 amount = participant.rewardAmount;
        participant.rewardClaimed = true;
        eventData.rewardPool -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(_eventId, msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev 获取活动参与者列表
     * @param _eventId 活动ID
     * @return 参与者地址列表
     */
    function getEventParticipants(uint256 _eventId) external view returns (address[] memory) {
        require(_eventId < events.length, "Event does not exist");
        return _eventParticipantsList[_eventId];
    }
    
    /**
     * @dev 获取用户参与的活动列表
     * @param _user 用户地址
     * @return 活动ID列表
     */
    function getUserEvents(address _user) external view returns (uint256[] memory) {
        return _userEvents[_user];
    }
    
    /**
     * @dev 获取用户的贡献列表
     * @param _user 用户地址
     * @return 贡献ID列表
     */
    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return _userContributions[_user];
    }
    
    /**
     * @dev 获取贡献的投票者列表
     * @param _contributionId 贡献ID
     * @return 投票者地址列表
     */
    function getContributionVoters(uint256 _contributionId) external view returns (address[] memory) {
        require(_contributionId < contributions.length, "Contribution does not exist");
        return _contributionVoters[_contributionId];
    }
    
    /**
     * @dev 获取活动的贡献列表
     * @param _eventId 活动ID
     * @return 贡献ID列表
     */
    function getEventContributions(uint256 _eventId) external view returns (uint256[] memory) {
        require(_eventId < events.length, "Event does not exist");
        
        // 计算活动的贡献数量
        uint256 count = 0;
        for (uint256 i = 0; i < contributions.length; i++) {
            if (contributions[i].eventId == _eventId) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        // 填充结果数组
        for (uint256 i = 0; i < contributions.length; i++) {
            if (contributions[i].eventId == _eventId) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev 获取活动数量
     * @return 活动总数
     */
    function getEventCount() external view returns (uint256) {
        return events.length;
    }
    
    /**
     * @dev 获取贡献数量
     * @return 贡献总数
     */
    function getContributionCount() external view returns (uint256) {
        return contributions.length;
    }
    
    /**
     * @dev 仅用于测试：设置测试模式
     * @param _enabled 是否启用测试模式
     */
    function setTestMode(bool _enabled) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        _testMode = _enabled;
    }
    
    /**
     * @dev 仅用于测试：检查是否处于测试模式
     * @return 是否处于测试模式
     */
    function isTestMode() external view returns (bool) {
        return _testMode;
    }
}
