import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Button, Tabs, Tab, Form, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { FaEthereum, FaExchangeAlt, FaHistory, FaChartLine } from 'react-icons/fa';
import NFTDerivativesMarketABI from '../../contracts/abis/NFTDerivativesMarketABI';
import './NFTDerivativesMarket.css';

// 导入子组件
import NFTFractionalize from './NFTFractionalize';
import NFTRental from './NFTRental';
import NFTLending from './NFTLending';
import NFTDerivatives from './NFTDerivatives';

// 导入上下文
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // 替换为实际部署的合约地址

/**
 * NFT衍生品市场组件
 * 集成了分数化、租赁、借贷和衍生品交易功能
 */
const NFTDerivativesMarket = () => {
    const { account, library, chainId } = useWeb3React();
    const { addNotification } = useContext(NotificationContext);
    const { isConnected } = useContext(Web3Context);
    
    // 状态变量
    const [activeTab, setActiveTab] = useState('dashboard');
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [marketStats, setMarketStats] = useState({
        totalFractions: 0,
        totalRentals: 0,
        totalLoans: 0,
        totalDerivatives: 0,
        totalVolume: 0
    });
    const [userStats, setUserStats] = useState({
        fractions: [],
        rentalsAsLessor: [],
        rentalsAsRenter: [],
        loansAsBorrower: [],
        loansAsLender: [],
        derivatives: []
    });
    
    // 初始化合约
    useEffect(() => {
        if (isConnected && library && account) {
            try {
                const signer = library.getSigner();
                const contractInstance = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    NFTDerivativesMarketABI,
                    signer
                );
                setContract(contractInstance);
                
                // 加载市场统计数据
                loadMarketStats();
                
                // 加载用户数据
                loadUserData();
            } catch (err) {
                console.error("合约初始化错误:", err);
                setError("初始化合约失败，请检查网络连接或刷新页面。");
            }
        }
    }, [isConnected, library, account, chainId]);
    
    // 加载市场统计数据
    const loadMarketStats = async () => {
        if (!contract) return;
        
        setLoading(true);
        try {
            // 这里应该调用合约方法获取实际数据
            // 以下为模拟数据
            setMarketStats({
                totalFractions: 24,
                totalRentals: 18,
                totalLoans: 32,
                totalDerivatives: 15,
                totalVolume: 156.8
            });
        } catch (err) {
            console.error("加载市场数据错误:", err);
            setError("加载市场数据失败，请稍后再试。");
        } finally {
            setLoading(false);
        }
    };
    
    // 加载用户数据
    const loadUserData = async () => {
        if (!contract || !account) return;
        
        setLoading(true);
        try {
            // 获取用户的分数化NFT
            const fractions = await contract.getUserFractions(account);
            
            // 获取用户的租赁
            const rentalsAsLessor = await contract.getUserRentalsAsLessor(account);
            const rentalsAsRenter = await contract.getUserRentalsAsRenter(account);
            
            // 获取用户的贷款
            const loansAsBorrower = await contract.getUserLoansAsBorrower(account);
            const loansAsLender = await contract.getUserLoansAsLender(account);
            
            // 获取用户的衍生品
            const derivatives = await contract.getUserDerivatives(account);
            
            setUserStats({
                fractions,
                rentalsAsLessor,
                rentalsAsRenter,
                loansAsBorrower,
                loansAsLender,
                derivatives
            });
        } catch (err) {
            console.error("加载用户数据错误:", err);
            setError("加载用户数据失败，请稍后再试。");
        } finally {
            setLoading(false);
        }
    };
    
    // 处理操作成功
    const handleSuccess = (message) => {
        addNotification({
            title: "操作成功",
            message,
            type: "success"
        });
        
        // 重新加载数据
        loadMarketStats();
        loadUserData();
    };
    
    // 渲染仪表板
    const renderDashboard = () => {
        return (
            <div className="nft-derivatives-dashboard">
                <h3 className="section-title">市场概览</h3>
                
                <div className="stats-container">
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="stat-icon"><FaEthereum /></div>
                            <div className="stat-value">{marketStats.totalFractions}</div>
                            <div className="stat-label">分数化NFT</div>
                        </Card.Body>
                    </Card>
                    
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="stat-icon"><FaExchangeAlt /></div>
                            <div className="stat-value">{marketStats.totalRentals}</div>
                            <div className="stat-label">活跃租赁</div>
                        </Card.Body>
                    </Card>
                    
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="stat-icon"><FaHistory /></div>
                            <div className="stat-value">{marketStats.totalLoans}</div>
                            <div className="stat-label">活跃贷款</div>
                        </Card.Body>
                    </Card>
                    
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="stat-icon"><FaChartLine /></div>
                            <div className="stat-value">{marketStats.totalDerivatives}</div>
                            <div className="stat-label">衍生品</div>
                        </Card.Body>
                    </Card>
                </div>
                
                <div className="volume-container">
                    <Card>
                        <Card.Body>
                            <Card.Title>总交易量</Card.Title>
                            <div className="volume-value">
                                <FaEthereum /> {marketStats.totalVolume} ETH
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                
                <h3 className="section-title mt-4">我的资产</h3>
                
                {!account ? (
                    <Alert variant="info">请连接钱包查看您的资产</Alert>
                ) : loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">加载中...</p>
                    </div>
                ) : (
                    <div className="user-assets">
                        <Card className="mb-3">
                            <Card.Header>我的分数化NFT</Card.Header>
                            <Card.Body>
                                {userStats.fractions.length > 0 ? (
                                    <div className="asset-count">
                                        <Badge bg="primary">{userStats.fractions.length}</Badge> 个分数化NFT
                                    </div>
                                ) : (
                                    <p className="text-muted">您还没有分数化NFT</p>
                                )}
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => setActiveTab('fractionalize')}
                                >
                                    分数化NFT
                                </Button>
                            </Card.Body>
                        </Card>
                        
                        <Card className="mb-3">
                            <Card.Header>我的租赁</Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <Badge bg="success">{userStats.rentalsAsLessor.length}</Badge> 个出租
                                    </div>
                                    <div>
                                        <Badge bg="info">{userStats.rentalsAsRenter.length}</Badge> 个租入
                                    </div>
                                </div>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => setActiveTab('rental')}
                                >
                                    管理租赁
                                </Button>
                            </Card.Body>
                        </Card>
                        
                        <Card className="mb-3">
                            <Card.Header>我的贷款</Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <Badge bg="warning">{userStats.loansAsBorrower.length}</Badge> 个借入
                                    </div>
                                    <div>
                                        <Badge bg="secondary">{userStats.loansAsLender.length}</Badge> 个放出
                                    </div>
                                </div>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => setActiveTab('lending')}
                                >
                                    管理贷款
                                </Button>
                            </Card.Body>
                        </Card>
                        
                        <Card className="mb-3">
                            <Card.Header>我的衍生品</Card.Header>
                            <Card.Body>
                                {userStats.derivatives.length > 0 ? (
                                    <div className="asset-count">
                                        <Badge bg="primary">{userStats.derivatives.length}</Badge> 个衍生品
                                    </div>
                                ) : (
                                    <p className="text-muted">您还没有衍生品</p>
                                )}
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => setActiveTab('derivatives')}
                                >
                                    管理衍生品
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                )}
            </div>
        );
    };
    
    // 渲染错误提示
    const renderError = () => {
        if (!error) return null;
        
        return (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
                <Alert.Heading>出错了！</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    };
    
    // 渲染未连接钱包提示
    const renderWalletNotConnected = () => {
        return (
            <div className="wallet-not-connected">
                <Alert variant="warning">
                    <Alert.Heading>请连接钱包</Alert.Heading>
                    <p>您需要连接钱包才能使用NFT衍生品市场功能。</p>
                </Alert>
            </div>
        );
    };
    
    // 主渲染函数
    return (
        <div className="nft-derivatives-market-container">
            <h2 className="market-title">NFT衍生品市场</h2>
            <p className="market-description">
                探索NFT的全新价值维度：分数化所有权、租赁、抵押借贷和衍生品交易
            </p>
            
            {renderError()}
            
            {!isConnected ? renderWalletNotConnected() : (
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4 market-tabs"
                >
                    <Tab eventKey="dashboard" title="市场概览">
                        {renderDashboard()}
                    </Tab>
                    
                    <Tab eventKey="fractionalize" title="NFT分数化">
                        <NFTFractionalize 
                            contract={contract} 
                            onSuccess={(msg) => handleSuccess(msg || "NFT分数化成功！")} 
                        />
                    </Tab>
                    
                    <Tab eventKey="rental" title="NFT租赁">
                        <NFTRental 
                            contract={contract} 
                            onSuccess={(msg) => handleSuccess(msg || "NFT租赁操作成功！")} 
                        />
                    </Tab>
                    
                    <Tab eventKey="lending" title="NFT借贷">
                        <NFTLending 
                            contract={contract} 
                            onSuccess={(msg) => handleSuccess(msg || "NFT借贷操作成功！")} 
                        />
                    </Tab>
                    
                    <Tab eventKey="derivatives" title="NFT衍生品">
                        <NFTDerivatives 
                            contract={contract} 
                            onSuccess={(msg) => handleSuccess(msg || "NFT衍生品操作成功！")} 
                        />
                    </Tab>
                </Tabs>
            )}
        </div>
    );
};

export default NFTDerivativesMarket;
