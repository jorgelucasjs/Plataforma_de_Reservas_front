import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Flex,
  Grid,
  GridItem,
  Input,
  Skeleton,
  SkeletonText,
  IconButton,
} from '@chakra-ui/react';
import {
  HiPencil,
  HiCheck,
  HiX,
  HiRefresh,
  HiUser,
  HiMail,
  HiIdentification,
  HiCurrencyEuro,
  HiCalendar,
} from 'react-icons/hi';

import { useUserUiState } from '../../stores/userStore';
import { APPCOLOR } from '../../utils/colors';
import { userRepository } from '../../repositories/userRepository';
import { ValidationService } from '../../services/validationService';
import { ToastService } from '../../services/toastService';
import { formatCurrency, formatDate, formatUserType, formatRelativeTime } from '../../utils/formatters';

interface ProfileFormData {
  fullName: string;
  email: string;
}

interface ProfileFormErrors {
  fullName?: string;
  email?: string;
}

export function ProfilePage() {
  const {
    profile,
    balance,
    isLoading,
    error,
    setError,
  } = useUserUiState();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
      });
    }
  }, [profile]);

  const loadProfileData = async () => {
    try {
      await userRepository.refreshUserData();
    } catch (error) {
      console.error('Failed to load profile data:', error);
      ToastService.error(
        'Erro ao Carregar Perfil',
        'Não foi possível carregar os dados do perfil. Tente novamente.'
      );
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (profile) {
        setFormData({
          fullName: profile.fullName,
          email: profile.email,
        });
      }
      setFormErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const validation = ValidationService.validateProfileUpdate(formData);
    
    if (!validation.success) {
      setFormErrors(validation.errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await userRepository.updateProfile(formData);
      
      setIsEditing(false);
      ToastService.success(
        'Perfil Atualizado',
        'As suas informações foram atualizadas com sucesso.'
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      ToastService.error(
        'Erro ao Atualizar Perfil',
        error.message || 'Não foi possível atualizar o perfil. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    await loadProfileData();
    ToastService.info('Dados Atualizados', 'Os dados do perfil foram atualizados.');
  };

  if (isLoading && !profile) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="40px" />
          <Box p={6} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <SkeletonText noOfLines={2} />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </VStack>
          </Box>
          <Box p={6} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <SkeletonText noOfLines={1} />
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Skeleton height="80px" />
                <Skeleton height="80px" />
                <Skeleton height="80px" />
              </Grid>
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  if (!profile && !isLoading) {
    return (
      <Box p={6}>
        <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700">
          <Text fontWeight="bold" mb={2}>Erro ao Carregar Perfil</Text>
          <Text mb={2}>
            Não foi possível carregar os dados do perfil.
          </Text>
          <Button variant="outline" size="sm" bg={APPCOLOR} onClick={loadProfileData}>
            Tentar novamente
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            Meu Perfil
          </Heading>
          <HStack gap={2}>
            <IconButton
              aria-label="Atualizar dados"
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              loading={isLoading}
            >
              <HiRefresh size={16} />
            </IconButton>
            {!isEditing && (
              <Button
                onClick={handleEditToggle}
                variant="outline"
                bg={APPCOLOR}
                size="sm"
              >
                <HiPencil size={16} />
                <Text ml={2}>Editar</Text>
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700">
            {error}
          </Box>
        )}

        {/* Profile Information Card */}
        <Box p={6} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md" color="gray.700">
                Informações Pessoais
              </Heading>
              {isEditing && (
                <HStack gap={2}>
                  <Button
                    onClick={handleSubmit}
                    bg={APPCOLOR}
                    size="sm"
                    loading={isSubmitting}
                    loadingText="Guardando..."
                  >
                    <HiCheck size={16} />
                    <Text ml={2}>Guardar</Text>
                  </Button>
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <HiX size={16} />
                    <Text ml={2}>Cancelar</Text>
                  </Button>
                </HStack>
              )}
            </Flex>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {/* Full Name */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    <HStack gap={2}>
                      <HiUser size={16} />
                      <Text>Nome Completo</Text>
                    </HStack>
                  </Text>
                  {isEditing ? (
                    <Box>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Digite o seu nome completo"
                        disabled={isSubmitting}
                        borderColor={formErrors.fullName ? 'red.500' : 'gray.300'}
                      />
                      {formErrors.fullName && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {formErrors.fullName}
                        </Text>
                      )}
                    </Box>
                  ) : (
                    <Text fontSize="md" color="gray.800" py={2}>
                      {profile?.fullName || 'Não definido'}
                    </Text>
                  )}
                </Box>
              </GridItem>

              {/* Email */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    <HStack gap={2}>
                      <HiMail size={16} />
                      <Text>Email</Text>
                    </HStack>
                  </Text>
                  {isEditing ? (
                    <Box>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Digite o seu email"
                        disabled={isSubmitting}
                        borderColor={formErrors.email ? 'red.500' : 'gray.300'}
                      />
                      {formErrors.email && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {formErrors.email}
                        </Text>
                      )}
                    </Box>
                  ) : (
                    <Text fontSize="md" color="gray.800" py={2}>
                      {profile?.email || 'Não definido'}
                    </Text>
                  )}
                </Box>
              </GridItem>

              {/* NIF (Read-only) */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    <HStack gap={2}>
                      <HiIdentification size={16} />
                      <Text>NIF</Text>
                    </HStack>
                  </Text>
                  <Text fontSize="md" color="gray.800" py={2}>
                    {profile?.nif || 'Não definido'}
                  </Text>
                </Box>
              </GridItem>

              {/* User Type (Read-only) */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    Tipo de Utilizador
                  </Text>
                  <Box py={2}>
                    <Badge
                      colorPalette={profile?.userType === 'provider' ? 'green' : 'blue'}
                      variant="subtle"
                      size="md"
                    >
                      {profile && formatUserType(profile.userType)}
                    </Badge>
                  </Box>
                </Box>
              </GridItem>

              {/* Account Status (Read-only) */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    Estado da Conta
                  </Text>
                  <Box py={2}>
                    <Badge
                      colorPalette={profile?.isActive ? 'green' : 'red'}
                      variant="subtle"
                      size="md"
                    >
                      {profile?.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </Box>
                </Box>
              </GridItem>

              {/* Member Since (Read-only) */}
              <GridItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                    <HStack gap={2}>
                      <HiCalendar size={16} />
                      <Text>Membro desde</Text>
                    </HStack>
                  </Text>
                  <Text fontSize="md" color="gray.800" py={2}>
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'Não disponível'}
                  </Text>
                </Box>
              </GridItem>
            </Grid>
          </VStack>
        </Box>

        {/* Balance Information Card */}
        <Box p={6} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
          <VStack gap={4} align="stretch">
            <Heading size="md" color="gray.700">
              Informações Financeiras
            </Heading>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              {/* Current Balance */}
              <GridItem>
                <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                  <Text fontSize="sm" color="blue.700" mb={1}>
                    <HStack gap={2}>
                      <HiCurrencyEuro size={16} />
                      <Text>Saldo Atual</Text>
                    </HStack>
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={1}>
                    {profile ? formatCurrency(profile.balance) : '€0,00'}
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    {balance?.lastUpdated ? (
                      <>Atualizado {formatRelativeTime(balance.lastUpdated)}</>
                    ) : (
                      'Última atualização desconhecida'
                    )}
                  </Text>
                </Box>
              </GridItem>

              {/* Total Earned (for providers) */}
              {profile?.userType === 'provider' && (
                <GridItem>
                  <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                    <Text fontSize="sm" color="green.700" mb={1}>Total Ganho</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={1}>
                      {balance?.totalEarned ? formatCurrency(balance.totalEarned) : '€0,00'}
                    </Text>
                    <Text fontSize="xs" color="green.600">Desde o registo</Text>
                  </Box>
                </GridItem>
              )}

              {/* Total Spent (for clients) */}
              {profile?.userType === 'client' && (
                <GridItem>
                  <Box p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                    <Text fontSize="sm" color="orange.700" mb={1}>Total Gasto</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600" mb={1}>
                      {balance?.totalSpent ? formatCurrency(balance.totalSpent) : '€0,00'}
                    </Text>
                    <Text fontSize="xs" color="orange.600">Desde o registo</Text>
                  </Box>
                </GridItem>
              )}

              {/* Account Activity */}
              <GridItem>
                <Box p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.700" mb={1}>Última Atividade</Text>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={1}>
                    {profile?.updatedAt ? formatRelativeTime(profile.updatedAt) : 'Nunca'}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {profile?.updatedAt ? formatDate(profile.updatedAt, { includeTime: true }) : 'Sem atividade'}
                  </Text>
                </Box>
              </GridItem>
            </Grid>

            <Box h="1px" bg="gray.200" />

            {/* Balance Actions */}
            <HStack gap={4} justify="center">
              <Text fontSize="sm" color="gray.600">
                Para adicionar fundos à sua conta, contacte o suporte.
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Account Information */}
        <Box p={6} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
          <VStack gap={4} align="stretch">
            <Heading size="md" color="gray.700">
              Informações da Conta
            </Heading>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <Text fontSize="sm" color="gray.600">
                  <strong>ID da Conta:</strong> {profile?.id || 'Não disponível'}
                </Text>
              </GridItem>
              <GridItem>
                <Text fontSize="sm" color="gray.600">
                  <strong>Última Atualização:</strong>{' '}
                  {profile?.updatedAt ? formatDate(profile.updatedAt, { includeTime: true }) : 'Nunca'}
                </Text>
              </GridItem>
            </Grid>

            <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
                Informação Importante
              </Text>
              <Text fontSize="sm" color="blue.700">
                Para alterar a sua palavra-passe ou desativar a conta, contacte o suporte técnico.
                O NIF não pode ser alterado após o registo.
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}