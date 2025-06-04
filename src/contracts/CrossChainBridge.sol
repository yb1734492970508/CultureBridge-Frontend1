// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CrossChainBridge
 * @dev 实现跨链资产转移的桥接合约
 * 支持CBT通证在BNB Chain、Ethereum和Polygon之间的跨链转移
 */
contract CrossChainBridge is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    // 角色定义
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // 转账状态
    enum TransferStatus {
        None,       // 0: 不存在
        Locked,     // 1: 已锁定
        Released,   // 2: 已释放（取消）
        Minted,     // 3: 已铸造
        Burned,     // 4: 已销毁
        Completed   // 5: 已完成
    }

    // 转账记录
    struct Transfer {
        address user;
        uint256 amount;
        string sourceChain;
        string targetChain;
        TransferStatus status;
        uint256 timestamp;
    }

    // 链ID映射
    mapping(string => bool) public supportedChains;
    
    // 转账记录映射
    mapping(bytes32 => Transfer) public transfers;
    
    // 本地代币合约
    IERC20 public token;
    
    // 当前链ID
    string public currentChainId;
    
    // 最小签名数量
    uint256 public minSignatures;
    
    // 单笔交易限额
    uint256 public singleTransferLimit;
    
    // 每日交易限额
    uint256 public dailyTransferLimit;
    
    // 用户每日已使用额度
    mapping(address => uint256) public userDailyUsage;
    
    // 用户每日额度重置时间
    mapping(address => uint256) public userDailyResetTime;
    
    // 锁定期（秒）
    uint256 public lockPeriod;

    // 事件
    event TokensLocked(bytes32 indexed transferId, address indexed user, uint256 amount, string targetChain);
    event TokensReleased(bytes32 indexed transferId, address indexed user, uint256 amount);
    event TokensMinted(bytes32 indexed transferId, address indexed user, uint256 amount, string sourceChain);
    event TokensBurned(bytes32 indexed transferId, address indexed user, uint256 amount, string targetChain);
    event ChainAdded(string chainId);
    event ChainRemoved(string chainId);
    event LimitsUpdated(uint256 singleLimit, uint256 dailyLimit);

    /**
     * @dev 构造函数
     * @param _token 本地代币合约地址
     * @param _currentChainId 当前链ID
     * @param _minSignatures 最小签名数量
     */
    constructor(
        address _token,
        string memory _currentChainId,
        uint256 _minSignatures
    ) {
        token = IERC20(_token);
        currentChainId = _currentChainId;
        minSignatures = _minSignatures;
        
        // 默认限额和锁定期
        singleTransferLimit = 10000 * 10**18; // 10,000 tokens
        dailyTransferLimit = 50000 * 10**18;  // 50,000 tokens
        lockPeriod = 1 hours;                 // 1小时锁定期
        
        // 设置当前链为支持的链
        supportedChains[_currentChainId] = true;
        
        // 设置角色
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev 添加支持的链
     * @param chainId 链ID
     */
    function addChain(string memory chainId) external onlyRole(ADMIN_ROLE) {
        require(!supportedChains[chainId], "Chain already supported");
        supportedChains[chainId] = true;
        emit ChainAdded(chainId);
    }

    /**
     * @dev 移除支持的链
     * @param chainId 链ID
     */
    function removeChain(string memory chainId) external onlyRole(ADMIN_ROLE) {
        require(keccak256(bytes(chainId)) != keccak256(bytes(currentChainId)), "Cannot remove current chain");
        require(supportedChains[chainId], "Chain not supported");
        supportedChains[chainId] = false;
        emit ChainRemoved(chainId);
    }

    /**
     * @dev 更新交易限额
     * @param _singleTransferLimit 单笔交易限额
     * @param _dailyTransferLimit 每日交易限额
     */
    function updateLimits(uint256 _singleTransferLimit, uint256 _dailyTransferLimit) external onlyRole(ADMIN_ROLE) {
        singleTransferLimit = _singleTransferLimit;
        dailyTransferLimit = _dailyTransferLimit;
        emit LimitsUpdated(_singleTransferLimit, _dailyTransferLimit);
    }

    /**
     * @dev 锁定代币（从当前链转出）
     * @param amount 金额
     * @param targetChain 目标链ID
     * @param targetAddress 目标地址
     * @return transferId 转账ID
     */
    function lockTokens(
        uint256 amount, 
        string calldata targetChain, 
        address targetAddress
    ) external nonReentrant returns (bytes32 transferId) {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[targetChain], "Target chain not supported");
        require(keccak256(bytes(targetChain)) != keccak256(bytes(currentChainId)), "Cannot transfer to same chain");
        
        // 检查限额
        require(amount <= singleTransferLimit, "Exceeds single transfer limit");
        
        // 重置每日限额（如果过了24小时）
        if (block.timestamp >= userDailyResetTime[msg.sender]) {
            userDailyUsage[msg.sender] = 0;
            userDailyResetTime[msg.sender] = block.timestamp + 1 days;
        }
        
        // 检查每日限额
        require(userDailyUsage[msg.sender] + amount <= dailyTransferLimit, "Exceeds daily transfer limit");
        
        // 更新用户使用额度
        userDailyUsage[msg.sender] += amount;
        
        // 生成转账ID
        transferId = keccak256(abi.encodePacked(
            msg.sender,
            targetAddress,
            amount,
            currentChainId,
            targetChain,
            block.timestamp
        ));
        
        // 确保转账ID不存在
        require(transfers[transferId].status == TransferStatus.None, "Transfer ID already exists");
        
        // 创建转账记录
        transfers[transferId] = Transfer({
            user: msg.sender,
            amount: amount,
            sourceChain: currentChainId,
            targetChain: targetChain,
            status: TransferStatus.Locked,
            timestamp: block.timestamp
        });
        
        // 转移代币到合约
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        emit TokensLocked(transferId, msg.sender, amount, targetChain);
        
        return transferId;
    }

    /**
     * @dev 释放代币（取消转出）
     * @param transferId 转账ID
     */
    function releaseTokens(bytes32 transferId) external nonReentrant {
        Transfer storage transfer = transfers[transferId];
        
        require(transfer.status == TransferStatus.Locked, "Transfer not in locked status");
        require(transfer.user == msg.sender, "Not transfer initiator");
        require(block.timestamp >= transfer.timestamp + lockPeriod, "Lock period not expired");
        
        // 更新状态
        transfer.status = TransferStatus.Released;
        
        // 返还代币
        require(token.transfer(msg.sender, transfer.amount), "Token transfer failed");
        
        // 更新用户每日使用额度
        if (block.timestamp < userDailyResetTime[msg.sender]) {
            userDailyUsage[msg.sender] -= transfer.amount;
        }
        
        emit TokensReleased(transferId, msg.sender, transfer.amount);
    }

    /**
     * @dev 铸造代币（从其他链转入）
     * @param to 接收地址
     * @param amount 金额
     * @param sourceChain 源链ID
     * @param transferId 转账ID
     * @param signatures 验证者签名
     */
    function mintTokens(
        address to, 
        uint256 amount, 
        string calldata sourceChain,
        bytes32 transferId,
        bytes calldata signatures
    ) external onlyRole(RELAYER_ROLE) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[sourceChain], "Source chain not supported");
        require(keccak256(bytes(sourceChain)) != keccak256(bytes(currentChainId)), "Cannot mint from same chain");
        
        // 确保转账ID不存在或未处理
        require(transfers[transferId].status == TransferStatus.None, "Transfer already processed");
        
        // 验证签名
        bytes32 messageHash = keccak256(abi.encodePacked(
            to,
            amount,
            sourceChain,
            currentChainId,
            transferId
        ));
        
        require(_verifySignatures(messageHash, signatures), "Invalid signatures");
        
        // 创建转账记录
        transfers[transferId] = Transfer({
            user: to,
            amount: amount,
            sourceChain: sourceChain,
            targetChain: currentChainId,
            status: TransferStatus.Minted,
            timestamp: block.timestamp
        });
        
        // 铸造代币
        require(token.transfer(to, amount), "Token transfer failed");
        
        emit TokensMinted(transferId, to, amount, sourceChain);
    }

    /**
     * @dev 销毁代币（转回原链）
     * @param amount 金额
     * @param targetChain 目标链ID
     * @param targetAddress 目标地址
     * @return transferId 转账ID
     */
    function burnTokens(
        uint256 amount, 
        string calldata targetChain, 
        address targetAddress
    ) external nonReentrant returns (bytes32 transferId) {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[targetChain], "Target chain not supported");
        require(keccak256(bytes(targetChain)) != keccak256(bytes(currentChainId)), "Cannot transfer to same chain");
        
        // 检查限额
        require(amount <= singleTransferLimit, "Exceeds single transfer limit");
        
        // 重置每日限额（如果过了24小时）
        if (block.timestamp >= userDailyResetTime[msg.sender]) {
            userDailyUsage[msg.sender] = 0;
            userDailyResetTime[msg.sender] = block.timestamp + 1 days;
        }
        
        // 检查每日限额
        require(userDailyUsage[msg.sender] + amount <= dailyTransferLimit, "Exceeds daily transfer limit");
        
        // 更新用户使用额度
        userDailyUsage[msg.sender] += amount;
        
        // 生成转账ID
        transferId = keccak256(abi.encodePacked(
            msg.sender,
            targetAddress,
            amount,
            currentChainId,
            targetChain,
            block.timestamp
        ));
        
        // 确保转账ID不存在
        require(transfers[transferId].status == TransferStatus.None, "Transfer ID already exists");
        
        // 创建转账记录
        transfers[transferId] = Transfer({
            user: msg.sender,
            amount: amount,
            sourceChain: currentChainId,
            targetChain: targetChain,
            status: TransferStatus.Burned,
            timestamp: block.timestamp
        });
        
        // 转移代币到合约
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        emit TokensBurned(transferId, msg.sender, amount, targetChain);
        
        return transferId;
    }

    /**
     * @dev 获取转账状态
     * @param transferId 转账ID
     * @return status 状态
     */
    function getTransferStatus(bytes32 transferId) external view returns (TransferStatus status) {
        return transfers[transferId].status;
    }

    /**
     * @dev 验证签名
     * @param messageHash 消息哈希
     * @param signatures 签名数据
     * @return 是否验证通过
     */
    function _verifySignatures(bytes32 messageHash, bytes memory signatures) internal view returns (bool) {
        require(signatures.length % 65 == 0, "Invalid signature length");
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        uint256 signatureCount = signatures.length / 65;
        
        require(signatureCount >= minSignatures, "Not enough signatures");
        
        address[] memory signers = new address[](signatureCount);
        
        for (uint256 i = 0; i < signatureCount; i++) {
            bytes memory signature = _extractSignature(signatures, i);
            address signer = ethSignedMessageHash.recover(signature);
            
            // 确保签名者有RELAYER_ROLE角色
            require(hasRole(RELAYER_ROLE, signer), "Invalid signer");
            
            // 确保没有重复签名
            for (uint256 j = 0; j < i; j++) {
                require(signer != signers[j], "Duplicate signature");
            }
            
            signers[i] = signer;
        }
        
        return true;
    }

    /**
     * @dev 从签名数据中提取单个签名
     * @param signatures 签名数据
     * @param index 索引
     * @return 单个签名
     */
    function _extractSignature(bytes memory signatures, uint256 index) internal pure returns (bytes memory) {
        uint256 offset = index * 65;
        bytes memory signature = new bytes(65);
        
        for (uint256 i = 0; i < 65; i++) {
            signature[i] = signatures[offset + i];
        }
        
        return signature;
    }
}
