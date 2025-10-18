import { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  isClosable?: boolean;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: MdCheckCircle,
    colorScheme: 'green',
    bg: 'green.50',
    borderColor: 'green.200',
    iconColor: 'green.500',
    titleColor: 'green.800',
    descColor: 'green.700',
  },
  error: {
    icon: MdError,
    colorScheme: 'red',
    bg: 'red.50',
    borderColor: 'red.200',
    iconColor: 'red.500',
    titleColor: 'red.800',
    descColor: 'red.700',
  },
  warning: {
    icon: MdWarning,
    colorScheme: 'orange',
    bg: 'orange.50',
    borderColor: 'orange.200',
    iconColor: 'orange.500',
    titleColor: 'orange.800',
    descColor: 'orange.700',
  },
  info: {
    icon: MdInfo,
    colorScheme: 'blue',
    bg: 'blue.50',
    borderColor: 'blue.200',
    iconColor: 'blue.500',
    titleColor: 'blue.800',
    descColor: 'blue.700',
  },
};

export function Toast({
  id,
  type,
  title,
  description,
  duration = 5000,
  isClosable = true,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Allow animation to complete
  };

  if (!isVisible) return null;

  return (
    <Box
      bg={config.bg}
      border="1px"
      borderColor={config.borderColor}
      borderRadius="lg"
      p={4}
      shadow="lg"
      maxW="md"
      w="full"
      opacity={isVisible ? 1 : 0}
      transform={isVisible ? 'translateY(0)' : 'translateY(-10px)'}
      transition="all 0.3s ease-in-out"
      role="alert"
      aria-live="polite"
    >
      <HStack align="flex-start" gap={3}>
        <Box color={config.iconColor} mt={0.5}>
          <Icon size={20} />
        </Box>
        
        <VStack align="flex-start" gap={1} flex="1">
          <Text
            fontWeight="semibold"
            color={config.titleColor}
            fontSize="sm"
            lineHeight="1.2"
          >
            {title}
          </Text>
          
          {description && (
            <Text
              color={config.descColor}
              fontSize="sm"
              lineHeight="1.4"
            >
              {description}
            </Text>
          )}
        </VStack>

        {isClosable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            color={config.titleColor}
            _hover={{ bg: config.borderColor }}
            minW="auto"
            h="auto"
            p={1}
          >
            <MdClose size={16} />
          </Button>
        )}
      </HStack>
    </Box>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex="toast"
      maxW="md"
      w="full"
    >
      <VStack gap={3} align="stretch">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </VStack>
    </Box>
  );
}