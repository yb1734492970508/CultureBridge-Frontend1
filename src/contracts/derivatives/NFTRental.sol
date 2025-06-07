// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTRental
 * @dev 允许NFT所有者出租其NFT，租户可以临时获得NFT的使用权
 */
contract NFTRental is ERC721Holder, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // 租赁信息结构
    struct Rental {
        address lessor;           // 出租人（NFT所有者）
        address renter;           // 租户
        address nftContract;      // NFT合约地址
        uint256 tokenId;          // NFT的tokenId
        uint256 rentalFee;        // 租金（以wei为单位）
        uint256 duration;         // 租期（以秒为单位）
        uint256 startTime;        // 租赁开始时间
        uint256 collateral;       // 押金
        bool revenueSharing;      // 是否启用收益分成
        uint8 revenueShare;       // 出租人的收益分成比例（0-100）
        bool active;              // 是否活跃
    }
    
    // 收益记录结构
    struct Revenue {
        uint256 rentalId;         // 关联的租赁ID
        uint256 amount;           // 收益金额
        uint256 timestamp;        // 记录时间
        string source;            // 收益来源
    }
    
    // 映射存储
    mapping(uint256 => Rental) public rentals;                      // 租赁ID => 租赁信息
    mapping(address => uint256[]) private userRentalsAsLessor;      // 用户地址 => 作为出租人的租赁ID数组
    mapping(address => uint256[]) private userRentalsAsRenter;      // 用户地址 => 作为租户的租赁ID数组
    mapping(uint256 => Revenue[]) private rentalRevenues;           // 租赁ID => 收益记录数组
    
    // 计数器
    Counters.Counter private _rentalIdCounter;
    
    // 事件
    event RentalCreated(uint256 indexed rentalId, address indexed lessor, address indexed nftContract, uint256 tokenId, uint256 rentalFee, uint256 duration);
    event RentalStarted(uint256 indexed rentalId, address indexed renter, uint256 startTime, uint256 endTime);
    event RentalEnded(uint256 indexed rentalId, address indexed renter, address indexed lessor);
    event RentalCancelled(uint256 indexed rentalId);
    event RevenueRecorded(uint256 indexed rentalId, uint256 amount, string source);
    event RevenueDistributed(uint256 indexed rentalId, address indexed lessor, address indexed renter, uint256 lessorAmount, uint256 renterAmount);
    
    /**
     * @dev 构造函数
     * @param _owner 合约所有者地址
     */
    constructor(address _owner) {
        transferOwnership(_owner);
    }
    
    /**
     * @dev 创建NFT租赁
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _rentalFee 租金
     * @param _duration 租期（以秒为单位）
     * @param _collateral 押金
     * @param _revenueSharing 是否启用收益分成
     * @param _revenueShare 出租人的收益分成比例（0-100）
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
    ) external nonReentrant returns (uint256) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_duration > 0, "Duration must be greater than 0");
        require(!_revenueSharing || (_revenueShare > 0 && _revenueShare <= 100), "Invalid revenue share");
        
        // 检查调用者是否为NFT所有者
        IERC721 nftContract = IERC721(_nftContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // 将NFT转移到合约
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        // 创建租赁记录
        uint256 rentalId = _rentalIdCounter.current();
        _rentalIdCounter.increment();
        
        rentals[rentalId] = Rental({
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
        
        // 更新用户租赁记录
        userRentalsAsLessor[msg.sender].push(rentalId);
        
        emit RentalCreated(rentalId, msg.sender, _nftContract, _tokenId, _rentalFee, _duration);
        
        return rentalId;
    }
    
    /**
     * @dev 开始租赁
     * @param _rentalId 租赁ID
     */
    function startRental(uint256 _rentalId) external payable nonReentrant {
        Rental storage rental = rentals[_rentalId];
        
        require(rental.active, "Rental not active");
        require(rental.renter == address(0), "Already rented");
        require(rental.lessor != msg.sender, "Lessor cannot rent own NFT");
        require(msg.value >= rental.rentalFee + rental.collateral, "Insufficient payment");
        
        // 更新租赁信息
        rental.renter = msg.sender;
        rental.startTime = block.timestamp;
        
        // 更新用户租赁记录
        userRentalsAsRenter[msg.sender].push(_rentalId);
        
        // 转移租金给出租人
        payable(rental.lessor).transfer(rental.rentalFee);
        
        emit RentalStarted(_rentalId, msg.sender, block.timestamp, block.timestamp + rental.duration);
    }
    
    /**
     * @dev 结束租赁
     * @param _rentalId 租赁ID
     */
    function endRental(uint256 _rentalId) external nonReentrant {
        Rental storage rental = rentals[_rentalId];
        
        require(rental.active, "Rental not active");
        require(rental.renter != address(0), "Not rented");
        require(
            msg.sender == rental.renter || 
            msg.sender == rental.lessor || 
            msg.sender == owner() || 
            block.timestamp >= rental.startTime + rental.duration, 
            "Not authorized or rental period not ended"
        );
        
        // 将NFT返还给出租人
        IERC721(rental.nftContract).safeTransferFrom(address(this), rental.lessor, rental.tokenId);
        
        // 将押金返还给租户
        payable(rental.renter).transfer(rental.collateral);
        
        // 更新租赁状态
        rental.active = false;
        
        emit RentalEnded(_rentalId, rental.renter, rental.lessor);
    }
    
    /**
     * @dev 取消租赁
     * @param _rentalId 租赁ID
     */
    function cancelRental(uint256 _rentalId) external nonReentrant {
        Rental storage rental = rentals[_rentalId];
        
        require(rental.active, "Rental not active");
        require(rental.renter == address(0), "Already rented");
        require(msg.sender == rental.lessor || msg.sender == owner(), "Not authorized");
        
        // 将NFT返还给出租人
        IERC721(rental.nftContract).safeTransferFrom(address(this), rental.lessor, rental.tokenId);
        
        // 更新租赁状态
        rental.active = false;
        
        emit RentalCancelled(_rentalId);
    }
    
    /**
     * @dev 记录租赁收益
     * @param _rentalId 租赁ID
     * @param _amount 收益金额
     * @param _source 收益来源
     */
    function recordRevenue(uint256 _rentalId, uint256 _amount, string memory _source) external payable nonReentrant {
        require(msg.value == _amount, "Payment must match amount");
        
        Rental storage rental = rentals[_rentalId];
        
        require(rental.active, "Rental not active");
        require(rental.renter != address(0), "Not rented");
        
        // 记录收益
        rentalRevenues[_rentalId].push(Revenue({
            rentalId: _rentalId,
            amount: _amount,
            timestamp: block.timestamp,
            source: _source
        }));
        
        // 如果启用了收益分成，则分配收益
        if (rental.revenueSharing) {
            uint256 lessorAmount = (_amount * rental.revenueShare) / 100;
            uint256 renterAmount = _amount - lessorAmount;
            
            // 转移收益
            payable(rental.lessor).transfer(lessorAmount);
            payable(rental.renter).transfer(renterAmount);
            
            emit RevenueDistributed(_rentalId, rental.lessor, rental.renter, lessorAmount, renterAmount);
        } else {
            // 如果没有启用收益分成，全部收益归租户
            payable(rental.renter).transfer(_amount);
        }
        
        emit RevenueRecorded(_rentalId, _amount, _source);
    }
    
    /**
     * @dev 获取用户作为出租人的租赁ID列表
     * @param _user 用户地址
     * @return 租赁ID数组
     */
    function getUserRentalsAsLessor(address _user) external view returns (uint256[] memory) {
        return userRentalsAsLessor[_user];
    }
    
    /**
     * @dev 获取用户作为租户的租赁ID列表
     * @param _user 用户地址
     * @return 租赁ID数组
     */
    function getUserRentalsAsRenter(address _user) external view returns (uint256[] memory) {
        return userRentalsAsRenter[_user];
    }
    
    /**
     * @dev 获取租赁收益记录
     * @param _rentalId 租赁ID
     * @return 收益记录数组
     */
    function getRentalRevenues(uint256 _rentalId) external view returns (Revenue[] memory) {
        return rentalRevenues[_rentalId];
    }
    
    /**
     * @dev 获取租赁总数
     * @return 租赁总数
     */
    function getRentalCount() external view returns (uint256) {
        return _rentalIdCounter.current();
    }
    
    /**
     * @dev 检查租赁状态
     * @param _rentalId 租赁ID
     * @return isActive 是否活跃
     * @return isRented 是否已租出
     * @return timeRemaining 剩余时间（秒）
     */
    function checkRentalStatus(uint256 _rentalId) external view returns (bool isActive, bool isRented, uint256 timeRemaining) {
        Rental storage rental = rentals[_rentalId];
        
        isActive = rental.active;
        isRented = rental.renter != address(0);
        
        if (isRented && block.timestamp < rental.startTime + rental.duration) {
            timeRemaining = rental.startTime + rental.duration - block.timestamp;
        } else {
            timeRemaining = 0;
        }
        
        return (isActive, isRented, timeRemaining);
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
}
