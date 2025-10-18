import { useState, useEffect, useRef, memo } from 'react';
import {
  Box,
  Input,
} from '@chakra-ui/react';
import { MdSearch, MdClear } from 'react-icons/md';
import { useResponsive } from '../../hooks/useResponsive';
import { touchTargets } from '../../utils/responsive';
import { useDebounce, usePerformanceMeasure } from '../../hooks/usePerformance';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shortcutKey?: string;
}

export const SearchBar = memo(function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  showClearButton = true,
  size = 'md',
  isLoading = false,
  shortcutKey = 'k'
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile, isTouch } = useResponsive();
  const { measureFunction } = usePerformanceMeasure();

  // Use performance-optimized debounce
  const debouncedValue = useDebounce(internalValue, debounceMs, 'search_input');

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, value, onChange, onSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search with Ctrl/Cmd + shortcutKey
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === shortcutKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // Clear search with Escape
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        if (internalValue) {
          handleClear();
        } else {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [internalValue, shortcutKey]);

  const handleInputChange = measureFunction((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, 'search_input_change');

  const handleClear = measureFunction(() => {
    setInternalValue('');
    onChange('');
    onSearch?.('');
    inputRef.current?.focus();
  }, 'search_clear');

  const showClear = showClearButton && internalValue.length > 0;
  const responsiveSize = isMobile || isTouch ? 'lg' : size;
  const iconSize = isMobile ? 20 : 16;

  return (
    <Box position="relative" w="full">
      <Input
        ref={inputRef}
        placeholder={isMobile ? placeholder : `${placeholder} ${shortcutKey ? `(Ctrl+${shortcutKey.toUpperCase()})` : ''}`}
        value={internalValue}
        onChange={handleInputChange}
        pr={showClear ? (isMobile ? "100px" : "80px") : (isMobile ? "60px" : "40px")}
        minH={isTouch ? touchTargets.comfortable : 'auto'}
        fontSize={{ base: '16px', md: 'md' }} // Prevent zoom on iOS
        size={responsiveSize}
        _focus={{
          borderColor: 'blue.500',
          boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        _placeholder={{
          color: 'gray.400',
          fontSize: { base: 'sm', md: 'md' }
        }}
      />

      {/* Right side icons */}
      <Box
        position="absolute"
        right="8px"
        top="50%"
        transform="translateY(-50%)"
        display="flex"
        alignItems="center"
        gap={1}
        zIndex={2}
      >
        {showClear && (
          <Box
            as="button"
            onClick={handleClear}
            p={isTouch ? 2 : 1}
            borderRadius="sm"
            _hover={{ bg: 'gray.100' }}
            _focus={{
              bg: 'gray.100',
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'blue.500',
              outlineOffset: '1px'
            }}
            _active={{
              bg: 'gray.200',
              transform: 'scale(0.95)'
            }}
            transition="all 0.2s"
            aria-label="Clear search"
            minW={isTouch ? touchTargets.minimum : 'auto'}
            minH={isTouch ? touchTargets.minimum : 'auto'}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <MdClear size={iconSize} />
          </Box>
        )}
        <Box
          color="gray.400"
          p={isTouch ? 1 : 0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <MdSearch size={iconSize} />
        </Box>
      </Box>

      {isLoading && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="whiteAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
          zIndex={3}
        >
          <Box
            w={isMobile ? "6" : "4"}
            h={isMobile ? "6" : "4"}
            border="2px solid"
            borderColor="blue.200"
            borderTopColor="blue.500"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
        </Box>
      )}
    </Box>
  );
});