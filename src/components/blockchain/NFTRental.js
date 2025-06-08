import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Button, Form, Alert, Spinner, Modal, Row, Col, Badge, Table } from 'react-bootstrap';
import { FaEthereum, FaCalendarAlt, FaHandshake, FaInfoCircle, FaHistory } from 'react-icons/fa';
import NFTDerivativesMarketABI from '../../contracts/abis/NFTDerivativesMarketABI';
import './NFTRental.css';

// 导入上下文
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

/**
 * NFT租赁组件
 * 允许用户出租和租用NFT，实现使用权的临时转让
 */
const NFTRental = ({ contract, onSuccess }) => {
    const { account, library } = useWeb3React();
    const { addNotification } = useContext(NotificationContext);
    const { isConnected } = useContext(Web3Context);
    
    // 状态变量
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userNFTs, setUserNFTs] = useState([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showCreateRentalModal, setShowCreateRentalModal] = useState(false);
    const [showNFTDetailModal, setShowNFTDetailModal] = useState(false);
    const [showRentModal, setShowRentModal] = useState(false);
    const [userRentalsAsLessor, setUserRentalsAsLessor] = useState([]);
    const [userRentalsAsRenter, setUserRentalsAsRenter] = useState([]);
    const [availableRentals, setAvailableRentals] = useState([]);
    const [selectedRental, setSelectedRental] = useState(null);
    const [activeTab, setActiveTab] = useState('available');
    const [loadingNFTs, setLoadingNFTs] = useState(false);
    const [loadingRentals, setLoadingRentals] = useState(false);
    
    // 创建租赁表单数据
    const [formData, setFormData] = useState({
        rentalFee: '0.01',
        duration: '7',
        collateral: '0.05',
        revenueSharing: false,
        revenueShare: '50'
    });
    
    // 初始化
    useEffect(() => {
        if (isConnected && account) {
            loadUserNFTs();
            loadRentals();
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
        } catch (err) {
            console.error("加载用户NFT错误:", err);
            setError("加载NFT失败，请稍后再试。");
        } finally {
            setLoadingNFTs(false);
        }
    };
    
    // 加载租赁信息
    const loadRentals = async () => {
        if (!contract || !account) return;
        
        setLoadingRentals(true);
        try {
            // 获取用户作为出租人的租赁
            const lessorRentalIds = await contract.getUserRentalsAsLessor(account);
            
            // 获取用户作为租户的租赁
            const renterRentalIds = await contract.getUserRentalsAsRenter(account);
            
            // 获取每个租赁的详细信息
            const lessorRentals = await Promise.all(
                lessorRentalIds.map(async (id) => {
                    const rental = await contract.rentals(id);
                    
                    // 获取NFT元数据（实际实现应该从IPFS或其他存储获取）
                    // 这里使用模拟数据
                    const mockMetadata = {
                        name: `租赁NFT #${id.toString()}`,
                        image: `https://via.placeholder.com/300x300?text=Rental+${id.toString()}`,
                        description: `NFT租赁 #${id.toString()}`
                    };
                    
                    return {
                        id: id.toString(),
                        lessor: rental.lessor,
                        renter: rental.renter,
                        nftContract: rental.nftContract,
                        tokenId: rental.tokenId.toString(),
                        rentalFee: ethers.utils.formatEther(rental.rentalFee),
                        duration: rental.duration.toString(),
                        startTime: rental.startTime.toString() === '0' ? null : new Date(rental.startTime.toNumber() * 1000),
                        collateral: ethers.utils.formatEther(rental.collateral),
                        revenueSharing: rental.revenueSharing,
                        revenueShare: rental.revenueShare,
                        active: rental.active,
                        metadata: mockMetadata,
                        status: rental.startTime.toString() === '0' ? '可租用' : '已租出'
                    };
                })
            );
            
            const renterRentals = await Promise.all(
                renterRentalIds.map(async (id) => {
                    const rental = await contract.rentals(id);
                    
                    // 获取NFT元数据
                    const mockMetadata = {
                        name: `租赁NFT #${id.toString()}`,
                        image: `https://via.placeholder.com/300x300?text=Rental+${id.toString()}`,
                        description: `NFT租赁 #${id.toString()}`
                    };
                    
                    const now = Math.floor(Date.now() / 1000);
                    const endTime = rental.startTime.toNumber() + rental.duration.toNumber();
                    const status = now > endTime ? '已过期' : '租用中';
                    
                    return {
                        id: id.toString(),
                        lessor: rental.lessor,
                        renter: rental.renter,
                        nftContract: rental.nftContract,
                        tokenId: rental.tokenId.toString(),
                        rentalFee: ethers.utils.formatEther(rental.rentalFee),
                        duration: rental.duration.toString(),
                        startTime: new Date(rental.startTime.toNumber() * 1000),
                        endTime: new Date(endTime * 1000),
                        collateral: ethers.utils.formatEther(rental.collateral),
                        revenueSharing: rental.revenueSharing,
                        revenueShare: rental.revenueShare,
                        active: rental.active,
                        metadata: mockMetadata,
                        status: status
                    };
                })
            );
            
            // 获取可用的租赁列表（模拟数据）
            const mockAvailableRentals = [
                {
                    id: '101',
                    lessor: '0x3456789012345678901234567890123456789012',
                    renter: ethers.constants.AddressZero,
                    nftContract: '0x1234567890123456789012345678901234567890',
                    tokenId: '10',
                    rentalFee: '0.02',
                    duration: '14',
                    startTime: null,
                    collateral: '0.1',
                    revenueSharing: true,
                    revenueShare: 60,
                    active: true,
                    metadata: {
                        name: '游戏道具 #10',
                        image: 'https://via.placeholder.com/300x300?text=Game+Item+10',
                        description: '稀有游戏道具，可用于增强角色能力'
                    },
                    status: '可租用'
                },
                {
                    id: '102',
                    lessor: '0x4567890123456789012345678901234567890123',
                    renter: ethers.constants.AddressZero,
                    nftContract: '0x2345678901234567890123456789012345678901',
                    tokenId: '15',
                    rentalFee: '0.015',
                    duration: '30',
                    startTime: null,
                    collateral: '0.075',
                    revenueSharing: false,
                    revenueShare: 0,
                    active: true,
                    metadata: {
                        name: '虚拟土地 #15',
                        image: 'https://via.placeholder.com/300x300?text=Virtual+Land+15',
                        description: '元宇宙中的虚拟土地，位置优越'
                    },
                    status: '可租用'
                }
            ];
            
            // 过滤掉用户自己的租赁
            const filteredAvailableRentals = mockAvailableRentals.filter(
                rental => rental.lessor.toLowerCase() !== account.toLowerCase()
            );
            
            setUserRentalsAsLessor(lessorRentals);
            setUserRentalsAsRenter(renterRentals);
            setAvailableRentals(filteredAvailableRentals);
        } catch (err) {
            console.error("加载租赁信息错误:", err);
            setError("加载租赁信息失败，请稍后再试。");
        } finally {
            setLoadingRentals(false);
        }
    };
    
    // 处理NFT选择
    const handleSelectNFT = (nft) => {
        setSelectedNFT(nft);
        setShowNFTDetailModal(true);
    };
    
    // 处理租赁选择
    const handleSelectRental = (rental) => {
        setSelectedRental(rental);
        setShowRentModal(true);
    };
    
    // 处理表单输入变化
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    // 处理创建租赁提交
    const handleCreateRental = async (e) => {
        e.preventDefault();
        
        if (!contract || !selectedNFT) return;
        
        setLoading(true);
        try {
            // 检查NFT授权
            // 实际实现需要检查是否已授权给合约
            
            // 执行创建租赁
            const tx = await contract.createRental(
                selectedNFT.contractAddress,
                selectedNFT.tokenId,
                ethers.utils.parseEther(formData.rentalFee),
                parseInt(formData.duration) * 24 * 60 * 60, // 转换为秒
                ethers.utils.parseEther(formData.collateral),
                formData.revenueSharing,
                formData.revenueSharing ? parseInt(formData.revenueShare) : 0
            );
            
            // 等待交易确认
            await tx.wait();
            
            // 关闭模态框
            setShowCreateRentalModal(false);
            
            // 重新加载数据
            loadRentals();
            loadUserNFTs();
            
            // 通知成功
            addNotification({
                title: "创建租赁成功",
                message: `您的NFT "${selectedNFT.name}" 已成功创建租赁`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`NFT "${selectedNFT.name}" 已成功创建租赁`);
            }
        } catch (err) {
            console.error("创建租赁错误:", err);
            setError(`创建租赁失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 处理租用NFT
    const handleRentNFT = async () => {
        if (!contract || !selectedRental) return;
        
        setLoading(true);
        try {
            // 计算需要支付的金额（租金 + 押金）
            const paymentAmount = ethers.utils.parseEther(
                (parseFloat(selectedRental.rentalFee) + parseFloat(selectedRental.collateral)).toString()
            );
            
            // 执行租赁
            const tx = await contract.startRental(selectedRental.id, {
                value: paymentAmount
            });
            
            // 等待交易确认
            await tx.wait();
            
            // 关闭模态框
            setShowRentModal(false);
            
            // 重新加载数据
            loadRentals();
            
            // 通知成功
            addNotification({
                title: "租用成功",
                message: `您已成功租用NFT "${selectedRental.metadata.name}"`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`已成功租用NFT "${selectedRental.metadata.name}"`);
            }
        } catch (err) {
            console.error("租用NFT错误:", err);
            setError(`租用失败: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };
    
    // 渲染NFT卡片
    const renderNFTCard = (nft) => {
        return (
            <Card className="nft-card" onClick={() => handleSelectNFT(nft)}>
                <div className="nft-image-container">
                    <Card.Img variant="top" src={nft.image} className="nft-image" />
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
    
    // 渲染租赁卡片
    const renderRentalCard = (rental) => {
        return (
            <Card className="rental-card">
                <div className="rental-image-container">
                    <Card.Img variant="top" src={rental.metadata.image} className="rental-image" />
                    <div className="rental-badge">
                        <Badge bg={rental.status === '可租用' ? 'success' : rental.status === '租用中' ? 'primary' : 'secondary'}>
                            {rental.status}
                        </Badge>
                    </div>
                </div>
                <Card.Body>
                    <Card.Title className="rental-title">{rental.metadata.name}</Card.Title>
                    <div className="rental-details">
                        <div className="rental-detail-item">
                            <span className="detail-label">租金:</span>
                            <span className="detail-value">
                                <FaEthereum /> {rental.rentalFee} ETH
                            </span>
                        </div>
                        <div className="rental-detail-item">
                            <span className="detail-label">租期:</span>
                            <span className="detail-value">
                                {rental.duration} 天
                            </span>
                        </div>
                        <div className="rental-detail-item">
                            <span className="detail-label">押金:</span>
                            <span className="detail-value">
                                <FaEthereum /> {rental.collateral} ETH
                            </span>
                        </div>
                    </div>
                    <div className="rental-actions">
                        {rental.status === '可租用' && activeTab === 'available' && (
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectRental(rental);
                                }}
                            >
                                <FaHandshake className="me-1" /> 租用
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
                            setShowCreateRentalModal(true);
                        }}
                    >
                        创建租赁
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };
    
    // 渲染创建租赁模态框
    const renderCreateRentalModal = () => {
        if (!selectedNFT) return null;
        
        return (
            <Modal 
                show={showCreateRentalModal} 
                onHide={() => setShowCreateRentalModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>创建NFT租赁</Modal.Title>
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
                            </div>
                        </div>
                    </div>
                    
                    <Form onSubmit={handleCreateRental}>
                        <Form.Group className="mb-3">
                            <Form.Label>租金 (ETH)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="rentalFee"
                                value={formData.rentalFee}
                                onChange={handleInputChange}
                                required
                                min="0.001"
                                step="0.001"
                            />
                            <Form.Text className="text-muted">
                                租用NFT所需支付的ETH金额
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>租期 (天)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                min="1"
                                step="1"
                            />
                            <Form.Text className="text-muted">
                                租赁期限，以天为单位
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>押金 (ETH)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="collateral"
                                value={formData.collateral}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.001"
                            />
                            <Form.Text className="text-muted">
                                租户需要支付的押金，租赁结束后返还
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Check 
                                type="checkbox"
                                id="revenueSharing"
                                name="revenueSharing"
                                label="启用收益分成"
                                checked={formData.revenueSharing}
                                onChange={handleInputChange}
                            />
                            <Form.Text className="text-muted">
                                允许租户使用NFT产生的收益与您分成
                            </Form.Text>
                        </Form.Group>
                        
                        {formData.revenueSharing && (
                            <Form.Group className="mb-3">
                                <Form.Label>您的分成比例 (%)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="revenueShare"
                                    value={formData.revenueShare}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    max="99"
                                    step="1"
                                />
                                <Form.Text className="text-muted">
                                    您将获得的收益百分比（1-99）
                                </Form.Text>
                            </Form.Group>
                        )}
                        
                        <Alert variant="info">
                            <FaInfoCircle className="me-2" />
                            创建租赁后，您的NFT将被锁定在合约中，直到租赁结束或被取消。
                            租户支付的租金将直接转入您的账户。
                        </Alert>
                        
                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateRentalModal(false)}>
                        取消
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateRental}
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
                            "确认创建"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };
    
    // 渲染租用模态框
    const renderRentModal = () => {
        if (!selectedRental) return null;
        
        const totalPayment = parseFloat(selectedRental.rentalFee) + parseFloat(selectedRental.collateral);
        
        return (
            <Modal 
                show={showRentModal} 
                onHide={() => setShowRentModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>租用NFT</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="selected-rental-info mb-3">
                        <div className="d-flex align-items-center">
                            <img 
                                src={selectedRental.metadata.image} 
                                alt={selectedRental.metadata.name} 
                                className="selected-rental-thumbnail me-3" 
                            />
                            <div>
                                <h5 className="mb-1">{selectedRental.metadata.name}</h5>
                                <small className="text-muted">ID: {selectedRental.tokenId}</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rental-summary">
                        <h5>租赁详情</h5>
                        <Table striped bordered hover size="sm">
                            <tbody>
                                <tr>
                                    <td>租金</td>
                                    <td><FaEthereum /> {selectedRental.rentalFee} ETH</td>
                                </tr>
                                <tr>
                                    <td>租期</td>
                                    <td>{selectedRental.duration} 天</td>
                                </tr>
                                <tr>
                                    <td>押金</td>
                                    <td><FaEthereum /> {selectedRental.collateral} ETH</td>
                                </tr>
                                <tr>
                                    <td>收益分成</td>
                                    <td>
                                        {selectedRental.revenueSharing ? 
                                            `是（所有者 ${selectedRental.revenueShare}%，租户 ${100 - selectedRental.revenueShare}%）` : 
                                            '否'}
                                    </td>
                                </tr>
                                <tr className="table-primary">
                                    <td><strong>总支付金额</strong></td>
                                    <td><strong><FaEthereum /> {totalPayment.toFixed(6)} ETH</strong></td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    
                    <Alert variant="info">
                        <FaInfoCircle className="me-2" />
                        租赁期结束后，押金将自动返还给您。在租赁期间，您将获得NFT的使用权。
                    </Alert>
                    
                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            {error}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRentModal(false)}>
                        取消
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleRentNFT}
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
                            `确认租用 (${totalPayment.toFixed(6)} ETH)`
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
                    <p>您需要连接钱包才能使用NFT租赁功能。</p>
                </Alert>
            </div>
        );
    };
    
    // 渲染租赁标签页
    const renderRentalTabs = () => {
        return (
            <div className="rental-tabs">
                <div className="tab-buttons">
                    <Button 
                        variant={activeTab === 'available' ? 'primary' : 'outline-primary'} 
                        onClick={() => setActiveTab('available')}
                        className="tab-button"
                    >
                        可租用的NFT
                    </Button>
                    <Button 
                        variant={activeTab === 'my-listings' ? 'primary' : 'outline-primary'} 
                        onClick={() => setActiveTab('my-listings')}
                        className="tab-button"
                    >
                        我的出租
                    </Button>
                    <Button 
                        variant={activeTab === 'my-rentals' ? 'primary' : 'outline-primary'} 
                        onClick={() => setActiveTab('my-rentals')}
                        className="tab-button"
                    >
                        我的租入
                    </Button>
                </div>
                
                <div className="tab-content mt-4">
                    {activeTab === 'available' && (
                        <div className="available-rentals">
                            <h4 className="subsection-title">可租用的NFT</h4>
                            
                            {loadingRentals ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">加载可租用NFT中...</p>
                                </div>
                            ) : availableRentals.length > 0 ? (
                                <div className="rental-grid">
                                    {availableRentals.map((rental) => (
                                        <div key={rental.id} className="rental-grid-item">
                                            {renderRentalCard(rental)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    当前没有可租用的NFT。请稍后再查看。
                                </Alert>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'my-listings' && (
                        <div className="my-listings">
                            <h4 className="subsection-title">我的出租</h4>
                            
                            {loadingRentals ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">加载我的出租中...</p>
                                </div>
                            ) : userRentalsAsLessor.length > 0 ? (
                                <div className="rental-grid">
                                    {userRentalsAsLessor.map((rental) => (
                                        <div key={rental.id} className="rental-grid-item">
                                            {renderRentalCard(rental)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    您还没有出租任何NFT。选择一个NFT创建租赁。
                                </Alert>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'my-rentals' && (
                        <div className="my-rentals">
                            <h4 className="subsection-title">我的租入</h4>
                            
                            {loadingRentals ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">加载我的租入中...</p>
                                </div>
                            ) : userRentalsAsRenter.length > 0 ? (
                                <div className="rental-grid">
                                    {userRentalsAsRenter.map((rental) => (
                                        <div key={rental.id} className="rental-grid-item">
                                            {renderRentalCard(rental)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    您还没有租入任何NFT。浏览可租用的NFT并租用一个。
                                </Alert>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    // 主渲染函数
    return (
        <div className="nft-rental-container">
            <h3 className="section-title">NFT租赁</h3>
            <p className="section-description">
                出租您的NFT获取收益，或租用他人的NFT获得临时使用权
            </p>
            
            {renderError()}
            
            {!isConnected ? renderWalletNotConnected() : (
                <>
                    <div className="rental-sections">
                        <div className="section">
                            <h4 className="subsection-title">
                                <FaCalendarAlt className="me-2" />
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
                                    您还没有任何NFT。请先获取一些NFT，然后再创建租赁。
                                </Alert>
                            )}
                        </div>
                        
                        <div className="section mt-5">
                            <h4 className="subsection-title">
                                <FaHandshake className="me-2" />
                                NFT租赁市场
                            </h4>
                            
                            {renderRentalTabs()}
                        </div>
                    </div>
                    
                    {renderNFTDetailModal()}
                    {renderCreateRentalModal()}
                    {renderRentModal()}
                </>
            )}
        </div>
    );
};

export default NFTRental;
