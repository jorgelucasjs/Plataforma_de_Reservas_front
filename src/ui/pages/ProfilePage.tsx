import { Container, Heading, Box, Text, Stack, Badge } from "@chakra-ui/react";
import { COLORS } from "@/utils/colors";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import { getData } from "@/dao/localStorage";
import { LuUser, LuMail, LuCreditCard, LuCalendar, LuWallet } from "react-icons/lu";
import { convertToKwanzaMoney } from "@/utils/constants";

export const ProfilePage = () => {
    const user = getData(LOCALSTORAGE_USERDATA);

    if (!user) {
        return (
            <Container maxW="4xl">
                <Heading mb="6" color="navy.700">Perfil</Heading>
                <Text>Nenhum usuário encontrado</Text>
            </Container>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Container maxW="4xl">
            <Heading mb="6" color="navy.700">Meu Perfil</Heading>

            <Box
                bg="white"
                p="8"
                borderRadius="lg"
               
                border="1px solid"
                borderColor="gray.200"
            >
                <Stack gap="6">
                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1" display="flex" alignItems="center" gap="2">
                            <LuUser /> Nome Completo
                        </Text>
                        <Text fontSize="lg" fontWeight="semibold" color="navy.700">
                            {user.fullName}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1" display="flex" alignItems="center" gap="2">
                            <LuMail /> Email
                        </Text>
                        <Text fontSize="lg" color="navy.700">
                            {user.email}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1" display="flex" alignItems="center" gap="2">
                            <LuCreditCard /> NIF
                        </Text>
                        <Text fontSize="lg" color="navy.700">
                            {user.nif}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1" display="flex" alignItems="center" gap="2">
                            <LuWallet /> Saldo
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={COLORS.primary}>
                            {convertToKwanzaMoney(user.balance || 0, false)}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1">
                            Tipo de Conta
                        </Text>
                        <Badge
                            colorPalette={user.userType === "provider" ? "blue" : "green"}
                            size="lg"
                            variant="solid"
                        >
                            {user.userType === "provider" ? "Prestador" : "Cliente"}
                        </Badge>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1" display="flex" alignItems="center" gap="2">
                            <LuCalendar /> Membro desde
                        </Text>
                        <Text fontSize="lg" color="navy.700">
                            {formatDate(user.createdAt)}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.600" mb="1">
                            Status da Conta
                        </Text>
                        <Badge
                            colorPalette={user.isActive ? "green" : "red"}
                            size="lg"
                            variant="solid"
                        >
                            {user.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
};
