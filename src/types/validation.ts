// Validation schema types and interfaces

import { z } from 'zod';

// Validation schema types
export type LoginSchema = z.ZodType<{
  identifier: string;
  password: string;
}>;

export type RegisterSchema = z.ZodType<{
  fullName: string;
  nif: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'client' | 'provider';
}>;

export type ServiceSchema = z.ZodType<{
  name: string;
  description: string;
  price: number;
}>;

export type ProfileSchema = z.ZodType<{
  fullName: string;
  email: string;
}>;

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

// Custom validation rules
export interface ValidationRule {
  name: string;
  message: string;
  validate: (value: any) => boolean;
}

// Validation configuration
export interface ValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
}