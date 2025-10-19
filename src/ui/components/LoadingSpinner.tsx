import { Container, Spinner } from "@chakra-ui/react";

export const LoadingSpinner = () => {
    return (
        <Container maxW="6xl" textAlign="center" py="20">
            <Spinner size="xl" />
        </Container>
    );
};
