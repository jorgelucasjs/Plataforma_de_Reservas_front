import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Code,
} from '@chakra-ui/react';
import { HiExclamationCircle, HiRefresh, HiHome } from 'react-icons/hi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // For now, just log to console
    console.error('Error Report:', errorReport);

    // Example: Send to monitoring service
    // errorMonitoringService.captureException(error, {
    //   extra: errorReport,
    //   tags: {
    //     component: 'ErrorBoundary',
    //     errorId: this.state.errorId,
    //   },
    // });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={6}
        >
          <Box
            maxW="lg"
            w="full"
            bg="white"
            borderRadius="lg"
            shadow="lg"
            p={8}
            textAlign="center"
          >
            <VStack gap={6}>
              <Box color="red.500" fontSize="4xl">
                <HiExclamationCircle />
              </Box>

              <VStack gap={2}>
                <Heading size="lg" color="gray.800">
                  Oops! Something went wrong
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  We're sorry, but an unexpected error occurred.
                </Text>
              </VStack>

              <Box
                p={4}
                bg="red.50"
                border="1px"
                borderColor="red.200"
                borderRadius="md"
                w="full"
              >
                <Text fontSize="sm" color="red.700" fontWeight="medium" mb={2}>
                  Error ID: {this.state.errorId}
                </Text>
                <Text fontSize="sm" color="red.600">
                  Please try refreshing the page or contact support if the problem persists.
                </Text>
              </Box>

              <HStack gap={3} w="full" justify="center">
                <Button
                  colorPalette="blue"
                  onClick={this.handleRetry}
                >
                  <HiRefresh style={{ marginRight: '8px' }} />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                >
                  <HiRefresh style={{ marginRight: '8px' }} />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                >
                  <HiHome style={{ marginRight: '8px' }} />
                  Go Home
                </Button>
              </HStack>

              {/* Developer error details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <Box w="full" border="1px" borderColor="gray.200" borderRadius="md">
                  <Box p={3} bg="gray.50" borderBottom="1px" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="medium">
                      Developer Details
                    </Text>
                  </Box>
                  <Box p={3}>
                    <VStack align="stretch" gap={3}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>
                          Error Message:
                        </Text>
                        <Code
                          p={2}
                          bg="red.50"
                          color="red.700"
                          fontSize="xs"
                          w="full"
                          whiteSpace="pre-wrap"
                        >
                          {this.state.error.message}
                        </Code>
                      </Box>

                      {this.state.error.stack && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            Stack Trace:
                          </Text>
                          <Code
                            p={2}
                            bg="gray.50"
                            fontSize="xs"
                            w="full"
                            whiteSpace="pre-wrap"
                            maxH="200px"
                            overflowY="auto"
                          >
                            {this.state.error.stack}
                          </Code>
                        </Box>
                      )}

                      {this.state.errorInfo?.componentStack && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            Component Stack:
                          </Text>
                          <Code
                            p={2}
                            bg="blue.50"
                            fontSize="xs"
                            w="full"
                            whiteSpace="pre-wrap"
                            maxH="200px"
                            overflowY="auto"
                          >
                            {this.state.errorInfo.componentStack}
                          </Code>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Unhandled error:', error, errorInfo);
    
    // In a real application, report to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error Report:', errorReport);
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}