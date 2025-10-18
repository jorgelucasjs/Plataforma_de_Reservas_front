import { useState, useCallback } from 'react';
import { ValidationService } from '../services/validationService';

export interface ValidationRule<T = any> {
  validator: (value: T, formData?: any) => boolean | string;
  message?: string;
  trigger?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface FieldConfig<T = any> {
  initialValue: T;
  rules?: ValidationRule<T>[];
  required?: boolean;
  requiredMessage?: string;
}

export interface FormConfig {
  [key: string]: FieldConfig;
}

export interface FormState {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseFormValidationReturn<T extends FormState> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T, trigger?: 'onChange' | 'onBlur' | 'onSubmit') => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export function useFormValidation<T extends FormState>(
  config: FormConfig
): UseFormValidationReturn<T> {
  // Initialize form state
  const initialValues = Object.keys(config).reduce((acc, key) => ({
    ...acc,
    [key]: config[key].initialValue,
  }), {}) as T;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Set individual field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    } as T));
  }, []);

  // Set individual field error
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Clear individual field error
  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Set field as touched
  const setTouched = useCallback((field: keyof T, touchedValue = true) => {
    setTouchedState(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  // Validate individual field
  const validateField = useCallback(async (
    field: keyof T,
    trigger: 'onChange' | 'onBlur' | 'onSubmit' = 'onSubmit'
  ): Promise<boolean> => {
    const fieldConfig = config[field as string];
    if (!fieldConfig) return true;

    const value = values[field];

    // Check required validation
    if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      const message = fieldConfig.requiredMessage || `${String(field)} is required`;
      setError(field, message);
      return false;
    }

    // Run custom validation rules
    if (fieldConfig.rules) {
      for (const rule of fieldConfig.rules) {
        // Skip rule if trigger doesn't match
        if (rule.trigger && rule.trigger !== trigger) continue;

        const result = rule.validator(value, values);

        if (result === false || typeof result === 'string') {
          const message = typeof result === 'string' ? result : rule.message || `${String(field)} is invalid`;
          setError(field, message);
          return false;
        }
      }
    }

    // Clear error if validation passes
    clearError(field);
    return true;
  }, [values, config, setError, clearError]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(config);
    const validationResults = await Promise.all(
      fieldNames.map(field => validateField(field as keyof T, 'onSubmit'))
    );

    return validationResults.every(result => result);
  }, [config, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);

      try {
        const isFormValid = await validateForm();

        if (isFormValid) {
          await onSubmit(values);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    clearAllErrors,
    setTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    setSubmitting,
  };
}

// Predefined validation rules
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    validator: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      return Boolean(value);
    },
    message: message || 'Este campo é obrigatório',
    trigger: 'onBlur',
  }),

  email: (message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Let required rule handle empty values
      return ValidationService.validateEmail(value);
    },
    message: message || 'Por favor, insira um endereço de email válido',
    trigger: 'onBlur',
  }),

  nif: (message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Let required rule handle empty values
      return ValidationService.validateNIF(value);
    },
    message: message || 'Por favor, insira um NIF válido',
    trigger: 'onBlur',
  }),

  password: (message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Let required rule handle empty values
      return ValidationService.validatePassword(value);
    },
    message: message || 'Palavra-passe deve ter pelo menos 8 caracteres',
    trigger: 'onBlur',
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Let required rule handle empty values
      return value.length >= min;
    },
    message: message || `Deve ter pelo menos ${min} caracteres`,
    trigger: 'onBlur',
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true; // Let required rule handle empty values
      return value.length <= max;
    },
    message: message || `Não pode exceder ${max} caracteres`,
    trigger: 'onChange',
  }),

  minValue: (min: number, message?: string): ValidationRule => ({
    validator: (value: number) => {
      if (value === null || value === undefined || isNaN(value)) return true;
      return value >= min;
    },
    message: message || `Deve ser pelo menos ${min}`,
    trigger: 'onBlur',
  }),

  maxValue: (max: number, message?: string): ValidationRule => ({
    validator: (value: number) => {
      if (value === null || value === undefined || isNaN(value)) return true;
      return value <= max;
    },
    message: message || `Não pode exceder ${max}`,
    trigger: 'onBlur',
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    validator: (value: number) => {
      if (value === null || value === undefined || isNaN(value)) return true;
      return value > 0;
    },
    message: message || 'Deve ser um número positivo',
    trigger: 'onBlur',
  }),

  matchField: (fieldName: string, message?: string): ValidationRule => ({
    validator: (value: string, formData: any) => {
      if (!value || !formData) return true;
      return value === formData[fieldName];
    },
    message: message || 'Os campos não coincidem',
    trigger: 'onBlur',
  }),

  custom: (
    validator: (value: any, formData?: any) => boolean | string,
    message?: string,
    trigger?: 'onChange' | 'onBlur' | 'onSubmit'
  ): ValidationRule => ({
    validator,
    message: message || 'Invalid value',
    trigger: trigger || 'onBlur',
  }),
};