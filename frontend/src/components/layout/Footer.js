import React from 'react';
import { Box, Container, Flex, Text, Link, HStack } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box as="footer" bg="gray.100" py={6} mt={10}>
      <Container maxW="container.xl">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
          <Text>&copy; {new Date().getFullYear()} CultureBridge. 保留所有权利。</Text>
          
          <HStack spacing={4} mt={{ base: 4, md: 0 }}>
            <Link href="#" isExternal>关于我们</Link>
            <Link href="#" isExternal>使用条款</Link>
            <Link href="#" isExternal>隐私政策</Link>
            <Link href="#" isExternal>联系我们</Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
