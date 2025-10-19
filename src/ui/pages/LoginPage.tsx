import {
    Box,
    Button,
    Container,
    Field,
    Fieldset,
    Input,
    Stack,
    Tabs,
    Text,
    VStack,
    Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toaster } from "../components/ui/toaster";

export const LoginPage = () => {

    const navigate = useNavigate();
    const { login, register, isLoading } = useAuthStore();
    const [loginData, setLoginData] = useState({ email: "", password: "" });

    const [registerData, setRegisterData] = useState({
        fullName: "",
        nif: "",
        email: "",
        password: "",
        userType: "client" as "client" | "provider",
    });

    const [activeTab, setActiveTab] = useState("login");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateLoginForm = () => {
        const newErrors: Record<string, string> = {};
        if (!loginData.email) newErrors.email = "Email é obrigatório";
        if (!loginData.password) newErrors.password = "Senha é obrigatória";
        return newErrors;
    };

    const validateRegisterForm = () => {
        const newErrors: Record<string, string> = {};
        if (!registerData.fullName) newErrors.fullName = "Nome completo é obrigatório";
        if (!registerData.nif) newErrors.nif = "NIF é obrigatório";
        if (!registerData.email) newErrors.email = "Email é obrigatório";
        if (registerData.password.length < 6)
            newErrors.password = "Senha deve ter mínimo 6 caracteres";
        return newErrors;
    };

    const handleLogin = async () => {
        const newErrors = validateLoginForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            await login(loginData.email, loginData.password);
            toaster.create({
                title: "Autenticado com sucesso!",
                description: "Autenticado com sucesso!",
                type: 'success',
                duration: 3000
            })
            navigate("/dashboard");
        } catch (error: any) {
            toaster.create({
                title: "Erro na autenticação",
                description: "Erro na autenticação",
                type: 'error',
                duration: 3000
            })
        }
    };

    const handleRegister = async () => {
        const newErrors = validateRegisterForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await register(registerData);

            toaster.create({
                title: "Registado com sucesso!",
                description: "Registado com sucesso!",
                type: 'success',
                duration: 3000
            })
            navigate("/dashboard");
        } catch (error: any) {
            toaster.create({
                title: "Erro no registo",
                description: error.response?.data?.message || "Tente novamente",
                type: 'error',
                duration: 3000
            })
        }
    };

    return (
        <Container maxW="md" py={{ base: "12", md: "24" }}>
            <Stack p="8">
                <Box textAlign="center">
                    <Heading size="xl" mb="2">
                        AgendaLa
                    </Heading>
                    <Text color="gray.600">Plataforma de Contratação de Serviços</Text>
                </Box>

                <Tabs.Root
                    value={activeTab}
                    onValueChange={(details) => setActiveTab(details.value as string)}
                    variant="outline"
                    colorScheme="blue"
                >
                    <Tabs.List>
                        <Tabs.Trigger value="login">Login</Tabs.Trigger>
                        <Tabs.Trigger value="register">Registar</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>

                    <Tabs.Content value="login">
                        <VStack p="4" gap="6">
                            <Field.Root invalid={!!errors.email}>
                                <Field.Label>
                                    Email
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, email: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.email}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.password}>
                                <Field.Label>
                                    Senha
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, password: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.password}</Field.ErrorText>
                            </Field.Root>

                            <Button
                                colorScheme="blue"
                                width="full"
                                onClick={handleLogin}
                                loading={isLoading}
                            >
                                Autenticar
                            </Button>
                        </VStack>
                    </Tabs.Content>

                    <Tabs.Content value="register">
                        <VStack p="4" gap="6">
                            <Field.Root invalid={!!errors.fullName}>
                                <Field.Label>
                                    Nome Completo
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    value={registerData.fullName}
                                    onChange={(e) =>
                                        setRegisterData({ ...registerData, fullName: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.fullName}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.nif}>
                                <Field.Label>
                                    NIF
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    value={registerData.nif}
                                    onChange={(e) =>
                                        setRegisterData({ ...registerData, nif: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.nif}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.email}>
                                <Field.Label>
                                    Email
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="email"
                                    value={registerData.email}
                                    onChange={(e) =>
                                        setRegisterData({ ...registerData, email: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.email}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.password}>
                                <Field.Label>
                                    Senha
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="password"
                                    value={registerData.password}
                                    onChange={(e) =>
                                        setRegisterData({ ...registerData, password: e.target.value })
                                    }
                                />
                                <Field.ErrorText>{errors.password}</Field.ErrorText>
                            </Field.Root>

                            <Fieldset.Root>
                                <Fieldset.Legend>Tipo de Conta</Fieldset.Legend>
                                <Fieldset.Content>
                                    <Stack direction="row">
                                        <Button
                                            flex="1"
                                            colorScheme={
                                                registerData.userType === "client" ? "blue" : "gray"
                                            }
                                            onClick={() =>
                                                setRegisterData({ ...registerData, userType: "client" })
                                            }
                                        >
                                            Cliente
                                        </Button>
                                        <Button
                                            flex="1"
                                            colorScheme={
                                                registerData.userType === "provider" ? "blue" : "gray"
                                            }
                                            onClick={() =>
                                                setRegisterData({ ...registerData, userType: "provider" })
                                            }
                                        >
                                            Prestador
                                        </Button>
                                    </Stack>
                                </Fieldset.Content>
                            </Fieldset.Root>

                            <Button
                                colorScheme="blue"
                                width="full"
                                onClick={handleRegister}
                                loading={isLoading}
                            >
                                Registar
                            </Button>
                        </VStack>
                    </Tabs.Content>
                </Tabs.Root>
            </Stack>
        </Container>
    );
};