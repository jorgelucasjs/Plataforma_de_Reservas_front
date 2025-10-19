import { Box, Button, Dialog, Text, VStack } from "@chakra-ui/react";
import { APPCOLOR } from "@/utils/colors";

interface BookingConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    price: number;
    isLoading?: boolean;
}

export const BookingConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    price,
    isLoading = false,
}: BookingConfirmDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !isLoading && e.open !== isOpen && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content bg="#fff">
                    <Dialog.Header>
                        <Dialog.Title fontSize="lg" fontWeight="bold">
                            Confirmar Contratação
                        </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <VStack align="start" gap="3">
                            <Text>Deseja prosseguir com a contratação deste serviço?</Text>
                            <Box p="3" bg="gray.50" borderRadius="md" width="full">
                                <Text fontWeight="semibold" mb="1">Valor do serviço:</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                    ${price.toFixed(2)}
                                </Text>
                            </Box>
                            <Text fontSize="sm" color="gray.600">
                                O valor será debitado do seu saldo disponível.
                            </Text>
                        </VStack>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button
                            bg={APPCOLOR}
                            onClick={onConfirm}
                            ml={3}
                            color="#fff"
                            loading={isLoading}
                        >
                            Confirmar Contratação
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
