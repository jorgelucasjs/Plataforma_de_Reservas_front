import { Container, Field, Heading, Textarea, Button, Stack, HStack, Input, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { toaster } from "../components/ui/toaster";
import { LuSparkles } from "react-icons/lu";
import { mockServices } from "../mocks";

export const CreateServicePage = () => {
    const navigate = useNavigate();
    const { createService, isLoading } = useServiceStore();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isCreatingMocks, setIsCreatingMocks] = useState(false);

  

    const handleCreateMocks = async () => {
        setIsCreatingMocks(true);
        try {
            let successCount = 0;
            for (const service of mockServices) {
                try {
                    await createService(service);
                    successCount++;
                } catch (error) {
                    console.error("Erro ao criar serviço mock:", error);
                }
            }
            toaster.create({
                title: `${successCount} serviços de exemplo criados!`,
                type: "success"
            });
            navigate("/services");
        } catch (error: any) {
            toaster.create({
                title: "Erro ao criar serviços de exemplo",
                type: "error",
            });
        } finally {
            setIsCreatingMocks(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Nome é obrigatório";
        if (!formData.description) newErrors.description = "Descrição é obrigatória";
        if (!formData.price || parseFloat(formData.price) <= 0)
            newErrors.price = "Preço deve ser maior que zero";
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createService({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
            });
            toaster.create({ title: "Serviço criado com sucesso!", type: "success" });
            navigate("/services");
        } catch (error: any) {
            toaster.create({
                title: error.response?.data?.message || "Erro ao criar serviço",
                type: "error",
            });
        }
    };

    return (
        <Container maxW="md" position="relative">
            <Box position="absolute" top="0" right="0">
                <Button
                    size="sm"
                    variant="outline"
                    bg="purple"
                    onClick={handleCreateMocks}
                    loading={isCreatingMocks}
                >
                    <LuSparkles />
                    Criar 6 Exemplos
                </Button>
            </Box>
            <Heading mb="6" color="navy.700">Criar Novo Serviço</Heading>
            <Stack gap="4">
                <Field.Root invalid={!!errors.name}>
                    <Field.Label>Nome do Serviço</Field.Label>
                    <Input
                        placeholder="Ex: Consultoria de TI"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Field.ErrorText>{errors.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.description}>
                    <Field.Label>Descrição</Field.Label>
                    <Textarea
                        placeholder="Descreva o serviço que você oferece..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                    />
                    <Field.ErrorText>{errors.description}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.price}>
                    <Field.Label>Preço</Field.Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 5000.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Field.ErrorText>{errors.price}</Field.ErrorText>
                </Field.Root>

                <HStack gap="4">
                    <Button bg="primary.500" color="white" _hover={{ bg: "accent.500" }} onClick={handleSubmit} loading={isLoading} flex="1">
                        Criar Serviço
                    </Button>
                    <Button variant="outline" borderColor="navy.500" color="navy.500" _hover={{ bg: "navy.50" }} onClick={() => navigate("/services")} flex="1">
                        Cancelar
                    </Button>
                </HStack>
            </Stack>
        </Container>
    );
};