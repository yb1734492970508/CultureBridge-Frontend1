# CBT代币智能合约架构设计

## 概述

Culture Bridge Token (CBT) 是CultureBridge平台的原生代币，基于BNB智能链(BSC)的BEP-20标准实现。CBT代币作为平台生态系统的核心，支持治理、质押、交易、奖励等多种功能。

## 代币基本信息

- **代币名称**: Culture Bridge Token
- **代币符号**: CBT
- **代币标准**: BEP-20 (兼容ERC-20)
- **小数位数**: 18
- **总供应量**: 1,000,000,000 CBT (10亿)
- **部署网络**: BNB Smart Chain (BSC)

## 代币分配方案

CBT代币的分配遵循以下比例：

### 1. 生态系统发展 (30% - 300,000,000 CBT)
- 用于平台功能开发
- 社区建设和推广
- 合作伙伴激励
- 技术升级和维护

### 2. 社区奖励 (25% - 250,000,000 CBT)
- 用户参与奖励
- 内容创作激励
- 质押奖励池
- 社区治理参与奖励

### 3. 投资者 (20% - 200,000,000 CBT)
- 私募投资者
- 机构投资者
- 战略合作伙伴
- 锁定期：12-24个月线性释放

### 4. 团队 (15% - 150,000,000 CBT)
- 核心开发团队
- 顾问团队
- 锁定期：24个月，之后36个月线性释放

### 5. 储备基金 (10% - 100,000,000 CBT)
- 应急储备
- 未来发展需要
- 市场稳定基金
- 长期锁定

## 智能合约架构

### 1. CBT主合约 (CultureToken.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CultureToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    // 代币总供应量
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // 分配地址
    address public ecosystemWallet;
    address public communityWallet;
    address public investorWallet;
    address public teamWallet;
    address public reserveWallet;
    
    // 锁定信息
    mapping(address => LockInfo) public lockInfo;
    
    struct LockInfo {
        uint256 totalLocked;
        uint256 released;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
    }
    
    // 事件
    event TokensLocked(address indexed account, uint256 amount, uint256 duration);
    event TokensReleased(address indexed account, uint256 amount);
    
    constructor(
        address _ecosystemWallet,
        address _communityWallet,
        address _investorWallet,
        address _teamWallet,
        address _reserveWallet
    ) ERC20("Culture Bridge Token", "CBT") {
        ecosystemWallet = _ecosystemWallet;
        communityWallet = _communityWallet;
        investorWallet = _investorWallet;
        teamWallet = _teamWallet;
        reserveWallet = _reserveWallet;
        
        // 初始分配
        _mint(ecosystemWallet, TOTAL_SUPPLY * 30 / 100); // 30%
        _mint(communityWallet, TOTAL_SUPPLY * 25 / 100); // 25%
        _mint(investorWallet, TOTAL_SUPPLY * 20 / 100);  // 20%
        _mint(teamWallet, TOTAL_SUPPLY * 15 / 100);      // 15%
        _mint(reserveWallet, TOTAL_SUPPLY * 10 / 100);   // 10%
    }
    
    // 锁定代币
    function lockTokens(
        address account,
        uint256 amount,
        uint256 duration,
        uint256 cliff
    ) external onlyOwner {
        require(balanceOf(account) >= amount, "Insufficient balance");
        
        lockInfo[account] = LockInfo({
            totalLocked: amount,
            released: 0,
            startTime: block.timestamp,
            duration: duration,
            cliff: cliff
        });
        
        emit TokensLocked(account, amount, duration);
    }
    
    // 释放锁定的代币
    function releaseTokens(address account) external nonReentrant {
        LockInfo storage info = lockInfo[account];
        require(info.totalLocked > 0, "No locked tokens");
        require(block.timestamp >= info.startTime + info.cliff, "Still in cliff period");
        
        uint256 releasable = getReleasableAmount(account);
        require(releasable > 0, "No tokens to release");
        
        info.released += releasable;
        _transfer(address(this), account, releasable);
        
        emit TokensReleased(account, releasable);
    }
    
    // 计算可释放的代币数量
    function getReleasableAmount(address account) public view returns (uint256) {
        LockInfo memory info = lockInfo[account];
        if (info.totalLocked == 0) return 0;
        
        if (block.timestamp < info.startTime + info.cliff) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - info.startTime - info.cliff;
        uint256 vestingDuration = info.duration - info.cliff;
        
        if (elapsed >= vestingDuration) {
            return info.totalLocked - info.released;
        }
        
        uint256 totalReleasable = (info.totalLocked * elapsed) / vestingDuration;
        return totalReleasable - info.released;
    }
    
    // 重写transfer函数以支持锁定检查
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && lockInfo[from].totalLocked > 0) {
            uint256 availableBalance = balanceOf(from) - getLockedAmount(from);
            require(availableBalance >= amount, "Transfer amount exceeds available balance");
        }
    }
    
    // 获取锁定的代币数量
    function getLockedAmount(address account) public view returns (uint256) {
        LockInfo memory info = lockInfo[account];
        if (info.totalLocked == 0) return 0;
        
        return info.totalLocked - info.released - getReleasableAmount(account);
    }
    
    // 暂停功能（紧急情况使用）
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

### 2. CBT质押合约 (CultureStaking.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CultureStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable cbtToken;
    
    // 质押池信息
    struct PoolInfo {
        uint256 allocPoint;       // 分配点数
        uint256 lastRewardBlock;  // 最后奖励区块
        uint256 accCBTPerShare;   // 累积每股CBT
        uint256 totalStaked;      // 总质押量
        uint256 minStakeAmount;   // 最小质押量
        uint256 lockPeriod;       // 锁定期（秒）
    }
    
    // 用户信息
    struct UserInfo {
        uint256 amount;           // 质押数量
        uint256 rewardDebt;       // 奖励债务
        uint256 stakeTime;        // 质押时间
        uint256 lastClaimTime;    // 最后领取时间
    }
    
    // 质押池
    PoolInfo[] public poolInfo;
    
    // 用户信息 poolId => user => UserInfo
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    // 每个区块的CBT奖励
    uint256 public cbtPerBlock;
    
    // 总分配点数
    uint256 public totalAllocPoint = 0;
    
    // 开始区块
    uint256 public startBlock;
    
    // 事件
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
    
    constructor(
        IERC20 _cbtToken,
        uint256 _cbtPerBlock,
        uint256 _startBlock
    ) {
        cbtToken = _cbtToken;
        cbtPerBlock = _cbtPerBlock;
        startBlock = _startBlock;
    }
    
    // 添加质押池
    function addPool(
        uint256 _allocPoint,
        uint256 _minStakeAmount,
        uint256 _lockPeriod,
        bool _withUpdate
    ) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint += _allocPoint;
        
        poolInfo.push(PoolInfo({
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accCBTPerShare: 0,
            totalStaked: 0,
            minStakeAmount: _minStakeAmount,
            lockPeriod: _lockPeriod
        }));
    }
    
    // 更新池信息
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        
        uint256 lpSupply = pool.totalStaked;
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        
        uint256 multiplier = block.number - pool.lastRewardBlock;
        uint256 cbtReward = (multiplier * cbtPerBlock * pool.allocPoint) / totalAllocPoint;
        
        pool.accCBTPerShare += (cbtReward * 1e12) / lpSupply;
        pool.lastRewardBlock = block.number;
    }
    
    // 批量更新所有池
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }
    
    // 质押代币
    function deposit(uint256 _pid, uint256 _amount) external nonReentrant whenNotPaused {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(_amount >= pool.minStakeAmount, "Amount below minimum");
        
        updatePool(_pid);
        
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accCBTPerShare) / 1e12 - user.rewardDebt;
            if (pending > 0) {
                safeCBTTransfer(msg.sender, pending);
                emit Harvest(msg.sender, _pid, pending);
            }
        }
        
        if (_amount > 0) {
            cbtToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
            pool.totalStaked += _amount;
            
            if (user.stakeTime == 0) {
                user.stakeTime = block.timestamp;
            }
        }
        
        user.rewardDebt = (user.amount * pool.accCBTPerShare) / 1e12;
        user.lastClaimTime = block.timestamp;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    // 提取代币
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(user.amount >= _amount, "Insufficient staked amount");
        require(
            block.timestamp >= user.stakeTime + pool.lockPeriod,
            "Still in lock period"
        );
        
        updatePool(_pid);
        
        uint256 pending = (user.amount * pool.accCBTPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            safeCBTTransfer(msg.sender, pending);
            emit Harvest(msg.sender, _pid, pending);
        }
        
        if (_amount > 0) {
            user.amount -= _amount;
            pool.totalStaked -= _amount;
            cbtToken.safeTransfer(msg.sender, _amount);
        }
        
        user.rewardDebt = (user.amount * pool.accCBTPerShare) / 1e12;
        
        emit Withdraw(msg.sender, _pid, _amount);
    }
    
    // 领取奖励
    function harvest(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        uint256 pending = (user.amount * pool.accCBTPerShare) / 1e12 - user.rewardDebt;
        if (pending > 0) {
            safeCBTTransfer(msg.sender, pending);
            user.lastClaimTime = block.timestamp;
            emit Harvest(msg.sender, _pid, pending);
        }
        
        user.rewardDebt = (user.amount * pool.accCBTPerShare) / 1e12;
    }
    
    // 紧急提取（不领取奖励）
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        pool.totalStaked -= amount;
        
        cbtToken.safeTransfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }
    
    // 安全的CBT转账
    function safeCBTTransfer(address _to, uint256 _amount) internal {
        uint256 cbtBal = cbtToken.balanceOf(address(this));
        if (_amount > cbtBal) {
            cbtToken.safeTransfer(_to, cbtBal);
        } else {
            cbtToken.safeTransfer(_to, _amount);
        }
    }
    
    // 查看待领取奖励
    function pendingCBT(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accCBTPerShare = pool.accCBTPerShare;
        uint256 lpSupply = pool.totalStaked;
        
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = block.number - pool.lastRewardBlock;
            uint256 cbtReward = (multiplier * cbtPerBlock * pool.allocPoint) / totalAllocPoint;
            accCBTPerShare += (cbtReward * 1e12) / lpSupply;
        }
        
        return (user.amount * accCBTPerShare) / 1e12 - user.rewardDebt;
    }
    
    // 获取用户质押信息
    function getUserStakeInfo(uint256 _pid, address _user) 
        external 
        view 
        returns (
            uint256 stakedAmount,
            uint256 pendingReward,
            uint256 stakeTime,
            uint256 unlockTime
        ) 
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        
        stakedAmount = user.amount;
        pendingReward = this.pendingCBT(_pid, _user);
        stakeTime = user.stakeTime;
        unlockTime = user.stakeTime + pool.lockPeriod;
    }
    
    // 管理员功能
    function updateCBTPerBlock(uint256 _cbtPerBlock) external onlyOwner {
        massUpdatePools();
        cbtPerBlock = _cbtPerBlock;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

## 代币经济模型

### 1. 通胀机制
- 初始年通胀率：5%
- 通胀率每年递减0.5%
- 最低通胀率：1%
- 通胀产生的代币用于质押奖励和生态激励

### 2. 通缩机制
- 平台交易手续费的50%用于回购销毁CBT
- NFT交易手续费的30%用于回购销毁CBT
- DAO治理投票需要锁定CBT，投票结束后销毁10%

### 3. 质押奖励
- 基础APY：8-15%（根据质押时长和数量）
- 30天锁定：8% APY
- 90天锁定：12% APY
- 365天锁定：15% APY
- 额外奖励：参与治理、内容创作等

### 4. 治理权重
- 1 CBT = 1 投票权
- 质押的CBT获得额外投票权重
- 长期质押者获得更高权重

## 安全考虑

### 1. 智能合约安全
- 使用OpenZeppelin标准库
- 重入攻击保护
- 整数溢出保护
- 权限控制机制

### 2. 经济安全
- 代币锁定机制
- 渐进式释放
- 紧急暂停功能
- 多重签名控制

### 3. 审计要求
- 部署前进行专业安全审计
- 代码开源透明
- 社区监督机制
- 定期安全检查

## 部署计划

### 阶段1：测试网部署
- 在BSC测试网部署所有合约
- 进行功能测试和安全测试
- 社区测试和反馈收集

### 阶段2：主网部署
- 安全审计完成后部署到BSC主网
- 初始流动性提供
- 交易所上线准备

### 阶段3：生态集成
- 与其他DeFi协议集成
- 跨链桥接功能
- 更多应用场景开发

这个架构设计为CBT代币提供了完整的经济模型和技术实现方案，确保代币在CultureBridge生态系统中发挥核心作用。

