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
      return { valid: false, message: 'Insufficient balance for this booking' };
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