import {
    Box,
    Button,
    Container,
    Grid,
    Heading,
    Input,
    Stack,
    Text,
    VStack,
    HStack,
    Badge,
    Card,
    Spinner,
    Dialog,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { useBookingStore } from "../../stores/bookingStore";
import { toaster } from "../components/ui/toaster";
import { CURRENT_USER_INFO } from "@/utils/LocalstorageKeys";

export const ServicesPage = () => {
    const navigate = useNavigate();
    const  user  = CURRENT_USER_INFO
    const { services, myServices, fetchServices, fetchServicesByProvider, deleteService, isLoading } = useServiceStore();
    const { createBooking } = useBookingStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    console.log("user", user)

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

    const handleBookService = async (serviceId: string, servicePrice: number) => {
        try {
            await createBooking(serviceId, servicePrice);
            toaster.create({
                title: "Serviço",
                description: "Serviço contratado com sucesso!",
                type: 'success',
                duration: 3000
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro ao contratar serviço";
            toaster.create({
                title: "Erro",
                description: errorMessage,
                type: 'error',
                duration: 3000
            });
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
            onClose();
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
        return (
            <Container maxW="6xl" textAlign="center" py="20">
                <Spinner size="xl" />
            </Container>
        );
    }

    return (
        <Container maxW="6xl">
            <Heading mb="6">
                {user?.userType === "provider" ? "Meus Serviços" : "Serviços Disponíveis"}
            </Heading>

            {user?.userType === "client" && (
                <Stack mb="6" direction={{ base: "column", md: "row" }} gap="4">
                    <Input
                        placeholder="Buscar serviço..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Input
                        placeholder="Preço mín."
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                        placeholder="Preço máx."
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                    <Button colorScheme="blue" onClick={handleSearch} loading={isLoading}>
                        Buscar
                    </Button>
                </Stack>
            )}

            {!displayServices || displayServices.length === 0 ? (
                <Box textAlign="center" py="10">
                    <Text color="gray.500">Nenhum serviço encontrado</Text>
                </Box>
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="6">
                    {displayServices.map((service) => (
                        <Card.Root key={service.id} variant="elevated" _hover={{ boxShadow: "lg" }}>
                            <Card.Body>
                                <VStack align="start" p="3">
                                    <Heading size="md">{service.name}</Heading>
                                    <Text fontSize="sm" color="gray.600" lineClamp={3}>
                                        {service.description}
                                    </Text>
                                    <HStack justify="space-between" width="full">
                                        <Badge colorScheme="green" fontSize="md">
                                            ${service.price.toFixed(2)}
                                        </Badge>
                                        <Text fontSize="xs" color="gray.500">
                                            {service.providerName}
                                        </Text>
                                    </HStack>

                                    <HStack p="2" width="full">
                                        {user?.userType === "provider" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    flex="1"
                                                    onClick={() => navigate(`/services/${service.id}/edit`)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    flex="1"
                                                    onClick={() => {
                                                        setSelectedServiceId(service.id);
                                                        onOpen();
                                                    }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </>
                                        )}
                                        {user?.userType === "client" && (
                                            <Button
                                                colorScheme="green"
                                                size="sm"
                                                width="full"
                                                onClick={() => handleBookService(service.id, service.price)}
                                            >
                                                Contratar
                                            </Button>
                                        )}
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </Grid>
            )}

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title fontSize="lg" fontWeight="bold">
                                Eliminar Serviço
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            Tem a certeza que deseja eliminar este serviço? Esta ação não pode ser desfeita.
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteService} ml={3}>
                                Eliminar
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Container>
    );
};