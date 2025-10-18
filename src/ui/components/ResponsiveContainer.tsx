import { Container } from '@chakra-ui/react';
import type { ContainerProps } from '@chakra-ui/react';
import { responsiveSpacing } from '../../utils/responsive';

interface ResponsiveContainerProps extends ContainerProps {
  variant?: 'page' | 'section' | 'card' | 'narrow';
  children: React.ReactNode;
}

/**
 * ResponsiveContainer provides consistent spacing and max-widths across different screen sizes
 */
export function ResponsiveContainer({
  variant = 'page',
  children,
  px,
  py,
  maxW,
  ...props
}: ResponsiveContainerProps) {

  const getMaxWidth = () => {
    if (maxW) return maxW;

    switch (variant) {
      case 'narrow':
        return { base: 'full', sm: 'md', md: 'lg' };
      case 'section':
        return { base: 'full', sm: 'xl', md: '4xl' };
      case 'card':
        return { base: 'full', sm: 'md' };
      case 'page':
      default:
        return '7xl';
    }
  };

  const getPadding = () => {
    const basePx = px || responsiveSpacing.md;
    const basePy = py || (variant === 'page' ? responsiveSpacing.lg : responsiveSpacing.md);

    return {
      px: basePx,
      py: basePy
    };
  };

  return (
    <Container
      maxW={getMaxWidth()}
      {...getPadding()}
      {...props}
    >
      {children}
    </Container>
  );
}

/**
 * Page-level container with full width and appropriate spacing
 */
export function PageContainer({ children, ...props }: Omit<ResponsiveContainerProps, 'variant'>) {
  return (
    <ResponsiveContainer variant="page" {...props}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * Section-level container with medium width constraints
 */
export function SectionContainer({ children, ...props }: Omit<ResponsiveContainerProps, 'variant'>) {
  return (
    <ResponsiveContainer variant="section" {...props}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * Card-level container with narrow width for forms and focused content
 */
export function CardContainer({ children, ...props }: Omit<ResponsiveContainerProps, 'variant'>) {
  return (
    <ResponsiveContainer variant="card" {...props}>
      {children}
    </ResponsiveContainer>
  );
}

/**
 * Narrow container for forms and focused content
 */
export function NarrowContainer({ children, ...props }: Omit<ResponsiveContainerProps, 'variant'>) {
  return (
    <ResponsiveContainer variant="narrow" {...props}>
      {children}
    </ResponsiveContainer>
  );
}