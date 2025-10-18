import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputElement,
} from '@chakra-ui/react';
import { MdSearch, MdClear } from 'react-icons/md';

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

export function SearchBar({
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
        onSearch?.(internalValue);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, onChange, onSearch, debounceMs, value]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const showClear = showClearButton && internalValue.length > 0;

  return (
    <Box position="relative" w="full">
      <InputGroup size={size}>
        <Input
          ref={inputRef}
          placeholder={`${placeholder} ${shortcutKey ? `(Ctrl+${shortcutKey.toUpperCase()})` : ''}`}
          value={internalValue}
          onChange={handleInputChange}
          pr={showClear ? "80px" : "40px"}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
        />
        <InputElement placement="right" width={showClear ? "80px" : "40px"}>
          <Box display="flex" alignItems="center" gap={1}>
            {showClear && (
              <Box
                as="button"
                onClick={handleClear}
                p={1}
                borderRadius="sm"
                _hover={{ bg: 'gray.100' }}
                transition="background-color 0.2s"
                aria-label="Clear search"
              >
                <MdClear size={16} />
              </Box>
            )}
            <Box color="gray.400">
              <MdSearch size={16} />
            </Box>
          </Box>
        </InputElement>
      </InputGroup>
      
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
        >
          <Box
            w="4"
            h="4"
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
}