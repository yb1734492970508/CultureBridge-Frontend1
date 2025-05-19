// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CultureToken.sol";

/**
 * @title CulturalNFT
 * @dev 文化知识NFT合约，用于铸造和管理文化知识资产
 */
contract CulturalNFT is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    // 代币ID计数器
    Counters.Counter private _tokenIds;
    
    // CultureToken合约
    CultureToken public cultureToken;
    
    // NFT类型
    enum NFTType { TranslationMemory, CulturalExplanation, LanguageResource }
    
    // NFT元数据
    struct NFTMetadata {
        NFTType nftType;             // NFT类型
        address creator;             // 创建者
        string language;             // 主要语言
        string[] relatedLanguages;   // 相关语言
        string[] tags;               // 标签
        uint256 creationDate;        // 创建日期
        uint256 usageCount;          // 使用次数
        uint256 royaltyPercentage;   // 版税百分比
        uint256 price;               // 价格(如果出售)
        bool isForSale;              // 是否出售
    }
    
    // 存储
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public creatorNFTs;
    mapping(string => uint256[]) public languageNFTs;
    mapping(string => uint256[]) public tagNFTs;
    
    // 事件
    event NFTMinted(uint256 indexed tokenId, address indexed creator, NFTType nftType, string language);
    event NFTUsed(uint256 indexed tokenId, address indexed user, uint256 royaltyPaid);
    event NFTPriceUpdated(uint256 indexed tokenId, uint256 newPrice, bool isForSale);
    event NFTRoyaltyUpdated(uint256 indexed tokenId, uint256 newRoyaltyPercentage);
    event NFTPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    
    /**
     * @dev 构造函数
     * @param _cultureToken CultureToken合约地址
     */
    constructor(address _cultureToken) ERC721("CultureBridge Cultural Knowledge", "CULT-NFT") {
        require(_cultureToken != address(0), "Invalid token address");
        cultureToken = CultureToken(_cultureToken);
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 铸造新的文化NFT
     * @param recipient 接收者地址
     * @param tokenURI 代币URI(IPFS)
     * @param nftType NFT类型
     * @param language 主要语言
     * @param relatedLanguages 相关语言
     * @param tags 标签
     * @param royaltyPercentage 版税百分比
     * @param price 价格
     * @param isForSale 是否出售
     */
    function mintNFT(
        address recipient,
        string memory tokenURI,
        NFTType nftType,
        string memory language,
        string[] memory relatedLanguages,
        string[] memory tags,
        uint256 royaltyPercentage,
        uint256 price,
        bool isForSale
    ) external whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(tokenURI).length > 0, "Empty token URI");
        require(bytes(language).length > 0, "Language required");
        require(royaltyPercentage <= 50, "Royalty too high"); // 最高50%
        
        // 增加计数器
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 铸造NFT
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // 存储元数据
        nftMetadata[newTokenId] = NFTMetadata({
            nftType: nftType,
            creator: msg.sender,
            language: language,
            relatedLanguages: relatedLanguages,
            tags: tags,
            creationDate: block.timestamp,
            usageCount: 0,
            royaltyPercentage: royaltyPercentage,
            price: price,
            isForSale: isForSale
        });
        
        // 更新索引
        creatorNFTs[msg.sender].push(newTokenId);
        languageNFTs[language].push(newTokenId);
        
        for (uint i = 0; i < relatedLanguages.length; i++) {
            languageNFTs[relatedLanguages[i]].push(newTokenId);
        }
        
        for (uint i = 0; i < tags.length; i++) {
            tagNFTs[tags[i]].push(newTokenId);
        }
        
        emit NFTMinted(newTokenId, msg.sender, nftType, language);
        
        return newTokenId;
    }
    
    /**
     * @dev 使用NFT并支付版税
     * @param tokenId 代币ID
     * @param user 使用者地址
     */
    function useNFT(uint256 tokenId, address user) 
        external 
        whenNotPaused 
        returns (bool) 
    {
        require(_exists(tokenId), "NFT does not exist");
        require(user != address(0), "Invalid user address");
        
        NFTMetadata storage metadata = nftMetadata[tokenId];
        address owner = ownerOf(tokenId);
        
        // 增加使用次数
        metadata.usageCount += 1;
        
        // 计算版税
        uint256 royaltyAmount = 0;
        if (metadata.royaltyPercentage > 0) {
            // 假设每次使用基础费用为1个代币
            uint256 baseUsageFee = 1 * 10**18;
            royaltyAmount = (baseUsageFee * metadata.royaltyPercentage) / 100;
            
            // 转移版税
            require(cultureToken.transferFrom(msg.sender, owner, royaltyAmount), "Royalty transfer failed");
        }
        
        emit NFTUsed(tokenId, user, royaltyAmount);
        
        return true;
    }
    
    /**
     * @dev 更新NFT价格和销售状态
     * @param tokenId 代币ID
     * @param newPrice 新价格
     * @param isForSale 是否出售
     */
    function updatePrice(uint256 tokenId, uint256 newPrice, bool isForSale) 
        external 
        whenNotPaused 
    {
        require(_exists(tokenId), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        NFTMetadata storage metadata = nftMetadata[tokenId];
        metadata.price = newPrice;
        metadata.isForSale = isForSale;
        
        emit NFTPriceUpdated(tokenId, newPrice, isForSale);
    }
    
    /**
     * @dev 更新NFT版税百分比
     * @param tokenId 代币ID
     * @param newRoyaltyPercentage 新版税百分比
     */
    function updateRoyalty(uint256 tokenId, uint256 newRoyaltyPercentage) 
        external 
        whenNotPaused 
    {
        require(_exists(tokenId), "NFT does not exist");
        require(nftMetadata[tokenId].creator == msg.sender, "Not the creator");
        require(newRoyaltyPercentage <= 50, "Royalty too high"); // 最高50%
        
        nftMetadata[tokenId].royaltyPercentage = newRoyaltyPercentage;
        
        emit NFTRoyaltyUpdated(tokenId, newRoyaltyPercentage);
    }
    
    /**
     * @dev 购买NFT
     * @param tokenId 代币ID
     */
    function purchaseNFT(uint256 tokenId) 
        external 
        whenNotPaused 
    {
        require(_exists(tokenId), "NFT does not exist");
        
        NFTMetadata storage metadata = nftMetadata[tokenId];
        require(metadata.isForSale, "NFT not for sale");
        
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");
        
        uint256 price = metadata.price;
        require(price > 0, "Invalid price");
        
        // 计算创建者版税
        uint256 creatorRoyalty = 0;
        if (metadata.creator != seller) {
            creatorRoyalty = (price * 10) / 100; // 10% 给创建者
        }
        
        // 计算平台费用
        uint256 platformFee = (price * 5) / 100; // 5% 平台费用
        
        // 计算卖家收入
        uint256 sellerProceeds = price - creatorRoyalty - platformFee;
        
        // 转移代币
        require(cultureToken.transferFrom(msg.sender, seller, sellerProceeds), "Payment to seller failed");
        
        if (creatorRoyalty > 0) {
            require(cultureToken.transferFrom(msg.sender, metadata.creator, creatorRoyalty), "Creator royalty payment failed");
        }
        
        if (platformFee > 0) {
            require(cultureToken.transferFrom(msg.sender, owner(), platformFee), "Platform fee payment failed");
        }
        
        // 转移NFT
        _transfer(seller, msg.sender, tokenId);
        
        // 更新销售状态
        metadata.isForSale = false;
        
        emit NFTPurchased(tokenId, msg.sender, seller, price);
    }
    
    /**
     * @dev 获取创建者的NFT列表
     * @param creator 创建者地址
     */
    function getCreatorNFTs(address creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorNFTs[creator];
    }
    
    /**
     * @dev 获取特定语言的NFT列表
     * @param language 语言
     */
    function getLanguageNFTs(string memory language) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return languageNFTs[language];
    }
    
    /**
     * @dev 获取特定标签的NFT列表
     * @param tag 标签
     */
    function getTagNFTs(string memory tag) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tagNFTs[tag];
    }
    
    /**
     * @dev 获取NFT详细信息
     * @param tokenId 代币ID
     */
    function getNFTDetails(uint256 tokenId) 
        external 
        view 
        returns (
            NFTType nftType,
            address creator,
            string memory language,
            string[] memory relatedLanguages,
            string[] memory tags,
            uint256 creationDate,
            uint256 usageCount,
            uint256 royaltyPercentage,
            uint256 price,
            bool isForSale,
            address currentOwner
        ) 
    {
        require(_exists(tokenId), "NFT does not exist");
        
        NFTMetadata storage metadata = nftMetadata[tokenId];
        address currentOwnerAddress = ownerOf(tokenId);
        
        return (
            metadata.nftType,
            metadata.creator,
            metadata.language,
            metadata.relatedLanguages,
            metadata.tags,
            metadata.creationDate,
            metadata.usageCount,
            metadata.royaltyPercentage,
            metadata.price,
            metadata.isForSale,
            currentOwnerAddress
        );
    }
    
    /**
     * @dev 转移前检查
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
