import { Outlet } from 'react-router-dom';
import { Box, Container, Flex, Heading, VStack } from '@chakra-ui/react';

import {
  responsiveSpacing,
  responsiveFontSizes,
  cardSizes
} from '../../utils/responsive';

export function AuthLayout() {

  return (
    <Box minH="100vh" bg="gray.50">
      <Container
        maxW={{ base: 'full', sm: 'md' }}
        py={responsiveSpacing.xl}
        px={responsiveSpacing.md}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH={{ base: '100vh', sm: '80vh' }}
          pt={{ base: 4, sm: 0 }}
        >
          <VStack gap={responsiveSpacing.xl} w="full">
            <Heading
              size={responsiveFontSizes['2xl']}
              color="blue.600"
              textAlign="center"
              px={responsiveSpacing.md}
              lineHeight="shorter"
            >
              Plataforma de Prestadores de Serviços
            </Heading>
            <Box
              w="full"
              maxW={{ base: 'full', sm: 'md' }}
              bg="white"
              p={cardSizes.padding}
              borderRadius={cardSizes.borderRadius}
              boxShadow={{ base: 'none', sm: 'md' }}
              border={{ base: 'none', sm: '1px' }}
              borderColor="gray.200"
              mx="auto"
            >
              <Outlet />
            </Box>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}