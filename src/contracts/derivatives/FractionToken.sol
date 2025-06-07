// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title FractionToken
 * @dev 表示分数化NFT的ERC20代币
 */
contract FractionToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    // NFT信息
    address public nftContract;
    uint256 public tokenId;
    address public originalOwner;
    
    // 回购价格
    uint256 public reservePrice;
    
    // 回购状态
    bool public buyoutInitiated;
    uint256 public buyoutEndTime;
    address public buyoutInitiator;
    
    // 事件
    event BuyoutInitiated(address indexed initiator, uint256 reservePrice, uint256 endTime);
    event BuyoutCancelled(address indexed initiator);
    event BuyoutFinalized(address indexed initiator, address indexed originalNFTReceiver);
    
    /**
     * @dev 构造函数
     * @param name_ 代币名称
     * @param symbol_ 代币符号
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _originalOwner 原始NFT所有者
     * @param _reservePrice 回购价格
     * @param _manager 管理者地址（通常是NFTDerivativesMarket合约）
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address _nftContract,
        uint256 _tokenId,
        address _originalOwner,
        uint256 _reservePrice,
        address _manager
    ) ERC20(name_, symbol_) {
        nftContract = _nftContract;
        tokenId = _tokenId;
        originalOwner = _originalOwner;
        reservePrice = _reservePrice;
        
        _setupRole(DEFAULT_ADMIN_ROLE, _manager);
        _setupRole(MINTER_ROLE, _manager);
        _setupRole(MANAGER_ROLE, _manager);
    }
    
    /**
     * @dev 铸造代币
     * @param to 接收者地址
     * @param amount 代币数量
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    /**
     * @dev 更新回购价格
     * @param _newReservePrice 新的回购价格
     */
    function updateReservePrice(uint256 _newReservePrice) external onlyRole(MANAGER_ROLE) {
        reservePrice = _newReservePrice;
    }
    
    /**
     * @dev 发起回购
     * @param _buyoutDuration 回购持续时间（秒）
     */
    function initiateBuyout(uint256 _buyoutDuration) external payable {
        require(!buyoutInitiated, "Buyout already initiated");
        require(msg.value >= reservePrice, "Insufficient funds for buyout");
        
        buyoutInitiated = true;
        buyoutEndTime = block.timestamp + _buyoutDuration;
        buyoutInitiator = msg.sender;
        
        emit BuyoutInitiated(msg.sender, reservePrice, buyoutEndTime);
    }
    
    /**
     * @dev 取消回购
     */
    function cancelBuyout() external {
        require(buyoutInitiated, "No active buyout");
        require(msg.sender == buyoutInitiator, "Not buyout initiator");
        require(block.timestamp < buyoutEndTime, "Buyout period ended");
        
        buyoutInitiated = false;
        
        // 退还资金
        payable(buyoutInitiator).transfer(reservePrice);
        
        emit BuyoutCancelled(buyoutInitiator);
    }
    
    /**
     * @dev 完成回购
     * @param _nftReceiver 接收NFT的地址
     */
    function finalizeBuyout(address _nftReceiver) external onlyRole(MANAGER_ROLE) {
        require(buyoutInitiated, "No active buyout");
        require(block.timestamp >= buyoutEndTime, "Buyout period not ended");
        
        buyoutInitiated = false;
        
        emit BuyoutFinalized(buyoutInitiator, _nftReceiver);
    }
    
    /**
     * @dev 提取合约中的资金
     * @param _recipient 接收者地址
     */
    function withdrawFunds(address payable _recipient) external onlyRole(MANAGER_ROLE) {
        _recipient.transfer(address(this).balance);
    }
}
