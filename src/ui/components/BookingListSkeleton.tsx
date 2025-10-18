import {
  Box,
  Skeleton,
  VStack,
  HStack,
} from '@chakra-ui/react';

interface BookingListSkeletonProps {
  count?: number;
}

export function BookingListSkeleton({ count = 3 }: BookingListSkeletonProps) {
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
              <Skeleton height="24px" width="80px" borderRadius="full" />
            </HStack>

            <HStack justify="space-between">
              <Skeleton height="16px" width="30%" />
              <Skeleton height="16px" width="25%" />
            </HStack>

            <HStack justify="space-between">
              <Skeleton height="16px" width="35%" />
              <Skeleton height="16px" width="40%" />
            </HStack>

            <Box pt={2}>
              <Skeleton height="32px" width="full" borderRadius="md" />
            </Box>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}

export function BookingCardSkeleton() {
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
          <Skeleton height="24px" width="80px" borderRadius="full" />
        </HStack>

        <HStack justify="space-between">
          <Skeleton height="16px" width="30%" />
          <Skeleton height="16px" width="25%" />
        </HStack>

        <HStack justify="space-between">
          <Skeleton height="16px" width="35%" />
          <Skeleton height="16px" width="40%" />
        </HStack>

        <Box mt={2}>
          <Skeleton height="16px" width="80%" mb={2} />
          <Skeleton height="16px" width="60%" />
        </Box>

        <Box pt={2}>
          <Skeleton height="32px" width="full" borderRadius="md" />
        </Box>
      </VStack>
    </Box>
  );
}