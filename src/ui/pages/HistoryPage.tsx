import { Container, Heading, Stack, HStack, Input, Badge, Box, Card, Spinner, VStack, Text, Grid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useBookingStore } from "../../stores/bookingStore";

export const HistoryPage = () => {
    const { history, fetchHistory, isLoading } = useBookingStore();
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "all",
    });

    useEffect(() => {
        const params: any = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.status !== "all") params.status = filters.status;
        fetchHistory(params);
    }, [filters]);

    return (
        <Container maxW="6xl">
            <Heading mb="6" color="navy.700">Histórico de Transações</Heading>

            <Stack mb="6" direction={{ base: "column", md: "row" }} gap="4">
                <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e0",
                    }}
                    
                >
                    <option value="all">Todos os Status</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </Stack>

            {isLoading ? (
                <Box textAlign="center" py="10">
                    <Spinner />
                </Box>
            ) : !history || history.length === 0 ? (
                <Box textAlign="center" py="10">
                    <Text color="gray.500">Nenhuma transação encontrada</Text>
                </Box>
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="6">
                    {history.map((booking) => (
                        <Card.Root
                            key={booking.id}
                            bg="bg.card"
                            border="1px solid"
                            borderColor="border.default"
                            shadow="md"
                            _hover={{ boxShadow: "xl", transform: "translateY(-2px)", transition: "all 0.3s ease", borderColor: "primary.500" }}
                        >
                            <Card.Body>
                                <VStack align="start" gap="3">
                                    <HStack justify="space-between" width="full">
                                        <Text fontWeight="bold" color="navy.700" fontSize="lg">{booking.serviceName}</Text>
                                        <Badge bg={booking.status === "confirmed" ? "primary.500" : "red.500"} color="white" px="3" py="1" borderRadius="md">
                                            {booking.status === "confirmed" ? "Confirmado" : "Cancelado"}
                                        </Badge>
                                    </HStack>
                                    <VStack align="start" gap="1" width="full">
                                        <Text fontSize="sm" color="text.secondary">
                                            Cliente: {booking.clientName}
                                        </Text>
                                        <Text fontSize="sm" color="text.secondary">
                                            Prestador: {booking.providerName}
                                        </Text>
                                        <Text fontSize="md" fontWeight="bold" color="primary.600">
                                            ${booking.amount.toFixed(2)}
                                        </Text>
                                        <Text fontSize="xs" color="text.muted">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </Text>
                                    </VStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </Grid>
            )}
        </Container>
    );
};