import {
  Box,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useState, useEffect } from 'react';
import type { TransactionFilters as TransactionFiltersType } from '../../types/booking';
import { formatDateForInput } from '../../utils/formatters';

interface TransactionFiltersProps {
  filters: TransactionFiltersType;
  onFiltersChange: (filters: TransactionFiltersType) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TransactionFiltersType>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof TransactionFiltersType, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleApply = () => {
    onApplyFilters();
  };

  const handleClear = () => {
    const clearedFilters: TransactionFiltersType = {
      type: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = 
    localFilters.type ||
    localFilters.status ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.minAmount !== undefined ||
    localFilters.maxAmount !== undefined;

  return (
    <Box borderWidth={1} borderRadius="md" p={4} bg="gray.50">
      <HStack justify="space-between" mb={isOpen ? 4 : 0}>
        <HStack>
          <Text fontWeight="medium" color="gray.700">
            Filtros
          </Text>
          {hasActiveFilters && (
            <Text fontSize="sm" color="blue.600">
              (filtros ativos)
            </Text>
          )}
        </HStack>
        <IconButton
          aria-label={isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <MdExpandLess /> : <MdExpandMore />}
        </IconButton>
      </HStack>

      {isOpen && (
        <VStack gap={4} align="stretch">
          {/* Type, Status and Date Range */}
          <HStack gap={4} align="end">
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Tipo</Text>
              <select
                value={localFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                }}
              >
                <option value="">Todos os tipos</option>
                <option value="payment">Pagamento</option>
                <option value="refund">Reembolso</option>
              </select>
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                }}
              >
                <option value="">Todos os status</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Data Inicial</Text>
              <Input
                type="date"
                value={localFilters.dateFrom ? formatDateForInput(localFilters.dateFrom) : ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                size="sm"
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Data Final</Text>
              <Input
                type="date"
                value={localFilters.dateTo ? formatDateForInput(localFilters.dateTo) : ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                size="sm"
              />
            </Box>
          </HStack>

          {/* Amount Range and Sorting */}
          <HStack gap={4} align="end">
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Valor Mínimo (€)</Text>
              <Input
                type="number"
                value={localFilters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                min={0}
                step={0.01}
                size="sm"
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Valor Máximo (€)</Text>
              <Input
                type="number"
                value={localFilters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="1000.00"
                min={0}
                step={0.01}
                size="sm"
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Ordenar por</Text>
              <select
                value={localFilters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                }}
              >
                <option value="createdAt">Data da Transação</option>
                <option value="amount">Valor</option>
                <option value="serviceName">Nome do Serviço</option>
              </select>
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Ordem</Text>
              <select
                value={localFilters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                }}
              >
                <option value="desc">Mais Recente</option>
                <option value="asc">Mais Antigo</option>
              </select>
            </Box>
          </HStack>

          {/* Action Buttons */}
          <HStack justify="flex-end" gap={3}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              Limpar Filtros
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={handleApply}
              loading={isLoading}
              loadingText="Aplicando..."
            >
              Aplicar Filtros
            </Button>
          </HStack>
        </VStack>
      )}
    </Box>
  );
}