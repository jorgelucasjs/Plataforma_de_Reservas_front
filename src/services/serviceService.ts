// Service management service
import { bookingApi } from './bookingApi';
import type { 
  Service, 
  ServiceFilters, 
  CreateServiceData, 
  UpdateServiceData 
} from './bookingApi';

export class ServiceService {
  /**
   * Obter todos os serviços ativos com filtros
   */
  async getServices(filters: ServiceFilters = {}) {
    try {
      return await bookingApi.getServices(filters);
    } catch (error) {
      console.error('Erro ao obter serviços:', error);
      throw error;
    }
  }

  /**
   * Criar novo serviço (apenas providers)
   */
  async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      return await bookingApi.createService(serviceData);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }

  /**
   * Obter serviços do provider atual
   */
  async getMyServices() {
    try {
      return await bookingApi.getMyServices();
    } catch (error) {
      console.error('Erro ao obter meus serviços:', error);
      throw error;
    }
  }

  /**
   * Atualizar serviço
   */
  async updateService(serviceId: string, updateData: UpdateServiceData): Promise<Service> {
    try {
      return await bookingApi.updateService(serviceId, updateData);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  }

  /**
   * Eliminar serviço
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      return await bookingApi.deleteService(serviceId);
    } catch (error) {
      console.error('Erro ao eliminar serviço:', error);
      throw error;
    }
  }

  /**
   * Pesquisar serviços por termo
   */
  async searchServices(searchTerm: string, filters: Omit<ServiceFilters, 'search'> = {}) {
    return this.getServices({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Obter serviços por faixa de preço
   */
  async getServicesByPriceRange(minPrice: number, maxPrice: number, filters: Omit<ServiceFilters, 'minPrice' | 'maxPrice'> = {}) {
    return this.getServices({
      ...filters,
      minPrice,
      maxPrice
    });
  }

  /**
   * Obter serviços ordenados por preço
   */
  async getServicesSortedByPrice(order: 'asc' | 'desc' = 'asc', filters: Omit<ServiceFilters, 'sortBy' | 'sortOrder'> = {}) {
    return this.getServices({
      ...filters,
      sortBy: 'price',
      sortOrder: order
    });
  }
}

// Instância singleton
export const serviceService = new ServiceService();