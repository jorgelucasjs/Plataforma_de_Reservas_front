import {
  Box,
  Heading,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCalendarToday } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { useBookingUiState } from '../../stores/bookingStore';
import { bookingRepository } from '../../repositories/bookingRepository';
import { BookingCard } from '../components/BookingCard';
import { BookingFilters } from '../components/BookingFilters';
import { BookingListSkeleton } from '../components/BookingListSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { ToastService } from '../../services/toastService';
import type { BookingFilters as BookingFiltersType } from '../../types/booking';

export function BookingsPage() {
  const { isClient, isProvider } = useAuth();
  const navigate = useNavigate();
  
  const {
    bookings,
    bookingFilters,
    isLoading,
    error,
    total,
    setBookingFilters,
    hasBookings,
  } = useBookingUiState();

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load bookings on component mount
  useEffect(() => {
    const loadInitialBookings = async () => {
      try {
        await bookingRepository.loadMyBookings();
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadInitialBookings();
  }, []);

  const handleFiltersChange = (filters: BookingFiltersType) => {
    setBookingFilters(filters);
  };

  const handleApplyFilters = async () => {
    try {
      await bookingRepository.applyBookingFilters(bookingFilters);
    } catch (error) {
      ToastService.error(
        'Erro ao aplicar filtros',
        'Não foi possível aplicar os filtros. Tente novamente.'
      );
    }
  };

  const handleClearFilters = async () => {
    try {
      await bookingRepository.clearBookingFilters();
    } catch (error) {
      ToastService.error(
        'Erro ao limpar filtros',
        'Não foi possível limpar os filtros. Tente novamente.'
      );
    }
  };

  const handleBookingUpdated = () => {
    ToastService.success(
      'Reserva atualizada',
      'A reserva foi cancelada com sucesso.'
    );
  };

  const handlePageChange = async (page: number) => {
    const newOffset = (page - 1) * (bookingFilters.limit || 20);
    const newFilters = { ...bookingFilters, offset: newOffset };
    
    try {
      await bookingRepository.loadMyBookings(newFilters);
    } catch (error) {
      ToastService.error(
        'Erro ao carregar página',
        'Não foi possível carregar a página solicitada.'
      );
    }
  };

  const handleItemsPerPageChange = async (itemsPerPage: number) => {
    const newFilters = { ...bookingFilters, limit: itemsPerPage, offset: 0 };
    
    try {
      await bookingRepository.loadMyBookings(newFilters);
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

  const currentPage = Math.floor((bookingFilters.offset || 0) / (bookingFilters.limit || 20)) + 1;
  const itemsPerPage = bookingFilters.limit || 20;

  const getPageTitle = () => {
    if (isClient) {
      return 'Minhas Reservas';
    } else if (isProvider) {
      return 'Reservas dos Meus Serviços';
    }
    return 'Reservas';
  };

  const getPageDescription = () => {
    if (isClient) {
      return 'Gerencie suas reservas de serviços';
    } else if (isProvider) {
      return 'Visualize as reservas feitas nos seus serviços';
    }
    return 'Gerencie suas reservas';
  };

  const getEmptyStateConfig = () => {
    if (isClient) {
      return {
        title: 'Nenhuma reserva encontrada',
        description: 'Você ainda não fez nenhuma reserva. Explore os serviços disponíveis e faça sua primeira reserva.',
        actionLabel: 'Explorar Serviços',
        onAction: navigateToServices,
      };
    } else if (isProvider) {
      return {
        title: 'Nenhuma reserva encontrada',
        description: 'Ainda não há reservas para os seus serviços. Certifique-se de que seus serviços estão ativos e bem descritos.',
        actionLabel: 'Gerenciar Serviços',
        onAction: navigateToServices,
      };
    }
    return {
      title: 'Nenhuma reserva encontrada',
      description: 'Não há reservas para exibir no momento.',
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
            <Text fontWeight="bold" mb={1}>Erro ao carregar reservas</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}

        {/* Filters */}
        <BookingFilters
          filters={bookingFilters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />

        {/* Content */}
        {isInitialLoad || isLoading ? (
          <BookingListSkeleton count={5} />
        ) : hasBookings ? (
          <VStack gap={6} align="stretch">
            {/* Bookings List */}
            <VStack gap={4} align="stretch">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={handleBookingUpdated}
                />
              ))}
            </VStack>

            {/* Pagination */}
            {total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isLoading={isLoading}
              />
            )}
          </VStack>
        ) : (
          <EmptyState
            icon={<MdCalendarToday />}
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