// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title CultureToken
 * @dev CultureBridge平台的文化通证(ERC-20)实现
 * 支持基础ERC-20功能、通证销毁、暂停机制、访问控制和可升级性
 */
contract CultureToken is ERC20, ERC20Burnable, Pausable, AccessControl, UUPSUpgradeable, Initializable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // 通证经济参数
    uint256 public maxSupply;       // 最大供应量
    uint256 public mintedSupply;    // 已铸造总量
    uint256 public burnedSupply;    // 已销毁总量
    
    // 事件
    event MaxSupplyUpdated(uint256 previousMaxSupply, uint256 newMaxSupply);
    
    /**
     * @dev 禁用默认构造函数，使用initialize函数进行初始化
     */
    constructor() ERC20("", "") {
        // 构造函数故意留空，所有初始化逻辑移至initialize函数
    }
    
    /**
     * @dev 初始化合约
     * @param name_ 通证名称
     * @param symbol_ 通证符号
     * @param initialSupply_ 初始供应量
     * @param maxSupply_ 最大供应量
     * @param admin 管理员地址
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 maxSupply_,
        address admin
    ) public initializer {
        __ERC20_init(name_, symbol_);
        
        require(maxSupply_ >= initialSupply_, "Max supply must be >= initial supply");
        require(admin != address(0), "Admin cannot be zero address");
        
        maxSupply = maxSupply_;
        mintedSupply = initialSupply_;
        
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(PAUSER_ROLE, admin);
        _setupRole(MINTER_ROLE, admin);
        _setupRole(UPGRADER_ROLE, admin);
        
        _mint(admin, initialSupply_);
    }
    
    /**
     * @dev 暂停所有通证转移操作
     * 只有PAUSER_ROLE角色可以调用
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev 恢复所有通证转移操作
     * 只有PAUSER_ROLE角色可以调用
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev 铸造新通证
     * @param to 接收地址
     * @param amount 铸造数量
     * 只有MINTER_ROLE角色可以调用
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(mintedSupply + amount <= maxSupply, "Exceeds max supply");
        mintedSupply += amount;
        _mint(to, amount);
    }
    
    /**
     * @dev 批量铸造新通证
     * @param recipients 接收地址数组
     * @param amounts 铸造数量数组
     * 只有MINTER_ROLE角色可以调用
     */
    function batchMint(address[] memory recipients, uint256[] memory amounts) public onlyRole(MINTER_ROLE) {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(mintedSupply + totalAmount <= maxSupply, "Exceeds max supply");
        mintedSupply += totalAmount;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev 更新最大供应量
     * @param newMaxSupply 新的最大供应量
     * 只有DEFAULT_ADMIN_ROLE角色可以调用
     */
    function updateMaxSupply(uint256 newMaxSupply) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSupply >= mintedSupply - burnedSupply, "New max supply too low");
        
        uint256 oldMaxSupply = maxSupply;
        maxSupply = newMaxSupply;
        
        emit MaxSupplyUpdated(oldMaxSupply, newMaxSupply);
    }
    
    /**
     * @dev 重写ERC20的_burn函数，更新burnedSupply计数
     */
    function _burn(address account, uint256 amount) internal override {
        super._burn(account, amount);
        burnedSupply += amount;
    }
    
    /**
     * @dev 重写ERC20的_beforeTokenTransfer函数，添加暂停检查
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev 实现UUPS可升级接口的_authorizeUpgrade函数
     * 只有UPGRADER_ROLE角色可以升级合约
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
