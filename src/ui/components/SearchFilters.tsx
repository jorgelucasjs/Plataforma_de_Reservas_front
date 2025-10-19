import { Button, Input, Stack } from "@chakra-ui/react";

interface SearchFiltersProps {
    searchTerm: string;
    minPrice: string;
    maxPrice: string;
    onSearchChange: (value: string) => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onSearch: () => void;
    isLoading?: boolean;
}

export const SearchFilters = ({
    searchTerm,
    minPrice,
    maxPrice,
    onSearchChange,
    onMinPriceChange,
    onMaxPriceChange,
    onSearch,
    isLoading = false,
}: SearchFiltersProps) => {
    return (
        <Stack mb="6" direction={{ base: "column", md: "row" }} gap="4">
            <Input
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <Input
                placeholder="Preço mín."
                type="number"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
            />
            <Input
                placeholder="Preço máx."
                type="number"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
            />
            <Button colorScheme="blue" onClick={onSearch} loading={isLoading}>
                Buscar
            </Button>
        </Stack>
    );
};
