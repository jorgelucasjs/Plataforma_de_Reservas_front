/**
 * Consistent Styling System
 * 
 * Provides a comprehensive design system with consistent spacing, colors,
 * typography, and component styles across the entire application.
 */

import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

// Design tokens
export const designTokens = {
  // Spacing scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Border radius scale
  radii: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadow scale
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Typography scale
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Font weights
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Z-index scale
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Transition durations
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Component style configurations
export const componentStyles = {
  // Button styles
  Button: defineStyleConfig({
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
      transition: 'all 200ms ease',
      _focus: {
        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    sizes: {
      sm: {
        h: '32px',
        minW: '32px',
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: '40px',
        minW: '40px',
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: 'lg',
        px: 6,
      },
    },
    variants: {
      solid: {
        bg: 'blue.500',
        color: 'white',
        _hover: {
          bg: 'blue.600',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: 'blue.700',
          transform: 'translateY(0)',
        },
      },
      outline: {
        border: '2px solid',
        borderColor: 'blue.500',
        color: 'blue.500',
        _hover: {
          bg: 'blue.50',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: 'blue.100',
          transform: 'translateY(0)',
        },
      },
      ghost: {
        color: 'blue.500',
        _hover: {
          bg: 'blue.50',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: 'blue.100',
          transform: 'translateY(0)',
        },
      },
    },
    defaultProps: {
      size: 'md',
      variant: 'solid',
    },
  }),

  // Card styles
  Card: defineStyleConfig({
    baseStyle: {
      bg: 'white',
      borderRadius: 'xl',
      boxShadow: 'sm',
      border: '1px solid',
      borderColor: 'gray.200',
      transition: 'all 200ms ease',
      _hover: {
        boxShadow: 'md',
        transform: 'translateY(-2px)',
      },
    },
    variants: {
      elevated: {
        boxShadow: 'lg',
        _hover: {
          boxShadow: 'xl',
          transform: 'translateY(-4px)',
        },
      },
      outline: {
        boxShadow: 'none',
        borderWidth: '2px',
      },
      filled: {
        bg: 'gray.50',
        borderColor: 'gray.300',
      },
    },
    sizes: {
      sm: {
        p: 4,
      },
      md: {
        p: 6,
      },
      lg: {
        p: 8,
      },
    },
    defaultProps: {
      variant: 'elevated',
      size: 'md',
    },
  }),

  // Input styles
  Input: defineStyleConfig({
    baseStyle: {
      field: {
        borderRadius: 'lg',
        border: '2px solid',
        borderColor: 'gray.200',
        transition: 'all 200ms ease',
        _focus: {
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)',
        },
        _invalid: {
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px rgba(245, 101, 101, 0.6)',
        },
        _hover: {
          borderColor: 'gray.300',
        },
      },
    },
    sizes: {
      sm: {
        field: {
          h: '32px',
          px: 3,
          fontSize: 'sm',
        },
      },
      md: {
        field: {
          h: '40px',
          px: 4,
          fontSize: 'md',
        },
      },
      lg: {
        field: {
          h: '48px',
          px: 4,
          fontSize: 'lg',
        },
      },
    },
    defaultProps: {
      size: 'md',
    },
  }),

  // Modal styles
  Modal: defineStyleConfig({
    baseStyle: {
      dialog: {
        borderRadius: '2xl',
        boxShadow: '2xl',
        mx: 4,
      },
      overlay: {
        bg: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      },
      header: {
        fontSize: 'xl',
        fontWeight: 'bold',
        pb: 4,
      },
      body: {
        py: 0,
      },
      footer: {
        pt: 4,
      },
    },
  }),

  // Alert styles
  Alert: defineStyleConfig({
    baseStyle: {
      container: {
        borderRadius: 'lg',
        border: '1px solid',
        p: 4,
      },
    },
    variants: {
      solid: {
        container: {
          borderColor: 'transparent',
        },
      },
      leftAccent: {
        container: {
          borderLeftWidth: '4px',
          bg: 'white',
        },
      },
      topAccent: {
        container: {
          borderTopWidth: '4px',
          bg: 'white',
        },
      },
    },
  }),
};

// Utility classes for consistent styling
export const utilityStyles = {
  // Layout utilities
  container: {
    maxW: '1200px',
    mx: 'auto',
    px: { base: 4, md: 6, lg: 8 },
  },

  // Flexbox utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Grid utilities
  gridResponsive: {
    display: 'grid',
    gridTemplateColumns: {
      base: '1fr',
      md: 'repeat(2, 1fr)',
      lg: 'repeat(3, 1fr)',
    },
    gap: 6,
  },

  // Text utilities
  textTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  textClamp: (lines: number) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }),

  // Interactive utilities
  clickable: {
    cursor: 'pointer',
    transition: 'all 200ms ease',
    _hover: {
      transform: 'translateY(-1px)',
    },
    _active: {
      transform: 'translateY(0)',
    },
  },

  // Focus utilities
  focusRing: {
    _focus: {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    },
  },

  // Animation utilities
  fadeIn: {
    animation: 'fadeIn 0.3s ease-out',
  },

  slideUp: {
    animation: 'slideUp 0.4s ease-out',
  },

  // Responsive utilities
  hideOnMobile: {
    display: { base: 'none', md: 'block' },
  },

  showOnMobile: {
    display: { base: 'block', md: 'none' },
  },
};

// Color palette extensions
export const colorPalette = {
  // Brand colors
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em',    // 1280px
  '2xl': '96em', // 1536px
};

// Animation keyframes
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateY(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  slideLeft: `
    @keyframes slideLeft {
      from { 
        opacity: 0; 
        transform: translateX(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
  `,
  slideRight: `
    @keyframes slideRight {
      from { 
        opacity: 0; 
        transform: translateX(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { 
        opacity: 0; 
        transform: scale(0.9); 
      }
      to { 
        opacity: 1; 
        transform: scale(1); 
      }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { 
        opacity: 1; 
      }
      50% { 
        opacity: 0.5; 
      }
    }
  `,
  bounce: `
    @keyframes bounce {
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
    }
  `,
};

// Theme configuration
export const themeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  colors: {
    ...colorPalette,
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  fontSizes: designTokens.fontSizes,
  fontWeights: designTokens.fontWeights,
  lineHeights: designTokens.lineHeights,
  space: designTokens.spacing,
  radii: designTokens.radii,
  shadows: designTokens.shadows,
  zIndices: designTokens.zIndices,
  breakpoints,
  components: componentStyles,
};

// Export utility functions
export const createResponsiveValue = (values: Record<string, any>) => values;

export const createTransition = (
  property: string = 'all',
  duration: string = designTokens.transitions.normal,
  easing: string = designTokens.easings.easeOut
) => `${property} ${duration} ${easing}`;

export const createBoxShadow = (
  x: number = 0,
  y: number = 4,
  blur: number = 6,
  spread: number = 0,
  color: string = 'rgba(0, 0, 0, 0.1)'
) => `${x}px ${y}px ${blur}px ${spread}px ${color}`;

export const createGradient = (
  direction: string = 'to right',
  ...colors: string[]
) => `linear-gradient(${direction}, ${colors.join(', ')})`;

// Export everything
export default {
  designTokens,
  componentStyles,
  utilityStyles,
  colorPalette,
  breakpoints,
  animations,
  themeConfig,
  createResponsiveValue,
  createTransition,
  createBoxShadow,
  createGradient,
};