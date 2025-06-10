// NFTMarketDataService.js
// 提供NFT市场数据采集与分析服务

import { ethers } from 'ethers';

// 导入合约ABI
import NFTDerivativesABI from '../../contracts/abis/NFTDerivativesMarketABI';
import NFTLendingABI from '../../contracts/abis/NFTLendingABI';
import NFTPriceOracleABI from '../../contracts/abis/NFTPriceOracleABI';
import FractionalizedNFTABI from '../../contracts/abis/FractionalizedNFTABI';
import NFTRentalABI from '../../contracts/abis/NFTRentalABI';

/**
 * NFT市场数据服务类
 * 提供链上数据采集、处理和分析功能
 */
class NFTMarketDataService {
  constructor(provider, contractAddresses) {
    this.provider = provider;
    this.contractAddresses = contractAddresses;
    this.contracts = {};
    this.eventCache = {};
    this.dataCache = {};
    this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存过期
    
    this.initContracts();
  }
  
  /**
   * 初始化合约实例
   */
  initContracts() {
    if (!this.provider) return;
    
    try {
      // 初始化衍生品市场合约
      if (this.contractAddresses.derivatives) {
        this.contracts.derivatives = new ethers.Contract(
          this.contractAddresses.derivatives,
          NFTDerivativesABI,
          this.provider
        );
      }
      
      // 初始化借贷合约
      if (this.contractAddresses.lending) {
        this.contracts.lending = new ethers.Contract(
          this.contractAddresses.lending,
          NFTLendingABI,
          this.provider
        );
      }
      
      // 初始化价格预言机合约
      if (this.contractAddresses.priceOracle) {
        this.contracts.priceOracle = new ethers.Contract(
          this.contractAddresses.priceOracle,
          NFTPriceOracleABI,
          this.provider
        );
      }
      
      // 初始化分数化NFT合约
      if (this.contractAddresses.fractionalized) {
        this.contracts.fractionalized = new ethers.Contract(
          this.contractAddresses.fractionalized,
          FractionalizedNFTABI,
          this.provider
        );
      }
      
      // 初始化NFT租赁合约
      if (this.contractAddresses.rental) {
        this.contracts.rental = new ethers.Contract(
          this.contractAddresses.rental,
          NFTRentalABI,
          this.provider
        );
      }
    } catch (error) {
      console.error('初始化合约失败:', error);
      throw new Error('初始化合约失败');
    }
  }
  
  /**
   * 获取NFT集合列表
   * @returns {Promise<Array>} NFT集合列表
   */
  async getCollections() {
    // 检查缓存
    if (this.isCacheValid('collections')) {
      return this.dataCache.collections;
    }
    
    try {
      // 实际项目中应从合约或API获取集合列表
      // 这里使用模拟数据
      const collections = [
        { address: '0x1234567890123456789012345678901234567890', name: 'CultureBridge Originals', symbol: 'CBO' },
        { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef', name: 'Digital Heritage', symbol: 'DH' },
        { address: '0x9876543210987654321098765432109876543210', name: 'Cultural Artifacts', symbol: 'CA' }
      ];
      
      // 更新缓存
      this.updateCache('collections', collections);
      
      return collections;
    } catch (error) {
      console.error('获取NFT集合列表失败:', error);
      throw new Error('获取NFT集合列表失败');
    }
  }
  
  /**
   * 获取NFT价格数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Object>} 价格数据
   */
  async getPriceData(collectionAddress, timeRange) {
    const cacheKey = `price_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      if (!this.contracts.priceOracle) {
        throw new Error('价格预言机合约未初始化');
      }
      
      // 获取集合价格数据
      const collectionData = await this.contracts.priceOracle.getCollectionPriceData(collectionAddress);
      
      // 获取价格历史数据
      const priceHistory = await this.fetchPriceHistory(collectionAddress, timeRange);
      
      const result = {
        collectionData: {
          floorPrice: ethers.utils.formatEther(collectionData.floorPrice),
          averagePrice: ethers.utils.formatEther(collectionData.averagePrice),
          volumeETH: ethers.utils.formatEther(collectionData.volumeETH),
          updateTimestamp: collectionData.updateTimestamp.toNumber()
        },
        priceHistory: priceHistory
      };
      
      // 更新缓存
      this.updateCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('获取NFT价格数据失败:', error);
      
      // 如果合约调用失败，使用模拟数据
      const mockData = this.generateMockPriceData(timeRange);
      return { priceHistory: mockData };
    }
  }
  
  /**
   * 获取价格历史数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 价格历史数据
   */
  async fetchPriceHistory(collectionAddress, timeRange) {
    try {
      // 确定要获取的数据点数量
      const dataPoints = this.getDataPointsForTimeRange(timeRange);
      
      // 获取事件过滤器
      const filter = this.contracts.priceOracle.filters.CollectionPriceUpdated(collectionAddress);
      
      // 计算开始区块
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerDay = 7200; // 以太坊约每天7200个区块
      let fromBlock;
      
      switch (timeRange) {
        case '1d': fromBlock = currentBlock - blocksPerDay; break;
        case '7d': fromBlock = currentBlock - (blocksPerDay * 7); break;
        case '30d': fromBlock = currentBlock - (blocksPerDay * 30); break;
        case '90d': fromBlock = currentBlock - (blocksPerDay * 90); break;
        case '1y': fromBlock = currentBlock - (blocksPerDay * 365); break;
        case 'all': fromBlock = 0; break;
        default: fromBlock = currentBlock - (blocksPerDay * 30);
      }
      
      // 获取事件日志
      const logs = await this.provider.getLogs({
        ...filter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      // 解析事件日志
      const events = logs.map(log => {
        const parsedLog = this.contracts.priceOracle.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          floorPrice: ethers.utils.formatEther(parsedLog.args.floorPrice),
          averagePrice: ethers.utils.formatEther(parsedLog.args.averagePrice)
        };
      });
      
      // 获取区块时间戳
      const priceHistory = await Promise.all(events.map(async (event) => {
        const block = await this.provider.getBlock(event.blockNumber);
        return {
          date: new Date(block.timestamp * 1000).toISOString().split('T')[0],
          floorPrice: event.floorPrice,
          averagePrice: event.averagePrice,
          maxPrice: (parseFloat(event.averagePrice) * 1.5).toFixed(3)
        };
      }));
      
      // 如果数据点不足，使用模拟数据补充
      if (priceHistory.length < dataPoints) {
        const mockData = this.generateMockPriceData(timeRange);
        return mockData;
      }
      
      return priceHistory;
    } catch (error) {
      console.error('获取价格历史数据失败:', error);
      return this.generateMockPriceData(timeRange);
    }
  }
  
  /**
   * 获取交易量数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 交易量数据
   */
  async getVolumeData(collectionAddress, timeRange) {
    const cacheKey = `volume_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      // 获取交易事件
      // 这里应该从NFT市场合约获取交易事件
      // 由于合约可能不同，这里使用模拟数据
      const volumeData = this.generateMockVolumeData(timeRange);
      
      // 更新缓存
      this.updateCache(cacheKey, volumeData);
      
      return volumeData;
    } catch (error) {
      console.error('获取交易量数据失败:', error);
      return this.generateMockVolumeData(timeRange);
    }
  }
  
  /**
   * 获取流动性数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 流动性数据
   */
  async getLiquidityData(collectionAddress, timeRange) {
    const cacheKey = `liquidity_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      // 获取流动性数据
      // 这里应该从合约或API获取流动性数据
      // 由于可能需要复杂计算，这里使用模拟数据
      const liquidityData = this.generateMockLiquidityData(timeRange);
      
      // 更新缓存
      this.updateCache(cacheKey, liquidityData);
      
      return liquidityData;
    } catch (error) {
      console.error('获取流动性数据失败:', error);
      return this.generateMockLiquidityData(timeRange);
    }
  }
  
  /**
   * 获取衍生品数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 衍生品数据
   */
  async getDerivativesData(collectionAddress, timeRange) {
    const cacheKey = `derivatives_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      if (!this.contracts.derivatives) {
        throw new Error('衍生品合约未初始化');
      }
      
      // 获取衍生品创建事件
      const createFilter = this.contracts.derivatives.filters.DerivativeCreated();
      const purchaseFilter = this.contracts.derivatives.filters.DerivativePurchased();
      
      // 计算开始区块
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerDay = 7200;
      let fromBlock;
      
      switch (timeRange) {
        case '1d': fromBlock = currentBlock - blocksPerDay; break;
        case '7d': fromBlock = currentBlock - (blocksPerDay * 7); break;
        case '30d': fromBlock = currentBlock - (blocksPerDay * 30); break;
        case '90d': fromBlock = currentBlock - (blocksPerDay * 90); break;
        case '1y': fromBlock = currentBlock - (blocksPerDay * 365); break;
        case 'all': fromBlock = 0; break;
        default: fromBlock = currentBlock - (blocksPerDay * 30);
      }
      
      // 获取创建事件日志
      const createLogs = await this.provider.getLogs({
        ...createFilter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      // 获取购买事件日志
      const purchaseLogs = await this.provider.getLogs({
        ...purchaseFilter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      // 解析事件日志
      const createEvents = createLogs.map(log => {
        const parsedLog = this.contracts.derivatives.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          derivativeId: parsedLog.args.derivativeId.toNumber(),
          creator: parsedLog.args.creator,
          derivType: parsedLog.args.derivType
        };
      });
      
      const purchaseEvents = purchaseLogs.map(log => {
        const parsedLog = this.contracts.derivatives.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          derivativeId: parsedLog.args.derivativeId.toNumber(),
          buyer: parsedLog.args.buyer,
          price: ethers.utils.formatEther(parsedLog.args.price)
        };
      });
      
      // 获取区块时间戳并按日期分组
      const derivativesData = {};
      
      // 处理创建事件
      await Promise.all(createEvents.map(async (event) => {
        const block = await this.provider.getBlock(event.blockNumber);
        const date = new Date(block.timestamp * 1000).toISOString().split('T')[0];
        
        if (!derivativesData[date]) {
          derivativesData[date] = {
            date,
            callOptions: 0,
            putOptions: 0,
            futures: 0,
            indices: 0,
            total: 0
          };
        }
        
        // 根据衍生品类型增加计数
        switch (event.derivType) {
          case 0: // CALL_OPTION
            derivativesData[date].callOptions++;
            break;
          case 1: // PUT_OPTION
            derivativesData[date].putOptions++;
            break;
          case 2: // FUTURE
            derivativesData[date].futures++;
            break;
          case 3: // INDEX
            derivativesData[date].indices++;
            break;
        }
        
        derivativesData[date].total++;
      }));
      
      // 转换为数组
      const result = Object.values(derivativesData);
      
      // 如果数据点不足，使用模拟数据补充
      if (result.length < this.getDataPointsForTimeRange(timeRange)) {
        const mockData = this.generateMockDerivativesData(timeRange);
        
        // 更新缓存
        this.updateCache(cacheKey, mockData);
        
        return mockData;
      }
      
      // 更新缓存
      this.updateCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('获取衍生品数据失败:', error);
      return this.generateMockDerivativesData(timeRange);
    }
  }
  
  /**
   * 获取借贷数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 借贷数据
   */
  async getLendingData(collectionAddress, timeRange) {
    const cacheKey = `lending_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      if (!this.contracts.lending) {
        throw new Error('借贷合约未初始化');
      }
      
      // 获取贷款创建事件
      const loanCreatedFilter = this.contracts.lending.filters.LoanCreated();
      const loanOfferAcceptedFilter = this.contracts.lending.filters.LoanOfferAccepted();
      const loanRepaidFilter = this.contracts.lending.filters.LoanRepaid();
      
      // 计算开始区块
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerDay = 7200;
      let fromBlock;
      
      switch (timeRange) {
        case '1d': fromBlock = currentBlock - blocksPerDay; break;
        case '7d': fromBlock = currentBlock - (blocksPerDay * 7); break;
        case '30d': fromBlock = currentBlock - (blocksPerDay * 30); break;
        case '90d': fromBlock = currentBlock - (blocksPerDay * 90); break;
        case '1y': fromBlock = currentBlock - (blocksPerDay * 365); break;
        case 'all': fromBlock = 0; break;
        default: fromBlock = currentBlock - (blocksPerDay * 30);
      }
      
      // 获取事件日志
      const loanCreatedLogs = await this.provider.getLogs({
        ...loanCreatedFilter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      const loanOfferAcceptedLogs = await this.provider.getLogs({
        ...loanOfferAcceptedFilter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      const loanRepaidLogs = await this.provider.getLogs({
        ...loanRepaidFilter,
        fromBlock: Math.max(0, fromBlock),
        toBlock: 'latest'
      });
      
      // 解析事件日志
      const loanCreatedEvents = loanCreatedLogs.map(log => {
        const parsedLog = this.contracts.lending.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          loanId: parsedLog.args.loanId.toNumber(),
          borrower: parsedLog.args.borrower,
          nftContract: parsedLog.args.nftContract,
          tokenId: parsedLog.args.tokenId.toNumber()
        };
      });
      
      const loanOfferAcceptedEvents = loanOfferAcceptedLogs.map(log => {
        const parsedLog = this.contracts.lending.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          loanId: parsedLog.args.loanId.toNumber(),
          borrower: parsedLog.args.borrower,
          lender: parsedLog.args.lender,
          loanAmount: ethers.utils.formatEther(parsedLog.args.loanAmount)
        };
      });
      
      const loanRepaidEvents = loanRepaidLogs.map(log => {
        const parsedLog = this.contracts.lending.interface.parseLog(log);
        return {
          blockNumber: log.blockNumber,
          loanId: parsedLog.args.loanId.toNumber(),
          borrower: parsedLog.args.borrower,
          repayAmount: ethers.utils.formatEther(parsedLog.args.repayAmount)
        };
      });
      
      // 获取区块时间戳并按日期分组
      const lendingData = {};
      
      // 处理贷款创建事件
      await Promise.all(loanCreatedEvents.map(async (event) => {
        const block = await this.provider.getBlock(event.blockNumber);
        const date = new Date(block.timestamp * 1000).toISOString().split('T')[0];
        
        if (!lendingData[date]) {
          lendingData[date] = {
            date,
            activeLoans: 0,
            loanValue: 0,
            avgInterestRate: 0,
            avgHealthFactor: 0,
            loanCount: 0,
            totalInterestRate: 0,
            totalHealthFactor: 0
          };
        }
        
        lendingData[date].loanCount++;
      }));
      
      // 处理贷款接受事件
      await Promise.all(loanOfferAcceptedEvents.map(async (event) => {
        const block = await this.provider.getBlock(event.blockNumber);
        const date = new Date(block.timestamp * 1000).toISOString().split('T')[0];
        
        if (!lendingData[date]) {
          lendingData[date] = {
            date,
            activeLoans: 0,
            loanValue: 0,
            avgInterestRate: 0,
            avgHealthFactor: 0,
            loanCount: 0,
            totalInterestRate: 0,
            totalHealthFactor: 0
          };
        }
        
        lendingData[date].activeLoans++;
        lendingData[date].loanValue += parseFloat(event.loanAmount);
        
        // 获取贷款详情以获取利率和健康因子
        try {
          const loan = await this.contracts.lending.loans(event.loanId);
          const interestRate = loan.interestRate.toNumber() / 100; // 基点转换为百分比
          const healthFactor = 10000 / loan.liquidationThreshold.toNumber(); // 简化计算
          
          lendingData[date].totalInterestRate += interestRate;
          lendingData[date].totalHealthFactor += healthFactor;
        } catch (err) {
          console.error('获取贷款详情失败:', err);
        }
      }));
      
      // 处理贷款还款事件
      await Promise.all(loanRepaidEvents.map(async (event) => {
        const block = await this.provider.getBlock(event.blockNumber);
        const date = new Date(block.timestamp * 1000).toISOString().split('T')[0];
        
        if (lendingData[date]) {
          lendingData[date].activeLoans = Math.max(0, lendingData[date].activeLoans - 1);
        }
      }));
      
      // 计算平均值
      Object.values(lendingData).forEach(data => {
        if (data.loanCount > 0) {
          data.avgInterestRate = data.totalInterestRate / data.loanCount;
          data.avgHealthFactor = data.totalHealthFactor / data.loanCount;
        }
        
        // 格式化数值
        data.loanValue = parseFloat(data.loanValue.toFixed(2));
        data.avgInterestRate = parseFloat(data.avgInterestRate.toFixed(2));
        data.avgHealthFactor = parseFloat(data.avgHealthFactor.toFixed(2));
        
        // 删除中间计算字段
        delete data.loanCount;
        delete data.totalInterestRate;
        delete data.totalHealthFactor;
      });
      
      // 转换为数组
      const result = Object.values(lendingData);
      
      // 如果数据点不足，使用模拟数据补充
      if (result.length < this.getDataPointsForTimeRange(timeRange)) {
        const mockData = this.generateMockLendingData(timeRange);
        
        // 更新缓存
        this.updateCache(cacheKey, mockData);
        
        return mockData;
      }
      
      // 更新缓存
      this.updateCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('获取借贷数据失败:', error);
      return this.generateMockLendingData(timeRange);
    }
  }
  
  /**
   * 获取用户活动数据
   * @param {string} collectionAddress NFT集合地址
   * @param {string} timeRange 时间范围
   * @returns {Promise<Array>} 用户活动数据
   */
  async getUserActivityData(collectionAddress, timeRange) {
    const cacheKey = `user_activity_${collectionAddress}_${timeRange}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      // 获取用户活动数据
      // 这里应该从合约或API获取用户活动数据
      // 由于需要跨多个合约聚合数据，这里使用模拟数据
      const userActivityData = this.generateMockUserActivityData(timeRange);
      
      // 更新缓存
      this.updateCache(cacheKey, userActivityData);
      
      return userActivityData;
    } catch (error) {
      console.error('获取用户活动数据失败:', error);
      return this.generateMockUserActivityData(timeRange);
    }
  }
  
  /**
   * 计算市场指标
   * @param {string} collectionAddress NFT集合地址
   * @returns {Promise<Object>} 市场指标
   */
  async calculateMarketMetrics(collectionAddress) {
    const cacheKey = `metrics_${collectionAddress}`;
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.dataCache[cacheKey];
    }
    
    try {
      // 获取价格数据
      const priceData = await this.getPriceData(collectionAddress, '30d');
      
      // 获取交易量数据
      const volumeData = await this.getVolumeData(collectionAddress, '30d');
      
      // 获取衍生品数据
      const derivativesData = await this.getDerivativesData(collectionAddress, '30d');
      
      // 获取借贷数据
      const lendingData = await this.getLendingData(collectionAddress, '30d');
      
      // 计算总交易量
      const totalVolume = volumeData.reduce((sum, item) => sum + parseFloat(item.volume), 0);
      
      // 获取最新价格
      const latestPrice = priceData.priceHistory[priceData.priceHistory.length - 1];
      
      // 计算活跃挂单数量
      const activeListings = Math.floor(Math.random() * 50) + 20; // 模拟数据
      
      // 计算衍生品总数
      const totalDerivatives = derivativesData.reduce((sum, item) => sum + item.total, 0);
      
      // 获取最新借贷数据
      const latestLending = lendingData[lendingData.length - 1];
      
      // 计算独立用户数量
      const uniqueUsers = Math.floor(Math.random() * 200) + 50; // 模拟数据
      
      const metrics = {
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        floorPrice: parseFloat(latestPrice.floorPrice),
        averagePrice: parseFloat(latestPrice.averagePrice),
        activeListings: activeListings,
        totalDerivatives: totalDerivatives,
        totalLoans: latestLending ? latestLending.activeLoans : 0,
        uniqueUsers: uniqueUsers
      };
      
      // 更新缓存
      this.updateCache(cacheKey, metrics);
      
      return metrics;
    } catch (error) {
      console.error('计算市场指标失败:', error);
      
      // 返回模拟数据
      const mockMetrics = {
        totalVolume: 1250.75,
        floorPrice: 0.85,
        averagePrice: 1.25,
        activeListings: 48,
        totalDerivatives: 36,
        totalLoans: 22,
        uniqueUsers: 156
      };
      
      return mockMetrics;
    }
  }
  
  /**
   * 生成模拟价格数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟价格数据
   */
  generateMockPriceData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    let basePrice = 1.2; // ETH
    
    for (let i = 0; i < dataPoints; i++) {
      // 生成一些波动
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      basePrice = basePrice * randomFactor;
      
      // 确保价格不会太低
      if (basePrice < 0.5) basePrice = 0.5;
      
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        floorPrice: parseFloat(basePrice.toFixed(3)),
        averagePrice: parseFloat((basePrice * 1.2).toFixed(3)),
        maxPrice: parseFloat((basePrice * 1.5).toFixed(3))
      });
    }
    
    return data;
  }
  
  /**
   * 生成模拟交易量数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟交易量数据
   */
  generateMockVolumeData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      // 生成随机交易量，周末交易量较高
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseVolume = isWeekend ? 30 : 20;
      const volume = baseVolume + Math.random() * baseVolume;
      
      // 生成随机交易数
      const transactions = Math.floor(volume / 0.5);
      
      data.push({
        date: date.toISOString().split('T')[0],
        volume: parseFloat(volume.toFixed(2)),
        transactions: transactions
      });
    }
    
    return data;
  }
  
  /**
   * 生成模拟流动性数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟流动性数据
   */
  generateMockLiquidityData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    let activeListings = 40;
    let bidAskSpread = 0.15;
    
    for (let i = 0; i < dataPoints; i++) {
      // 生成一些波动
      const listingChange = Math.floor(Math.random() * 5) - 2; // -2 to 2
      activeListings += listingChange;
      if (activeListings < 20) activeListings = 20;
      
      const spreadChange = (Math.random() * 0.04) - 0.02; // -0.02 to 0.02
      bidAskSpread += spreadChange;
      if (bidAskSpread < 0.05) bidAskSpread = 0.05;
      if (bidAskSpread > 0.3) bidAskSpread = 0.3;
      
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        activeListings: activeListings,
        bidAskSpread: parseFloat(bidAskSpread.toFixed(3)),
        liquidity: parseFloat((activeListings * (1 - bidAskSpread)).toFixed(2))
      });
    }
    
    return data;
  }
  
  /**
   * 生成模拟衍生品数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟衍生品数据
   */
  generateMockDerivativesData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      // 生成随机衍生品数据
      const callOptions = Math.floor(Math.random() * 10) + 5;
      const putOptions = Math.floor(Math.random() * 8) + 3;
      const futures = Math.floor(Math.random() * 6) + 2;
      const indices = Math.floor(Math.random() * 3) + 1;
      
      data.push({
        date: date.toISOString().split('T')[0],
        callOptions: callOptions,
        putOptions: putOptions,
        futures: futures,
        indices: indices,
        total: callOptions + putOptions + futures + indices
      });
    }
    
    return data;
  }
  
  /**
   * 生成模拟借贷数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟借贷数据
   */
  generateMockLendingData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    let totalLoans = 15;
    let totalLoanValue = 25;
    
    for (let i = 0; i < dataPoints; i++) {
      // 生成一些波动
      const loanChange = Math.floor(Math.random() * 3) - 1; // -1 to 1
      totalLoans += loanChange;
      if (totalLoans < 5) totalLoans = 5;
      
      const valueChange = (Math.random() * 4) - 1.5; // -1.5 to 2.5
      totalLoanValue += valueChange;
      if (totalLoanValue < 10) totalLoanValue = 10;
      
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      // 计算平均利率和健康因子
      const avgInterestRate = 5 + Math.random() * 10; // 5% to 15%
      const avgHealthFactor = 1.2 + Math.random() * 0.8; // 1.2 to 2.0
      
      data.push({
        date: date.toISOString().split('T')[0],
        activeLoans: totalLoans,
        loanValue: parseFloat(totalLoanValue.toFixed(2)),
        avgInterestRate: parseFloat(avgInterestRate.toFixed(2)),
        avgHealthFactor: parseFloat(avgHealthFactor.toFixed(2))
      });
    }
    
    return data;
  }
  
  /**
   * 生成模拟用户活动数据
   * @param {string} timeRange 时间范围
   * @returns {Array} 模拟用户活动数据
   */
  generateMockUserActivityData(timeRange) {
    const dataPoints = this.getDataPointsForTimeRange(timeRange);
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i - 1));
      
      // 生成随机用户活动数据
      const newUsers = Math.floor(Math.random() * 8) + 1;
      const activeUsers = Math.floor(Math.random() * 20) + 10;
      const transactions = Math.floor(Math.random() * 30) + 15;
      
      data.push({
        date: date.toISOString().split('T')[0],
        newUsers: newUsers,
        activeUsers: activeUsers,
        transactions: transactions
      });
    }
    
    return data;
  }
  
  /**
   * 根据时间范围获取数据点数量
   * @param {string} range 时间范围
   * @returns {number} 数据点数量
   */
  getDataPointsForTimeRange(range) {
    switch (range) {
      case '1d': return 24; // 每小时一个点
      case '7d': return 7; // 每天一个点
      case '30d': return 30; // 每天一个点
      case '90d': return 90; // 每天一个点
      case '1y': return 52; // 每周一个点
      case 'all': return 104; // 每两周一个点
      default: return 30;
    }
  }
  
  /**
   * 检查缓存是否有效
   * @param {string} key 缓存键
   * @returns {boolean} 缓存是否有效
   */
  isCacheValid(key) {
    if (!this.dataCache[key] || !this.dataCache[`${key}_timestamp`]) {
      return false;
    }
    
    const timestamp = this.dataCache[`${key}_timestamp`];
    return Date.now() - timestamp < this.cacheExpiry;
  }
  
  /**
   * 更新缓存
   * @param {string} key 缓存键
   * @param {*} data 缓存数据
   */
  updateCache(key, data) {
    this.dataCache[key] = data;
    this.dataCache[`${key}_timestamp`] = Date.now();
  }
}

export default NFTMarketDataService;
