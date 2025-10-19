import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Button,
  Text,
  Link,
} from '@chakra-ui/react';
import { ValidationService, type LoginFormData } from '../../services/validationService';
import { ServerValidationService } from '../../services/serverValidationService';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation, validationRules } from '../../hooks/useFormValidation';
import { TextField } from '../components/FormField';
import { ValidationErrorDisplay } from '../components/ValidationErrorDisplay';
import { APPCOLOR } from '../../utils/colors';

export function LoginPage() {
  const { login, isLoading, error, clearError, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate, from]);

  const form = useFormValidation<LoginFormData>({
    identifier: {
      initialValue: '',
      required: true,
      requiredMessage: 'Email ou NIF é obrigatório',
      rules: [
        validationRules.custom(
          (value: string) => {
            if (!value) return true;
            return ValidationService.validateEmail(value) || ValidationService.validateNIF(value);
          },
          'Por favor, insira um endereço de email ou NIF válido',
          'onBlur'
        ),
      ],
    },
    password: {
      initialValue: '',
      required: true,
      requiredMessage: 'Palavra-passe é obrigatória',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setServerErrors({});
    setGeneralError('');

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {

      console.log("err", err)
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
        Iniciar Sessão
      </Heading>

      {/* Display server validation errors */}
      <ValidationErrorDisplay
        errors={serverErrors}
        generalError={generalError || error || undefined}
        title="Por favor, verifique os seus dados de login:"
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <TextField
            label="Email ou NIF"
            placeholder="Insira o seu email ou NIF"
            value={form.values.identifier}
            onChange={(value) => {
              form.setValue('identifier', value);
              form.validateField('identifier', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('identifier');
              form.validateField('identifier', 'onBlur');
            }}
            error={form.touched.identifier ? (form.errors.identifier || serverErrors.identifier) || undefined : undefined}
            isRequired
            type="text"
            autoComplete="username"
          />

          <TextField
            label="Palavra-passe"
            placeholder="Insira a sua palavra-passe"
            value={form.values.password}
            onChange={(value) => {
              form.setValue('password', value);
              form.validateField('password', 'onChange');
            }}
            onBlur={() => {
              form.setTouched('password');
              form.validateField('password', 'onBlur');
            }}
            error={form.touched.password ? (form.errors.password || serverErrors.password) || undefined : undefined}
            isRequired
            type="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            bg={APPCOLOR}
            size="lg"
            w="full"
            loading={form.isSubmitting || isLoading}
            loadingText="A iniciar sessão..."
            disabled={(!form.isValid && Object.keys(form.touched).length > 0) || form.isSubmitting || isLoading}
          >
            Iniciar Sessão
          </Button>
        </VStack>
      </form>

      <Text textAlign="center" color="gray.600">
        Não tem uma conta?{' '}
        <Link asChild color="blue.500" fontWeight="medium">
          <RouterLink to="/auth/register">Registe-se aqui</RouterLink>
        </Link>
      </Text>
    </VStack>
  );
}