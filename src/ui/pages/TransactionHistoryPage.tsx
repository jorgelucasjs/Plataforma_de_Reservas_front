import {
  Box,
  Heading,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHistory } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { useBookingUiState } from '../../stores/bookingStore';
import { bookingRepository } from '../../repositories/bookingRepository';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionListSkeleton } from '../components/TransactionListSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { ToastService } from '../../services/toastService';
import type { TransactionFilters as TransactionFiltersType } from '../../types/booking';

export function TransactionHistoryPage() {
  const { isClient, isProvider } = useAuth();
  const navigate = useNavigate();
  
  const {
    transactions,
    transactionFilters,
    isLoading,
    error,
    transactionTotal,
    setTransactionFilters,
    hasTransactions,
  } = useBookingUiState();

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load transactions on component mount
  useEffect(() => {
    const loadInitialTransactions = async () => {
      try {
        await bookingRepository.loadTransactionHistory();
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadInitialTransactions();
  }, []);

  const handleFiltersChange = (filters: TransactionFiltersType) => {
    setTransactionFilters(filters);
  };

  const handleApplyFilters = async () => {
    try {
      await bookingRepository.applyTransactionFilters(transactionFilters);
    } catch (error) {
      ToastService.error(
        'Erro ao aplicar filtros',
        'Não foi possível aplicar os filtros. Tente novamente.'
      );
    }
  };

  const handleClearFilters = async () => {
    try {
      await bookingRepository.clearTransactionFilters();
    } catch (error) {
      ToastService.error(
        'Erro ao limpar filtros',
        'Não foi possível limpar os filtros. Tente novamente.'
      );
    }
  };

  const handlePageChange = async (page: number) => {
    const newOffset = (page - 1) * (transactionFilters.limit || 20);
    const newFilters = { ...transactionFilters, offset: newOffset };
    
    try {
      await bookingRepository.loadTransactionHistory(newFilters);
    } catch (error) {
      ToastService.error(
        'Erro ao carregar página',
        'Não foi possível carregar a página solicitada.'
      );
    }
  };

  const handleItemsPerPageChange = async (itemsPerPage: number) => {
    const newFilters = { ...transactionFilters, limit: itemsPerPage, offset: 0 };
    
    try {
      await bookingRepository.loadTransactionHistory(newFilters);
    } catch (error) {
      ToastService.error(
        'Erro ao alterar itens por página',
        'Não foi possível alterar o número de itens por página.'
      );
    }
  };

  const navigateToServices = () => {
    navigate('/services');
  };

  const navigateToBookings = () => {
    navigate('/bookings');
  };

  const currentPage = Math.floor((transactionFilters.offset || 0) / (transactionFilters.limit || 20)) + 1;
  const itemsPerPage = transactionFilters.limit || 20;

  const getPageTitle = () => {
    if (isClient) {
      return 'Histórico de Transações';
    } else if (isProvider) {
      return 'Histórico de Transações';
    }
    return 'Histórico de Transações';
  };

  const getPageDescription = () => {
    if (isClient) {
      return 'Visualize todas as suas transações de pagamentos e reembolsos';
    } else if (isProvider) {
      return 'Visualize todas as transações relacionadas aos seus serviços';
    }
    return 'Visualize o histórico completo de transações';
  };

  const getEmptyStateConfig = () => {
    if (isClient) {
      return {
        title: 'Nenhuma transação encontrada',
        description: 'Você ainda não possui transações. Faça sua primeira reserva para começar a ver o histórico.',
        actionLabel: 'Explorar Serviços',
        onAction: navigateToServices,
      };
    } else if (isProvider) {
      return {
        title: 'Nenhuma transação encontrada',
        description: 'Ainda não há transações relacionadas aos seus serviços. Aguarde as primeiras reservas.',
        actionLabel: 'Ver Reservas',
        onAction: navigateToBookings,
      };
    }
    return {
      title: 'Nenhuma transação encontrada',
      description: 'Não há transações para exibir no momento.',
    };
  };

  const emptyStateConfig = getEmptyStateConfig();

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            {getPageTitle()}
          </Heading>
          <Text color="gray.600">
            {getPageDescription()}
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700">
            <Text fontWeight="bold" mb={1}>Erro ao carregar transações</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}

        {/* Filters */}
        <TransactionFilters
          filters={transactionFilters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />

        {/* Content */}
        {isInitialLoad || isLoading ? (
          <TransactionListSkeleton count={5} />
        ) : hasTransactions ? (
          <VStack gap={6} align="stretch">
            {/* Summary */}
            <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
              <Text fontSize="sm" color="blue.800">
                <strong>Total de transações:</strong> {transactionTotal}
              </Text>
              {transactions.length > 0 && (
                <Text fontSize="sm" color="blue.700" mt={1}>
                  Mostrando {transactions.length} de {transactionTotal} transações
                </Text>
              )}
            </Box>

            {/* Transactions List */}
            <VStack gap={4} align="stretch">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </VStack>

            {/* Pagination */}
            {transactionTotal > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={transactionTotal}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isLoading={isLoading}
              />
            )}
          </VStack>
        ) : (
          <EmptyState
            icon={<MdHistory />}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            actionLabel={emptyStateConfig.actionLabel}
            onAction={emptyStateConfig.onAction}
          />
        )}
      </VStack>
    </Box>
  );
}