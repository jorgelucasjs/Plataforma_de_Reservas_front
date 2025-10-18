import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

export function AppLayout() {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation will be added in task 8 */}
      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
}