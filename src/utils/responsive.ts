/**
 * Responsive Design System Configuration
 * 
 * This file contains breakpoints, responsive utilities, and design tokens
 * for consistent responsive behavior across the application.
 */

// Chakra UI default breakpoints (mobile-first)
export const breakpoints = {
  base: '0px',    // 0px and up (mobile)
  sm: '480px',    // 480px and up (small mobile)
  md: '768px',    // 768px and up (tablet)
  lg: '992px',    // 992px and up (desktop)
  xl: '1280px',   // 1280px and up (large desktop)
  '2xl': '1536px' // 1536px and up (extra large desktop)
} as const;

// Touch-friendly sizing for mobile devices
export const touchTargets = {
  minimum: '44px',    // Minimum touch target size (iOS/Android guidelines)
  comfortable: '48px', // Comfortable touch target size
  large: '56px'       // Large touch target size
} as const;

// Responsive spacing scale
export const responsiveSpacing = {
  xs: { base: 1, md: 2 },
  sm: { base: 2, md: 3 },
  md: { base: 3, md: 4 },
  lg: { base: 4, md: 6 },
  xl: { base: 6, md: 8 },
  '2xl': { base: 8, md: 12 }
} as const;

// Responsive font sizes
export const responsiveFontSizes = {
  xs: { base: 'xs', md: 'sm' },
  sm: { base: 'sm', md: 'md' },
  md: { base: 'md', md: 'lg' },
  lg: { base: 'lg', md: 'xl' },
  xl: { base: 'xl', md: '2xl' },
  '2xl': { base: '2xl', md: '3xl' },
  '3xl': { base: '3xl', md: '4xl' }
} as const;

// Container max widths for different screen sizes
export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Grid column configurations for different screen sizes
export const gridColumns = {
  cards: {
    base: 1,      // 1 column on mobile
    sm: 1,        // 1 column on small mobile
    md: 2,        // 2 columns on tablet
    lg: 3,        // 3 columns on desktop
    xl: 4         // 4 columns on large desktop
  },
  form: {
    base: 1,      // 1 column on mobile
    md: 2         // 2 columns on tablet and up
  },
  dashboard: {
    base: 1,      // 1 column on mobile
    md: 2,        // 2 columns on tablet
    lg: 3         // 3 columns on desktop
  }
} as const;

// Navigation configurations
export const navigation = {
  mobileBreakpoint: 'lg', // Show mobile nav below lg breakpoint
  sidebarWidth: '280px',
  mobileNavHeight: '60px',
  desktopNavHeight: '70px'
} as const;

// Responsive utilities
export const responsive = {
  // Hide on mobile, show on desktop
  hideOnMobile: { base: 'none', lg: 'block' },
  
  // Show on mobile, hide on desktop
  showOnMobile: { base: 'block', lg: 'none' },
  
  // Flex direction responsive
  stackOnMobile: { base: 'column', md: 'row' },
  
  // Text alignment responsive
  centerOnMobile: { base: 'center', md: 'left' },
  
  // Full width on mobile, auto on desktop
  fullWidthOnMobile: { base: '100%', md: 'auto' },
  
  // Padding responsive
  paddingResponsive: { base: 4, md: 6, lg: 8 },
  
  // Margin responsive
  marginResponsive: { base: 2, md: 4, lg: 6 }
} as const;

// Touch-friendly button configurations
export const touchFriendlyButtons = {
  size: {
    base: 'md',   // Medium size on mobile for better touch targets
    md: 'sm'      // Smaller size on desktop where precision is higher
  },
  padding: {
    base: 4,      // More padding on mobile
    md: 3         // Less padding on desktop
  }
} as const;

// Modal and dialog responsive configurations
export const modalSizes = {
  mobile: {
    maxW: '95vw',
    maxH: '90vh',
    m: 4
  },
  desktop: {
    maxW: 'md',
    maxH: '80vh',
    m: 'auto'
  }
} as const;

// Form field responsive configurations
export const formFieldSizes = {
  input: {
    base: 'md',   // Larger inputs on mobile
    md: 'sm'      // Smaller inputs on desktop
  },
  spacing: {
    base: 4,      // More spacing between fields on mobile
    md: 3         // Less spacing on desktop
  }
} as const;

// Card responsive configurations
export const cardSizes = {
  padding: {
    base: 4,      // More padding on mobile
    md: 6         // Standard padding on desktop
  },
  borderRadius: {
    base: 'md',   // Medium border radius on mobile
    md: 'lg'      // Larger border radius on desktop
  }
} as const;

// Utility functions for responsive design
export const getResponsiveValue = <T>(
  mobileValue: T,
  desktopValue: T,
  tabletValue?: T
) => ({
  base: mobileValue,
  ...(tabletValue && { md: tabletValue }),
  lg: desktopValue
});

export const isMobileBreakpoint = (breakpoint: string) => {
  return ['base', 'sm'].includes(breakpoint);
};

export const isTabletBreakpoint = (breakpoint: string) => {
  return breakpoint === 'md';
};

export const isDesktopBreakpoint = (breakpoint: string) => {
  return ['lg', 'xl', '2xl'].includes(breakpoint);
};

// Media query helpers for use in CSS-in-JS
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  touch: '@media (hover: none) and (pointer: coarse)',
  hover: '@media (hover: hover) and (pointer: fine)'
} as const;

// Responsive image configurations
export const imageResponsive = {
  aspectRatio: {
    square: '1',
    video: '16/9',
    photo: '4/3'
  },
  sizes: {
    thumbnail: { base: '60px', md: '80px' },
    small: { base: '120px', md: '150px' },
    medium: { base: '200px', md: '250px' },
    large: { base: '300px', md: '400px' }
  }
} as const;