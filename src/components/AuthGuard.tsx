import type { ReactNode } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading } = useAuth();

  // Show loading spinner while initializing authentication
  if (isLoading) {
    return (
      <Center minH="100vh" bg="gray.50">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" />
        </Box>
      </Center>
    );
  }

  return <>{children}</>;
}