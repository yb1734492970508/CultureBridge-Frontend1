import React from 'react';
import { Box, Flex, Container, Link, Text, HStack, Image } from '@chakra-ui/react';
import WalletConnectModal from '../wallet/WalletConnectModal';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <Box as="header" bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          {/* Logo and Title */}
          <HStack spacing={3}>
            <Image 
              src="https://via.placeholder.com/40/3182CE/FFFFFF?text=CB" 
              alt="CultureBridge Logo" 
              borderRadius="md"
            />
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              CultureBridge
            </Text>
          </HStack>
          
          {/* Navigation */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Link as={RouterLink} to="/profile" fontWeight="medium">个人资料</Link>
            <Link as={RouterLink} to="/identity" fontWeight="medium">身份管理</Link>
            <Link as={RouterLink} to="/nft-marketplace" fontWeight="medium">NFT市场</Link>
            <Link as={RouterLink} to="/events" fontWeight="medium">文化活动</Link>
            <Link as={RouterLink} to="/points" fontWeight="medium">积分系统</Link>
          </HStack>
          
          {/* Wallet Connect Button */}
          <WalletConnectModal />
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
