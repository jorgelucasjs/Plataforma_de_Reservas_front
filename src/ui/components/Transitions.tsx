/**
 * Smooth Transitions and Animations
 * 
 * Provides reusable transition components and animation utilities
 * for consistent and smooth user interactions.
 */

import { Box, Flex } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useState, useEffect, type ReactNode } from 'react';

// Animation keyframes
const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideInFromBottom = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Transition component props
interface TransitionProps {
  children: ReactNode;
  duration?: string;
  delay?: string;
  easing?: string;
  className?: string;
}

// Fade In Transition
export const FadeIn = ({ 
  children, 
  duration = '0.3s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${fadeIn} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Fade In Up Transition
export const FadeInUp = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${fadeInUp} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Fade In Down Transition
export const FadeInDown = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${fadeInDown} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Scale In Transition
export const ScaleIn = ({ 
  children, 
  duration = '0.3s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${scaleIn} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Bounce In Transition
export const BounceIn = ({ 
  children, 
  duration = '0.6s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${bounceIn} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Slide In Transitions
export const SlideInFromRight = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${slideInFromRight} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

export const SlideInFromLeft = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${slideInFromLeft} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

export const SlideInFromTop = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${slideInFromTop} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

export const SlideInFromBottom = ({ 
  children, 
  duration = '0.4s', 
  delay = '0s', 
  easing = 'ease-out',
  ...props 
}: TransitionProps) => (
  <Box
    animation={`${slideInFromBottom} ${duration} ${easing} ${delay} both`}
    {...props}
  >
    {children}
  </Box>
);

// Staggered List Animation
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: 'fadeInUp' | 'slideUp' | 'scaleIn';
  duration?: string;
}

export const StaggeredList = ({ 
  children, 
  staggerDelay = 0.1, 
  animation = 'fadeInUp',
  duration = '0.4s'
}: StaggeredListProps) => {
  const animationKeyframes = {
    fadeInUp,
    slideUp,
    scaleIn
  }[animation];

  return (
    <>
      {children.map((child, index) => (
        <Box
          key={index}
          animation={`${animationKeyframes} ${duration} ease-out ${index * staggerDelay}s both`}
        >
          {child}
        </Box>
      ))}
    </>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade';
}

export const PageTransition = ({ children, direction = 'fade' }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getAnimation = () => {
    switch (direction) {
      case 'left':
        return slideInFromLeft;
      case 'right':
        return slideInFromRight;
      case 'up':
        return slideInFromTop;
      case 'down':
        return slideInFromBottom;
      default:
        return fadeIn;
    }
  };

  return (
    <Box
      animation={isVisible ? `${getAnimation()} 0.4s ease-out both` : undefined}
      opacity={isVisible ? 1 : 0}
    >
      {children}
    </Box>
  );
};

// Hover Animations
export const HoverScale = ({ children, scale = 1.05, ...props }: any) => (
  <Box
    transition="transform 0.2s ease"
    _hover={{ transform: `scale(${scale})` }}
    {...props}
  >
    {children}
  </Box>
);

export const HoverLift = ({ children, lift = '4px', ...props }: any) => (
  <Box
    transition="all 0.2s ease"
    _hover={{ 
      transform: `translateY(-${lift})`,
      boxShadow: 'lg'
    }}
    {...props}
  >
    {children}
  </Box>
);

export const HoverGlow = ({ children, glowColor = 'blue.500', ...props }: any) => (
  <Box
    transition="all 0.2s ease"
    _hover={{ 
      boxShadow: `0 0 20px var(--chakra-colors-${glowColor.replace('.', '-')})`
    }}
    {...props}
  >
    {children}
  </Box>
);

// Loading to Content Transition
interface LoadingTransitionProps {
  isLoading: boolean;
  loadingComponent: ReactNode;
  children: ReactNode;
}

export const LoadingTransition = ({ 
  isLoading, 
  loadingComponent, 
  children 
}: LoadingTransitionProps) => {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  return (
    <Box position="relative">
      {isLoading && (
        <FadeIn duration="0.2s">
          {loadingComponent}
        </FadeIn>
      )}
      {showContent && !isLoading && (
        <FadeInUp duration="0.4s">
          {children}
        </FadeInUp>
      )}
    </Box>
  );
};

// Modal/Dialog Transitions
export const ModalTransition = ({ children, isOpen, ...props }: any) => (
  <Box
    animation={isOpen ? `${scaleIn} 0.3s ease-out both` : undefined}
    {...props}
  >
    {children}
  </Box>
);

// Card Entrance Animation
export const CardEntrance = ({ children, index = 0, ...props }: any) => (
  <Box
    animation={`${fadeInUp} 0.4s ease-out ${index * 0.1}s both`}
    {...props}
  >
    {children}
  </Box>
);

// Button Press Animation
export const ButtonPress = ({ children, ...props }: any) => (
  <Box
    transition="all 0.1s ease"
    _active={{ 
      transform: 'scale(0.95)',
      transition: 'transform 0.1s ease'
    }}
    {...props}
  >
    {children}
  </Box>
);

// Notification Slide In
export const NotificationSlide = ({ children, from = 'right', ...props }: any) => {
  const animation = from === 'right' ? slideInFromRight : slideInFromLeft;
  
  return (
    <Box
      animation={`${animation} 0.3s ease-out both`}
      {...props}
    >
      {children}
    </Box>
  );
};

// Progress Animation
export const ProgressAnimation = ({ 
  progress, 
  children, 
  ...props 
}: { 
  progress: number; 
  children: ReactNode; 
}) => (
  <Box
    style={{
      transform: `translateX(${progress - 100}%)`,
      transition: 'transform 0.3s ease'
    }}
    {...props}
  >
    {children}
  </Box>
);

// Utility function to create custom transitions
export const createTransition = (
  keyframe: any,
  duration = '0.3s',
  easing = 'ease-out',
  delay = '0s'
) => ({
  animation: `${keyframe} ${duration} ${easing} ${delay} both`
});

// Export animation keyframes for custom use
export {
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  bounceIn,
  slideInFromRight,
  slideInFromLeft,
  slideInFromTop,
  slideInFromBottom,
  slideUp
};