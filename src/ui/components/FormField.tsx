import React from 'react';
import {
  Box,
  Input,
  Textarea,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';

interface FormFieldProps {
  label?: string;
  error?: string;
  success?: string;
  isRequired?: boolean;
  children: React.ReactElement;
  helperText?: string;
  showValidationIcon?: boolean;
}

export function FormField({
  label,
  error,
  success,
  isRequired = false,
  children,
  helperText,
  showValidationIcon = true,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;

  return (
    <Box w="full">
      {label && (
        <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.700">
          {label}
          {isRequired && (
            <Text as="span" color="red.500" ml={1}>
              *
            </Text>
          )}
        </Text>
      )}

      <Box position="relative">
        {React.cloneElement(children, {
          ...(hasError && { borderColor: 'red.500' }),
          ...(hasSuccess && { borderColor: 'green.500' }),
          ...(!hasError && !hasSuccess && { borderColor: 'gray.300' }),
          ...(showValidationIcon && (hasError || hasSuccess) && { pr: '40px' }),
        })}

        {showValidationIcon && (hasError || hasSuccess) && (
          <Box
            position="absolute"
            right="12px"
            top="50%"
            transform="translateY(-50%)"
            color={hasError ? 'red.500' : 'green.500'}
            fontSize="lg"
          >
            {hasError ? <HiExclamationCircle /> : <HiCheckCircle />}
          </Box>
        )}
      </Box>

      <VStack align="stretch" gap={1} mt={1}>
        {error && (
          <HStack gap={1} align="center">
            <HiExclamationCircle color="red" size="14px" />
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          </HStack>
        )}

        {success && !error && (
          <HStack gap={1} align="center">
            <HiCheckCircle color="green" size="14px" />
            <Text color="green.600" fontSize="sm">
              {success}
            </Text>
          </HStack>
        )}

        {helperText && !error && !success && (
          <Text color="gray.500" fontSize="sm">
            {helperText}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  isRequired?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel';
  helperText?: string;
  maxLength?: number;
  disabled?: boolean;
  autoComplete?: string;
  showValidationIcon?: boolean;
}

export function TextField({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  isRequired = false,
  type = 'text',
  helperText,
  maxLength,
  disabled = false,
  autoComplete,
  showValidationIcon = true,
}: TextFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      success={success}
      isRequired={isRequired}
      helperText={helperText}
      showValidationIcon={showValidationIcon}
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    </FormField>
  );
}

interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  isRequired?: boolean;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  showValidationIcon?: boolean;
}

export function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  isRequired = false,
  helperText,
  maxLength,
  rows = 4,
  disabled = false,
  showValidationIcon = true,
}: TextAreaFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      success={success}
      isRequired={isRequired}
      helperText={helperText}
      showValidationIcon={showValidationIcon}
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        resize="vertical"
      />
    </FormField>
  );
}

interface NumberFieldProps {
  label?: string;
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  isRequired?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValidationIcon?: boolean;
}

export function NumberField({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  isRequired = false,
  helperText,
  min,
  max,
  step = 0.01,
  disabled = false,
  showValidationIcon = true,
}: NumberFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      success={success}
      isRequired={isRequired}
      helperText={helperText}
      showValidationIcon={showValidationIcon}
    >
      <Input
        type="number"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </FormField>
  );
}