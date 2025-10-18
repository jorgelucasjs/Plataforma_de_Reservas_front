import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { MdFilterList, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useResponsive } from '../../hooks/useResponsive';
import {
  responsiveSpacing,
  touchTargets,
  cardSizes,
  responsiveFontSizes
} from '../../utils/responsive';

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
  const { isMobile, isTouch } = useResponsive();
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

  const responsiveSize = isMobile || isTouch ? 'lg' : size;

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
      borderRadius={cardSizes.borderRadius}
      p={cardSizes.padding}
      bg="gray.50"
    >
      <VStack gap={responsiveSpacing.md} align="stretch">
        {/* Price Range */}
        {config.priceRange && (
          <Box>
            <Text
              fontSize={responsiveFontSizes.sm}
              fontWeight="medium"
              mb={responsiveSpacing.sm}
            >
              Price Range ({config.priceRange.currency || '€'})
            </Text>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              gap={responsiveSpacing.sm}
              align="center"
            >
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                size={responsiveSize}
                step={config.priceRange.step || 0.01}
                min={0}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                fontSize={{ base: '16px', md: 'md' }} // Prevent zoom on iOS
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px'
                }}
              />
              <Text
                fontSize={responsiveFontSizes.sm}
                color="gray.500"
                flexShrink={0}
              >
                to
              </Text>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 0)}
                size={responsiveSize}
                step={config.priceRange.step || 0.01}
                min={0}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                fontSize={{ base: '16px', md: 'md' }} // Prevent zoom on iOS
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px'
                }}
              />
            </Stack>
          </Box>
        )}

        {/* Date Range */}
        {config.dateRange && (
          <Box>
            <Text
              fontSize={responsiveFontSizes.sm}
              fontWeight="medium"
              mb={responsiveSpacing.sm}
            >
              Date Range
            </Text>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              gap={responsiveSpacing.sm}
              align="center"
            >
              <Input
                type="date"
                placeholder="From"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                size={responsiveSize}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                fontSize={{ base: '16px', md: 'md' }} // Prevent zoom on iOS
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px'
                }}
              />
              <Text
                fontSize={responsiveFontSizes.sm}
                color="gray.500"
                flexShrink={0}
              >
                to
              </Text>
              <Input
                type="date"
                placeholder="To"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                size={responsiveSize}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                fontSize={{ base: '16px', md: 'md' }} // Prevent zoom on iOS
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 2px var(--chakra-colors-blue-200)',
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px'
                }}
              />
            </Stack>
          </Box>
        )}

        {/* Status Filter */}
        {config.status && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
            <select
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
            </select>
          </Box>
        )}

        {/* Custom Filters */}
        {config.customFilters?.map((filter) => (
          <Box key={filter.key}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>{filter.label}</Text>
            {filter.type === 'select' && filter.options ? (
              <select
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
              </select>
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
              <select
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
              </select>
              <select
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
              </select>
            </HStack>
          </Box>
        )}

        {/* Filter Actions */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          justifyContent="flex-end"
          pt={responsiveSpacing.sm}
          gap={responsiveSpacing.sm}
        >
          <Button
            size={responsiveSize}
            variant="outline"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            minH={isTouch ? touchTargets.comfortable : 'auto'}
            w={{ base: 'full', sm: 'auto' }}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'gray.500',
              outlineOffset: '2px'
            }}
          >
            Clear
          </Button>
          {showApplyButton && (
            <Button
              size={responsiveSize}
              colorPalette="blue"
              onClick={onApplyFilters}
              minH={isTouch ? touchTargets.comfortable : 'auto'}
              w={{ base: 'full', sm: 'auto' }}
              _focus={{
                boxShadow: 'outline',
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px'
              }}
            >
              Apply Filters
            </Button>
          )}
        </Stack>
      </VStack>
    </Box>
  );

  if (!isCollapsible) {
    return <FilterContent />;
  }

  return (
    <Box mb={responsiveSpacing.lg}>
      <HStack mb={responsiveSpacing.md} justify="space-between">
        <Button
          variant="outline"
          onClick={onToggle}
          size={responsiveSize}
          minH={isTouch ? touchTargets.comfortable : 'auto'}
          _focus={{
            boxShadow: 'outline',
            outline: '2px solid',
            outlineColor: 'blue.500',
            outlineOffset: '2px'
          }}
          aria-expanded={isOpen}
          aria-controls="filter-content"
        >
          <HStack gap={2}>
            <MdFilterList size={isMobile ? 20 : 16} />
            <Text>Filters</Text>
            {isOpen ? (
              <MdExpandLess size={isMobile ? 20 : 16} />
            ) : (
              <MdExpandMore size={isMobile ? 20 : 16} />
            )}
            {hasActiveFilters && (
              <Box
                ml={1}
                w={isMobile ? "3" : "2"}
                h={isMobile ? "3" : "2"}
                bg="blue.500"
                borderRadius="full"
              />
            )}
          </HStack>
        </Button>
      </HStack>

      {isOpen && (
        <Box id="filter-content">
          <FilterContent />
        </Box>
      )}
    </Box>
  );
}