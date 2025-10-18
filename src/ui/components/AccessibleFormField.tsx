import { forwardRef } from 'react';
import {
    Box,
    Input,
    Textarea,
    VStack,
    Text,
    type InputProps,
    type TextareaProps,
} from '@chakra-ui/react';

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

interface AccessibleSelectProps extends BaseFormFieldProps {
    type: 'select';
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    id?: string;
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
    
    // Generate unique IDs for accessibility
    const fieldId = (props as any).id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    const responsiveSize = isTouch ? 'lg' : 'md';

    const commonFieldProps = {
        id: fieldId,
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': !!error,
        'aria-required': required,
        size: responsiveSize as any,
        minH: isTouch ? touchTargets.comfortable : undefined,
        fontSize: { base: '16px', md: 'md' }, // Prevent zoom on iOS
        _focus: {
            borderColor: 'blue.500',
            boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
            outline: '2px solid',
            outlineColor: 'blue.500',
            outlineOffset: '2px'
        },
        ...(error && {
            borderColor: 'red.500',
            _focus: {
                borderColor: 'red.500',
                boxShadow: '0 0 0 2px var(--chakra-colors-red-200)',
                outline: '2px solid',
                outlineColor: 'red.500',
                outlineOffset: '2px'
            }
        })
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
                <select
                    ref={ref as React.Ref<HTMLSelectElement>}
                    id={fieldId}
                    aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
                    aria-invalid={!!error}
                    aria-required={required}
                    value={selectProps.value}
                    onChange={selectProps.onChange}
                    name={selectProps.name}
                    style={{
                        padding: isTouch ? '12px' : '8px',
                        borderRadius: '6px',
                        border: error ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                        backgroundColor: 'white',
                        width: '100%',
                        fontSize: '16px'
                    }}
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
                </select>
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
        <Box>
            <VStack align="stretch" gap={2}>
                <label
                    htmlFor={fieldId}
                    className={hideLabel ? 'sr-only' : undefined}
                    style={{
                        fontSize: isTouch ? '16px' : '14px',
                        fontWeight: '500',
                        color: '#2d3748',
                        marginBottom: 0,
                        display: 'block'
                    }}
                >
                    {label}
                    {required && (
                        <span style={{ color: '#e53e3e', marginLeft: '4px' }} aria-label="required">
                            *
                        </span>
                    )}
                </label>

                {renderField()}

                {description && (
                    <Text
                        id={descriptionId}
                        fontSize="sm"
                        color="gray.600"
                        mt={1}
                    >
                        {description}
                    </Text>
                )}

                {error && (
                    <Text
                        id={errorId}
                        fontSize="sm"
                        color="red.600"
                        mt={1}
                        role="alert"
                    >
                        {error}
                    </Text>
                )}
            </VStack>
        </Box>
    );
});

AccessibleFormField.displayName = 'AccessibleFormField';