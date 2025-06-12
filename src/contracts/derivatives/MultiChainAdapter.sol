// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title MultiChainAdapter
 * @dev 跨链适配器合约，用于管理多链资产和跨链操作
 * 支持NFT衍生品市场的跨链功能，包括资产映射、状态同步和跨链交易
 */
contract MultiChainAdapter is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // 链ID到链名称的映射
    mapping(uint256 => string) public chainIdToName;
    
    // 支持的链ID列表
    uint256[] public supportedChainIds;
    
    // 资产映射：源链ID => 目标链ID => 源资产地址 => 目标资产地址
    mapping(uint256 => mapping(uint256 => mapping(address => address))) public assetMapping;
    
    // 跨链交易记录：交易哈希 => 交易状态
    mapping(bytes32 => TransactionStatus) public crossChainTxs;
    
    // 链上资产注册表：链ID => 资产地址 => 资产信息
    mapping(uint256 => mapping(address => AssetInfo)) public assetRegistry;
    
    // 跨链消息队列：消息ID => 消息内容
    mapping(bytes32 => CrossChainMessage) public messageQueue;
    
    // 跨链交易状态枚举
    enum TransactionStatus {
        Pending,
        Confirmed,
        Failed,
        Reverted
    }
    
    // 资产类型枚举
    enum AssetType {
        Native,
        ERC20,
        ERC721,
        ERC1155,
        Derivative
    }
    
    // 资产信息结构
    struct AssetInfo {
        address assetAddress;
        AssetType assetType;
        string name;
        string symbol;
        uint8 decimals;
        bool isVerified;
    }
    
    // 跨链消息结构
    struct CrossChainMessage {
        uint256 sourceChainId;
        uint256 targetChainId;
        address sender;
        address recipient;
        bytes payload;
        uint256 timestamp;
        bool isProcessed;
    }
    
    // 跨链交易结构
    struct CrossChainTransaction {
        bytes32 txHash;
        uint256 sourceChainId;
        uint256 targetChainId;
        address sourceAsset;
        address targetAsset;
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        TransactionStatus status;
    }
    
    // 事件定义
    event ChainAdded(uint256 chainId, string name);
    event ChainRemoved(uint256 chainId);
    event AssetMapped(uint256 sourceChainId, uint256 targetChainId, address sourceAsset, address targetAsset);
    event AssetRegistered(uint256 chainId, address assetAddress, AssetType assetType, string name, string symbol);
    event CrossChainTransactionInitiated(bytes32 txHash, uint256 sourceChainId, uint256 targetChainId, address sourceAsset, address targetAsset, address sender, address recipient, uint256 amount);
    event CrossChainTransactionCompleted(bytes32 txHash, TransactionStatus status);
    event CrossChainMessageSent(bytes32 messageId, uint256 sourceChainId, uint256 targetChainId, address sender, address recipient);
    event CrossChainMessageProcessed(bytes32 messageId, bool success);
    
    /**
     * @dev 构造函数
     * @param admin 管理员地址
     */
    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
    }
    
    /**
     * @dev 添加支持的区块链
     * @param chainId 链ID
     * @param name 链名称
     */
    function addChain(uint256 chainId, string memory name) external onlyRole(ADMIN_ROLE) {
        require(bytes(chainIdToName[chainId]).length == 0, "Chain already exists");
        
        chainIdToName[chainId] = name;
        supportedChainIds.push(chainId);
        
        emit ChainAdded(chainId, name);
    }
    
    /**
     * @dev 移除支持的区块链
     * @param chainId 链ID
     */
    function removeChain(uint256 chainId) external onlyRole(ADMIN_ROLE) {
        require(bytes(chainIdToName[chainId]).length > 0, "Chain does not exist");
        
        delete chainIdToName[chainId];
        
        // 从支持的链ID列表中移除
        for (uint256 i = 0; i < supportedChainIds.length; i++) {
            if (supportedChainIds[i] == chainId) {
                supportedChainIds[i] = supportedChainIds[supportedChainIds.length - 1];
                supportedChainIds.pop();
                break;
            }
        }
        
        emit ChainRemoved(chainId);
    }
    
    /**
     * @dev 获取支持的区块链数量
     * @return 支持的区块链数量
     */
    function getSupportedChainCount() external view returns (uint256) {
        return supportedChainIds.length;
    }
    
    /**
     * @dev 获取支持的区块链ID列表
     * @return 支持的区块链ID列表
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        return supportedChainIds;
    }
    
    /**
     * @dev 映射跨链资产
     * @param sourceChainId 源链ID
     * @param targetChainId 目标链ID
     * @param sourceAsset 源资产地址
     * @param targetAsset 目标资产地址
     */
    function mapAsset(uint256 sourceChainId, uint256 targetChainId, address sourceAsset, address targetAsset) external onlyRole(ADMIN_ROLE) {
        require(bytes(chainIdToName[sourceChainId]).length > 0, "Source chain not supported");
        require(bytes(chainIdToName[targetChainId]).length > 0, "Target chain not supported");
        require(sourceAsset != address(0), "Invalid source asset");
        require(targetAsset != address(0), "Invalid target asset");
        
        assetMapping[sourceChainId][targetChainId][sourceAsset] = targetAsset;
        
        emit AssetMapped(sourceChainId, targetChainId, sourceAsset, targetAsset);
    }
    
    /**
     * @dev 注册链上资产
     * @param chainId 链ID
     * @param assetAddress 资产地址
     * @param assetType 资产类型
     * @param name 资产名称
     * @param symbol 资产符号
     * @param decimals 资产精度（如适用）
     */
    function registerAsset(
        uint256 chainId,
        address assetAddress,
        AssetType assetType,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(chainIdToName[chainId]).length > 0, "Chain not supported");
        require(assetAddress != address(0), "Invalid asset address");
        
        AssetInfo storage asset = assetRegistry[chainId][assetAddress];
        asset.assetAddress = assetAddress;
        asset.assetType = assetType;
        asset.name = name;
        asset.symbol = symbol;
        asset.decimals = decimals;
        asset.isVerified = true;
        
        emit AssetRegistered(chainId, assetAddress, assetType, name, symbol);
    }
    
    /**
     * @dev 验证资产是否已注册
     * @param chainId 链ID
     * @param assetAddress 资产地址
     * @return 资产是否已注册并验证
     */
    function isAssetVerified(uint256 chainId, address assetAddress) external view returns (bool) {
        return assetRegistry[chainId][assetAddress].isVerified;
    }
    
    /**
     * @dev 获取资产信息
     * @param chainId 链ID
     * @param assetAddress 资产地址
     * @return 资产信息
     */
    function getAssetInfo(uint256 chainId, address assetAddress) external view returns (AssetInfo memory) {
        return assetRegistry[chainId][assetAddress];
    }
    
    /**
     * @dev 获取映射的目标资产地址
     * @param sourceChainId 源链ID
     * @param targetChainId 目标链ID
     * @param sourceAsset 源资产地址
     * @return 目标资产地址
     */
    function getMappedAsset(uint256 sourceChainId, uint256 targetChainId, address sourceAsset) external view returns (address) {
        return assetMapping[sourceChainId][targetChainId][sourceAsset];
    }
    
    /**
     * @dev 发起跨链交易
     * @param targetChainId 目标链ID
     * @param sourceAsset 源资产地址
     * @param recipient 接收者地址
     * @param amount 金额
     * @return 交易哈希
     */
    function initiateTransaction(
        uint256 targetChainId,
        address sourceAsset,
        address recipient,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(chainIdToName[targetChainId]).length > 0, "Target chain not supported");
        require(sourceAsset != address(0), "Invalid source asset");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        // 获取当前链ID（在实际部署时需要根据环境确定）
        uint256 sourceChainId = block.chainid;
        
        // 获取映射的目标资产
        address targetAsset = assetMapping[sourceChainId][targetChainId][sourceAsset];
        require(targetAsset != address(0), "Asset mapping not found");
        
        // 生成交易哈希
        bytes32 txHash = keccak256(abi.encodePacked(
            sourceChainId,
            targetChainId,
            sourceAsset,
            targetAsset,
            msg.sender,
            recipient,
            amount,
            block.timestamp
        ));
        
        // 记录交易状态
        crossChainTxs[txHash] = TransactionStatus.Pending;
        
        // 根据资产类型处理资产锁定
        AssetInfo memory assetInfo = assetRegistry[sourceChainId][sourceAsset];
        if (assetInfo.assetType == AssetType.ERC20) {
            // 锁定ERC20代币
            IERC20(sourceAsset).transferFrom(msg.sender, address(this), amount);
        } else if (assetInfo.assetType == AssetType.ERC721) {
            // 锁定NFT
            IERC721(sourceAsset).transferFrom(msg.sender, address(this), amount);
        } else {
            revert("Unsupported asset type");
        }
        
        emit CrossChainTransactionInitiated(
            txHash,
            sourceChainId,
            targetChainId,
            sourceAsset,
            targetAsset,
            msg.sender,
            recipient,
            amount
        );
        
        return txHash;
    }
    
    /**
     * @dev 完成跨链交易（由桥接节点调用）
     * @param txHash 交易哈希
     * @param status 交易状态
     */
    function completeTransaction(bytes32 txHash, TransactionStatus status) external onlyRole(BRIDGE_ROLE) {
        require(crossChainTxs[txHash] == TransactionStatus.Pending, "Transaction not pending");
        
        crossChainTxs[txHash] = status;
        
        emit CrossChainTransactionCompleted(txHash, status);
    }
    
    /**
     * @dev 发送跨链消息
     * @param targetChainId 目标链ID
     * @param recipient 接收者地址
     * @param payload 消息负载
     * @return 消息ID
     */
    function sendMessage(
        uint256 targetChainId,
        address recipient,
        bytes memory payload
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(bytes(chainIdToName[targetChainId]).length > 0, "Target chain not supported");
        require(recipient != address(0), "Invalid recipient");
        
        // 获取当前链ID
        uint256 sourceChainId = block.chainid;
        
        // 生成消息ID
        bytes32 messageId = keccak256(abi.encodePacked(
            sourceChainId,
            targetChainId,
            msg.sender,
            recipient,
            payload,
            block.timestamp
        ));
        
        // 存储消息
        messageQueue[messageId] = CrossChainMessage({
            sourceChainId: sourceChainId,
            targetChainId: targetChainId,
            sender: msg.sender,
            recipient: recipient,
            payload: payload,
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        emit CrossChainMessageSent(messageId, sourceChainId, targetChainId, msg.sender, recipient);
        
        return messageId;
    }
    
    /**
     * @dev 处理跨链消息（由桥接节点调用）
     * @param messageId 消息ID
     * @param success 处理是否成功
     */
    function processMessage(bytes32 messageId, bool success) external onlyRole(BRIDGE_ROLE) {
        require(!messageQueue[messageId].isProcessed, "Message already processed");
        
        messageQueue[messageId].isProcessed = true;
        
        emit CrossChainMessageProcessed(messageId, success);
    }
    
    /**
     * @dev 获取跨链消息
     * @param messageId 消息ID
     * @return 跨链消息
     */
    function getMessage(bytes32 messageId) external view returns (CrossChainMessage memory) {
        return messageQueue[messageId];
    }
    
    /**
     * @dev 暂停合约（紧急情况）
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
     * @dev 紧急提取资产（仅限管理员）
     * @param token 代币地址（零地址表示原生代币）
     * @param to 接收地址
     * @param amount 金额
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            // 提取原生代币
            (bool success, ) = to.call{value: amount}("");
            require(success, "Native token transfer failed");
        } else {
            // 提取ERC20代币
            IERC20(token).transfer(to, amount);
        }
    }
    
    /**
     * @dev 接收原生代币
     */
    receive() external payable {}
}
