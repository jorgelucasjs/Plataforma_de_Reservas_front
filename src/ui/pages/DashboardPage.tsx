import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  Card,
  Flex,
  Badge,
} from '@chakra-ui/react';
import {
  HiStar,
  HiCalendar,
  HiClock,
  HiPlus,
  HiEye,
  HiCurrencyEuro,
  HiTrendingUp,
  HiUsers,
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useUserUiState } from '../../stores/userStore';
import { useServiceUiState } from '../../stores/serviceStore';
import { useBookingUiState } from '../../stores/bookingStore';
import { userRepository } from '../../repositories/userRepository';
import { serviceRepository } from '../../repositories/serviceRepository';
import { APPCOLOR } from '../../utils/colors';
import { bookingRepository } from '../../repositories/bookingRepository';
import { formatCurrency, formatUserType } from '../../utils/formatters';

export function DashboardPage() {
  const { user, isProvider, isClient } = useAuth();
  const navigate = useNavigate();
  
  // Store states
  const { currentBalance } = useUserUiState();
  const { services, myServices } = useServiceUiState();
  const { bookings } = useBookingUiState();

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user profile and balance
        await userRepository.loadProfile();
        
        if (isProvider) {
          // Load provider-specific data
          await serviceRepository.loadMyServices();
          await bookingRepository.loadMyBookings();
        } else if (isClient) {
          // Load client-specific data
          await serviceRepository.loadServices();
          await bookingRepository.loadMyBookings();
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, isProvider, isClient]);

  // Quick action handlers
  const handleCreateService = () => {
    navigate('/services');
  };

  const handleBrowseServices = () => {
    navigate('/services');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  const handleViewTransactions = () => {
    navigate('/transactions');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  // Calculate stats
  const getProviderStats = () => {
    const totalServices = myServices?.length || 0;
    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
    const totalEarnings = bookings
      ?.filter((b: any) => b.status === 'confirmed')
      .reduce((sum: number, b: any) => sum + b.amount, 0) || 0;

    return {
      totalServices,
      totalBookings,
      confirmedBookings,
      totalEarnings,
    };
  };

  const getClientStats = () => {
    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
    const totalSpent = bookings
      ?.filter((b: any) => b.status === 'confirmed')
      .reduce((sum: number, b: any) => sum + b.amount, 0) || 0;
    const availableServices = services?.length || 0;

    return {
      totalBookings,
      confirmedBookings,
      totalSpent,
      availableServices,
    };
  };

  const providerStats = isProvider ? getProviderStats() : null;
  const clientStats = isClient ? getClientStats() : null;

  return (
    <VStack gap={6} align="stretch">
      {/* Welcome Header */}
      <Box>
        <Heading size="lg" color="gray.700" mb={2}>
          Bem-vindo, {user?.fullName}!
        </Heading>
        <HStack gap={2}>
          <Badge
            colorPalette={isProvider ? 'green' : 'blue'}
            variant="subtle"
            size="md"
          >
            {user && formatUserType(user.userType)}
          </Badge>
          <Text color="gray.600" fontSize="sm">
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </Text>
        </HStack>
      </Box>

      {/* Balance Card */}
      <Card.Root>
        <Card.Body>
          <Flex justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Saldo Atual
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(currentBalance)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Disponível para {isProvider ? 'levantamento' : 'reservas'}
              </Text>
            </VStack>
            <Box
              p={3}
              bg="green.100"
              borderRadius="full"
              color="green.600"
            >
              <HiCurrencyEuro size={24} />
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Stats Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
        {isProvider && providerStats && (
          <>
            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Serviços Ativos
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {providerStats.totalServices}
                  </Text>
                  <HStack gap={1}>
                    <HiStar size={14} />
                    <Text fontSize="sm" color="gray.500">Total de serviços</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Reservas Totais
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {providerStats.totalBookings}
                  </Text>
                  <HStack gap={1}>
                    <HiCalendar size={14} />
                    <Text fontSize="sm" color="gray.500">{providerStats.confirmedBookings} confirmadas</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Total Ganho
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {formatCurrency(providerStats.totalEarnings)}
                  </Text>
                  <HStack gap={1}>
                    <HiTrendingUp size={14} />
                    <Text fontSize="sm" color="gray.500">Receita total</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Taxa de Sucesso
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {providerStats.totalBookings > 0
                      ? Math.round((providerStats.confirmedBookings / providerStats.totalBookings) * 100)
                      : 0}%
                  </Text>
                  <HStack gap={1}>
                    <HiUsers size={14} />
                    <Text fontSize="sm" color="gray.500">Reservas confirmadas</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </>
        )}

        {isClient && clientStats && (
          <>
            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Serviços Disponíveis
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {clientStats.availableServices}
                  </Text>
                  <HStack gap={1}>
                    <HiStar size={14} />
                    <Text fontSize="sm" color="gray.500">Para reservar</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Minhas Reservas
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {clientStats.totalBookings}
                  </Text>
                  <HStack gap={1}>
                    <HiCalendar size={14} />
                    <Text fontSize="sm" color="gray.500">{clientStats.confirmedBookings} ativas</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Total Gasto
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {formatCurrency(clientStats.totalSpent)}
                  </Text>
                  <HStack gap={1}>
                    <HiCurrencyEuro size={14} />
                    <Text fontSize="sm" color="gray.500">Em serviços</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Saldo Restante
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {formatCurrency(currentBalance)}
                  </Text>
                  <HStack gap={1}>
                    <HiTrendingUp size={14} />
                    <Text fontSize="sm" color="gray.500">Disponível</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </>
        )}
      </Grid>

      {/* Quick Actions */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Ações Rápidas</Heading>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
            {isProvider && (
              <>
                <Button
                  bg={APPCOLOR}
                  size="lg"
                  onClick={handleCreateService}
                  h="auto"
                  py={4}
                >
                  <VStack gap={2}>
                    <HiPlus size={24} />
                    <Text fontSize="sm">Criar Serviço</Text>
                  </VStack>
                </Button>

                <Button
                  variant="outline"
                  bg={APPCOLOR}
                  size="lg"
                  onClick={handleViewBookings}
                  h="auto"
                  py={4}
                >
                  <VStack gap={2}>
                    <HiCalendar size={24} />
                    <Text fontSize="sm">Ver Reservas</Text>
                  </VStack>
                </Button>
              </>
            )}

            {isClient && (
              <>
                <Button
                  bg={APPCOLOR}
                  size="lg"
                  onClick={handleBrowseServices}
                  h="auto"
                  py={4}
                >
                  <VStack gap={2}>
                    <HiEye size={24} />
                    <Text fontSize="sm">Explorar Serviços</Text>
                  </VStack>
                </Button>

                <Button
                  variant="outline"
                  bg={APPCOLOR}
                  size="lg"
                  onClick={handleViewBookings}
                  h="auto"
                  py={4}
                >
                  <VStack gap={2}>
                    <HiCalendar size={24} />
                    <Text fontSize="sm">Minhas Reservas</Text>
                  </VStack>
                </Button>
              </>
            )}

            <Button
              variant="outline"
              bg={APPCOLOR}
              size="lg"
              onClick={handleViewTransactions}
              h="auto"
              py={4}
            >
              <VStack gap={2}>
                <HiClock size={24} />
                <Text fontSize="sm">Histórico</Text>
              </VStack>
            </Button>

            <Button
              variant="outline"
              bg={APPCOLOR}
              size="lg"
              onClick={handleViewProfile}
              h="auto"
              py={4}
            >
              <VStack gap={2}>
                <HiUsers size={24} />
                <Text fontSize="sm">Perfil</Text>
              </VStack>
            </Button>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Recent Activity */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Atividade Recente</Heading>
        </Card.Header>
        <Card.Body>
          {bookings && bookings.length > 0 ? (
            <VStack gap={3} align="stretch">
              {bookings.slice(0, 3).map((booking: any) => (
                <Box
                  key={booking.id}
                  p={3}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Flex justify="space-between" align="center">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="medium">{booking.serviceName}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {isProvider ? `Cliente: ${booking.clientName}` : `Prestador: ${booking.providerName}`}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(booking.createdAt).toLocaleDateString('pt-PT')}
                      </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Badge
                        colorPalette={booking.status === 'confirmed' ? 'green' : 'red'}
                        variant="subtle"
                      >
                        {booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </Badge>
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(booking.amount)}
                      </Text>
                    </VStack>
                  </Flex>
                </Box>
              ))}
              
              {bookings.length > 3 && (
                <Button
                  variant="ghost"
                  bg={APPCOLOR}
                  onClick={handleViewBookings}
                  size="sm"
                >
                  Ver todas as reservas ({bookings.length})
                </Button>
              )}
            </VStack>
          ) : (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" mb={4}>
                {isProvider 
                  ? 'Ainda não tem reservas dos seus serviços.'
                  : 'Ainda não fez nenhuma reserva.'
                }
              </Text>
              <Button
                bg={APPCOLOR}
                onClick={isProvider ? handleCreateService : handleBrowseServices}
              >
                {isProvider ? 'Criar Primeiro Serviço' : 'Explorar Serviços'}
              </Button>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}