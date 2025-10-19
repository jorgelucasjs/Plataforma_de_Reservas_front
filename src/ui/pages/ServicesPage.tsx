import { Container, Grid, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { useBookingStore } from "../../stores/bookingStore";
import { useUserStore } from "../../stores/userStore";
import { toaster } from "../components/ui/toaster";
import { CURRENT_USER_INFO } from "@/utils/LocalstorageKeys";
import { SearchFilters } from "../components/SearchFilters";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { ServiceCard } from "../components/ServiceCard";
import { BookingConfirmDialog } from "../components/BookingConfirmDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { getData, setData } from "@/dao/localStorage";

const HIRED_SERVICES_KEY = "hired_services";

export const ServicesPage = () => {
    const navigate = useNavigate();
    const user = CURRENT_USER_INFO
    const { services, myServices, fetchServices, fetchServicesByProvider, deleteService, isLoading } = useServiceStore();
    const { createBooking } = useBookingStore();
    const { fetchUserByEmail } = useUserStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedServicePrice, setSelectedServicePrice] = useState<number>(0);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [hiredServices, setHiredServices] = useState<Set<string>>(new Set());

    const onDeleteOpen = () => setIsDeleteOpen(true);
    const onDeleteClose = () => setIsDeleteOpen(false);

    // Carregar serviços contratados do localStorage
    useEffect(() => {
        const stored = getData(HIRED_SERVICES_KEY);
        if (stored && Array.isArray(stored)) {
            setHiredServices(new Set(stored));
        }
    }, []);
    const onBookingOpen = () => setIsBookingOpen(true);
    const onBookingClose = () => setIsBookingOpen(false);


    useEffect(() => {
        if (user?.userType === "provider" && user?.id) {
            fetchServicesByProvider(user.id);
        } else {
            fetchServices();
        }
    }, [user?.userType, user?.id]);

    const handleSearch = async () => {
        const params: Record<string, string | number> = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (minPrice && !isNaN(parseFloat(minPrice))) params.minPrice = parseFloat(minPrice);
        if (maxPrice && !isNaN(parseFloat(maxPrice))) params.maxPrice = parseFloat(maxPrice);

        await fetchServices(params);
    };

    const handleBookService = async () => {
        if (!selectedServiceId) return;
        setIsBookingLoading(true);
        try {
            await createBooking(selectedServiceId, selectedServicePrice);

            // Salvar no localStorage
            const newHiredServices = new Set(hiredServices);
            newHiredServices.add(selectedServiceId);
            setHiredServices(newHiredServices);
            setData(HIRED_SERVICES_KEY, Array.from(newHiredServices));

            // Atualiza o saldo do usuário após contratar o serviço
            if (user?.email) {
                await fetchUserByEmail(user.email);
            }

            toaster.create({
                title: "Serviço",
                description: "Serviço contratado com sucesso!",
                type: 'success',
                duration: 3000
            });
            onBookingClose();
            setSelectedServiceId(null);
            setSelectedServicePrice(0);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro ao contratar serviço";
            toaster.create({
                title: "Erro",
                description: errorMessage,
                type: 'error',
                duration: 3000
            });
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleDeleteService = async () => {
        if (!selectedServiceId) return;
        try {
            await deleteService(selectedServiceId);
            toaster.create({
                title: "Serviço",
                description: "Serviço eliminado com sucesso!",
                type: 'success',
                duration: 3000
            });
            onDeleteClose();
            setSelectedServiceId(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro ao eliminar serviço";
            toaster.create({
                title: "Erro",
                description: errorMessage,
                type: 'error',
                duration: 3000
            });
        }
    };

    const displayServices = user?.userType === "provider" ? myServices : services;

    if (isLoading && (!displayServices || displayServices.length === 0)) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxW="6xl">
            <Heading mb="6" color="navy.700">
                {user?.userType === "provider" ? "Meus Serviços" : "Serviços Disponíveis"}
            </Heading>

            {user?.userType === "client" && (
                <SearchFilters
                    searchTerm={searchTerm}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onSearchChange={setSearchTerm}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />
            )}

            {!displayServices || displayServices.length === 0 ? (
                <EmptyState message="Nenhum serviço encontrado" />
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="6">
                    {displayServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            id={service.id}
                            name={service.name}
                            description={service.description}
                            price={service.price}
                            providerName={service.providerName}
                            userType={user?.userType || "client"}
                            isHired={hiredServices.has(service.id)}
                            onEdit={() => navigate(`/services/${service.id}/edit`)}
                            onDelete={() => {
                                setSelectedServiceId(service.id);
                                onDeleteOpen();
                            }}
                            onBook={() => {
                                setSelectedServiceId(service.id);
                                setSelectedServicePrice(service.price);
                                onBookingOpen();
                            }}
                        />
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onConfirm={handleDeleteService}
                title="Eliminar Serviço"
                message="Tem a certeza que deseja eliminar este serviço? Esta ação não pode ser desfeita."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <BookingConfirmDialog
                isOpen={isBookingOpen}
                onClose={onBookingClose}
                onConfirm={handleBookService}
                price={selectedServicePrice}
                isLoading={isBookingLoading}
            />
        </Container>
    );
};