import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Input,
  Textarea,
  Spinner,
  Center,
  Grid,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdAdd, MdSearch, MdFilterList, MdCheckCircle, MdError } from 'react-icons/md';
import { useAuthUiState } from '../../stores/authStore';
import { useServiceUiState } from '../../stores/serviceStore';
import { useUserUiState } from '../../stores/userStore';
import { serviceRepository } from '../../repositories/serviceRepository';
import { bookingRepository } from '../../repositories/bookingRepository';
import { ValidationService, type ServiceFormData } from '../../services/validationService';
import { ToastService, useToastState } from '../../services/toastService';
import { ToastContainer } from '../components/Toast';
import { formatCurrency, formatDate, truncateText } from '../../utils/formatters';
import type { Service, ServiceCreateData, ServiceUpdateData } from '../../types/service';
import type { BookingCreateData } from '../../types/booking';
import { ErrorType } from '../../types/error';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  onSuccess: () => void;
}

function ServiceForm({ isOpen, onClose, service, onSuccess }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price || 0,
      });
      setErrors({});
      setShowSuccess(false);
      setShowError('');
    }
  }, [isOpen, service]);

  const handleInputChange = (field: keyof ServiceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = ValidationService.validateService(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setShowError('');

    try {
      if (service) {
        // Update existing service
        const updateData: ServiceUpdateData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        };
        await serviceRepository.updateService(service.id, updateData);
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        // Create new service
        const createData: ServiceCreateData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        };
        await serviceRepository.createService(createData);
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setShowError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="lg"
        w="full"
        mx={4}
        maxH="90vh"
        overflowY="auto"
      >
        <Heading size="lg" mb={4}>
          {service ? 'Edit Service' : 'Create New Service'}
        </Heading>

        {showSuccess && (
          <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md" color="green.700" mb={4}>
            {service ? 'Service updated successfully!' : 'Service created successfully!'}
          </Box>
        )}

        {showError && (
          <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700" mb={4}>
            {showError}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb={2}>Service Name</Text>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter service name"
                borderColor={errors.name ? 'red.500' : 'gray.300'}
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.name}
                </Text>
              )}
            </Box>

            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb={2}>Description</Text>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service"
                rows={4}
                borderColor={errors.description ? 'red.500' : 'gray.300'}
              />
              {errors.description && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.description}
                </Text>
              )}
            </Box>

            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb={2}>Price (€)</Text>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max="10000"
                borderColor={errors.price ? 'red.500' : 'gray.300'}
              />
              {errors.price && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.price}
                </Text>
              )}
            </Box>

            <HStack w="full" justifyContent="flex-end" gap={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                loading={isSubmitting}
                loadingText={service ? 'Updating...' : 'Creating...'}
              >
                {service ? 'Update Service' : 'Create Service'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmation({ isOpen, onClose, service, onConfirm, isDeleting }: DeleteConfirmationProps) {
  if (!isOpen || !service) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="md"
        w="full"
        mx={4}
      >
        <Heading size="md" mb={4}>Delete Service</Heading>
        <Text mb={6}>
          Are you sure you want to delete "{service.name}"? This action cannot be undone.
        </Text>
        <HStack justifyContent="flex-end" gap={3}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorPalette="red"
            onClick={onConfirm}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onConfirm: () => void;
  isBooking: boolean;
  userBalance: number;
  bookingError?: string;
}

function BookingConfirmation({ 
  isOpen, 
  onClose, 
  service, 
  onConfirm, 
  isBooking, 
  userBalance,
  bookingError
}: BookingConfirmationProps) {
  if (!isOpen || !service) return null;

  const hasInsufficientBalance = userBalance < service.price;
  const remainingBalance = userBalance - service.price;
  const shortfall = hasInsufficientBalance ? service.price - userBalance : 0;

  // Show balance warning when user tries to book with insufficient balance
  const handleConfirmClick = () => {
    if (hasInsufficientBalance) {
      ToastService.insufficientBalance(service.name, service.price, userBalance);
      return;
    }
    onConfirm();
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="md"
        w="full"
        mx={4}
        maxH="90vh"
        overflowY="auto"
      >
        <HStack mb={4} align="center">
          <Heading size="md" flex="1">Confirm Booking</Heading>
          {isBooking && (
            <HStack gap={2} color="blue.600">
              <Spinner size="sm" />
              <Text fontSize="sm">Processing...</Text>
            </HStack>
          )}
        </HStack>
        
        <VStack gap={4} align="stretch" mb={6}>
          <Box>
            <Text fontWeight="medium" mb={2}>Service Details</Text>
            <Box p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
              <Text fontWeight="bold" fontSize="lg" mb={1}>{service.name}</Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Provider: {service.providerName}
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {formatCurrency(service.price)}
              </Text>
            </Box>
          </Box>

          <Box>
            <Text fontWeight="medium" mb={2}>Payment Summary</Text>
            <VStack gap={2} align="stretch" p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
              <Flex justifyContent="space-between">
                <Text>Current Balance:</Text>
                <Text fontWeight="bold" color={userBalance > 0 ? 'green.600' : 'red.600'}>
                  {formatCurrency(userBalance)}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Service Cost:</Text>
                <Text fontWeight="bold" color="red.600">-{formatCurrency(service.price)}</Text>
              </Flex>
              <Box borderTop="1px" borderColor="gray.300" pt={2}>
                <Flex justifyContent="space-between">
                  <Text fontWeight="bold">After Booking:</Text>
                  <Text 
                    fontWeight="bold" 
                    color={hasInsufficientBalance ? 'red.600' : 'green.600'}
                  >
                    {formatCurrency(remainingBalance)}
                  </Text>
                </Flex>
              </Box>
            </VStack>
          </Box>

          {hasInsufficientBalance && (
            <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
              <HStack gap={2} mb={2}>
                <MdError color="red" />
                <Text fontWeight="bold" color="red.700">Insufficient Balance</Text>
              </HStack>
              <Text color="red.700" fontSize="sm" mb={2}>
                You need {formatCurrency(shortfall)} more to book this service.
              </Text>
              <Text color="red.600" fontSize="xs">
                Please add funds to your account or choose a different service.
              </Text>
            </Box>
          )}

          {bookingError && (
            <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
              <HStack gap={2} mb={2}>
                <MdError color="red" />
                <Text fontWeight="bold" color="red.700">Booking Error</Text>
              </HStack>
              <Text color="red.700" fontSize="sm">
                {bookingError}
              </Text>
            </Box>
          )}

          {!hasInsufficientBalance && !bookingError && (
            <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md">
              <HStack gap={2} mb={2}>
                <MdCheckCircle color="green" />
                <Text fontWeight="bold" color="green.700">Ready to Book</Text>
              </HStack>
              <Text color="green.700" fontSize="sm">
                Your booking will be confirmed immediately and the amount will be deducted from your balance.
              </Text>
            </Box>
          )}
        </VStack>

        <HStack justifyContent="flex-end" gap={3}>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isBooking}
          >
            Cancel
          </Button>
          <Button
            colorPalette={hasInsufficientBalance ? "red" : "green"}
            onClick={handleConfirmClick}
            loading={isBooking}
            loadingText="Processing Booking..."
            disabled={isBooking}
          >
            {hasInsufficientBalance ? 'Insufficient Balance' : 'Confirm Booking'}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onBook?: (service: Service) => void;
  isProvider?: boolean;
}

function ServiceCard({ service, onEdit, onDelete, onBook, isProvider = false }: ServiceCardProps) {
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
      _hover={{ shadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
      role="article"
      tabIndex={0}
      _focus={{ shadow: 'outline', borderColor: 'blue.500' }}
    >
      <Flex mb={3}>
        <Box>
          <Heading size="md" mb={1}>{service.name}</Heading>
          <Text fontSize="sm" color="gray.500">
            {isProvider ? `Created ${formatDate(service.createdAt)}` : `By ${service.providerName}`}
          </Text>
        </Box>
        <Spacer />
        <Badge colorPalette={service.isActive ? 'green' : 'gray'}>
          {service.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Flex>

      <Text color="gray.600" mb={3} lineHeight="1.5">
        {truncateText(service.description, 150)}
      </Text>
      
      <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={4}>
        {formatCurrency(service.price)}
      </Text>

      {isProvider ? (
        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={() => onEdit?.(service)}
          >
            <MdEdit />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => onDelete?.(service)}
          >
            <MdDelete />
            Delete
          </Button>
        </HStack>
      ) : (
        <Button
          size="sm"
          colorPalette={service.isActive ? "green" : "gray"}
          w="full"
          onClick={() => onBook?.(service)}
          disabled={!service.isActive}
          aria-label={`Book ${service.name} for ${formatCurrency(service.price)}`}
          _hover={service.isActive ? { bg: 'green.600' } : {}}
        >
          {service.isActive ? 'Book Service' : 'Service Unavailable'}
        </Button>
      )}
    </Box>
  );
}

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'price' | 'createdAt', sortOrder: 'asc' | 'desc') => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

function SearchAndFilters({
  searchQuery,
  onSearchChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  sortOrder,
  onSortChange,
  onApplyFilters,
  onClearFilters,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Box mb={6}>
      {/* Search Bar */}
      <HStack mb={4}>
        <Box position="relative" flex="1">
          <Input
            placeholder="Search services... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pr="40px"
          />
          <Box position="absolute" right="10px" top="50%" transform="translateY(-50%)">
            <MdSearch />
          </Box>
        </Box>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <MdFilterList />
          Filters
        </Button>
      </HStack>

      {/* Filters Panel */}
      {showFilters && (
        <Box
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="gray.50"
        >
          <VStack gap={4} align="stretch">
            {/* Price Range */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Price Range (€)</Text>
              <HStack>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ''}
                  onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0, maxPrice)}
                  size="sm"
                />
                <Text>to</Text>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ''}
                  onChange={(e) => onPriceChange(minPrice, parseFloat(e.target.value) || 0)}
                  size="sm"
                />
              </HStack>
            </Box>

            {/* Sort Options */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Sort By</Text>
              <HStack>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as 'name' | 'price' | 'createdAt', sortOrder)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="createdAt">Date Created</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortChange(sortBy, e.target.value as 'asc' | 'desc')}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </HStack>
            </Box>

            {/* Filter Actions */}
            <HStack justifyContent="flex-end">
              <Button size="sm" variant="outline" onClick={onClearFilters}>
                Clear
              </Button>
              <Button size="sm" colorPalette="blue" onClick={onApplyFilters}>
                Apply Filters
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
}

interface ClientServicesViewProps {
  onBookService: (service: Service) => void;
}

function ClientServicesView({ onBookService }: ClientServicesViewProps) {
  const { services, isLoading, error, total, hasMore } = useServiceUiState();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Load services when component mounts
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      await serviceRepository.loadServices();
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        applyFilters(searchQuery, minPrice, maxPrice, sortBy, sortOrder);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search services... (Ctrl+K)"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to clear search
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
        hasMore && 
        !isLoadingMore && 
        !isLoading && 
        !isFiltering
      ) {
        loadMoreServices();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, isLoading, isFiltering]);

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleSortChange = (newSortBy: 'name' | 'price' | 'createdAt', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const applyFilters = async (search?: string, min?: number, max?: number, sort?: 'name' | 'price' | 'createdAt', order?: 'asc' | 'desc') => {
    const filterParams = {
      search: search || searchQuery,
      minPrice: min || minPrice || undefined,
      maxPrice: max || maxPrice || undefined,
      sortBy: sort || sortBy,
      sortOrder: order || sortOrder,
      limit: 20,
      offset: 0,
    };

    setIsFiltering(true);
    try {
      await serviceRepository.applyFilters(filterParams);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  const clearFilters = async () => {
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(0);
    setSortBy('createdAt');
    setSortOrder('desc');
    
    setIsFiltering(true);
    try {
      await serviceRepository.clearFilters();
    } catch (error) {
      console.error('Failed to clear filters:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  const loadMoreServices = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      await serviceRepository.loadMoreServices();
    } catch (error) {
      console.error('Failed to load more services:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more services';
      setLoadMoreError(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <Box>
      <Heading mb={6}>Available Services</Heading>

      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={handlePriceChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onApplyFilters={() => applyFilters()}
        onClearFilters={clearFilters}
      />

      {error && (
        <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700" mb={4}>
          <Text fontWeight="bold">Error</Text>
          <Text>{error}</Text>
        </Box>
      )}

      {(isLoading || isFiltering) ? (
        <Center py={10}>
          <VStack gap={4}>
            <Spinner size="lg" />
            <Text color="gray.500">
              {isFiltering ? 'Applying filters...' : 'Loading services...'}
            </Text>
          </VStack>
        </Center>
      ) : services.length === 0 ? (
        <Center py={10}>
          <VStack gap={4}>
            <Text fontSize="lg" color="gray.500">
              {searchQuery || minPrice || maxPrice ? 'No services match your criteria.' : 'No services available at the moment.'}
            </Text>
            {(searchQuery || minPrice || maxPrice) && (
              <Button colorPalette="blue" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </VStack>
        </Center>
      ) : (
        <>
          <Flex align="center" justify="space-between" mb={4}>
            <Text fontSize="sm" color="gray.600">
              Showing {services.length} of {total} service{total !== 1 ? 's' : ''}
            </Text>
            {isFiltering && (
              <HStack gap={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="blue.600">Updating...</Text>
              </HStack>
            )}
          </Flex>
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={onBookService}
                isProvider={false}
              />
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          {hasMore && (
            <Center mt={8}>
              <VStack gap={4}>
                {loadMoreError && (
                  <Box p={3} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700">
                    <Text fontSize="sm">{loadMoreError}</Text>
                  </Box>
                )}
                <Button
                  colorPalette="blue"
                  variant="outline"
                  onClick={loadMoreServices}
                  loading={isLoadingMore}
                  loadingText="Loading more services..."
                  size="lg"
                >
                  Load More Services
                </Button>
              </VStack>
            </Center>
          )}
          
          {!hasMore && services.length > 0 && (
            <Center mt={8}>
              <Text fontSize="sm" color="gray.500">
                You've reached the end of the list
              </Text>
            </Center>
          )}
        </>
      )}
    </Box>
  );
}

function ProviderServicesView() {
  const { myServices, isLoading, error } = useServiceUiState();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load services when component mounts
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      await serviceRepository.loadMyServices();
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleCreateService = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setDeletingService(service);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingService) return;

    setIsDeleting(true);
    setErrorMessage('');
    try {
      await serviceRepository.deleteService(deletingService.id);
      setSuccessMessage('Service deleted successfully!');
      setIsDeleteOpen(false);
      setDeletingService(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete service';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    loadServices(); // Reload services after create/update
  };

  return (
    <Box>
      <Flex mb={6} align="center">
        <Heading>My Services</Heading>
        <Spacer />
        <Button
          colorPalette="blue"
          onClick={handleCreateService}
        >
          <MdAdd />
          Create Service
        </Button>
      </Flex>

      {successMessage && (
        <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md" color="green.700" mb={4}>
          {successMessage}
        </Box>
      )}

      {errorMessage && (
        <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700" mb={4}>
          {errorMessage}
        </Box>
      )}

      {error && (
        <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" color="red.700" mb={4}>
          <Text fontWeight="bold">Error</Text>
          <Text>{error}</Text>
        </Box>
      )}

      {isLoading ? (
        <Center py={10}>
          <Spinner size="lg" />
        </Center>
      ) : myServices.length === 0 ? (
        <Center py={10}>
          <VStack gap={4}>
            <Text fontSize="lg" color="gray.500">
              You haven't created any services yet.
            </Text>
            <Button
              colorPalette="blue"
              onClick={handleCreateService}
            >
              <MdAdd />
              Create Your First Service
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {myServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              isProvider={true}
            />
          ))}
        </Grid>
      )}

      <ServiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        service={editingService}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        service={deletingService}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
}

export function ServicesPage() {
  const { user } = useAuthUiState();
  const { currentBalance } = useUserUiState();
  const { toasts, removeToast } = useToastState();
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string>('');

  const handleBookService = (service: Service) => {
    // Clear any previous booking errors
    setBookingError('');
    setBookingService(service);
    setIsBookingOpen(true);
  };

  const confirmBooking = async () => {
    if (!bookingService) return;

    setIsBooking(true);
    setBookingError('');

    try {
      const bookingData: BookingCreateData = {
        serviceId: bookingService.id,
      };

      // Create the booking
      await bookingRepository.createBooking(bookingData);
      
      // Show success toast with booking details
      ToastService.bookingSuccess(bookingService.name, bookingService.price);
      
      // Close the booking dialog
      setIsBookingOpen(false);
      setBookingService(null);
      
      // Optional: Show additional success information
      ToastService.info(
        'Balance Updated',
        `Your new balance is ${formatCurrency(currentBalance - bookingService.price)}`,
        { duration: 4000 }
      );
      
    } catch (error) {
      console.error('Booking failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to book service';
      
      if (error && typeof error === 'object' && 'type' in error) {
        const appError = error as any;
        switch (appError.type) {
          case ErrorType.INSUFFICIENT_BALANCE:
            errorMessage = 'Insufficient balance to complete booking';
            ToastService.insufficientBalance(
              bookingService.name, 
              bookingService.price, 
              currentBalance
            );
            break;
          case ErrorType.AUTHENTICATION_ERROR:
            errorMessage = 'Please log in again to continue';
            ToastService.error('Authentication Required', errorMessage);
            break;
          case ErrorType.AUTHORIZATION_ERROR:
            errorMessage = 'You do not have permission to book this service';
            ToastService.error('Access Denied', errorMessage);
            break;
          case ErrorType.NOT_FOUND:
            errorMessage = 'Service is no longer available';
            ToastService.error('Service Unavailable', errorMessage);
            break;
          case ErrorType.NETWORK_ERROR:
            errorMessage = 'Network error. Please check your connection';
            ToastService.error('Connection Error', errorMessage);
            break;
          default:
            errorMessage = appError.message || 'An unexpected error occurred';
            ToastService.bookingError(bookingService.name, errorMessage);
        }
      } else {
        const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
        ToastService.bookingError(bookingService.name, errorMsg);
        errorMessage = errorMsg;
      }
      
      // Set error for the booking dialog
      setBookingError(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCloseBookingDialog = () => {
    setIsBookingOpen(false);
    setBookingService(null);
    setBookingError('');
  };

  if (!user) {
    return (
      <Box p={6}>
        <Box p={4} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md" color="orange.700">
          <Text fontWeight="bold">Authentication Required</Text>
          <Text>Please log in to access this page.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      {/* Toast Container for notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {user.userType === 'provider' ? (
        <ProviderServicesView />
      ) : (
        <ClientServicesView onBookService={handleBookService} />
      )}

      <BookingConfirmation
        isOpen={isBookingOpen}
        onClose={handleCloseBookingDialog}
        service={bookingService}
        onConfirm={confirmBooking}
        isBooking={isBooking}
        userBalance={currentBalance}
        bookingError={bookingError}
      />
    </Box>
  );
}