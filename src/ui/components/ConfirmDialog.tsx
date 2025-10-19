import { Button, Dialog, Text } from "@chakra-ui/react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColorScheme?: string;
    isLoading?: boolean;
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmColorScheme = "red",
    isLoading = false,
}: ConfirmDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !isLoading && e.open !== isOpen && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content bg="#fff">
                    <Dialog.Header>
                        <Dialog.Title fontSize="lg" fontWeight="bold">
                            {title}
                        </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Text>{message}</Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button onClick={onClose} disabled={isLoading}>
                            {cancelText}
                        </Button>
                        <Button
                            bg={confirmColorScheme}
                            onClick={onConfirm}
                            ml={3}
                            loading={isLoading}
                            color={"#fff"}
                        >
                            {confirmText}
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
