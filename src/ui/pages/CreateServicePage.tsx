import { Container, Field, Heading, Textarea, Button, Stack, HStack, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../stores/serviceStore";
import { toaster } from "../components/ui/toaster";

export const CreateServicePage = () => {
    const navigate = useNavigate();
    const { createService, isLoading } = useServiceStore();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        <Container maxW="md">
            <Heading mb="6">Criar Novo Serviço</Heading>
            <Stack gap="4">
                <Field.Root invalid={!!errors.name}>
                    <Field.Label>Nome do Serviço</Field.Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Field.ErrorText>{errors.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.description}>
                    <Field.Label>Descrição</Field.Label>
                    <Textarea
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
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Field.ErrorText>{errors.price}</Field.ErrorText>
                </Field.Root>

                <HStack gap="4">
                    <Button colorScheme="blue" onClick={handleSubmit} loading={isLoading} flex="1">
                        Criar Serviço
                    </Button>
                    <Button onClick={() => navigate("/services")} flex="1">
                        Cancelar
                    </Button>
                </HStack>
            </Stack>
        </Container>
    );
};