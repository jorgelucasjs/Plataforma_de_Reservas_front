/**
 * Enhanced Feedback Components
 * 
 * Provides comprehensive user feedback through toasts, notifications,
 * success states, and interactive feedback elements.
 */

import {
    Box,
    Flex,
    Text,
    Button,
    Badge,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useState, useEffect } from 'react';
import {
    FiCheck,
    FiX,
    FiAlertTriangle,
    FiInfo,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiThumbsUp,
    FiThumbsDown,
    FiStar
} from 'react-icons/fi';

// Animation keyframes
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const checkmark = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

// Enhanced Toast Notification
interface ToastNotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
    isClosable?: boolean;
    onClose?: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const ToastNotification = ({
    type,
    title,
    description,
    duration = 5000,
    isClosable = true,
    onClose,
    action
}: ToastNotificationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    setTimeout(onClose, 300); // Wait for animation
                }
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return FiCheckCircle;
            case 'error':
                return FiXCircle;
            case 'warning':
                return FiAlertTriangle;
            case 'info':
                return FiInfo;
        }
    };

    const getColorScheme = () => {
        switch (type) {
            case 'success':
                return 'green';
            case 'error':
                return 'red';
            case 'warning':
                return 'orange';
            case 'info':
                return 'blue';
        }
    };

    return (
        <Box
            animation={isVisible ? `${slideInRight} 0.3s ease-out` : `${slideOutRight} 0.3s ease-in`}
            position="fixed"
            top={4}
            right={4}
            zIndex={9999}
            maxW="400px"
        >
            <Box
                bg={getColorScheme() === 'green' ? 'green.500' :
                    getColorScheme() === 'red' ? 'red.500' :
                        getColorScheme() === 'orange' ? 'orange.500' : 'blue.500'}
                color="white"
                borderRadius="lg"
                boxShadow="lg"
                p={4}
                display="flex"
                alignItems="flex-start"
                gap={3}
            >
                <Box as={getIcon()} boxSize={5} mt={0.5} />
                <Box flex={1}>
                    <Text fontSize="md" fontWeight="bold">
                        {title}
                    </Text>
                    {description && (
                        <Text fontSize="sm" mt={1} opacity={0.9}>
                            {description}
                        </Text>
                    )}
                    {action && (
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="whiteAlpha"
                            mt={2}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </Box>
                {isClosable && (
                    <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        onClick={() => {
                            setIsVisible(false);
                            if (onClose) {
                                setTimeout(onClose, 300);
                            }
                        }}
                    >
                        <Box as={FiX} />
                    </Button>
                )}
            </Box>
        </Box>
    );
};

// Success State Component
export const SuccessState = ({
    title,
    description,
    action,
    showAnimation = true
}: {
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    showAnimation?: boolean;
}) => (
    <Flex
        direction="column"
        align="center"
        justify="center"
        p={8}
        textAlign="center"
        animation={showAnimation ? `${bounce} 0.6s ease-out` : undefined}
    >
        <Box
            position="relative"
            mb={4}
            width="80px"
            height="80px"
            borderRadius="full"
            border="4px solid"
            borderColor="green.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="green.50"
        >
            <Box as={FiCheck} boxSize={8} color="green.500" />
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="green.600" mb={2}>
            {title}
        </Text>
        {description && (
            <Text color="gray.600" mb={4}>
                {description}
            </Text>
        )}
        {action && (
            <Button colorScheme="green" onClick={action.onClick}>
                {action.label}
            </Button>
        )}
    </Flex>
);

// Error State Component
export const ErrorState = ({
    title,
    description,
    retry,
    showAnimation = true
}: {
    title: string;
    description?: string;
    retry?: { label: string; onClick: () => void };
    showAnimation?: boolean;
}) => (
    <Flex
        direction="column"
        align="center"
        justify="center"
        p={8}
        textAlign="center"
        animation={showAnimation ? `${pulse} 0.5s ease-out` : undefined}
    >
        <Box mb={4}>
            <Box as={FiXCircle} boxSize={16} color="red.500" />
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="red.600" mb={2}>
            {title}
        </Text>
        {description && (
            <Text color="gray.600" mb={4}>
                {description}
            </Text>
        )}
        {retry && (
            <Button colorScheme="red" variant="outline" onClick={retry.onClick}>
                {retry.label}
            </Button>
        )}
    </Flex>
);

// Progress Feedback Component
export const ProgressFeedback = ({
    steps,
    currentStep,
    title,
    description
}: {
    steps: string[];
    currentStep: number;
    title?: string;
    description?: string;
}) => {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <Box p={6}>
            {title && (
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {title}
                </Text>
            )}
            {description && (
                <Text color="gray.600" mb={4}>
                    {description}
                </Text>
            )}

            <Box
                width="100%"
                height="8px"
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
                mb={4}
            >
                <Box
                    height="100%"
                    bg="blue.500"
                    width={`${progress}%`}
                    transition="width 0.3s ease"
                    borderRadius="full"
                />
            </Box>

            <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                    Step {currentStep + 1} of {steps.length}
                </Text>
                <Text fontSize="sm" color="gray.600">
                    {Math.round(progress)}%
                </Text>
            </Flex>

            <Text fontSize="md" mt={2} fontWeight="medium">
                {steps[currentStep]}
            </Text>
        </Box>
    );
};

// Interactive Rating Component
export const RatingFeedback = ({
    value,
    onChange,
    max = 5,
    size = 'md',
    color = 'yellow.400'
}: {
    value: number;
    onChange: (rating: number) => void;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}) => {
    const [hoverValue, setHoverValue] = useState(0);

    const iconSize = {
        sm: 4,
        md: 6,
        lg: 8
    }[size];

    return (
        <Flex gap={1}>
            {Array.from({ length: max }).map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= (hoverValue || value);

                return (
                    <Box
                        key={index}
                        as={FiStar}
                        boxSize={iconSize}
                        color={isActive ? color : 'gray.300'}
                        fill={isActive ? color : 'transparent'}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                        onClick={() => onChange(starValue)}
                        onMouseEnter={() => setHoverValue(starValue)}
                        onMouseLeave={() => setHoverValue(0)}
                    />
                );
            })}
        </Flex>
    );
};

// Like/Dislike Feedback
export const LikeDislikeFeedback = ({
    onLike,
    onDislike,
    likeCount,
    dislikeCount,
    userVote
}: {
    onLike: () => void;
    onDislike: () => void;
    likeCount?: number;
    dislikeCount?: number;
    userVote?: 'like' | 'dislike' | null;
}) => (
    <Flex gap={4} align="center">
        <Flex align="center" gap={1}>
            <Button
                size="sm"
                variant={userVote === 'like' ? 'solid' : 'ghost'}
                colorScheme="green"
                onClick={onLike}
            >
                <Flex align="center" gap={1}>
                    <Box as={FiThumbsUp} />
                    {likeCount}
                </Flex>
            </Button>
        </Flex>
        <Flex align="center" gap={1}>
            <Button
                size="sm"
                variant={userVote === 'dislike' ? 'solid' : 'ghost'}
                colorScheme="red"
                onClick={onDislike}
            >
                <Flex align="center" gap={1}>
                    <Box as={FiThumbsDown} />
                    {dislikeCount}
                </Flex>
            </Button>
        </Flex>
    </Flex>
);

// Status Badge Component
export const StatusBadge = ({
    status,
    variant = 'solid'
}: {
    status: 'success' | 'error' | 'warning' | 'info' | 'loading';
    variant?: 'solid' | 'outline' | 'subtle';
}) => {
    const getConfig = () => {
        switch (status) {
            case 'success':
                return { colorScheme: 'green', icon: FiCheckCircle, label: 'Success' };
            case 'error':
                return { colorScheme: 'red', icon: FiXCircle, label: 'Error' };
            case 'warning':
                return { colorScheme: 'orange', icon: FiAlertTriangle, label: 'Warning' };
            case 'info':
                return { colorScheme: 'blue', icon: FiInfo, label: 'Info' };
            case 'loading':
                return { colorScheme: 'gray', icon: FiLoader, label: 'Loading' };
        }
    };

    const config = getConfig();

    return (
        <Badge
            colorScheme={config.colorScheme}
            variant={variant}
            display="flex"
            alignItems="center"
            gap={1}
            px={2}
            py={1}
        >
            <Box
                as={config.icon}
                boxSize={3}
                animation={status === 'loading' ? `${pulse} 1s infinite` : undefined}
            />
            {config.label}
        </Badge>
    );
};

// Confirmation Dialog with Animation
export const ConfirmationDialog = ({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning'
}: {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'danger' | 'info';
}) => {
    if (!isOpen) return null;

    const getColorScheme = () => {
        switch (type) {
            case 'danger':
                return 'red';
            case 'info':
                return 'blue';
            default:
                return 'orange';
        }
    };

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
            animation={`${slideInRight} 0.3s ease-out`}
        >
            <Box
                bg="white"
                borderRadius="lg"
                p={6}
                maxW="400px"
                mx={4}
                boxShadow="xl"
            >
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {title}
                </Text>
                <Text color="gray.600" mb={6}>
                    {description}
                </Text>
                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button colorScheme={getColorScheme()} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// Loading Button with Feedback
export const LoadingButton = ({
    children,
    isLoading,
    loadingText,
    successText,
    errorText,
    onClick,
    ...props
}: any) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleClick = async () => {
        setStatus('loading');
        try {
            await onClick();
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const getContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <Flex align="center" gap={2}>
                        <Box as={FiLoader} animation={`${pulse} 1s infinite`} />
                        {loadingText || 'Loading...'}
                    </Flex>
                );
            case 'success':
                return (
                    <Flex align="center" gap={2}>
                        <Box as={FiCheck} />
                        {successText || 'Success!'}
                    </Flex>
                );
            case 'error':
                return (
                    <Flex align="center" gap={2}>
                        <Box as={FiX} />
                        {errorText || 'Error'}
                    </Flex>
                );
            default:
                return children;
        }
    };

    return (
        <Button
            {...props}
            onClick={handleClick}
            isDisabled={status === 'loading'}
            colorScheme={status === 'success' ? 'green' : status === 'error' ? 'red' : props.colorScheme}
        >
            {getContent()}
        </Button>
    );
};

// Floating Action Feedback
export const FloatingFeedback = ({
    message,
    type = 'info',
    position = 'bottom-right',
    duration = 3000
}: {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    duration?: number;
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!isVisible) return null;

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return { top: 4, left: 4 };
            case 'top-right':
                return { top: 4, right: 4 };
            case 'bottom-left':
                return { bottom: 4, left: 4 };
            case 'bottom-right':
                return { bottom: 4, right: 4 };
        }
    };

    return (
        <Box
            position="fixed"
            zIndex={9999}
            animation={`${slideInRight} 0.3s ease-out`}
            {...getPositionStyles()}
        >
            <Box
                bg={type === 'success' ? 'green.500' :
                    type === 'error' ? 'red.500' :
                        type === 'warning' ? 'orange.500' : 'blue.500'}
                color="white"
                borderRadius="lg"
                boxShadow="lg"
                maxW="300px"
                p={3}
                display="flex"
                alignItems="center"
                gap={2}
            >
                <Box as={type === 'success' ? FiCheckCircle :
                    type === 'error' ? FiXCircle :
                        type === 'warning' ? FiAlertTriangle : FiInfo}
                    boxSize={4} />
                <Text fontSize="sm">{message}</Text>
            </Box>
        </Box>
    );
};

export {
    slideInRight,
    slideOutRight,
    bounce,
    pulse,
    checkmark
};