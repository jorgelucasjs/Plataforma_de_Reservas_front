import { Badge, Button, Card, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { convertToKwanzaMoney } from "@/utils/constants";

interface ServiceCardProps {
    id: string;
    name: string;
    description: string;
    price: number;
    providerName: string;
    userType: "provider" | "client";
    isHired?: boolean;
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
    isHired = false,
    onEdit,
    onDelete,
    onBook,
}: ServiceCardProps) => {
    return (
        <Card.Root
            bg="bg.card"
            border="1px solid"
            borderColor="border.default"
          
            _hover={{ boxShadow: "xl", transform: "translateY(-4px)", transition: "all 0.3s ease", borderColor: "primary.500" }}
        >
            <Card.Body>
                <VStack align="start">
                    <Heading size="md" color={"#000"} fontWeight={"bold"}>{name}</Heading>
                    <Text fontSize="sm" color="gray.600" lineClamp={3}>
                        {description}
                    </Text>
                    <HStack justify="space-between" width="full">
                        <Badge bg="primary.500" color="white" fontSize="md" px="3" py="1" borderRadius="md">
                            {convertToKwanzaMoney(price, false)}
                        </Badge>
                        <Text fontSize="xs" color="text.muted">
                            {providerName}
                        </Text>
                    </HStack>

                    <HStack width="full" mt={"4"}>
                        {userType === "provider" && (
                            <>
                                <Button size="sm" bg="navy.500" color="white" _hover={{ bg: "primary.500" }} flex="1" onClick={onEdit}>
                                    Editar
                                </Button>
                                <Button size="sm" colorScheme="red" flex="1" onClick={onDelete}>
                                    Eliminar
                                </Button>
                            </>
                        )}
                        {userType === "client" && (
                            <Button 
                                bg={isHired ? "gray.400" : "primary.500"} 
                                color="white" 
                                _hover={isHired ? {} : { bg: "accent.500" }} 
                                size="sm" 
                                width="full" 
                                onClick={onBook}
                                disabled={isHired}
                                cursor={isHired ? "not-allowed" : "pointer"}
                            >
                                {isHired ? "Já Contratado" : "Contratar"}
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
