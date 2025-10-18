import {
  Box,
  Center,
  Text,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;

  speed?: string;
  label?: string;
  showLabel?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  color = 'blue.500',

  speed = '0.65s',
  label = 'Loading...',
  showLabel = false,
  variant = 'spinner',
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  
  const sizeMap = {
    xs: '16px',
    sm: '20px',
    md: '32px',
    lg: '48px',
    xl: '64px'
  };

  const LoadingContent = () => {
    switch (variant) {
      case 'dots':
        return (
          <HStack gap={1}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w={size === 'xs' ? '2' : size === 'sm' ? '3' : '4'}
                h={size === 'xs' ? '2' : size === 'sm' ? '3' : '4'}
                bg={color}
                borderRadius="full"
                animation={`bounce 1.4s ease-in-out ${i * 0.16}s infinite both`}
              />
            ))}
          </HStack>
        );
      
      case 'pulse':
        return (
          <Box
            w={sizeMap[size]}
            h={sizeMap[size]}
            bg={color}
            borderRadius="full"
            animation={`pulse ${speed} ease-in-out infinite`}
          />
        );
      
      case 'bars':
        return (
          <HStack gap={1} align="end">
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                w={size === 'xs' ? '1' : size === 'sm' ? '1.5' : '2'}
                h={size === 'xs' ? '4' : size === 'sm' ? '6' : '8'}
                bg={color}
                borderRadius="sm"
                animation={`bars 1.2s ease-in-out ${i * 0.1}s infinite`}
                transformOrigin="bottom"
              />
            ))}
          </HStack>
        );
      
      default:
        return (
          <Spinner
            size={size}
            color={color}
          />
        );
    }
  };

  const content = (
    <VStack gap={showLabel ? 3 : 0}>
      <LoadingContent />
      {showLabel && (
        <Text
          fontSize={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'}
          color="gray.600"
          textAlign="center"
        >
          {label}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={overlay ? 'blackAlpha.600' : 'white'}
        zIndex="modal"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {content}
      </Box>
    );
  }

  if (overlay) {
    return (
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="whiteAlpha.800"
        zIndex="overlay"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="inherit"
      >
        {content}
      </Box>
    );
  }

  return (
    <Center>
      {content}
    </Center>
  );
}

// CSS animations (to be added to global styles)
export const loadingAnimations = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes bars {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
`;

// Convenience components for common use cases
export function PageLoader({ label = 'Loading page...' }: { label?: string }) {
  return (
    <LoadingSpinner
      size="lg"
      showLabel
      label={label}
      fullScreen
      overlay
    />
  );
}

export function InlineLoader({ size = 'sm', label }: { size?: 'xs' | 'sm' | 'md'; label?: string }) {
  return (
    <LoadingSpinner
      size={size}
      showLabel={!!label}
      label={label}
    />
  );
}

export function ButtonLoader({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  return (
    <LoadingSpinner
      size={size}
      color="currentColor"
    />
  );
}