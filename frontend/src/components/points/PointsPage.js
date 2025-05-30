import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { getWritableContractInstance } from '../../utils/contracts';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';

const PointsPage = () => {
  const { account, signer, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [nextLevelPoints, setNextLevelPoints] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 获取用户积分信息
  const fetchUserPoints = async () => {
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
      
      // 获取下一级所需积分
      const nextLevel = level.toNumber() + 1;
      const pointsRequired = await pointContract.getPointsRequiredForLevel(nextLevel);
      setNextLevelPoints(pointsRequired.toNumber());
      
      // 计算进度
      const currentLevelPoints = await pointContract.getPointsRequiredForLevel(level.toNumber());
      const progressPercentage = ((points.toNumber() - currentLevelPoints.toNumber()) / 
                                 (pointsRequired.toNumber() - currentLevelPoints.toNumber())) * 100;
      setProgress(Math.min(Math.max(progressPercentage, 0), 100));
    } catch (error) {
      console.error('获取积分信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取积分历史
  const fetchPointHistory = async () => {
    if (!account || !signer) return;
    
    try {
      setLoading(true);
      const pointContract = getWritableContractInstance('PointSystemContract', signer, chainId);
      
      // 获取积分历史记录
      const history = await pointContract.getPointHistory(account);
      
      // 处理返回的历史数据
      const formattedHistory = history.map(record => ({
        points: record.points.toNumber(),
        isAddition: record.isAddition,
        reason: record.reason,
        timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString()
      }));
      
      // 按时间倒序排列
      formattedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setPointHistory(formattedHistory);
    } catch (error) {
      console.error('获取积分历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当账户或签名者变化时获取积分信息
  useEffect(() => {
    if (account && signer) {
      fetchUserPoints();
      fetchPointHistory();
    }
  }, [account, signer, chainId]);

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
        <Heading as="h1" size="xl">积分与等级系统</Heading>
        
        {!account ? (
          <Alert status="warning">
            <AlertIcon />
            <Text>请先连接钱包以查看您的积分和等级信息</Text>
          </Alert>
        ) : (
          <>
            {/* 积分和等级概览 */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* 积分卡片 */}
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Heading size="md">我的积分</Heading>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Skeleton height="60px" />
                  ) : (
                    <Stat>
                      <StatNumber fontSize="4xl" color="blue.500">{userPoints}</StatNumber>
                      <StatHelpText>文化贡献积分</StatHelpText>
                    </Stat>
                  )}
                </CardBody>
              </Card>
              
              {/* 等级卡片 */}
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Heading size="md">当前等级</Heading>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Skeleton height="60px" />
                  ) : (
                    <Stat>
                      <StatNumber fontSize="4xl" color="purple.500">Lv.{userLevel}</StatNumber>
                      <StatHelpText>{getLevelName(userLevel)}</StatHelpText>
                    </Stat>
                  )}
                </CardBody>
              </Card>
              
              {/* 升级进度卡片 */}
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Heading size="md">升级进度</Heading>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <VStack spacing={4}>
                      <Skeleton height="20px" width="100%" />
                      <Skeleton height="20px" width="100%" />
                    </VStack>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      <Progress value={progress} colorScheme="green" size="lg" borderRadius="md" />
                      <Text textAlign="right">
                        还需 <Text as="span" fontWeight="bold" color="green.500">{nextLevelPoints - userPoints}</Text> 积分升至 Lv.{userLevel + 1}
                      </Text>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Divider />
            
            {/* 等级特权说明 */}
            <Box>
              <Heading size="md" mb={4}>等级特权</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="start">
                      <Badge colorScheme="blue">Lv.1-3</Badge>
                      <Text fontWeight="bold">基础特权</Text>
                      <Text fontSize="sm">参与文化活动、创建和交易基础NFT</Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="start">
                      <Badge colorScheme="purple">Lv.4-6</Badge>
                      <Text fontWeight="bold">进阶特权</Text>
                      <Text fontSize="sm">创建文化活动、铸造稀有NFT、获得更多奖励</Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="start">
                      <Badge colorScheme="green">Lv.7+</Badge>
                      <Text fontWeight="bold">高级特权</Text>
                      <Text fontSize="sm">验证他人身份、参与治理投票、获得专属NFT</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
            
            <Divider />
            
            {/* 积分历史记录 */}
            <Box>
              <Heading size="md" mb={4}>积分历史</Heading>
              
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>全部</Tab>
                  <Tab>获得积分</Tab>
                  <Tab>消耗积分</Tab>
                </TabList>
                
                <TabPanels>
                  {/* 全部记录 */}
                  <TabPanel px={0}>
                    {loading ? (
                      <VStack spacing={4}>
                        {[1, 2, 3, 4].map(i => (
                          <Skeleton key={i} height="50px" width="100%" />
                        ))}
                      </VStack>
                    ) : pointHistory.length > 0 ? (
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>时间</Th>
                              <Th>类型</Th>
                              <Th isNumeric>积分</Th>
                              <Th>原因</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {pointHistory.map((record, index) => (
                              <Tr key={index}>
                                <Td>{record.timestamp}</Td>
                                <Td>
                                  <Badge colorScheme={record.isAddition ? "green" : "red"}>
                                    {record.isAddition ? "获得" : "消耗"}
                                  </Badge>
                                </Td>
                                <Td isNumeric fontWeight="bold" color={record.isAddition ? "green.500" : "red.500"}>
                                  {record.isAddition ? "+" : "-"}{record.points}
                                </Td>
                                <Td>{record.reason}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Text textAlign="center" py={4}>暂无积分记录</Text>
                    )}
                  </TabPanel>
                  
                  {/* 获得积分记录 */}
                  <TabPanel px={0}>
                    {loading ? (
                      <VStack spacing={4}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} height="50px" width="100%" />
                        ))}
                      </VStack>
                    ) : pointHistory.filter(record => record.isAddition).length > 0 ? (
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>时间</Th>
                              <Th isNumeric>积分</Th>
                              <Th>原因</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {pointHistory
                              .filter(record => record.isAddition)
                              .map((record, index) => (
                                <Tr key={index}>
                                  <Td>{record.timestamp}</Td>
                                  <Td isNumeric fontWeight="bold" color="green.500">
                                    +{record.points}
                                  </Td>
                                  <Td>{record.reason}</Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Text textAlign="center" py={4}>暂无获得积分记录</Text>
                    )}
                  </TabPanel>
                  
                  {/* 消耗积分记录 */}
                  <TabPanel px={0}>
                    {loading ? (
                      <VStack spacing={4}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} height="50px" width="100%" />
                        ))}
                      </VStack>
                    ) : pointHistory.filter(record => !record.isAddition).length > 0 ? (
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>时间</Th>
                              <Th isNumeric>积分</Th>
                              <Th>原因</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {pointHistory
                              .filter(record => !record.isAddition)
                              .map((record, index) => (
                                <Tr key={index}>
                                  <Td>{record.timestamp}</Td>
                                  <Td isNumeric fontWeight="bold" color="red.500">
                                    -{record.points}
                                  </Td>
                                  <Td>{record.reason}</Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Text textAlign="center" py={4}>暂无消耗积分记录</Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default PointsPage;
