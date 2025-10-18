import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import {
  HiExclamationCircle,
  HiX,
  HiChevronDown,
  HiChevronUp,
  HiRefresh,
  HiTrash,
} from 'react-icons/hi';
import { useGlobalError } from '../../hooks/useGlobalError';
import { ErrorType } from '../../types/error';
import { formatRelativeTime } from '../../utils/formatters';

interface GlobalErrorDisplayProps {
  showRecentOnly?: boolean;
  maxErrors?: number;
  collapsible?: boolean;
  showClearButton?: boolean;
}

export function GlobalErrorDisplay({
  showRecentOnly = true,
  maxErrors = 5,
  collapsible = true,
  showClearButton = true,
}: GlobalErrorDisplayProps) {
  const {
    errors,
    recentErrors,
    hasErrors,
    hasRecentErrors,
    clearErrors,
    clearOldErrors,
    isOffline,
  } = useGlobalError();

  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const displayErrors = showRecentOnly ? recentErrors : errors;
  const visibleErrors = displayErrors.slice(0, maxErrors);
  const hasMoreErrors = displayErrors.length > maxErrors;

  // Don't show if no errors or dismissed
  if (!hasErrors || (!hasRecentErrors && showRecentOnly) || dismissed) {
    return null;
  }

  const getErrorColor = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return 'orange';
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        return 'red';
      case ErrorType.VALIDATION_ERROR:
        return 'yellow';
      case ErrorType.INSUFFICIENT_BALANCE:
        return 'purple';
      default:
        return 'red';
    }
  };

  const getErrorIcon = (_type: ErrorType) => {
    return <HiExclamationCircle />;
  };

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      maxW="400px"
      w="full"
      zIndex="toast"
      bg="white"
      border="1px"
      borderColor="red.200"
      borderRadius="lg"
      shadow="lg"
      overflow="hidden"
    >
      {/* Header */}
      <Flex
        p={3}
        bg="red.50"
        borderBottom="1px"
        borderColor="red.200"
        align="center"
      >
        <HStack gap={2}>
          <HiExclamationCircle color="red" />
          <Text fontSize="sm" fontWeight="bold" color="red.700">
            {isOffline ? 'Connection Issues' : 'System Errors'}
          </Text>
          <Badge colorPalette="red" size="sm">
            {displayErrors.length}
          </Badge>
        </HStack>
        
        <Spacer />
        
        <HStack gap={1}>
          {collapsible && (
            <IconButton
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </IconButton>
          )}
          
          {showClearButton && (
            <IconButton
              size="xs"
              variant="ghost"
              onClick={clearErrors}
              aria-label="Clear all errors"
            >
              <HiTrash />
            </IconButton>
          )}
          
          <IconButton
            size="xs"
            variant="ghost"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            <HiX />
          </IconButton>
        </HStack>
      </Flex>

      {/* Offline indicator */}
      {isOffline && (
        <Box p={3} bg="orange.50" borderBottom="1px" borderColor="orange.200">
          <HStack gap={2}>
            <Text fontSize="sm" color="orange.700">
              You are currently offline. Some features may not work.
            </Text>
          </HStack>
        </Box>
      )}

      {/* Error list */}
      {(!collapsible || isExpanded) && (
        <VStack align="stretch" gap={0} maxH="300px" overflowY="auto">
          {visibleErrors.map((error) => (
            <Box
              key={error.id}
              p={3}
              borderBottom="1px"
              borderColor="gray.100"
              _last={{ borderBottom: 'none' }}
            >
              <HStack align="flex-start" gap={2} mb={1}>
                <Box color={`${getErrorColor(error.type)}.500`} mt="2px">
                  {getErrorIcon(error.type)}
                </Box>
                <VStack align="stretch" gap={1} flex="1">
                  <HStack justify="space-between" align="center">
                    <Badge
                      colorPalette={getErrorColor(error.type)}
                      size="xs"
                      variant="subtle"
                    >
                      {error.type.replace('_', ' ')}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {formatRelativeTime(error.timestamp)}
                    </Text>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.700" lineHeight="1.4">
                    {error.message}
                  </Text>
                  
                  {error.context && (
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      Context: {JSON.stringify(error.context, null, 2)}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>
          ))}
          
          {hasMoreErrors && (
            <Box p={2} bg="gray.50" textAlign="center">
              <Text fontSize="xs" color="gray.600">
                ... and {displayErrors.length - maxErrors} more error{displayErrors.length - maxErrors !== 1 ? 's' : ''}
              </Text>
            </Box>
          )}
        </VStack>
      )}

      {/* Actions */}
      <Box p={3} bg="gray.50" borderTop="1px" borderColor="gray.200">
        <HStack gap={2} justify="space-between">
          <Button
            size="xs"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <HiRefresh style={{ marginRight: '4px' }} />
            Reload Page
          </Button>
          
          <HStack gap={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => clearOldErrors(5 * 60 * 1000)} // Clear errors older than 5 minutes
            >
              Clear Old
            </Button>
            
            {showClearButton && (
              <Button
                size="xs"
                colorPalette="red"
                variant="outline"
                onClick={clearErrors}
              >
                Clear All
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}

// Minimal error indicator for the header/navbar
export function ErrorIndicator() {
  const { hasRecentErrors, recentErrors } = useGlobalError();
  const [showDetails, setShowDetails] = useState(false);

  if (!hasRecentErrors) {
    return null;
  }

  return (
    <Box position="relative">
      <IconButton
        size="sm"
        variant="ghost"
        colorPalette="red"
        onClick={() => setShowDetails(!showDetails)}
        aria-label={`${recentErrors.length} recent error${recentErrors.length !== 1 ? 's' : ''}`}
      >
        <HiExclamationCircle />
        {recentErrors.length > 1 && (
          <Badge
            position="absolute"
            top="-2px"
            right="-2px"
            colorPalette="red"
            size="xs"
            borderRadius="full"
            minW="16px"
            h="16px"
            fontSize="10px"
          >
            {recentErrors.length}
          </Badge>
        )}
      </IconButton>

      {showDetails && (
        <GlobalErrorDisplay
          showRecentOnly
          maxErrors={3}
          collapsible={false}
          showClearButton={false}
        />
      )}
    </Box>
  );
}