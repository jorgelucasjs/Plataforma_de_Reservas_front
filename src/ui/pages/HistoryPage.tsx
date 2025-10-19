import { Container, Heading, Stack, HStack, Input, Badge, Box, Card, Spinner, VStack, Text } from "@chakra-ui/react";
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
            <Heading mb="6">Histórico de Transações</Heading>

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
                <Stack gap="4">
                    {history.map((booking) => (
                        <Card.Root key={booking.id}>
                            <Card.Body>
                                <HStack justify="space-between">
                                    <VStack align="start" gap="1">
                                        <Text fontWeight="bold">{booking.serviceName}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Cliente: {booking.clientName}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Prestador: {booking.providerName}
                                        </Text>
                                    </VStack>
                                    <VStack align="end" gap="1">
                                        <Badge colorScheme={booking.status === "confirmed" ? "green" : "red"}>
                                            {booking.status === "confirmed" ? "Confirmado" : "Cancelado"}
                                        </Badge>
                                        <Text fontWeight="bold">${booking.amount.toFixed(2)}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </Stack>
            )}
        </Container>
    );
};