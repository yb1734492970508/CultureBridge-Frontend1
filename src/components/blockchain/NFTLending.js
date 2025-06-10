import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Button, Form, Alert, Spinner, Modal, Row, Col, Badge, Table, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { FaEthereum, FaHandHoldingUsd, FaInfoCircle, FaExchangeAlt, FaHistory, FaChartLine } from 'react-icons/fa';
import NFTDerivativesMarketABI from '../../contracts/abis/NFTDerivativesMarketABI';
import './NFTLending.css';

// 导入上下文
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

/**
 * NFT借贷组件
 * 允许用户以NFT为抵押获取加密货币贷款
 */
const NFTLending = ({ contract, priceOracle, onSuccess }) => {
    const { account, library } = useWeb3React();
    const { addNotification } = useContext(NotificationContext);
    const { isConnected } = useContext(Web3Context);
    
    // 状态变量
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userNFTs, setUserNFTs] = useState([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showCreateLoanModal, setShowCreateLoanModal] = useState(false);
    const [showNFTDetailModal, setShowNFTDetailModal] = useState(false);
    const [showLendModal, setShowLendModal] = useState(false);
    const [userLoansAsBorrower, setUserLoansAsBorrower] = useState([]);
    const [userLoansAsLender, setUserLoansAsLender] = useState([]);
    const [availableLoans, setAvailableLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [activeTab, setActiveTab] = useState('available');
    const [loadingNFTs, setLoadingNFTs] = useState(false);
    const [loadingLoans, setLoadingLoans] = useState(false);
    const [nftPrices, setNftPrices] = useState({});
    
    // 创建贷款表单数据
    const [formData, setFormData] = useState({
        minLoanAmount: '0.1',
        duration: '30',
        collateralFactor: '70'
    });
    
    // 贷款提议表单数据
    const [offerData, setOfferData] = useState({
        loanAmount: '0.1',
        interestRate: '10',
        duration: '30',
        collateralFactor: '70'
    });
    
    // 贷款状态枚举
    const LoanStatus = {
        PENDING: 0,
        ACTIVE: 1,
        REPAID: 2,
        DEFAULTED: 3,
        LIQUIDATED: 4,
        CANCELLED: 5
    };
    
    // 贷款状态文本映射
    const loanStatusText = {
        [LoanStatus.PENDING]: '等待放款',
        [LoanStatus.ACTIVE]: '进行中',
        [LoanStatus.REPAID]: '已还清',
        [LoanStatus.DEFAULTED]: '已违约',
        [LoanStatus.LIQUIDATED]: '已清算',
        [LoanStatus.CANCELLED]: '已取消'
    };
    
    // 贷款状态样式映射
    const loanStatusStyle = {
        [LoanStatus.PENDING]: 'warning',
        [LoanStatus.ACTIVE]: 'primary',
        [LoanStatus.REPAID]: 'success',
        [LoanStatus.DEFAULTED]: 'danger',
        [LoanStatus.LIQUIDATED]: 'danger',
        [LoanStatus.CANCELLED]: 'secondary'
    };
    
    // 初始化
    useEffect(() => {
        if (isConnected && account) {
            loadUserNFTs();
            loadLoans();
        }
    }, [isConnected, account, contract]);
    
    // 加载用户的NFT
    const loadUserNFTs = async () => {
        if (!account) return;
        
        setLoadingNFTs(true);
        try {
            // 这里应该调用实际的NFT合约或索引服务获取用户的NFT
            // 以下为模拟数据
            const mockNFTs = [
                {
                    contractAddress: '0x1234567890123456789012345678901234567890',
                    tokenId: '1',
                    name: '数字艺术品 #1',
                    description: '由知名艺术家创作的独特数字艺术品',
                    image: 'https://via.placeholder.com/300x300?text=NFT+Art+1',
                    attributes: [
                        { trait_type: '艺术风格', value: '抽象' },
                        { trait_type: '创作年份', value: '2025' }
                    ]
                },
                {
                    contractAddress: '0x1234567890123456789012345678901234567890',
                    tokenId: '2',
                    name: '数字艺术品 #2',
                    description: '独特的文化遗产数字化表现',
                    image: 'https://via.placeholder.com/300x300?text=NFT+Art+2',
                    attributes: [
                        { trait_type: '艺术风格', value: '写实' },
                        { trait_type: '创作年份', value: '2024' }
                    ]
                },
                {
                    contractAddress: '0x2345678901234567890123456789012345678901',
                    tokenId: '5',
                    name: '文化收藏品 #5',
                    description: '稀有的文化收藏品数字版本',
                    image: 'https://via.placeholder.com/300x300?text=NFT+Collectible',
                    attributes: [
                        { trait_type: '类型', value: '收藏品' },
                        { trait_type: '稀有度', value: '稀有' }
                    ]
                }
            ];
            
            setUserNFTs(mockNFTs);
            
            // 获取NFT价格
            if (priceOracle) {
                const prices = {};
                for (const nft of mockNFTs) {
                    try {
                        const [price, timestamp, confidence] = await priceOracle.getNFTLatestPrice(
                            nft.contractAddress,
                            nft.tokenId
                        );
                        
                        prices[`${nft.contractAddress}-${nft.tokenId}`] = {
                            price: ethers.utils.formatEther(price),
                            timestamp: new Date(timestamp.toNumber() * 1000),
                            confidence: confidence.toNumber() / 100 // 转换为百分比
                        };
                    } catch (err) {
                        console.error(`获取NFT价格失败: ${nft.contractAddress}-${nft.tokenId}`, err);
                    }
                }
                setNftPrices(prices);
            }
        } catch (err) {
            console.error("加载用户NFT错误:", err);
            setError("加载NFT失败，请稍后再试。");
        } finally {
            setLoadingNFTs(false);
        }
    };
    
    // 加载贷款信息
    const loadLoans = async () => {
        if (!contract || !account) return;
        
        setLoadingLoans(true);
        try {
            // 获取用户作为借款人的贷款
            const borrowerLoanIds = await contract.getUserLoansAsBorrower(account);
            
            // 获取用户作为贷款人的贷款
            const lenderLoanIds = await contract.getUserLoansAsLender(account);
            
            // 获取每个贷款的详细信息
            const borrowerLoans = await Promise.all(
                borrowerLoanIds.map(async (id) => {
                    const loan = await contract.loans(id);
                    const [status, healthFactor, repayAmount, timeRemaining] = await contract.calculateLoanStatus(id);
                    
                    // 获取NFT元数据（实际实现应该从IPFS或其他存储获取）
                    // 这里使用模拟数据
                    const mockMetadata = {
                        name: `贷款NFT #${id.toString()}`,
                        image: `https://via.placeholder.com/300x300?text=Loan+${id.toString()}`,
                        description: `NFT贷款 #${id.toString()}`
                    };
                    
                    return {
                        id: id.toString(),
                        borrower: loan.borrower,
                        lender: loan.lender,
                        nftContract: loan.nftContract,
                        tokenId: loan.tokenId.toString(),
                        loanAmount: ethers.utils.formatEther(loan.loanAmount),
                        interestRate: loan.interestRate.toNumber() / 100, // 转换为百分比
                        duration: loan.duration.toNumber() / (24 * 60 * 60), // 转换为天数
                        startTime: loan.startTime.toString() === '0' ? null : new Date(loan.startTime.toNumber() * 1000),
                        collateralFactor: loan.collateralFactor.toNumber() / 100, // 转换为百分比
                        paymentToken: loan.paymentToken,
                        status: status,
                        healthFactor: healthFactor.toNumber() / 100, // 转换为百分比
                        repayAmount: ethers.utils.formatEther(repayAmount),
                        timeRemaining: timeRemaining.toNumber() / (24 * 60 * 60), // 转换为天数
                        metadata: mockMetadata
                    };
                })
            );
            
            const lenderLoans = await Promise.all(
                lenderLoanIds.map(async (id) => {
                    const loan = await contract.loans(id);
                    const [status, healthFactor, repayAmount, timeRemaining] = await contract.calculateLoanStatus(id);
                    
                    // 获取NFT元数据
                    const mockMetadata = {
                        name: `贷款NFT #${id.toString()}`,
                        image: `https://via.placeholder.com/300x300?text=Loan+${id.toString()}`,
                        description: `NFT贷款 #${id.toString()}`
                    };
                    
                    return {
                        id: id.toString(),
                        borrower: loan.borrower,
                        lender: loan.lender,
                        nftContract: loan.nftContract,
                        tokenId: loan.tokenId.toString(),
                        loanAmount: ethers.utils.formatEther(loan.loanAmount),
                        interestRate: loan.interestRate.toNumber() / 100, // 转换为百分比
                        duration: loan.duration.toNumber() / (24 * 60 * 60), // 转换为天数
                        startTime: loan.startTime.toString() === '0' ? null : new Date(loan.startTime.toNumber() * 1000),
                        collateralFactor: loan.collateralFactor.toNumber() / 100, // 转换为百分比
                        paymentToken: loan.paymentToken,
                        status: status,
                        healthFactor: healthFactor.toNumber() / 100, // 转换为百分比
                        repayAmount: ethers.utils.formatEther(repayAmount),
                        timeRemaining: timeRemaining.toNumber() / (24 * 60 * 60), // 转换为天数
                        metadata: mockMetadata
                    };
                })
            );
            
            // 获取可用的贷款列表（模拟数据）
            const mockAvailableLoans = [
                {
                    id: '101',
                    borrower: '0x3456789012345678901234567890123456789012',
                    lender: ethers.constants.AddressZero,
                    nftContract: '0x1234567890123456789012345678901234567890',
                    tokenId: '10',
                    loanAmount: '0.5',
                    interestRate: 0,
                    duration: 30,
                    startTime: null,
                    collateralFactor: 70,
                    paymentToken: ethers.constants.AddressZero,
                    status: LoanStatus.PENDING,
                    healthFactor: 100,
                    repayAmount: '0',
                    timeRemaining: 0,
                    metadata: {
                        name: '游戏道具 #10',
                        image: 'https://via.placeholder.com/300x300?text=Game+Item+10',
                        description: '稀有游戏道具，可用于增强角色能力'
                    }
                },
                {
                    id: '102',
                    borrower: '0x4567890123456789012345678901234567890123',
                    lender: ethers.constants.AddressZero,
                    nftContract: '0x2345678901234567890123456789012345678901',
                    tokenId: '15',
                    loanAmount: '0.8',
                    interestRate: 0,
                    duration: 60,
                    startTime: null,
                    collateralFactor: 65,
                    paymentToken: ethers.constants.AddressZero,
                    status: LoanStatus.PENDING,
                    healthFactor: 100,
                    repayAmount: '0',
                    timeRemaining: 0,
                    metadata: {
                        name: '虚拟土地 #15',
                        image: 'https://via.placeholder.com/300x300?text=Virtual+Land+15',
                        description: '元宇宙中的虚拟土地，位置优越'
                    }
                }
            ];
            
            // 过滤掉用户自己的贷款
            const filteredAvailableLoans = mockAvailableLoans.filter(
                loan => loan.borrower.toLowerCase() !== account.toLowerCase()
            );
            
            setUserLoansAsBorrower(borrowerLoans);
            setUserLoansAsLender(lenderLoans);
            setAvailableLoans(filteredAvailableLoans);
        } catch (err) {
            console.error("加载贷款信息错误:", err);
            setError("加载贷款信息失败，请稍后再试。");
        } finally {
            setLoadingLoans(false);
        }
    };
    
    // 处理NFT选择
    const handleSelectNFT = (nft) => {
        setSelectedNFT(nft);
        setShowNFTDetailModal(true);
    };
    
    // 处理贷款选择
    const handleSelectLoan = (loan) => {
        setSelectedLoan(loan);
        setShowLendModal(true);
        
        // 预填充表单数据
        setOfferData({
            ...offerData,
            loanAmount: loan.loanAmount,
            duration: loan.duration.toString()
        });
    };
    
    // 处理表单输入变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // 处理提议表单输入变化
    const handleOfferInputChange = (e) => {
        const { name, value } = e.target;
        setOfferData({
            ...offerData,
            [name]: value
        });
    };
    
    // 处理创建贷款提交
    const handleCreateLoan = async (e) => {
        e.preventDefault();
        
        if (!contract || !selectedNFT) return;
        
        setLoading(true);
        try {
            // 检查NFT授权
            // 实际实现需要检查是否已授权给合约
            
            // 执行创建贷款
            const tx = await contract.createLoan(
                selectedNFT.contractAddress,
                selectedNFT.tokenId,
                ethers.utils.parseEther(formData.minLoanAmount),
                parseInt(formData.duration) * 24 * 60 * 60 // 转换为秒
            );
            
            // 等待交易确认
            await tx.wait();
            
            // 关闭模态框
            setShowCreateLoanModal(false);
            
            // 重新加载数据
            loadLoans();
            loadUserNFTs();
            
            // 通知成功
            addNotification({
                title: "创建贷款请求成功",
                message: `您的NFT "${selectedNFT.name}" 已成功创建贷款请求`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`NFT "${selectedNFT.name}" 已成功创建贷款请求`);
            }
        } catch (err) {
            console.error("创建贷款请求错误:", err);
            setError(`创建贷款请求失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 处理提供贷款
    const handleProvideLoan = async () => {
        if (!contract || !selectedLoan) return;
        
        setLoading(true);
        try {
            // 执行提供贷款
            const tx = await contract.provideLoan(
                selectedLoan.id,
                Math.floor(parseFloat(offerData.interestRate) * 100), // 转换为基点
                parseInt(offerData.duration) * 24 * 60 * 60, // 转换为秒
                Math.floor(parseFloat(offerData.collateralFactor) * 100), // 转换为基点
                {
                    value: ethers.utils.parseEther(offerData.loanAmount)
                }
            );
            
            // 等待交易确认
            await tx.wait();
            
            // 关闭模态框
            setShowLendModal(false);
            
            // 重新加载数据
            loadLoans();
            
            // 通知成功
            addNotification({
                title: "提供贷款成功",
                message: `您已成功为NFT "${selectedLoan.metadata.name}" 提供贷款`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`已成功为NFT "${selectedLoan.metadata.name}" 提供贷款`);
            }
        } catch (err) {
            console.error("提供贷款错误:", err);
            setError(`提供贷款失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 处理还款
    const handleRepayLoan = async (loanId, repayAmount) => {
        if (!contract) return;
        
        setLoading(true);
        try {
            // 执行还款
            const tx = await contract.repayLoan(loanId, {
                value: ethers.utils.parseEther(repayAmount)
            });
            
            // 等待交易确认
            await tx.wait();
            
            // 重新加载数据
            loadLoans();
            loadUserNFTs();
            
            // 通知成功
            addNotification({
                title: "还款成功",
                message: `您已成功还清贷款 #${loanId}`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`已成功还清贷款 #${loanId}`);
            }
        } catch (err) {
            console.error("还款错误:", err);
            setError(`还款失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 处理清算
    const handleLiquidateLoan = async (loanId) => {
        if (!contract) return;
        
        setLoading(true);
        try {
            // 执行清算
            const tx = await contract.liquidateLoan(loanId);
            
            // 等待交易确认
            await tx.wait();
            
            // 重新加载数据
            loadLoans();
            
            // 通知成功
            addNotification({
                title: "清算成功",
                message: `您已成功清算贷款 #${loanId}`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`已成功清算贷款 #${loanId}`);
            }
        } catch (err) {
            console.error("清算错误:", err);
            setError(`清算失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 处理取消贷款
    const handleCancelLoan = async (loanId) => {
        if (!contract) return;
        
        setLoading(true);
        try {
            // 执行取消贷款
            const tx = await contract.cancelLoan(loanId);
            
            // 等待交易确认
            await tx.wait();
            
            // 重新加载数据
            loadLoans();
            loadUserNFTs();
            
            // 通知成功
            addNotification({
                title: "取消贷款成功",
                message: `您已成功取消贷款 #${loanId}`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`已成功取消贷款 #${loanId}`);
            }
        } catch (err) {
            console.error("取消贷款错误:", err);
            setError(`取消贷款失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 渲染NFT卡片
    const renderNFTCard = (nft) => {
        const nftKey = `${nft.contractAddress}-${nft.tokenId}`;
        const nftPrice = nftPrices[nftKey];
        
        return (
            <Card className="nft-card" onClick={() => handleSelectNFT(nft)}>
                <div className="nft-image-container">
                    <Card.Img variant="top" src={nft.image} className="nft-image" />
                    {nftPrice && (
                        <div className="nft-price-badge">
                            <Badge bg="info">
                                <FaEthereum /> {nftPrice.price} ETH
                            </Badge>
                        </div>
                    )}
                </div>
                <Card.Body>
                    <Card.Title className="nft-title">{nft.name}</Card.Title>
                    <Card.Text className="nft-description">
                        {nft.description.length > 60 ? nft.description.substring(0, 60) + '...' : nft.description}
                    </Card.Text>
                    <div className="nft-id">
                        <small>ID: {nft.tokenId}</small>
                    </div>
                </Card.Body>
            </Card>
        );
    };
    
    // 渲染贷款卡片
    const renderLoanCard = (loan) => {
        return (
            <Card className="loan-card">
                <div className="loan-image-container">
                    <Card.Img variant="top" src={loan.metadata.image} className="loan-image" />
                    <div className="loan-badge">
                        <Badge bg={loanStatusStyle[loan.status]}>
                            {loanStatusText[loan.status]}
                        </Badge>
                    </div>
                </div>
                <Card.Body>
                    <Card.Title className="loan-title">{loan.metadata.name}</Card.Title>
                    <div className="loan-details">
                        <div className="loan-detail-item">
                            <span className="detail-label">贷款金额:</span>
                            <span className="detail-value">
                                <FaEthereum /> {loan.loanAmount} ETH
                            </span>
                        </div>
                        {loan.status === LoanStatus.ACTIVE && (
                            <div className="loan-detail-item">
                                <span className="detail-label">应还金额:</span>
                                <span className="detail-value">
                                    <FaEthereum /> {loan.repayAmount} ETH
                                </span>
                            </div>
                        )}
                        {loan.interestRate > 0 && (
                            <div className="loan-detail-item">
                                <span className="detail-label">年化利率:</span>
                                <span className="detail-value">
                                    {loan.interestRate}%
                                </span>
                            </div>
                        )}
                        <div className="loan-detail-item">
                            <span className="detail-label">期限:</span>
                            <span className="detail-value">
                                {loan.duration} 天
                            </span>
                        </div>
                        {loan.status === LoanStatus.ACTIVE && loan.timeRemaining > 0 && (
                            <div className="loan-detail-item">
                                <span className="detail-label">剩余时间:</span>
                                <span className="detail-value">
                                    {Math.floor(loan.timeRemaining)} 天
                                </span>
                            </div>
                        )}
                        {loan.status === LoanStatus.ACTIVE && (
                            <div className="loan-health-factor">
                                <span className="detail-label">健康因子:</span>
                                <ProgressBar 
                                    now={loan.healthFactor} 
                                    max={150}
                                    variant={loan.healthFactor < 100 ? 'danger' : loan.healthFactor < 120 ? 'warning' : 'success'}
                                    label={`${loan.healthFactor}%`}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>
                    <div className="loan-actions mt-3">
                        {loan.status === LoanStatus.PENDING && activeTab === 'available' && (
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectLoan(loan);
                                }}
                            >
                                <FaHandHoldingUsd className="me-1" /> 提供贷款
                            </Button>
                        )}
                        {loan.status === LoanStatus.ACTIVE && loan.borrower.toLowerCase() === account.toLowerCase() && (
                            <Button 
                                variant="success" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepayLoan(loan.id, loan.repayAmount);
                                }}
                            >
                                还款
                            </Button>
                        )}
                        {loan.status === LoanStatus.ACTIVE && loan.lender.toLowerCase() === account.toLowerCase() && loan.timeRemaining <= 0 && (
                            <Button 
                                variant="danger" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLiquidateLoan(loan.id);
                                }}
                            >
                                清算
                            </Button>
                        )}
                        {loan.status === LoanStatus.PENDING && loan.borrower.toLowerCase() === account.toLowerCase() && (
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelLoan(loan.id);
                                }}
                            >
                                取消
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        );
    };
    
    // 渲染NFT详情模态框
    const renderNFTDetailModal = () => {
        if (!selectedNFT) return null;
        
        const nftKey = `${selectedNFT.contractAddress}-${selectedNFT.tokenId}`;
        const nftPrice = nftPrices[nftKey];
        
        return (
            <Modal 
                show={showNFTDetailModal} 
                onHide={() => setShowNFTDetailModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>NFT详情</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <img src={selectedNFT.image} alt={selectedNFT.name} className="img-fluid nft-detail-image" />
                        </Col>
                        <Col md={6}>
                            <h3>{selectedNFT.name}</h3>
                            <p className="text-muted">{selectedNFT.description}</p>
                            
                            {nftPrice && (
                                <div className="nft-price-info mb-3">
                                    <h5>估值信息</h5>
                                    <div className="d-flex justify-content-between">
                                        <span>当前估值:</span>
                                        <span><FaEthereum /> {nftPrice.price} ETH</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>置信度:</span>
                                        <span>{nftPrice.confidence}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>更新时间:</span>
                                        <span>{nftPrice.timestamp.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="nft-attributes">
                                <h5>属性</h5>
                                {selectedNFT.attributes.map((attr, index) => (
                                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2">
                                        {attr.trait_type}: {attr.value}
                                    </Badge>
                                ))}
                            </div>
                            
                            <div className="nft-contract-info mt-3">
                                <small className="d-block text-muted">合约地址: {selectedNFT.contractAddress}</small>
                                <small className="d-block text-muted">代币ID: {selectedNFT.tokenId}</small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNFTDetailModal(false)}>
                        关闭
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => {
                            setShowNFTDetailModal(false);
                            setShowCreateLoanModal(true);
                        }}
                        disabled={!nftPrice}
                    >
                        创建贷款请求
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };
    
    // 渲染创建贷款模态框
    const renderCreateLoanModal = () => {
        if (!selectedNFT) return null;
        
        const nftKey = `${selectedNFT.contractAddress}-${selectedNFT.tokenId}`;
        const nftPrice = nftPrices[nftKey];
        const maxLoanAmount = nftPrice ? parseFloat(nftPrice.price) * 0.7 : 0;
        
        return (
            <Modal 
                show={showCreateLoanModal} 
                onHide={() => setShowCreateLoanModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>创建NFT贷款请求</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="selected-nft-info mb-3">
                        <div className="d-flex align-items-center">
                            <img 
                                src={selectedNFT.image} 
                                alt={selectedNFT.name} 
                                className="selected-nft-thumbnail me-3" 
                            />
                            <div>
                                <h5 className="mb-1">{selectedNFT.name}</h5>
                                <small className="text-muted">ID: {selectedNFT.tokenId}</small>
                                {nftPrice && (
                                    <div className="mt-1">
                                        <Badge bg="info">
                                            <FaEthereum /> {nftPrice.price} ETH
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <Form onSubmit={handleCreateLoan}>
                        <Form.Group className="mb-3">
                            <Form.Label>最低贷款金额 (ETH)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="minLoanAmount"
                                value={formData.minLoanAmount}
                                onChange={handleInputChange}
                                required
                                min="0.001"
                                max={maxLoanAmount}
                                step="0.001"
                            />
                            <Form.Text className="text-muted">
                                您希望借入的最低ETH金额（最高可借 {maxLoanAmount.toFixed(3)} ETH）
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>最长贷款期限 (天)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="365"
                                step="1"
                            />
                            <Form.Text className="text-muted">
                                贷款的最长期限，以天为单位
                            </Form.Text>
                        </Form.Group>
                        
                        <Alert variant="info">
                            <FaInfoCircle className="me-2" />
                            创建贷款请求后，您的NFT将被锁定在合约中，直到贷款结束或请求被取消。
                            贷款人可以提供不同的贷款条件，您可以选择接受其中一个。
                        </Alert>
                        
                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateLoanModal(false)}>
                        取消
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateLoan}
                        disabled={loading || !nftPrice}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                处理中...
                            </>
                        ) : (
                            "确认创建"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };
    
    // 渲染提供贷款模态框
    const renderLendModal = () => {
        if (!selectedLoan) return null;
        
        return (
            <Modal 
                show={showLendModal} 
                onHide={() => setShowLendModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>提供NFT贷款</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="selected-loan-info mb-3">
                        <div className="d-flex align-items-center">
                            <img 
                                src={selectedLoan.metadata.image} 
                                alt={selectedLoan.metadata.name} 
                                className="selected-loan-thumbnail me-3" 
                            />
                            <div>
                                <h5 className="mb-1">{selectedLoan.metadata.name}</h5>
                                <small className="text-muted">ID: {selectedLoan.tokenId}</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="loan-summary mb-4">
                        <h5>贷款请求详情</h5>
                        <Table striped bordered hover size="sm">
                            <tbody>
                                <tr>
                                    <td>最低贷款金额</td>
                                    <td><FaEthereum /> {selectedLoan.loanAmount} ETH</td>
                                </tr>
                                <tr>
                                    <td>最长期限</td>
                                    <td>{selectedLoan.duration} 天</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>贷款金额 (ETH)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="loanAmount"
                                value={offerData.loanAmount}
                                onChange={handleOfferInputChange}
                                required
                                min={selectedLoan.loanAmount}
                                step="0.001"
                            />
                            <Form.Text className="text-muted">
                                您愿意提供的ETH金额（至少 {selectedLoan.loanAmount} ETH）
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>年化利率 (%)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="interestRate"
                                value={offerData.interestRate}
                                onChange={handleOfferInputChange}
                                required
                                min="0"
                                max="50"
                                step="0.1"
                            />
                            <Form.Text className="text-muted">
                                贷款的年化利率（0-50%）
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>贷款期限 (天)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="duration"
                                value={offerData.duration}
                                onChange={handleOfferInputChange}
                                required
                                min="1"
                                max={selectedLoan.duration}
                                step="1"
                            />
                            <Form.Text className="text-muted">
                                贷款期限，以天为单位（最长 {selectedLoan.duration} 天）
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>抵押率 (%)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="collateralFactor"
                                value={offerData.collateralFactor}
                                onChange={handleOfferInputChange}
                                required
                                min="50"
                                max="90"
                                step="1"
                            />
                            <Form.Text className="text-muted">
                                NFT价值的百分比作为抵押（50-90%）
                            </Form.Text>
                        </Form.Group>
                        
                        <Alert variant="info">
                            <FaInfoCircle className="me-2" />
                            提供贷款后，您的ETH将被转移给借款人，NFT将作为抵押品锁定在合约中。
                            如果借款人未能按时还款，您可以清算贷款并获得NFT。
                        </Alert>
                        
                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLendModal(false)}>
                        取消
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleProvideLoan}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                处理中...
                            </>
                        ) : (
                            `确认提供贷款 (${offerData.loanAmount} ETH)`
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
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
                    <p>您需要连接钱包才能使用NFT借贷功能。</p>
                </Alert>
            </div>
        );
    };
    
    // 渲染贷款标签页
    const renderLoanTabs = () => {
        return (
            <div className="loan-tabs">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="available" title="可用贷款请求">
                        {loadingLoans ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">加载贷款请求中...</p>
                            </div>
                        ) : availableLoans.length > 0 ? (
                            <div className="loan-grid">
                                {availableLoans.map((loan) => (
                                    <div key={loan.id} className="loan-grid-item">
                                        {renderLoanCard(loan)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="info">
                                当前没有可用的贷款请求。请稍后再查看。
                            </Alert>
                        )}
                    </Tab>
                    <Tab eventKey="my-borrowing" title="我的借款">
                        {loadingLoans ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">加载我的借款中...</p>
                            </div>
                        ) : userLoansAsBorrower.length > 0 ? (
                            <div className="loan-grid">
                                {userLoansAsBorrower.map((loan) => (
                                    <div key={loan.id} className="loan-grid-item">
                                        {renderLoanCard(loan)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="info">
                                您还没有任何借款。选择一个NFT创建贷款请求。
                            </Alert>
                        )}
                    </Tab>
                    <Tab eventKey="my-lending" title="我的放款">
                        {loadingLoans ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">加载我的放款中...</p>
                            </div>
                        ) : userLoansAsLender.length > 0 ? (
                            <div className="loan-grid">
                                {userLoansAsLender.map((loan) => (
                                    <div key={loan.id} className="loan-grid-item">
                                        {renderLoanCard(loan)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="info">
                                您还没有提供任何贷款。浏览可用的贷款请求并提供贷款。
                            </Alert>
                        )}
                    </Tab>
                </Tabs>
            </div>
        );
    };
    
    // 主渲染函数
    return (
        <div className="nft-lending-container">
            <h3 className="section-title">NFT借贷</h3>
            <p className="section-description">
                以NFT为抵押获取加密货币贷款，或为NFT所有者提供贷款并赚取利息
            </p>
            
            {renderError()}
            
            {!isConnected ? renderWalletNotConnected() : (
                <>
                    <div className="lending-sections">
                        <div className="section">
                            <h4 className="subsection-title">
                                <FaHandHoldingUsd className="me-2" />
                                我的NFT
                            </h4>
                            
                            {loadingNFTs ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">加载NFT中...</p>
                                </div>
                            ) : userNFTs.length > 0 ? (
                                <div className="nft-grid">
                                    {userNFTs.map((nft, index) => (
                                        <div key={`${nft.contractAddress}-${nft.tokenId}-${index}`} className="nft-grid-item">
                                            {renderNFTCard(nft)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    您还没有任何NFT。请先获取一些NFT，然后再创建贷款请求。
                                </Alert>
                            )}
                        </div>
                        
                        <div className="section mt-5">
                            <h4 className="subsection-title">
                                <FaExchangeAlt className="me-2" />
                                NFT借贷市场
                            </h4>
                            
                            {renderLoanTabs()}
                        </div>
                    </div>
                    
                    {renderNFTDetailModal()}
                    {renderCreateLoanModal()}
                    {renderLendModal()}
                </>
            )}
        </div>
    );
};

export default NFTLending;
