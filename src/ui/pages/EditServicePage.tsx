import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Container, Field, Text, Heading, HStack, Input, Stack, Textarea, createToaster } from "@chakra-ui/react";
import { useServiceStore } from "@/stores/serviceStore";

const toaster = createToaster({
    placement: "top-end",
    pauseOnPageIdle: true,
});

export const EditServicePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { myServices, updateService, isLoading } = useServiceStore();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const service = myServices.find((s) => s.id === id);

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price.toString(),
            });
        }
    }, [service]);

    if (!service) {
        return (
            <Container maxW="md">
                <Text>Serviço não encontrado</Text>
                <Button onClick={() => navigate("/services")}>Voltar</Button>
            </Container>
        );
    }

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
            await updateService(id!, {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
            });
            toaster.create({ title: "Serviço atualizado com sucesso!", type: "success" });
            navigate("/services");
        } catch (error: any) {
            toaster.create({
                title: error.response?.data?.message || "Erro ao atualizar serviço",
                type: "error",
            });
        }
    };

    return (
        <Container maxW="md">
            <Heading mb="6" color="navy.700">Editar Serviço</Heading>
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
                    <Button bg="primary.500" color="white" _hover={{ bg: "accent.500" }} onClick={handleSubmit} loading={isLoading} flex="1">
                        Atualizar Serviço
                    </Button>
                    <Button variant="outline" borderColor="navy.500" color="navy.500" _hover={{ bg: "navy.50" }} onClick={() => navigate("/services")} flex="1">
                        Cancelar
                    </Button>
                </HStack>
            </Stack>
        </Container>
    );
};