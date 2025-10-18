import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { HiChevronDown, HiChevronUp, HiExclamationCircle } from 'react-icons/hi';
import { useState } from 'react';

interface ValidationErrorDisplayProps {
  errors: Record<string, string>;
  generalError?: string;
  title?: string;
  showFieldNames?: boolean;
  collapsible?: boolean;
  maxVisibleErrors?: number;
}

export function ValidationErrorDisplay({
  errors,
  generalError,
  title = 'Please fix the following errors:',
  showFieldNames = true,
  collapsible = false,
  maxVisibleErrors = 5,
}: ValidationErrorDisplayProps) {
  const [isOpen, setIsOpen] = useState(!collapsible);
  const onToggle = () => setIsOpen(!isOpen);
  
  const fieldErrors = Object.entries(errors);
  const hasFieldErrors = fieldErrors.length > 0;
  const hasGeneralError = Boolean(generalError);
  const hasAnyErrors = hasFieldErrors || hasGeneralError;

  if (!hasAnyErrors) {
    return null;
  }

  const visibleErrors = fieldErrors.slice(0, maxVisibleErrors);
  const hiddenErrorsCount = Math.max(0, fieldErrors.length - maxVisibleErrors);

  const formatFieldName = (fieldName: string): string => {
    // Convert camelCase to readable format
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
      <HStack w="full" justify="space-between" align="center" mb={hasFieldErrors ? 2 : 0}>
        <HStack>
          <HiExclamationCircle color="red" />
          <Text fontSize="sm" fontWeight="bold" color="red.700">
            {title}
          </Text>
        </HStack>
        
        {collapsible && hasFieldErrors && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onToggle}
          >
            <HStack gap={1}>
              <Text>{isOpen ? 'Hide' : 'Show'} Details</Text>
              {isOpen ? <HiChevronUp /> : <HiChevronDown />}
            </HStack>
          </Button>
        )}
      </HStack>

      {hasGeneralError && (
        <Text fontSize="sm" color="red.700" mb={hasFieldErrors ? 2 : 0}>
          {generalError}
        </Text>
      )}

      {isOpen && hasFieldErrors && (
        <Box w="full">
          <VStack align="stretch" gap={1}>
            {visibleErrors.map(([field, error]) => (
              <Box key={field} fontSize="sm">
                <HStack align="flex-start" gap={2}>
                  <Box color="red.500" mt="2px">
                    <HiExclamationCircle size="12px" />
                  </Box>
                  <Text color="red.700">
                    {showFieldNames && (
                      <Text as="span" fontWeight="medium">
                        {formatFieldName(field)}:{' '}
                      </Text>
                    )}
                    {error}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>

          {hiddenErrorsCount > 0 && (
            <Text fontSize="xs" color="red.600" mt={2} fontStyle="italic">
              ... and {hiddenErrorsCount} more error{hiddenErrorsCount !== 1 ? 's' : ''}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

interface InlineValidationErrorProps {
  error?: string;
  touched?: boolean;
  showIcon?: boolean;
}

export function InlineValidationError({
  error,
  touched = true,
  showIcon = true,
}: InlineValidationErrorProps) {
  if (!error || !touched) {
    return null;
  }

  return (
    <HStack gap={1} align="center" mt={1}>
      {showIcon && (
        <HiExclamationCircle color="red" size="14px" />
      )}
      <Text color="red.500" fontSize="sm">
        {error}
      </Text>
    </HStack>
  );
}

interface FormValidationSummaryProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting?: boolean;
  onFieldFocus?: (fieldName: string) => void;
}

export function FormValidationSummary({
  errors,
  touched,
  isSubmitting = false,
  onFieldFocus,
}: FormValidationSummaryProps) {
  const touchedErrors = Object.entries(errors).filter(([field]) => touched[field]);
  
  if (touchedErrors.length === 0 || isSubmitting) {
    return null;
  }

  return (
    <Box
      p={3}
      bg="red.50"
      border="1px"
      borderColor="red.200"
      borderRadius="md"
      mb={4}
    >
      <HStack mb={2}>
        <HiExclamationCircle color="red" />
        <Text fontSize="sm" fontWeight="bold" color="red.700">
          {touchedErrors.length} error{touchedErrors.length !== 1 ? 's' : ''} found
        </Text>
      </HStack>
      
      <VStack align="stretch" gap={1}>
        {touchedErrors.map(([field, error]) => (
          <Box key={field}>
            {onFieldFocus ? (
              <Button
                variant="ghost"
                size="sm"
                color="red.600"
                fontWeight="normal"
                textAlign="left"
                h="auto"
                p={0}
                onClick={() => onFieldFocus(field)}
              >
                • {error}
              </Button>
            ) : (
              <Text fontSize="sm" color="red.600">
                • {error}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}