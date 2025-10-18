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
  Portal,
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
  HiX,
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatUserType } from '../../utils/formatters';
import { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useAnnouncements } from '../../hooks/useAccessibility';
import { SkipLinks } from '../components/SkipLinks';
import { 
  responsive, 
  touchTargets, 
  navigation,
  responsiveSpacing 
} from '../../utils/responsive';
import { ariaRoles } from '../../utils/accessibility';

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
  const { isMobile, isTouch } = useResponsive();
  const { announce } = useAnnouncements();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // Close menus when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-menu]')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    announce('Logged out successfully');
  };

  const handleNavigation = (path: string, label?: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    if (label) {
      announce(`Navigated to ${label}`);
    }
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
    <VStack gap={responsiveSpacing.sm} align="stretch">
      {getFilteredNavigationItems().map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <Button
            key={item.path}
            variant={isActive ? 'solid' : 'ghost'}
            colorPalette={isActive ? 'blue' : 'gray'}
            justifyContent="flex-start"
            onClick={() => handleNavigation(item.path, item.label)}
            size={isMobile || isTouch ? 'lg' : 'md'}
            fontWeight={isActive ? 'semibold' : 'normal'}
            w="full"
            minH={isTouch ? touchTargets.comfortable : 'auto'}
            borderRadius="md"
            role="menuitem"
            aria-current={isActive ? 'page' : undefined}
            _focus={{
              boxShadow: 'outline',
              outline: '2px solid',
              outlineColor: 'blue.500',
              outlineOffset: '2px'
            }}
            _active={{
              transform: 'scale(0.98)'
            }}
            transition="all 0.2s ease-in-out"
          >
            <HStack gap={3} w="full">
              <Icon size={isMobile ? 20 : 16} />
              <Text fontSize={isMobile ? 'md' : 'sm'}>{item.label}</Text>
            </HStack>
          </Button>
        );
      })}
    </VStack>
  );

  const UserMenuContent = () => (
    <Box position="relative" data-menu>
      <Button
        variant="ghost"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        size={isMobile || isTouch ? 'md' : 'sm'}
        maxW={{ base: 'auto', md: '200px' }}
        minH={isTouch ? touchTargets.comfortable : 'auto'}
        _focus={{
          boxShadow: 'outline',
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px'
        }}
        aria-label="User menu"
        aria-expanded={isUserMenuOpen}
        aria-haspopup="menu"
      >
        <HStack gap={2}>
          <Box
            w={{ base: 10, md: 8 }}
            h={{ base: 10, md: 8 }}
            bg="blue.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize={{ base: 'md', md: 'sm' }}
            fontWeight="bold"
          >
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </Box>
          <VStack gap={0} align="start" display={responsive.hideOnMobile}>
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
          <HiChevronDown size={isMobile ? 20 : 16} />
        </HStack>
      </Button>
      
      {isUserMenuOpen && (
        <Portal>
          <Box
            position="fixed"
            top={{ base: navigation.mobileNavHeight, md: 'auto' }}
            right={{ base: 4, md: 'auto' }}
            left={{ base: 4, md: 'auto' }}
            mt={{ base: 0, md: 1 }}
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            shadow="xl"
            minW={{ base: 'auto', md: '200px' }}
            zIndex={30}
            role="menu"
            style={!isMobile ? {
              position: 'absolute',
              top: '100%',
              right: 0,
              left: 'auto'
            } : {}}
          >
            <VStack gap={0} align="stretch">
              {isMobile && (
                <Box p={4} borderBottom="1px" borderColor="gray.200">
                  <VStack gap={2} align="start">
                    <HStack gap={2}>
                      <Box
                        w={10}
                        h={10}
                        bg="blue.500"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                        fontWeight="bold"
                      >
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </Box>
                      <VStack gap={0} align="start">
                        <Text fontSize="sm" fontWeight="medium">
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
                    </HStack>
                  </VStack>
                </Box>
              )}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  navigate('/profile');
                  setIsUserMenuOpen(false);
                }}
                borderRadius={0}
                borderTopRadius={isMobile ? 0 : 'md'}
                size={isMobile || isTouch ? 'lg' : 'md'}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                role="menuitem"
                _focus={{
                  bg: 'blue.50',
                  boxShadow: 'none'
                }}
              >
                <HStack gap={3} w="full">
                  <HiUser size={isMobile ? 20 : 16} />
                  <Text fontSize={isMobile ? 'md' : 'sm'}>Perfil</Text>
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
                size={isMobile || isTouch ? 'lg' : 'md'}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                role="menuitem"
                _focus={{
                  bg: 'red.50',
                  boxShadow: 'none'
                }}
                _hover={{
                  bg: 'red.50'
                }}
              >
                <HStack gap={3} w="full">
                  <HiLogout size={isMobile ? 20 : 16} />
                  <Text fontSize={isMobile ? 'md' : 'sm'}>Terminar Sessão</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>
        </Portal>
      )}
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Skip Links for Accessibility */}
      <SkipLinks />

      {/* Top Navigation Bar */}
      <Box
        as="header"
        role={ariaRoles.banner}
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        px={responsiveSpacing.md}
        py={responsiveSpacing.sm}
        position="sticky"
        top={0}
        zIndex={10}
        shadow="sm"
        h={navigation.mobileNavHeight}
        display="flex"
        alignItems="center"
      >
        <Container maxW="7xl" w="full">
          <Flex justify="space-between" align="center" h="full">
            {/* Logo/Brand */}
            <HStack gap={responsiveSpacing.md}>
              <IconButton
                aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                display={responsive.showOnMobile}
                size={isMobile || isTouch ? 'lg' : 'md'}
                minH={isTouch ? touchTargets.comfortable : 'auto'}
                _focus={{
                  boxShadow: 'outline',
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px'
                }}
              >
                {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </IconButton>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                color="blue.600"
                cursor="pointer"
                onClick={() => navigate('/dashboard')}
                _focus={{
                  outline: '2px solid',
                  outlineColor: 'blue.500',
                  outlineOffset: '2px',
                  borderRadius: 'sm'
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/dashboard');
                  }
                }}
              >
                ServiceHub
              </Text>
            </HStack>

            {/* Desktop Navigation */}
            <HStack gap={1} display={responsive.hideOnMobile}>
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
                    _focus={{
                      boxShadow: 'outline',
                      outline: '2px solid',
                      outlineColor: 'blue.500',
                      outlineOffset: '2px'
                    }}
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
        <Portal>
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="blackAlpha.600"
            zIndex={15}
            onClick={() => setIsMobileMenuOpen(false)}
            display={responsive.showOnMobile}
          />
        </Portal>
      )}

      {/* Mobile Navigation Drawer */}
      <Portal>
        <Box
          as="nav"
          role={ariaRoles.navigation}
          aria-label="Mobile navigation"
          id="mobile-navigation"
          position="fixed"
          top={0}
          left={isMobileMenuOpen ? 0 : `-${navigation.sidebarWidth}`}
          w={navigation.sidebarWidth}
          h="100vh"
          bg="white"
          zIndex={20}
          transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          shadow="2xl"
          display={responsive.showOnMobile}
          overflowY="auto"
          aria-hidden={!isMobileMenuOpen}
        >
          <Box p={responsiveSpacing.md} borderBottom="1px" borderColor="gray.200">
            <VStack gap={responsiveSpacing.sm} align="start">
              <Flex justify="space-between" align="center" w="full">
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  ServiceHub
                </Text>
                <IconButton
                  aria-label="Close navigation"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="ghost"
                  size="md"
                  minH={touchTargets.comfortable}
                  _focus={{
                    boxShadow: 'outline',
                    outline: '2px solid',
                    outlineColor: 'blue.500',
                    outlineOffset: '2px'
                  }}
                >
                  <HiX size={20} />
                </IconButton>
              </Flex>
              {user && (
                <HStack gap={3} w="full">
                  <Box
                    w={10}
                    h={10}
                    bg="blue.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                  >
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </Box>
                  <VStack gap={0} align="start" flex={1}>
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {user.fullName}
                    </Text>
                    <HStack gap={1} flexWrap="wrap">
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
          <Box p={responsiveSpacing.md}>
            <NavigationContent />
          </Box>
        </Box>
      </Portal>

      {/* Main Content */}
      <Box 
        as="main" 
        role={ariaRoles.main}
        id="main-content"
        pt={responsiveSpacing.md}
        tabIndex={-1}
        _focus={{
          outline: 'none'
        }}
      >
        <Container 
          maxW="7xl" 
          px={responsiveSpacing.md}
          pb={responsiveSpacing.xl}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}