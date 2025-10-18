import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  VStack,
  Heading,
  Button,
  Text,
  Link,
  HStack,
} from '@chakra-ui/react';
import { type RegisterFormData } from '../../services/validationService';
import { ServerValidationService } from '../../services/serverValidationService';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation, validationRules } from '../../hooks/useFormValidation';
import { TextField, FormField } from '../components/FormField';
import { ValidationErrorDisplay } from '../components/ValidationErrorDisplay';

export function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const form = useFormValidation<RegisterFormData>({
    fullName: {
      initialValue: '',
      required: true,
      requiredMessage: 'Full name is required',
      rules: [
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must not exceed 100 characters'),
        validationRules.custom(
          (value: string) => {
            if (!value) return true;
            return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
          },
          'Name can only contain letters and spaces',
          'onBlur'
        ),
      ],
    },
    nif: {
      initialValue: '',
      required: true,
      requiredMessage: 'NIF is required',
      rules: [validationRules.nif()],
    },
    email: {
      initialValue: '',
      required: true,
      requiredMessage: 'Email is required',
      rules: [validationRules.email()],
    },
    password: {
      initialValue: '',
      required: true,
      requiredMessage: 'Password is required',
      rules: [validationRules.password()],
    },
    confirmPassword: {
      initialValue: '',
      required: true,
      requiredMessage: 'Please confirm your password',
      rules: [validationRules.matchField('password', 'Passwords do not match')],
    },
    userType: {
      initialValue: 'client' as 'client' | 'provider',
      required: true,
      requiredMessage: 'Please select an account type',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    setServerErrors({});
    setGeneralError('');

    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      // Handle server validation errors
      if (ServerValidationService.isValidationError(err)) {
        const { fieldErrors, generalError } = ServerValidationService.handleServerValidationError(err);
        setServerErrors(fieldErrors);
        if (generalError) {
          setGeneralError(generalError);
        }
      } else {
        // Handle other errors
        const errorMessage = ServerValidationService.getUserFriendlyErrorMessage(err);
        setGeneralError(errorMessage);
      }
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg" textAlign="center" color="gray.700">
        Create Account
      </Heading>

      {/* Display server validation errors */}
      <ValidationErrorDisplay
        errors={serverErrors}
        generalError={generalError || error || undefined}
        title="Please fix the following issues:"
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <TextField
            label="Full Name"
            placeholder="Enter your full name"
            value={form.values.fullName}
            onChange={(value) => {
              form.setValue('fullName', value);
              form.validateField('fullName', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('fullName');
              form.validateField('fullName', 'onBlur');
            }}
            error={form.touched.fullName ? form.errors.fullName || serverErrors.fullName : undefined}
            isRequired
            type="text"
            autoComplete="name"
            maxLength={100}
          />

          <TextField
            label="NIF"
            placeholder="Enter your NIF (9 digits)"
            value={form.values.nif}
            onChange={(value) => {
              form.setValue('nif', value);
              form.validateField('nif', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('nif');
              form.validateField('nif', 'onBlur');
            }}
            error={form.touched.nif ? form.errors.nif || serverErrors.nif : undefined}
            isRequired
            type="text"
            maxLength={9}
            helperText="Portuguese tax identification number"
          />

          <TextField
            label="Email Address"
            placeholder="Enter your email address"
            value={form.values.email}
            onChange={(value) => {
              form.setValue('email', value);
              form.validateField('email', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('email');
              form.validateField('email', 'onBlur');
            }}
            error={form.touched.email ? form.errors.email || serverErrors.email : undefined}
            isRequired
            type="email"
            autoComplete="email"
          />

          <TextField
            label="Password"
            placeholder="Create a secure password"
            value={form.values.password}
            onChange={(value) => {
              form.setValue('password', value);
              form.validateField('password', 'onChange');
              // Also validate confirm password if it has a value
              if (form.values.confirmPassword) {
                form.validateField('confirmPassword', 'onChange');
              }
            }}
            onBlur={() => {
              form.setTouched('password');
              form.validateField('password', 'onBlur');
            }}
            error={form.touched.password ? form.errors.password || serverErrors.password : undefined}
            isRequired
            type="password"
            autoComplete="new-password"
            helperText="At least 8 characters with letters and numbers"
          />

          <TextField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={form.values.confirmPassword}
            onChange={(value) => {
              form.setValue('confirmPassword', value);
              form.validateField('confirmPassword', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('confirmPassword');
              form.validateField('confirmPassword', 'onBlur');
            }}
            error={form.touched.confirmPassword ? form.errors.confirmPassword || serverErrors.confirmPassword : undefined}
            isRequired
            type="password"
            autoComplete="new-password"
          />

          <FormField
            label="Account Type"
            isRequired
            error={form.touched.userType ? (form.errors.userType || serverErrors.userType) || undefined : undefined}
            helperText="Choose whether you want to offer services or book services"
          >
            <VStack align="stretch" gap={3}>
              <HStack gap={6}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="userType"
                    value="client"
                    checked={form.values.userType === 'client'}
                    onChange={(e) => {
                      form.setValue('userType', e.target.value as 'client' | 'provider');
                      form.setTouched('userType');
                      form.validateField('userType', 'onChange');
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium">Client</Text>
                    <Text fontSize="sm" color="gray.600">Book and pay for services</Text>
                  </VStack>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="userType"
                    value="provider"
                    checked={form.values.userType === 'provider'}
                    onChange={(e) => {
                      form.setValue('userType', e.target.value as 'client' | 'provider');
                      form.setTouched('userType');
                      form.validateField('userType', 'onChange');
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium">Service Provider</Text>
                    <Text fontSize="sm" color="gray.600">Offer services to clients</Text>
                  </VStack>
                </label>
              </HStack>
            </VStack>
          </FormField>

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            w="full"
            loading={form.isSubmitting || isLoading}
            loadingText="Creating account..."
            disabled={!form.isValid && Object.keys(form.touched).length > 0}
          >
            Create Account
          </Button>
        </VStack>
      </form>

      <Text textAlign="center" color="gray.600">
        Already have an account?{' '}
        <Link asChild color="blue.500" fontWeight="medium">
          <RouterLink to="/auth/login">Sign in here</RouterLink>
        </Link>
      </Text>
    </VStack>
  );
}