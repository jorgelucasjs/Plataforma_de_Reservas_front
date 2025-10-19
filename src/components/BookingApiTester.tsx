// Componente para testar a API de reservas
import React, { useState } from 'react';
import { bookingApi } from '../services/bookingApi';

export const BookingApiTester: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testCreateBooking = async () => {
    setLoading(true);
    addResult('🧪 Testando criação de reserva...');
    
    try {
      // Dados de teste baseados no exemplo do Postman
      const bookingData = {
        serviceId: 'h1IBdB7WMXEyJhAm9GC3', // ID do exemplo
        scheduledDate: '2024-02-15T14:30:00Z',
        notes: 'Primeira sessão - teste da API'
      };

      const booking = await bookingApi.createBooking(bookingData);
      addResult(`✅ Reserva criada com sucesso: ${JSON.stringify(booking, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao criar reserva: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetMyBookings = async () => {
    setLoading(true);
    addResult('🧪 Testando busca de minhas reservas...');
    
    try {
      const response = await bookingApi.getMyBookings();
      addResult(`✅ Reservas obtidas: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao buscar reservas: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetBookingHistory = async () => {
    setLoading(true);
    addResult('🧪 Testando histórico de reservas...');
    
    try {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'confirmed' as const,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
        limit: 10,
        offset: 0
      };

      const response = await bookingApi.getBookingHistory(filters);
      addResult(`✅ Histórico obtido: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao buscar histórico: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetServices = async () => {
    setLoading(true);
    addResult('🧪 Testando busca de serviços...');
    
    try {
      const response = await bookingApi.getServices();
      addResult(`✅ Serviços obtidos: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao buscar serviços: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetProfile = async () => {
    setLoading(true);
    addResult('🧪 Testando busca de perfil...');
    
    try {
      const profile = await bookingApi.getProfile();
      addResult(`✅ Perfil obtido: ${JSON.stringify(profile, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao buscar perfil: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetBalance = async () => {
    setLoading(true);
    addResult('🧪 Testando busca de saldo...');
    
    try {
      const balance = await bookingApi.getBalance();
      addResult(`✅ Saldo obtido: ${JSON.stringify(balance, null, 2)}`);
    } catch (error) {
      addResult(`❌ Erro ao buscar saldo: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 m-4">
      <h3 className="font-bold text-lg mb-4">🧪 Testador da API de Reservas</h3>
      
      {/* Botões de teste */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={testGetProfile}
          disabled={loading}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
        >
          Testar Perfil
        </button>
        
        <button
          onClick={testGetBalance}
          disabled={loading}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
        >
          Testar Saldo
        </button>
        
        <button
          onClick={testGetServices}
          disabled={loading}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
        >
          Testar Serviços
        </button>
        
        <button
          onClick={testGetMyBookings}
          disabled={loading}
          className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-400"
        >
          Minhas Reservas
        </button>
        
        <button
          onClick={testCreateBooking}
          disabled={loading}
          className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-400"
        >
          Criar Reserva
        </button>
        
        <button
          onClick={testGetBookingHistory}
          disabled={loading}
          className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 disabled:bg-gray-400"
        >
          Histórico
        </button>
      </div>

      <button
        onClick={clearResults}
        className="w-full px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 mb-4"
      >
        Limpar Resultados
      </button>

      {/* Resultados */}
      <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-gray-500">Nenhum teste executado ainda...</div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-2 break-words">
              {result}
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="mt-2 text-center">
          <span className="text-blue-500">🔄 Executando teste...</span>
        </div>
      )}
    </div>
  );
};