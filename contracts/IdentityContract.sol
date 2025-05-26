// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IdentityContract
 * @dev 管理用户身份、验证和信任关系
 */
contract IdentityContract is AccessControl, ReentrancyGuard {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // 用户身份结构
    struct Identity {
        string name;
        string country;
        string culture;
        string profileURI;
        bool isRegistered;
        bool isVerified;
        address verifier;
        string verificationDocument;
        string verificationURI;
        uint256 registrationTime;
        uint256 verificationTime;
    }
    
    // 地址到身份的映射
    mapping(address => Identity) public identities;
    
    // 文化到用户地址列表的映射
    mapping(string => address[]) private _cultureUsers;
    
    // 已验证用户列表
    address[] private _verifiedUsers;
    
    // 信任关系映射
    mapping(address => address[]) private _trustedUsers;
    mapping(address => address[]) private _trustedByUsers;
    mapping(address => mapping(address => bool)) private _trustRelationship;
    
    // 事件
    event IdentityRegistered(address indexed user, string name, string culture, uint256 timestamp);
    event IdentityVerified(address indexed user, address indexed verifier, string document, uint256 timestamp);
    event ProfileUpdated(address indexed user, string name, string culture, uint256 timestamp);
    event TrustEstablished(address indexed truster, address indexed trustee, uint256 timestamp);
    event TrustRevoked(address indexed truster, address indexed trustee, uint256 timestamp);
    
    /**
     * @dev 构造函数
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev 注册身份
     * @param _name 用户名称
     * @param _country 国家
     * @param _culture 文化背景
     * @param _profileURI 个人资料URI
     */
    function registerIdentity(
        string memory _name,
        string memory _country,
        string memory _culture,
        string memory _profileURI
    ) external nonReentrant {
        require(!identities[msg.sender].isRegistered, "Already registered");
        
        identities[msg.sender] = Identity({
            name: _name,
            country: _country,
            culture: _culture,
            profileURI: _profileURI,
            isRegistered: true,
            isVerified: false,
            verifier: address(0),
            verificationDocument: "",
            verificationURI: "",
            registrationTime: block.timestamp,
            verificationTime: 0
        });
        
        _cultureUsers[_culture].push(msg.sender);
        
        emit IdentityRegistered(msg.sender, _name, _culture, block.timestamp);
    }
    
    /**
     * @dev 验证用户身份
     * @param _user 用户地址
     * @param _document 验证文档类型
     * @param _verificationURI 验证文档URI
     */
    function verifyIdentity(
        address _user,
        string memory _document,
        string memory _verificationURI
    ) external nonReentrant {
        require(hasRole(VERIFIER_ROLE, msg.sender), "Must have verifier role");
        require(identities[_user].isRegistered, "Not registered");
        
        identities[_user].isVerified = true;
        identities[_user].verifier = msg.sender;
        identities[_user].verificationDocument = _document;
        identities[_user].verificationURI = _verificationURI;
        identities[_user].verificationTime = block.timestamp;
        
        _verifiedUsers.push(_user);
        
        emit IdentityVerified(_user, msg.sender, _document, block.timestamp);
    }
    
    /**
     * @dev 更新个人资料
     * @param _name 用户名称
     * @param _country 国家
     * @param _culture 文化背景
     * @param _profileURI 个人资料URI
     */
    function updateProfile(
        string memory _name,
        string memory _country,
        string memory _culture,
        string memory _profileURI
    ) external nonReentrant {
        require(identities[msg.sender].isRegistered, "Not registered");
        
        // 如果文化背景改变，更新文化用户列表
        if (keccak256(bytes(identities[msg.sender].culture)) != keccak256(bytes(_culture))) {
            // 从旧文化列表中移除
            string memory oldCulture = identities[msg.sender].culture;
            address[] storage oldCultureList = _cultureUsers[oldCulture];
            for (uint256 i = 0; i < oldCultureList.length; i++) {
                if (oldCultureList[i] == msg.sender) {
                    oldCultureList[i] = oldCultureList[oldCultureList.length - 1];
                    oldCultureList.pop();
                    break;
                }
            }
            
            // 添加到新文化列表
            _cultureUsers[_culture].push(msg.sender);
        }
        
        identities[msg.sender].name = _name;
        identities[msg.sender].country = _country;
        identities[msg.sender].culture = _culture;
        identities[msg.sender].profileURI = _profileURI;
        
        emit ProfileUpdated(msg.sender, _name, _culture, block.timestamp);
    }
    
    /**
     * @dev 建立信任关系
     * @param _trustee 被信任者地址
     */
    function trustUser(address _trustee) external nonReentrant {
        require(identities[msg.sender].isRegistered, "Not registered");
        require(identities[_trustee].isRegistered, "Trustee not registered");
        require(msg.sender != _trustee, "Cannot trust yourself");
        require(!_trustRelationship[msg.sender][_trustee], "Already trusted");
        
        _trustedUsers[msg.sender].push(_trustee);
        _trustedByUsers[_trustee].push(msg.sender);
        _trustRelationship[msg.sender][_trustee] = true;
        
        emit TrustEstablished(msg.sender, _trustee, block.timestamp);
    }
    
    /**
     * @dev 撤销信任关系
     * @param _trustee 被信任者地址
     */
    function untrustUser(address _trustee) external nonReentrant {
        require(_trustRelationship[msg.sender][_trustee], "Not trusted");
        
        // 从信任列表中移除
        address[] storage trusted = _trustedUsers[msg.sender];
        for (uint256 i = 0; i < trusted.length; i++) {
            if (trusted[i] == _trustee) {
                trusted[i] = trusted[trusted.length - 1];
                trusted.pop();
                break;
            }
        }
        
        // 从被信任列表中移除
        address[] storage trustedBy = _trustedByUsers[_trustee];
        for (uint256 i = 0; i < trustedBy.length; i++) {
            if (trustedBy[i] == msg.sender) {
                trustedBy[i] = trustedBy[trustedBy.length - 1];
                trustedBy.pop();
                break;
            }
        }
        
        _trustRelationship[msg.sender][_trustee] = false;
        
        emit TrustRevoked(msg.sender, _trustee, block.timestamp);
    }
    
    /**
     * @dev 获取用户身份信息
     * @param _user 用户地址
     * @return 身份信息
     */
    function getIdentity(address _user) external view returns (Identity memory) {
        return identities[_user];
    }
    
    /**
     * @dev 获取特定文化的用户列表
     * @param _culture 文化背景
     * @return 用户地址列表
     */
    function getUsersByculture(string memory _culture) external view returns (address[] memory) {
        return _cultureUsers[_culture];
    }
    
    /**
     * @dev 获取已验证用户列表
     * @return 已验证用户地址列表
     */
    function getVerifiedUsers() external view returns (address[] memory) {
        return _verifiedUsers;
    }
    
    /**
     * @dev 获取用户信任的地址列表
     * @param _user 用户地址
     * @return 被信任的地址列表
     */
    function getTrustedUsers(address _user) external view returns (address[] memory) {
        return _trustedUsers[_user];
    }
    
    /**
     * @dev 获取信任用户的地址列表
     * @param _user 用户地址
     * @return 信任该用户的地址列表
     */
    function getTrustedByUsers(address _user) external view returns (address[] memory) {
        return _trustedByUsers[_user];
    }
    
    /**
     * @dev 检查是否存在信任关系
     * @param _truster 信任者地址
     * @param _trustee 被信任者地址
     * @return 是否存在信任关系
     */
    function isTrusted(address _truster, address _trustee) external view returns (bool) {
        return _trustRelationship[_truster][_trustee];
    }
}
