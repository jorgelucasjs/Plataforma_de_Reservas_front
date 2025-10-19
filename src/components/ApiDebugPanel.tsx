// Painel de debug para testar a API
import React, { useState } from 'react';
import { ApiTester } from '../utils/apiTest';
import { getBaseURL } from '../config/api';
import { apiClient } from '../services/apiClient';

export const ApiDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runTests = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      // Interceptar console.log para capturar resultados
      const originalLog = console.log;
      console.log = (...args) => {
        addResult(args.join(' '));
        originalLog(...args);
      };

      await ApiTester.runAllTests();
      
      // Restaurar console.log
      console.log = originalLog;
    } catch (error) {
      addResult(`Erro durante os testes: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    addResult(`Testando endpoint: ${endpoint}`);
    
    try {
      const response = await apiClient.get(endpoint);
      addResult(`✅ ${endpoint} - Sucesso: ${JSON.stringify(response).substring(0, 100)}...`);
    } catch (error) {
      addResult(`❌ ${endpoint} - Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão para mostrar/esconder */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Debug da API"
      >
        🔧
      </button>

      {/* Painel de debug */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-h-96 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Debug da API</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Informações da configuração */}
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <div><strong>Base URL:</strong> {getBaseURL()}</div>
            <div><strong>Ambiente:</strong> {import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}</div>
            <div><strong>Hostname:</strong> {window.location.hostname}</div>
          </div>

          {/* Botões de teste */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Testando...' : 'Testar Tudo'}
            </button>
            
            <button
              onClick={() => testSpecificEndpoint('/admin/health')}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
            >
              Health Check
            </button>
            
            <button
              onClick={() => testSpecificEndpoint('/services')}
              disabled={isLoading}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
            >
              Serviços
            </button>
            
            <button
              onClick={clearResults}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Limpar
            </button>
          </div>

          {/* Resultados dos testes */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs font-mono bg-black text-green-400 p-2 rounded max-h-48 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">Nenhum teste executado ainda...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dicas */}
          <div className="mt-3 text-xs text-gray-600">
            <div><strong>Dica:</strong> Se houver erros de CORS, reinicie o servidor (npm run dev)</div>
          </div>
        </div>
      )}
    </div>
  );
};