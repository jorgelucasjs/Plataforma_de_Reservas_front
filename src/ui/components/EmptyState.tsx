import { Box, Text } from "@chakra-ui/react";

interface EmptyStateProps {
    message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
    return (
        <Box textAlign="center" py="10">
            <Text color="gray.500">{message}</Text>
        </Box>
    );
};
