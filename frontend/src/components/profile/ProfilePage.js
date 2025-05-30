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
  Avatar,
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
  Image,
  Stack
} from '@chakra-ui/react';
import { ethers } from 'ethers';

const ProfilePage = () => {
  const { account, signer, chainId } = useWeb3();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  // 编辑个人资料表单数据
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    culture: ''
  });

  // 文化选项
  const cultureOptions = [
    { value: '', label: '请选择文化背景' },
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

  // 获取用户资料
  const fetchUserProfile = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      // 获取用户资料
      const profile = await identityContract.getUserProfile(account);
      
      // 处理返回的资料数据
      const formattedProfile = {
        address: account,
        name: profile.name || `用户_${account.substring(2, 8)}`,
        bio: profile.bio || '这个用户还没有填写个人简介',
        avatarUrl: profile.avatarUrl || 'https://via.placeholder.com/150?text=No+Avatar',
        culture: profile.culture || '',
        isVerified: profile.isVerified,
        registrationDate: profile.registrationDate.toNumber() > 0 
          ? new Date(profile.registrationDate.toNumber() * 1000).toLocaleString() 
          : '未注册',
        trustScore: profile.trustScore.toNumber()
      };
      
      setUserProfile(formattedProfile);
      
      // 设置编辑表单初始值
      setEditForm({
        name: formattedProfile.name,
        bio: formattedProfile.bio,
        avatarUrl: formattedProfile.avatarUrl,
        culture: formattedProfile.culture
      });
    } catch (error) {
      console.error('获取用户资料失败:', error);
      toast({
        title: '获取资料失败',
        description: error.message || '无法获取用户资料，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取用户NFT
  const fetchUserNFTs = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const nftContract = getWritableContractInstance('CultureNFTContract', signer, chainId);
      
      // 获取用户NFT
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
      
      setUserNFTs(formattedNFTs);
    } catch (error) {
      console.error('获取用户NFT失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户参与的活动
  const fetchUserEvents = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const eventContract = getWritableContractInstance('CultureEventContract', signer, chainId);
      
      // 获取用户参与的活动
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
      
      setUserEvents(formattedEvents);
    } catch (error) {
      console.error('获取用户活动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户积分和等级
  const fetchUserPointsAndLevel = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const pointContract = getWritableContractInstance('PointSystemContract', signer, chainId);
      
      // 获取用户积分
      const points = await pointContract.getUserPoints(account);
      setUserPoints(points.toNumber());
      
      // 获取用户等级
      const level = await pointContract.getUserLevel(account);
      setUserLevel(level.toNumber());
    } catch (error) {
      console.error('获取用户积分和等级失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当账户或签名者变化时获取用户数据
  useEffect(() => {
    if (account && signer) {
      fetchUserProfile();
      fetchUserNFTs();
      fetchUserEvents();
      fetchUserPointsAndLevel();
    }
  }, [account, signer, chainId]);

  // 处理编辑表单输入变化
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 更新用户资料
  const handleUpdateProfile = async () => {
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
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.updateProfile(
        editForm.name,
        editForm.bio,
        editForm.avatarUrl,
        editForm.culture
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '资料更新成功',
          description: '您的个人资料已成功更新',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 关闭编辑模态框
        onEditClose();
        
        // 刷新用户资料
        await fetchUserProfile();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('更新资料失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '无法更新资料，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取等级名称
  const getLevelName = (level) => {
    const levelNames = [
      '新手',
      '学徒',
      '探索者',
      '文化使者',
      '文化大师',
      '文化守护者',
      '文化传承人',
      '文化先驱',
      '文化领袖',
      '文化传奇'
    ];
    
    return level < levelNames.length ? levelNames[level] : `高级文化传奇 ${level - levelNames.length + 1}`;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {!account ? (
          <Alert status="warning">
            <AlertIcon />
            <Text>请先连接钱包以查看您的个人资料</Text>
          </Alert>
        ) : (
          <>
            {/* 个人资料卡片 */}
            <Card>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
                  {/* 左侧头像和基本信息 */}
                  <GridItem>
                    <VStack spacing={4} align="center">
                      {loading && !userProfile ? (
                        <Skeleton height="200px" width="200px" borderRadius="full" />
                      ) : (
                        <Avatar 
                          size="2xl" 
                          src={userProfile?.avatarUrl} 
                          name={userProfile?.name}
                          borderWidth={3}
                          borderColor={userProfile?.isVerified ? "green.400" : "gray.200"}
                        />
                      )}
                      
                      {loading && !userProfile ? (
                        <Skeleton height="30px" width="150px" />
                      ) : (
                        <VStack spacing={1}>
                          <Heading size="md">{userProfile?.name}</Heading>
                          {userProfile?.isVerified && (
                            <Badge colorScheme="green">已验证身份</Badge>
                          )}
                        </VStack>
                      )}
                      
                      {loading ? (
                        <Skeleton height="20px" width="100%" />
                      ) : (
                        <HStack>
                          <Badge colorScheme="purple">Lv.{userLevel}</Badge>
                          <Text fontWeight="bold">{getLevelName(userLevel)}</Text>
                        </HStack>
                      )}
                      
                      <Button 
                        colorScheme="blue" 
                        size="sm" 
                        width="full"
                        onClick={onEditOpen}
                      >
                        编辑资料
                      </Button>
                    </VStack>
                  </GridItem>
                  
                  {/* 右侧详细信息 */}
                  <GridItem>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>文化背景</Text>
                        {loading && !userProfile ? (
                          <Skeleton height="20px" width="150px" />
                        ) : (
                          <Badge colorScheme="blue">
                            {userProfile?.culture ? 
                              cultureOptions.find(opt => opt.value === userProfile.culture)?.label || userProfile.culture
                              : '未设置'
                            }
                          </Badge>
                        )}
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>个人简介</Text>
                        {loading && !userProfile ? (
                          <>
                            <Skeleton height="20px" mb={2} />
                            <Skeleton height="20px" />
                          </>
                        ) : (
                          <Text>{userProfile?.bio}</Text>
                        )}
                      </Box>
                      
                      <Divider />
                      
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                        <Box>
                          <Text fontWeight="bold" mb={1}>钱包地址</Text>
                          {loading ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              {account.substring(0, 6)}...{account.substring(account.length - 4)}
                            </Text>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>注册时间</Text>
                          {loading && !userProfile ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              {userProfile?.registrationDate}
                            </Text>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>信任分数</Text>
                          {loading && !userProfile ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Badge colorScheme={userProfile?.trustScore > 70 ? "green" : userProfile?.trustScore > 40 ? "yellow" : "red"}>
                              {userProfile?.trustScore}/100
                            </Badge>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>积分</Text>
                          {loading ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Text fontWeight="bold" color="blue.500">{userPoints}</Text>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>拥有NFT</Text>
                          {loading ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Text fontWeight="bold" color="purple.500">{userNFTs.length}</Text>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>参与活动</Text>
                          {loading ? (
                            <Skeleton height="20px" />
                          ) : (
                            <Text fontWeight="bold" color="green.500">{userEvents.length}</Text>
                          )}
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
            
            {/* 用户内容标签页 */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>我的NFT</Tab>
                <Tab>参与活动</Tab>
              </TabList>
              
              <TabPanels>
                {/* 我的NFT标签页 */}
                <TabPanel px={0}>
                  {loading && userNFTs.length === 0 ? (
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
                  ) : userNFTs.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {userNFTs.map(nft => (
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
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontSize="xl">您还没有NFT</Text>
                      <Button 
                        mt={4} 
                        colorScheme="blue" 
                        onClick={() => window.location.href = '/nft'}
                      >
                        前往NFT市场
                      </Button>
                    </Box>
                  )}
                </TabPanel>
                
                {/* 参与活动标签页 */}
                <TabPanel px={0}>
                  {loading && userEvents.length === 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {[1, 2, 3].map(i => (
                        <Card key={i}>
                          <CardBody>
                            <Skeleton height="100px" />
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : userEvents.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {userEvents.map(event => (
                        <Card key={event.eventId}>
                          <CardBody>
                            <VStack align="start" spacing={3}>
                              <Heading size="md">{event.name}</Heading>
                              <HStack>
                                <Badge colorScheme="purple">
                                  {cultureOptions.find(opt => opt.value === event.culture)?.label || event.culture}
                                </Badge>
                                <Badge colorScheme={
                                  event.isCancelled ? "red" : 
                                  event.isCompleted ? "green" : 
                                  event.isActive ? "blue" : "gray"
                                }>
                                  {
                                    event.isCancelled ? "已取消" : 
                                    event.isCompleted ? "已完成" : 
                                    event.isActive ? "进行中" : "未开始"
                                  }
                                </Badge>
                                {event.creator === account && (
                                  <Badge colorScheme="orange">创建者</Badge>
                                )}
                              </HStack>
                              <Text noOfLines={2}>{event.description}</Text>
                              <HStack justify="space-between" width="100%">
                                <Text fontSize="sm">参与人数: {event.currentParticipants}/{event.maxParticipants}</Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.500">奖励: {event.rewardPool} BNB</Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">创建时间: {event.createdAt}</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontSize="xl">您还没有参与任何活动</Text>
                      <Button 
                        mt={4} 
                        colorScheme="blue" 
                        onClick={() => window.location.href = '/events'}
                      >
                        前往活动页面
                      </Button>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </VStack>

      {/* 编辑资料模态框 */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>编辑个人资料</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>用户名</FormLabel>
                <Input 
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  placeholder="输入您的用户名"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>文化背景</FormLabel>
                <Select
                  name="culture"
                  value={editForm.culture}
                  onChange={handleEditInputChange}
                  placeholder="选择您的文化背景"
                >
                  {cultureOptions.map(option => (
                    option.value && <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>个人简介</FormLabel>
                <Textarea 
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditInputChange}
                  placeholder="介绍一下您自己"
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>头像URL</FormLabel>
                <Input 
                  name="avatarUrl"
                  value={editForm.avatarUrl}
                  onChange={handleEditInputChange}
                  placeholder="输入头像图片的URL"
                />
              </FormControl>
              
              {editForm.avatarUrl && (
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden" alignSelf="stretch">
                  <Image 
                    src={editForm.avatarUrl} 
                    alt="头像预览"
                    fallbackSrc="https://via.placeholder.com/150?text=头像预览"
                    maxH="150px"
                    width="100%"
                    objectFit="contain"
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUpdateProfile}
              isLoading={loading}
              loadingText="更新中"
            >
              保存资料
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
