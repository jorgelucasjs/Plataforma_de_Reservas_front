import {
    Box,
    Container,
    Grid,
    Heading,
    Stat,
    Card,
    Button,
    Text,
    VStack,
    HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { useBookingStore } from "../../stores/bookingStore";
import { useUserStore } from "../../stores/userStore";
import { useEffect, useState } from "react";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";
import { AddBalanceModal } from "../components/AddBalanceModal";
import type { User } from "@/types";

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { myServices, fetchMyServices } = useServiceStore();
    const { bookings, fetchMyBookings } = useBookingStore();
    const { user, fetchUserByEmail, isLoading } = useUserStore();
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

    const localUser = getData(LOCALSTORAGE_USERDATA) as User;

    useEffect(() => {
        const loadUserData = async () => {
            if (localUser?.email) {
                // Busca dados atualizados do usuário da base de dados
                await fetchUserByEmail(localUser.email);
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        if (user?.userType === "provider") {
            fetchMyServices();
        } else if (user?.userType === "client") {
            fetchMyBookings();
        }
    }, [user?.userType]);

    if (isLoading && !user) {
        return (
            <Container maxW="6xl" py="8">
                <Text>Carregando...</Text>
            </Container>
        );
    }

    return (
        <Container maxW="6xl" py="8">
            <Box mb="10">
                <Heading
                    size="2xl"
                    bgGradient="to-r"
                    gradientFrom="blue.400"
                    gradientTo="purple.500"
                    bgClip="text"
                    mb="2"
                >
                    Bem-vindo, {user?.fullName}!
                </Heading>
                <Text color="gray.600" fontSize="lg">
                    {user?.userType === "provider" ? "Gerencie seus serviços e acompanhe seu negócio" : "Explore serviços e gerencie suas reservas"}
                </Text>
            </Box>

            <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap="6"
                mb="8"
            >
                <Card.Root
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    shadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
                >
                    <Card.Body p="6">
                        <VStack align="stretch" gap="3">
                            <Stat.Root>
                                <Stat.Label color="gray.600" fontSize="md" fontWeight="medium">Saldo</Stat.Label>
                                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="green.600">
                                    ${user?.balance?.toFixed(2) ?? "0.00"}
                                </Stat.ValueText>
                            </Stat.Root>

                            {
                                user?.userType === "client" ?
                                    <Button
                                        colorScheme="green"
                                        size="sm"
                                        onClick={() => setIsBalanceModalOpen(true)}
                                    >
                                        Carregar Conta
                                    </Button>
                                    :
                                    null
                            }
                        </VStack>
                    </Card.Body>
                </Card.Root>

                {user?.userType === "provider" && (
                    <Card.Root
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        shadow="md"
                        _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
                    >
                        <Card.Body p="6">
                            <Stat.Root>
                                <Stat.Label color="gray.600" fontSize="md" fontWeight="medium">Meus Serviços</Stat.Label>
                                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="blue.600">{myServices?.length ?? 0}</Stat.ValueText>
                            </Stat.Root>
                        </Card.Body>
                    </Card.Root>
                )}

                {user?.userType === "client" && (
                    <Card.Root
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        shadow="md"
                        _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
                    >
                        <Card.Body p="6">
                            <Stat.Root>
                                <Stat.Label color="gray.600" fontSize="md" fontWeight="medium">Minhas Reservas</Stat.Label>
                                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="purple.600">{bookings?.length ?? 0}</Stat.ValueText>
                            </Stat.Root>
                        </Card.Body>
                    </Card.Root>
                )}

                <Card.Root
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    shadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
                >
                    <Card.Body p="6">
                        <Stat.Root>
                            <Stat.Label color="gray.600" fontSize="md" fontWeight="medium">Tipo de Conta</Stat.Label>
                            <Stat.ValueText fontSize="xl" fontWeight="bold" color="gray.800">
                                {user?.userType === "provider" ? "Prestador" : "Cliente"}
                            </Stat.ValueText>
                        </Stat.Root>
                    </Card.Body>
                </Card.Root>
            </Grid>

            {user?.userType === "provider" && myServices && myServices.length > 0 && (
                <Card.Root shadow="md" bg="white" borderWidth="0">
                    <Card.Body p="6">
                        <Heading size="lg" mb="6" color="gray.700">
                            Últimos Serviços
                        </Heading>
                        <VStack align="stretch" gap="4">
                            {myServices.slice(0, 3).map((service) => (
                                <Box
                                    key={service.id}
                                    p="5"
                                    bg="gray.50"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ bg: "gray.100", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <HStack justify="space-between">
                                        <VStack align="start" gap="1">
                                            <Text fontWeight="bold" fontSize="lg" color="gray.800">{service.name}</Text>
                                            <Text fontSize="md" color="green.600" fontWeight="semibold">
                                                ${service.price.toFixed(2)}
                                            </Text>
                                        </VStack>
                                        <Button
                                            colorScheme="blue"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/services/${service.id}/edit`)}
                                        >
                                            Editar
                                        </Button>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </Card.Body>
                </Card.Root>
            )}

            {user?.userType === "client" && bookings && bookings.length > 0 && (
                <Card.Root shadow="md" bg="white" borderWidth="0">
                    <Card.Body p="6">
                        <Heading size="lg" mb="6" color="gray.700">
                            Últimas Reservas
                        </Heading>
                        <VStack align="stretch" gap="4">
                            {bookings.slice(0, 3).map((booking) => (
                                <Box
                                    key={booking.id}
                                    p="5"
                                    bg="gray.50"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ bg: "gray.100", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <HStack justify="space-between">
                                        <VStack align="start" gap="1">
                                            <Text fontWeight="bold" fontSize="lg" color="gray.800">{booking.serviceName}</Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {booking.providerName}
                                            </Text>
                                        </VStack>
                                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                                            ${booking.amount.toFixed(2)}
                                        </Text>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </Card.Body>
                </Card.Root>
            )}

            <AddBalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                userEmail={user?.email || ""}
            />
        </Container>
    );
};