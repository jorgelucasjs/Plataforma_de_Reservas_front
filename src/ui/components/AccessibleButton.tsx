import { forwardRef } from 'react';
import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { useResponsive } from '../../hooks/useResponsive';
import { touchTargets } from '../../utils/responsive';
import { createButtonAriaAttributes } from '../../utils/accessibility';

interface AccessibleButtonProps extends ButtonProps {
  /** Accessible label for screen readers (overrides children for screen readers) */
  ariaLabel?: string;
  /** ID of element that describes this button */
  describedBy?: string;
  /** Whether button controls expandable content */
  expanded?: boolean;
  /** ID of element controlled by this button */
  controls?: string;
  /** Whether button is in pressed state (for toggle buttons) */
  pressed?: boolean;
  /** Loading announcement for screen readers */
  loadingText?: string;
}

/**
 * Accessible button component with enhanced keyboard navigation,
 * touch-friendly sizing, and proper ARIA attributes
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      ariaLabel,
      describedBy,
      expanded,
      controls,
      pressed,
      loadingText = 'Loading',
      children,
      size,
      loading,
      disabled,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { isTouch } = useResponsive();

    // Generate ARIA attributes
    const ariaAttributes = createButtonAriaAttributes(
      ariaLabel,
      pressed,
      controls,
      expanded
    );

    // Determine responsive size
    const responsiveSize = size || (isTouch ? 'md' : 'sm');

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle space key activation
      if (event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }

      onKeyDown?.(event);
    };

    return (
      <Button
        ref={ref}
        size={responsiveSize}
        minH={isTouch ? touchTargets.comfortable : undefined}
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        aria-describedby={describedBy}
        _focus={{
          boxShadow: 'outline',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        _focusVisible={{
          boxShadow: 'outline',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        _active={{
          transform: 'scale(0.98)'
        }}
        transition="all 0.2s ease-in-out"
        {...ariaAttributes}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';