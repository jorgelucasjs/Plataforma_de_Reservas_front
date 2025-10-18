import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { 
  MdFirstPage, 
  MdLastPage, 
  MdChevronLeft, 
  MdChevronRight,
  MdMoreHoriz 
} from 'react-icons/md';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showTotalItems?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  maxVisiblePages?: number;
  itemsPerPageOptions?: number[];
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showTotalItems = true,
  size = 'md',
  isLoading = false,
  maxVisiblePages = 7,
  itemsPerPageOptions = [10, 20, 50, 100]
}: PaginationControlsProps) {
  
  if (totalPages <= 1 && !showTotalItems) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    
    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(parseInt(event.target.value));
    }
  };

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  const selectStyle = {
    padding: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    width: 'auto',
    minWidth: '80px'
  };

  return (
    <Box>
      {/* Mobile Layout */}
      <Box display={{ base: 'block', md: 'none' }}>
        <VStack gap={3}>
          {showTotalItems && (
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Showing {startItem}-{endItem} of {totalItems} items
            </Text>
          )}
          
          <HStack justify="center" gap={2}>
            <Button
              size={size}
              variant="outline"
              onClick={() => handlePageClick(1)}
              disabled={!canGoPrevious}
              aria-label="First page"
            >
              <MdFirstPage />
            </Button>
            
            <Button
              size={size}
              variant="outline"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={!canGoPrevious}
              aria-label="Previous page"
            >
              <MdChevronLeft />
            </Button>

            <Text fontSize="sm" px={3} py={2} minW="20">
              {currentPage} / {totalPages}
            </Text>

            <Button
              size={size}
              variant="outline"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={!canGoNext}
              aria-label="Next page"
            >
              <MdChevronRight />
            </Button>

            <Button
              size={size}
              variant="outline"
              onClick={() => handlePageClick(totalPages)}
              disabled={!canGoNext}
              aria-label="Last page"
            >
              <MdLastPage />
            </Button>
          </HStack>

          {showItemsPerPage && onItemsPerPageChange && (
            <HStack gap={2} align="center">
              <Text fontSize="sm" color="gray.600">Items per page:</Text>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                style={selectStyle}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Desktop Layout */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Flex align="center" gap={4}>
          {showTotalItems && (
            <Text fontSize="sm" color="gray.600">
              Showing {startItem}-{endItem} of {totalItems} items
            </Text>
          )}

          <Spacer />

          {totalPages > 1 && (
            <HStack gap={1}>
              <Button
                size={size}
                variant="outline"
                onClick={() => handlePageClick(1)}
                disabled={!canGoPrevious}
                aria-label="First page"
              >
                <MdFirstPage />
              </Button>
              
              <Button
                size={size}
                variant="outline"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={!canGoPrevious}
                aria-label="Previous page"
              >
                <MdChevronLeft />
              </Button>

              {visiblePages.map((page, index) => (
                <Box key={index}>
                  {page === '...' ? (
                    <Button
                      size={size}
                      variant="ghost"
                      disabled
                      aria-label="More pages"
                    >
                      <MdMoreHoriz />
                    </Button>
                  ) : (
                    <Button
                      size={size}
                      variant={page === currentPage ? 'solid' : 'outline'}
                      colorPalette={page === currentPage ? 'blue' : 'gray'}
                      onClick={() => handlePageClick(page)}
                      disabled={isLoading}
                      minW="10"
                    >
                      {page}
                    </Button>
                  )}
                </Box>
              ))}

              <Button
                size={size}
                variant="outline"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={!canGoNext}
                aria-label="Next page"
              >
                <MdChevronRight />
              </Button>

              <Button
                size={size}
                variant="outline"
                onClick={() => handlePageClick(totalPages)}
                disabled={!canGoNext}
                aria-label="Last page"
              >
                <MdLastPage />
              </Button>
            </HStack>
          )}

          {showItemsPerPage && onItemsPerPageChange && (
            <HStack gap={2} align="center">
              <Text fontSize="sm" color="gray.600">Items per page:</Text>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                style={selectStyle}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </HStack>
          )}
        </Flex>
      </Box>
    </Box>
  );
}