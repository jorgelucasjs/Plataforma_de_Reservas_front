# Implementation Plan

- [ ] 1. Create simplified localStorage utility
  - Create new simplified localStorage utility functions for auth data management
  - Implement setAuthData, getAuthData, clearAuthData, and isAuthenticated functions
  - Use LOCALSTORAGE_USERDATA as the key for all auth data storage
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Create simplified auth service
  - Implement AuthService class with login, register, logout, isAuthenticated, getCurrentUser, and getToken methods
  - Integrate with existing API endpoints using direct fetch calls
  - Handle API responses and store data using LOCALSTORAGE_USERDATA key
  - Remove complex token verification and caching logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_

- [ ] 3. Create simplified auth context and hook
  - Create AuthContext with minimal state (user, isAuthenticated, isLoading)
  - Implement AuthProvider component with basic state management
  - Create simplified useAuth hook that consumes the context
  - Remove complex initialization and token verification logic
  - _Requirements: 1.2, 4.4, 6.2_

- [ ] 4. Create login form component
  - Build LoginForm component with email and password fields
  - Implement form submission with auth service integration
  - Add basic error handling and loading states
  - Handle successful login with redirect functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. Create register form component
  - Build RegisterForm component with all required fields (fullName, nif, email, password, userType, phone)
  - Implement form submission with auth service integration
  - Add basic error handling and loading states
  - Handle successful registration with automatic login
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Create simplified route protection component
  - Implement ProtectedRoute component that checks authentication status
  - Add redirect logic for unauthenticated users to login page
  - Remove complex loading states and token verification
  - Ensure component works with React Router
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Update main app component and routing
  - Wrap app with AuthProvider context
  - Update routing to use ProtectedRoute for protected pages
  - Ensure login and register routes are public
  - Remove complex auth initialization logic
  - _Requirements: 4.1, 4.2, 1.2_

- [ ] 8. Add logout functionality to UI
  - Add logout button/link to main navigation or user menu
  - Implement logout handler that calls auth service logout method
  - Ensure logout clears localStorage and redirects to login
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 9. Clean up and remove unused code
  - Remove complex auth store (Zustand implementation)
  - Remove unused auth repository and complex token service
  - Remove unused services (cache, retry, validation, etc.)
  - Clean up unused imports and dependencies
  - _Requirements: 1.1, 1.3_

- [ ]* 10. Write unit tests for core auth functionality
  - Write tests for auth service login and register methods
  - Write tests for localStorage utility functions
  - Write tests for ProtectedRoute component behavior
  - Write tests for auth context and hook functionality
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 6.1, 6.2, 6.3_