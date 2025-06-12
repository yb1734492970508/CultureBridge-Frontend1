// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./NFTDerivatives.sol";
import "./NFTPriceOracle.sol";
import "./MultiChainAdapter.sol";

/**
 * @title LiquidityPool
 * @dev 为NFT衍生品市场提供流动性池功能
 * 支持NFT衍生品交易的流动性提供、自动做市和收益分配
 */
contract LiquidityPool is AccessControl, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // 流动性池状态
    struct PoolInfo {
        address tokenAddress;      // 池中代币地址
        uint256 totalLiquidity;    // 总流动性
        uint256 totalShares;       // 总份额
        uint256 feeRate;           // 交易手续费率 (基点，1% = 100)
        uint256 lastUpdateTime;    // 最后更新时间
        bool isActive;             // 池是否激活
    }
    
    // 用户在池中的状态
    struct UserInfo {
        uint256 shares;            // 用户份额
        uint256 rewardDebt;        // 奖励债务
    }
    
    // 交易对状态
    struct PairInfo {
        address baseToken;         // 基础代币
        address quoteToken;        // 报价代币
        uint256 baseReserve;       // 基础代币储备
        uint256 quoteReserve;      // 报价代币储备
        uint256 kValue;            // k值 (baseReserve * quoteReserve)
        uint256 lastTradeTime;     // 最后交易时间
        uint256 totalVolume;       // 总交易量
        uint256 feeCollected;      // 收取的手续费
    }
    
    // 跨链流动性信息
    struct CrossChainLiquidity {
        uint256 chainId;           // 链ID
        address remotePool;        // 远程池地址
        uint256 bridgedLiquidity;  // 桥接的流动性
        bool isActive;             // 是否激活
    }
    
    // 合约状态变量
    mapping(address => PoolInfo) public pools;                      // 代币地址 => 池信息
    mapping(address => mapping(address => UserInfo)) public users;  // 代币地址 => 用户地址 => 用户信息
    mapping(bytes32 => PairInfo) public pairs;                      // 交易对哈希 => 交易对信息
    mapping(uint256 => mapping(address => CrossChainLiquidity)) public crossChainLiquidity; // 链ID => 代币地址 => 跨链流动性
    
    address[] public supportedTokens;                               // 支持的代币列表
    bytes32[] public activePairs;                                   // 活跃交易对列表
    
    NFTDerivatives public nftDerivatives;                           // NFT衍生品合约
    NFTPriceOracle public priceOracle;                              // 价格预言机合约
    MultiChainAdapter public multiChainAdapter;                     // 跨链适配器合约
    
    uint256 public constant PRECISION = 1e18;                       // 精度
    uint256 public constant MAX_FEE_RATE = 1000;                    // 最大手续费率 (10%)
    
    // 事件定义
    event PoolCreated(address indexed token, uint256 initialLiquidity, uint256 feeRate);
    event PoolUpdated(address indexed token, uint256 newFeeRate, bool isActive);
    event LiquidityAdded(address indexed token, address indexed user, uint256 amount, uint256 shares);
    event LiquidityRemoved(address indexed token, address indexed user, uint256 amount, uint256 shares);
    event Swap(bytes32 indexed pairHash, address indexed user, address fromToken, address toToken, uint256 amountIn, uint256 amountOut);
    event PairCreated(bytes32 indexed pairHash, address baseToken, address quoteToken);
    event RewardsDistributed(address indexed token, uint256 amount);
    event CrossChainLiquidityAdded(uint256 indexed chainId, address indexed token, uint256 amount);
    event CrossChainLiquidityRemoved(uint256 indexed chainId, address indexed token, uint256 amount);
    
    /**
     * @dev 构造函数
     * @param _nftDerivatives NFT衍生品合约地址
     * @param _priceOracle 价格预言机合约地址
     * @param _multiChainAdapter 跨链适配器合约地址
     */
    constructor(
        address _nftDerivatives,
        address _priceOracle,
        address _multiChainAdapter
    ) {
        require(_nftDerivatives != address(0), "Invalid NFT derivatives address");
        require(_priceOracle != address(0), "Invalid price oracle address");
        require(_multiChainAdapter != address(0), "Invalid multi-chain adapter address");
        
        nftDerivatives = NFTDerivatives(_nftDerivatives);
        priceOracle = NFTPriceOracle(_priceOracle);
        multiChainAdapter = MultiChainAdapter(_multiChainAdapter);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev 创建流动性池
     * @param _token 代币地址
     * @param _initialLiquidity 初始流动性
     * @param _feeRate 手续费率 (基点)
     */
    function createPool(
        address _token,
        uint256 _initialLiquidity,
        uint256 _feeRate
    ) external onlyRole(MANAGER_ROLE) {
        require(_token != address(0), "Invalid token address");
        require(pools[_token].tokenAddress == address(0), "Pool already exists");
        require(_feeRate <= MAX_FEE_RATE, "Fee rate too high");
        
        // 创建池
        pools[_token] = PoolInfo({
            tokenAddress: _token,
            totalLiquidity: _initialLiquidity,
            totalShares: _initialLiquidity,
            feeRate: _feeRate,
            lastUpdateTime: block.timestamp,
            isActive: true
        });
        
        // 添加到支持的代币列表
        supportedTokens.push(_token);
        
        // 如果初始流动性大于0，则从创建者转移代币
        if (_initialLiquidity > 0) {
            IERC20(_token).transferFrom(msg.sender, address(this), _initialLiquidity);
            
            // 为创建者分配份额
            users[_token][msg.sender].shares = _initialLiquidity;
        }
        
        emit PoolCreated(_token, _initialLiquidity, _feeRate);
    }
    
    /**
     * @dev 更新流动性池参数
     * @param _token 代币地址
     * @param _feeRate 新的手续费率
     * @param _isActive 池是否激活
     */
    function updatePool(
        address _token,
        uint256 _feeRate,
        bool _isActive
    ) external onlyRole(MANAGER_ROLE) {
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        require(_feeRate <= MAX_FEE_RATE, "Fee rate too high");
        
        PoolInfo storage pool = pools[_token];
        pool.feeRate = _feeRate;
        pool.isActive = _isActive;
        pool.lastUpdateTime = block.timestamp;
        
        emit PoolUpdated(_token, _feeRate, _isActive);
    }
    
    /**
     * @dev 添加流动性
     * @param _token 代币地址
     * @param _amount 添加的金额
     * @return 分配的份额
     */
    function addLiquidity(address _token, uint256 _amount) external nonReentrant whenNotPaused returns (uint256) {
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        require(pools[_token].isActive, "Pool is not active");
        require(_amount > 0, "Amount must be greater than 0");
        
        PoolInfo storage pool = pools[_token];
        UserInfo storage user = users[_token][msg.sender];
        
        // 计算份额
        uint256 shares;
        if (pool.totalShares == 0 || pool.totalLiquidity == 0) {
            shares = _amount;
        } else {
            shares = _amount.mul(pool.totalShares).div(pool.totalLiquidity);
        }
        
        require(shares > 0, "Shares must be greater than 0");
        
        // 更新状态
        pool.totalLiquidity = pool.totalLiquidity.add(_amount);
        pool.totalShares = pool.totalShares.add(shares);
        user.shares = user.shares.add(shares);
        
        // 转移代币
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        emit LiquidityAdded(_token, msg.sender, _amount, shares);
        
        return shares;
    }
    
    /**
     * @dev 移除流动性
     * @param _token 代币地址
     * @param _shares 移除的份额
     * @return 返回的金额
     */
    function removeLiquidity(address _token, uint256 _shares) external nonReentrant returns (uint256) {
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        
        PoolInfo storage pool = pools[_token];
        UserInfo storage user = users[_token][msg.sender];
        
        require(user.shares >= _shares, "Insufficient shares");
        
        // 计算金额
        uint256 amount = _shares.mul(pool.totalLiquidity).div(pool.totalShares);
        
        // 更新状态
        pool.totalLiquidity = pool.totalLiquidity.sub(amount);
        pool.totalShares = pool.totalShares.sub(_shares);
        user.shares = user.shares.sub(_shares);
        
        // 转移代币
        IERC20(_token).transfer(msg.sender, amount);
        
        emit LiquidityRemoved(_token, msg.sender, amount, _shares);
        
        return amount;
    }
    
    /**
     * @dev 创建交易对
     * @param _baseToken 基础代币地址
     * @param _quoteToken 报价代币地址
     * @return 交易对哈希
     */
    function createPair(address _baseToken, address _quoteToken) external onlyRole(MANAGER_ROLE) returns (bytes32) {
        require(_baseToken != address(0) && _quoteToken != address(0), "Invalid token addresses");
        require(_baseToken != _quoteToken, "Identical tokens");
        require(pools[_baseToken].tokenAddress != address(0), "Base token pool does not exist");
        require(pools[_quoteToken].tokenAddress != address(0), "Quote token pool does not exist");
        
        // 生成交易对哈希
        bytes32 pairHash = keccak256(abi.encodePacked(_baseToken, _quoteToken));
        
        // 确保交易对不存在
        require(pairs[pairHash].baseToken == address(0), "Pair already exists");
        
        // 创建交易对
        pairs[pairHash] = PairInfo({
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            baseReserve: 0,
            quoteReserve: 0,
            kValue: 0,
            lastTradeTime: 0,
            totalVolume: 0,
            feeCollected: 0
        });
        
        // 添加到活跃交易对列表
        activePairs.push(pairHash);
        
        emit PairCreated(pairHash, _baseToken, _quoteToken);
        
        return pairHash;
    }
    
    /**
     * @dev 初始化交易对流动性
     * @param _pairHash 交易对哈希
     * @param _baseAmount 基础代币金额
     * @param _quoteAmount 报价代币金额
     */
    function initializePairLiquidity(
        bytes32 _pairHash,
        uint256 _baseAmount,
        uint256 _quoteAmount
    ) external onlyRole(MANAGER_ROLE) {
        PairInfo storage pair = pairs[_pairHash];
        require(pair.baseToken != address(0), "Pair does not exist");
        require(pair.baseReserve == 0 && pair.quoteReserve == 0, "Pair already initialized");
        require(_baseAmount > 0 && _quoteAmount > 0, "Amounts must be greater than 0");
        
        // 更新交易对状态
        pair.baseReserve = _baseAmount;
        pair.quoteReserve = _quoteAmount;
        pair.kValue = _baseAmount.mul(_quoteAmount);
        pair.lastTradeTime = block.timestamp;
        
        // 转移代币
        IERC20(pair.baseToken).transferFrom(msg.sender, address(this), _baseAmount);
        IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), _quoteAmount);
    }
    
    /**
     * @dev 交换代币
     * @param _pairHash 交易对哈希
     * @param _fromToken 源代币地址
     * @param _toToken 目标代币地址
     * @param _amountIn 输入金额
     * @param _minAmountOut 最小输出金额
     * @return 输出金额
     */
    function swap(
        bytes32 _pairHash,
        address _fromToken,
        address _toToken,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256) {
        PairInfo storage pair = pairs[_pairHash];
        require(pair.baseToken != address(0), "Pair does not exist");
        require(
            (_fromToken == pair.baseToken && _toToken == pair.quoteToken) ||
            (_fromToken == pair.quoteToken && _toToken == pair.baseToken),
            "Invalid token pair"
        );
        require(_amountIn > 0, "Amount in must be greater than 0");
        
        // 计算输出金额
        uint256 amountOut;
        uint256 feeAmount;
        
        if (_fromToken == pair.baseToken) {
            // 基础代币 -> 报价代币
            feeAmount = _amountIn.mul(pools[_fromToken].feeRate).div(10000);
            uint256 amountInAfterFee = _amountIn.sub(feeAmount);
            
            // 使用恒定乘积公式计算输出金额
            amountOut = pair.quoteReserve.mul(amountInAfterFee).div(pair.baseReserve.add(amountInAfterFee));
            
            // 更新储备
            pair.baseReserve = pair.baseReserve.add(amountInAfterFee);
            pair.quoteReserve = pair.quoteReserve.sub(amountOut);
        } else {
            // 报价代币 -> 基础代币
            feeAmount = _amountIn.mul(pools[_fromToken].feeRate).div(10000);
            uint256 amountInAfterFee = _amountIn.sub(feeAmount);
            
            // 使用恒定乘积公式计算输出金额
            amountOut = pair.baseReserve.mul(amountInAfterFee).div(pair.quoteReserve.add(amountInAfterFee));
            
            // 更新储备
            pair.quoteReserve = pair.quoteReserve.add(amountInAfterFee);
            pair.baseReserve = pair.baseReserve.sub(amountOut);
        }
        
        // 验证输出金额
        require(amountOut >= _minAmountOut, "Insufficient output amount");
        
        // 更新交易对状态
        pair.kValue = pair.baseReserve.mul(pair.quoteReserve);
        pair.lastTradeTime = block.timestamp;
        pair.totalVolume = pair.totalVolume.add(_amountIn);
        pair.feeCollected = pair.feeCollected.add(feeAmount);
        
        // 转移代币
        IERC20(_fromToken).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_toToken).transfer(msg.sender, amountOut);
        
        emit Swap(_pairHash, msg.sender, _fromToken, _toToken, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev 获取交换报价
     * @param _pairHash 交易对哈希
     * @param _fromToken 源代币地址
     * @param _toToken 目标代币地址
     * @param _amountIn 输入金额
     * @return 输出金额
     */
    function getSwapQuote(
        bytes32 _pairHash,
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) external view returns (uint256) {
        PairInfo storage pair = pairs[_pairHash];
        require(pair.baseToken != address(0), "Pair does not exist");
        require(
            (_fromToken == pair.baseToken && _toToken == pair.quoteToken) ||
            (_fromToken == pair.quoteToken && _toToken == pair.baseToken),
            "Invalid token pair"
        );
        
        // 计算输出金额
        uint256 amountOut;
        
        if (_fromToken == pair.baseToken) {
            // 基础代币 -> 报价代币
            uint256 feeAmount = _amountIn.mul(pools[_fromToken].feeRate).div(10000);
            uint256 amountInAfterFee = _amountIn.sub(feeAmount);
            
            amountOut = pair.quoteReserve.mul(amountInAfterFee).div(pair.baseReserve.add(amountInAfterFee));
        } else {
            // 报价代币 -> 基础代币
            uint256 feeAmount = _amountIn.mul(pools[_fromToken].feeRate).div(10000);
            uint256 amountInAfterFee = _amountIn.sub(feeAmount);
            
            amountOut = pair.baseReserve.mul(amountInAfterFee).div(pair.quoteReserve.add(amountInAfterFee));
        }
        
        return amountOut;
    }
    
    /**
     * @dev 分配奖励
     * @param _token 代币地址
     * @param _amount 奖励金额
     */
    function distributeRewards(address _token, uint256 _amount) external onlyRole(OPERATOR_ROLE) {
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        PoolInfo storage pool = pools[_token];
        
        // 转移奖励代币到合约
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        // 更新池状态
        pool.totalLiquidity = pool.totalLiquidity.add(_amount);
        
        emit RewardsDistributed(_token, _amount);
    }
    
    /**
     * @dev 添加跨链流动性
     * @param _chainId 目标链ID
     * @param _token 代币地址
     * @param _remotePool 远程池地址
     * @param _amount 金额
     */
    function addCrossChainLiquidity(
        uint256 _chainId,
        address _token,
        address _remotePool,
        uint256 _amount
    ) external onlyRole(MANAGER_ROLE) {
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        // 获取或创建跨链流动性记录
        CrossChainLiquidity storage ccl = crossChainLiquidity[_chainId][_token];
        
        if (ccl.chainId == 0) {
            // 新建记录
            ccl.chainId = _chainId;
            ccl.remotePool = _remotePool;
            ccl.bridgedLiquidity = _amount;
            ccl.isActive = true;
        } else {
            // 更新记录
            ccl.bridgedLiquidity = ccl.bridgedLiquidity.add(_amount);
            ccl.isActive = true;
        }
        
        // 通过跨链适配器发送流动性
        IERC20(_token).approve(address(multiChainAdapter), _amount);
        
        // 调用跨链适配器发起跨链交易
        multiChainAdapter.initiateTransaction(
            _chainId,
            _token,
            _remotePool,
            _amount
        );
        
        emit CrossChainLiquidityAdded(_chainId, _token, _amount);
    }
    
    /**
     * @dev 移除跨链流动性
     * @param _chainId 目标链ID
     * @param _token 代币地址
     * @param _amount 金额
     */
    function removeCrossChainLiquidity(
        uint256 _chainId,
        address _token,
        uint256 _amount
    ) external onlyRole(MANAGER_ROLE) {
        CrossChainLiquidity storage ccl = crossChainLiquidity[_chainId][_token];
        require(ccl.chainId != 0, "Cross-chain liquidity does not exist");
        require(ccl.bridgedLiquidity >= _amount, "Insufficient bridged liquidity");
        
        // 更新记录
        ccl.bridgedLiquidity = ccl.bridgedLiquidity.sub(_amount);
        
        // 如果桥接流动性为0，则设置为非活跃
        if (ccl.bridgedLiquidity == 0) {
            ccl.isActive = false;
        }
        
        // 发送消息到远程池
        bytes memory payload = abi.encodeWithSignature(
            "receiveCrossChainLiquidity(address,uint256)",
            _token,
            _amount
        );
        
        multiChainAdapter.sendMessage(
            _chainId,
            ccl.remotePool,
            payload
        );
        
        emit CrossChainLiquidityRemoved(_chainId, _token, _amount);
    }
    
    /**
     * @dev 接收跨链流动性
     * @param _token 代币地址
     * @param _amount 金额
     */
    function receiveCrossChainLiquidity(
        address _token,
        uint256 _amount
    ) external {
        // 只允许跨链适配器调用
        require(msg.sender == address(multiChainAdapter), "Caller is not multi-chain adapter");
        
        // 验证池存在
        require(pools[_token].tokenAddress != address(0), "Pool does not exist");
        
        // 更新池状态
        PoolInfo storage pool = pools[_token];
        pool.totalLiquidity = pool.totalLiquidity.add(_amount);
    }
    
    /**
     * @dev 获取用户流动性份额
     * @param _token 代币地址
     * @param _user 用户地址
     * @return 用户份额和对应的流动性金额
     */
    function getUserLiquidity(address _token, address _user) external view returns (uint256, uint256) {
        PoolInfo storage pool = pools[_token];
        UserInfo storage user = users[_token][_user];
        
        if (pool.totalShares == 0) {
            return (0, 0);
        }
        
        uint256 liquidity = user.shares.mul(pool.totalLiquidity).div(pool.totalShares);
        
        return (user.shares, liquidity);
    }
    
    /**
     * @dev 获取交易对信息
     * @param _pairHash 交易对哈希
     * @return 基础代币地址、报价代币地址、基础代币储备、报价代币储备、k值
     */
    function getPairInfo(bytes32 _pairHash) external view returns (
        address,
        address,
        uint256,
        uint256,
        uint256
    ) {
        PairInfo storage pair = pairs[_pairHash];
        return (
            pair.baseToken,
            pair.quoteToken,
            pair.baseReserve,
            pair.quoteReserve,
            pair.kValue
        );
    }
    
    /**
     * @dev 获取支持的代币数量
     * @return 支持的代币数量
     */
    function getSupportedTokenCount() external view returns (uint256) {
        return supportedTokens.length;
    }
    
    /**
     * @dev 获取活跃交易对数量
     * @return 活跃交易对数量
     */
    function getActivePairCount() external view returns (uint256) {
        return activePairs.length;
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev 紧急提取代币
     * @param _token 代币地址
     * @param _to 接收地址
     * @param _amount 金额
     */
    function emergencyWithdraw(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_to != address(0), "Invalid recipient");
        
        IERC20(_token).transfer(_to, _amount);
    }
}
