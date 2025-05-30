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
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { ethers } from 'ethers';

const EventsPage = () => {
  const { account, signer, chainId } = useWeb3();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventContributions, setEventContributions] = useState([]);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isContributeOpen, onOpen: onContributeOpen, onClose: onContributeClose } = useDisclosure();
  
  // 创建活动表单数据
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    culture: '',
    maxParticipants: 10,
    rewardPool: 0.1
  });
  
  // 贡献表单数据
  const [contributeForm, setContributeForm] = useState({
    content: ''
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

  // 获取所有活动
  const fetchAllEvents = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      const events = await eventContract.getAllEvents();
      
      // 处理返回的活动数据
      const formattedEvents = events.map(event => ({
        eventId: event.eventId.toString(),
        name: event.name,
        description: event.description,
        culture: event.culture,
        creator: event.creator,
        maxParticipants: event.maxParticipants.toString(),
        currentParticipants: event.currentParticipants.toString(),
        rewardPool: ethers.utils.formatEther(event.rewardPool),
        isActive: event.isActive,
        isCancelled: event.isCancelled,
        isCompleted: event.isCompleted,
        createdAt: new Date(event.createdAt.toNumber() * 1000).toLocaleString()
      }));
      
      setAllEvents(formattedEvents);
    } catch (error) {
      console.error('获取活动失败:', error);
      toast({
        title: '获取活动失败',
        description: error.message || '无法获取活动列表，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取我参与的活动
  const fetchMyEvents = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      const events = await eventContract.getEventsByParticipant(account);
      
      // 处理返回的活动数据
      const formattedEvents = events.map(event => ({
        eventId: event.eventId.toString(),
        name: event.name,
        description: event.description,
        culture: event.culture,
        creator: event.creator,
        maxParticipants: event.maxParticipants.toString(),
        currentParticipants: event.currentParticipants.toString(),
        rewardPool: ethers.utils.formatEther(event.rewardPool),
        isActive: event.isActive,
        isCancelled: event.isCancelled,
        isCompleted: event.isCompleted,
        createdAt: new Date(event.createdAt.toNumber() * 1000).toLocaleString()
      }));
      
      setMyEvents(formattedEvents);
    } catch (error) {
      console.error('获取我的活动失败:', error);
      toast({
        title: '获取活动失败',
        description: error.message || '无法获取您参与的活动，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取活动贡献
  const fetchEventContributions = async (eventId) => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      const contributions = await eventContract.getEventContributions(eventId);
      
      // 处理返回的贡献数据
      const formattedContributions = contributions.map(contribution => ({
        contributor: contribution.contributor,
        content: contribution.content,
        voteCount: contribution.voteCount.toString(),
        totalRating: contribution.totalRating.toString(),
        averageRating: contribution.voteCount.toNumber() > 0 
          ? (contribution.totalRating.toNumber() / contribution.voteCount.toNumber()).toFixed(1) 
          : '0.0',
        timestamp: new Date(contribution.timestamp.toNumber() * 1000).toLocaleString()
      }));
      
      setEventContributions(formattedContributions);
    } catch (error) {
      console.error('获取活动贡献失败:', error);
      toast({
        title: '获取贡献失败',
        description: error.message || '无法获取活动贡献，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 当账户或签名者变化时获取活动数据
  useEffect(() => {
    fetchAllEvents();
    if (account) {
      fetchMyEvents();
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

  // 处理贡献表单输入变化
  const handleContributeInputChange = (e) => {
    const { name, value } = e.target;
    setContributeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 创建活动
  const handleCreateEvent = async () => {
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
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      // 将奖励池转换为wei
      const rewardPoolInWei = ethers.utils.parseEther(createForm.rewardPool.toString());
      
      const tx = await eventContract.createEvent(
        createForm.name,
        createForm.description,
        createForm.culture,
        createForm.maxParticipants,
        { value: rewardPoolInWei }
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '活动创建成功',
          description: '您的文化交流活动已成功创建',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setCreateForm({
          name: '',
          description: '',
          culture: '',
          maxParticipants: 10,
          rewardPool: 0.1
        });
        
        // 关闭创建模态框
        onCreateClose();
        
        // 刷新活动列表
        await fetchAllEvents();
        await fetchMyEvents();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('创建活动失败:', error);
      toast({
        title: '创建失败',
        description: error.message || '无法创建活动，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 加入活动
  const handleJoinEvent = async (eventId) => {
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
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      const tx = await eventContract.joinEvent(eventId);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '加入活动成功',
          description: '您已成功加入文化交流活动',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 刷新活动列表
        await fetchAllEvents();
        await fetchMyEvents();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('加入活动失败:', error);
      toast({
        title: '加入失败',
        description: error.message || '无法加入活动，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 提交贡献
  const handleSubmitContribution = async () => {
    if (!account || !signer || !selectedEvent) {
      return;
    }
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      const tx = await eventContract.submitContribution(
        selectedEvent.eventId,
        contributeForm.content
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '贡献提交成功',
          description: '您的文化贡献已成功提交',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setContributeForm({
          content: ''
        });
        
        // 关闭贡献模态框
        onContributeClose();
        
        // 刷新贡献列表
        await fetchEventContributions(selectedEvent.eventId);
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('提交贡献失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '无法提交贡献，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 为贡献投票
  const handleVoteForContribution = async (contributor, rating) => {
    if (!account || !signer || !selectedEvent) {
      return;
    }
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      const tx = await eventContract.voteForContribution(
        selectedEvent.eventId,
        contributor,
        rating
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '投票成功',
          description: '您的评分已成功提交',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 刷新贡献列表
        await fetchEventContributions(selectedEvent.eventId);
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('投票失败:', error);
      toast({
        title: '投票失败',
        description: error.message || '无法提交评分，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 完成活动
  const handleCompleteEvent = async (eventId) => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      const tx = await eventContract.completeEvent(eventId);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '活动完成',
          description: '活动已成功完成，奖励已分配',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 关闭详情模态框
        onDetailClose();
        
        // 刷新活动列表
        await fetchAllEvents();
        await fetchMyEvents();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('完成活动失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法完成活动，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 取消活动
  const handleCancelEvent = async (eventId) => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      const tx = await eventContract.cancelEvent(eventId);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '活动取消',
          description: '活动已成功取消',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 关闭详情模态框
        onDetailClose();
        
        // 刷新活动列表
        await fetchAllEvents();
        await fetchMyEvents();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('取消活动失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法取消活动，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开活动详情
  const openEventDetail = async (event) => {
    setSelectedEvent(event);
    await fetchEventContributions(event.eventId);
    onDetailOpen();
  };

  // 打开贡献模态框
  const openContributeModal = (event) => {
    setSelectedEvent(event);
    setContributeForm({
      content: ''
    });
    onContributeOpen();
  };

  // 获取活动状态标签
  const getEventStatusBadge = (event) => {
    if (event.isCancelled) {
      return <Badge colorScheme="red">已取消</Badge>;
    } else if (event.isCompleted) {
      return <Badge colorScheme="green">已完成</Badge>;
    } else if (event.isActive) {
      return <Badge colorScheme="blue">进行中</Badge>;
    } else {
      return <Badge colorScheme="gray">未开始</Badge>;
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading as="h1" size="xl">文化交流活动</Heading>
          <Button 
            colorScheme="blue" 
            onClick={onCreateOpen}
            isDisabled={!account}
          >
            创建活动
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
              <Tab>所有活动</Tab>
              <Tab>我参与的活动</Tab>
            </TabList>
            
            <TabPanels>
              {/* 所有活动列表 */}
              <TabPanel>
                {loading && allEvents.length === 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton height="20px" width="80%" />
                        </CardHeader>
                        <CardBody>
                          <Skeleton height="100px" />
                        </CardBody>
                        <CardFooter>
                          <Skeleton height="36px" width="100%" />
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : allEvents.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {allEvents.map(event => (
                      <Card key={event.eventId}>
                        <CardHeader>
                          <VStack align="start" spacing={2}>
                            <Heading size="md">{event.name}</Heading>
                            <HStack>
                              <Badge colorScheme="purple">
                                {cultureOptions.find(opt => opt.value === event.culture)?.label || event.culture}
                              </Badge>
                              {getEventStatusBadge(event)}
                            </HStack>
                          </VStack>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Text noOfLines={3}>{event.description}</Text>
                            <HStack justify="space-between" width="100%">
                              <Text fontSize="sm">参与人数: {event.currentParticipants}/{event.maxParticipants}</Text>
                              <Text fontSize="sm" fontWeight="bold" color="blue.500">奖励: {event.rewardPool} BNB</Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">创建时间: {event.createdAt}</Text>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <HStack width="100%" spacing={4}>
                            <Button 
                              flex={1}
                              colorScheme="blue"
                              onClick={() => openEventDetail(event)}
                            >
                              详情
                            </Button>
                            {event.isActive && event.creator !== account && (
                              <Button 
                                flex={1}
                                colorScheme="green"
                                onClick={() => handleJoinEvent(event.eventId)}
                                isLoading={loading}
                                isDisabled={myEvents.some(e => e.eventId === event.eventId)}
                              >
                                {myEvents.some(e => e.eventId === event.eventId) ? '已加入' : '加入'}
                              </Button>
                            )}
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="xl">暂无活动</Text>
                  </Box>
                )}
              </TabPanel>
              
              {/* 我参与的活动列表 */}
              <TabPanel>
                {loading && myEvents.length === 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton height="20px" width="80%" />
                        </CardHeader>
                        <CardBody>
                          <Skeleton height="100px" />
                        </CardBody>
                        <CardFooter>
                          <Skeleton height="36px" width="100%" />
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : myEvents.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {myEvents.map(event => (
                      <Card key={event.eventId}>
                        <CardHeader>
                          <VStack align="start" spacing={2}>
                            <Heading size="md">{event.name}</Heading>
                            <HStack>
                              <Badge colorScheme="purple">
                                {cultureOptions.find(opt => opt.value === event.culture)?.label || event.culture}
                              </Badge>
                              {getEventStatusBadge(event)}
                              {event.creator === account && (
                                <Badge colorScheme="orange">创建者</Badge>
                              )}
                            </HStack>
                          </VStack>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Text noOfLines={2}>{event.description}</Text>
                            <HStack justify="space-between" width="100%">
                              <Text fontSize="sm">参与人数: {event.currentParticipants}/{event.maxParticipants}</Text>
                              <Text fontSize="sm" fontWeight="bold" color="blue.500">奖励: {event.rewardPool} BNB</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <HStack width="100%" spacing={4}>
                            <Button 
                              flex={1}
                              colorScheme="blue"
                              onClick={() => openEventDetail(event)}
                            >
                              详情
                            </Button>
                            {event.isActive && (
                              <Button 
                                flex={1}
                                colorScheme="green"
                                onClick={() => openContributeModal(event)}
                              >
                                贡献
                              </Button>
                            )}
                            {event.isActive && event.creator === account && (
                              <Button 
                                flex={1}
                                colorScheme="purple"
                                onClick={() => handleCompleteEvent(event.eventId)}
                                isLoading={loading}
                              >
                                完成
                              </Button>
                            )}
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="xl">您还没有参与任何活动</Text>
                    <Button 
                      mt={4} 
                      colorScheme="blue" 
                      onClick={onCreateOpen}
                    >
                      创建活动
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>

      {/* 创建活动模态框 */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>创建文化交流活动</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>活动名称</FormLabel>
                <Input 
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateInputChange}
                  placeholder="输入活动名称"
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
                <FormLabel>活动描述</FormLabel>
                <Textarea 
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateInputChange}
                  placeholder="描述这个活动的目的和内容"
                  rows={4}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>最大参与人数</FormLabel>
                <Input 
                  name="maxParticipants"
                  value={createForm.maxParticipants}
                  onChange={handleCreateInputChange}
                  type="number"
                  min="2"
                  max="100"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>奖励池 (BNB)</FormLabel>
                <Input 
                  name="rewardPool"
                  value={createForm.rewardPool}
                  onChange={handleCreateInputChange}
                  type="number"
                  step="0.01"
                  min="0.01"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  创建活动需要支付奖励池金额，用于奖励优质贡献者
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateEvent}
              isLoading={loading}
              loadingText="创建中"
              isDisabled={
                !createForm.name || 
                !createForm.description || 
                !createForm.culture || 
                !createForm.maxParticipants || 
                !createForm.rewardPool
              }
            >
              创建活动
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 活动详情模态框 */}
      {selectedEvent && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedEvent.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="sm" mb={2}>活动信息</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <GridItem>
                      <Text fontWeight="bold">文化类别</Text>
                      <Badge colorScheme="purple" mt={1}>
                        {cultureOptions.find(opt => opt.value === selectedEvent.culture)?.label || selectedEvent.culture}
                      </Badge>
                    </GridItem>
                    
                    <GridItem>
                      <Text fontWeight="bold">状态</Text>
                      <Box mt={1}>{getEventStatusBadge(selectedEvent)}</Box>
                    </GridItem>
                    
                    <GridItem>
                      <Text fontWeight="bold">创建者</Text>
                      <Text mt={1} fontSize="sm" color="gray.500">
                        {selectedEvent.creator === account ? "您" : selectedEvent.creator}
                      </Text>
                    </GridItem>
                    
                    <GridItem>
                      <Text fontWeight="bold">参与人数</Text>
                      <Text mt={1}>{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}</Text>
                    </GridItem>
                    
                    <GridItem>
                      <Text fontWeight="bold">奖励池</Text>
                      <Text mt={1} fontWeight="bold" color="blue.500">{selectedEvent.rewardPool} BNB</Text>
                    </GridItem>
                    
                    <GridItem>
                      <Text fontWeight="bold">创建时间</Text>
                      <Text mt={1} fontSize="sm">{selectedEvent.createdAt}</Text>
                    </GridItem>
                    
                    <GridItem colSpan={{ md: 2 }}>
                      <Text fontWeight="bold">描述</Text>
                      <Text mt={1}>{selectedEvent.description}</Text>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={4}>贡献列表</Heading>
                  {loading && eventContributions.length === 0 ? (
                    <VStack spacing={4}>
                      {[1, 2, 3].map(i => (
                        <Card key={i} width="100%">
                          <CardBody>
                            <Skeleton height="100px" />
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : eventContributions.length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>贡献者</Th>
                          <Th>内容</Th>
                          <Th isNumeric>评分</Th>
                          <Th>操作</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {eventContributions.map((contribution, index) => (
                          <Tr key={index}>
                            <Td>
                              {contribution.contributor === account ? "您" : 
                                `${contribution.contributor.substring(0, 6)}...${contribution.contributor.substring(contribution.contributor.length - 4)}`
                              }
                            </Td>
                            <Td>{contribution.content}</Td>
                            <Td isNumeric>
                              {contribution.averageRating} ({contribution.voteCount}票)
                            </Td>
                            <Td>
                              {selectedEvent.isActive && contribution.contributor !== account && (
                                <HStack spacing={1}>
                                  {[1, 2, 3, 4, 5].map(rating => (
                                    <Button 
                                      key={rating}
                                      size="xs"
                                      onClick={() => handleVoteForContribution(contribution.contributor, rating)}
                                      isDisabled={loading}
                                    >
                                      {rating}
                                    </Button>
                                  ))}
                                </HStack>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text textAlign="center">暂无贡献</Text>
                  )}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={4}>
                {selectedEvent.isActive && myEvents.some(e => e.eventId === selectedEvent.eventId) && (
                  <Button 
                    colorScheme="green"
                    onClick={() => {
                      onDetailClose();
                      openContributeModal(selectedEvent);
                    }}
                  >
                    提交贡献
                  </Button>
                )}
                
                {selectedEvent.isActive && !myEvents.some(e => e.eventId === selectedEvent.eventId) && selectedEvent.creator !== account && (
                  <Button 
                    colorScheme="blue"
                    onClick={() => handleJoinEvent(selectedEvent.eventId)}
                    isLoading={loading}
                  >
                    加入活动
                  </Button>
                )}
                
                {selectedEvent.isActive && selectedEvent.creator === account && (
                  <>
                    <Button 
                      colorScheme="purple"
                      onClick={() => handleCompleteEvent(selectedEvent.eventId)}
                      isLoading={loading}
                    >
                      完成活动
                    </Button>
                    
                    <Button 
                      colorScheme="red"
                      onClick={() => handleCancelEvent(selectedEvent.eventId)}
                      isLoading={loading}
                    >
                      取消活动
                    </Button>
                  </>
                )}
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 提交贡献模态框 */}
      {selectedEvent && (
        <Modal isOpen={isContributeOpen} onClose={onContributeClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>提交文化贡献</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">活动名称</Text>
                  <Text>{selectedEvent.name}</Text>
                </Box>
                
                <FormControl isRequired>
                  <FormLabel>贡献内容</FormLabel>
                  <Textarea 
                    name="content"
                    value={contributeForm.content}
                    onChange={handleContributeInputChange}
                    placeholder="分享您的文化见解、创意或贡献"
                    rows={6}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onContributeClose}>
                取消
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitContribution}
                isLoading={loading}
                loadingText="提交中"
                isDisabled={!contributeForm.content}
              >
                提交贡献
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EventsPage;
