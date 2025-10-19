import { Badge, Button, Card, Heading, HStack, Text, VStack } from "@chakra-ui/react";

interface ServiceCardProps {
    id: string;
    name: string;
    description: string;
    price: number;
    providerName: string;
    userType: "provider" | "client";
    onEdit?: () => void;
    onDelete?: () => void;
    onBook?: () => void;
}

export const ServiceCard = ({
    name,
    description,
    price,
    providerName,
    userType,
    onEdit,
    onDelete,
    onBook,
}: ServiceCardProps) => {
    return (
        <Card.Root
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            shadow="md"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
        >
            <Card.Body>
                <VStack align="start" p="3">
                    <Heading size="md">{name}</Heading>
                    <Text fontSize="sm" color="gray.600" lineClamp={3}>
                        {description}
                    </Text>
                    <HStack justify="space-between" width="full">
                        <Badge colorScheme="green" fontSize="md">
                            ${price.toFixed(2)}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                            {providerName}
                        </Text>
                    </HStack>

                    <HStack p="2" width="full">
                        {userType === "provider" && (
                            <>
                                <Button size="sm" colorScheme="blue" flex="1" onClick={onEdit}>
                                    Editar
                                </Button>
                                <Button size="sm" colorScheme="red" flex="1" onClick={onDelete}>
                                    Eliminar
                                </Button>
                            </>
                        )}
                        {userType === "client" && (
                            <Button colorScheme="green" size="sm" width="full" onClick={onBook}>
                                Contratar
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
