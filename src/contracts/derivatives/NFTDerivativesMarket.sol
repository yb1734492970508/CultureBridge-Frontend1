// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTDerivativesMarket
 * @dev 管理NFT衍生品市场的主合约，包括分数化、租赁、借贷和衍生品交易功能
 */
contract NFTDerivativesMarket is ERC721Holder, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // 计数器
    Counters.Counter private _fractionIds;
    Counters.Counter private _rentalIds;
    Counters.Counter private _loanIds;
    Counters.Counter private _derivativeIds;

    // 费用设置
    uint256 public platformFeePercent = 250; // 2.5%，以基点表示
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000; // 100%

    // 价格预言机地址
    address public priceOracle;

    // 跨链适配器地址
    address public multiChainAdapter;

    // 声誉系统地址
    address public reputationSystem;

    // 分数化NFT结构
    struct FractionInfo {
        address originalOwner;
        address nftContract;
        uint256 tokenId;
        address fractionToken; // ERC20代币地址
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 reservePrice;
        bool active;
    }

    // 租赁信息结构
    struct RentalInfo {
        address lessor;
        address renter;
        address nftContract;
        uint256 tokenId;
        uint256 rentalFee;
        uint256 duration;
        uint256 startTime;
        uint256 collateral;
        bool revenueSharing;
        uint8 revenueShare; // 所有者的分成比例，0-100
        bool active;
    }

    // 贷款信息结构
    struct LoanInfo {
        address borrower;
        address lender;
        address nftContract;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestRate; // 年化利率，以基点表示
        uint256 duration;
        uint256 startTime;
        uint256 collateralValue;
        LoanStatus status;
    }

    // 衍生品信息结构
    struct DerivativeInfo {
        DerivativeType derivativeType;
        address creator;
        address currentOwner;
        address underlyingAsset; // NFT合约地址或其他资产
        uint256 assetId; // NFT的tokenId或其他标识
        uint256 strikePrice; // 对于期权
        uint256 expiry; // 到期时间戳
        bool isCall; // 对于期权，true=看涨，false=看跌
        DerivativeStatus status;
        address derivativeToken; // 对于指数，ERC20代币地址
    }

    // 贷款状态枚举
    enum LoanStatus { Created, Active, Repaid, Defaulted, Liquidated }

    // 衍生品类型枚举
    enum DerivativeType { Option, Future, Index }

    // 衍生品状态枚举
    enum DerivativeStatus { Active, Exercised, Expired }

    // 映射存储
    mapping(uint256 => FractionInfo) public fractions;
    mapping(uint256 => RentalInfo) public rentals;
    mapping(uint256 => LoanInfo) public loans;
    mapping(uint256 => DerivativeInfo) public derivatives;

    // 用户映射
    mapping(address => uint256[]) private userFractions;
    mapping(address => uint256[]) private userRentalsAsLessor;
    mapping(address => uint256[]) private userRentalsAsRenter;
    mapping(address => uint256[]) private userLoansAsBorrower;
    mapping(address => uint256[]) private userLoansAsLender;
    mapping(address => uint256[]) private userDerivatives;

    // 事件
    event FractionCreated(uint256 fractionId, address indexed originalOwner, address indexed nftContract, uint256 indexed tokenId, address tokenAddress, string name, string symbol, uint256 totalSupply);
    event FractionBuyout(uint256 fractionId, address indexed buyer);
    
    event RentalCreated(uint256 rentalId, address indexed lessor, address indexed nftContract, uint256 indexed tokenId, uint256 rentalFee, uint256 duration);
    event RentalStarted(uint256 rentalId, address indexed renter, uint256 startTime);
    event RentalEnded(uint256 rentalId);
    
    event LoanRequestCreated(uint256 loanId, address indexed borrower, address indexed nftContract, uint256 indexed tokenId, uint256 loanAmount, uint256 interestRate, uint256 duration);
    event LoanFunded(uint256 loanId, address indexed lender);
    event LoanRepaid(uint256 loanId);
    event LoanLiquidated(uint256 loanId);
    
    event DerivativeCreated(uint256 derivativeId, DerivativeType indexed derivativeType, address indexed creator, address indexed underlyingAsset, uint256 assetId);
    event DerivativeTransferred(uint256 derivativeId, address indexed from, address indexed to);
    event DerivativeExercised(uint256 derivativeId);
    event DerivativeExpired(uint256 derivativeId);

    /**
     * @dev 构造函数
     * @param _owner 合约所有者地址
     */
    constructor(address _owner) {
        transferOwnership(_owner);
    }

    /**
     * @dev 设置平台费用百分比
     * @param _feePercent 新的费用百分比（以基点表示）
     */
    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_FEE, "Fee too high");
        platformFeePercent = _feePercent;
    }

    /**
     * @dev 设置价格预言机地址
     * @param _priceOracle 新的价格预言机地址
     */
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = _priceOracle;
    }

    /**
     * @dev 设置跨链适配器地址
     * @param _multiChainAdapter 新的跨链适配器地址
     */
    function setMultiChainAdapter(address _multiChainAdapter) external onlyOwner {
        multiChainAdapter = _multiChainAdapter;
    }

    /**
     * @dev 设置声誉系统地址
     * @param _reputationSystem 新的声誉系统地址
     */
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = _reputationSystem;
    }

    /**
     * @dev 分数化NFT
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _name 分数代币名称
     * @param _symbol 分数代币符号
     * @param _totalSupply 分数代币总供应量
     * @param _reservePrice 回购价格
     * @return fractionId 分数化ID
     * @return tokenAddress 分数代币地址
     */
    function fractionalize(
        address _nftContract,
        uint256 _tokenId,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _reservePrice
    ) external nonReentrant returns (uint256 fractionId, address tokenAddress) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_totalSupply > 0, "Invalid supply");
        
        // 转移NFT到合约
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 创建ERC20代币（这里简化处理，实际实现需要部署新合约）
        // tokenAddress = _deployFractionToken(_name, _symbol, _totalSupply);
        tokenAddress = address(0); // 占位，实际实现需要部署代币合约
        
        // 记录分数化信息
        _fractionIds.increment();
        fractionId = _fractionIds.current();
        
        fractions[fractionId] = FractionInfo({
            originalOwner: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            fractionToken: tokenAddress,
            name: _name,
            symbol: _symbol,
            totalSupply: _totalSupply,
            reservePrice: _reservePrice,
            active: true
        });
        
        userFractions[msg.sender].push(fractionId);
        
        emit FractionCreated(fractionId, msg.sender, _nftContract, _tokenId, tokenAddress, _name, _symbol, _totalSupply);
        
        return (fractionId, tokenAddress);
    }

    /**
     * @dev 创建NFT租赁
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _rentalFee 租金
     * @param _duration 租期（秒）
     * @param _collateral 押金
     * @param _revenueSharing 是否启用收益分成
     * @param _revenueShare 所有者的分成比例（0-100）
     * @return rentalId 租赁ID
     */
    function createRental(
        address _nftContract,
        uint256 _tokenId,
        uint256 _rentalFee,
        uint256 _duration,
        uint256 _collateral,
        bool _revenueSharing,
        uint8 _revenueShare
    ) external nonReentrant returns (uint256 rentalId) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_duration > 0, "Invalid duration");
        require(!_revenueSharing || _revenueShare <= 100, "Invalid revenue share");
        
        // 转移NFT到合约
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 记录租赁信息
        _rentalIds.increment();
        rentalId = _rentalIds.current();
        
        rentals[rentalId] = RentalInfo({
            lessor: msg.sender,
            renter: address(0),
            nftContract: _nftContract,
            tokenId: _tokenId,
            rentalFee: _rentalFee,
            duration: _duration,
            startTime: 0,
            collateral: _collateral,
            revenueSharing: _revenueSharing,
            revenueShare: _revenueShare,
            active: true
        });
        
        userRentalsAsLessor[msg.sender].push(rentalId);
        
        emit RentalCreated(rentalId, msg.sender, _nftContract, _tokenId, _rentalFee, _duration);
        
        return rentalId;
    }

    /**
     * @dev 开始租赁
     * @param _rentalId 租赁ID
     */
    function startRental(uint256 _rentalId) external payable nonReentrant {
        RentalInfo storage rental = rentals[_rentalId];
        
        require(rental.active, "Rental not active");
        require(rental.renter == address(0), "Already rented");
        require(msg.value >= rental.rentalFee + rental.collateral, "Insufficient payment");
        
        // 更新租赁信息
        rental.renter = msg.sender;
        rental.startTime = block.timestamp;
        
        // 转账租金给出租人
        payable(rental.lessor).transfer(rental.rentalFee);
        
        userRentalsAsRenter[msg.sender].push(_rentalId);
        
        emit RentalStarted(_rentalId, msg.sender, block.timestamp);
    }

    /**
     * @dev 创建贷款请求
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _loanAmount 贷款金额
     * @param _interestRate 年化利率（以基点表示）
     * @param _duration 贷款期限（秒）
     * @return loanId 贷款ID
     */
    function createLoanRequest(
        address _nftContract,
        uint256 _tokenId,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _duration
    ) external nonReentrant returns (uint256 loanId) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_loanAmount > 0, "Invalid loan amount");
        require(_duration > 0, "Invalid duration");
        
        // 转移NFT到合约
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 记录贷款信息
        _loanIds.increment();
        loanId = _loanIds.current();
        
        loans[loanId] = LoanInfo({
            borrower: msg.sender,
            lender: address(0),
            nftContract: _nftContract,
            tokenId: _tokenId,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            startTime: 0,
            collateralValue: 0, // 实际实现需要从预言机获取
            status: LoanStatus.Created
        });
        
        userLoansAsBorrower[msg.sender].push(loanId);
        
        emit LoanRequestCreated(loanId, msg.sender, _nftContract, _tokenId, _loanAmount, _interestRate, _duration);
        
        return loanId;
    }

    /**
     * @dev 提供贷款
     * @param _loanId 贷款ID
     */
    function fundLoan(uint256 _loanId) external payable nonReentrant {
        LoanInfo storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.Created, "Loan not available");
        require(msg.value >= loan.loanAmount, "Insufficient funds");
        
        // 更新贷款信息
        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.status = LoanStatus.Active;
        
        // 转账给借款人
        payable(loan.borrower).transfer(loan.loanAmount);
        
        userLoansAsLender[msg.sender].push(_loanId);
        
        emit LoanFunded(_loanId, msg.sender);
    }

    /**
     * @dev 创建NFT期权
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _strikePrice 行权价格
     * @param _expiry 到期时间戳
     * @param _isCall 是否为看涨期权
     * @return derivativeId 衍生品ID
     */
    function createOption(
        address _nftContract,
        uint256 _tokenId,
        uint256 _strikePrice,
        uint256 _expiry,
        bool _isCall
    ) external nonReentrant returns (uint256 derivativeId) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_expiry > block.timestamp, "Invalid expiry");
        require(_strikePrice > 0, "Invalid strike price");
        
        // 如果是看涨期权，需要转入资金；如果是看跌期权，需要转入NFT
        if (_isCall) {
            // 实际实现需要处理资金转入
        } else {
            IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        }
        
        // 记录衍生品信息
        _derivativeIds.increment();
        derivativeId = _derivativeIds.current();
        
        derivatives[derivativeId] = DerivativeInfo({
            derivativeType: DerivativeType.Option,
            creator: msg.sender,
            currentOwner: msg.sender,
            underlyingAsset: _nftContract,
            assetId: _tokenId,
            strikePrice: _strikePrice,
            expiry: _expiry,
            isCall: _isCall,
            status: DerivativeStatus.Active,
            derivativeToken: address(0)
        });
        
        userDerivatives[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, DerivativeType.Option, msg.sender, _nftContract, _tokenId);
        
        return derivativeId;
    }

    /**
     * @dev 创建NFT指数
     * @param _name 指数名称
     * @param _symbol 指数符号
     * @param _nftContracts NFT合约地址数组
     * @param _tokenIds NFT的tokenId数组
     * @param _weights 权重数组
     * @return derivativeId 衍生品ID
     * @return tokenAddress 指数代币地址
     */
    function createIndex(
        string memory _name,
        string memory _symbol,
        address[] memory _nftContracts,
        uint256[] memory _tokenIds,
        uint256[] memory _weights
    ) external nonReentrant returns (uint256 derivativeId, address tokenAddress) {
        require(_nftContracts.length > 0, "Empty NFT list");
        require(_nftContracts.length == _tokenIds.length && _tokenIds.length == _weights.length, "Array length mismatch");
        
        // 转移所有NFT到合约
        for (uint i = 0; i < _nftContracts.length; i++) {
            IERC721(_nftContracts[i]).safeTransferFrom(msg.sender, address(this), _tokenIds[i]);
        }
        
        // 创建ERC20代币（这里简化处理，实际实现需要部署新合约）
        // tokenAddress = _deployIndexToken(_name, _symbol);
        tokenAddress = address(0); // 占位，实际实现需要部署代币合约
        
        // 记录衍生品信息
        _derivativeIds.increment();
        derivativeId = _derivativeIds.current();
        
        derivatives[derivativeId] = DerivativeInfo({
            derivativeType: DerivativeType.Index,
            creator: msg.sender,
            currentOwner: msg.sender,
            underlyingAsset: address(0), // 多个资产，不使用此字段
            assetId: 0, // 多个资产，不使用此字段
            strikePrice: 0, // 不适用于指数
            expiry: 0, // 指数没有到期时间
            isCall: false, // 不适用于指数
            status: DerivativeStatus.Active,
            derivativeToken: tokenAddress
        });
        
        userDerivatives[msg.sender].push(derivativeId);
        
        emit DerivativeCreated(derivativeId, DerivativeType.Index, msg.sender, address(0), 0);
        
        return (derivativeId, tokenAddress);
    }

    /**
     * @dev 行使期权
     * @param _derivativeId 衍生品ID
     */
    function exerciseOption(uint256 _derivativeId) external payable nonReentrant {
        DerivativeInfo storage derivative = derivatives[_derivativeId];
        
        require(derivative.derivativeType == DerivativeType.Option, "Not an option");
        require(derivative.currentOwner == msg.sender, "Not option owner");
        require(derivative.status == DerivativeStatus.Active, "Option not active");
        require(block.timestamp < derivative.expiry, "Option expired");
        
        if (derivative.isCall) {
            // 看涨期权：支付行权价格，获得NFT
            require(msg.value >= derivative.strikePrice, "Insufficient payment");
            
            // 转移NFT给期权持有者
            IERC721(derivative.underlyingAsset).safeTransferFrom(address(this), msg.sender, derivative.assetId);
            
            // 转移行权价格给期权创建者
            payable(derivative.creator).transfer(derivative.strikePrice);
        } else {
            // 看跌期权：转入NFT，获得行权价格
            IERC721(derivative.underlyingAsset).safeTransferFrom(msg.sender, address(this), derivative.assetId);
            
            // 转移行权价格给期权持有者
            payable(msg.sender).transfer(derivative.strikePrice);
        }
        
        // 更新期权状态
        derivative.status = DerivativeStatus.Exercised;
        
        emit DerivativeExercised(_derivativeId);
    }

    /**
     * @dev 获取用户的分数化NFT列表
     * @param _user 用户地址
     * @return 分数化NFT ID数组
     */
    function getUserFractions(address _user) external view returns (uint256[] memory) {
        return userFractions[_user];
    }

    /**
     * @dev 获取用户作为出租人的租赁列表
     * @param _user 用户地址
     * @return 租赁ID数组
     */
    function getUserRentalsAsLessor(address _user) external view returns (uint256[] memory) {
        return userRentalsAsLessor[_user];
    }

    /**
     * @dev 获取用户作为租户的租赁列表
     * @param _user 用户地址
     * @return 租赁ID数组
     */
    function getUserRentalsAsRenter(address _user) external view returns (uint256[] memory) {
        return userRentalsAsRenter[_user];
    }

    /**
     * @dev 获取用户作为借款人的贷款列表
     * @param _user 用户地址
     * @return 贷款ID数组
     */
    function getUserLoansAsBorrower(address _user) external view returns (uint256[] memory) {
        return userLoansAsBorrower[_user];
    }

    /**
     * @dev 获取用户作为贷款人的贷款列表
     * @param _user 用户地址
     * @return 贷款ID数组
     */
    function getUserLoansAsLender(address _user) external view returns (uint256[] memory) {
        return userLoansAsLender[_user];
    }

    /**
     * @dev 获取用户的衍生品列表
     * @param _user 用户地址
     * @return 衍生品ID数组
     */
    function getUserDerivatives(address _user) external view returns (uint256[] memory) {
        return userDerivatives[_user];
    }

    /**
     * @dev 提取平台费用
     * @param _token 代币地址，address(0)表示原生代币
     */
    function withdrawFees(address _token) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20 token = IERC20(_token);
            token.transfer(owner(), token.balanceOf(address(this)));
        }
    }

    /**
     * @dev 紧急暂停功能（实际实现需要添加暂停机制）
     */
    function emergencyPause() external onlyOwner {
        // 实现暂停逻辑
    }

    /**
     * @dev 恢复功能（实际实现需要添加暂停机制）
     */
    function emergencyUnpause() external onlyOwner {
        // 实现恢复逻辑
    }
}
