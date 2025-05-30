import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import {
  Box,
  Button,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Image,
  useDisclosure,
  useToast
} from '@chakra-ui/react';

const WalletConnectModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { account, connectWallet, disconnectWallet, isConnecting, error, switchToBNBChain, chainId, formatAddress } = useWeb3();
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const toast = useToast();

  // 检查是否在BSC网络
  const isBSCNetwork = chainId === 97 || chainId === 56; // 97是BSC测试网，56是BSC主网

  // 处理连接钱包
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      toast({
        title: '连接失败',
        description: err.message || '连接钱包时发生错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 处理断开连接
  const handleDisconnectWallet = () => {
    disconnectWallet();
    onClose();
  };

  // 处理切换网络
  const handleSwitchNetwork = async () => {
    try {
      await switchToBNBChain();
    } catch (err) {
      toast({
        title: '网络切换失败',
        description: err.message || '切换到BSC网络时发生错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 当钱包已连接但不在BSC网络时，显示网络警告
  React.useEffect(() => {
    if (account && !isBSCNetwork) {
      setShowNetworkWarning(true);
    } else {
      setShowNetworkWarning(false);
    }
  }, [account, isBSCNetwork]);

  return (
    <>
      <Button 
        onClick={account ? onOpen : handleConnectWallet} 
        isLoading={isConnecting}
        loadingText="连接中"
        colorScheme={account ? "green" : "blue"}
      >
        {account ? formatAddress(account) : '连接钱包'}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>钱包信息</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {account ? (
              <VStack spacing={4} align="stretch">
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="bold">已连接钱包</Text>
                  <Text mt={2}>{account}</Text>
                </Box>
                
                {showNetworkWarning && (
                  <Box p={4} bg="yellow.100" borderRadius="md">
                    <Text fontWeight="bold" color="yellow.800">网络警告</Text>
                    <Text mt={2} color="yellow.800">
                      请切换到BNB Smart Chain网络以使用所有功能
                    </Text>
                    <Button 
                      mt={2} 
                      colorScheme="yellow" 
                      onClick={handleSwitchNetwork}
                    >
                      切换到BSC网络
                    </Button>
                  </Box>
                )}
                
                <Button colorScheme="red" onClick={handleDisconnectWallet}>
                  断开连接
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6}>
                <Text>请选择连接方式：</Text>
                
                <Button 
                  width="100%" 
                  onClick={handleConnectWallet}
                  isLoading={isConnecting}
                  loadingText="连接中"
                >
                  <HStack>
                    <Image 
                      src="https://metamask.io/images/metamask-fox.svg" 
                      boxSize="24px" 
                      mr={2} 
                    />
                    <Text>MetaMask</Text>
                  </HStack>
                </Button>
                
                {error && (
                  <Box p={3} bg="red.100" borderRadius="md" width="100%">
                    <Text color="red.600">{error}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WalletConnectModal;
