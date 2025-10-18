/**
 * Enhanced Loading States Component
 * 
 * Provides various loading states for different UI contexts with smooth animations
 * and consistent styling across the application.
 */

import { Box, Flex, Text, Spinner, Skeleton, SkeletonText } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Animation keyframes
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface LoadingStateProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    variant?: 'spinner' | 'skeleton' | 'shimmer' | 'dots';
    fullScreen?: boolean;
}

// Spinner Loading State
export const SpinnerLoading = ({ size = 'md', message, fullScreen = false }: LoadingStateProps) => {

    const content = (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={4}
            p={6}
        >
            <Spinner
                size={size}
                color="blue.500"
            />
            {message && (
                <Text
                    fontSize={size === 'sm' ? 'sm' : 'md'}
                    color="gray.600"
                    textAlign="center"
                    animation={`${pulse} 2s ease-in-out infinite`}
                >
                    {message}
                </Text>
            )}
        </Flex>
    );

    if (fullScreen) {
        return (
            <Flex
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255, 255, 255, 0.9)"
                zIndex={9999}
                align="center"
                justify="center"
                backdropFilter="blur(2px)"
            >
                {content}
            </Flex>
        );
    }

    return content;
};

// Skeleton Loading State for Cards
const CardSkeleton = ({ count = 1 }: { count?: number }) => (
    <Box>
        {Array.from({ length: count }).map((_, index) => (
            <Box
                key={index}
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                mb={4}
                animation={`${fadeIn} 0.3s ease-out ${index * 0.1}s both`}
            >
                <Skeleton height="20px" mb={4} />
                <SkeletonText mt={4} noOfLines={3} />
                <Flex mt={4} gap={2}>
                    <Skeleton height="32px" width="80px" />
                    <Skeleton height="32px" width="100px" />
                </Flex>
            </Box>
        ))}
    </Box>
);

// Table Skeleton Loading State
const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <Box>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <Flex
                key={rowIndex}
                gap={4}
                p={4}
                borderBottomWidth="1px"
                animation={`${fadeIn} 0.3s ease-out ${rowIndex * 0.05}s both`}
            >
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton
                        key={colIndex}
                        height="20px"
                        flex={colIndex === 0 ? 2 : 1}
                    />
                ))}
            </Flex>
        ))}
    </Box>
);

// Shimmer Loading Effect
const ShimmerLoading = ({ height = '200px', width = '100%' }: { height?: string; width?: string }) => (
    <Box
        height={height}
        width={width}
        background="linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)"
        backgroundSize="200px 100%"
        animation={`${shimmer} 1.5s infinite`}
        borderRadius="md"
    />
);

// Dots Loading Animation
const DotsLoading = ({ size = 'md', color = 'blue.500' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) => {
    const dotSize = {
        sm: '6px',
        md: '8px',
        lg: '12px'
    }[size];

    const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  `;

    return (
        <Flex align="center" justify="center" gap={1}>
            {[0, 1, 2].map((index) => (
                <Box
                    key={index}
                    width={dotSize}
                    height={dotSize}
                    bg={color}
                    borderRadius="full"
                    animation={`${bounce} 1.4s ease-in-out ${index * 0.16}s infinite both`}
                />
            ))}
        </Flex>
    );
};

// Button Loading State
const ButtonLoading = ({
    children,
    isLoading = false,
    loadingText = 'Loading...',
    ...props
}: any) => (
    <Box {...props}>
        {isLoading ? (
            <Flex align="center" gap={2}>
                <Spinner size="sm" />
                <Text>{loadingText}</Text>
            </Flex>
        ) : (
            children
        )}
    </Box>
);

// Page Loading State
const PageLoading = ({ message = 'Loading page...' }: { message?: string }) => (
    <Flex
        minH="400px"
        align="center"
        justify="center"
        direction="column"
        gap={4}
    >
        <SpinnerLoading size="lg" />
        <Text color="gray.600" fontSize="lg">
            {message}
        </Text>
    </Flex>
);

// Form Loading Overlay
const FormLoadingOverlay = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => (
    <Box position="relative">
        {children}
        {isLoading && (
            <Flex
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255, 255, 255, 0.8)"
                align="center"
                justify="center"
                borderRadius="md"
                zIndex={10}
            >
                <SpinnerLoading message="Processing..." />
            </Flex>
        )}
    </Box>
);

// List Loading State with Staggered Animation
const ListLoading = ({ count = 5, itemHeight = '60px' }: { count?: number; itemHeight?: string }) => (
    <Box>
        {Array.from({ length: count }).map((_, index) => (
            <Flex
                key={index}
                align="center"
                gap={4}
                p={4}
                borderBottomWidth="1px"
                height={itemHeight}
                animation={`${fadeIn} 0.3s ease-out ${index * 0.1}s both`}
            >
                <Skeleton width="40px" height="40px" borderRadius="full" />
                <Box flex={1}>
                    <Skeleton height="16px" mb={2} width="60%" />
                    <Skeleton height="12px" width="40%" />
                </Box>
                <Skeleton width="80px" height="32px" />
            </Flex>
        ))}
    </Box>
);

// Search Loading State
const SearchLoading = () => (
    <Flex
        align="center"
        justify="center"
        p={8}
        direction="column"
        gap={4}
    >
        <DotsLoading size="lg" />
        <Text color="gray.600">Searching...</Text>
    </Flex>
);

// Data Loading State with Progress
const ProgressLoading = ({
    progress = 0,
    message = 'Loading...',
    showPercentage = true
}: {
    progress?: number;
    message?: string;
    showPercentage?: boolean;
}) => (
    <Box p={6}>
        <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">
                {message}
            </Text>
            {showPercentage && (
                <Text fontSize="sm" color="gray.600">
                    {Math.round(progress)}%
                </Text>
            )}
        </Flex>
        <Box
            width="100%"
            height="4px"
            bg="gray.200"
            borderRadius="full"
            overflow="hidden"
        >
            <Box
                height="100%"
                bg="blue.500"
                width={`${progress}%`}
                transition="width 0.3s ease"
                borderRadius="full"
            />
        </Box>
    </Box>
);

// Export all loading components
export {
    SpinnerLoading as LoadingSpinner,
    CardSkeleton,
    TableSkeleton,
    ShimmerLoading,
    DotsLoading,
    ButtonLoading,
    PageLoading,
    FormLoadingOverlay,
    ListLoading,
    SearchLoading,
    ProgressLoading
};