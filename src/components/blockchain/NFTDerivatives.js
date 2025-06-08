import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, Button, Form, Alert, Spinner, Modal, Row, Col, Badge, Table, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { FaEthereum, FaFileContract, FaChartPie, FaGavel, FaTimesCircle, FaCheckCircle, FaHistory, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import NFTDerivativesMarketABI from '../../contracts/abis/NFTDerivativesMarketABI'; // Assuming a general market ABI
import './NFTDerivatives.css';

// Import contexts
import { Web3Context } from '../../context/Web3Context';
import { NotificationContext } from '../../context/NotificationContext';

/**
 * NFTDerivatives Component
 * Allows users to create, trade, and manage NFT derivatives like options, futures, and indexes.
 */
const NFTDerivatives = ({ contract, priceOracle, onSuccess }) => {
    const { account, library } = useWeb3React();
    const { addNotification } = useContext(NotificationContext);
    const { isConnected } = useContext(Web3Context);

    // State variables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userNFTs, setUserNFTs] = useState([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [derivativeType, setDerivativeType] = useState('CALL_OPTION'); // CALL_OPTION, PUT_OPTION, FUTURE, INDEX
    const [userDerivatives, setUserDerivatives] = useState([]);
    const [marketDerivatives, setMarketDerivatives] = useState([]);
    const [selectedDerivative, setSelectedDerivative] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('market');
    const [loadingNFTs, setLoadingNFTs] = useState(false);
    const [loadingDerivatives, setLoadingDerivatives] = useState(false);
    const [nftPrices, setNftPrices] = useState({});

    // Form data for creating derivatives
    const [formData, setFormData] = useState({
        nftContract: '',
        tokenId: '',
        strikePrice: '0.1',
        premium: '0.01', // For options
        futurePrice: '0.1', // For futures
        expirationTime: (Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60).toString(), // Default 7 days
        paymentToken: ethers.constants.AddressZero, // ETH by default
        // For Index
        indexNFTContracts: [],
        indexTokenIds: [],
        indexWeights: [],
    });

    const DerivativeTypeEnum = {
        CALL_OPTION: 0,
        PUT_OPTION: 1,
        FUTURE: 2,
        INDEX: 3
    };

    const DerivativeStatusEnum = {
        ACTIVE: 0,
        EXERCISED: 1,
        EXPIRED: 2,
        CANCELLED: 3
    };

    const derivativeTypeText = {
        [DerivativeTypeEnum.CALL_OPTION]: '看涨期权',
        [DerivativeTypeEnum.PUT_OPTION]: '看跌期权',
        [DerivativeTypeEnum.FUTURE]: '期货',
        [DerivativeTypeEnum.INDEX]: '指数'
    };

    const derivativeStatusText = {
        [DerivativeStatusEnum.ACTIVE]: '活跃',
        [DerivativeStatusEnum.EXERCISED]: '已行权',
        [DerivativeStatusEnum.EXPIRED]: '已过期',
        [DerivativeStatusEnum.CANCELLED]: '已取消'
    };

    const derivativeStatusStyle = {
        [DerivativeStatusEnum.ACTIVE]: 'primary',
        [DerivativeStatusEnum.EXERCISED]: 'success',
        [DerivativeStatusEnum.EXPIRED]: 'secondary',
        [DerivativeStatusEnum.CANCELLED]: 'warning'
    };

    // Initialization
    useEffect(() => {
        if (isConnected && account) {
            loadUserNFTs();
            loadDerivatives();
        }
    }, [isConnected, account, contract]);

    // Load user's NFTs
    const loadUserNFTs = async () => {
        if (!account) return;
        setLoadingNFTs(true);
        try {
            // Mock data - replace with actual NFT fetching logic
            const mockNFTs = [
                {
                    contractAddress: '0x1234567890123456789012345678901234567890',
                    tokenId: '1',
                    name: '数字艺术品 #1',
                    image: 'https://via.placeholder.com/150?text=NFT+Art+1',
                },
                {
                    contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                    tokenId: '3',
                    name: '收藏品 #3',
                    image: 'https://via.placeholder.com/150?text=Collectible+3',
                }
            ];
            setUserNFTs(mockNFTs);

            if (priceOracle) {
                const prices = {};
                for (const nft of mockNFTs) {
                    try {
                        const [price, , confidence] = await priceOracle.getNFTLatestPrice(nft.contractAddress, nft.tokenId);
                        prices[`${nft.contractAddress}-${nft.tokenId}`] = {
                            price: ethers.utils.formatEther(price),
                            confidence: confidence.toNumber() / 100
                        };
                    } catch (err) {
                        console.error(`获取NFT价格失败: ${nft.contractAddress}-${nft.tokenId}`, err);
                    }
                }
                setNftPrices(prices);
            }
        } catch (err) {
            console.error("加载用户NFT错误:", err);
            setError("加载NFT失败。");
        } finally {
            setLoadingNFTs(false);
        }
    };

    // Load derivatives (user's and market)
    const loadDerivatives = async () => {
        if (!contract || !account) return;
        setLoadingDerivatives(true);
        try {
            const creatorDerivIds = await contract.getUserDerivativesAsCreator(account);
            const buyerDerivIds = await contract.getUserDerivativesAsBuyer(account);
            
            const userDerivPromises = [...new Set([...creatorDerivIds, ...buyerDerivIds])].map(id => contract.derivatives(id));
            const userDerivDetails = await Promise.all(userDerivPromises);
            setUserDerivatives(userDerivDetails.map((d, i) => ({ ...d, id: [...new Set([...creatorDerivIds, ...buyerDerivIds])][i] })));

            // Mock market derivatives - replace with actual fetching
            const totalDerivatives = await contract.getDerivativeCount();
            const marketDerivPromises = [];
            // Fetch a few recent derivatives for market view (example)
            for (let i = 0; i < Math.min(totalDerivatives.toNumber(), 10); i++) {
                 // In a real app, you'd fetch IDs, perhaps paginated or filtered
                 // For now, let's assume IDs are sequential from 0
                marketDerivPromises.push(contract.derivatives(ethers.BigNumber.from(i))); 
            }
            const marketDerivDetails = await Promise.all(marketDerivPromises);
            setMarketDerivatives(marketDerivDetails.map((d, i) => ({ ...d, id: ethers.BigNumber.from(i) })).filter(d => d.creator !== ethers.constants.AddressZero));

        } catch (err) {
            console.error("加载衍生品错误:", err);
            setError("加载衍生品失败。");
        } finally {
            setLoadingDerivatives(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectNFTForDerivative = (nft) => {
        setSelectedNFT(nft);
        setFormData({
            ...formData,
            nftContract: nft.contractAddress,
            tokenId: nft.tokenId,
        });
        setShowCreateModal(true);
    };

    const handleCreateDerivative = async (e) => {
        e.preventDefault();
        if (!contract || !selectedNFT && (derivativeType !== 'INDEX')) return;
        setLoading(true);
        setError('');
        try {
            let tx;
            const paymentValue = derivativeType === 'PUT_OPTION' || derivativeType === 'FUTURE' ? ethers.utils.parseEther(formData.strikePrice) : ethers.constants.Zero; // Simplified collateral

            switch (derivativeType) {
                case 'CALL_OPTION':
                    tx = await contract.createCallOption(
                        formData.nftContract,
                        formData.tokenId,
                        ethers.utils.parseEther(formData.strikePrice),
                        ethers.utils.parseEther(formData.premium),
                        formData.expirationTime,
                        formData.paymentToken
                    );
                    break;
                case 'PUT_OPTION':
                    tx = await contract.createPutOption(
                        formData.nftContract,
                        formData.tokenId,
                        ethers.utils.parseEther(formData.strikePrice),
                        ethers.utils.parseEther(formData.premium),
                        formData.expirationTime,
                        formData.paymentToken,
                        { value: paymentValue } // Collateral for put option creator
                    );
                    break;
                case 'FUTURE':
                     tx = await contract.createFuture(
                        formData.nftContract,
                        formData.tokenId,
                        ethers.utils.parseEther(formData.futurePrice),
                        formData.expirationTime,
                        formData.paymentToken,
                        { value: paymentValue } // Collateral for future creator (e.g. 10% of futurePrice)
                    );
                    break;
                // case 'INDEX': // Index creation needs more complex form handling for arrays
                //     tx = await contract.createIndex(...);
                //     break;
                default:
                    throw new Error("不支持的衍生品类型");
            }
            await tx.wait();
            setShowCreateModal(false);
            loadDerivatives();
            addNotification({ title: "创建成功", message: `${derivativeTypeText[DerivativeTypeEnum[derivativeType]]} 已成功创建。`, type: "success" });
            if (onSuccess) onSuccess("衍生品创建成功");
        } catch (err) {
            console.error("创建衍生品错误:", err);
            setError(`创建失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseDerivative = async (derivative) => {
        if (!contract) return;
        setLoading(true);
        setError('');
        try {
            const priceToPay = derivative.derivType === DerivativeTypeEnum.CALL_OPTION || derivative.derivType === DerivativeTypeEnum.PUT_OPTION ? derivative.premium : derivative.strikePrice; // Simplified price for futures
            const tx = await contract.purchaseDerivative(derivative.id, {
                value: derivative.paymentToken === ethers.constants.AddressZero ? priceToPay : ethers.constants.Zero
            });
            await tx.wait();
            loadDerivatives();
            addNotification({ title: "购买成功", message: "衍生品已成功购买。", type: "success" });
        } catch (err) {
            console.error("购买衍生品错误:", err);
            setError(`购买失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleExerciseDerivative = async (derivative) => {
        if (!contract) return;
        setLoading(true);
        setError('');
        try {
            let tx;
            let exerciseValue = ethers.constants.Zero;
            if (derivative.derivType === DerivativeTypeEnum.CALL_OPTION && derivative.paymentToken === ethers.constants.AddressZero) {
                exerciseValue = derivative.strikePrice;
            }

            switch (derivative.derivType) {
                case DerivativeTypeEnum.CALL_OPTION:
                    tx = await contract.exerciseCallOption(derivative.id, { value: exerciseValue });
                    break;
                case DerivativeTypeEnum.PUT_OPTION:
                    // NFT needs to be approved by user to this contract first
                    tx = await contract.exercisePutOption(derivative.id);
                    break;
                case DerivativeTypeEnum.FUTURE:
                     // Similar to call option, buyer pays strike price if ETH based
                    if (derivative.paymentToken === ethers.constants.AddressZero) exerciseValue = derivative.strikePrice;
                    tx = await contract.settleFuture(derivative.id, { value: exerciseValue }); 
                    break;
                default:
                    throw new Error("不支持行权的衍生品类型");
            }
            await tx.wait();
            loadDerivatives();
            addNotification({ title: "行权成功", message: "衍生品已成功行权。", type: "success" });
        } catch (err) {
            console.error("行权错误:", err);
            setError(`行权失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDerivative = async (derivativeId) => {
        if (!contract) return;
        setLoading(true);
        setError('');
        try {
            const tx = await contract.cancelDerivative(derivativeId);
            await tx.wait();
            loadDerivatives();
            addNotification({ title: "取消成功", message: "衍生品已成功取消。", type: "success" });
        } catch (err) {
            console.error("取消衍生品错误:", err);
            setError(`取消失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderNFTCard = (nft) => (
        <Card className="nft-card-sm" onClick={() => handleSelectNFTForDerivative(nft)}>
            <Card.Img variant="top" src={nft.image || 'https://via.placeholder.com/150?text=NFT'} className="nft-image-sm" />
            <Card.Body>
                <Card.Title className="nft-title-sm">{nft.name}</Card.Title>
                {nftPrices[`${nft.contractAddress}-${nft.tokenId}`] && (
                    <Badge bg="info"><FaEthereum /> {nftPrices[`${nft.contractAddress}-${nft.tokenId}`].price} ETH</Badge>
                )}
            </Card.Body>
        </Card>
    );

    const renderDerivativeCard = (deriv) => {
        const isCreator = deriv.creator === account;
        const isBuyer = deriv.buyer === account;
        const canPurchase = deriv.status === DerivativeStatusEnum.ACTIVE && deriv.buyer === ethers.constants.AddressZero && !isCreator;
        const canExercise = deriv.status === DerivativeStatusEnum.ACTIVE && isBuyer && new Date(deriv.expirationTime.toNumber() * 1000) > new Date();
        const canCancel = deriv.status === DerivativeStatusEnum.ACTIVE && isCreator && deriv.buyer === ethers.constants.AddressZero;

        return (
            <Card className="derivative-card">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <strong>{derivativeTypeText[deriv.derivType]} #{deriv.id.toString()}</strong>
                        <Badge bg={derivativeStatusStyle[deriv.status]}>{derivativeStatusText[deriv.status]}</Badge>
                    </div>
                </Card.Header>
                <Card.Body>
                    {deriv.derivType !== DerivativeTypeEnum.INDEX ? (
                        <p>NFT: {deriv.nftContract.substring(0,6)}...{deriv.nftContract.substring(38)} (ID: {deriv.tokenId.toString()})</p>
                    ) : (
                        <p>指数包含: {deriv.indexNFTContracts.length} 个NFT</p>
                    )}
                    <p>行权价/期货价: <FaEthereum /> {ethers.utils.formatEther(deriv.strikePrice)} ETH</p>
                    { (deriv.derivType === DerivativeTypeEnum.CALL_OPTION || deriv.derivType === DerivativeTypeEnum.PUT_OPTION) && 
                        <p>期权费: <FaEthereum /> {ethers.utils.formatEther(deriv.premium)} ETH</p> }
                    <p>到期时间: {new Date(deriv.expirationTime.toNumber() * 1000).toLocaleDateString()}</p>
                    <p>创建者: {deriv.creator.substring(0,6)}...{deriv.creator.substring(38)}</p>
                    {deriv.buyer !== ethers.constants.AddressZero && <p>购买者: {deriv.buyer.substring(0,6)}...{deriv.buyer.substring(38)}</p>}
                </Card.Body>
                <Card.Footer className="text-end">
                    {canPurchase && <Button variant="success" size="sm" onClick={() => handlePurchaseDerivative(deriv)} disabled={loading}>购买</Button>}
                    {canExercise && <Button variant="primary" size="sm" className="ms-2" onClick={() => handleExerciseDerivative(deriv)} disabled={loading}>行权</Button>}
                    {canCancel && <Button variant="danger" size="sm" className="ms-2" onClick={() => handleCancelDerivative(deriv.id)} disabled={loading}>取消</Button>}
                    <Button variant="info" size="sm" className="ms-2" onClick={() => { setSelectedDerivative(deriv); setShowDetailModal(true); }}>详情</Button>
                </Card.Footer>
            </Card>
        );
    };

    const renderCreateModal = () => (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>创建NFT衍生品 - {derivativeTypeText[DerivativeTypeEnum[derivativeType]]}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedNFT && derivativeType !== 'INDEX' && (
                    <div className="mb-3">
                        <h5>选定NFT: {selectedNFT.name} (ID: {selectedNFT.tokenId})</h5>
                        <img src={selectedNFT.image} alt={selectedNFT.name} style={{width: '100px', borderRadius:'8px'}}/>
                    </div>
                )}
                <Form onSubmit={handleCreateDerivative}>
                    <Form.Group className="mb-3">
                        <Form.Label>衍生品类型</Form.Label>
                        <Form.Select value={derivativeType} onChange={(e) => setDerivativeType(e.target.value)}>
                            <option value="CALL_OPTION">看涨期权</option>
                            <option value="PUT_OPTION">看跌期权</option>
                            <option value="FUTURE">期货</option>
                            {/* <option value="INDEX">指数</option> */}
                        </Form.Select>
                    </Form.Group>

                    {(derivativeType === 'CALL_OPTION' || derivativeType === 'PUT_OPTION' || derivativeType === 'FUTURE') && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>行权价格 (ETH)</Form.Label>
                                <Form.Control type="text" name="strikePrice" value={formData.strikePrice} onChange={handleInputChange} required />
                            </Form.Group>
                            {(derivativeType === 'CALL_OPTION' || derivativeType === 'PUT_OPTION') && (
                                <Form.Group className="mb-3">
                                    <Form.Label>期权费 (ETH)</Form.Label>
                                    <Form.Control type="text" name="premium" value={formData.premium} onChange={handleInputChange} required />
                                </Form.Group>
                            )}
                             {derivativeType === 'FUTURE' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>期货价格 (ETH)</Form.Label>
                                    <Form.Control type="text" name="futurePrice" value={formData.futurePrice} onChange={handleInputChange} required />
                                </Form.Group>
                            )}
                        </>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>到期时间</Form.Label>
                        <Form.Control type="datetime-local" name="expirationTime" 
                            value={new Date(parseInt(formData.expirationTime) * 1000).toISOString().slice(0,16)} 
                            onChange={(e) => setFormData({...formData, expirationTime: (new Date(e.target.value).getTime() / 1000).toString()})} 
                            required />
                    </Form.Group>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Button variant="primary" type="submit" disabled={loading} className="w-100">
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : '确认创建'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );

    const renderDetailModal = () => {
        if (!selectedDerivative) return null;
        // Fetch trade history for selectedDerivative.id if needed
        return (
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>衍生品详情 #{selectedDerivative.id.toString()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>类型:</strong> {derivativeTypeText[selectedDerivative.derivType]}</p>
                    <p><strong>状态:</strong> <Badge bg={derivativeStatusStyle[selectedDerivative.status]}>{derivativeStatusText[selectedDerivative.status]}</Badge></p>
                    {/* Add more details here based on derivative type */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>关闭</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (!isConnected) {
        return <Alert variant="warning">请连接钱包以使用NFT衍生品市场。</Alert>;
    }

    return (
        <div className="nft-derivatives-container">
            <h3 className="section-title">NFT衍生品市场</h3>
            <p className="section-description">创建、交易和管理NFT期权、期货和指数等金融工具。</p>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Row className="mb-4">
                <Col md={8}>
                    <h4>我的NFT <small>({userNFTs.length})</small></h4>
                    {loadingNFTs ? <Spinner animation="border" size="sm" /> :
                        userNFTs.length > 0 ? (
                            <div className="nft-carousel">
                                {userNFTs.map(nft => renderNFTCard(nft))}
                            </div>
                        ) : <p>您当前没有可用于创建衍生品的NFT。</p>
                    }
                </Col>
                <Col md={4} className="text-end">
                    <Dropdown>
                        <Dropdown.Toggle variant="primary" id="create-derivative-dropdown" disabled={userNFTs.length === 0 && derivativeType !== 'INDEX'}>
                            <FaPlus className="me-2" /> 创建衍生品
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => { setDerivativeType('CALL_OPTION'); if(userNFTs.length > 0) handleSelectNFTForDerivative(userNFTs[0]); else if (derivativeType === 'INDEX') setShowCreateModal(true); }}>看涨期权</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setDerivativeType('PUT_OPTION'); if(userNFTs.length > 0) handleSelectNFTForDerivative(userNFTs[0]); else if (derivativeType === 'INDEX') setShowCreateModal(true); }}>看跌期权</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setDerivativeType('FUTURE'); if(userNFTs.length > 0) handleSelectNFTForDerivative(userNFTs[0]); else if (derivativeType === 'INDEX') setShowCreateModal(true); }}>期货</Dropdown.Item>
                            {/* <Dropdown.Item onClick={() => { setDerivativeType('INDEX'); setShowCreateModal(true); }}>指数</Dropdown.Item> */}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="market" title="市场">
                    {loadingDerivatives ? <div className="text-center p-5"><Spinner animation="border" /></div> :
                        marketDerivatives.length > 0 ? (
                            <div className="derivative-grid">
                                {marketDerivatives.filter(d => d.status === DerivativeStatusEnum.ACTIVE && d.buyer === ethers.constants.AddressZero).map(deriv => renderDerivativeCard(deriv))}
                            </div>
                        ) : <Alert variant="info">当前市场没有可交易的衍生品。</Alert>
                    }
                </Tab>
                <Tab eventKey="my-derivatives" title="我的衍生品">
                     {loadingDerivatives ? <div className="text-center p-5"><Spinner animation="border" /></div> :
                        userDerivatives.length > 0 ? (
                            <div className="derivative-grid">
                                {userDerivatives.map(deriv => renderDerivativeCard(deriv))}
                            </div>
                        ) : <Alert variant="info">您还没有创建或购买任何衍生品。</Alert>
                    }
                </Tab>
            </Tabs>

            {renderCreateModal()}
            {renderDetailModal()}
        </div>
    );
};

export default NFTDerivatives;

