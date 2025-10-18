import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Textarea,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { Booking } from '../../types/booking';
import { formatCurrency, formatDate, formatBookingStatus } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { bookingRepository } from '../../repositories/bookingRepository';

interface BookingCardProps {
  booking: Booking;
  onBookingUpdated?: (booking: Booking) => void;
}

export function BookingCard({ booking, onBookingUpdated }: BookingCardProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const isClient = user?.userType === 'client';
  const isProvider = user?.userType === 'provider';
  const canCancel = booking.status === 'confirmed' && (
    (isClient && booking.clientId === user?.id) ||
    (isProvider && booking.providerId === user?.id)
  );

  const handleCancelBooking = async () => {
    if (!booking.id) return;

    setIsLoading(true);
    try {
      const updatedBooking = await bookingRepository.cancelBooking(
        booking.id,
        cancellationReason ? { reason: cancellationReason } : undefined
      );
      
      onBookingUpdated?.(updatedBooking);
      setIsOpen(false);
      setCancellationReason('');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      // Error handling is done in the repository
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDisplayInfo = () => {
    if (isClient) {
      return {
        title: booking.serviceName,
        subtitle: `Prestador: ${booking.providerName}`,
        actionLabel: 'Cancelar Reserva',
      };
    } else {
      return {
        title: booking.serviceName,
        subtitle: `Cliente: ${booking.clientName}`,
        actionLabel: 'Cancelar Reserva',
      };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <>
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
            <Badge colorPalette={getStatusColor(booking.status)} variant="subtle">
              {formatBookingStatus(booking.status)}
            </Badge>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Valor:
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.800">
              {formatCurrency(booking.amount)}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Data da Reserva:
            </Text>
            <Text fontSize="sm" color="gray.800">
              {formatDate(booking.createdAt, { includeTime: true })}
            </Text>
          </HStack>

          {booking.status === 'cancelled' && booking.cancelledAt && (
            <>
              <Box borderTop="1px" borderColor="gray.200" pt={3}>
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Cancelado em:
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      {formatDate(booking.cancelledAt, { includeTime: true })}
                    </Text>
                  </HStack>
                  {booking.cancellationReason && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Motivo:
                      </Text>
                      <Text fontSize="sm" color="gray.800" fontStyle="italic">
                        "{booking.cancellationReason}"
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            </>
          )}

          {canCancel && (
            <>
              <Box borderTop="1px" borderColor="gray.200" pt={3}>
                <Button
                  size="sm"
                  colorPalette="red"
                  variant="outline"
                  onClick={() => setIsOpen(true)}
                  width="full"
                >
                  {displayInfo.actionLabel}
                </Button>
              </Box>
            </>
          )}
        </VStack>
      </Box>

      {/* Cancellation Confirmation Dialog */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="md"
            w="full"
            mx={4}
            maxH="90vh"
            overflowY="auto"
          >
            <Heading size="md" mb={4}>
              Cancelar Reserva
            </Heading>

            <VStack gap={4} align="stretch" mb={6}>
              <Text>
                Tem certeza que deseja cancelar esta reserva?
              </Text>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>Serviço:</strong> {booking.serviceName}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>Valor:</strong> {formatCurrency(booking.amount)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>{isClient ? 'Prestador' : 'Cliente'}:</strong>{' '}
                  {isClient ? booking.providerName : booking.clientName}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Motivo do cancelamento (opcional)
                </Text>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Descreva o motivo do cancelamento..."
                  size="sm"
                  rows={3}
                />
              </Box>

              <Text fontSize="sm" color="orange.600">
                ⚠️ O valor será reembolsado automaticamente.
              </Text>
            </VStack>

            <HStack justify="flex-end" gap={3}>
              <Button onClick={() => setIsOpen(false)} size="sm">
                Manter Reserva
              </Button>
              <Button
                colorPalette="red"
                onClick={handleCancelBooking}
                size="sm"
                loading={isLoading}
                loadingText="Cancelando..."
              >
                Confirmar Cancelamento
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </>
  );
}