import { Outlet } from 'react-router-dom';
import { Box, Container, Flex, Heading, VStack } from '@chakra-ui/react';

export function AuthLayout() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="md" py={12}>
        <Flex direction="column" align="center" justify="center" minH="80vh">
          <VStack gap={8} w="full">
            <Heading size="xl" color="blue.600" textAlign="center">
              Service Provider Platform
            </Heading>
            <Box
              w="full"
              bg="white"
              p={8}
              borderRadius="lg"
              boxShadow="md"
              border="1px"
              borderColor="gray.200"
            >
              <Outlet />
            </Box>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}