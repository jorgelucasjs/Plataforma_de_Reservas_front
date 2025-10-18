import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  HStack,
} from '@chakra-ui/react';
import { registerSchema, type RegisterFormData } from '../../services/validationService';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'client',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();

    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg" textAlign="center" color="gray.700">
        Create Account
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
              {...register('fullName')}
              placeholder="Enter your full name"
              type="text"
              borderColor={errors.fullName ? 'red.500' : 'gray.300'}
            />
            {errors.fullName && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.fullName.message}
              </Text>
            )}
          </Box>

          <Box w="full">
            <Input
              {...register('nif')}
              placeholder="Enter your NIF"
              type="text"
              borderColor={errors.nif ? 'red.500' : 'gray.300'}
            />
            {errors.nif && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.nif.message}
              </Text>
            )}
          </Box>

          <Box w="full">
            <Input
              {...register('email')}
              placeholder="Enter your email"
              type="email"
              borderColor={errors.email ? 'red.500' : 'gray.300'}
            />
            {errors.email && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.email.message}
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

          <Box w="full">
            <Input
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              type="password"
              borderColor={errors.confirmPassword ? 'red.500' : 'gray.300'}
            />
            {errors.confirmPassword && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </Box>

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={2}>Account Type</Text>
            <HStack gap={6}>
              <Box>
                <input
                  type="radio"
                  id="client"
                  value="client"
                  {...register('userType')}
                />
                <label htmlFor="client" style={{ marginLeft: '8px', cursor: 'pointer' }}>
                  Client
                </label>
              </Box>
              <Box>
                <input
                  type="radio"
                  id="provider"
                  value="provider"
                  {...register('userType')}
                />
                <label htmlFor="provider" style={{ marginLeft: '8px', cursor: 'pointer' }}>
                  Service Provider
                </label>
              </Box>
            </HStack>
            {errors.userType && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.userType.message}
              </Text>
            )}
          </Box>

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            w="full"
            loading={isLoading}
            loadingText="Creating account..."
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