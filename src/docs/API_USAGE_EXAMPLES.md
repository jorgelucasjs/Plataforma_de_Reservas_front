# Exemplos de Uso da API de Reservas

Este documento contém exemplos práticos de como usar a nova API de reservas implementada baseada no guia fornecido.

## Configuração Inicial

```typescript
import { useBookingAPI } from '../hooks/useBookingAPI';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
import { useBookings } from '../hooks/useBookings';
```

## Autenticação

### Login
```typescript
const { login, loading, error } = useAuth();

const handleLogin = async () => {
  try {
    await login({
      identifier: 'joao@exemplo.com', // ou NIF
      password: 'senha123'
    });
    console.log('Login realizado com sucesso!');
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

### Registo
```typescript
const { register, loading, error } = useAuth();

const handleRegister = async () => {
  try {
    await register({
      fullName: 'João Silva',
      nif: '123456789',
      email: 'joao@exemplo.com',
      password: 'senha123',
      confirmPassword: 'senha123',
      userType: 'client' // ou 'provider'
    });
    console.log('Registo realizado com sucesso!');
  } catch (error) {
    console.error('Erro no registo:', error);
  }
};
```

## Gestão de Serviços

### Listar Serviços
```typescript
const { services, getServices, loading, error } = useServices();

// Listar todos os serviços
await getServices();

// Listar com filtros
await getServices({
  search: 'massagem',
  minPrice: 20,
  maxPrice: 100,
  sortBy: 'price',
  sortOrder: 'asc',
  limit: 10,
  offset: 0
});
```

### Criar Serviço (Provider)
```typescript
const { createService } = useServices();

const handleCreateService = async () => {
  try {
    const newService = await createService({
      name: 'Massagem Relaxante',
      description: 'Massagem de corpo inteiro para relaxamento',
      price: 50.00
    });
    console.log('Serviço criado:', newService);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
  }
};
```

### Atualizar Serviço
```typescript
const { updateService } = useServices();

const handleUpdateService = async (serviceId: string) => {
  try {
    const updatedService = await updateService(serviceId, {
      name: 'Massagem Relaxante Premium',
      price: 60.00,
      isActive: true
    });
    console.log('Serviço atualizado:', updatedService);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
  }
};
```

## Gestão de Reservas

### Criar Reserva (Client)
```typescript
const { createBooking } = useBookings();

const handleCreateBooking = async (serviceId: string) => {
  try {
    const booking = await createBooking(serviceId);
    console.log('Reserva criada:', booking);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
  }
};
```

### Listar Minhas Reservas
```typescript
const { bookings, getMyBookings } = useBookings();

// Carregar reservas
await getMyBookings();

// Exibir reservas
bookings.forEach(booking => {
  console.log(`Reserva: ${booking.serviceName} - €${booking.amount}`);
});
```

### Cancelar Reserva
```typescript
const { cancelBooking } = useBookings();

const handleCancelBooking = async (bookingId: string) => {
  try {
    const cancelledBooking = await cancelBooking(bookingId, 'Conflito de horário');
    console.log('Reserva cancelada:', cancelledBooking);
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
  }
};
```

### Histórico de Reservas com Filtros
```typescript
const { getBookingHistory } = useBookings();

// Histórico com filtros
await getBookingHistory({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'confirmed',
  minAmount: 20,
  maxAmount: 100,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 10,
  offset: 0
});
```

## Gestão de Utilizador

### Obter Perfil
```typescript
const { api } = useBookingAPI();

const handleGetProfile = async () => {
  try {
    const profile = await api.getProfile();
    console.log('Perfil do utilizador:', profile);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
  }
};
```

### Obter Saldo
```typescript
const { api } = useBookingAPI();

const handleGetBalance = async () => {
  try {
    const balance = await api.getBalance();
    console.log(`Saldo atual: €${balance.balance.toFixed(2)}`);
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
  }
};
```

## Componente Completo de Exemplo

```typescript
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
import { useBookings } from '../hooks/useBookings';

export const BookingDashboard: React.FC = () => {
  const { user, isAuthenticated, isClient, isProvider } = useAuth();
  const { 
    services, 
    getServices, 
    createService,
    loading: servicesLoading 
  } = useServices();
  const { 
    bookings, 
    getMyBookings, 
    createBooking,
    loading: bookingsLoading 
  } = useBookings();

  useEffect(() => {
    if (isAuthenticated) {
      getServices();
      getMyBookings();
    }
  }, [isAuthenticated]);

  const handleBookService = async (serviceId: string) => {
    if (!isClient) return;
    
    try {
      await createBooking(serviceId);
      alert('Reserva criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar reserva');
    }
  };

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>;
  }

  return (
    <div className="p-4">
      <h1>Dashboard de Reservas</h1>
      
      <div className="mb-4">
        <h2>Bem-vindo, {user?.fullName}!</h2>
        <p>Tipo: {user?.userType}</p>
      </div>

      {/* Serviços Disponíveis */}
      <div className="mb-6">
        <h3>Serviços Disponíveis</h3>
        {servicesLoading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {services.map(service => (
              <div key={service.id} className="border p-4 rounded">
                <h4>{service.name}</h4>
                <p>{service.description}</p>
                <p>Preço: €{service.price.toFixed(2)}</p>
                {isClient && (
                  <button 
                    onClick={() => handleBookService(service.id)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Reservar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minhas Reservas */}
      <div>
        <h3>Minhas Reservas</h3>
        {bookingsLoading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {bookings.map(booking => (
              <div key={booking.id} className="border p-4 rounded">
                <h4>{booking.serviceName}</h4>
                <p>Valor: €{booking.amount.toFixed(2)}</p>
                <p>Status: {booking.status}</p>
                <p>Data: {new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

## Tratamento de Erros

### Tratamento Global
```typescript
const { error, clearError } = useAuth();

useEffect(() => {
  if (error) {
    // Exibir erro ao utilizador
    console.error('Erro de autenticação:', error);
    
    // Limpar erro após exibir
    setTimeout(() => {
      clearError();
    }, 5000);
  }
}, [error, clearError]);
```

### Tratamento Específico
```typescript
const handleApiCall = async () => {
  try {
    await someApiCall();
  } catch (error) {
    if (error.message.includes('401')) {
      // Erro de autenticação - redirecionar para login
      logout();
    } else if (error.message.includes('400')) {
      // Erro de validação - mostrar mensagem específica
      alert('Dados inválidos. Verifique os campos.');
    } else {
      // Erro genérico
      alert('Ocorreu um erro. Tente novamente.');
    }
  }
};
```

## Boas Práticas

1. **Sempre verificar autenticação antes de fazer chamadas à API**
2. **Usar loading states para melhor UX**
3. **Implementar tratamento de erros adequado**
4. **Limpar erros após exibir ao utilizador**
5. **Usar debouncing para pesquisas em tempo real**
6. **Implementar cache para dados que não mudam frequentemente**
7. **Validar dados no frontend antes de enviar**
8. **Usar HTTPS em produção**
9. **Armazenar tokens de forma segura**
10. **Implementar logout automático quando token expira**