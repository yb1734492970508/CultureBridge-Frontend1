import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Button, Form, Alert, Spinner, Modal, Row, Col, Badge } from 'react-bootstrap';
import { FaEthereum, FaImage, FaShareAlt, FaInfoCircle } from 'react-icons/fa';
import NFTDerivativesMarketABI from '../../contracts/abis/NFTDerivativesMarketABI';
import './NFTFractionalize.css';

// 导入上下文
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

/**
 * NFT分数化组件
 * 允许用户将NFT分割为可交易的ERC20代币
 */
const NFTFractionalize = ({ contract, onSuccess }) => {
    const { account, library } = useWeb3React();
    const { addNotification } = useContext(NotificationContext);
    const { isConnected } = useContext(Web3Context);
    
    // 状态变量
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userNFTs, setUserNFTs] = useState([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showFractionalizeModal, setShowFractionalizeModal] = useState(false);
    const [showNFTDetailModal, setShowNFTDetailModal] = useState(false);
    const [userFractions, setUserFractions] = useState([]);
    const [loadingNFTs, setLoadingNFTs] = useState(false);
    const [loadingFractions, setLoadingFractions] = useState(false);
    
    // 分数化表单数据
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        totalSupply: '1000000',
        reservePrice: '0.1'
    });
    
    // 初始化
    useEffect(() => {
        if (isConnected && account) {
            loadUserNFTs();
            loadUserFractions();
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
    
    // 加载用户的分数化NFT
    const loadUserFractions = async () => {
        if (!contract || !account) return;
        
        setLoadingFractions(true);
        try {
            // 获取用户的分数化NFT ID列表
            const fractionIds = await contract.getUserFractions(account);
            
            // 获取每个分数化NFT的详细信息
            const fractionDetails = await Promise.all(
                fractionIds.map(async (id) => {
                    const fraction = await contract.fractions(id);
                    
                    // 获取NFT元数据（实际实现应该从IPFS或其他存储获取）
                    // 这里使用模拟数据
                    const mockMetadata = {
                        name: fraction.name,
                        image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(fraction.name)}`,
                        description: `分数化NFT代币，代表原始NFT的部分所有权`
                    };
                    
                    return {
                        id: id.toString(),
                        originalOwner: fraction.originalOwner,
                        nftContract: fraction.nftContract,
                        tokenId: fraction.tokenId.toString(),
                        fractionToken: fraction.fractionToken,
                        name: fraction.name,
                        symbol: fraction.symbol,
                        totalSupply: ethers.utils.formatEther(fraction.totalSupply),
                        reservePrice: ethers.utils.formatEther(fraction.reservePrice),
                        active: fraction.active,
                        metadata: mockMetadata
                    };
                })
            );
            
            setUserFractions(fractionDetails);
        } catch (err) {
            console.error("加载分数化NFT错误:", err);
            setError("加载分数化NFT失败，请稍后再试。");
        } finally {
            setLoadingFractions(false);
        }
    };
    
    // 处理NFT选择
    const handleSelectNFT = (nft) => {
        setSelectedNFT(nft);
        setShowNFTDetailModal(true);
        
        // 预填充表单数据
        setFormData({
            ...formData,
            name: `f${nft.name}`,
            symbol: `F${nft.name.substring(0, 3).toUpperCase()}`
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
    
    // 处理分数化提交
    const handleFractionalize = async (e) => {
        e.preventDefault();
        
        if (!contract || !selectedNFT) return;
        
        setLoading(true);
        try {
            // 检查NFT授权
            // 实际实现需要检查是否已授权给合约
            
            // 执行分数化
            const tx = await contract.fractionalize(
                selectedNFT.contractAddress,
                selectedNFT.tokenId,
                formData.name,
                formData.symbol,
                ethers.utils.parseEther(formData.totalSupply),
                ethers.utils.parseEther(formData.reservePrice)
            );
            
            // 等待交易确认
            await tx.wait();
            
            // 关闭模态框
            setShowFractionalizeModal(false);
            
            // 重新加载数据
            loadUserFractions();
            loadUserNFTs();
            
            // 通知成功
            addNotification({
                title: "分数化成功",
                message: `您的NFT "${selectedNFT.name}" 已成功分数化为 "${formData.name}" 代币`,
                type: "success"
            });
            
            // 调用成功回调
            if (onSuccess) {
                onSuccess(`NFT "${selectedNFT.name}" 已成功分数化`);
            }
        } catch (err) {
            console.error("分数化NFT错误:", err);
            setError(`分数化失败: ${err.message || "未知错误"}`);
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
    
    // 渲染分数化NFT卡片
    const renderFractionCard = (fraction) => {
        return (
            <Card className="fraction-card">
                <div className="fraction-image-container">
                    <Card.Img variant="top" src={fraction.metadata.image} className="fraction-image" />
                    <div className="fraction-badge">
                        <Badge bg="primary">已分数化</Badge>
                    </div>
                </div>
                <Card.Body>
                    <Card.Title className="fraction-title">{fraction.name}</Card.Title>
                    <div className="fraction-details">
                        <div className="fraction-detail-item">
                            <span className="detail-label">代币符号:</span>
                            <span className="detail-value">{fraction.symbol}</span>
                        </div>
                        <div className="fraction-detail-item">
                            <span className="detail-label">总供应量:</span>
                            <span className="detail-value">{fraction.totalSupply}</span>
                        </div>
                        <div className="fraction-detail-item">
                            <span className="detail-label">回购价格:</span>
                            <span className="detail-value">
                                <FaEthereum /> {fraction.reservePrice} ETH
                            </span>
                        </div>
                    </div>
                    <div className="fraction-actions">
                        <Button variant="outline-primary" size="sm">
                            <FaShareAlt /> 交易代币
                        </Button>
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
                            setShowFractionalizeModal(true);
                        }}
                    >
                        分数化此NFT
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };
    
    // 渲染分数化模态框
    const renderFractionalizeModal = () => {
        if (!selectedNFT) return null;
        
        return (
            <Modal 
                show={showFractionalizeModal} 
                onHide={() => setShowFractionalizeModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>分数化NFT</Modal.Title>
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
                    
                    <Form onSubmit={handleFractionalize}>
                        <Form.Group className="mb-3">
                            <Form.Label>代币名称</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Form.Text className="text-muted">
                                分数化代币的完整名称
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>代币符号</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="symbol"
                                value={formData.symbol}
                                onChange={handleInputChange}
                                required
                                maxLength={8}
                            />
                            <Form.Text className="text-muted">
                                代币的简短符号，最多8个字符
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>总供应量</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="totalSupply"
                                value={formData.totalSupply}
                                onChange={handleInputChange}
                                required
                                min="1"
                                step="1"
                            />
                            <Form.Text className="text-muted">
                                要创建的代币总数量
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>回购价格 (ETH)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="reservePrice"
                                value={formData.reservePrice}
                                onChange={handleInputChange}
                                required
                                min="0.001"
                                step="0.001"
                            />
                            <Form.Text className="text-muted">
                                回购整个NFT所需的ETH价格
                            </Form.Text>
                        </Form.Group>
                        
                        <Alert variant="info">
                            <FaInfoCircle className="me-2" />
                            分数化后，您的NFT将被锁定在合约中，并创建相应数量的ERC20代币。
                            这些代币可以在任何支持ERC20的交易所或DEX上交易。
                        </Alert>
                        
                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFractionalizeModal(false)}>
                        取消
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleFractionalize}
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
                            "确认分数化"
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
                    <p>您需要连接钱包才能使用NFT分数化功能。</p>
                </Alert>
            </div>
        );
    };
    
    // 主渲染函数
    return (
        <div className="nft-fractionalize-container">
            <h3 className="section-title">NFT分数化</h3>
            <p className="section-description">
                将您的NFT分割为可交易的ERC20代币，实现部分所有权和流动性
            </p>
            
            {renderError()}
            
            {!isConnected ? renderWalletNotConnected() : (
                <>
                    <div className="fractionalize-sections">
                        <div className="section">
                            <h4 className="subsection-title">
                                <FaImage className="me-2" />
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
                                    您还没有任何NFT。请先获取一些NFT，然后再进行分数化。
                                </Alert>
                            )}
                        </div>
                        
                        <div className="section mt-5">
                            <h4 className="subsection-title">
                                <FaShareAlt className="me-2" />
                                我的分数化NFT
                            </h4>
                            
                            {loadingFractions ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">加载分数化NFT中...</p>
                                </div>
                            ) : userFractions.length > 0 ? (
                                <div className="fraction-grid">
                                    {userFractions.map((fraction) => (
                                        <div key={fraction.id} className="fraction-grid-item">
                                            {renderFractionCard(fraction)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    您还没有任何分数化NFT。选择一个NFT进行分数化，开始体验部分所有权的好处。
                                </Alert>
                            )}
                        </div>
                    </div>
                    
                    {renderNFTDetailModal()}
                    {renderFractionalizeModal()}
                </>
            )}
        </div>
    );
};

export default NFTFractionalize;
