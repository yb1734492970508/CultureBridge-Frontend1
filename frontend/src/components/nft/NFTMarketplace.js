import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { getWritableContractInstance, waitForTransaction } from '../../utils/contracts';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Badge,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  useToast,
  Alert,
  AlertIcon,
  Select,
  SimpleGrid
} from '@chakra-ui/react';
import { ethers } from 'ethers';

const NFTMarketplace = () => {
  const { account, signer, chainId } = useWeb3();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [listedNFTs, setListedNFTs] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isListOpen, onOpen: onListOpen, onClose: onListClose } = useDisclosure();
  
  // 创建NFT表单数据
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    culture: ''
  });
  
  // 上架NFT表单数据
  const [listForm, setListForm] = useState({
    price: ''
  });

  // 文化选项
  const cultureOptions = [
    { value: '', label: '请选择文化类别' },
    { value: 'chinese', label: '中国文化' },
    { value: 'western', label: '西方文化' },
    { value: 'african', label: '非洲文化' },
    { value: 'middleEastern', label: '中东文化' },
    { value: 'latinAmerican', label: '拉丁美洲文化' },
    { value: 'southAsian', label: '南亚文化' },
    { value: 'eastAsian', label: '东亚文化' },
    { value: 'indigenous', label: '原住民文化' },
    { value: 'other', label: '其他文化' }
  ];

  // 获取所有上架的NFT
  const fetchListedNFTs = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      const nfts = await nftContract.getAllListedNFTs();
      
      // 处理返回的NFT数据
      const formattedNFTs = nfts.map(nft => ({
        tokenId: nft.tokenId.toString(),
        name: nft.name,
        description: nft.description,
        imageUrl: nft.imageUrl,
        culture: nft.culture,
        creator: nft.creator,
        owner: nft.owner,
        price: ethers.utils.formatEther(nft.price),
        isListed: nft.isListed
      }));
      
      setListedNFTs(formattedNFTs);
    } catch (error) {
      console.error('获取上架NFT失败:', error);
      toast({
        title: '获取NFT失败',
        description: error.message || '无法获取上架的NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取我的NFT
  const fetchMyNFTs = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      const nfts = await nftContract.getNFTsByOwner(account);
      
      // 处理返回的NFT数据
      const formattedNFTs = nfts.map(nft => ({
        tokenId: nft.tokenId.toString(),
        name: nft.name,
        description: nft.description,
        imageUrl: nft.imageUrl,
        culture: nft.culture,
        creator: nft.creator,
        owner: nft.owner,
        price: ethers.utils.formatEther(nft.price),
        isListed: nft.isListed
      }));
      
      setMyNFTs(formattedNFTs);
    } catch (error) {
      console.error('获取我的NFT失败:', error);
      toast({
        title: '获取NFT失败',
        description: error.message || '无法获取您的NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 当账户或签名者变化时获取NFT数据
  useEffect(() => {
    fetchListedNFTs();
    if (account) {
      fetchMyNFTs();
    }
  }, [account, signer, chainId]);

  // 处理创建表单输入变化
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理上架表单输入变化
  const handleListInputChange = (e) => {
    const { name, value } = e.target;
    setListForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 创建NFT
  const handleCreateNFT = async () => {
    if (!account || !signer) {
      toast({
        title: '未连接钱包',
        description: '请先连接您的钱包',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      
      const tx = await nftContract.mintNFT(
        createForm.name,
        createForm.description,
        createForm.imageUrl,
        createForm.culture
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: 'NFT创建成功',
          description: '您的文化NFT已成功铸造',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setCreateForm({
          name: '',
          description: '',
          imageUrl: '',
          culture: ''
        });
        
        // 关闭创建模态框
        onCreateClose();
        
        // 刷新NFT列表
        await fetchMyNFTs();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('创建NFT失败:', error);
      toast({
        title: '创建失败',
        description: error.message || '无法创建NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 上架NFT
  const handleListNFT = async () => {
    if (!account || !signer || !selectedNFT) {
      return;
    }
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      
      // 将价格转换为wei
      const priceInWei = ethers.utils.parseEther(listForm.price);
      
      const tx = await nftContract.listNFT(
        selectedNFT.tokenId,
        priceInWei
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: 'NFT上架成功',
          description: '您的文化NFT已成功上架到市场',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setListForm({
          price: ''
        });
        
        // 关闭上架模态框
        onListClose();
        
        // 刷新NFT列表
        await fetchListedNFTs();
        await fetchMyNFTs();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('上架NFT失败:', error);
      toast({
        title: '上架失败',
        description: error.message || '无法上架NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 购买NFT
  const handleBuyNFT = async (nft) => {
    if (!account || !signer) {
      toast({
        title: '未连接钱包',
        description: '请先连接您的钱包',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      
      // 将价格转换为wei
      const priceInWei = ethers.utils.parseEther(nft.price);
      
      const tx = await nftContract.buyNFT(nft.tokenId, { value: priceInWei });
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: 'NFT购买成功',
          description: '您已成功购买文化NFT',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 关闭详情模态框
        onDetailClose();
        
        // 刷新NFT列表
        await fetchListedNFTs();
        await fetchMyNFTs();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('购买NFT失败:', error);
      toast({
        title: '购买失败',
        description: error.message || '无法购买NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 下架NFT
  const handleUnlistNFT = async (nft) => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      
      const tx = await nftContract.unlistNFT(nft.tokenId);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: 'NFT下架成功',
          description: '您的文化NFT已成功从市场下架',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 关闭详情模态框
        onDetailClose();
        
        // 刷新NFT列表
        await fetchListedNFTs();
        await fetchMyNFTs();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('下架NFT失败:', error);
      toast({
        title: '下架失败',
        description: error.message || '无法下架NFT，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开NFT详情
  const openNFTDetail = (nft) => {
    setSelectedNFT(nft);
    onDetailOpen();
  };

  // 打开NFT上架模态框
  const openListModal = (nft) => {
    setSelectedNFT(nft);
    setListForm({
      price: ''
    });
    onListOpen();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading as="h1" size="xl">文化NFT市场</Heading>
          <Button 
            colorScheme="blue" 
            onClick={onCreateOpen}
            isDisabled={!account}
          >
            创建NFT
          </Button>
        </Flex>

        {!account ? (
          <Alert status="warning">
            <AlertIcon />
            <Text>请先连接钱包以访问完整功能</Text>
          </Alert>
        ) : (
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>市场</Tab>
              <Tab>我的NFT</Tab>
            </TabList>
            
            <TabPanels>
              {/* 市场NFT列表 */}
              <TabPanel>
                {loading && listedNFTs.length === 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i}>
                        <Skeleton height="200px" />
                        <CardBody>
                          <Skeleton height="20px" mb={2} />
                          <Skeleton height="20px" />
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : listedNFTs.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {listedNFTs.map(nft => (
                      <Card key={nft.tokenId} overflow="hidden">
                        <Image 
                          src={nft.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={nft.name}
                          height="200px"
                          objectFit="cover"
                        />
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <Heading size="md">{nft.name}</Heading>
                            <Badge colorScheme="blue">
                              {cultureOptions.find(opt => opt.value === nft.culture)?.label || nft.culture}
                            </Badge>
                            <Text color="blue.600" fontSize="xl" fontWeight="bold">
                              {nft.price} BNB
                            </Text>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <Button 
                            width="full" 
                            colorScheme="blue"
                            onClick={() => openNFTDetail(nft)}
                          >
                            查看详情
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="xl">暂无上架的NFT</Text>
                  </Box>
                )}
              </TabPanel>
              
              {/* 我的NFT列表 */}
              <TabPanel>
                {loading && myNFTs.length === 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <Skeleton height="200px" />
                        <CardBody>
                          <Skeleton height="20px" mb={2} />
                          <Skeleton height="20px" />
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : myNFTs.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {myNFTs.map(nft => (
                      <Card key={nft.tokenId} overflow="hidden">
                        <Image 
                          src={nft.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={nft.name}
                          height="200px"
                          objectFit="cover"
                        />
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <Heading size="md">{nft.name}</Heading>
                            <Badge colorScheme="blue">
                              {cultureOptions.find(opt => opt.value === nft.culture)?.label || nft.culture}
                            </Badge>
                            {nft.isListed && (
                              <Text color="blue.600" fontSize="xl" fontWeight="bold">
                                {nft.price} BNB
                              </Text>
                            )}
                            <Badge colorScheme={nft.isListed ? "green" : "gray"}>
                              {nft.isListed ? "已上架" : "未上架"}
                            </Badge>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <HStack width="full" spacing={4}>
                            <Button 
                              flex={1}
                              colorScheme="blue"
                              onClick={() => openNFTDetail(nft)}
                            >
                              详情
                            </Button>
                            {!nft.isListed && (
                              <Button 
                                flex={1}
                                colorScheme="green"
                                onClick={() => openListModal(nft)}
                              >
                                上架
                              </Button>
                            )}
                            {nft.isListed && (
                              <Button 
                                flex={1}
                                colorScheme="red"
                                onClick={() => handleUnlistNFT(nft)}
                                isLoading={loading}
                              >
                                下架
                              </Button>
                            )}
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="xl">您还没有NFT</Text>
                    <Button 
                      mt={4} 
                      colorScheme="blue" 
                      onClick={onCreateOpen}
                    >
                      创建NFT
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>

      {/* 创建NFT模态框 */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>创建文化NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>NFT名称</FormLabel>
                <Input 
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateInputChange}
                  placeholder="输入NFT名称"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>文化类别</FormLabel>
                <Select
                  name="culture"
                  value={createForm.culture}
                  onChange={handleCreateInputChange}
                  placeholder="选择文化类别"
                >
                  {cultureOptions.map(option => (
                    option.value && <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>描述</FormLabel>
                <Textarea 
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateInputChange}
                  placeholder="描述这个NFT的文化意义"
                  rows={4}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>图片URL</FormLabel>
                <Input 
                  name="imageUrl"
                  value={createForm.imageUrl}
                  onChange={handleCreateInputChange}
                  placeholder="输入NFT图片的URL"
                />
              </FormControl>
              
              {createForm.imageUrl && (
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" alignSelf="stretch">
                  <Image 
                    src={createForm.imageUrl} 
                    alt="NFT预览"
                    fallbackSrc="https://via.placeholder.com/400x300?text=图片预览"
                    maxH="300px"
                    width="100%"
                    objectFit="contain"
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateNFT}
              isLoading={loading}
              loadingText="创建中"
              isDisabled={!createForm.name || !createForm.description || !createForm.imageUrl || !createForm.culture}
            >
              创建NFT
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* NFT详情模态框 */}
      {selectedNFT && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedNFT.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <GridItem>
                  <Image 
                    src={selectedNFT.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'} 
                    alt={selectedNFT.name}
                    borderRadius="md"
                    width="100%"
                    objectFit="cover"
                  />
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold">文化类别</Text>
                      <Badge colorScheme="blue" fontSize="0.8em" mt={1}>
                        {cultureOptions.find(opt => opt.value === selectedNFT.culture)?.label || selectedNFT.culture}
                      </Badge>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">描述</Text>
                      <Text mt={1}>{selectedNFT.description}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">创作者</Text>
                      <Text mt={1} fontSize="sm" color="gray.500">
                        {selectedNFT.creator}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">所有者</Text>
                      <Text mt={1} fontSize="sm" color="gray.500">
                        {selectedNFT.owner}
                      </Text>
                    </Box>
                    
                    {selectedNFT.isListed && (
                      <Box>
                        <Text fontWeight="bold">价格</Text>
                        <Text mt={1} fontSize="xl" color="blue.600" fontWeight="bold">
                          {selectedNFT.price} BNB
                        </Text>
                      </Box>
                    )}
                    
                    <Box>
                      <Text fontWeight="bold">状态</Text>
                      <Badge colorScheme={selectedNFT.isListed ? "green" : "gray"} mt={1}>
                        {selectedNFT.isListed ? "已上架" : "未上架"}
                      </Badge>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </ModalBody>
            <ModalFooter>
              {selectedNFT.isListed && selectedNFT.owner !== account && (
                <Button 
                  colorScheme="green" 
                  onClick={() => handleBuyNFT(selectedNFT)}
                  isLoading={loading}
                  loadingText="购买中"
                >
                  购买NFT
                </Button>
              )}
              {selectedNFT.isListed && selectedNFT.owner === account && (
                <Button 
                  colorScheme="red" 
                  onClick={() => handleUnlistNFT(selectedNFT)}
                  isLoading={loading}
                  loadingText="下架中"
                >
                  下架NFT
                </Button>
              )}
              {!selectedNFT.isListed && selectedNFT.owner === account && (
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    onDetailClose();
                    openListModal(selectedNFT);
                  }}
                >
                  上架NFT
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 上架NFT模态框 */}
      {selectedNFT && (
        <Modal isOpen={isListOpen} onClose={onListClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>上架NFT</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">NFT名称</Text>
                  <Text>{selectedNFT.name}</Text>
                </Box>
                
                <FormControl isRequired>
                  <FormLabel>价格 (BNB)</FormLabel>
                  <Input 
                    name="price"
                    value={listForm.price}
                    onChange={handleListInputChange}
                    placeholder="输入NFT价格"
                    type="number"
                    step="0.01"
                    min="0.01"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onListClose}>
                取消
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleListNFT}
                isLoading={loading}
                loadingText="上架中"
                isDisabled={!listForm.price || parseFloat(listForm.price) <= 0}
              >
                确认上架
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default NFTMarketplace;
