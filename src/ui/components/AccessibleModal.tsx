
import {
  Box,
  Heading,
  Text,
  IconButton,
  Portal,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { HiX } from 'react-icons/hi';
import { useModal } from '../../hooks/useAccessibility';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  modalSizes, 
  responsiveSpacing, 
  touchTargets,
  cardSizes 
} from '../../utils/responsive';
import type { ReactNode } from 'react';

interface AccessibleModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal description (optional) */
  description?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom close button label */
  closeButtonLabel?: string;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
}

/**
 * Accessible modal component with focus management, keyboard navigation,
 * and proper ARIA attributes
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeButtonLabel = 'Close modal',
  closeOnOverlayClick = true
}: AccessibleModalProps) {
  const { isMobile, isTouch } = useResponsive();
  const {
    modalProps,
    titleProps,
    descriptionProps
  } = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const getModalSize = () => {
    if (isMobile) {
      return modalSizes.mobile;
    }
    
    const sizeMap = {
      sm: { maxW: 'sm', maxH: '80vh' },
      md: { maxW: 'md', maxH: '80vh' },
      lg: { maxW: 'lg', maxH: '85vh' },
      xl: { maxW: 'xl', maxH: '90vh' }
    };
    
    return {
      ...modalSizes.desktop,
      ...sizeMap[size]
    };
  };

  const modalSize = getModalSize();

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      {/* Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={modalSize.m}
        onClick={handleOverlayClick}
      >
        {/* Modal Content */}
        <Box
          {...modalProps}
          bg="white"
          borderRadius={cardSizes.borderRadius}
          shadow="2xl"
          maxW={modalSize.maxW}
          maxH={modalSize.maxH}
          w="full"
          overflowY="auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            p={responsiveSpacing.lg}
            borderBottom="1px"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1} flex={1}>
                <Heading
                  {...titleProps}
                  size={{ base: 'md', md: 'lg' }}
                  color="gray.800"
                  lineHeight="shorter"
                >
                  {title}
                </Heading>
                {description && (
                  <Text
                    {...descriptionProps}
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="gray.600"
                  >
                    {description}
                  </Text>
                )}
              </VStack>
              
              {showCloseButton && (
                <IconButton
                  aria-label={closeButtonLabel}
                  onClick={onClose}
                  variant="ghost"
                  size={isTouch ? 'md' : 'sm'}
                  minH={isTouch ? touchTargets.comfortable : undefined}
                  _focus={{
                    boxShadow: 'outline',
                    outline: '2px solid',
                    outlineColor: 'blue.500',
                    outlineOffset: '2px'
                  }}
                >
                  <HiX size={isMobile ? 24 : 20} />
                </IconButton>
              )}
            </HStack>
          </Box>

          {/* Content */}
          <Box p={responsiveSpacing.lg}>
            {children}
          </Box>
        </Box>
      </Box>
    </Portal>
  );
}

/**
 * Accessible confirmation modal with standard actions
 */
interface AccessibleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function AccessibleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}: AccessibleConfirmModalProps) {
  const { isTouch } = useResponsive();

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return { colorPalette: 'red' };
      case 'warning':
        return { colorPalette: 'orange' };
      default:
        return { colorPalette: 'blue' };
    }
  };

  const variantColors = getVariantColors();

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
    >
      <VStack gap={responsiveSpacing.lg} align="stretch">
        <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
          {message}
        </Text>

        <HStack 
          justify="flex-end" 
          gap={responsiveSpacing.sm}
          flexDirection={{ base: 'column-reverse', sm: 'row' }}
        >
          <Box
            as="button"
            onClick={isLoading ? undefined : onClose}
            px={responsiveSpacing.md}
            py={responsiveSpacing.sm}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.300"
            bg="white"
            color="gray.700"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="medium"
            minH={isTouch ? touchTargets.comfortable : undefined}
            w={{ base: 'full', sm: 'auto' }}
            opacity={isLoading ? 0.6 : 1}
            cursor={isLoading ? 'not-allowed' : 'pointer'}
            _hover={!isLoading ? {
              bg: 'gray.50',
              borderColor: 'gray.400'
            } : {}}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'gray.500',
              outlineOffset: '2px'
            }}
            transition="all 0.2s ease-in-out"
            aria-disabled={isLoading}
          >
            {cancelText}
          </Box>

          <Box
            as="button"
            onClick={isLoading ? undefined : onConfirm}
            px={responsiveSpacing.md}
            py={responsiveSpacing.sm}
            borderRadius="md"
            bg={`${variantColors.colorPalette}.500`}
            color="white"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="medium"
            minH={isTouch ? touchTargets.comfortable : undefined}
            w={{ base: 'full', sm: 'auto' }}
            opacity={isLoading ? 0.6 : 1}
            cursor={isLoading ? 'not-allowed' : 'pointer'}
            _hover={!isLoading ? {
              bg: `${variantColors.colorPalette}.600`
            } : {}}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: `${variantColors.colorPalette}.500`,
              outlineOffset: '2px'
            }}
            transition="all 0.2s ease-in-out"
            aria-disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmText}
          </Box>
        </HStack>
      </VStack>
    </AccessibleModal>
  );
}