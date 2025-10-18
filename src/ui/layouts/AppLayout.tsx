import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Badge,
  Container,
} from '@chakra-ui/react';
import { 
  HiMenu,
  HiChevronDown,
  HiEye,
  HiCalendar,
  HiClock,
  HiCog,
  HiStar,
  HiUser,
  HiLogout,
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatUserType } from '../../utils/formatters';
import { useState } from 'react';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: ('client' | 'provider')[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: HiEye,
  },
  {
    label: 'Serviços',
    path: '/services',
    icon: HiStar,
  },
  {
    label: 'Reservas',
    path: '/bookings',
    icon: HiCalendar,
  },
  {
    label: 'Histórico',
    path: '/transactions',
    icon: HiClock,
  },
  {
    label: 'Perfil',
    path: '/profile',
    icon: HiCog,
  },
];

export function AppLayout() {
  const { user, logout, isProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const getFilteredNavigationItems = () => {
    return navigationItems.filter(item => {
      // If no roles specified, show to all users
      if (!item.roles) return true;
      
      // Check if user's role is in the allowed roles
      return user && item.roles.includes(user.userType);
    });
  };

  const NavigationContent = () => (
    <VStack gap={2} align="stretch">
      {getFilteredNavigationItems().map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <Button
            key={item.path}
            variant={isActive ? 'solid' : 'ghost'}
            colorPalette={isActive ? 'blue' : 'gray'}
            justifyContent="flex-start"
            onClick={() => handleNavigation(item.path)}
            size="md"
            fontWeight={isActive ? 'semibold' : 'normal'}
            w="full"
          >
            <HStack gap={2}>
              <Icon size={16} />
              <Text>{item.label}</Text>
            </HStack>
          </Button>
        );
      })}
    </VStack>
  );

  const UserMenuContent = () => (
    <Box position="relative">
      <Button
        variant="ghost"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        size="sm"
        maxW="200px"
      >
        <HStack gap={2}>
          <Box
            w={8}
            h={8}
            bg="blue.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="sm"
            fontWeight="bold"
          >
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </Box>
          <VStack gap={0} align="start" display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" fontWeight="medium" maxW="120px" truncate>
              {user?.fullName}
            </Text>
            <HStack gap={1}>
              <Badge
                size="sm"
                colorPalette={isProvider ? 'green' : 'blue'}
                variant="subtle"
              >
                {user && formatUserType(user.userType)}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {user && formatCurrency(user.balance)}
              </Text>
            </HStack>
          </VStack>
          <HiChevronDown size={16} />
        </HStack>
      </Button>
      
      {isUserMenuOpen && (
        <Box
          position="absolute"
          top="100%"
          right={0}
          mt={1}
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          shadow="lg"
          minW="200px"
          zIndex={20}
        >
          <VStack gap={0} align="stretch">
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => {
                navigate('/profile');
                setIsUserMenuOpen(false);
              }}
              borderRadius={0}
              borderTopRadius="md"
            >
              <HStack gap={2}>
                <HiUser size={16} />
                <Text>Perfil</Text>
              </HStack>
            </Button>
            <Box h="1px" bg="gray.200" />
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => {
                handleLogout();
                setIsUserMenuOpen(false);
              }}
              color="red.500"
              borderRadius={0}
              borderBottomRadius="md"
            >
              <HStack gap={2}>
                <HiLogout size={16} />
                <Text>Terminar Sessão</Text>
              </HStack>
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Top Navigation Bar */}
      <Box
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        px={4}
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
        shadow="sm"
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            {/* Logo/Brand */}
            <HStack gap={4}>
              <IconButton
                aria-label="Open navigation"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                display={{ base: 'flex', lg: 'none' }}
              >
                <HiMenu size={20} />
              </IconButton>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="blue.600"
                cursor="pointer"
                onClick={() => navigate('/dashboard')}
              >
                ServiceHub
              </Text>
            </HStack>

            {/* Desktop Navigation */}
            <HStack gap={1} display={{ base: 'none', lg: 'flex' }}>
              {getFilteredNavigationItems().map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'solid' : 'ghost'}
                    colorPalette={isActive ? 'blue' : 'gray'}
                    onClick={() => handleNavigation(item.path)}
                    size="sm"
                  >
                    <HStack gap={2}>
                      <Icon size={16} />
                      <Text>{item.label}</Text>
                    </HStack>
                  </Button>
                );
              })}
            </HStack>

            {/* User Menu */}
            <UserMenuContent />
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex={15}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <Box
        position="fixed"
        top={0}
        left={isMobileMenuOpen ? 0 : '-300px'}
        w="300px"
        h="100vh"
        bg="white"
        zIndex={20}
        transition="left 0.3s ease"
        shadow="xl"
        display={{ base: 'block', lg: 'none' }}
      >
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <VStack gap={2} align="start">
            <Flex justify="space-between" align="center" w="full">
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                ServiceHub
              </Text>
              <IconButton
                aria-label="Close navigation"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="ghost"
                size="sm"
              >
                <HiMenu size={16} />
              </IconButton>
            </Flex>
            {user && (
              <HStack gap={2}>
                <Box
                  w={8}
                  h={8}
                  bg="blue.500"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </Box>
                <VStack gap={0} align="start">
                  <Text fontSize="sm" fontWeight="medium">
                    {user.fullName}
                  </Text>
                  <HStack gap={1}>
                    <Badge
                      size="sm"
                      colorPalette={isProvider ? 'green' : 'blue'}
                      variant="subtle"
                    >
                      {formatUserType(user.userType)}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {formatCurrency(user.balance)}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            )}
          </VStack>
        </Box>
        <Box p={4}>
          <NavigationContent />
        </Box>
      </Box>

      {/* Main Content */}
      <Box as="main" pt={4}>
        <Container maxW="7xl" px={4}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}