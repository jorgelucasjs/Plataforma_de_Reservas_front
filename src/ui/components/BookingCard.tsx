import { Badge, Button, Card, Heading, HStack, Text, VStack } from "@chakra-ui/react";

interface BookingCardProps {
    id: string;
    serviceName: string;
    providerName: string;
    amount: number;
    status: string;
    createdAt: string;
    onCancel?: () => void;
}

export const BookingCard = ({
    serviceName,
    providerName,
    amount,
    status,
    createdAt,
    onCancel,
}: BookingCardProps) => {
    return (
        <Card.Root
            bg="bg.card"
            border="1px solid"
            borderColor="border.default"
            _hover={{ boxShadow: "xl", transform: "translateY(-2px)", transition: "all 0.3s ease", borderColor: "primary.500" }}
        >
            <Card.Body>
                <VStack align="start" gap="2">
                    <HStack justify="space-between" width="full">
                        <Heading size="md" color="navy.700">{serviceName}</Heading>
                        <Badge bg={status === "confirmed" ? "primary.500" : "red.500"} color="white" px="3" py="1" borderRadius="md">
                            {status === "confirmed" ? "Confirmada" : "Cancelada"}
                        </Badge>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary">Prestador: {providerName}</Text>
                    <Text fontSize="sm" fontWeight="bold" color="primary.600">Valor: ${amount.toFixed(2)}</Text>
                    <Text fontSize="xs" color="text.muted">
                        {new Date(createdAt).toLocaleDateString()}
                    </Text>

                    {status === "confirmed" && onCancel && (
                        <Button size="sm" bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={onCancel}>
                            Cancelar Reserva
                        </Button>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
