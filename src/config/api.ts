// Configuração da API baseada no guia
export const API_CONFIG = {
  // URLs da API
  BASE_URL: {
    LOCAL: '/api', // Usar proxy para evitar CORS
    PRODUCTION: 'https://your-firebase-project.cloudfunctions.net/agendaLaServer'
  },
  
  // Endpoints
  ENDPOINTS: {
    // Autenticação
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify'
    },
    
    // Utilizadores
    USERS: {
      PROFILE: '/users/profile',
      BALANCE: '/users/balance'
    },
    
    // Serviços
    SERVICES: {
      LIST: '/services',
      CREATE: '/services',
      MY_SERVICES: '/services/my',
      UPDATE: (id: string) => `/services/${id}`,
      DELETE: (id: string) => `/services/${id}`
    },
    
    // Reservas
    BOOKINGS: {
      CREATE: '/bookings',
      MY_BOOKINGS: '/bookings/my',
      CANCEL: (id: string) => `/bookings/${id}/cancel`,
      HISTORY: '/bookings/history'
    },
    
    // Administração
    ADMIN: {
      HEALTH: '/admin/health',
      STATUS: '/admin/status'
    }
  },
  
  // Configurações de timeout
  TIMEOUT: {
    DEFAULT: 10000, // 10 segundos
    UPLOAD: 30000,  // 30 segundos para uploads
    DOWNLOAD: 60000 // 60 segundos para downloads
  },
  
  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 segundo
    BACKOFF_FACTOR: 2
  },
  
  // Configurações de cache
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
    SERVICES_TTL: 10 * 60 * 1000, // 10 minutos
    USER_PROFILE_TTL: 30 * 60 * 1000 // 30 minutos
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Códigos de erro da API
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_OPERATION: 'INVALID_OPERATION',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },
  
  // Status HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
  }
};

// Função para obter a URL base baseada no ambiente
export const getBaseURL = (): string => {
  // Usar variável de ambiente se disponível, senão usar configuração padrão
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  return window.location.hostname === 'localhost' 
    ? API_CONFIG.BASE_URL.LOCAL 
    : API_CONFIG.BASE_URL.PRODUCTION;
};

// Função para construir URLs completas
export const buildURL = (endpoint: string): string => {
  return `${getBaseURL()}${endpoint}`;
};

// Função para obter headers com autenticação
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Validação de resposta da API
export const isValidApiResponse = (response: any): boolean => {
  return response && 
         typeof response === 'object' && 
         'success' in response && 
         'message' in response;
};

// Extração de dados da resposta
export const extractApiData = <T>(response: any): T => {
  if (isValidApiResponse(response) && response.success) {
    return response.data;
  }
  throw new Error(response?.message || 'Invalid API response');
};

// Configurações de paginação padrão
export const DEFAULT_PAGINATION = {
  LIMIT: 10,
  OFFSET: 0,
  MAX_LIMIT: 100
};

// Configurações de filtros padrão
export const DEFAULT_FILTERS = {
  SORT_ORDER: 'desc' as const,
  SORT_BY: 'createdAt' as const
};