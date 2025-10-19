import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { router } from './router';
import { AuthGuard } from './components/AuthGuard';

function App() {


  return (
    <ChakraProvider value={defaultSystem}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
    </ChakraProvider>
  );
}

export default App
