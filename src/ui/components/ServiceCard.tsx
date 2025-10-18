import { memo } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import type { Service } from '../../types/service';
import { formatCurrency, formatDate, truncateText } from '../../services/memoizationService';
import { useResponsive } from '../../hooks/useResponsive';
import { useRenderPerformance } from '../../hooks/usePerformance';
import {
  cardSizes,
  touchTargets,
  responsiveSpacing,
  responsiveFontSizes
} from '../../utils/responsive';

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onBook?: (service: Service) => void;
  isProvider?: boolean;
  isLoading?: boolean;
}

export const ServiceCard = memo(function ServiceCard({
  service,
  onEdit,
  onDelete,
  onBook,
  isProvider = false,
  isLoading = false
}: ServiceCardProps) {
  const { isMobile, isTouch } = useResponsive();
  useRenderPerformance('ServiceCard');

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius={cardSizes.borderRadius}
      p={cardSizes.padding}
      bg="white"
      _hover={{
        shadow: 'md',
        borderColor: 'blue.300',
        transform: 'translateY(-2px)'
      }}
      transition="all 0.2s ease-in-out"
      role="article"
      tabIndex={0}
      _focus={{
        shadow: 'outline',
        outline: '2px solid',
        outlineColor: 'blue.500',
        outlineOffset: '2px',
        borderColor: 'blue.500'
      }}
      opacity={isLoading ? 0.6 : 1}
      pointerEvents={isLoading ? 'none' : 'auto'}
      cursor={isLoading ? 'not-allowed' : 'default'}
      w="full"
      h="full"
      display="flex"
      flexDirection="column"
    >
      <Flex mb={responsiveSpacing.sm} align="start" gap={2}>
        <Box flex={1} minW={0}>
          <Heading
            size={responsiveFontSizes.md}
            mb={1}
            color="gray.800"
            lineHeight="shorter"
            overflow="hidden"
            textOverflow="ellipsis"
            display="-webkit-box"
            style={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {service.name}
          </Heading>
          <Text
            fontSize={responsiveFontSizes.xs}
            color="gray.500"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {isProvider ? `Created ${formatDate(service.createdAt)}` : `By ${service.providerName}`}
          </Text>
        </Box>
        <Badge
          colorPalette={service.isActive ? 'green' : 'gray'}
          variant="subtle"
          size={isMobile ? 'md' : 'sm'}
          flexShrink={0}
        >
          {service.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Flex>

      <Text
        color="gray.600"
        mb={responsiveSpacing.sm}
        lineHeight="1.5"
        fontSize={responsiveFontSizes.sm}
        flex={1}
        overflow="hidden"
        textOverflow="ellipsis"
        display="-webkit-box"
        style={{
          WebkitLineClamp: isMobile ? 3 : 4,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {truncateText(service.description, isMobile ? 120 : 150)}
      </Text>

      <Text
        fontSize={responsiveFontSizes.xl}
        fontWeight="bold"
        color="blue.600"
        mb={responsiveSpacing.md}
      >
        {formatCurrency(service.price)}
      </Text>

      {isProvider ? (
        <HStack
          gap={responsiveSpacing.sm}
          flexDirection={{ base: 'column', sm: 'row' }}
          w="full"
        >
          <Button
            size={isMobile || isTouch ? 'md' : 'sm'}
            variant="outline"
            colorPalette="blue"
            onClick={() => onEdit?.(service)}
            disabled={isLoading}
            flex={{ base: 1, sm: 'auto' }}
            w={{ base: 'full', sm: 'auto' }}
            minH={isTouch ? touchTargets.comfortable : 'auto'}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'blue.500',
              outlineOffset: '2px'
            }}
            _active={{
              transform: 'scale(0.98)'
            }}
          >
            <HStack gap={2}>
              <MdEdit size={isMobile ? 18 : 16} />
              <Text>Edit</Text>
            </HStack>
          </Button>
          <Button
            size={isMobile || isTouch ? 'md' : 'sm'}
            variant="outline"
            colorPalette="red"
            onClick={() => onDelete?.(service)}
            disabled={isLoading}
            flex={{ base: 1, sm: 'auto' }}
            w={{ base: 'full', sm: 'auto' }}
            minH={isTouch ? touchTargets.comfortable : 'auto'}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'red.500',
              outlineOffset: '2px'
            }}
            _active={{
              transform: 'scale(0.98)'
            }}
          >
            <HStack gap={2}>
              <MdDelete size={isMobile ? 18 : 16} />
              <Text>Delete</Text>
            </HStack>
          </Button>
        </HStack>
      ) : (
        <Button
          size={isMobile || isTouch ? 'md' : 'sm'}
          colorPalette={service.isActive ? "green" : "gray"}
          w="full"
          onClick={() => {
            if (service.isActive && onBook) {
              onBook(service);
            }
          }}
          disabled={!service.isActive || isLoading}
          aria-label={`Book ${service.name} for ${formatCurrency(service.price)}`}
          minH={isTouch ? touchTargets.comfortable : 'auto'}
          _hover={service.isActive ? {
            bg: 'green.600',
            transform: 'translateY(-1px)',
            shadow: 'md'
          } : {}}
          _focus={{
            boxShadow: 'outline',
            outline: '2px solid',
            outlineColor: service.isActive ? 'green.500' : 'gray.500',
            outlineOffset: '2px'
          }}
          _active={{
            transform: 'scale(0.98)'
          }}
          transition="all 0.2s ease-in-out"
          fontSize={responsiveFontSizes.sm}
        >
          {service.isActive ? '📅 Book Service' : '❌ Service Unavailable'}
        </Button>
      )}
    </Box>
  );
});