import { Box, SimpleGrid, SimpleGridProps } from '@chakra-ui/react';
import { useResponsive } from '../../hooks/useResponsive';
import { gridColumns } from '../../utils/responsive';

interface ResponsiveGridProps extends Omit<SimpleGridProps, 'columns'> {
  type?: 'cards' | 'form' | 'dashboard';
  minChildWidth?: string;
  children: React.ReactNode;
}

/**
 * ResponsiveGrid component that automatically adjusts columns based on screen size
 * and provides consistent spacing and layout patterns.
 */
export function ResponsiveGrid({
  type = 'cards',
  minChildWidth,
  children,
  gap = { base: 4, md: 6 },
  ...props
}: ResponsiveGridProps) {
  const { isMobile } = useResponsive();

  // Use minChildWidth if provided, otherwise use predefined grid columns
  const columns = minChildWidth ? undefined : gridColumns[type];

  return (
    <SimpleGrid
      columns={columns}
      minChildWidth={minChildWidth}
      gap={gap}
      w="full"
      {...props}
    >
      {children}
    </SimpleGrid>
  );
}

/**
 * Responsive container for cards with consistent spacing
 */
export function CardGrid({ children, ...props }: Omit<ResponsiveGridProps, 'type'>) {
  return (
    <ResponsiveGrid type="cards" {...props}>
      {children}
    </ResponsiveGrid>
  );
}

/**
 * Responsive container for form fields
 */
export function FormGrid({ children, ...props }: Omit<ResponsiveGridProps, 'type'>) {
  return (
    <ResponsiveGrid type="form" gap={{ base: 4, md: 6 }} {...props}>
      {children}
    </ResponsiveGrid>
  );
}

/**
 * Responsive container for dashboard widgets
 */
export function DashboardGrid({ children, ...props }: Omit<ResponsiveGridProps, 'type'>) {
  return (
    <ResponsiveGrid type="dashboard" {...props}>
      {children}
    </ResponsiveGrid>
  );
}

/**
 * Auto-sizing grid that adjusts based on content width
 */
export function AutoGrid({ 
  minChildWidth = '280px', 
  children, 
  ...props 
}: ResponsiveGridProps) {
  return (
    <ResponsiveGrid minChildWidth={minChildWidth} {...props}>
      {children}
    </ResponsiveGrid>
  );
}