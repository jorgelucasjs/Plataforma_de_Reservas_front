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
  message: 'Formato de NIF inválido ou dígito de verificação incorreto',
});

const emailValidation = z.string().email('Formato de email inválido').refine(validateEmail, {
  message: 'Formato de email inválido',
});

const passwordValidation = z.string()
  .min(8, 'Palavra-passe deve ter pelo menos 8 caracteres')
  .refine(validatePassword, {
    message: 'Palavra-passe deve conter pelo menos uma letra e um número',
  });

// Authentication schemas
const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email ou NIF é obrigatório')
    .refine((value) => {
      // Check if it's an email or NIF
      return validateEmail(value) || validateNIF(value);
    }, {
      message: 'Deve ser um email ou NIF válido',
    }),
  password: z.string().min(1, 'Palavra-passe é obrigatória'),
});

const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome completo deve ter pelo menos 2 caracteres')
    .max(100, 'Nome completo não pode exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome completo só pode conter letras e espaços'),
  nif: nifValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: z.string(),
  userType: z.enum(['client', 'provider'], {
    message: 'Tipo de utilizador deve ser cliente ou prestador',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Palavras-passe não coincidem',
  path: ['confirmPassword'],
});

// Service management schemas
const serviceSchema = z.object({
  name: z.string()
    .min(3, 'Nome do serviço deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do serviço não pode exceder 100 caracteres')
    .trim(),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .trim(),
  price: z.number()
    .positive('Preço deve ser maior que 0')
    .max(10000, 'Preço não pode exceder €10.000')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais'),
});

// User profile schemas
const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome completo deve ter pelo menos 2 caracteres')
    .max(100, 'Nome completo não pode exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome completo só pode conter letras e espaços'),
  email: emailValidation,
});

// Search and filter schemas
const serviceFiltersSchema = z.object({
  search: z.string().optional(),
  minPrice: z.number().min(0, 'Preço mínimo não pode ser negativo').optional(),
  maxPrice: z.number().min(0, 'Preço máximo não pode ser negativo').optional(),
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
  message: 'Preço mínimo não pode ser maior que o preço máximo',
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
  message: 'Data de início não pode ser posterior à data de fim',
  path: ['endDate'],
}).refine((data) => {
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount <= data.maxAmount;
  }
  return true;
}, {
  message: 'Valor mínimo não pode ser maior que o valor máximo',
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