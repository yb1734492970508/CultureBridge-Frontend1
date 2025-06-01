// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AICapabilityNFT
 * @dev 表示AI能力的NFT，用于在CultureBridge生态系统中授权AI服务
 */
contract AICapabilityNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // AI能力类型
    enum CapabilityType {
        Translation,       // 翻译能力
        CulturalContext,   // 文化上下文理解
        ContentCreation,   // 内容创作
        LanguageTutor,     // 语言教学
        Transcription,     // 转录
        VoiceSynthesis     // 语音合成
    }
    
    // 能力元数据
    struct CapabilityMetadata {
        CapabilityType capabilityType;  // 能力类型
        string[] supportedLanguages;    // 支持的语言
        uint256 performanceScore;       // 性能评分(0-100)
        uint256 validUntil;             // 有效期
        string modelVersion;            // 模型版本
        string metadataURI;             // 元数据URI(IPFS)
    }
    
    // 代币合约
    IERC20 public cultureToken;
    
    // 存储
    mapping(uint256 => CapabilityMetadata) public capabilities;
    
    // 索引
    mapping(CapabilityType => uint256[]) public capabilityTypeIndex;
    mapping(string => uint256[]) public languageIndex;
    
    // 事件
    event CapabilityMinted(uint256 indexed tokenId, address indexed owner, CapabilityType capabilityType);
    event CapabilityUpdated(uint256 indexed tokenId, CapabilityType capabilityType);
    event PerformanceScoreUpdated(uint256 indexed tokenId, uint256 newScore);
    event ValidityExtended(uint256 indexed tokenId, uint256 newValidUntil);
    
    /**
     * @dev 构造函数
     * @param tokenAddress CultureToken合约地址
     */
    constructor(address tokenAddress) ERC721("AI Capability", "AICAP") {
        require(tokenAddress != address(0), "Invalid token address");
        cultureToken = IERC20(tokenAddress);
    }
    
    /**
     * @dev 铸造新的能力NFT
     * @param to 接收者地址
     * @param capabilityType 能力类型
     * @param supportedLanguages 支持的语言
     * @param validityPeriod 有效期（秒）
     * @param modelVersion 模型版本
     * @param metadataURI 元数据URI
     */
    function mintCapability(
        address to,
        CapabilityType capabilityType,
        string[] calldata supportedLanguages,
        uint256 validityPeriod,
        string calldata modelVersion,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        require(supportedLanguages.length > 0, "At least one language required");
        require(validityPeriod > 0, "Validity period must be positive");
        require(bytes(modelVersion).length > 0, "Model version required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        
        capabilities[newTokenId] = CapabilityMetadata({
            capabilityType: capabilityType,
            supportedLanguages: supportedLanguages,
            performanceScore: 0,
            validUntil: block.timestamp + validityPeriod,
            modelVersion: modelVersion,
            metadataURI: metadataURI
        });
        
        // 更新索引
        capabilityTypeIndex[capabilityType].push(newTokenId);
        
        for (uint i = 0; i < supportedLanguages.length; i++) {
            languageIndex[supportedLanguages[i]].push(newTokenId);
        }
        
        emit CapabilityMinted(newTokenId, to, capabilityType);
        
        return newTokenId;
    }
    
    /**
     * @dev 更新能力元数据
     * @param tokenId 代币ID
     * @param supportedLanguages 支持的语言
     * @param modelVersion 模型版本
     * @param metadataURI 元数据URI
     */
    function updateCapability(
        uint256 tokenId,
        string[] calldata supportedLanguages,
        string calldata modelVersion,
        string calldata metadataURI
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(supportedLanguages.length > 0, "At least one language required");
        require(bytes(modelVersion).length > 0, "Model version required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        CapabilityMetadata storage capability = capabilities[tokenId];
        
        // 更新元数据
        capability.supportedLanguages = supportedLanguages;
        capability.modelVersion = modelVersion;
        capability.metadataURI = metadataURI;
        
        emit CapabilityUpdated(tokenId, capability.capabilityType);
    }
    
    /**
     * @dev 更新性能评分
     * @param tokenId 代币ID
     * @param newScore 新评分
     */
    function updatePerformanceScore(uint256 tokenId, uint256 newScore) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(newScore <= 100, "Score must be 0-100");
        
        capabilities[tokenId].performanceScore = newScore;
        
        emit PerformanceScoreUpdated(tokenId, newScore);
    }
    
    /**
     * @dev 延长有效期
     * @param tokenId 代币ID
     * @param additionalTime 额外时间（秒）
     */
    function extendValidity(uint256 tokenId, uint256 additionalTime) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(additionalTime > 0, "Additional time must be positive");
        
        capabilities[tokenId].validUntil += additionalTime;
        
        emit ValidityExtended(tokenId, capabilities[tokenId].validUntil);
    }
    
    /**
     * @dev 检查能力是否有效
     * @param tokenId 代币ID
     */
    function isCapabilityValid(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return capabilities[tokenId].validUntil > block.timestamp;
    }
    
    /**
     * @dev 获取特定类型的所有能力
     * @param capabilityType 能力类型
     */
    function getCapabilitiesByType(CapabilityType capabilityType) external view returns (uint256[] memory) {
        return capabilityTypeIndex[capabilityType];
    }
    
    /**
     * @dev 获取支持特定语言的所有能力
     * @param language 语言
     */
    function getCapabilitiesByLanguage(string calldata language) external view returns (uint256[] memory) {
        return languageIndex[language];
    }
    
    /**
     * @dev 获取地址拥有的所有能力
     * @param owner 所有者地址
     */
    function getCapabilitiesByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        
        for (uint i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }
    
    /**
     * @dev 获取能力元数据
     * @param tokenId 代币ID
     */
    function getCapabilityMetadata(uint256 tokenId) external view returns (
        CapabilityType capabilityType,
        string[] memory supportedLanguages,
        uint256 performanceScore,
        uint256 validUntil,
        string memory modelVersion,
        string memory metadataURI
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        CapabilityMetadata storage capability = capabilities[tokenId];
        
        return (
            capability.capabilityType,
            capability.supportedLanguages,
            capability.performanceScore,
            capability.validUntil,
            capability.modelVersion,
            capability.metadataURI
        );
    }
    
    /**
     * @dev 覆盖tokenURI函数
     * @param tokenId 代币ID
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return capabilities[tokenId].metadataURI;
    }
}
