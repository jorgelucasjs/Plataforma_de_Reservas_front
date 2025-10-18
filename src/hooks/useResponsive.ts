import { useState, useEffect } from 'react';
import { breakpoints } from '../utils/responsive';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  currentBreakpoint: keyof typeof breakpoints;
}

/**
 * Custom hook for responsive design detection
 * Provides information about current screen size, device type, and touch capabilities
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        screenWidth: 1024,
        screenHeight: 768,
        currentBreakpoint: 'lg'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < parseInt(breakpoints.md),
      isTablet: width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg),
      isDesktop: width >= parseInt(breakpoints.lg),
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
      currentBreakpoint: getCurrentBreakpoint(width)
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        isMobile: width < parseInt(breakpoints.md),
        isTablet: width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg),
        isDesktop: width >= parseInt(breakpoints.lg),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenWidth: width,
        screenHeight: height,
        currentBreakpoint: getCurrentBreakpoint(width)
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

/**
 * Determines the current breakpoint based on screen width
 */
function getCurrentBreakpoint(width: number): keyof typeof breakpoints {
  if (width >= parseInt(breakpoints['2xl'])) return '2xl';
  if (width >= parseInt(breakpoints.xl)) return 'xl';
  if (width >= parseInt(breakpoints.lg)) return 'lg';
  if (width >= parseInt(breakpoints.md)) return 'md';
  if (width >= parseInt(breakpoints.sm)) return 'sm';
  return 'base';
}

/**
 * Hook for detecting if the current screen size matches a specific breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const { currentBreakpoint } = useResponsive();
  
  const breakpointOrder: (keyof typeof breakpoints)[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(breakpoint);
  
  return currentIndex >= targetIndex;
}

/**
 * Hook for detecting touch devices
 */
export function useIsTouch(): boolean {
  const { isTouch } = useResponsive();
  return isTouch;
}

/**
 * Hook for detecting mobile devices (combines screen size and touch detection)
 */
export function useIsMobile(): boolean {
  const { isMobile, isTouch } = useResponsive();
  return isMobile || isTouch;
}

/**
 * Hook for getting responsive values based on current breakpoint
 */
export function useResponsiveValue<T>(values: Partial<Record<keyof typeof breakpoints, T>>): T | undefined {
  const { currentBreakpoint } = useResponsive();
  
  // Find the best matching value by checking from current breakpoint down
  const breakpointOrder: (keyof typeof breakpoints)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'base'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}