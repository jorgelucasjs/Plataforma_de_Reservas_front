import { Box, Button, Flex, Menu, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { APPCOLOR } from "@/utils/colors";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";

export const Navigation = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const user = getData(LOCALSTORAGE_USERDATA);
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Box bg={APPCOLOR} py="4" px="6" mb="8">
            <Flex justify="space-between" align="center" maxW="6xl" mx="auto">
                <Box>
                    <Text fontSize="xl" fontWeight="bold" color="white">
                        AgendaSmart
                    </Text>
                </Box>

                <Flex gap="4" align="center">
                    {user?.userType === "provider" && (
                        <>
                            <Button
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "blue.700" }}
                                onClick={() => navigate("/services")}
                            >
                                Meus Serviços
                            </Button>
                            <Button
                                colorScheme="whiteAlpha"
                                onClick={() => navigate("/services/new")}
                            >
                                Novo Serviço
                            </Button>
                        </>
                    )}

                    {user?.userType === "client" && (
                        <>
                            <Button
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "blue.700" }}
                                onClick={() => navigate("/services")}
                            >
                                Contratar Serviços
                            </Button>
                            <Button
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "blue.700" }}
                                onClick={() => navigate("/bookings")}
                            >
                                Minhas Reservas
                            </Button>
                        </>
                    )}

                    <Button
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "blue.700" }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>

                    <Button
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "blue.700" }}
                        onClick={() => navigate("/history")}
                    >
                        Histórico
                    </Button>

                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button bg="blue" variant="outline" color="white">
                                {user?.fullName}
                            </Button>
                        </Menu.Trigger>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item value="profile" onClick={() => navigate("/profile")}>
                                    Perfil
                                </Menu.Item>
                                <Menu.Item value="logout" onClick={handleLogout}>
                                    Sair
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Menu.Root>
                </Flex>
            </Flex>
        </Box>
    );
};