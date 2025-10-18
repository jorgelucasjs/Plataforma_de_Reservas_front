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
import { APPCOLOR } from '@/utils/colors';


export function RegisterPage() {
    const { register: registerUser, isLoading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string>('');

    const form = useFormValidation<RegisterFormData>({
        fullName: {
            initialValue: '',
            required: true,
            requiredMessage: 'Nome completo é obrigatório',
            rules: [
                validationRules.minLength(2, 'Nome deve ter pelo menos 2 caracteres'),
                validationRules.maxLength(100, 'Nome não pode exceder 100 caracteres'),
                validationRules.custom(
                    (value: string) => {
                        if (!value) return true;
                        return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
                    },
                    'Nome só pode conter letras e espaços',
                    'onBlur'
                ),
            ],
        },
        nif: {
            initialValue: '',
            required: true,
            requiredMessage: 'NIF é obrigatório',
            rules: [validationRules.nif()],
        },
        email: {
            initialValue: '',
            required: true,
            requiredMessage: 'Email é obrigatório',
            rules: [validationRules.email()],
        },
        password: {
            initialValue: '',
            required: true,
            requiredMessage: 'Palavra-passe é obrigatória',
            rules: [validationRules.password()],
        },
        // confirmPassword: {
        //     initialValue: '',
        //     required: true,
        //     requiredMessage: 'Please confirm your password',
        //     rules: [validationRules.matchField('password', 'Passwords do not match')],
        // },
        userType: {
            initialValue: 'client' as 'client' | 'provider',
            required: true,
            requiredMessage: 'Por favor, selecione um tipo de conta',
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
                Criar Conta
            </Heading>

            {/* Display server validation errors */}
            <ValidationErrorDisplay
                errors={serverErrors}
                generalError={generalError || error || undefined}
                title="Por favor, corrija os seguintes problemas:"
            />

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <VStack gap={4}>
                    <TextField
                        label="Nome Completo"
                        placeholder="Insira o seu nome completo"
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
                        placeholder="Insira o seu NIF (9 dígitos)"
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
                        helperText="Número de identificação fiscal português"
                    />

                    <TextField
                        label="Endereço de Email"
                        placeholder="Insira o seu endereço de email"
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
                        label="Palavra-passe"
                        placeholder="Crie uma palavra-passe segura"
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
                        helperText="Pelo menos 8 caracteres com letras e números"
                    />

                    {/* <TextField
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
                    /> */}

                    <FormField
                        label="Tipo de Conta"
                        isRequired
                        error={form.touched.userType ? (form.errors.userType || serverErrors.userType) || undefined : undefined}
                        helperText="Escolha se quer oferecer serviços ou reservar serviços"
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
                                        <Text fontWeight="medium">Cliente</Text>
                                        <Text fontSize="sm" color="gray.600">Reservar e pagar por serviços</Text>
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
                                        <Text fontWeight="medium">Prestador de Serviços</Text>
                                        <Text fontSize="sm" color="gray.600">Oferecer serviços a clientes</Text>
                                    </VStack>
                                </label>
                            </HStack>
                        </VStack>
                    </FormField>

                    <Button
                        type="submit"
                        bg={APPCOLOR}
                        size="lg"
                        w="full"
                        loading={form.isSubmitting || isLoading}
                        loadingText="A criar conta..."
                        //disabled={!form.isValid}
                    >
                        Criar Conta
                    </Button>
                </VStack>
            </form>

            <Text textAlign="center" color="gray.600">
                Já tem uma conta?{' '}
                <Link asChild color="blue.500" fontWeight="medium">
                    <RouterLink to="/auth/login">Inicie sessão aqui</RouterLink>
                </Link>
            </Text>
        </VStack>
    );
}