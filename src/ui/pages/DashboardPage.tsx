import { useEffect, useState, useRef } from 'react';
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
import { useUserUiState } from '../../stores/userStore';
import { useServiceUiState } from '../../stores/serviceStore';
import { useBookingUiState } from '../../stores/bookingStore';
import { userRepository } from '../../repositories/userRepository';
import { serviceRepository } from '../../repositories/serviceRepository';
import { APPCOLOR } from '../../utils/colors';
import { bookingRepository } from '../../repositories/bookingRepository';
import { formatCurrency, formatUserType } from '../../utils/formatters';
import { CURRENT_USER_INFO } from '@/utils/LocalstorageKeys';

export function DashboardPage() {

    const user = CURRENT_USER_INFO
    const isClient = CURRENT_USER_INFO?.userType === "client" ? true : false
    const isProvider = CURRENT_USER_INFO?.userType === "provider" ? true : false
    const navigate = useNavigate();

    // If no user is logged in, redirect to login
    if (!user) {
        navigate('/login');
        return null;
    }

    // Store states
    const { currentBalance } = useUserUiState();
    const { services, myServices } = useServiceUiState();
    const { bookings } = useBookingUiState();

    // Loading states for different data types
    const [loadingStates, setLoadingStates] = useState({
        profile: false,
        services: false,
        bookings: false,
    });

    // Error states for different data types
    const [errorStates, setErrorStates] = useState({
        profile: null as string | null,
        services: null as string | null,
        bookings: null as string | null,
    });

    // Prevent multiple simultaneous API calls
    const loadingRef = useRef({
        profile: false,
        services: false,
        bookings: false,
    });

    // Helper function to update loading state
    const updateLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
        loadingRef.current[key] = value;
    };

    // Helper function to update error state
    const updateErrorState = (key: keyof typeof errorStates, value: string | null) => {
        setErrorStates(prev => ({ ...prev, [key]: value }));
    };

    // Load user profile and balance
    const loadProfileData = async () => {
        if (loadingRef.current.profile) return;

        try {
            updateLoadingState('profile', true);
            updateErrorState('profile', null);
            await userRepository.loadProfile();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load profile data';
            updateErrorState('profile', errorMessage);
        } finally {
            updateLoadingState('profile', false);
        }
    };

    // Load services data based on user type
    const loadServicesData = async () => {
        if (loadingRef.current.services) {
            return;
        }

        if (!user) {
            return;
        }

        try {
            updateLoadingState('services', true);
            updateErrorState('services', null);

            if (isProvider) {
                await serviceRepository.loadMyServices();
            } else if (isClient) {
                await serviceRepository.loadServices();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load services data';
            updateErrorState('services', errorMessage);
        } finally {
            updateLoadingState('services', false);
        }
    };

    // Load bookings data
    const loadBookingsData = async () => {
        if (loadingRef.current.bookings || !user) {
            return;
        }

        try {
            updateLoadingState('bookings', true);
            updateErrorState('bookings', null);
            await bookingRepository.loadMyBookings();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings data';
            updateErrorState('bookings', errorMessage);
        } finally {
            updateLoadingState('bookings', false);
        }
    };

    // Load dashboard data on mount
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;

            await loadProfileData();
            await Promise.all([
                loadServicesData(),
                loadBookingsData()
            ]);
        };

        loadDashboardData();
    }, [user?.id, user?.userType]);

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

    // Retry functions for failed data loads
    const retryProfileLoad = () => loadProfileData();
    const retryServicesLoad = () => loadServicesData();
    const retryBookingsLoad = () => loadBookingsData();

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
                    {(loadingStates.profile || loadingStates.services || loadingStates.bookings) && (
                        <Badge colorPalette="yellow" variant="subtle" size="sm">
                            Carregando...
                        </Badge>
                    )}
                </HStack>
            </Box>

            {/* Error Messages */}
            {(errorStates.profile || errorStates.services || errorStates.bookings) && (
                <Card.Root borderColor="red.200" bg="red.50">
                    <Card.Body>
                        <VStack align="stretch" gap={2}>
                            <Text fontWeight="medium" color="red.700">
                                Alguns dados não puderam ser carregados:
                            </Text>
                            {errorStates.profile && (
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="red.600">
                                        Perfil: {errorStates.profile}
                                    </Text>
                                    <Button size="xs" variant="outline" onClick={retryProfileLoad}>
                                        Tentar novamente
                                    </Button>
                                </HStack>
                            )}
                            {errorStates.services && (
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="red.600">
                                        Serviços: {errorStates.services}
                                    </Text>
                                    <Button size="xs" variant="outline" onClick={retryServicesLoad}>
                                        Tentar novamente
                                    </Button>
                                </HStack>
                            )}
                            {errorStates.bookings && (
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="red.600">
                                        Reservas: {errorStates.bookings}
                                    </Text>
                                    <Button size="xs" variant="outline" onClick={retryBookingsLoad}>
                                        Tentar novamente
                                    </Button>
                                </HStack>
                            )}
                        </VStack>
                    </Card.Body>
                </Card.Root>
            )}

            {/* Balance Card */}
            <Card.Root>
                <Card.Body>
                    <Flex justify="space-between" align="center">
                        <VStack align="start" gap={1}>
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                Saldo Atual
                            </Text>
                            {loadingStates.profile ? (
                                <Text fontSize="2xl" fontWeight="bold" color="gray.400">
                                    Carregando...
                                </Text>
                            ) : errorStates.profile ? (
                                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                                    Erro
                                </Text>
                            ) : (
                                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                    {formatCurrency(currentBalance)}
                                </Text>
                            )}
                            <Text fontSize="xs" color="gray.500">
                                Disponível para {isProvider ? 'levantamento' : 'reservas'}
                            </Text>
                        </VStack>
                        <Box
                            p={3}
                            bg={loadingStates.profile ? "gray.100" : "green.100"}
                            borderRadius="full"
                            color={loadingStates.profile ? "gray.400" : "green.600"}
                        >
                            <HiCurrencyEuro size={24} />
                        </Box>
                    </Flex>
                </Card.Body>
            </Card.Root>

            {/* Stats Grid */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                {/* Loading state for stats */}
                {(loadingStates.services || loadingStates.bookings) && (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <Card.Root key={i}>
                                <Card.Body>
                                    <VStack align="start" gap={2}>
                                        <Text fontSize="sm" color="gray.400">
                                            Carregando...
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.300">
                                            --
                                        </Text>
                                        <Text fontSize="sm" color="gray.300">
                                            Aguarde...
                                        </Text>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        ))}
                    </>
                )}

                {/* Error state for stats */}
                {!loadingStates.services && !loadingStates.bookings && (errorStates.services || errorStates.bookings) && (
                    <Card.Root borderColor="red.200" bg="red.50">
                        <Card.Body>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="red.600" fontWeight="medium">
                                    Erro ao carregar estatísticas
                                </Text>
                                <Text fontSize="sm" color="red.500">
                                    {errorStates.services || errorStates.bookings}
                                </Text>
                                <Button size="xs" variant="outline" onClick={() => {
                                    if (errorStates.services) retryServicesLoad();
                                    if (errorStates.bookings) retryBookingsLoad();
                                }}>
                                    Tentar novamente
                                </Button>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* Normal stats display */}
                {!loadingStates.services && !loadingStates.bookings && !errorStates.services && !errorStates.bookings && (
                    <>
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