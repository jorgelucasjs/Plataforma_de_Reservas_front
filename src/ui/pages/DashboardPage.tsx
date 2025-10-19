import { Box, Container, Grid, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { useBookingStore } from "../../stores/bookingStore";
import { useUserStore } from "../../stores/userStore";
import { useEffect, useState } from "react";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";
import { AddBalanceModal } from "../components/AddBalanceModal";
import { StatCard } from "../components/StatCard";
import { RecentItemsList } from "../components/RecentItemsList";
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
                    gradientFrom="primary.500"
                    gradientTo="navy.500"
                    bgClip="text"
                    mb="2"
                >
                    Bem-vindo, {user?.fullName}!
                </Heading>
                <Text color="text.secondary" fontSize="lg">
                    {user?.userType === "provider" ? "Gerencie seus serviços e acompanhe seu negócio" : "Explore serviços e gerencie suas reservas"}
                </Text>
            </Box>

            <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap="6"
                mb="8"
            >
                <StatCard
                    label="Saldo"
                    value={`$${user?.balance?.toFixed(2) ?? "0.00"}`}
                    valueColor="primary.600"
                    action={
                        user?.userType === "client"
                            ? {
                                  label: "Carregar Conta",
                                  onClick: () => setIsBalanceModalOpen(true),
                                  colorScheme: "primary",
                              }
                            : undefined
                    }
                />

                {user?.userType === "provider" && (
                    <StatCard
                        label="Meus Serviços"
                        value={myServices?.length ?? 0}
                        valueColor="navy.600"
                    />
                )}

                {user?.userType === "client" && (
                    <StatCard
                        label="Minhas Reservas"
                        value={bookings?.length ?? 0}
                        valueColor="accent.600"
                    />
                )}

                <StatCard
                    label="Tipo de Conta"
                    value={user?.userType === "provider" ? "Prestador" : "Cliente"}
                    valueColor="navy.700"
                />
            </Grid>

            {user?.userType === "provider" && myServices && myServices.length > 0 && (
                <RecentItemsList
                    title="Últimos Serviços"
                    items={myServices.slice(0, 3).map((service) => ({
                        id: service.id,
                        title: service.name,
                        subtitle: `$${service.price.toFixed(2)}`,
                        action: {
                            label: "Editar",
                            onClick: () => navigate(`/services/${service.id}/edit`),
                        },
                    }))}
                />
            )}

            {user?.userType === "client" && bookings && bookings.length > 0 && (
                <RecentItemsList
                    title="Últimas Reservas"
                    items={bookings.slice(0, 3).map((booking) => ({
                        id: booking.id,
                        title: booking.serviceName,
                        subtitle: `$${booking.amount.toFixed(2)}`,
                    }))}
                />
            )}

            <AddBalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                userEmail={user?.email || ""}
            />
        </Container>
    );
};