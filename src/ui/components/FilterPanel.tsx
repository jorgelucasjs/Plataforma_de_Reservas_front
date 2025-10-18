import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { MdFilterList, MdExpandMore, MdExpandLess } from 'react-icons/md';

export interface FilterConfig {
  priceRange?: {
    min: number;
    max: number;
    step?: number;
    currency?: string;
  };
  sorting?: {
    options: Array<{ value: string; label: string }>;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
  };
  dateRange?: {
    from?: string;
    to?: string;
  };
  status?: {
    options: Array<{ value: string; label: string }>;
    selected?: string[];
  };
  customFilters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'input' | 'number' | 'date';
    options?: Array<{ value: string; label: string }>;
    value?: any;
  }>;
}

interface FilterPanelProps {
  config: FilterConfig;
  onFiltersChange: (filters: Record<string, any>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  showApplyButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FilterPanel({
  config,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isCollapsible = true,
  defaultExpanded = false,
  showApplyButton = true,
  size = 'md'
}: FilterPanelProps) {
  const { open: isOpen, onToggle } = useDisclosure({ defaultOpen: defaultExpanded });
  const [filters, setFilters] = useState<Record<string, any>>({
    minPrice: config.priceRange?.min || 0,
    maxPrice: config.priceRange?.max || 0,
    sortBy: config.sorting?.defaultSortBy || '',
    sortOrder: config.sorting?.defaultSortOrder || 'asc',
    dateFrom: config.dateRange?.from || '',
    dateTo: config.dateRange?.to || '',
    status: config.status?.selected || [],
    ...config.customFilters?.reduce((acc, filter) => ({
      ...acc,
      [filter.key]: filter.value || ''
    }), {})
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      minPrice: 0,
      maxPrice: 0,
      sortBy: config.sorting?.defaultSortBy || '',
      sortOrder: config.sorting?.defaultSortOrder || 'asc',
      dateFrom: '',
      dateTo: '',
      status: [],
      ...config.customFilters?.reduce((acc, filter) => ({
        ...acc,
        [filter.key]: ''
      }), {})
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== 0 && value !== '';
  });

  const FilterContent = () => (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="gray.50"
    >
      <VStack gap={4} align="stretch">
        {/* Price Range */}
        {config.priceRange && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Price Range ({config.priceRange.currency || '€'})
            </Text>
            <HStack>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                size={size}
                step={config.priceRange.step || 0.01}
                min={0}
              />
              <Text fontSize="sm" color="gray.500">to</Text>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 0)}
                size={size}
                step={config.priceRange.step || 0.01}
                min={0}
              />
            </HStack>
          </Box>
        )}

        {/* Date Range */}
        {config.dateRange && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Date Range</Text>
            <HStack>
              <Input
                type="date"
                placeholder="From"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                size={size}
              />
              <Text fontSize="sm" color="gray.500">to</Text>
              <Input
                type="date"
                placeholder="To"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                size={size}
              />
            </HStack>
          </Box>
        )}

        {/* Status Filter */}
        {config.status && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
            <Box as="select" 
              value={Array.isArray(filters.status) ? filters.status[0] || '' : filters.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
              style={{
                padding: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                width: '100%'
              }}
            >
              <option value="">All statuses</option>
              {config.status.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Box>
          </Box>
        )}

        {/* Custom Filters */}
        {config.customFilters?.map((filter) => (
          <Box key={filter.key}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>{filter.label}</Text>
            {filter.type === 'select' && filter.options ? (
              <Box as="select"
                value={filters[filter.key]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(filter.key, e.target.value)}
                style={{
                  padding: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  width: '100%'
                }}
              >
                <option value="">{`Select ${filter.label.toLowerCase()}`}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Box>
            ) : filter.type === 'number' ? (
              <Input
                type="number"
                value={filters[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, parseFloat(e.target.value) || 0)}
                size={size}
                placeholder={`Enter ${filter.label.toLowerCase()}`}
              />
            ) : filter.type === 'date' ? (
              <Input
                type="date"
                value={filters[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                size={size}
              />
            ) : (
              <Input
                type="text"
                value={filters[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                size={size}
                placeholder={`Enter ${filter.label.toLowerCase()}`}
              />
            )}
          </Box>
        ))}

        {/* Sort Options */}
        {config.sorting && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Sort By</Text>
            <HStack>
              <Box as="select"
                value={filters.sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  padding: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  flex: 2
                }}
              >
                {config.sorting.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Box>
              <Box as="select"
                value={filters.sortOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortOrder', e.target.value)}
                style={{
                  padding: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  flex: 1
                }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Filter Actions */}
        <HStack justifyContent="flex-end" pt={2}>
          <Button 
            size={size} 
            variant="outline" 
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            Clear
          </Button>
          {showApplyButton && (
            <Button 
              size={size} 
              colorPalette="blue" 
              onClick={onApplyFilters}
            >
              Apply Filters
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );

  if (!isCollapsible) {
    return <FilterContent />;
  }

  return (
    <Box mb={6}>
      <HStack mb={4} justify="space-between">
        <Button
          variant="outline"
          onClick={onToggle}
          size={size}
        >
          <MdFilterList />
          Filters
          {isOpen ? <MdExpandLess /> : <MdExpandMore />}
          {hasActiveFilters && (
            <Box
              ml={2}
              w="2"
              h="2"
              bg="blue.500"
              borderRadius="full"
            />
          )}
        </Button>
      </HStack>

      {isOpen && <FilterContent />}
    </Box>
  );
}