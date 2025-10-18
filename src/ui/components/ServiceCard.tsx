import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import type { Service } from '../../types/service';
import { formatCurrency, formatDate, truncateText } from '../../utils/formatters';

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onBook?: (service: Service) => void;
  isProvider?: boolean;
  isLoading?: boolean;
}

export function ServiceCard({ 
  service, 
  onEdit, 
  onDelete, 
  onBook, 
  isProvider = false,
  isLoading = false
}: ServiceCardProps) {
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
      _hover={{ shadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
      role="article"
      tabIndex={0}
      _focus={{ shadow: 'outline', borderColor: 'blue.500' }}
      opacity={isLoading ? 0.6 : 1}
      pointerEvents={isLoading ? 'none' : 'auto'}
    >
      <Flex mb={3}>
        <Box>
          <Heading size="md" mb={1} color="gray.800">
            {service.name}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {isProvider ? `Created ${formatDate(service.createdAt)}` : `By ${service.providerName}`}
          </Text>
        </Box>
        <Spacer />
        <Badge colorPalette={service.isActive ? 'green' : 'gray'} variant="subtle">
          {service.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Flex>

      <Text color="gray.600" mb={3} lineHeight="1.5">
        {truncateText(service.description, 150)}
      </Text>
      
      <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={4}>
        {formatCurrency(service.price)}
      </Text>

      {isProvider ? (
        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={() => onEdit?.(service)}
            disabled={isLoading}
          >
            <MdEdit />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => onDelete?.(service)}
            disabled={isLoading}
          >
            <MdDelete />
            Delete
          </Button>
        </HStack>
      ) : (
        <Button
          size="sm"
          colorPalette={service.isActive ? "green" : "gray"}
          w="full"
          onClick={() => {
            if (service.isActive && onBook) {
              onBook(service);
            }
          }}
          disabled={!service.isActive || isLoading}
          aria-label={`Book ${service.name} for ${formatCurrency(service.price)}`}
          _hover={service.isActive ? { bg: 'green.600', transform: 'translateY(-1px)' } : {}}
          transition="all 0.2s ease-in-out"
        >
          {service.isActive ? '📅 Book Service' : '❌ Service Unavailable'}
        </Button>
      )}
    </Box>
  );
}