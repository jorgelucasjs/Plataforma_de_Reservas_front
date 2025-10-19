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
import { useEffect } from "react";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";

export const DashboardPage = () => {
    const navigate = useNavigate();
    //const { user } = useAuthStore();
    const { myServices, fetchMyServices } = useServiceStore();
    const { bookings, fetchMyBookings } = useBookingStore();

    // Lê o localStorage dinamicamente
    const user = getData(LOCALSTORAGE_USERDATA);

    console.log("user", user)

    useEffect(() => {
    
        if (user?.userType === "provider") {
            fetchMyServices();
        } else {
            fetchMyBookings();
        }
    }, []);

    return (
        <Container maxW="6xl">
            <Heading mb="8">Bem-vindo, {user?.fullName}!</Heading>

            <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap="6"
                mb="8"
            >
                <Card.Root>
                    <Card.Body>
                        <Stat.Root>
                            <Stat.Label>Saldo</Stat.Label>
                            <Stat.ValueText color="green.600" fontSize="2xl">
                                ${user?.balance?.toFixed(2) ?? "0.00"}
                            </Stat.ValueText>
                        </Stat.Root>
                    </Card.Body>
                </Card.Root>

                {user?.userType === "provider" && (
                    <Card.Root>
                        <Card.Body>
                            <Stat.Root>
                                <Stat.Label>Meus Serviços</Stat.Label>
                                <Stat.ValueText fontSize="2xl">{myServices.length}</Stat.ValueText>
                            </Stat.Root>
                        </Card.Body>
                    </Card.Root>
                )}

                {user?.userType === "client" && (
                    <Card.Root>
                        <Card.Body>
                            <Stat.Root>
                                <Stat.Label>Minhas Reservas</Stat.Label>
                                <Stat.ValueText fontSize="2xl">{bookings.length}</Stat.ValueText>
                            </Stat.Root>
                        </Card.Body>
                    </Card.Root>
                )}

                <Card.Root>
                    <Card.Body>
                        <Stat.Root>
                            <Stat.Label>Tipo de Conta</Stat.Label>
                            <Stat.ValueText fontSize="lg">
                                {user?.userType === "provider" ? "Prestador" : "Cliente"}
                            </Stat.ValueText>
                        </Stat.Root>
                    </Card.Body>
                </Card.Root>
            </Grid>

            <Card.Root mb="8">
                <Card.Body>
                    <Heading size="md" mb="4">
                        Ações Rápidas
                    </Heading>
                    <HStack gap="4" flexWrap="wrap">
                        {user?.userType === "provider" ? (
                            <>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => navigate("/services/new")}
                                >
                                    Criar Novo Serviço
                                </Button>
                                <Button onClick={() => navigate("/services")}>
                                    Ver Meus Serviços
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => navigate("/services")}
                                >
                                    Contratar Serviços
                                </Button>
                                <Button onClick={() => navigate("/bookings")}>
                                    Ver Minhas Reservas
                                </Button>
                            </>
                        )}
                        <Button onClick={() => navigate("/history")}>
                            Ver Histórico
                        </Button>
                    </HStack>
                </Card.Body>
            </Card.Root>

            {user?.userType === "provider" && myServices.length > 0 && (
                <Card.Root>
                    <Card.Body>
                        <Heading size="md" mb="4">
                            Últimos Serviços
                        </Heading>
                        <VStack align="start" gap="3">
                            {myServices.slice(0, 3).map((service) => (
                                <Box key={service.id} p="3" borderBottom="1px" borderColor="gray.200" width="full">
                                    <HStack justify="space-between">
                                        <VStack align="start" gap="0">
                                            <Text fontWeight="bold">{service.name}</Text>
                                            <Text fontSize="sm" color="gray.600">
                                                ${service.price.toFixed(2)}
                                            </Text>
                                        </VStack>
                                        <Button
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

            {user?.userType === "client" && bookings.length > 0 && (
                <Card.Root>
                    <Card.Body>
                        <Heading size="md" mb="4">
                            Últimas Reservas
                        </Heading>
                        <VStack align="start" gap="3">
                            {bookings.slice(0, 3).map((booking) => (
                                <Box key={booking.id} p="3" borderBottom="1px" borderColor="gray.200" width="full">
                                    <HStack justify="space-between">
                                        <VStack align="start" gap="0">
                                            <Text fontWeight="bold">{booking.serviceName}</Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {booking.providerName}
                                            </Text>
                                        </VStack>
                                        <Text fontWeight="bold">${booking.amount.toFixed(2)}</Text>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </Card.Body>
                </Card.Root>
            )}
        </Container>
    );
};