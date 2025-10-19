import { useBookingStore } from "../../stores/bookingStore";
import { Badge, Box, Button, Card, Container, Heading, HStack, Spinner, Stack, VStack, Text, Dialog } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toaster } from "../components/ui/toaster";

export const BookingsPage = () => {
    const { bookings, fetchMyBookings, cancelBooking, isLoading } = useBookingStore();
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const handleCancelBooking = async () => {
        if (!selectedBookingId) return;
        try {
            await cancelBooking(selectedBookingId);
            toaster.create({ title: "Reserva cancelada!", type: "success" });
            onClose();
        } catch (error: any) {
            toaster.create({
                title: error.response?.data?.message || "Erro ao cancelar reserva",
                type: "error",
            });
        }
    };

    if (isLoading && (!bookings || bookings.length === 0)) {
        return (
            <Container maxW="6xl" textAlign="center" py="20">
                <Spinner size="xl" />
            </Container>
        );
    }

    return (
        <Container maxW="6xl">
            <Heading mb="6">Minhas Reservas</Heading>

            {!bookings || bookings.length === 0 ? (
                <Box textAlign="center" py="10">
                    <Text color="gray.500">Nenhuma reserva encontrada</Text>
                </Box>
            ) : (
                <Stack gap="4">
                    {bookings.map((booking) => (
                        <Card.Root key={booking.id}>
                            <Card.Body>
                                <VStack align="start" gap="2">
                                    <HStack justify="space-between" width="full">
                                        <Heading size="md">{booking.serviceName}</Heading>
                                        <Badge colorScheme={booking.status === "confirmed" ? "green" : "red"}>
                                            {booking.status === "confirmed" ? "Confirmada" : "Cancelada"}
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="sm">Prestador: {booking.providerName}</Text>
                                    <Text fontSize="sm">Valor: ${booking.amount.toFixed(2)}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </Text>

                                    {booking.status === "confirmed" && (
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => {
                                                setSelectedBookingId(booking.id);
                                                onOpen();
                                            }}
                                        >
                                            Cancelar Reserva
                                        </Button>
                                    )}
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </Stack>
            )}

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title fontSize="lg" fontWeight="bold">
                                Cancelar Reserva
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            Tem a certeza que deseja cancelar esta reserva?
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={onClose}>
                                Não
                            </Button>
                            <Button colorScheme="red" onClick={handleCancelBooking} ml={3}>
                                Sim, Cancelar
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Container>
    );
};