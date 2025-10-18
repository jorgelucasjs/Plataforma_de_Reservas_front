import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
} from '@chakra-ui/react';
import type { Transaction } from '../../types/booking';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { user } = useAuth();

  const isClient = user?.userType === 'client';
  const isProvider = user?.userType === 'provider';

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'green';
      case 'refund':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Pagamento';
      case 'refund':
        return 'Reembolso';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getDisplayInfo = () => {
    if (isClient) {
      return {
        title: transaction.serviceName,
        subtitle: `Prestador: ${transaction.providerName}`,
        amountPrefix: transaction.type === 'payment' ? '-' : '+',
        amountColor: transaction.type === 'payment' ? 'red.600' : 'green.600',
      };
    } else if (isProvider) {
      return {
        title: transaction.serviceName,
        subtitle: `Cliente: ${transaction.clientName}`,
        amountPrefix: transaction.type === 'payment' ? '+' : '-',
        amountColor: transaction.type === 'payment' ? 'green.600' : 'red.600',
      };
    }
    return {
      title: transaction.serviceName,
      subtitle: `${transaction.clientName} → ${transaction.providerName}`,
      amountPrefix: '',
      amountColor: 'gray.800',
    };
  };

  const displayInfo = getDisplayInfo();

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
      _hover={{ shadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
    >
      <VStack gap={3} align="stretch">
        <HStack justify="space-between" align="start">
          <VStack gap={1} align="start" flex={1}>
            <Heading size="sm" color="gray.800">
              {displayInfo.title}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {displayInfo.subtitle}
            </Text>
          </VStack>
          <VStack gap={1} align="end">
            <Badge colorPalette={getTransactionTypeColor(transaction.type)} variant="subtle">
              {getTransactionTypeLabel(transaction.type)}
            </Badge>
            <Badge colorPalette={getStatusColor(transaction.status)} variant="outline" size="sm">
              {getStatusLabel(transaction.status)}
            </Badge>
          </VStack>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Valor:
          </Text>
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            color={displayInfo.amountColor}
          >
            {displayInfo.amountPrefix}{formatCurrency(transaction.amount)}
          </Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Data da Transação:
          </Text>
          <Text fontSize="sm" color="gray.800">
            {formatDate(transaction.createdAt, { includeTime: true })}
          </Text>
        </HStack>

        {transaction.bookingId && (
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              ID da Reserva:
            </Text>
            <Text fontSize="sm" color="gray.800" fontFamily="mono">
              {transaction.bookingId.slice(-8)}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}