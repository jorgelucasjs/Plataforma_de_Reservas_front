import { useBookingStore } from "../../stores/bookingStore";
import { Container, Grid, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toaster } from "../components/ui/toaster";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { BookingCard } from "../components/BookingCard";
import { ConfirmDialog } from "../components/ConfirmDialog";

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
        return <LoadingSpinner />;
    }

    return (
        <Container maxW="6xl">
            <Heading mb="6" color="navy.700">Minhas Reservas</Heading>

            {!bookings || bookings.length === 0 ? (
                <EmptyState message="Nenhuma reserva encontrada" />
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="6">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            id={booking.id}
                            serviceName={booking.serviceName}
                            providerName={booking.providerName}
                            amount={booking.amount}
                            status={booking.status}
                            createdAt={booking.createdAt}
                            onCancel={() => {
                                setSelectedBookingId(booking.id);
                                onOpen();
                            }}
                        />
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleCancelBooking}
                title="Cancelar Reserva"
                message="Tem a certeza que deseja cancelar esta reserva?"
                confirmText="Sim, Cancelar"
                cancelText="Não"
            />
        </Container>
    );
};