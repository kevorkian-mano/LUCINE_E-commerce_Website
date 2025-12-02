import RepositoryFactory from './RepositoryFactory.js';

// Import classes (they're exported as named exports)
import { AuthService } from '../services/authService.js';
import { ProductService } from '../services/productService.js';
import { CartService } from '../services/cartService.js';
import { OrderService } from '../services/orderService.js';

/**
 * ServiceFactory
 * Factory Method Pattern for creating service instances
 * Centralizes service creation with dependency injection support
 */
class ServiceFactory {
  /**
   * Create service instance with dependencies
   * @param {string} serviceName - Name of the service ('auth', 'product', 'cart', 'order')
   * @param {Object} options - Optional configuration (repositories, other services)
   * @returns {Object} Service instance
   * @throws {Error} If service name is not found
   */
  static createService(serviceName, options = {}) {
    const services = {
      'auth': () => {
        // Use provided repository or create default
        const userRepository = options.userRepository || 
          RepositoryFactory.createRepository('user');
        
        return new AuthService(userRepository);
      },
      
      'product': () => {
        const productRepository = options.productRepository || 
          RepositoryFactory.createRepository('product');
        
        return new ProductService(productRepository);
      },
      
      'cart': () => {
        const cartRepository = options.cartRepository || 
          RepositoryFactory.createRepository('cart');
        
        const productRepository = options.productRepository || 
          RepositoryFactory.createRepository('product');
        
        // Create product service for cart service dependency
        const productService = options.productService || 
          new ProductService(productRepository);
        
        return new CartService(cartRepository, productService);
      },
      
      'order': () => {
        const orderRepository = options.orderRepository || 
          RepositoryFactory.createRepository('order');
        
        const userRepository = options.userRepository || 
          RepositoryFactory.createRepository('user');
        
        const cartRepository = options.cartRepository || 
          RepositoryFactory.createRepository('cart');
        
        const productRepository = options.productRepository || 
          RepositoryFactory.createRepository('product');
        
        // Create dependent services
        const productService = options.productService || 
          new ProductService(productRepository);
        
        const cartService = options.cartService || 
          new CartService(cartRepository, productService);
        
        return new OrderService(
          orderRepository,
          userRepository,
          cartService,
          productService
        );
      }
    };

    const createService = services[serviceName.toLowerCase()];
    if (!createService) {
      throw new Error(
        `Service "${serviceName}" not found. ` +
        `Available services: ${ServiceFactory.getAvailableServices().join(', ')}`
      );
    }

    return createService();
  }

  /**
   * Get list of available services
   * @returns {string[]} Array of service names
   */
  static getAvailableServices() {
    return ['auth', 'product', 'cart', 'order'];
  }

  /**
   * Check if a service exists
   * @param {string} serviceName - Name of the service
   * @returns {boolean} True if service exists
   */
  static serviceExists(serviceName) {
    return ServiceFactory.getAvailableServices()
      .includes(serviceName.toLowerCase());
  }

  /**
   * Create all services at once (useful for dependency injection)
   * @param {Object} options - Optional custom repositories/services
   * @returns {Object} Object with all service instances
   */
  static createAllServices(options = {}) {
    // Create repositories first
    const repositories = RepositoryFactory.createAllRepositories({
      userRepository: options.userRepository,
      productRepository: options.productRepository,
      cartRepository: options.cartRepository,
      orderRepository: options.orderRepository
    });

    // Create services with proper dependencies
    const productService = new ProductService(repositories.productRepository);
    const cartService = new CartService(repositories.cartRepository, productService);
    const orderService = new OrderService(
      repositories.orderRepository,
      repositories.userRepository,
      cartService,
      productService
    );

    return {
      authService: new AuthService(repositories.userRepository),
      productService,
      cartService,
      orderService
    };
  }
}

export default ServiceFactory;

