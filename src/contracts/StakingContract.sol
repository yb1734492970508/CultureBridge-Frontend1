// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title StakingContract
 * @dev 文化通证质押合约，允许用户质押CULT通证获取奖励
 * 支持质押、解除质押、领取奖励等功能
 */
contract StakingContract is ReentrancyGuard, AccessControl, UUPSUpgradeable, Initializable {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // 状态变量
    IERC20 public cultureToken;           // 文化通证合约接口
    uint256 public totalStaked;           // 总质押量
    uint256 public rewardRate;            // 奖励发放速率 (每秒每个质押通证的奖励量，以1e18为基数)
    uint256 public lastUpdateTime;        // 上次更新时间
    uint256 public rewardPerTokenStored;  // 每个质押通证的累计奖励
    
    // 用户数据
    mapping(address => uint256) public userStakedAmount;           // 用户质押数量
    mapping(address => uint256) public userRewardPerTokenPaid;     // 用户已结算的每通证奖励
    mapping(address => uint256) public rewards;                    // 用户待领取奖励
    
    // 事件
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    
    /**
     * @dev 禁用默认构造函数，使用initialize函数进行初始化
     */
    constructor() {
        // 构造函数故意留空，所有初始化逻辑移至initialize函数
    }
    
    /**
     * @dev 初始化合约
     * @param _cultureToken 文化通证合约地址
     * @param _rewardRate 初始奖励发放速率
     * @param _admin 管理员地址
     */
    function initialize(
        address _cultureToken,
        uint256 _rewardRate,
        address _admin
    ) public initializer {
        require(_cultureToken != address(0), "Token address cannot be zero");
        require(_admin != address(0), "Admin cannot be zero address");
        
        cultureToken = IERC20(_cultureToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
        
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(ADMIN_ROLE, _admin);
        _setupRole(UPGRADER_ROLE, _admin);
    }
    
    /**
     * @dev 更新奖励状态
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev 计算每个质押通证的奖励
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + (
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked
        );
    }
    
    /**
     * @dev 计算用户已赚取但未领取的奖励
     * @param account 用户地址
     */
    function earned(address account) public view returns (uint256) {
        return (
            (userStakedAmount[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
        ) + rewards[account];
    }
    
    /**
     * @dev 质押通证
     * @param amount 质押数量
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        userStakedAmount[msg.sender] += amount;
        
        // 转移通证到合约
        bool success = cultureToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev 解除质押
     * @param amount 解除质押数量
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(userStakedAmount[msg.sender] >= amount, "Unstake amount exceeds balance");
        
        totalStaked -= amount;
        userStakedAmount[msg.sender] -= amount;
        
        // 转移通证回用户
        bool success = cultureToken.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev 领取奖励
     */
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            
            // 转移奖励通证给用户
            bool success = cultureToken.transfer(msg.sender, reward);
            require(success, "Reward transfer failed");
            
            emit RewardClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev 更新奖励发放速率
     * @param _rewardRate 新的奖励发放速率
     */
    function setRewardRate(uint256 _rewardRate) external onlyRole(ADMIN_ROLE) updateReward(address(0)) {
        uint256 oldRate = rewardRate;
        rewardRate = _rewardRate;
        emit RewardRateUpdated(oldRate, _rewardRate);
    }
    
    /**
     * @dev 紧急提取所有质押通证 (仅管理员)
     * @param recipient 接收地址
     */
    function emergencyWithdraw(address recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(recipient != address(0), "Cannot withdraw to zero address");
        
        uint256 balance = cultureToken.balanceOf(address(this));
        bool success = cultureToken.transfer(recipient, balance);
        require(success, "Token transfer failed");
    }
    
    /**
     * @dev 实现UUPS可升级接口的_authorizeUpgrade函数
     * 只有UPGRADER_ROLE角色可以升级合约
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
