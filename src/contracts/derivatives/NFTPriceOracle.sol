// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title NFTPriceOracle
 * @dev 为NFT资产提供价格发现和估值服务的预言机合约
 */
contract NFTPriceOracle is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // 价格源类型
    enum PriceSourceType {
        MANUAL,       // 手动设置价格
        FLOOR_PRICE,  // 地板价
        LAST_SALE,    // 最近销售价格
        APPRAISAL,    // 专业评估
        AGGREGATED    // 聚合价格
    }

    // 价格数据结构
    struct PriceData {
        uint256 price;            // 价格（以wei为单位）
        uint256 timestamp;        // 时间戳
        PriceSourceType source;   // 价格来源
        address provider;         // 提供者
        uint256 confidence;       // 置信度（0-10000，表示0-100%）
        bool active;              // 是否活跃
    }

    // NFT集合价格数据
    struct CollectionPriceData {
        uint256 floorPrice;       // 地板价
        uint256 averagePrice;     // 平均价格
        uint256 volumeETH;        // 交易量（ETH）
        uint256 updateTimestamp;  // 更新时间戳
        bool active;              // 是否活跃
    }

    // 价格提供者结构
    struct PriceProvider {
        string name;              // 提供者名称
        uint256 weightage;        // 权重（0-10000）
        bool active;              // 是否活跃
    }

    // 映射存储
    mapping(address => mapping(uint256 => PriceData[])) private nftPrices;            // NFT合约地址 => tokenId => 价格历史
    mapping(address => mapping(uint256 => uint256)) private nftLatestPriceIndex;      // NFT合约地址 => tokenId => 最新价格索引
    mapping(address => CollectionPriceData) private collectionPrices;                 // NFT合约地址 => 集合价格数据
    mapping(address => PriceProvider) private priceProviders;                         // 价格提供者地址 => 提供者信息
    mapping(address => bool) private authorizedProviders;                             // 授权的价格提供者

    // 外部价格源接口
    mapping(address => AggregatorV3Interface) private externalPriceSources;           // NFT合约地址 => 外部价格源

    // 计数器
    Counters.Counter private _providerCount;

    // 常量
    uint256 public constant CONFIDENCE_PRECISION = 10000;  // 置信度精度
    uint256 public constant WEIGHTAGE_PRECISION = 10000;   // 权重精度
    uint256 public constant MIN_PRICE_THRESHOLD = 0.001 ether; // 最低价格阈值
    uint256 public constant MAX_PRICE_AGE = 7 days;        // 价格最大有效期

    // 事件
    event PriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 price, PriceSourceType source, address provider);
    event CollectionPriceUpdated(address indexed nftContract, uint256 floorPrice, uint256 averagePrice);
    event PriceProviderAdded(address indexed provider, string name, uint256 weightage);
    event PriceProviderRemoved(address indexed provider);
    event ExternalPriceSourceSet(address indexed nftContract, address indexed source);

    /**
     * @dev 构造函数
     * @param _owner 合约所有者地址
     */
    constructor(address _owner) {
        transferOwnership(_owner);
    }

    /**
     * @dev 添加价格提供者
     * @param _provider 提供者地址
     * @param _name 提供者名称
     * @param _weightage 权重（0-10000）
     */
    function addPriceProvider(address _provider, string memory _name, uint256 _weightage) external onlyOwner {
        require(_provider != address(0), "Invalid provider address");
        require(_weightage <= WEIGHTAGE_PRECISION, "Weightage exceeds maximum");
        require(!priceProviders[_provider].active, "Provider already exists");

        priceProviders[_provider] = PriceProvider({
            name: _name,
            weightage: _weightage,
            active: true
        });

        authorizedProviders[_provider] = true;
        _providerCount.increment();

        emit PriceProviderAdded(_provider, _name, _weightage);
    }

    /**
     * @dev 移除价格提供者
     * @param _provider 提供者地址
     */
    function removePriceProvider(address _provider) external onlyOwner {
        require(priceProviders[_provider].active, "Provider not active");

        priceProviders[_provider].active = false;
        authorizedProviders[_provider] = false;
        _providerCount.decrement();

        emit PriceProviderRemoved(_provider);
    }

    /**
     * @dev 设置外部价格源
     * @param _nftContract NFT合约地址
     * @param _source 外部价格源地址
     */
    function setExternalPriceSource(address _nftContract, address _source) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract");
        externalPriceSources[_nftContract] = AggregatorV3Interface(_source);

        emit ExternalPriceSourceSet(_nftContract, _source);
    }

    /**
     * @dev 更新NFT价格
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _price 价格（以wei为单位）
     * @param _source 价格来源
     * @param _confidence 置信度（0-10000）
     */
    function updateNFTPrice(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        PriceSourceType _source,
        uint256 _confidence
    ) external nonReentrant {
        require(authorizedProviders[msg.sender] || msg.sender == owner(), "Not authorized");
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_price >= MIN_PRICE_THRESHOLD, "Price below threshold");
        require(_confidence <= CONFIDENCE_PRECISION, "Confidence exceeds maximum");

        // 存储价格数据
        PriceData memory newPrice = PriceData({
            price: _price,
            timestamp: block.timestamp,
            source: _source,
            provider: msg.sender,
            confidence: _confidence,
            active: true
        });

        nftPrices[_nftContract][_tokenId].push(newPrice);
        nftLatestPriceIndex[_nftContract][_tokenId] = nftPrices[_nftContract][_tokenId].length - 1;

        emit PriceUpdated(_nftContract, _tokenId, _price, _source, msg.sender);
    }

    /**
     * @dev 更新NFT集合价格数据
     * @param _nftContract NFT合约地址
     * @param _floorPrice 地板价
     * @param _averagePrice 平均价格
     * @param _volumeETH 交易量（ETH）
     */
    function updateCollectionPrice(
        address _nftContract,
        uint256 _floorPrice,
        uint256 _averagePrice,
        uint256 _volumeETH
    ) external nonReentrant {
        require(authorizedProviders[msg.sender] || msg.sender == owner(), "Not authorized");
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_floorPrice >= MIN_PRICE_THRESHOLD, "Floor price below threshold");

        collectionPrices[_nftContract] = CollectionPriceData({
            floorPrice: _floorPrice,
            averagePrice: _averagePrice,
            volumeETH: _volumeETH,
            updateTimestamp: block.timestamp,
            active: true
        });

        emit CollectionPriceUpdated(_nftContract, _floorPrice, _averagePrice);
    }

    /**
     * @dev 获取NFT的最新价格
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @return price 价格（以wei为单位）
     * @return timestamp 时间戳
     * @return confidence 置信度
     */
    function getNFTLatestPrice(address _nftContract, uint256 _tokenId) 
        external 
        view 
        returns (uint256 price, uint256 timestamp, uint256 confidence) 
    {
        uint256 latestIndex = nftLatestPriceIndex[_nftContract][_tokenId];
        
        if (nftPrices[_nftContract][_tokenId].length == 0) {
            // 如果没有特定NFT的价格，尝试使用集合地板价
            if (collectionPrices[_nftContract].active) {
                return (
                    collectionPrices[_nftContract].floorPrice,
                    collectionPrices[_nftContract].updateTimestamp,
                    CONFIDENCE_PRECISION / 2  // 50%置信度
                );
            }
            
            // 如果没有集合价格，尝试使用外部价格源
            if (address(externalPriceSources[_nftContract]) != address(0)) {
                try externalPriceSources[_nftContract].latestRoundData() returns (
                    uint80 roundId,
                    int256 answer,
                    uint256 startedAt,
                    uint256 updatedAt,
                    uint80 answeredInRound
                ) {
                    if (answer > 0) {
                        return (uint256(answer), updatedAt, CONFIDENCE_PRECISION / 2);
                    }
                } catch {
                    // 外部价格源调用失败，返回零值
                }
            }
            
            return (0, 0, 0);
        }
        
        PriceData storage latestPrice = nftPrices[_nftContract][_tokenId][latestIndex];
        
        // 检查价格是否过期
        if (block.timestamp - latestPrice.timestamp > MAX_PRICE_AGE) {
            confidence = latestPrice.confidence / 2;  // 过期价格降低置信度
        } else {
            confidence = latestPrice.confidence;
        }
        
        return (latestPrice.price, latestPrice.timestamp, confidence);
    }

    /**
     * @dev 获取NFT的价格历史
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @param _count 返回的历史记录数量
     * @return prices 价格数组
     * @return timestamps 时间戳数组
     * @return sources 价格来源数组
     */
    function getNFTPriceHistory(
        address _nftContract,
        uint256 _tokenId,
        uint256 _count
    ) 
        external 
        view 
        returns (
            uint256[] memory prices,
            uint256[] memory timestamps,
            PriceSourceType[] memory sources
        ) 
    {
        uint256 historyLength = nftPrices[_nftContract][_tokenId].length;
        uint256 resultCount = _count > historyLength ? historyLength : _count;
        
        prices = new uint256[](resultCount);
        timestamps = new uint256[](resultCount);
        sources = new PriceSourceType[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 index = historyLength - 1 - i;
            PriceData storage priceData = nftPrices[_nftContract][_tokenId][index];
            
            prices[i] = priceData.price;
            timestamps[i] = priceData.timestamp;
            sources[i] = priceData.source;
        }
        
        return (prices, timestamps, sources);
    }

    /**
     * @dev 获取NFT集合价格数据
     * @param _nftContract NFT合约地址
     * @return floorPrice 地板价
     * @return averagePrice 平均价格
     * @return volumeETH 交易量（ETH）
     * @return updateTimestamp 更新时间戳
     */
    function getCollectionPriceData(address _nftContract) 
        external 
        view 
        returns (
            uint256 floorPrice,
            uint256 averagePrice,
            uint256 volumeETH,
            uint256 updateTimestamp
        ) 
    {
        CollectionPriceData storage data = collectionPrices[_nftContract];
        
        return (
            data.floorPrice,
            data.averagePrice,
            data.volumeETH,
            data.updateTimestamp
        );
    }

    /**
     * @dev 估算NFT价值
     * @param _nftContract NFT合约地址
     * @param _tokenId NFT的tokenId
     * @return estimatedValue 估计价值
     * @return confidence 置信度
     */
    function estimateNFTValue(address _nftContract, uint256 _tokenId) 
        external 
        view 
        returns (uint256 estimatedValue, uint256 confidence) 
    {
        // 获取最新价格
        (uint256 latestPrice, uint256 timestamp, uint256 latestConfidence) = this.getNFTLatestPrice(_nftContract, _tokenId);
        
        // 如果有最新价格且未过期，直接返回
        if (latestPrice > 0 && block.timestamp - timestamp <= MAX_PRICE_AGE) {
            return (latestPrice, latestConfidence);
        }
        
        // 如果价格过期或不存在，尝试使用集合价格
        CollectionPriceData storage collectionData = collectionPrices[_nftContract];
        if (collectionData.active && block.timestamp - collectionData.updateTimestamp <= MAX_PRICE_AGE) {
            return (collectionData.floorPrice, CONFIDENCE_PRECISION / 2);  // 50%置信度
        }
        
        // 如果没有可用价格，返回零值
        return (0, 0);
    }

    /**
     * @dev 批量获取NFT价格
     * @param _nftContracts NFT合约地址数组
     * @param _tokenIds NFT的tokenId数组
     * @return prices 价格数组
     * @return confidences 置信度数组
     */
    function batchGetNFTPrices(
        address[] calldata _nftContracts,
        uint256[] calldata _tokenIds
    ) 
        external 
        view 
        returns (uint256[] memory prices, uint256[] memory confidences) 
    {
        require(_nftContracts.length == _tokenIds.length, "Array length mismatch");
        
        uint256 length = _nftContracts.length;
        prices = new uint256[](length);
        confidences = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            (prices[i], , confidences[i]) = this.getNFTLatestPrice(_nftContracts[i], _tokenIds[i]);
        }
        
        return (prices, confidences);
    }

    /**
     * @dev 检查价格提供者状态
     * @param _provider 提供者地址
     * @return isActive 是否活跃
     * @return name 提供者名称
     * @return weightage 权重
     */
    function checkPriceProvider(address _provider) 
        external 
        view 
        returns (bool isActive, string memory name, uint256 weightage) 
    {
        PriceProvider storage provider = priceProviders[_provider];
        
        return (provider.active, provider.name, provider.weightage);
    }

    /**
     * @dev 获取价格提供者数量
     * @return count 提供者数量
     */
    function getPriceProviderCount() external view returns (uint256 count) {
        return _providerCount.current();
    }
}
