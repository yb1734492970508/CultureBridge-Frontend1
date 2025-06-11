// NFTMarketAnalytics.js
// 提供NFT市场数据分析与可视化功能

import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Row, Col, Tabs, Tab, Spinner, Alert, Form, Button, Dropdown } from 'react-bootstrap';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaChartArea, 
  FaEthereum, FaCalendarAlt, FaFilter, FaDownload, FaInfoCircle
} from 'react-icons/fa';

import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';
import './NFTMarketAnalytics.css';

// 导入合约ABI
import NFTDerivativesABI from '../../contracts/abis/NFTDerivativesMarketABI';
import NFTLendingABI from '../../contracts/abis/NFTLendingABI';
import NFTPriceOracleABI from '../../contracts/abis/NFTPriceOracleABI';

/**
 * NFT市场数据分析与可视化组件
 * 提供价格趋势、交易量、流动性和用户行为等多维数据分析
 */
const NFTMarketAnalytics = ({ 
  derivativesContract, 
  lendingContract, 
  priceOracleContract,
  onExport 
}) => {
  const { account, library } = useWeb3React();
  const { isConnected } = useContext(Web3Context);
  const { addNotification } = useContext(NotificationContext);

  // 状态变量
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('price');
  const [timeRange, setTimeRange] = useState('30d'); // 1d, 7d, 30d, 90d, 1y, all
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [liquidityData, setLiquidityData] = useState([]);
  const [derivativesData, setDerivativesData] = useState([]);
  const [lendingData, setLendingData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [marketMetrics, setMarketMetrics] = useState({
    totalVolume: 0,
    floorPrice: 0,
    averagePrice: 0,
    activeListings: 0,
    totalDerivatives: 0,
    totalLoans: 0,
    uniqueUsers: 0
  });

  // 初始化
  useEffect(() => {
    if (isConnected && account) {
      loadCollections();
    }
  }, [isConnected, account]);

  // 当选择的集合或时间范围变化时，加载数据
  useEffect(() => {
    if (selectedCollection) {
      loadMarketData();
    }
  }, [selectedCollection, timeRange]);

  // 加载NFT集合列表
  const loadCollections = async () => {
    try {
      setLoading(true);
      
      // 这里应该从合约或API获取集合列表
      // 示例数据
      const mockCollections = [
        { address: '0x1234567890123456789012345678901234567890', name: 'CultureBridge Originals', symbol: 'CBO' },
        { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef', name: 'Digital Heritage', symbol: 'DH' },
        { address: '0x9876543210987654321098765432109876543210', name: 'Cultural Artifacts', symbol: 'CA' }
      ];
      
      setCollections(mockCollections);
      
      // 默认选择第一个集合
      if (mockCollections.length > 0 && !selectedCollection) {
        setSelectedCollection(mockCollections[0]);
      }
      
    } catch (err) {
      console.error('加载NFT集合失败:', err);
      setError('无法加载NFT集合列表。');
    } finally {
      setLoading(false);
    }
  };

  // 加载市场数据
  const loadMarketData = async () => {
    if (!selectedCollection || !priceOracleContract || !derivativesContract || !lendingContract) return;
    
    try {
      setLoading(true);
      setError('');
      
      // 并行加载各类数据
      await Promise.all([
        loadPriceData(),
        loadVolumeData(),
        loadLiquidityData(),
        loadDerivativesData(),
        loadLendingData(),
        loadUserActivityData(),
        calculateMarketMetrics()
      ]);
      
    } catch (err) {
      console.error('加载市场数据失败:', err);
      setError('无法加载市场数据。');
    } finally {
      setLoading(false);
    }
  };

  // 加载价格数据
  const loadPriceData = async () => {
    try {
      // 从价格预言机合约获取集合价格数据
      const collectionData = await priceOracleContract.getCollectionPriceData(selectedCollection.address);
      
      // 从价格预言机合约获取价格历史数据
      // 这里简化处理，实际应该根据选定的时间范围获取相应的历史数据
      // 示例数据
      const mockPriceHistory = generateMockPriceData(timeRange);
      setPriceData(mockPriceHistory);
      
    } catch (err) {
      console.error('加载价格数据失败:', err);
      throw err;
    }
  };

  // 加载交易量数据
  const loadVolumeData = async () => {
    try {
      // 从合约或API获取交易量数据
      // 示例数据
      const mockVolumeData = generateMockVolumeData(timeRange);
      setVolumeData(mockVolumeData);
      
    } catch (err) {
      console.error('加载交易量数据失败:', err);
      throw err;
    }
  };

  // 加载流动性数据
  const loadLiquidityData = async () => {
    try {
      // 从合约或API获取流动性数据
      // 示例数据
      const mockLiquidityData = generateMockLiquidityData(timeRange);
      setLiquidityData(mockLiquidityData);
      
    } catch (err) {
      console.error('加载流动性数据失败:', err);
      throw err;
    }
  };

  // 加载衍生品数据
  const loadDerivativesData = async () => {
    try {
      // 从衍生品合约获取数据
      const derivativeCount = await derivativesContract.getDerivativeCount();
      
      // 示例数据
      const mockDerivativesData = generateMockDerivativesData(timeRange);
      setDerivativesData(mockDerivativesData);
      
    } catch (err) {
      console.error('加载衍生品数据失败:', err);
      throw err;
    }
  };

  // 加载借贷数据
  const loadLendingData = async () => {
    try {
      // 从借贷合约获取数据
      // 示例数据
      const mockLendingData = generateMockLendingData(timeRange);
      setLendingData(mockLendingData);
      
    } catch (err) {
      console.error('加载借贷数据失败:', err);
      throw err;
    }
  };

  // 加载用户活动数据
  const loadUserActivityData = async () => {
    try {
      // 从合约或API获取用户活动数据
      // 示例数据
      const mockUserActivityData = generateMockUserActivityData(timeRange);
      setUserActivityData(mockUserActivityData);
      
    } catch (err) {
      console.error('加载用户活动数据失败:', err);
      throw err;
    }
  };

  // 计算市场指标
  const calculateMarketMetrics = async () => {
    try {
      // 从合约或API获取市场指标
      // 示例数据
      const mockMetrics = {
        totalVolume: 1250.75,
        floorPrice: 0.85,
        averagePrice: 1.25,
        activeListings: 48,
        totalDerivatives: 36,
        totalLoans: 22,
        uniqueUsers: 156
      };
      
      setMarketMetrics(mockMetrics);
      
    } catch (err) {
      console.error('计算市场指标失败:', err);
      throw err;
    }
  };

  // 生成模拟价格数据
  const generateMockPriceData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
        floorPrice: basePrice.toFixed(3),
        averagePrice: (basePrice * 1.2).toFixed(3),
        maxPrice: (basePrice * 1.5).toFixed(3)
      });
    }
    
    return data;
  };

  // 生成模拟交易量数据
  const generateMockVolumeData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
        volume: volume.toFixed(2),
        transactions: transactions
      });
    }
    
    return data;
  };

  // 生成模拟流动性数据
  const generateMockLiquidityData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
        bidAskSpread: bidAskSpread.toFixed(3),
        liquidity: (activeListings * (1 - bidAskSpread)).toFixed(2)
      });
    }
    
    return data;
  };

  // 生成模拟衍生品数据
  const generateMockDerivativesData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
  };

  // 生成模拟借贷数据
  const generateMockLendingData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
        loanValue: totalLoanValue.toFixed(2),
        avgInterestRate: avgInterestRate.toFixed(2),
        avgHealthFactor: avgHealthFactor.toFixed(2)
      });
    }
    
    return data;
  };

  // 生成模拟用户活动数据
  const generateMockUserActivityData = (timeRange) => {
    const dataPoints = getDataPointsForTimeRange(timeRange);
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
  };

  // 根据时间范围获取数据点数量
  const getDataPointsForTimeRange = (range) => {
    switch (range) {
      case '1d': return 24; // 每小时一个点
      case '7d': return 7; // 每天一个点
      case '30d': return 30; // 每天一个点
      case '90d': return 90; // 每天一个点
      case '1y': return 52; // 每周一个点
      case 'all': return 104; // 每两周一个点
      default: return 30;
    }
  };

  // 导出数据
  const handleExportData = () => {
    const exportData = {
      collection: selectedCollection,
      timeRange: timeRange,
      priceData: priceData,
      volumeData: volumeData,
      liquidityData: liquidityData,
      derivativesData: derivativesData,
      lendingData: lendingData,
      userActivityData: userActivityData,
      marketMetrics: marketMetrics
    };
    
    if (onExport) {
      onExport(exportData);
    }
    
    // 创建CSV文件并下载
    const csvContent = convertToCSV(exportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCollection.name}_market_data_${timeRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification({ 
      title: '数据导出成功', 
      message: `已导出 ${selectedCollection.name} 的市场数据。`, 
      type: 'success' 
    });
  };

  // 转换数据为CSV格式
  const convertToCSV = (data) => {
    // 简化实现，实际应根据数据结构生成适当的CSV
    let csv = 'date,price,volume\n';
    
    data.priceData.forEach((item, index) => {
      const volumeItem = data.volumeData[index] || { volume: 0 };
      csv += `${item.date},${item.averagePrice},${volumeItem.volume}\n`;
    });
    
    return csv;
  };

  // 格式化ETH金额
  const formatEth = (value) => {
    return parseFloat(value).toFixed(3);
  };

  // 渲染价格趋势图表
  const renderPriceChart = () => {
    if (priceData.length === 0) {
      return <Alert variant="info">暂无价格数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>价格趋势 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip formatter={(value) => [`${value} ETH`, '']} />
            <Legend />
            <Line type="monotone" dataKey="floorPrice" name="地板价" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="averagePrice" name="平均价格" stroke="#82ca9d" />
            <Line type="monotone" dataKey="maxPrice" name="最高价" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染交易量图表
  const renderVolumeChart = () => {
    if (volumeData.length === 0) {
      return <Alert variant="info">暂无交易量数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>交易量 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip formatter={(value, name) => [name === 'volume' ? `${value} ETH` : value, name === 'volume' ? '交易量' : '交易数']} />
            <Legend />
            <Bar yAxisId="left" dataKey="volume" name="交易量 (ETH)" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="transactions" name="交易数" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染流动性图表
  const renderLiquidityChart = () => {
    if (liquidityData.length === 0) {
      return <Alert variant="info">暂无流动性数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>市场流动性 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={liquidityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip formatter={(value, name) => [name === 'bidAskSpread' ? `${value * 100}%` : value, name === 'bidAskSpread' ? '买卖价差' : name === 'activeListings' ? '活跃挂单' : '流动性指数']} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="activeListings" name="活跃挂单" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            <Area yAxisId="right" type="monotone" dataKey="liquidity" name="流动性指数" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            <Line yAxisId="right" type="monotone" dataKey="bidAskSpread" name="买卖价差" stroke="#ff7300" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染衍生品图表
  const renderDerivativesChart = () => {
    if (derivativesData.length === 0) {
      return <Alert variant="info">暂无衍生品数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>衍生品市场 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={derivativesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="callOptions" name="看涨期权" stackId="a" fill="#8884d8" />
            <Bar dataKey="putOptions" name="看跌期权" stackId="a" fill="#82ca9d" />
            <Bar dataKey="futures" name="期货" stackId="a" fill="#ffc658" />
            <Bar dataKey="indices" name="指数" stackId="a" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4">
          <h5>衍生品类型分布</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: '看涨期权', value: derivativesData.reduce((sum, item) => sum + item.callOptions, 0) },
                  { name: '看跌期权', value: derivativesData.reduce((sum, item) => sum + item.putOptions, 0) },
                  { name: '期货', value: derivativesData.reduce((sum, item) => sum + item.futures, 0) },
                  { name: '指数', value: derivativesData.reduce((sum, item) => sum + item.indices, 0) }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#8884d8" />
                <Cell fill="#82ca9d" />
                <Cell fill="#ffc658" />
                <Cell fill="#ff8042" />
              </Pie>
              <Tooltip formatter={(value) => [`${value} 个`, '数量']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染借贷图表
  const renderLendingChart = () => {
    if (lendingData.length === 0) {
      return <Alert variant="info">暂无借贷数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>借贷市场 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lendingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip formatter={(value, name) => [name === 'loanValue' ? `${value} ETH` : name === 'avgInterestRate' ? `${value}%` : value, name === 'loanValue' ? '贷款价值' : name === 'activeLoans' ? '活跃贷款' : name === 'avgInterestRate' ? '平均利率' : '平均健康因子']} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="activeLoans" name="活跃贷款" stroke="#8884d8" />
            <Line yAxisId="left" type="monotone" dataKey="loanValue" name="贷款价值 (ETH)" stroke="#82ca9d" />
            <Line yAxisId="right" type="monotone" dataKey="avgInterestRate" name="平均利率 (%)" stroke="#ffc658" />
            <Line yAxisId="right" type="monotone" dataKey="avgHealthFactor" name="平均健康因子" stroke="#ff8042" />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4">
          <h5>借贷健康状况</h5>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart outerRadius={90} data={[
              { subject: '抵押率', A: 85, fullMark: 100 },
              { subject: '健康因子', A: 75, fullMark: 100 },
              { subject: '清算风险', A: 20, fullMark: 100 },
              { subject: '利率稳定性', A: 80, fullMark: 100 },
              { subject: '借贷期限', A: 65, fullMark: 100 }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="借贷健康状况" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染用户活动图表
  const renderUserActivityChart = () => {
    if (userActivityData.length === 0) {
      return <Alert variant="info">暂无用户活动数据</Alert>;
    }
    
    return (
      <div className="chart-container">
        <h4>用户活动 <small className="text-muted">({timeRange})</small></h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={userActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newUsers" name="新用户" stroke="#8884d8" />
            <Line type="monotone" dataKey="activeUsers" name="活跃用户" stroke="#82ca9d" />
            <Line type="monotone" dataKey="transactions" name="交易数" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 渲染市场指标卡片
  const renderMetricsCards = () => {
    return (
      <Row className="metrics-cards">
        <Col md={3} sm={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon"><FaEthereum /></div>
              <div className="metric-value">{formatEth(marketMetrics.totalVolume)} ETH</div>
              <div className="metric-label">总交易量</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon"><FaEthereum /></div>
              <div className="metric-value">{formatEth(marketMetrics.floorPrice)} ETH</div>
              <div className="metric-label">地板价</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon"><FaChartLine /></div>
              <div className="metric-value">{marketMetrics.activeListings}</div>
              <div className="metric-label">活跃挂单</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon"><FaChartPie /></div>
              <div className="metric-value">{marketMetrics.uniqueUsers}</div>
              <div className="metric-label">独立用户</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  if (!isConnected) {
    return <Alert variant="warning">请连接钱包以使用NFT市场数据分析功能。</Alert>;
  }

  return (
    <div className="nft-market-analytics-container">
      <h3 className="section-title">NFT市场数据分析</h3>
      <p className="section-description">全面分析NFT市场价格趋势、交易量、流动性和用户行为等多维数据。</p>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <div className="controls-container">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>选择NFT集合</Form.Label>
              <Form.Select 
                value={selectedCollection ? selectedCollection.address : ''}
                onChange={(e) => {
                  const selected = collections.find(c => c.address === e.target.value);
                  setSelectedCollection(selected);
                }}
                disabled={loading || collections.length === 0}
              >
                {collections.map(collection => (
                  <option key={collection.address} value={collection.address}>
                    {collection.name} ({collection.symbol})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>时间范围</Form.Label>
              <Form.Select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                disabled={loading}
              >
                <option value="1d">24小时</option>
                <option value="7d">7天</option>
                <option value="30d">30天</option>
                <option value="90d">90天</option>
                <option value="1y">1年</option>
                <option value="all">全部</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button 
              variant="primary" 
              className="ms-auto"
              onClick={handleExportData}
              disabled={loading || !selectedCollection}
            >
              <FaDownload className="me-2" /> 导出数据
            </Button>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-3">加载数据中...</p>
        </div>
      ) : (
        <>
          {selectedCollection && renderMetricsCards()}

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mt-4">
            <Tab eventKey="price" title={<><FaChartLine className="me-2" /> 价格趋势</>}>
              {renderPriceChart()}
            </Tab>
            <Tab eventKey="volume" title={<><FaChartBar className="me-2" /> 交易量</>}>
              {renderVolumeChart()}
            </Tab>
            <Tab eventKey="liquidity" title={<><FaChartArea className="me-2" /> 流动性</>}>
              {renderLiquidityChart()}
            </Tab>
            <Tab eventKey="derivatives" title={<><FaFileContract className="me-2" /> 衍生品</>}>
              {renderDerivativesChart()}
            </Tab>
            <Tab eventKey="lending" title={<><FaEthereum className="me-2" /> 借贷</>}>
              {renderLendingChart()}
            </Tab>
            <Tab eventKey="users" title={<><FaChartPie className="me-2" /> 用户活动</>}>
              {renderUserActivityChart()}
            </Tab>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default NFTMarketAnalytics;
