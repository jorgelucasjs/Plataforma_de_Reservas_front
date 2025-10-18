import { forwardRef } from 'react';
import {
    Box,
    Input,
    Textarea,
    Select,
    VStack,
    FormControl,
    FormLabel,
    FormHelperText,
    FormErrorMessage,
    type InputProps,
    type TextareaProps,
    type SelectProps,
} from '@chakra-ui/react';
import { useFormField } from '../../hooks/useAccessibility';
import { useResponsive } from '../../hooks/useResponsive';
import { touchTargets } from '../../utils/responsive';

interface BaseFormFieldProps {
    /** Field label */
    label: string;
    /** Helper text description */
    description?: string;
    /** Error message */
    error?: string;
    /** Whether field is required */
    required?: boolean;
    /** Whether to hide the label visually (still accessible to screen readers) */
    hideLabel?: boolean;
}

interface AccessibleInputProps extends InputProps, BaseFormFieldProps {
    type?: 'input';
}

interface AccessibleTextareaProps extends TextareaProps, BaseFormFieldProps {
    type: 'textarea';
}

interface AccessibleSelectProps extends SelectProps, BaseFormFieldProps {
    type: 'select';
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    placeholder?: string;
}

type AccessibleFormFieldProps =
    | AccessibleInputProps
    | AccessibleTextareaProps
    | AccessibleSelectProps;

/**
 * Accessible form field component with proper labeling, error handling,
 * and responsive sizing
 */
export const AccessibleFormField = forwardRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    AccessibleFormFieldProps
>(({
    label,
    description,
    error,
    required = false,
    hideLabel = false,
    type = 'input',
    ...props
}, ref) => {
    const { isTouch } = useResponsive();
    const {
        fieldProps,
        labelProps,
        descriptionProps,
        errorProps
    } = useFormField(props.id, {
        label,
        description,
        error,
        required
    });

    const responsiveSize = isTouch ? 'lg' : 'md';

    const commonFieldProps = {
        ...fieldProps,
        size: responsiveSize,
        minH: isTouch ? touchTargets.comfortable : undefined,
        fontSize: { base: '16px', md: 'md' }, // Prevent zoom on iOS
        _focus: {
            borderColor: 'blue.500',
            boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
            outline: '2px solid',
            outlineColor: 'blue.500',
            outlineOffset: '2px'
        },
        _invalid: {
            borderColor: 'red.500',
            boxShadow: '0 0 0 2px var(--chakra-colors-red-200)'
        }
    };

    const renderField = () => {
        if (type === 'textarea') {
            const textareaProps = props as AccessibleTextareaProps;
            return (
                <Textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    {...commonFieldProps}
                    {...textareaProps}
                />
            );
        }

        if (type === 'select') {
            const selectProps = props as AccessibleSelectProps;
            return (
                <Select
                    ref={ref as React.Ref<HTMLSelectElement>}
                    {...commonFieldProps}
                    {...selectProps}
                >
                    {selectProps.placeholder && (
                        <option value="" disabled>
                            {selectProps.placeholder}
                        </option>
                    )}
                    {selectProps.options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </Select>
            );
        }

        const inputProps = props as AccessibleInputProps;
        return (
            <Input
                ref={ref as React.Ref<HTMLInputElement>}
                {...commonFieldProps}
                {...inputProps}
            />
        );
    };

    return (
        <FormControl isInvalid={!!error} isRequired={required}>
            <VStack align="stretch" gap={2}>
                <FormLabel
                    {...labelProps}
                    className={hideLabel ? 'sr-only' : undefined}
                    fontSize={isTouch ? 'md' : 'sm'}
                    fontWeight="medium"
                    color="gray.700"
                    mb={0}
                >
                    {label}
                    {required && (
                        <Box as="span" color="red.500" ml={1} aria-label="required">
                            *
                        </Box>
                    )}
                </FormLabel>

                {renderField()}

                {description && descriptionProps && (
                    <FormHelperText
                        {...descriptionProps}
                        fontSize="sm"
                        color="gray.600"
                        mt={1}
                    >
                        {description}
                    </FormHelperText>
                )}

                {error && errorProps && (
                    <FormErrorMessage
                        {...errorProps}
                        fontSize="sm"
                        color="red.600"
                        mt={1}
                    >
                        {error}
                    </FormErrorMessage>
                )}
            </VStack>
        </FormControl>
    );
});

AccessibleFormField.displayName = 'AccessibleFormField';