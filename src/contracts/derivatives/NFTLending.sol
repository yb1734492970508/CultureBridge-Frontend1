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
 * @title NFTLending
 * @dev 允许用户以NFT为抵押获取加密货币贷款
 */
contract NFTLending is ERC721Holder, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // 贷款信息结构
    struct Loan {
        address borrower;           // 借款人
        address lender;             // 贷款人
        address nftContract;        // NFT合约地址
        uint256 tokenId;            // NFT的tokenId
        uint256 loanAmount;         // 贷款金额（以wei为单位）
        uint256 interestRate;       // 年化利率（基点，1% = 100）
        uint256 duration;           // 贷款期限（以秒为单位）
        uint256 startTime;          // 贷款开始时间
        uint256 collateralFactor;   // 抵押率（基点，100% = 10000）
        address paymentToken;       // 支付代币地址（address(0)表示ETH）
        LoanStatus status;          // 贷款状态
        uint256 liquidationThreshold; // 清算阈值（基点，75% = 7500）
    }
    
    // 贷款状态枚举
    enum LoanStatus {
        PENDING,    // 等待贷款人放款
        ACTIVE,     // 贷款已发放，正在进行中
        REPAID,     // 贷款已还清
        DEFAULTED,  // 贷款已违约
        LIQUIDATED, // 贷款已清算
        CANCELLED   // 贷款已取消
    }
    
    // 贷款提议结构
    struct LoanOffer {
        address lender;             // 贷款人
        uint256 loanAmount;         // 贷款金额
        uint256 interestRate;       // 年化利率
        uint256 duration;           // 贷款期限
        uint256 collateralFactor;   // 抵押率
        address paymentToken;       // 支付代币地址
        uint256 expirationTime;     // 提议过期时间
        bool active;                // 是否活跃
    }
    
    // 映射存储
    mapping(uint256 => Loan) public loans;                      // 贷款ID => 贷款信息
    mapping(uint256 => LoanOffer[]) private loanOffers;         // 贷款ID => 贷款提议数组
    mapping(address => uint256[]) private userLoansAsBorrower;  // 用户地址 => 作为借款人的贷款ID数组
    mapping(address => uint256[]) private userLoansAsLender;    // 用户地址 => 作为贷款人的贷款ID数组
    
    // 价格预言机
    NFTPriceOracle public priceOracle;
    
    // 计数器
    Counters.Counter private _loanIdCounter;
    
    // 平台费用
    uint256 public platformFeePercent = 50; // 0.5%，以基点表示
    address public feeCollector;
    
    // 常量
    uint256 public constant BASIS_POINTS = 10000;  // 基点精度
    uint256 public constant MIN_LOAN_DURATION = 1 days;  // 最小贷款期限
    uint256 public constant MAX_LOAN_DURATION = 365 days;  // 最大贷款期限
    uint256 public constant DEFAULT_LIQUIDATION_THRESHOLD = 7500;  // 默认清算阈值（75%）
    
    // 事件
    event LoanCreated(uint256 indexed loanId, address indexed borrower, address indexed nftContract, uint256 tokenId);
    event LoanOfferCreated(uint256 indexed loanId, address indexed lender, uint256 loanAmount, uint256 interestRate);
    event LoanOfferCancelled(uint256 indexed loanId, address indexed lender);
    event LoanOfferAccepted(uint256 indexed loanId, address indexed borrower, address indexed lender, uint256 loanAmount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 repayAmount);
    event LoanLiquidated(uint256 indexed loanId, address indexed liquidator, uint256 liquidationPrice);
    event LoanCancelled(uint256 indexed loanId, address indexed borrower);
    
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
     * @dev 创建贷款请求
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _minLoanAmount 最小贷款金额
     * @param _duration 贷款期限（以秒为单位）
     * @return loanId 贷款ID
     */
    function createLoan(
        address _nftContract,
        uint256 _tokenId,
        uint256 _minLoanAmount,
        uint256 _duration
    ) external nonReentrant returns (uint256) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_duration >= MIN_LOAN_DURATION && _duration <= MAX_LOAN_DURATION, "Invalid loan duration");
        
        // 检查调用者是否为NFT所有者
        IERC721 nftContract = IERC721(_nftContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // 获取NFT估值
        (uint256 nftValue, uint256 confidence) = priceOracle.estimateNFTValue(_nftContract, _tokenId);
        require(nftValue > 0, "NFT value must be greater than 0");
        require(confidence >= 5000, "NFT valuation confidence too low"); // 至少50%置信度
        
        // 检查最小贷款金额是否合理
        require(_minLoanAmount <= nftValue * 7000 / BASIS_POINTS, "Min loan amount too high"); // 最多70%的NFT价值
        
        // 将NFT转移到合约
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 创建贷款记录
        uint256 loanId = _loanIdCounter.current();
        _loanIdCounter.increment();
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            nftContract: _nftContract,
            tokenId: _tokenId,
            loanAmount: _minLoanAmount,
            interestRate: 0,
            duration: _duration,
            startTime: 0,
            collateralFactor: 0,
            paymentToken: address(0),
            status: LoanStatus.PENDING,
            liquidationThreshold: DEFAULT_LIQUIDATION_THRESHOLD
        });
        
        // 更新用户贷款记录
        userLoansAsBorrower[msg.sender].push(loanId);
        
        emit LoanCreated(loanId, msg.sender, _nftContract, _tokenId);
        
        return loanId;
    }
    
    /**
     * @dev 创建贷款提议
     * @param _loanId 贷款ID
     * @param _loanAmount 贷款金额
     * @param _interestRate 年化利率（基点）
     * @param _duration 贷款期限（以秒为单位）
     * @param _collateralFactor 抵押率（基点）
     * @param _paymentToken 支付代币地址（address(0)表示ETH）
     * @param _expirationTime 提议过期时间
     */
    function createLoanOffer(
        uint256 _loanId,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _duration,
        uint256 _collateralFactor,
        address _paymentToken,
        uint256 _expirationTime
    ) external nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.borrower != address(0), "Loan does not exist");
        require(loan.status == LoanStatus.PENDING, "Loan not in pending status");
        require(_loanAmount >= loan.loanAmount, "Loan amount below minimum");
        require(_interestRate <= 5000, "Interest rate too high"); // 最高50%年化利率
        require(_collateralFactor >= 5000 && _collateralFactor <= 9000, "Invalid collateral factor"); // 50%-90%
        require(_expirationTime > block.timestamp, "Expiration time in the past");
        require(_duration >= MIN_LOAN_DURATION && _duration <= MAX_LOAN_DURATION, "Invalid loan duration");
        require(_duration <= loan.duration, "Duration exceeds borrower's request");
        
        // 创建贷款提议
        loanOffers[_loanId].push(LoanOffer({
            lender: msg.sender,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            collateralFactor: _collateralFactor,
            paymentToken: _paymentToken,
            expirationTime: _expirationTime,
            active: true
        }));
        
        emit LoanOfferCreated(_loanId, msg.sender, _loanAmount, _interestRate);
    }
    
    /**
     * @dev 取消贷款提议
     * @param _loanId 贷款ID
     * @param _offerIndex 提议索引
     */
    function cancelLoanOffer(uint256 _loanId, uint256 _offerIndex) external nonReentrant {
        require(_offerIndex < loanOffers[_loanId].length, "Offer index out of bounds");
        
        LoanOffer storage offer = loanOffers[_loanId][_offerIndex];
        require(offer.lender == msg.sender, "Not offer creator");
        require(offer.active, "Offer not active");
        
        offer.active = false;
        
        emit LoanOfferCancelled(_loanId, msg.sender);
    }
    
    /**
     * @dev 接受贷款提议
     * @param _loanId 贷款ID
     * @param _offerIndex 提议索引
     */
    function acceptLoanOffer(uint256 _loanId, uint256 _offerIndex) external nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.borrower == msg.sender, "Not loan creator");
        require(loan.status == LoanStatus.PENDING, "Loan not in pending status");
        require(_offerIndex < loanOffers[_loanId].length, "Offer index out of bounds");
        
        LoanOffer storage offer = loanOffers[_loanId][_offerIndex];
        require(offer.active, "Offer not active");
        require(offer.expirationTime > block.timestamp, "Offer expired");
        
        // 更新贷款信息
        loan.lender = offer.lender;
        loan.loanAmount = offer.loanAmount;
        loan.interestRate = offer.interestRate;
        loan.duration = offer.duration;
        loan.startTime = block.timestamp;
        loan.collateralFactor = offer.collateralFactor;
        loan.paymentToken = offer.paymentToken;
        loan.status = LoanStatus.ACTIVE;
        
        // 更新贷款人记录
        userLoansAsLender[offer.lender].push(_loanId);
        
        // 将所有提议标记为非活跃
        for (uint256 i = 0; i < loanOffers[_loanId].length; i++) {
            loanOffers[_loanId][i].active = false;
        }
        
        // 转移贷款金额给借款人
        if (offer.paymentToken == address(0)) {
            // ETH贷款
            require(address(this).balance >= offer.loanAmount, "Insufficient ETH balance");
            
            // 计算平台费用
            uint256 platformFee = offer.loanAmount * platformFeePercent / BASIS_POINTS;
            uint256 borrowerAmount = offer.loanAmount - platformFee;
            
            // 转移ETH
            payable(feeCollector).transfer(platformFee);
            payable(msg.sender).transfer(borrowerAmount);
        } else {
            // ERC20代币贷款
            IERC20 token = IERC20(offer.paymentToken);
            require(token.balanceOf(address(this)) >= offer.loanAmount, "Insufficient token balance");
            
            // 计算平台费用
            uint256 platformFee = offer.loanAmount * platformFeePercent / BASIS_POINTS;
            uint256 borrowerAmount = offer.loanAmount - platformFee;
            
            // 转移代币
            token.transfer(feeCollector, platformFee);
            token.transfer(msg.sender, borrowerAmount);
        }
        
        emit LoanOfferAccepted(_loanId, msg.sender, offer.lender, offer.loanAmount);
    }
    
    /**
     * @dev 提供ETH贷款
     * @param _loanId 贷款ID
     * @param _interestRate 年化利率（基点）
     * @param _duration 贷款期限（以秒为单位）
     * @param _collateralFactor 抵押率（基点）
     */
    function provideLoan(
        uint256 _loanId,
        uint256 _interestRate,
        uint256 _duration,
        uint256 _collateralFactor
    ) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.borrower != address(0), "Loan does not exist");
        require(loan.status == LoanStatus.PENDING, "Loan not in pending status");
        require(msg.value >= loan.loanAmount, "Insufficient ETH sent");
        require(_interestRate <= 5000, "Interest rate too high"); // 最高50%年化利率
        require(_collateralFactor >= 5000 && _collateralFactor <= 9000, "Invalid collateral factor"); // 50%-90%
        require(_duration >= MIN_LOAN_DURATION && _duration <= MAX_LOAN_DURATION, "Invalid loan duration");
        require(_duration <= loan.duration, "Duration exceeds borrower's request");
        
        // 更新贷款信息
        loan.lender = msg.sender;
        loan.loanAmount = msg.value;
        loan.interestRate = _interestRate;
        loan.duration = _duration;
        loan.startTime = block.timestamp;
        loan.collateralFactor = _collateralFactor;
        loan.paymentToken = address(0); // ETH
        loan.status = LoanStatus.ACTIVE;
        
        // 更新贷款人记录
        userLoansAsLender[msg.sender].push(_loanId);
        
        // 将所有提议标记为非活跃
        for (uint256 i = 0; i < loanOffers[_loanId].length; i++) {
            loanOffers[_loanId][i].active = false;
        }
        
        // 计算平台费用
        uint256 platformFee = msg.value * platformFeePercent / BASIS_POINTS;
        uint256 borrowerAmount = msg.value - platformFee;
        
        // 转移ETH给借款人和费用收集者
        payable(feeCollector).transfer(platformFee);
        payable(loan.borrower).transfer(borrowerAmount);
        
        emit LoanOfferAccepted(_loanId, loan.borrower, msg.sender, msg.value);
    }
    
    /**
     * @dev 还款
     * @param _loanId 贷款ID
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.ACTIVE, "Loan not active");
        require(block.timestamp <= loan.startTime + loan.duration, "Loan period ended");
        
        // 计算应还金额（本金 + 利息）
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interestAmount = loan.loanAmount * loan.interestRate * timeElapsed / (BASIS_POINTS * 365 days);
        uint256 repayAmount = loan.loanAmount + interestAmount;
        
        if (loan.paymentToken == address(0)) {
            // ETH贷款
            require(msg.value >= repayAmount, "Insufficient ETH sent");
            
            // 转移ETH给贷款人
            payable(loan.lender).transfer(repayAmount);
            
            // 如果发送了多余的ETH，退还给借款人
            if (msg.value > repayAmount) {
                payable(msg.sender).transfer(msg.value - repayAmount);
            }
        } else {
            // ERC20代币贷款
            IERC20 token = IERC20(loan.paymentToken);
            require(token.transferFrom(msg.sender, loan.lender, repayAmount), "Token transfer failed");
        }
        
        // 将NFT返还给借款人
        IERC721(loan.nftContract).safeTransferFrom(address(this), loan.borrower, loan.tokenId);
        
        // 更新贷款状态
        loan.status = LoanStatus.REPAID;
        
        emit LoanRepaid(_loanId, msg.sender, repayAmount);
    }
    
    /**
     * @dev 清算贷款
     * @param _loanId 贷款ID
     */
    function liquidateLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.ACTIVE, "Loan not active");
        require(block.timestamp > loan.startTime + loan.duration, "Loan period not ended");
        
        // 获取NFT当前估值
        (uint256 nftValue, ) = priceOracle.estimateNFTValue(loan.nftContract, loan.tokenId);
        
        // 计算应还金额（本金 + 利息）
        uint256 timeElapsed = loan.duration; // 使用完整贷款期限
        uint256 interestAmount = loan.loanAmount * loan.interestRate * timeElapsed / (BASIS_POINTS * 365 days);
        uint256 totalDebt = loan.loanAmount + interestAmount;
        
        // 检查是否满足清算条件
        require(nftValue * loan.liquidationThreshold / BASIS_POINTS <= totalDebt, "Liquidation conditions not met");
        
        // 将NFT转移给贷款人
        IERC721(loan.nftContract).safeTransferFrom(address(this), loan.lender, loan.tokenId);
        
        // 更新贷款状态
        loan.status = LoanStatus.LIQUIDATED;
        
        emit LoanLiquidated(_loanId, loan.lender, nftValue);
    }
    
    /**
     * @dev 取消贷款请求
     * @param _loanId 贷款ID
     */
    function cancelLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        
        require(loan.borrower == msg.sender || msg.sender == owner(), "Not authorized");
        require(loan.status == LoanStatus.PENDING, "Loan not in pending status");
        
        // 将NFT返还给借款人
        IERC721(loan.nftContract).safeTransferFrom(address(this), loan.borrower, loan.tokenId);
        
        // 更新贷款状态
        loan.status = LoanStatus.CANCELLED;
        
        emit LoanCancelled(_loanId, loan.borrower);
    }
    
    /**
     * @dev 获取用户作为借款人的贷款ID列表
     * @param _user 用户地址
     * @return 贷款ID数组
     */
    function getUserLoansAsBorrower(address _user) external view returns (uint256[] memory) {
        return userLoansAsBorrower[_user];
    }
    
    /**
     * @dev 获取用户作为贷款人的贷款ID列表
     * @param _user 用户地址
     * @return 贷款ID数组
     */
    function getUserLoansAsLender(address _user) external view returns (uint256[] memory) {
        return userLoansAsLender[_user];
    }
    
    /**
     * @dev 获取贷款提议列表
     * @param _loanId 贷款ID
     * @return 贷款提议数组
     */
    function getLoanOffers(uint256 _loanId) external view returns (LoanOffer[] memory) {
        return loanOffers[_loanId];
    }
    
    /**
     * @dev 获取贷款总数
     * @return 贷款总数
     */
    function getLoanCount() external view returns (uint256) {
        return _loanIdCounter.current();
    }
    
    /**
     * @dev 计算贷款当前状态
     * @param _loanId 贷款ID
     * @return status 贷款状态
     * @return healthFactor 健康因子（基点，低于10000表示不健康）
     * @return repayAmount 应还金额
     * @return timeRemaining 剩余时间（秒）
     */
    function calculateLoanStatus(uint256 _loanId) external view returns (
        LoanStatus status,
        uint256 healthFactor,
        uint256 repayAmount,
        uint256 timeRemaining
    ) {
        Loan storage loan = loans[_loanId];
        
        status = loan.status;
        
        if (status == LoanStatus.ACTIVE) {
            // 获取NFT当前估值
            (uint256 nftValue, ) = priceOracle.estimateNFTValue(loan.nftContract, loan.tokenId);
            
            // 计算应还金额（本金 + 利息）
            uint256 timeElapsed = block.timestamp - loan.startTime;
            if (timeElapsed > loan.duration) {
                timeElapsed = loan.duration;
            }
            uint256 interestAmount = loan.loanAmount * loan.interestRate * timeElapsed / (BASIS_POINTS * 365 days);
            repayAmount = loan.loanAmount + interestAmount;
            
            // 计算健康因子
            if (nftValue > 0) {
                healthFactor = nftValue * BASIS_POINTS / repayAmount;
            } else {
                healthFactor = 0;
            }
            
            // 计算剩余时间
            if (block.timestamp < loan.startTime + loan.duration) {
                timeRemaining = loan.startTime + loan.duration - block.timestamp;
            } else {
                timeRemaining = 0;
            }
        } else {
            healthFactor = 0;
            repayAmount = 0;
            timeRemaining = 0;
        }
        
        return (status, healthFactor, repayAmount, timeRemaining);
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
     * @dev 接收ETH
     */
    receive() external payable {}
}
