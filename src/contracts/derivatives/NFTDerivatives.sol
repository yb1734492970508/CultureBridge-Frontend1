// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./NFTPriceOracle.sol";

/**
 * @title NFTDerivatives
 * @dev 提供NFT衍生品交易功能，包括期权、期货和指数
 */
contract NFTDerivatives is ERC721Holder, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // 衍生品类型枚举
    enum DerivativeType {
        CALL_OPTION,    // 看涨期权
        PUT_OPTION,     // 看跌期权
        FUTURE,         // 期货
        INDEX           // 指数
    }
    
    // 衍生品状态枚举
    enum DerivativeStatus {
        ACTIVE,         // 活跃
        EXERCISED,      // 已行权
        EXPIRED,        // 已过期
        CANCELLED       // 已取消
    }
    
    // 衍生品信息结构
    struct Derivative {
        address creator;            // 创建者
        address buyer;              // 买家
        DerivativeType derivType;   // 衍生品类型
        address nftContract;        // NFT合约地址（对于期权和期货）
        uint256 tokenId;            // NFT的tokenId（对于期权和期货）
        address[] indexNFTContracts; // 指数包含的NFT合约地址数组（对于指数）
        uint256[] indexTokenIds;    // 指数包含的NFT的tokenId数组（对于指数）
        uint256[] indexWeights;     // 指数中各NFT的权重（对于指数）
        uint256 strikePrice;        // 行权价格（对于期权）
        uint256 premium;            // 期权费（对于期权）
        uint256 collateral;         // 抵押金额（对于期权和期货）
        uint256 expirationTime;     // 到期时间
        uint256 settlementPrice;    // 结算价格（对于期货和已行权的期权）
        DerivativeStatus status;    // 状态
        address paymentToken;       // 支付代币地址（address(0)表示ETH）
    }
    
    // 交易信息结构
    struct Trade {
        uint256 derivativeId;       // 衍生品ID
        address seller;             // 卖家
        address buyer;              // 买家
        uint256 price;              // 价格
        uint256 timestamp;          // 时间戳
    }
    
    // 映射存储
    mapping(uint256 => Derivative) public derivatives;                // 衍生品ID => 衍生品信息
    mapping(uint256 => Trade[]) private derivativeTrades;             // 衍生品ID => 交易历史
    mapping(address => uint256[]) private userDerivativesAsCreator;   // 用户地址 => 作为创建者的衍生品ID数组
    mapping(address => uint256[]) private userDerivativesAsBuyer;     // 用户地址 => 作为买家的衍生品ID数组
    
    // 价格预言机
    NFTPriceOracle public priceOracle;
    
    // 计数器
    Counters.Counter private _derivativeIdCounter;
    
    // 平台费用
    uint256 public platformFeePercent = 100; // 1%，以基点表示
    address public feeCollector;
    
    // 常量
    uint256 public constant BASIS_POINTS = 10000;  // 基点精度
    uint256 public constant MAX_INDEX_SIZE = 20;   // 指数最大包含NFT数量
    
    // 事件
    event DerivativeCreated(uint256 indexed derivativeId, address indexed creator, DerivativeType derivType);
    event DerivativePurchased(uint256 indexed derivativeId, address indexed buyer, uint256 price);
    event DerivativeExercised(uint256 indexed derivativeId, address indexed buyer, uint256 settlementPrice);
    event DerivativeExpired(uint256 indexed derivativeId);
    event DerivativeCancelled(uint256 indexed derivativeId);
    event IndexRebalanced(uint256 indexed derivativeId, uint256[] newWeights);
    
    /**
     * @dev 构造函数
     * @param _priceOracle 价格预言机地址
     * @param _feeCollector 费用收集地址
     * @param _owner 合约所有者地址
     */
    constructor(address _priceOracle, address _feeCollector, address _owner) {
        require(_priceOracle != address(0), "Invalid price oracle address");
        require(_feeCollector != address(0), "Invalid fee collector address");
        
        priceOracle = NFTPriceOracle(_priceOracle);
        feeCollector = _feeCollector;
        transferOwnership(_owner);
    }
    
    /**
     * @dev 创建看涨期权
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _strikePrice 行权价格
     * @param _premium 期权费
     * @param _expirationTime 到期时间
     * @param _paymentToken 支付代币地址（address(0)表示ETH）
     * @return derivativeId 衍生品ID
     */
    function createCallOption(
        address _nftContract,
        uint256 _tokenId,
        uint256 _strikePrice,
        uint256 _premium,
        uint256 _expirationTime,
        address _paymentToken
    ) external nonReentrant returns (uint256) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_expirationTime > block.timestamp, "Expiration time in the past");
        require(_strikePrice > 0, "Strike price must be greater than 0");
        
        // 检查调用者是否为NFT所有者
        IERC721 nftContract = IERC721(_nftContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // 将NFT转移到合约
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 创建衍生品记录
        uint256 derivativeId = _derivativeIdCounter.current();
        _derivativeIdCounter.increment();
        
        derivatives[derivativeId] = Derivative({
            creator: msg.sender,
            buyer: address(0),
            derivType: DerivativeType.CALL_OPTION,
            nftContract: _nftContract,
            tokenId: _tokenId,
            indexNFTContracts: new address[](0),
            indexTokenIds: new uint256[](0),
            indexWeights: new uint256[](0),
            strikePrice: _strikePrice,
            premium: _premium,
            collateral: 0,
            expirationTime: _expirationTime,
            settlementPrice: 0,
            status: DerivativeStatus.ACTIVE,
            paymentToken: _paymentToken
        });
        
        // 更新用户衍生品记录
        userDerivativesAsCreator[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, msg.sender, DerivativeType.CALL_OPTION);
        
        return derivativeId;
    }
    
    /**
     * @dev 创建看跌期权
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _strikePrice 行权价格
     * @param _premium 期权费
     * @param _expirationTime 到期时间
     * @param _paymentToken 支付代币地址（address(0)表示ETH）
     * @return derivativeId 衍生品ID
     */
    function createPutOption(
        address _nftContract,
        uint256 _tokenId,
        uint256 _strikePrice,
        uint256 _premium,
        uint256 _expirationTime,
        address _paymentToken
    ) external payable nonReentrant returns (uint256) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_expirationTime > block.timestamp, "Expiration time in the past");
        require(_strikePrice > 0, "Strike price must be greater than 0");
        
        // 检查抵押金额
        require(msg.value >= _strikePrice, "Insufficient collateral");
        
        // 创建衍生品记录
        uint256 derivativeId = _derivativeIdCounter.current();
        _derivativeIdCounter.increment();
        
        derivatives[derivativeId] = Derivative({
            creator: msg.sender,
            buyer: address(0),
            derivType: DerivativeType.PUT_OPTION,
            nftContract: _nftContract,
            tokenId: _tokenId,
            indexNFTContracts: new address[](0),
            indexTokenIds: new uint256[](0),
            indexWeights: new uint256[](0),
            strikePrice: _strikePrice,
            premium: _premium,
            collateral: msg.value,
            expirationTime: _expirationTime,
            settlementPrice: 0,
            status: DerivativeStatus.ACTIVE,
            paymentToken: _paymentToken
        });
        
        // 更新用户衍生品记录
        userDerivativesAsCreator[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, msg.sender, DerivativeType.PUT_OPTION);
        
        return derivativeId;
    }
    
    /**
     * @dev 创建期货
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _futurePrice 期货价格
     * @param _expirationTime 到期时间
     * @param _paymentToken 支付代币地址（address(0)表示ETH）
     * @return derivativeId 衍生品ID
     */
    function createFuture(
        address _nftContract,
        uint256 _tokenId,
        uint256 _futurePrice,
        uint256 _expirationTime,
        address _paymentToken
    ) external payable nonReentrant returns (uint256) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_expirationTime > block.timestamp, "Expiration time in the past");
        require(_futurePrice > 0, "Future price must be greater than 0");
        
        // 检查调用者是否为NFT所有者
        IERC721 nftContract = IERC721(_nftContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // 将NFT转移到合约
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 检查抵押金额
        require(msg.value >= _futurePrice / 10, "Insufficient collateral"); // 10%的抵押金
        
        // 创建衍生品记录
        uint256 derivativeId = _derivativeIdCounter.current();
        _derivativeIdCounter.increment();
        
        derivatives[derivativeId] = Derivative({
            creator: msg.sender,
            buyer: address(0),
            derivType: DerivativeType.FUTURE,
            nftContract: _nftContract,
            tokenId: _tokenId,
            indexNFTContracts: new address[](0),
            indexTokenIds: new uint256[](0),
            indexWeights: new uint256[](0),
            strikePrice: _futurePrice,
            premium: 0,
            collateral: msg.value,
            expirationTime: _expirationTime,
            settlementPrice: 0,
            status: DerivativeStatus.ACTIVE,
            paymentToken: _paymentToken
        });
        
        // 更新用户衍生品记录
        userDerivativesAsCreator[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, msg.sender, DerivativeType.FUTURE);
        
        return derivativeId;
    }
    
    /**
     * @dev 创建指数
     * @param _nftContracts NFT合约地址数组
     * @param _tokenIds NFT的tokenId数组
     * @param _weights 权重数组
     * @param _expirationTime 到期时间
     * @param _paymentToken 支付代币地址（address(0)表示ETH）
     * @return derivativeId 衍生品ID
     */
    function createIndex(
        address[] calldata _nftContracts,
        uint256[] calldata _tokenIds,
        uint256[] calldata _weights,
        uint256 _expirationTime,
        address _paymentToken
    ) external nonReentrant returns (uint256) {
        require(_nftContracts.length > 0, "Empty NFT contracts");
        require(_nftContracts.length == _tokenIds.length, "Arrays length mismatch");
        require(_nftContracts.length == _weights.length, "Arrays length mismatch");
        require(_nftContracts.length <= MAX_INDEX_SIZE, "Index size too large");
        require(_expirationTime > block.timestamp, "Expiration time in the past");
        
        // 检查权重总和是否为10000（100%）
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }
        require(totalWeight == BASIS_POINTS, "Weights must sum to 100%");
        
        // 创建衍生品记录
        uint256 derivativeId = _derivativeIdCounter.current();
        _derivativeIdCounter.increment();
        
        derivatives[derivativeId] = Derivative({
            creator: msg.sender,
            buyer: address(0),
            derivType: DerivativeType.INDEX,
            nftContract: address(0),
            tokenId: 0,
            indexNFTContracts: _nftContracts,
            indexTokenIds: _tokenIds,
            indexWeights: _weights,
            strikePrice: 0,
            premium: 0,
            collateral: 0,
            expirationTime: _expirationTime,
            settlementPrice: 0,
            status: DerivativeStatus.ACTIVE,
            paymentToken: _paymentToken
        });
        
        // 更新用户衍生品记录
        userDerivativesAsCreator[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, msg.sender, DerivativeType.INDEX);
        
        return derivativeId;
    }
    
    /**
     * @dev 购买衍生品
     * @param _derivativeId 衍生品ID
     */
    function purchaseDerivative(uint256 _derivativeId) external payable nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.creator != address(0), "Derivative does not exist");
        require(derivative.status == DerivativeStatus.ACTIVE, "Derivative not active");
        require(derivative.buyer == address(0), "Derivative already purchased");
        require(derivative.creator != msg.sender, "Cannot purchase own derivative");
        require(block.timestamp < derivative.expirationTime, "Derivative expired");
        
        uint256 price = derivative.premium;
        
        if (derivative.paymentToken == address(0)) {
            // ETH支付
            require(msg.value >= price, "Insufficient payment");
            
            // 计算平台费用
            uint256 platformFee = price * platformFeePercent / BASIS_POINTS;
            uint256 creatorAmount = price - platformFee;
            
            // 转移ETH
            payable(feeCollector).transfer(platformFee);
            payable(derivative.creator).transfer(creatorAmount);
            
            // 如果发送了多余的ETH，退还给买家
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
        } else {
            // ERC20代币支付
            IERC20 token = IERC20(derivative.paymentToken);
            
            // 转移代币
            require(token.transferFrom(msg.sender, address(this), price), "Token transfer failed");
            
            // 计算平台费用
            uint256 platformFee = price * platformFeePercent / BASIS_POINTS;
            uint256 creatorAmount = price - platformFee;
            
            // 分配代币
            token.transfer(feeCollector, platformFee);
            token.transfer(derivative.creator, creatorAmount);
        }
        
        // 更新衍生品信息
        derivative.buyer = msg.sender;
        
        // 更新用户衍生品记录
        userDerivativesAsBuyer[msg.sender].push(_derivativeId);
        
        // 记录交易
        derivativeTrades[_derivativeId].push(Trade({
            derivativeId: _derivativeId,
            seller: derivative.creator,
            buyer: msg.sender,
            price: price,
            timestamp: block.timestamp
        }));
        
        emit DerivativePurchased(_derivativeId, msg.sender, price);
    }
    
    /**
     * @dev 行权看涨期权
     * @param _derivativeId 衍生品ID
     */
    function exerciseCallOption(uint256 _derivativeId) external payable nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivType == DerivativeType.CALL_OPTION, "Not a call option");
        require(derivative.status == DerivativeStatus.ACTIVE, "Option not active");
        require(derivative.buyer == msg.sender, "Not option buyer");
        require(block.timestamp < derivative.expirationTime, "Option expired");
        
        if (derivative.paymentToken == address(0)) {
            // ETH支付
            require(msg.value >= derivative.strikePrice, "Insufficient payment");
            
            // 转移ETH给期权创建者
            payable(derivative.creator).transfer(derivative.strikePrice);
            
            // 如果发送了多余的ETH，退还给买家
            if (msg.value > derivative.strikePrice) {
                payable(msg.sender).transfer(msg.value - derivative.strikePrice);
            }
        } else {
            // ERC20代币支付
            IERC20 token = IERC20(derivative.paymentToken);
            require(token.transferFrom(msg.sender, derivative.creator, derivative.strikePrice), "Token transfer failed");
        }
        
        // 将NFT转移给买家
        IERC721(derivative.nftContract).safeTransferFrom(address(this), msg.sender, derivative.tokenId);
        
        // 获取当前NFT价格作为结算价格
        (uint256 nftPrice, ) = priceOracle.estimateNFTValue(derivative.nftContract, derivative.tokenId);
        derivative.settlementPrice = nftPrice;
        
        // 更新衍生品状态
        derivative.status = DerivativeStatus.EXERCISED;
        
        emit DerivativeExercised(_derivativeId, msg.sender, nftPrice);
    }
    
    /**
     * @dev 行权看跌期权
     * @param _derivativeId 衍生品ID
     */
    function exercisePutOption(uint256 _derivativeId) external nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivType == DerivativeType.PUT_OPTION, "Not a put option");
        require(derivative.status == DerivativeStatus.ACTIVE, "Option not active");
        require(derivative.buyer == msg.sender, "Not option buyer");
        require(block.timestamp < derivative.expirationTime, "Option expired");
        
        // 获取当前NFT价格
        (uint256 nftPrice, ) = priceOracle.estimateNFTValue(derivative.nftContract, derivative.tokenId);
        
        // 只有当前价格低于行权价格时才能行权
        require(nftPrice < derivative.strikePrice, "Current price above strike price");
        
        // 检查NFT所有权
        IERC721 nftContract = IERC721(derivative.nftContract);
        require(nftContract.ownerOf(derivative.tokenId) == msg.sender, "Not NFT owner");
        
        // 将NFT转移到合约
        nftContract.safeTransferFrom(msg.sender, address(this), derivative.tokenId);
        
        // 从抵押金中支付行权价格给买家
        payable(msg.sender).transfer(derivative.strikePrice);
        
        // 更新衍生品信息
        derivative.settlementPrice = nftPrice;
        derivative.status = DerivativeStatus.EXERCISED;
        
        emit DerivativeExercised(_derivativeId, msg.sender, nftPrice);
    }
    
    /**
     * @dev 结算期货
     * @param _derivativeId 衍生品ID
     */
    function settleFuture(uint256 _derivativeId) external nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivType == DerivativeType.FUTURE, "Not a future");
        require(derivative.status == DerivativeStatus.ACTIVE, "Future not active");
        require(derivative.buyer == msg.sender, "Not future buyer");
        require(block.timestamp >= derivative.expirationTime, "Future not expired yet");
        
        // 获取当前NFT价格作为结算价格
        (uint256 nftPrice, ) = priceOracle.estimateNFTValue(derivative.nftContract, derivative.tokenId);
        derivative.settlementPrice = nftPrice;
        
        if (derivative.paymentToken == address(0)) {
            // ETH支付
            // 买家支付期货价格减去已支付的抵押金
            uint256 remainingPayment = derivative.strikePrice - derivative.collateral;
            require(msg.value >= remainingPayment, "Insufficient payment");
            
            // 转移ETH给期货创建者
            payable(derivative.creator).transfer(derivative.strikePrice);
            
            // 如果发送了多余的ETH，退还给买家
            if (msg.value > remainingPayment) {
                payable(msg.sender).transfer(msg.value - remainingPayment);
            }
        } else {
            // ERC20代币支付
            IERC20 token = IERC20(derivative.paymentToken);
            require(token.transferFrom(msg.sender, derivative.creator, derivative.strikePrice), "Token transfer failed");
            
            // 退还抵押金
            payable(msg.sender).transfer(derivative.collateral);
        }
        
        // 将NFT转移给买家
        IERC721(derivative.nftContract).safeTransferFrom(address(this), msg.sender, derivative.tokenId);
        
        // 更新衍生品状态
        derivative.status = DerivativeStatus.EXERCISED;
        
        emit DerivativeExercised(_derivativeId, msg.sender, nftPrice);
    }
    
    /**
     * @dev 取消衍生品
     * @param _derivativeId 衍生品ID
     */
    function cancelDerivative(uint256 _derivativeId) external nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.creator == msg.sender || msg.sender == owner(), "Not authorized");
        require(derivative.status == DerivativeStatus.ACTIVE, "Derivative not active");
        require(derivative.buyer == address(0), "Derivative already purchased");
        
        // 根据衍生品类型处理资产返还
        if (derivative.derivType == DerivativeType.CALL_OPTION || derivative.derivType == DerivativeType.FUTURE) {
            // 返还NFT给创建者
            IERC721(derivative.nftContract).safeTransferFrom(address(this), derivative.creator, derivative.tokenId);
        }
        
        if (derivative.derivType == DerivativeType.PUT_OPTION || derivative.derivType == DerivativeType.FUTURE) {
            // 返还抵押金给创建者
            payable(derivative.creator).transfer(derivative.collateral);
        }
        
        // 更新衍生品状态
        derivative.status = DerivativeStatus.CANCELLED;
        
        emit DerivativeCancelled(_derivativeId);
    }
    
    /**
     * @dev 处理过期衍生品
     * @param _derivativeId 衍生品ID
     */
    function processExpiredDerivative(uint256 _derivativeId) external nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.status == DerivativeStatus.ACTIVE, "Derivative not active");
        require(block.timestamp >= derivative.expirationTime, "Derivative not expired yet");
        
        // 根据衍生品类型处理资产返还
        if (derivative.derivType == DerivativeType.CALL_OPTION) {
            // 返还NFT给创建者
            IERC721(derivative.nftContract).safeTransferFrom(address(this), derivative.creator, derivative.tokenId);
        } else if (derivative.derivType == DerivativeType.PUT_OPTION) {
            // 返还抵押金给创建者
            payable(derivative.creator).transfer(derivative.collateral);
        } else if (derivative.derivType == DerivativeType.FUTURE) {
            // 如果买家已购买但未结算，则返还NFT给创建者，抵押金给买家
            if (derivative.buyer != address(0)) {
                IERC721(derivative.nftContract).safeTransferFrom(address(this), derivative.creator, derivative.tokenId);
                payable(derivative.buyer).transfer(derivative.collateral);
            } else {
                // 如果未购买，则返还NFT和抵押金给创建者
                IERC721(derivative.nftContract).safeTransferFrom(address(this), derivative.creator, derivative.tokenId);
                payable(derivative.creator).transfer(derivative.collateral);
            }
        }
        
        // 更新衍生品状态
        derivative.status = DerivativeStatus.EXPIRED;
        
        emit DerivativeExpired(_derivativeId);
    }
    
    /**
     * @dev 重新平衡指数
     * @param _derivativeId 衍生品ID
     * @param _newWeights 新权重数组
     */
    function rebalanceIndex(uint256 _derivativeId, uint256[] calldata _newWeights) external nonReentrant {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivType == DerivativeType.INDEX, "Not an index");
        require(derivative.status == DerivativeStatus.ACTIVE, "Index not active");
        require(derivative.creator == msg.sender, "Not index creator");
        require(_newWeights.length == derivative.indexWeights.length, "Invalid weights length");
        
        // 检查权重总和是否为10000（100%）
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _newWeights.length; i++) {
            totalWeight += _newWeights[i];
        }
        require(totalWeight == BASIS_POINTS, "Weights must sum to 100%");
        
        // 更新权重
        derivative.indexWeights = _newWeights;
        
        emit IndexRebalanced(_derivativeId, _newWeights);
    }
    
    /**
     * @dev 获取用户作为创建者的衍生品ID列表
     * @param _user 用户地址
     * @return 衍生品ID数组
     */
    function getUserDerivativesAsCreator(address _user) external view returns (uint256[] memory) {
        return userDerivativesAsCreator[_user];
    }
    
    /**
     * @dev 获取用户作为买家的衍生品ID列表
     * @param _user 用户地址
     * @return 衍生品ID数组
     */
    function getUserDerivativesAsBuyer(address _user) external view returns (uint256[] memory) {
        return userDerivativesAsBuyer[_user];
    }
    
    /**
     * @dev 获取衍生品交易历史
     * @param _derivativeId 衍生品ID
     * @return 交易历史数组
     */
    function getDerivativeTrades(uint256 _derivativeId) external view returns (Trade[] memory) {
        return derivativeTrades[_derivativeId];
    }
    
    /**
     * @dev 获取衍生品总数
     * @return 衍生品总数
     */
    function getDerivativeCount() external view returns (uint256) {
        return _derivativeIdCounter.current();
    }
    
    /**
     * @dev 计算指数价值
     * @param _derivativeId 衍生品ID
     * @return indexValue 指数价值
     * @return confidence 置信度
     */
    function calculateIndexValue(uint256 _derivativeId) external view returns (uint256 indexValue, uint256 confidence) {
        Derivative storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivType == DerivativeType.INDEX, "Not an index");
        
        uint256 totalValue = 0;
        uint256 totalConfidence = 0;
        
        for (uint256 i = 0; i < derivative.indexNFTContracts.length; i++) {
            (uint256 nftValue, uint256 nftConfidence) = priceOracle.estimateNFTValue(
                derivative.indexNFTContracts[i],
                derivative.indexTokenIds[i]
            );
            
            totalValue += nftValue * derivative.indexWeights[i] / BASIS_POINTS;
            totalConfidence += nftConfidence * derivative.indexWeights[i] / BASIS_POINTS;
        }
        
        return (totalValue, totalConfidence);
    }
    
    /**
     * @dev 设置平台费用百分比
     * @param _platformFeePercent 平台费用百分比（基点）
     */
    function setPlatformFeePercent(uint256 _platformFeePercent) external onlyOwner {
        require(_platformFeePercent <= 500, "Fee too high"); // 最高5%
        platformFeePercent = _platformFeePercent;
    }
    
    /**
     * @dev 设置费用收集地址
     * @param _feeCollector 费用收集地址
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev 设置价格预言机地址
     * @param _priceOracle 价格预言机地址
     */
    function setPriceOracle(address _priceOracle) external onlyOwner {
        require(_priceOracle != address(0), "Invalid price oracle address");
        priceOracle = NFTPriceOracle(_priceOracle);
    }
    
    /**
     * @dev 紧急提取NFT（仅限合约所有者）
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _recipient 接收者地址
     */
    function emergencyWithdrawNFT(address _nftContract, uint256 _tokenId, address _recipient) external onlyOwner {
        IERC721(_nftContract).safeTransferFrom(address(this), _recipient, _tokenId);
    }
    
    /**
     * @dev 紧急提取ETH（仅限合约所有者）
     * @param _amount 提取金额
     * @param _recipient 接收者地址
     */
    function emergencyWithdrawETH(uint256 _amount, address _recipient) external onlyOwner {
        payable(_recipient).transfer(_amount);
    }
    
    /**
     * @dev 紧急提取ERC20代币（仅限合约所有者）
     * @param _token 代币合约地址
     * @param _amount 提取金额
     * @param _recipient 接收者地址
     */
    function emergencyWithdrawERC20(address _token, uint256 _amount, address _recipient) external onlyOwner {
        IERC20(_token).transfer(_recipient, _amount);
    }
    
    /**
     * @dev 接收ETH
     */
    receive() external payable {}
}
