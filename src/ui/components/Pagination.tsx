import {
  Button,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  showItemsPerPage?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  showItemsPerPage = true,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <VStack gap={4} align="stretch">
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            Mostrando {startItem} a {endItem} de {totalItems} resultados
          </Text>
          <HStack gap={2}>
            <Text fontSize="sm" color="gray.600">
              Itens por página:
            </Text>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={isLoading}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '14px',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </HStack>
        </HStack>
      )}

      {/* Pagination controls */}
      <HStack justify="center" gap={1}>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
        >
          Anterior
        </Button>

        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`dots-${index}`} px={2} color="gray.500">
                ...
              </Text>
            );
          }

          const pageNumber = page as number;
          return (
            <Button
              key={pageNumber}
              size="sm"
              variant={currentPage === pageNumber ? 'solid' : 'outline'}
              colorPalette={currentPage === pageNumber ? 'blue' : 'gray'}
              onClick={() => handlePageClick(pageNumber)}
              disabled={isLoading}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          size="sm"
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
        >
          Próximo
        </Button>
      </HStack>

      {/* Summary text for mobile */}
      <Text fontSize="sm" color="gray.600" textAlign="center" hideFrom="md">
        Página {currentPage} de {totalPages}
      </Text>
    </VStack>
  );
}