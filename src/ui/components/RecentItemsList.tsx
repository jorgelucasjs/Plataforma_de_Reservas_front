import { Box, Button, Card, Heading, HStack, Text, VStack } from "@chakra-ui/react";

interface RecentItem {
    id: string;
    title: string;
    subtitle: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface RecentItemsListProps {
    title: string;
    items: RecentItem[];
}

export const RecentItemsList = ({ title, items }: RecentItemsListProps) => {
    return (
        <Card.Root shadow="md" bg="white" borderWidth="0">
            <Card.Body p="6">
                <Heading size="lg" mb="6" color="gray.700">
                    {title}
                </Heading>
                <VStack align="stretch" gap="4">
                    {items.map((item) => (
                        <Box
                            key={item.id}
                            p="5"
                            bg="gray.50"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            _hover={{ bg: "gray.100", shadow: "sm" }}
                            transition="all 0.2s"
                        >
                            <HStack justify="space-between">
                                <VStack align="start" gap="1">
                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                        {item.title}
                                    </Text>
                                    <Text fontSize="md" color="green.600" fontWeight="semibold">
                                        {item.subtitle}
                                    </Text>
                                </VStack>
                                {item.action && (
                                    <Button
                                        colorScheme="blue"
                                        variant="outline"
                                        size="sm"
                                        onClick={item.action.onClick}
                                    >
                                        {item.action.label}
                                    </Button>
                                )}
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
