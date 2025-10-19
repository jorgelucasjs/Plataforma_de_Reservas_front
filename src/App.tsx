import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { router } from './router';
import { AuthGuard } from './components/AuthGuard';
import { ApiDebugPanel } from './components/ApiDebugPanel';
import { BookingApiTester } from './components/BookingApiTester';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthGuard>
        <RouterProvider router={router} />
        {/* Ferramentas de debug apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <>
            <ApiDebugPanel />
            <div className="fixed top-4 right-4 z-40">
              <BookingApiTester />
            </div>
          </>
        )}
      </AuthGuard>
    </ChakraProvider>
  );
}

export default App
