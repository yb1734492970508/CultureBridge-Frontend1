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
  SimpleGrid
} from '@chakra-ui/react';
import { ethers } from 'ethers';

const IdentityRegistration = () => {
  const { account, signer, chainId } = useWeb3();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [trustRelationships, setTrustRelationships] = useState([]);
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
  const { isOpen: isVerifyOpen, onOpen: onVerifyOpen, onClose: onVerifyClose } = useDisclosure();
  const { isOpen: isTrustOpen, onOpen: onTrustOpen, onClose: onTrustClose } = useDisclosure();
  
  // 注册表单数据
  const [registerForm, setRegisterForm] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    culture: ''
  });
  
  // 验证表单数据
  const [verifyForm, setVerifyForm] = useState({
    address: '',
    notes: ''
  });
  
  // 信任表单数据
  const [trustForm, setTrustForm] = useState({
    address: '',
    trustLevel: 5
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

  // 获取验证请求
  const fetchVerificationRequests = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      // 获取验证请求
      const requests = await identityContract.getVerificationRequests();
      
      // 处理返回的请求数据
      const formattedRequests = requests.map(request => ({
        requester: request.requester,
        verifier: request.verifier,
        status: request.status,
        notes: request.notes,
        timestamp: new Date(request.timestamp.toNumber() * 1000).toLocaleString()
      }));
      
      setVerificationRequests(formattedRequests);
    } catch (error) {
      console.error('获取验证请求失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取信任关系
  const fetchTrustRelationships = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      // 获取信任关系
      const relationships = await identityContract.getTrustRelationships(account);
      
      // 处理返回的关系数据
      const formattedRelationships = relationships.map(relationship => ({
        truster: relationship.truster,
        trusted: relationship.trusted,
        trustLevel: relationship.trustLevel.toNumber(),
        timestamp: new Date(relationship.timestamp.toNumber() * 1000).toLocaleString()
      }));
      
      setTrustRelationships(formattedRelationships);
    } catch (error) {
      console.error('获取信任关系失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当账户或签名者变化时获取数据
  useEffect(() => {
    if (account && signer) {
      fetchUserProfile();
      fetchVerificationRequests();
      fetchTrustRelationships();
    }
  }, [account, signer, chainId]);

  // 处理注册表单输入变化
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理验证表单输入变化
  const handleVerifyInputChange = (e) => {
    const { name, value } = e.target;
    setVerifyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理信任表单输入变化
  const handleTrustInputChange = (e) => {
    const { name, value } = e.target;
    setTrustForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 注册身份
  const handleRegister = async () => {
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
      
      const tx = await identityContract.register(
        registerForm.name,
        registerForm.bio,
        registerForm.avatarUrl,
        registerForm.culture
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '注册成功',
          description: '您的身份已成功注册',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setRegisterForm({
          name: '',
          bio: '',
          avatarUrl: '',
          culture: ''
        });
        
        // 关闭注册模态框
        onRegisterClose();
        
        // 刷新用户资料
        await fetchUserProfile();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      toast({
        title: '注册失败',
        description: error.message || '无法完成注册，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 请求验证
  const handleRequestVerification = async () => {
    if (!account || !signer) {
      return;
    }
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.requestVerification(
        verifyForm.address,
        verifyForm.notes
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '请求已提交',
          description: '您的验证请求已成功提交',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setVerifyForm({
          address: '',
          notes: ''
        });
        
        // 关闭验证模态框
        onVerifyClose();
        
        // 刷新验证请求
        await fetchVerificationRequests();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('请求验证失败:', error);
      toast({
        title: '请求失败',
        description: error.message || '无法提交验证请求，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 验证用户
  const handleVerifyUser = async (requesterAddress) => {
    if (!account || !signer) {
      return;
    }
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.verifyUser(requesterAddress);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '验证成功',
          description: '您已成功验证该用户的身份',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 刷新验证请求
        await fetchVerificationRequests();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('验证用户失败:', error);
      toast({
        title: '验证失败',
        description: error.message || '无法验证用户，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 拒绝验证
  const handleRejectVerification = async (requesterAddress) => {
    if (!account || !signer) {
      return;
    }
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.rejectVerification(requesterAddress);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '已拒绝',
          description: '您已拒绝该用户的验证请求',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // 刷新验证请求
        await fetchVerificationRequests();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('拒绝验证失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法拒绝验证请求，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 建立信任关系
  const handleEstablishTrust = async () => {
    if (!account || !signer) {
      return;
    }
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.establishTrust(
        trustForm.address,
        trustForm.trustLevel
      );
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '信任关系已建立',
          description: '您已成功建立信任关系',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // 重置表单
        setTrustForm({
          address: '',
          trustLevel: 5
        });
        
        // 关闭信任模态框
        onTrustClose();
        
        // 刷新信任关系
        await fetchTrustRelationships();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('建立信任关系失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法建立信任关系，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 撤销信任关系
  const handleRevokeTrust = async (trustedAddress) => {
    if (!account || !signer) {
      return;
    }
    
    try {
      setLoading(true);
      const identityContract = getWritableContractInstance('IdentityContract', signer, chainId);
      
      const tx = await identityContract.revokeTrust(trustedAddress);
      
      const result = await waitForTransaction(tx);
      
      if (result.success) {
        toast({
          title: '信任关系已撤销',
          description: '您已成功撤销信任关系',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // 刷新信任关系
        await fetchTrustRelationships();
      } else {
        throw new Error(result.error || '交易失败');
      }
    } catch (error) {
      console.error('撤销信任关系失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法撤销信任关系，请稍后再试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取验证状态文本
  const getVerificationStatusText = (status) => {
    switch (status) {
      case 0:
        return '待处理';
      case 1:
        return '已验证';
      case 2:
        return '已拒绝';
      default:
        return '未知状态';
    }
  };

  // 获取验证状态颜色
  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 0:
        return 'yellow';
      case 1:
        return 'green';
      case 2:
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">身份认证系统</Heading>
        
        {!account ? (
          <Alert status="warning">
            <AlertIcon />
            <Text>请先连接钱包以访问身份认证功能</Text>
          </Alert>
        ) : (
          <>
            {/* 用户身份卡片 */}
            <Card>
              <CardHeader>
                <Heading size="md">我的身份</Heading>
              </CardHeader>
              <CardBody>
                {loading && !userProfile ? (
                  <VStack spacing={4}>
                    <Skeleton height="20px" width="50%" />
                    <Skeleton height="20px" width="70%" />
                    <Skeleton height="20px" width="60%" />
                  </VStack>
                ) : (
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <GridItem>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontWeight="bold">用户名</Text>
                          <Text>{userProfile?.name}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">文化背景</Text>
                          <Badge colorScheme="blue">
                            {userProfile?.culture ? 
                              cultureOptions.find(opt => opt.value === userProfile.culture)?.label || userProfile.culture
                              : '未设置'
                            }
                          </Badge>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">验证状态</Text>
                          <Badge colorScheme={userProfile?.isVerified ? "green" : "yellow"}>
                            {userProfile?.isVerified ? "已验证" : "未验证"}
                          </Badge>
                        </Box>
                      </VStack>
                    </GridItem>
                    
                    <GridItem>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontWeight="bold">注册时间</Text>
                          <Text>{userProfile?.registrationDate}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">信任分数</Text>
                          <Badge colorScheme={userProfile?.trustScore > 70 ? "green" : userProfile?.trustScore > 40 ? "yellow" : "red"}>
                            {userProfile?.trustScore}/100
                          </Badge>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">钱包地址</Text>
                          <Text fontSize="sm" color="gray.500">
                            {account}
                          </Text>
                        </Box>
                      </VStack>
                    </GridItem>
                  </Grid>
                )}
              </CardBody>
              <CardFooter>
                <HStack spacing={4}>
                  {userProfile?.registrationDate === '未注册' ? (
                    <Button colorScheme="blue" onClick={onRegisterOpen}>
                      注册身份
                    </Button>
                  ) : (
                    <>
                      {!userProfile?.isVerified && (
                        <Button colorScheme="green" onClick={onVerifyOpen}>
                          请求验证
                        </Button>
                      )}
                      <Button colorScheme="purple" onClick={onTrustOpen}>
                        建立信任
                      </Button>
                    </>
                  )}
                </HStack>
              </CardFooter>
            </Card>
            
            <Divider />
            
            {/* 验证和信任标签页 */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>验证请求</Tab>
                <Tab>信任关系</Tab>
              </TabList>
              
              <TabPanels>
                {/* 验证请求标签页 */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">我的验证请求</Heading>
                    
                    {loading && verificationRequests.length === 0 ? (
                      <VStack spacing={4}>
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} height="60px" width="100%" />
                        ))}
                      </VStack>
                    ) : verificationRequests.filter(req => req.requester === account).length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {verificationRequests
                          .filter(req => req.requester === account)
                          .map((request, index) => (
                            <Card key={index} variant="outline">
                              <CardBody>
                                <VStack align="start" spacing={2}>
                                  <HStack justify="space-between" width="100%">
                                    <Text fontWeight="bold">验证者</Text>
                                    <Badge colorScheme={getVerificationStatusColor(request.status)}>
                                      {getVerificationStatusText(request.status)}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.500">
                                    {request.verifier.substring(0, 6)}...{request.verifier.substring(request.verifier.length - 4)}
                                  </Text>
                                  <Text fontWeight="bold">备注</Text>
                                  <Text fontSize="sm">{request.notes}</Text>
                                  <Text fontSize="xs" color="gray.500">请求时间: {request.timestamp}</Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                      </SimpleGrid>
                    ) : (
                      <Text textAlign="center" py={4}>您没有发出的验证请求</Text>
                    )}
                    
                    <Divider my={4} />
                    
                    <Heading size="md">待处理的验证请求</Heading>
                    
                    {loading && verificationRequests.length === 0 ? (
                      <VStack spacing={4}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} height="60px" width="100%" />
                        ))}
                      </VStack>
                    ) : verificationRequests.filter(req => req.verifier === account && req.status === 0).length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {verificationRequests
                          .filter(req => req.verifier === account && req.status === 0)
                          .map((request, index) => (
                            <Card key={index} variant="outline">
                              <CardBody>
                                <VStack align="start" spacing={2}>
                                  <Text fontWeight="bold">请求者</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {request.requester.substring(0, 6)}...{request.requester.substring(request.requester.length - 4)}
                                  </Text>
                                  <Text fontWeight="bold">备注</Text>
                                  <Text fontSize="sm">{request.notes}</Text>
                                  <Text fontSize="xs" color="gray.500">请求时间: {request.timestamp}</Text>
                                </VStack>
                              </CardBody>
                              <CardFooter>
                                <HStack spacing={4}>
                                  <Button 
                                    colorScheme="green" 
                                    size="sm"
                                    onClick={() => handleVerifyUser(request.requester)}
                                    isLoading={loading}
                                  >
                                    验证
                                  </Button>
                                  <Button 
                                    colorScheme="red" 
                                    size="sm"
                                    onClick={() => handleRejectVerification(request.requester)}
                                    isLoading={loading}
                                  >
                                    拒绝
                                  </Button>
                                </HStack>
                              </CardFooter>
                            </Card>
                          ))}
                      </SimpleGrid>
                    ) : (
                      <Text textAlign="center" py={4}>没有待处理的验证请求</Text>
                    )}
                  </VStack>
                </TabPanel>
                
                {/* 信任关系标签页 */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">我信任的用户</Heading>
                    
                    {loading && trustRelationships.length === 0 ? (
                      <VStack spacing={4}>
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} height="60px" width="100%" />
                        ))}
                      </VStack>
                    ) : trustRelationships.filter(rel => rel.truster === account).length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {trustRelationships
                          .filter(rel => rel.truster === account)
                          .map((relationship, index) => (
                            <Card key={index} variant="outline">
                              <CardBody>
                                <VStack align="start" spacing={2}>
                                  <Text fontWeight="bold">被信任者</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {relationship.trusted.substring(0, 6)}...{relationship.trusted.substring(relationship.trusted.length - 4)}
                                  </Text>
                                  <HStack>
                                    <Text fontWeight="bold">信任等级:</Text>
                                    <Badge colorScheme={
                                      relationship.trustLevel > 7 ? "green" : 
                                      relationship.trustLevel > 4 ? "blue" : 
                                      "yellow"
                                    }>
                                      {relationship.trustLevel}/10
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.500">建立时间: {relationship.timestamp}</Text>
                                </VStack>
                              </CardBody>
                              <CardFooter>
                                <Button 
                                  colorScheme="red" 
                                  size="sm"
                                  onClick={() => handleRevokeTrust(relationship.trusted)}
                                  isLoading={loading}
                                >
                                  撤销信任
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </SimpleGrid>
                    ) : (
                      <Text textAlign="center" py={4}>您还没有信任任何用户</Text>
                    )}
                    
                    <Divider my={4} />
                    
                    <Heading size="md">信任我的用户</Heading>
                    
                    {loading && trustRelationships.length === 0 ? (
                      <VStack spacing={4}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} height="60px" width="100%" />
                        ))}
                      </VStack>
                    ) : trustRelationships.filter(rel => rel.trusted === account).length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {trustRelationships
                          .filter(rel => rel.trusted === account)
                          .map((relationship, index) => (
                            <Card key={index} variant="outline">
                              <CardBody>
                                <VStack align="start" spacing={2}>
                                  <Text fontWeight="bold">信任者</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {relationship.truster.substring(0, 6)}...{relationship.truster.substring(relationship.truster.length - 4)}
                                  </Text>
                                  <HStack>
                                    <Text fontWeight="bold">信任等级:</Text>
                                    <Badge colorScheme={
                                      relationship.trustLevel > 7 ? "green" : 
                                      relationship.trustLevel > 4 ? "blue" : 
                                      "yellow"
                                    }>
                                      {relationship.trustLevel}/10
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.500">建立时间: {relationship.timestamp}</Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                      </SimpleGrid>
                    ) : (
                      <Text textAlign="center" py={4}>还没有用户信任您</Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </VStack>

      {/* 注册身份模态框 */}
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>注册身份</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>用户名</FormLabel>
                <Input 
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterInputChange}
                  placeholder="输入您的用户名"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>文化背景</FormLabel>
                <Select
                  name="culture"
                  value={registerForm.culture}
                  onChange={handleRegisterInputChange}
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
                  value={registerForm.bio}
                  onChange={handleRegisterInputChange}
                  placeholder="介绍一下您自己"
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>头像URL</FormLabel>
                <Input 
                  name="avatarUrl"
                  value={registerForm.avatarUrl}
                  onChange={handleRegisterInputChange}
                  placeholder="输入头像图片的URL"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRegisterClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleRegister}
              isLoading={loading}
              loadingText="注册中"
              isDisabled={!registerForm.name || !registerForm.culture}
            >
              注册
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 请求验证模态框 */}
      <Modal isOpen={isVerifyOpen} onClose={onVerifyClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>请求身份验证</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>验证者地址</FormLabel>
                <Input 
                  name="address"
                  value={verifyForm.address}
                  onChange={handleVerifyInputChange}
                  placeholder="输入验证者的钱包地址"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>备注</FormLabel>
                <Textarea 
                  name="notes"
                  value={verifyForm.notes}
                  onChange={handleVerifyInputChange}
                  placeholder="添加验证请求的备注信息"
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVerifyClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleRequestVerification}
              isLoading={loading}
              loadingText="提交中"
              isDisabled={!verifyForm.address}
            >
              提交请求
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 建立信任模态框 */}
      <Modal isOpen={isTrustOpen} onClose={onTrustClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>建立信任关系</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>被信任者地址</FormLabel>
                <Input 
                  name="address"
                  value={trustForm.address}
                  onChange={handleTrustInputChange}
                  placeholder="输入被信任者的钱包地址"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>信任等级 ({trustForm.trustLevel}/10)</FormLabel>
                <HStack spacing={2}>
                  <Text>低</Text>
                  <Input 
                    name="trustLevel"
                    value={trustForm.trustLevel}
                    onChange={handleTrustInputChange}
                    type="range"
                    min="1"
                    max="10"
                  />
                  <Text>高</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTrustClose}>
              取消
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleEstablishTrust}
              isLoading={loading}
              loadingText="提交中"
              isDisabled={!trustForm.address}
            >
              建立信任
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default IdentityRegistration;
