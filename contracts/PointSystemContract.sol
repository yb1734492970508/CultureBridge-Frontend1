// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PointSystemContract
 * @dev 管理用户积分系统的智能合约
 */
contract PointSystemContract is AccessControl, ReentrancyGuard {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant POINT_MANAGER_ROLE = keccak256("POINT_MANAGER_ROLE");
    
    // 用户等级定义
    enum UserLevel { Basic, Silver, Gold, Platinum, Diamond }
    
    // 积分记录类型
    enum PointRecordType { Earned, Spent, Expired }
    
    // 用户积分信息结构
    struct UserPoints {
        uint256 totalEarned;
        uint256 totalSpent;
        uint256 currentBalance;
        UserLevel level;
        uint256 lastActivityTime;
    }
    
    // 积分记录结构
    struct PointRecord {
        uint256 recordId;
        address user;
        uint256 amount;
        PointRecordType recordType;
        string description;
        uint256 timestamp;
    }
    
    // 等级要求
    mapping(UserLevel => uint256) public levelRequirements;
    
    // 用户地址到积分信息的映射
    mapping(address => UserPoints) public userPoints;
    
    // 记录ID计数器
    uint256 private _recordIdCounter;
    
    // 记录ID到积分记录的映射
    mapping(uint256 => PointRecord) public pointRecords;
    
    // 用户地址到其积分记录ID列表的映射
    mapping(address => uint256[]) private _userPointRecords;
    
    // 事件
    event PointsEarned(address indexed user, uint256 amount, string description, uint256 timestamp);
    event PointsSpent(address indexed user, uint256 amount, string description, uint256 timestamp);
    event PointsExpired(address indexed user, uint256 amount, uint256 timestamp);
    event UserLevelChanged(address indexed user, UserLevel oldLevel, UserLevel newLevel, uint256 timestamp);
    event LevelRequirementChanged(UserLevel level, uint256 oldRequirement, uint256 newRequirement, uint256 timestamp);
    
    /**
     * @dev 构造函数
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(POINT_MANAGER_ROLE, msg.sender);
        
        // 设置默认等级要求
        levelRequirements[UserLevel.Basic] = 0;
        levelRequirements[UserLevel.Silver] = 1000;
        levelRequirements[UserLevel.Gold] = 5000;
        levelRequirements[UserLevel.Platinum] = 20000;
        levelRequirements[UserLevel.Diamond] = 50000;
    }
    
    /**
     * @dev 添加积分
     * @param _user 用户地址
     * @param _amount 积分数量
     * @param _description 描述
     */
    function addPoints(address _user, uint256 _amount, string memory _description) external nonReentrant {
        require(hasRole(POINT_MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Must have point manager or admin role");
        require(_amount > 0, "Amount must be greater than zero");
        
        UserPoints storage points = userPoints[_user];
        
        // 如果是新用户，初始化积分信息
        if (points.lastActivityTime == 0) {
            points.level = UserLevel.Basic;
        }
        
        points.totalEarned += _amount;
        points.currentBalance += _amount;
        points.lastActivityTime = block.timestamp;
        
        // 创建积分记录
        uint256 recordId = _recordIdCounter++;
        
        pointRecords[recordId] = PointRecord({
            recordId: recordId,
            user: _user,
            amount: _amount,
            recordType: PointRecordType.Earned,
            description: _description,
            timestamp: block.timestamp
        });
        
        _userPointRecords[_user].push(recordId);
        
        // 检查并更新用户等级
        _updateUserLevel(_user);
        
        emit PointsEarned(_user, _amount, _description, block.timestamp);
    }
    
    /**
     * @dev 消费积分
     * @param _user 用户地址
     * @param _amount 积分数量
     * @param _description 描述
     */
    function spendPoints(address _user, uint256 _amount, string memory _description) external nonReentrant {
        require(hasRole(POINT_MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Must have point manager or admin role");
        require(_amount > 0, "Amount must be greater than zero");
        require(userPoints[_user].currentBalance >= _amount, "Insufficient points");
        
        UserPoints storage points = userPoints[_user];
        
        points.totalSpent += _amount;
        points.currentBalance -= _amount;
        points.lastActivityTime = block.timestamp;
        
        // 创建积分记录
        uint256 recordId = _recordIdCounter++;
        
        pointRecords[recordId] = PointRecord({
            recordId: recordId,
            user: _user,
            amount: _amount,
            recordType: PointRecordType.Spent,
            description: _description,
            timestamp: block.timestamp
        });
        
        _userPointRecords[_user].push(recordId);
        
        // 检查并更新用户等级
        _updateUserLevel(_user);
        
        emit PointsSpent(_user, _amount, _description, block.timestamp);
    }
    
    /**
     * @dev 过期积分
     * @param _user 用户地址
     * @param _amount 积分数量
     */
    function expirePoints(address _user, uint256 _amount) external nonReentrant {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(_amount > 0, "Amount must be greater than zero");
        require(userPoints[_user].currentBalance >= _amount, "Insufficient points");
        
        UserPoints storage points = userPoints[_user];
        
        points.currentBalance -= _amount;
        points.lastActivityTime = block.timestamp;
        
        // 创建积分记录
        uint256 recordId = _recordIdCounter++;
        
        pointRecords[recordId] = PointRecord({
            recordId: recordId,
            user: _user,
            amount: _amount,
            recordType: PointRecordType.Expired,
            description: "Points expired",
            timestamp: block.timestamp
        });
        
        _userPointRecords[_user].push(recordId);
        
        // 检查并更新用户等级
        _updateUserLevel(_user);
        
        emit PointsExpired(_user, _amount, block.timestamp);
    }
    
    /**
     * @dev 设置等级要求
     * @param _level 用户等级
     * @param _requirement 要求积分数量
     */
    function setLevelRequirement(UserLevel _level, uint256 _requirement) external onlyRole(ADMIN_ROLE) {
        require(_level != UserLevel.Basic, "Cannot change Basic level requirement");
        
        if (_level != UserLevel.Diamond) {
            UserLevel nextLevel = UserLevel(uint(_level) + 1);
            require(_requirement < levelRequirements[nextLevel], "Requirement must be less than next level");
        }
        
        if (_level != UserLevel.Silver) {
            UserLevel prevLevel = UserLevel(uint(_level) - 1);
            require(_requirement > levelRequirements[prevLevel], "Requirement must be greater than previous level");
        }
        
        uint256 oldRequirement = levelRequirements[_level];
        levelRequirements[_level] = _requirement;
        
        emit LevelRequirementChanged(_level, oldRequirement, _requirement, block.timestamp);
    }
    
    /**
     * @dev 获取用户积分记录
     * @param _user 用户地址
     * @return 积分记录ID列表
     */
    function getUserPointRecords(address _user) external view returns (uint256[] memory) {
        return _userPointRecords[_user];
    }
    
    /**
     * @dev 获取用户等级
     * @param _user 用户地址
     * @return 用户等级
     */
    function getUserLevel(address _user) external view returns (UserLevel) {
        return userPoints[_user].level;
    }
    
    /**
     * @dev 获取用户积分余额
     * @param _user 用户地址
     * @return 积分余额
     */
    function getPointBalance(address _user) external view returns (uint256) {
        return userPoints[_user].currentBalance;
    }
    
    /**
     * @dev 获取用户总共赚取的积分
     * @param _user 用户地址
     * @return 总赚取积分
     */
    function getTotalEarnedPoints(address _user) external view returns (uint256) {
        return userPoints[_user].totalEarned;
    }
    
    /**
     * @dev 获取用户总共消费的积分
     * @param _user 用户地址
     * @return 总消费积分
     */
    function getTotalSpentPoints(address _user) external view returns (uint256) {
        return userPoints[_user].totalSpent;
    }
    
    /**
     * @dev 获取升级到下一等级所需的积分
     * @param _user 用户地址
     * @return 所需积分
     */
    function getPointsToNextLevel(address _user) external view returns (uint256) {
        UserPoints storage points = userPoints[_user];
        
        if (points.level == UserLevel.Diamond) {
            return 0; // 已经是最高等级
        }
        
        UserLevel nextLevel = UserLevel(uint(points.level) + 1);
        uint256 requiredPoints = levelRequirements[nextLevel];
        
        if (points.totalEarned >= requiredPoints) {
            return 0; // 已经满足下一等级要求
        }
        
        return requiredPoints - points.totalEarned;
    }
    
    /**
     * @dev 内部函数：更新用户等级
     * @param _user 用户地址
     */
    function _updateUserLevel(address _user) private {
        UserPoints storage points = userPoints[_user];
        UserLevel oldLevel = points.level;
        UserLevel newLevel = oldLevel;
        
        // 检查是否可以升级
        for (uint i = uint(UserLevel.Diamond); i > uint(oldLevel); i--) {
            UserLevel level = UserLevel(i);
            if (points.totalEarned >= levelRequirements[level]) {
                newLevel = level;
                break;
            }
        }
        
        // 检查是否需要降级
        for (uint i = uint(oldLevel); i > uint(UserLevel.Basic); i--) {
            UserLevel level = UserLevel(i);
            if (points.totalEarned < levelRequirements[level]) {
                newLevel = UserLevel(i - 1);
            } else {
                break;
            }
        }
        
        if (newLevel != oldLevel) {
            points.level = newLevel;
            emit UserLevelChanged(_user, oldLevel, newLevel, block.timestamp);
        }
    }
}
