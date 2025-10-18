import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Link,
  Box,
} from '@chakra-ui/react';
import { loginSchema, type LoginFormData } from '../../services/validationService';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg" textAlign="center" color="gray.700">
        Sign In
      </Heading>

      {error && (
        <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700">
          {error}
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Box w="full">
            <Input
              {...register('identifier')}
              placeholder="Enter your email or NIF"
              type="text"
              borderColor={errors.identifier ? 'red.500' : 'gray.300'}
            />
            {errors.identifier && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.identifier.message}
              </Text>
            )}
          </Box>

          <Box w="full">
            <Input
              {...register('password')}
              placeholder="Enter your password"
              type="password"
              borderColor={errors.password ? 'red.500' : 'gray.300'}
            />
            {errors.password && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.password.message}
              </Text>
            )}
          </Box>

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            w="full"
            loading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </VStack>
      </form>

      <Text textAlign="center" color="gray.600">
        Don't have an account?{' '}
        <Link asChild color="blue.500" fontWeight="medium">
          <RouterLink to="/auth/register">Sign up here</RouterLink>
        </Link>
      </Text>
    </VStack>
  );
}