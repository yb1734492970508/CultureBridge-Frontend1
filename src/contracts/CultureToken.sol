// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CultureToken
 * @dev CultureBridge平台的原生代币，用于翻译服务、治理和激励
 */
contract CultureToken is ERC20, Ownable, Pausable {
    // 代币分配参数
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 10亿代币总量
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 初始供应量1亿
    
    // 生态系统分配
    uint256 public constant ECOSYSTEM_ALLOCATION = 400_000_000 * 10**18; // 4亿用于生态系统发展
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18; // 1.5亿用于团队
    uint256 public constant COMMUNITY_ALLOCATION = 350_000_000 * 10**18; // 3.5亿用于社区奖励
    
    // 团队代币锁定
    uint256 public teamTokensReleased;
    uint256 public constant TEAM_VESTING_DURATION = 3 * 365 days; // 3年锁定期
    uint256 public teamVestingStart;
    
    // 翻译挖矿参数
    uint256 public translationRewardRate; // 每个翻译单位的奖励率
    uint256 public lastRewardUpdate;
    uint256 public constant REWARD_ADJUSTMENT_PERIOD = 30 days; // 奖励调整周期
    
    // 质量验证奖励
    mapping(address => uint256) public qualityVerifierRewards;
    
    // 事件
    event TranslationRewarded(address indexed translator, uint256 amount, bytes32 translationId);
    event QualityVerificationRewarded(address indexed verifier, uint256 amount, bytes32 translationId);
    event RewardRateUpdated(uint256 newRate);
    event TeamTokensReleased(uint256 amount);
    
    /**
     * @dev 构造函数
     */
    constructor() ERC20("CultureToken", "CULT") {
        // 初始铸造
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // 设置团队锁定开始时间
        teamVestingStart = block.timestamp;
        
        // 初始化翻译奖励率
        translationRewardRate = 10 * 10**18; // 初始每个翻译单位10个代币
        lastRewardUpdate = block.timestamp;
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
     * @dev 奖励翻译者
     * @param translator 翻译者地址
     * @param translationUnits 翻译单位数量
     * @param translationId 翻译ID
     */
    function rewardTranslator(address translator, uint256 translationUnits, bytes32 translationId) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(translator != address(0), "Invalid translator address");
        require(translationUnits > 0, "Translation units must be positive");
        
        uint256 reward = translationUnits * translationRewardRate;
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(translator, reward);
        
        emit TranslationRewarded(translator, reward, translationId);
    }
    
    /**
     * @dev 奖励质量验证者
     * @param verifier 验证者地址
     * @param amount 奖励金额
     * @param translationId 翻译ID
     */
    function rewardQualityVerifier(address verifier, uint256 amount, bytes32 translationId) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(verifier != address(0), "Invalid verifier address");
        require(amount > 0, "Reward amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(verifier, amount);
        qualityVerifierRewards[verifier] += amount;
        
        emit QualityVerificationRewarded(verifier, amount, translationId);
    }
    
    /**
     * @dev 更新翻译奖励率
     * @param newRate 新的奖励率
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(block.timestamp >= lastRewardUpdate + REWARD_ADJUSTMENT_PERIOD, "Too soon to update rate");
        translationRewardRate = newRate;
        lastRewardUpdate = block.timestamp;
        
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @dev 释放团队代币
     */
    function releaseTeamTokens() external onlyOwner {
        uint256 elapsedTime = block.timestamp - teamVestingStart;
        require(elapsedTime > 0, "Vesting not started");
        
        uint256 vestedAmount;
        if (elapsedTime >= TEAM_VESTING_DURATION) {
            vestedAmount = TEAM_ALLOCATION;
        } else {
            vestedAmount = (TEAM_ALLOCATION * elapsedTime) / TEAM_VESTING_DURATION;
        }
        
        uint256 releasableAmount = vestedAmount - teamTokensReleased;
        require(releasableAmount > 0, "No tokens to release");
        require(totalSupply() + releasableAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        teamTokensReleased += releasableAmount;
        _mint(msg.sender, releasableAmount);
        
        emit TeamTokensReleased(releasableAmount);
    }
    
    /**
     * @dev 分配生态系统代币
     * @param recipient 接收者地址
     * @param amount 金额
     */
    function allocateEcosystemTokens(address recipient, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be positive");
        
        // 确保不超过生态系统分配上限
        uint256 ecosystemMinted = totalSupply() - INITIAL_SUPPLY - teamTokensReleased;
        require(ecosystemMinted + amount <= ECOSYSTEM_ALLOCATION, "Exceeds ecosystem allocation");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(recipient, amount);
    }
    
    /**
     * @dev 分配社区奖励代币
     * @param recipient 接收者地址
     * @param amount 金额
     */
    function allocateCommunityRewards(address recipient, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be positive");
        
        // 确保不超过社区奖励分配上限
        uint256 communityMinted = totalSupply() - INITIAL_SUPPLY - teamTokensReleased;
        uint256 ecosystemMinted = totalSupply() - INITIAL_SUPPLY - teamTokensReleased;
        uint256 totalCommunityMinted = communityMinted - ecosystemMinted;
        
        require(totalCommunityMinted + amount <= COMMUNITY_ALLOCATION, "Exceeds community allocation");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(recipient, amount);
    }
    
    /**
     * @dev 销毁代币（通货紧缩机制）
     * @param amount 销毁金额
     */
    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev 转账前检查
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) 
        internal 
        override 
        whenNotPaused 
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
