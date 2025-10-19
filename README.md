# Sistema de Reservas - Frontend

Sistema completo de reservas com gestão de utilizadores, serviços e reservas. Implementado com React + TypeScript + Vite seguindo o guia da API RESTful.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação JWT
- Sistema de login/registo com tokens JWT
- Gestão automática de tokens com renovação
- Controlo de acesso baseado em funções (RBAC)
- Armazenamento seguro de tokens

### ✅ Gestão de Utilizadores
- Perfis de utilizador (Client/Provider)
- Gestão de saldo
- Validação de dados (email, NIF, etc.)

### ✅ Gestão de Serviços
- Listagem de serviços com filtros avançados
- Criação/edição de serviços (Providers)
- Pesquisa por nome, preço, etc.
- Ordenação e paginação

### ✅ Sistema de Reservas
- Criação de reservas (Clients)
- Cancelamento com motivo
- Histórico com filtros
- Estatísticas de reservas

### ✅ API Client Robusto
- Tratamento de erros avançado
- Sistema de retry automático
- Cache inteligente com SWR
- Validação de rotas
- Logging configurável

## 🛠️ Tecnologias Utilizadas

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Zustand** para gestão de estado
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **API RESTful** com autenticação JWT

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── config/             # Configurações da aplicação
│   └── api.ts          # Configuração centralizada da API
├── dao/                # Data Access Objects
├── docs/               # Documentação
│   └── API_USAGE_EXAMPLES.md
├── hooks/              # Hooks personalizados
│   ├── useAuth.ts      # Hook de autenticação
│   ├── useBookingAPI.ts # Hook da API de reservas
│   ├── useServices.ts  # Hook de gestão de serviços
│   └── useBookings.ts  # Hook de gestão de reservas
├── repositories/       # Camada de lógica de negócio
├── services/           # Serviços da aplicação
│   ├── apiClient.ts    # Cliente HTTP robusto
│   ├── bookingApi.ts   # API de reservas
│   ├── serviceService.ts # Serviço de gestão de serviços
│   └── bookingService.ts # Serviço de gestão de reservas
├── stores/             # Stores Zustand
├── types/              # Definições TypeScript
└── utils/              # Utilitários
```

## 🚀 Como Usar

### 1. Instalação
```bash
npm install
```

### 2. Configuração
Edite `src/config/api.ts` para configurar as URLs da API:

```typescript
export const API_CONFIG = {
  BASE_URL: {
    LOCAL: 'http://localhost:5002/agendaLaServer',
    PRODUCTION: 'https://your-firebase-project.cloudfunctions.net/agendaLaServer'
  }
};
```

### 3. Desenvolvimento
```bash
npm run dev
```

### 4. Build para Produção
```bash
npm run build
```

## 📖 Exemplos de Uso

### Autenticação
```typescript
import { useAuth } from './hooks/useAuth';

const { login, register, user, isAuthenticated } = useAuth();

// Login
await login({
  identifier: 'joao@exemplo.com',
  password: 'senha123'
});

// Registo
await register({
  fullName: 'João Silva',
  email: 'joao@exemplo.com',
  nif: '123456789',
  password: 'senha123',
  userType: 'client'
});
```

### Gestão de Serviços
```typescript
import { useServices } from './hooks/useServices';

const { services, getServices, createService } = useServices();

// Listar serviços com filtros
await getServices({
  search: 'massagem',
  minPrice: 20,
  maxPrice: 100,
  sortBy: 'price',
  sortOrder: 'asc'
});

// Criar serviço (Provider)
await createService({
  name: 'Massagem Relaxante',
  description: 'Massagem completa',
  price: 50.00
});
```

### Gestão de Reservas
```typescript
import { useBookings } from './hooks/useBookings';

const { bookings, createBooking, cancelBooking } = useBookings();

// Criar reserva (Client)
await createBooking('service-id');

// Cancelar reserva
await cancelBooking('booking-id', 'Motivo do cancelamento');
```

## 🔧 Configurações Avançadas

### Cache e Performance
O sistema inclui cache inteligente com Stale-While-Revalidate:

```typescript
// Cache automático para serviços (10 minutos)
const services = await api.getServices();

// Cache personalizado
const data = await api.get('/endpoint', {
  cache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutos
  useStaleWhileRevalidate: true
});
```

### Tratamento de Erros
Sistema robusto de tratamento de erros com retry automático:

```typescript
// Configuração de retry
apiClient.setMaxRetries(3);
apiClient.enableRetry(true);

// Tratamento de erros específicos
try {
  await api.createBooking(serviceId);
} catch (error) {
  if (error.type === 'INSUFFICIENT_BALANCE') {
    alert('Saldo insuficiente');
  }
}
```

### Logging e Debug
```typescript
// Configurar nível de logging
apiClient.setLogLevel('debug'); // 'none', 'error', 'warn', 'info', 'debug'

// Estatísticas da API
const stats = apiClient.getStats();
console.log('Requests realizados:', stats.requestCount);
```

## 📚 Documentação Adicional

- [Exemplos de Uso da API](src/docs/API_USAGE_EXAMPLES.md)

## 🔒 Segurança

- Tokens JWT armazenados de forma segura
- Validação de dados no frontend
- Headers de segurança configurados
- Sanitização de inputs
- Controlo de acesso baseado em funções

## 🎯 Boas Práticas Implementadas

1. **Arquitetura em Camadas**: DAO → Repository → Service → Hook → Component
2. **Gestão de Estado**: Zustand para estado global, hooks para estado local
3. **Tratamento de Erros**: Sistema robusto com fallbacks
4. **Performance**: Cache, lazy loading, debouncing
5. **TypeScript**: Tipagem forte em toda a aplicação
6. **Testes**: Estrutura preparada para testes unitários
7. **Acessibilidade**: Componentes acessíveis por padrão

## 🚀 Próximos Passos

- [ ] Implementar testes unitários
- [ ] Adicionar internacionalização (i18n)
- [ ] Implementar notificações push
- [ ] Adicionar modo offline
- [ ] Implementar upload de imagens
- [ ] Adicionar dashboard de analytics

---

## React + TypeScript + Vite (Template Original)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.