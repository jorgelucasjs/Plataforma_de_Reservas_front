import {
  Box,
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';


interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <Box
      textAlign="center"
      py={12}
      px={6}
      bg="gray.50"
      borderRadius="lg"
      borderWidth={1}
      borderStyle="dashed"
      borderColor="gray.300"
    >
      <VStack p={4}>
        {icon && (
          <Box color="gray.400" fontSize="4xl">
            {icon}
          </Box>
        )}
        
        <VStack p={2}>
          <Text fontSize="lg" fontWeight="medium" color="gray.800">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.600" maxW="md">
            {description}
          </Text>
        </VStack>

        {actionLabel && onAction && (
          <Button
            colorScheme="blue"
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}

        {children}
      </VStack>
    </Box>
  );
}