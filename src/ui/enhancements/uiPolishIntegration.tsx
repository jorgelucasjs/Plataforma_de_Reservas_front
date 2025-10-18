/**
 * UI Polish Integration
 * 
 * Integrates all UI enhancements, optimizations, and polish features
 * into existing components for a cohesive user experience.
 */

import React, { Suspense, lazy } from 'react';
import { Box, Flex, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';

// Import all enhancement components
import { 
  LoadingSpinner, 
  CardSkeleton, 
  PageLoading,
  FormLoadingOverlay 
} from '../components/LoadingStates';

import {
  FadeIn,
  FadeInUp,
  ScaleIn,
  StaggeredList,
  PageTransition,
  HoverScale,
  HoverLift,
  LoadingTransition
} from '../components/Transitions';

import {
  ToastNotification,
  SuccessState,
  ErrorState,
  ProgressFeedback,
  StatusBadge,
  ConfirmationDialog
} from '../components/FeedbackComponents';

import { 
  useOptimizedToast,
  useAccessibilityAnnouncements,
  useFocusManagement,
  useNetworkStatus,
  useErrorRecovery
} from '../utils/uiOptimizations';

import { utilityStyles, createTransition } from '../theme/consistentStyling';

// Enhanced Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  const { announce } = useAccessibilityAnnouncements();
  
  React.useEffect(() => {
    announce('An error occurred. Please try again.', 'assertive');
  }, [announce]);

  return (
    <ErrorState
      title="Something went wrong"
      description={error.message || 'An unexpected error occurred'}
      retry={{
        label: 'Try Again',
        onClick: resetErrorBoundary
      }}
    />
  );
};

// Enhanced Page Wrapper with all optimizations
export const EnhancedPageWrapper = ({ 
  children, 
  title,
  isLoading = false,
  error = null,
  onRetry
}: {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}) => {
  const { isOnline } = useNetworkStatus();
  const { showToast } = useOptimizedToast();

  React.useEffect(() => {
    if (!isOnline) {
      showToast({
        title: 'Connection Lost',
        description: 'You are currently offline. Some features may not work.',
        status: 'warning',
        duration: null,
        isClosable: true,
      });
    }
  }, [isOnline, showToast]);

  if (error) {
    return (
      <PageTransition>
        <ErrorState
          title="Page Error"
          description={error.message}
          retry={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
        />
      </PageTransition>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PageTransition>
        <Box {...utilityStyles.container}>
          {title && (
            <FadeInUp>
              <Text fontSize="2xl" fontWeight="bold" mb={6}>
                {title}
              </Text>
            </FadeInUp>
          )}
          
          <LoadingTransition
            isLoading={isLoading}
            loadingComponent={<PageLoading />}
          >
            {children}
          </LoadingTransition>
        </Box>
      </PageTransition>
    </ErrorBoundary>
  );
};

// Enhanced Card Component with animations and interactions
export const EnhancedCard = ({ 
  children, 
  isLoading = false,
  onClick,
  hover = true,
  ...props 
}: any) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const CardWrapper = hover ? HoverLift : Box;

  return (
    <CardWrapper
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      transition={createTransition()}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      {...props}
    >
      <FormLoadingOverlay isLoading={isLoading}>
        {children}
      </FormLoadingOverlay>
    </CardWrapper>
  );
};

// Enhanced Button with loading states and feedback
export const EnhancedButton = ({ 
  children,
  isLoading = false,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  onClick,
  showFeedback = true,
  ...props 
}: any) => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { showToast } = useOptimizedToast();

  const handleClick = async (e: React.MouseEvent) => {
    if (!onClick) return;

    setStatus('loading');
    
    try {
      await onClick(e);
      setStatus('success');
      
      if (showFeedback) {
        showToast({
          title: 'Success',
          description: successText,
          status: 'success',
          duration: 2000,
        });
      }
      
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      
      if (showFeedback) {
        showToast({
          title: 'Error',
          description: error instanceof Error ? error.message : errorText,
          status: 'error',
          duration: 4000,
        });
      }
      
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Flex align="center" gap={2}>
            <LoadingSpinner size="sm" />
            <Text>{loadingText}</Text>
          </Flex>
        );
      case 'success':
        return successText;
      case 'error':
        return errorText;
      default:
        return children;
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      isDisabled={status === 'loading' || isLoading}
      colorScheme={
        status === 'success' ? 'green' : 
        status === 'error' ? 'red' : 
        props.colorScheme
      }
      transition={createTransition()}
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'lg',
        ...props._hover,
      }}
      _active={{
        transform: 'translateY(0)',
        ...props._active,
      }}
    >
      {getButtonContent()}
    </Button>
  );
};

// Enhanced List with staggered animations and virtual scrolling
export const EnhancedList = ({ 
  items, 
  renderItem, 
  isLoading = false,
  emptyMessage = 'No items found',
  loadingCount = 5,
  staggered = true,
  ...props 
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingCount?: number;
  staggered?: boolean;
}) => {
  if (isLoading) {
    return <CardSkeleton count={loadingCount} />;
  }

  if (items.length === 0) {
    return (
      <FadeIn>
        <Box textAlign="center" py={8}>
          <Text color="gray.500" fontSize="lg">
            {emptyMessage}
          </Text>
        </Box>
      </FadeIn>
    );
  }

  const listItems = items.map((item, index) => (
    <Box key={item.id || index}>
      {renderItem(item, index)}
    </Box>
  ));

  return (
    <Box {...props}>
      {staggered ? (
        <StaggeredList staggerDelay={0.1}>
          {listItems}
        </StaggeredList>
      ) : (
        <FadeIn>
          {listItems}
        </FadeIn>
      )}
    </Box>
  );
};

// Enhanced Form with optimizations
export const EnhancedForm = ({ 
  children, 
  onSubmit, 
  isLoading = false,
  ...props 
}: any) => {
  const { saveFocus, restoreFocus } = useFocusManagement();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || isSubmitting) return;

    saveFocus();
    setIsSubmitting(true);

    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
      restoreFocus();
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} {...props}>
      <FormLoadingOverlay isLoading={isLoading || isSubmitting}>
        {children}
      </FormLoadingOverlay>
    </Box>
  );
};

// Enhanced Modal with focus management and animations
export const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md',
  ...props 
}: any) => {
  const { trapFocus, restoreFocus, saveFocus } = useFocusManagement();
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      saveFocus();
      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current);
        return cleanup;
      }
    } else {
      restoreFocus();
    }
  }, [isOpen, trapFocus, restoreFocus, saveFocus]);

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.6)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
      onClick={onClose}
    >
      <ScaleIn>
        <Box
          ref={modalRef}
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          maxW={size === 'sm' ? '400px' : size === 'lg' ? '800px' : '600px'}
          mx={4}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {title && (
            <Box p={6} pb={4}>
              <Text fontSize="xl" fontWeight="bold">
                {title}
              </Text>
            </Box>
          )}
          <Box p={6} pt={title ? 0 : 6}>
            {children}
          </Box>
        </Box>
      </ScaleIn>
    </Box>
  );
};

// Enhanced Grid with responsive behavior
export const EnhancedGrid = ({ 
  children, 
  columns = { base: 1, md: 2, lg: 3 },
  gap = 6,
  ...props 
}: any) => (
  <Box
    display="grid"
    gridTemplateColumns={{
      base: `repeat(${columns.base || 1}, 1fr)`,
      md: `repeat(${columns.md || 2}, 1fr)`,
      lg: `repeat(${columns.lg || 3}, 1fr)`,
      xl: `repeat(${columns.xl || columns.lg || 3}, 1fr)`,
    }}
    gap={gap}
    {...props}
  >
    {children}
  </Box>
);

// Enhanced Search with debouncing and loading states
export const EnhancedSearch = ({ 
  onSearch, 
  placeholder = 'Search...',
  debounceMs = 300,
  isLoading = false,
  ...props 
}: any) => {
  const [value, setValue] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(async () => {
      if (value.trim()) {
        setIsSearching(true);
        try {
          await onSearch(value.trim());
        } finally {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <Box position="relative" {...props}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '2px solid #e2e8f0',
          fontSize: '16px',
          transition: 'all 0.2s ease',
        }}
      />
      {(isLoading || isSearching) && (
        <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
          <LoadingSpinner size="sm" />
        </Box>
      )}
    </Box>
  );
};

// Enhanced Status Display
export const EnhancedStatus = ({ 
  status, 
  message,
  showIcon = true,
  ...props 
}: {
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message: string;
  showIcon?: boolean;
}) => (
  <FadeIn>
    <Flex align="center" gap={3} {...props}>
      {showIcon && <StatusBadge status={status} />}
      <Text>{message}</Text>
    </Flex>
  </FadeIn>
);

// Export all enhanced components
export {
  ErrorFallback,
  EnhancedPageWrapper,
  EnhancedCard,
  EnhancedButton,
  EnhancedList,
  EnhancedForm,
  EnhancedModal,
  EnhancedGrid,
  EnhancedSearch,
  EnhancedStatus,
};

// Export utility for applying enhancements to existing components
export const withEnhancements = <P extends object>(
  Component: React.ComponentType<P>,
  enhancements: {
    loading?: boolean;
    error?: boolean;
    animation?: boolean;
    hover?: boolean;
  } = {}
) => {
  return React.forwardRef<any, P & { isLoading?: boolean; error?: Error }>((props, ref) => {
    const { isLoading, error, ...restProps } = props;

    if (enhancements.error && error) {
      return <ErrorState title="Component Error" description={error.message} />;
    }

    if (enhancements.loading && isLoading) {
      return <LoadingSpinner />;
    }

    const WrappedComponent = enhancements.animation ? 
      (componentProps: any) => (
        <FadeIn>
          <Component {...componentProps} ref={ref} />
        </FadeIn>
      ) : Component;

    const HoverComponent = enhancements.hover ? HoverScale : React.Fragment;

    return (
      <HoverComponent>
        <WrappedComponent {...restProps} />
      </HoverComponent>
    );
  });
};

export default {
  EnhancedPageWrapper,
  EnhancedCard,
  EnhancedButton,
  EnhancedList,
  EnhancedForm,
  EnhancedModal,
  EnhancedGrid,
  EnhancedSearch,
  EnhancedStatus,
  withEnhancements,
};