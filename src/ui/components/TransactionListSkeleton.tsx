import {
  Box,
  Skeleton,
  VStack,
  HStack,
} from '@chakra-ui/react';

interface TransactionListSkeletonProps {
  count?: number;
}

export function TransactionListSkeleton({ count = 3 }: TransactionListSkeletonProps) {
  return (
    <VStack gap={4} align="stretch">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="white"
        >
          <VStack gap={3} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack gap={2} align="start" flex={1}>
                <Skeleton height="20px" width="60%" />
                <Skeleton height="16px" width="40%" />
              </VStack>
              <VStack gap={1} align="end">
                <Skeleton height="20px" width="80px" borderRadius="full" />
                <Skeleton height="16px" width="60px" borderRadius="full" />
              </VStack>
            </HStack>

            <HStack justify="space-between">
              <Skeleton height="16px" width="30%" />
              <Skeleton height="20px" width="35%" />
            </HStack>

            <HStack justify="space-between">
              <Skeleton height="16px" width="40%" />
              <Skeleton height="16px" width="45%" />
            </HStack>

            <HStack justify="space-between">
              <Skeleton height="16px" width="35%" />
              <Skeleton height="16px" width="25%" />
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}

export function TransactionCardSkeleton() {
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
    >
      <VStack gap={3} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack gap={2} align="start" flex={1}>
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
          <VStack gap={1} align="end">
            <Skeleton height="20px" width="80px" borderRadius="full" />
            <Skeleton height="16px" width="60px" borderRadius="full" />
          </VStack>
        </HStack>

        <HStack justify="space-between">
          <Skeleton height="16px" width="30%" />
          <Skeleton height="20px" width="35%" />
        </HStack>

        <HStack justify="space-between">
          <Skeleton height="16px" width="40%" />
          <Skeleton height="16px" width="45%" />
        </HStack>

        <HStack justify="space-between">
          <Skeleton height="16px" width="35%" />
          <Skeleton height="16px" width="25%" />
        </HStack>
      </VStack>
    </Box>
  );
}