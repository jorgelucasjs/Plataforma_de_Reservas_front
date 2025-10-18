import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  MdError, 
  MdWarning, 
  MdInfo, 
  MdRefresh, 
  MdExpandMore, 
  MdExpandLess,
  MdClose 
} from 'react-icons/md';

export type AlertType = 'error' | 'warning' | 'info';

interface ErrorAlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showRetry?: boolean;
  showDismiss?: boolean;
  showDetails?: boolean;
  isRetrying?: boolean;
  variant?: 'solid' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

const alertConfig = {
  error: {
    icon: MdError,
    bg: {
      solid: 'red.500',
      outline: 'white',
      subtle: 'red.50'
    },
    borderColor: 'red.500',
    iconColor: {
      solid: 'white',
      outline: 'red.500',
      subtle: 'red.500'
    },
    titleColor: {
      solid: 'white',
      outline: 'red.800',
      subtle: 'red.800'
    },
    messageColor: {
      solid: 'red.100',
      outline: 'red.700',
      subtle: 'red.700'
    }
  },
  warning: {
    icon: MdWarning,
    bg: {
      solid: 'orange.500',
      outline: 'white',
      subtle: 'orange.50'
    },
    borderColor: 'orange.500',
    iconColor: {
      solid: 'white',
      outline: 'orange.500',
      subtle: 'orange.500'
    },
    titleColor: {
      solid: 'white',
      outline: 'orange.800',
      subtle: 'orange.800'
    },
    messageColor: {
      solid: 'orange.100',
      outline: 'orange.700',
      subtle: 'orange.700'
    }
  },
  info: {
    icon: MdInfo,
    bg: {
      solid: 'blue.500',
      outline: 'white',
      subtle: 'blue.50'
    },
    borderColor: 'blue.500',
    iconColor: {
      solid: 'white',
      outline: 'blue.500',
      subtle: 'blue.500'
    },
    titleColor: {
      solid: 'white',
      outline: 'blue.800',
      subtle: 'blue.800'
    },
    messageColor: {
      solid: 'blue.100',
      outline: 'blue.700',
      subtle: 'blue.700'
    }
  }
};

export function ErrorAlert({
  type = 'error',
  title,
  message,
  details,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  showRetry = true,
  showDismiss = true,
  showDetails = true,
  isRetrying = false,
  variant = 'subtle',
  size = 'md'
}: ErrorAlertProps) {
  const { open: showDetailsOpen, onToggle: toggleDetails } = useDisclosure();
  const config = alertConfig[type];
  const Icon = config.icon;

  const hasDetails = details && showDetails;
  const hasActions = (onRetry && showRetry) || (onDismiss && showDismiss);

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const padding = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;

  return (
    <Box
      bg={config.bg[variant]}
      border={variant === 'outline' ? '1px' : 'none'}
      borderColor={variant === 'outline' ? config.borderColor : 'transparent'}
      borderRadius="lg"
      p={padding}
      role="alert"
      aria-live="polite"
    >
      <HStack align="flex-start" gap={3}>
        <Box color={config.iconColor[variant]} mt={0.5} flexShrink={0}>
          <Icon size={iconSize} />
        </Box>
        
        <VStack align="flex-start" gap={2} flex="1" minW={0}>
          <Text
            fontWeight="semibold"
            color={config.titleColor[variant]}
            fontSize={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            lineHeight="1.2"
          >
            {title}
          </Text>
          
          {message && (
            <Text
              color={config.messageColor[variant]}
              fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
              lineHeight="1.4"
            >
              {message}
            </Text>
          )}

          {hasDetails && (
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleDetails}
              color={config.titleColor[variant]}
              _hover={{ bg: variant === 'solid' ? 'whiteAlpha.200' : `${type}.100` }}
              p={1}
              h="auto"
              fontWeight="normal"
            >
              {showDetailsOpen ? 'Hide' : 'Show'} Details
              {showDetailsOpen ? <MdExpandLess /> : <MdExpandMore />}
            </Button>
          )}

          {showDetailsOpen && details && (
            <Box
              bg={variant === 'solid' ? 'whiteAlpha.200' : `${type}.100`}
              borderRadius="md"
              p={3}
              w="full"
            >
              <Text
                fontSize="xs"
                fontFamily="mono"
                color={config.messageColor[variant]}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {details}
              </Text>
            </Box>
          )}

          {hasActions && (
            <HStack gap={2} pt={1}>
              {onRetry && showRetry && (
                <Button
                  size={size}
                  variant={variant === 'solid' ? 'outline' : 'solid'}
                  colorPalette={type}
                  onClick={onRetry}
                  disabled={isRetrying}
                  loading={isRetrying}
                  loadingText="Retrying..."
                >
                  {!isRetrying && <MdRefresh />}
                  {retryLabel}
                </Button>
              )}
              
              {onDismiss && showDismiss && (
                <Button
                  size={size}
                  variant="ghost"
                  onClick={onDismiss}
                  color={config.titleColor[variant]}
                  _hover={{ bg: variant === 'solid' ? 'whiteAlpha.200' : `${type}.100` }}
                >
                  <MdClose />
                  {dismissLabel}
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}

// Convenience components for common error scenarios
interface NetworkErrorProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
}

export function NetworkError({ onRetry, onDismiss, isRetrying }: NetworkErrorProps) {
  return (
    <ErrorAlert
      type="error"
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      onDismiss={onDismiss}
      isRetrying={isRetrying}
    />
  );
}

interface ValidationErrorProps {
  errors: string[];
  onDismiss?: () => void;
}

export function ValidationError({ errors, onDismiss }: ValidationErrorProps) {
  return (
    <ErrorAlert
      type="warning"
      title="Validation Error"
      message="Please correct the following errors:"
      details={errors.join('\n')}
      onDismiss={onDismiss}
      showRetry={false}
    />
  );
}

interface NotFoundErrorProps {
  resource?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function NotFoundError({ resource = 'resource', onRetry, onDismiss }: NotFoundErrorProps) {
  return (
    <ErrorAlert
      type="warning"
      title="Not Found"
      message={`The requested ${resource} could not be found.`}
      onRetry={onRetry}
      onDismiss={onDismiss}
      retryLabel="Refresh"
    />
  );
}

interface PermissionErrorProps {
  action?: string;
  onDismiss?: () => void;
}

export function PermissionError({ action = 'perform this action', onDismiss }: PermissionErrorProps) {
  return (
    <ErrorAlert
      type="warning"
      title="Permission Denied"
      message={`You don't have permission to ${action}.`}
      onDismiss={onDismiss}
      showRetry={false}
    />
  );
}