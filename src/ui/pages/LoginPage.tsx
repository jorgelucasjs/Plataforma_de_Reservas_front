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
    IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toaster } from "../components/ui/toaster";
import { APPCOLOR } from "@/utils/colors";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { InputGroup } from "../components/ui/input-group";

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
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    const validateLoginForm = () => {
        const newErrors: Record<string, string> = {};
        if (!loginData.email) newErrors.email = "Email é obrigatório";
        if (!loginData.password) newErrors.password = "Senha é obrigatória";
        return newErrors;
    };

    const validateRegisterForm = () => {
        const newErrors: Record<string, string> = {};

        if (!registerData.fullName.trim()) {
            newErrors.fullName = "Nome completo é obrigatório";
        }

        if (!registerData.nif.trim()) {
            newErrors.nif = "NIF é obrigatório";
        } else if (registerData.nif.length < 10) {
            newErrors.nif = "NIF deve ter no mínimo 10 caracteres";
        }

        if (!registerData.email.trim()) {
            newErrors.email = "Email é obrigatório";
        }

        if (!registerData.password) {
            newErrors.password = "Senha é obrigatória";
        } else if (registerData.password.length < 8) {
            newErrors.password = "Senha deve ter mínimo 8 caracteres";
        }

        return newErrors;
    };

    const handleLogin = async () => {
        const newErrors = validateLoginForm();

        console.log("newErrors", newErrors)
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
            console.log("error", error)
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
            <Stack >
                <Box textAlign="center">
                    <Heading size="xl" mb="1">
                        AgendaSmart
                    </Heading>
                    <Text color="gray.600">Plataforma de Contratação de Serviços</Text>
                </Box>

                <Tabs.Root
                    value={activeTab}
                    onValueChange={(details) => setActiveTab(details.value as string)}
                    variant="outline"
                    bg="#eee"
                >
                    <Tabs.List
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}

                    >
                        <Tabs.Trigger value="login" p={4}>Login</Tabs.Trigger>
                        <Tabs.Trigger value="register" p={4}>Registar</Tabs.Trigger>
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
                                    placeholder="exemplo@email.com"
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
                                <InputGroup
                                    w={"full"}
                                    endElement={
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showLoginPassword ? <LuEyeOff color={APPCOLOR}/> : <LuEye color={APPCOLOR}/>}
                                        </IconButton>
                                    }
                                >
                                    <Input
                                        type={showLoginPassword ? "text" : "password"}
                                        placeholder="Digite sua senha"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, password: e.target.value })
                                        }
                                    />
                                </InputGroup>
                                <Field.ErrorText>{errors.password}</Field.ErrorText>
                            </Field.Root>

                            <Button
                                bg={APPCOLOR}
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
                                    placeholder="Digite seu nome completo"
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
                                    placeholder="Digite seu NIF mínimo 10 caracteres"
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
                                    placeholder="exemplo@email.com"
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
                                <InputGroup
                                    w={"full"}
                                    endElement={
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                            aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showRegisterPassword ? <LuEyeOff color={APPCOLOR} /> : <LuEye color={APPCOLOR} />}
                                        </IconButton>
                                    }
                                >
                                    <Input
                                        type={showRegisterPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={registerData.password}
                                        onChange={(e) =>
                                            setRegisterData({ ...registerData, password: e.target.value })
                                        }
                                    />
                                </InputGroup>
                                <Field.ErrorText>{errors.password}</Field.ErrorText>
                            </Field.Root>

                            <Fieldset.Root>
                                <Fieldset.Legend color={"black"}>Tipo de Conta</Fieldset.Legend>
                                <Fieldset.Content>
                                    <Stack direction="row">
                                        <Button
                                            flex="1"
                                            color={"#fff"}
                                            bg={
                                                registerData.userType === "client" ? "#000" : "gray"
                                            }
                                            onClick={() =>
                                                setRegisterData({ ...registerData, userType: "client" })
                                            }
                                        >
                                            Cliente
                                        </Button>
                                        <Button
                                            flex="1"
                                            color={"#fff"}
                                            bg={
                                                registerData.userType === "provider" ? "#000" : "gray"
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
                                bg={APPCOLOR}
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