import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  VStack,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { 
  MdWarning, 
  MdError, 
  MdInfo, 
  MdCheck,
} from 'react-icons/md';

export type ConfirmDialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
  loadingText?: string;
  requireConfirmation?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'textarea' | 'password';
  inputRequired?: boolean;
  size?: 'sm' | 'md' | 'lg';
  preventCloseOnOverlay?: boolean;
}

const dialogConfig = {
  danger: {
    icon: MdError,
    iconColor: 'red.500',
    confirmColor: 'red',
    borderColor: 'red.200',
    bgColor: 'red.50'
  },
  warning: {
    icon: MdWarning,
    iconColor: 'orange.500',
    confirmColor: 'orange',
    borderColor: 'orange.200',
    bgColor: 'orange.50'
  },
  info: {
    icon: MdInfo,
    iconColor: 'blue.500',
    confirmColor: 'blue',
    borderColor: 'blue.200',
    bgColor: 'blue.50'
  },
  success: {
    icon: MdCheck,
    iconColor: 'green.500',
    confirmColor: 'green',
    borderColor: 'green.200',
    bgColor: 'green.50'
  }
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  isLoading = false,
  loadingText = 'Processing...',
  requireConfirmation = false,
  confirmationText = 'DELETE',
  confirmationPlaceholder = 'Type DELETE to confirm',
  showInput = false,
  inputLabel = 'Reason',
  inputPlaceholder = 'Enter reason...',
  inputType = 'text',
  inputRequired = false,
  size = 'md',
  preventCloseOnOverlay = false
}: ConfirmDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const config = dialogConfig[type];
  const Icon = config.icon;

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setUserInput('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventCloseOnOverlay && !isLoading && !isProcessing) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (requireConfirmation && confirmationInput !== confirmationText) {
      return;
    }

    if (inputRequired && !userInput.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const data = showInput ? { input: userInput } : undefined;
      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading && !isProcessing) {
      onClose();
    }
  };

  const isConfirmDisabled = 
    isLoading || 
    isProcessing || 
    (requireConfirmation && confirmationInput !== confirmationText) ||
    (inputRequired && !userInput.trim());

  const maxWidth = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
      onClick={handleOverlayClick}
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW={maxWidth}
        w="full"
        mx={4}
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
        border="1px"
        borderColor={config.borderColor}
      >
        <VStack gap={4} align="stretch">
          {/* Header */}
          <HStack gap={3} align="flex-start">
            <Box color={config.iconColor} mt={1} flexShrink={0}>
              <Icon size={24} />
            </Box>
            <VStack gap={2} align="flex-start" flex="1">
              <Heading size="md" color="gray.800">
                {title}
              </Heading>
              <Text color="gray.600" lineHeight="1.5">
                {message}
              </Text>
            </VStack>
          </HStack>

          {/* Warning box for dangerous actions */}
          {type === 'danger' && (
            <Box
              bg={config.bgColor}
              border="1px"
              borderColor={config.borderColor}
              borderRadius="md"
              p={3}
            >
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                ⚠️ This action cannot be undone. Please proceed with caution.
              </Text>
            </Box>
          )}

          {/* User input field */}
          {showInput && (
            <VStack gap={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {inputLabel}
                {inputRequired && <Text as="span" color="red.500" ml={1}>*</Text>}
              </Text>
              {inputType === 'textarea' ? (
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={inputPlaceholder}
                  rows={3}
                  disabled={isLoading || isProcessing}
                />
              ) : (
                <Input
                  type={inputType}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={inputPlaceholder}
                  disabled={isLoading || isProcessing}
                />
              )}
            </VStack>
          )}

          {/* Confirmation input */}
          {requireConfirmation && (
            <VStack gap={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Type <Text as="span" fontFamily="mono" bg="gray.100" px={1} borderRadius="sm">{confirmationText}</Text> to confirm:
              </Text>
              <Input
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={confirmationPlaceholder}
                disabled={isLoading || isProcessing}
                borderColor={requireConfirmation && confirmationInput && confirmationInput !== confirmationText ? 'red.300' : 'gray.300'}
              />
              {confirmationInput && confirmationInput !== confirmationText && (
                <Text fontSize="xs" color="red.500">
                  Please type "{confirmationText}" exactly as shown
                </Text>
              )}
            </VStack>
          )}

          {/* Actions */}
          <HStack justify="flex-end" gap={3} pt={2}>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isProcessing}
            >
              {cancelLabel}
            </Button>
            <Button
              colorPalette={config.confirmColor}
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              loading={isLoading || isProcessing}
              loadingText={loadingText}
            >
              {confirmLabel}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

// Convenience components for common confirmation scenarios
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  requireConfirmation?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
  requireConfirmation = false
}: DeleteConfirmationProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      type="danger"
      isLoading={isLoading}
      loadingText="Deleting..."
      requireConfirmation={requireConfirmation}
      confirmationText="DELETE"
      confirmationPlaceholder="Type DELETE to confirm"
    />
  );
}

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function LogoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: LogoutConfirmationProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign Out"
      message="Are you sure you want to sign out? You'll need to sign in again to access your account."
      confirmLabel="Sign Out"
      cancelLabel="Cancel"
      type="warning"
      isLoading={isLoading}
      loadingText="Signing out..."
    />
  );
}

interface CancelBookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { input: string }) => void | Promise<void>;
  serviceName: string;
  isLoading?: boolean;
}

export function CancelBookingConfirmation({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading = false
}: CancelBookingConfirmationProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Cancel Booking"
      message={`Are you sure you want to cancel your booking for "${serviceName}"? The amount will be refunded to your account.`}
      confirmLabel="Cancel Booking"
      cancelLabel="Keep Booking"
      type="warning"
      isLoading={isLoading}
      loadingText="Cancelling..."
      showInput
      inputLabel="Cancellation reason (optional)"
      inputPlaceholder="Why are you cancelling this booking?"
      inputType="textarea"
      inputRequired={false}
    />
  );
}