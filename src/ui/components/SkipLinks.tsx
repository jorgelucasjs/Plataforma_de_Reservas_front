import { Box, Link } from '@chakra-ui/react';
import { useSkipLinks } from '../../hooks/useAccessibility';

/**
 * Skip links component for keyboard navigation accessibility
 * Allows users to quickly jump to main content areas
 */
export function SkipLinks() {
  const { skipToMain, skipToNavigation } = useSkipLinks();

  return (
    <Box>
      <Link
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        position="absolute"
        top="-40px"
        left="6px"
        bg="gray.900"
        color="white"
        px={3}
        py={2}
        borderRadius="md"
        fontSize="sm"
        fontWeight="medium"
        textDecoration="none"
        zIndex={9999}
        _focus={{
          top: '6px',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        _hover={{
          bg: 'gray.800',
          textDecoration: 'none'
        }}
      >
        Skip to main content
      </Link>
      <Link
        href="#navigation"
        onClick={(e) => {
          e.preventDefault();
          skipToNavigation();
        }}
        position="absolute"
        top="-40px"
        left="140px" // Position next to first skip link
        bg="gray.900"
        color="white"
        px={3}
        py={2}
        borderRadius="md"
        fontSize="sm"
        fontWeight="medium"
        textDecoration="none"
        zIndex={9999}
        _focus={{
          top: '6px',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        _hover={{
          bg: 'gray.800',
          textDecoration: 'none'
        }}
      >
        Skip to navigation
      </Link>
    </Box>
  );
}