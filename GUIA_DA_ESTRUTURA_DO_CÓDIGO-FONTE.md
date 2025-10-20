# 📋 Guia da Estrutura do Código - AgendaSmart

Este documento fornece uma visão abrangente da estrutura e arquitetura do projeto AgendaSmart, um sistema de agendamento de serviços desenvolvido com React, TypeScript e tecnologias modernas.

## 🏗️ Visão Geral da Arquitetura

O projeto segue uma arquitetura em camadas bem definida com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)           │
├─────────────────────────────────────────────────────────────┤
│  UI Components (Chakra UI v3)                              │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
├─────────────────────────────────────────────────────────────┤
│  Business Logic (Repositories)                             │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (DAO)                                   │
├─────────────────────────────────────────────────────────────┤
│  API Communication (Axios)                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologias Utilizadas

### Core Technologies
- **React 19.1.1** - Biblioteca principal para construção da interface
- **TypeScript 5.9.3** - Tipagem estática para maior segurança
- **Vite 7.1.7** - Build tool e servidor de desenvolvimento

### UI & Styling
- **Chakra UI v3** - Sistema de componentes
- **Emotion** - Estilização
- **React Icons** - Biblioteca de ícones

### State Management & Data
- **Zustand 5.0.8** - Gerenciamento de estado
- **Axios 1.12.2** - Cliente HTTP para comunicação com API
- **React Hook Form** - Gerenciamento de formulários

### Routing & Development
- **React Router DOM 7.9.4** - Roteamento
- **ESLint 9.36.0** - Linting de código

## 📁 Estrutura de Diretórios

### Raiz do Projeto
```
agendesmartesite/
├── .env.development          # Variáveis de ambiente (desenvolvimento)
├── .env.example             # Template de variáveis de ambiente
├── .firebaserc              # Configuração do Firebase
├── .gitignore              # Arquivos ignorados pelo Git
├── eslint.config.js        # Configuração do ESLint
├── firebase.json           # Configuração do Firebase hosting
├── index.html              # Arquivo HTML principal
├── package.json            # Dependências e scripts
├── tsconfig.*.json         # Configurações do TypeScript
└── vite.config.ts          # Configuração do Vite
```

### Diretório `src/` - Código Fonte Principal

#### `src/dao/` - Data Access Objects
Camada responsável pela comunicação direta com a API externa.

```
src/dao/
├── apiClient.ts           # Cliente HTTP configurado com interceptadores
├── index.ts              # Exportação centralizada de todos os DAOs
└── localStorage.ts       # Utilitários para armazenamento local
```

**Funções principais:**
- `authDao` - Autenticação (login, registro)
- `userDao` - Operações de usuário (perfil, saldo)
- `serviceDao` - Gestão de serviços (CRUD completo)
- `bookingDao` - Gestão de reservas (criação, histórico, cancelamento)

#### `src/repositories/` - Repositórios
Camada de negócio que utiliza os DAOs e stores para operações complexas.

#### `src/stores/` - Gerenciamento de Estado
Implementação de stores usando Zustand para gerenciamento global do estado.

```
src/stores/
├── authStore.ts          # Estado de autenticação do usuário
├── bookingStore.ts       # Estado das reservas
├── serviceStore.ts       # Estado dos serviços
└── userStore.ts         # Estado do usuário e perfil
```

**Características dos stores:**
- Estado reativo com Zustand
- Persistência automática no localStorage
- Tratamento de loading e error states
- Actions assíncronas para operações com API

#### `src/types/` - Definições de Tipos
Tipos TypeScript compartilhados em todo o projeto.

```
src/types/
└── index.ts             # Interfaces principais
```

**Entidades principais:**
- `User` - Usuário do sistema (cliente/prestador)
- `Service` - Serviço oferecido
- `Booking` - Reserva/agendamento
- `AuthResponse` - Resposta de autenticação
- `ApiResponse<T>` - Resposta padronizada da API

#### `src/ui/` - Interface do Usuário
Organização completa da interface seguindo padrões de design system.

```
src/ui/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base do Chakra UI
│   ├── AddBalanceModal.tsx
│   ├── BookingCard.tsx
│   ├── ConfirmDialog.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navigation.tsx
│   ├── ServiceCard.tsx
│   ├── StatCard.tsx
│   └── index.ts
├── pages/              # Páginas da aplicação
│   ├── BookingsPage.tsx
│   ├── CreateServicePage.tsx
│   ├── DashboardPage.tsx
│   ├── EditServicePage.tsx
│   ├── HistoryPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── ProfilePage.tsx
├── routes/             # Configuração de rotas
│   └── ProtectedRoute.tsx
└── mocks/              # Dados mock para desenvolvimento
    └── index.ts
```

#### `src/utils/` - Utilitários
Funções auxiliares e constantes utilizadas em todo o projeto.

```
src/utils/
├── colors.ts           # Paleta de cores
├── constants.ts        # Constantes da aplicação
└── LocalstorageKeys.ts # Chaves para localStorage
```

#### `src/assets/` - Recursos Estáticos
Imagens, ícones e outros recursos utilizados na aplicação.

## 🔗 Fluxo de Dados

### Autenticação
```
UI → Store (authStore) → DAO (authDao) → API
   ←──────────────←───────────←
```

### Operações com Serviços
```
UI → Store (serviceStore) → Repository → DAO (serviceDao) → API
   ←──────────────←─────────────←─────────────←
```

### Reservas
```
UI → Store (bookingStore) → Repository → DAO (bookingDao) → API
   ←──────────────←─────────────←─────────────←
```

## 🎨 Sistema de Design

### Tema Personalizado (`src/theme.ts`)
- **Cores principais**: Turquesa/cyan (#00e6b8), Azul marinho (#1a3a52), Dourado (#e6a500)
- **Tokens semânticos** para facilitar o uso consistente
- **Configuração global** aplicada em toda aplicação

### Componentes UI
- Baseados no Chakra UI v3
- Componentes específicos do negócio (BookingCard, ServiceCard, etc.)
- Padrão de composição e reutilização

## 🔒 Segurança e Autenticação

### JWT Authentication
- Tokens armazenados no localStorage via Zustand
- Interceptadores Axios para incluir tokens automaticamente
- Proteção de rotas com `ProtectedRoute`

### Proteções Implementadas
- Validação automática de tokens
- Refresh automático de sessão
- Logout em caso de token inválido

## 🚀 Configuração de Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:analyze # Build com análise de bundle
npm run lint         # Verificação de código
npm run preview      # Preview do build de produção
```

### Proxy para API
O Vite está configurado com proxy para resolver problemas de CORS:
- Redireciona `/api` para o servidor backend
- Preserva headers e cookies
- Logging detalhado das requisições

## 📱 Páginas da Aplicação

| Página | Rota | Descrição | Protegida |
|--------|------|-----------|-----------|
| Landing | `/` | Página inicial | Não |
| Login | `/login` | Autenticação | Não |
| Dashboard | `/dashboard` | Visão geral | Sim |
| Services | `/services` | Lista de serviços | Sim |
| Create Service | `/services/new` | Criar novo serviço | Sim |
| Edit Service | `/services/:id/edit` | Editar serviço | Sim |
| Bookings | `/bookings` | Reservas ativas | Sim |
| History | `/history` | Histórico de reservas | Sim |
| Profile | `/profile` | Perfil do usuário | Sim |

## 🔧 Padrões de Código

### Nomenclatura
- **Arquivos**: PascalCase para componentes, camelCase para utilities
- **Pastas**: kebab-case
- **Componentes**: PascalCase
- **Funções/Hooks**: camelCase

### Estrutura de Componentes
```typescript
// Padrão seguido pelos componentes
interface ComponentProps {
  // props tipadas
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // implementação usando hooks e lógica
  return (
    // JSX com Chakra UI components
  );
}
```

### Tratamento de Erros
- Try/catch em todas as operações assíncronas
- Estados de erro nos stores
- Feedback visual para o usuário
- Logging para debugging

## 📚 Documentação Relacionada

- [FRONTEND_API_GUIDE.md](./doc/FRONTEND_API_GUIDE.md) - Guia da API
- [LLM_DEVELOPMENT_GUIDE.md](./doc/LLM_DEVELOPMENT_GUIDE.md) - Padrões de desenvolvimento
- [OBJECTIVO.MD](./doc/OBJECTIVO.MD) - Objetivos do projeto

## 🔄 Fluxo de Desenvolvimento

1. **Planejamento** - Definir requisitos e interfaces
2. **Types** - Criar/atualizar tipos TypeScript
3. **DAO** - Implementar comunicação com API
4. **Store** - Gerenciar estado com Zustand
5. **Components** - Construir interface com Chakra UI
6. **Testes** - Validar funcionalidade
7. **Documentação** - Atualizar guias

## 🎯 Boas Práticas Implementadas

- ✅ Separação clara de responsabilidades
- ✅ TypeScript para type safety
- ✅ Estado reativo com Zustand
- ✅ Componentes reutilizáveis
- ✅ Tratamento consistente de erros
- ✅ Design system com Chakra UI
- ✅ Documentação abrangente
- ✅ Configuração otimizada de desenvolvimento

---

**Última atualização**: 20 de outubro de 2025
**Versão do projeto**: 0.0.0