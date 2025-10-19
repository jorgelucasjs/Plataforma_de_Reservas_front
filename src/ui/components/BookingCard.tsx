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
        <Card.Root>
            <Card.Body>
                <VStack align="start" gap="2">
                    <HStack justify="space-between" width="full">
                        <Heading size="md">{serviceName}</Heading>
                        <Badge colorScheme={status === "confirmed" ? "green" : "red"}>
                            {status === "confirmed" ? "Confirmada" : "Cancelada"}
                        </Badge>
                    </HStack>
                    <Text fontSize="sm">Prestador: {providerName}</Text>
                    <Text fontSize="sm">Valor: ${amount.toFixed(2)}</Text>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(createdAt).toLocaleDateString()}
                    </Text>

                    {status === "confirmed" && onCancel && (
                        <Button size="sm" colorScheme="red" onClick={onCancel}>
                            Cancelar Reserva
                        </Button>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
