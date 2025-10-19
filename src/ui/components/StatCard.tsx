import { Button, Card, Stat, VStack } from "@chakra-ui/react";

interface StatCardProps {
    label: string;
    value: string | number;
    valueColor?: string;
    action?: {
        label: string;
        onClick: () => void;
        colorScheme?: string;
    };
}

export const StatCard = ({ label, value, valueColor = "gray.800", action }: StatCardProps) => {
    return (
        <Card.Root
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            shadow="md"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.3s ease" }}
        >
            <Card.Body p="6">
                <VStack align="stretch" gap="3">
                    <Stat.Root>
                        <Stat.Label color="gray.600" fontSize="md" fontWeight="medium">
                            {label}
                        </Stat.Label>
                        <Stat.ValueText fontSize="3xl" fontWeight="bold" color={valueColor}>
                            {value}
                        </Stat.ValueText>
                    </Stat.Root>

                    {action && (
                        <Button
                            colorScheme={action.colorScheme || "blue"}
                            size="sm"
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
