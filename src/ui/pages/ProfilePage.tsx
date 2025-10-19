import { useAuthStore } from "../../stores/authStore";
import { Container, Heading, Card, Stack, Box, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuthStore();

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <Container maxW="md">
      <Heading mb="6" color="navy.700">Meu Perfil</Heading>
      <Card.Root>
        <Card.Body>
          <Stack gap="4">
            <Box>
              <Text fontSize="sm" color="text.secondary">
                Nome
              </Text>
              <Text fontWeight="bold">{user?.fullName}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.secondary">
                Email
              </Text>
              <Text fontWeight="bold">{user?.email}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.secondary">
                NIF
              </Text>
              <Text fontWeight="bold">{user?.nif}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.secondary">
                Tipo de Conta
              </Text>
              <Text fontWeight="bold">
                {user?.userType === "client" ? "Cliente" : "Prestador"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.secondary">
                Saldo
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="primary.600">
                ${user?.balance.toFixed(2)}
              </Text>
            </Box>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Container>
  );
};