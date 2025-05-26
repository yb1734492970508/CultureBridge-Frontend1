// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CultureNFTContract
 * @dev 管理文化NFT的创建、转移和销毁
 */
contract CultureNFTContract is ERC721Enumerable, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    // NFT ID计数器
    Counters.Counter private _tokenIdCounter;
    
    // NFT元数据结构
    struct NFTMetadata {
        string title;
        string culturalCategory;
        address creator;
        uint256 creationTime;
        bool isListed;
        uint256 price;
    }
    
    // NFT ID到元数据的映射
    mapping(uint256 => NFTMetadata) public nftMetadata;
    
    // 创作者地址到其创建的NFT ID列表的映射
    mapping(address => uint256[]) private _creatorNFTs;
    
    // 文化类别到NFT ID列表的映射
    mapping(string => uint256[]) private _categoryNFTs;
    
    // 事件
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string title, uint256 timestamp);
    event NFTListed(uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event NFTUnlisted(uint256 indexed tokenId, uint256 timestamp);
    event NFTPriceChanged(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    
    /**
     * @dev 构造函数
     */
    constructor() ERC721("CultureBridge NFT", "CBNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev 铸造新的NFT
     * @param _to 接收者地址
     * @param _title NFT标题
     * @param _culturalCategory 文化类别
     * @param _tokenURI 元数据URI
     * @return 新铸造的NFT ID
     */
    function mintNFT(
        address _to,
        string memory _title,
        string memory _culturalCategory,
        string memory _tokenURI
    ) external nonReentrant returns (uint256) {
        require(hasRole(CREATOR_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Must have creator or admin role");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        nftMetadata[tokenId] = NFTMetadata({
            title: _title,
            culturalCategory: _culturalCategory,
            creator: msg.sender,
            creationTime: block.timestamp,
            isListed: false,
            price: 0
        });
        
        _creatorNFTs[msg.sender].push(tokenId);
        _categoryNFTs[_culturalCategory].push(tokenId);
        
        emit NFTMinted(tokenId, msg.sender, _title, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev 上架NFT销售
     * @param _tokenId NFT ID
     * @param _price 价格（以wei为单位）
     */
    function listNFT(uint256 _tokenId, uint256 _price) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price > 0, "Price must be greater than zero");
        
        nftMetadata[_tokenId].isListed = true;
        nftMetadata[_tokenId].price = _price;
        
        emit NFTListed(_tokenId, _price, block.timestamp);
    }
    
    /**
     * @dev 下架NFT
     * @param _tokenId NFT ID
     */
    function unlistNFT(uint256 _tokenId) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nftMetadata[_tokenId].isListed, "NFT not listed");
        
        nftMetadata[_tokenId].isListed = false;
        nftMetadata[_tokenId].price = 0;
        
        emit NFTUnlisted(_tokenId, block.timestamp);
    }
    
    /**
     * @dev 更改NFT价格
     * @param _tokenId NFT ID
     * @param _newPrice 新价格
     */
    function changeNFTPrice(uint256 _tokenId, uint256 _newPrice) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nftMetadata[_tokenId].isListed, "NFT not listed");
        require(_newPrice > 0, "Price must be greater than zero");
        
        uint256 oldPrice = nftMetadata[_tokenId].price;
        nftMetadata[_tokenId].price = _newPrice;
        
        emit NFTPriceChanged(_tokenId, oldPrice, _newPrice, block.timestamp);
    }
    
    /**
     * @dev 获取创作者创建的所有NFT
     * @param _creator 创作者地址
     * @return NFT ID列表
     */
    function getNFTsByCreator(address _creator) external view returns (uint256[] memory) {
        return _creatorNFTs[_creator];
    }
    
    /**
     * @dev 获取特定文化类别的所有NFT
     * @param _category 文化类别
     * @return NFT ID列表
     */
    function getNFTsByCategory(string memory _category) external view returns (uint256[] memory) {
        return _categoryNFTs[_category];
    }
    
    /**
     * @dev 获取NFT元数据
     * @param _tokenId NFT ID
     * @return NFT元数据
     */
    function getNFTMetadata(uint256 _tokenId) external view returns (NFTMetadata memory) {
        require(_exists(_tokenId), "NFT does not exist");
        return nftMetadata[_tokenId];
    }
    
    /**
     * @dev 获取所有上架销售的NFT
     * @return 上架销售的NFT ID列表
     */
    function getListedNFTs() external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256[] memory listedTokens = new uint256[](totalSupply);
        uint256 listedCount = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (nftMetadata[tokenId].isListed) {
                listedTokens[listedCount] = tokenId;
                listedCount++;
            }
        }
        
        // 调整数组大小以匹配实际上架数量
        uint256[] memory result = new uint256[](listedCount);
        for (uint256 i = 0; i < listedCount; i++) {
            result[i] = listedTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev 在转移前自动下架NFT
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        // 如果是转移（非铸造或销毁），则自动下架
        if (from != address(0) && to != address(0)) {
            if (nftMetadata[tokenId].isListed) {
                nftMetadata[tokenId].isListed = false;
                nftMetadata[tokenId].price = 0;
                
                emit NFTUnlisted(tokenId, block.timestamp);
            }
        }
        
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    // 以下函数用于解决继承冲突
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
