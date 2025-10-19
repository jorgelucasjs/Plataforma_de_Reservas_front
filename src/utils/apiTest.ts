// Utilitário para testar a configuração da API
import { getBaseURL } from '../config/api';
import { apiClient } from '../services/apiClient';

export class ApiTester {
  /**
   * Testar configuração da API
   */
  static testConfiguration() {
    console.log('🔧 Testando configuração da API...');
    
    const baseURL = getBaseURL();
    console.log('📍 Base URL:', baseURL);
    
    const isLocal = window.location.hostname === 'localhost';
    console.log('🏠 Ambiente local:', isLocal);
    
    if (isLocal && baseURL === '/api') {
      console.log('✅ Proxy configurado corretamente para desenvolvimento');
    } else if (!isLocal) {
      console.log('🌐 Configuração de produção');
    } else {
      console.log('⚠️ Configuração pode estar incorreta');
    }
  }

  /**
   * Testar conectividade com a API
   */
  static async testConnectivity() {
    console.log('🔗 Testando conectividade...');
    
    try {
      const response = await apiClient.healthCheck();
      console.log('✅ API respondendo:', response);
      return true;
    } catch (error) {
      console.log('❌ Erro de conectividade:', error);
      return false;
    }
  }

  /**
   * Testar endpoints específicos
   */
  static async testEndpoints() {
    console.log('🎯 Testando endpoints...');
    
    const endpoints = [
      '/admin/health',
      '/services',
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Testando ${endpoint}...`);
        await apiClient.get(endpoint);
        console.log(`✅ ${endpoint} - OK`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Erro:`, error);
      }
    }
  }

  /**
   * Executar todos os testes
   */
  static async runAllTests() {
    console.log('🧪 Iniciando testes da API...');
    console.log('================================');
    
    this.testConfiguration();
    console.log('');
    
    const isConnected = await this.testConnectivity();
    console.log('');
    
    if (isConnected) {
      await this.testEndpoints();
    } else {
      console.log('⏭️ Pulando teste de endpoints devido à falha de conectividade');
    }
    
    console.log('================================');
    console.log('🏁 Testes concluídos');
  }

  /**
   * Verificar se há problemas de CORS
   */
  static checkCorsIssues() {
    console.log('🛡️ Verificando problemas de CORS...');
    
    const baseURL = getBaseURL();
    
    if (window.location.hostname === 'localhost' && baseURL.startsWith('http://localhost:5002')) {
      console.log('⚠️ POSSÍVEL PROBLEMA DE CORS DETECTADO!');
      console.log('💡 Solução: Reinicie o servidor de desenvolvimento para usar o proxy');
      console.log('📝 Comando: npm run dev');
      return true;
    }
    
    if (window.location.hostname === 'localhost' && baseURL === '/api') {
      console.log('✅ Proxy configurado - CORS deve estar resolvido');
      return false;
    }
    
    console.log('ℹ️ Configuração parece estar correta');
    return false;
  }
}

// Executar testes automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  // Aguardar um pouco para a aplicação carregar
  setTimeout(() => {
    ApiTester.checkCorsIssues();
  }, 1000);
}