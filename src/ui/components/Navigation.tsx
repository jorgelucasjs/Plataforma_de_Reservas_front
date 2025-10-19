import { Box, Button, Flex, Menu, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "@/utils/colors";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";

export const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuthStore();

    const user = getData(LOCALSTORAGE_USERDATA);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        window.location.href = "/login"
    };

    return (
        <Box bg={COLORS.navy} py="4" px="6" mb="8" >
            <Flex justify="space-between" align="center" maxW="6xl" mx="auto">
                <Box>
                    <Text fontSize="xl" fontWeight="bold" color="white">
                        AgendaSmart
                    </Text>
                </Box>

                <Flex gap="4" align="center">

                    <Button
                        variant="ghost"
                        color="white"
                        bg={isActive("/dashboard") ? COLORS.primary : "transparent"}
                        _hover={{ bg: COLORS.primary }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>
                    {user?.userType === "provider" && (
                        <>
                            <Button
                                variant="ghost"
                                color="white"
                                bg={isActive("/services") ? COLORS.primary : "transparent"}
                                _hover={{ bg: COLORS.primary }}
                                onClick={() => navigate("/services")}
                            >
                                Meus Serviços
                            </Button>
                            <Button
                                bg={isActive("/services/new") ? COLORS.accent : COLORS.primary}
                                color="white"
                                _hover={{ bg: COLORS.accent }}
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
                                bg={isActive("/services") ? COLORS.primary : "transparent"}
                                _hover={{ bg: COLORS.primary }}
                                onClick={() => navigate("/services")}
                            >
                                Contratar Serviços
                            </Button>
                            <Button
                                variant="ghost"
                                color="white"
                                bg={isActive("/bookings") ? COLORS.primary : "transparent"}
                                _hover={{ bg: COLORS.primary }}
                                onClick={() => navigate("/bookings")}
                            >
                                Minhas Reservas
                            </Button>
                        </>
                    )}



                    <Button
                        variant="ghost"
                        color="white"
                        bg={isActive("/history") ? COLORS.primary : "transparent"}
                        _hover={{ bg: COLORS.primary }}
                        onClick={() => navigate("/history")}
                    >
                        Histórico
                    </Button>

                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button bg={COLORS.primary} variant="solid" color="white" _hover={{ bg: COLORS.accent }}>
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