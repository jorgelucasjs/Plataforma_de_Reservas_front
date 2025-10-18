import { z } from 'zod';

// Custom validation functions
const validateNIF = (nif: string): boolean => {
  // Portuguese NIF validation
  // Remove any spaces or special characters
  const cleanNIF = nif.replace(/\s/g, '');
  
  // Check if it's 9 digits
  if (!/^\d{9}$/.test(cleanNIF)) {
    return false;
  }
  
  // Calculate check digit
  const digits = cleanNIF.split('').map(Number);
  const checkDigit = digits[8];
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }
  
  const remainder = sum % 11;
  const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return checkDigit === expectedCheckDigit;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters, with at least one letter and one number
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

// Custom Zod refinements
const nifValidation = z.string().refine(validateNIF, {
  message: 'Invalid NIF format or check digit',
});

const emailValidation = z.string().email('Invalid email format').refine(validateEmail, {
  message: 'Invalid email format',
});

const passwordValidation = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .refine(validatePassword, {
    message: 'Password must contain at least one letter and one number',
  });

// Authentication schemas
const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or NIF is required')
    .refine((value) => {
      // Check if it's an email or NIF
      return validateEmail(value) || validateNIF(value);
    }, {
      message: 'Must be a valid email or NIF',
    }),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Full name can only contain letters and spaces'),
  nif: nifValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: z.string(),
  userType: z.enum(['client', 'provider'], {
    message: 'User type must be either client or provider',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Service management schemas
const serviceSchema = z.object({
  name: z.string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must not exceed 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  price: z.number()
    .positive('Price must be greater than 0')
    .max(10000, 'Price must not exceed €10,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
});

// User profile schemas
const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Full name can only contain letters and spaces'),
  email: emailValidation,
});

// Search and filter schemas
const serviceFiltersSchema = z.object({
  search: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['maxPrice'],
});

// Transaction filter schemas
const transactionFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  status: z.enum(['confirmed', 'cancelled']).optional(),
  sortBy: z.enum(['date', 'amount', 'serviceName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date cannot be after end date',
  path: ['endDate'],
}).refine((data) => {
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount <= data.maxAmount;
  }
  return true;
}, {
  message: 'Minimum amount cannot be greater than maximum amount',
  path: ['maxAmount'],
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ServiceFiltersData = z.infer<typeof serviceFiltersSchema>;
export type TransactionFiltersData = z.infer<typeof transactionFiltersSchema>;

// Validation service class
export class ValidationService {
  // Validate login form
  static validateLogin(data: unknown): { success: true; data: LoginFormData } | { success: false; errors: Record<string, string> } {
    const result = loginSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Validate registration form
  static validateRegister(data: unknown): { success: true; data: RegisterFormData } | { success: false; errors: Record<string, string> } {
    const result = registerSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Validate service form
  static validateService(data: unknown): { success: true; data: ServiceFormData } | { success: false; errors: Record<string, string> } {
    const result = serviceSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Validate profile update form
  static validateProfileUpdate(data: unknown): { success: true; data: ProfileUpdateFormData } | { success: false; errors: Record<string, string> } {
    const result = profileUpdateSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Validate service filters
  static validateServiceFilters(data: unknown): { success: true; data: ServiceFiltersData } | { success: false; errors: Record<string, string> } {
    const result = serviceFiltersSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Validate transaction filters
  static validateTransactionFilters(data: unknown): { success: true; data: TransactionFiltersData } | { success: false; errors: Record<string, string> } {
    const result = transactionFiltersSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    
    return { success: false, errors };
  }

  // Individual field validators
  static validateNIF(nif: string): boolean {
    return validateNIF(nif);
  }

  static validateEmail(email: string): boolean {
    return validateEmail(email);
  }

  static validatePassword(password: string): boolean {
    return validatePassword(password);
  }

  // Business logic validators
  static validateBookingAmount(amount: number, userBalance: number): { valid: boolean; message?: string } {
    if (amount <= 0) {
      return { valid: false, message: 'Booking amount must be greater than 0' };
    }
    
    if (amount > userBalance) {
      const shortfall = amount - userBalance;
      return { 
        valid: false, 
        message: `Insufficient balance. You need €${shortfall.toFixed(2)} more to complete this booking.` 
      };
    }
    
    return { valid: true };
  }

  static validateServicePrice(price: number): { valid: boolean; message?: string } {
    if (price <= 0) {
      return { valid: false, message: 'Service price must be greater than 0' };
    }
    
    if (price > 10000) {
      return { valid: false, message: 'Service price cannot exceed €10,000' };
    }
    
    // Check for more than 2 decimal places
    if (Math.round(price * 100) !== price * 100) {
      return { valid: false, message: 'Price can have at most 2 decimal places' };
    }
    
    return { valid: true };
  }

  // Real-time field validation
  static validateFieldRealTime(fieldName: string, value: any, formData?: any): { valid: boolean; message?: string } {
    switch (fieldName) {
      case 'email':
        if (!value) return { valid: true }; // Let required validation handle empty values
        return { valid: this.validateEmail(value), message: 'Please enter a valid email address' };
      
      case 'nif':
        if (!value) return { valid: true };
        return { valid: this.validateNIF(value), message: 'Please enter a valid NIF' };
      
      case 'password':
        if (!value) return { valid: true };
        return { valid: this.validatePassword(value), message: 'Password must be at least 8 characters with letters and numbers' };
      
      case 'confirmPassword':
        if (!value || !formData?.password) return { valid: true };
        return { valid: value === formData.password, message: 'Passwords do not match' };
      
      case 'fullName':
        if (!value) return { valid: true };
        if (value.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
        if (value.length > 100) return { valid: false, message: 'Name must not exceed 100 characters' };
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return { valid: false, message: 'Name can only contain letters and spaces' };
        return { valid: true };
      
      case 'serviceName':
      case 'name':
        if (!value) return { valid: true };
        if (value.length < 3) return { valid: false, message: 'Service name must be at least 3 characters' };
        if (value.length > 100) return { valid: false, message: 'Service name must not exceed 100 characters' };
        return { valid: true };
      
      case 'description':
        if (!value) return { valid: true };
        if (value.length < 10) return { valid: false, message: 'Description must be at least 10 characters' };
        if (value.length > 500) return { valid: false, message: 'Description must not exceed 500 characters' };
        return { valid: true };
      
      case 'price':
        if (value === null || value === undefined || value === '') return { valid: true };
        const priceValidation = this.validateServicePrice(Number(value));
        return priceValidation;
      
      default:
        return { valid: true };
    }
  }

  // Enhanced form validation with detailed error messages
  static validateFormField(fieldName: string, value: any, isRequired = false, formData?: any): string | null {
    // Check required validation first
    if (isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${this.formatFieldName(fieldName)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    const validation = this.validateFieldRealTime(fieldName, value, formData);
    return validation.valid ? null : validation.message || 'Invalid value';
  }

  // Helper to format field names for display
  static formatFieldName(fieldName: string): string {
    const fieldNameMap: Record<string, string> = {
      fullName: 'Full Name',
      confirmPassword: 'Confirm Password',
      userType: 'User Type',
      serviceName: 'Service Name',
      minPrice: 'Minimum Price',
      maxPrice: 'Maximum Price',
      startDate: 'Start Date',
      endDate: 'End Date',
      minAmount: 'Minimum Amount',
      maxAmount: 'Maximum Amount',
    };

    return fieldNameMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  // Validate multiple fields at once
  static validateMultipleFields(
    fields: Array<{ name: string; value: any; required?: boolean }>,
    formData?: any
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    fields.forEach(({ name, value, required = false }) => {
      const error = this.validateFormField(name, value, required, formData);
      if (error) {
        errors[name] = error;
      }
    });

    return errors;
  }
}

// Export individual schemas for direct use
export {
  loginSchema,
  registerSchema,
  serviceSchema,
  profileUpdateSchema,
  serviceFiltersSchema,
  transactionFiltersSchema,
};