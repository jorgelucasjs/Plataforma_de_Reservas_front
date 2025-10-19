import { useState } from "react";
import {
  Button,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from "@/ui/components/ui/dialog";
import { useUserStore } from "@/stores/userStore";
import { toaster } from "@/ui/components/ui/toaster";

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const AddBalanceModal = ({ isOpen, onClose, userEmail }: AddBalanceModalProps) => {
  const [amount, setAmount] = useState("");
  const { addBalance, isLoading } = useUserStore();

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);

    if (!amount || numAmount <= 0) {
      toaster.create({
        title: "Valor inválido",
        description: "Por favor, insira um valor maior que zero",
        type: "error",
      });
      return;
    }

    try {
      await addBalance(userEmail, numAmount);
      toaster.create({
        title: "Sucesso!",
        description: `Saldo de $${numAmount.toFixed(2)} adicionado com sucesso`,
        type: "success",
      });
      setAmount("");
      onClose();
    } catch (error: any) {
      toaster.create({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao adicionar saldo",
        type: "error",
      });
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carregar Conta</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap="4" align="stretch">
            <Text color="gray.600">
              Adicione saldo à sua conta para realizar reservas
            </Text>
            <Input
              type="number"
              placeholder="Valor (ex: 50.00)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" borderColor="navy.500" color="navy.500" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            bg="primary.500"
            color="white"
            _hover={{ bg: "accent.500" }}
            onClick={handleSubmit}
            loading={isLoading}
          >
            Adicionar Saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
